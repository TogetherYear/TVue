import { IComponent } from "./Component"
import { Render } from "./Renderer"
import { CreateVNode } from "./VNode"

export const CreateApp = (rootComponent: IComponent) => {
    return {
        Mount: (rootContainer: string) => {
            const container = document.querySelector(rootContainer) as HTMLElement
            const vNode = CreateVNode(rootComponent)
            Render(vNode, container)
        }
    }
}

