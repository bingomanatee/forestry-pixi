import { describe, expect, it, vi } from 'vitest';
import { CanvasTextMetrics, Text, type Application } from 'pixi.js';
import { BoxLeafStore } from '../src/BoxLeafStore';

type QueuedTick = {
  fn: () => void;
  context?: unknown;
};

const TEXT = 'ABCD';
const FONT_SIZE = 10;
const TEXT_HEIGHT_FACTOR = 1.2;
const PADDING_TOP = 3;
const PADDING_RIGHT = 2;
const PADDING_BOTTOM = 3;
const PADDING_LEFT = 2;

function createMockApplication(): { app: Application; flushTicker: () => void } {
  const queuedTicks: QueuedTick[] = [];

  const ticker = {
    addOnce(fn: () => void, context?: unknown) {
      queuedTicks.push({ fn, context });
    },
    remove() {
      // no-op in tests
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

describe('BoxLeafStore text metrics mock POC', () => {
  it('computes hug size from mocked text dimensions plus padding', () => {
    const textMetricsSpy = vi
      .spyOn(CanvasTextMetrics, 'measureText')
      .mockImplementation((text: string, style: { fontSize?: number }) => {
        const fontSize = style.fontSize ?? 13;
        return {
          width: text.length * fontSize,
          height: fontSize * 1.2,
        } as any;
      });

    const { app, flushTicker } = createMockApplication();
    const leaf = new BoxLeafStore({
      id: 'leaf-text-poc',
      xDef: { sizeMode: 'hug' },
      yDef: { sizeMode: 'hug' },
      padding: {
        top: PADDING_TOP,
        right: PADDING_RIGHT,
        bottom: PADDING_BOTTOM,
        left: PADDING_LEFT,
      },
    }, app);

    leaf.setContent(new Text({
      text: TEXT,
      style: { fontSize: FONT_SIZE, fontFamily: 'Arial' },
    }));

    leaf.kickoff();
    flushTicker();

    const expectedTextWidth = TEXT.length * FONT_SIZE;
    const expectedTextHeight = FONT_SIZE * TEXT_HEIGHT_FACTOR;
    const expectedWidth = expectedTextWidth + PADDING_LEFT + PADDING_RIGHT;
    const expectedHeight = expectedTextHeight + PADDING_TOP + PADDING_BOTTOM;

    expect(leaf.rect.width).toBeCloseTo(expectedWidth, 6);
    expect(leaf.rect.height).toBeCloseTo(expectedHeight, 6);

    leaf.cleanup();
    textMetricsSpy.mockRestore();
  });
});
