import { NodeType } from "./AST"

interface IContext {
    rawSource: string,
    source: string
}

interface IInterpolation {
    type: NodeType,
    tag?: string,
    content?: {
        type?: NodeType,
        content?: string
    } | string
}

const enum Symbol {
    OpenDelimiter = '{{',
    CloaseDelimiter = '}}',
}

const enum TagType {
    Start,
    End,
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
    const s = context.source
    let node;
    if (s.startsWith(Symbol.OpenDelimiter)) {
        node = ParseInterpolation(context)
    }
    else if (s.startsWith('<')) {
        if (/[a-z]/i.test(s[1])) {
            node = ParseElement(context)
        }
    }
    if (!node) {
        node = ParseText(context)
    }
    nodes.push(node)
    return nodes
}

const ParseInterpolation = (context: IContext): IInterpolation => {
    const closeIndex = context.source.indexOf(Symbol.CloaseDelimiter, Symbol.OpenDelimiter.length)
    AdvanceBy(context, Symbol.OpenDelimiter.length)
    const rawContent = ParseTextData(context, closeIndex - Symbol.OpenDelimiter.length)
    const content = rawContent.trim()
    AdvanceBy(context, Symbol.CloaseDelimiter.length)
    return {
        type: NodeType.Interpolation,
        content: {
            type: NodeType.SimpleExpression,
            content: content,
        }
    }
}

const ParseElement = (context: IContext): IInterpolation => {
    const element = ParseTag(context, TagType.Start) as IInterpolation
    ParseTag(context, TagType.End)
    return element
}

const ParseTag = (context: IContext, type: TagType) => {
    const match = /^<\/?([a-z]*)/i.exec(context.source) as RegExpExecArray
    const tag = match[1]
    AdvanceBy(context, match[0].length)
    AdvanceBy(context, 1)
    if (type === TagType.Start) {
        return {
            type: NodeType.Element,
            tag,
        }
    }
}

const ParseText = (context: IContext): IInterpolation => {
    const content = ParseTextData(context, context.source.length)
    return {
        type: NodeType.Text,
        content: content
    }
}

const ParseTextData = (context: IContext, length: number) => {
    const content = context.source.slice(0, length)
    AdvanceBy(context, length)
    return content
}

const CreateParseContext = (content: string) => {
    const context = {
        rawSource: content,
        source: content
    } as IContext
    return context
}

const AdvanceBy = (context: IContext, length: number) => {
    context.source = context.source.slice(length)
}