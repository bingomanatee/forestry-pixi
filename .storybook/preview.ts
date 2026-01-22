import type { Preview } from '@storybook/html';

const preview: Preview = {
  parameters: {
    onboarding: {
      disable: true
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

