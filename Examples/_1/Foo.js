import { H } from '../../lib/TVue.esm.js'

export const Foo = {
    Render() {
        return H("div", {}, [
            H("div", {}, `Foo:${this.msg}:${this.count}`),
            H('button', {
                OnClick: (e) => {
                    e.stopPropagation()
                    this.Add()
                }
            }, "Click Me!")
        ])
    },
    Setup: (props, { Emit }) => {
        const Add = () => {
            console.log("Add")
            Emit("Add", 1, 2)
        }
        return {
            msg: 'TTTTTVueTTTTT',
            Add,
        }
    }
}