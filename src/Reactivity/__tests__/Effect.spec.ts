import { Effect, Stop } from "../Effect";
import { Reactive } from "../Reactive";

describe('Effect', () => {
    test('Core', () => {
        const user = Reactive({
            age: 10
        })
        let nextAge;
        Effect(() => {
            nextAge = user.age + 1
        })

        expect(nextAge).toBe(11)

        user.age++

        expect(nextAge).toBe(12)
    })

    test('Other', () => {
        let foo = 10

        const Runner = Effect(() => {
            foo++
            return 'foo'
        })

        expect(foo).toBe(11)
        const r = Runner()
        expect(foo).toBe(12)
        expect(r).toBe('foo')
    })

    test('scheduler', () => {
        let dummy;
        let run;
        const scheduler = jest.fn(() => {
            run = runner
        })
        const obj = Reactive({ foo: 1 })
        const runner = Effect(() => {
            dummy = obj.foo
        }, {
            scheduler
        })
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        expect(dummy).toBe(1)
        //@ts-ignore
        run()
        expect(dummy).toBe(2)
    })

    test("stop", () => {
        let dummy;
        const obj = Reactive({ prop: 1 });
        const runner = Effect(() => {
            dummy = obj.prop;
        });
        obj.prop = 2;
        expect(dummy).toBe(2);
        Stop(runner);
        // obj.prop = 3;
        obj.prop++;
        expect(dummy).toBe(2);
        runner();
        expect(dummy).toBe(3);
    });

    test("onStop", () => {
        const obj = Reactive({
            foo: 1,
        });
        const onStop = jest.fn();
        let dummy;
        const runner = Effect(
            () => {
                dummy = obj.foo;
            },
            {
                onStop,
            }
        );

        Stop(runner);
        expect(onStop).toHaveBeenCalledTimes(1);
    });

})