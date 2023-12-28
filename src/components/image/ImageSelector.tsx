import {ChangeEvent, useCallback} from "react";

interface ImageSelectorProps {
    onSelected: (image: File) => void;
}

export default function ImageSelector(props: ImageSelectorProps) {
    const {onSelected} = props;

    const handleChange = useCallback(({target: {files}}: ChangeEvent<HTMLInputElement>) => {
        if (1 === files?.length) {
            onSelected(files[0]);
        }
    }, [onSelected]);

    return (
        <input type="file"
               className="file-input w-full max-w-xs"
               accept="image/*"
               onChange={handleChange}/>
    );
}
