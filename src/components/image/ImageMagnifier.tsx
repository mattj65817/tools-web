import {useCallback, useMemo} from "react";
import {freeze} from "immer";
import _ from "lodash";

import type {CSSProperties} from "react";
import type {Point2D} from ".";

/**
 * Properties for a {@link ImageMagnifier} component.
 */
interface ImageMagnifierProps {
    focus: Point2D;
    margin: number;
    image: ImageData;
}

/**
 * {@link ImageMagnifier} displays a grid of magnified pixels from an image.
 *
 * @param props the component properties.
 * @constructor
 */
export default function ImageMagnifier(props: ImageMagnifierProps) {
    const {focus: [focusX, focusY], margin, image} = props;
    const [count, size, offsetX, offsetY] = useMemo(() => [
            Math.pow(2 * margin + 1, 2),
            margin * 2 + 1,
            Math.max(0, focusX - margin),
            Math.max(0, focusY - margin)],
        [focusX, focusY, margin]);
    const gridStyle = useMemo<CSSProperties>(() => ({
        border: "1px solid silver",
        display: "inline-grid",
        gridTemplateColumns: `repeat(${size}, 0.5em)`,
        gridTemplateRows: `repeat(${size}, 0.5em)`
    }), [size]);

    /* Get the rgba() color of a pixel. */
    const getColor = useCallback(([x, y]: Point2D) => {
        const {data, width} = image;
        const offset = 4 * (x + y * width);
        return `rgba(${data[offset]}, ${data[offset + 1]}, ${data[offset + 2]}, ${data[offset + 3]})`;
    }, [image]);

    /* Render component body. */
    return (
        <div style={gridStyle}>
            {_.times(count, index => {
                const column = Math.floor(index % size);
                const row = Math.floor(index / size);
                const x = offsetX + column;
                const y = offsetY + row;
                return (
                    <div key={`magnifierPixel_${index}`}
                        style={{
                        ...(x === focusX && y === focusY ? focusedPixelBaseStyle : unfocusedPixelBaseStyle),
                        backgroundColor: getColor([x, y]),
                        gridRow: 1 + row,
                        gridColumn: 1 + column
                    }}/>
                );
            })}
        </div>
    );
}

/**
 * Base styles for the focused pixel.
 */
const focusedPixelBaseStyle = freeze<CSSProperties>({
    border: "1px solid red",
    height: "0.7em",
    left: "50%",
    position: "relative",
    top: "50%",
    transform: "translateX(-50%) translateY(-50%)",
    width: "0.7em"
});

/**
 * Base styles for pixels other than the focused pixel.
 */
const unfocusedPixelBaseStyle = freeze<CSSProperties>({
    borderBottom: "1px solid #f0f0f0",
    borderRight: "1px solid #f0f0f0",
});
