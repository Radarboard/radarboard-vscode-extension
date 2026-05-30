import * as assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import * as vscode from "vscode";

export async function run(): Promise<void> {
  try {
    const extension = vscode.extensions.getExtension("radarboard.radarboard-extensions");
    assert.ok(extension, "Radarboard extension should be installed in the test host");
    await extension.activate();

    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes("radarboardExtensions.validateCurrent"));
    assert.ok(commands.includes("radarboardExtensions.startDevSession"));

    if (process.env.RADARBOARD_VSCODE_TEST_RESULT) {
      await writeFile(process.env.RADARBOARD_VSCODE_TEST_RESULT, "ok");
    }
  } finally {
    await vscode.commands.executeCommand("workbench.action.quit");
  }
}
