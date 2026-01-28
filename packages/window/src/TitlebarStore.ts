import {TickerForest} from "@forestry-pixi/ticker-forest";
import type {TitlebarConfig} from "./types";
import type {Application} from "pixi.js";
import {Container, Graphics, Text} from "pixi.js";
import {StoreParams} from "@wonderlandlabs/forestry4";
import rgbToColor from "./rgbToColor";
import type {Subscription} from "rxjs";

interface TitlebarStoreValue extends TitlebarConfig {
    isDirty: boolean;
    isVisible: boolean;
}

export class TitlebarStore extends TickerForest<TitlebarStoreValue> {
    #container?: Container;
    #background?: Graphics;
    #titleText?: Text;
    #parentContainer?: Container;
    widthSubscription?: Subscription;
    configSubscription?: Subscription;

    constructor(config: StoreParams<TitlebarStoreValue>, app: Application) {
        super({
            ...config, prep(next) {
                console.log('prep:', next);
                if (!next) {
                    return next;
                }
                if (!this.value && next) {
                    queueMicrotask(() => {
                        this.queueResolve();
                    })
                    return {...next, isDirty: true};
                }
                let nonDirtyChanged = false;
                Array.from(Object.keys(next)).forEach((key) => {
                    if (key === 'isDirty') {
                        return;
                    }
                    if (next[key] !== this.value[key]) {
                        console.log('changed field:', key);
                        nonDirtyChanged = key;
                    }
                });
                if (nonDirtyChanged) {
                    console.log('change:', nonDirtyChanged);
                    queueMicrotask(() => {
                        this.queueResolve();
                    });
                    return {...next, isDirty: true};
                }
                return next
            }
        }, app);
        if (app) {
            this.kickoff();
        }
    }

    setParentContainer(container: Container) {
        this.#parentContainer = container;
    }

    resolveComponents() {
        this.#refreshContainer();
        this.#refreshBackground();
        this.#refreshTitle();
    }

    #refreshContainer() {
        if (!this.#container) {
            this.#container = new Container({
                label: 'titlebar',
                position: {x: 0, y: 0}
            });
            this.#parentContainer?.addChild(this.#container);
        }
        console.log('resolve with visibliity', this.value.isVisible);
        this.#container!.visible = this.value.isVisible;
    }

    #refreshBackground() {
        const {height, backgroundColor} = this.value;
        const width = (this.$parent?.value as any)?.width || 0;

        if (!this.#background) {
            this.#background = new Graphics();
            this.#container?.addChildAt(this.#background, 0);
        } else {
            this.#background.clear();
        }

        this.#background.rect(0, 0, width, height)
            .fill(rgbToColor(backgroundColor));
    }

    #refreshTitle() {
        const {title, height} = this.value;

        if (!this.#titleText) {
            this.#titleText = new Text({
                text: title,
                style: {
                    fontSize: 14,
                    fill: 0xffffff,
                },
            });
            this.#titleText.position.set(10, height / 2);
            this.#titleText.anchor.set(0, 0.5);
            this.#container?.addChild(this.#titleText);
        } else {
            this.#titleText.text = title;
            this.#titleText.position.set(10, height / 2);
        }
    }

    protected isDirty(): boolean {
        return this.value.isDirty;
    }

    protected clearDirty(): void {
        this.set('isDirty', false);
    }

    protected resolve(): void {
        if (this.isDirty()) {
            this.resolveComponents();
        } else {
            console.warn('resolve - not dirty');
        }
    }

    cleanup(): void {
        super.cleanup();

        // Unsubscribe from width changes
        if (this.widthSubscription) {
            this.widthSubscription.unsubscribe();
            this.widthSubscription = undefined;
        }

        // Unsubscribe from config changes
        if (this.configSubscription) {
            this.configSubscription.unsubscribe();
            this.configSubscription = undefined;
        }

        if (this.#container) {
            this.#parentContainer?.removeChild(this.#container);
            this.#container.destroy({children: true});
            this.#container = undefined;
        }
    }
}

