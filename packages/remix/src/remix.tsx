import React, {ReactNode, useMemo} from "react";
import {useLocation} from "@remix-run/react";
import { ReactParamsApiProvider as ReactParamsClientApiProvider } from "@react-params/react-router-dom";
import { isServer, dummyApi, ApiContext } from "@react-params/core";

export const ReactParamsServerApiProvider = ({children}: { children: ReactNode }) => {
    const location = useLocation();

    const api = useMemo(() => {
        return {
            ...dummyApi,
            getSearch: () => {
                return location.search
            },
        }
    }, [location]);

    return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
}

export const ReactParamsApiProvider = ({children}: { children: ReactNode }) => {
    if (isServer) {
        return <ReactParamsServerApiProvider>{children}</ReactParamsServerApiProvider>
    } else {
        return <ReactParamsClientApiProvider>{children}</ReactParamsClientApiProvider>
    }
}
