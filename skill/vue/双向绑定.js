class Dep {
    constructor() {
        this.subs = []
    }
    addSub(sub) {
        this.subs.push(sub)
    }
    depend() {
        if(window.target) {
            this.addSub(window.target)
        }
    }
    notify = function () {
        const subs = this.subs.slice()
        console.log(subs, 'subs')
        subs.forEach(sub => sub.updata())
    }
}

function parsePath(data) {
    const arr = data.split('.')
    return function(obj) {
        for(let i = 0; i < arr.length; i ++) {
            obj = obj[arr[i]]
        }
        return obj
    }
}

class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm;
        this.getter = parsePath(expOrFn);
        this.cb = cb
        this.value = this.get()
    }
    get() {
        window.target = this
        let value = this.getter.call(this.vm, this.vm)
        window.target = undefined;
        return value
    }
    updata() {
        const oldVal = this.value
        this.value = this.get()
        this.cb.call(this.vm, oldVal, this.value)
    }
}

function defineReactive(data, key, val) {
    if(typeof val === 'object') new Observe(val)
    const dep = new Dep()
    Object.defineProperty(data, key, {
        get() {
            dep.depend()
            return val
        },
        set(newVal) {
            if(val === newVal) return
            val = newVal;
            dep.notify();
        }
    })
}

class Observe {
    constructor(value) {
        this.value = value
        if(!Array.isArray(value)) {
            this.walk(value)
        }
    }
    walk(obj) {
        const keys = Object.keys(obj)
        for(let i = 0; i < keys.length; i ++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    }
}

class Vue{
    constructor(options) {
        this.data = options.data;
        new Observe(this.data);
    }
}

const vm = new Vue({
    data: {
        name: 1,
        age:2
    }
})


new Watcher(vm, 'data.name', function(oldVal, newVal) {
    console.log('oldVal', oldVal)
    console.log('newVal', newVal)
})

vm.data.name = 23


