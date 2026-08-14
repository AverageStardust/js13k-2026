import { defineConfig } from "vite";
import typescriptPlugin from "@rollup/plugin-typescript";
import { terserOptions } from "./terser.config";
import ws from "vite-plugin-ws";
import setupEchoServer from "./echoServer";
import roadrollerPlugin from "./roadrollerPlugin";
import ectPlugin from "./etcPlugin";

export default defineConfig(({ command, mode }) => {
    const config: any = {
        server: {
            port: 3000,
        },
        plugins: [
            typescriptPlugin({ outputToFilesystem: false }),
            ws({
                path: "/ws",
                setup: setupEchoServer,
            }),
        ],
    };

    if (command === "build") {
        config.esbuild = false;
        config.base = "";
        config.build = {
            minify: "terser",
            target: "es2022",
            modulePreload: { polyfill: false },
            assetsInlineLimit: 800,
            assetsDir: "",
            rollupOptions: {
                output: {
                    inlineDynamicImports: true,
                    manualChunks: undefined,
                    assetFileNames: `[name].[ext]`,
                },
            },
            terserOptions: terserOptions,
        };
        config.plugins = [
            typescriptPlugin({ outputToFilesystem: false }),
            roadrollerPlugin(),
            ectPlugin(),
        ];
    }

    return config;
});
