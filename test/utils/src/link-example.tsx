import './example.css'

import {create, p} from "@react-params/core";

const params = create({
    "name": p.string().withDefault("Brian"),
    "secondaryName": p.string().withDefault("Smith"),
})

const Example = () => {
    return (
        <div>
            <h3>Links example</h3>
            <button onClick={() => {
                const link = params.build({
                    name: "Jakub",
                    secondaryName: "Nowak",
                })
                alert(`Link: ${link}`)
            }}>
                Show link
            </button>
        </div>
    )
}

export default Example
