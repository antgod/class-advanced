import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default {
    moduleName: 'Animals',
    input: 'test.js',
    output: {
      file: 'bundle.js',
      format: 'umd'
    },
    plugins: [
        resolve({
            browser: true,
        }),
        json(),
        commonjs(),
    ],
    sourceMap: false,
};
