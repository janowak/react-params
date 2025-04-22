export type UrlUpdateType = "replaceIn" | "pushIn" | "replace" | "push";

type Require<T, Keys extends keyof T> = Pick<Required<T>, Keys> & Omit<T, Keys>

export type API = {
    getSearch: () => string,
    replaceState: (params: string, state?: unknown) => void,
    pushState: (params: string, state?: unknown) => void,
    registerListener: (listener: (state?: unknown) => void) => void,
}

export type RenderingType = "server" | "client";

export type Serializer<T> = {
    encode: (value: T) => string,
    decode: (value: string) => T,
}

export type SerializerOptions<T> = Partial<Serializer<T>>

export type Value<T> = T | (() => T)

export type ValueOptions<T> = {
    defaultValue?: Value<T>
}

export type UrlOptions = {
    updateType?: UrlUpdateType,
}

export type Dispatch<A> = (value: A) => void;
export type Setter<S> = S | ((prevState: S) => S);

export type PrefixOptions = {
    prefix?: string,
}

export type FinalOptions<T> = UrlOptions & Validator<T> & ValueOptions<T> & PrefixOptions
export type Options<T> = SerializerOptions<T> & FinalOptions<T>
export type OptionsWithDefault<T> = Require<Options<T>, "defaultValue">
export type RequiredOptions<T> = Require<OptionsWithDefault<T>, "encode" | "decode">

type Param<T> = {
    useSet: (options?: FinalOptions<T>) => Dispatch<Setter<T>>,
    use: (options?: FinalOptions<T>) => [T, Dispatch<Setter<T>>],
}

type TransformedParam<T, SetRes> = {
    useSet: (options?: FinalOptions<T>) => SetRes,
    use: (options?: FinalOptions<T>) => [T, SetRes],
}

export type Validator<T> = {
    validate?: (value: T) => boolean,
    onError?: (serializedValue: string | undefined, value?: T) => T | undefined,
}

export type SetTransformerParams<T> = {
    setter: Dispatch<Setter<T>>,
}

type TransformInfo<SetRes> = {
    set: SetRes
}

export type SetterTransformMethod<T, SetRes> =  (params: SetTransformerParams<T>) => SetRes

type Builder<T, TInfo extends TransformInfo<any> | undefined = undefined> = {
    withDefault: (value: NonNullable<T>) => Builder<NonNullable<T>, TInfo>
    validate: (validator: Validator<T>) => Builder<T, TInfo>
    withSerializer: (coder: Serializer<T>) => Builder<T, TInfo>
    withCustomSetter: <SetRes>(transformer: SetterTransformMethod<T, SetRes>) => Builder<T, TransformInfo<SetRes>>
}

type ListBuilder<T, TInfo extends TransformInfo<any> | undefined = undefined> = Omit<Builder<T, TInfo>, "withSerializer">

type ListItemBuilder<T> = Omit<Builder<T>, "transform">

export type ListOptions<T> = {
    separator?: string,
    item: ListItemBuilder<T>
} & UrlOptions

type ParamBuilder<T> = (options?: UrlOptions) => Builder<T | null>

export type OptionsBuilder = {
    string: ParamBuilder<string>,
    number: ParamBuilder<number>,
    boolean: ParamBuilder<boolean>,
    datetime: ParamBuilder<Date>,
    date: ParamBuilder<Date>,
    object: <T extends object>(options?: UrlOptions) => Builder<T | null>,
    enum: <T extends string>(options?: UrlOptions) => Builder<T | null>,
    list: <T>(options?: ListOptions<T>) => ListBuilder<NonNullable<T>[] | null>,
}

export type AllTypedOptions = Builder<any, any> | ListBuilder<any, any>

type KebabToCamel<S extends string> = S extends `${infer P1}-${infer P2}${infer P3}`
    ? `${P1}${Uppercase<P2>}${KebabToCamel<P3>}`
    : S;

export type Schema = Record<string, AllTypedOptions>

type InferShape<T, Info> = Info extends undefined ? Param<T> : Info extends TransformInfo<infer SetRes> ? TransformedParam<T, SetRes> : never

export type InferValue<T> =
    T extends Builder<infer R, infer TInfo>
        ? InferShape<R, TInfo>
        : T extends ListBuilder<infer R, infer TInfo>
            ? InferShape<R, TInfo>
            : never;

type InferBuildValue<T extends AllTypedOptions> =
    T extends Builder<infer R> ? R :
        never;

type KeysToCamelCase<T> = {
    [K in keyof T as KebabToCamel<string & K>]: T[K]
}

export type BuildArg<T extends Record<string, AllTypedOptions>> = Partial<KeysToCamelCase<{
    [K in keyof T]: InferBuildValue<T[K]>
}>>

export type Params<T extends Record<string, AllTypedOptions>> = KeysToCamelCase<{
    [K in keyof T]: InferValue<T[K]>
}> & {
    batch(fn: () => void): void,
    build(arg: BuildArg<T>): void,
    withOptions(globalOptions: UrlOptions): Params<T>,
};
