# Delphine Runtime, Preview and Editor Architecture

This document explains how Delphine executes Forms and Apps across the different environments:

- VSCode Webview
- External Browser
- App Runtime

It clarifies the roles of each file and how control flows through the system.

---

# 1. Big Picture

Delphine has two main worlds:

## 1.1 VSCode Extension Side

This is the Node / Extension Host side.

Responsibilities:

- register VSCode commands
- build and manage TreeViews
- resolve Projects / Apps / Forms
- start and reuse Vite dev servers
- build URLs for Preview and Run App
- create Webview panels

Typical files:

- `src/extension/extension.ts`
- `src/extension/ViteServerManager.ts`
- `src/extension/projectModel.ts`
- `src/extension/loadForm.ts`

---

## 1.2 Browser Runtime Side

This is the browser side, executed either:

- inside a VSCode Webview iframe
- or inside an external browser

Responsibilities:

- read query parameters from the URL
- dynamically import Form TypeScript modules
- fetch Form HTML
- instantiate Forms
- call `show()`

Typical files:

- `runtime/previewRuntime.ts`
- `runtime/appRuntime.ts`

---

# 2. Core Idea

The extension does **not** execute the Form.

The extension only:

1. resolves what should run
2. ensures the Vite server is running
3. opens the correct URL

Then the browser runtime does the actual work.

A simple mental model:

    VSCode command
        ↓
    Extension resolves target
        ↓
    Extension builds URL
        ↓
    Browser/Webview loads URL
        ↓
    Runtime script executes
        ↓
    Form TS + HTML loaded dynamically
        ↓
    Form instance created
        ↓
    form.show()

---

# 3. Main Execution Modes

There are three important modes:

- Preview in VSCode
- Preview in Browser
- Run App

---

# 4. Preview in VSCode

## 4.1 User action

The user triggers:

- `Preview`

typically from:

- a Form item
- a Form file item
- sometimes from the current editor

---

## 4.2 Extension side flow

The extension:

1. resolves the target Form
2. resolves the current project root
3. ensures the Vite server is running
4. builds a preview URL
5. creates a VSCode Webview panel
6. loads the preview URL inside an iframe

Typical URL:

`http://127.0.0.1:5173/preview.html?app=MainApp&form=Riri`

---

## 4.3 Browser runtime flow

Inside the iframe:

- `preview.html` is loaded
- `preview.html` loads `runtime/previewRuntime.ts`
- `previewRuntime.ts` reads:
  - `app`
  - `form`
- it computes:
  - TS module path
  - HTML path
- it imports the TS module
- it fetches the HTML file
- it injects HTML into `#app`
- it instantiates the Form class
- it calls `form.show()`

---

# 5. Preview in Browser

This mode is almost identical to Preview in VSCode.

The difference is only the container:

- VSCode Preview -> inside Webview iframe
- Browser Preview -> inside external browser window/tab

Everything else is the same.

Flow:

    User clicks "Preview in Browser"
        ↓
    Extension resolves Form
        ↓
    Extension ensures Vite server
        ↓
    Extension opens external URL
        ↓
    Browser loads preview.html
        ↓
    previewRuntime.ts runs

Typical URL:

`http://127.0.0.1:5173/preview.html?app=MainApp&form=Riri`

---

# 6. Run App

Run App is different from Form Preview.

Instead of loading a specific Form directly, it loads an App first.

---

## 6.1 User action

The user triggers:

- `Run App`

typically from:

- an App item
- a Form item
- a Form file item

---

## 6.2 Extension side flow

The extension:

1. resolves the target App
2. resolves the project root
3. ensures the Vite server is running
4. builds an app URL
5. opens the URL in the browser

Typical URL:

`http://127.0.0.1:5173/app.html?app=MainApp`

---

## 6.3 Browser runtime flow

Inside the browser:

- `app.html` is loaded
- `app.html` loads `runtime/appRuntime.ts`
- `appRuntime.ts` reads the `app` parameter
- it loads:
  - `/src/apps/<AppName>/app.json`
- it extracts:
  - `mainForm`
- then it dynamically loads:
  - the main Form TS module
  - the main Form HTML
- it injects HTML into `#app`
- it instantiates the Form
- it calls `form.show()`

---

# 7. File Roles

This section explains the role of each confusing file.

---

## 7.1 `runtime/previewRuntime.ts`

Purpose:

- execute a single Form preview

Responsibilities:

- read `?app=...&form=...`
- compute paths for:
  - `Form.ts`
  - `Form.html`
- dynamically import the TS module
- fetch the HTML
- instantiate the Form
- call `show()`

This file is used by:

- Preview in VSCode
- Preview in Browser

---

## 7.2 `runtime/appRuntime.ts`

Purpose:

- execute a full App

Responsibilities:

- read `?app=...`
- load `app.json`
- find `mainForm`
- load the main Form dynamically
- instantiate it
- call `show()`

This file is used by:

- Run App

---

