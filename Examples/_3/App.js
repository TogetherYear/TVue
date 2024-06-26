import { H, Reactive, Ref } from '../../lib/TVue.esm.js'

export const App = {
    name: "App",
    Render() {
        return H('div', { id: 'Root', ...this.props }, [
            H('div', {}, `Count:${this.count}`),
            H('button', { OnClick: this.OnAddValue }, 'AddValue'),
            H('button', { OnClick: this.OnChangeProp }, 'ChangeProp'),
            H('button', { OnClick: this.OnChangePropToUndefined }, 'ChangePropToUndefined'),
            H('button', { OnClick: this.ChangePropToDelete }, 'ChangePropToDelete'),
        ])
    },
    Setup: () => {
        const count = Ref(0)
        const props = Ref({
            foo: 'foo',
            bar: 'bar'
        })
        const OnAddValue = () => {
            count.value++
        }
        const OnChangeProp = () => {
            props.value.foo = 'new-foo'
        }
        const OnChangePropToUndefined = () => {
            props.value.foo = undefined
        }
        const ChangePropToDelete = () => {
            props.value = {
                foo: 'foo'
            }
        }
        return {
            count,
            props,
            OnAddValue,
            OnChangeProp,
            OnChangePropToUndefined,
            ChangePropToDelete,
        }
    }
}