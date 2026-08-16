import { toText } from 'hast-util-to-text';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import diff from 'highlight.js/lib/languages/diff';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import shell from 'highlight.js/lib/languages/shell';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import type { Element, Root } from 'hast';
import { createLowlight } from 'lowlight';
import { visit } from 'unist-util-visit';

const lowlight = createLowlight({
  bash,
  css,
  diff,
  javascript,
  json,
  markdown,
  python,
  shell,
  typescript,
  xml,
  yaml,
});

lowlight.registerAlias({
  bash: ['sh', 'zsh'],
  javascript: ['js', 'jsx'],
  markdown: ['md'],
  typescript: ['ts', 'tsx'],
  xml: ['html', 'svg'],
  yaml: ['yml'],
});

function languageFrom(node: Element): string | null {
  const classes = Array.isArray(node.properties.className)
    ? node.properties.className.map(String)
    : [];
  const languageClass = classes.find((name) => name.startsWith('language-') || name.startsWith('lang-'));
  if (!languageClass) return null;
  return languageClass.replace(/^(?:language|lang)-/, '').toLowerCase();
}

export function rehypeLightHighlight() {
  return function transform(tree: Root) {
    visit(tree, 'element', (node, _index, parent) => {
      if (node.tagName !== 'code' || parent?.type !== 'element' || parent.tagName !== 'pre') return;
      const language = languageFrom(node);
      if (!language) return;

      try {
        const result = lowlight.highlight(language, toText(node, { whitespace: 'pre' }));
        const classes = Array.isArray(node.properties.className) ? node.properties.className : [];
        node.properties.className = ['hljs', ...classes];
        node.children = result.children as Element['children'];
      } catch {
        // Unknown language: keep the code readable without highlighting.
      }
    });
  };
}
