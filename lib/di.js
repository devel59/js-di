class Di {
    constructor(resolvers = {}) {
        this.resolvers = resolvers
        this.dynamicDeps = new Proxy({}, {
            get: (object, key) => {
                return this.getDep(key)
            }
        })
    }

    value(key, value) {
        this.resolvers[key] = new ValueResolver(value)
        return this
    }

    instance(key, callback, isGlobal = false) {
        this.resolvers[key] = new InstanceResolver(callback, isGlobal)
        return this
    }

    factory(key, callback) {
        this.resolvers[key] = new FactoryResolver(callback)
        return this
    }

    invoke(callback) {
        return callback(this.dynamicDeps)
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
    constructor(callback) {
        this.callback = callback
    }

    resolve(di) {
        return di.invoke(this.callback)
    }

    scope() {
        return this
    }
}

class InstanceResolver {
    constructor(callback, isGlobal = false) {
        this.callback = callback
        this.isGlobal = isGlobal
        this.value = null
        this.isResolved = false
    }

    resolve(di) {
        if (this.isResolved === false) {
            this.value = di.invoke(this.callback)
            this.isResolved = true
        }
        return this.value
    }

    scope() {
        if (this.isGlobal) {
            return this
        }
        return new InstanceResolver(this.callback)
    }
}

module.exports = {
    Di
}
