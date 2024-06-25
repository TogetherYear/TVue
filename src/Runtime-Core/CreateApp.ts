import { IComponent, IComponentInstance } from "./Component"
import { RenderFN } from "./Renderer"
import { CreateVNode, IVNode } from "./VNode"

export const CreateAppApi = (Render: RenderFN) => {
    return (rootComponent: IComponent) => {
        return {
            Mount: (rootContainer: HTMLElement) => {
                const vNode = CreateVNode(rootComponent)
                Render(vNode, rootContainer)
            }
        }
    }
}

