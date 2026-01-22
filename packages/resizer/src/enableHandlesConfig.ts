import { Rectangle } from "pixi.js";
import { Color } from "./types";

/**
 * Configuration for enableHandles
 */
export interface EnableHandlesConfig {
    /** Callback when drag is released */
    onRelease?: (rect: Rectangle) => void;
    /** Size of handles in pixels (default: 12) */
    size?: number;
    /** Handle color (default: blue) */
    color?: Color;
    /** Constrain aspect ratio (default: false) */
    constrain?: boolean;
}