## 7.3 `preview.html`

Purpose:

- host page for Form preview

It usually contains:

- a `<div id="app"></div>`
- a script tag pointing to `runtime/previewRuntime.ts`

Example:

    <!doctype html>
    <html>
      <body>
        <div id="app"></div>
        <script type="module" src="/runtime/previewRuntime.ts"></script>
      </body>
    </html>

---

## 7.4 `app.html`

Purpose:

- host page for App execution

It usually contains:

- a `<div id="app"></div>`
- a script tag pointing to `runtime/appRuntime.ts`

Example:

    <!doctype html>
    <html>
      <body>
        <div id="app"></div>
        <script type="module" src="/runtime/appRuntime.ts"></script>
      </body>
    </html>

---

## 7.5 `src/extension/ViteServerManager.ts`

Purpose:

- manage Vite dev servers

Responsibilities:

- start Vite when needed
- reuse an existing Vite server for the same project
- detect the port from stdout
- build preview URLs
- build app URLs

This is the bridge between the extension and the browser runtime.

---

## 7.6 `src/extension/projectModel.ts`

Purpose:

- be the single source of truth for resolving:
  - Projects
  - Apps
  - Forms
  - sibling files (`.html`, `.ts`, `.css`)

Responsibilities:

- normalize command input into a `vscode.Uri`
- resolve App from:
  - App item
  - Form item
  - Form file
  - editor selection
- resolve Form from:
  - Form item
  - Form file
  - editor selection

This file should contain all path and hierarchy logic.

Important rule:

> do not duplicate resolve logic anywhere else

---

## 7.7 `src/extension/loadForm.ts`

Purpose:

- helper utilities for Form loading / sibling resolution

Depending on the current refactoring stage, this file may:

- remain as a thin wrapper around `projectModel.ts`
- or disappear completely

Long-term recommendation:

- keep resolution logic centralized in `projectModel.ts`

---

## 7.8 `src/extension/extension.ts`

Purpose:

- the main VSCode extension entry point

Responsibilities:

- register commands
- register TreeViews
- create Webview panels
- connect commands to runtime orchestration

This file should stay relatively light.

It should not contain duplicated business logic.

---

## 7.9 `preview/PreviewPanel.ts`

Purpose:

- older or generic preview panel management layer

Depending on the current state of the project, this file may be:

- still in use
- partly superseded by newer runtime panel code

This is one of the areas that may need cleanup.

---

## 7.10 `Panel/RuntimePreviewPanel.ts`

Purpose:

- create the runtime-oriented Preview panel in VSCode

Responsibilities usually include:

- create a Webview panel
- inject an iframe
- load the correct preview URL inside it

This is a UI container, not a runtime executor.

Important distinction:

- `RuntimePreviewPanel.ts` does not execute the Form
- it only displays a page that will execute the Form

---

## 7.11 `bootPreview`

Purpose:

- initialize preview-specific Webview behavior

Depending on the historical stage of the project, it may be responsible for:

- bootstrapping the Preview Webview
- acquiring VSCode Webview APIs
- installing communication hooks

This file belongs to the VSCode Webview boot layer.

---

## 7.12 `bootBridge`

Purpose:

- communication bootstrap between Webview and extension

Typical responsibilities:

- set up `acquireVsCodeApi()`
- establish message passing
- transport events between browser UI and extension side

This is not the business runtime.
It is the communication layer.

---

# 8. What Executes What?

This is the most important part.

---

## 8.1 Preview in VSCode

    User clicks "Preview"
        ↓
    extension.ts command handler
        ↓
    projectModel.ts resolves Form
        ↓
    ViteServerManager.ts ensures Vite
        ↓
    Extension builds:
        http://127.0.0.1:<port>/preview.html?app=...&form=...
        ↓
    RuntimePreviewPanel.ts creates Webview
        ↓
    Webview iframe loads preview.html
        ↓
    preview.html loads runtime/previewRuntime.ts
        ↓
    previewRuntime.ts imports Form.ts and fetches Form.html
        ↓
    Form instance created
        ↓
    form.show()

---

## 8.2 Preview in Browser

    User clicks "Preview in Browser"
        ↓
    extension.ts command handler
        ↓
    projectModel.ts resolves Form
        ↓
    ViteServerManager.ts ensures Vite
        ↓
    Extension opens:
        http://127.0.0.1:<port>/preview.html?app=...&form=...
        ↓
    Browser loads preview.html
        ↓
    previewRuntime.ts executes
        ↓
    Form instance created
        ↓
    form.show()

---

## 8.3 Run App

    User clicks "Run App"
        ↓
    extension.ts command handler
        ↓
    projectModel.ts resolves App
        ↓
    ViteServerManager.ts ensures Vite
        ↓
    Extension opens:
        http://127.0.0.1:<port>/app.html?app=...
        ↓
    Browser loads app.html
        ↓
    app.html loads runtime/appRuntime.ts
        ↓
    appRuntime.ts loads app.json
        ↓
    appRuntime.ts resolves mainForm
        ↓
    appRuntime.ts imports Form.ts and fetches Form.html
        ↓
    Form instance created
        ↓
    form.show()

