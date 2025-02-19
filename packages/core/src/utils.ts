import {useMemo, useRef} from "react";
import {isEqual} from "lodash-es";
import {FinalOptions, RequiredOptions, UrlOptions, Value} from "./types";

export const getRenderingType = () =>  {
    const isBrowser = (typeof window != 'undefined' && window.document)
    return isBrowser ? "client" : "server";
};

export const getValue = <T,>(value: Value<T>): T => {
    if (typeof value === "function") {
        // @ts-ignore
        return value();
    }
    return value;
}


export const isClient = getRenderingType() === "client";
export const isServer = getRenderingType() === "server";

export const paramsTransitioning = "__ParamsTransitioning";

export const isParamsTransition = (state: unknown) => state != null && typeof state === "object" && paramsTransitioning in state;

export const useSmartValue = <T,>(value: Value<T>) => {
    const internalValue = getValue(value);
    const ref = useRef<T>(undefined);
    if (ref.current === undefined) {
        ref.current = internalValue;
    }

    if (isEqual(ref.current, internalValue)) {
        return ref.current;
    } else {
        ref.current = internalValue;
        return internalValue;
    }
};

export const useMemoOptions = <T,>(options: RequiredOptions<T>, options2?: UrlOptions, options3?: FinalOptions<T>) => {
    const smartOptions1 = useSmartValue(options);
    const smartOptions2 = useSmartValue(options2);
    const smartOptions3 = useSmartValue(options3);
    return useMemo(() => mergeOptions<RequiredOptions<T>>(smartOptions1, smartOptions2, smartOptions3), [smartOptions1, smartOptions2, smartOptions3]);
}

export const mergeOptions = <T,>(...options: any[]) => {
    return Object.assign({}, ...options) as T
};

export const camelCaseToKebab =
    (str: string): string => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase());
