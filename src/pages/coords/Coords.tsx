import {useCallback, useReducer} from "react";
import {CoordsState} from "./CoordsState";
import {ImageInspector, ImageSelector} from "@/components/image";

export default function Coords() {
    const [state, dispatch] = useReducer(CoordsState.reduce, null, CoordsState.initial);

    const handleSelected = useCallback((image: File) => {
        dispatch({
            kind: "set file",
            payload: image
        })
    }, [dispatch]);

    const {image} = state;
    return (
        null == image
            ? <ImageSelector onSelected={handleSelected}/>
            : <ImageInspector image={image}/>
    );
}
