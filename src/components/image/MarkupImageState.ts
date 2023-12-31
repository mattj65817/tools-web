import {freeze, immerable, produce} from "immer";

/**
 * {@link MarkupImageState} holds state for a `<MarkupImage/>` component.
 */
export default class MarkupImageState {
    [immerable] = true;

    image:
        | null
        | ImageData;

    private constructor() {
        this.image = null;
    }

    /**
     * Reducer for {@link MarkupImageAction} on a {@link MarkupImageState}.
     *
     * @param previous the previous state.
     * @param action the action.
     */
    static reduce(previous: MarkupImageState, action: MarkupImageAction) {
        switch (action.kind) {
            case "image loaded":
                return produce(previous, draft => {
                    draft.image = action.payload;
                });
            case "image unloaded":
                return produce(previous, draft => {
                    draft.image = null;
                });
        }
    }

    /**
     * Initial state.
     */
    static INITIAL = freeze(new MarkupImageState());
}

/**
 * Image data has been loaded into the `<img/>`.
 */
interface ImageLoaded {
    kind: "image loaded";
    payload: ImageData;
}

/**
 * Image data has been unloaded, meaning the `<img/>` element has been unmounted.
 */
interface ImageUnloaded {
    kind: "image unloaded";
}

/**
 * Actions supported by {@link MarkupImageState.reduce}.
 */
type MarkupImageAction =
    | ImageLoaded
    | ImageUnloaded;
