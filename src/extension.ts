import * as vscode from "vscode";
import { updateDiagnostics } from "./diagnostics";
import { radarboardPath, runCli, workspaceCwd } from "./cli";
import { StatusTreeProvider } from "./status-tree";

export function activate(context: vscode.ExtensionContext) {
  const tree = new StatusTreeProvider();
  const diagnostics = vscode.languages.createDiagnosticCollection("radarboard-extensions");
  context.subscriptions.push(diagnostics);
  context.subscriptions.push(vscode.window.registerTreeDataProvider("radarboardExtensions.status", tree));

  async function runAndShow(args: string[], title: string) {
    const result = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title, cancellable: false }, () => runCli(args));
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    tree.setStatus(output.split("\n").filter(Boolean).slice(0, 8));
    updateDiagnostics(diagnostics, output);
    if (result.code === 0) vscode.window.showInformationMessage(title + " completed");
    else vscode.window.showErrorMessage(title + " failed. See Radarboard status view and Problems.");
    return result;
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("radarboardExtensions.createExtension", async () => {
      const type = await vscode.window.showQuickPick(["integration", "plugin", "widget", "package"], { placeHolder: "Extension type" });
      if (!type) return;
      const name = await vscode.window.showInputBox({ prompt: "Extension name", placeHolder: "github-releases" });
      if (!name) return;
      const args = type === "package" ? ["create", "package", name, "--integration", "--plugin", "--widget"] : ["create", "package", name, "--" + type];
      await runAndShow(args, "Create Radarboard Extension");
    }),
    vscode.commands.registerCommand("radarboardExtensions.connectDevApp", async () => {
      const radarboard = radarboardPath() ?? (await vscode.window.showInputBox({ prompt: "Path to Radarboard checkout" }));
      if (!radarboard) return;
      await runAndShow(["connect", "--radarboard", radarboard], "Connect Radarboard Dev App");
    }),
    vscode.commands.registerCommand("radarboardExtensions.startDevSession", async () => {
      const radarboard = radarboardPath() ?? (await vscode.window.showInputBox({ prompt: "Path to Radarboard checkout" }));
      if (!radarboard) return;
      await runAndShow(["dev", "--radarboard", radarboard], "Start Radarboard Dev Session");
    }),
    vscode.commands.registerCommand("radarboardExtensions.validateCurrent", () => runAndShow(["validate"], "Validate Radarboard Extension")),
    vscode.commands.registerCommand("radarboardExtensions.submitCheck", () => runAndShow(["submit-check"], "Radarboard Submission Check")),
    vscode.commands.registerCommand("radarboardExtensions.openSandbox", () => vscode.env.openExternal(vscode.Uri.parse("http://localhost:1355/debug/widget-sandbox"))),
    vscode.commands.registerCommand("radarboardExtensions.openDocs", () => vscode.env.openExternal(vscode.Uri.parse("https://docs.radarboard.app/developer-guide/community-extensions")))
  );

  tree.setStatus(["Workspace: " + (workspaceCwd() ?? "none"), "Run Radarboard: Validate Current Extension"]);
}

export function deactivate() {}
