import { ShallowReadonly, TObject } from "../Reactivity/Reactive";
import { InitEmit } from "./ComponentEmit";
import { InitProps } from "./ComponentProps";
import { ComponentPublicInstance } from "./ComponentPublicInstance";
import { InitSlots } from "./ComponentSlots";
import { Children, IVNode } from "./VNode";

export interface IComponent {
    Render: (...args: Array<unknown>) => IVNode,
    Setup?: (...args: Array<unknown>) => TObject
}

export interface IComponentInstance {
    vNode: IVNode,
    setupState: TObject,
    slots?: Children,
    proxy: ProxyConstructor
    Render: (...args: Array<unknown>) => IVNode,
    Emit: (event: string, ...args: Array<unknown>) => unknown
}

export const CreateComponentInstance = (vNode: IVNode): IComponentInstance => {
    const instance = {
        vNode,
    }
    return instance as IComponentInstance
}

export const SetupComponent = (instance: IComponentInstance) => {
    InitProps(instance)
    InitEmit(instance)
    InitSlots(instance)
    SetupStatefulComponent(instance)
}

export const SetupStatefulComponent = (instance: IComponentInstance) => {
    const component = instance.vNode.component as IComponent
    SetCurrentInstance(instance)
    const setupResult = component.Setup
        ? component.Setup(ShallowReadonly(instance.vNode.props), {
            Emit: instance.Emit
        })
        : {}
    SetCurrentInstance(null)
    HandleSetupResult(instance, setupResult)
}

const HandleSetupResult = (instance: IComponentInstance, setupResult: TObject) => {
    instance.setupState = setupResult
    HandleSeutpProxy(instance)
    FinishComponentSetup(instance)
}

const HandleSeutpProxy = (instance: IComponentInstance) => {
    const ctx: TObject = {
        _: instance,
    }
    //@ts-ignore
    instance.proxy = new Proxy(ctx, ComponentPublicInstance)
}

const FinishComponentSetup = (instance: IComponentInstance) => {
    const component = instance.vNode.component as IComponent
    instance.Render = component.Render
}

let currentInstance: IComponentInstance | null = null

export const GetCurrentInstance = () => {
    return currentInstance
}

const SetCurrentInstance = (instance: IComponentInstance | null) => {
    currentInstance = instance
}