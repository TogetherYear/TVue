import { H } from '../../lib/TVue.esm.js'
import { Foo } from './Foo.js'

export const App = {
    Render() {
        window.self = this
        return H("p", {
            a: 'a',
            OnClick: (e) => {
                console.log("Click:", e)
            },
        }, [
            H('div', { class: 'AAA' }, `ASay:${this.msg}`),
            H(Foo, { count: 100000 }),
            H('div', {
                class: 'CCC'
            }, [
                H('div', { class: 'AAA' }, 'AAAAAAA'),
                H('div', { class: 'BBB' }, `BSay:${this.msg}`),
            ]),
        ])
    },
    Setup: () => {
        return {
            msg: 'TVue'
        }
    }
}