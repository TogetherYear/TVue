import { IComponent } from './Component'
import { CreateVNode, IVNode } from './VNode'

export const H = (component: IComponent, props?: Record<string, unknown>, children?: Array<IVNode> | string) => {
    return CreateVNode(component, props, children)
}