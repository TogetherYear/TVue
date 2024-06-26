import { HasChange, IsObject } from "../Shared/index"
import { ReactiveEffect, TrackEffects, TriggerEffects } from "./Effect"
import { Reactive, TObject } from "./Reactive"

class RefImpl<T> {
    constructor(target: T) {
        this.raw = target
        this.target = Convert(target)
    }

    private raw!: T

    private target!: T

    public isRef = true

    private dep = new Set<ReactiveEffect>()

    public get D() {
        return this.dep
    }

    public get value() {
        TrackRefEffects(this)
        return this.target
    }

    public set value(newValue) {
        if (HasChange(this.raw, newValue)) {
            this.raw = newValue
            this.target = Convert(newValue)
            TriggerRefEffects(this)
        }
    }
}

const TrackRefEffects = <T>(ref: RefImpl<T>) => {
    TrackEffects(ref.D)
}

const TriggerRefEffects = <T>(ref: RefImpl<T>) => {
    TriggerEffects(ref.D)
}

const Convert = <T>(target: T) => {
    return IsObject(target) ? Reactive(target as TObject) : target
}

export const Ref = <T>(target: T) => {
    const ri = new RefImpl(target)
    return ri
}

export const IsRef = <T>(target: T) => {
    // @ts-ignore
    return !!target.isRef
}

export const UnRef = <T>(target: T) => {
    return IsRef(target) ? (target as RefImpl<T>).value : target
}

export const ProxyRefs = <T extends TObject>(objWithRefs: T) => {
    return new Proxy<T>(objWithRefs, {
        get: (target: TObject, p: string, receiver: any) => {
            const res = Reflect.get(target, p, receiver)
            return UnRef(res)
        },
        set: (target: TObject, p: string, newValue: any, receiver: any) => {
            if (IsRef(target[p]) && !IsRef(newValue)) {
                return (target[p] as RefImpl<unknown>).value = newValue
            }
            else {
                return Reflect.set(target, p, newValue, receiver)
            }
        }
    })
}