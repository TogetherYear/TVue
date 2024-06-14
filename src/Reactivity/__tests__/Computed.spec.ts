import { Computed } from "../Computed";
import { Reactive } from "../Reactive";

describe("computed", () => {
    test("happy path", () => {
        const user = Reactive({
            age: 1,
        });

        const age = Computed(() => {
            return user.age;
        });

        expect(age.value).toBe(1);
    });

    test("should compute lazily", () => {
        const value = Reactive({
            foo: 1,
        });
        const getter = jest.fn(() => {
            return value.foo;
        });
        const cValue = Computed(getter);

        // lazy
        expect(getter).not.toHaveBeenCalled();

        expect(cValue.value).toBe(1);
        expect(getter).toHaveBeenCalledTimes(1);

        // should not compute again
        cValue.value; // get
        expect(getter).toHaveBeenCalledTimes(1);

        // should not compute until needed
        value.foo = 2;
        expect(getter).toHaveBeenCalledTimes(1);

        // now it should compute
        expect(cValue.value).toBe(2);
        expect(getter).toHaveBeenCalledTimes(2);

        // should not compute again
        cValue.value;
        expect(getter).toHaveBeenCalledTimes(2);
    });
});