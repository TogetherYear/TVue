import { IComponent } from '../Runtime-Core/Component'
import { CreateRenderer } from '../Runtime-Core/index'

const HostCreateElement = (type: string) => {
    return document.createElement(type)
}

const HostCreateTextNode = (text: string) => {
    return document.createTextNode(text)
}

const HostPatchProp = (el: HTMLElement, key: string, prevValue: unknown, value: unknown) => {
    if (key.startsWith('On') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase()
        //@ts-ignore
        el.addEventListener(event, value)
    }
    else {
        if (value === undefined || value === null) {
            el.removeAttribute(key)
        }
        else {
            //@ts-ignore
            el.setAttribute(key, value)
        }
    }
}

const HostInsert = (el: HTMLElement | Text, container: HTMLElement) => {
    container.append(el)
}

const HostRemove = (el: HTMLElement | Text) => {
    const parent = el.parentNode
    if (parent) {
        parent.removeChild(el)
    }
}

const HostSetElementText = (el: HTMLElement, text: string) => {
    el.textContent = text
}

const renderer = CreateRenderer({
    HostCreateElement,
    HostCreateTextNode,
    HostPatchProp,
    HostInsert,
    HostRemove,
    HostSetElementText,
})

export const CreateApp = (rootComponent: IComponent) => {
    return renderer.CreateApp(rootComponent)
}

export * from '../Runtime-Core/index'