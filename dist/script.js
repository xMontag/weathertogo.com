(function(global) {
  "use strict";

  /* Set up a RequestAnimationFrame shim so we can animate efficiently FOR
   * GREAT JUSTICE. */
  var requestInterval, cancelInterval;

  (function() {
    var raf = global.requestAnimationFrame       ||
              global.webkitRequestAnimationFrame ||
              global.mozRequestAnimationFrame    ||
              global.oRequestAnimationFrame      ||
              global.msRequestAnimationFrame     ,
        caf = global.cancelAnimationFrame        ||
              global.webkitCancelAnimationFrame  ||
              global.mozCancelAnimationFrame     ||
              global.oCancelAnimationFrame       ||
              global.msCancelAnimationFrame      ;

    if(raf && caf) {
      requestInterval = function(fn, delay) {
        var handle = {value: null};

        function loop() {
          handle.value = raf(loop);
          fn();
        }

        loop();
        return handle;
      };

      cancelInterval = function(handle) {
        caf(handle.value);
      };
    }

    else {
      requestInterval = setInterval;
      cancelInterval = clearInterval;
    }
  }());

  /* Catmull-rom spline stuffs. */
  /*
  function upsample(n, spline) {
    var polyline = [],
        len = spline.length,
        bx  = spline[0],
        by  = spline[1],
        cx  = spline[2],
        cy  = spline[3],
        dx  = spline[4],
        dy  = spline[5],
        i, j, ax, ay, px, qx, rx, sx, py, qy, ry, sy, t;

    for(i = 6; i !== spline.length; i += 2) {
      ax = bx;
      bx = cx;
      cx = dx;
      dx = spline[i    ];
      px = -0.5 * ax + 1.5 * bx - 1.5 * cx + 0.5 * dx;
      qx =        ax - 2.5 * bx + 2.0 * cx - 0.5 * dx;
      rx = -0.5 * ax            + 0.5 * cx           ;
      sx =                   bx                      ;

      ay = by;
      by = cy;
      cy = dy;
      dy = spline[i + 1];
      py = -0.5 * ay + 1.5 * by - 1.5 * cy + 0.5 * dy;
      qy =        ay - 2.5 * by + 2.0 * cy - 0.5 * dy;
      ry = -0.5 * ay            + 0.5 * cy           ;
      sy =                   by                      ;

      for(j = 0; j !== n; ++j) {
        t = j / n;

        polyline.push(
          ((px * t + qx) * t + rx) * t + sx,
          ((py * t + qy) * t + ry) * t + sy
        );
      }
    }

    polyline.push(
      px + qx + rx + sx,
      py + qy + ry + sy
    );

    return polyline;
  }

  function downsample(n, polyline) {
    var len = 0,
        i, dx, dy;

    for(i = 2; i !== polyline.length; i += 2) {
      dx = polyline[i    ] - polyline[i - 2];
      dy = polyline[i + 1] - polyline[i - 1];
      len += Math.sqrt(dx * dx + dy * dy);
    }

    len /= n;

    var small = [],
        target = len,
        min = 0,
        max, t;

    small.push(polyline[0], polyline[1]);

    for(i = 2; i !== polyline.length; i += 2) {
      dx = polyline[i    ] - polyline[i - 2];
      dy = polyline[i + 1] - polyline[i - 1];
      max = min + Math.sqrt(dx * dx + dy * dy);

      if(max > target) {
        t = (target - min) / (max - min);

        small.push(
          polyline[i - 2] + dx * t,
          polyline[i - 1] + dy * t
        );

        target += len;
      }

      min = max;
    }

    small.push(polyline[polyline.length - 2], polyline[polyline.length - 1]);

    return small;
  }
  */

  /* Define skycon things. */
  /* FIXME: I'm *really really* sorry that this code is so gross. Really, I am.
   * I'll try to clean it up eventually! Promise! */
  var KEYFRAME = 500,
      STROKE = 0.08,
      TAU = 2.0 * Math.PI,
      TWO_OVER_SQRT_2 = 2.0 / Math.sqrt(2);

  function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU, false);
    ctx.fill();
  }

  function line(ctx, ax, ay, bx, by) {
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  function puff(ctx, t, cx, cy, rx, ry, rmin, rmax) {
    var c = Math.cos(t * TAU),
        s = Math.sin(t * TAU);

    rmax -= rmin;

    circle(
      ctx,
      cx - s * rx,
      cy + c * ry + rmax * 0.5,
      rmin + (1 - c * 0.5) * rmax
    );
  }

  function puffs(ctx, t, cx, cy, rx, ry, rmin, rmax) {
    var i;

    for(i = 5; i--; )
      puff(ctx, t + i / 5, cx, cy, rx, ry, rmin, rmax);
  }

  function cloud(ctx, t, cx, cy, cw, s, color) {
    t /= 30000;

    var a = cw * 0.21,
        b = cw * 0.12,
        c = cw * 0.24,
        d = cw * 0.28;

    ctx.fillStyle = color;
    puffs(ctx, t, cx, cy, a, b, c, d);

    ctx.globalCompositeOperation = 'destination-out';
    puffs(ctx, t, cx, cy, a, b, c - s, d - s);
    ctx.globalCompositeOperation = 'source-over';
  }

  function sun(ctx, t, cx, cy, cw, s, color) {
    t /= 120000;

    var a = cw * 0.25 - s * 0.5,
        b = cw * 0.32 + s * 0.5,
        c = cw * 0.50 - s * 0.5,
        i, p, cos, sin;

    ctx.strokeStyle = color;
    ctx.lineWidth = s;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.arc(cx, cy, a, 0, TAU, false);
    ctx.stroke();

    for(i = 8; i--; ) {
      p = (t + i / 8) * TAU;
      cos = Math.cos(p);
      sin = Math.sin(p);
      line(ctx, cx + cos * b, cy + sin * b, cx + cos * c, cy + sin * c);
    }
  }

  function moon(ctx, t, cx, cy, cw, s, color) {
    t /= 15000;

    var a = cw * 0.29 - s * 0.5,
        b = cw * 0.05,
        c = Math.cos(t * TAU),
        p = c * TAU / -16;

    ctx.strokeStyle = color;
    ctx.lineWidth = s;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    cx += c * b;

    ctx.beginPath();
    ctx.arc(cx, cy, a, p + TAU / 8, p + TAU * 7 / 8, false);
    ctx.arc(cx + Math.cos(p) * a * TWO_OVER_SQRT_2, cy + Math.sin(p) * a * TWO_OVER_SQRT_2, a, p + TAU * 5 / 8, p + TAU * 3 / 8, true);
    ctx.closePath();
    ctx.stroke();
  }

  function rain(ctx, t, cx, cy, cw, s, color) {
    t /= 1350;

    var a = cw * 0.16,
        b = TAU * 11 / 12,
        c = TAU *  7 / 12,
        i, p, x, y;

    ctx.fillStyle = color;

    for(i = 4; i--; ) {
      p = (t + i / 4) % 1;
      x = cx + ((i - 1.5) / 1.5) * (i === 1 || i === 2 ? -1 : 1) * a;
      y = cy + p * p * cw;
      ctx.beginPath();
      ctx.moveTo(x, y - s * 1.5);
      ctx.arc(x, y, s * 0.75, b, c, false);
      ctx.fill();
    }
  }

  function sleet(ctx, t, cx, cy, cw, s, color) {
    t /= 750;

    var a = cw * 0.1875,
        b = TAU * 11 / 12,
        c = TAU *  7 / 12,
        i, p, x, y;

    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for(i = 4; i--; ) {
      p = (t + i / 4) % 1;
      x = Math.floor(cx + ((i - 1.5) / 1.5) * (i === 1 || i === 2 ? -1 : 1) * a) + 0.5;
      y = cy + p * cw;
      line(ctx, x, y - s * 1.5, x, y + s * 1.5);
    }
  }

  function snow(ctx, t, cx, cy, cw, s, color) {
    t /= 3000;

    var a  = cw * 0.16,
        b  = s * 0.75,
        u  = t * TAU * 0.7,
        ux = Math.cos(u) * b,
        uy = Math.sin(u) * b,
        v  = u + TAU / 3,
        vx = Math.cos(v) * b,
        vy = Math.sin(v) * b,
        w  = u + TAU * 2 / 3,
        wx = Math.cos(w) * b,
        wy = Math.sin(w) * b,
        i, p, x, y;

    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for(i = 4; i--; ) {
      p = (t + i / 4) % 1;
      x = cx + Math.sin((p + i / 4) * TAU) * a;
      y = cy + p * cw;

      line(ctx, x - ux, y - uy, x + ux, y + uy);
      line(ctx, x - vx, y - vy, x + vx, y + vy);
      line(ctx, x - wx, y - wy, x + wx, y + wy);
    }
  }

  function fogbank(ctx, t, cx, cy, cw, s, color) {
    t /= 30000;

    var a = cw * 0.21,
        b = cw * 0.06,
        c = cw * 0.21,
        d = cw * 0.28;

    ctx.fillStyle = color;
    puffs(ctx, t, cx, cy, a, b, c, d);

    ctx.globalCompositeOperation = 'destination-out';
    puffs(ctx, t, cx, cy, a, b, c - s, d - s);
    ctx.globalCompositeOperation = 'source-over';
  }

  /*
  var WIND_PATHS = [
        downsample(63, upsample(8, [
          -1.00, -0.28,
          -0.75, -0.18,
          -0.50,  0.12,
          -0.20,  0.12,
          -0.04, -0.04,
          -0.07, -0.18,
          -0.19, -0.18,
          -0.23, -0.05,
          -0.12,  0.11,
           0.02,  0.16,
           0.20,  0.15,
           0.50,  0.07,
           0.75,  0.18,
           1.00,  0.28
        ])),
        downsample(31, upsample(16, [
          -1.00, -0.10,
          -0.75,  0.00,
          -0.50,  0.10,
          -0.25,  0.14,
           0.00,  0.10,
           0.25,  0.00,
           0.50, -0.10,
           0.75, -0.14,
           1.00, -0.10
        ]))
      ];
  */

  var WIND_PATHS = [
        [
          -0.7500, -0.1800, -0.7219, -0.1527, -0.6971, -0.1225,
          -0.6739, -0.0910, -0.6516, -0.0588, -0.6298, -0.0262,
          -0.6083,  0.0065, -0.5868,  0.0396, -0.5643,  0.0731,
          -0.5372,  0.1041, -0.5033,  0.1259, -0.4662,  0.1406,
          -0.4275,  0.1493, -0.3881,  0.1530, -0.3487,  0.1526,
          -0.3095,  0.1488, -0.2708,  0.1421, -0.2319,  0.1342,
          -0.1943,  0.1217, -0.1600,  0.1025, -0.1290,  0.0785,
          -0.1012,  0.0509, -0.0764,  0.0206, -0.0547, -0.0120,
          -0.0378, -0.0472, -0.0324, -0.0857, -0.0389, -0.1241,
          -0.0546, -0.1599, -0.0814, -0.1876, -0.1193, -0.1964,
          -0.1582, -0.1935, -0.1931, -0.1769, -0.2157, -0.1453,
          -0.2290, -0.1085, -0.2327, -0.0697, -0.2240, -0.0317,
          -0.2064,  0.0033, -0.1853,  0.0362, -0.1613,  0.0672,
          -0.1350,  0.0961, -0.1051,  0.1213, -0.0706,  0.1397,
          -0.0332,  0.1512,  0.0053,  0.1580,  0.0442,  0.1624,
           0.0833,  0.1636,  0.1224,  0.1615,  0.1613,  0.1565,
           0.1999,  0.1500,  0.2378,  0.1402,  0.2749,  0.1279,
           0.3118,  0.1147,  0.3487,  0.1015,  0.3858,  0.0892,
           0.4236,  0.0787,  0.4621,  0.0715,  0.5012,  0.0702,
           0.5398,  0.0766,  0.5768,  0.0890,  0.6123,  0.1055,
           0.6466,  0.1244,  0.6805,  0.1440,  0.7147,  0.1630,
           0.7500,  0.1800
        ],
        [
          -0.7500,  0.0000, -0.7033,  0.0195, -0.6569,  0.0399,
          -0.6104,  0.0600, -0.5634,  0.0789, -0.5155,  0.0954,
          -0.4667,  0.1089, -0.4174,  0.1206, -0.3676,  0.1299,
          -0.3174,  0.1365, -0.2669,  0.1398, -0.2162,  0.1391,
          -0.1658,  0.1347, -0.1157,  0.1271, -0.0661,  0.1169,
          -0.0170,  0.1046,  0.0316,  0.0903,  0.0791,  0.0728,
           0.1259,  0.0534,  0.1723,  0.0331,  0.2188,  0.0129,
           0.2656, -0.0064,  0.3122, -0.0263,  0.3586, -0.0466,
           0.4052, -0.0665,  0.4525, -0.0847,  0.5007, -0.1002,
           0.5497, -0.1130,  0.5991, -0.1240,  0.6491, -0.1325,
           0.6994, -0.1380,  0.7500, -0.1400
        ]
      ],
      WIND_OFFSETS = [
        {start: 0.36, end: 0.11},
        {start: 0.56, end: 0.16}
      ];

  function leaf(ctx, t, x, y, cw, s, color) {
    var a = cw / 8,
        b = a / 3,
        c = 2 * b,
        d = (t % 1) * TAU,
        e = Math.cos(d),
        f = Math.sin(d);

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = s;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.arc(x        , y        , a, d          , d + Math.PI, false);
    ctx.arc(x - b * e, y - b * f, c, d + Math.PI, d          , false);
    ctx.arc(x + c * e, y + c * f, b, d + Math.PI, d          , true );
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.stroke();
  }

  function swoosh(ctx, t, cx, cy, cw, s, index, total, color) {
    t /= 2500;

    var path = WIND_PATHS[index],
        a = (t + index - WIND_OFFSETS[index].start) % total,
        c = (t + index - WIND_OFFSETS[index].end  ) % total,
        e = (t + index                            ) % total,
        b, d, f, i;

    ctx.strokeStyle = color;
    ctx.lineWidth = s;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if(a < 1) {
      ctx.beginPath();

      a *= path.length / 2 - 1;
      b  = Math.floor(a);
      a -= b;
      b *= 2;
      b += 2;

      ctx.moveTo(
        cx + (path[b - 2] * (1 - a) + path[b    ] * a) * cw,
        cy + (path[b - 1] * (1 - a) + path[b + 1] * a) * cw
      );

      if(c < 1) {
        c *= path.length / 2 - 1;
        d  = Math.floor(c);
        c -= d;
        d *= 2;
        d += 2;

        for(i = b; i !== d; i += 2)
          ctx.lineTo(cx + path[i] * cw, cy + path[i + 1] * cw);

        ctx.lineTo(
          cx + (path[d - 2] * (1 - c) + path[d    ] * c) * cw,
          cy + (path[d - 1] * (1 - c) + path[d + 1] * c) * cw
        );
      }

      else
        for(i = b; i !== path.length; i += 2)
          ctx.lineTo(cx + path[i] * cw, cy + path[i + 1] * cw);

      ctx.stroke();
    }

    else if(c < 1) {
      ctx.beginPath();

      c *= path.length / 2 - 1;
      d  = Math.floor(c);
      c -= d;
      d *= 2;
      d += 2;

      ctx.moveTo(cx + path[0] * cw, cy + path[1] * cw);

      for(i = 2; i !== d; i += 2)
        ctx.lineTo(cx + path[i] * cw, cy + path[i + 1] * cw);

      ctx.lineTo(
        cx + (path[d - 2] * (1 - c) + path[d    ] * c) * cw,
        cy + (path[d - 1] * (1 - c) + path[d + 1] * c) * cw
      );

      ctx.stroke();
    }

    if(e < 1) {
      e *= path.length / 2 - 1;
      f  = Math.floor(e);
      e -= f;
      f *= 2;
      f += 2;

      leaf(
        ctx,
        t,
        cx + (path[f - 2] * (1 - e) + path[f    ] * e) * cw,
        cy + (path[f - 1] * (1 - e) + path[f + 1] * e) * cw,
        cw,
        s,
        color
      );
    }
  }

  var Skycons = function(opts) {
        this.list        = [];
        this.interval    = null;
        this.color       = opts && opts.color ? opts.color : "black";
        this.resizeClear = !!(opts && opts.resizeClear);
      };

  Skycons.CLEAR_DAY = function(ctx, t, color) {
    var w = ctx.canvas.width,
        h = ctx.canvas.height,
        s = Math.min(w, h);

    sun(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, color);
  };

  Skycons.CLEAR_NIGHT = function(ctx, t, color) {
    var w = ctx.canvas.width,
        h = ctx.canvas.height,
        s = Math.min(w, h);

    moon(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, color);
  };

  Skycons.PARTLY_CLOUDY_DAY = function(ctx, t, color) {
    var w = ctx.canvas.width,
        h = ctx.canvas.height,
        s = Math.min(w, h);

    sun(ctx, t, w * 0.625, h * 0.375, s * 0.75, s * STROKE, color);
    cloud(ctx, t, w * 0.375, h * 0.625, s * 0.75, s * STROKE, color);
  };

  Skycons.PARTLY_CLOUDY_NIGHT = function(ctx, t, color) {
    var w = ctx.canvas.width,
        h = ctx.canvas.height,
        s = Math.min(w, h);

    moon(ctx, t, w * 0.667, h * 0.375, s * 0.75, s * STROKE, color);
    cloud(ctx, t, w * 0.375, h * 0.625, s * 0.75, s * STROKE, color);
  };

  Skycons.CLOUDY = function(ctx, t, color) {
    var w = ctx.canvas.width,
        h = ctx.canvas.height,
        s = Math.min(w, h);

    cloud(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, color);
  };

  Skycons.RAIN = function(ctx, t, color) {
    var w = ctx.canvas.width,
        h = ctx.canvas.height,
        s = Math.min(w, h);

    rain(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
    cloud(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
  };

  Skycons.SLEET = function(ctx, t, color) {
    var w = ctx.canvas.width,
        h = ctx.canvas.height,
        s = Math.min(w, h);

    sleet(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
    cloud(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
  };

  Skycons.SNOW = function(ctx, t, color) {
    var w = ctx.canvas.width,
        h = ctx.canvas.height,
        s = Math.min(w, h);

    snow(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
    cloud(ctx, t, w * 0.5, h * 0.37, s * 0.9, s * STROKE, color);
  };

  Skycons.WIND = function(ctx, t, color) {
    var w = ctx.canvas.width,
        h = ctx.canvas.height,
        s = Math.min(w, h);

    swoosh(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, 0, 2, color);
    swoosh(ctx, t, w * 0.5, h * 0.5, s, s * STROKE, 1, 2, color);
  };

  Skycons.FOG = function(ctx, t, color) {
    var w = ctx.canvas.width,
        h = ctx.canvas.height,
        s = Math.min(w, h),
        k = s * STROKE;

    fogbank(ctx, t, w * 0.5, h * 0.32, s * 0.75, k, color);

    t /= 5000;

    var a = Math.cos((t       ) * TAU) * s * 0.02,
        b = Math.cos((t + 0.25) * TAU) * s * 0.02,
        c = Math.cos((t + 0.50) * TAU) * s * 0.02,
        d = Math.cos((t + 0.75) * TAU) * s * 0.02,
        n = h * 0.936,
        e = Math.floor(n - k * 0.5) + 0.5,
        f = Math.floor(n - k * 2.5) + 0.5;

    ctx.strokeStyle = color;
    ctx.lineWidth = k;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    line(ctx, a + w * 0.2 + k * 0.5, e, b + w * 0.8 - k * 0.5, e);
    line(ctx, c + w * 0.2 + k * 0.5, f, d + w * 0.8 - k * 0.5, f);
  };

  Skycons.prototype = {
    _determineDrawingFunction: function(draw) {
      if(typeof draw === "string")
        draw = Skycons[draw.toUpperCase().replace(/-/g, "_")] || null;

      return draw;
    },
    add: function(el, draw) {
      var obj;

      if(typeof el === "string")
        el = document.getElementById(el);

      // Does nothing if canvas name doesn't exists
      if(el === null)
        return;

      draw = this._determineDrawingFunction(draw);

      // Does nothing if the draw function isn't actually a function
      if(typeof draw !== "function")
        return;

      obj = {
        element: el,
        context: el.getContext("2d"),
        drawing: draw
      };

      this.list.push(obj);
      this.draw(obj, KEYFRAME);
    },
    set: function(el, draw) {
      var i;

      if(typeof el === "string")
        el = document.getElementById(el);

      for(i = this.list.length; i--; )
        if(this.list[i].element === el) {
          this.list[i].drawing = this._determineDrawingFunction(draw);
          this.draw(this.list[i], KEYFRAME);
          return;
        }

      this.add(el, draw);
    },
    remove: function(el) {
      var i;

      if(typeof el === "string")
        el = document.getElementById(el);

      for(i = this.list.length; i--; )
        if(this.list[i].element === el) {
          this.list.splice(i, 1);
          return;
        }
    },
    draw: function(obj, time) {
      var canvas = obj.context.canvas;

      if(this.resizeClear)
        canvas.width = canvas.width;

      else
        obj.context.clearRect(0, 0, canvas.width, canvas.height);

      obj.drawing(obj.context, time, this.color);
    },
    play: function() {
      var self = this;

      this.pause();
      this.interval = requestInterval(function() {
        var now = Date.now(),
            i;

        for(i = self.list.length; i--; )
          self.draw(self.list[i], now);
      }, 1000 / 60);
    },
    pause: function() {
      var i;

      if(this.interval) {
        cancelInterval(this.interval);
        this.interval = null;
      }
    }
  };

  global.Skycons = Skycons;
}(this));
/*!
 * Pikaday
 *
 * Copyright © 2014 David Bushell | BSD & MIT license | https://github.com/Pikaday/Pikaday
 */

(function (root, factory)
{
    'use strict';

    var moment;
    if (typeof exports === 'object') {
        // CommonJS module
        // Load moment.js as an optional dependency
        try { moment = require('moment'); } catch (e) {}
        module.exports = factory(moment);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function (req)
        {
            // Load moment.js as an optional dependency
            var id = 'moment';
            try { moment = req(id); } catch (e) {}
            return factory(moment);
        });
    } else {
        root.Pikaday = factory(root.moment);
    }
}(this, function (moment)
{
    'use strict';

    /**
     * feature detection and helper functions
     */
    var hasMoment = typeof moment === 'function',

    hasEventListeners = !!window.addEventListener,

    document = window.document,

    sto = window.setTimeout,

    addEvent = function(el, e, callback, capture)
    {
        if (hasEventListeners) {
            el.addEventListener(e, callback, !!capture);
        } else {
            el.attachEvent('on' + e, callback);
        }
    },

    removeEvent = function(el, e, callback, capture)
    {
        if (hasEventListeners) {
            el.removeEventListener(e, callback, !!capture);
        } else {
            el.detachEvent('on' + e, callback);
        }
    },

    trim = function(str)
    {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g,'');
    },

    hasClass = function(el, cn)
    {
        return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
    },

    addClass = function(el, cn)
    {
        if (!hasClass(el, cn)) {
            el.className = (el.className === '') ? cn : el.className + ' ' + cn;
        }
    },

    removeClass = function(el, cn)
    {
        el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
    },

    isArray = function(obj)
    {
        return (/Array/).test(Object.prototype.toString.call(obj));
    },

    isDate = function(obj)
    {
        return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
    },

    isWeekend = function(date)
    {
        var day = date.getDay();
        return day === 0 || day === 6;
    },

    isLeapYear = function(year)
    {
        // solution lifted from date.js (MIT license): https://github.com/datejs/Datejs
        return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
    },

    getDaysInMonth = function(year, month)
    {
        return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    },

    setToStartOfDay = function(date)
    {
        if (isDate(date)) date.setHours(0,0,0,0);
    },

    compareDates = function(a,b)
    {
        // weak date comparison (use setToStartOfDay(date) to ensure correct result)
        return a.getTime() === b.getTime();
    },

    extend = function(to, from, overwrite)
    {
        var prop, hasProp;
        for (prop in from) {
            hasProp = to[prop] !== undefined;
            if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
                if (isDate(from[prop])) {
                    if (overwrite) {
                        to[prop] = new Date(from[prop].getTime());
                    }
                }
                else if (isArray(from[prop])) {
                    if (overwrite) {
                        to[prop] = from[prop].slice(0);
                    }
                } else {
                    to[prop] = extend({}, from[prop], overwrite);
                }
            } else if (overwrite || !hasProp) {
                to[prop] = from[prop];
            }
        }
        return to;
    },

    fireEvent = function(el, eventName, data)
    {
        var ev;

        if (document.createEvent) {
            ev = document.createEvent('HTMLEvents');
            ev.initEvent(eventName, true, false);
            ev = extend(ev, data);
            el.dispatchEvent(ev);
        } else if (document.createEventObject) {
            ev = document.createEventObject();
            ev = extend(ev, data);
            el.fireEvent('on' + eventName, ev);
        }
    },

    adjustCalendar = function(calendar) {
        if (calendar.month < 0) {
            calendar.year -= Math.ceil(Math.abs(calendar.month)/12);
            calendar.month += 12;
        }
        if (calendar.month > 11) {
            calendar.year += Math.floor(Math.abs(calendar.month)/12);
            calendar.month -= 12;
        }
        return calendar;
    },

    /**
     * defaults and localisation
     */
    defaults = {

        // bind the picker to a form field
        field: null,

        // automatically show/hide the picker on `field` focus (default `true` if `field` is set)
        bound: undefined,

        // data-attribute on the input field with an aria assistance text (only applied when `bound` is set)
        ariaLabel: 'Use the arrow keys to pick a date',

        // position of the datepicker, relative to the field (default to bottom & left)
        // ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
        position: 'bottom left',

        // automatically fit in the viewport even if it means repositioning from the position option
        reposition: true,

        // the default output format for `.toString()` and `field` value
        format: 'YYYY-MM-DD',

        // the toString function which gets passed a current date object and format
        // and returns a string
        toString: null,

        // used to create date object from current input string
        parse: null,

        // the initial date to view when first opened
        defaultDate: null,

        // make the `defaultDate` the initial selected value
        setDefaultDate: false,

        // first day of week (0: Sunday, 1: Monday etc)
        firstDay: 0,

        // minimum number of days in the week that gets week number one
        // default ISO 8601, week 01 is the week with the first Thursday (4)
        firstWeekOfYearMinDays: 4,

        // the default flag for moment's strict date parsing
        formatStrict: false,

        // the minimum/earliest date that can be selected
        minDate: null,
        // the maximum/latest date that can be selected
        maxDate: null,

        // number of years either side, or array of upper/lower range
        yearRange: 10,

        // show week numbers at head of row
        showWeekNumber: false,

        // Week picker mode
        pickWholeWeek: false,

        // used internally (don't config outside)
        minYear: 0,
        maxYear: 9999,
        minMonth: undefined,
        maxMonth: undefined,

        startRange: null,
        endRange: null,

        isRTL: false,

        // Additional text to append to the year in the calendar title
        yearSuffix: '',

        // Render the month after year in the calendar title
        showMonthAfterYear: false,

        // Render days of the calendar grid that fall in the next or previous month
        showDaysInNextAndPreviousMonths: false,

        // Allows user to select days that fall in the next or previous month
        enableSelectionDaysInNextAndPreviousMonths: false,

        // how many months are visible
        numberOfMonths: 1,

        // when numberOfMonths is used, this will help you to choose where the main calendar will be (default `left`, can be set to `right`)
        // only used for the first display or when a selected date is not visible
        mainCalendar: 'left',

        // Specify a DOM element to render the calendar in
        container: undefined,

        // Blur field when date is selected
        blurFieldOnSelect : true,

        // internationalization
        i18n: {
            previousMonth : 'Previous Month',
            nextMonth     : 'Next Month',
            months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
            weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        },

        // Theme Classname
        theme: null,

        // events array
        events: [],

        // callback function
        onSelect: null,
        onOpen: null,
        onClose: null,
        onDraw: null,

        // Enable keyboard input
        keyboardInput: true
    },


    /**
     * templating functions to abstract HTML rendering
     */
    renderDayName = function(opts, day, abbr)
    {
        day += opts.firstDay;
        while (day >= 7) {
            day -= 7;
        }
        return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
    },

    renderDay = function(opts)
    {
        var arr = [];
        var ariaSelected = 'false';
        if (opts.isEmpty) {
            if (opts.showDaysInNextAndPreviousMonths) {
                arr.push('is-outside-current-month');

                if(!opts.enableSelectionDaysInNextAndPreviousMonths) {
                    arr.push('is-selection-disabled');
                }

            } else {
                return '<td class="is-empty"></td>';
            }
        }
        if (opts.isDisabled) {
            arr.push('is-disabled');
        }
        if (opts.isToday) {
            arr.push('is-today');
        }
        if (opts.isSelected) {
            arr.push('is-selected');
            ariaSelected = 'true';
        }
        if (opts.hasEvent) {
            arr.push('has-event');
        }
        if (opts.isInRange) {
            arr.push('is-inrange');
        }
        if (opts.isStartRange) {
            arr.push('is-startrange');
        }
        if (opts.isEndRange) {
            arr.push('is-endrange');
        }
        return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '" aria-selected="' + ariaSelected + '">' +
                 '<button class="pika-button pika-day" type="button" ' +
                    'data-pika-year="' + opts.year + '" data-pika-month="' + opts.month + '" data-pika-day="' + opts.day + '">' +
                        opts.day +
                 '</button>' +
               '</td>';
    },

    isoWeek = function(date, firstWeekOfYearMinDays) {
        // Ensure we're at the start of the day.
        date.setHours(0, 0, 0, 0);

        // Thursday in current week decides the year because January 4th
        // is always in the first week according to ISO8601.
        var yearDay        = date.getDate(),
            weekDay        = date.getDay(),
            dayInFirstWeek = firstWeekOfYearMinDays,
            dayShift       = dayInFirstWeek - 1, // counting starts at 0
            daysPerWeek    = 7,
            prevWeekDay    = function(day) { return (day + daysPerWeek - 1) % daysPerWeek; };

        // Adjust to Thursday in week 1 and count number of weeks from date to week 1.
        date.setDate(yearDay + dayShift - prevWeekDay(weekDay));

        var jan4th      = new Date(date.getFullYear(), 0, dayInFirstWeek),
            msPerDay    = 24 * 60 * 60 * 1000,
            daysBetween = (date.getTime() - jan4th.getTime()) / msPerDay,
            weekNum     = 1 + Math.round((daysBetween - dayShift + prevWeekDay(jan4th.getDay())) / daysPerWeek);

        return weekNum;
    },

    renderWeek = function (d, m, y, firstWeekOfYearMinDays) {
        var date = new Date(y, m, d),
            week = hasMoment ? moment(date).isoWeek() : isoWeek(date, firstWeekOfYearMinDays);

        return '<td class="pika-week">' + week + '</td>';
    },

    renderRow = function(days, isRTL, pickWholeWeek, isRowSelected)
    {
        return '<tr class="pika-row' + (pickWholeWeek ? ' pick-whole-week' : '') + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>';
    },

    renderBody = function(rows)
    {
        return '<tbody>' + rows.join('') + '</tbody>';
    },

    renderHead = function(opts)
    {
        var i, arr = [];
        if (opts.showWeekNumber) {
            arr.push('<th></th>');
        }
        for (i = 0; i < 7; i++) {
            arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>');
        }
        return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
    },

    renderTitle = function(instance, c, year, month, refYear, randId)
    {
        var i, j, arr,
            opts = instance._o,
            isMinYear = year === opts.minYear,
            isMaxYear = year === opts.maxYear,
            html = '<div id="' + randId + '" class="pika-title" role="heading" aria-live="assertive">',
            monthHtml,
            yearHtml,
            prev = true,
            next = true;

        for (arr = [], i = 0; i < 12; i++) {
            arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' +
                (i === month ? ' selected="selected"': '') +
                ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? ' disabled="disabled"' : '') + '>' +
                opts.i18n.months[i] + '</option>');
        }

        monthHtml = '<div class="pika-label">' + opts.i18n.months[month] + '<select class="pika-select pika-select-month" tabindex="-1">' + arr.join('') + '</select></div>';

        if (isArray(opts.yearRange)) {
            i = opts.yearRange[0];
            j = opts.yearRange[1] + 1;
        } else {
            i = year - opts.yearRange;
            j = 1 + year + opts.yearRange;
        }

        for (arr = []; i < j && i <= opts.maxYear; i++) {
            if (i >= opts.minYear) {
                arr.push('<option value="' + i + '"' + (i === year ? ' selected="selected"': '') + '>' + (i) + '</option>');
            }
        }
        yearHtml = '<div class="pika-label">' + year + opts.yearSuffix + '<select class="pika-select pika-select-year" tabindex="-1">' + arr.join('') + '</select></div>';

        if (opts.showMonthAfterYear) {
            html += yearHtml + monthHtml;
        } else {
            html += monthHtml + yearHtml;
        }

        if (isMinYear && (month === 0 || opts.minMonth >= month)) {
            prev = false;
        }

        if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
            next = false;
        }

        if (c === 0) {
            html += '<button class="pika-prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
        }
        if (c === (instance._o.numberOfMonths - 1) ) {
            html += '<button class="pika-next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';
        }

        return html += '</div>';
    },

    renderTable = function(opts, data, randId)
    {
        return '<table cellpadding="0" cellspacing="0" class="pika-table" role="grid" aria-labelledby="' + randId + '">' + renderHead(opts) + renderBody(data) + '</table>';
    },


    /**
     * Pikaday constructor
     */
    Pikaday = function(options)
    {
        var self = this,
            opts = self.config(options);

        self._onMouseDown = function(e)
        {
            if (!self._v) {
                return;
            }
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (!target) {
                return;
            }

            if (!hasClass(target, 'is-disabled')) {
                if (hasClass(target, 'pika-button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled')) {
                    self.setDate(new Date(target.getAttribute('data-pika-year'), target.getAttribute('data-pika-month'), target.getAttribute('data-pika-day')));
                    if (opts.bound) {
                        sto(function() {
                            self.hide();
                            if (opts.blurFieldOnSelect && opts.field) {
                                opts.field.blur();
                            }
                        }, 100);
                    }
                }
                else if (hasClass(target, 'pika-prev')) {
                    self.prevMonth();
                }
                else if (hasClass(target, 'pika-next')) {
                    self.nextMonth();
                }
            }
            if (!hasClass(target, 'pika-select')) {
                // if this is touch event prevent mouse events emulation
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                    return false;
                }
            } else {
                self._c = true;
            }
        };

        self._onChange = function(e)
        {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (!target) {
                return;
            }
            if (hasClass(target, 'pika-select-month')) {
                self.gotoMonth(target.value);
            }
            else if (hasClass(target, 'pika-select-year')) {
                self.gotoYear(target.value);
            }
        };

        self._onKeyChange = function(e)
        {
            e = e || window.event;

            if (self.isVisible()) {

                switch(e.keyCode){
                    case 13:
                    case 27:
                        if (opts.field) {
                            opts.field.blur();
                        }
                        break;
                    case 37:
                        self.adjustDate('subtract', 1);
                        break;
                    case 38:
                        self.adjustDate('subtract', 7);
                        break;
                    case 39:
                        self.adjustDate('add', 1);
                        break;
                    case 40:
                        self.adjustDate('add', 7);
                        break;
                    case 8:
                    case 46:
                        self.setDate(null);
                        break;
                }
            }
        };

        self._parseFieldValue = function()
        {
            if (opts.parse) {
                return opts.parse(opts.field.value, opts.format);
            } else if (hasMoment) {
                var date = moment(opts.field.value, opts.format, opts.formatStrict);
                return (date && date.isValid()) ? date.toDate() : null;
            } else {
                return new Date(Date.parse(opts.field.value));
            }
        };

        self._onInputChange = function(e)
        {
            var date;

            if (e.firedBy === self) {
                return;
            }
            date = self._parseFieldValue();
            if (isDate(date)) {
              self.setDate(date);
            }
            if (!self._v) {
                self.show();
            }
        };

        self._onInputFocus = function()
        {
            self.show();
        };

        self._onInputClick = function()
        {
            self.show();
        };

        self._onInputBlur = function()
        {
            // IE allows pika div to gain focus; catch blur the input field
            var pEl = document.activeElement;
            do {
                if (hasClass(pEl, 'pika-single')) {
                    return;
                }
            }
            while ((pEl = pEl.parentNode));

            if (!self._c) {
                self._b = sto(function() {
                    self.hide();
                }, 50);
            }
            self._c = false;
        };

        self._onClick = function(e)
        {
            e = e || window.event;
            var target = e.target || e.srcElement,
                pEl = target;
            if (!target) {
                return;
            }
            if (!hasEventListeners && hasClass(target, 'pika-select')) {
                if (!target.onchange) {
                    target.setAttribute('onchange', 'return;');
                    addEvent(target, 'change', self._onChange);
                }
            }
            do {
                if (hasClass(pEl, 'pika-single') || pEl === opts.trigger) {
                    return;
                }
            }
            while ((pEl = pEl.parentNode));
            if (self._v && target !== opts.trigger && pEl !== opts.trigger) {
                self.hide();
            }
        };

        self.el = document.createElement('div');
        self.el.className = 'pika-single' + (opts.isRTL ? ' is-rtl' : '') + (opts.theme ? ' ' + opts.theme : '');

        addEvent(self.el, 'mousedown', self._onMouseDown, true);
        addEvent(self.el, 'touchend', self._onMouseDown, true);
        addEvent(self.el, 'change', self._onChange);

        if (opts.keyboardInput) {
            addEvent(document, 'keydown', self._onKeyChange);
        }

        if (opts.field) {
            if (opts.container) {
                opts.container.appendChild(self.el);
            } else if (opts.bound) {
                document.body.appendChild(self.el);
            } else {
                opts.field.parentNode.insertBefore(self.el, opts.field.nextSibling);
            }
            addEvent(opts.field, 'change', self._onInputChange);

            if (!opts.defaultDate) {
                opts.defaultDate = self._parseFieldValue();
                opts.setDefaultDate = true;
            }
        }

        var defDate = opts.defaultDate;

        if (isDate(defDate)) {
            if (opts.setDefaultDate) {
                self.setDate(defDate, true);
            } else {
                self.gotoDate(defDate);
            }
        } else {
            self.gotoDate(new Date());
        }

        if (opts.bound) {
            this.hide();
            self.el.className += ' is-bound';
            addEvent(opts.trigger, 'click', self._onInputClick);
            addEvent(opts.trigger, 'focus', self._onInputFocus);
            addEvent(opts.trigger, 'blur', self._onInputBlur);
        } else {
            this.show();
        }
    };


    /**
     * public Pikaday API
     */
    Pikaday.prototype = {


        /**
         * configure functionality
         */
        config: function(options)
        {
            if (!this._o) {
                this._o = extend({}, defaults, true);
            }

            var opts = extend(this._o, options, true);

            opts.isRTL = !!opts.isRTL;

            opts.field = (opts.field && opts.field.nodeName) ? opts.field : null;

            opts.theme = (typeof opts.theme) === 'string' && opts.theme ? opts.theme : null;

            opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

            opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field;

            opts.disableWeekends = !!opts.disableWeekends;

            opts.disableDayFn = (typeof opts.disableDayFn) === 'function' ? opts.disableDayFn : null;

            var nom = parseInt(opts.numberOfMonths, 10) || 1;
            opts.numberOfMonths = nom > 4 ? 4 : nom;

            if (!isDate(opts.minDate)) {
                opts.minDate = false;
            }
            if (!isDate(opts.maxDate)) {
                opts.maxDate = false;
            }
            if ((opts.minDate && opts.maxDate) && opts.maxDate < opts.minDate) {
                opts.maxDate = opts.minDate = false;
            }
            if (opts.minDate) {
                this.setMinDate(opts.minDate);
            }
            if (opts.maxDate) {
                this.setMaxDate(opts.maxDate);
            }

            if (isArray(opts.yearRange)) {
                var fallback = new Date().getFullYear() - 10;
                opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
                opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
            } else {
                opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange;
                if (opts.yearRange > 100) {
                    opts.yearRange = 100;
                }
            }

            return opts;
        },

        /**
         * return a formatted string of the current selection (using Moment.js if available)
         */
        toString: function(format)
        {
            format = format || this._o.format;
            if (!isDate(this._d)) {
                return '';
            }
            if (this._o.toString) {
              return this._o.toString(this._d, format);
            }
            if (hasMoment) {
              return moment(this._d).format(format);
            }
            return this._d.toDateString();
        },

        /**
         * return a Moment.js object of the current selection (if available)
         */
        getMoment: function()
        {
            return hasMoment ? moment(this._d) : null;
        },

        /**
         * set the current selection from a Moment.js object (if available)
         */
        setMoment: function(date, preventOnSelect)
        {
            if (hasMoment && moment.isMoment(date)) {
                this.setDate(date.toDate(), preventOnSelect);
            }
        },

        /**
         * return a Date object of the current selection
         */
        getDate: function()
        {
            return isDate(this._d) ? new Date(this._d.getTime()) : null;
        },

        /**
         * set the current selection
         */
        setDate: function(date, preventOnSelect)
        {
            if (!date) {
                this._d = null;

                if (this._o.field) {
                    this._o.field.value = '';
                    fireEvent(this._o.field, 'change', { firedBy: this });
                }

                return this.draw();
            }
            if (typeof date === 'string') {
                date = new Date(Date.parse(date));
            }
            if (!isDate(date)) {
                return;
            }

            var min = this._o.minDate,
                max = this._o.maxDate;

            if (isDate(min) && date < min) {
                date = min;
            } else if (isDate(max) && date > max) {
                date = max;
            }

            this._d = new Date(date.getTime());
            setToStartOfDay(this._d);
            this.gotoDate(this._d);

            if (this._o.field) {
                this._o.field.value = this.toString();
                fireEvent(this._o.field, 'change', { firedBy: this });
            }
            if (!preventOnSelect && typeof this._o.onSelect === 'function') {
                this._o.onSelect.call(this, this.getDate());
            }
        },

        /**
         * clear and reset the date
         */
        clear: function()
        {
            this.setDate(null);
        },

        /**
         * change view to a specific date
         */
        gotoDate: function(date)
        {
            var newCalendar = true;

            if (!isDate(date)) {
                return;
            }

            if (this.calendars) {
                var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
                    lastVisibleDate = new Date(this.calendars[this.calendars.length-1].year, this.calendars[this.calendars.length-1].month, 1),
                    visibleDate = date.getTime();
                // get the end of the month
                lastVisibleDate.setMonth(lastVisibleDate.getMonth()+1);
                lastVisibleDate.setDate(lastVisibleDate.getDate()-1);
                newCalendar = (visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate);
            }

            if (newCalendar) {
                this.calendars = [{
                    month: date.getMonth(),
                    year: date.getFullYear()
                }];
                if (this._o.mainCalendar === 'right') {
                    this.calendars[0].month += 1 - this._o.numberOfMonths;
                }
            }

            this.adjustCalendars();
        },

        adjustDate: function(sign, days) {

            var day = this.getDate() || new Date();
            var difference = parseInt(days)*24*60*60*1000;

            var newDay;

            if (sign === 'add') {
                newDay = new Date(day.valueOf() + difference);
            } else if (sign === 'subtract') {
                newDay = new Date(day.valueOf() - difference);
            }

            this.setDate(newDay);
        },

        adjustCalendars: function() {
            this.calendars[0] = adjustCalendar(this.calendars[0]);
            for (var c = 1; c < this._o.numberOfMonths; c++) {
                this.calendars[c] = adjustCalendar({
                    month: this.calendars[0].month + c,
                    year: this.calendars[0].year
                });
            }
            this.draw();
        },

        gotoToday: function()
        {
            this.gotoDate(new Date());
        },

        /**
         * change view to a specific month (zero-index, e.g. 0: January)
         */
        gotoMonth: function(month)
        {
            if (!isNaN(month)) {
                this.calendars[0].month = parseInt(month, 10);
                this.adjustCalendars();
            }
        },

        nextMonth: function()
        {
            this.calendars[0].month++;
            this.adjustCalendars();
        },

        prevMonth: function()
        {
            this.calendars[0].month--;
            this.adjustCalendars();
        },

        /**
         * change view to a specific full year (e.g. "2012")
         */
        gotoYear: function(year)
        {
            if (!isNaN(year)) {
                this.calendars[0].year = parseInt(year, 10);
                this.adjustCalendars();
            }
        },

        /**
         * change the minDate
         */
        setMinDate: function(value)
        {
            if(value instanceof Date) {
                setToStartOfDay(value);
                this._o.minDate = value;
                this._o.minYear  = value.getFullYear();
                this._o.minMonth = value.getMonth();
            } else {
                this._o.minDate = defaults.minDate;
                this._o.minYear  = defaults.minYear;
                this._o.minMonth = defaults.minMonth;
                this._o.startRange = defaults.startRange;
            }

            this.draw();
        },

        /**
         * change the maxDate
         */
        setMaxDate: function(value)
        {
            if(value instanceof Date) {
                setToStartOfDay(value);
                this._o.maxDate = value;
                this._o.maxYear = value.getFullYear();
                this._o.maxMonth = value.getMonth();
            } else {
                this._o.maxDate = defaults.maxDate;
                this._o.maxYear = defaults.maxYear;
                this._o.maxMonth = defaults.maxMonth;
                this._o.endRange = defaults.endRange;
            }

            this.draw();
        },

        setStartRange: function(value)
        {
            this._o.startRange = value;
        },

        setEndRange: function(value)
        {
            this._o.endRange = value;
        },

        /**
         * refresh the HTML
         */
        draw: function(force)
        {
            if (!this._v && !force) {
                return;
            }
            var opts = this._o,
                minYear = opts.minYear,
                maxYear = opts.maxYear,
                minMonth = opts.minMonth,
                maxMonth = opts.maxMonth,
                html = '',
                randId;

            if (this._y <= minYear) {
                this._y = minYear;
                if (!isNaN(minMonth) && this._m < minMonth) {
                    this._m = minMonth;
                }
            }
            if (this._y >= maxYear) {
                this._y = maxYear;
                if (!isNaN(maxMonth) && this._m > maxMonth) {
                    this._m = maxMonth;
                }
            }

            for (var c = 0; c < opts.numberOfMonths; c++) {
                randId = 'pika-title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);
                html += '<div class="pika-lendar">' + renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId) + '</div>';
            }

            this.el.innerHTML = html;

            if (opts.bound) {
                if(opts.field.type !== 'hidden') {
                    sto(function() {
                        opts.trigger.focus();
                    }, 1);
                }
            }

            if (typeof this._o.onDraw === 'function') {
                this._o.onDraw(this);
            }

            if (opts.bound) {
                // let the screen reader user know to use arrow keys
                opts.field.setAttribute('aria-label', opts.ariaLabel);
            }
        },

        adjustPosition: function()
        {
            var field, pEl, width, height, viewportWidth, viewportHeight, scrollTop, left, top, clientRect, leftAligned, bottomAligned;

            if (this._o.container) return;

            this.el.style.position = 'absolute';

            field = this._o.trigger;
            pEl = field;
            width = this.el.offsetWidth;
            height = this.el.offsetHeight;
            viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
            leftAligned = true;
            bottomAligned = true;

            if (typeof field.getBoundingClientRect === 'function') {
                clientRect = field.getBoundingClientRect();
                left = clientRect.left + window.pageXOffset;
                top = clientRect.bottom + window.pageYOffset;
            } else {
                left = pEl.offsetLeft;
                top  = pEl.offsetTop + pEl.offsetHeight;
                while((pEl = pEl.offsetParent)) {
                    left += pEl.offsetLeft;
                    top  += pEl.offsetTop;
                }
            }

            // default position is bottom & left
            if ((this._o.reposition && left + width > viewportWidth) ||
                (
                    this._o.position.indexOf('right') > -1 &&
                    left - width + field.offsetWidth > 0
                )
            ) {
                left = left - width + field.offsetWidth;
                leftAligned = false;
            }
            if ((this._o.reposition && top + height > viewportHeight + scrollTop) ||
                (
                    this._o.position.indexOf('top') > -1 &&
                    top - height - field.offsetHeight > 0
                )
            ) {
                top = top - height - field.offsetHeight;
                bottomAligned = false;
            }

            if (left < 0) {
                left = 0;
            }

            if (top < 0) {
                top = 0;
            }

            this.el.style.left = left + 'px';
            this.el.style.top = top + 'px';

            addClass(this.el, leftAligned ? 'left-aligned' : 'right-aligned');
            addClass(this.el, bottomAligned ? 'bottom-aligned' : 'top-aligned');
            removeClass(this.el, !leftAligned ? 'left-aligned' : 'right-aligned');
            removeClass(this.el, !bottomAligned ? 'bottom-aligned' : 'top-aligned');
        },

        /**
         * render HTML for a particular month
         */
        render: function(year, month, randId)
        {
            var opts   = this._o,
                now    = new Date(),
                days   = getDaysInMonth(year, month),
                before = new Date(year, month, 1).getDay(),
                data   = [],
                row    = [];
            setToStartOfDay(now);
            if (opts.firstDay > 0) {
                before -= opts.firstDay;
                if (before < 0) {
                    before += 7;
                }
            }
            var previousMonth = month === 0 ? 11 : month - 1,
                nextMonth = month === 11 ? 0 : month + 1,
                yearOfPreviousMonth = month === 0 ? year - 1 : year,
                yearOfNextMonth = month === 11 ? year + 1 : year,
                daysInPreviousMonth = getDaysInMonth(yearOfPreviousMonth, previousMonth);
            var cells = days + before,
                after = cells;
            while(after > 7) {
                after -= 7;
            }
            cells += 7 - after;
            var isWeekSelected = false;
            for (var i = 0, r = 0; i < cells; i++)
            {
                var day = new Date(year, month, 1 + (i - before)),
                    isSelected = isDate(this._d) ? compareDates(day, this._d) : false,
                    isToday = compareDates(day, now),
                    hasEvent = opts.events.indexOf(day.toDateString()) !== -1 ? true : false,
                    isEmpty = i < before || i >= (days + before),
                    dayNumber = 1 + (i - before),
                    monthNumber = month,
                    yearNumber = year,
                    isStartRange = opts.startRange && compareDates(opts.startRange, day),
                    isEndRange = opts.endRange && compareDates(opts.endRange, day),
                    isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange,
                    isDisabled = (opts.minDate && day < opts.minDate) ||
                                 (opts.maxDate && day > opts.maxDate) ||
                                 (opts.disableWeekends && isWeekend(day)) ||
                                 (opts.disableDayFn && opts.disableDayFn(day));

                if (isEmpty) {
                    if (i < before) {
                        dayNumber = daysInPreviousMonth + dayNumber;
                        monthNumber = previousMonth;
                        yearNumber = yearOfPreviousMonth;
                    } else {
                        dayNumber = dayNumber - days;
                        monthNumber = nextMonth;
                        yearNumber = yearOfNextMonth;
                    }
                }

                var dayConfig = {
                        day: dayNumber,
                        month: monthNumber,
                        year: yearNumber,
                        hasEvent: hasEvent,
                        isSelected: isSelected,
                        isToday: isToday,
                        isDisabled: isDisabled,
                        isEmpty: isEmpty,
                        isStartRange: isStartRange,
                        isEndRange: isEndRange,
                        isInRange: isInRange,
                        showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths,
                        enableSelectionDaysInNextAndPreviousMonths: opts.enableSelectionDaysInNextAndPreviousMonths
                    };

                if (opts.pickWholeWeek && isSelected) {
                    isWeekSelected = true;
                }

                row.push(renderDay(dayConfig));

                if (++r === 7) {
                    if (opts.showWeekNumber) {
                        row.unshift(renderWeek(i - before, month, year, opts.firstWeekOfYearMinDays));
                    }
                    data.push(renderRow(row, opts.isRTL, opts.pickWholeWeek, isWeekSelected));
                    row = [];
                    r = 0;
                    isWeekSelected = false;
                }
            }
            return renderTable(opts, data, randId);
        },

        isVisible: function()
        {
            return this._v;
        },

        show: function()
        {
            if (!this.isVisible()) {
                this._v = true;
                this.draw();
                removeClass(this.el, 'is-hidden');
                if (this._o.bound) {
                    addEvent(document, 'click', this._onClick);
                    this.adjustPosition();
                }
                if (typeof this._o.onOpen === 'function') {
                    this._o.onOpen.call(this);
                }
            }
        },

        hide: function()
        {
            var v = this._v;
            if (v !== false) {
                if (this._o.bound) {
                    removeEvent(document, 'click', this._onClick);
                }

                if (!this._o.container) {
                    this.el.style.position = 'static'; // reset
                    this.el.style.left = 'auto';
                    this.el.style.top = 'auto';
                }
                addClass(this.el, 'is-hidden');
                this._v = false;
                if (v !== undefined && typeof this._o.onClose === 'function') {
                    this._o.onClose.call(this);
                }
            }
        },

        /**
         * GAME OVER
         */
        destroy: function()
        {
            var opts = this._o;

            this.hide();
            removeEvent(this.el, 'mousedown', this._onMouseDown, true);
            removeEvent(this.el, 'touchend', this._onMouseDown, true);
            removeEvent(this.el, 'change', this._onChange);
            if (opts.keyboardInput) {
                removeEvent(document, 'keydown', this._onKeyChange);
            }
            if (opts.field) {
                removeEvent(opts.field, 'change', this._onInputChange);
                if (opts.bound) {
                    removeEvent(opts.trigger, 'click', this._onInputClick);
                    removeEvent(opts.trigger, 'focus', this._onInputFocus);
                    removeEvent(opts.trigger, 'blur', this._onInputBlur);
                }
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
        }

    };

    return Pikaday;
}));

