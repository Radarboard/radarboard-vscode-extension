import * as cp from "node:child_process";
import * as vscode from "vscode";

export interface CliResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

export function cliPath(): string {
  return vscode.workspace.getConfiguration("radarboardExtensions").get("cliPath", "radarboard-extension");
}

export function radarboardPath(): string | undefined {
  return vscode.workspace.getConfiguration("radarboardExtensions").get("radarboardPath", "") || undefined;
}

export function workspaceCwd(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

export function runCli(args: string[], cwd = workspaceCwd()): Promise<CliResult> {
  return new Promise((resolve) => {
    const child = cp.spawn(cliPath(), args, { cwd, shell: process.platform === "win32" });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += String(chunk)));
    child.stderr.on("data", (chunk) => (stderr += String(chunk)));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}
