import {STYLE_VARIANT, type StyleVariant} from './constants';
import type {RgbColor, WindowStyle, PartialWindowStyle} from './types';
import styleVariantsJson from './styleVariants.json';

// Style variants loaded from JSON
export const STYLE_VARIANTS = styleVariantsJson as Record<StyleVariant, WindowStyle>;

// Default style reference
export const DEFAULT_STYLE = STYLE_VARIANTS[STYLE_VARIANT.DEFAULT];

/**
 * Deep merge two RGB colors - user color takes precedence
 */
function mergeColor(base: RgbColor, override?: RgbColor): RgbColor {
    if (!override) return base;
    return override;
}

/**
 * Blend user styles with a base style (variant or default).
 * User styles take precedence over base styles.
 */
export function blendStyles(
    baseStyle: WindowStyle,
    userStyle?: PartialWindowStyle
): WindowStyle {
    if (!userStyle) return baseStyle;
    
    return {
        backgroundColor: mergeColor(baseStyle.backgroundColor, userStyle.backgroundColor),
        titlebarBackgroundColor: mergeColor(baseStyle.titlebarBackgroundColor, userStyle.titlebarBackgroundColor),
        titlebarTextColor: mergeColor(baseStyle.titlebarTextColor, userStyle.titlebarTextColor),
        borderColor: userStyle.borderColor ?? baseStyle.borderColor,
        borderWidth: userStyle.borderWidth ?? baseStyle.borderWidth,
        selectedBorderColor: mergeColor(baseStyle.selectedBorderColor, userStyle.selectedBorderColor),
        selectedBorderWidth: userStyle.selectedBorderWidth ?? baseStyle.selectedBorderWidth,
        hoverBorderColor: userStyle.hoverBorderColor ?? baseStyle.hoverBorderColor,
        hoverBorderWidth: userStyle.hoverBorderWidth ?? baseStyle.hoverBorderWidth,
    };
}

/**
 * Get the resolved style for a window based on variant and user overrides.
 */
export function resolveWindowStyle(
    variant: StyleVariant = STYLE_VARIANT.DEFAULT,
    userStyle?: PartialWindowStyle
): WindowStyle {
    const baseStyle = STYLE_VARIANTS[variant] ?? DEFAULT_STYLE;
    return blendStyles(baseStyle, userStyle);
}

