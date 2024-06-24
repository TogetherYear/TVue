import { ShapeFlag } from "../Shared/ShapeFlag";
import { CreateComponentInstance, IComponentInstance, SetupComponent } from "./Component";
import { IVNode, SpecialTag } from "./VNode";

export const Render = (vNode: IVNode, container: HTMLElement) => {
    Patch(vNode, container)
}

const Patch = (vNode: IVNode, container: HTMLElement) => {
    const { component, shapeFlag } = vNode

    switch (component) {
        case SpecialTag.Fragment:
            ProcessFragment(vNode, container)
            break;
        case SpecialTag.Text:
            ProcessText(vNode, container)
            break;
        default:
            if (shapeFlag & ShapeFlag.Element) {
                ProcessElement(vNode, container)
            }
            else if (shapeFlag & ShapeFlag.StateFulComponent) {
                ProcessComponent(vNode, container)
            }
            else {
                console.log("Special:", vNode)
            }
            break;
    }
}

const ProcessFragment = (vNode: IVNode, container: HTMLElement) => {
    MountChildren(vNode, container)
}

const ProcessText = (vNode: IVNode, container: HTMLElement) => {
    const { children } = vNode
    const textNode = (vNode.el = document.createTextNode(children as string))
    container.append(textNode)
}

const ProcessElement = (vNode: IVNode, container: HTMLElement) => {
    MountElement(vNode, container)
}

const MountElement = (vNode: IVNode, container: HTMLElement) => {
    const el = (vNode.el = document.createElement(vNode.component as string))
    const { shapeFlag, children, props } = vNode
    if (shapeFlag & ShapeFlag.TextChildren && children) {
        el.textContent = children as string
    }
    else if (shapeFlag & ShapeFlag.ArrayChildren) {
        MountChildren(vNode, el)
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

const MountChildren = (vNode: IVNode, container: HTMLElement) => {
    (vNode.children as Array<IVNode>).forEach(v => {
        Patch(v, container)
    })
}

const ProcessComponent = (vNode: IVNode, container: HTMLElement) => {
    MountComponent(vNode, container)
}

const MountComponent = (initinalVNode: IVNode, container: HTMLElement) => {
    const instance = CreateComponentInstance(initinalVNode)
    SetupComponent(instance)
    SetupRenderEffect(instance, container)
}

const SetupRenderEffect = (instance: IComponentInstance, container: HTMLElement) => {
    const { proxy } = instance
    const subTree = instance.Render.call(proxy)
    Patch(subTree, container)
    instance.vNode.el = subTree.el
}

