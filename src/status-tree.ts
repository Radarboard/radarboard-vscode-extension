import * as vscode from "vscode";

export class StatusTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly emitter = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this.emitter.event;

  private items: vscode.TreeItem[] = [];

  setStatus(lines: string[]) {
    this.items = lines.map((line) => new vscode.TreeItem(line));
    this.emitter.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    return this.items.length > 0 ? this.items : [new vscode.TreeItem("No Radarboard extension detected")];
  }
}
