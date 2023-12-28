/**
 * Single point on a 2D coordinate space.
 */
export type Point2D = [x: number, y: number];

/**
 * Rectangle on a 2D coordinate space.
 */
export type Rect2D = [x: number, y: number, w: number, h: number];

/**
 * Bounded region within a 2D canvas.
 */
export interface CanvasRegion2D {
    bounds: Rect2D;
    context:
        | CanvasRenderingContext2D
        | OffscreenCanvasRenderingContext2D;
}
