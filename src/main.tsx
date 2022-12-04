import { useEffect, useState } from "react";
import parser from "./parser/parser";
import "./style.css";

export { default as LoFInput } from "./Input";
export {
  default as SyntaxHighlighting,
  LoFHighlightStyleSheet,
} from "./SyntaxHighlighting";
export { default as parser } from "./parser/parser";
export type ExpressionID = number | string;

/**
 * A LoF expression tree.
 * Contains all required data to draw and calculate LoF expressions
 */
export type LoFExpressionTree<T> = {
  data: T;
  id: ExpressionID;
  expressions: (LoFExpressionTree<T> | ExpressionID)[];
  depth: number;
  maxDepth: number;
};

/**
 * To process and draw re-entries correctly, we need to know
 * which exact space re-enters into another. To minimize
 * intersections of re-entries the depth depth is stored.
 */
type ReentryConnector = {
  from: ExpressionID;
  to: ExpressionID;
  maxDepth: number;
  depth: number;
  i: number;
};

/**
 * @param {LoFExpressionTree<T>} expression - Expression tree of (nested) expressions
 * @param {} addReentry - A CB to add ReentryConnector to a list
 *
 * Helper function for LoFExpression. Just for usage inside func LoFExpression.
 * Creates JSX of nested LoF expressions. Size is based on parent font-size.
 * Stores all reentry connections for drawing via the callback.
 */
function _LoFExpression<T>(
  expression: LoFExpressionTree<T>,
  addReentryTo: (x: ReentryConnector) => void,
  addReentryFrom: (id: number | string, depth: number) => void,
  prefix: string,
  className?: string,
  style?: React.CSSProperties,
  drawCross: boolean = false
): JSX.Element {
  const isReEntry = typeof expression.id === "number";

  /**
   * the outer cross is drawn either
   * a) its a space which re-enter somewhere else (id is a number)
   * b)
   * */
  drawCross = drawCross || isReEntry;

  if (isReEntry) {
    if (expression.depth === undefined) console.error("UNDEFINED", expression);
    addReentryFrom(expression.id, expression.depth);
  }

  const children = (
    <>
      {expression.expressions.map((e, i) => {
        if (typeof e !== "number") {
          return _LoFExpression(
            e as LoFExpressionTree<T>,
            addReentryTo,
            addReentryFrom,
            prefix,
            className,
            style,
            true
          );
        }
        addReentryTo({
          from: e,
          to: expression.id,
          maxDepth: expression.maxDepth,
          depth: expression.depth,
          i: i,
        });
      })}
      {expression.data}
    </>
  );

  return (
    <>
      {drawCross ? (
        <div
          className={"cross " + (className || "")}
          id={`${prefix}${expression.id}`}
          key={`${prefix}${expression.id}`}
          style={style}
        >
          {children}
        </div>
      ) : (
        <>{children}</>
      )}{" "}
    </>
  );
}

/**
 * Creates JSX of nested Laws of Form expressions. Size is based on the parents font-size.
 * Since the reentry drawing happens purely with pseudo divs (::before, ::after),
 * we can only reenter a specific subexpression twice into the form.
 *
 * How to use:
 *
 * <LoF className="custom-class" style={{fontFamily: "cursive"}}>
 *
 * (a)(c)c
 *
 * <\/LoF>
 *
 * @param {object} props
 * @param {LoFExpressionTree<T>}  props.expressionTree - Expression tree of (nested) Laws of Form expressions
 * @param {string}  props.className - Optional React className
 * @param {React.ReactNode} props.children - LoF (Bracket) Expression that needs to be visualized e.g. ((a)(b)c)
 * @param {React.CSSProperties}  props.style - Optional react style sheet for the LoF expression
 * @param {boolean}  props.unwrittenCross - Optional react style sheet for the LoF expression
 * @param {boolean}  props.uc - Optional shortcut for props.unwrittenCross
 */

