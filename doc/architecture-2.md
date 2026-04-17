# Delphine Architecture Overview

## Introduction

Delphine is a UI framework inspired by Delphi/VCL, designed for modern web technologies.

Its core idea is simple:

> The UI is not the DOM.  
> The UI is an object tree.

The DOM is only a rendering target.

---

## Core Concepts

Delphine is built around four main concepts:

- Form
- Frame
- Component Tree
- Application

---

## 1. Application

The application is the entry point of a Delphine project.

File:

    src/application.ts

Responsibilities:

- Bootstraps the application
- Creates and shows forms
- Manages navigation (push/pop/replace)
- Holds global state

Example:

    const app = getApplication();
    app.createAndShow("MainForm");

---

## 2. Form

A Form is a top-level UI container (like a window or screen).

Each Form is defined by two files:

    MainForm.dform
    MainForm.ts

### MainForm.dform

Contains:

- metadata
- style
- template (UI structure)

### MainForm.ts

Contains:

- class definition
- event handlers
- runtime logic

Example:

    export class MainForm extends TForm {
        button1_onclick(ev, sender) {
            ...
        }
    }

---

## 3. Frame

A Frame is a reusable UI component composed of other components.

Structure:

    frames/
        HelloFrame.dform
        HelloFrame.ts

Frames can be embedded inside Forms using:

    data-delphine-component="THostFrame"

They behave like reusable visual modules.

---

## 4. Component Tree

The core of Delphine is the component tree.

It is built from the `<template>` section of a `.dform`.

### Process

1. Parse HTML template
2. Detect `data-delphine-component`
3. Instantiate corresponding classes
4. Build parent/child relationships
5. Bind properties and events

This process is performed by:

    buildComponentTree()

---

## Key Principle

> The component tree is the source of truth.

- The DOM reflects the component tree
- Not the opposite

---

## 5. Components

Each component:

- Is a TypeScript class
- Wraps a DOM element
- Exposes reactive properties

Example:

    button.color = "rgb(255, 0, 0)"

This updates:

- internal state
- DOM automatically (via setters)

---

## 6. Data Flow

### Component → DOM

Handled automatically via property setters.

Example:

    button.caption = "OK"

### DOM → Component

Handled via:

- event listeners
- attribute parsing

---

## 7. Event System

Events are declared in `.dform`:

    data-delphine-onclick="button1_onclick"

Resolved at runtime:

    this.button1_onclick(...)

---

## 8. Registry

Each Form maintains a component registry:

    this.componentRegistry.get("button1")

This allows:

- direct access to components
- no DOM querying required

---

## 9. Relationship with GrapesJS

GrapesJS is used as a visual editor.

It edits:

- HTML inside `<template>`
- CSS inside `<style>`

It does NOT:

- define the runtime model
- replace the component system

---

## 10. File Responsibilities

| File | Role |
|------|------|
| `.dform` | Declarative UI |
| `.ts` | Behavior and logic |
| `application.ts` | App lifecycle |

---

## 11. Design Philosophy

### Object-Oriented UI

Unlike modern frameworks:

- No Virtual DOM
- No reactive templates
- No hidden state

Instead:

- Explicit objects
- Explicit properties
- Explicit tree

---

## 12. Comparison with Web Frameworks

| Concept | Delphine | Vue/React |
|--------|--------|----------|
| UI Model | Object tree | Virtual DOM |
| Components | Classes | Functions/Objects |
| Binding | Explicit | Reactive |
| State | Instance properties | Hooks / reactive state |

---

## 13. Goals

Delphine aims to provide:

- Simplicity (like Delphi)
- Power (like modern frameworks)
- Visual editing (GrapesJS)
- Strong structure (typed components)

---

## 14. Summary

Delphine is:

- A component-based UI framework
- Built on an object tree model
- Using HTML as a declarative syntax
- With TypeScript for behavior
- And GrapesJS for visual editing

It combines:

- the clarity of Delphi
- the flexibility of the web
