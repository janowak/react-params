import './example.css'

import {create, dialogTransform, p} from "@react-params/core";
import {useEffect} from "react";

type StateShape = {
    id: string
}

type DialogState = {
    isOpen: boolean
    state?: StateShape
}

const pageParams = create({
    "page": p.object<DialogState>({updateType: "replaceIn"}).withDefault({
        isOpen: false,
    }).transform(dialogTransform<StateShape>()),
})

const Example = () => {
    const [{isOpen}, {close, open}] = pageParams.page.use({
        prefix: "prefix"
    });

    // naive dialog implementation
    useEffect(() => {
        const handler = (e: Event) => {
            const targetElement = e.target as HTMLElement;
            const isPartOfDialog = targetElement?.closest("dialog");
            if (isPartOfDialog) {
                return;
            }
            close();
        }
        if (isOpen) {
            setTimeout(()=>{
                document.addEventListener("click", handler)
            }, 0);
        }
        return () => {
            document.removeEventListener("click", handler)
        }
    }, [isOpen, close])

    return (
        <div className={"container dialog-container"}>
            <h3>Dialog example [transform object]</h3>
            <div className={"flex gap-2"}>
                <button onClick={() => open({id: "1"})}>
                    Open
                </button>
            </div>
            {isOpen &&
                <dialog open={isOpen} >
                    Dialog content
                    <button onClick={() => close()}>
                        Close
                    </button>
                </dialog>
            }
        </div>
    )
}

export default Example