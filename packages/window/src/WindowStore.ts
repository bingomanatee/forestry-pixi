import {TickerForest} from "@forestry-pixi/ticker-forest";
import type {WindowDef} from "./types";
import {Container, Graphics} from "pixi.js";
import {WindowsManager} from "./WindowsManager";
import rgbToColor from "./rgbToColor";
import {DragStore} from "@forestry-pixi/drag";

export class WindowStore extends TickerForest<WindowDef> {

    constructor(config, app) {
        super(config, app);
    }

    resolveComponents(parentContainer?: Container) {
        this.#refreshRoot();
        this.#refreshBackground();
        parentContainer?.addChild(this.#root!);
    }

    #dragStore?: DragStore;

    #refreshRoot() {
        const {x, y} = this.value;

        if (!this.#root) {
            this.#root = new Container({
                eventMode: "static",
                position: {x, y}
            });

            const self = this;

            this.#dragStore = new DragStore({
                app: this.application,
                callbacks: {
                    onDragStart () {
                        console.info('drag:start')
                    },
                    onDrag (state)  {
                        const pos = self.#dragStore?.getCurrentItemPosition();
                        console.info('drag:drag', pos)
                        // @TODO: localize?
                        if (pos) {
                            self.#root?.position.set(pos.x, pos.y);
                        }
                    },
                    onDragEnd() {
                        console.info('drag:end')
                        self.#root!.cursor = 'grab';
                    },
                },
            });

            this.#root.on('pointerdown', (event) => {
                event.stopPropagation();
                self.#root!.cursor = 'grabbing';

                // Start drag with current container position
                self.#dragStore!.startDragContainer(
                    self.value.id,
                    event, self.#root!
                );
            });
        } else {
            this.#root.position.set(x, y);
        }
    }

    #refreshBackground() {
        const {width, height, backgroundColor} = this.value;

        if (!this.#background) {
            this.#background = new Graphics();
            this.#root?.addChildAt(this.#background, 0);
        } else {
            this.#background.clear();
        }

        this.#background.rect(0, 0, width, height)
            .fill(rgbToColor(backgroundColor));

    }

    #root?: Container;
    #background?: Graphics;

    protected isDirty(): boolean {
        return this.value.isDirty;
    }

    protected clearDirty(): void {
        this.set('isDirty', false);
    }

    protected resolve(): void {
        if (this.isDirty()) {
            if (!this.$isRoot) {
                const rootStore = this.$root as unknown as WindowsManager;
                if (rootStore?.container) {
                    this.resolveComponents(rootStore.container);
                }
            }
        }
    }

}