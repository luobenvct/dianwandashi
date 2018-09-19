import util from 'util.js';
/**
 * 百度转腾讯
 */
function Convert_BD09_To_GCJ02(lat,lng){
    const x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = lng - 0.0065;
    var y = lat - 0.006;
    var  z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    lng = z * Math.cos(theta);
    lat = z * Math.sin(theta);
    return {lat:lat,lng:lng}
}

/**
 * 腾讯转百度
 */
function Convert_GCJ02_To_BD09(lat,lng){
    const x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = lng;
    var y = lat;
    var  z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    lng = z * Math.cos(theta) + 0.0065;
    lat = z * Math.sin(theta) + 0.006;
    return {lat:lat,lng:lng}
}


module.exports = {
    Convert_BD09_To_GCJ02: Convert_BD09_To_GCJ02,
    Convert_GCJ02_To_BD09: Convert_GCJ02_To_BD09
}