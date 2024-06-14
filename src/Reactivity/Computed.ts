import { ReactiveEffect } from "./Effect"

type CFn = () => unknown

class ComputedRefImpl {
    constructor(getter: CFn) {
        this.getter = getter
        this.effect = new ReactiveEffect(getter, {
            scheduler: () => {
                if (!this.isDirty) {
                    this.isDirty = true
                }
            }
        })
    }

    private getter!: CFn

    private cache!: unknown

    private isDirty = true

    private effect!: ReactiveEffect

    public get value() {
        if (this.isDirty) {
            this.isDirty = false
            this.cache = this.effect.Run()
        }
        return this.cache
    }

    public set value(newValue) {

    }
}

export const Computed = (getter: CFn) => {
    const cr = new ComputedRefImpl(getter)
    return cr
}