import { TObject } from "../Reactivity/Reactive"

export const Wran = (...args: Array<unknown>) => {
    console.warn(...args)
}

export const IsObject = (val: unknown) => {
    return val !== null && typeof val === 'object'
}

export const HasChange = <T>(v1: T, v2: T) => {
    return !Object.is(v1, v2)
}

export const HasKey = (obj: TObject, p: string) => {
    return Object.prototype.hasOwnProperty.call(obj, p)
}