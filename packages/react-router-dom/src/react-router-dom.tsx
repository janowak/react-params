import React, {ReactNode, useContext, useMemo} from "react";
import {UNSAFE_DataRouterContext} from "react-router-dom";
import { isServer } from "@react-params/core";
import { ApiContext } from "@react-params/core";

export const ReactParamsApiProvider = ({children}: {children: ReactNode}) => {
    const router = useContext(UNSAFE_DataRouterContext)?.router;

    const api = useMemo(() => {
        return {
            getSearch: () => {
                if (isServer && location) {
                    return location.search
                } else if (router) {
                    return  router.state.location.search
                } else {
                    console.error("[react-params] can't use react router context as it is not defined")
                    return "";
                }
            },
            replaceState: (params: string, state?: unknown) => {
                router?.navigate(params, {
                    replace: true,
                    state,
                })
            },
            pushState: (params: string, state?: unknown) => {
                router?.navigate(params, {
                    replace: false,
                    state,
                })
            },
            registerListener: (listener: (state: unknown) => void) => {
                router?.subscribe((action)=> {
                    const {state: navigationState}= action.navigation;
                    if (navigationState !== "idle") {
                        return;
                    }
                    const {state} = action.location
                    listener(state);
                })
            },
        }
    }, [router]);

    return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}
