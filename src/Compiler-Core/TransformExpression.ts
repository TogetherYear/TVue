import { NodeType } from "./AST";
import { INode, INodeContent } from "./Parse";

export const TransformExpression = (node: INode) => {
    if (node.type === NodeType.Interpolation) {
        const originContent = node.content as INodeContent;
        const rawContent = originContent.content;
        originContent.content = `_ctx.${rawContent}`
    }
}