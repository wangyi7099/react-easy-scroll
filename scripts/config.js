// rollup.config.js
const resolveNode = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const typescript = require('rollup-plugin-typescript');
const ts = require('typescript');
const replace = require('rollup-plugin-replace');
const path = require('path');
const version = process.env.VERSION || require('../package.json').version;

const banner = `/*
    * ReactSuperScroll ${version}
    * (c) 2018-${new Date().getFullYear()} Yi(Yves) Wang
    * Released under the MIT License
    */
   `;

const aliases = require('./alias');

const resolve = p => {
  const base = p.split('/')[0];
  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1));
  } else {
    return path.resolve(__dirname, '../', p);
  }
};

const root = aliases.src;

const builds = {
  'web-dev': {
    entry: resolve(root + '/index.tsx'),
    dest: resolve('dist/ReactSuperScroll.js'),
    format: 'umd',
    external: ['react', 'react-dom', 'prop-types'],
    banner
  },
  'web-prod': {
    entry: resolve(root + '/index.tsx'),
    dest: resolve('dist/ReactSuperScroll.min.js'),
    format: 'umd',
    external: ['react', 'react-dom', 'prop-types'],
    banner
  },
  'esm-dev': {
    entry: resolve(root + '/index.tsx'),
    dest: resolve('dist/ReactSuperScroll.esm.js'),
    format: 'es',
    external: ['react', 'react-dom', 'prop-types'],
    banner
  },
  'esm-pro': {
    entry: resolve(root + '/index.tsx'),
    dest: resolve('dist/ReactSuperScroll.esm.min.js'),
    format: 'es',
    external: ['react', 'react-dom', 'prop-types'],
    banner
  },
  'cjs-dev': {
    entry: resolve(root + '/index.tsx'),
    dest: resolve('dist/ReactSuperScroll.common.js'),
    format: 'cjs',
    external: ['react', 'react-dom', 'prop-types'],
    banner
  },
  'cjs-pro': {
    entry: resolve(root + '/index.tsx'),
    dest: resolve('dist/ReactSuperScroll.common.min.js'),
    format: 'cjs',
    external: ['react', 'react-dom', 'prop-types'],
    banner
  }
};

function genConfig(name) {
  const opts = builds[name];
  const config = {
    input: opts.entry,
    external: opts.external,
    output: {
      globals: {
        react: 'react',
        ReactDOM: 'react-dom',
        PropTypes: 'prop-types'
      },
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'ReactSuperScroll'
    },
    plugins: [
      resolveNode(),
      typescript({ typescript: ts }),
      babel({
        exclude: 'node_modules/**' // only transpile our source code
      }),
      replace({
        'process.env.NODE_FORMAT': JSON.stringify(opts.format),
        __version__: version
      })
    ]
  };

  return config;
}

exports.getBuild = genConfig;
exports.getAllBuilds = () => Object.keys(builds).map(genConfig);
