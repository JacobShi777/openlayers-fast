import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
// import cleanup from 'rollup-plugin-cleanup';
// import { uglify } from "rollup-plugin-uglify";
// import terser from '@rollup/plugin-terser'
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

export default {
    input: 'src/main.js',
    output: [
        {
            name: "OlFast",
            file: "dist/dev/OlFast.js",
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
        // terser(),
        // cleanup(),
        
        // 本地服务器
        serve({
            open: true,
            port: 8000, 
            openPage: '/index.html', // 打开的页面
            contentBase: ''
        }),
        livereload(),
    ],
    external: ['ol']
};