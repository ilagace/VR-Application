function modelLoad(THREE, loader, app, buildingLocation) {

    var dist = distance(photoLatitude, photoLongitude, buildingLocation[0], buildingLocation[1]);
    console.log(dist);
    loader.load('Maquette IL.dae',function colladaReady(collada) {
        var model = collada.scene;
        var box = new THREE.Box3().setFromObject(model);
        console.log(box);
        var scale = Math.pow(dist[0] * dist[0] + dist[1] * dist [1], 0.5) * 100 / 2.54;
        var deltaX = -dist[0] + (box.max.y - Math.abs(box.min.y)) / 2;
        var deltaZ = -dist[1] + (box.max.z + Math.abs(box.min.z)) / 2;
        var deltaY = (box.max.x - Math.abs(box.min.x)) / 2;
        var rotZ = Math.atan(((box.max.y - Math.abs(box.min.y)) / 2) / dist[1]);
        var rotX = Math.atan(deltaY / dist[1]);
        console.log(scale,deltaX,deltaZ,rotZ);
        model.rotation.x = -Math.PI / 2 + rotX;
        model.rotation.z = -Math.PI + rotZ;
        model.position.x = (-6.0 + deltaX) * 100 / (2.54 * scale);  // adjustment for the door vs lat-long
        model.position.y = -deltaY * 100 / (2.54 * scale);
        model.position.z = -deltaZ * 100 / (2.54 * scale);
        console.log(scale,model.position.x,model.position.z,model.position.y,rotZ,rotX);
        model.scale.x = model.scale.z = 1.0 / scale;
        model.scale.y = 1.25 / scale;  // take into account sphere elongation effect
        app.scene.add(model);
    });

}

function distance(lat1, lon1, lat2, lon2) {
    var earthRadius = 6371000;
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var radlon1 = Math.PI * lon1 / 180;
    var radlon2 = Math.PI * lon2 / 180;
    var difflong = radlon2 - radlon1;
    var difflat = radlat2 - radlat1;
    var sinlat = Math.sin(difflat);
    var sinlong = Math.sin(difflong);
    var dist = [earthRadius * sinlat, earthRadius * sinlong];
    return dist;
}
