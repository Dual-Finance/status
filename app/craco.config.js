const CracoLessPlugin = require('craco-less');

module.exports = {
  reactScriptsVersion: 'react-scripts' /* (default value) */,
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  style: {
    modules: {
      localIdentName: '',
    },
    css: {
      loaderOptions: {
        /* Any css-loader configuration options: https://github.com/webpack-contrib/css-loader. */
      },
      loaderOptions: (cssLoaderOptions, { env, paths }) => {
        return cssLoaderOptions;
      },
    },
    sass: {
      loaderOptions: {
        /* Any sass-loader configuration options: https://github.com/webpack-contrib/sass-loader. */
      },
      loaderOptions: (sassLoaderOptions, { env, paths }) => {
        return sassLoaderOptions;
      },
    },
  },
  babel: {
    presets: [],
    plugins: [],
    loaderOptions: {
      /* Any babel-loader configuration options: https://github.com/babel/babel-loader. */
    },
    loaderOptions: (babelLoaderOptions, { env, paths }) => {
      return babelLoaderOptions;
    },
  },
  typescript: {
    enableTypeChecking: true /* (default value)  */,
  },
  webpack: {
    alias: {},
    plugins: {},
    configure: {
      resolve: {
        fallback: {
          stream: require.resolve('stream-browserify'),
          crypto: require.resolve('crypto-browserify'),
          fs: false,
          path: false,
          os: false,
        },
      },
      ignoreWarnings: [
        // Ignore warnings raised by source-map-loader.
        // some third party packages may ship miss-configured sourcemaps, that interrupts the build
        // See: https://github.com/facebook/create-react-app/discussions/11278#discussioncomment-1780169
        /**
         *
         * @param {import('webpack').WebpackError} warning
         * @returns {boolean}
         */
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
              warning.module &&
              warning.module.resource.includes('node_modules') &&
              warning.details &&
              warning.details.includes('source-map-loader')
          );
        },
      ],
      /* Any webpack configuration options: https://webpack.js.org/configuration */
    },
    // configure: (webpackConfig, { env, paths }) => {
    //   return webpackConfig;
    // },
  },
};
