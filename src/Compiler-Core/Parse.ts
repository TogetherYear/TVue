import { NodeType } from "./AST"

interface IContext {
    rawSource: string,
    source: string
}

interface IInterpolation {
    type: NodeType,
    content: {
        type: NodeType,
        content: string
    }
}

const enum Symbol {
    OpenDelimiter = '{{',
    CloaseDelimiter = '}}',
}

export const BaseParse = (content: string) => {
    const context = CreateParseContext(content)
    return CreateRoot(ParseChildren(context))
}

const CreateRoot = (children: Array<IInterpolation>) => {
    return {
        children
    }
}

const ParseChildren = (context: IContext) => {
    const nodes = []
    if (context.source.startsWith(Symbol.OpenDelimiter)) {
        const node = ParseInterpolation(context)
        nodes.push(node)
    }
    return nodes
}

const ParseInterpolation = (context: IContext): IInterpolation => {
    const closeIndex = context.source.indexOf(Symbol.CloaseDelimiter, Symbol.OpenDelimiter.length)
    const content = context.source.slice(Symbol.OpenDelimiter.length, closeIndex)
    context.source = context.source.slice(closeIndex + Symbol.CloaseDelimiter.length)
    return {
        type: NodeType.Interpolation,
        content: {
            type: NodeType.SimpleExpression,
            content: content,
        }
    }
}

const CreateParseContext = (content: string) => {
    const context = {
        rawSource: content,
        source: content.replace(/[\n\t\s]+/g, '')
    } as IContext
    return context
}