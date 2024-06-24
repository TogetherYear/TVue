import { H, CreateTextVNode } from '../../lib/TVue.esm.js'
import { Foo } from './Foo.js'

export const App = {
    Render() {
        const app = H('div', {}, 'app')
        const foo = H(Foo, {}, {
            header: (a) => [H('div', {}, '123' + a), H('div', {}, '456')],
            footer: () => [H('div', {}, '789'), H('div', {}, '000'), CreateTextVNode("AAA")],
        })
        return H('div', {}, [app, foo])
    },
    Setup: () => {
        return {
            msg: 'TVue'
        }
    }
}