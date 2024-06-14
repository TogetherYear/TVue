import { IComponent } from "./Component"

export interface IVNode {
    component: IComponent | string,
    el: HTMLElement,
    props?: Record<string, unknown>,
    children?: Array<IVNode> | string
}

export const CreateVNode = (component: IComponent | string, props?: Record<string, unknown>, children?: Array<IVNode> | string): IVNode => {
    const vNode = {
        component,
        props,
        children
    }
    return vNode as IVNode
}