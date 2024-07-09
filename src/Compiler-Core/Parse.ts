import { NodeType } from "./AST"

interface IContext {
    rawSource: string,
    source: string
}
export interface INode {
    type?: NodeType,
    tag?: string,
    content?: INodeContent | string,
    children?: Array<INode>
    codegenNode?: INode,
    helpers?: Array<string>
}

export interface INodeContent {
    type: NodeType,
    content: string
}

const enum SpecialSymbol {
    OpenDelimiter = '{{',
    CloaseDelimiter = '}}',
    LeftAngleBracket = '<'
}

const enum TagType {
    Start,
    End,
}

const endTokens = [SpecialSymbol.OpenDelimiter, SpecialSymbol.LeftAngleBracket]

export const BaseParse = (content: string) => {
    const context = CreateParseContext(content)
    return CreateRoot(ParseChildren(context, []))
}

const CreateRoot = (children: Array<INode>): INode => {
    return {
        children,
        type: NodeType.Root
    }
}

const ParseChildren = (context: IContext, ancestors: Array<INode>) => {
    const nodes = []
    while (!IsEnd(context, ancestors)) {
        let node;
        const s = context.source
        if (s.startsWith(SpecialSymbol.OpenDelimiter)) {
            node = ParseInterpolation(context)
        }
        else if (s.startsWith('<')) {
            if (/[a-z]/i.test(s[1])) {
                node = ParseElement(context, ancestors)
            }
        }
        if (!node) {
            node = ParseText(context)
        }
        nodes.push(node)
    }
    return nodes
}

const IsEnd = (context: IContext, ancestors: Array<INode>) => {
    const s = context.source
    if (s.startsWith('</')) {
        for (let i = ancestors.length - 1; i >= 0; --i) {
            const tag = ancestors[i].tag as string
            if (StartWidthEndTagOpen(s, tag)) {
                return true
            }
        }
    }
    return !s
}

const ParseInterpolation = (context: IContext): INode => {
    const closeIndex = context.source.indexOf(SpecialSymbol.CloaseDelimiter, SpecialSymbol.OpenDelimiter.length)
    AdvanceBy(context, SpecialSymbol.OpenDelimiter.length)
    const rawContent = ParseTextData(context, closeIndex - SpecialSymbol.OpenDelimiter.length)
    const content = rawContent.trim()
    AdvanceBy(context, SpecialSymbol.CloaseDelimiter.length)
    return {
        type: NodeType.Interpolation,
        content: {
            type: NodeType.SimpleExpression,
            content: content,
        }
    }
}

const ParseElement = (context: IContext, ancestors: Array<INode>): INode => {
    const element = ParseTag(context, TagType.Start) as INode
    ancestors.push(element)
    element.children = ParseChildren(context, ancestors)
    ancestors.pop()
    if (StartWidthEndTagOpen(context.source, element.tag as string)) {
        ParseTag(context, TagType.End)
    }
    else {
        throw new Error(`缺少结束标签:${element.tag}`)
    }
    return element
}

const StartWidthEndTagOpen = (source: string, tag: string) => {
    return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
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

const ParseText = (context: IContext): INode => {
    let endIndex = context.source.length
    for (let t of endTokens) {
        const index = context.source.indexOf(t)
        if (index !== -1 && endIndex > index) {
            endIndex = index
        }
    }
    const content = ParseTextData(context, endIndex)
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