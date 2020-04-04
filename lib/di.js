class Di {
    constructor(resolvers = new Map()) {
        this.resolvers = resolvers
    }

    value(key, value) {
        this.resolvers.set(key, new ValueResolver(value))
        return this
    }

    instance(key, deps, cb, isGlobal = true) {
        this.resolvers.set(key, new InstanceResolver(deps, cb, isGlobal))
        return this
    }

    factory(key, deps, cb) {
        this.resolvers.set(key, new FactoryResolver(deps, cb))
        return this
    }

    invoke(deps, cb) {
        return cb(this.getDeps(deps))
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
    constructor(keys, cb) {
        this.keys = keys
        this.cb = cb
    }

    resolve(di) {
        return di.invoke(this.keys, this.cb)
    }

    scope() {
        return this
    }
}

class InstanceResolver {
    constructor(keys, cb, isGlobal = true) {
        this.keys = keys
        this.cb = cb
        this.isGlobal = isGlobal
        this.value = null
        this.isResolved = false
    }

    resolve(di) {
        if (this.isResolved === false) {
            this.value = di.invoke(this.keys, this.cb)
            this.isResolved = true
        }
        return this.value
    }

    scope() {
        if (this.isGlobal) {
            return this
        }
        return new InstanceResolver(this.keys, this.cb)
    }
}

module.exports = {
    Di
}
