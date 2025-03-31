import './example.css'
import {create, p, pageTransform} from "@react-params/core";

type PageInfo = {
    page: number,
    size: number,
}

const pageParams = create({
    "table-state": p.object<PageInfo>()
        .withDefault({
            page: 1,
            size: 10
        })
        .withCustomSetter(pageTransform()),
})

const Example = () => {
    const [currentPage, {next, prev, setSize}] = pageParams.tableState.use({
        prefix: "prefix"
    });

    return (
        <div className={"container pagination-container"}>
            <h3>Pagination example with prefix [transform object]</h3>
            <div className={"value-container"}>
                Page: {currentPage.page} {" "}
                Size: {currentPage.size}
            </div>
            <div className={"pagination-buttons"}>
                <button onClick={() => {
                    next()
                }}>
                    Next
                </button>
                <button onClick={() => {
                    prev()
                }}>
                    Previous
                </button>
                <div>
                    page size:
                    <input value={currentPage.size} type={"number"} onChange={(e) => {
                        setSize(parseInt(e.target.value))
                    }}/>
                </div>
            </div>

        </div>
    )
}

export default Example