import { Effect } from "../Effect";
import { Reactive } from "../Reactive";
import { IsRef, ProxyRefs, Ref, UnRef } from "../Ref"

describe("Ref", () => {
    test("happy path", () => {
        const a = Ref(1)
        expect(a.value).toBe(1)
    })

    test("should be reactive", () => {
        const a = Ref(1);
        let dummy;
        let calls = 0;
        Effect(() => {
            calls++;
            dummy = a.value;
        });
        expect(calls).toBe(1);
        expect(dummy).toBe(1);
        a.value = 2;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);
        // same value should not trigger
        a.value = 2;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);
    });

    test("should make nested properties reactive", () => {
        const a = Ref({
            count: 1,
        });
        let dummy;
        let calls = 0;
        Effect(() => {
            calls++
            dummy = a.value.count;
        });
        expect(dummy).toBe(1);
        expect(calls).toBe(1);
        a.value.count = 2;
        expect(dummy).toBe(2);
        expect(calls).toBe(2);
    });

    test("isRef unRef", () => {
        const a = Ref(1)
        const user = Reactive({
            name: "A"
        })
        expect(IsRef(a)).toBe(true)
        expect(UnRef(a)).toBe(1)
        expect(IsRef(user)).toBe(false)
        expect(IsRef(1)).toBe(false)
    })

    test("proxyRefs", () => {
        const user = {
            age: Ref(10),
            name: "xiaohong",
        };

        const proxyUser = ProxyRefs(user);
        expect(user.age.value).toBe(10);
        expect(proxyUser.age).toBe(10);
        expect(proxyUser.name).toBe("xiaohong");

        //@ts-ignore
        proxyUser.age = 20;
        expect(proxyUser.age).toBe(20);
        expect(user.age.value).toBe(20);

        proxyUser.age = Ref(10);
        expect(proxyUser.age).toBe(10);
        expect(user.age.value).toBe(10);
    });
})