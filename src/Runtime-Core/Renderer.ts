import { IsObject } from "../Shared/index";
import { CreateComponentInstance, IComponentInstance, SetupComponent } from "./Component";
import { IVNode } from "./VNode";

export const Render = (vNode: IVNode, container: HTMLElement) => {
    Patch(vNode, container)
}

const Patch = (vNode: IVNode, container: HTMLElement) => {
    if (typeof vNode.component === 'string') {
        ProcessElement(vNode, container)
    }
    else if (IsObject(vNode.component)) {
        ProcessComponent(vNode, container)
    }
}

const ProcessElement = (vNode: IVNode, container: HTMLElement) => {
    MountElement(vNode, container)
}

const MountElement = (vNode: IVNode, container: HTMLElement) => {
    const el = (vNode.el = document.createElement(vNode.component as string))
    if (typeof vNode.children === 'string') {
        el.textContent = vNode.children
    }
    else if (Array.isArray(vNode.children)) {
        MountChildren(vNode, el)
    }
    for (let key in vNode.props) {
        //@ts-ignore
        el.setAttribute(key, vNode.props[key])
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

