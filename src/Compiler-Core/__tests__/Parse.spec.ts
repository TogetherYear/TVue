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
})