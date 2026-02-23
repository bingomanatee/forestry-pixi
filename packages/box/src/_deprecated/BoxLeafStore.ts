import { Application, type ContainerOptions, type Graphics, type Sprite, type Text, type Container } from 'pixi.js';
import { BoxStore } from './BoxStore';
import type { BaseBoxConfig, BoxProps } from './types';

export class BoxLeafStore extends BoxStore {
    constructor(
        config: BaseBoxConfig,
        app: Application,
        boxProps?: BoxProps,
        rootProps?: ContainerOptions,
    ) {
        super({ ...config, kind: 'leaf' }, app, boxProps, rootProps);
    }

    setContent(content: Graphics | Sprite | Text | Container | null): void {
        super.setContent(content);
    }
}
