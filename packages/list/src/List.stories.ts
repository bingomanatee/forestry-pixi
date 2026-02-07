import type { Meta, StoryObj } from '@storybook/html';
import { Application } from 'pixi.js';
import { ListStore } from './ListStore';
import type { MainAlign, CrossAlign, Direction, CellConfig } from './types';

interface ListArgs {
    direction: Direction;
    xAlign: MainAlign;
    yAlign: CrossAlign;
    padding: number;
    gap: number;
    listWidth: number;
    listHeight: number;
    cellCount: number;
}

const meta: Meta<ListArgs> = {
    title: 'List/ListStore',
    argTypes: {
        direction: {
            control: { type: 'select' },
            options: ['horizontal', 'vertical'],
            description: 'List direction',
        },
        xAlign: {
            control: { type: 'select' },
            options: ['start', 'end', 'center', 'stretch', 'space-between', 'space-around'],
            description: 'X-axis alignment (main axis when horizontal)',
        },
        yAlign: {
            control: { type: 'select' },
            options: ['start', 'end', 'center', 'stretch'],
            description: 'Y-axis alignment (cross axis when horizontal)',
        },
        padding: {
            control: { type: 'range', min: 0, max: 40, step: 5 },
            description: 'Padding around list content',
        },
        gap: {
            control: { type: 'range', min: 0, max: 30, step: 2 },
            description: 'Gap between cells',
        },
        listWidth: {
            control: { type: 'range', min: 200, max: 700, step: 10 },
            description: 'List width',
        },
        listHeight: {
            control: { type: 'range', min: 100, max: 400, step: 10 },
            description: 'List height',
        },
        cellCount: {
            control: { type: 'range', min: 1, max: 8, step: 1 },
            description: 'Number of cells',
        },
    },
    args: {
        direction: 'horizontal',
        xAlign: 'start',
        yAlign: 'stretch',
        padding: 10,
        gap: 8,
        listWidth: 500,
        listHeight: 120,
        cellCount: 4,
    },
};

export default meta;
type Story = StoryObj<ListArgs>;

// Cell colors for visual distinction
const cellColors = [
    { r: 0.9, g: 0.3, b: 0.3 },  // Red
    { r: 0.3, g: 0.7, b: 0.3 },  // Green
    { r: 0.3, g: 0.5, b: 0.9 },  // Blue
    { r: 0.9, g: 0.7, b: 0.2 },  // Yellow
    { r: 0.7, g: 0.3, b: 0.8 },  // Purple
    { r: 0.2, g: 0.8, b: 0.8 },  // Cyan
    { r: 0.9, g: 0.5, b: 0.2 },  // Orange
    { r: 0.6, g: 0.6, b: 0.6 },  // Gray
];

export const BasicList: Story = {
    render: (args) => {
        const wrapper = document.createElement('div');
        wrapper.style.width = '100%';
        wrapper.style.height = '600px';
        wrapper.style.position = 'relative';

        const app = new Application();
        app.init({
            width: 800,
            height: 600,
            backgroundColor: 0x1a1a2e,
            antialias: true,
        }).then(() => {
            wrapper.appendChild(app.canvas);

            // Generate cell configs
            const cells: CellConfig[] = [];
            for (let i = 0; i < args.cellCount; i++) {
                cells.push({
                    id: `cell-${i}`,
                    width: { base: 80, min: 40 },
                    height: { base: 60, min: 30 },
                    style: {
                        fill: {
                            color: cellColors[i % cellColors.length],
                            alpha: 0.9,
                        },
                        stroke: {
                            color: { r: 1, g: 1, b: 1 },
                            alpha: 0.5,
                            width: 2,
                        },
                        borderRadius: 6,
                    },
                });
            }

            // Create list store using xAlign/yAlign
            const listStore = new ListStore({
                id: 'demo-list',
                width: args.listWidth,
                height: args.listHeight,
                direction: args.direction,
                xAlign: args.xAlign,
                yAlign: args.yAlign,
                padding: {
                    top: args.padding,
                    right: args.padding,
                    bottom: args.padding,
                    left: args.padding,
                },
                style: {
                    background: {
                        fill: {
                            color: { r: 0.15, g: 0.2, b: 0.35 },
                            alpha: 1,
                        },
                        stroke: {
                            color: { r: 0.3, g: 0.4, b: 0.6 },
                            alpha: 1,
                            width: 2,
                        },
                        borderRadius: 10,
                    },
                    gap: args.gap,
                },
                cells,
            }, app);

            // Position list in center of stage
            listStore.container.position.set(150, 200);
            app.stage.addChild(listStore.container);

            // Trigger initial render
            listStore.markDirty();
        });

        return wrapper;
    },
};

