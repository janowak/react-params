import './example.css'

import {createSingle, p} from "@react-params/core";

const nameParam = createSingle("name", p.string().withDefault("Brian"))

const Example = () => {
    const [name, setName] = nameParam.use();

    return (
        <div>
            <h3>Single param usage example</h3>
            <div className="value-container">
                {name}
            </div>
            <input value={name} onChange={(e) => {
                setName(e.target.value)
            }}/>
        </div>
    )
}

export default Example
