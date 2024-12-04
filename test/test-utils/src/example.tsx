import './example.css'

import React from "react";
import {create, p} from "@react-params/react-router";

const params = create({
    "name": p.string({updateType: "replaceIn"}).withDefault("kuba"),
    "details": p.object<{ address: string | null }>().withDefault({address: "address"}),
    "favorite-colors": p.list({
        separator: ",",
        item: p.string(),
    }).withDefault(["red"]),
    "favorite-number": p.number().withDefault(11),
})

const Component = () => {
    const [name, setName] = params.name.use();
    const [colors, setColors] = params.favoriteColors.use();
    const [details, setDetails] = params.details.use();
    const [favoriteNumber, setFavoriteNumber] = params.favoriteNumber.use();

    return (
        <>
            <h3>Values</h3>
            <div>
                <label>Name</label>
                {name}
            </div>
            <div>
                <label>Address</label>
                {details.address}
            </div>
            <div>
                <label>Colors</label>
                {colors.join(", ")}
            </div>
            <div>
                <label>Number</label>
                {favoriteNumber}
            </div>
            <h3>Form</h3>
            <button onClick={() => {
                setColors([
                    "yellow",
                    "blue",
                ])
            }}>
                Change colors
            </button>
            <button onClick={() => {
                setDetails({
                    address: "New address",
                })
            }}>
                Change addresses
            </button>
            <button onClick={() => {
                setFavoriteNumber(favoriteNumber + 1)
            }}>
                Increase number
            </button>
            <div>
                <input placeholder={"New name"} onChange={(e) => setName(e.target.value)}/>
            </div>
        </>
    )
}

export default Component;
