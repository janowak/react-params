import {useCallback, useMemo} from "react";
import {Store, useStore} from "@tanstack/react-store";
import {isEqual, once} from "lodash-es";

import {ParamStore} from "./store";
import {getRenderingType, getValue, isClient, isParamsTransition, paramsTransitioning, useSmartValue} from "./utils";
import {decodeParam, encodeParam} from "./encoding";

import {API, OptionsWithDefault, Setter, Value} from "./types";
import {useContextApi} from "./use-api";
import {BatchingApi, defaultApi, withBatch} from "./api";

export const createParams = () => {
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

    const init = once((contextApi: API, isClient: boolean) => {
        api = withBatch(contextApi ?? defaultApi(getRenderingType()));
        api.registerListener((state: unknown) => {
            if (isParamsTransition(state)) {
                return;
            }
            paramsStore.setState(() => getLatestParams(api))
        });
        if (isClient) {
            paramsStore = new Store<Record<string, string>>(getLatestParams(api));
        }
    });

    const decodeWithDefault = <T, >(value: string | undefined, defaultValue: Value<T>, options: OptionsWithDefault<T>): T => {
        const internalDefaultValue = getValue(defaultValue);
        try {
            if (value === undefined) {
                return internalDefaultValue
            }
            const decoded = decodeParam(value, options.decode)
            const isValid = options.validate ? options.validate(decoded) : true
            if (!isValid) {
                options.onError?.(value, decoded)
                return internalDefaultValue
            }
            return decoded
        } catch {
            const onErrorValue = options.onError?.(value, undefined)
            return onErrorValue ?? internalDefaultValue
        }
    }

    const useParamGet = <T, >(
        paramName: string,
        options: OptionsWithDefault<T>,
    ) => {
        const contextApi = useContextApi();

        if (isClient) {
            init(contextApi, isClient);
        }

        const {defaultValue} = options;
        const smartDefaultValue = useSmartValue(defaultValue);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const value = isClient ? useStore(paramsStore, (s) => s[paramName]) : getLatestParams(contextApi)[paramName];
        const decodedValue = useMemo(() => decodeWithDefault(value, smartDefaultValue, options), [value, smartDefaultValue, options]);

        return useSmartValue(decodedValue) as T
    }

    const useParamSet = <T, S extends object = object>(
        paramName: string,
        options: OptionsWithDefault<T>,
    ) => {
        const contextApi = useContextApi();

        if (isClient) {
            init(contextApi, isClient);
        }

        const {defaultValue} = options;
        const smartDefaultValue = useSmartValue(defaultValue);

        return useCallback((value: Setter<T>, state?: S) => {
            if (!isClient) {
                throw new Error("Cannot use react params on the server");
            }

            const {updateType = "replaceIn", encode} = options;
            const currentValue = paramsStore.state[paramName];
            const internalValue = typeof value === "function"
                ? (value as (prev: T) => T)(decodeWithDefault(currentValue, smartDefaultValue, options))
                : value;

            const newValue = encodeParam(internalValue, encode);

            if (currentValue === newValue || (currentValue === undefined && isEqual(smartDefaultValue, value))) {
                return;
            }

            paramsStore.setState((s) => {
                return ({...s, [paramName]: newValue});
            });

            const search = api.getSearch();
            const clearAll = !updateType.endsWith("In");
            const isReplace = updateType.startsWith("replace");
            const searchParams = !clearAll ? new URLSearchParams(search) : new URLSearchParams();

            if (!isEqual(smartDefaultValue, value)) {
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
        }, [paramName, smartDefaultValue, options])
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
        getInternals: () => {
            return {
                paramsStore,
                api,
            }
        }
    }
}

export type ParamsCore = ReturnType<typeof createParams>;