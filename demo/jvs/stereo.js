function stereo(createOrbitViewer, THREE, tex) {

    var data = document.querySelector('.data');

    var app = createOrbitViewer({
        clearColor: 0xffffff,
        clearAlpha: 1.0,
        fov: 70,
        position: new THREE.Vector3(0, 0, 0.1)  // some offset is needed to drive the controls
    });

    // add a double-sided sphere
    var geo = new THREE.SphereGeometry(1, 84, 84);
    var mat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.DoubleSide
    });
    var sphere = new THREE.Mesh(geo, mat);
    sphere.scale.x = -1;

    // this looks pretty nice with our data set
    sphere.rotation.y = -Math.PI / 2;

    app.scene.add(sphere);

    var light = new THREE.AmbientLight( 0x808080 ); // soft white light
    app.scene.add(light);

    return {sphere: sphere,
            app: app};

}