---

# 9. Why `show()` Matters

`show()` is not just a visual helper.

In Delphine, `show()` is the real lifecycle entry point.

Typical responsibilities of `TForm.show()`:

- resolve the root element
- build the component tree
- call `onCreate()`
- install the event router
- mark the Form as mounted
- call `onShown()`

Because of that:

> the runtime should prepare the DOM, then call `form.show()`

It should not bypass `show()` unless there is a very good reason.

---

# 10. Why There Was Confusion

The confusion comes from the fact that Delphine currently has several stacked layers:

- VSCode extension command layer
- TreeView / item resolution layer
- Vite server orchestration layer
- Webview panel layer
- browser runtime layer
- legacy boot / bridge files

These layers are all valid, but their boundaries must remain clear.

The key distinction is:

## Extension side

Responsible for deciding **what to run**

## Browser runtime side

Responsible for **actually running it**

---

# 11. Common Failure Modes

## 11.1 Hardcoded App name

Bad:

`const appConfigUrl = '/src/apps/MainApp/app.json';`

Good:

`const appConfigUrl = \`/src/apps/\${appName}/app.json\`;`

---

## 11.2 Hardcoded old Form hierarchy

Bad:

`/src/forms/${formName}.form/${formName}.ts`

Good:

`/src/apps/${appName}/forms/${formName}.form/${formName}.ts`

---

## 11.3 Duplicate resolve logic

If `resolveForm`, `resolveApp`, `resolveHtmlUri`, etc. exist in several files, bugs appear quickly.

Recommendation:

- keep them only in `projectModel.ts`

---

## 11.4 Vite not installed

Typical symptom:

`sh: vite: command not found`

Meaning:

- `npm install` was not run in the newly created project

---

## 11.5 Wrong runtime path in HTML

Bad:

`<script type="module" src="/src/runtime/previewRuntime.ts"></script>`

if the real file is in:

`runtime/previewRuntime.ts`

Good:

`<script type="module" src="/runtime/previewRuntime.ts"></script>`

---

# 12. Recommended Cleanup Direction

To keep the system understandable, the long-term direction should be:

## Keep

- `extension.ts`
- `projectModel.ts`
- `ViteServerManager.ts`
- `runtime/previewRuntime.ts`
- `runtime/appRuntime.ts`

## Gradually simplify or merge

- `loadForm.ts`
- `PreviewPanel.ts`
- `RuntimePreviewPanel.ts`
- boot files if they overlap too much

The goal is not to delete aggressively.
The goal is to have one clear responsibility per file.

---

# 13. Architecture Diagram

    ┌──────────────────────────────┐
    │        VSCode User           │
    │  Preview / Run App / Editor  │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │       extension.ts           │
    │ registers commands           │
    │ handles UI actions           │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │      projectModel.ts         │
    │ resolveProject / App / Form  │
    └──────────────┬───────────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │   ViteServerManager.ts       │
    │ start/reuse Vite             │
    │ build preview/app URLs       │
    └──────────────┬───────────────┘
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
    ┌───────────────┐  ┌────────────────┐
    │ VSCode Webview│  │ External Browser│
    └───────┬───────┘  └────────┬───────┘
            │                   │
            └────────┬──────────┘
                     ▼
           ┌──────────────────────┐
           │ preview.html/app.html│
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │ previewRuntime.ts or │
           │ appRuntime.ts        │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │ dynamic TS import    │
           │ + HTML fetch         │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │ Form instance        │
           │ form.show()          │
           └──────────────────────┘

---

# 14. Final Mental Model

A short version for new developers:

> Delphine is a VSCode orchestration layer on top of a browser runtime.
>
> The extension decides what to execute.
> The browser runtime actually executes it.
>
> Preview loads one Form.
> Run App loads one App, then its main Form.

That is the essential rule.

---

# 15. Suggested Future Documentation Files

This document could later be split into:

- `docs/runtime-architecture.md`
- `docs/treeview-and-commands.md`
- `docs/project-structure.md`
- `docs/plugins.md`

But for now, keeping everything in a single overview document is perfectly fine.


# Delphine Execution Flow Diagram

    User action
      ├─ Preview
      │    └─ extension command
      │         └─ resolve Form
      │              └─ ensure Vite
      │                   └─ open preview URL
      │                        └─ previewRuntime.ts
      │                             └─ load Form.ts + Form.html
      │                                  └─ form.show()
      │
      ├─ Preview in Browser
      │    └─ same runtime as Preview
      │
      └─ Run App
           └─ extension command
                └─ resolve App
                     └─ ensure Vite
                          └─ open app URL
                               └─ appRuntime.ts
                                    └─ load app.json
                                         └─ get mainForm
                                              └─ load Form.ts + Form.html
                                                   └─ form.show()
