import { Effect } from "../Effect"
import { IsProxy, IsReactive, Reactive } from "../Reactive"

describe('Reactivity', () => {
    test('Core', () => {
        const origin = { foo: 1 }
        const observed = Reactive({ foo: 1 })
        expect(origin).not.toBe(observed)
        expect(observed.foo).toBe(1)
        expect(IsReactive(observed)).toBe(true)
        expect(IsReactive(origin)).toBe(false)
        expect(IsProxy(origin)).toBe(false)
        expect(IsProxy(observed)).toBe(true)
    })

    test("nested reactives", () => {
        const original = {
            nested: {
                foo: 1,
            },
            array: [{ bar: 2 }],
        };
        const observed = Reactive(original);
        expect(IsReactive(observed.nested)).toBe(true);
        expect(IsReactive(observed.array)).toBe(true);
        expect(IsReactive(observed.array[0])).toBe(true);
    });

    test("reactive calls", () => {
        const a = Reactive({
            value: 1
        });
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
    })

})