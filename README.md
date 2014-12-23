# Mappersmith

**Mappersmith** is a lightweight, dependency-free, rest client mapper for javascript. It helps you map your API to use at the client, giving you all the flexibility you want to customize requests or write your own gateways.

# Install

#### NPM

```sh
npm install mappersmith
```

#### Browser

Download the tag/latest version from the build folder.

#### Build from the source

Install the dependencies

```sh
npm install
```

Build

```sh
npm run build
```

# Usage

To create a client for your API, you will need to provide a simple manifest, which must have `host` and `resources` keys. Each resource has a name and a list of methods with its definitions, like:

```javascript
var manifest = {
  host: 'http://my.api.com',
  resources: {
    Book: {
      all:  {path: '/v1/books.json'},
      byId: {path: '/v1/books/{id}.json'}
    },
    Photo: {
      byCategory: {path: '/v1/photos/{category}/all.json'}
    }
  }
}
```

You can specify an HTTP method for every API call, but if you don't, `GET` will be used. For instance, let's say you can save a photo:

```javascript
...
Photo: {
      save: {method: 'POST', path: '/v1/photos/{category}/save'}
    }
...
```

With the manifest in your hands, you are able to forge your client:

```javascript
var Client = new Mappersmith.forge(manifest)
```

And then, use it as defined:

```javascript
// without callbacks
Client.Book.byId({id: 3})

// with all callbacks
Client.Book.byId({id: 3}, function(data) {
  // success callback
}).fail(function() {
  // fail callback
}).complete(function() {
  // complete callback, it will always be called
})
```

#### Parameters
If your method doesn't require any parameter, you can just call it without them:

```javascript
Client.Book.all() // http://my.api.com/v1/books.json
```

Every parameter that doesn't match a pattern (`{parameter-name}`) in `path` will be sent as part of the query string:

```javascript
Client.Book.all({language: 'en'}) // http://my.api.com/v1/books.json?language=en
```

#### Processors

You can specify functions to process returned data before they are passed to success callback:

```javascript
...
Book: {
  all:  {
    path: '/v1/books.json',
    processor: function(data) {
      return data.result;
    }
  }
}
...
```

#### Compact Syntax
If you find tiring having to map your API methods with hashes, you can use our incredible compact syntax:

```javascript
...
Book: {
  all: 'get:/v1/books.json',  // The same as {method: 'GET', path: '/v1/books.json'}
  byId: '/v1/books/{id}.json' // The default is GET, as always
},
Photo: {
  // The same as {method: 'POST', path: '/v1/photos/{category}/save.json'}
  save: 'post:/v1/photos/{category}/save'
}
...
```

**A downside is that you can't use processor functions with compact syntax.**

# Gateways

**Mappersmith** allows you to customize the transport layer. You can use the default `Mappersmith.VanillaGateway`, the included `Mappersmith.JQueryGateway` or write your own version.

#### How to write one?

```javascript
var MyGateway = function() {
  return Mappersmith.Gateway.apply(this, arguments);
}

MyGateway.prototype = Mappersmith.Utils.extend({},
  Mappersmith.Gateway.prototype, {
  get: function() {
    // you will have `this.url` as the target url
  },

  post: function() {
  }
})
```

#### How to change the default?

Just provide an implementation of `Mappersmith.Gateway` as the second argument of the method `forge`:

```javascript
var Client = new Mappersmith.forge(manifest, Mappersmith.JQueryGateway)
```

#### Specifics of each gateway

You can pass options for the gateway implementation that you are using. For example, if we are using the `Mappersmith.JQueryGateway` and want one of our methods to use `jsonp`, we can call it like:

```javascript
Client.Book.byId({id: 2}, function(data) {}, {jsonp: true})
```

The third argument is passed to the gateway as `this.opts` and, of course, the accepted options vary by each implementation. The default gateway, `Mappersmith.VanillaGateway`, accepts a `configure` callback:

```javascript
Client.Book.byId({id: 2}, function(data) {}, {
  configure: function(request) {
    // do whatever you want
  }
})
```

# Gateway Implementations

The gateways listed here are available through the `Mappersmith` namespace.

## VanillaGateway

The default gateway - it uses plain `XMLHttpRequest`. Accepts a `configure` callback that allows you to change the request object before it is used.

#### Available methods:

- :ok: GET
- :x: HEAD
- :ok: POST
- :x: PUT
- :x: DELETE
- :x: PATCH

## JQueryGateway

It uses `$.ajax` and accepts an object that will be merged with `defaults`. It doesn't include **jquery**, so you will need to include that in your page.

#### Available methods:

- :ok: GET
- :x: HEAD
- :ok: POST
- :x: PUT
- :x: DELETE
- :x: PATCH

# Tests

1. Build the source (`npm run build`)
2. Open test.html

# Licence

See [LICENCE](https://github.com/tulios/mappersmith/blob/master/LICENSE) for more details.
