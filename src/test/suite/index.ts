import * as assert from "node:assert/strict";
import * as vscode from "vscode";

export async function run(): Promise<void> {
  const extension = vscode.extensions.getExtension("radarboard.radarboard-extensions");
  assert.ok(extension, "Radarboard extension should be installed in the test host");
  await extension.activate();

  const commands = await vscode.commands.getCommands(true);
  assert.ok(commands.includes("radarboardExtensions.validateCurrent"));
  assert.ok(commands.includes("radarboardExtensions.startDevSession"));
}
