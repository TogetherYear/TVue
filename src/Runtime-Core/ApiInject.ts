import { GetCurrentInstance, IComponentInstance } from "./Component"

export const Provide = <T>(key: string, value: T) => {
    const instance = GetCurrentInstance()
    if (instance) {
        let { provides } = instance
        const parentProvide = instance.parent?.provides
        if (provides === parentProvide) {
            provides = instance.provides = Object.create(parentProvide)
        }
        provides[key] = value
    }
}

export const Inject = <T>(key: string, defaultValue?: T | Function): T | undefined => {
    const instance = GetCurrentInstance()
    const empty = defaultValue ? (typeof defaultValue === 'function' ? (defaultValue as Function)() : defaultValue) : undefined
    if (instance) {
        return instance.parent ? (instance.parent.provides[key] || empty) : empty
    }
    else {
        return empty
    }
}