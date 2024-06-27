import { H, Ref } from '../../lib/TVue.esm.js'

const prevChildren = "oldChild";
const nextChildren = "newChild";

export const TextToText = {
    name: "TextToText",
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