import type {DialogValue, RequiredOptions} from "./types";
import {useCallback} from "react";
import {ParamsCore} from "./core";
import {useSmartValue} from "./utils";

export const createWrappers = ({useParamGet, useParamSet}: ParamsCore) => {
    const useToggleParamSet = (
        paramName: string,
        options: RequiredOptions<boolean>,
    ) => {
        const setter = useParamSet<boolean>(paramName, options);
        const toggle = useCallback(()=>{
            setter((prev)=> !prev)
        }, [setter])

        return {
            toggle,
        }
    }

    const useToggleParam = (
        paramName: string,
        options: RequiredOptions<boolean>,
    ) => {
        const { toggle } = useToggleParamSet(paramName, options);
        const value = useParamGet(paramName, options);

        return {
            toggle,
            value,
        }
    }

    const useDialogParamSet = <T,>(
        paramName: string,
        options: RequiredOptions<DialogValue<T>>,
    ) => {
        const smartDefaultValue = useSmartValue(options.defaultValue);
        const setter = useParamSet(paramName, options);
        const close = useCallback(()=>{
            setter(smartDefaultValue!)
        }, [setter, smartDefaultValue])

        const open = useCallback((state: T)=>{
            setter({
                isOpen: true,
                state,
            })
        }, [setter])

        return {
            close,
            open,
        }
    }

    const useDialogParam = <T,>(
        paramName: string,
        options: RequiredOptions<DialogValue<T>>,
    ) => {
        const value = useParamGet(paramName, options);
        const {open, close} = useDialogParamSet(paramName, options);
        const {isOpen, ...state} = value!;

        return {
            isOpen,
            close,
            open,
            state
        }
    }

    return {
        useToggleParamSet,
        useToggleParam,
        useDialogParamSet,
        useDialogParam,
    }
}

