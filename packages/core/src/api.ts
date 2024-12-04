import  {createContext} from "react";
import {API, RenderingType} from "./types";

export const ApiContext = createContext<API>(null!);

export const dummyApi = {
    getSearch: () => "",
    replaceState: () => {},
    pushState: () => {},
    registerListener: () => {},
}

export type BatchingApi = API & {
    batch: (fn: () => void) => void;
}

type ActionDetails = {
    search: string;
    state: unknown;
    type: "replaceState" | "pushState";
}

export const withBatch = (api: API): BatchingApi  => {
    let isBatching = false;
    let lastActionDetails: ActionDetails | null = null
    return {
        ...api,
        getSearch: () => {
            if (isBatching && lastActionDetails) {
                return lastActionDetails.search
            }
            return api.getSearch();
        },
        replaceState: (search: string, state?: unknown) => {
            if (isBatching) {
                lastActionDetails = {
                    search,
                    state,
                    type: "replaceState"
                }
            } else {
                api.replaceState(search, state);
            }
        },
        pushState: (search: string, state?: unknown) => {
            if (isBatching) {
                lastActionDetails = {
                    search,
                    state,
                    type: "pushState"
                }
            } else {
                api.pushState(search, state);
            }
        },
        batch: (fn: () => void) => {
            isBatching = true;
            fn();
            if (lastActionDetails) {
                api[lastActionDetails.type](lastActionDetails.search, lastActionDetails.state);
            }
            isBatching = false;
        }
    }
}

export const defaultApi = (type: RenderingType) => {
    if (type === "server") {
        return dummyApi;
    }
    return {
        getSearch: () => window.location.search,
        replaceState: (params: string, state?: unknown) => window.history.replaceState(state, "", params),
        pushState: (params: string, state?: unknown) => window.history.pushState(state, "", params),
        registerListener: (listener: (state?: unknown) => void) => {
            const originalPushState = window.history.pushState;
            window.history.pushState = (state, ...args)=> {
                originalPushState.apply(window.history, [state, ...args]);
                listener(state);
            }

            const orginalReplaceState = window.history.replaceState;
            window.history.replaceState = (state,...args)=> {
                orginalReplaceState.apply(window.history, [state, ...args]);
                listener(state);
            }

            window.addEventListener("popstate", () => {
                listener();
            })
        }
    }
}

