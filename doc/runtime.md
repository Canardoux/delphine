# Delphine Runtime Specification

## Overview

The Delphine runtime is responsible for transforming a `.dform` file into a live UI.

Its core responsibility is:

    buildComponentTree()

This function creates an object tree from the declarative HTML template.

---

## Runtime Responsibilities

The runtime handles:

- Parsing `.dform`
- Building the component tree
- Instantiating components
- Binding properties
- Connecting events
- Synchronizing with the DOM

---

## Input

The runtime receives:

- template (HTML string)
- style (CSS string)
- TypeScript class (e.g. MainForm)

---

## Output

The runtime produces:

- a root component instance (`TForm`)
- a full component tree
- a synchronized DOM

---

## 1. Build Process

### Step 1: Parse Template

The `<template>` content is parsed into a DOM tree.

Example:

    <div data-delphine-component="TForm">
        <button data-delphine-component="TButton"></button>
    </div>

---

### Step 2: Walk DOM Tree

The runtime walks the DOM recursively.

For each node:

- check if `data-delphine-component` exists
- if yes → create a component
- if no → treat as passive DOM node

---

### Step 3: Instantiate Components

For each component node:

    const instance = new TButton()

The mapping is:

    data-delphine-component → class constructor

---

### Step 4: Link Parent / Children

Each component is attached to its parent:

    parent.addChild(child)

This builds the full component tree.

---

### Step 5: Attach DOM Element

Each component keeps a reference to its DOM node:

    component.element = domNode

---

### Step 6: Register Component

If the node has:

    data-delphine-name="button1"

It is added to the registry:

    registry["button1"] = component

---

### Step 7: Apply Properties

Properties are applied in this order:

1. `data-delphine-props` (JSON)
2. individual attributes (override)

Example:

    data-delphine-props='{"caption":"Hello"}'
    data-delphine-caption="Hi"

Result:

    caption = "Hi"

---

### Step 8: Bind Events

Event attributes:

    data-delphine-onclick="button1_onclick"

Are bound to the instance method:

    formInstance.button1_onclick

---

### Step 9: Finalize Tree

The root component becomes:

    form.rootComponent

The registry is fully populated.

---

## 2. Component Lifecycle

### Creation

    constructor()

Called when component is instantiated.

---

### Initialization

After properties are applied:

    onCreate()

Optional hook.

---

### DOM Ready

After full tree is built:

    onShown()

Optional hook.

---

## 3. Property System

Properties are defined as getters/setters.

Example:

    set caption(value) {
        this._caption = value;
        this.element.textContent = value;
    }

---

## Core Rule

> Component state drives the DOM.

NOT the opposite.

---

## 4. Registry

Each form maintains a registry:

    componentRegistry: Map<string, TComponent>

Usage:

    const btn = this.componentRegistry.get("button1")

---

## 5. Event Dispatch

When a DOM event occurs:

1. captured on element
2. routed to component
3. mapped to handler name
4. executed on form instance

---

## 6. Frames

Frames are special components.

Example:

    data-delphine-component="THostFrame"

Behavior:

- loads another `.dform`
- builds a nested component tree
- embeds it

---

## 7. Synchronization

### Component → DOM

Automatic via setters.

### DOM → Component

Only via:

- events
- explicit parsing

---

## 8. Error Handling

Runtime must handle:

- unknown component types
- missing handlers
- invalid JSON props

Strategy:

- log warnings
- continue execution

---

## 9. Performance Considerations

- Tree build is O(n)
- DOM reuse should be preferred
- avoid unnecessary re-renders

---

## 10. Design Constraints

- No Virtual DOM
- No reactive template engine
- No hidden magic

Everything must be:

- explicit
- traceable
- debuggable

---

## 11. Debugging Model

The runtime should allow:

- inspecting component tree
- inspecting registry
- logging lifecycle events

---

## 12. Summary

The Delphine runtime:

- transforms HTML into objects
- builds a component tree
- binds logic from TypeScript
- synchronizes with the DOM

It is the core engine of Delphine.

Everything else (editor, preview, tooling) is built around it.
