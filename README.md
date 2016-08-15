# Bratabase API Javascript client

This is a Javascript client for the [Bratabase API](http://developers.bratabase.com).

Sample code on:

 * https://github.com/Bratabase/api-cors-example
 * https://github.com/Bratabase/cup-converter-website

# Usage

```javascript
var api = BratabaseAPI({
    // Options...
});
```

## Options

 * **host**: The URL for the host, defaults to `https://api.bratabase.com`
 * **credentials**: Oauth headers to authenticate on the API. Can contain
    `app_key`, `app_secret` or `code`.


To access the root element of the API:

    api.root().then(callback);

The variable passed in to the callback will be a Javascript object mapping
the same keys as the JSON response. Follow the `links` attribute to navigate
to the available options, for example, the API's root will follow this shape:

```JSON
{
    "self": "https://api.bratabase.com/",
    "meta": {
        "welcome": "hello hello!"
    },   
    "links": {
        "me": "https://api.bratabase.com/me/",
        "brands": "https://api.bratabase.com/brands/",
        "rate_limit": "https://api.bratabase.com/rate-limit/"
    },
    "rel": "resource",
    "spec": "https://developers.bratabase.com/api-root/"
}
```

And can be accessed:

```javascript
api.root().then(function(root){
    console.log(root.links.brands.self);
});
```


### Accessing a direct URL

If you have a full API URL in hand and need to follow it, the `api` instance
provides a `.get` function that will do just that.

```javascript
var brandsUrl = 'https://api.bratabase.com/brands/';

api.get(brandsUrl).then(function(brands){
    console.assert(brands.self === brandsUrl);
    console.log(brands.collection.length);
});

```

### Accessing the raw payload

All returned objects on the callbacks have a `._payload` attribute that contains
the raw parsed JSON from the API.


## Examples

1. Obtain the models for the first brand.

```javascript

var api = BratabaseAPI();

// Access the root element
api.root().then(function(root){
    // Follow to the brands catalog
    root.links.brands().then(function(brands){
        // Follow the first brand
        brands.collection[0].follow().then(function(brand){
            // Follow the models' catalog for such brand
            brand.links.models().then(function(models){
                console.log(models);
            });
        });
    });
});

```

2. Checking remaining API hits via rate limit.

```javascript

var api = BratabaseAPI();

// Access the root element
api.root().then(function(root){
    root.links.rate_limit().then(function(limits){
        console.log(limits.body.base.remaining)
    })
});
```

3. Reading the 2nd page of brands

```javascript
var api = BratabaseAPI();

// Access the root element
api.root().then(function(root){
    // Follow to the brands catalog
    root.links.brands().then(function(brands){
        brands.meta.next().then(function(brands2){
            console.log(brands2);
        });
    });
});
```
