import { NodeType } from "./AST";
import { INode } from "./Parse";

export interface ITransformOptions {
    nodeTransforms: Array<(node: INode) => void>
}

interface ITransformContext {
    root: INode,
    nodeTransforms: Array<(node: INode) => void>
}

export const Transform = (root: INode, options?: ITransformOptions) => {
    const context = CreateTransformContext(root, options)
    TraverseNode(root, context)
}

const CreateTransformContext = (root: INode, options?: ITransformOptions) => {
    const context = {
        root,
        nodeTransforms: options?.nodeTransforms || []
    } as ITransformContext
    return context
}

const TraverseNode = (node: INode, context: ITransformContext) => {
    const nodeTransforms = context.nodeTransforms
    for (let i = 0; i < nodeTransforms.length; ++i) {
        const Tf = nodeTransforms[i]
        Tf(node)
    }

    TransformChildren(node, context)
}

const TransformChildren = (node: INode, context: ITransformContext) => {
    const children = node.children
    if (children) {
        for (let i = 0; i < children.length; ++i) {
            const node = children[i]
            TraverseNode(node, context)
        }
    }
}