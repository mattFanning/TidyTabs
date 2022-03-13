/**
* background_main.js
* This is the service worker file registed in the manifest.  It includes all other background scripts.
 */




try {
  //importScripts('/path/file.js', '/path2/file2.js', '/path3/file3.js' /*, and so on */)
  importScripts([
    '/src/background_listeners.js'
  ]
  )
} catch (e) {
  console.error(e)
}