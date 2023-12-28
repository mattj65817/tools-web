import {freeze, immerable, produce} from "immer";

export class CoordsState {
    [immerable] = true;

    private constructor(public readonly image: null | File) {
    }

    static initial() {
        return freeze(new CoordsState(null));
    }

    static reduce(previous: CoordsState, action: CoordsAction) {
        switch (action.kind) {
            case "set file":
                return produce(previous, draft => {
                    draft.image = action.payload;
                });
        }
    }
}

interface SetFile {
    kind: "set file";
    payload: File;
}

type CoordsAction =
    | SetFile;
