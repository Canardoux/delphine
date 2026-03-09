// ***************************  The following code is a duplicate from the Custom Editor *******************************
// **************************** We should use a shared code. TODO ******************************************************
import { parse } from 'parse5';
import * as prettier from 'prettier';
import type {
        Document as DefaultTreeDocument,
        Element as DefaultTreeElement,
        Node as DefaultTreeNode,
        //ParentNode as DefaultTreeParentNode,
        TextNode as DefaultTreeTextNode
} from 'parse5/dist/tree-adapters/default';

/**
 * Result of the HTML split for GrapesJS
 */
export interface GrapesInput {
        cssText: string;
        bodyInnerHtml: string;
        bodyAttrs: string;
}

/**
 * Result of the HTML split for GrapesJS
 */
export interface GrapesInput {
        cssText: string;
        bodyInnerHtml: string;
        bodyAttrs: string;
}

// --- Small helpers ---
function isElement(n: DefaultTreeNode, tag: string): n is DefaultTreeElement {
        return (n as any).nodeName === tag;
}

function childNodes(n: DefaultTreeNode): DefaultTreeNode[] {
        return ((n as any).childNodes ?? []) as DefaultTreeNode[];
}

function findFirst(node: DefaultTreeNode, pred: (n: DefaultTreeNode) => boolean): DefaultTreeNode | null {
        if (pred(node)) return node;
        for (const ch of childNodes(node)) {
                const found = findFirst(ch, pred);
                if (found) return found;
        }
        return null;
}

function findAll(node: DefaultTreeNode, pred: (n: DefaultTreeNode) => boolean, acc: DefaultTreeNode[] = []): DefaultTreeNode[] {
        if (pred(node)) acc.push(node);
        for (const ch of childNodes(node)) {
                findAll(ch, pred, acc);
        }
        return acc;
}

function extractStyleText(styleEl: DefaultTreeElement): string {
        // In parse5 default tree, <style> content is usually a single TextNode with `.value`
        const texts = childNodes(styleEl).filter((n) => (n as any).nodeName === '#text') as DefaultTreeTextNode[];
        return texts.map((t) => t.value ?? '').join('');
}

function extractBodyParts(fullHtml: string): { bodyAttrs: string; bodyInnerHtml: string } {
        const m = fullHtml.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
        if (!m) return { bodyAttrs: '', bodyInnerHtml: fullHtml };

        const bodyAttrs = (m[1] ?? '').trim();
        const bodyInnerHtml = (m[2] ?? '').trim();
        return { bodyAttrs, bodyInnerHtml };
}

// --- Main ---
export function splitHtmlForGrapes(fullHtml: string): GrapesInput {
        const doc = parse(fullHtml) as DefaultTreeDocument;

        const { bodyAttrs, bodyInnerHtml } = extractBodyParts(fullHtml);

        const headNode = findFirst(doc as any, (n) => isElement(n, 'head')) as DefaultTreeElement | null;
        const styleNodes = headNode ? (findAll(headNode, (n) => isElement(n, 'style')) as DefaultTreeElement[]) : [];

        const cssText = styleNodes
                .map((el) => extractStyleText(el).trim())
                .filter(Boolean)
                .join('\n\n');

        return {
                bodyInnerHtml,
                bodyAttrs,
                cssText: cssText.trim()
        };
}

// ********************************************************************************************************
