import { CreateTextVNode, H, RenderSlots, GetCurrentInstance } from '../../lib/TVue.esm.js'

export const Foo = {
    name: "Foo",
    Render() {
        const foo = H('p', {}, 'foo')
        return H('div', {}, [foo, CreateTextVNode("AAA"), RenderSlots(this.$slots, 'header', 10), RenderSlots(this.$slots, 'footer')])
    },
    Setup: (props, { Emit }) => {
        console.log(GetCurrentInstance())
        return {
            msg: 'TTTTTVueTTTTT',
        }
    }
}