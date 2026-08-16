import React from 'react';

type Props = {
  value: unknown;
  depth?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function Primitive({ value }: { value: unknown }) {
  if (value === null) return <span className="yaml-muted">null</span>;
  if (typeof value === 'boolean') return <code>{String(value)}</code>;
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
    return <a href={value} target="_blank" rel="noreferrer">{value}</a>;
  }
  return <>{String(value)}</>;
}

export function FrontmatterValue({ value, depth = 0 }: Props) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="yaml-muted">[]</span>;
    if (value.every((item) => !isRecord(item) && !Array.isArray(item))) {
      return (
        <span className="yaml-list">
          {value.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="yaml-separator">, </span>}
              <Primitive value={item} />
            </React.Fragment>
          ))}
        </span>
      );
    }
    return (
      <div className="yaml-array">
        {value.map((item, index) => (
          <div className="yaml-array-item" key={index}>
            <span className="yaml-index">{index + 1}</span>
            <FrontmatterValue value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (isRecord(value)) return <FrontmatterTable value={value} depth={depth} />;
  return <Primitive value={value} />;
}

export function FrontmatterTable({ value, depth = 0 }: Props) {
  if (!isRecord(value)) return <FrontmatterValue value={value} depth={depth} />;
  const entries = Object.entries(value);
  if (entries.length === 0) return <span className="yaml-muted">{'{}'}</span>;

  return (
    <div className={depth === 0 ? 'frontmatter-shell' : 'frontmatter-nested'}>
      <table className="frontmatter-table">
        <tbody>
          {entries.map(([key, item]) => (
            <tr key={key}>
              <th>{key}</th>
              <td><FrontmatterValue value={item} depth={depth + 1} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
