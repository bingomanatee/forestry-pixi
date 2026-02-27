import { z } from 'zod';

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const HexColorSchema = z.string().regex(
  HEX_COLOR_REGEX,
  'Color must be a hex string like #000, #fff, or #1a2b3c',
);

export type HexColor = z.infer<typeof HexColorSchema>;

export const FontConventionSchema = z.object({
  size: z.number().min(0),
  color: HexColorSchema,
  family: z.string().min(1),
  alpha: z.number().min(0).max(1),
  visible: z.boolean(),
});

export type FontConvention = z.infer<typeof FontConventionSchema>;

export const FillConventionSchema = z.object({
  size: z.number().min(0),
  color: HexColorSchema,
  alpha: z.number().min(0).max(1),
  visible: z.boolean(),
});

export type FillConvention = z.infer<typeof FillConventionSchema>;

export const StrokeConventionSchema = z.object({
  size: z.number().min(0),
  color: HexColorSchema,
  alpha: z.number().min(0).max(1),
  visible: z.boolean(),
});

export type StrokeConvention = z.infer<typeof StrokeConventionSchema>;

export const StyleConventionSchema = z.object({
  font: FontConventionSchema,
  fill: FillConventionSchema,
  stroke: StrokeConventionSchema,
});

export type StyleConvention = z.infer<typeof StyleConventionSchema>;

export type PartialStyleConvention = {
  font?: Partial<FontConvention>;
  fill?: Partial<FillConvention>;
  stroke?: Partial<StrokeConvention>;
};

export const DEFAULT_FONT_CONVENTION: FontConvention = {
  size: 12,
  color: '#000000',
  family: 'Helvetica',
  alpha: 1,
  visible: true,
};

export const DEFAULT_FILL_CONVENTION: FillConvention = {
  size: 0,
  color: '#000000',
  alpha: 1,
  visible: true,
};

export const DEFAULT_STROKE_CONVENTION: StrokeConvention = {
  size: 1,
  color: '#000000',
  alpha: 1,
  visible: true,
};

export const DEFAULT_STYLE_CONVENTION: StyleConvention = {
  font: DEFAULT_FONT_CONVENTION,
  fill: DEFAULT_FILL_CONVENTION,
  stroke: DEFAULT_STROKE_CONVENTION,
};

type StyleTreeSetter = {
  set: (nouns: string, states: string[], value: unknown) => void;
};

function pathToString(path: string | string[]): string {
  if (typeof path === 'string') {
    return path;
  }
  return path.join('.');
}

export function normalizeStyleConvention(
  value: PartialStyleConvention = {},
): StyleConvention {
  return StyleConventionSchema.parse({
    font: { ...DEFAULT_FONT_CONVENTION, ...(value.font ?? {}) },
    fill: { ...DEFAULT_FILL_CONVENTION, ...(value.fill ?? {}) },
    stroke: { ...DEFAULT_STROKE_CONVENTION, ...(value.stroke ?? {}) },
  });
}

export function conventionKeys(path: string | string[]): string[] {
  const base = pathToString(path);
  return [
    `${base}.font.size`,
    `${base}.font.color`,
    `${base}.font.family`,
    `${base}.font.alpha`,
    `${base}.font.visible`,
    `${base}.fill.size`,
    `${base}.fill.color`,
    `${base}.fill.alpha`,
    `${base}.fill.visible`,
    `${base}.stroke.size`,
    `${base}.stroke.color`,
    `${base}.stroke.alpha`,
    `${base}.stroke.visible`,
  ];
}

export function setConvention(
  tree: StyleTreeSetter,
  path: string | string[],
  states: string[] = [],
  value: PartialStyleConvention = {},
): StyleConvention {
  const base = pathToString(path);
  const normalized = normalizeStyleConvention(value);

  tree.set(`${base}.font.size`, states, normalized.font.size);
  tree.set(`${base}.font.color`, states, normalized.font.color);
  tree.set(`${base}.font.family`, states, normalized.font.family);
  tree.set(`${base}.font.alpha`, states, normalized.font.alpha);
  tree.set(`${base}.font.visible`, states, normalized.font.visible);

  tree.set(`${base}.fill.size`, states, normalized.fill.size);
  tree.set(`${base}.fill.color`, states, normalized.fill.color);
  tree.set(`${base}.fill.alpha`, states, normalized.fill.alpha);
  tree.set(`${base}.fill.visible`, states, normalized.fill.visible);

  tree.set(`${base}.stroke.size`, states, normalized.stroke.size);
  tree.set(`${base}.stroke.color`, states, normalized.stroke.color);
  tree.set(`${base}.stroke.alpha`, states, normalized.stroke.alpha);
  tree.set(`${base}.stroke.visible`, states, normalized.stroke.visible);

  return normalized;
}
