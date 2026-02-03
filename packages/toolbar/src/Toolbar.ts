import { Container, Application } from 'pixi.js';
import { StyleTree, fromJSON } from '@forestry-pixi/style-tree';
import { ToolbarButton } from './ToolbarButton';
import type { ToolbarConfig, ToolbarButtonConfig } from './types';
import { ToolbarConfigSchema } from './types';
import defaultStyles from './styles/toolbar.default.json';

/**
 * Toolbar - A container for toolbar buttons with configurable layout
 */
export class Toolbar {
  private container: Container;
  private buttons: ToolbarButton[] = [];
  private config: ToolbarConfig;
  private app: Application;
  private styleTree: StyleTree;

  constructor(config: ToolbarConfig, app: Application) {
    // Parse config through schema to apply defaults
    this.config = ToolbarConfigSchema.parse(config);
    this.app = app;

    // Use provided StyleTree or load default styles
    this.styleTree = this.config.style ?? fromJSON(defaultStyles);

    // Create container
    this.container = new Container({
      label: 'Toolbar',
    });

    // Create buttons
    this.createButtons();

    // Layout buttons
    this.layout();
  }

  private createButtons(): void {
    this.config.buttons.forEach((buttonConfig) => {
      const button = new ToolbarButton(buttonConfig, this.app, this.styleTree, this.config.bitmapFont);
      this.buttons.push(button);
      this.container.addChild(button.getContainer());
    });
  }

  private layout(): void {
    const { spacing, orientation } = this.config;
    let offset = 0;

    this.buttons.forEach((button) => {
      const buttonContainer = button.getContainer();
      
      if (orientation === 'horizontal') {
        buttonContainer.position.set(offset + button.getWidth() / 2, 0);
        offset += button.getWidth() + spacing;
      } else {
        buttonContainer.position.set(0, offset + button.getHeight() / 2);
        offset += button.getHeight() + spacing;
      }
    });
  }

  /**
   * Get the container for this toolbar
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Add a button to the toolbar
   */
  addButton(button: ToolbarButton): void {
    this.buttons.push(button);
    this.container.addChild(button.getContainer());
    this.layout();
  }

  /**
   * Remove a button from the toolbar by index
   */
  removeButton(index: number): void {
    if (index >= 0 && index < this.buttons.length) {
      const button = this.buttons[index];
      this.container.removeChild(button.getContainer());
      button.destroy();
      this.buttons.splice(index, 1);
      this.layout();
    }
  }

  /**
   * Get all buttons
   */
  getButtons(): ToolbarButton[] {
    return this.buttons;
  }

  /**
   * Destroy the toolbar and clean up resources
   */
  destroy(): void {
    this.buttons.forEach((button) => button.destroy());
    this.buttons = [];
    this.container.destroy({ children: true });
  }
}

