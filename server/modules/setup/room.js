/*jslint node: true */
/*jshint -W061 */
/*global goog, Map, let */
"use strict";
// General requires
require('google-closure-library');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.QuadTree');

// A quick Changelog for this: 
// - It no longer uses ES6 Arrow Functions
// - It no longer uses forEach loops

const room = {
    lastCycle: undefined,
    cycleSpeed: 1000 / roomSpeed / 30,
    width: c.WIDTH,
    height: c.HEIGHT,
    setup: c.ROOM_SETUP,
    xgrid: c.X_GRID,
    ygrid: c.Y_GRID,
    gameMode: c.MODE,
    skillBoost: c.SKILL_BOOST,
    scale: {
        square: c.WIDTH * c.HEIGHT / 100000000,
        linear: Math.sqrt(c.WIDTH * c.HEIGHT / 100000000),
    },
    maxFood: c.WIDTH * c.HEIGHT / 20000 * c.FOOD_AMOUNT,
    isInRoom: c.ARENA_TYPE === "cirlce" ? location => util.getDistance(location, {
        x: c.WIDTH / 2,
        y: c.HEIGHT / 2
    }) < c.WIDTH / 2 : location => location.x >= 0 && location.x <= c.WIDTH && location.y >= 0 && location.y <= c.HEIGHT,
    topPlayerID: -1,
    cellTypes: (function() {
        let output = ["nest", "norm", "rock", "roid", "port", "wall"];
        for (let i = 1; i < 5; i++) output.push("bas" + i), output.push("bap" + i);
        for (let i = 0; i < c.ROOM_SETUP.length; i++)
            for (let j = 0; j < c.ROOM_SETUP[i].length; j++)
                if (!output.includes(c.ROOM_SETUP[i][j])) output.push(c.ROOM_SETUP[i][j]);
        return output;
    })(),
    partyHash: Number(((Math.random() * 1000000 | 0) + 1000000).toString().replace("0.", "")),
    blackHoles: []
};

