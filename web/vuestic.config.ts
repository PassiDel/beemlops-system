import { defineVuesticConfig, createIconsConfig } from 'vuestic-ui';

export default defineVuesticConfig({
  icons: createIconsConfig({
    fonts: [
      {
        name: 'mdi-{icon}',
        resolve: ({ icon }) => ({
          class: 'material-icons',
          content: icon,
          tag: 'span'
        })
      }
    ]
  })
});
