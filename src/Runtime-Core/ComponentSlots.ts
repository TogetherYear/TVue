import { ShapeFlag } from "../Shared/ShapeFlag"
import { IComponentInstance } from "./Component"

export const InitSlots = (instance: IComponentInstance) => {
    if (instance.vNode.shapeFlag & ShapeFlag.SlotChildren) {
        instance.slots = instance.vNode.children
    }

}