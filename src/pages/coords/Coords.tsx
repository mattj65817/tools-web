import {createRef, useCallback, useReducer} from "react";
import {CoordsState} from "./CoordsState";
import {ImageSelector, MarkupImage} from "@/components/image";

import type {PointerEvent} from "react";
import type {MarkupControl, Point2D} from "@/components/image";
import ImageMagnifier from "@/components/image/ImageMagnifier";

export default function Coords() {
    const sourceRef = createRef<HTMLTextAreaElement>();
    const [state, dispatch] = useReducer(CoordsState.reduce, null, CoordsState.initial);

    const handleSelected = useCallback((image: File) => {
        dispatch({
            kind: "set file",
            payload: image
        })
    }, [dispatch]);

    const markupMounted = useCallback((markup: MarkupControl) => {
        if (null == markup?.image) {
            dispatch({kind: "image unloaded"});
        } else {
            dispatch({
                kind: "image loaded",
                payload: markup.image
            });
        }
    }, [dispatch]);

    const markupPointerMove = useCallback((ev: PointerEvent<HTMLCanvasElement>) => {
        const {currentTarget: {parentElement}, pageX, pageY} = ev;
        const {offsetLeft, offsetTop} = parentElement!;
        dispatch({
            kind: "set focus",
            payload: [pageX - offsetLeft, pageY - offsetTop]
        })
    }, [dispatch]);

    const {file, focus, image} = state;
    return (
        null == file
            ? <ImageSelector onSelected={handleSelected}/>
            : (
                <>
                    <MarkupImage ref={markupMounted} src={file} onPointerMove={markupPointerMove}/>
                    {image && (<ImageMagnifier focus={focus} margin={16} image={image}/>)}
                    <textarea ref={sourceRef} rows={8} cols={120}/>
                </>
            )
    );
}
