import { NodeType } from "../AST";
import { BaseParse } from "../Parse";

describe("Parse", () => {
    describe("interpolation", () => {
        test("simple", () => {
            const str = `{{ message }}asdwadsadasasdasdasAAAAA`
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
                children: []
            });
        })
    })

    describe('text', () => {
        test('simple text', () => {
            const str = `some text`
            const ast = BaseParse(str)
            expect(ast.children[0]).toStrictEqual({
                type: NodeType.Text,
                content: 'some text'
            });
        })
    })

    test('hello world', () => {
        const str = `<div>hi,{{ message }}</div>`
        const ast = BaseParse(str)
        expect(ast.children[0]).toStrictEqual({
            type: NodeType.Element,
            tag: 'div',
            children: [
                {
                    type: NodeType.Text,
                    content: 'hi,'
                },
                {
                    type: NodeType.Interpolation,
                    content: {
                        type: NodeType.SimpleExpression,
                        content: "message",
                    },
                }
            ]
        });
    })

    test('nested element', () => {
        const str = `<div><p>hi</p>{{message}}</div>`
        const ast = BaseParse(str)
        expect(ast.children[0]).toStrictEqual({
            type: NodeType.Element,
            tag: 'div',
            children: [
                {
                    type: NodeType.Element,
                    tag: 'p',
                    children: [
                        {
                            type: NodeType.Text,
                            content: 'hi'
                        },
                    ]
                },
                {
                    type: NodeType.Interpolation,
                    content: {
                        type: NodeType.SimpleExpression,
                        content: "message",
                    },
                }
            ]
        });
    })

    test('lack end tag', () => {
        expect(() => {
            const str = `<div><span></div>`
            BaseParse(str)
        }).toThrow("缺少结束标签:span")
    })
})