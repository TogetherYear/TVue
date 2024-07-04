import { NodeType } from "../AST";
import { BaseParse } from "../Parse";

describe("Parse", () => {
    describe("interpolation", () => {
        test("simple", () => {
            const str = `{{ message }}asdwadsadasa
            sdasda   sAAAAA`
            const ast = BaseParse(str)
            expect(ast.children[0]).toStrictEqual({
                type: NodeType.Interpolation,
                content: {
                    type: NodeType.SimpleExpression,
                    content: "message",
                },
            });
        })
    })
    describe("element", () => {
        test("simple element div", () => {
            const str = `<div></div>`
            const ast = BaseParse(str)
            expect(ast.children[0]).toStrictEqual({
                type: NodeType.Element,
                tag: 'div',
            });
        })
    })
})