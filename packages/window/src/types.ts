import {z} from 'zod';
import {DIMENSION_TYPE, LOAD_STATUS, TITLEBAR_MODE, WINDOW_STATUS} from './constants';
import type {HandleMode} from '@forestry-pixi/resizer';

export const LoadStateSchema = z.enum([LOAD_STATUS.START, LOAD_STATUS.LOADED, LOAD_STATUS.ERROR]);

export const DimensionTypeSchema = z.enum([DIMENSION_TYPE.SIZE, DIMENSION_TYPE.SCALE]);
// Color schema for RGB values (0..1)
export const RgbColorSchema = z.object({
    r: z.number().min(0).max(1).default(1),
    g: z.number().min(0).max(1).default(1),
    b: z.number().min(0).max(1).default(1),
});

export type RgbColor = z.infer<typeof RgbColorSchema>;

export const PointSchema = z.object({
    x: z.number().default(0),
    y: z.number().default(0),
});

// Titlebar configuration
export const TitlebarConfigSchema = z.object({
    mode: z.enum([TITLEBAR_MODE.PERSISTENT, TITLEBAR_MODE.ON_HOVER]).default(TITLEBAR_MODE.PERSISTENT),
    height: z.number().min(0).default(30),
    backgroundColor: RgbColorSchema.default({r: 0.2, g: 0.2, b: 0.2}),
    title: z.string().default('Window'),
    isVisible: z.boolean().default(true),
    padding: z.number().default(2),
    showCloseButton: z.boolean().default(false),
    fontSize: z.number().min(0).default(14),
    textColor: RgbColorSchema.default({r: 0, g: 0, b: 0}),
    isDirty: z.boolean().default(true)
});

export type TitlebarConfig = z.infer<typeof TitlebarConfigSchema>;

// Window status schema
export const WindowStatusSchema = z.enum([
    WINDOW_STATUS.CLEAN,
    WINDOW_STATUS.DIRTY,
    WINDOW_STATUS.DELETED,
]);

export const RGB_BLACK = {r: 0, g: 0, b: 0};
export const RGB_WHITE = {r: 1, g: 1, b: 1}

export const RectSchema = z.object({
    x: z.number().default(0),
    y: z.number().default(0),
    width: z.number().min(0).default(200),
    height: z.number().min(0).default(200),
});

// Window definition schema
export const WindowDefSchema = z.object({
    id: z.string(),
    minWidth: z.number().min(0).optional(),
    minHeight: z.number().min(0).optional(),
    backgroundColor: RgbColorSchema.default({r: 0.1, g: 0.1, b: 0.1}),
    titlebar: TitlebarConfigSchema.default({
        mode: TITLEBAR_MODE.PERSISTENT,
        height: 30,
        backgroundColor: {r: 0.2, g: 0.2, b: 0.2},
        title: 'Window',
        padding: 2,
        fontSize: 14,
        textColor: RGB_BLACK,
        showCloseButton: false,
        isVisible: true,
        isDirty: true
    }),
    isResizeable: z.boolean().default(false),
    isDraggable: z.boolean().default(false),
    resizeMode: z.string().optional() as z.ZodType<HandleMode | undefined>,
    status: WindowStatusSchema.default(WINDOW_STATUS.CLEAN),
    zIndex: z.number().default(0),
    isDirty: z.boolean().default(true),
    contentClickable: z.boolean().default(false)
}).merge(RectSchema)

export type WindowDef = z.infer<typeof WindowDefSchema>;

// WindowsManager state schema
export const WindowStoreSchema = z.object({
    windows: z.map(z.string(), WindowDefSchema).default(new Map()),
    selected: z.set(z.string()).default(new Set()),
});

export type WindowStoreValue = z.infer<typeof WindowStoreSchema>;

export const ZIndexDataSchema = z.object({
    zIndex: z.number(),
    id: z.string(),
    zIndexFlat: z.number(),
    branch: z.unknown()
})

export type ZIndexData = z.infer<typeof ZIndexDataSchema>;

export const ImageSpriteSchema = z.object({
    url: z.string(),
    id: z.string().optional(),
    x: z.number().default(0),
    y: z.number().default(0),
    dimension: PointSchema.default({ x: 1, y: 1 }),
    dimensionType: DimensionTypeSchema.default(DIMENSION_TYPE.SCALE),
    mask: RectSchema.optional(),
    loadState: LoadStateSchema.optional(),
});

export type ImageSpriteProps = z.infer<typeof ImageSpriteSchema>;

export type Point = z.infer<typeof PointSchema>;