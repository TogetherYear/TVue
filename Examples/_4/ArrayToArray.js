import { H, Reactive, Ref } from '../../lib/TVue.esm.js'


// 1. 左侧的对比
// (a b) c
// (a b) d e
// const prevChildren = [
//     H("p", { key: "A" }, "A"),
//     H("p", { key: "B" }, "B"),
//     H("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//     H("p", { key: "A" }, "A"),
//     H("p", { key: "B" }, "B"),
//     H("p", { key: "D" }, "D"),
//     H("p", { key: "E" }, "E"),
// ];

// 2. 右侧的对比
// a (b c)
// d e (b c)
// const prevChildren = [
//     H("p", { key: "A" }, "A"),
//     H("p", { key: "B" }, "B"),
//     H("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//     H("p", { key: "D" }, "D"),
//     H("p", { key: "E" }, "E"),
//     H("p", { key: "B" }, "B"),
//     H("p", { key: "C" }, "C"),
// ];

// 3. 新的比老的长
//     创建新的
// 左侧
// (a b)
// (a b) c
// i = 2, e1 = 1, e2 = 2
// const prevChildren = [
//     H("p", { key: "A" }, "A"),
//     H("p", { key: "B" }, "B")
// ];
// const nextChildren = [
//     H("p", { key: "A" }, "A"),
//     H("p", { key: "B" }, "B"),
//     H("p", { key: "C" }, "C"),
//     H("p", { key: "D" }, "D"),
// ];

// 右侧
// (a b)
// c (a b)
// i = 0, e1 = -1, e2 = 0
// const prevChildren = [
//     H("p", { key: "A" }, "A"),
//     H("p", { key: "B" }, "B")
// ];
// const nextChildren = [
//     H("p", { key: "D" }, "D"),
//     H("p", { key: "C" }, "C"),
//     H("p", { key: "A" }, "A"),
//     H("p", { key: "B" }, "B"),
// ];

// 4. 老的比新的长
//     删除老的
// 左侧
// (a b) c
// (a b)
// i = 2, e1 = 2, e2 = 1
// const prevChildren = [
//     H("p", { key: "A" }, "A"),
//     H("p", { key: "B" }, "B"),
//     H("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//     H("p", { key: "A" }, "A"),
//     H("p", { key: "B" }, "B")
// ];

// 右侧
// a (b c)
// (b c)
// i = 0, e1 = 0, e2 = -1

// const prevChildren = [
//     H("p", { key: "A" }, "A"),
//     H("p", { key: "B" }, "B"),
//     H("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//     H("p", { key: "B" }, "B"),
//     H("p", { key: "C" }, "C")
// ];

// 5. 对比中间的部分
//    1. 创建新的 （在老的里面不存在，新的里面存在）
//    2. 删除老的  (在老的里面存在，新的里面不存在)
//    3. 移动 (节点存在于新的和老的里面，但是位置变了)
//         - 使用最长子序列来优化
// const prevChildren = [
//     H("p", { key: "A" }, "A"),
//     H("p", { key: "B" }, "B"),
//     H("p", { key: "C" }, "C"),
//     H("p", { key: "D" }, "D"),
//     H("p", { key: "E" }, "E"),
//     H("p", { key: "Z" }, "Z"),
//     H("p", { key: "F" }, "F"),
//     H("p", { key: "G" }, "G"),
// ];

// const nextChildren = [
//     H("p", { key: "A" }, "A"),
//     H("p", { key: "B" }, "B"),
//     H("p", { key: "D" }, "D"),
//     H("p", { key: "C" }, "C"),
//     H("p", { key: "Y" }, "Y"),
//     H("p", { key: "E" }, "E"),
//     H("p", { key: "F" }, "F"),
//     H("p", { key: "G" }, "G"),
// ];

const prevChildren = [
    H("p", { key: "A" }, "A"),
    H("p", {}, "C"),
    H("p", { key: "B" }, "B"),
    H("p", { key: "D" }, "D"),
];

const nextChildren = [
    H("p", { key: "A" }, "A"),
    H("p", { key: "B" }, "B"),
    H("p", {}, "C"),
    H("p", { key: "D" }, "D"),
];

export const ArrayToArray = {
    name: "ArrayToArray",
    Setup: () => {
        const isChange = Ref(false);
        window.isChange = isChange;

        return {
            isChange,
        };
    },
    Render() {
        return this.isChange === true
            ? H("div", {}, nextChildren)
            : H("div", {}, prevChildren);
    },
};