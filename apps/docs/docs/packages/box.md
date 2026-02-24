---
title: box
description: The` @wonderlandlabs-pixi-ux/box` package
---
# @wonderlandlabs-pixi-ux/box

`box` helps you build predictable layout trees in Pixi when raw `x/y` arithmetic starts to get brittle.
It gives you measurable areas, alignment, and constraints so UI composition stays maintainable as screens grow.

It is based on the Dom concept of Flex-box. Elements in a Box tree have dimensions defined with width and height 
but all children are distributred inside their parents' container with alignment defintions, as rows and columns 
within the parent container. 

Absolute-positioned elements can be defined, but the utility of this system is to allow patterned layout; for example
in the Button module, with icons and labels in rows or columns inside the button root. 

Primary examples of utility for the Box system is a row and column table or a bar graph. Elements can be aligned 
using constraints to any edge of their parent box; sizes can be absolute in pixels, or fractional distribution based on
the size of the parent box. 

## Status

- Public API is `BoxTree` + BoxTree measurement/alignment utilities.

## Installation

```bash
yarn add @wonderlandlabs-pixi-ux/box
```

## Basic Usage (Pixi App)

```ts
import { Application } from 'pixi.js';
import {
  ALIGN,
  BoxTree,
  MEASUREMENT_MODE,
  boxTreeToPixi,
} from '@wonderlandlabs-pixi-ux/box';

async function main() {
  const app = new Application();
  await app.init({
    width: 900,
    height: 500,
    backgroundColor: 0x1a1d22,
  });
  document.body.appendChild(app.canvas);

  const layout = new BoxTree({
    value: {
      id: 'root',
      area: {
        x: 60,
        y: 50,
        width: { mode: MEASUREMENT_MODE.PX, value: 720 },
        height: { mode: MEASUREMENT_MODE.PX, value: 340 },
        px: 's',
        py: 's',
      },
      align: {
        x: ALIGN.START,
        y: ALIGN.START,
        direction: 'column',
      },
      children: {
        header: {
          id: 'header',
          area: {
            x: 0,
            y: 0,
            width: { mode: MEASUREMENT_MODE.PERCENT, value: 1 },
            height: { mode: MEASUREMENT_MODE.PX, value: 60 },
            px: 's',
            py: 's',
          },
          align: { x: 's', y: 's', direction: 'row' },
        },
        body: {
          id: 'body',
          area: {
            x: 0,
            y: 0,
            width: { mode: MEASUREMENT_MODE.PERCENT, value: 1 },
            height: { mode: MEASUREMENT_MODE.PERCENT, value: 1 },
            px: 's',
            py: 's',
          },
          align: { x: 's', y: 's', direction: 'row' },
        },
      },
    },
  });

  const graphics = await boxTreeToPixi(layout, {
    includeRoot: true,
    fill: 0x2d3a45,
    fillAlpha: 0.35,
    stroke: 0x8fd3ff,
    strokeAlpha: 0.9,
    strokeWidth: 2,
  });

  app.stage.addChild(graphics);
}

main();
```

## Public API

- `BoxTree`
- `createBoxTreeState`
- `resolveTreeMeasurement`
- `resolveMeasurementPx`
- `resolveConstraintValuePx`
- `applyAxisConstraints`
- `boxTreeToPixi`
- `boxTreeToSvg`
- `pathToString`, `pathString`, `combinePaths`
- `ALIGN`, `AXIS`, `MEASUREMENT_MODE`, `SIZE_MODE`, `SIZE_MODE_INPUT`

## Data Model

Use the exported BoxTree schemas/types in `src/types.boxtree.ts` and measurement schemas in `src/types.ts` as the source of truth.
