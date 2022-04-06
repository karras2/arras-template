/*jslint node: true */
/*jshint -W061 */
/*global goog, Map, let */
"use strict";

// General requires
require('google-closure-library');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.QuadTree');

global.defeatedTeams = [];

let mothershipLoop = (function() {
    let motherships = [];
    let teamWon = false;
    let choices = [Class.mothership];

    function spawn() {
        let locs = [{
            x: c.WIDTH * 0.1,
            y: c.HEIGHT * 0.1
        }, {
            x: c.WIDTH * 0.9,
            y: c.HEIGHT * 0.9
        }, {
            x: c.WIDTH * 0.9,
            y: c.HEIGHT * 0.1
        }, {
            x: c.WIDTH * 0.1,
            y: c.HEIGHT * 0.9
        }].sort(function() {
            return 0.5 - Math.random();
        });
        for (let i = 0; i < c.TEAMS; i++) {
            let o = new Entity(locs[i]);
            o.define(ran.choose(choices));
            o.define({
                ACCEPTS_SCORE: false,
                VALUE: 643890
            });
            o.color = [10, 11, 12, 15][i];
            o.team = -i - 1;
            o.name = "Mothership";
            o.isMothership = true;
            o.controllers.push(new ioTypes.nearestDifferentMaster(o));
            o.controllers.push(new ioTypes.mapTargetToGoal(o));
            o.refreshBodyAttributes();
            motherships.push([o.id, i]);
        }
    };

    function death(entry) {
        let team = ["BLUE", "GREEN", "RED", "PURPLE"][entry[1]];
        sockets.broadcast(team + "'s mothership has been killed!");
        global.defeatedTeams.push(-entry[1] - 1);
        for (let i = 0; i < entities.length; i++) {
            let o = entities[i];
            if (o.team === -entry[1] - 1) {
                o.sendMessage("Your team has been eliminated.");
                o.kill();
            }
        }
        return false;
    };

    function winner(teamId) {
        let team = ["BLUE", "GREEN", "RED", "PURPLE"][teamId];
        sockets.broadcast(team + " has won the game!");
        setTimeout(closeArena, 3e3);
    };

    function loop() {
        if (teamWon) return;
        let aliveNow = motherships.map(entry => [...entry, entities.find(entity => entity.id === entry[0])]);
        aliveNow = aliveNow.filter(entry => {
            if (!entry[2]) return death(entry);
            if (entry[2].isDead()) return death(entry);
            return true;
        });
        if (aliveNow.length === 1) {
            teamWon = true;
            setTimeout(winner, 2500, aliveNow[0][1]);
        }
        motherships = aliveNow;
    };
    return {
        spawn,
        loop,
        motherships
    }
})();

module.exports = {
    mothershipLoop
};