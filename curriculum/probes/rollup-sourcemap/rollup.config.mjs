import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
const input = `${repositoryRoot}.authoring/probes/rollup-sourcemap/tsc/entry.js`;
const output = `${repositoryRoot}.authoring/probes/rollup-sourcemap/dist/index.js`;

function emittedTypeScriptSourceMap() {
  return {
    name: "emitted-typescript-source-map",
    async load(id) {
      if (id !== input) return null;

      const [code, rawMap] = await Promise.all([
        readFile(id, "utf8"),
        readFile(`${id}.map`, "utf8")
      ]);

      return {
        code: code.replace(/\n?\/\/# sourceMappingURL=.*$/u, ""),
        map: JSON.parse(rawMap)
      };
    }
  };
}

export default {
  input,
  plugins: [emittedTypeScriptSourceMap()],
  output: {
    file: output,
    format: "es",
    sourcemap: true
  }
};
