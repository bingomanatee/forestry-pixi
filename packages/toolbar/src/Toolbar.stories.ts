import type { Meta, StoryObj } from '@storybook/html';
import { Application, Assets, Sprite, Spritesheet, Texture } from 'pixi.js';
import { Toolbar } from './Toolbar';
import type { ToolbarButtonConfig } from './types';

interface ToolbarArgs {
  orientation: 'horizontal' | 'vertical';
  spacing: number;
  iconSize: number;
  padding: { x: number; y: number };
  appearance: {
    base: {
      stroke: {
        color: { r: number; g: number; b: number };
        alpha: number;
        width: number;
      };
      fill?: {
        color: { r: number; g: number; b: number };
        alpha: number;
      };
      iconAlpha: number;
      iconTint?: { r: number; g: number; b: number };
    };
    hover: {
      stroke: {
        color: { r: number; g: number; b: number };
        alpha: number;
        width: number;
      };
      fill?: {
        color: { r: number; g: number; b: number };
        alpha: number;
      };
      iconAlpha: number;
      iconTint?: { r: number; g: number; b: number };
    };
    disabled: {
      stroke: {
        color: { r: number; g: number; b: number };
        alpha: number;
        width: number;
      };
      fill?: {
        color: { r: number; g: number; b: number };
        alpha: number;
      };
      iconAlpha: number;
      iconTint?: { r: number; g: number; b: number };
    };
  };
  label: {
    base: {
      color: { r: number; g: number; b: number };
      alpha: number;
    };
    hover: {
      color: { r: number; g: number; b: number };
      alpha: number;
    };
    fontSize: number;
    padding: number;
  };
}

const meta: Meta<ToolbarArgs> = {
  title: 'Toolbar/Toolbar',
  args: {
    orientation: 'horizontal',
    spacing: 8,
    iconSize: 32,
    padding: { x: 4, y: 4 },
    appearance: {
      base: {
        stroke: {
          color: { r: 0.5, g: 0.5, b: 0.5 },
          alpha: 1,
          width: 1,
        },
        iconAlpha: 1,
      },
      hover: {
        stroke: {
          color: { r: 0.2, g: 0.6, b: 0.9 },
          alpha: 1,
          width: 1,
        },
        fill: {
          color: { r: 0.9, g: 0.95, b: 1 },
          alpha: 1,
        },
        iconAlpha: 1,
        iconTint: { r: 1, g: 0.6, b: 0.3 }, // Burnt orange tint on hover
      },
      disabled: {
        stroke: {
          color: { r: 0.3, g: 0.3, b: 0.3 },
          alpha: 0.25,
          width: 1,
        },
        fill: {
          color: { r: 0.9, g: 0.9, b: 0.9 },
          alpha: 0.3,
        },
        iconAlpha: 0.125,
      },
    },
    label: {
      base: {
        color: { r: 0, g: 0, b: 0 },
        alpha: 0.5,
      },
      hover: {
        color: { r: 0, g: 0, b: 0 },
        alpha: 1,
      },
      fontSize: 12,
      padding: 4,
    },
  },
  render: (args) => {
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '600px';
    wrapper.style.position = 'relative';

    // Create PixiJS app
    const app = new Application();
    app.init({
      width: 800,
      height: 600,
      backgroundColor: 0xf0f0f0,
      antialias: true,
    }).then(async () => {
      wrapper.appendChild(app.canvas);

      // Load toolbar spritesheet
      const spritesheet = await Assets.load<Spritesheet>('/toolbar-data.json');

      // Create button configurations (only id and sprite required, rest uses defaults)
      const buttonConfigs: ToolbarButtonConfig[] = [
        {
          id: 'image',
          sprite: new Sprite(spritesheet.textures['ctrl-image@4x.png']),
          label: 'Image',
          onClick: () => console.log('Image button clicked'),
          // isDisabled is optional - omitted here, defaults to false
        },
        {
          id: 'caption',
          sprite: new Sprite(spritesheet.textures['ctrl-caption@4x.png']),
          label: 'Caption',
          onClick: () => console.log('Caption button clicked'),
          isDisabled: true, // Explicitly disabled
        },
        {
          id: 'frame',
          sprite: new Sprite(spritesheet.textures['ctrl-frame@4x.png']),
          label: 'Frame',
          onClick: () => console.log('Frame button clicked'),
          // isDisabled is optional - omitted here, defaults to false
        },
        {
          id: 'actor',
          sprite: new Sprite(spritesheet.textures['ctrl-actor@4x.png']),
          label: 'Actor',
          onClick: () => console.log('Actor button clicked'),
          // isDisabled is optional - omitted here, defaults to false
        },
      ];

      // Create toolbar with button defaults
      const toolbar = new Toolbar({
        buttons: buttonConfigs,
        spacing: args.spacing,
        orientation: args.orientation,
        buttonDefaults: {
          iconSize: args.iconSize,
          padding: args.padding,
          appearance: args.appearance,
          labelConfig: args.label,
        },
      }, app);

      // Position toolbar
      toolbar.getContainer().position.set(400, 300);
      app.stage.addChild(toolbar.getContainer());
    });

    return wrapper;
  },
};

export default meta;
type Story = StoryObj<ToolbarArgs>;

export const Horizontal: Story = {};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
};

