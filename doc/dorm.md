# Delphine Form File Specification (.dform)

## Overview

A `.dform` file defines a Delphine Form using a structured, human-readable format.

It combines three concerns in a single file:

- Metadata (`<delphine>`)
- Styling (`<style>`)
- UI structure (`<template>`)

This format is intentionally inspired by HTML-based component systems, while remaining fully independent from any specific framework (Vue, Svelte, React, etc.).

---

## File Structure

A valid `.dform` file MUST follow this structure:

    <delphine ...></delphine>

    <style>
        ...
    </style>

    <template>
        ...
    </template>

### Order

The order of sections MUST be:

1. `<delphine>`
2. `<style>` (optional)
3. `<template>` (required)

---

## 1. `<delphine>` Tag (Metadata)

### Purpose

Defines metadata about the form.

### Example

    <delphine
        version="1.0"
        class="MainForm"
        name="MainForm">
    </delphine>

### Attributes

| Attribute | Required | Description |
|----------|--------|------------|
| version | Yes | Format version |
| class   | Yes | Associated TypeScript class name |
| name    | Recommended | Logical form name |

### Notes

- This tag MUST be present exactly once
- It MUST NOT contain child nodes

---

## 2. `<style>` Tag (CSS)

### Purpose

Defines styles applied to the form.

### Example

    <style>
    #button1 {
        color: red;
    }
    </style>

### Rules

- Optional (but recommended)
- Contains standard CSS
- Applied globally within the form scope

---

## 3. `<template>` Tag (UI Structure)

### Purpose

Defines the UI structure of the form.

### Example

    <template>
        <div
            data-delphine-component="TForm"
            id="MainForm"
            data-delphine-name="MainForm">

            <button
                data-delphine-component="TButton"
                data-delphine-name="button1">
                Click me
            </button>

        </div>
    </template>

---

## Core Rule

The `<template>` tag is a container only.  
The actual root component MUST be a real HTML element inside it.

---

## Component Model

Each UI component is defined using HTML elements with `data-delphine-*` attributes.

### Required Attribute

    data-delphine-component="TButton"

### Common Attributes

| Attribute | Description |
|----------|------------|
| data-delphine-component | Component class |
| data-delphine-name | Instance name |
| data-delphine-props | JSON-encoded properties |
| data-delphine-onclick | Event handler |

---

## Example Component

    <button
        data-delphine-component="TButton"
        data-delphine-name="button1"
        data-delphine-props='{
            "caption": "Hello",
            "enabled": true
        }'
        data-delphine-onclick="button1_onclick">
        Hello
    </button>

---

## Root Component

The root component MUST:

- Be inside `<template>`
- Have `data-delphine-component="TForm"`

### Example

    <template>
        <div data-delphine-component="TForm">
            ...
        </div>
    </template>

---

## Event Binding

Events are declared via attributes:

    data-delphine-onclick="handlerName"

They map to TypeScript methods:

    handlerName(ev: Event, sender: TControl) {
        ...
    }

---

## Relationship with TypeScript

Each `.dform` file MUST be paired with a `.ts` file:

    MainForm.dform
    MainForm.ts

The `class` attribute in `<delphine>` MUST match the exported class:

    export class MainForm extends TForm {
    }

---

## Design Principles

### 1. Framework Independence

The `.dform` format MUST NOT depend on:

- Vue
- React
- Svelte

### 2. HTML Compatibility

The `<template>` content MUST remain valid HTML.

### 3. Tooling Friendly

The format is designed to:

- Work with GrapesJS
- Be human-readable
- Be machine-parsable

### 4. Explicit Component Model

All components are explicitly defined via:

    data-delphine-component

No implicit behavior.

---

## Validation Rules

A `.dform` file is valid if:

- Contains exactly one `<delphine>`
- Contains exactly one `<template>`
- `<template>` contains a root `TForm`
- JSON inside `data-delphine-props` is valid
- Component names are unique within a form

---

## Future Extensions

Possible future additions:

- `<script>` section
- scoped styles
- layout metadata
- schema versioning

---

## Summary

The `.dform` format is:

- Simple
- Explicit
- Framework-agnostic
- Designed for visual editing and code integration

It is the foundation of the Delphine UI system.
