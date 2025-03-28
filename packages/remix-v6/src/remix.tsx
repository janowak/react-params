import React, {ReactNode, useMemo} from "react";
import {useLocation} from "@remix-run/react";
import { ReactParamsApiProvider } from "@react-params/react-router-dom";
import { isServer, dummyApi, ApiContext } from "@react-params/core";

export const RemixServerApiProvider = ({children}: { children: ReactNode }) => {
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

export const RemixApiProvider = ({children}: { children: ReactNode }) => {
    if (isServer) {
        return <RemixServerApiProvider>{children}</RemixServerApiProvider>
    } else {
        return <ReactParamsApiProvider>{children}</ReactParamsApiProvider>
    }
}
