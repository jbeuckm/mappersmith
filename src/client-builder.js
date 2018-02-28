import Manifest from './manifest'
import Request from './request'
import { assign } from './utils'

/**
 * @typedef ClientBuilder
 * @param {Object} manifest - manifest definition with at least the `resources` key
 * @param {Function} GatewayClassFactory - factory function that returns a gateway class
 */
function ClientBuilder (manifest, GatewayClassFactory, configs) {
  if (!manifest) {
    throw new Error(
      `[Mappersmith] invalid manifest (${manifest})`
    )
  }

  if (!GatewayClassFactory || !GatewayClassFactory()) {
    throw new Error(
      '[Mappersmith] gateway class not configured (configs.gateway)'
    )
  }

  this.Promise = configs.Promise
  this.manifest = new Manifest(manifest, configs)
  this.GatewayClassFactory = GatewayClassFactory
}

const getMiddlewareName = middleware => middleware.__middlewareName

ClientBuilder.prototype = {
  build () {
    const client = { _manifest: this.manifest }

    this.manifest.eachResource((name, methods) => {
      client[name] = this.buildResource(name, methods)
    })

    return client
  },

  buildResource (resourceName, methods) {
    return methods.reduce((resource, method) => assign(resource, {
      [method.name]: (requestParams) => {
        const request = new Request(method.descriptor, requestParams)
        return this.invokeMiddlewares(resourceName, method.name, request)
      }
    }), {})
  },

  invokeMiddlewares (resourceName, resourceMethod, initialRequest) {
    const middleware = this.manifest.createMiddleware({ resourceName, resourceMethod })
    const GatewayClass = this.GatewayClassFactory()
    const gatewayConfigs = this.manifest.gatewayConfigs
    const chainRequestPhase = (requestPromise, middleware) => {
      const start = new Date()
      return requestPromise
        .then(request => middleware.request(request))
        .then(request => this.Promise.resolve(request))
        .then(request => {
          const end = new Date()
          const duration = end.getTime() - start.getTime()

          if (request && request.enhance) {
            return request.enhance({
              _timeline: [
                ...(request.timeline() || []),
                {
                  phase: 'request',
                  name: getMiddlewareName(middleware),
                  duration,
                  invokedAt: start.toISOString(),
                  completedAt: end.toISOString()
                }
              ]
            })
          }

          return request
        })
    }
    const chainResponsePhase = (next, middleware) => () => {
      const start = new Date()
      return middleware.response(next).then(response => {
        const end = new Date()
        const duration = end.getTime() - start.getTime()
        const timelineEntry = [
          ...(response ? response._timeline || [] : []),
          {
            phase: 'response',
            name: getMiddlewareName(middleware),
            status: 'success',
            duration,
            invokedAt: start.toISOString(),
            completedAt: end.toISOString()
          }
        ]

        if (response && response.enhance) {
          return response.enhance({ _timeline: timelineEntry })
        }

        if (typeof response === 'object') {
          response._timeline = timelineEntry
        }

        return response
      }).catch(response => {
        const end = new Date()
        const duration = end.getTime() - start.getTime()
        const timelineEntry = [
          ...(response ? response._timeline || [] : []),
          {
            phase: 'response',
            name: getMiddlewareName(middleware),
            status: 'failure',
            duration,
            invokedAt: start.toISOString(),
            completedAt: end.toISOString()
          }
        ]

        if (response && response.enhance) {
          throw response.enhance({ _timeline: timelineEntry })
        }

        if (typeof response === 'object') {
          response._timeline = timelineEntry
        }

        throw response
      })
    }

    return new this.Promise((resolve, reject) => {
      return middleware
        .reduce(
          chainRequestPhase,
          this.Promise.resolve(initialRequest)
        )
        .then(finalRequest => {
          const callGateway = () => {
            const start = new Date()
            return new GatewayClass(finalRequest, gatewayConfigs).call().then(response => {
              const end = new Date()
              const duration = end.getTime() - start.getTime()
              const timelineEntry = [
                ...(response ? response._timeline || [] : []),
                {
                  phase: 'gateway',
                  name: 'HTTP request',
                  status: 'success',
                  duration,
                  invokedAt: start.toISOString(),
                  completedAt: end.toISOString()
                }
              ]

              if (response && response.enhance) {
                return response.enhance({ _timeline: timelineEntry })
              }

              if (typeof response === 'object') {
                response._timeline = timelineEntry
              }

              return response
            }).catch(response => {
              const end = new Date()
              const duration = end.getTime() - start.getTime()
              const timelineEntry = [
                ...(response ? response._timeline || [] : []),
                {
                  phase: 'gateway',
                  name: 'HTTP request',
                  status: 'failure',
                  duration,
                  invokedAt: start.toISOString(),
                  completedAt: end.toISOString()
                }
              ]

              if (response && response.enhance) {
                throw response.enhance({ _timeline: timelineEntry })
              }

              if (typeof response === 'object') {
                response._timeline = timelineEntry
              }

              throw response
            })
          }
          const execute = middleware.reduce(chainResponsePhase, callGateway)

          return execute().then(response => resolve(response))
        })
        .catch(reject)
    })
  }
}

export default ClientBuilder
