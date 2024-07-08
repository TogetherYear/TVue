import { INode } from "./Parse";

interface ICodegenContext {
    code: string,
    Push: (source: string) => void
}

export const Generate = (root: INode) => {
    const context = CreateCodegenContext()
    const { Push } = context

    const funcName = 'Render'
    const args = ['_ctx,_cache']
    const signature = args.join(',')

    const node = root.codegenNode!

    Push('return ')
    Push(`function ${funcName}(${signature}) {`)
    Push('return ')
    GenCode(node, context)
    Push('}')

    return {
        code: context.code
    }
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

const GenCode = (node: INode, context: ICodegenContext) => {
    const { Push } = context
    Push(`'${node.content}'`)
}