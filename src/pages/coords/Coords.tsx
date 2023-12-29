import {createRef, useCallback, useReducer} from "react";
import {CoordsState} from "./CoordsState";
import {ImageInspector, ImageSelector, Point2D} from "@/components/image";

export default function Coords() {
    const sourceRef = createRef<HTMLTextAreaElement>();
    const [state, dispatch] = useReducer(CoordsState.reduce, null, CoordsState.initial);

    const handleSelected = useCallback((image: File) => {
        dispatch({
            kind: "set file",
            payload: image
        })
    }, [dispatch]);

    const inspectorCoordinateEntered = useCallback(([x, y]: Point2D) => {
        const source = sourceRef.current!;
        const value = source.value;
        source.value = `${source.value}, [${x}, ${y}]`;
    }, [sourceRef]);

    const {image} = state;
    return (
        null == image
            ? <ImageSelector onSelected={handleSelected}/>
            : (
                <>
                    <ImageInspector onCoordinateEntered={inspectorCoordinateEntered} src={image}/>
                    <div>
                        <textarea ref={sourceRef} rows={8} cols={120}/>
                    </div>
                </>
            )
    );
}
