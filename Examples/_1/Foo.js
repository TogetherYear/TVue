import { H, RenderSlots } from '../../lib/TVue.esm.js'

export const Foo = {
    Render() {
        const foo = H('p', {}, 'foo')
        return H('div', {}, [foo, RenderSlots(this.$slots, 'header', 10), RenderSlots(this.$slots, 'footer')])
    },
    Setup: (props, { Emit }) => {
        return {
            msg: 'TTTTTVueTTTTT',
        }
    }
}