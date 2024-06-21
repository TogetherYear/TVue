import { IComponent } from './Component'
import { Children, CreateVNode, IVNode } from './VNode'

export const H = (component: IComponent | string, props?: Record<string, unknown>, children?: Children) => {
    return CreateVNode(component, props, children)
}