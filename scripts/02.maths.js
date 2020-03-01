// Turret Math          creep, turret, turret.range
Math.inRadius = function (target, obj, rad) {
  // creep must inside the Canvas
  if (target.x > 0 && target.x < 799 && target.y > 0 && target.y < 499) {
    return (obj.x - target.x) * (obj.x - target.x) + (obj.y - target.y) * (obj.y - target.y) < rad * rad;
  }
};

// Creep            creep, creep(x, y), creep.speed
Math.move = function (obj, target, speed) {
  var distx = target.x - obj.x;
  var disty = target.y - obj.y;
  var angle = Math.atan2(disty, distx);

  obj.x += speed * Math.cos(angle);
  obj.y += speed * Math.sin(angle);

  return (distx < 0 ? -distx : distx) + (disty < 0 ? -disty : disty) < 2;
};

// original: Math.rand()
Math.rand = function (max) {
  return Math.floor(Math.random() * (max + 1));
};

/* /future/mathrandom.js
Math.rand = (function () {
  var x = Math.random() * 100000;
  var y = 10240;
  var z = 12345;
  var w = 67890;
  var d = Math.pow(2, 32);

  return function (max) {
    var t = x ^ (x << 15);
    x = y;
    y = z;
    z = w;
    w = ((w ^ (w >>> 21)) ^ (t ^ (t >>> 4))) >>> 0;
    return Math.floor((w / d) * (max + 1));
  };
})();
*/