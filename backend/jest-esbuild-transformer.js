const esbuild = require('esbuild');

module.exports = {
  process(src, filename) {
    const result = esbuild.transformSync(src, {
      loader: 'ts',
      format: 'cjs',
      target: 'node18',
      sourcemap: 'inline',
      sourcefile: filename,
    });
    return { code: result.code, map: result.map };
  },
};
