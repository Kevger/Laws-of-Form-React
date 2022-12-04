import { useRef, useState } from "react";
import SyntaxHighlighting, {
  LoFHighlightStyleSheet,
} from "../SyntaxHighlighting";

export default function LoFInput({
  style,
  onChange,
  highlighting,
  value,
  className,
}: {
  style?: React.CSSProperties;
  highlighting?: LoFHighlightStyleSheet;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value?: string;
  className?: string;
}) {
  let setInput: (x: string) => void;
  if (onChange === undefined) {
    if (value === undefined) {
      throw new Error("If onChange is defined, a value must be provided");
    }
    [value, setInput] = useState("hallo welt");
  }

  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        position: "relative",
        height: "2em",
        ...style,
      }}
      className={className}
    >
      <input
        placeholder="((a)(b))(c)"
        ref={inputRef}
        value={value}
        style={{
          paddingLeft: "inherit",
          position: "absolute",
          fontSize: "inherit",
          zIndex: 1,
          top: "0px",
          left: "0px",
          width: "100%",
          height: "100%",
          color: "transparent",
          backgroundColor: "transparent",
          fontFamily: "inherit",
          overflowY: "hidden",
          border: "none",
          whiteSpace: "nowrap",
          caretColor: "black",
        }}
        onKeyUp={() => {
          // @ts-ignore
          textRef.current.scrollLeft = inputRef.current.scrollLeft;
        }}
        onKeyDown={() => {
          // @ts-ignore
          textRef.current.scrollLeft = inputRef.current.scrollLeft;
        }}
        onChange={onChange ?? ((e) => setInput(e.currentTarget.value))}
      />
      <div
        ref={textRef}
        style={{
          padding: "2px",
          paddingLeft: "inherit",
          zIndex: 0,
          position: "absolute",
          fontSize: "inherit",
          border: "none",
          fontFamily: "inherit",

          overflowX: "hidden",
          width: "100%",
          height: "100%",
          maxHeight: "100%",
          overflowY: "hidden",
          verticalAlign: "middle",
          paddingRight: "15px",
          whiteSpace: "pre" /* Allows textarea to scroll horizontally */,
          left: "0px",
          top: "0px",
        }}
      >
        <SyntaxHighlighting highlighting={highlighting}>
          {value ?? ""}
        </SyntaxHighlighting>
      </div>
    </div>
  );
}
