import {create as createFunc, p as pFunc,} from "@react-params/core";
import {JSX} from "react";

export type TestRenderFuncDef = (create: typeof createFunc,
                                 p: typeof pFunc,
) => () => JSX.Element