class Di {
    constructor(resolvers = {}) {
        this.resolvers = resolvers
    }

    value(key, value) {
        this.resolvers[key] = new ValueResolver(value)
        return this
    }

    instance(key, deps, callback, isGlobal = true) {
        this.resolvers[key] = new InstanceResolver(deps, callback, isGlobal)
        return this
    }

    factory(key, deps, callback) {
        this.resolvers[key] = new FactoryResolver(deps, callback)
        return this
    }

    invoke(deps, callback) {
        return callback(this.getDeps(deps))
    }

    getDep(key) {
        if (this.resolvers[key]) {
            return this.resolvers[key].resolve(this)
        }
    }

    getDeps(keys) {
        let deps = {}
        for (let key of keys) {
            deps[key] = this.getDep(key)
        }
        return deps
    }

    scope() {
        let scopeResolvers = {}
        for (let key of Object.keys(this.resolvers)) {
            scopeResolvers[key] = this.resolvers[key].scope()
        }
        return new Di(scopeResolvers)
    }
}

class ValueResolver {
    constructor(value) {
        this.value = value
    }

    resolve() {
        return this.value
    }

    scope() {
        return this
    }
}

class FactoryResolver {
    constructor(keys, callback) {
        this.keys = keys
        this.callback = callback
    }

    resolve(di) {
        return di.invoke(this.keys, this.callback)
    }

    scope() {
        return this
    }
}

class InstanceResolver {
    constructor(keys, callback, isGlobal = true) {
        this.keys = keys
        this.callback = callback
        this.isGlobal = isGlobal
        this.value = null
        this.isResolved = false
    }

    resolve(di) {
        if (this.isResolved === false) {
            this.value = di.invoke(this.keys, this.callback)
            this.isResolved = true
        }
        return this.value
    }

    scope() {
        if (this.isGlobal) {
            return this
        }
        return new InstanceResolver(this.keys, this.callback)
    }
}

module.exports = {
    Di
}
