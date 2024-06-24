import { ShapeFlag } from "../Shared/ShapeFlag";
import { CreateComponentInstance, IComponentInstance, SetupComponent } from "./Component";
import { IVNode, SpecialTag } from "./VNode";

export const Render = (vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
    Patch(vNode, container, parentComponent)
}

const Patch = (vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
    const { component, shapeFlag } = vNode

    switch (component) {
        case SpecialTag.Fragment:
            ProcessFragment(vNode, container, parentComponent)
            break;
        case SpecialTag.Text:
            ProcessText(vNode, container)
            break;
        default:
            if (shapeFlag & ShapeFlag.Element) {
                ProcessElement(vNode, container, parentComponent)
            }
            else if (shapeFlag & ShapeFlag.StateFulComponent) {
                ProcessComponent(vNode, container, parentComponent)
            }
            else {
                console.log("Special:", vNode)
            }
            break;
    }
}

const ProcessFragment = (vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
    MountChildren(vNode, container, parentComponent)
}

const ProcessText = (vNode: IVNode, container: HTMLElement) => {
    const { children } = vNode
    const textNode = (vNode.el = document.createTextNode(children as string))
    container.append(textNode)
}

const ProcessElement = (vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
    MountElement(vNode, container, parentComponent)
}

const MountElement = (vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
    const el = (vNode.el = document.createElement(vNode.component as string))
    const { shapeFlag, children, props } = vNode
    if (shapeFlag & ShapeFlag.TextChildren && children) {
        el.textContent = children as string
    }
    else if (shapeFlag & ShapeFlag.ArrayChildren) {
        MountChildren(vNode, el, parentComponent)
    }
    for (let key in props) {
        const val = props[key]
        if (key.startsWith('On') && typeof val === 'function') {
            const event = key.slice(2).toLowerCase()
            //@ts-ignore
            el.addEventListener(event, val)
        }
        else {
            //@ts-ignore
            el.setAttribute(key, val)
        }
    }
    container.append(el)
}

const MountChildren = (vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
    (vNode.children as Array<IVNode>).forEach(v => {
        Patch(v, container, parentComponent)
    })
}

const ProcessComponent = (vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
    MountComponent(vNode, container, parentComponent)
}

const MountComponent = (initinalVNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
    const instance = CreateComponentInstance(initinalVNode, parentComponent)
    SetupComponent(instance)
    SetupRenderEffect(instance, container)
}

const SetupRenderEffect = (instance: IComponentInstance, container: HTMLElement) => {
    const { proxy } = instance
    const subTree = instance.Render.call(proxy)
    Patch(subTree, container, instance)
    instance.vNode.el = subTree.el
}

