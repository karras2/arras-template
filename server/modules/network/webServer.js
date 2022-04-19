/*jslint node: true */
/*jshint -W061 */
/*global goog, Map, let */
"use strict";
// General requires
require('google-closure-library');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.QuadTree');

const express = require("express");
const expressWs = require("express-ws");
const minify = require("express-minify");
const cors = require("cors");
const path = require("path");
const server = express();
server.use(express.json());
expressWs(server);
server.use(minify());
server.use(cors());
if (c.servesStatic) {
    server.use(express.static(path.join(__dirname, "../../../public")));
}
server.get("/lib/json/mockups.json", function(request, response) {
    response.send(mockupJsonData);
});
server.get("/lib/json/gamemodeData.json", function(request, response) {
    response.send(JSON.stringify({
        gameMode: c.gameModeName,
        players: views.length,
        code: [c.MODE, c.MODE === "ffa" ? "f" : c.TEAMS, c.secondaryGameMode].join("-")
    }));
});
server.get("/serverData.json", function(request, response) {
    response.json({
        ok: true,
        ip: c.host + ":" + c.port
    });
});
server.ws("/", sockets.connect);
server.listen(c.port, function() {
    console.log("Express + WS server listening on port", c.port);
});

module.exports = {
    server
};