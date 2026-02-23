import { StoreParams } from '@wonderlandlabs/forestry4';
import { TickerForest } from '@wonderlandlabs-pixi-ux/ticker-forest/dist/TickerForest';
import {
    Application,
    Container,
    Graphics,
    Text,
    TextStyle,
    type ContainerOptions,
    type FederatedPointerEvent,
    type Sprite,
    type TextStyleOptions,
} from 'pixi.js';
import { distinctUntilChanged, map, Subscription } from 'rxjs';
import type {
    AxisDef,
    BaseBoxConfig,
    BoxProps,
    BoxState,
    BoxStyle,
    ContentArea,
    Padding,
    RgbColor,
} from './types';
import { createBoxState } from './types';
import { SIZE_MODE } from '../constants';
import { pathToString } from '../pathUtils';

export class BoxStore extends TickerForest<BoxState> {
    readonly id: string;

    protected _container: Container;
    protected _background: Graphics = new Graphics();
    protected _contentContainer: Container = new Container();

    maskGraphics: Graphics = new Graphics();

    protected _boxProps: BoxProps;

    #leafContent: Graphics | Sprite | Text | Container | null = null;
    #textDisplay: Text | null = null;

    #children: Map<string, BoxStore> = new Map();
    #childrenStateSubscription?: Subscription;

    constructor(
        configOrParams: BaseBoxConfig | StoreParams<BoxState>,
        app: Application,
        boxProps?: BoxProps,
        rootProps?: ContainerOptions,
    ) {
        const params: StoreParams<BoxState> = BoxStore.#isStoreParams(configOrParams)
            ? configOrParams
            : { value: createBoxState(configOrParams) };
        super(params, { app });

        this.id = this.value.id;
        this._boxProps = boxProps ?? {};

        this._container = new Container({
            label: `box-${this.id}`,
            ...rootProps,
        });

        this._container.position.set(this.value.x, this.value.y);

        this._container.addChild(this._background);
        this._container.addChild(this._contentContainer);
        this._container.addChild(this.maskGraphics);

        this.#syncPointerInteractivity();

        if (this.value.kind === 'text') {
            this.#ensureTextDisplay();
        }

        this._updateMask();
        this.#syncChildBranchesFromState();
        this.#setupChildrenStateSubscription();
    }

