/*jslint node: true */
/*jshint -W061 */
/*global goog, Map, let */
"use strict";

// General requires
require('google-closure-library');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.QuadTree');

function countPlayers() {
    let teams = [];
    for (let i = 1; i < c.TEAMS + 1; i++) teams.push([-i, 0]);
    let all = 0;
    for (let i = 0; i < entities.length; i++) {
        let o = entities[i];
        if (!o.isPlayer && !o.isBot) continue;
        if (![-1, -2, -3, -4].includes(o.team)) continue;
        teams.find(entry => entry[0] === o.team)[1]++;
        all++;
    }
    let team = teams.find(entry => entry[1] === all);
    if (team) winner(-team[0] - 1);
};

let won = false;

function winner(teamId) {
    if (won) return;
    won = true;
    let team = ["BLUE", "GREEN", "RED", "PURPLE"][teamId];
    sockets.broadcast(team + " has won the game!");
    setTimeout(closeArena, 3e3);
};

function tagDeathEvent(instance) {
    let killers = [];
    for (let entry of instance.collisionArray)
        if (entry.team > -5 && entry.team < 0 && instance.team !== entry.team) killers.push(entry);
    if (!killers.length) return;
    let killer = ran.choose(killers);
    if (instance.socket) instance.socket.rememberedTeam = -killer.team;
    if (instance.isBot) global.nextTagBotTeam = -killer.team;
    /*if (room.width > 1500) {
      room.width -= 10;
      room.height -= 10;
      sockets.broadcastRoom();
    }*/
    setTimeout(countPlayers, 1000);
}

module.exports = {
    countPlayers,
    tagDeathEvent
};