import { runTests } from "@vscode/test-electron";
import * as path from "node:path";

async function main() {
  const extensionDevelopmentPath = path.resolve(__dirname, "../../");
  const extensionTestsPath = path.resolve(__dirname, "./suite");
  await runTests({ extensionDevelopmentPath, extensionTestsPath });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
