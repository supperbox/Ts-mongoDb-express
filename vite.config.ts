import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          axios: [
            ['default', 'axios'], // import { default as axios } from 'axios'
          ],
        },
      ],
      dirs: ['./src/stores', './src/api', './src/utils'],
      // 自动生成类型声明文件
      dts: './types/auto-imports.d.ts',
      // 解析器：按需导入 UI 库
      resolvers: [],
      //  eslint 配置
      eslintrc: {
        enabled: true, // 生成 eslint 配置
      },
    }),
    Components({
      dirs: ['src/components', 'src/views', 'src'],
      deep: true,
      dts: './types/components.d.ts',
      include: [/\.vue$/, /\.vue\?vue/],
      resolvers: [],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        // 这里可以添加全局变量或其他 LESS 配置
        // additionalData: `@import "@/styles/global.less";`,
      },
    },
  },
  server: {
    proxy: {
      // api 转接 express
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
