import { parse } from 'yaml';

export type FrontmatterResult = {
  body: string;
  data: unknown | null;
  error: string | null;
};

const FRONTMATTER = /^---[\t ]*\r?\n([\s\S]*?)\r?\n---[\t ]*(?:\r?\n|$)/;

export function extractFrontmatter(source: string): FrontmatterResult {
  const match = source.match(FRONTMATTER);
  if (!match) return { body: source, data: null, error: null };

  try {
    return {
      body: source.slice(match[0].length),
      data: parse(match[1]) ?? {},
      error: null,
    };
  } catch (error) {
    return {
      body: source,
      data: null,
      error: error instanceof Error ? error.message : 'Unable to parse YAML frontmatter.',
    };
  }
}
