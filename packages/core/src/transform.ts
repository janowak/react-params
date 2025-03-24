import {TransformParams} from "./types";

export const toggleTransform: () => TransformParams<boolean, { toggle: () => void }> = () => {
    return {
        set: ({set: setValue}) => {
            return {
                toggle: () => {
                    setValue((prev) => !prev)
                },
                set: setValue,
            }
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

export const dialogTransform = <R, >(): TransformParams<DialogValue<R>, DialogMethods<R>> => {
    return {
        set: ({set: setValue}) => {
            return {
                close: () => {
                    const newValue = {
                        isOpen: false,
                    }
                    setValue(newValue)
                },
                open: (state: R | undefined) => {
                    const newValue = {
                        isOpen: true,
                        state,
                    }
                    setValue(newValue)
                },
                setState: (newState) => {
                    setValue((prev: DialogValue<R>) => {
                        return {
                            state: newState,
                            isOpen: prev.isOpen,
                        }
                    })
                }
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
export const pageTransform = (): TransformParams<PageLike, PageMethods> => {
    return {
        set: ({set: setValue }) => {
            return {
                next: () => {
                    setValue((prev) => {
                        return {
                            page: prev.page + 1,
                            size: prev.size,
                        }
                    })
                },
                prev: () => {
                    setValue((prev) => {
                        return {
                            page: prev.page - 1,
                            size: prev.size,
                        }
                    })
                },
                setPage: (page: number) => {
                    setValue((prev) => {
                        return {
                            page,
                            size: prev.size,
                        }
                    })
                },
                setSize: (size: number) => {
                    setValue((prev) => {
                        return {
                            page: prev.page,
                            size,
                        }
                    })
                }
            }
        }
    }
}


