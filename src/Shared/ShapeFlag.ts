export const enum ShapeFlag {
    Element = 1,
    StateFulComponent = 1 << 1,
    TextChildren = 1 << 2,
    ArrayChildren = 1 << 3,
    SlotChildren = 1 << 4
}