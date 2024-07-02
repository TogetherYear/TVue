import { Effect } from "../Reactivity/Effect";
import { GetSequence } from "../Shared/index";
import { ShapeFlag } from "../Shared/ShapeFlag";
import { CreateComponentInstance, IComponentInstance, SetupComponent } from "./Component";
import { CreateAppApi } from "./CreateApp";
import { Children, IVNode, SpecialTag } from "./VNode";

export interface IRendererDom {
    HostCreateElement: (type: string) => HTMLElement
    HostCreateTextNode: (text: string) => Text
    HostPatchProp: (el: HTMLElement, key: string, prevValue: unknown, value: unknown) => void
    HostInsert: (el: HTMLElement | Text, container: HTMLElement, anchor?: HTMLElement | Text) => void
    HostRemove: (el: HTMLElement | Text) => void
    HostSetElementText: (el: HTMLElement, text: string) => void
}

export type RenderFN = (vNode: IVNode, container: HTMLElement) => void

export const CreateRenderer = (options: IRendererDom) => {

    const { HostCreateElement, HostCreateTextNode, HostPatchProp, HostInsert, HostRemove, HostSetElementText } = options

    const Render: RenderFN = (vNode: IVNode, container: HTMLElement) => {
        Patch(null, vNode, container)
    }

    const Patch = (prevVNode: IVNode | null, vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance, anchor?: HTMLElement | Text) => {
        const { component, shapeFlag } = vNode

        switch (component) {
            case SpecialTag.Fragment:
                ProcessFragment(prevVNode, vNode, container, parentComponent, anchor)
                break;
            case SpecialTag.Text:
                ProcessText(prevVNode, vNode, container, anchor)
                break;
            default:
                if (shapeFlag & ShapeFlag.Element) {
                    ProcessElement(prevVNode, vNode, container, parentComponent, anchor)
                }
                else if (shapeFlag & ShapeFlag.StateFulComponent) {
                    ProcessComponent(prevVNode, vNode, container, parentComponent, anchor)
                }
                else {
                    console.log("Special:", vNode)
                }
                break;
        }
    }

    const ProcessFragment = (prevVNode: IVNode | null, vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance, anchor?: HTMLElement | Text) => {
        MountChildren(vNode.children as Array<IVNode>, container, parentComponent, anchor)
    }

    const ProcessText = (prevVNode: IVNode | null, vNode: IVNode, container: HTMLElement, anchor?: HTMLElement | Text) => {
        const { children } = vNode
        const textNode = (vNode.el = HostCreateTextNode(children as string))
        HostInsert(textNode, container, anchor)
    }

    const ProcessElement = (prevVNode: IVNode | null, vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance, anchor?: HTMLElement | Text) => {
        if (!prevVNode) {
            MountElement(vNode, container, parentComponent, anchor)
        }
        else {
            PatchElement(prevVNode, vNode, container, parentComponent, anchor)
        }
    }

    const MountElement = (vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance, anchor?: HTMLElement | Text) => {
        const el = (vNode.el = HostCreateElement(vNode.component as string))
        const { shapeFlag, children, props } = vNode
        if (shapeFlag & ShapeFlag.TextChildren && children) {
            el.textContent = children as string
        }
        else if (shapeFlag & ShapeFlag.ArrayChildren) {
            MountChildren(vNode.children as Array<IVNode>, el, parentComponent, anchor)
        }
        for (let key in props) {
            const val = props[key]
            HostPatchProp(el, key, null, val)
        }

        HostInsert(el, container, anchor)
    }

    const PatchElement = (prevVNode: IVNode, vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance, anchor?: HTMLElement | Text) => {
        const el = vNode.el = prevVNode.el
        PatchChildren(el as HTMLElement, prevVNode, vNode, container, parentComponent, anchor)
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

    const PatchChildren = (el: HTMLElement, prevVNode: IVNode, vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance, anchor?: HTMLElement | Text) => {
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
                MountChildren(vNode.children as Array<IVNode>, el, parentComponent, anchor)
            }
            else if (prevFlag & ShapeFlag.ArrayChildren) {
                PatchKeyedChildren(prevVNode.children as Array<IVNode>, vNode.children as Array<IVNode>, el, parentComponent, anchor)
            }
        }
    }

    const UnmountChildren = (children: Array<IVNode>) => {
        children.forEach(c => HostRemove(c.el))
    }

    const PatchKeyedChildren = (prevChildren: Array<IVNode>, children: Array<IVNode>, container: HTMLElement, parentComponent?: IComponentInstance, parentAnchor?: HTMLElement | Text) => {
        let i = 0;
        const l1 = prevChildren.length
        const l2 = children.length
        let e1 = l1 - 1;
        let e2 = l2 - 1;
        // 左侧
        while (i <= e1 && i <= e2) {
            const prevVNode = prevChildren[i]
            const vNode = children[i]
            if (IsSomeVNode(prevVNode, vNode)) {
                Patch(prevVNode, vNode, container, parentComponent, parentAnchor)
            }
            else {
                break
            }
            i++
        }
        // 右侧
        while (i <= e1 && i <= e2) {
            const prevVNode = prevChildren[e1]
            const vNode = children[e2]
            if (IsSomeVNode(prevVNode, vNode)) {
                Patch(prevVNode, vNode, container, parentComponent, parentAnchor)
            }
            else {
                break
            }
            e1--
            e2--
        }

        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1
                const anchor = nextPos < l2 ? children[nextPos].el : undefined
                while (i <= e2) {
                    Patch(null, children[i], container, parentComponent, anchor)
                    i++
                }
            }
        }
        else if (i > e2) {
            if (i <= e1) {
                HostRemove(prevChildren[i].el)
                i++
            }
        }
        else {
            let s1 = i;
            let s2 = i;

            const keyToNewIndexMap = new Map<string, number>()

            const toBePatched = e2 - s2 + 1;
            let patched = 0

            const newIndexToOldIndexMap = new Array(toBePatched).fill(0)

            let moved = false
            let maxNewIndexSoFar = 0

            for (let i = s2; i <= e2; ++i) {
                const nextChild = children[i]
                keyToNewIndexMap.set(nextChild.key, i)
            }

            for (let i = s1; i <= e1; ++i) {
                const preChild = prevChildren[i]
                if (patched < toBePatched) {
                    let newIndex = -1
                    if (preChild.key) {
                        newIndex = keyToNewIndexMap.get(preChild.key) || -1
                    }
                    else {
                        for (let j = s2; j <= e2; ++j) {
                            if (IsSomeVNode(preChild, children[j])) {
                                newIndex = j
                                break
                            }
                        }
                    }

                    if (newIndex === -1) {
                        HostRemove(preChild.el)
                    }
                    else {
                        if (newIndex >= maxNewIndexSoFar) {
                            maxNewIndexSoFar = newIndex
                        }
                        else {
                            moved = true
                        }
                        newIndexToOldIndexMap[newIndex - s2] = i + 1
                        Patch(preChild, children[newIndex], container, parentComponent, undefined)
                        patched++
                    }
                }
                else {
                    HostRemove(preChild.el)
                }
            }

            const increasingNewIndexSequence = moved ? GetSequence(newIndexToOldIndexMap) : []
            let j = increasingNewIndexSequence.length - 1

            for (let i = toBePatched - 1; i >= 0; --i) {
                const nextIndex = i + s2;
                const nextChild = children[nextIndex]
                const anchor = nextIndex + 1 < l2 ? children[nextIndex + 1].el : undefined

                if (newIndexToOldIndexMap[i] === 0) {
                    Patch(null, nextChild, container, parentComponent, anchor)
                }
                else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        HostInsert(nextChild.el, container, anchor)
                    }
                    else {
                        j--
                    }
                }
            }
        }
    }

    const IsSomeVNode = (prevVNode: IVNode, vNode: IVNode) => {
        return prevVNode.component === vNode.component && prevVNode.key === vNode.key
    }

    const MountChildren = (children: Array<IVNode>, container: HTMLElement, parentComponent?: IComponentInstance, anchor?: HTMLElement | Text) => {
        children.forEach(v => {
            Patch(null, v, container, parentComponent, anchor)
        })
    }

    const ProcessComponent = (prevVNode: IVNode | null, vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance, anchor?: HTMLElement | Text) => {
        MountComponent(vNode, container, parentComponent, anchor)
    }

    const MountComponent = (initinalVNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance, anchor?: HTMLElement | Text) => {
        const instance = CreateComponentInstance(initinalVNode, parentComponent)
        SetupComponent(instance)
        SetupRenderEffect(instance, container, anchor)
    }

    const SetupRenderEffect = (instance: IComponentInstance, container: HTMLElement, anchor?: HTMLElement | Text) => {
        Effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance
                const subTree = instance.subTree = instance.Render.call(proxy)
                Patch(null, subTree, container, instance, anchor)
                instance.vNode.el = subTree.el
                instance.isMounted = true
            }
            else {
                const { proxy } = instance
                const subTree = instance.Render.call(proxy)
                const prevSubTree = instance.subTree
                instance.subTree = subTree
                Patch(prevSubTree, subTree, container, instance, anchor)
            }
        })
    }

    return {
        CreateApp: CreateAppApi(Render)
    }
}