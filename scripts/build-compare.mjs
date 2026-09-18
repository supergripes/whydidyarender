// Builds both React Compiler variants (on/off) into dist/compiled and
// dist/uncompiled, then drops the compare.html shell in as dist/index.html
// so the two can be viewed side by side, each in its own iframe.
import { execSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });

run("npm run build:compiled");
run("npm run build:uncompiled");

cpSync("compare.html", "dist/index.html");

console.log("\nCompare build ready in dist/. Run `npm run preview` to view it.");

function run(command) {
  console.log(`\n$ ${command}`);
  execSync(command, { stdio: "inherit" });
}
