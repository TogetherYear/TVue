import { IsProxy, IsReadonly, Readonly } from "../Reactive";

describe("readonly", () => {
    test("should make nested values readonly", () => {
        const original = { foo: 1, bar: { baz: 2 } };
        const wrapped = Readonly(original);
        expect(wrapped).not.toBe(original);
        wrapped.foo = 2
        expect(wrapped.foo).toBe(1);
        expect(IsReadonly(wrapped)).toBe(true);
        expect(IsReadonly(original)).toBe(false);
        expect(IsReadonly(wrapped.bar)).toBe(true);
        expect(IsReadonly(original.bar)).toBe(false);
        expect(IsProxy(original)).toBe(false)
        expect(IsProxy(wrapped)).toBe(true)
    });

    test("should call console.warn when set", () => {
        console.warn = jest.fn();
        const user = Readonly({
            age: 10,
        });

        user.age = 11;
        expect(console.warn).toHaveBeenCalled();
    });
});