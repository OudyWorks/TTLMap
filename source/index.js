const throttle = require('throttleit')

export default class TTLMap extends Map {
    constructor(iterable = [], ttl = 60000, evictInterval = 10000) {
        super()
        this.ttl = ttl
        this.evictInterval = evictInterval
        this.deleteExpired = throttle(
            () => {
                this.ledger.forEach(
                    (value, key) => {
                        if(Date.now() > value) {
                            this.ledger.delete(key)
                            this.delete(key)
                        }
                    }
                )
                if(this.ledger.size)
                    this.deleteExpired()
            },
            this.evictInterval
        )
        this.ledger = new Map()
        for(const [key, value] of iterable)
            this.set(key, value)
    }
    set(key, value) {
        this.ledger.set(key, Date.now() + this.ttl)
        this.deleteExpired()
        return super.set(key, value)
    }
    get(key) {
        const value = super.get(key)
        if(value) {
            this.ledger.set(key, Date.now() + this.ttl)
            this.deleteExpired()
        }
        return value
    }
}