import { HasChange, IsObject, Wran } from "../Shared/index"
import { Track, Trigger } from "./Effect"
import { TObject, ReactiveFlag, Reactive, Readonly } from "./Reactive"

const CreateGet = <T extends TObject>(isReadonly = false, isShallow = false) => {
    return (target: T, p: string, receiver: any) => {
        if (p == ReactiveFlag.IsReactive) {
            return !isReadonly
        }
        if (p == ReactiveFlag.IsReadonly) {
            return isReadonly
        }
        const res = Reflect.get(target, p, receiver)

        if (!isShallow && IsObject(res)) {
            return isReadonly ? Readonly(res as unknown as TObject) : Reactive(res as unknown as TObject)
        }

        // FIXME:依赖收集
        if (!isReadonly) {
            Track(target, p)
        }
        return res
    }
}

const CreateSet = <T extends TObject>(isReadonly = false) => {
    return (target: T, p: string, newValue: any, receiver: any) => {
        if (!isReadonly) {
            if (HasChange(Reflect.get(target, p, receiver), newValue)) {
                const res = Reflect.set(target, p, newValue, receiver)
                // FIXME:触发依赖
                Trigger(target, p)
                return res
            }
            else {
                return true
            }
        }
        else {
            Wran("Readonly")
            return true
        }
    }
}

const get = CreateGet()
const set = CreateSet()

const readonlyGet = CreateGet(true)
const readonlySet = CreateSet(true)

const shallowReadonlyGet = CreateGet(true, true)

export const MutableHandler = () => {
    return {
        get,
        set,
    }
}

export const ReadonlyHandler = () => {
    return {
        get: readonlyGet,
        set: readonlySet,
    }
}

export const ShallowReadonlyHandler = () => {
    return {
        get: shallowReadonlyGet,
        set: readonlySet,
    }
}