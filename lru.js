/*
  Cache that dumps the least requested object when over max size.
*/

var LRU = (function() {
    function LRU(maxSize) {
       this.MAX_SIZE = maxSize || 5;
        
       this._cache = [];
       this._keyMap = {};
       this._available = 0;
       this._least = null;
       this._recent = null;
    }
    
    var proto = LRU.prototype;
    
    proto.get = function(key) {
        index = this._keyMap[key];
        if (typeof index !== "undefined") {
            var item = this._cache[index],
                next = this._cache[item.next],
                previous = this._cache[item.previous],
                recent = this._cache[this._recent];
            
            next.previous = item.previous;
            previous.next = item.next;
            
            item.next = null;
            item.previous = this._recent;
            recent.next = index;
            
            this._recent = index;
            
            return this._cache[index].value;
        } else {
            return;
        }
    }
    
    proto.add = function(key, value) {
        if (this._cache.length === this.MAX_SIZE) {
            this.delete();    
        }
       
        this._cache[this._available] = {
            key: key,
            value: value,
            previous: this._recent,
            next: null
        };
        
        this._keyMap[key] = this._available;
        
        if (this._recent !== null) { this._cache[this._recent].next = this._available; }
        if (this._least === null) { this._least = this._available; }
        
        this._recent = this._available++;
    }
    
    proto.delete = function() {
        var least = this._cache[this._least],
            next = least.next;
        
        this._cache[next].previous = null;
        
        // Really curious if this operation could be avoided.
        delete this._keyMap[least.key];
        
        this._available = this._least;
        this._least = next;
    }
    
    return LRU;
})();