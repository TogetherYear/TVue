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
        key: props.key,
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
    const { HostCreateElement, HostCreateTextNode, HostPatchProp, HostInsert, HostRemove, HostSetElementText } = options;
    const Render = (vNode, container) => {
        Patch(null, vNode, container);
    };
    const Patch = (prevVNode, vNode, container, parentComponent, anchor) => {
        const { component, shapeFlag } = vNode;
        switch (component) {
            case SpecialTag.Fragment:
                ProcessFragment(prevVNode, vNode, container, parentComponent, anchor);
                break;
            case SpecialTag.Text:
                ProcessText(prevVNode, vNode, container, anchor);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlag.Element */) {
                    ProcessElement(prevVNode, vNode, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlag.StateFulComponent */) {
                    ProcessComponent(prevVNode, vNode, container, parentComponent, anchor);
                }
                else {
                    console.log("Special:", vNode);
                }
                break;
        }
    };
    const ProcessFragment = (prevVNode, vNode, container, parentComponent, anchor) => {
        MountChildren(vNode.children, container, parentComponent, anchor);
    };
    const ProcessText = (prevVNode, vNode, container, anchor) => {
        const { children } = vNode;
        const textNode = (vNode.el = HostCreateTextNode(children));
        HostInsert(textNode, container, anchor);
    };
    const ProcessElement = (prevVNode, vNode, container, parentComponent, anchor) => {
        if (!prevVNode) {
            MountElement(vNode, container, parentComponent, anchor);
        }
        else {
            PatchElement(prevVNode, vNode, container, parentComponent, anchor);
        }
    };
    const MountElement = (vNode, container, parentComponent, anchor) => {
        const el = (vNode.el = HostCreateElement(vNode.component));
        const { shapeFlag, children, props } = vNode;
        if (shapeFlag & 4 /* ShapeFlag.TextChildren */ && children) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlag.ArrayChildren */) {
            MountChildren(vNode.children, el, parentComponent, anchor);
        }
        for (let key in props) {
            const val = props[key];
            HostPatchProp(el, key, null, val);
        }
        HostInsert(el, container, anchor);
    };
    const PatchElement = (prevVNode, vNode, container, parentComponent, anchor) => {
        const el = vNode.el = prevVNode.el;
        PatchChildren(el, prevVNode, vNode, container, parentComponent, anchor);
        PatchProps(el, prevVNode.props, vNode.props);
    };
    const PatchProps = (el, prevProps, props, parentComponent) => {
        if (prevProps !== props) {
            for (let key in props) {
                const prevProp = prevProps[key];
                const prop = props[key];
                if (prevProp !== prop) {
                    HostPatchProp(el, key, prevProp, prop);
                }
            }
            if (Object.keys(prevProps).length != 0) {
                for (let key in prevProps) {
                    if (!(key in props)) {
                        HostPatchProp(el, key, prevProps[key], null);
                    }
                }
            }
        }
    };
    const PatchChildren = (el, prevVNode, vNode, container, parentComponent, anchor) => {
        const { shapeFlag: prevFlag } = prevVNode;
        const { shapeFlag: flag } = vNode;
        if (flag & 4 /* ShapeFlag.TextChildren */) {
            if (prevFlag & 8 /* ShapeFlag.ArrayChildren */) {
                UnmountChildren(prevVNode.children);
                HostSetElementText(el, vNode.children);
            }
            else if (prevFlag & 4 /* ShapeFlag.TextChildren */) {
                if (prevVNode.children !== vNode.children) {
                    HostSetElementText(el, vNode.children);
                }
            }
        }
        else if (flag & 8 /* ShapeFlag.ArrayChildren */) {
            if (prevFlag & 4 /* ShapeFlag.TextChildren */) {
                HostSetElementText(el, "");
                MountChildren(vNode.children, el, parentComponent, anchor);
            }
            else if (prevFlag & 8 /* ShapeFlag.ArrayChildren */) {
                PatchKeyedChildren(prevVNode.children, vNode.children, el, parentComponent, anchor);
            }
        }
    };
    const UnmountChildren = (children) => {
        children.forEach(c => HostRemove(c.el));
    };
    const PatchKeyedChildren = (prevChildren, children, container, parentComponent, parentAnchor) => {
        let i = 0;
        const l1 = prevChildren.length;
        const l2 = children.length;
        let e1 = l1 - 1;
        let e2 = l2 - 1;
        // 左侧
        while (i <= e1 && i <= e2) {
            const prevVNode = prevChildren[i];
            const vNode = children[i];
            if (IsSomeVNode(prevVNode, vNode)) {
                Patch(prevVNode, vNode, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        // 右侧
        while (i <= e1 && i <= e2) {
            const prevVNode = prevChildren[e1];
            const vNode = children[e2];
            if (IsSomeVNode(prevVNode, vNode)) {
                Patch(prevVNode, vNode, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? children[nextPos].el : undefined;
                while (i <= e2) {
                    Patch(null, children[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            if (i <= e1) {
                HostRemove(prevChildren[i].el);
                i++;
            }
        }
        else {
            let s1 = i;
            let s2 = i;
            const keyToNewIndexMap = new Map();
            const toBePatched = e2 - s2 + 1;
            let patched = 0;
            for (let i = s2; i <= e2; ++i) {
                const nextChild = children[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            for (let i = s1; i <= e1; ++i) {
                const preChild = prevChildren[i];
                if (patched < toBePatched) {
                    let newIndex = -1;
                    if (preChild.key) {
                        newIndex = keyToNewIndexMap.get(preChild.key) || -1;
                    }
                    else {
                        for (let j = s2; j <= e2; ++j) {
                            if (IsSomeVNode(preChild, children[j])) {
                                newIndex = j;
                                patched++;
                                break;
                            }
                        }
                    }
                    if (newIndex === -1) {
                        HostRemove(preChild.el);
                    }
                    else {
                        Patch(preChild, children[newIndex], container, parentComponent, undefined);
                        patched++;
                    }
                }
                else {
                    HostRemove(preChild.el);
                }
            }
        }
    };
    const IsSomeVNode = (prevVNode, vNode) => {
        return prevVNode.component === vNode.component && prevVNode.key === vNode.key;
    };
    const MountChildren = (children, container, parentComponent, anchor) => {
        children.forEach(v => {
            Patch(null, v, container, parentComponent, anchor);
        });
    };
    const ProcessComponent = (prevVNode, vNode, container, parentComponent, anchor) => {
        MountComponent(vNode, container, parentComponent, anchor);
    };
    const MountComponent = (initinalVNode, container, parentComponent, anchor) => {
        const instance = CreateComponentInstance(initinalVNode, parentComponent);
        SetupComponent(instance);
        SetupRenderEffect(instance, container, anchor);
    };
    const SetupRenderEffect = (instance, container, anchor) => {
        Effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                const subTree = instance.subTree = instance.Render.call(proxy);
                Patch(null, subTree, container, instance, anchor);
                instance.vNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                const subTree = instance.Render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                Patch(prevSubTree, subTree, container, instance, anchor);
            }
        });
    };
    return {
        CreateApp: CreateAppApi(Render)
    };
};

const HostCreateElement = (type) => {
    return document.createElement(type);
};
const HostCreateTextNode = (text) => {
    return document.createTextNode(text);
};
const HostPatchProp = (el, key, prevValue, value) => {
    if (key.startsWith('On') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase();
        //@ts-ignore
        el.addEventListener(event, value);
    }
    else {
        if (value === undefined || value === null) {
            el.removeAttribute(key);
        }
        else {
            //@ts-ignore
            el.setAttribute(key, value);
        }
    }
};
const HostInsert = (el, container, anchor) => {
    container.insertBefore(el, anchor || null);
};
const HostRemove = (el) => {
    const parent = el.parentNode;
    if (parent) {
        parent.removeChild(el);
    }
};
const HostSetElementText = (el, text) => {
    el.textContent = text;
};
const renderer = CreateRenderer({
    HostCreateElement,
    HostCreateTextNode,
    HostPatchProp,
    HostInsert,
    HostRemove,
    HostSetElementText,
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
