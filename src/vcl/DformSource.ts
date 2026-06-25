import type { Uri } from 'vscode';
import * as prettier from 'prettier';

const prettierConfig: prettier.Options = {
        printWidth: 140,
        tabWidth: 8,
        useTabs: false,
        semi: true,
        singleQuote: true,
        trailingComma: 'none',
        bracketSpacing: true,
        arrowParens: 'always',
        proseWrap: 'never',
        endOfLine: 'lf'
};

export type DformParts = {
        metadataAttributes: Record<string, string>;
        template: string;
        style: string;
        //script: string;
        //scriptLang?: string;
};

function extractTag(source: string, tagName: string): { attrs: string; inner: string } | undefined {
        const re = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, 'i');
        const match = source.match(re);

        if (!match) {
                return undefined;
        }

        return {
                attrs: match[1] ?? '',
                inner: match[2] ?? ''
        };
}

function extractSelfClosingTag(source: string, tagName: string): { attrs: string } | undefined {
        const re = new RegExp(`<${tagName}\\b([^>]*)\\/?>(?:</${tagName}>)?`, 'i');
        const match = source.match(re);

        if (!match) {
                return undefined;
        }

        return {
                attrs: match[1] ?? ''
        };
}

function parseAttributes(attrsText: string): Record<string, string> {
        const attrs: Record<string, string> = {};
        const re = /([a-zA-Z_:][a-zA-Z0-9:._-]*)\s*=\s*"([^"]*)"/g;

        for (;;) {
                const match = re.exec(attrsText);
                if (!match || !match[1] || !match[2]) {
                        break;
                }
                attrs[match[1]] = match[2];
        }

        return attrs;
}

export async function formatDformTemplate(template: string): Promise<string> {
        const source = (template ?? '').trim();
        if (!source) {
                return '';
        }

        const formatted = await prettier.format(source, {
                ...prettierConfig,
                parser: 'html',
                htmlWhitespaceSensitivity: 'ignore'
        });

        return formatted.trim();
}

export async function formatDformStyle(style: string): Promise<string> {
        const source = (style ?? '').trim();
        if (!source) {
                return '';
        }

        const formatted = await prettier.format(source, {
                ...prettierConfig,
                parser: 'css'
        });

        const blocks = formatted
                .split('}')
                .map((block) => block.trim())
                .filter((block) => block.length > 0)
                .map((block) => `${block}\n}`);

        blocks.sort((a, b) => {
                const aSelector = a.slice(0, a.indexOf('{')).trim();
                const bSelector = b.slice(0, b.indexOf('{')).trim();
                return aSelector.localeCompare(bSelector);
        });

        return blocks.join('\n\n').trim();
}

export function parseDformSource(fullText: string): DformParts {
        const header = extractSelfClosingTag(fullText, 'delphine');
        const styleTag = extractTag(fullText, 'style');
        const templateTag = extractTag(fullText, 'template');

        return {
                metadataAttributes: parseAttributes(header?.attrs ?? ''),
                template: (templateTag?.inner ?? '').trim(),
                style: (styleTag?.inner ?? '').trim()
        };
}

export function extractDformTemplate(fullText: string): string {
        return parseDformSource(fullText).template;
}

export function extractDformStyle(fullText: string): string {
        return parseDformSource(fullText).style;
}

export function splitFormSource(fullText: string): DformParts {
        return parseDformSource(fullText);
}

export async function mergeFormSource(parts: DformParts): Promise<string> {
        const metaAttrs = Object.entries(parts.metadataAttributes ?? {})
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');

        const header = metaAttrs.length > 0 ? `<delphine ${metaAttrs}></delphine>` : '<delphine></delphine>';

        const blocks: string[] = [header];

        const style = await formatDformStyle(parts.style ?? '');
        if (style.length > 0) {
                blocks.push('', '<style>', style, '</style>');
        }

        const template = await formatDformTemplate(parts.template ?? '');
        blocks.push('', '<template>', template, '</template>');

        blocks.push('');
        return blocks.join('\n');
}
