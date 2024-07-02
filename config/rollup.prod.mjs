import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
// import { uglify } from "rollup-plugin-uglify";
import terser from '@rollup/plugin-terser'

export default {
    input: 'src/main.js',
    output: [
        {
            name: "OlFast",
            file: "dist/esm/OlFast.js",
            format: 'es',
            sourcemap: true,
        },
        {
            name: "OlFast",
            file: "dist/umd/OlFast.js",
            format: 'umd',
            sourcemap: true,
        }
    ],
    plugins: [
        resolve({
            browser: true,
        }),
        json(),
        commonjs(),
        babel({
            exclude: 'node_modules/**',
        }),
        // uglify(),
        terser(),
        cleanup()
    ],
    external: ['ol']
};