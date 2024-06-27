import { H, Ref } from '../../lib/TVue.esm.js'

const prevChildren = "oldChild";
const nextChildren = [H("div", {}, "A"), H("div", {}, "B")];

export const TextToArray = {
    name: "TextToArray",
    Setup: () => {
        const isChange = Ref(false);
        window.isChange = isChange;

        return {
            isChange,
        };
    },
    Render() {
        const self = this;

        return self.isChange === true
            ? H("div", {}, nextChildren)
            : H("div", {}, prevChildren);
    },
};