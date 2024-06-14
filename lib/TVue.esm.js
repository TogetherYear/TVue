const IsObject = (val) => {
    return val !== null && typeof val === 'object';
};

const publicPropertiesMap = {
    $el: (instance) => instance.vNode.el
};
const ComponentPublicInstance = {
    get: (target, p, receiver) => {
        const instance = target._;
        const { setupState } = instance;
        if (p in setupState) {
            return setupState[p];
        }
        else if (p in publicPropertiesMap) {
            return publicPropertiesMap[p](instance);
        }
    },
    set: (target, p, newValue, receiver) => {
        return true;
    }
};

const CreateComponentInstance = (vNode) => {
    const instance = {
        vNode,
    };
    return instance;
};
const SetupComponent = (instance) => {
    SetupStatefulComponent(instance);
};
const SetupStatefulComponent = (instance) => {
    const component = instance.vNode.component;
    const setupResult = component.Setup ? component.Setup() : {};
    HandleSetupResult(instance, setupResult);
};
const HandleSetupResult = (instance, setupResult) => {
    instance.setupState = setupResult;
    HandleSeutpProxy(instance);
    FinishComponentSetup(instance);
};
const HandleSeutpProxy = (instance) => {
    const ctx = {
        _: instance,
    };
    //@ts-ignore
    instance.proxy = new Proxy(ctx, ComponentPublicInstance);
};
const FinishComponentSetup = (instance) => {
    const component = instance.vNode.component;
    instance.Render = component.Render;
};

const Render = (vNode, container) => {
    Patch(vNode, container);
};
const Patch = (vNode, container) => {
    if (typeof vNode.component === 'string') {
        ProcessElement(vNode, container);
    }
    else if (IsObject(vNode.component)) {
        ProcessComponent(vNode, container);
    }
};
const ProcessElement = (vNode, container) => {
    MountElement(vNode, container);
};
const MountElement = (vNode, container) => {
    const el = (vNode.el = document.createElement(vNode.component));
    if (typeof vNode.children === 'string') {
        el.textContent = vNode.children;
    }
    else if (Array.isArray(vNode.children)) {
        MountChildren(vNode, el);
    }
    for (let key in vNode.props) {
        //@ts-ignore
        el.setAttribute(key, vNode.props[key]);
    }
    container.append(el);
};
const MountChildren = (vNode, container) => {
    vNode.children.forEach(v => {
        Patch(v, container);
    });
};
const ProcessComponent = (vNode, container) => {
    MountComponent(vNode, container);
};
const MountComponent = (vNode, container) => {
    const instance = CreateComponentInstance(vNode);
    SetupComponent(instance);
    SetupRenderEffect(instance, container);
};
const SetupRenderEffect = (instance, container) => {
    const { proxy } = instance;
    const subTree = instance.Render.call(proxy);
    Patch(subTree, container);
    instance.vNode.el = subTree.el;
};

const CreateVNode = (component, props, children) => {
    const vNode = {
        component,
        props,
        children
    };
    return vNode;
};

const CreateApp = (rootComponent) => {
    return {
        Mount: (rootContainer) => {
            const container = document.querySelector(rootContainer);
            const vNode = CreateVNode(rootComponent);
            Render(vNode, container);
        }
    };
};

const H = (component, props, children) => {
    return CreateVNode(component, props, children);
};

export { CreateApp, H };
