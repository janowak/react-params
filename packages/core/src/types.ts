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
    prefix?: string,
}

export type DialogValue<T> = {
    isOpen: boolean,
    state: T,
}

type Dispatch<A> = (value: A) => void;
export type Setter<S> = S | ((prevState: S) => S);


export type FinalOptions<T> = UrlOptions & Validator<T> & ValueOptions<T>
export type Options<T> = SerializerOptions<T> & FinalOptions<T> & {type: "value" | "dialog"}
export type OptionsWithDefault<T> = Require<Options<T>, "defaultValue">
export type RequiredOptions<T> = Required<Options<T>>

type Param<T> = {
    useSet: (options?: FinalOptions<T>) => Dispatch<Setter<T>>,
    use: (options?: FinalOptions<T>) => [T, Dispatch<Setter<T>>],
}

type DialogSet<T> = {
    close: () => void,
    open: (state: Setter<T>) => void,
    set: (state: Setter<T>) => void,
}

type PageSet = {
    next: () => void,
    prev: () => void,
    setPage: (page: number) => void,
    setSize: (size: number) => void,
    canNext: boolean,
    canPrev: boolean,
}

type PageGet = {

}

type DialogGet<T> = {
    isOpen: boolean,
    state: T,
}

type DialogParam<T> = {
    useSet: (options?: FinalOptions<T>) => DialogSet<T>,
    use:(options?: FinalOptions<T>) => DialogGet<T> & DialogSet<T>,
}

type PageParam = {
    useSet: (options?: FinalOptions<Page>) => PageSet,
    use:(options?: FinalOptions<Page>) => PageGet & PageSet,
}

type Shape = "value" | "dialog" | "page"

export type Validator<T> = {
    validate?: (value:T) => boolean,
    onError?: (serializedValue: string | undefined, value?: T) => void,
}

type BaseBuilder<T, Type extends Shape> = {
    withDefault: (value: NonNullable<T>) => Builder<NonNullable<T>, Type>
    withLazyDefault: () => Builder<NonNullable<T>, Type>
    validate: (validator: Validator<T>) => Builder<T, Type>
    withSerializer: (coder: Serializer<T>) => Builder<T, Type>
}

type Builder<T, Type extends Shape> = BaseBuilder<T, Type> & {
    asDialog: () => Builder<T, "dialog">
}

type ListBuilder<T, Type extends Shape> = Omit<Builder<T, Type>, "withSerializer">

export type ListOptions<T> = {
    separator?: string,
    item: BaseBuilder<T, "value">
} & UrlOptions

export type PageOptions = {
} & UrlOptions

type Page = {
    page: number,
    size: number,
}
export type OptionsBuilder = {
    string: (options?: UrlOptions) => Builder<string | null, "value">,
    number: (options?: UrlOptions) => Builder<number | null, "value">,
    boolean: (options?: UrlOptions) => Builder<boolean | null, "value">,
    datetime: (options?: UrlOptions) => Builder<Date | null, "value">,
    date: (options?: UrlOptions) => Builder<Date | null, "value">,
    object: <T extends object>(options?: Options<T | null>) => Builder<T | null, "value">,
    list: <T>(options?: ListOptions<T>) => ListBuilder<NonNullable<T>[] | null, "value">,
    page: (options?: PageOptions) => Builder<Page, "page">,
}

type AllTypedOptions =  Builder<any, any> | ListBuilder<any, any>

// Helper type to convert kebab-case keys to camelCase
type KebabToCamel<S extends string> = S extends `${infer P1}-${infer P2}${infer P3}`
    ? `${P1}${Uppercase<P2>}${KebabToCamel<P3>}`
    : S;

export type Schema = Record<string, AllTypedOptions>

type InferShape<T, Shape> = Shape extends "value"? Param<T> : Shape extends "page"? PageParam : DialogParam<T>

type InferValue<T> =
    T extends Builder<infer R, infer Type>
        ? InferShape<R, Type>
            : T extends ListBuilder<infer R, infer Type>
                ? InferShape<R, Type>
                    : never;

type InferBuildValue<T extends AllTypedOptions> =
    T extends Builder<infer R, any> ? R :
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
