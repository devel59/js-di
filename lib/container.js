/**
 * @typedef ResolverInterface
 * @property {ResolverInterface_resolve} resolve
 * @property {ResolverInterface_scope} scope
 */
/**
 * @callback ResolverInterface_resolve
 * @param {ServiceContainer} container
 * @returns {*}
 */
/**
 * @callback ResolverInterface_scope
 * @returns {ResolverInterface}
 */


/**
 * @callback serviceContainerCallback
 * @param {ServiceContainer} container
 */


export class ServiceContainer {
    constructor() {
        /**
         * @type {Map<string, ResolverInterface>}
         */
        this._resolvers = new Map();
    }

    /**
     * @param {string} key
     * @param {ResolverInterface} resolver
     */
    setResolver(key, resolver) {
        this._resolvers.set(key, resolver);
    }

    /**
     * @param {string} key
     * @param {*} value
     */
    value(key, value) {
        this.setResolver(key, new ValueResolver(value));
    }

    /**
     * @param {string} key
     * @param {serviceContainerCallback} callback
     * @param {boolean} isGlobal
     */
    instance(key, callback, isGlobal = false) {
        this.setResolver(key, new InstanceResolver(callback, isGlobal));
    }

    /**
     * @param {string} key
     * @param {serviceContainerCallback} callback
     */
    factory(key, callback) {
        this.setResolver(key, new FactoryResolver(callback));
    }

    /**
     * @param {string} key
     * @returns {*}
     */
    resolve(key) {
        if (this._resolvers.has(key)) {
            return this._resolvers.get(key).resolve(this);
        }

        return null;
    }

    /**
     * @returns {ServiceContainer}
     */
    scope() {
        const scopeContainer = new ServiceContainer();
        for (const kv of this._resolvers) {
            scopeContainer.setResolver(kv[0], kv[1].scope());
        }
        return scopeContainer;
    }
}

class ValueResolver {
    /**
     * @param {*} value
     */
    constructor(value) {
        this.value = value;
    }

    /**
     * @returns {*}
     */
    resolve() {
        return this.value;
    }

    /**
     * @returns {ResolverInterface}
     */
    scope() {
        return this;
    }
}

class FactoryResolver {
    /**
     * @param {serviceContainerCallback} callback
     */
    constructor(callback) {
        this.callback = callback;
    }

    /**
     * @param {ServiceContainer} serviceContainer
     * @returns {*}
     */
    resolve(serviceContainer) {
        return this.callback(serviceContainer);
    }

    /**
     * @returns {ResolverInterface}
     */
    scope() {
        return this;
    }
}

class InstanceResolver {
    /**
     * @param {serviceContainerCallback} callback
     * @param {boolean} isGlobal
     */
    constructor(callback, isGlobal = false) {
        this.callback = callback;
        this.isGlobal = isGlobal;
        this.value = null;
        this.isResolved = false;
    }

    /**
     * @param {ServiceContainer} serviceContainer
     * @returns {*}
     */
    resolve(serviceContainer) {
        if (this.isResolved === false) {
            this.value = this.callback(serviceContainer);
            this.isResolved = true;
        }
        return this.value;
    }

    /**
     * @returns {ResolverInterface}
     */
    scope() {
        if (this.isGlobal) {
            return this;
        }
        return new InstanceResolver(this.callback);
    }
}
