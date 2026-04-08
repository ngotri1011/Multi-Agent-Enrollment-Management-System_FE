import type { ReactNode } from "react";

function renderInlineMarkdown(line: string, lineIndex: number): ReactNode[] {
  const segments = line.split(/(\*\*.*?\*\*|\[[^\]]+\]\([^)]+\))/g);

  return segments.map((segment, segmentIndex) => {
    if (/^\*\*.*\*\*$/.test(segment)) {
      return (
        <strong key={`seg-${lineIndex}-${segmentIndex}`}>
          {segment.slice(2, -2)}
        </strong>
      );
    }

    const linkMatch = segment.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a
          key={`seg-${lineIndex}-${segmentIndex}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline"
        >
          {label}
        </a>
      );
    }

    return <span key={`seg-${lineIndex}-${segmentIndex}`}>{segment}</span>;
  });
}

export function formatChatText(value?: string): ReactNode {
  if (!value) return "--";

  const normalized = value.replace(/\\n/g, "\n");
  const lines = normalized.split(/\r?\n/);

  return lines.map((rawLine, lineIndex) => {
    const line = rawLine.trimEnd();
    const bulletMatch = line.match(/^(\*|-)\s+(.*)$/);
    const content = bulletMatch ? bulletMatch[2] : line;

    return (
      <span key={`line-${lineIndex}`}>
        {bulletMatch ? <span>&bull; </span> : null}
        {renderInlineMarkdown(content, lineIndex)}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </span>
    );
  });
}
