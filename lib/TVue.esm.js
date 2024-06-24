const Wran = (...args) => {
    console.warn(...args);
};
const IsObject = (val) => {
    return val !== null && typeof val === 'object';
};
const HasChange = (v1, v2) => {
    return !Object.is(v1, v2);
};
const HasKey = (obj, p) => {
    return Object.prototype.hasOwnProperty.call(obj, p);
};

const targetMap = new Map();
const GetDep = (obj, key) => {
    let depMap = targetMap.get(obj);
    if (!depMap) {
        depMap = new Map;
        targetMap.set(obj, depMap);
    }
    let dep = depMap.get(key);
    if (!dep) {
        dep = new Set();
        depMap.set(key, dep);
    }
    return dep;
};
const Trigger = (obj, key) => {
    const dep = GetDep(obj, key);
    TriggerEffects(dep);
};
const TriggerEffects = (dep) => {
    dep.forEach(c => c.TrackFn());
};

const CreateGet = (isReadonly = false, isShallow = false) => {
    return (target, p, receiver) => {
        if (p == ReactiveFlag.IsReactive) {
            return !isReadonly;
        }
        if (p == ReactiveFlag.IsReadonly) {
            return isReadonly;
        }
        const res = Reflect.get(target, p, receiver);
        if (!isShallow && IsObject(res)) {
            return isReadonly ? Readonly(res) : Reactive(res);
        }
        return res;
    };
};
const CreateSet = (isReadonly = false) => {
    return (target, p, newValue, receiver) => {
        if (!isReadonly) {
            if (HasChange(Reflect.get(target, p, receiver), newValue)) {
                const res = Reflect.set(target, p, newValue, receiver);
                // FIXME:触发依赖
                Trigger(target, p);
                return res;
            }
            else {
                return true;
            }
        }
        else {
            Wran("Readonly");
            return true;
        }
    };
};
const get = CreateGet();
const set = CreateSet();
const readonlyGet = CreateGet(true);
const readonlySet = CreateSet(true);
const shallowReadonlyGet = CreateGet(true, true);
const MutableHandler = () => {
    return {
        get,
        set,
    };
};
const ReadonlyHandler = () => {
    return {
        get: readonlyGet,
        set: readonlySet,
    };
};
const ShallowReadonlyHandler = () => {
    return {
        get: shallowReadonlyGet,
        set: readonlySet,
    };
};

const CreateActiveObject = (obj, handler) => {
    return new Proxy(obj, handler());
};
const Reactive = (obj) => {
    return CreateActiveObject(obj, MutableHandler);
};
const Readonly = (obj) => {
    return CreateActiveObject(obj, ReadonlyHandler);
};
const ShallowReadonly = (obj) => {
    return CreateActiveObject(obj, ShallowReadonlyHandler);
};
var ReactiveFlag;
(function (ReactiveFlag) {
    ReactiveFlag["IsReactive"] = "IsReactive";
    ReactiveFlag["IsReadonly"] = "IsReadonly";
})(ReactiveFlag || (ReactiveFlag = {}));

const InitEmit = (instance) => {
    instance.Emit = (event, ...args) => {
        const { props } = instance.vNode;
        const target = HandlerKey(event);
        props[target] && props[target](...args);
    };
};
const HandlerKey = (event) => {
    return `On${event}`;
};

const InitProps = (instance) => {
    instance.vNode;
};

const publicPropertiesMap = {
    $el: (instance) => instance.vNode.el,
    $slots: (instance) => instance.slots
};
const ComponentPublicInstance = {
    get: (target, p, receiver) => {
        const instance = target._;
        const { setupState } = instance;
        const { props } = instance.vNode;
        if (HasKey(setupState, p)) {
            return setupState[p];
        }
        else if (HasKey(props, p)) {
            return props[p];
        }
        else if (p in publicPropertiesMap) {
            return publicPropertiesMap[p](instance);
        }
    },
    set: (target, p, newValue, receiver) => {
        return true;
    }
};

const InitSlots = (instance) => {
    if (instance.vNode.shapeFlag & 16 /* ShapeFlag.SlotChildren */) {
        instance.slots = instance.vNode.children;
    }
};

