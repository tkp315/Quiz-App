// babel.config.js
export default {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: { node: 'current' }, // this ensures compatibility with your current version of Node.js
          modules:'auto', // Set modules to false, since ESM will be used natively
        },
      ],
    ],
  };
  