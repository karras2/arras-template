/*jslint node: true */
/*jshint -W061 */
/*global goog, Map, let */
"use strict";

// General requires
require('google-closure-library');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.QuadTree');

function closeArena() {
    if (arenaClosed) return;
    sockets.broadcast("Arena Closed: No players may join!");
    global.arenaClosed = true;
    loopThrough(entities, function killBots(entry) {
        if (entry.isBot) entry.kill();
    });
    for (let i = 0; i < 15; i++) {
        let angle = (Math.PI * 2) / 15 * i;
        let o = new Entity({
            x: room.width / 2 + ((room.width / 1.5) * Math.cos(angle)),
            y: room.width / 2 + ((room.width / 1.5) * Math.sin(angle))
        });
        o.define(Class.arenaCloser);
        o.define({
            AI: {
                FULL_VIEW: true,
                SKYNET: true,
                BLIND: true,
                LIKES_SHAPES: true
            },
            CONTROLLERS: ["nearestDifferentMaster", "mapTargetToGoal"],
            SKILL: Array(10).fill(9),
            ACCEPTS_SCORE: false,
            CAN_BE_ON_LEADERBOARD: false,
            VALUE: 100000
        });
        o.color = 3;
        o.team = -100;
        o.isArenaCloser = true;
        o.name = "Arena Closer";
    }

    function close() {
        sockets.broadcast("Closing!");
        clearInterval(loop);
        setTimeout(process.exit, 1500);
    };
    let ticks = 0;
    const loop = setInterval(function checkSurvivors() {
        ticks++;
        if (ticks >= 240) return close();
        let alive = 0;
        loopThrough(entities, function amIAPlayer(instance, index) {
            if (instance.isPlayer || (instance.isDominator && instance.team !== -100) || instance.isMothership) alive++;
        });
        if (!alive) close();
    }, 500);
};

module.exports = {
    closeArena
};