const CreateComponentInstance = (vNode, parent) => {
    const instance = {
        vNode,
        parent,
        provides: parent ? parent.provides : {}
    };
    return instance;
};
const SetupComponent = (instance) => {
    InitProps(instance);
    InitEmit(instance);
    InitSlots(instance);
    SetupStatefulComponent(instance);
};
const SetupStatefulComponent = (instance) => {
    const component = instance.vNode.component;
    SetCurrentInstance(instance);
    const setupResult = component.Setup
        ? component.Setup(ShallowReadonly(instance.vNode.props), {
            Emit: instance.Emit
        })
        : {};
    SetCurrentInstance(null);
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
let currentInstance = null;
const GetCurrentInstance = () => {
    return currentInstance;
};
const SetCurrentInstance = (instance) => {
    currentInstance = instance;
};

var SpecialTag;
(function (SpecialTag) {
    SpecialTag["Text"] = "Text";
    SpecialTag["Fragment"] = "Fragment";
})(SpecialTag || (SpecialTag = {}));
const CreateVNode = (component, props = {}, children) => {
    const vNode = {
        component,
        props,
        children,
        shapeFlag: GetShapeFlag(component)
    };
    if (typeof children === 'string') {
        vNode.shapeFlag |= 4 /* ShapeFlag.TextChildren */;
    }
    else if ((vNode.shapeFlag & 2 /* ShapeFlag.StateFulComponent */) && (typeof children === 'object')) {
        vNode.shapeFlag |= 16 /* ShapeFlag.SlotChildren */;
    }
    else if (Array.isArray(children)) {
        vNode.shapeFlag |= 8 /* ShapeFlag.ArrayChildren */;
    }
    return vNode;
};
const CreateTextVNode = (text) => {
    return CreateVNode(SpecialTag.Text, {}, text);
};
const GetShapeFlag = (type) => {
    return typeof type === 'string'
        ? 1 /* ShapeFlag.Element */
        : 2 /* ShapeFlag.StateFulComponent */;
};

const Render = (vNode, container, parentComponent) => {
    Patch(vNode, container, parentComponent);
};
const Patch = (vNode, container, parentComponent) => {
    const { component, shapeFlag } = vNode;
    switch (component) {
        case SpecialTag.Fragment:
            ProcessFragment(vNode, container, parentComponent);
            break;
        case SpecialTag.Text:
            ProcessText(vNode, container);
            break;
        default:
            if (shapeFlag & 1 /* ShapeFlag.Element */) {
                ProcessElement(vNode, container, parentComponent);
            }
            else if (shapeFlag & 2 /* ShapeFlag.StateFulComponent */) {
                ProcessComponent(vNode, container, parentComponent);
            }
            else {
                console.log("Special:", vNode);
            }
            break;
    }
};
const ProcessFragment = (vNode, container, parentComponent) => {
    MountChildren(vNode, container, parentComponent);
};
const ProcessText = (vNode, container) => {
    const { children } = vNode;
    const textNode = (vNode.el = document.createTextNode(children));
    container.append(textNode);
};
const ProcessElement = (vNode, container, parentComponent) => {
    MountElement(vNode, container, parentComponent);
};
const MountElement = (vNode, container, parentComponent) => {
    const el = (vNode.el = document.createElement(vNode.component));
    const { shapeFlag, children, props } = vNode;
    if (shapeFlag & 4 /* ShapeFlag.TextChildren */ && children) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlag.ArrayChildren */) {
        MountChildren(vNode, el, parentComponent);
    }
    for (let key in props) {
        const val = props[key];
        if (key.startsWith('On') && typeof val === 'function') {
            const event = key.slice(2).toLowerCase();
            //@ts-ignore
            el.addEventListener(event, val);
        }
        else {
            //@ts-ignore
            el.setAttribute(key, val);
        }
    }
    container.append(el);
};
const MountChildren = (vNode, container, parentComponent) => {
    vNode.children.forEach(v => {
        Patch(v, container, parentComponent);
    });
};
const ProcessComponent = (vNode, container, parentComponent) => {
    MountComponent(vNode, container, parentComponent);
};
const MountComponent = (initinalVNode, container, parentComponent) => {
    const instance = CreateComponentInstance(initinalVNode, parentComponent);
    SetupComponent(instance);
    SetupRenderEffect(instance, container);
};
const SetupRenderEffect = (instance, container) => {
    const { proxy } = instance;
    const subTree = instance.Render.call(proxy);
    Patch(subTree, container, instance);
    instance.vNode.el = subTree.el;
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

const RenderSlots = (slots, name, ...args) => {
    if (Array.isArray(slots) || typeof slots === 'string') {
        return CreateVNode('div', {}, slots);
    }
    else {
        const target = slots[name || ''];
        if (target) {
            return CreateVNode(SpecialTag.Fragment, {}, target(...args));
        }
    }
};

const Provide = (key, value) => {
    var _a;
    const instance = GetCurrentInstance();
    if (instance) {
        const parentProvide = (_a = instance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (instance.provides === parentProvide) {
            instance.provides = Object.create(parentProvide);
        }
        instance.provides[key] = value;
    }
};
const Inject = (key, defaultValue) => {
    const instance = GetCurrentInstance();
    const empty = defaultValue ? (typeof defaultValue === 'function' ? defaultValue() : defaultValue) : undefined;
    if (instance) {
        return instance.parent ? (instance.parent.provides[key] || empty) : empty;
    }
    else {
        return empty;
    }
};

export { CreateApp, CreateTextVNode, GetCurrentInstance, H, Inject, Provide, RenderSlots };
