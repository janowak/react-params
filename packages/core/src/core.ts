import {useCallback, useMemo} from "react";
import {Store, useStore} from "@tanstack/react-store";
import {isEqual} from "lodash-es";

import {ParamStore} from "./store";
import {getValue, isClient, isParamsTransition, paramsTransitioning, useSmartValue} from "./utils";
import {decodeParam, encodeParam} from "./encoding";

import {API, OptionsWithDefault, Setter} from "./types";
import {useContextApi} from "./use-api";
import {BatchingApi, defaultApi, dummyApi, withBatch} from "./api";

export const create = () => {
    let isInitialized = false;
    let paramsStore: ParamStore = null!;
    let api: BatchingApi = null!;

    const getLatestParams = (api: API) => {
        const params = new URLSearchParams(api.getSearch());
        const paramsMap: Record<string, string> = {};
        for (const [key, value] of params) {
            paramsMap[key] = value;
        }
        return paramsMap;
    }

    const init = (contextApi: API, isClient: boolean) => {
        if (isClient && isInitialized) {
            return;
        }
        isInitialized = true;
        api = withBatch(contextApi ?? (isClient ? defaultApi() : dummyApi));
        if (isClient) {
            api.registerListener((state: unknown) => {
                if (isParamsTransition(state)) {
                    return;
                }
                paramsStore.setState(() => getLatestParams(api))
            });
            paramsStore = new Store<Record<string, string>>(getLatestParams(api));
        }
    };

    const decodeWithDefault = <T, >(value: string | undefined, defaultValue: T, {
        decode,
        onError,
        validate
    }: OptionsWithDefault<T>): T => {
        if (value === undefined) {
            return defaultValue
        }
        const internalOnError = (decoded?: T) => {
            const onErrorValue = onError?.(value, decoded)
            return onErrorValue ?? defaultValue
        }
        try {
            const decoded = decodeParam(value, decode)
            const isValid = validate ? validate(decoded) : true
            if (isValid) {
                return decoded
            } else {
                return internalOnError(decoded)
            }
        } catch {
            return internalOnError()
        }
    }

    const useDefaultValue = <T, >({defaultValue}: OptionsWithDefault<T>) => {
        const internalDefaultValue = useMemo(() => {
            return getValue(defaultValue);
        }, [defaultValue])

        return useSmartValue(internalDefaultValue) as T
    }

    const useParamGet = <T, >(
        paramName: string,
        options: OptionsWithDefault<T>,
    ) => {
        const contextApi = useContextApi();
        init(contextApi, isClient);

        const internalDefaultValue = useDefaultValue(options);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const value = isClient ? useStore(paramsStore, (s) => s[paramName]) : getLatestParams(api)[paramName];
        const decodedValue = useMemo(() => decodeWithDefault(value, internalDefaultValue, options), [value, internalDefaultValue, options]);

        return useSmartValue(decodedValue) as T
    }

    const useParamSet = <T, S extends object = object>(
        paramName: string,
        options: OptionsWithDefault<T>,
    ) => {
        const contextApi = useContextApi();
        init(contextApi, isClient);

        const internalDefaultValue = useDefaultValue(options);

        return useCallback((value: Setter<T>, state?: S) => {
            if (!isClient) {
                throw new Error("Cannot use react params on the server");
            }

            const {updateType = "replaceIn", encode} = options;
            const currentValue = paramsStore.state[paramName];
            const internalValue = typeof value === "function"
                ? (value as (prev: T) => T)(decodeWithDefault(currentValue, internalDefaultValue, options))
                : value;

            const newValue = encodeParam(internalValue, encode);

            if (currentValue === newValue || (currentValue === undefined && isEqual(internalDefaultValue, value))) {
                return;
            }

            paramsStore.setState((s) => {
                return ({...s, [paramName]: newValue});
            });

            const search = api.getSearch();
            const clearAll = !updateType.endsWith("In");
            const isReplace = updateType.startsWith("replace");
            const searchParams = !clearAll ? new URLSearchParams(search) : new URLSearchParams();

            if (!isEqual(internalDefaultValue, value)) {
                searchParams.set(paramName, newValue);
            } else {
                searchParams.delete(paramName);
            }

            const newHref = `?${searchParams.toString()}`
            const internalState = {[paramsTransitioning]: true, ...state};
            if (isReplace) {
                api.replaceState(newHref, internalState);
            } else {
                api.pushState(newHref, internalState);
            }
        }, [paramName, internalDefaultValue, options])
    }

    const useParam = <T, >(
        paramName: string,
        options: OptionsWithDefault<T>,
    ) => {
        const value = useParamGet<T>(paramName, options);
        const setter = useParamSet<T>(paramName, options);
        return [value, setter] as const;
    }

    return {
        useParamGet,
        useParamSet,
        useParam,
        paramsStore,
        api,
    }
}

export type ParamsCore = ReturnType<typeof create>;