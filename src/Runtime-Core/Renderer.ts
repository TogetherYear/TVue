import { Effect } from "../Reactivity/Effect";
import { ShapeFlag } from "../Shared/ShapeFlag";
import { CreateComponentInstance, IComponentInstance, SetupComponent } from "./Component";
import { CreateAppApi } from "./CreateApp";
import { Children, IVNode, SpecialTag } from "./VNode";

export interface IRendererDom {
    HostCreateElement: (type: string) => HTMLElement
    HostCreateTextNode: (text: string) => Text
    HostPatchProp: (el: HTMLElement, key: string, prevValue: unknown, value: unknown) => void
    HostInsert: (el: HTMLElement | Text, container: HTMLElement) => void
    HostRemove: (el: HTMLElement | Text) => void
    HostSetElementText: (el: HTMLElement, text: string) => void
}

export type RenderFN = (vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => void

export const CreateRenderer = (options: IRendererDom) => {

    const { HostCreateElement, HostCreateTextNode, HostPatchProp, HostInsert, HostRemove, HostSetElementText } = options

    const Render: RenderFN = (vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
        Patch(null, vNode, container, parentComponent)
    }

    const Patch = (prevVNode: IVNode | null, vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
        const { component, shapeFlag } = vNode

        switch (component) {
            case SpecialTag.Fragment:
                ProcessFragment(prevVNode, vNode, container, parentComponent)
                break;
            case SpecialTag.Text:
                ProcessText(prevVNode, vNode, container)
                break;
            default:
                if (shapeFlag & ShapeFlag.Element) {
                    ProcessElement(prevVNode, vNode, container, parentComponent)
                }
                else if (shapeFlag & ShapeFlag.StateFulComponent) {
                    ProcessComponent(prevVNode, vNode, container, parentComponent)
                }
                else {
                    console.log("Special:", vNode)
                }
                break;
        }
    }

    const ProcessFragment = (prevVNode: IVNode | null, vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
        MountChildren(vNode.children as Array<IVNode>, container, parentComponent)
    }

    const ProcessText = (prevVNode: IVNode | null, vNode: IVNode, container: HTMLElement) => {
        const { children } = vNode
        const textNode = (vNode.el = HostCreateTextNode(children as string))
        HostInsert(textNode, container)
    }

    const ProcessElement = (prevVNode: IVNode | null, vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
        if (!prevVNode) {
            MountElement(vNode, container, parentComponent)
        }
        else {
            PatchElement(prevVNode, vNode, container, parentComponent)
        }
    }

    const MountElement = (vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
        const el = (vNode.el = HostCreateElement(vNode.component as string))
        const { shapeFlag, children, props } = vNode
        if (shapeFlag & ShapeFlag.TextChildren && children) {
            el.textContent = children as string
        }
        else if (shapeFlag & ShapeFlag.ArrayChildren) {
            MountChildren(vNode.children as Array<IVNode>, el, parentComponent)
        }
        for (let key in props) {
            const val = props[key]
            HostPatchProp(el, key, null, val)
        }

        HostInsert(el, container)
    }

    const PatchElement = (prevVNode: IVNode, vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
        const el = vNode.el = prevVNode.el
        PatchChildren(el as HTMLElement, prevVNode, vNode, parentComponent)
        PatchProps(el as HTMLElement, prevVNode.props, vNode.props, parentComponent)
    }

    const PatchProps = (el: HTMLElement, prevProps: Record<string, unknown>, props: Record<string, unknown>, parentComponent?: IComponentInstance) => {
        if (prevProps !== props) {
            for (let key in props) {
                const prevProp = prevProps[key]
                const prop = props[key]
                if (prevProp !== prop) {
                    HostPatchProp(el, key, prevProp, prop)
                }
            }
            if (Object.keys(prevProps).length != 0) {
                for (let key in prevProps) {
                    if (!(key in props)) {
                        HostPatchProp(el, key, prevProps[key], null)
                    }
                }
            }
        }
    }

    const PatchChildren = (el: HTMLElement, prevVNode: IVNode, vNode: IVNode, parentComponent?: IComponentInstance) => {
        const { shapeFlag: prevFlag } = prevVNode
        const { shapeFlag: flag } = vNode
        if (flag & ShapeFlag.TextChildren) {
            if (prevFlag & ShapeFlag.ArrayChildren) {
                UnmountChildren(prevVNode.children as Array<IVNode>)
                HostSetElementText(el, vNode.children as string)
            }
            else if (prevFlag & ShapeFlag.TextChildren) {
                if (prevVNode.children !== vNode.children) {
                    HostSetElementText(el, vNode.children as string)
                }
            }
        }
        else if (flag & ShapeFlag.ArrayChildren) {
            if (prevFlag & ShapeFlag.TextChildren) {
                HostSetElementText(el, "")
                MountChildren(vNode.children as Array<IVNode>, el, parentComponent)
            }
            else if (prevFlag & ShapeFlag.ArrayChildren) {

            }
        }
    }

    const UnmountChildren = (children: Array<IVNode>) => {
        children.forEach(c => HostRemove(c.el))
    }

    const MountChildren = (children: Array<IVNode>, container: HTMLElement, parentComponent?: IComponentInstance) => {
        children.forEach(v => {
            Patch(null, v, container, parentComponent)
        })
    }

    const ProcessComponent = (prevVNode: IVNode | null, vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
        MountComponent(vNode, container, parentComponent)
    }

    const MountComponent = (initinalVNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => {
        const instance = CreateComponentInstance(initinalVNode, parentComponent)
        SetupComponent(instance)
        SetupRenderEffect(instance, container)
    }

    const SetupRenderEffect = (instance: IComponentInstance, container: HTMLElement) => {
        Effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance
                const subTree = instance.subTree = instance.Render.call(proxy)
                Patch(null, subTree, container, instance)
                instance.vNode.el = subTree.el
                instance.isMounted = true
            }
            else {
                const { proxy } = instance
                const subTree = instance.Render.call(proxy)
                const prevSubTree = instance.subTree
                instance.subTree = subTree
                Patch(prevSubTree, subTree, container, instance)
            }
        })
    }

    return {
        CreateApp: CreateAppApi(Render)
    }
}