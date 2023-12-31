import {freeze, immerable, produce} from "immer";
import {Point2D} from "@/components/image";

export class CoordsState {
    [immerable] = true;

    public readonly focus: Point2D = [0, 0];

    private constructor(public readonly file: null | File, public readonly image: null | ImageData) {
    }

    static initial() {
        return freeze(new CoordsState(null, null));
    }

    static reduce(previous: CoordsState, action: CoordsAction) {
        switch (action.kind) {
            case "image loaded":
                return produce(previous, draft => {
                    draft.image = action.payload;
                });
            case "image unloaded":
                return produce(previous, draft => {
                    draft.image = null;
                });
            case "set file":
                return produce(previous, draft => {
                    draft.file = action.payload;
                });
            case "set focus":
                return produce(previous, draft => {
                    draft.focus = [...action.payload];
                });
        }
    }
}

interface ImageLoaded {
    kind: "image loaded";
    payload: ImageData;
}

interface ImageUnloaded {
    kind: "image unloaded";
}

interface SetFile {
    kind: "set file";
    payload: File;
}

interface SetFocus {
    kind: "set focus";
    payload: Point2D;
}

type CoordsAction =
    | ImageLoaded
    | ImageUnloaded
    | SetFile
    | SetFocus;
