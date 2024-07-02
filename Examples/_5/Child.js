import { H, Ref } from '../../lib/TVue.esm.js'
export const Child = {
    name: "Child",
    Render(proxy) {
        return H("div", {}, [H("div", {}, "child - props - msg: " + this.$props.msg)]);
    },
    Setup: (props, { emit }) => {
        return {

        }
    },
};