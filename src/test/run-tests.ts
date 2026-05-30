import { downloadAndUnzipVSCode } from "@vscode/test-electron";
import { spawn } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";

async function main() {
  const extensionDevelopmentPath = path.resolve(__dirname, "../../");
  const extensionTestsPath = path.resolve(__dirname, "./suite");
  const resultPath = path.join(tmpdir(), `radarboard-vscode-test-${process.pid}.txt`);
  const executable = await downloadAndUnzipVSCode();
  const args = [
    "--no-sandbox",
    "--disable-gpu-sandbox",
    "--disable-updates",
    "--skip-welcome",
    "--skip-release-notes",
    "--disable-workspace-trust",
    `--extensionTestsPath=${extensionTestsPath}`,
    `--extensionDevelopmentPath=${extensionDevelopmentPath}`,
    "--extensions-dir=.vscode-test/extensions",
    "--user-data-dir=.vscode-test/user-data"
  ];

  const child = spawn(executable, args, {
    cwd: extensionDevelopmentPath,
    env: {
      ...process.env,
      RADARBOARD_VSCODE_TEST_RESULT: resultPath
    }
  });

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let successfulHostExit = false;
    let outputBuffer = "";
    let poll: NodeJS.Timeout | undefined;
    let timeout: NodeJS.Timeout | undefined;
    const finish = (error?: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeout) {
        clearTimeout(timeout);
      }
      if (poll) {
        clearInterval(poll);
      }
      if (!child.killed) {
        child.kill();
        setTimeout(() => child.kill("SIGKILL"), 500).unref();
      }
      child.unref();
      child.stdout.destroy();
      child.stderr.destroy();
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };
    poll = setInterval(async () => {
      try {
        const result = await readFile(resultPath, "utf8");
        if (result.trim() === "ok") {
          clearInterval(poll);
          await rm(resultPath, { force: true });
          finish();
        }
      } catch {
        // The result file appears only after the extension host assertions pass.
      }
    }, 100);
    timeout = setTimeout(() => {
      finish(new Error("VS Code extension smoke test timed out."));
    }, 45_000);
    const handleOutput = (chunk: Buffer, stream: NodeJS.WriteStream) => {
      const text = chunk.toString();
      stream.write(text);
      outputBuffer = `${outputBuffer}${text}`.slice(-2_000);
      const normalizedOutput = outputBuffer.replace(/\u001b\[[0-9;]*m/g, "");
      const match = normalizedOutput.match(/Extension host with pid \d+ exited with code:\s+(\d+)/);
      if (!match) {
        return;
      }
      const hostExitCode = Number(match[1]);
      if (hostExitCode === 0) {
        successfulHostExit = true;
        setTimeout(() => finish(), 250);
      } else {
        finish(new Error(`VS Code extension host failed with code ${hostExitCode}.`));
      }
    };

    child.stdout.on("data", (chunk: Buffer) => handleOutput(chunk, process.stdout));
    child.stderr.on("data", (chunk: Buffer) => handleOutput(chunk, process.stderr));
    child.on("error", finish);
    child.on("close", (code, signal) => {
      if (successfulHostExit || code === 0) {
        finish();
      } else {
        finish(new Error(`VS Code exited with ${code ?? signal}.`));
      }
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
