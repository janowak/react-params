import {createParams, ParamsCore} from "./core";
import {
    AllTypedOptions,
    BuildArg, Dispatch,
    FinalOptions,
    InferValue,
    ListOptions,
    OptionsBuilder,
    Params,
    RequiredOptions,
    Schema,
    Serializer, Setter,
    TransformParams,
    UrlOptions,
    Validator
} from "./types";
import {camelCaseToKebab, getValue, useMemoOptions} from "./utils";
import {
    booleanSerializer,
    createListSerializer,
    dateSerializer,
    datetimeSerializer,
    defaultDecoder,
    defaultEncoder,
    encodeParam,
    numberSerializer,
    stringSerializer
} from "./encoding";
import {once} from "lodash-es";
import {useMemo} from "react";
import {batch} from "@tanstack/react-store";


type OptionsConfig = {
    [key in keyof OptionsBuilder]?: unknown
}

const typeBasedOptions: OptionsConfig = {
    string: {
        ...stringSerializer,
    },
    number: {
        ...numberSerializer,
    },
    boolean: {
        ...booleanSerializer,
    },
    datetime: {
        ...datetimeSerializer,
    },
    date: {
        ...dateSerializer,
    },
}

class InternalBuilder {
    state: RequiredOptions<unknown>
    transformParams: TransformParams<unknown, unknown> | null

    constructor(state: RequiredOptions<unknown>) {
        this.state = state;
        this.transformParams = null
    }

    withSerializer(serializer: Serializer<unknown>) {
        this.state = {
            ...this.state,
            ...serializer,
        }
        return this;
    }

    validate(validator: Validator<unknown>) {
        this.state = {
            ...this.state,
            ...validator,
        }
        return this;
    }

    withDefault(value: NonNullable<unknown>) {
        this.state = {
            ...this.state,
            defaultValue: value,
        }
        return this;
    }

    transform<SetRes>(params: TransformParams<unknown, SetRes>) {
        this.transformParams = params;
        return this;
    }
}

const createInternalBuilder = (key: keyof OptionsBuilder, value?: UrlOptions) => {
    const options = typeBasedOptions[key] || {};

    const listOptions = key === "list" ? createListSerializer(value as ListOptions<unknown>) : {}
    const defaultSerializers = {
        encode: defaultEncoder,
        decode: defaultDecoder,
    }

    const state = {
        onError: () => {
        },
        validate: () => true,
        defaultValue: null,
        updateType: "replaceIn",
        ...defaultSerializers,
        ...options,
        ...(value || {}),
        ...listOptions
    } satisfies RequiredOptions<unknown>

    return new InternalBuilder(state);
}

export const p = new Proxy({} as OptionsBuilder, {
    get(_target, prop: string) {
        return (value?: UrlOptions) => {
            const key = prop as keyof OptionsBuilder;
            return createInternalBuilder(key, value);
        };
    },
});

const defaultSetTransformer: TransformParams<unknown, Dispatch<Setter<unknown>>> = {
    set: ({set: setValue}) => {
        return setValue;
    }
}

const getWithPrefix = (prefix: string | undefined, prop: string) => {
    return prefix ? `${prefix}-${prop}` : prop;
}

const buildSingle = <T extends AllTypedOptions>({builder, params, prop, globalOptions}:
                                                {
                                                    builder: InternalBuilder,
                                                    params: ParamsCore,
                                                    prop: string,
                                                    globalOptions?: UrlOptions
                                                }) => {
    const options = builder.state;
    const transformParams = builder.transformParams;
    const typedOptions = options as RequiredOptions<T>;
    const {set} = transformParams || defaultSetTransformer;

    return {
        useSet: (options?: FinalOptions<T>) => {
            const memoedOptions = useMemoOptions(typedOptions, globalOptions, options);
            const paramName = getWithPrefix(memoedOptions.prefix, prop);
            const setter = params.useParamSet(paramName, memoedOptions) as Dispatch<Setter<T>>
            return useMemo(() => {
                return set({
                    set: setter as Dispatch<unknown>,
                })
            }, [setter])
        },
        use: (options?: FinalOptions<T>) => {
            const memoedOptions = useMemoOptions(typedOptions, globalOptions, options);
            const paramName = getWithPrefix(memoedOptions.prefix, prop);
            const res = params.useParamGet(paramName, memoedOptions);
            const setter = params.useParamSet(paramName, memoedOptions);
            const setterTransformed = useMemo(() => {
                return set({
                    set: setter as Dispatch<unknown>,
                })
            }, [setter])

            return [
                res,
                setterTransformed,
                ]
            }
    }
}

let params: ReturnType<typeof createParams> | null = null;

const init = once(() => {
    params = createParams();
});

export function create<T extends Schema>(schema: T, globalOptions?: UrlOptions): Params<T> {
    init();
    let internalGlobalOptions = globalOptions;

    const proxy = new Proxy({} as Params<T>, {
        get(_target, prop: string) {
            if (prop === "withOptions") {
                return (globalOptions: UrlOptions) => {
                    internalGlobalOptions = {
                        ...internalGlobalOptions,
                        ...globalOptions,
                    }
                    return proxy;
                }
            }
            if (prop === 'build') {
                return (values: BuildArg<T>) => {
                    const params = Object.entries(values).map(([key, value]) => {
                        const schemaKey = camelCaseToKebab(key);
                        const builder = schema[schemaKey] as unknown as InternalBuilder
                        const {defaultValue, encode} = builder.state;
                        if (value === getValue(defaultValue)) {
                            return undefined
                        }
                        const encodedValue = encodeParam(value, encode);
                        return `${key}=${encodedValue}`;
                    }).filter(Boolean);
                    return params.join("&");
                }
            }
            if (prop === 'batch') {
                return (fn: () => void) => {
                    const {api} = params!.getInternals();
                    batch(()=> {
                        api.batch(fn);
                    })
                }
            }
            const schemaField = camelCaseToKebab(prop);
            const builder = schema[schemaField] as unknown as InternalBuilder;

            return buildSingle({
                builder,
                params: params!,
                prop,
                globalOptions: internalGlobalOptions,
            })
        }
    });
    return proxy;
}

export function createSingle<T extends AllTypedOptions>(prop: string, definition: T): InferValue<T> {
    init();
    const builder = definition as unknown as InternalBuilder;
    return buildSingle({
        builder,
        params: params!,
        prop,
    }) as unknown as InferValue<T>
}