if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}

const controls = document.querySelector(".page__menu");
const links = controls.querySelectorAll(".menu__link");
const addSity = document.querySelector(".add-sity");
const wayfull = document.querySelector(".wayfull");
const lookWay = document.querySelector(".add-sity__look")
const pages = document.querySelectorAll(".js-page");
const arrLinks = [links[0].textContent, links[1].textContent, links[2].textContent, links[3].textContent];
const buttonWay = document.querySelector(".button-way__button");

const activeLink = {
  node: pages[0]
};

function setActiveLink(e) {
  e.preventDefault();
  Array.from(links, elem => elem.classList.remove("menu__link--active"));
  let elem = e.target;

  if (!elem.classList.contains("menu__link")) {
    return false;
  }

  elem.classList.add("menu__link--active");

  activeLink.node = pages[arrLinks.indexOf(elem.textContent)];
  activeLink.node.classList.add("js-block");
  wayfull.classList.remove("js-block");
}

function goAddWay(e) {
  //e.preventDefault();
  let elem = links[3];
  if(!elem.classList.contains("menu__link--active")) {
     Array.from(links, elem => elem.classList.remove("menu__link--active"));
     elem.classList.add("menu__link--active");
  }
  activeLink.node.classList.remove("js-block");
  activeLink.node = pages[3];
  activeLink.node.classList.add("js-block");
  wayfull.classList.remove("js-block");

}

