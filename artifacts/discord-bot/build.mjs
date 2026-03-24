import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/index.mjs",
  format: "esm",
  platform: "node",
  target: "node20",
  sourcemap: true,
  external: ["pg-native"],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
});

console.log("Build complete.");