export default function LoF<T>({
  expressionTree,
  className,
  style,
  children,
  unwrittenCross = false,
  uc = false,
}: {
  expressionTree?: LoFExpressionTree<T>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  unwrittenCross?: boolean;
  uc?: boolean;
}): JSX.Element {
  /*Each LoFExpression needs to have a unique prefix, for specific DOM manipulation */
  const [PREFIX] = useState(
    () =>
      "Cross_" +
      (new Date().valueOf() + Math.random()).toString(36).replace(".", "_")
  );

  /* If a child is received we generate an abstract syntax tree
   * from the string, else we use the expression prop.
   * In case a child is a react component build a shallow
   * expression tree out of it.*/
  if (children === undefined && expressionTree === undefined) {
    throw new Error(`You must provide either an ExpressionTree or Child prop.`);
  }
  if (children !== undefined && expressionTree !== undefined) {
    throw new Error(`LofExpressionTree and Childrens were provided. 
    You can not use both together. Choose one.`);
  }
  if (typeof children === "object") {
    expressionTree = {
      data: children as T,
      expressions: [],
      id: "_0",
      depth: 0,
      maxDepth: 0,
    };
  } else if (children !== undefined) {
    try {
      expressionTree = parser.parse(children);
    } catch (error) {
      console.error(`Invalid LoF Expression ${children}.\n${error}`);
    }
  }

  /* we create the virtual dom, with the helper function and gater
   * all the reentries. The reentries will be handled later during
   * the use effect since we need access to the real DOM*/
  const reentriesTo: ReentryConnector[] = [];
  const reentriesFrom: Map<ExpressionID, number> = new Map();
  const data =
    expressionTree &&
    _LoFExpression(
      expressionTree as LoFExpressionTree<T>,
      (x) => reentriesTo.push(x),
      (id: number | string, depth: number) => {
        reentriesFrom.set(id, depth);
      },
      PREFIX,
      className,
      style,
      unwrittenCross || uc
    );
  const reentries = reentriesTo.map((re) => {
    const fromDepth = reentriesFrom.get(re.from) as number;
    return {
      to: re.to,
      from: re.from,
      toDepth: re.depth,
      fromDepth: fromDepth,
      maxDepth: re.maxDepth,
      depthDiff: Math.abs(fromDepth - re.depth),
      i: re.i,
    };
  });

  /* stable sort the array so that we have the least
   * amount of intersecting reentry strokes */
  reentries
    .sort((a, b) => a.i - b.i)
    .sort((a, b) => a.depthDiff - b.depthDiff)
    .sort((a, b) => a.maxDepth - b.maxDepth);

  /* To know how the reentry dashes should be drawn, we must access the real DOM.
   * This is only possible after we have left this function, thus we use useEffect */
  useEffect(() => {
    const cleanUp: HTMLElement[] = [];

    const diffMap = new Map<number, number>();
    reentries.forEach((re) => {
      if (re.from !== re.to)
        diffMap.set(re.depthDiff, (diffMap.get(re.depthDiff) || 0) + 1);
    });

    reentries.forEach((re, i) => {
      const outer = document.getElementById(`${PREFIX}${re.from}`);
      const inner = document.getElementById(`${PREFIX}${re.to}`);

      if (outer === null || inner === null) {
        console.error("invalid reentry pair");
        return;
      }
      cleanUp.push(outer);

      // depending on the first or second call, we use :after or :before
      let pseudoElement = "after";
      if (!outer.classList.contains("reentry")) {
        pseudoElement = "before";
        outer.className += " reentry";
      }

      // make the :pseudo element visible
      outer.style.setProperty(
        `--reentry-visibility-${pseudoElement}`,
        "visible"
      );

      // get the width of the cross stroke.
      const { reentryWidth, strokeWidthValue, strokeWidthUnit, flip } =
        getReEntryWidths(inner, outer);

      outer.style.setProperty(
        `--reentry-width-${pseudoElement}`,
        `${reentryWidth}px`
      );
      // add a little space for the reentry vertical stroke
      if (re.from === re.to) {
        inner.style.paddingLeft = `${2 * strokeWidthValue}${strokeWidthUnit}`;
      }

      /* Re-Entries should ideally not intersect and
       * have the same height if they are equal and
       * inside the same depth. We handle these cases in the
       * following lines
       *
       * If there is already a re-entry drawn in the same depth,
       * we will use its values  */
      const re2i = reentries.findIndex((re2, i2) => {
        if (i2 === i) return false;
        if (re2.fromDepth === re.fromDepth) return false;
        return true;
      });

      let translateY =
        (4 +
          2 * re.depthDiff +
          1.5 * Math.max(diffMap.get(re.depthDiff) || 0, 0)) *
        strokeWidthValue;

      if (re.from !== re.to)
        diffMap.set(re.depthDiff, (diffMap.get(re.depthDiff) || 0) - 1);

      if (re2i !== -1 && re2i < i && re.maxDepth === reentries[re2i].maxDepth) {
        const r2height = window
          .getComputedStyle(cleanUp[re2i], null)
          .getPropertyValue(`--reentry-height-${pseudoElement}`);
        outer.style.setProperty(`--reentry-height-${pseudoElement}`, r2height);
        diffMap.set(re.depthDiff, (diffMap.get(re.depthDiff) || 0) + 1);
      } else if (pseudoElement === "after") {
        const r2height = window
          .getComputedStyle(outer, null)
          .getPropertyValue(`--reentry-height-before`);
        outer.style.setProperty(`--reentry-height-after`, r2height);
        translateY = parseFloat(
          window
            .getComputedStyle(outer, null)
            .getPropertyValue(`--reentry-translateY`)
        );
      }
      // thats the reentry small vertical bottom stroke
      else if (re2i !== -1 && re.maxDepth === reentries[re2i].maxDepth) {
        const height = translateY;
        outer.style.setProperty(
          `--reentry-height-${pseudoElement}`,
          `${height}${strokeWidthUnit}`
        );
      } else {
        const height = translateY;
        outer.style.setProperty(
          `--reentry-height-${pseudoElement}`,
          `${height}${strokeWidthUnit}`
        );
      }

      outer.style.setProperty(`--reentry-translateY`, `${translateY}`);
      outer.style.setProperty(
        `--reentry-transform-${pseudoElement}`,
        flip ? `translateX(${reentryWidth - strokeWidthValue}px)  ` : ""
      );
    });

    return () => {
      cleanUp.forEach((e) => e.classList.remove("reentry"));
    };
  });

  return data || <></>;
}

