import { TickerForest } from '@forestry-pixi/ticker-forest';
import { Application, Container, Graphics } from 'pixi.js';
import type { BoxState, BoxConfig, BoxStyle, BoxProps, RgbColor, ContentArea, Rect, Padding } from './types';

/**
 * BoxStore manages a rectangular box with:
 * - Container hierarchy: container → background + contentContainer
 * - contentContainer pivot changes based on alignment
 * - maskGraphics clips content to box bounds (optional via noMask)
 * - Custom render function and pointer event handling
 *
 * Constructor args:
 * - forestryProps: { rect, align, noMask } - state managed by Forestry
 * - boxProps: { style, render, onPointerDown } - non-state config
 * - rootProps: ContainerOptions for the root container
 */
export class BoxStore extends TickerForest<BoxState> {
    readonly id: string;

    #container: Container;
    #background: Graphics = new Graphics();
    #contentContainer: Container = new Container();

    /** Public mask graphics - by default a rect the same size as the box */
    maskGraphics: Graphics = new Graphics();

    // Non-state props
    #boxProps: BoxProps;

    constructor(config: BoxConfig, app: Application) {
        const { id, forestryProps, boxProps, rootProps } = config;

        super({
            value: {
                ...forestryProps,
                align: forestryProps.align ?? { horizontal: 'left', vertical: 'top' },
                isDirty: true,
            }
        }, app);

        this.id = id;
        this.#boxProps = boxProps ?? {};

        // Create root container with optional props
        this.#container = new Container({
            label: `box-${id}`,
            ...rootProps,
        });

        // Set position from rect
        this.#container.position.set(forestryProps.rect.x, forestryProps.rect.y);

        // Build container hierarchy
        this.#container.addChild(this.#background);
        this.#container.addChild(this.#contentContainer);
        this.#container.addChild(this.maskGraphics);

        // Setup pointer event if provided
        if (this.#boxProps.onPointerDown) {
            this.#container.eventMode = 'static';
            this.#container.on('pointerdown', (event) => {
                this.#boxProps.onPointerDown?.(event, this);
            });
        }

        // Initial mask setup (will be updated in resolve)
        this.#updateMask();
    }

    /**
     * Get the root container for this box
     */
    get container(): Container {
        return this.#container;
    }

    /**
     * Get the content container where child elements should be added
     */
    get contentContainer(): Container {
        return this.#contentContainer;
    }

    /**
     * Get the current rect from state
     */
    get rect(): Rect {
        return this.value.rect;
    }

    /**
     * Get the computed content area (after padding)
     */
    getContentArea(): ContentArea {
        const { rect, padding } = this.value;
        const p = padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
        return {
            x: p.left,
            y: p.top,
            width: rect.width - p.left - p.right,
            height: rect.height - p.top - p.bottom,
        };
    }

    /**
     * Update padding
     */
    setPadding(padding: Partial<Padding>): void {
        this.mutate(draft => {
            draft.padding = { ...draft.padding, ...padding } as Padding;
            draft.isDirty = true;
        });
        this.queueResolve();
    }

    /**
     * Update box rect (position and size)
     */
    setRect(rect: Partial<Rect>): void {
        this.mutate(draft => {
            draft.rect = { ...draft.rect, ...rect };
            draft.isDirty = true;
        });
        this.queueResolve();
    }

    /**
     * Update style (non-state, triggers re-render)
     */
    setStyle(style: Partial<BoxStyle>): void {
        this.#boxProps.style = { ...this.#boxProps.style, ...style };
        this.markDirty();
    }

    /**
     * Get current style
     */
    get style(): BoxStyle | undefined {
        return this.#boxProps.style;
    }

    #rgbToNumber(rgb: RgbColor): number {
        const r = Math.round(rgb.r * 255);
        const g = Math.round(rgb.g * 255);
        const b = Math.round(rgb.b * 255);
        return (r << 16) | (g << 8) | b;
    }

    #renderBackground(): void {
        const { rect } = this.value;
        const style = this.#boxProps.style;

        this.#background.clear();

        if (!style) return;

        const radius = style.borderRadius ?? 0;

        if (style.fill?.color) {
            const color = this.#rgbToNumber(style.fill.color);
            const alpha = style.fill.alpha ?? 1;
            this.#background.roundRect(0, 0, rect.width, rect.height, radius);
            this.#background.fill({ color, alpha });
        }

        if (style.stroke?.color && style.stroke.width) {
            const color = this.#rgbToNumber(style.stroke.color);
            const alpha = style.stroke.alpha ?? 1;
            const strokeWidth = style.stroke.width;
            this.#background.roundRect(0, 0, rect.width, rect.height, radius);
            this.#background.stroke({ color, alpha, width: strokeWidth });
        }
    }

    #updateMask(): void {
        const { rect, noMask } = this.value;

        this.maskGraphics.clear();

        if (noMask) {
            this.#contentContainer.mask = null;
            return;
        }

        // Draw mask rect same size as box
        this.maskGraphics.rect(0, 0, rect.width, rect.height);
        this.maskGraphics.fill(0xffffff);

        this.#contentContainer.mask = this.maskGraphics;
    }

    #updateContentPivot(): void {
        const { rect, align, padding } = this.value;
        const horizontal = align?.horizontal ?? 'left';
        const vertical = align?.vertical ?? 'top';
        const p = padding ?? { top: 0, right: 0, bottom: 0, left: 0 };

        // Content area after padding
        const contentArea = this.getContentArea();

        // Calculate pivot based on alignment
        // Pivot determines the origin point of the content container
        let pivotX = 0;
        let pivotY = 0;

        // Position content container based on alignment within padded area
        let posX = p.left;
        let posY = p.top;

        if (horizontal === 'center') {
            posX = p.left + contentArea.width / 2;
            pivotX = 0; // Content's left edge aligns to center
        } else if (horizontal === 'right') {
            posX = p.left + contentArea.width;
            pivotX = 0; // Content's left edge aligns to right
        }

        if (vertical === 'center') {
            posY = p.top + contentArea.height / 2;
            pivotY = 0;
        } else if (vertical === 'bottom') {
            posY = p.top + contentArea.height;
            pivotY = 0;
        }

        this.#contentContainer.pivot.set(pivotX, pivotY);
        this.#contentContainer.position.set(posX, posY);
    }

    protected isDirty(): boolean {
        return this.value.isDirty;
    }

    protected clearDirty(): void {
        this.set('isDirty', false);
    }

    /**
     * Mark this box as dirty to trigger re-render
     */
    markDirty(): void {
        this.set('isDirty', true);
        this.queueResolve();
    }

    protected resolve(): void {
        const { rect } = this.value;

        // Update container position
        this.#container.position.set(rect.x, rect.y);

        // Render background
        this.#renderBackground();

        // Update mask
        this.#updateMask();

        // Update content pivot/position based on alignment
        this.#updateContentPivot();

        // Call custom render if provided
        this.#boxProps.render?.(this);
    }

    cleanup(): void {
        super.cleanup();
        this.#container.destroy({ children: true });
    }
}

