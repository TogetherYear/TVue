import { NodeType } from "./AST";
import { INode } from "./Parse";
import { RuntimeHelper } from "./RuntimeHelper";

export interface ITransformOptions {
    nodeTransforms: Array<(node: INode) => void>
}

interface ITransformContext {
    root: INode,
    nodeTransforms: Array<(node: INode) => void>
    helper: Map<string, number>,
    Helper: (key: string) => void
}

export const Transform = (root: INode, options?: ITransformOptions) => {
    const context = CreateTransformContext(root, options)
    TraverseNode(root, context)
    CreateRootCodegen(root)
    root.helpers = [...context.helper.keys()]
}

const CreateRootCodegen = (root: INode) => {
    root.codegenNode = root.children?.[0]
}

const CreateTransformContext = (root: INode, options?: ITransformOptions) => {
    const context = {
        root,
        helper: new Map(),
        Helper: (key: string) => {
            context.helper.set(key, 1)
        },
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

    switch (node.type) {
        case NodeType.Interpolation:
            context.Helper(RuntimeHelper.ToDisplayString)
            break;
        case NodeType.Root:
        case NodeType.Element:
            TransformChildren(node, context)
            break;
        default:
            break;
    }


}

const TransformChildren = (node: INode, context: ITransformContext) => {
    const children = node.children!
    for (let i = 0; i < children.length; ++i) {
        const node = children[i]
        TraverseNode(node, context)
    }
}