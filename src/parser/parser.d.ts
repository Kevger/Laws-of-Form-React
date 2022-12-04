import { LoFExpressionTree } from "../main";

/**
 * Parses an input string into a LoF Expression tree. 
 * If an invalid expression is given, a SyntaxError will be thrown. 
 * 
 * Example of valid expressions: 
 * 
 * ((a)(b)c)
 * 
 * () <- valid cross
 * 
 * (([0])$0) <- space $0 reenters into [0]
 * 
 * 
 *   <--- Empty space is also valid
 */
declare const parser: {
    SyntaxError: {
        (message: any, expected: any, found: any, location: any): Error;
        buildMessage(expected: any, found: any): string;
    };
    parse: (input: str, options?: any) => LoFExpressionTree;
};
export default parser;

