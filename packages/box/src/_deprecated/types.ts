import { z } from 'zod';
import type { Container, ContainerOptions, FederatedPointerEvent, TextStyleOptions } from 'pixi.js';
import { SIZE_MODE, SIZE_MODE_INPUT } from '../constants';
import { dictToStringArray } from '../enumUtils';

// ==================== Size Mode ====================

export const SizeModeInputSchema = z.enum(dictToStringArray(SIZE_MODE_INPUT));
export type SizeModeInput = z.infer<typeof SizeModeInputSchema>;

export const SizeModeSchema = z.enum(dictToStringArray(SIZE_MODE));
export type SizeMode = z.infer<typeof SizeModeSchema>;

// ==================== Alignment ====================

export const AlignSchema = z.enum(['start', 'center', 'end']);
export type Align = z.infer<typeof AlignSchema>;

// ==================== Gap Mode ====================

export const GapModeSchema = z.enum(['between', 'before', 'after', 'all']);
export type GapMode = z.infer<typeof GapModeSchema>;

// ==================== Box Kind ====================

export const BoxKindSchema = z.enum(['leaf', 'list', 'text']);
export type BoxKind = z.infer<typeof BoxKindSchema>;

// ==================== Axis Definition ====================

export const AxisDefInputSchema = z.object({
    size: z.number().default(0),
    min: z.number().optional(),
    max: z.number().optional(),
    align: AlignSchema.default('start'),
    sizeMode: SizeModeInputSchema.default('px'),
});
export type AxisDefInput = z.input<typeof AxisDefInputSchema>;

export const AxisDefSchema = z.object({
    size: z.number().default(0),
    min: z.number().optional(),
    max: z.number().optional(),
    align: AlignSchema.default('start'),
    sizeMode: SizeModeSchema.default('px'),
});
export type AxisDef = z.infer<typeof AxisDefSchema>;

export function normalizeAxisDef(input: AxisDefInput): AxisDef {
    const parsed = AxisDefInputSchema.parse(input);
    if (parsed.sizeMode === SIZE_MODE_INPUT.FILL) {
        return { ...parsed, sizeMode: SIZE_MODE.PERCENT_FREE, size: 1 };
    }
    return parsed as AxisDef;
}

// ==================== Direction ====================

export const DirectionSchema = z.enum(['horizontal', 'vertical']);
export type Direction = z.infer<typeof DirectionSchema>;

// Legacy alignment types (for backward compatibility)
export const HorizontalAlignSchema = z.enum(['left', 'center', 'right']);
export type HorizontalAlign = z.infer<typeof HorizontalAlignSchema>;

export const VerticalAlignSchema = z.enum(['top', 'center', 'bottom']);
export type VerticalAlign = z.infer<typeof VerticalAlignSchema>;

// ==================== Measurements ====================

export const UnitSchema = z.enum(['px', '%']);
export type Unit = z.infer<typeof UnitSchema>;

export const MeasurementWithUnitSchema = z.object({
    value: z.number(),
    unit: UnitSchema,
});
export type MeasurementWithUnit = z.infer<typeof MeasurementWithUnitSchema>;

export const MeasurementSchema = z.union([
    z.number(),
    MeasurementWithUnitSchema,
]);
export type Measurement = z.infer<typeof MeasurementSchema>;

export const SizeConstraintSchema = z.object({
    base: MeasurementSchema,
    min: MeasurementSchema.optional(),
    max: MeasurementSchema.optional(),
});
export type SizeConstraint = z.infer<typeof SizeConstraintSchema>;

export const SizeValueSchema = z.union([
    z.number(),
    MeasurementWithUnitSchema,
    SizeConstraintSchema,
]);
export type SizeValue = z.infer<typeof SizeValueSchema>;

// ==================== Rect (legacy) ====================

export const RectSchema = z.object({
    x: z.number().default(0),
    y: z.number().default(0),
    width: z.number(),
    height: z.number(),
});
export type Rect = z.infer<typeof RectSchema>;

// ==================== Colors & Styles ====================

export const RgbColorSchema = z.object({
    r: z.number().min(0).max(1),
    g: z.number().min(0).max(1),
    b: z.number().min(0).max(1),
});
export type RgbColor = z.infer<typeof RgbColorSchema>;

export const FillStyleSchema = z.object({
    color: RgbColorSchema.optional(),
    alpha: z.number().min(0).max(1).optional(),
});
export type FillStyle = z.infer<typeof FillStyleSchema>;

export const StrokeStyleSchema = z.object({
    color: RgbColorSchema.optional(),
    alpha: z.number().min(0).max(1).optional(),
    width: z.number().optional(),
});
export type StrokeStyle = z.infer<typeof StrokeStyleSchema>;

export const BoxStyleSchema = z.object({
    fill: FillStyleSchema.optional(),
    stroke: StrokeStyleSchema.optional(),
    borderRadius: z.number().optional(),
});
export type BoxStyle = z.infer<typeof BoxStyleSchema>;

// ==================== Box Props (non-state config) ====================

export interface BoxProps {
    render?: (store: any) => void;
    onPointerDown?: (event: FederatedPointerEvent, store: any) => void;
}

// ==================== Padding ====================

export const PaddingSchema = z.object({
    top: z.number().default(0),
    right: z.number().default(0),
    bottom: z.number().default(0),
    left: z.number().default(0),
});
export type Padding = z.infer<typeof PaddingSchema>;

export function uniformPadding(value: number): Padding {
    return { top: value, right: value, bottom: value, left: value };
}

export function symmetricPadding(vertical: number, horizontal: number): Padding {
    return { top: vertical, right: horizontal, bottom: vertical, left: horizontal };
}

