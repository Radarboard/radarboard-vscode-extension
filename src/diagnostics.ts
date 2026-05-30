import * as vscode from "vscode";

export function updateDiagnostics(collection: vscode.DiagnosticCollection, output: string) {
  collection.clear();
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) return;

  const diagnostics: vscode.Diagnostic[] = [];
  for (const line of output.split("\n")) {
    if (!/error:/i.test(line)) continue;
    diagnostics.push(new vscode.Diagnostic(new vscode.Range(0, 0, 0, 1), line.trim(), vscode.DiagnosticSeverity.Error));
  }

  if (diagnostics.length > 0) collection.set(vscode.Uri.joinPath(folder.uri, "package.json"), diagnostics);
}
