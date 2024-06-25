import { IComponent, IComponentInstance } from "./Component"
import { CreateRenderer } from "./Renderer"
import { CreateVNode, IVNode } from "./VNode"

export const CreateAppApi = (Render: (vNode: IVNode, container: HTMLElement, parentComponent?: IComponentInstance) => void) => {
    return (rootComponent: IComponent) => {
        return {
            Mount: (rootContainer: HTMLElement) => {
                const vNode = CreateVNode(rootComponent)
                Render(vNode, rootContainer)
            }
        }
    }
}

