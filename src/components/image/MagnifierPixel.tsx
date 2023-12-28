import {type CSSProperties, useMemo} from "react";

interface MagnifierPixelProps {
    index: number;
    image: ImageData;
    focused: boolean;
}

export default function MagnifierPixel(props: MagnifierPixelProps) {
    const {focused, image, index} = props;
    const {width} = image;
    const pixelStyle = useMemo<CSSProperties>(() => ({
        backgroundColor: getColor(image, 4 * index),
        gridColumn: 1 + Math.floor(index % width),
        gridRow: 1 + Math.floor(index / width),
        ...(!focused ? {
            border: "1px solid #f0f0f0",
        } : {
            border: "1px solid red",
            height: "0.7em",
            left: "50%",
            position: "relative",
            top: "50%",
            transform: "translateX(-50%) translateY(-50%)",
            width: "0.7em"
        })
    }), [focused, image, index, width]);
    return (
        <div style={pixelStyle}/>
    );
}

function getColor(image: ImageData, offset: number) {
    const {data} = image;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const a = data[offset + 3];
    return `rgba(${r}, ${g}, ${b}, ${a})`;
    // return "#" + ("000000" + ((data[offset] << 16) | (data[offset + 1] << 8) | data[offset + 2]).toString(16)).slice(-6);
}
