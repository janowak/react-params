import {Serializer, ListOptions, RequiredOptions} from "./types";

export const defaultDecoder = JSON.parse;
export const defaultEncoder = JSON.stringify;

export const stringSerializer: Serializer<string> = {
    encode: (value: string) => value,
    decode: (value: string) => value,
}

export const numberSerializer: Serializer<number> = {
    encode: (value: number) => value.toString(),
    decode: (value: string) => parseInt(value)
}

export const booleanSerializer: Serializer<boolean> = {
    encode: (value: boolean) => value ? "true" : "false",
    decode: (value: string) => value === "true",
}

export const datetimeSerializer: Serializer<Date> = {
    encode: (value: Date) => value.toISOString(),
    decode: (value: string) => new Date(value),
}

export const dateSerializer: Serializer<Date> = {
    encode: (value: Date) => value.toISOString().split('T')[0] || "",
    decode: (value: string) => new Date(`${value}T00:00:00Z`),
}

export const decodeParam = <T,>(param: string, decoder: (value: string) => T = defaultDecoder) => {
    return decoder(decodeURIComponent(param)) as T;
}

export const encodeParam = <T,>(param: T, encoder: (value: T) => string = defaultEncoder) => {
    return encodeURIComponent(encoder(param));
}

type BuilderLike = {
    state: RequiredOptions<unknown>
}

export const createListSerializer = ({separator , item}: ListOptions<unknown>) => {
    return {
        encode: (value: unknown[]) => {
            const builder = item as unknown as BuilderLike;
            const {encode} = builder.state;
            return value.map((item)=> {
                return encode(item);
            }).join(separator);
        },
        decode: (value: string) => {
            const builder = item as unknown as BuilderLike;
            const {encode} = builder.state;

            return value.split(separator || ",").map((item)=> {
                return encode(item);
            })
        }
    }
}
