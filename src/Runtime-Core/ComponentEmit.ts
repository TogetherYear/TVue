import { IComponentInstance } from "./Component"

export const InitEmit = (instance: IComponentInstance) => {
    instance.Emit = (event: string, ...args: Array<unknown>) => {
        const { props } = instance.vNode
        const target = HandlerKey(event)
        props[target] && (props[target] as Function)(...args)
    }
}

const HandlerKey = (event: string) => {
    return `On${event}`
}