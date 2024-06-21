export const enum ShapeFlag {
    Element = 1, // 0001
    StateFulComponent = 1 << 1, // 0010
    TextChildren = 1 << 2, // 0100
    ArrayChildren = 1 << 3, // 1000
    SlotChildren = 1 << 4
}