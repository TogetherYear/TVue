import { H } from '../../lib/TVue.esm.js'

export const App = {
    name: "App",
    Render() {
        return H('Rect', {
            x: this.x,
            y: this.y,
        })
    },
    Setup: () => {
        return {
            x: 50,
            y: 50,
        }
    }
}