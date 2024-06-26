import { H, Ref } from '../../lib/TVue.esm.js'

export const App = {
    name: "App",
    Render() {
        return H('div', {
            id: 'Root'
        }, [
            H('div', {}, `Count:${this.count}`),
            H('button', { OnClick: this.OnClick }, 'Click Me')
        ])
    },
    Setup: () => {
        const count = Ref(0)
        const OnClick = () => {
            count.value++
        }
        return {
            count,
            OnClick
        }
    }
}