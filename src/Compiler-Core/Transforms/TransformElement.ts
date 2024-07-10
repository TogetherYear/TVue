import { NodeType } from "../AST";
import { INode } from "../Parse";
import { RuntimeHelper } from "../RuntimeHelper";
import { ITransformContext } from "../Transform";

export const TransformElement = (node: INode, context: ITransformContext) => {
    if (node.type === NodeType.Element) {
        context.Helper(RuntimeHelper.CreateElementVNode)
    }
}