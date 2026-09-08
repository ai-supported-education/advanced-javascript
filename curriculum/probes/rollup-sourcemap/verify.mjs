import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { TraceMap, originalPositionFor } from "@jridgewell/trace-mapping";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
const output = `${repositoryRoot}.authoring/probes/rollup-sourcemap/dist/index.js`;
const code = await readFile(output, "utf8");
const rawMap = JSON.parse(await readFile(`${output}.map`, "utf8"));
const generatedLines = code.split("\n");
const generatedLineIndex = generatedLines.findIndex((line) =>
  line.includes("return `hello, ${name}`")
);

if (generatedLineIndex < 0) {
  throw new Error("Final bundle does not contain the probe return statement.");
}

const generatedColumn = generatedLines[generatedLineIndex].indexOf("return");
const original = originalPositionFor(new TraceMap(rawMap), {
  line: generatedLineIndex + 1,
  column: generatedColumn
});

if (!original.source?.endsWith("entry.ts") || original.line !== 2) {
  throw new Error(`Expected mapping to entry.ts:2, received ${JSON.stringify(original)}.`);
}
if (!rawMap.sourcesContent?.some((source) => source.includes("formatGreeting(name: string)"))) {
  throw new Error("Final source map does not preserve the TypeScript source content.");
}
if (code.includes("name: string")) {
  throw new Error("Rollup received TypeScript syntax instead of emitted JavaScript.");
}

console.log(JSON.stringify({
  generated: `${generatedLineIndex + 1}:${generatedColumn}`,
  original,
  sourcesContent: true
}));