export const VerticalListWithVariants: Story = {
    args: {
        direction: 'vertical',
        xAlign: 'stretch',
        yAlign: 'start',
        padding: 12,
        gap: 6,
        listWidth: 200,
        listHeight: 350,
        cellCount: 5,
    },
    render: (args) => {
        const wrapper = document.createElement('div');
        wrapper.style.width = '100%';
        wrapper.style.height = '600px';
        wrapper.style.position = 'relative';

        const app = new Application();
        app.init({
            width: 800,
            height: 600,
            backgroundColor: 0x1a1a2e,
            antialias: true,
        }).then(() => {
            wrapper.appendChild(app.canvas);

            // Generate cells with variants
            const cells: CellConfig[] = [];
            const variants = ['primary', 'secondary', 'accent'];
            for (let i = 0; i < args.cellCount; i++) {
                cells.push({
                    id: `item-${i}`,
                    height: { base: 50 },
                    variant: variants[i % variants.length],
                });
            }

            // Create list with cell variants using xAlign/yAlign
            const listStore = new ListStore({
                id: 'variant-list',
                width: args.listWidth,
                height: args.listHeight,
                direction: args.direction,
                xAlign: args.xAlign,
                yAlign: args.yAlign,
                padding: {
                    top: args.padding,
                    right: args.padding,
                    bottom: args.padding,
                    left: args.padding,
                },
                style: {
                    background: {
                        fill: { color: { r: 0.1, g: 0.12, b: 0.18 }, alpha: 1 },
                        stroke: { color: { r: 0.2, g: 0.25, b: 0.35 }, width: 1 },
                        borderRadius: 8,
                    },
                    cell: {
                        fill: { color: { r: 0.2, g: 0.25, b: 0.35 }, alpha: 1 },
                        borderRadius: 4,
                    },
                    cellVariants: {
                        primary: {
                            fill: { color: { r: 0.2, g: 0.5, b: 0.8 }, alpha: 1 },
                            stroke: { color: { r: 0.3, g: 0.6, b: 0.9 }, width: 1 },
                        },
                        secondary: {
                            fill: { color: { r: 0.3, g: 0.35, b: 0.45 }, alpha: 1 },
                        },
                        accent: {
                            fill: { color: { r: 0.8, g: 0.4, b: 0.2 }, alpha: 1 },
                            stroke: { color: { r: 0.9, g: 0.5, b: 0.3 }, width: 1 },
                        },
                    },
                    gap: args.gap,
                },
                cells,
            }, app);

            listStore.container.position.set(300, 100);
            app.stage.addChild(listStore.container);
            listStore.markDirty();
        });

        return wrapper;
    },
};

export const FlexDistribution: Story = {
    args: {
        direction: 'horizontal',
        xAlign: 'space-between',
        yAlign: 'center',
        padding: 15,
        gap: 0,
        listWidth: 600,
        listHeight: 80,
        cellCount: 4,
    },
    render: (args) => {
        const wrapper = document.createElement('div');
        wrapper.style.width = '100%';
        wrapper.style.height = '600px';
        wrapper.style.position = 'relative';

        const app = new Application();
        app.init({
            width: 800,
            height: 600,
            backgroundColor: 0x1a1a2e,
            antialias: true,
        }).then(() => {
            wrapper.appendChild(app.canvas);

            // Fixed-size cells for space distribution demo
            const cells: CellConfig[] = [];
            for (let i = 0; i < args.cellCount; i++) {
                cells.push({
                    id: `nav-${i}`,
                    width: { base: 80 },
                    height: { base: 50 },
                    style: {
                        fill: { color: { r: 0.25, g: 0.6, b: 0.45 }, alpha: 1 },
                        stroke: { color: { r: 0.35, g: 0.7, b: 0.55 }, width: 2 },
                        borderRadius: 8,
                    },
                });
            }

            // Create list using xAlign/yAlign
            const listStore = new ListStore({
                id: 'flex-list',
                width: args.listWidth,
                height: args.listHeight,
                direction: args.direction,
                xAlign: args.xAlign,
                yAlign: args.yAlign,
                padding: {
                    top: args.padding,
                    right: args.padding,
                    bottom: args.padding,
                    left: args.padding,
                },
                style: {
                    background: {
                        fill: { color: { r: 0.12, g: 0.15, b: 0.2 }, alpha: 1 },
                        stroke: { color: { r: 0.2, g: 0.25, b: 0.35 }, width: 2 },
                        borderRadius: 12,
                    },
                    gap: args.gap,
                },
                cells,
            }, app);

            listStore.container.position.set(100, 250);
            app.stage.addChild(listStore.container);
            listStore.markDirty();
        });

        return wrapper;
    },
};

