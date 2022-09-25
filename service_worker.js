/**
* service_worker.js
* This is the service worker file registed in the manifest.  It includes all other background scripts.
 */

try {
  importScripts([
    '/background/background_listeners.js'
  ])
} catch (e) {
  console.error(e)
}