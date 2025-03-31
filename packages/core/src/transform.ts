import {SetterTransformMethod} from "./types";

export const toggleTransform: () => SetterTransformMethod<boolean, { toggle: () => void }> = () => {
    return ({setter}) => {
        return {
            toggle: () => {
                setter((prev) => !prev)
            },
            set: setter,
        }
    }

}

type OpenLike = {
    isOpen: boolean
}

export type DialogValue<T> = {
    state?: T,
} & OpenLike

type DialogMethods<R> = {
    close: () => void;
    open: (state: R | undefined) => void;
    setState: (state: R) => void;
}

export const dialogTransform = <R, >(): SetterTransformMethod<DialogValue<R>, DialogMethods<R>> => {
    return ({setter}) => {
        return {
            close: () => {
                const newValue = {
                    isOpen: false,
                }
                setter(newValue)
            },
            open: (state: R | undefined) => {
                const newValue = {
                    isOpen: true,
                    state,
                }
                setter(newValue)
            },
            setState: (newState) => {
                setter((prev: DialogValue<R>) => {
                    return {
                        state: newState,
                        isOpen: prev.isOpen,
                    }
                })
            }
        }
    }

}

type PageLike = {
    page: number,
    size: number,
}

export type PageMethods = {
    next: () => void;
    prev: () => void;
    setPage: (page: number) => void;
    setSize: (size: number) => void;
}

export const pageTransform = (): SetterTransformMethod<PageLike, PageMethods> => {
    return ({setter}) => {
        return {
            next: () => {
                setter((prev) => {
                    return {
                        page: prev.page + 1,
                        size: prev.size,
                    }
                })
            },
            prev: () => {
                setter((prev) => {
                    return {
                        page: prev.page - 1,
                        size: prev.size,
                    }
                })
            },
            setPage: (page: number) => {
                setter((prev) => {
                    return {
                        page,
                        size: prev.size,
                    }
                })
            },
            setSize: (size: number) => {
                setter((prev) => {
                    return {
                        page: prev.page,
                        size,
                    }
                })
            }
        }
    }

}


