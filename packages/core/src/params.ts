import {createParams} from "./core";
import {
    BuildArg,
    Serializer,
    DialogValue,
    Params,
    FinalOptions,
    ListOptions,
    OptionsBuilder,
    RequiredOptions,
    Schema,
    UrlOptions,
    Validator
} from "./types";
import {camelCaseToKebab, getValue, useMemoOptions} from "./utils";
import {createWrappers} from "./wrappers";
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

type OptionsConfig = {
    [key in keyof OptionsBuilder]?: unknown
}

const typeBasedOptions: OptionsConfig =  {
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
    constructor(state: RequiredOptions<unknown>) {
        this.state = state;
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
    asDialog() {
        return {
            state: {
                ...this.state,
                type: "dialog",
            }
        }
    }
}

export const p = new Proxy({} as OptionsBuilder, {
    get(_target, prop: string) {
        return (value?: UrlOptions) => {
            const key = prop as keyof OptionsBuilder ;
            const options = typeBasedOptions[key] || {};

            const listOptions= key === "list" ? createListSerializer(value as ListOptions<unknown>) : {}
            const defaultSerializers = {
                encode: defaultEncoder,
                decode: defaultDecoder,
            }

            const state = {
                onError: () => {},
                validate: () => true,
                type: "value" as const,
                defaultValue: null,
                updateType: "replaceIn",
                prefix: "",
                ...defaultSerializers,
                ...options,
                ...( value || {}),
                ...listOptions
            } satisfies RequiredOptions<unknown>

            return new InternalBuilder(state);
        };
    },
});


export function create<T extends Schema>(schema: T, globalOptions?: UrlOptions): Params<T> {
    const params = createParams();
    const wrappers = createWrappers(params);
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
                    const {paramsStore, api} = params.getInternals();
                    paramsStore.batch(() => {
                        api.batch(fn);
                    });
                }
            }
            const schemaField = camelCaseToKebab(prop);
            const builder = schema[schemaField] as unknown as InternalBuilder;
            const options = builder.state;

            const simpleMap = <T,>() => {
                const typedOptions = options as RequiredOptions<T>;
                return {
                    useSet: (options?: FinalOptions<T>) => {
                        const memoedOptions = useMemoOptions(typedOptions, internalGlobalOptions, options);
                        return params.useParamSet(prop, memoedOptions);
                    },
                    use: (options?: FinalOptions<T>) => {
                        const memoedOptions = useMemoOptions(typedOptions, internalGlobalOptions, options);
                        return params.useParam(prop, memoedOptions);
                    },
                }
            }

            if (options.type === "value") {
                return simpleMap<unknown>();
            } else if (options.type === "dialog") {
                const typedOptionsWithDialogDefault = {
                    ...options,
                    defaultValue: {
                        isOpen: false,
                        state: getValue(options.defaultValue),
                    }
                } as RequiredOptions<DialogValue<T>>;
                return {
                    //todo: better handle default options
                    useSet: (options?: FinalOptions<DialogValue<T>>) => {
                        const memoedOptions = useMemoOptions(typedOptionsWithDialogDefault, internalGlobalOptions, options);
                        return wrappers.useDialogParamSet(prop, memoedOptions);
                    },
                    use: (options?: FinalOptions<DialogValue<T>>) => {
                        const memoedOptions = useMemoOptions(typedOptionsWithDialogDefault, internalGlobalOptions, options);
                        return wrappers.useDialogParam(prop, memoedOptions);
                    }
                }
            }
            throw new Error("Invalid type");
        }
    });
    return proxy;
}