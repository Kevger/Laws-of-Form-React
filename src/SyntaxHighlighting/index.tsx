enum LoFRegexTypes {
  cross = "cross",
  content = "content",
  spaceId = "spaceId",
  reentry = "reentry",
  error = "error",
}

const LoFRegex = {
  [LoFRegexTypes.cross]: /^(\(|\))+/,
  [LoFRegexTypes.content]: /^[ a-zA-Z0-9,.\-_#+*'`´?!= \/&%§öÖäÄ€%&"^–<>\\]+/,
  [LoFRegexTypes.spaceId]: /^\$\d+/,
  [LoFRegexTypes.reentry]: /^(\[\d+\])/,
  [LoFRegexTypes.error]: /.*/,
};

export type LoFHighlightStyleSheet = {
  cross: React.CSSProperties;
  content: React.CSSProperties;
  spaceId: React.CSSProperties;
  reentry: React.CSSProperties;
  error: React.CSSProperties;
};

export const defaultStyle: LoFHighlightStyleSheet = {
  cross: {
    color: "inherit",
  },
  content: {
    color: "#A06E3C",
  },
  spaceId: {
    color: "#4B8B8B",
  },
  reentry: {
    color: "#CA4A49",
  },
  error: {
    color: "#CA4A49",
  },
};

/**
 * @param {children} expression - Bracket Expression LoF String e.g ((b)(a)c)
 * @param {LoFHighlightStyleSheet} highlighting - Custom style sheet for syntax highlighted
 *
 * Syntax Highlighting of the given expression.
 */
export default function SyntaxHighlighting({
  children,
  highlighting = defaultStyle,
}: {
  children: string;
  highlighting?: LoFHighlightStyleSheet;
}) {
  const output: JSX.Element[] = [];
  const maxIterations = children.length;

  const process = (type: LoFRegexTypes, i: number) => {
    const match = LoFRegex[type].exec(children);
    if (match !== null) {
      output.push(
        <span key={`${match[0]}_${i}`} style={highlighting[type]}>
          {match[0]}
        </span>
      );
      children = children.slice(match[0].length);
      return true;
    }
    return false;
  };

  const processError = (i: number) => {
    output.push(
      <span
        key={`${children[0]}_${i}`}
        style={highlighting[LoFRegexTypes.error]}
      >
        {children[0]}
      </span>
    );
    children = children.slice(1);
  };

  for (let i = 0; i < maxIterations && children.length > 0; ++i) {
    if (process(LoFRegexTypes.cross, i)) continue;
    if (process(LoFRegexTypes.content, i)) continue;
    if (process(LoFRegexTypes.spaceId, i)) continue;
    if (process(LoFRegexTypes.reentry, i)) continue;
    processError(i);
  }

  return <>{output}</>;
}
