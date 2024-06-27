import { H, Reactive, Ref } from '../../lib/TVue.esm.js'
const nextChildren = "newChildren";
const prevChildren = [H("div", {}, "A"), H("div", {}, "B")];

export const ArrayToText = {
    name: "ArrayToText",
    Setup: () => {
        const isChange = Ref(false);
        window.isChange = isChange;

        return {
            isChange,
        };
    },
    Render() {
        return this.isChange === true
            ? H("div", {}, nextChildren)
            : H("div", {}, prevChildren);
    },
};