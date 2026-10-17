import React from 'react';

// Renders the small Markdown subset the admin description toolbar writes:
// **bold**, _italic_, "- " bullet lines and blank lines between paragraphs.
// Built from React nodes (no HTML injection), so stored text is always escaped.

function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|_[^_\s][^_]*_)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold text-nordic">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export const FormattedDescription: React.FC<{ text: string }> = ({ text }) => {
  const blocks = text.replace(/\r\n/g, '\n').split(/\n\s*\n/).filter((block) => block.trim());

  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        if (lines.every((line) => line.trim().startsWith('- '))) {
          return (
            <ul key={i} className="mb-4 list-disc pl-5 space-y-1">
              {lines.map((line, j) => (
                <li key={j}>{renderInline(line.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="mb-4 whitespace-pre-line">
            {renderInline(block)}
          </p>
        );
      })}
    </>
  );
};
