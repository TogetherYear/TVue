import { MutableHandler, ReadonlyHandler, ShallowReadonlyHandler } from "./BaseHandlers"

type ActiveHandler = typeof MutableHandler | typeof ReadonlyHandler | typeof ShallowReadonlyHandler

export type TObject = Object & Record<any, any>

const CreateActiveObject = <T extends TObject>(obj: T, handler: ActiveHandler) => {
    return new Proxy<T>(obj, handler())
}

export const Reactive = <T extends TObject>(obj: T) => {
    return CreateActiveObject(obj, MutableHandler)
}

export const Readonly = <T extends TObject>(obj: T) => {
    return CreateActiveObject(obj, ReadonlyHandler)
}

export const ShallowReadonly = <T extends TObject>(obj: T) => {
    return CreateActiveObject(obj, ShallowReadonlyHandler)
}

export const IsReactive = <T extends TObject>(obj: T) => {
    return !!obj[ReactiveFlag.IsReactive]
}

export const IsReadonly = <T extends TObject>(obj: T) => {
    return !!obj[ReactiveFlag.IsReadonly]
}

export const IsProxy = <T extends TObject>(obj: T) => {
    return IsReactive(obj) || IsReadonly(obj)
}

export enum ReactiveFlag {
    IsReactive = 'IsReactive',
    IsReadonly = 'IsReadonly',
}