import './example.css'

import React from "react";
import {TestRenderFuncDef} from "./test-utils.tsx";
import {pageTransform} from "@react-params/core";

type PageInfo = {
    page: number,
    size: number,
}

export const renderExample: TestRenderFuncDef = (create, p) => {
    const pageParams = create({
        "page": p.object<PageInfo>({updateType: "replaceIn"}).withDefault({
            page: 1,
            size: 10
        }).transform(pageTransform()),
    })

    return () => {
        const [currentPage, {next, prev, setSize}] = pageParams.page.use({
            prefix: "prefix"
        });

        return (
            <>
                <h3>Page example</h3>
                <div onClick={() => {
                    next()
                }}>
                    Next
                </div>

                <div onClick={() => {
                    prev()
                }}>
                    Previous
                </div>
                <div>
                    <input value={currentPage.size} type={"number"} onChange={(e) => {
                        setSize(parseInt(e.target.value))
                    }}/>
                </div>
                <div>
                    Page:
                    {currentPage.page}
                    Size:
                    {currentPage.size}
                </div>
            </>
        )
    }
}
