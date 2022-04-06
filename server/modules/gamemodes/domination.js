/*jslint node: true */
/*jshint -W061 */
/*global goog, Map, let */
"use strict";

// General requires
require('google-closure-library');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.QuadTree');

const dominatorLoop = (function() {
    let config = {
        types: [Class.destroyerDominator, Class.gunnerDominator, Class.trapperDominator],
        neededToWin: 4
    };
    let gameWon = false;
    let spawn = (loc, team, type = false) => {
        type = type ? type : ran.choose(config.types);
        let o = new Entity(loc);
        o.define(type);
        o.team = team;
        o.color = [10, 11, 12, 15][-team - 1] || 3;
        o.skill.score = 111069;
        o.name = "Dominator";
        o.SIZE = c.WIDTH / c.X_GRID / 10;
        o.isDominator = true;
        o.controllers = [new ioTypes.nearestDifferentMaster(o), new ioTypes.spinWhenIdle(o)];
        o.onDead = function() {
            if (o.team === -100) {
                let killers = [];
                for (let instance of o.collisionArray)
                    if (instance.team > -5 && instance.team < 0 && o.team !== instance.team) killers.push(instance);
                let killer = ran.choose(killers);
                let newTeam = killer.team;
                spawn(loc, newTeam, type);
                room.setType("dom" + -killer.team, loc);
                sockets.broadcast("A dominator is now controlled by " + ["BLUE", "GREEN", "RED", "PURPLE"][-newTeam - 1] + "!");
                for (let player of sockets.players)
                    if (player.body)
                        if (player.body.team === newTeam) player.body.sendMessage("Press H to take control of the dominator.");
            } else {
                spawn(loc, -100, type);
                room.setType("dom0", loc);
                sockets.broadcast("A dominator is being contested!");
            }
            tally();
        };
    };

    function winner(teamId) {
        gameWon = true;
        setTimeout(function() {
            let team = ["BLUE", "GREEN", "RED", "PURPLE"][teamId];
            sockets.broadcast(team + " has won the game!");
            setTimeout(closeArena, 3e3);
        }, 1500);
    };

    function tally() {
        if (gameWon == true) return;
        let dominators = {};
        for (let i = 0; i < 4; i++) dominators[-(i + 1)] = 0;
        loopThrough(entities, function(o) {
            if (o.isDominator && o.team !== -101 && dominators[o.team] != null) dominators[o.team]++;
        });
        if (dominators["-1"] === config.neededToWin) winner(0);
        if (dominators["-2"] === config.neededToWin) winner(1);
        if (dominators["-3"] === config.neededToWin) winner(2);
        if (dominators["-4"] === config.neededToWin) winner(3);
    };
    return {
        spawn,
        tally
    };
})();

module.exports = {
    dominatorLoop
};