import { H, Provide } from '../../lib/TVue.esm.js'
import { Foo } from './Foo.js'

export const App = {
    name: "App",
    Render() {
        return H('div', {}, [H('div', {}, 'app'), H(Foo)])
    },
    Setup: () => {
        Provide('_1', '_1111111')
        Provide('_2', '_2222222')
        return {

        }
    }
}