    static #isStoreParams(value: unknown): value is StoreParams<BoxState> {
        if (!value || typeof value !== 'object') {
            return false;
        }
        if (!Object.prototype.hasOwnProperty.call(value, 'value')) {
            return false;
        }
        const obj = value as Record<string, unknown>;
        return 'parent' in obj || 'path' in obj || 'schema' in obj || 'branchParams' in obj;
    }

    get container(): Container {
        return this._container;
    }

    get contentContainer(): Container {
        return this._contentContainer;
    }

    get rect(): { x: number; y: number; width: number; height: number } {
        const { x, y, width, height } = this.value;
        return { x, y, width, height };
    }

    get xDef(): AxisDef {
        return this.value.xDef;
    }

    get yDef(): AxisDef {
        return this.value.yDef;
    }

    get children(): readonly BoxStore[] {
        this.#syncChildBranchesFromState();
        return this.value.childOrder
            .map((id) => this.#children.get(id))
            .filter((child): child is BoxStore => !!child);
    }

    get style(): BoxStyle | undefined {
        return this.value.style;
    }

    setStyle(style: Partial<BoxStyle>): void {
        this.mutate((draft) => {
            draft.style = { ...(draft.style ?? {}), ...style };
            draft.isDirty = true;
        });
        this.queueResolve();
    }

    get gap(): number {
        return this.value.gap;
    }

    setGap(gap: number): void {
        if (this.value.gap === gap) return;
        this.mutate((draft) => {
            draft.gap = gap;
            draft.isDirty = true;
        });
        this.queueResolve();
    }

    get direction(): 'horizontal' | 'vertical' {
        return this.value.direction;
    }

    setDirection(direction: 'horizontal' | 'vertical'): void {
        if (this.value.direction === direction) return;
        this.mutate((draft) => {
            draft.direction = direction;
            draft.isDirty = true;
        });
        this.queueResolve();
    }

    get gapMode(): 'between' | 'before' | 'after' | 'all' {
        return this.value.gapMode;
    }

    setGapMode(gapMode: 'between' | 'before' | 'after' | 'all'): void {
        if (this.value.gapMode === gapMode) return;
        this.mutate((draft) => {
            draft.gapMode = gapMode;
            draft.isDirty = true;
        });
        this.queueResolve();
    }

    get text(): string {
        return this.value.text;
    }

    get textDisplay(): Text | null {
        return this.#textDisplay;
    }

    setText(text: string): void {
        if (this.value.text === text) return;
        this.mutate((draft) => {
            draft.text = text;
            draft.isDirty = true;
        });
        this.queueResolve();
    }

    setTextStyle(style: TextStyleOptions): void {
        this.mutate((draft) => {
            draft.textStyle = { ...(draft.textStyle ?? {}), ...style };
            draft.isDirty = true;
        });
        this.queueResolve();
    }

    setPadding(padding: Partial<Padding>): void {
        const current = this.value.padding;
        const next: Padding = {
            top: padding.top ?? current.top,
            right: padding.right ?? current.right,
            bottom: padding.bottom ?? current.bottom,
            left: padding.left ?? current.left,
        };

        if (
            next.top === current.top
            && next.right === current.right
            && next.bottom === current.bottom
            && next.left === current.left
        ) {
            return;
        }

        this.mutate((draft) => {
            draft.padding = next;
            draft.isDirty = true;
        });
        this.queueResolve();
    }

    setPosition(x: number, y: number): void {
        const { x: currentX, y: currentY } = this.value;
        if (x === currentX && y === currentY) return;

        this.mutate((draft) => {
            draft.x = x;
            draft.y = y;
            draft.isDirty = true;
        });
        this.queueResolve();
    }

    setSize(width: number, height: number): void {
        const { width: currentWidth, height: currentHeight } = this.value;
        if (width === currentWidth && height === currentHeight) return;

        this.mutate((draft) => {
            draft.width = width;
            draft.height = height;
            draft.xDef = { ...draft.xDef, size: width };
            draft.yDef = { ...draft.yDef, size: height };
            draft.isDirty = true;
        });
        this.queueResolve();
    }

    getContentArea(): ContentArea {
        const { width, height, padding } = this.value;
        const p = padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
        return {
            x: p.left,
            y: p.top,
            width: width - p.left - p.right,
            height: height - p.top - p.bottom,
        };
    }

    setContent(content: Graphics | Sprite | Text | Container | null): void {
        if (this.value.kind === 'list') {
            throw new Error('Cannot set leaf content on list box');
        }

        if (this.#leafContent) {
            this._contentContainer.removeChild(this.#leafContent);
        }

        this.#leafContent = content;

        if (content) {
            this._contentContainer.addChild(content);
        }

        this.markDirty();
    }

    get content(): Graphics | Sprite | Text | Container | null {
        return this.#leafContent;
    }

    addChild(config: BaseBoxConfig): BoxStore {
        if (this.value.kind !== 'list') {
            throw new Error(`addChild requires list kind; got ${this.value.kind}`);
        }

        const childState = createBoxState(config);
        if (this.value.children[childState.id]) {
            throw new Error(`Child ${childState.id} already exists on ${this.id}`);
        }

        this.mutate((draft) => {
            draft.children[childState.id] = childState;
            draft.childOrder.push(childState.id);
            draft.isDirty = true;
        });

        const child = this.$br.$add<BoxState, BoxStore>(
            ['children', childState.id],
            { subclass: BoxStore },
            this.application!,
        );

        this.#registerChildBranch(child);
        child.kickoff();
        this.queueResolve();

        return child;
    }

    removeChild(childOrId: string | BoxStore): void {
        const id = typeof childOrId === 'string' ? childOrId : childOrId.value.id;
        const child = this.#children.get(id);

        if (!this.value.children[id]) {
            return;
        }

        if (child) {
            this.#unregisterChildBranch(id);
            if (child.container.parent === this._contentContainer) {
                this._contentContainer.removeChild(child.container);
            }
            child.cleanup();
            this.$br.delete(pathToString(['children', id]));
        }

        this.mutate((draft) => {
            delete draft.children[id];
            draft.childOrder = draft.childOrder.filter((childId: string) => childId !== id);
            draft.isDirty = true;
        });

        this.queueResolve();
    }

    getChild(id: string): BoxStore | undefined {
        this.#syncChildBranchesFromState();
        return this.#children.get(id);
    }

    toConfig(): BaseBoxConfig {
        const v = this.value;
        const children = v.childOrder
            .map((id) => this.#children.get(id))
            .filter((child): child is BoxStore => !!child)
            .map((child) => child.toConfig());

        return {
            id: v.id,
            kind: v.kind,
            x: v.x,
            y: v.y,
            xDef: v.xDef,
            yDef: v.yDef,
            padding: v.padding,
            style: v.style,
            noMask: v.noMask,
            direction: v.direction,
            gap: v.gap,
            gapMode: v.gapMode,
            text: v.text,
            textStyle: v.textStyle,
            children,
        };
    }

    protected _rgbToNumber(rgb: RgbColor): number {
        const r = Math.round(rgb.r * 255);
        const g = Math.round(rgb.g * 255);
        const b = Math.round(rgb.b * 255);
        return (r << 16) | (g << 8) | b;
    }

    protected _renderBackground(): void {
        const { width, height, style } = this.value;

        this._background.clear();

        if (!style) return;

        const radius = style.borderRadius ?? 0;

        if (style.fill?.color) {
            const color = this._rgbToNumber(style.fill.color);
            const alpha = style.fill.alpha ?? 1;
            this._background.roundRect(0, 0, width, height, radius);
            this._background.fill({ color, alpha });
        }

        if (style.stroke?.color && style.stroke.width) {
            const color = this._rgbToNumber(style.stroke.color);
            const alpha = style.stroke.alpha ?? 1;
            const strokeWidth = style.stroke.width;
            this._background.roundRect(0, 0, width, height, radius);
            this._background.stroke({ color, alpha, width: strokeWidth });
        }
    }

    protected _updateMask(): void {
        const { width, height, noMask } = this.value;

        this.maskGraphics.clear();

        if (noMask) {
            this._contentContainer.mask = null;
            return;
        }

        this.maskGraphics.rect(0, 0, width, height);
        this.maskGraphics.fill(0xffffff);

        this._contentContainer.mask = this.maskGraphics;
    }

    protected _updateContentPosition(): void {
        const { padding } = this.value;
        const p = padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
        this._contentContainer.position.set(p.left, p.top);
    }

    protected isDirty(): boolean {
        return this.value.isDirty;
    }

    protected clearDirty(): void {
        this.set('isDirty', false);
    }

    markDirty(): void {
        this.set('isDirty', true);
        this.queueResolve();
    }

    protected resolve(): void {
        this.#syncChildBranchesFromState();

        if (this.value.kind === 'list') {
            this.#layoutChildren();
        } else {
            this.#resolveLeafOrTextNode();
        }

        const { x, y } = this.value;

        this._container.position.set(x, y);
        this._renderBackground();
        this._updateMask();
        this._updateContentPosition();

        this._boxProps.render?.(this);
    }

    #syncPointerInteractivity(): void {
        this._container.removeAllListeners('pointerdown');
        if (this._boxProps.onPointerDown) {
            this._container.eventMode = 'static';
            this._container.on('pointerdown', (event: FederatedPointerEvent) => {
                this._boxProps.onPointerDown?.(event, this);
            });
            return;
        }
        this._container.eventMode = 'auto';
    }

    #ensureTextDisplay(): void {
        if (!this.#textDisplay) {
            this.#textDisplay = new Text({
                text: this.value.text,
                style: new TextStyle(this.value.textStyle ?? { fontSize: 16, fill: 0xffffff }),
            });
            this._contentContainer.addChild(this.#textDisplay);
            return;
        }

        if (this.#textDisplay.text !== this.value.text) {
            this.#textDisplay.text = this.value.text;
        }
        this.#textDisplay.style = new TextStyle(this.value.textStyle ?? { fontSize: 16, fill: 0xffffff });
    }

    #getDisplayForSizingAndAlignment(): Graphics | Sprite | Text | Container | null {
        if (this.value.kind === 'text') {
            this.#ensureTextDisplay();
            return this.#textDisplay;
        }
        return this.#leafContent;
    }

    #getDisplaySize(display: Graphics | Sprite | Text | Container): { width: number; height: number } {
        const bounds = display.getBounds();
        return { width: bounds.width, height: bounds.height };
    }

    #resolveLeafOrTextNode(): void {
        const display = this.#getDisplayForSizingAndAlignment();
        if (!display) {
            return;
        }

        const { xDef, yDef, padding } = this.value;
        const p = padding ?? { top: 0, right: 0, bottom: 0, left: 0 };

        if (xDef.sizeMode === SIZE_MODE.HUG || yDef.sizeMode === SIZE_MODE.HUG) {
            const contentSize = this.#getDisplaySize(display);
            const nextWidth = contentSize.width + p.left + p.right;
            const nextHeight = contentSize.height + p.top + p.bottom;
            const shouldUpdateWidth = xDef.sizeMode === SIZE_MODE.HUG && this.value.width !== nextWidth;
            const shouldUpdateHeight = yDef.sizeMode === SIZE_MODE.HUG && this.value.height !== nextHeight;

            if (shouldUpdateWidth || shouldUpdateHeight) {
                this.mutate((draft) => {
                    if (shouldUpdateWidth) {
                        draft.width = nextWidth;
                        draft.xDef = { ...draft.xDef, size: nextWidth };
                    }
                    if (shouldUpdateHeight) {
                        draft.height = nextHeight;
                        draft.yDef = { ...draft.yDef, size: nextHeight };
                    }
                });
            }
        }

        const contentArea = this.getContentArea();
        const contentSize = this.#getDisplaySize(display);

        let contentX = 0;
        let contentY = 0;

        if (xDef.align === 'center') {
            contentX = (contentArea.width - contentSize.width) / 2;
        } else if (xDef.align === 'end') {
            contentX = contentArea.width - contentSize.width;
        }

        if (yDef.align === 'center') {
            contentY = (contentArea.height - contentSize.height) / 2;
        } else if (yDef.align === 'end') {
            contentY = contentArea.height - contentSize.height;
        }

        display.position.set(contentX, contentY);
    }

    #registerChildBranch(child: BoxStore): void {
        const childId = child.value.id;
        if (this.#children.has(childId)) {
            return;
        }

        this.#children.set(childId, child);

        if (child.container.parent !== this._contentContainer) {
            this._contentContainer.addChild(child.container);
        }
    }

    #unregisterChildBranch(childId: string): void {
        this.#children.delete(childId);
    }

    #setupChildrenStateSubscription(): void {
        this.#childrenStateSubscription?.unsubscribe();
        this.#childrenStateSubscription = this.$subject.pipe(
            map((value) => value.children),
            distinctUntilChanged(),
        ).subscribe(() => {
            if (!this.value.isDirty) {
                this.set('isDirty', true);
            }
            this.queueResolve();
        });
    }

    #syncChildBranchesFromState(): void {
        const nextIds = new Set(this.value.childOrder);

        for (const existingId of this.#children.keys()) {
            if (!nextIds.has(existingId)) {
                this.#unregisterChildBranch(existingId);
            }
        }

        for (const childId of this.value.childOrder) {
            if (!this.value.children[childId]) continue;
            if (this.#children.has(childId)) continue;

            const branchKey = pathToString(['children', childId]);
            const existing = this.$br.get(branchKey) as BoxStore | undefined;
            const child = existing ?? this.$br.$add<BoxState, BoxStore>(
                ['children', childId],
                { subclass: BoxStore },
                this.application!,
            );

            this.#registerChildBranch(child);
        }
    }

    #applyMinMax(axisDef: AxisDef, size: number): number {
        let result = size;
        if (axisDef.min !== undefined) {
            result = Math.max(axisDef.min, result);
        }
        if (axisDef.max !== undefined) {
            result = Math.min(axisDef.max, result);
        }
        return result;
    }

    #calculateTotalGaps(childCount: number): number {
        if (childCount === 0) return 0;

        let totalGaps = 0;
        const { gapMode, gap } = this.value;

        if (gapMode === 'before' || gapMode === 'all') {
            totalGaps += gap;
        }

        for (let i = 0; i < childCount - 1; i++) {
            totalGaps += gap;
        }

        if (gapMode === 'after' || gapMode === 'all') {
            totalGaps += gap;
        }

        return totalGaps;
    }

    #layoutChildren(): void {
        const children = this.children;
        if (children.length === 0) return;

        const { xDef, yDef, padding, direction, gap, gapMode } = this.value;
        const p = padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
        const isHorizontal = direction === 'horizontal';
        const contentArea = this.getContentArea();
        const parentMainSize = isHorizontal ? contentArea.width : contentArea.height;

        const totals = children.reduce((acc, child) => {
            const childMainDef = isHorizontal ? child.xDef : child.yDef;
            switch (childMainDef.sizeMode) {
                case 'px': {
                    acc.pxTotal += childMainDef.size;
                    break;
                }
                case 'percent': {
                    const size = this.#applyMinMax(childMainDef, parentMainSize * childMainDef.size);
                    if (isHorizontal) {
                        child.setSize(size, child.rect.height);
                    } else {
                        child.setSize(child.rect.width, size);
                    }
                    acc.percentTotal += size;
                    break;
                }
                case 'percentFree': {
                    acc.totalWeight += childMainDef.size;
                    acc.percentFreeChildren.push(child);
                    break;
                }
                case SIZE_MODE.HUG: {
                    const childRect = child.rect;
                    acc.hugTotal += isHorizontal ? childRect.width : childRect.height;
                    break;
                }
            }
            return acc;
        }, {
            pxTotal: 0,
            percentTotal: 0,
            hugTotal: 0,
            totalWeight: 0,
            percentFreeChildren: [] as BoxStore[],
        });

        const totalGaps = this.#calculateTotalGaps(children.length);
        const freeSpace = Math.max(0, parentMainSize - totals.pxTotal - totals.percentTotal - totals.hugTotal - totalGaps);

        for (const child of totals.percentFreeChildren) {
            const childMainDef = isHorizontal ? child.xDef : child.yDef;
            const rawSize = totals.totalWeight > 0 ? freeSpace * (childMainDef.size / totals.totalWeight) : 0;
            const minSize = Math.min(childMainDef.min ?? 0, rawSize);
            const size = Math.min(childMainDef.max ?? Infinity, Math.max(minSize, rawSize));
            if (isHorizontal) {
                child.setSize(size, child.rect.height);
            } else {
                child.setSize(child.rect.width, size);
            }
        }

        const hasBefore = gapMode === 'before' || gapMode === 'all';
        const hasAfter = gapMode === 'after' || gapMode === 'all';

        let mainPos = hasBefore ? gap : 0;
        let maxCrossSize = 0;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const childRect = child.rect;
            const isLast = i === children.length - 1;

            if (isHorizontal) {
                child.setPosition(mainPos, 0);
                mainPos += childRect.width;
                if (!isLast || hasAfter) {
                    mainPos += gap;
                }
                maxCrossSize = Math.max(maxCrossSize, childRect.height);
            } else {
                child.setPosition(0, mainPos);
                mainPos += childRect.height;
                if (!isLast || hasAfter) {
                    mainPos += gap;
                }
                maxCrossSize = Math.max(maxCrossSize, childRect.width);
            }
        }

        const totalMainSize = mainPos;

        if (xDef.sizeMode === SIZE_MODE.HUG || yDef.sizeMode === SIZE_MODE.HUG) {
            const nextWidth = (isHorizontal ? totalMainSize : maxCrossSize) + p.left + p.right;
            const nextHeight = (isHorizontal ? maxCrossSize : totalMainSize) + p.top + p.bottom;
            const shouldUpdateWidth = xDef.sizeMode === SIZE_MODE.HUG && this.value.width !== nextWidth;
            const shouldUpdateHeight = yDef.sizeMode === SIZE_MODE.HUG && this.value.height !== nextHeight;

            if (shouldUpdateWidth || shouldUpdateHeight) {
                this.mutate((draft) => {
                    if (shouldUpdateWidth) {
                        draft.width = nextWidth;
                        draft.xDef = { ...draft.xDef, size: nextWidth };
                    }
                    if (shouldUpdateHeight) {
                        draft.height = nextHeight;
                        draft.yDef = { ...draft.yDef, size: nextHeight };
                    }
                });
            }
        }

        const finalContentArea = this.getContentArea();
        for (const child of children) {
            const childXDef = child.xDef;
            const childYDef = child.yDef;

            if (isHorizontal) {
                if (childYDef.sizeMode === 'percentFree' || childYDef.sizeMode === 'percent') {
                    child.setSize(child.rect.width, finalContentArea.height);
                }
            } else {
                if (childXDef.sizeMode === 'percentFree' || childXDef.sizeMode === 'percent') {
                    child.setSize(finalContentArea.width, child.rect.height);
                }
            }

            const childRect = child.rect;
            if (isHorizontal) {
                let newY = 0;
                if (childYDef.align === 'center') {
                    newY = (finalContentArea.height - childRect.height) / 2;
                } else if (childYDef.align === 'end') {
                    newY = finalContentArea.height - childRect.height;
                }
                child.setPosition(child.rect.x, newY);
            } else {
                let newX = 0;
                if (childXDef.align === 'center') {
                    newX = (finalContentArea.width - childRect.width) / 2;
                } else if (childXDef.align === 'end') {
                    newX = finalContentArea.width - childRect.width;
                }
                child.setPosition(newX, child.rect.y);
            }
        }
    }

    override cleanup(): void {
        this.#childrenStateSubscription?.unsubscribe();
        this.#childrenStateSubscription = undefined;

        for (const childId of [...this.#children.keys()]) {
            const child = this.#children.get(childId);
            if (!child) continue;
            this.#unregisterChildBranch(childId);
            child.cleanup();
            this.$br.delete(pathToString(['children', childId]));
        }

        if (this.#leafContent) {
            this._contentContainer.removeChild(this.#leafContent);
            this.#leafContent = null;
        }

        if (this.#textDisplay) {
            this._contentContainer.removeChild(this.#textDisplay);
            this.#textDisplay.destroy();
            this.#textDisplay = null;
        }

        super.cleanup();
        this._container.destroy({ children: true });
    }
}
