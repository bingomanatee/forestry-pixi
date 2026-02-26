# Box Styles and Composition

This page documents how the default `BoxUxPixi` composes render layers and which style keys it reads.

Typical flow:

1. `root.styles = styles`
2. `root.assignUx((box) => new BoxUxPixi(box))`
3. `root.render()`

## Style Path Resolution

Each `BoxTree` node has:

- `styleName`
- `modeVerb[]`
- root-level `globalVerb[]`

When UX code resolves a style property:

1. Try hierarchical path + property, e.g. `button.icon.bgColor`
2. Try hierarchical object, e.g. `button.icon` then pick `bgColor`
3. Fallback to atomic path + property, e.g. `icon.bgColor`
4. Fallback to atomic object, e.g. `icon` then pick `bgColor`

State list is:

- `globalVerb + modeVerb`

## Default Style Keys

The default UX reads:

- `bgColor`
- `bgAlpha`
- `bgStrokeColor`
- `bgStrokeAlpha`
- `bgStrokeSize`

From resolved paths, this means keys like:

- `panel.bgColor`
- `button.icon.bgStrokeColor`
- `icon.bgStrokeSize`

## Composition Model

`BoxUxPixi` exposes:

- `content: MapEnhanced` (`Map<string, unknown>` subclass)
- `content.$box` for the owner node
- `getContainer(key): unknown` with keys:
  - `ROOT_CONTAINER`, `BACKGROUND_CONTAINER`, `CHILD_CONTAINER`, `CONTENT_CONTAINER`, `OVERLAY_CONTAINER`, `STROKE_CONTAINER`
- `attach(targetContainer?)` to mount root container to a parent (or `ux.app?.stage`)
- `generateStyleMap(box)` -> `{ fill: { color, alpha }, stroke: { color, alpha, width } }`

Default reserved layer keys:

- `BOX_RENDER_CONTENT_ORDER.BACKGROUND = 0`
- `BOX_RENDER_CONTENT_ORDER.CHILDREN = 50`
- `BOX_RENDER_CONTENT_ORDER.CONTENT = 75`
- `BOX_RENDER_CONTENT_ORDER.OVERLAY = 100`
- `BOX_UX_ORDER` map + `setUxOrder(name, zIndex)` + `getUxOrder(name)` for named custom layers

On every `render()`:

1. Default layers are pre-populated if missing
2. Child UX instances are updated
3. Child container is cleared and rebuilt from current child UX containers
4. Optional `box.content` is rendered into the `CONTENT` layer (`text` and image URL content)
5. Background/stroke are redrawn from styles
6. `content` is sorted by `zIndex` and non-empty items are attached to the root container

Render queueing is owned by `BoxTree` (store-level watcher), not by `BoxUxPixi`.

`BoxUxPixi` extends `BoxUxBase`; custom renderers can usually start from `BoxUxBase`
to reuse lifecycle patterns (`init`/`render`/`clear` and visible up/down flow).

## Built-in Layers

- `BACKGROUND`:
  - `Graphics`
  - draws fill from `bgColor`
- `CHILDREN`:
  - `Container`
  - receives child renderer containers each frame
- `CONTENT`:
  - `Container`
  - receives optional `box.content` rendering (`text` and image URL content)
- `OVERLAY`:
  - `Container`
  - contains stroke `Graphics` drawing from `bgStrokeColor` + `bgStrokeSize`

## Extending With Custom Layers

You can inject custom layers by setting additional `content` entries:

```ts
import { Graphics } from 'pixi.js';
import { BoxUxPixi } from '@wonderlandlabs-pixi-ux/box';

box.styles = styles;
const ux = new BoxUxPixi(box);
const custom = new Graphics();
custom.visible = true;

custom.zIndex = 76; // 75 is reserved for CONTENT
ux.content.set('CUSTOM', custom);
ux.box.render();
```

## Notes

- The default UX is intentionally simple: background + children + overlay stroke.
- If you need richer visuals, return a custom UX object from `assignUx`.
