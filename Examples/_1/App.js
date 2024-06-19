import { H } from '../../lib/TVue.esm.js'

export const App = {
    Render() {
        window.self = this
        // return H("p", { a: 'a' }, `Say:`)
        // return H("p", { a: 'a' }, `Say:${this.msg}`)
        return H("p", {
            a: 'a',
            OnClick: (e) => {
                console.log("Click:", e)
            },
        }, [
            H('div', { class: 'AAA' }, 'AAAAAAA'),
            H('div', { class: 'BBB' }, 'AAAAAAA'),
            H('div', {
                class: 'CCC'
            }, [
                H('div', { class: 'AAA' }, 'AAAAAAA'),
                H('div', { class: 'BBB' }, `Say:${this.msg}`),
            ]),
        ])
    },
    Setup: () => {
        return {
            msg: 'TVue'
        }
    }
}