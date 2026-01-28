import {TickerForest} from "@forestry-pixi/ticker-forest";
import type {WindowDef} from "./types";
import {Application, Container, Graphics} from "pixi.js";
import {WindowsManager} from "./WindowsManager";
import rgbToColor from "./rgbToColor";
import {DragStore} from "@forestry-pixi/drag";
import {StoreParams} from "@wonderlandlabs/forestry4";
import {TitlebarStore} from "./TitlebarStore";
import {distinctUntilChanged, map} from "rxjs";
import {isEqual} from "lodash-es";
import {TITLEBAR_MODE} from "./constants";

export class WindowStore extends TickerForest<WindowDef> {

    constructor(config: StoreParams<WindowDef>, app: Application) {
        super(config, app);
        if (app) {
            this.kickoff();
        }
    }

    resolveComponents(parentContainer?: Container) {
        console.log('windowStore:resolveComponents');
        this.#refreshRoot();
        this.#refreshBackground();
        this.#refreshTitlebar();
        parentContainer?.addChild(this.#root!);
    }

    #dragStore?: DragStore;
    #titlebarStore?: TitlebarStore;
    #hoverEnterHandler?: () => void;
    #hoverLeaveHandler?: () => void;

    #refreshRoot() {
        const {x, y, isDraggable} = this.value;

        if (!this.#root) {
            this.#root = new Container({
                eventMode: "static",
                position: {x, y}
            });

            const self = this;

            // Only add drag behavior if isDraggable is true
            if (isDraggable) {
                this.#dragStore = new DragStore({
                    app: this.application,
                    callbacks: {
                        onDragStart() {
                        },
                        onDrag(state) {
                            const pos = self.#dragStore?.getCurrentItemPosition();
                            // @TODO: localize?
                            if (pos) {
                                self.#root?.position.set(pos.x, pos.y);
                            }
                        },
                        onDragEnd() {
                            self.#root!.cursor = 'grab';
                        },
                    },
                });

                this.#root.cursor = 'grab';
                this.#root.on('pointerdown', (event) => {
                    event.stopPropagation();
                    self.#root!.cursor = 'grabbing';

                    // Start drag with current container position
                    self.#dragStore!.startDragContainer(
                        self.value.id,
                        event, self.#root!
                    );
                });
            }
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

    #refreshTitlebar() {
        const {titlebar} = this.value;

        if (!this.#titlebarStore) {
            if (!this.value.titlebar) {
                console.error('no titlebar def');
            }
            // Create titlebar store as a branch using $branch
            // @ts-ignore
            this.#titlebarStore = this.$branch(['titlebar'], {
                subclass: TitlebarStore,
                value: {
                    ...titlebar,
                    isDirty: true,
                }
            }, this.application) as unknown as TitlebarStore;
            // Set parent container and initialize
            if (this.#root) {
                this.#titlebarStore.setParentContainer(this.#root);
                this.#titlebarStore.application = this.application;
                this.#titlebarStore.kickoff();
            }

            const titlebarStore = this.#titlebarStore;

            // Width subscription
            titlebarStore.widthSubscription = this.$subject.pipe(
                map((v) => {
                    if (!v) {
                        console.warn('no value');
                        return 0;
                    }
                    return v.width;
                }),
                distinctUntilChanged()
            ).subscribe(() => {
                titlebarStore.set('isDirty', true);
                titlebarStore.queueResolve()
            });
            const self = this;
            // Titlebar config subscription - subscribe directly to titlebar branch

            // Set up hover listeners for ON_HOVER mode
            if (titlebar.mode === TITLEBAR_MODE.ON_HOVER && this.#root) {
                console.info('hover hooks');
                self.#root?.on('pointerenter', () => {
                    console.info('titlebar:show');
                    titlebarStore.mutate((draft) => {
                        draft.isVisible = true;
                    })
                });
                self.#root?.on('pointerleave', () => {
                    console.info('titlebar:hide');
                    titlebarStore.mutate((draft) => {
                        draft.isVisible = false;
                    })
                });
                titlebarStore.set('isVisible', false);
            } else {
                titlebarStore.set('isVisible', true);
            }
        }
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