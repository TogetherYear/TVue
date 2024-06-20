'use strict';

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
    $el: (instance) => instance.vNode.el
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

const CreateComponentInstance = (vNode) => {
    const instance = {
        vNode,
    };
    return instance;
};
const SetupComponent = (instance) => {
    InitProps(instance);
    InitEmit(instance);
    SetupStatefulComponent(instance);
};
const SetupStatefulComponent = (instance) => {
    const component = instance.vNode.component;
    const setupResult = component.Setup
        ? component.Setup(ShallowReadonly(instance.vNode.props), {
            Emit: instance.Emit
        })
        : {};
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

exports.CreateApp = CreateApp;
exports.H = H;
