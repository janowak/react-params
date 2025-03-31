import './example.css'

import {create, p} from "@react-params/core";

const params = create({
    "name": p.string().withDefault("Brian"),
    "secondaryName": p.string().withDefault("Smith"),
})

const Example = () => {
    const [name, setName] = params.name.use();
    const [secondaryName, setSecondaryName] = params.secondaryName.use();

    return (
        <div>
            <h3>Batch example</h3>
            <div className="value-container">
                {name}
                {" "}
                {secondaryName}
            </div>
            <button onClick={() => {
                params.batch(() => {
                    setName("Jakub");
                    setSecondaryName("Nowak");
                })
            }}>
                Batch
            </button>
        </div>
    )
}

export default Example
