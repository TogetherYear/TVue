import { NodeType } from "../AST"
import { BaseParse, INode } from "../Parse"
import { Transform } from "../Transform"

describe("transform", () => {
    test('happy path', () => {
        const str = `<div>hi,{{ message }}</div>`
        const ast = BaseParse(str)

        const plugin = (node: INode) => {
            if (node.type === NodeType.Text) {
                node.content = node.content + 'TVue'
            }
        }

        Transform(ast, {
            nodeTransforms: [plugin]
        })
        //@ts-ignore
        const node = ast.children[0].children[0].content
        expect(node).toBe('hi,TVue')
    })
})