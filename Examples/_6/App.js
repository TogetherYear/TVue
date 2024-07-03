import { H, Ref, GetCurrentInstance, NextTick } from '../../lib/TVue.esm.js'

export const App = {
    name: "App",
    Setup: () => {
        const count = Ref(1);
        const instance = GetCurrentInstance();

        async function OnClick() {
            for (let i = 0; i < 100; i++) {
                console.log("update");
                count.value = i;
            }

            // debugger;
            // console.log(instance);
            // NextTick(() => {
            //     console.log(instance);
            // });

            // await NextTick()
            // console.log(instance)
        }

        return {
            OnClick,
            count,
        };
    },
    Render() {
        const button = H("button", { OnClick: this.OnClick }, "update");
        const p = H("p", {}, "count:" + this.count);

        return H("div", {}, [button, p]);
    },
};