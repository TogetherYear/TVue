import { TObject } from "../Reactivity/Reactive"

export const Wran = (...args: Array<unknown>) => {
    console.warn(...args)
}

export const IsObject = (val: unknown) => {
    return val !== null && typeof val === 'object'
}

export const HasChange = <T>(v1: T, v2: T) => {
    return !Object.is(v1, v2)
}

export const HasKey = (obj: TObject, p: string) => {
    return Object.prototype.hasOwnProperty.call(obj, p)
}

/**
 * 获取最长自增数组
 */
export const GetSequence = (arr: Array<number>) => {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}