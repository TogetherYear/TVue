import { H, CreateTextVNode, Provide, Inject } from '../../lib/TVue.esm.js'

export const Foo = {
    name: "Foo",
    Render() {
        return H('div', {}, [H('div', {}, 'A'), H('div', {}, 'B'), CreateTextVNode(`${this._2}`), H(Children)])
    },
    Setup: (props, { Emit }) => {
        Provide('_2', '_4444444')
        Provide('_3', '_3333333')
        const _2 = Inject('_2')
        return {
            _2
        }
    }
}

export const Children = {
    name: "Children",
    Render() {
        return H('div', {}, [H('div', {}, 'A'), H('div', {}, 'B'), CreateTextVNode(`${this._1}__${this._2}__${this._3}`)])
    },
    Setup: (props, { Emit }) => {
        const _1 = Inject('_1')
        const _2 = Inject('_2')
        const _3 = Inject('_6', () => "_6666666")
        return {
            _1,
            _2,
            _3
        }
    }
}