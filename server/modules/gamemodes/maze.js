/*jslint node: true */
/*jshint -W061 */
/*global goog, Map, let */
"use strict";
// General requires
require('google-closure-library');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.QuadTree');

let locsToAvoid = ["nest", "port"];
for (let i = 1; i < 5; i++) locsToAvoid.push("bas" + i), locsToAvoid.push("bap" + i);
let activeLocsThatWeCantPlaceIn = 0;
for (let loc of locsToAvoid)
    if (room[loc].length) activeLocsThatWeCantPlaceIn += room[loc].length;

function generateMaze(size) {
    let maze = JSON.parse(JSON.stringify(Array(size).fill(Array(size).fill(true))));
    maze[0] = Array(size).fill(false);
    maze[size - 1] = Array(size).fill(false);
    maze[Math.floor(size * 0.15)] = [true, true, true, true, true, true, ...Array(size - 12).fill(false), true, true, true, true, true, true];
    maze[size - Math.floor(size * 0.15)] = [true, true, true, true, true, true, ...Array(size - 12).fill(false), true, true, true, true, true, true];
    maze[Math.floor(size * 0.5)] = Array(size).fill(false);
    let e = 0.25;
    let d = 0.4;
    maze[Math.floor(size * e)] = Array(size).fill(false);
    maze[Math.floor(size * (1 - e))] = Array(size).fill(false);
    maze[Math.floor(size * d)] = Array(size).fill(false);
    maze[Math.floor(size * (1 - d))] = Array(size).fill(false);
    for (let line of maze) {
        let i = maze.indexOf(line);
        line[0] = 0;
        line[size - 1] = 0;
        if (i > 6 && i < size - 6) line[Math.floor(size * 0.15)] = false;
        if (i > 6 && i < size - 6) line[size - Math.floor(size * 0.15)] = false;
        if (i > 6 && i < size - 6) line[Math.floor(size * e)] = false;
        if (i > 6 && i < size - 6) line[Math.floor(size * (1 - e))] = false;
        if (i > 6 && i < size - 6) line[Math.floor(size * d)] = false;
        if (i > 6 && i < size - 6) line[Math.floor(size * (1 - d))] = false;
        line[Math.floor(size * 0.5)] = false;
    }
    let center = Math.floor(size * (size === 16 ? 0.4 : 0.5));
    for (let x = 0; x < Math.floor(size * 0.1); x++)
        for (let y = 0; y < Math.floor(size * 0.1); y++) {
            maze[center + x][center + y] = false;
            maze[center - x][center - y] = false;
            maze[center + x][center - y] = false;
            maze[center - x][center + y] = false;
        }
    let cells = 0;
    for (let row of maze)
        for (let cell of row)
            if (cell) cells++;
    let eroded = 0;
    let toErode = cells * 0.55;
    toErode -= activeLocsThatWeCantPlaceIn * 10;
    for (let i = 0; i < toErode; i++) {
        if (eroded >= toErode) {
            console.log("Done!");
            break;
        }
        for (let i = 0; i < 10000; i++) {
            let x = Math.floor(Math.random() * size);
            let y = Math.floor(Math.random() * size);
            if (maze[x][y]) continue;
            if ((x === 0 || x === size - 1) && (y === 0 || y === size - 1)) continue;
            let direction = Math.floor(Math.random() * 4);
            if (x === 0) direction = 0;
            else if (y === 0) direction = 1;
            else if (x === size - 1) direction = 2;
            else if (y === size - 1) direction = 3;
            let tx = direction === 0 ? x + 1 : direction === 2 ? x - 1 : x;
            let ty = direction === 1 ? y + 1 : direction === 3 ? y - 1 : y;
            if (maze[tx][ty] !== true) continue;
            maze[tx][ty] = false;
            eroded++;
            break;
        }
    }
    if (eroded) {
        for (let x = 0; x < size - 1; x++)
            for (let y = 0; y < size - 1; y++)
                if (maze[x][y] && maze[x + 1][y] && maze[x + 2][y] && maze[x][y + 1] && maze[x][y + 2] && maze[x + 1][y + 2] && maze[x + 2][y + 1] && maze[x + 1][y + 1] && maze[x + 2][y + 2]) {
                    maze[x][y] = 3;
                    maze[x + 1][y] = false;
                    maze[x][y + 1] = false;
                    maze[x + 2][y] = false;
                    maze[x][y + 2] = false;
                    maze[x + 2][y + 1] = false;
                    maze[x + 1][y + 2] = false;
                    maze[x + 1][y + 1] = false;
                    maze[x + 2][y + 2] = false;
                } else if (maze[x][y] && maze[x + 1][y] && maze[x][y + 1] && maze[x + 1][y + 1]) {
            maze[x][y] = 2;
            maze[x + 1][y] = false;
            maze[x][y + 1] = false;
            maze[x + 1][y + 1] = false;
        }
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                let spawnWall = true;
                let d = {};
                let scale = room.width / size;
                if (maze[x][y] === 3) d = {
                    x: (x * scale) + (scale * 1.5),
                    y: (y * scale) + (scale * 1.5),
                    s: scale * 3,
                    sS: 5
                };
                else if (maze[x][y] === 2) d = {
                    x: (x * scale) + scale,
                    y: (y * scale) + scale,
                    s: scale * 2,
                    sS: 2.5
                };
                else if (maze[x][y]) d = {
                    x: (x * scale) + (scale * 0.5),
                    y: (y * scale) + (scale * 0.5),
                    s: scale,
                    sS: 1
                };
                else spawnWall = false;
                if (spawnWall) {
                    let o = new Entity({
                        x: d.x,
                        y: d.y
                    });
                    o.define(Class.mazeWall);
                    o.SIZE = (d.s * 0.5) + d.sS;
                    o.team = -101;
                    o.protect();
                    o.life();
                    let validSpawn = true;
                    for (let loc of locsToAvoid)
                        if (room.isIn(loc, {
                                x: d.x,
                                y: d.y
                            }, true)) validSpawn = false;
                    if (!validSpawn) o.kill();
                }
            }
        }
    }
};

module.exports = {
    generateMaze
};