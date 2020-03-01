// game: { ..., tiles, tick, start, pause, end, }
var game = {
  ticks: 0,
 _ticks: 0,
 _tick:  0,
  ticker: -1,
  run: [],
  fast: false,
  paused: true,

  wave: 0,
 _wave: 0,

  creeps: [],
  hp: 1,
  hpinc: 1.3,
  lives: 10,
  turrets: [],
  spent: 0,
  kills: 0,
  cash: 5000, // 35,
  selection: false,

  tiles: {},

  tick: function () {
    // fps
    if (game.ticks - game._ticks === 60) {
      ui.fps.textContent = Math.round(60000 / (/*Date*/ performance.now() - game._tick));
      game._tick  = /*Date*/ performance.now();
      game._ticks = game.ticks;
    }

    // wave
    if ((game.ticks - game._wave) % 30 === 29) {
      ui.timer.style.opacity = 1 - (((game.ticks - game._wave) / 60) * 0.05);
    }

    if (game._wave + game.waveInterval/*1200*/ === game.ticks) {
      ui.wave.textContent = ++game.wave;

      // reward upgraded every 10 waves(levels)
      // add more 10 lives started from wave 20
      if (game.wave % 10 === 0 && game.wave > 10) {
        game.lives += 10;
        ui.lives.textContent = game.lives;
      }

      game.hpinc = { 10: 1.2, 25: 1.1, 50: 1.06, 100: 1.04, 150: 1.02, 200: 1.01 }[game.wave] || game.hpinc;
      game.hp *= game.hpinc;

      // 15 creeps per wave
      for (var i = 1; i <= game.creepRemain/*10*/; i++) {
        game.creeps.push({
          x: -(i * Math.rand(20)/*20*/) - Math.rand(10), // 10,
          y: game.map[0].y,
          offset: Math.rand(14),
          nextpoint: 0,
          speed: 1,
          slowfor: 0,
          hp: game.hp,
         _hp: game.hp,
          burning: false,
          cash: game.wave
        });
      }
      game._wave = game.ticks;
    }

    // tile ground:
    var tile = new Image();
    tile.src = "/images/tile.png";
    var retile = canvas.createPattern(tile, "repeat");

    canvas.fillStyle = retile; // "#000";
    canvas.fillRect(0, 0, 800, 500);

    // map for creeps
    var map = game.map.slice(1);
    var start = game.map[0];

    canvas.lineWidth = 25; // 40;
    canvas.strokeStyle = "#00F";
    canvas.beginPath();
    canvas.moveTo(start.x, start.y);

    map.forEach(function (cur, i) {
      canvas.lineTo(cur.x, cur.y);
    });
    canvas.stroke();
    canvas.lineWidth = 20; // 30;
    canvas.strokeStyle = "#004";
    canvas.beginPath();
    canvas.moveTo(start.x, start.y);

    map.forEach(function (cur, i) {
      canvas.lineTo(cur.x, cur.y);
    });
    canvas.stroke();

    // creeps
    game.creeps.forEach(function (creep, i, a) {
      var _hp = creep.hp;
      var burning = creep.burning;

      if (burning) {
        creep.hp -= 30;
      }

      if (creep.hp <= 0) {
        if (_hp > 0) {
          burning.kills++;
        }
        game.kills++;
        game.cash += creep.cash;
        delete a[i];
        ui.action.refresh();

      } else if (creep.nextpoint === game.map.length) {
        delete a[i];

        ui.lives.textContent = --game.lives;

        if (!game.lives) {
          game.end();
        }
      } else {
        if (--creep.slowfor <= 0) {
          creep.speed = 1;
        }

        var waypoint = game.map[creep.nextpoint];
     // var hue = (creep.speed < 1 || burning) ? (burning ? (creep.speed < 1 ? 300 : 33) : 240) : 0;
     // var sat = 100 * (creep.hp / creep._hp);

        // health bar width
        var sat =  14 * (creep.hp / creep._hp);

        if (Math.move(creep, { x: waypoint.x -7 + creep.offset, y: waypoint.y -7 + creep.offset }, creep.speed)) {
          creep.nextpoint++;
        }
        canvas.fillStyle = "#ffa040"; // "hsl(" + hue + "," + sat + "%,50%)";
/*
        // creeps body - Enable for powerful machine
        canvas.beginPath();
        canvas.arc(creep.x, creep.y, 5, 0, Math.PI * 2);
        canvas.fill();
*/
        // original square creeps
     // canvas.fillRect(creep.x -5, creep.y -5, 10, 10);

        // draw health bar
        canvas.fillStyle = "#F00";
        canvas.fillRect(creep.x -7, creep.y +9, 14,  4);
        canvas.fillStyle = "#0F0";
        canvas.fillRect(creep.x -7, creep.y +9, sat, 4);
      }
    });

    // turrets
    game.turrets.forEach(function (turret) {
      if (turret.lastshot + turret.rate <= game.ticks) {
        var creeps = game.creeps.filter(function (creep) {
          return Math.inRadius(creep, turret, turret.range);
        });

        if (creeps.length > 0) {
          turret.shoot(creeps);
          turret.lastshot = game.ticks;
        }
      }
      canvas.drawImage(turret.img, turret.x -12.5, turret.y -12.5);
    });

    var selection = game.selection;
    var turret = selection.turret;

    if (selection) {
      canvas.beginPath();
      canvas.fillStyle = selection.status === "selected" || selection.placeable ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 0, 0, 0.3)";
      canvas.arc(turret.x, turret.y, turret.range, 0, Math.PI * 2, true);
      canvas.fill();
      canvas.drawImage(turret.img, turret.x -12.5, turret.y -12.5);
    }

    // finish
    game.run.forEach(function (something, i, a) {
      if (something.what() === false || --something.until === 0) {
        delete a[i];
      }
    });
    game.ticks++;
    // control-perf
    ui.perf1.textContent = "hp: " + game.hp.toFixed(3);
  },

  start: function () {
    game._ticks = game.ticks;
    game._tick  = /*Date*/ performance.now();
    // setInterval(code, delay);
    game.ticker = window.setInterval(game.tick, 1000 / (game.fast ? 180 : 60));
    game.paused = false;
    game.tick();
  },

  pause: function () {
    window.clearInterval(game.ticker);
    game.paused = true;
  },

  end: function () {
    game.pause();
    document.removeEventListener("keydown", ui.handleshortcuts, false);
    window.removeEventListener("beforeunload", ui.handleunload, false);

    var map = game.map.name;
    var kills = game.kills;
    var spent = game.spent;
    var score = kills * spent;
    var text = score + " (" + kills + " kills, $" + spent + " spent)";
    var top  = JSON.parse(localStorage.scores || '{"Loopy":[],"Backtrack":[],"Dash":[],"Snake":[]}');
    var topmap = top[map];

    if (score > (topmap.length === 5 && topmap[4].score)) {
      topmap.splice(4, 1);
      topmap.push({
        score: score,
        kills: kills,
        spent: spent,
        date: /*Date*/ performance.now()
      });
      topmap.sort(function (a, b) { return b.score - a.score; });
      localStorage.scores = JSON.stringify(top);
      ui.action.scores();
    }

    $("control-score-text").textContent = text;

 // $("control-score-tweet").setAttribute("href", "https://twitter.com/?status=" + window.encodeURIComponent("I scored " + text + " on " + map + " in #canvastd http://canvas-td.tkaz.ec/"));

    ui.panel("score");
    $("pages-overlay").style.display = "block";
/*
    _gaq.push(["_trackEvent", "Game", "End", map]);
    _gaq.push(["_trackEvent", "Game", "Creeps killed", map, kills]);
    _gaq.push(["_trackEvent", "Game", "Money spent", map, spent]);
    _gaq.push(["_trackEvent", "Game", "Money available", map, game.cash]);
    _gaq.push(["_trackEvent", "Game", "Turrets placed", map, game.turrets.length]);
    _gaq.push(["_trackEvent", "Game", "Last FPS", map, Number(ui.fps.textContent)]);
*/
  },
  creepRemain: 15,
  waveInterval: 1500
};
