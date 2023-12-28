import {CSSProperties, useMemo} from "react";
import _ from "lodash";
import MagnifierPixel from "@/components/image/MagnifierPixel";

import type {CanvasRegion2D, Point2D} from "@/components/image";

interface MagnifierProps {
    focus: Point2D;
    margin: number;
    region: CanvasRegion2D;
}

export default function CanvasMagnifier(props: MagnifierProps) {
    const {focus: [focusX, focusY], margin, region: {bounds: [minX, minY, maxX, maxY], context}} = props;
    const size = margin * 2 + 1;
    const gridStyle = useMemo<CSSProperties>(() => ({
        border: "1px solid silver",
        display: "inline-grid",
        gridTemplateColumns: `repeat(${size}, 0.5em)`,
        gridTemplateRows: `repeat(${size}, 0.5em)`
    }), [size]);
    const image = useMemo<ImageData>(() =>
            context.getImageData(Math.max(minX, focusX - margin),
                Math.max(minY, focusY - margin),
                Math.min(size, maxX - focusX),
                Math.min(size, maxY - focusY)),
        [context, focusX, focusY, margin, maxX, maxY, minX, minY, size]);
    const {height, width} = image;
    const count = height * width;
    return (
        <div style={gridStyle}>
            {_.times(count, index => (
                <MagnifierPixel
                    key={`pixel_${index}`}
                    focused={index === Math.floor(count / 2)}
                    image={image}
                    index={index}/>
            ))}
        </div>
    );
}
