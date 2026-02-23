import { Application, type ContainerOptions } from 'pixi.js';
import { BoxStore } from './BoxStore';
import type { BaseBoxConfig, BoxProps } from './types';

export class BoxListStore extends BoxStore {
    constructor(
        config: BaseBoxConfig,
        app: Application,
        boxProps?: BoxProps,
        rootProps?: ContainerOptions,
    ) {
        super({ ...config, kind: 'list' }, app, boxProps, rootProps);
    }

    addChild(child: BaseBoxConfig | BoxStore): BoxStore {
        const nextConfig = child instanceof BoxStore ? child.toConfig() : child;
        return super.addChild(nextConfig);
    }
}
