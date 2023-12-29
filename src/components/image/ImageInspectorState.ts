import {freeze, immerable, produce} from "immer";
import {Point2D} from "@/components/image/image-types";

/**
 * {@link ImageInspectorState} holds state for an {@link ImageInspector} component.
 */
export default class ImageInspectorState {
    [immerable] = true;

    /**
     * Anchored position. If non-`null`, focus will not be updated until the cursor position moves at least
     * {@link ANCHOR_MARGIN} pixels from this position.
     */
    anchor: null | Point2D = null;

    /**
     * Focused position.
     */
    focus: Point2D = [0, 0];

    private constructor() {
    }

    /**
     * Reducer for {@link ImageInspectorState} actions.
     *
     * @param previous the previous state.
     * @param action the action.
     */
    static reduce(previous: ImageInspectorState, action: ImageInspectorAction) {
        switch (action.kind) {
            case "position anchored":
                return produce(previous, draft => {
                    const {payload} = action;
                    draft.anchor = payload;
                    draft.focus = payload;
                });
            case "position updated":
                return produce(previous, draft => {
                    const {payload} = action;
                    const {anchor} = previous;
                    if (null == anchor) {
                        draft.focus = payload;
                    } else {
                        const [x, y] = payload;
                        const [anchorX, anchorY] = anchor;
                        if (Math.abs(x - anchorX) > ImageInspectorState.ANCHOR_MARGIN
                            || Math.abs(y - anchorY) > ImageInspectorState.ANCHOR_MARGIN) {
                            draft.anchor = null;
                            draft.focus = payload;
                        }
                    }
                });
        }
    }

    /**
     * Initial state.
     */
    static INITIAL = freeze(new ImageInspectorState());

    /**
     * Number of pixels the cursor must move before an anchor is released.
     *
     * @private
     */
    private static ANCHOR_MARGIN = 8;
}

/**
 * Cursor position anchored, by clicking on the image or hitting a nudge key.
 */
interface PositionAnchored {
    kind: "position anchored",
    payload: Point2D;
}

/**
 * Cursor position updated.
 */
interface PositionUpdated {
    kind: "position updated";
    payload: Point2D;
}

/**
 * Actions supported by {@link ImageInspectorState.INITIAL}.
 */
type ImageInspectorAction =
    | PositionAnchored
    | PositionUpdated;

