export class ServiceContainer {
    constructor() {
        this.resolvers = new Map();
    }

    setResolver(key, resolver) {
        this.resolvers.set(key, resolver);
    }

    value(key, value) {
        this.setResolver(key, new ValueResolver(value));
    }

    instance(key, callback, isGlobal = false) {
        this.setResolver(key, new InstanceResolver(callback, isGlobal));
    }

    factory(key, callback) {
        this.setResolver(key, new FactoryResolver(callback));
    }

    resolve(key) {
        if (this.resolvers.has(key)) {
            return this.resolvers.get(key).resolve(this);
        }
    }

    scope() {
        const scopeContainer = new ServiceContainer();
        for (const key of this.resolvers.keys()) {
            scopeContainer.setResolver(key, this.resolvers.get(key).scope());
        }
        return scopeContainer;
    }
}

class ValueResolver {
    constructor(value) {
        this.value = value;
    }

    resolve() {
        return this.value;
    }

    scope() {
        return this;
    }
}

class FactoryResolver {
    constructor(callback) {
        this.callback = callback;
    }

    resolve(serviceContainer) {
        return this.callback(serviceContainer);
    }

    scope() {
        return this;
    }
}

class InstanceResolver {
    constructor(callback, isGlobal = false) {
        this.callback = callback;
        this.isGlobal = isGlobal;
        this.value = null;
        this.isResolved = false;
    }

    resolve(serviceContainer) {
        if (this.isResolved === false) {
            this.value = this.callback(serviceContainer);
            this.isResolved = true;
        }
        return this.value;
    }

    scope() {
        if (this.isGlobal) {
            return this;
        }
        return new InstanceResolver(this.callback);
    }
}
