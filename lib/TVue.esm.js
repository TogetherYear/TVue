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
    const { shapeFlag } = vNode;
    if (shapeFlag & 1 /* ShapeFlag.Element */) {
        ProcessElement(vNode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlag.StateFulComponent */) {
        ProcessComponent(vNode, container);
    }
};
const ProcessElement = (vNode, container) => {
    MountElement(vNode, container);
};
const MountElement = (vNode, container) => {
    const el = (vNode.el = document.createElement(vNode.component));
    const { shapeFlag, children, props } = vNode;
    if (shapeFlag & 4 /* ShapeFlag.TextChildren */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlag.ArrayChildren */) {
        MountChildren(vNode, el);
    }
    for (let key in props) {
        //@ts-ignore
        el.setAttribute(key, props[key]);
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
const MountComponent = (initinalVNode, container) => {
    const instance = CreateComponentInstance(initinalVNode);
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
        children,
        shapeFlag: GetShapeFlag(component)
    };
    if (typeof children === 'string') {
        vNode.shapeFlag |= 4 /* ShapeFlag.TextChildren */;
    }
    else if (Array.isArray(children)) {
        vNode.shapeFlag |= 8 /* ShapeFlag.ArrayChildren */;
    }
    return vNode;
};
const GetShapeFlag = (type) => {
    return typeof type === 'string'
        ? 1 /* ShapeFlag.Element */
        : 2 /* ShapeFlag.StateFulComponent */;
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
