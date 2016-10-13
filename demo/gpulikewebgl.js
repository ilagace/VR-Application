/*
  Renders a StreetView panorama in ThreeJS.

  Uses a GPU stitching algorithm to support
  higher quality images on low-memory devices
  (like iOS Safari).
 */

var url = require('url')
var equirect = require('../intermediate')
var panorama = require('google-panorama-by-location')
var awesome = require('awesome-streetview')
var THREE = require('three')
var createOrbitViewer = require('three-orbit-viewer')(THREE)

var bestZoom = require('google-panorama-zoom-level')
var preloader = document.querySelector('.preloader')

var app = createOrbitViewer({
  clearColor: 0xffffff,
  clearAlpha: 1.0,
  fov: 70,
  position: new THREE.Vector3(0, 0, -0.1)
})

var tex = new THREE.DataTexture(null, 1, 1, THREE.RGBAFormat)
tex.minFilter = THREE.LinearFilter
tex.magFilter = THREE.LinearFilter
tex.generateMipmaps = false

// transparent canvas to start (white)
var canvas = document.createElement('canvas')
tex.needsUpdate = true
tex.image = canvas

// add a double-sided sphere
var geo = new THREE.SphereGeometry(1, 84, 84)
var mat = new THREE.MeshBasicMaterial({
  map: tex,
  side: THREE.DoubleSide
})
var sphere = new THREE.Mesh(geo, mat)
sphere.scale.x = -1

// this looks pretty nice with our data set
sphere.rotation.y = Math.PI/2 - 0.5

app.scene.add(sphere)

start()

window.addEventListener('hashchange', function (ev) {
  ev.preventDefault()
  start()
})

function start () {
  var location = awesome()

  // allow deep-linking into a location :)
  var hash = url.parse(window.location.href).hash
  var match = /^\#([0-9\-\.]+)\,([0-9\-\.]+)$/.exec(hash || '')
  if (match) {
    location = [ parseFloat(match[1]), parseFloat(match[2]) ]
  }

  sphere.visible = false
  load(location)
}

function load (location) {
  console.log('Location: %s', location.join(', '))
  panorama(location, function (err, result) {
    if (err) throw err
    var renderer = app.renderer
    var gl = renderer.getContext()
    var maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
    var zoom = Math.max(0, Math.min(4, bestZoom(maxSize)))
    equirect(result.id, {
      zoom: zoom,
      canvas: canvas,
      tiles: result.tiles,
      crossOrigin: 'Anonymous'
    }).on('start', function (data) {
      sphere.visible = true
    }).on('progress', function (ev) {
        tex.needsUpdate = true
    }).on('complete', function (image) {
        tex.needsUpdate = true
    })
  })
}

function setProgress(val) {
  preloader.style.width = Math.round(val.toFixed(1) * 100) + '%'
}