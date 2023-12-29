import {useCallback, useEffect, useState} from "react";
import {freeze} from "immer";
import _ from "lodash";
import ImageMagnifier from "@/components/image/ImageMagnifier";

import type {PointerEvent} from "react";
import type {Point2D} from "@/components/image";

/**
 * Properties for an {@link ImageInspector} component.
 */
export interface ImageInspectorProps {
    src:
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
    const [focus, setFocus] = useState<Point2D>([0, 0]);
    const [image, setImage] = useState<ImageData>();

    /* Handle cursor movement over the canvas. */
    const canvasPointerMove = useCallback((ev: PointerEvent<HTMLCanvasElement>) => {
        const {currentTarget: {offsetLeft, offsetTop}, pageX, pageY} = ev;
        setFocus([pageX - offsetLeft, pageY - offsetTop]);
    }, [setFocus]);

    /* Handle key down in the window. */
    useEffect(() => {
        const windowKeyDown = ({code}: KeyboardEvent) => {
            if (code in nudgeCodes) {

                /* Handle nudges. */
                const [nudgeX, nudgeY] = nudgeCodes[code];
                const {height: maxY, width: maxX} = image!;
                setFocus(([x, y]) => [
                    Math.max(0, Math.min(maxX, x + nudgeX)),
                    Math.max(0, Math.min(maxY, y + nudgeY))
                ]);
            }
        }
        window.addEventListener("keydown", windowKeyDown);
        return () => window.removeEventListener("keydown", windowKeyDown);
    }, [image]);

    /* Load and draw the image when the canvas element is mounted. */
    const {src} = props;
    const canvasMounted = useCallback((canvas: HTMLCanvasElement) => {

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
    }, [src]);

    /* Render component body. */
    return (
        <div>
            <canvas ref={canvasMounted} onPointerMove={canvasPointerMove}/>
            {image && (<ImageMagnifier focus={focus} margin={8} image={image}/>)}
        </div>
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
