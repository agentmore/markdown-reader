import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import type { PluggableList } from 'unified';
import {
  Check,
  Clipboard,
  Download,
  FolderOpen,
  ListTree,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { extractFrontmatter } from './frontmatter';
import { FrontmatterTable } from './FrontmatterTable';
import { rehypeLightHighlight } from './rehypeLightHighlight';

type Mode = 'preview' | 'raw';
type Theme = 'light' | 'dark';

type Props = {
  source: string;
  url: string;
};

type TocItem = {
  id: string;
  label: string;
  level: number;
};

function safeFilename(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() || 'document.md');
  } catch {
    return 'document.md';
  }
}

function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function countLines(value: string): number {
  if (value === '') return 0;
  let lines = 1;
  for (let index = 0; index < value.length; index += 1) {
    if (value.charCodeAt(index) === 10) lines += 1;
  }
  return lines;
}

function textFromNode(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textFromNode(node.props.children);
  }
  return '';
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}

function CopyButton({ text, label = 'Copy code' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await copyText(text.replace(/\n$/, ''));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button className="code-copy" type="button" onClick={copy} aria-label={copied ? 'Copied' : label} title={copied ? 'Copied' : label}>
      {copied ? <Check size={16} /> : <Clipboard size={16} />}
    </button>
  );
}

function CodeBlock({ children }: { children?: React.ReactNode }) {
  const text = textFromNode(children);
  return (
    <div className="code-block">
      <pre>{children}</pre>
      <CopyButton text={text} />
    </div>
  );
}

function getInitialTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const markdownComponents = {
  pre: CodeBlock,
  a: ({ children, href, ...props }) => href?.startsWith('#')
    ? <a {...props} href={href}>{children}</a>
    : <a {...props} href={href} target="_blank" rel="noreferrer">{children}</a>,
  table: ({ children, ...props }) => <div className="table-wrap"><table {...props}>{children}</table></div>,
} satisfies Components;

const remarkPlugins = [remarkGfm];
const baseRehypePlugins: PluggableList = [
  rehypeRaw,
  rehypeSanitize,
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: 'wrap' }],
];
const highlightedRehypePlugins: PluggableList = [...baseRehypePlugins, rehypeLightHighlight];

const MarkdownPreview = React.memo(function MarkdownPreview({
  body,
  data,
  error,
  highlightCode,
}: {
  body: string;
  data: unknown | null;
  error: string | null;
  highlightCode: boolean;
}) {
  return (
    <article className="markdown-body">
      {error && <div className="frontmatter-error">Frontmatter could not be parsed: {error}</div>}
      {data !== null && <FrontmatterTable value={data} />}
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={highlightCode ? highlightedRehypePlugins : baseRehypePlugins} components={markdownComponents}>
        {body}
      </ReactMarkdown>
    </article>
  );
});

