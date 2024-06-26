'use strict';

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

class ReactiveEffect {
    constructor(fn, options) {
        this.deps = new Set;
        this.active = true;
        this.options = undefined;
        this.fn = fn;
        this.options = options;
    }
    get D() {
        return this.deps;
    }
    get F() {
        return this.fn;
    }
    get O() {
        return this.options;
    }
    Run() {
        activeEffect = this;
        const res = this.fn();
        activeEffect = null;
        return res;
    }
    AddDep(dep) {
        //@ts-ignore
        this.fn.effect = this;
        this.deps.add(dep);
    }
    get TrackFn() {
        var _a;
        return ((_a = this.options) === null || _a === void 0 ? void 0 : _a.scheduler) || this.fn;
    }
    CleanupEffect() {
        var _a;
        if (this.active) {
            this.active = false;
            this.deps.forEach(dep => dep.delete(this));
            this.deps.clear();
            ((_a = this.options) === null || _a === void 0 ? void 0 : _a.onStop) && this.options.onStop();
        }
    }
}
const targetMap = new Map();
let activeEffect = null;
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
const Track = (obj, key) => {
    if (activeEffect) {
        const dep = GetDep(obj, key);
        TrackEffects(dep);
    }
};
const TrackEffects = (dep) => {
    if (activeEffect) {
        !dep.has(activeEffect) && dep.add(activeEffect);
        !activeEffect.D.has(dep) && activeEffect.AddDep(dep);
    }
};
const Trigger = (obj, key) => {
    const dep = GetDep(obj, key);
    TriggerEffects(dep);
};
const TriggerEffects = (dep) => {
    dep.forEach(c => c.TrackFn());
};
const Effect = (fn, options) => {
    const re = new ReactiveEffect(fn, options);
    re.Run();
    return fn;
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
        // FIXME:依赖收集
        if (!isReadonly) {
            Track(target, p);
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

class RefImpl {
    constructor(target) {
        this.isRef = true;
        this.dep = new Set();
        this.raw = target;
        this.target = Convert(target);
    }
    get D() {
        return this.dep;
    }
    get value() {
        TrackRefEffects(this);
        return this.target;
    }
    set value(newValue) {
        if (HasChange(this.raw, newValue)) {
            this.raw = newValue;
            this.target = Convert(newValue);
            TriggerRefEffects(this);
        }
    }
}
const TrackRefEffects = (ref) => {
    TrackEffects(ref.D);
};
const TriggerRefEffects = (ref) => {
    TriggerEffects(ref.D);
};
const Convert = (target) => {
    return IsObject(target) ? Reactive(target) : target;
};
const Ref = (target) => {
    const ri = new RefImpl(target);
    return ri;
};
const IsRef = (target) => {
    // @ts-ignore
    return !!target.isRef;
};
const UnRef = (target) => {
    return IsRef(target) ? target.value : target;
};
const ProxyRefs = (objWithRefs) => {
    return new Proxy(objWithRefs, {
        get: (target, p, receiver) => {
            const res = Reflect.get(target, p, receiver);
            return UnRef(res);
        },
        set: (target, p, newValue, receiver) => {
            if (IsRef(target[p]) && !IsRef(newValue)) {
                return target[p].value = newValue;
            }
            else {
                return Reflect.set(target, p, newValue, receiver);
            }
        }
    });
};

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
        isMounted: false,
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
    instance.setupState = ProxyRefs(setupResult);
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

const Provide = (key, value) => {
    var _a;
    const instance = GetCurrentInstance();
    if (instance) {
        let { provides } = instance;
        const parentProvide = (_a = instance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (provides === parentProvide) {
            provides = instance.provides = Object.create(parentProvide);
        }
        provides[key] = value;
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

const CreateAppApi = (Render) => {
    return (rootComponent) => {
        return {
            Mount: (rootContainer) => {
                const vNode = CreateVNode(rootComponent);
                Render(vNode, rootContainer);
            }
        };
    };
};

const CreateRenderer = (options) => {
    const { HostCreateElement, HostCreateTextNode, HostPatchProp, HostInsert } = options;
    const Render = (vNode, container, parentComponent) => {
        Patch(null, vNode, container, parentComponent);
    };
    const Patch = (prevVNode, vNode, container, parentComponent) => {
        const { component, shapeFlag } = vNode;
        switch (component) {
            case SpecialTag.Fragment:
                ProcessFragment(prevVNode, vNode, container, parentComponent);
                break;
            case SpecialTag.Text:
                ProcessText(prevVNode, vNode, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlag.Element */) {
                    ProcessElement(prevVNode, vNode, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlag.StateFulComponent */) {
                    ProcessComponent(prevVNode, vNode, container, parentComponent);
                }
                else {
                    console.log("Special:", vNode);
                }
                break;
        }
    };
    const ProcessFragment = (prevVNode, vNode, container, parentComponent) => {
        MountChildren(vNode, container, parentComponent);
    };
    const ProcessText = (prevVNode, vNode, container) => {
        const { children } = vNode;
        const textNode = (vNode.el = HostCreateTextNode(children));
        HostInsert(textNode, container);
    };
    const ProcessElement = (prevVNode, vNode, container, parentComponent) => {
        if (!prevVNode) {
            MountElement(vNode, container, parentComponent);
        }
        else {
            PatchElement(prevVNode, vNode);
        }
    };
    const MountElement = (vNode, container, parentComponent) => {
        const el = (vNode.el = HostCreateElement(vNode.component));
        const { shapeFlag, children, props } = vNode;
        if (shapeFlag & 4 /* ShapeFlag.TextChildren */ && children) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlag.ArrayChildren */) {
            MountChildren(vNode, el, parentComponent);
        }
        for (let key in props) {
            const val = props[key];
            HostPatchProp(el, key, val);
        }
        HostInsert(el, container);
    };
    const PatchElement = (prevVNode, vNode, container) => {
        console.log(prevVNode, vNode);
    };
    const MountChildren = (vNode, container, parentComponent) => {
        vNode.children.forEach(v => {
            Patch(null, v, container, parentComponent);
        });
    };
    const ProcessComponent = (prevVNode, vNode, container, parentComponent) => {
        MountComponent(vNode, container, parentComponent);
    };
    const MountComponent = (initinalVNode, container, parentComponent) => {
        const instance = CreateComponentInstance(initinalVNode, parentComponent);
        SetupComponent(instance);
        SetupRenderEffect(instance, container);
    };
    const SetupRenderEffect = (instance, container) => {
        Effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = instance.subTree = instance.Render.call(proxy);
                Patch(null, subTree, container, instance);
                instance.vNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                const subTree = instance.Render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                Patch(prevSubTree, subTree, container, instance);
            }
        });
    };
    return {
        CreateApp: CreateAppApi(Render)
    };
};

const HostCreateElement = (type) => {
    console.log("CreateElement");
    return document.createElement(type);
};
const HostCreateTextNode = (text) => {
    return document.createTextNode(text);
};
const HostPatchProp = (el, key, value) => {
    console.log("PatchProp");
    if (key.startsWith('On') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase();
        //@ts-ignore
        el.addEventListener(event, value);
    }
    else {
        //@ts-ignore
        el.setAttribute(key, value);
    }
};
const HostInsert = (el, container) => {
    console.log("Insert");
    container.append(el);
};
const renderer = CreateRenderer({
    HostCreateElement,
    HostCreateTextNode,
    HostPatchProp,
    HostInsert
});
const CreateApp = (rootComponent) => {
    return renderer.CreateApp(rootComponent);
};

exports.CreateApp = CreateApp;
exports.CreateRenderer = CreateRenderer;
exports.CreateTextVNode = CreateTextVNode;
exports.Effect = Effect;
exports.GetCurrentInstance = GetCurrentInstance;
exports.H = H;
exports.Inject = Inject;
exports.Provide = Provide;
exports.ProxyRefs = ProxyRefs;
exports.Reactive = Reactive;
exports.Ref = Ref;
exports.RenderSlots = RenderSlots;
