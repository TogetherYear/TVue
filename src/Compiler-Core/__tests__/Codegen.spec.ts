import { Generate } from "../Codegen"
import { BaseParse } from "../Parse"
import { Transform } from "../Transform"

describe('codegen', () => {
    test('string', () => {
        const str = `TVue`
        const ast = BaseParse(str)
        Transform(ast)
        const code = Generate(ast)
        expect(code).toMatchSnapshot()
    })
})