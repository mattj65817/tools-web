import {useCallback, useEffect, useReducer, useState} from "react";
import {freeze} from "immer";
import _ from "lodash";
import ImageInspectorState from "./ImageInspectorState";
import ImageMagnifier from "./ImageMagnifier";

import type {PointerEvent} from "react";
import type {Point2D} from ".";

/**
 * Properties for an {@link ImageInspector} component.
 */
export interface ImageInspectorProps {
    src:
        | string
        | Blob
        | URL;
    onCoordinateEntered?: (point: Point2D) => void;
}

/**
 * {@link ImageInspector} displays an image on a canvas and displays a magnifier to allow for pixel-level selection.
 *
 * @param props the component properties.
 * @constructor
 */
export default function ImageInspector(props: ImageInspectorProps) {
    const [state, dispatch] = useReducer(ImageInspectorState.reduce, ImageInspectorState.INITIAL);
    const [image, setImage] = useState<ImageData>();
    const {onCoordinateEntered} = props;

    /* Handle cursor movement over the canvas. */
    const canvasPointerEvent = useCallback((ev: PointerEvent<HTMLCanvasElement>) => {
        const {currentTarget: {offsetLeft, offsetTop}, pageX, pageY} = ev;
        switch (ev.type) {
            case "pointerdown":
                dispatch({
                    kind: "position anchored",
                    payload: [pageX - offsetLeft, pageY - offsetTop]
                });
                break;
            case "pointermove":
                dispatch({
                    kind: "position updated",
                    payload: [pageX - offsetLeft, pageY - offsetTop]
                });
                break;
        }
    }, [dispatch]);

    /* Handle key down in the window. */
    const {focus} = state;
    useEffect(() => {
        const windowKeyDown = ({code}: KeyboardEvent) => {
            if ("NumpadEnter" === code) {
                if (null != onCoordinateEntered) {
                    onCoordinateEntered(focus);
                }
            } else if ("Numpad5" === code) {
                dispatch({
                    kind: "position anchored",
                    payload: focus
                });
            } else if (code in nudgeCodes) {

                /* Handle nudges. */
                const [nudgeX, nudgeY] = nudgeCodes[code];
                const {height: maxY, width: maxX} = image!;
                const [focusX, focusY] = focus;
                dispatch({
                    kind: "position anchored",
                    payload: [
                        Math.max(0, Math.min(maxX, focusX + nudgeX)),
                        Math.max(0, Math.min(maxY, focusY + nudgeY))
                    ]
                });
            }
        }
        window.addEventListener("keydown", windowKeyDown);
        return () => window.removeEventListener("keydown", windowKeyDown);
    }, [focus, image, onCoordinateEntered]);

    /* Load and draw the image when the canvas element is mounted. */
    const {src} = props;
    const canvasMounted = useCallback((canvas: HTMLCanvasElement) => {
        if (null != canvas) {

            /* Load and draw the image. */
            const img = new Image();
            img.onload = () => {
                const {height, width} = img;
                canvas.height = height;
                canvas.width = width;
                const context = canvas.getContext("2d")!;
                context.drawImage(img, 0, 0);
                setImage(context.getImageData(0, 0, width, height));
            };
            if (_.isString(src)) {
                img.src = src;
            } else if (src instanceof URL) {
                img.src = src.href;
            } else {
                const reader = new FileReader();
                reader.onloadend = ({target}: ProgressEvent<FileReader>) => {
                    img.src = target!.result as string;
                }
                reader.readAsDataURL(src);
            }
        }
    }, [src]);

    /* Render component body. */
    return (
        <>
            <div>
                <canvas ref={canvasMounted}
                        onPointerDown={canvasPointerEvent}
                        onPointerMove={canvasPointerEvent}/>
            </div>
            {image && (<ImageMagnifier focus={focus} margin={16} image={image}/>)}
        </>
    );
}

/**
 * Focus nudge increments corresponding to numeric keypad codes.
 */
const nudgeCodes = freeze<Record<string, Point2D>>({
    "Numpad1": [-1, 1],
    "Numpad2": [0, 1],
    "Numpad3": [1, 1],
    "Numpad4": [-1, 0],
    "Numpad6": [1, 0],
    "Numpad7": [-1, -1],
    "Numpad8": [0, -1],
    "Numpad9": [1, -1]
});
