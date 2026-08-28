import * as vscode from 'vscode';
import type { DelphineFrameConfig } from './config/DelphineAppConfig';
import { loadDelphineFrame } from './loadDelphineFrame';
import { extractDelphineSection, extractLitTemplateSection } from './delphineSections';

async function loadFrameLayoutOnly(frameUri: vscode.Uri): Promise<string | undefined> {
        const document = await vscode.workspace.openTextDocument(frameUri);
        const source = document.getText();

        if (!source.includes('// <delphine:layout>') || !source.includes('// </delphine:layout>')) {
                return undefined;
        }

        const layoutSection = extractDelphineSection(source, 'layout');
        const template = extractLitTemplateSection(layoutSection.content);

        return template.content;
}

export async function buildForbiddenFrameTypes(appRoot: vscode.Uri, currentSourceUri: vscode.Uri, frames: readonly DelphineFrameConfig[]): Promise<string[]> {
        const dependencies = await buildFrameDependencies(appRoot, frames);

        const currentFrame = frames.find((frame) => vscode.Uri.joinPath(appRoot, frame.url.replace(/^\.\//, '')).fsPath === currentSourceUri.fsPath);

        if (!currentFrame) {
                console.warn('[Delphine] current frame not found in app config:', currentSourceUri.fsPath);

                return [];
        }

        return [...findForbiddenFrames(currentFrame.className, dependencies)];
}

function escapeRegExp(value: string): string {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function buildFrameDependencies(appRoot: vscode.Uri, frames: readonly DelphineFrameConfig[]): Promise<Map<string, Set<string>>> {
        const dependencies = new Map<string, Set<string>>();

        for (const frame of frames) {
                const children = new Set<string>();
                dependencies.set(frame.className, children);

                const frameUri = vscode.Uri.joinPath(appRoot, frame.url.replace(/^\.\//, ''));

                console.log('[Delphine dependencies] inspecting', frame.className, frame.url, frameUri.fsPath);

                try {
                        const layoutHtml = await loadFrameLayoutOnly(frameUri);

                        if (layoutHtml === undefined) {
                                console.log(`[Delphine dependencies] "${frame.className}" has no layout.`);
                                continue;
                        }
                        for (const candidate of frames) {
                                const found = containsCustomElement(layoutHtml, candidate.tagName);

                                console.log('[Delphine dependencies] candidate', frame.className, '->', {
                                        candidateClass: candidate.className,
                                        candidateTag: candidate.tagName,
                                        found
                                });

                                if (found) {
                                        children.add(candidate.className);
                                }
                        }

                        console.log('[Delphine dependencies]', frame.className, '->', [...children]);
                } catch (error) {
                        console.warn(`[Delphine] Unable to inspect frame dependencies for "${frame.className}".`, error);
                }
        }

        console.log('========== FRAME GRAPH ==========');

        for (const [frame, children] of dependencies) {
                console.log(frame, '->', [...children]);
        }

        return dependencies;
}

function containsCustomElement(html: string, tagName: string): boolean {
        const escapedTagName = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const regex = new RegExp(`<\\s*${escapedTagName}(?:\\s|>|/)`, 'i');

        return regex.test(html);
}

function findForbiddenFrames(currentFrameType: string, dependencies: ReadonlyMap<string, ReadonlySet<string>>): Set<string> {
        /*
         * The current Frame itself is always forbidden.
         */
        const forbidden = new Set<string>([currentFrameType]);

        /*
         * If:
         *
         *     A -> B
         *     B -> Current
         *
         * then A is forbidden too.
         *
         * Repeat until no new ancestor can be found.
         */
        let changed: boolean;

        do {
                changed = false;

                for (const [frameType, children] of dependencies) {
                        if (forbidden.has(frameType)) {
                                continue;
                        }

                        for (const child of children) {
                                if (forbidden.has(child)) {
                                        forbidden.add(frameType);
                                        changed = true;
                                        break;
                                }
                        }
                }
        } while (changed);

        return forbidden;
}
