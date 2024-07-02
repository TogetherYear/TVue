import { TObject } from "../Reactivity/Reactive"
import { HasKey } from "../Shared/index"
import { IComponentInstance } from "./Component"

interface IComponentPublicInstance {
    _: IComponentInstance
}

const publicPropertiesMap: TObject = {
    $el: (instance: IComponentInstance) => instance.vNode.el,
    $slots: (instance: IComponentInstance) => instance.slots,
    $props: (instance: IComponentInstance) => instance.vNode.props
}

export const ComponentPublicInstance = {
    get: (target: IComponentPublicInstance, p: string, receiver: any) => {
        const instance = target._ as IComponentInstance
        const { setupState } = instance
        const { props } = instance.vNode
        if (HasKey(setupState, p)) {
            return setupState[p]
        }
        else if (HasKey(props, p)) {
            return props[p]
        }
        else if (p in publicPropertiesMap) {
            return publicPropertiesMap[p](instance)
        }
    },
    set: (target: IComponentPublicInstance, p: string, newValue: any, receiver: any) => {
        return true
    }
}