import {create as createCore, ParamsCore} from "./core";
import {
    AllTypedOptions,
    BuildArg,
    Dispatch,
    FinalOptions,
    InferValue,
    ListOptions,
    OptionsBuilder,
    Params,
    RequiredOptions,
    Schema,
    Serializer,
    Setter, SetterTransformMethod,
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
    enum: {
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
    customSetter: SetterTransformMethod<unknown, unknown> | null

    constructor(state: RequiredOptions<unknown>) {
        this.state = state;
        this.customSetter = null
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

    withCustomSetter<SetRes>(transformer: SetterTransformMethod<unknown, SetRes>) {
        this.customSetter = transformer;
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
    const {useParamSet, useParam} = params;
    const {state, customSetter} = builder;
    const typedOptions = state as RequiredOptions<T>;

    const createSetter = (setter: Dispatch<Setter<T>>) => {
        return customSetter ? customSetter({setter: setter as Dispatch<unknown>}) : setter;
    }

    return {
        useSet: (options?: FinalOptions<T>) => {
            const memoedOptions = useMemoOptions(typedOptions, globalOptions, options);
            const paramName = getWithPrefix(memoedOptions.prefix, prop);
            const setter = useParamSet(paramName, memoedOptions) as Dispatch<Setter<T>>
            return useMemo(() => createSetter(setter), [setter])
        },
        use: (options?: FinalOptions<T>) => {
            const memoedOptions = useMemoOptions(typedOptions, globalOptions, options);
            const paramName = getWithPrefix(memoedOptions.prefix, prop);
            const [res, setter] = useParam(paramName, memoedOptions);
            const setterTransformed = useMemo(() => createSetter(setter), [setter])

            return [
                res,
                setterTransformed,
            ]
        }
    }
}

let core: ParamsCore | null = null;

const init = once(() => {
    core = createCore();
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
                    const {api} = core!
                    batch(() => {
                        api.batch(fn);
                    })
                }
            }
            const schemaField = camelCaseToKebab(prop);
            const builder = schema[schemaField] as unknown as InternalBuilder;

            return buildSingle({
                builder,
                params: core!,
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
        params: core!,
        prop,
    }) as unknown as InferValue<T>
}