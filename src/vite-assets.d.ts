// src/vite-assets.d.ts

declare module '*.css?inline' {
        const cssText: string;
        export default cssText;
}
