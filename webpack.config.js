const lazyImports = [
  '@nestjs/microservices/microservices-module',
  '@nestjs/websockets/socket-module',
];
module.exports = function (options, webpack) {
  return {
    ...options,
    entry: ['./src/lambda.ts'],
    externals: [
      ({ request }, callback) => {
        // Exclude non-essential modules
        if (lazyImports.includes(request)) {
          return callback(null, `commonjs ${request}`);
        }
        // Exclude Cursor & IDE-specific extensions
        if (request.includes('.cursor/extensions/')) {
          return callback(null, `commonjs ${request}`);
        }
        callback();
      },
    ],
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          // Ignoring non-essential modules for Lambda deployment
          return lazyImports.includes(resource);
        },
      }),
    ],
  };
};
