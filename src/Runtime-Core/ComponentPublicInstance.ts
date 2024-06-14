import { TObject } from "../Reactivity/Reactive"
import { IComponentInstance } from "./Component"

interface IComponentPublicInstance {
    _: IComponentInstance
}

const publicPropertiesMap: TObject = {
    $el: (instance: IComponentInstance) => instance.vNode.el
}

export const ComponentPublicInstance = {
    get: (target: IComponentPublicInstance, p: string, receiver: any) => {
        const instance = target._ as IComponentInstance
        const { setupState } = instance
        if (p in setupState) {
            return setupState[p]
        }
        else if (p in publicPropertiesMap) {
            return publicPropertiesMap[p](instance)
        }
    },
    set: (target: IComponentPublicInstance, p: string, newValue: any, receiver: any) => {
        return true
    }
}