const removeActiveLink = event => {
    event.preventDefault();

       activeLink.node.classList.remove("js-block");

};

const activeWayFullLink = event => {
    event.preventDefault();
    addSity.classList.remove("js-block");
    wayfull.classList.add("js-block");
};


buttonWay.addEventListener("click", goAddWay);
controls.addEventListener("click", removeActiveLink);
controls.addEventListener("click", setActiveLink);
lookWay.addEventListener("click", activeWayFullLink);
const inputCity = document.getElementById("search-city");
const autocomplete = new google.maps.places.Autocomplete(inputCity, {
    types: ["(cities)"]
});
const currentPlace = document.getElementById("header-visual__city");

// координаты Киева
const positions = {
           latPositions: '',
           lngPositions: '',
           sityFullName: 'Киев, Украина',
           sityName: 'Киев',
           count: 1
         };

const addsitySity = document.querySelector(".add-sity__sity");

google.maps.event.addListener(autocomplete, "place_changed", function () {
    // в этой переменной получаем объект город
    const place = autocomplete.getPlace();

    // -------------------- отладочный блок -------------------
    console.log(place);

    currentPlace.textContent = place.name;

    positions.latPositions = place.geometry.location.lat();
    positions.lngPositions = place.geometry.location.lng();
    positions.sityFullName = place.formatted_address;
    positions.sityName = place.name;

    if(inputTime === undefined || weatherWay.start !== undefined) {
          weatherWay.start.lat = place.geometry.location.lat();
          weatherWay.start.lng = place.geometry.location.lng();
          weatherWay.start.sityName = place.name;
    }

    addsitySity.textContent = positions.sityFullName;

    console.log(place.formatted_address);
    getWeather(positions.latPositions, positions.lngPositions, 'ru');
    addLocStor();
})
let weather = {
        now: {
          icon: '',
          temperature: '',
          description: ''
        },
        today: {
          header: {},
          body: []
        },
        tomorrow: {
          header: {},
          body: []
        },
        weekend: {
          saturday: {
            header: {},
            body: []
          },
          sunday: {
            header: {},
            body: []
            }
          }
        }

