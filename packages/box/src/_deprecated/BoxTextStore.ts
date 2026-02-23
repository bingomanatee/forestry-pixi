import { Application, type ContainerOptions, type TextStyleOptions } from 'pixi.js';
import { BoxStore } from './BoxStore';
import type { BaseBoxConfig, BoxProps } from './types';

export interface BoxTextConfig extends BaseBoxConfig {
    text?: string;
    textStyle?: TextStyleOptions;
}

export class BoxTextStore extends BoxStore {
    constructor(
        config: BoxTextConfig,
        app: Application,
        boxProps?: BoxProps,
        rootProps?: ContainerOptions,
    ) {
        super({ ...config, kind: 'text' }, app, boxProps, rootProps);
    }
}
