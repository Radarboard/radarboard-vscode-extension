# Radarboard Extensions for VS Code

First-class VS Code helper for building Radarboard community integrations, plugins, and widgets.

## Features

- Create Radarboard extensions from the editor.
- Connect a local extension repo to a Radarboard source checkout.
- Start a dev session and open the correct sandbox.
- Run validation and submission checks.
- Show validation output in VS Code Problems.
- Browse current extension status in a Radarboard sidebar.

## Requirements

- Node.js 20+
- pnpm
- A local Radarboard source checkout for dev sessions
- The `radarboard-extension` CLI available on PATH, or configured via `radarboardExtensions.cliPath`

## Quickstart

1. Install dependencies:

   ```bash
   pnpm install
   pnpm compile
   ```

2. Open this repo in VS Code and run `F5` to launch an Extension Development Host.

3. In a Radarboard extension workspace, run:

   - `Radarboard: Create Extension`
   - `Radarboard: Connect to Radarboard Dev App`
   - `Radarboard: Start Dev Session`
   - `Radarboard: Run Submission Check`

4. Configure settings when needed:

   ```json
   {
     "radarboardExtensions.cliPath": "radarboard-extension",
     "radarboardExtensions.radarboardPath": "../radarboard"
   }
   ```

## Commands

- `Radarboard: Create Extension`
- `Radarboard: Connect to Radarboard Dev App`
- `Radarboard: Start Dev Session`
- `Radarboard: Validate Current Extension`
- `Radarboard: Run Submission Check`
- `Radarboard: Open Sandbox`
- `Radarboard: Open Developer Docs`

## Validation

```bash
pnpm compile
pnpm test
pnpm package
```
