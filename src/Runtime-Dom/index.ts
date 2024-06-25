import { IComponent } from '../Runtime-Core/Component'
import { CreateRenderer } from '../Runtime-Core/index'

const HostCreateElement = (type: string) => {
    console.log("CreateElement")
    return document.createElement(type)
}

const HostCreateTextNode = (text: string) => {
    return document.createTextNode(text)
}

const HostPatchProp = (el: HTMLElement, key: string, value: unknown) => {
    console.log("PatchProp")
    if (key.startsWith('On') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase()
        //@ts-ignore
        el.addEventListener(event, value)
    }
    else {
        //@ts-ignore
        el.setAttribute(key, value)
    }
}

const HostInsert = (el: HTMLElement | Text, container: HTMLElement) => {
    console.log("Insert")
    container.append(el)
}

const renderer = CreateRenderer({
    HostCreateElement,
    HostCreateTextNode,
    HostPatchProp,
    HostInsert
})

export const CreateApp = (rootComponent: IComponent) => {
    return renderer.CreateApp(rootComponent)
}

export * from '../Runtime-Core/index'