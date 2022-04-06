/*jslint node: true */
/*jshint -W061 */
/*global goog, Map, let */
"use strict";
// General requires
require('google-closure-library');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.QuadTree');

const defaults = require("../../config.json");

const gamemode = "FFA"; // keep it as ffa

const gamemodes = {
    "FFA": {
        BOTS: 9
    }, // "defaults" is already FFA.
    "Open TDM": {
        MODE: "tdm",
        TEAMS: 2 + (Math.random() * 3 | 0),
        BOTS: 10
    },
    "Portal FFA": {
        BOTS: 10,
        X_GRID: 15,
        Y_GRID: 15,
        WIDTH: 5000,
        HEIGHT: 5000,
        ROOM_SETUP: [
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "rock", "rock", "rock", "norm", "norm", "rock", "rock", "rock", "norm", "norm", "rock", "rock", "rock", "norm"],
            ["norm", "rock", "port", "rock", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "rock", "port", "rock", "norm"],
            ["norm", "rock", "rock", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "rock", "rock", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "roid", "rock", "rock", "rock", "roid", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "rock", "norm", "norm", "norm", "rock", "nest", "nest", "nest", "rock", "norm", "norm", "norm", "rock", "norm"],
            ["norm", "rock", "roid", "norm", "norm", "rock", "nest", "port", "nest", "rock", "norm", "norm", "roid", "rock", "norm"],
            ["norm", "rock", "norm", "norm", "norm", "rock", "nest", "nest", "nest", "rock", "norm", "norm", "norm", "rock", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "roid", "rock", "rock", "rock", "roid", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "rock", "rock", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "rock", "rock", "norm"],
            ["norm", "rock", "port", "rock", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "rock", "port", "rock", "norm"],
            ["norm", "rock", "rock", "rock", "norm", "norm", "rock", "rock", "rock", "norm", "norm", "rock", "rock", "rock", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ]
    },
    "Groups": {
        GROUPS: (Math.random() * 3 | 0) + 2,
        secondaryGameMode: "Squads",
        BOTS: 15
    },
    "Maze Groups": {
        GROUPS: (Math.random() * 3 | 0) + 2,
        MAZE: 32,
        X_GRID: 16,
        Y_GRID: 16,
        WIDTH: 5000,
        HEIGHT: 5000,
        ROOM_SETUP: [
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"]
        ],
        secondaryGameMode: "Squads"
    },
    "Maze": {
        MAZE: 32,
        X_GRID: 16,
        Y_GRID: 16,
        WIDTH: 5000,
        HEIGHT: 5000,
        ROOM_SETUP: [
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"]
        ],
        secondaryGameMode: "Maze"
    },
    "Portal Maze": {
        BOTS: 10,
        X_GRID: 15,
        Y_GRID: 15,
        WIDTH: 5000,
        HEIGHT: 5000,
        MAZE: 32,
        ROOM_SETUP: [
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "port", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "port", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "port", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "port", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "port", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ],
        secondaryGameMode: "Maze"
    },
    "Maze 2TDM": {
        MAZE: 32,
        X_GRID: 16,
        Y_GRID: 16,
        WIDTH: 6500,
        HEIGHT: 6500,
        MODE: "tdm",
        TEAMS: 2,
        BOTS: 24,
        ROOM_SETUP: [
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "bap1", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "bas1", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "bas2", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "bap2", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"]
        ],
        secondaryGameMode: "Maze"
    },
    "Maze 4TDM": {
        MAZE: 32,
        X_GRID: 16,
        Y_GRID: 16,
        WIDTH: 6500,
        HEIGHT: 6500,
        MODE: "tdm",
        TEAMS: 4,
        BOTS: 24,
        ROOM_SETUP: [
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "bap1", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas4", "bap4", "norm"],
            ["norm", "bas1", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas4", "bas4", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "bas3", "bas3", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "bas2", "norm"],
            ["norm", "bap3", "bas3", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "bap2", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"]
        ],
        secondaryGameMode: "Maze"
    },
    "2TDM": {
        MODE: "tdm",
        TEAMS: 2,
        ROOM_SETUP: [
            ["rock", "rock", "norm", "norm", "norm", "roid", "roid", "norm", "norm", "norm", "rock", "rock"],
            ["roid", "rock", "norm", "norm", "norm", "rock", "rock", "norm", "norm", "norm", "rock", "roid"],
            ["bas1", "norm", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "norm", "bas2"],
            ["bas1", "norm", "norm", "norm", "norm", "roid", "rock", "norm", "norm", "norm", "norm", "bas2"],
            ["bap1", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "bap2"],
            ["bas1", "norm", "norm", "rock", "nest", "nest", "nest", "nest", "roid", "norm", "norm", "bas2"],
            ["bas1", "norm", "norm", "roid", "nest", "nest", "nest", "nest", "rock", "norm", "norm", "bas2"],
            ["bap1", "norm", "norm", "norm", "norm", "nest", "nest", "norm", "norm", "norm", "norm", "bap2"],
            ["bas1", "norm", "norm", "norm", "norm", "rock", "roid", "norm", "norm", "norm", "norm", "bas2"],
            ["bas1", "norm", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "norm", "bas2"],
            ["roid", "rock", "norm", "norm", "norm", "rock", "rock", "norm", "norm", "norm", "rock", "roid"],
            ["rock", "rock", "norm", "norm", "norm", "roid", "roid", "norm", "norm", "norm", "rock", "rock"]
        ],
        BOTS: 16
    },
    "4TDM": {
        MODE: "tdm",
        TEAMS: 4,
        ROOM_SETUP: [
            ["bap1", "bas1", "norm", "norm", "norm", "roid", "roid", "norm", "norm", "norm", "bas3", "bap3"],
            ["bas1", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas3", "bas3"],
            ["norm", "norm", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "roid", "nest", "nest", "norm", "roid", "norm", "norm", "norm"],
            ["roid", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "roid"],
            ["roid", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "roid"],
            ["norm", "norm", "norm", "norm", "roid", "nest", "nest", "norm", "roid", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "norm", "norm"],
            ["bas4", "bas4", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "bas2"],
            ["bap4", "bas4", "norm", "norm", "norm", "roid", "roid", "norm", "norm", "norm", "bas2", "bap2"]
        ]
    },
    "Siege": {
        MODE: "tdm",
        TEAMS: 1,
        SPECIAL_BOSS_SPAWNS: true,
        WIDTH: 5500,
        HEIGHT: 5500,
        X_GRID: 19,
        Y_GRID: 19,
        ROOM_SETUP: [
            ["outb", "outb", "outb", "outb", "outb", "outb", "outb", "wall", "wall", "wall", "wall", "wall", "outb", "outb", "outb", "outb", "outb", "outb", "outb"],
            ["outb", "outb", "outb", "outb", "outb", "outb", "outb", "wall", "boss", "boss", "boss", "wall", "outb", "outb", "outb", "outb", "outb", "outb", "outb"],
            ["outb", "outb", "outb", "outb", "outb", "outb", "outb", "wall", "boss", "boss", "boss", "wall", "outb", "outb", "outb", "outb", "outb", "outb", "outb"],
            ["outb", "outb", "outb", "outb", "wall", "wall", "wall", "wall", "boss", "boss", "boss", "wall", "wall", "wall", "wall", "outb", "outb", "outb", "outb"],
            ["outb", "outb", "outb", "wall", "wall", "norm", "norm", "wall", "norm", "norm", "norm", "wall", "norm", "norm", "wall", "wall", "outb", "outb", "outb"],
            ["outb", "outb", "outb", "wall", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "wall", "outb", "outb", "outb"],
            ["outb", "outb", "outb", "wall", "norm", "norm", "bas1", "norm", "norm", "norm", "norm", "norm", "bas1", "norm", "norm", "wall", "outb", "outb", "outb"],
            ["wall", "wall", "wall", "wall", "wall", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "wall", "wall", "wall", "wall", "wall"],
            ["wall", "boss", "boss", "boss", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "boss", "boss", "boss", "wall"],
            ["wall", "boss", "boss", "boss", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "boss", "boss", "boss", "wall"],
            ["wall", "boss", "boss", "boss", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "boss", "boss", "boss", "wall"],
            ["wall", "wall", "wall", "wall", "wall", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "wall", "wall", "wall", "wall", "wall"],
            ["outb", "outb", "outb", "wall", "norm", "norm", "bas1", "norm", "norm", "norm", "norm", "norm", "bas1", "norm", "norm", "wall", "outb", "outb", "outb"],
            ["outb", "outb", "outb", "wall", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "wall", "outb", "outb", "outb"],
            ["outb", "outb", "outb", "wall", "wall", "norm", "norm", "wall", "norm", "norm", "norm", "wall", "norm", "norm", "wall", "wall", "outb", "outb", "outb"],
            ["outb", "outb", "outb", "outb", "wall", "wall", "wall", "wall", "boss", "boss", "boss", "wall", "wall", "wall", "wall", "outb", "outb", "outb", "outb"],
            ["outb", "outb", "outb", "outb", "outb", "outb", "outb", "wall", "boss", "boss", "boss", "wall", "outb", "outb", "outb", "outb", "outb", "outb", "outb"],
            ["outb", "outb", "outb", "outb", "outb", "outb", "outb", "wall", "boss", "boss", "boss", "wall", "outb", "outb", "outb", "outb", "outb", "outb", "outb"],
            ["outb", "outb", "outb", "outb", "outb", "outb", "outb", "wall", "wall", "wall", "wall", "wall", "outb", "outb", "outb", "outb", "outb", "outb", "outb"],
        ],
        secondaryGameMode: "Boss Rush",
        BOTS: 6
    },
    "Mothership": {
        MODE: "tdm",
        TEAMS: (Math.random() * 3 | 0) + 2,
        MOTHERSHIP_LOOP: true,
        secondaryGameMode: "Mothership",
        BOTS: 24
    },
    "Portal Mothership": {
        BOTS: 10,
        X_GRID: 15,
        Y_GRID: 15,
        WIDTH: 5000,
        HEIGHT: 5000,
        ROOM_SETUP: [
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "rock", "rock", "rock", "norm", "norm", "rock", "rock", "rock", "norm", "norm", "rock", "rock", "rock", "norm"],
            ["norm", "rock", "port", "rock", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "rock", "port", "rock", "norm"],
            ["norm", "rock", "rock", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "rock", "rock", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "roid", "rock", "rock", "rock", "roid", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "rock", "norm", "norm", "norm", "rock", "nest", "nest", "nest", "rock", "norm", "norm", "norm", "rock", "norm"],
            ["norm", "rock", "roid", "norm", "norm", "rock", "nest", "port", "nest", "rock", "norm", "norm", "roid", "rock", "norm"],
            ["norm", "rock", "norm", "norm", "norm", "rock", "nest", "nest", "nest", "rock", "norm", "norm", "norm", "rock", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "roid", "rock", "rock", "rock", "roid", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "rock", "rock", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "rock", "rock", "norm"],
            ["norm", "rock", "port", "rock", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "rock", "port", "rock", "norm"],
            ["norm", "rock", "rock", "rock", "norm", "norm", "rock", "rock", "rock", "norm", "norm", "rock", "rock", "rock", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ],
        MODE: "tdm",
        TEAMS: (Math.random() * 3 | 0) + 2,
        MOTHERSHIP_LOOP: true,
        secondaryGameMode: "Mothership"
    },
    "Tag": {
        MODE: "tdm",
        TEAMS: (Math.random() * 3 | 0) + 2,
        TAG: true,
        secondaryGameMode: "Tag",
        BOTS: 10
    },
    "Portal Tag": {
        BOTS: 10,
        X_GRID: 15,
        Y_GRID: 15,
        WIDTH: 5000,
        HEIGHT: 5000,
        ROOM_SETUP: [
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "rock", "rock", "rock", "norm", "norm", "rock", "rock", "rock", "norm", "norm", "rock", "rock", "rock", "norm"],
            ["norm", "rock", "port", "rock", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "rock", "port", "rock", "norm"],
            ["norm", "rock", "rock", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "rock", "rock", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "roid", "rock", "rock", "rock", "roid", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "rock", "norm", "norm", "norm", "rock", "nest", "nest", "nest", "rock", "norm", "norm", "norm", "rock", "norm"],
            ["norm", "rock", "roid", "norm", "norm", "rock", "nest", "port", "nest", "rock", "norm", "norm", "roid", "rock", "norm"],
            ["norm", "rock", "norm", "norm", "norm", "rock", "nest", "nest", "nest", "rock", "norm", "norm", "norm", "rock", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "roid", "rock", "rock", "rock", "roid", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "rock", "rock", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "rock", "rock", "norm"],
            ["norm", "rock", "port", "rock", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "rock", "port", "rock", "norm"],
            ["norm", "rock", "rock", "rock", "norm", "norm", "rock", "rock", "rock", "norm", "norm", "rock", "rock", "rock", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
        ],
        MODE: "tdm",
        TEAMS: (Math.random() * 3 | 0) + 2,
        TAG: true,
        secondaryGameMode: "Tag",
        BOTS: 24
    },
    "Domination": {
        MODE: "tdm",
        TEAMS: (Math.random() * 3 | 0) + 2,
        X_GRID: 15,
        Y_GRID: 15,
        ROOM_SETUP: [
            ["roid", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "roid"],
            ["rock", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "rock"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "dom0", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "dom0", "norm", "norm", "norm", "nest", "dom0", "nest", "norm", "norm", "norm", "dom0", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "dom0", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["rock", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "rock"],
            ["roid", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "roid"]
        ],
        DOMINATOR_LOOP: true,
        secondaryGameMode: "Domination",
        BOTS: 24
    },
    "Portal Domination": {
        MODE: "tdm",
        TEAMS: (Math.random() * 3 | 0) + 2,
        X_GRID: 15,
        Y_GRID: 15,
        ROOM_SETUP: [
            ["roid", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "roid"],
            ["rock", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "rock"],
            ["norm", "norm", "port", "norm", "norm", "norm", "norm", "dom0", "norm", "norm", "norm", "norm", "port", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "dom0", "norm", "norm", "norm", "nest", "dom0", "nest", "norm", "norm", "norm", "dom0", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "port", "norm", "norm", "norm", "norm", "dom0", "norm", "norm", "norm", "norm", "port", "norm", "norm"],
            ["rock", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "rock"],
            ["roid", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "roid"]
        ],
        DOMINATOR_LOOP: true,
        secondaryGameMode: "Domination",
        BOTS: 24
    },
    "2TDM Domination": {
        MODE: "tdm",
        TEAMS: 2,
        X_GRID: 15,
        Y_GRID: 15,
        ROOM_SETUP: [
            ["bap1", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["bas1", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "dom0", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "dom0", "norm", "norm", "norm", "nest", "dom0", "nest", "norm", "norm", "norm", "dom0", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "dom0", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "bas2"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "bap2"]
        ],
        DOMINATOR_LOOP: true,
        secondaryGameMode: "Domination",
        BOTS: 24
    },
    "4TDM Domination": {
        MODE: "tdm",
        TEAMS: 4,
        X_GRID: 15,
        Y_GRID: 15,
        WIDTH: 6500,
        HEIGHT: 6500,
        ROOM_SETUP: [
            ["bap1", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas3", "bap3"],
            ["bas1", "bas1", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas3", "bas3"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "dom0", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "dom0", "norm", "norm", "norm", "nest", "dom0", "nest", "norm", "norm", "norm", "dom0", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "dom0", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["bas4", "bas4", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "bas2"],
            ["bap4", "bas4", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "bas2", "bap2"]
        ],
        DOMINATOR_LOOP: true,
        secondaryGameMode: "Domination",
        BOTS: 24
    },
    "Space": {
        MODE: "tdm",
        TEAMS: 3,
        ARENA_TYPE: "circle",
        SPACE_MODE: true,
        WIDTH: 5000,
        HEIGHT: 5000,
        X_GRID: 9,
        Y_GRID: 9,
        ROOM_SETUP: [
            ["rock", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "rock"],
            ["norm", "norm", "norm", "norm", "rock", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["roid", "rock", "norm", "norm", "nest", "norm", "norm", "rock", "roid"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "rock", "norm", "norm", "norm", "norm"],
            ["rock", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "rock"]
        ],
        BOTS: 6,
        secondaryGameMode: "Space"
    },
    "Space 4TDM": {
        MODE: "tdm",
        TEAMS: 4,
        ARENA_TYPE: "circle",
        SPACE_MODE: true,
        WIDTH: 5000,
        HEIGHT: 5000,
        X_GRID: 9,
        Y_GRID: 9,
        ROOM_SETUP: [
            ["rock", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "rock"],
            ["norm", "norm", "norm", "norm", "bas1", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["roid", "bas2", "norm", "norm", "nest", "norm", "norm", "bas4", "roid"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm"],
            ["norm", "norm", "norm", "norm", "bas3", "norm", "norm", "norm", "norm"],
            ["rock", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "rock"]
        ],
        BOTS: 6,
        secondaryGameMode: "Space"
    },
};

const mode = gamemodes[gamemode];

let output = {};
for (let key in defaults) {
    output[key] = defaults[key];
    if (mode[key]) output[key] = mode[key];
}

output.gameModeName = gamemode;
if (["Tag", "Domination", "Mothership"].includes(gamemode)) output.gameModeName = `${output.TEAMS} TDM ${gamemode}`;
if (gamemode === "Open TDM") output.gameModeName = `Open ${output.TEAMS} TDM`;

module.exports = {
    output
};