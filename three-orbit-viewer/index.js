var createApp = require('canvas-app')
var createControls = require('../three-orbit-controls')
var Emitter = require('events/')
var xtend = require('xtend')
var number = require('as-number')

module.exports = function(THREE) {
    var OrbitControls = createControls(THREE)
    var stereoEffect = require('../three-stereo-effect')(THREE)
    return function(opt) {
        opt = opt||{}
        console.log(opt);
        var emitter = new Emitter()


        var ctxAttrib = opt.contextAttributes || {}

        var setup = function(gl, width, height) {
            emitter.renderer = new THREE.WebGLRenderer(xtend(ctxAttrib, {
                canvas: gl.canvas
            }))

            var clearColor = 0x000000
            if (opt.clearColor || typeof opt.clearColor === 'number')
                clearColor = opt.clearColor

            var clearAlpha = opt.clearAlpha||0
            emitter.renderer.setClearColor(clearColor, clearAlpha)

            var fov = number(opt.fov, 90)
            var near = number(opt.near, 0.1)
            var far = number(opt.far, 1000)

            emitter.scene = new THREE.Scene()
            emitter.camera = new THREE.PerspectiveCamera(fov, width/height, near, far)

            var position = opt.position || new THREE.Vector3(1, 1, -2)
            var target = opt.target || new THREE.Vector3()

            emitter.camera.position.copy(position)
            emitter.camera.lookAt(target)

            emitter.controls = new OrbitControls(emitter.camera, emitter.engine.canvas)
            emitter.controls.target.copy(target)

            // Our preferred controls via DeviceOrientation
            function setOrientationControls(e) {
              console.log('got Orientation Controls',e);
              if (!e.alpha) {
                return;
              }
              emitter.controls = new THREE.DeviceOrientationControls(camera, true);
              emitter.controls.connect();
              emitter.controls.update();
              element.addEventListener('click', fullscreen, false);
              window.removeEventListener('deviceorientation', setOrientationControls, true);
            }
            window.addEventListener('deviceorientation', setOrientationControls, true);

            effect = new stereoEffect(emitter.renderer);
            // Get canvas size for the device in use.  The 0.9 reduction is to fit the iPhone6 plus on the Google Cardboard
            effect.setSize($('canvas')[0].clientWidth, $('canvas')[0].clientHeight);
            effect.focalLength = focalLength;
            effect.setEyeSeparation = eyeSeparation;
        }

        var render = function(gl, width, height, dt) {
            emitter.emit('tick', dt)
            if (showStereo) {
                effect.render(emitter.scene, emitter.camera)
            } else {
                emitter.renderer.render(emitter.scene, emitter.camera)
            }
            emitter.emit('render', dt)
        }

        var resize = function(width, height) {
            if (!emitter.renderer)
                return

            emitter.renderer.setSize(width, height)
            emitter.camera.aspect = width/height
            emitter.camera.updateProjectionMatrix()

            emitter.emit('resize', width, height)
        }


        var engine = createApp(render, xtend(opt, {
            context: 'webgl',
            onResize: resize
        }))
        emitter.engine = engine

        document.body.appendChild(engine.canvas)
        document.body.style.margin = "0"
        document.body.style.overflow = "hidden"

        setup(engine.context, engine.width, engine.height)
        if (typeof emitter.renderer.setPixelRatio === 'function') //r70
            emitter.renderer.setPixelRatio(engine._DPR)
        else if (typeof emitter.renderer.devicePixelRatio === 'number') //r69
            emitter.renderer.devicePixelRatio = engine._DPR
        emitter.renderer.setSize(engine.width, engine.height)
        engine.start()

        return emitter
    }
}