// Room functions. These functions must be defined after the room variable is created do to how they work.
room.findType = function(type) {
    let output = [];
    for (let i = 0; i < room.setup.length; i++)
        for (let j = 0; j < room.setup[i].length; j++) {
            let cell = room.setup[i][j];
            if (cell === type) output.push({
                x: (j + 0.5) * room.width / room.xgrid,
                y: (i + 0.5) * room.height / room.ygrid
            });
        }
    room[type] = output;
};
room.setType = function(type, location) {
    if (!room.isInRoom(location)) return false;
    let a = Math.floor((location.y * room.ygrid) / room.height);
    let b = Math.floor((location.x * room.xgrid) / room.width);
    room.setup[a][b] = type;
    room.findType(type);
    sockets.broadcastRoom();
};
room.random = function() {
    let x = ran.irandom(room.width);
    let y = ran.irandom(room.height);
    if (c.ARENA_TYPE === "circle") {
        let i = 100;
        do {
            x = ran.irandom(room.width);
            y = ran.irandom(room.height);
            i--;
        } while (util.getDistance({
                x,
                y
            }, {
                x: room.width / 2,
                y: room.height / 2
            }) > room.width * 0.475 && i);
    }
    return {
        x,
        y
    };
};
room.near = function(position, radius) {
    let x = position.x + ((Math.random() * (radius * 2) | 0) - radius);
    let y = position.y + ((Math.random() * (radius * 2) | 0) - radius);
    return {
        x,
        y
    };
};
room.randomType = function(type) {
    if (!room[type]) return room.random();
    let selection = room[type][ran.irandom(room[type].length - 1)];
    if (c.ARENA_TYPE === "circle") {
        let loc = JSON.parse(JSON.stringify(selection));
        let i = 100;
        do {
            loc = {
                x: ran.irandom(0.5 * room.width / room.xgrid) * ran.choose([-1, 1]) + selection.x,
                y: ran.irandom(0.5 * room.height / room.ygrid) * ran.choose([-1, 1]) + selection.y
            };
            i--;
        } while (util.getDistance(loc, selection) > (room.width / room.xgrid) * 0.45 && i);
        return loc;
    }
    return {
        x: ran.irandom(0.5 * room.width / room.xgrid) * ran.choose([-1, 1]) + selection.x,
        y: ran.irandom(0.5 * room.height / room.ygrid) * ran.choose([-1, 1]) + selection.y,
    };
};
room.isIn = function(type, location, extendedWidth = false) {
    if (!room.isInRoom(location)) return false;
    let a = Math.floor(location.y * room.ygrid / room.height);
    let b = Math.floor(location.x * room.xgrid / room.width);
    if (!room.setup[a]) return false;
    if (!room.setup[a][b]) return false;
    if (c.ARENA_TYPE === "circle") {
        let cell = room[room.setup[a][b]].sort(function(a, b) {
            return util.getDistance(a, location) - util.getDistance(b, location);
        })[0];
        if (util.getDistance(cell, location) > (room.width / room.xgrid) * 0.5) return false;
    }
    if (extendedWidth) {
        let c = a - 1 > -1;
        let d = a + 1 < room.setup.length;
        let e = b - 1 > -1;
        let f = b + 1 < room.setup[a].length;
        let left = (c ? type === room.setup[a - 1][b] : false);
        let right = (d ? type === room.setup[a + 1][b] : false);
        let up = (e ? type === room.setup[a][b - 1] : false);
        let down = (f ? type === room.setup[a][b + 1] : false);
        let northWest = (c && e ? type === room.setup[a - 1][b - 1] : false);
        let northEast = (d && e ? type === room.setup[a + 1][b - 1] : false);
        let southWest = (c && f ? type === room.setup[a - 1][b + 1] : false);
        let southEast = (d && f ? type === room.setup[a + 1][b + 1] : false);
        let center = type === room.setup[a][b];
        return left || right || up || down || northWest || northEast || southWest || southEast || center;
    }
    return type === room.setup[a][b];
};
room.isAt = function(location) {
    if (!room.isInRoom(location)) return false;
    let x = Math.floor(location.x * room.xgrid / room.width);
    let y = Math.floor(location.y * room.ygrid / room.height);
    return {
        x: (x + .5) / room.xgrid * room.width,
        y: (y + .5) / room.ygrid * room.height,
        id: x * room.xgrid + y
    };
};
room.isInNorm = function(location) {
    if (!room.isInRoom(location)) return false;
    let a = Math.floor(location.y * room.ygrid / room.height);
    let b = Math.floor(location.x * room.xgrid / room.width);
    if (!room.setup[a]) return false;
    if (!room.setup[a][b]) return false;
    return room.setup[a][b] !== 'nest';
};
room.gauss = function(clustering) {
    let output;
    do {
        output = {
            x: ran.gauss(room.width / 2, room.height / clustering),
            y: ran.gauss(room.width / 2, room.height / clustering),
        };
    } while (!room.isInRoom(output));
    return output;
};
room.gaussInverse = function(clustering) {
    let output;
    do {
        output = {
            x: ran.gaussInverse(0, room.width, clustering),
            y: ran.gaussInverse(0, room.height, clustering),
        };
    } while (!room.isInRoom(output));
    return output;
};
room.gaussRing = function(radius, clustering) {
    let output;
    do {
        output = ran.gaussRing(room.width * radius, clustering);
        output = {
            x: output.x + room.width / 2,
            y: output.y + room.height / 2,
        };
    } while (!room.isInRoom(output));
    return output;
};
room.gaussType = function(type, clustering) {
    if (!room[type]) return room.random();
    let selection = room[type][ran.irandom(room[type].length - 1)];
    let location = {};
    do {
        location = {
            x: ran.gauss(selection.x, room.width / room.xgrid / clustering),
            y: ran.gauss(selection.y, room.height / room.ygrid / clustering),
        };
    } while (!room.isIn(type, location));
    return location;
};

for (let type of room.cellTypes) room.findType(type);

room.nestFoodAmount = 1.5 * Math.sqrt(room.nest.length) / room.xgrid / room.ygrid;

module.exports = {
    room,
    roomSpeed
};