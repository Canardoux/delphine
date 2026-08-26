// extension/delphineSections.ts

export interface DelphineSection {
        name: string;
        content: string;
        contentStart: number;
        contentEnd: number;
}

export function extractDelphineSection(source: string, name: string): DelphineSection {
        const startMarker = `// <delphine:${name}>`;
        const endMarker = `// </delphine:${name}>`;

        const markerStart = source.indexOf(startMarker);

        if (markerStart < 0) {
                throw new Error(`Missing marker "${startMarker}".`);
        }

        const contentStart = markerStart + startMarker.length;
        const markerEnd = source.indexOf(endMarker, contentStart);

        if (markerEnd < 0) {
                throw new Error(`Missing marker "${endMarker}".`);
        }

        return {
                name,
                content: source.slice(contentStart, markerEnd),
                contentStart,
                contentEnd: markerEnd
        };
}

export function extractLitTemplateFromSection(section: string): string {
        const match = section.match(/return\s+html`([\s\S]*?)`\s*;/);

        if (!match) {
                throw new Error('The Delphine layout section does not contain a Lit template returned with "return html`...`".');
        }

        return match[1] ?? '';
}

function findTemplateLiteralEnd(source: string, start: number): number {
        let escaped = false;

        for (let index = start; index < source.length; index++) {
                const character = source[index];

                if (escaped) {
                        escaped = false;
                        continue;
                }

                if (character === '\\') {
                        escaped = true;
                        continue;
                }

                if (character === '`') {
                        return index;
                }
        }

        throw new Error('Unterminated Lit template in the Delphine layout section.');
}

export interface LitTemplateSection {
        content: string;
        contentStart: number;
        contentEnd: number;
}

export function extractLitTemplateSection(sectionContent: string): LitTemplateSection {
        const returnHtmlIndex = sectionContent.indexOf('return html`');

        if (returnHtmlIndex < 0) {
                throw new Error('Unable to find "return html`" in Delphine layout section.');
        }

        const contentStart = returnHtmlIndex + 'return html`'.length;

        const contentEnd = sectionContent.lastIndexOf('`');

        if (contentEnd < contentStart) {
                throw new Error('Unable to find closing backtick of Delphine layout template.');
        }

        return {
                content: sectionContent.slice(contentStart, contentEnd),
                contentStart,
                contentEnd
        };
}
