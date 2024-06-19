import { ShapeFlag } from "../Shared/ShapeFlag"
import { IComponent } from "./Component"

export interface IVNode {
    component: IComponent | string,
    el: HTMLElement,
    props?: Record<string, unknown>,
    shapeFlag: ShapeFlag,
    children?: Array<IVNode> | string
}

export const CreateVNode = (component: IComponent | string, props?: Record<string, unknown>, children?: Array<IVNode> | string): IVNode => {
    const vNode = {
        component,
        props,
        children,
        shapeFlag: GetShapeFlag(component)
    }
    if (typeof children === 'string') {
        vNode.shapeFlag |= ShapeFlag.TextChildren
    }
    else if (Array.isArray(children)) {
        vNode.shapeFlag |= ShapeFlag.ArrayChildren
    }
    return vNode as IVNode
}

const GetShapeFlag = (type: unknown) => {
    return typeof type === 'string'
        ? ShapeFlag.Element
        : ShapeFlag.StateFulComponent
}