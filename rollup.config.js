import typescript from "rollup-plugin-typescript2"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"

const plugins = [
  resolve(),
  commonjs(),
  typescript({
    typescript: require("typescript"),
    useTsconfigDeclarationDir: true,
  }),
]

export default [
  {
    input: "src/extension/index.ts",
    output: [{ file: "dist/extension/index.js", format: "cjs" }],
    plugins,
  },
  {
    input: "src/node/index.ts",
    output: [{ file: "dist/node/index.js", format: "cjs" }],
    plugins,
  },
]
