;(function(w){
var BRATABASE_API = "https://api.bratabase.com/";
var META_URLS = ['next', 'current', 'prev'];
var SCHEMAS = {
    collection: CollectionDocument,
    entity: EntityDocument,
    resource: EntityDocument
};

function urlEncode(params) {
    var encoded = Object.keys(params).map(function(k){
        return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
    });
    if (encoded.length === 0) {
        return '';
    }
    return '?' + encoded.join('&');
}

function getJSON(url, params, api) {
    params = params || {};
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();

        xhr.onload = function(){
            if (this.status >= 200 && this.status < 400) {
                resolve(JSON.parse(this.response));
            } else {
                this.responseJSON = JSON.parse(this.response);
                reject(this);
            }
        };

        xhr.onerror = function(){
            reject(this);
        }

        xhr.open("GET", url + urlEncode(params), true);
        xhr.send();
    });
}


function Meta(meta) {
    var self = this;
    Object.keys(meta).forEach(function(key) {
        if (META_URLS.indexOf(key) != -1) {
            self[key] = function(){
                return followLink(meta[key], api);
            }
        } else {
            self[key] = meta[key];
        }
    });
    return this;
}


function followLink(url, api, params) {
    return getJSON(url, params, api).then(function(payload){
        var schema = SCHEMAS[payload.rel];
        return new schema(payload, api);
    });
}


function Links(links, api) {
    var self = this;
    Object.keys(links).forEach(function(link) {
        self[link] = function(params){
            return followLink(links[link], api, params);
        }
    });
    return this;
}


function EntityDocument(payload, api) {
    this._payload = payload;
    this._api = api;

    this.rel = payload.rel;
    this.spec = payload.spec;
    this.self = payload.self;
    this.body = payload.body;

    this.links = new Links(payload.links, api);
    this.meta = new Meta(payload.meta, api);
    return this;
}


function CollectionTuple(tuple, api) {
    this._tuple = tuple;
    this._api = api;

    var self = this;
    Object.keys(tuple).forEach(function(attr) {
        self[attr] = tuple[attr];
    });

    this.follow = function(){
        return followLink(tuple.href, api)
    }

    return this;
}


function CollectionDocument(payload, api) {
    this._payload = payload;
    this._api = api;

    this.rel = payload.rel;
    this.spec = payload.spec;
    this.self = payload.self;
    this.collection = payload.collection.map(function(tup) {
        return new CollectionTuple(tup, api);
    });

    this.links = new Links(payload.links);
    this.meta = new Meta(payload.meta);
    return this;
}

// Public API
w.BratabaseAPI = function(opts){
    opts = opts || {};
    var host = opts.host || BRATABASE_API;
    var credentials = opts.credentials || null;

    return {
        host: host,
        credentials: credentials,
        BRATABASE_API: BRATABASE_API,
        root: function(){
            return followLink(host, this);
        },
        get: function(url, opts){
            return followLink(url, this);
        }
    }
}

})(window)
;
