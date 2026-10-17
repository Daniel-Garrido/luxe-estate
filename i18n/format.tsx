import React from 'react';

type Values = Record<string, string | number>;

// Replaces {placeholders} in a translation string.
// format('Showing {count} homes', { count: 3 }) -> 'Showing 3 homes'
export function format(template: string, values: Values = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

// Picks the `one` or `other` variant of a pluralized key, then formats it.
export function plural(
  count: number,
  forms: { one: string; other: string },
  values: Values = {}
): string {
  return format(count === 1 ? forms.one : forms.other, { count, ...values });
}

// Like `format`, but placeholders can be replaced with React elements,
// e.g. formatRich('Find your {highlight}.', { highlight: <strong>…</strong> })
export function formatRich(
  template: string,
  values: Record<string, React.ReactNode>
): React.ReactNode[] {
  return template.split(/(\{\w+\})/g).map((part, i) => {
    const match = part.match(/^\{(\w+)\}$/);
    if (match && match[1] in values) {
      return <React.Fragment key={i}>{values[match[1]]}</React.Fragment>;
    }
    return part;
  });
}
