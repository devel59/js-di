class Di {
    constructor(resolvers = new Map()) {
        this.resolvers = resolvers
    }

    value(key, value) {
        this.resolvers.set(key, new ValueResolver(value))
        return this
    }

    instance(key, deps, callback, isGlobal = true) {
        this.resolvers.set(key, new InstanceResolver(deps, callback, isGlobal))
        return this
    }

    factory(key, deps, callback) {
        this.resolvers.set(key, new FactoryResolver(deps, callback))
        return this
    }

    invoke(deps, callback) {
        return callback(this.getDeps(deps))
    }

    getDep(key) {
        if (this.resolvers.has(key)) {
            return this.resolvers.get(key).resolve(this)
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
        let scopeResolvers = new Map()
        for (let [key, resolver] of this.resolvers) {
            scopeResolvers.set(key, resolver.scope())
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