export function MarkdownViewer({ source, url }: Props) {
  const [mode, setMode] = useState<Mode>('preview');
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [copiedDocument, setCopiedDocument] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeSource, setActiveSource] = useState(source);
  const [filename, setFilename] = useState(() => safeFilename(url));
  const [, startDocumentTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const parsed = useMemo(() => extractFrontmatter(activeSource), [activeSource]);
  const lines = useMemo(() => countLines(activeSource), [activeSource]);
  const sourceBytes = useMemo(() => new TextEncoder().encode(activeSource).length, [activeSource]);
  const sourceSize = useMemo(() => formatByteSize(sourceBytes), [sourceBytes]);

  useEffect(() => {
    chrome.storage?.local.get('markview-theme').then((stored) => {
      const saved = stored['markview-theme'];
      if (saved === 'light' || saved === 'dark') setTheme(saved);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.markviewTheme = theme;
    document.documentElement.style.colorScheme = theme;
    chrome.storage?.local.set({ 'markview-theme': theme }).catch(() => undefined);
  }, [theme]);

  useLayoutEffect(() => {
    if (!tocOpen || mode !== 'preview') {
      setTocItems([]);
      return;
    }

    const items = Array.from(document.querySelectorAll<HTMLHeadingElement>('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6'))
      .filter((heading) => heading.id && heading.textContent?.trim())
      .map((heading) => ({
        id: heading.id,
        label: heading.textContent!.trim(),
        level: Number(heading.tagName.slice(1)),
      }));
    setTocItems(items);
  }, [activeSource, mode, tocOpen]);

  useEffect(() => {
    if (!tocOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setTocOpen(false);
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [tocOpen]);

  async function copyDocument() {
    await copyText(activeSource);
    setCopiedDocument(true);
    window.setTimeout(() => setCopiedDocument(false), 1600);
  }

  function downloadDocument() {
    const blobUrl = URL.createObjectURL(new Blob([activeSource], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  }

  async function openDocument(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextSource = await file.text();
    startDocumentTransition(() => {
      setActiveSource(nextSource);
      setFilename(file.name);
      setMode('preview');
    });
    document.title = `${file.name} · AgentMore Markdown Reader`;
    event.target.value = '';
  }

  function showRawDocument() {
    setTocOpen(false);
    setMode('raw');
  }

  function toggleTableOfContents() {
    if (mode === 'raw') setMode('preview');
    setTocOpen((open) => !open);
  }

  function jumpToHeading(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
    setTocOpen(false);
  }

  return (
    <div className="viewer" data-theme={theme}>
      <header className="toolbar">
        <div className="toolbar-inner">
          <div className="toolbar-primary">
            <div className="view-switch" role="tablist" aria-label="Document view">
              <button type="button" role="tab" aria-selected={mode === 'preview'} className={mode === 'preview' ? 'active' : ''} onClick={() => setMode('preview')}>
                Preview
              </button>
              <button type="button" role="tab" aria-selected={mode === 'raw'} className={mode === 'raw' ? 'active' : ''} onClick={showRawDocument} title="Show native raw text">
                Raw
              </button>
            </div>
          </div>

          <div className="document-identity" title={filename}>
            <span>{filename}</span>
          </div>

          <div className="document-stats" aria-label={`${lines} lines, ${sourceSize}`}>
            <span>{lines.toLocaleString()} lines</span>
            <span aria-hidden="true">·</span>
            <span>{sourceSize}</span>
          </div>

          <div className="toolbar-actions">
            <button className="icon-button" type="button" onClick={copyDocument} title={copiedDocument ? 'Copied' : 'Copy Markdown'} aria-label={copiedDocument ? 'Markdown copied' : 'Copy Markdown'}>
              {copiedDocument ? <Check size={18} /> : <Clipboard size={18} />}
            </button>
            <button className="icon-button" type="button" onClick={downloadDocument} title="Download Markdown" aria-label="Download Markdown">
              <Download size={18} />
            </button>
            <button className="icon-button" type="button" onClick={() => fileInput.current?.click()} title="Open Markdown file" aria-label="Open Markdown file">
              <FolderOpen size={18} aria-hidden="true" />
            </button>
            <input ref={fileInput} type="file" accept=".md,.markdown,text/markdown,text/plain" onChange={openDocument} aria-label="Choose Markdown file" hidden />
            <button className="icon-button" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={`Use ${theme === 'dark' ? 'light' : 'dark'} theme`} aria-label={`Use ${theme === 'dark' ? 'light' : 'dark'} theme`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="icon-button" type="button" onClick={toggleTableOfContents} title="Table of contents" aria-label="Table of contents" aria-expanded={tocOpen} aria-controls="markdown-table-of-contents">
              <ListTree size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {tocOpen && mode === 'preview' && (
        <aside id="markdown-table-of-contents" className="toc-panel" aria-label="Table of contents">
          <div className="toc-header">
            <strong>Contents</strong>
            <button className="toc-close" type="button" onClick={() => setTocOpen(false)} aria-label="Close table of contents" title="Close">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          {tocItems.length > 0 ? (
            <nav className="toc-list" aria-label="Document headings">
              {tocItems.map((item) => (
                <button
                  key={item.id}
                  className="toc-item"
                  type="button"
                  onClick={() => jumpToHeading(item.id)}
                  style={{ paddingLeft: `${12 + (item.level - 1) * 12}px` }}
                  title={item.label}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          ) : (
            <p className="toc-empty">No headings in this document.</p>
          )}
        </aside>
      )}

      {mode === 'preview' ? (
        <main className="document-frame">
          <MarkdownPreview
            body={parsed.body}
            data={parsed.data}
            error={parsed.error}
            highlightCode={sourceBytes <= 400_000}
          />
        </main>
      ) : (
        <pre className="native-raw"><code>{activeSource}</code></pre>
      )}
    </div>
  );
}
