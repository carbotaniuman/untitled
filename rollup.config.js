import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import bundleSize from 'rollup-plugin-bundle-size';
import vue from 'rollup-plugin-vue';

export default {
    input: 'src/index.js',
    external: ['vue'],
    plugins: [
        commonjs(),
        vue(),
        resolve(),
        bundleSize()
    ],
    output: {
        file: 'dist/vue-color.min.mjs',
        format: 'esm',
    }
};
