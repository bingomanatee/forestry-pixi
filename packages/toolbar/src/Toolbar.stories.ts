import type { Meta, StoryObj } from '@storybook/html';
import { Application, Assets, Sprite, Spritesheet } from 'pixi.js';
import { Toolbar } from './Toolbar';
import type { ToolbarButtonConfig } from './types';

interface ToolbarArgs {
  orientation: 'horizontal' | 'vertical';
  spacing: number;
}

const meta: Meta<ToolbarArgs> = {
  title: 'Toolbar/Toolbar',
  args: {
    orientation: 'horizontal',
    spacing: 8,
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

      // Load toolbar spritesheet and bitmap font
      const [spritesheet] = await Promise.all([
        Assets.load<Spritesheet>('/toolbar-data.json'),
        Assets.load('/image_font/image_font.xml.fnt'),
      ]);

      // Create button configurations (only id and sprite required)
      // Styling is handled by the default StyleTree loaded from toolbar.default.json
      const buttonConfigs: ToolbarButtonConfig[] = [
        {
          id: 'image',
          sprite: new Sprite(spritesheet.textures['ctrl-image@4x.png']),
          label: 'Image',
          onClick: () => console.log('Image button clicked'),
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
        },
        {
          id: 'actor',
          sprite: new Sprite(spritesheet.textures['ctrl-actor@4x.png']),
          label: 'Actor',
          onClick: () => console.log('Actor button clicked'),
        },
      ];

      // Create toolbar - uses default StyleTree for styling and bitmap font for labels
      const toolbar = new Toolbar({
        buttons: buttonConfigs,
        spacing: args.spacing,
        orientation: args.orientation,
        bitmapFont: 'Inter_18pt-Medium',
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

