import { ShapeFlag } from "../Shared/ShapeFlag"
import { IComponent } from "./Component"

export enum SpecialTag {
    Text = 'Text',
    Fragment = 'Fragment',
}

export interface IVNode {
    component: IComponent | string,
    el: HTMLElement | Text,
    props: Record<string, unknown>,
    shapeFlag: ShapeFlag,
    key: string,
    children?: Children
}

export type ChildrenObject = {
    [key: string]: (...args: Array<unknown>) => Array<IVNode>
}

export type Children = Array<IVNode> | ChildrenObject | string

export const CreateVNode = (component: IComponent | string, props: Record<string, unknown> = {}, children?: Children): IVNode => {
    const vNode = {
        component,
        props,
        children,
        key: props.key || '',
        shapeFlag: GetShapeFlag(component)
    }
    if (typeof children === 'string') {
        vNode.shapeFlag |= ShapeFlag.TextChildren
    }
    else if ((vNode.shapeFlag & ShapeFlag.StateFulComponent) && (typeof children === 'object')) {
        vNode.shapeFlag |= ShapeFlag.SlotChildren
    }
    else if (Array.isArray(children)) {
        vNode.shapeFlag |= ShapeFlag.ArrayChildren
    }
    return vNode as IVNode
}

export const CreateTextVNode = (text: string) => {
    return CreateVNode(SpecialTag.Text, {}, text)
}

const GetShapeFlag = (type: unknown) => {
    return typeof type === 'string'
        ? ShapeFlag.Element
        : ShapeFlag.StateFulComponent
}