// Загружаем погоду в Киеве (по умолчанию)
getWeather(50.4501, 30.523400000000038, 'ru');

function getWeather(lat, lng, lang) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    //console.log(this.readyState == 4 && this.status == 200);
    if (this.readyState == 4 && this.status == 200) {

      function Header(time) {
        let date = getDate(time);
        this.weekday = date.toLocaleString(lang, {weekday: 'long'});
        this.date = date.toLocaleString(lang, {day: '2-digit', month: 'long', year: 'numeric'});
        //this.date = date.toLocaleString(lang, {day: '2-digit', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric'});
      }

      function WeatherStr(title, icon, precipType, temperature, description) {
        this.title = title;
        this.icon = icon;
        this.precipType = precipType;
        if(temperature > 0) {
           this.temperature = '+' + Math.round(temperature);
        } else {
           this.temperature = Math.round(temperature);
        }

        this.description = description;
      }

      const myWeather = JSON.parse(this.responseText);
      //console.log(myWeather.current.weather[0].icon);

      // погода сейчас
      weather.now.icon = myWeather.current.weather[0].icon;
      weather.now.description = myWeather.current.weather[0].description;
      if(myWeather.current.temp > 0) {
         weather.now.temperature = `+${Math.round(myWeather.current.temp)}`;
      } else {
         weather.now.temperature = Math.round(myWeather.current.temp);
      }

      // погода сегодня
      const nextDayIndex = 24 - getDate(myWeather.hourly[0].dt).getHours();

      weather.today.header = new Header(myWeather.hourly[0].dt);

      const srcArrToday = myWeather.hourly.slice(0, nextDayIndex + 1);

      // погода сегодня - шаг 2 часа
      let arrToday = [];

      srcArrToday.forEach((el, i) => arrToday[i] = new WeatherStr(getDate(el.dt).toLocaleString(lang, {hour: '2-digit'}), el.weather[0].icon, el.weather[0].main, Math.round(el.temp), el.weather[0].description));

      weather.today.body = arrToday.filter(n => n.title % 2 === 0).map(el => new WeatherStr(el.title + ':00', el.icon, el.precipType, el.temperature, el.description));

      weather.today.body[weather.today.body.length - 1].title = '24:00';

      // погода завтра
      weather.tomorrow.header = new Header(myWeather.hourly[nextDayIndex].dt);
      const srcArrTomorrow = myWeather.hourly.slice(nextDayIndex, nextDayIndex + 25);
      const nightPeriod = srcArrTomorrow[2];
      const morningPeriod = srcArrTomorrow[8];
      const dayPeriod = srcArrTomorrow[14];
      const eveningPeriod = srcArrTomorrow[20];
      const srcArrTomorrowLite = [nightPeriod, morningPeriod, dayPeriod, eveningPeriod];
      const periods = ['Ночь', 'Утро', 'День', 'Вечер'];
      srcArrTomorrowLite.forEach((el, i) => weather.tomorrow.body[i] = new WeatherStr(periods[i], el.weather[0].icon, el.weather[0].main, Math.round(el.temp), el.weather[0].description));
      /*srcArrTomorrow.forEach((el, i) => weather.tomorrow.body[i] = new WeatherStr(getDate(el.time).toLocaleString(lang, {hour: '2-digit', minute: '2-digit'}), el.icon, el.precipType, Math.round(el.temperature), el.summary));*/

      // погода на выходные
      let dayWeek = getDate(myWeather.hourly[0].dt).getDay();
      //let dayWeek = 6;

      let daysBeforeSaturday;
      if(dayWeek < 6) {
         daysBeforeSaturday = 6 - dayWeek;
      } else if(dayWeek === 6) {
         daysBeforeSaturday = 0;
      }

      let daysBeforeSunday;
      if(dayWeek < 7) {
         daysBeforeSunday = 7 - dayWeek;
      } else if(dayWeek === 0) {
          daysBeforeSunday = 0;
          sundayHide();
      }

      let saturdayHours = nextDayIndex + daysBeforeSaturday*24;
      let sundayHours = nextDayIndex + daysBeforeSunday*24;

      weather.weekend.saturday.header = new Header(myWeather.daily[daysBeforeSaturday].dt);
      weather.weekend.sunday.header = new Header(myWeather.daily[daysBeforeSunday].dt);

      // погода на выходные - Суббота
      let srcArrSaturday = myWeather.daily[daysBeforeSaturday];

      const nightSaturday = {
        time: srcArrSaturday.dt,
        icon: srcArrSaturday.weather[0].icon,
        precipType: srcArrSaturday.weather[0].main,
        temperature: srcArrSaturday.temp.night,
        summary: srcArrSaturday.weather[0].description
      };
      const morningSaturday = {
        time: srcArrSaturday.dt,
        icon: srcArrSaturday.weather[0].icon,
        precipType: srcArrSaturday.weather[0].main,
        temperature: srcArrSaturday.temp.morn,
        summary: srcArrSaturday.weather[0].description
      };
      const daySaturday = {
        time: srcArrSaturday.dt,
        icon: srcArrSaturday.weather[0].icon,
        precipType: srcArrSaturday.weather[0].main,
        temperature: srcArrSaturday.temp.day,
        summary: srcArrSaturday.weather[0].description
      };
      const eveningSaturday = {
        time: srcArrSaturday.dt,
        icon: srcArrSaturday.weather[0].icon,
        precipType: srcArrSaturday.weather[0].main,
        temperature: srcArrSaturday.temp.eve,
        summary: srcArrSaturday.weather[0].description
      };
      const srcArrSaturdayLite = [nightSaturday, morningSaturday, daySaturday, eveningSaturday];

      srcArrSaturdayLite.forEach((el, i) => weather.weekend.saturday.body[i] = new WeatherStr(periods[i], el.icon, el.precipType, Math.round(el.temperature), el.summary));
      /*srcArrSaturday.forEach((el, i) => weather.weekend.saturday.body[i] = new WeatherStr(getDate(el.time).toLocaleString(lang, {hour: '2-digit', minute: '2-digit'}), el.icon, el.precipType, Math.round(el.temperature), el.summary));*/

      // погода на выходные - Воскресенье
      const srcArrSunday = myWeather.daily[daysBeforeSunday];

      const nightSunday = {
        time: srcArrSunday.dt,
        icon: srcArrSunday.weather[0].icon,
        precipType: srcArrSunday.weather[0].main,
        temperature: srcArrSunday.temp.night,
        summary: srcArrSunday.weather[0].description
      };
      const morningSunday = {
        time: srcArrSunday.dt,
        icon: srcArrSunday.weather[0].icon,
        precipType: srcArrSunday.weather[0].main,
        temperature: srcArrSunday.temp.morn,
        summary: srcArrSunday.weather[0].description
      };
      const daySunday = {
        time: srcArrSunday.dt,
        icon: srcArrSunday.weather[0].icon,
        precipType: srcArrSunday.weather[0].main,
        temperature: srcArrSunday.temp.day,
        summary: srcArrSunday.weather[0].description
      };
      const eveningSunday = {
        time: srcArrSunday.dt,
        icon: srcArrSunday.weather[0].icon,
        precipType: srcArrSunday.weather[0].main,
        temperature: srcArrSunday.temp.eve,
        summary: srcArrSunday.weather[0].description
      };
      const srcArrSundayLite = [nightSunday, morningSunday, daySunday, eveningSunday];

      srcArrSundayLite.forEach((el, i) => weather.weekend.sunday.body[i] = new WeatherStr(periods[i], el.icon, el.precipType, Math.round(el.temperature), el.summary));

      // получение даты из числа в ответе API
      function getDate(time) {

        let date = new Date(1000 * time);

        return date;
      }

      //иконка в хедере
      iconWeather();
      //текст "Сейчас за окном"
      textWeather();

      // Компилируем шаблоны
       headerTemplate();
       todayHeaderTemplate();
       todayTemplate();
       tomorrowHeaderTemplate();
       tomorrowTemplate();
       saturdayHeaderTemplate();
       saturdayTemplate();
       sundayHeaderTemplate();
       sundayTemplate();

       // Иконки в page
       iconTodayWeather();
       iconTomorowWeather();
       iconWeekendWeather();

    } //if ends
  } //onready end

  //const address = 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/606d16650a24656a795100b26c1b1a3e/' + lat + ',' + lng + '?extend=hourly&lang=' + lang + '&units=si';

  const address = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&lang=${lang}&units=metric&appid=1f2df059e0dcefe5b9990d6851316f83`;

  request.open('GET', address, true);
  request.send();

    //return weather;
}
const firstSity = document.querySelector(".js-firstSity");
const secondSity = document.querySelector(".js-secondSity");
const thirdSity = document.querySelector(".js-thirdSity");
const fourthSity = document.querySelector(".js-fourthSity");
const fifthSity = document.querySelector(".js-fifthSity");

const citysFavorite = {

           firstSity: {
             sityFullName: 'Киев, Украина',
             sityName: 'Киев',
             lat: '50.4501',
             lng: '30.523400000000038'
           },

            secondSity: {
             sityFullName: 'Днипро, Днепропетровская область, Украина',
             sityName: 'Днипро',
             lat: '48.46471700000001',
             lng: '35.04618299999993'
           },

           thirdSity: {
             sityFullName: 'Львов, Львовская область, Украина',
             sityName: 'Львов',
             lat: '49.83968300000001',
             lng: '24.029717000000005'
           },

           fourthSity: {
             sityFullName: 'Харьков, Харьковская область, Украина',
             sityName: 'Харьков',
             lat: '49.9935',
             lng: '36.230383000000074'
           },

           fifthSity: {
             sityFullName: 'Одесса, Одесская область, Украина',
             sityName: 'Одесса',
             lat: '46.482526',
             lng: '30.723309500000028'
           }

         };

const addLocStorStart = () => {

  let arrListCitys = [];
  let lsLen = localStorage.length;
  if(lsLen > 0){
      for(let i = 0; i < lsLen; i++){
        let key = localStorage.key(i);
        arrListCitys.push(JSON.parse(localStorage.getItem(key)));
      }
  }

  const sortNames = arrListCitys.reduce(
    (o, v, count) => {

        let index = o.findIndex(el => el.count < v.count);
        return ((index > -1) ? o.splice(index, 0, v) : o.push(v)), o;

    }, []);

  changeFavoriteCitys(sortNames);

};

addLocStorStart();

const addLocStor = () => {

  if(localStorage.getItem(positions.sityName) !== null) {
     positions.count = JSON.parse(localStorage.getItem(positions.sityName)).count + 1;
  } else {
     positions.count = 1;
  }

  localStorage.setItem(positions.sityName,  JSON.stringify(positions));

  let arrListCitys = [];
  let lsLen = localStorage.length;
  if(lsLen > 0){
      for(let i = 0; i < lsLen; i++){
        let key = localStorage.key(i);
        arrListCitys.push(JSON.parse(localStorage.getItem(key)));
      }
  }

  const sortNames = arrListCitys.reduce(
    (o, v, count) => {

        let index = o.findIndex(el => el.count < v.count);
        return ((index > -1) ? o.splice(index, 0, v) : o.push(v)), o;

    }, []);

  console.log(sortNames);

  changeFavoriteCitys(sortNames);

};

function changeFavoriteCitys(arr) {

  if(arr.length > 0) {

     if(arr[0]['count'] > 1) {
         citysFavorite.firstSity.sityFullName = arr[0]['sityFullName'];
         citysFavorite.firstSity.sityName = arr[0]['sityName'];
         citysFavorite.firstSity.lat = arr[0]['latPositions'];
         citysFavorite.firstSity.lng = arr[0]['lngPositions'];
         firstSity.textContent = citysFavorite.firstSity.sityName;
     }

    if(citysFavorite.firstSity.sityName === 'Днипро' && arr.length === 1) {
       secondSity.textContent = '';
    }

    if(citysFavorite.firstSity.sityName === 'Львов' && arr.length === 1) {
       thirdSity.textContent = '';
    }

    if(citysFavorite.firstSity.sityName === 'Харьков' && arr.length === 1) {
       fourthSity.textContent = '';
    }

    if(citysFavorite.firstSity.sityName === 'Одесса' && arr.length === 1) {
       fifthSity.textContent = '';
    }

  }

  if(arr.length > 1) {

     if(arr[1]['count'] > 1) {
         citysFavorite.secondSity.sityFullName = arr[1]['sityFullName'];
         citysFavorite.secondSity.sityName = arr[1]['sityName'];
         citysFavorite.secondSity.lat = arr[1]['latPositions'];
         citysFavorite.secondSity.lng = arr[1]['lngPositions'];
         secondSity.textContent = citysFavorite.secondSity.sityName;
     }

    if(citysFavorite.firstSity.sityName === 'Львов' && arr.length === 2) {
       thirdSity.textContent = '';
    }

    if(citysFavorite.secondSity.sityName === 'Львов' && arr.length === 2) {
       thirdSity.textContent = '';
    }

    if(citysFavorite.firstSity.sityName === 'Харьков' && arr.length === 2) {
       fourthSity.textContent = '';
    }

    if(citysFavorite.secondSity.sityName === 'Харьков' && arr.length === 2) {
       fourthSity.textContent = '';
    }

    if(citysFavorite.firstSity.sityName === 'Одесса' && arr.length === 2) {
       fifthSity.textContent = '';
    }

    if(citysFavorite.secondSity.sityName === 'Одесса' && arr.length === 2) {
       fifthSity.textContent = '';
    }

  }

  if(arr.length > 2) {

     if(arr[2]['count'] > 1) {
         citysFavorite.thirdSity.sityFullName = arr[2]['sityFullName'];
         citysFavorite.thirdSity.sityName = arr[2]['sityName'];
         citysFavorite.thirdSity.lat = arr[2]['latPositions'];
         citysFavorite.thirdSity.lng = arr[2]['lngPositions'];
         thirdSity.textContent = citysFavorite.thirdSity.sityName;
     }

    if(citysFavorite.firstSity.sityName === 'Харьков' && arr.length === 3) {
       fourthSity.textContent = '';
    }

    if(citysFavorite.secondSity.sityName === 'Харьков' && arr.length === 3) {
       fourthSity.textContent = '';
    }

    if(citysFavorite.thirdSity.sityName === 'Харьков' && arr.length === 3) {
       fourthSity.textContent = '';
    }

    if(citysFavorite.firstSity.sityName === 'Одесса' && arr.length === 3) {
       fifthSity.textContent = '';
    }

    if(citysFavorite.secondSity.sityName === 'Одесса' && arr.length === 3) {
       fifthSity.textContent = '';
    }

    if(citysFavorite.thirdSity.sityName === 'Одесса' && arr.length === 3) {
       fifthSity.textContent = '';
    }

  }

  if(arr.length > 3) {

     if(arr[3]['count'] > 1) {
         citysFavorite.fourthSity.sityFullName = arr[3]['sityFullName'];
         citysFavorite.fourthSity.sityName = arr[3]['sityName'];
         citysFavorite.fourthSity.lat = arr[3]['latPositions'];
         citysFavorite.fourthSity.lng = arr[3]['lngPositions'];
         fourthSity.textContent = citysFavorite.fourthSity.sityName;
     }

    if(citysFavorite.firstSity.sityName === 'Одесса' && arr.length === 4) {
       fifthSity.textContent = '';
    }

    if(citysFavorite.secondSity.sityName === 'Одесса' && arr.length === 4) {
       fifthSity.textContent = '';
    }

    if(citysFavorite.thirdSity.sityName === 'Одесса' && arr.length === 4) {
       fifthSity.textContent = '';
    }

    if(citysFavorite.fourthSity.sityName === 'Одесса' && arr.length === 4) {
       fifthSity.textContent = '';
    }

  }

  if(arr.length > 4) {

     if(arr[4]['count'] > 1) {
         citysFavorite.fifthSity.sityFullName = arr[4]['sityFullName'];
         citysFavorite.fifthSity.sityName = arr[4]['sityName'];
         citysFavorite.fifthSity.lat = arr[4]['latPositions'];
         citysFavorite.fifthSity.lng = arr[4]['lngPositions'];
         fifthSity.textContent = citysFavorite.fifthSity.sityName;
     }

  }

}

function jsFirstSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = firstSity.textContent;
    getWeather(citysFavorite.firstSity.lat, citysFavorite.firstSity.lng, 'ru');
    positions.sityFullName = citysFavorite.firstSity.sityFullName;
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = citysFavorite.firstSity.lat;
        weatherWay.start.lng = citysFavorite.firstSity.lng;
        weatherWay.start.sityName = citysFavorite.firstSity.sityName;

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

function jsSecondSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = secondSity.textContent;
    getWeather(citysFavorite.secondSity.lat, citysFavorite.secondSity.lng, 'ru');
    positions.sityFullName = citysFavorite.secondSity.sityFullName;
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = citysFavorite.secondSity.lat;
        weatherWay.start.lng = citysFavorite.secondSity.lng;
        weatherWay.start.sityName = citysFavorite.secondSity.sityName;

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

function jsThirdSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = thirdSity.textContent;
    getWeather(citysFavorite.thirdSity.lat, citysFavorite.thirdSity.lng, 'ru');
    positions.sityFullName = citysFavorite.thirdSity.sityFullName;
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = citysFavorite.thirdSity.lat;
        weatherWay.start.lng = citysFavorite.thirdSity.lng;
        weatherWay.start.sityName = citysFavorite.thirdSity.sityName;

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

function jsFourthSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = fourthSity.textContent;
    getWeather(citysFavorite.fourthSity.lat, citysFavorite.fourthSity.lng, 'ru');
    positions.sityFullName = citysFavorite.fourthSity.sityFullName;
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = citysFavorite.fourthSity.lat;
        weatherWay.start.lng = citysFavorite.fourthSity.lng;
        weatherWay.start.sityName = citysFavorite.fourthSity.sityName;

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

function jsFifthSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = fifthSity.textContent;
    getWeather(citysFavorite.fifthSity.lat, citysFavorite.fifthSity.lng, 'ru');
    positions.sityFullName = citysFavorite.fifthSity.sityFullName;
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = citysFavorite.fifthSity.lat;
        weatherWay.start.lng = citysFavorite.fifthSity.lng;
        weatherWay.start.sityName = citysFavorite.fifthSity.sityName;

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

firstSity.addEventListener("click", jsFirstSity);
secondSity.addEventListener("click", jsSecondSity);
thirdSity.addEventListener("click", jsThirdSity);
fourthSity.addEventListener("click", jsFourthSity);
fifthSity.addEventListener("click", jsFifthSity);
let skyconType = function(icon) {
  if(icon === '10d' || icon === '10n' || icon === '9d' || icon === '10n')
    return Skycons.RAIN
  else if(icon === '13d' || icon === '13n')
    return Skycons.SNOW
  /* else if(icon === 'sleet')
    return Skycons.SLEET */
  /* else if(icon === 'hail')
    return Skycons.SLEET */
  /* else if(icon === 'wind')
    return Skycons.WIND */
  else if(icon === '50d' || icon === '50n')
    return Skycons.FOG
  else if(icon === '2d' || icon === '2n')
    return Skycons.CLOUDY
  else if(icon === '03d' || icon === '04d')
    return Skycons.PARTLY_CLOUDY_DAY
  else if(icon === '03n' || icon === '04n')
    return Skycons.PARTLY_CLOUDY_NIGHT
  else if(icon === '01d')
    return Skycons.CLEAR_DAY
  else if(icon === '01n')
    return Skycons.CLEAR_NIGHT

  return Skycons.CLOUDY
}

/* let skyconType = function(icon) {
  if(icon === 'rain')
    return Skycons.RAIN
  else if(icon === 'snow')
    return Skycons.SNOW
  else if(icon === 'sleet')
    return Skycons.SLEET
  else if(icon === 'hail')
    return Skycons.SLEET
  else if(icon === 'wind')
    return Skycons.WIND
  else if(icon === 'fog')
    return Skycons.FOG
  else if(icon === 'cloudy')
    return Skycons.CLOUDY
  else if(icon === 'partly-cloudy-day')
    return Skycons.PARTLY_CLOUDY_DAY
  else if(icon === 'partly-cloudy-night')
    return Skycons.PARTLY_CLOUDY_NIGHT
  else if(icon === 'clear-day')
    return Skycons.CLEAR_DAY
  else if(icon === 'clear-night')
    return Skycons.CLEAR_NIGHT

  return Skycons.CLOUDY
} */
addsitySity.textContent = positions.sityFullName;

const addCity = document.getElementById("add-city");

const autocompleteAddCity = new google.maps.places.Autocomplete(addCity, {
    types: ["(cities)"]
});

const positionsAddCity = {
           sityFullName: '',
           sityName: '',
           lengthArrSity: 1,
           lat: '',
           lng: '',
           count: ''
         };

const htmlCityBlock = document.querySelector(".js-add-sity__block");

function addCityBlock(address, length) {

  let datepickerID = `datepicker_${length}`;

   const itemCity = document.createElement('div');
   itemCity.classList.add("add-sity__str", `js-count_${length}`);
   let cityText = `

        <p class="add-sity__sity">${address}</p>
        <p class="add-sity__arrival">приезд/отъезд</p>
        <p class="add-sity__date">
            <input type="text" class="js-calendar" id="${datepickerID}" placeholder="Дата">
        </p>
        <p class="add-sity__del"></p>

