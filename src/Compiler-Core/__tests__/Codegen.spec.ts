import { Generate } from "../Codegen"
import { BaseParse } from "../Parse"
import { Transform } from "../Transform"
import { TransformExpression } from "../TransformExpression"

describe('codegen', () => {
    test('string', () => {
        const str = `TVue`
        const ast = BaseParse(str)
        Transform(ast)
        const code = Generate(ast)
        expect(code).toMatchSnapshot()
    })

    test('interpolation', () => {
        const str = `{{ message }}`
        const ast = BaseParse(str)
        Transform(ast, {
            nodeTransforms: [TransformExpression]
        })
        const code = Generate(ast)
        expect(code).toMatchSnapshot()
    })
})