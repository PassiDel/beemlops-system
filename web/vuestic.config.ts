import { createIconsConfig, defineVuesticConfig } from 'vuestic-ui';

export default defineVuesticConfig({
  icons: createIconsConfig({
    fonts: [
      {
        name: '{icon}',
        resolve: ({ icon }) => ({
          class: 'notranslate material-icons',
          content: icon.split('-').reverse()[0],
          tag: 'span',
          attrs: {
            translate: 'no'
          }
        })
      }
    ]
  })
});
