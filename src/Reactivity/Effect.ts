import { TObject } from "./Reactive"

type EFn = () => unknown

type EOptions<T> = {
    scheduler?: T,
    onStop?: T
}

export class ReactiveEffect {
    constructor(fn: EFn, options?: EOptions<EFn>) {
        this.fn = fn
        this.options = options
    }

    private fn!: EFn

    private deps = new Set<Set<ReactiveEffect>>

    private active = true

    public get D() {
        return this.deps
    }

    public get F() {
        return this.fn
    }

    private options: EOptions<EFn> | undefined = undefined

    public get O() {
        return this.options
    }

    public Run() {
        activeEffect = this
        const res = this.fn()
        activeEffect = null
        return res
    }

    public AddDep(dep: Set<ReactiveEffect>) {
        //@ts-ignore
        this.fn.effect = this
        this.deps.add(dep)
    }

    public get TrackFn() {
        return this.options?.scheduler || this.fn
    }

    public CleanupEffect() {
        if (this.active) {
            this.active = false
            this.deps.forEach(dep => dep.delete(this))
            this.deps.clear()
            this.options?.onStop && this.options.onStop()
        }
    }
}

const targetMap = new Map<
    TObject, Map<string, Set<ReactiveEffect>>
>()

let activeEffect: ReactiveEffect | null = null

const GetDep = <T extends TObject>(obj: T, key: string) => {
    let depMap = targetMap.get(obj)
    if (!depMap) {
        depMap = new Map<string, Set<ReactiveEffect>>
        targetMap.set(obj, depMap)
    }
    let dep = depMap.get(key)
    if (!dep) {
        dep = new Set<ReactiveEffect>()
        depMap.set(key, dep)
    }
    return dep
}

function IsTracking() {
    return !!activeEffect
}

export const Track = <T extends TObject>(obj: T, key: string) => {
    if (activeEffect) {
        const dep = GetDep(obj, key)
        TrackEffects(dep)
    }
}

export const TrackEffects = (dep: Set<ReactiveEffect>) => {
    if (activeEffect) {
        !dep.has(activeEffect) && dep.add(activeEffect)
        !activeEffect.D.has(dep) && activeEffect.AddDep(dep)
    }
}

export const Trigger = <T extends TObject>(obj: T, key: string) => {
    const dep = GetDep(obj, key)
    TriggerEffects(dep)
}

export const TriggerEffects = (dep: Set<ReactiveEffect>) => {
    dep.forEach(c => c.TrackFn())
}

export const Effect = (fn: EFn, options?: EOptions<EFn>) => {
    const re = new ReactiveEffect(fn, options)
    re.Run()
    return fn
}

export const Stop = (fn: EFn) => {
    //@ts-ignore
    fn.effect.CleanupEffect()
}