function getReEntryWidths(inner: HTMLElement, outer: HTMLElement) {
  const strokeWidth = window
    .getComputedStyle(inner, null)
    .getPropertyValue("border-top-width");
  const strokeWidthValue = parseFloat(strokeWidth);
  const strokeWidthUnit = strokeWidth.match(/[a-zA-Z%]+/)?.[0];
  // calculate the width of the reentry stroke
  const innerBoundingBox = inner.getBoundingClientRect();
  const outerBoundingBox = outer.getBoundingClientRect();
  const innerPadding = parseFloat(
    window.getComputedStyle(inner, null).getPropertyValue("padding-left")
  );

  // if no cross is contained, put the reentry upward stroke at the end of the div
  let containsCross = false;
  inner.childNodes.forEach((c: any) => {
    if (
      c.classList &&
      c.classList?.contains("cross") &&
      !c.classList?.contains("reentry")
    ) {
      containsCross = true;
    }
  });
  // thats the reentry horizontal bottom stroke
  let reentryWidth: number;
  let flip = false;
  if (innerBoundingBox.right > outerBoundingBox.right) {
    reentryWidth =
      innerBoundingBox.right - outerBoundingBox.right - strokeWidthValue * 1.5;
    flip = true;
  } else if (containsCross) {
    reentryWidth =
      outerBoundingBox.right -
      innerBoundingBox.right +
      innerPadding +
      strokeWidthValue * 3;
  } else {
    reentryWidth =
      outerBoundingBox.right -
      innerBoundingBox.right +
      innerBoundingBox.width -
      innerPadding * 0.33;
  }
  return { reentryWidth, strokeWidthValue, strokeWidthUnit, flip };
}
