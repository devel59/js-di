export class ServiceContainer {
    constructor(resolvers = {}) {
        this.resolvers = resolvers;
    }

    value(key, value) {
        this.resolvers[key] = new ValueResolver(value);
        return this;
    }

    instance(key, callback, isGlobal = false) {
        this.resolvers[key] = new InstanceResolver(callback, isGlobal);
        return this;
    }

    factory(key, callback) {
        this.resolvers[key] = new FactoryResolver(callback);
        return this;
    }

    resolve(key) {
        if (this.resolvers[key]) {
            return this.resolvers[key].resolve(this);
        }
    }

    scope() {
        const scopeResolvers = {};
        for (const key of Object.keys(this.resolvers)) {
            scopeResolvers[key] = this.resolvers[key].scope();
        }
        return new ServiceContainer(scopeResolvers);
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
