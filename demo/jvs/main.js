/*
  Renders a StreetView panorama in ThreeJS.

  Uses a GPU stitching algorithm to support
  higher quality images on low-memory devices
  (like iOS Safari).
 */

var url = require('url');
var equirect = require('../../');
var panorama = require('google-panorama-by-location');
var awesome = require('awesome-streetview');
var THREE = require('three');
var createOrbitViewer = require('../../three-orbit-viewer')(THREE);
var ColladaLoader = require('three-collada-loader');

// unlike max-ram-zoom, this is based on VRAM
var bestZoom = require('google-panorama-zoom-level');


var preloader = document.querySelector('.preloader');
var canvas = document.createElement('canvas');
var tex = new THREE.Texture();
tex.minFilter = THREE.LinearFilter;
tex.generateMipmaps = false;

tex.needsUpdate = true;
tex.image = canvas;

var loader = new ColladaLoader();

var objects = stereo(createOrbitViewer, THREE, tex);
var sphere = objects.sphere;
var app = objects.app;

panorama(googleLocation, {
        source: google.maps.StreetViewSource.DEFAULT,
        preference: google.maps.StreetViewPreference.NEAREST
    }, function (err, result) {
        if (err) throw err

        var texHeight;
        var maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        var zoom = Math.max(0, Math.min(4, bestZoom(maxSize)));
        //var zoom = 1;

        preloader.style.height = '6px';
        // data.style.height = '10px';
        equirect(result.id, {
          zoom: zoom,
          tiles: result.tiles,
          canvas: canvas,
          crossOrigin: 'Anonymous'
        }).on('start', function (data) {
          texHeight = data.height;
          sphere.visible = true;
        }).on('progress', function (ev) {
          var x = ev.position[0];
          var y = texHeight - ev.position[1] - ev.image.height;
          tex.needsUpdate = true;
          setProgress(ev.count / ev.total);
        }).on('complete', function (ev) {
          tex.needsUpdate = true;
          preloader.style.height = '0';
          photoLatitude = result.latitude;
          photoLongitude = result.longitude;
          modelLoad(THREE, loader, app, buildingLocation);
    });
});

function setProgress(val) {
  preloader.style.width = Math.round(val.toFixed(1) * 100) + '%';
}