const Zone = require('../Models/Zone')
const geolib = require('geolib')

//coordonne : {latitude,longitude}
exports.findZone = (coordonnee,cb) => {
    Zone.find().then(zones => {
        for(zone of zones){
            console.log(zone.border[0])
            console.log(coordonnee)
            console.log(inside(coordonnee,zone.border))
            if(inside(coordonnee,zone.border)){
                return cb(zone)
            }
        }
        return(cb(null))
    })
}

//point, vs:liste des points
function inside(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
    var x = point.latitude, y = point.longitude;
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].latitude, yi = vs[i].longitude;
        var xj = vs[j].latitude, yj = vs[j].longitude;
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};