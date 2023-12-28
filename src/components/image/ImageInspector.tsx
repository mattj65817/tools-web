import {createRef, useCallback, useEffect, useLayoutEffect, useState} from "react";
import {freeze} from "immer";
import _ from "lodash";
import CanvasMagnifier from "@/components/image/CanvasMagnifier";

import type {PointerEvent} from "react";
import type {CanvasRegion2D, Point2D} from "@/components/image";

/**
 * Properties for an {@link ImageInspector} component.
 */
export interface ImageInspectorProps {
    image:
        | string
        | Blob
        | URL;
}

/**
 * {@link ImageInspector} displays an image on a canvas and displays a magnifier to allow for pixel-level selection.
 *
 * @param props the component properties.
 * @constructor
 */
export default function ImageInspector(props: ImageInspectorProps) {
    const canvasRef = createRef<HTMLCanvasElement>();
    const [element, setElement] = useState<HTMLImageElement>();
    const [focus, setFocus] = useState<Point2D>([0, 0]);
    const [region, setRegion] = useState<CanvasRegion2D>();

    /* Handler to update focus when the cursor moves over the canvas. */
    const canvasPointerMove = useCallback((ev: PointerEvent<HTMLCanvasElement>) => {
        const {currentTarget: {offsetLeft, offsetTop}, pageX, pageY} = ev;
        setFocus([pageX - offsetLeft, pageY - offsetTop]);
    }, [setFocus]);

    /* Handle key-up in the document. */
    const documentKeyDown = useCallback(({code}: KeyboardEvent) => {
        if (code in numpadNudges) {
            const [nudgeX, nudgeY] = numpadNudges[code];
            const {height: maxY, width: maxX} = element!;
            setFocus(([x, y]) => [
                Math.max(0, Math.min(maxX, x + nudgeX)),
                Math.max(0, Math.min(maxY, y + nudgeY))
            ]);
        }
    }, [element, setFocus]);

    /* Effect to (re)load the image. */
    const {image} = props;
    useEffect(() => {
        const img = new Image();
        img.onload = () => setElement(img);
        if (_.isString(image)) {
            img.src = image;
        } else if (image instanceof URL) {
            img.src = image.href;
        } else {
            const reader = new FileReader();
            reader.onloadend = ({target}: ProgressEvent) => {
                if (null != target && "result" in target) {
                    img.src = target.result as string;
                }
            };
            reader.readAsDataURL(image);
        }
    }, [image, setElement]);

    /* Effect to draw the image on the canvas. */
    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (null != canvas && null != element) {
            const context = canvas.getContext("2d")!;
            if (null != context && context != region?.context) {
                context.drawImage(element, 0, 0);
                setRegion({
                    bounds: [0, 0, element.width, element.height],
                    context
                });
            }
            const {ownerDocument} = canvas;
            ownerDocument.addEventListener("keydown", documentKeyDown);
            return () => ownerDocument.removeEventListener("keydown", documentKeyDown);
        }
    }, [canvasRef, documentKeyDown, element, region, setRegion]);

    /* Render component body. */
    return (
        <div>
            <canvas ref={canvasRef}
                    height={element?.height || 0}
                    width={element?.width || 0}
                    onPointerMove={canvasPointerMove}/>
            {region && (<CanvasMagnifier focus={focus} margin={8} region={region}/>)}
        </div>
    );
}

/**
 * Focus nudge increments corresponding to numeric keypad codes.
 */
const numpadNudges = freeze<Record<string, Point2D>>({
    "Numpad1": [-1, 1],
    "Numpad2": [0, 1],
    "Numpad3": [1, 1],
    "Numpad4": [-1, 0],
    "Numpad6": [1, 0],
    "Numpad7": [-1, -1],
    "Numpad8": [0, -1],
    "Numpad9": [1, -1]
});
