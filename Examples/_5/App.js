import { H, Ref } from '../../lib/TVue.esm.js'
import { Child } from './Child.js';

export const App = {
    name: "App",
    Render() {
        return H("div", {}, [
            H("div", {}, "你好"),
            H(
                "button",
                {
                    OnClick: this.OnChangeChildProps,
                },
                "change child props"
            ),
            H(Child, {
                msg: this.msg,
            }),
            H(
                "button",
                {
                    OnClick: this.OnChangeCount,
                },
                "change self count"
            ),
            H("p", {}, "count: " + this.count),
        ]);
    },
    Setup: (props, { emit }) => {
        const msg = Ref('123')
        const count = Ref(1)
        const OnChangeChildProps = () => {
            msg.value = "456";
        }
        const OnChangeCount = () => {
            count.value++
        }
        return {
            msg,
            count,
            OnChangeChildProps,
            OnChangeCount,
        }
    }
}