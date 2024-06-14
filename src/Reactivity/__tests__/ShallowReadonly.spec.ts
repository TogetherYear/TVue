import { IsReadonly, ShallowReadonly } from "../Reactive";

describe("shallowReadonly", () => {
    test("should not make non-reactive properties reactive", () => {
        const props = ShallowReadonly({ n: { foo: 1 } });
        expect(IsReadonly(props)).toBe(true);
        expect(IsReadonly(props.n)).toBe(false);
    });

    test("should call console.warn when set", () => {
        console.warn = jest.fn();
        const user = ShallowReadonly({
            age: 10,
        });

        user.age = 11;
        expect(console.warn).toHaveBeenCalled();
    });
});