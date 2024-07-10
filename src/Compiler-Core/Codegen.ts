import { NodeType } from "./AST";
import { INode, INodeContent } from "./Parse";
import { RuntimeHelper } from "./RuntimeHelper";

interface ICodegenContext {
    code: string,
    Push: (source: string) => void
}

export const Generate = (root: INode) => {
    const context = CreateCodegenContext()
    const { Push } = context

    GenFunctionPreamble(root, context)

    const funcName = 'Render'
    const args = ['_ctx,_cache']
    const signature = args.join(', ')

    Push(`function ${funcName}(${signature}) {`)
    Push('return ')
    GenNode(root.codegenNode!, context)
    Push('}')

    return {
        code: context.code
    }
}

const GenFunctionPreamble = (root: INode, context: ICodegenContext) => {
    const { Push } = context
    const vueBinging = `TVue`
    if (root.helpers && root.helpers.length != 0) {
        Push(`const { ${(root.helpers || []).map(h => `${h}:_${h}`).join(',')} } = ${vueBinging}`)
        Push(`\n`)
    }
    Push('return ')
}

const CreateCodegenContext = () => {
    const context = {
        code: '',
        Push: (source: string) => {
            context.code += source
        }
    } as ICodegenContext
    return context
}

const GenNode = (node: INode | INodeContent, context: ICodegenContext) => {
    switch (node.type) {
        case NodeType.Text:
            GenText(node, context)
            break;
        case NodeType.Interpolation:
            GenInterpolation(node, context)
            break;
        case NodeType.SimpleExpression:
            GenExpression(node, context)
        case NodeType.Element:
            GenElement(node, context)
    }
}

const GenText = (node: INode, context: ICodegenContext) => {
    const { Push } = context
    Push(`'${node.content}'`)
}

const GenInterpolation = (node: INode, context: ICodegenContext) => {
    const { Push } = context
    Push(`_${RuntimeHelper.ToDisplayString}(`)
    GenNode(node.content as INodeContent, context)
    Push(`)`)
}

const GenExpression = (node: INode, context: ICodegenContext) => {
    const { Push } = context
    Push(`${node.content}`)
}

const GenElement = (node: INode, context: ICodegenContext) => {
    const { Push } = context
    Push(`_${RuntimeHelper.CreateElementVNode}('div')`)
}