`;

  itemCity.innerHTML += cityText;
  htmlCityBlock.append(itemCity);

  let pickers = {};
  let pickerName = `picker_${length}`;

  pickers[`picker_${length}`] = new Pikaday({
        field: document.getElementById(datepickerID),
        firstDay: 1,
        format: 'D.MM.YYYY',
        onSelect: function() {
            this.getMoment().format('Do MM.YYYY');
            let inputTimes = document.getElementById(datepickerID);
            positionsAddCity.count = length;
            getWeatherWay(weatherWay[`start_${length}`]['lat'], weatherWay[`start_${length}`]['lng'], dateConvert(inputTimes.value), 'ru');
            console.log(inputTimes.value);
        },
        i18n: {
            previousMonth : 'Previous Month',
            nextMonth     : 'Next Month',
            months        : ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
            weekdays      : ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
            weekdaysShort : ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
        }
    });

   weatherWay[`start_${length}`] = {};
   weatherWay[`start_${length}`]['lat'] = positionsAddCity.lat;
   weatherWay[`start_${length}`]['lng'] = positionsAddCity.lng;
   weatherWay[`start_${length}`]['sityName'] = positionsAddCity.sityName;
   weatherWay[`start_${length}`]['toDay'] = {};
   weatherWay[`start_${length}`]['toDay']['header'] = {};
   weatherWay[`start_${length}`]['toDay']['body'] = [];

   console.log(weatherWay);
}

google.maps.event.addListener(autocompleteAddCity, "place_changed", function () {
    // в этой переменной получаем объект город
    const placeAddCity = autocompleteAddCity.getPlace();

    // -------------------- отладочный блок -------------------
    //console.log(placeAddCity);

    positionsAddCity.lat = placeAddCity.geometry.location.lat();
    positionsAddCity.lng = placeAddCity.geometry.location.lng();
    positionsAddCity.sityName = placeAddCity.name;

    addCityBlock(placeAddCity.formatted_address, positionsAddCity.lengthArrSity);

    addCity.classList.add("js-none");

    positionsAddCity.lengthArrSity += 1;
})

// Добавляем блок с новым городом
const addCityButton = document.querySelector(".add-sity__button");

const addCityInput = event => {
    event.preventDefault();
    const addSityBlock = document.querySelector(".js-add-sity__block");
    const arrNotEmpty = document.querySelectorAll(".js-calendar");

    if(addSityBlock.children.length === 0) {
       addCity.classList.remove("js-none");
       addCity.value = '';
    } else if(arrNotEmpty[arrNotEmpty.length - 1].value === '' && arrNotEmpty !== undefined) {
       alert('Добавьте дату у последнего города');
    } else {
       addCity.classList.remove("js-none");
       addCity.value = '';
    }

};

addCityButton.addEventListener("click", addCityInput);
let inputTime;

// var disable = false;
let picker = new Pikaday({
        field: document.getElementById('datepicker'),
        firstDay: 1,
        format: 'D.MM.YYYY',
       /*  disableDayFn: function(theDate) {
          return disable = !disable;
       }, */
        onSelect: function() {
            this.getMoment().format('Do MM.YYYY');
            inputTime = document.getElementById('datepicker');
            getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        },
        i18n: {
            previousMonth : 'Previous Month',
            nextMonth     : 'Next Month',
            months        : ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
            weekdays      : ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
            weekdaysShort : ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
        }
    });
const deleteSityBlock = event => {

  if(event.target.classList.contains("add-sity__del")) {

     if(event.target.parentNode.classList.contains("js-count_0")) {
        event.target.parentNode.remove();
        delete weatherWay['start'];

        let tempWay = document.querySelector(".js-way");
        tempWay.remove();

     } else {

        let classesSity = event.target.parentNode.classList;
        let classCount = classesSity[1];
        let arrClassCount = classCount.split("_");
        let count = arrClassCount[1];
        delete weatherWay[`start_${count}`];

        let tempWay = document.querySelector(`.js-way_${count}`);
        tempWay.remove();

        event.target.parentNode.remove();
     }

  }

  };

htmlCityBlock.addEventListener("click", deleteSityBlock);
let weatherWay = {

   start: {

        lat: '50.4501', // Киев
        lng: '30.523400000000038', // Киев
        sityName: 'Киев',
        toDay: {
          header: {},
          body: []
        }

   }

}

function dateConvert(timeCalendar) {

 let arrTimeCalendar = timeCalendar.split(".");
 let dayTime = arrTimeCalendar[0];
 let monthTime = arrTimeCalendar[1] - 1;
 let yearTime = arrTimeCalendar[2];

  let date = new Date(yearTime, monthTime, dayTime);
  let time = date.getTime() / 1000;
  return time;
}

function getWeatherWay(lat, lng, time, lang) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {

    if (this.readyState == 4 && this.status == 200) {

      const myWeatherWay = JSON.parse(this.responseText);

      function Header(times) {
        let date = getDate(times);
        this.weekday = date.toLocaleString(lang, {weekday: 'long'});
        this.date = date.toLocaleString(lang, {day: '2-digit', month: 'long', year: 'numeric'});
        //this.date = date.toLocaleString(lang, {day: '2-digit', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric'});
      }

      function WeatherStr(title, icon, precipType, temperature, description) {
        this.title = title;
        this.icon = icon;
        this.precipType = precipType;
        if(temperature > 0) {
           this.temperature = '+' + Math.round(temperature);
        } else {
           this.temperature = Math.round(temperature);
        }

        this.description = description;
      }

      // погода в дорогу - все города после первого
      this.time = time;
      const amendment = 39600; // разница времени между 2 API
      const dailyNow = this.time + amendment;
      const dailyCountDay = Math.round((dailyNow - myWeatherWay.daily[0].dt)/86400); // 86400 - количество секунд в 24 часах

      weatherWay[`start_${positionsAddCity.count}`]['toDay']['header'] = new Header(myWeatherWay.daily[dailyCountDay].dt);

      const srcArrToDate = myWeatherWay.daily[dailyCountDay];

      const dayPeriod = {
        time: srcArrToDate.dt,
        icon: srcArrToDate.weather[0].icon,
        precipType: srcArrToDate.weather[0].main,
        temperature: srcArrToDate.temp.day,
        summary: srcArrToDate.weather[0].description
      };
      const nightPeriod = {
        time: srcArrToDate.dt,
        icon: srcArrToDate.weather[0].icon,
        precipType: srcArrToDate.weather[0].main,
        temperature: srcArrToDate.temp.night,
        summary: srcArrToDate.weather[0].description
      };

      const srcArrToDateLite = [dayPeriod, nightPeriod];

      const periods = ['Днем', 'Ночью'];
      srcArrToDateLite.forEach((el, i) => weatherWay[`start_${positionsAddCity.count}`]['toDay'].body[i] = new WeatherStr(periods[i], el.icon, el.precipType, Math.round(el.temperature), el.summary));

      // получение даты из числа в ответе API
      function getDate(times) {

        let date = new Date(1000 * times);

        return date;
      }

      // Компилируем шаблон
       wayfullTemplate(weatherWay[`start_${positionsAddCity.count}`]);

       // Иконки
       iconWayFull();

    } //if ends
  } //onready end

  // const address = 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/606d16650a24656a795100b26c1b1a3e/' + lat + ',' + lng + ',' + time + '?extend=hourly&lang=ru&units=si';

  const address = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&lang=${lang}&units=metric&appid=1f2df059e0dcefe5b9990d6851316f83`;

  request.open('GET', address, true);
  request.send();

}
function getWeatherWayFirst(lat, lng, time, lang) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {

    if (this.readyState == 4 && this.status == 200) {

      const myWeatherWay = JSON.parse(this.responseText);

      function Header(times) {
        let date = getDate(times);
        this.weekday = date.toLocaleString(lang, {weekday: 'long'});
        this.date = date.toLocaleString(lang, {day: '2-digit', month: 'long', year: 'numeric'});
        //this.date = date.toLocaleString(lang, {day: '2-digit', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric'});
      }

      function WeatherStr(title, icon, precipType, temperature, description) {
        this.title = title;
        this.icon = icon;
        this.precipType = precipType;
        if(temperature > 0) {
           this.temperature = '+' + Math.round(temperature);
        } else {
           this.temperature = Math.round(temperature);
        }

        this.description = description;
      }

      // погода в дорогу - первый город
      this.time = time;
      const amendment = 39600; // разница времени между 2 API
      const dailyNow = this.time + amendment;
      const dailyCountDay = Math.round((dailyNow - myWeatherWay.daily[0].dt)/86400); // 86400 - количество секунд в 24 часах

      weatherWay['start']['toDay']['header'] = new Header(myWeatherWay.daily[dailyCountDay].dt);

      const srcArrToDate = myWeatherWay.daily[dailyCountDay];

      const dayPeriod = {
        time: srcArrToDate.dt,
        icon: srcArrToDate.weather[0].icon,
        precipType: srcArrToDate.weather[0].main,
        temperature: srcArrToDate.temp.day,
        summary: srcArrToDate.weather[0].description
      };
      const nightPeriod = {
        time: srcArrToDate.dt,
        icon: srcArrToDate.weather[0].icon,
        precipType: srcArrToDate.weather[0].main,
        temperature: srcArrToDate.temp.night,
        summary: srcArrToDate.weather[0].description
      };

      const srcArrToDateLite = [dayPeriod, nightPeriod];

      const periods = ['Днем', 'Ночью'];
      srcArrToDateLite.forEach((el, i) => weatherWay['start']['toDay'].body[i] = new WeatherStr(periods[i], el.icon, el.precipType, Math.round(el.temperature), el.summary));

      // получение даты из числа в ответе API
      function getDate(times) {

        let date = new Date(1000 * times);

        return date;
      }
console.log(weatherWay);
      // Компилируем шаблон
       wayfullTemplateFirst(weatherWay['start']);

       // Иконки
       iconWayFull();

    } //if ends
  } //onready end

  // const address = 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/606d16650a24656a795100b26c1b1a3e/' + lat + ',' + lng + ',' + time + '?extend=hourly&lang=ru&units=si';

  const address = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&lang=${lang}&units=metric&appid=1f2df059e0dcefe5b9990d6851316f83`;
//console.log(address);
  request.open('GET', address, true);
  request.send();

}
const goWayFullLink = event => {
    //event.preventDefault();
    const wayfull = document.querySelector('.wayfull');
    console.log(wayfull.children);
    if(wayfull.children > 1) {
       wayfull.children.remove();
    }

    arrBlockSity.forEach(el => wayfull.append(el));

};

//lookWay.addEventListener("click", goWayFullLink);

function headerTemplate() {

            const source   = document.getElementById("header-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.now);

            const header = document.querySelector('.header-visual__js-block');
            const headerBlock = document.querySelector('.header-visual__js-templ');

            if(header.innerHTML !== '') {
               headerBlock.remove();
               header.innerHTML += html;
            } else {
                header.innerHTML += html;
            }

}
const headerText = document.querySelector('.header-visual__text');
const textWeatherArr = {
  textWeather: 'Сейчас за окном',
  viewWeather: ['катастрофический мороз', 'чрезвычайно сильный мороз', 'сильный мороз', 'умеренный мороз', 'мороз', 'слабый мороз', 'холодно', 'прохладно', 'тепло', 'очень тепло', 'жара', 'сильная жара', 'чрезвычайно сильная погода (вероятны тепловые удары)', 'катастрофическая жара'],
  clothesWeather: ['одевайся теплее', 'одевайся теплее, не забывай шапку, шарф и перчатки', 'одевай курточку', 'одевайся теплее и не забудь зонтик','одевай кофту', 'одевай кофту и не забудь зонтик', 'не забудь зонтик']
}
function textWeather () {
  headerTemplate();
  let description = weather.now.description.toLowerCase();
  if (weather.now.temperature < -50) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[0]}, ${description} - ${textWeatherArr.clothesWeather[1]}`;
  }
  if (weather.now.temperature >= -50 && weather.now.temperature <= -40) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[1]}, ${description} - ${textWeatherArr.clothesWeather[1]}`;
  }
  if (weather.now.temperature >= -39 && weather.now.temperature <= -30) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[2]}, ${description} - ${textWeatherArr.clothesWeather[1]}`;
  }
  if (weather.now.temperature >= -29 && weather.now.temperature <= -20) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[3]}, ${description} - ${textWeatherArr.clothesWeather[1]}`;
  }
  if (weather.now.temperature >= -19 && weather.now.temperature <= -10) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[4]}, ${description} - ${textWeatherArr.clothesWeather[1]}`;
  }
  if (weather.now.temperature >= -9 && weather.now.temperature <= 0) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[5]}, ${description} - ${textWeatherArr.clothesWeather[1]}`;
  }
  if (weather.now.temperature >= 1 && weather.now.temperature <= 8) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[6]}, ${description} - ${textWeatherArr.clothesWeather[0]}`;
  }
  if (weather.now.temperature >= 1 && weather.now.temperature <= 8 && weather.now.icon === "wind") {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[6]}, ${description} - ${textWeatherArr.clothesWeather[2]}`;
  }
  if (weather.now.temperature >= 1 && weather.now.temperature <= 8 && weather.now.icon === "rain") {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[6]}, ${description} - ${textWeatherArr.clothesWeather[3]}`;
  }
  if (weather.now.temperature >= 9 && weather.now.temperature <= 16) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[7]}, ${description}`;
  }
  if (weather.now.temperature >= 9 && weather.now.temperature <= 16 && weather.now.icon === "wind") {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[7]}, ${description} - ${textWeatherArr.clothesWeather[4]}`;
  }
  if (weather.now.temperature >= 9 && weather.now.temperature <= 16 && weather.now.icon === "rain") {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[7]}, ${description} - ${textWeatherArr.clothesWeather[5]}`;
  }
  if (weather.now.temperature >= 17 && weather.now.temperature <= 24) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[8]}, ${description}`;
  }
  if (weather.now.temperature >= 17 && weather.now.temperature <= 24 && weather.now.icon === "rain") {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[8]}, ${description} - ${textWeatherArr.clothesWeather[6]}`;
  }
  if (weather.now.temperature >= 25 && weather.now.temperature <= 32) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[9]}, ${description}`;
  }
  if (weather.now.temperature >= 25 && weather.now.temperature <= 32 && weather.now.icon === "rain") {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[9]}, ${description} - ${textWeatherArr.clothesWeather[6]}`;
  }
  if (weather.now.temperature >= 33 && weather.now.temperature <= 40) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[10]}, ${description}`;
  }
  if (weather.now.temperature >= 41 && weather.now.temperature <= 48) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[11]}, ${description}`;
  }
  if (weather.now.temperature >= 49 && weather.now.temperature <= 56) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[12]}, ${description}`;
  }
  if (weather.now.temperature >= 57) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[13]}, ${description}`;
  }

}
textWeather();
function todayTemplate() {

            const source   = document.getElementById("today-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.today.body);

            const today = document.querySelector('.today__main');
            const todayBlock = document.querySelector('.today__block');

            if(today.innerHTML !== '') {
               todayBlock.remove();
               today.innerHTML += html;
            } else {
                today.innerHTML += html;
            }

}

function todayHeaderTemplate() {

            const source   = document.getElementById("today-header-template").innerHTML;

            const template = Handlebars.compile(source);

            const html = template(weather.today.header);

            const header = document.querySelector('.today__title');
            const headerBlock = document.querySelector('.today__header-block');

            if(header.innerHTML !== '') {
               headerBlock.remove();
               header.innerHTML += html;
            } else {
                header.innerHTML += html;
            }

}
function tomorrowTemplate() {

            const source   = document.getElementById("tomorrow-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.tomorrow.body);

            const today = document.querySelector('.tomorrow__main');
            const todayBlock = document.querySelector('.tomorrow__block');

            if(today.innerHTML !== '') {
               todayBlock.remove();
               today.innerHTML += html;
            } else {
                today.innerHTML += html;
            }

}

function tomorrowHeaderTemplate() {

            const source   = document.getElementById("tomorrow-header-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.tomorrow.header);

            const header = document.querySelector('.tomorrow__title');
            const headerBlock = document.querySelector('.tomorrow__header-block');

            if(header.innerHTML !== '') {
               headerBlock.remove();
               header.innerHTML += html;
            } else {
                header.innerHTML += html;
            }

}
function saturdayHeaderTemplate() {

            const source   = document.getElementById("saturday-header-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.weekend.saturday.header);

            const header = document.querySelector('.js-saturday__title');
            const headerBlock = document.querySelector('.saturday__header-block');

            if(header.innerHTML !== '') {
               headerBlock.remove();
               header.innerHTML += html;
            } else {
                header.innerHTML += html;
            }

}

function saturdayTemplate() {

            const source   = document.getElementById("saturday-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.weekend.saturday.body);

            const today = document.querySelector('.saturday__main');
            const todayBlock = document.querySelector('.saturday__block');

            if(today.innerHTML !== '') {
               todayBlock.remove();
               today.innerHTML += html;
            } else {
                today.innerHTML += html;
            }

}

function sundayHeaderTemplate() {

            const source   = document.getElementById("sunday-header-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.weekend.sunday.header);

            const header = document.querySelector('.js-sunday__title');
            const headerBlock = document.querySelector('.sunday__header-block');

            if(header.innerHTML !== '') {
               headerBlock.remove();
               header.innerHTML += html;
            } else {
                header.innerHTML += html;
            }

}

function sundayTemplate() {

            const source   = document.getElementById("sunday-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.weekend.sunday.body);

            const today = document.querySelector('.sunday__main');
            const todayBlock = document.querySelector('.sunday__block');

            if(today.innerHTML !== '') {
               todayBlock.remove();
               today.innerHTML += html;
            } else {
                today.innerHTML += html;
            }

}

function sundayHide() {
    const sundayHideBlock = document.querySelector('.js-sunday');
    sundayHideBlock.classList.add('js-sunday--none');
}
function iconWeather () {
  let nowWeather = weather.now.icon;
  const skycons = new Skycons({"color": "#d1d2d3"});
  let icon = document.querySelector(".header-visual__icon");

  if (nowWeather === "clear-day") {
    icon.id="clear-day";
    skycons.add("clear-day", Skycons.PARTLY_CLOUDY_DAY);
  }else if (nowWeather === "clear-night") {
    icon.id="clear-night";
    skycons.add("clear-night", Skycons.CLEAR_NIGHT);
  }else if (nowWeather === "rain") {
    icon.id="rain";
    skycons.add("rain", Skycons.RAIN);
  }else if (nowWeather === "snow") {
    icon.id="snow";
    skycons.add("snow", Skycons.SNOW);
  }else if (nowWeather === "sleet") {
    icon.id="sleet";
    skycons.add("sleet", Skycons.SLEET);
  }else if (nowWeather === "wind") {
    icon.id="wind";
    skycons.add("wind", Skycons.WIND);
  }else if (nowWeather === "fog") {
    icon.id="fog";
    skycons.add("fog", Skycons.FOG);
  }else if (nowWeather === "cloudy") {
    icon.id="cloudy";
    skycons.add("cloudy", Skycons.CLOUDY);
  }else if (nowWeather === "partly-cloudy-day") {
    icon.id="partly-cloudy-day";
    skycons.add("partly-cloudy-day", Skycons.PARTLY_CLOUDY_DAY);
  }else if (nowWeather === "partly-cloudy-night") {
    icon.id="partly-cloudy-night";
    skycons.add("partly-cloudy-night", Skycons.PARTLY_CLOUDY_NIGHT);
  }
  skycons.play();

}
function iconTodayWeather() {
  let skycons = new Skycons({"color": "#009587"});
  let icons = document.querySelectorAll(".today__precip canvas");

  icons.forEach(function(elem) {
    skycons.add(elem, skyconType(elem.className));
  });

  skycons.play();
}
function iconTomorowWeather() {
  let skycons = new Skycons({"color": "#009587"});
  let icons = document.querySelectorAll(".tomorrow__precip canvas");

  icons.forEach(function(elem) {
    skycons.add(elem, skyconType(elem.className));
  });

  skycons.play();
}
function iconWeekendWeather() {
  let skycons = new Skycons({"color": "#009587"});
  let icons = document.querySelectorAll(".weekend__precip canvas");

  icons.forEach(function(elem) {
    skycons.add(elem, skyconType(elem.className));
  });

  skycons.play();
}
function wayfullTemplateFirst(start) {

            if(positionsAddCity['tempWays'] !== undefined) {

                let tempWay = document.querySelector(".js-way");

                const source   = document.getElementById("wayfull-template").innerHTML;
                const template = Handlebars.compile(source);

                const html = template(start);

                const wayfull = document.querySelector('.wayfull');
                const block = document.createElement('div');
                block.classList.add("wayfull__block", "js-way");
                positionsAddCity['tempWays'] = document.querySelector('.js-way');

                tempWay.after(block);
                block.innerHTML += html;
                tempWay.remove();

            } else {

                const source   = document.getElementById("wayfull-template").innerHTML;
                const template = Handlebars.compile(source);

                const html = template(start);

                const wayfull = document.querySelector('.wayfull');
                const block = document.createElement('div');
                block.classList.add("wayfull__block", "js-way");
                positionsAddCity['tempWays'] = document.querySelector('.js-way');
                wayfull.append(block);

                block.innerHTML += html;

            }

}

function wayfullTemplate(start) {
            if(positionsAddCity[`tempWays_${positionsAddCity.count}`] !== undefined) {

                let tempWay = document.querySelector(`.js-way_${positionsAddCity.count}`);

                const source   = document.getElementById("wayfull-template").innerHTML;
                const template = Handlebars.compile(source);

                const html = template(start);

                const wayfull = document.querySelector('.wayfull');
                const block = document.createElement('div');
                block.classList.add("wayfull__block", `js-way_${positionsAddCity.count}`);
                positionsAddCity[`tempWays_${positionsAddCity.count}`] = document.querySelector(`.js-way_${positionsAddCity.count}`);

                tempWay.after(block);
                block.innerHTML += html;
                tempWay.remove();

            } else {

                const source   = document.getElementById("wayfull-template").innerHTML;
                const template = Handlebars.compile(source);

                const html = template(start);

                const wayfull = document.querySelector('.wayfull');
                const block = document.createElement('div');
                block.classList.add("wayfull__block", `js-way_${positionsAddCity.count}`);
                positionsAddCity[`tempWays_${positionsAddCity.count}`] = document.querySelector(`.js-way_${positionsAddCity.count}`);
                wayfull.append(block);

                block.innerHTML += html;

            }

}
function iconWayFull() {
  let skycons = new Skycons({"color": "#009587"});
  let icons = document.querySelectorAll(".wayfull__precip canvas");

  icons.forEach(function(elem) {
    skycons.add(elem, skyconType(elem.className));
  });

  skycons.play();
  console.log(skycons);
}