import { H } from '../../lib/TVue.esm.js'

export const Foo = {
    Render() {
        return H("div", {}, `Foo:${this.msg}:${this.count}`)
    },
    Setup: (props) => {
        console.log(props)
        console.log(props['IsReadonly'])
        return {
            msg: 'TTTTTVueTTTTT'
        }
    }
}