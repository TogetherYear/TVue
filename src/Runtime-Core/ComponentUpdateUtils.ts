import { IVNode } from "./VNode";

export const ShouldUpdateComponent = (prevVNode: IVNode, vNode: IVNode) => {
    const { props: prevProps } = prevVNode
    const { props } = vNode

    for (let key in props) {
        if (props[key] !== prevProps[key]) {
            return true
        }
    }
    return false
} 