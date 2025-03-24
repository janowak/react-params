import './example.css'

import {create, p} from "@react-params/core";

const params = create({
    "selected-tab": p.string().withDefault("Values"),
    "name": p.string().withDefault("kuba"),
    "details": p.object<{ address: string | null }>().withDefault({address: "address"}),
    "favorite-number": p.number().withDefault(11),
    "favorite-colors": p.list({
        separator: ",",
        item: p.string(),
    }).withDefault(["red"]),
})

const Example = () => {
    const [name, setName] = params.name.use();
    const [colors, setColors] = params.favoriteColors.use();
    const [details, setDetails] = params.details.use();
    const [favoriteNumber, setFavoriteNumber] = params.favoriteNumber.use();

    return (
        <div className={"container vanilla-container"}>
            <h3>Simple values</h3>
            <div>
                <div>
                    <div>
                        <label>[string]</label>
                        <div className="value-container">
                            {name}
                        </div>
                    </div>
                    <div>
                        <input value={name} placeholder={"New name"} onChange={(e) => setName(e.target.value)}/>
                    </div>
                </div>
                <div>
                    <div>
                        <label>[object]</label>
                        <div className="value-container">
                            {details.address}
                        </div>
                    </div>
                    <button onClick={() => {
                        setDetails({
                            address: "New address",
                        })
                    }}>
                        Change addresses
                    </button>
                </div>
                <div>
                    <div>
                        <label>[list]</label>
                        <div className="value-container">
                            {colors.join(", ")}
                        </div>
                    </div>
                    <button onClick={() => {
                        setColors([
                            "yellow",
                            "blue",
                        ])
                    }}>
                        Change colors
                    </button>
                </div>
                <div>
                    <div>
                        <label>[number]</label>
                        <div className="value-container">
                            {favoriteNumber}
                        </div>
                    </div>
                    <button onClick={() => {
                        setFavoriteNumber(favoriteNumber + 1)
                    }}>
                        Increase number
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Example