// ==================== Box Config ====================

export interface BaseBoxConfig {
    id: string;
    kind?: BoxKind;
    x?: number;
    y?: number;
    xDef?: AxisDefInput;
    yDef?: AxisDefInput;
    padding?: Partial<Padding>;
    style?: BoxStyle;
    noMask?: boolean;
    direction?: Direction;
    gap?: number;
    gapMode?: GapMode;
    text?: string;
    textStyle?: TextStyleOptions;
    children?: BaseBoxConfig[];
}

export const BaseBoxConfigSchema = z.object({
    id: z.string(),
    kind: BoxKindSchema.optional(),
    x: z.number().optional().default(0),
    y: z.number().optional().default(0),
    xDef: AxisDefInputSchema.optional(),
    yDef: AxisDefInputSchema.optional(),
    padding: PaddingSchema.partial().optional(),
    style: BoxStyleSchema.optional(),
    noMask: z.boolean().optional(),
    direction: DirectionSchema.optional(),
    gap: z.number().optional(),
    gapMode: GapModeSchema.optional(),
    text: z.string().optional(),
    textStyle: z.unknown().optional(),
    children: z.array(z.unknown()).optional(),
});

export type BoxConfig = BaseBoxConfig;

export const BoxLeafConfigSchema = BaseBoxConfigSchema.extend({
    kind: z.literal('leaf').optional(),
});
export type BoxLeafConfig = BaseBoxConfig;

export const BoxListConfigSchema = BaseBoxConfigSchema.extend({
    kind: z.literal('list').optional(),
    direction: DirectionSchema.optional(),
    gap: z.number().optional(),
    gapMode: GapModeSchema.optional(),
    children: z.array(z.unknown()).optional(),
});
export type BoxListConfig = BaseBoxConfig;

// ==================== Box State ====================

export interface BoxState {
    id: string;
    kind: BoxKind;

    x: number;
    y: number;

    width: number;
    height: number;

    xDef: AxisDef;
    yDef: AxisDef;

    padding: Padding;
    style?: BoxStyle;
    noMask: boolean;

    direction: Direction;
    gap: number;
    gapMode: GapMode;

    text: string;
    textStyle?: TextStyleOptions;

    children: Record<string, BoxState>;
    childOrder: string[];

    isDirty: boolean;
}

export interface BoxListState extends BoxState {
    kind: 'list';
}

export function createBoxState(config: BaseBoxConfig): BoxState {
    const xDef = normalizeAxisDef({
        size: config.xDef?.size ?? 0,
        align: config.xDef?.align ?? 'start',
        sizeMode: config.xDef?.sizeMode ?? SIZE_MODE.PX,
        min: config.xDef?.min,
        max: config.xDef?.max,
    });

    const yDef = normalizeAxisDef({
        size: config.yDef?.size ?? 0,
        align: config.yDef?.align ?? 'start',
        sizeMode: config.yDef?.sizeMode ?? SIZE_MODE.PX,
        min: config.yDef?.min,
        max: config.yDef?.max,
    });

    const padding: Padding = {
        top: config.padding?.top ?? 0,
        right: config.padding?.right ?? 0,
        bottom: config.padding?.bottom ?? 0,
        left: config.padding?.left ?? 0,
    };

    const children: Record<string, BoxState> = {};
    const childOrder: string[] = [];
    if (Array.isArray(config.children)) {
        for (const childConfig of config.children) {
            const childState = createBoxState(childConfig);
            children[childState.id] = childState;
            childOrder.push(childState.id);
        }
    }

    return {
        id: config.id,
        kind: config.kind ?? (config.text !== undefined ? 'text' : 'leaf'),
        x: config.x ?? 0,
        y: config.y ?? 0,
        width: xDef.size,
        height: yDef.size,
        xDef,
        yDef,
        padding,
        style: config.style,
        noMask: config.noMask ?? false,
        direction: config.direction ?? 'horizontal',
        gap: config.gap ?? 0,
        gapMode: config.gapMode ?? 'between',
        text: config.text ?? '',
        textStyle: config.textStyle,
        children,
        childOrder,
        isDirty: true,
    };
}

// ==================== Legacy types ====================

export const ForestryPropsSchema = z.object({
    rect: RectSchema,
    align: z.object({
        horizontal: HorizontalAlignSchema.default('left'),
        vertical: VerticalAlignSchema.default('top'),
    }).optional(),
    padding: PaddingSchema.optional(),
    noMask: z.boolean().optional(),
});
export type ForestryProps = z.infer<typeof ForestryPropsSchema>;

export interface LegacyBoxConfig {
    id: string;
    forestryProps: ForestryProps;
    boxProps?: BoxProps;
    rootProps?: ContainerOptions;
}

// ==================== Computed Content Area ====================

export interface ContentArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

// ==================== Measurement Helpers ====================

export function resolveMeasurement(measurement: Measurement | undefined, parentSize: number): number {
    if (measurement === undefined) return 0;
    if (typeof measurement === 'number') return measurement;
    if (measurement.unit === 'px') return measurement.value;
    if (measurement.unit === '%') return (measurement.value / 100) * parentSize;
    return 0;
}

export function resolveSizeValue(size: SizeValue, parentSize: number): number {
    if (typeof size === 'number') return size;
    if ('value' in size && 'unit' in size) {
        return resolveMeasurement(size, parentSize);
    }
    const base = resolveMeasurement(size.base, parentSize);
    const min = size.min !== undefined ? resolveMeasurement(size.min, parentSize) : -Infinity;
    const max = size.max !== undefined ? resolveMeasurement(size.max, parentSize) : Infinity;
    return Math.max(min, Math.min(max, base));
}
