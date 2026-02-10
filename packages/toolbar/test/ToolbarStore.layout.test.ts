import { describe, expect, it } from 'vitest';
import type { Application } from 'pixi.js';
import { fromJSON, type StyleTree } from '@forestry-pixi/style-tree';
import { ToolbarStore } from '../src/ToolbarStore';
import toolbarDefaultStyles from '../src/styles/toolbar.default.json';

type QueuedTick = {
  fn: () => void;
  context?: unknown;
};

const BUTTON_COUNT = 3;
const GAP = 8;
const CONTAINER_PADDING = 8;
const STYLE_TREE = fromJSON(toolbarDefaultStyles);

function getStyleNumber(
  styleTree: StyleTree,
  nouns: string[],
  states: string[] = []
): number {
  const value = styleTree.match({ nouns, states });
  if (typeof value !== 'number') {
    throw new Error(`Expected numeric style value for ${nouns.join('.')} with states [${states.join(',')}]`);
  }
  return value;
}

function createMockApplication(): { app: Application; flushTicker: () => void } {
  const queuedTicks: QueuedTick[] = [];

  const ticker = {
    addOnce(fn: () => void, context?: unknown) {
      queuedTicks.push({ fn, context });
    },
    remove() {
      // no-op for tests
    },
  };

  const app = { ticker } as unknown as Application;

  const flushTicker = () => {
    let guard = 0;
    while (queuedTicks.length > 0) {
      guard += 1;
      if (guard > 200) {
        throw new Error('Ticker flush exceeded safety limit');
      }
      const next = queuedTicks.shift()!;
      next.fn.call(next.context);
    }
  };

  return { app, flushTicker };
}

function createToolbar(orientation: 'horizontal' | 'vertical'): {
  toolbar: ToolbarStore;
  flushTicker: () => void;
} {
  const { app, flushTicker } = createMockApplication();

  const toolbar = new ToolbarStore({
    id: `toolbar-${orientation}`,
    orientation,
    spacing: GAP,
    padding: CONTAINER_PADDING,
    buttons: [
      { id: 'one', mode: 'iconVertical' },
      { id: 'two', mode: 'iconVertical' },
      { id: 'three', mode: 'iconVertical' },
    ],
  }, app);

  toolbar.kickoff();
  flushTicker();

  return { toolbar, flushTicker };
}

describe('ToolbarStore layout dimensions', () => {
  it('computes horizontal toolbar size from child widths, gaps, and padding', () => {
    const { toolbar } = createToolbar('horizontal');
    const [one, two, three] = toolbar.getButtons();
    const iconSizeX = getStyleNumber(STYLE_TREE, ['button', 'iconVertical', 'icon', 'size', 'x']);
    const iconSizeY = getStyleNumber(STYLE_TREE, ['button', 'iconVertical', 'icon', 'size', 'y']);
    const paddingX = getStyleNumber(STYLE_TREE, ['button', 'iconVertical', 'padding', 'x']);
    const paddingY = getStyleNumber(STYLE_TREE, ['button', 'iconVertical', 'padding', 'y']);
    const buttonWidth = iconSizeX + paddingX * 2;
    const buttonHeight = iconSizeY + paddingY * 2;

    expect(one.rect.width).toBe(buttonWidth);
    expect(two.rect.width).toBe(buttonWidth);
    expect(three.rect.width).toBe(buttonWidth);
    expect(one.rect.height).toBe(buttonHeight);

    expect(one.rect.x).toBe(0);
    expect(two.rect.x).toBe(buttonWidth + GAP);
    expect(three.rect.x).toBe((buttonWidth + GAP) * 2);

    const expectedWidth =
      BUTTON_COUNT * buttonWidth
      + (BUTTON_COUNT - 1) * GAP
      + CONTAINER_PADDING * 2;
    const expectedHeight = buttonHeight + CONTAINER_PADDING * 2;

    expect(toolbar.rect.width).toBe(expectedWidth);
    expect(toolbar.rect.height).toBe(expectedHeight);
  });

  it('computes vertical toolbar size from child heights, gaps, and padding', () => {
    const { toolbar } = createToolbar('vertical');
    const [one, two, three] = toolbar.getButtons();
    const iconSizeX = getStyleNumber(STYLE_TREE, ['button', 'iconVertical', 'icon', 'size', 'x']);
    const iconSizeY = getStyleNumber(STYLE_TREE, ['button', 'iconVertical', 'icon', 'size', 'y']);
    const paddingX = getStyleNumber(STYLE_TREE, ['button', 'iconVertical', 'padding', 'x']);
    const paddingY = getStyleNumber(STYLE_TREE, ['button', 'iconVertical', 'padding', 'y']);
    const buttonWidth = iconSizeX + paddingX * 2;
    const buttonHeight = iconSizeY + paddingY * 2;

    expect(one.rect.width).toBe(buttonWidth);
    expect(two.rect.width).toBe(buttonWidth);
    expect(three.rect.width).toBe(buttonWidth);
    expect(one.rect.height).toBe(buttonHeight);

    expect(one.rect.y).toBe(0);
    expect(two.rect.y).toBe(buttonHeight + GAP);
    expect(three.rect.y).toBe((buttonHeight + GAP) * 2);

    const expectedWidth = buttonWidth + CONTAINER_PADDING * 2;
    const expectedHeight =
      BUTTON_COUNT * buttonHeight
      + (BUTTON_COUNT - 1) * GAP
      + CONTAINER_PADDING * 2;

    expect(toolbar.rect.width).toBe(expectedWidth);
    expect(toolbar.rect.height).toBe(expectedHeight);
  });
});
