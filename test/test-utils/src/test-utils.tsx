import {create as createFunc, p as pFunc,} from "@react-params/core";
import React from "react";


export type TestRenderFuncDef = (create: typeof createFunc,
                                 p: typeof pFunc,
) => () => React.JSX.Element