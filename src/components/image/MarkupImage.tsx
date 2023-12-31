import {
    DOMAttributes,
    forwardRef,
    PropsWithChildren,
    useCallback,
    useImperativeHandle,
    useMemo,
    useReducer
} from "react";
import {freeze} from "immer";
import _ from "lodash";
import MarkupImageState from "./MarkupImageState";

import type {CSSProperties, SyntheticEvent} from "react";
import type {Point2D} from "./image-types";

/**
 * Properties for a {@link MarkupImage} component.
 */
interface MarkupImageProps {
    elements?:
        | MarkupElement[];
    src:
        | string
        | Blob
        | URL;
    onPointerDown?: DOMAttributes<HTMLCanvasElement>["onPointerDown"];
    onPointerMove?: DOMAttributes<HTMLCanvasElement>["onPointerMove"];
}

export interface MarkupControl {
    image?: ImageData;
}

interface Line {
    kind: "line",
    from: Point2D;
    lineWidth?: CanvasPathDrawingStyles["lineWidth"];
    strokeStyle?: CanvasFillStrokeStyles["strokeStyle"];
    to: Point2D;
}

type MarkupElement =
    | Line;

/**
 * {@link MarkupImage} displays an `<img/>` element with a `<canvas/>` element overlay for adding dynamic markup.
 *
 * @param props the component properties.
 * @constructor
 */
const MarkupImage =
    forwardRef<MarkupControl, PropsWithChildren<MarkupImageProps>>(function MarkupImage(props, ref) {
        const [state, dispatch] = useReducer(MarkupImageState.reduce, MarkupImageState.INITIAL);
        const canvasHandlers = _.pick(props, "onPointerMove");
        const outsideWrapperStyle = useMemo(() =>
            freeze<CSSProperties>(_.assign({}, null == state.image ? {
                display: "none"
            } : {
                display: "inline-block",
                height: state.image!.height,
                width: state.image!.width
            })), [state.image]);
        useImperativeHandle(ref, () => freeze({
            ...(null == state.image ? {} : {image: state.image})
        }), [state.image]);

        /* Handler to get pixel data when the image is loaded. */
        const imageLoad = useCallback(({currentTarget: img}: SyntheticEvent<HTMLImageElement>) => {
            const {height, width} = img;
            const context = new OffscreenCanvas(width, height).getContext("2d")!;
            context.drawImage(img, 0, 0, width, height);
            dispatch({
                kind: "image loaded",
                payload: context.getImageData(0, 0, width, height)
            });
        }, []);

        /* Handler to load the image when the element is mounted. */
        const {src} = props;
        const imageMounted = useCallback((img: HTMLImageElement) => {
            if (null == img) {
                dispatch({kind: "image unloaded"});
            } else {
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

        /* Handler to draw markup elements when the <canvas/> is mounted. */
        const {elements} = props;
        const canvasMounted = useCallback((canvas: HTMLCanvasElement) => {
            if (null != canvas && null != elements && 0 !== elements.length) {
                const context = canvas.getContext("2d")!;
                elements.forEach(element => drawElement(context, element));
            }
        }, [elements])

        /* Component body. */
        const {children} = props;
        const {image} = state;
        return (
            <div style={outsideWrapperStyle}>
                <div style={insideWrapperStyle}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img ref={imageMounted} style={imageStyle} alt="Markup image" onLoad={imageLoad}/>
                    {image && (
                        <canvas ref={canvasMounted}
                                height={image.height}
                                width={image.width}
                                style={canvasStyle}
                                {...canvasHandlers}/>
                    )}
                </div>
            </div>
        );
    });

export default MarkupImage;

/**
 * Draw a markup element.
 *
 * @param context the context on which to draw.
 * @param element the element.
 */
function drawElement(context: CanvasRenderingContext2D, element: MarkupElement) {
    if ("strokeStyle" in element && null != element.strokeStyle) {
        context.strokeStyle = element.strokeStyle;
    }
    if ("lineWidth" in element && null != element.lineWidth) {
        context.lineWidth = element.lineWidth;
    }
    switch (element.kind) {
        case "line":
            context.moveTo(...element.from);
            context.lineTo(...element.to);
            context.stroke();
            break;
    }
}

/**
 * Styles for the markup <canvas/>.
 */
const canvasStyle = freeze<CSSProperties>({
    left: 0,
    position: "absolute",
    top: 0
});

/**
 * Styles for the <img/>.
 */
const imageStyle = freeze<CSSProperties>({
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%"
});

/**
 * Styles for the inner wrapper <div/>.
 */
const insideWrapperStyle = freeze<CSSProperties>({
    display: "inline-block",
    height: "100%",
    position: "relative",
    width: "100%",
});
