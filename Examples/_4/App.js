import { H, Reactive, Ref } from '../../lib/TVue.esm.js'
import { ArrayToText } from './ArrayToText.js'
import { TextToText } from './TextToText.js'
import { TextToArray } from './TextToArray.js'
import { ArrayToArray } from './ArrayToArray.js'

export const App = {
    name: "App",
    Render() {
        return H('div', { id: 'Root' }, [
            H('p', {}, "主页"),
            H(ArrayToArray)
        ])
    },
    Setup: () => {
        return {

        }
    }
}