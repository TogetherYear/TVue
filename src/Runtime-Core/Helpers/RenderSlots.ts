import { Children, CreateVNode, IVNode, SpecialTag } from "../VNode"

export const RenderSlots = (slots: Children, name?: string, ...args: Array<unknown>) => {
    if (Array.isArray(slots) || typeof slots === 'string') {
        return CreateVNode('div', {}, slots)
    }
    else {
        const target = slots[name || '']
        if (target) {
            return CreateVNode(SpecialTag.Fragment, {}, target(...args))
        }
    }
}