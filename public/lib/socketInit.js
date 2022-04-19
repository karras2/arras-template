import {
    global
} from "./global.js";
import {
    util
} from "./util.js";
import {
    config
} from "./config.js";
import {
    protocol
} from "./protocol.js";
let {
    socketInit,
    gui,
    leaderboard,
    minimap,
    moveCompensation,
    lag,
    getNow
} = (function() {
    var sync = [];
    var clockDiff = 0;
    var serverStart = 0,
        gui = {
            getStatNames: num => {
                switch (num) {
                    case 1:
                        return ['Body Damage', 'Max Health', 'Bullet Speed', 'Bullet Health', 'Bullet Penetration', 'Bullet Damage', 'Engine Acceleration', 'Movement Speed', 'Shield Regeneration', 'Shield Capacity'];
                    case 2:
                        return ['Body Damage', 'Max Health', 'Drone Speed', 'Drone Health', 'Drone Penetration', 'Drone Damage', 'Respawn Rate', 'Movement Speed', 'Shield Regeneration', 'Shield Capacity'];
                    case 3:
                        return ['Body Damage', 'Max Health', 'Drone Speed', 'Drone Health', 'Drone Penetration', 'Drone Damage', 'Max Drone Count', 'Movement Speed', 'Shield Regeneration', 'Shield Capacity'];
                    case 4:
                        return ['Body Damage', 'Max Health', 'Swarm Speed', 'Swarm Health', 'Swarm Penetration', 'Swarm Damage', 'Reload', 'Movement Speed', 'Shield Regeneration', 'Shield Capacity'];
                    case 5:
                        return ['Body Damage', 'Max Health', 'Placement Speed', 'Trap Health', 'Trap Penetration', 'Trap Damage', 'Reload', 'Movement Speed', 'Shield Regeneration', 'Shield Capacity'];
                    case 6:
                        return ['Body Damage', 'Max Health', 'Weapon Speed', 'Weapon Health', 'Weapon Penetration', 'Weapon Damage', 'Reload', 'Movement Speed', 'Shield Regeneration', 'Shield Capacity'];
                    default:
                        return ['Body Damage', 'Max Health', 'Bullet Speed', 'Bullet Health', 'Bullet Penetration', 'Bullet Damage', 'Reload', 'Movement Speed', 'Shield Regeneration', 'Shield Capacity'];
                }
            },
            skills: [{
                amount: 0,
                color: 'purple',
                cap: 1,
                softcap: 1,
            }, {
                amount: 0,
                color: 'pink',
                cap: 1,
                softcap: 1,
            }, {
                amount: 0,
                color: 'blue',
                cap: 1,
                softcap: 1,
            }, {
                amount: 0,
                color: 'lgreen',
                cap: 1,
                softcap: 1,
            }, {
                amount: 0,
                color: 'red',
                cap: 1,
                softcap: 1,
            }, {
                amount: 0,
                color: 'yellow',
                cap: 1,
                softcap: 1,
            }, {
                amount: 0,
                color: 'green',
                cap: 1,
                softcap: 1,
            }, {
                amount: 0,
                color: 'teal',
                cap: 1,
                softcap: 1,
            }, {
                amount: 0,
                color: 'gold',
                cap: 1,
                softcap: 1,
            }, {
                amount: 0,
                color: 'orange',
                cap: 1,
                softcap: 1,
            }],
            points: 0,
            upgrades: [],
            playerid: -1,
            __s: (() => {
                let truscore = 0;
                let levelscore = 0;
                let deduction = 0;
                let level = 0;
                let score = util.Smoothbar(0, 10);
                return {
                    setScore: s => {
                        if (s) {
                            score.set(s);
                            if (deduction > score.get()) {
                                level = 0;
                                deduction = 0;
                            }
                        } else {
                            score = util.Smoothbar(0, 10);
                            level = 0;
                        }
                    },
                    update: () => {
                        levelscore = Math.ceil(1.8 * Math.pow(level + 1, 1.8) - 2 * level + 1);
                        if (score.get() - deduction >= levelscore) {
                            deduction += levelscore;
                            level += 1;
                        }
                    },
                    getProgress: () => {
                        return (levelscore) ? Math.min(1, Math.max(0, (score.get() - deduction) / levelscore)) : 0;
                    },
                    getScore: () => score.get(),
                    getLevel: () => {
                        return level;
                    },
                };
            })(),
            type: 0,
            fps: 0,
            color: 0,
            accel: 0,
            topspeed: 1,
        };
    var moveCompensation = (() => {
        let xx = 0,
            yy = 0,
            vx = 0,
            vy = 0;
        return {
            reset: () => {
                xx = 0;
                yy = 0;
            },
            get: () => {
                if (config.lag.unresponsive) {
                    return {
                        x: 0,
                        y: 0,
                    };
                }
                return {
                    x: xx,
                    y: yy,
                };
            },
            iterate: (g) => {
                if (global.died || global.gameStart) return 0;
                // Add motion
                let damp = gui.accel / gui.topSpeed,
                    len = Math.sqrt(g.x * g.x + g.y * g.y);
                vx += gui.accel * g.x / len;
                vy += gui.accel * g.y / len;
                // Dampen motion
                let motion = Math.sqrt(vx * vx + vy * vy);
                if (motion > 0 && damp) {
                    let finalvelocity = motion / (damp / config.roomSpeed + 1);
                    vx = finalvelocity * vx / motion;
                    vy = finalvelocity * vy / motion;
                }
                xx += vx;
                yy += vy;
            },
        };
    })();
    const Integrate = class {
        constructor(dataLength) {
            this.dataLength = dataLength;
            this.elements = {}
        }
        update(delta, index = 0) {
            let deletedLength = delta[index++]
            for (let i = 0; i < deletedLength; i++) delete this.elements[delta[index++]]
            let updatedLength = delta[index++]
            for (let i = 0; i < updatedLength; i++) {
                let id = delta[index++]
                let data = delta.slice(index, index + this.dataLength)
                index += this.dataLength
                this.elements[id] = data
            }
            return index
        }
        entries() {
            return Object.entries(this.elements).map(([id, data]) => ({
                id: +id,
                data
            }))
        }
    }
    const Minimap = class {
        constructor(speed = 250) {
            this.speed = speed
            this.map = {}
            this.lastUpdate = Date.now()
        }
        update(elements) {
            this.lastUpdate = Date.now()
            for (let [key, value] of Object.entries(this.map))
                if (value.now) {
                    value.old = value.now
                    value.now = null
                } else {
                    delete this.map[key]
                }
            for (let element of elements)
                if (this.map[element.id]) {
                    this.map[element.id].now = element
                } else {
                    this.map[element.id] = {
                        old: null,
                        now: element
                    }
                }
        }
        get() {
            let state = Math.min(1, (Date.now() - this.lastUpdate) / this.speed)
            let stateOld = 1 - state
            return Object.values(this.map).map(({
                old,
                now
            }) => {
                if (!now) return {
                    type: old.type,
                    id: old.id,
                    x: old.x,
                    y: old.y,
                    color: old.color,
                    size: old.size,
                    alpha: stateOld,
                    width: old.width,
                    height: old.height
                }
                if (!old) return {
                    type: now.type,
                    id: now.id,
                    x: now.x,
                    y: now.y,
                    color: now.color,
                    size: now.size,
                    alpha: state,
                    width: now.width,
                    height: now.height
                }
                return {
                    type: now.type,
                    id: now.id,
                    x: state * now.x + stateOld * old.x,
                    y: state * now.y + stateOld * old.y,
                    color: now.color,
                    size: state * now.size + stateOld * old.size,
                    alpha: 1,
                    width: state * now.width + stateOld * old.width,
                    height: state * now.height + stateOld * old.height
                }
            })
        }
    }
    // Build the leaderboard object
    const Entry = class {
        constructor(to) {
            this.score = util.Smoothbar(0, 10, 3, .03);
            this.update(to);
        }
        update(to) {
            this.name = to.name;
            this.bar = to.bar;
            if (typeof to.bar === "string" && to.bar.includes(", ")) this.bar = +to.bar.split(", ")[0];
            this.color = to.color;
            this.index = to.index;
            this.score.set(to.score);
            this.old = false;
            this.nameColor = to.nameColor;
        }
        publish() {
            let ref = global.mockups[this.index];
            return {
                image: util.getEntityImageFromMockup(this.index, this.color),
                position: ref.position,
                barColor: this.bar,
                label: this.name ? this.name + " - " + ref.name : ref.name,
                score: this.score.get(),
                nameColor: this.nameColor
            };
        }
    };
    const Leaderboard = class {
        constructor() {
            this.entries = {};
        }
        get() {
            let out = [];
            let max = 1;
            for (let value of Object.values(this.entries)) {
                let data = value.publish();
                out.push(data);
                if (data.score > max) max = data.score;
            }
            out.sort((a, b) => b.score - a.score);
            return {
                data: out,
                max
            };
        }
        update(elements) {
            elements.sort((a, b) => b.score - a.score);
            for (let value of Object.values(this.entries)) value.old = true;
            for (let element of elements)
                if (this.entries[element.id]) this.entries[element.id].update(element);
                else this.entries[element.id] = new Entry(element);
            for (let [id, value] of Object.entries(this.entries))
                if (value.old) delete this.entries[id];
        }
    };
    let minimapAllInt = new Integrate(5),
        minimapTeamInt = new Integrate(3),
        leaderboardInt = new Integrate(6),
        leaderboard = new Leaderboard(),
        minimap = new Minimap(200);
    var lag = (() => {
        let lags = [];
        return {
            get: () => {
                if (!lags.length) return 0;
                var sum = lags.reduce(function(a, b) {
                    return a + b;
                });
                return sum / lags.length;
            },
            add: l => {
                lags.push(l);
                if (lags.length > config.lag.memory) {
                    lags.splice(0, 1);
                }
            }
        };
    })();
    var getNow = () => {
        return Date.now() - clockDiff - serverStart;
    };
    const socketInit = ((global, util, protocol) => {
        // Inital setup stuff
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        // This is what we use to figure out what the hell the server is telling us to look at
        const convert = (() => {
            // Make a data crawler
            const get = (() => {
                let index = 0,
                    crawlData = [];
                return {
                    next: () => {
                        if (index >= crawlData.length) {
                            console.log(crawlData);
                            throw new Error('Trying to crawl past the end of the provided data!');
                        } else {
                            return crawlData[index++];
                        }
                    },
                    set: (data) => {
                        crawlData = data;
                        index = 0;
                    },
                    all: () => crawlData.slice(index),
                    take: amount => {
                        index += amount;
                        if (index > crawlData.length) {
                            console.error(crawlData);
                            throw new Error("Trying to crawl past the end of the provided data!");
                        }
                    }
                };
            })();
            // Return our handlers
            return {
                begin: data => get.set(data),
                // Make a data convertor
                data: (() => {
                    // Make a converter
                    const process = (() => {
                        // Some status manager constructors
                        const GunContainer = (() => {
                            function physics(g) {
                                g.isUpdated = true;
                                if (g.motion || g.position) {
                                    // Simulate recoil
                                    g.motion -= 0.2 * g.position;
                                    g.position += g.motion;
                                    if (g.position < 0) { // Bouncing off the back
                                        g.position = 0;
                                        g.motion = -g.motion;
                                    }
                                    if (g.motion > 0) {
                                        g.motion *= 0.5;
                                    }
                                }
                            }
                            return (n) => {
                                let a = [];
                                for (let i = 0; i < n; i++) {
                                    a.push({
                                        motion: 0,
                                        position: 0,
                                        isUpdated: true,
                                    });
                                }
                                return {
                                    getPositions: () => a.map(g => {
                                        return g.position;
                                    }),
                                    update: () => {
                                        for (let instance of a) {
                                            physics(instance);
                                        }
                                    },
                                    fire: (i, power) => {
                                        if (a[i].isUpdated) a[i].motion += Math.sqrt(power) / 20;
                                        a[i].isUpdated = false;
                                    },
                                    length: a.length,
                                };
                            };
                        })();

                        function Status() {
                            let state = 'normal',
                                time = getNow();
                            return {
                                set: val => {
                                    if (val !== state || state === 'injured') {
                                        if (state !== 'dying') time = getNow();
                                        state = val;
                                    }
                                },
                                getFade: () => {
                                    return (state === 'dying' || state === 'killed') ? 1 - Math.min(1, (getNow() - time) / 300) : 1;
                                },
                                getColor: () => {
                                    return '#FFFFFF';
                                },
                                getBlend: () => {
                                    let o = (state === 'normal' || state === 'dying') ? 0 : 1 - Math.min(1, (getNow() - time) / 80);
                                    if (getNow() - time > 500 && state === 'injured') {
                                        state = 'normal';
                                    }
                                    return o;
                                }
                            };
                        }
                        // Return our function
                        return (z = {}) => {
                            let isNew = z.facing == null; // For whatever reason arguments.length is uglified poorly...
                            // Figure out what kind of data we're looking at
                            let type = get.next();
                            // Handle it appropiately
                            if (type & 0x01) { // issa turret
                                z.facing = get.next();
                                z.layer = get.next();
                            } else { // issa something real
                                z.interval = global.metrics.rendergap;
                                z.id = get.next();
                                // Determine if this is an new entity or if we already know about it
                                let iii = global.entities.findIndex(x => x.id === z.id);
                                if (iii !== -1) {
                                    // remove it if needed (this way we'll only be left with the dead/unused entities)
                                    z = global.entities.splice(iii, 1)[0];
                                }
                                // Change the use of the variable
                                isNew = iii === -1;
                                // If it's not new, save the memory data
                                if (!isNew) {
                                    z.render.draws = true; // yay!!
                                    z.render.lastx = z.x;
                                    z.render.lasty = z.y;
                                    z.render.lastvx = z.vx;
                                    z.render.lastvy = z.vy;
                                    z.render.lastf = z.facing;
                                    z.render.lastRender = global.player.time;
                                }
                                // Either way, keep pulling information
                                z.index = get.next();
                                z.x = get.next();
                                z.y = get.next();
                                z.vx = get.next();
                                z.vy = get.next();
                                z.size = get.next();
                                z.facing = get.next();
                                z.vfacing = get.next();
                                z.twiggle = get.next();
                                z.layer = get.next();
                                z.color = get.next();
                                // Update health, flagging as injured if needed
                                if (isNew) {
                                    z.health = get.next() / 255;
                                    z.shield = get.next() / 255;
                                } else {
                                    let hh = z.health,
                                        ss = z.shield;
                                    z.health = get.next() / 255;
                                    z.shield = get.next() / 255;
                                    // Update stuff
                                    if (z.health < hh || z.shield < ss) {
                                        z.render.status.set('injured');
                                    } else if (z.render.status.getFade() !== 1) {
                                        // If it turns out that we thought it was dead and it wasn't
                                        z.render.status.set('normal');
                                    }
                                }
                                z.alpha = get.next() / 255;
                                z.drawsHealth = !!(type & 0x02); // force to boolean
                                // Nameplates
                                if (type & 0x04) { // has a nameplate
                                    z.name = get.next();
                                    z.score = get.next();
                                }
                                z.nameplate = type & 0x04;
                                // If it's new, give it rendering information
                                if (isNew) {
                                    z.render = {
                                        draws: false,
                                        expandsWithDeath: z.drawsHealth,
                                        lastRender: global.player.time,
                                        x: z.x,
                                        y: z.y,
                                        lastx: z.x - global.metrics.rendergap * config.roomSpeed * (1000 / 30) * z.vx,
                                        lasty: z.y - global.metrics.rendergap * config.roomSpeed * (1000 / 30) * z.vy,
                                        lastvx: z.vx,
                                        lastvy: z.vy,
                                        lastf: z.facing,
                                        f: z.facing,
                                        h: z.health,
                                        s: z.shield,
                                        interval: global.metrics.rendergap,
                                        slip: 0,
                                        status: Status(),
                                        health: util.Smoothbar(z.health, 0.5, 5, .06),
                                        shield: util.Smoothbar(z.shield, 0.5, 5, .06),
                                    };
                                }
                                // Update the rendering healthbars
                                z.render.health.set(z.health);
                                z.render.shield.set(z.shield);
                                // Figure out if the class changed (and if so, refresh the guns and turrets)
                                if (!isNew && z.oldIndex !== z.index) isNew = true;
                                z.oldIndex = z.index;
                            }
                            // If it needs to have a gun container made, make one
                            let gunnumb = get.next();
                            if (isNew) {
                                z.guns = GunContainer(gunnumb);
                            } else if (gunnumb !== z.guns.length) {
                                throw new Error('Mismatch between data gun number and remembered gun number!');
                            }
                            // Decide if guns need to be fired one by one
                            for (let i = 0; i < gunnumb; i++) {
                                let time = get.next(),
                                    power = get.next();
                                if (time > global.player.lastUpdate - global.metrics.rendergap) { // shoot it
                                    z.guns.fire(i, power);
                                }
                            }
                            // Update turrets
                            let turnumb = get.next();
                            if (turnumb) {
                                let b = 1;
                            }
                            if (isNew) {
                                z.turrets = [];
                                for (let i = 0; i < turnumb; i++) {
                                    z.turrets.push(process());
                                }
                            } else {
                                if (z.turrets.length !== turnumb) {
                                    throw new Error('Mismatch between data turret number and remembered turret number!');
                                }
                                for (let tur of z.turrets) {
                                    tur = process(tur);
                                }
                            }
                            // Return our monsterous creation
                            return z;
                        };
                    })();
                    // And this is the function we return that crawls some given data and reports it
                    return () => {
                        // Set up the output thingy+
                        let output = [];
                        // Get the number of entities and work through them
                        for (let i = 0, len = get.next(); i < len; i++) {
                            output.push(process());
                        }
                        // Handle the dead/leftover entities
                        for (let e of global.entities) {
                            // Kill them
                            e.render.status.set((e.health === 1) ? 'dying' : 'killed');
                            // And only push them if they're not entirely dead and still visible
                            if (e.render.status.getFade() !== 0 && util.isInView(e.render.x - global.player.renderx, e.render.y - global.player.rendery, e.size, true)) {
                                output.push(e);
                            } else {
                                if (e.render.textobjs != null) {
                                    for (let o of e.render.textobjs) {
                                        o.remove();
                                    }
                                }
                            }
                        }
                        // Save the new entities list
                        global.entities = output;
                        global.entities.sort((a, b) => {
                            let sort = a.layer - b.layer;
                            if (!sort) sort = b.id - a.id;
                            if (!sort) throw new Error('tha fuq is up now');
                            return sort;
                        });
                    };
                })(),
                // Define our gui convertor
                gui: () => {
                    let index = get.next(),
                        // Translate the encoded index
                        indices = {
                            topspeed: index & 0x0100,
                            accel: index & 0x0080,
                            skills: index & 0x0040,
                            statsdata: index & 0x0020,
                            upgrades: index & 0x0010,
                            points: index & 0x0008,
                            score: index & 0x0004,
                            label: index & 0x0002,
                            fps: index & 0x0001,
                        };
                    // Operate only on the values provided
                    if (indices.fps) {
                        gui.fps = get.next();
                    }
                    if (indices.label) {
                        gui.type = get.next();
                        gui.color = get.next();
                        gui.playerid = get.next();
                    }
                    if (indices.score) {
                        gui.__s.setScore(get.next());
                    }
                    if (indices.points) {
                        gui.points = get.next();
                    }
                    if (indices.upgrades) {
                        gui.upgrades = [];
                        for (let i = 0, len = get.next(); i < len; i++) {
                            gui.upgrades.push(get.next());
                        }
                    }
                    if (indices.statsdata) {
                        for (let i = 9; i >= 0; i--) {
                            gui.skills[i].name = get.next();
                            gui.skills[i].cap = get.next();
                            gui.skills[i].softcap = get.next();
                        }
                    }
                    if (indices.skills) {
                        let skk = parseInt(get.next(), 36).toString(16);
                        skk = '0000000000'.substr(skk.length) + skk;
                        gui.skills[0].amount = parseInt(skk.slice(0, 1), 16);
                        gui.skills[1].amount = parseInt(skk.slice(1, 2), 16);
                        gui.skills[2].amount = parseInt(skk.slice(2, 3), 16);
                        gui.skills[3].amount = parseInt(skk.slice(3, 4), 16);
                        gui.skills[4].amount = parseInt(skk.slice(4, 5), 16);
                        gui.skills[5].amount = parseInt(skk.slice(5, 6), 16);
                        gui.skills[6].amount = parseInt(skk.slice(6, 7), 16);
                        gui.skills[7].amount = parseInt(skk.slice(7, 8), 16);
                        gui.skills[8].amount = parseInt(skk.slice(8, 9), 16);
                        gui.skills[9].amount = parseInt(skk.slice(9, 10), 16);
                    }
                    if (indices.accel) {
                        gui.accel = get.next();
                    }
                    if (indices.topspeed) {
                        gui.topspeed = get.next();
                    }
                },
                broadcast: () => {
                    let all = get.all();
                    let by = minimapAllInt.update(all);
                    by = minimapTeamInt.update(all, by);
                    by = leaderboardInt.update(all, by);
                    get.take(by);
                    let map = [];
                    for (let {
                            id,
                            data
                        } of minimapAllInt.entries()) {
                        map.push({
                            id,
                            type: data[0],
                            x: (data[1] * global.gameWidth) / 255,
                            y: (data[2] * global.gameHeight) / 255,
                            color: data[3],
                            size: data[4]
                        });
                    }
                    for (let {
                            id,
                            data
                        } of minimapTeamInt.entries()) {
                        map.push({
                            id,
                            type: 0,
                            x: (data[0] * global.gameWidth) / 255,
                            y: (data[1] * global.gameHeight) / 255,
                            color: data[2],
                            size: 0
                        });
                    }
                    minimap.update(map);
                    let entries = [];
                    for (let {
                            id,
                            data
                        } of leaderboardInt.entries()) {
                        entries.push({
                            id,
                            score: data[0],
                            index: data[1],
                            name: data[2],
                            color: data[3],
                            bar: data[4],
                            nameColor: data[5]
                        })
                    }
                    leaderboard.update(entries);
                }
            };
        })();
        const protocols = {
            "http:": "ws://",
            "https:": "wss://"
        };
        // The initialization function (this is returned)
        return port => {
            window.resizeEvent();
            let socket = new WebSocket(protocols[location.protocol] + window.serverAdd);
            // Set up our socket
            socket.binaryType = 'arraybuffer';
            socket.open = false;
            // Handle commands
            socket.cmd = (() => {
                let flag = false;
                let commands = [
                    false, // up
                    false, // down
                    false, // left
                    false, // right
                    false, // lmb
                    false, // mmb
                    false, // rmb
                    false,
                ];
                return {
                    set: (index, value) => {
                        if (commands[index] !== value) {
                            commands[index] = value;
                            flag = true;
                        }
                    },
                    talk: () => {
                        flag = false;
                        let o = 0;
                        for (let i = 0; i < 8; i++) {
                            if (commands[i]) o += Math.pow(2, i);
                        }
                        let ratio = util.getRatio();
                        socket.talk('C', Math.round(window.canvas.target.x / ratio), Math.round(window.canvas.target.y / ratio), o);
                    },
                    check: () => {
                        return flag;
                    },
                    getMotion: () => {
                        return {
                            x: commands[3] - commands[2],
                            y: commands[1] - commands[0],
                        };
                    },
                };
            })();
            // Learn how to talk
            socket.talk = (...message) => {
                // Make sure the socket is open before we do anything
                if (!socket.open) return 1;
                socket.send(protocol.encode(message));
            };
            // Websocket functions for when stuff happens
            // This is for when the socket first opens
            socket.onopen = function socketOpen() {
                socket.open = true;
                global.message = 'That token is invalid, expired, or already in use on this server. Please try another one!';
                socket.talk('k', global.playerKey);
                console.log('Token submitted to the server for validation.');
                // define a pinging function
                socket.ping = (payload) => {
                    socket.talk('p', payload);
                };
                socket.commandCycle = setInterval(() => {
                    if (socket.cmd.check()) socket.cmd.talk();
                });
            };
            // Handle incoming messages
            socket.onmessage = function socketMessage(message) {
                // Make sure it looks legit.
                let m = protocol.decode(message.data);
                if (m === -1) {
                    throw new Error('Malformed packet.');
                }
                // Decide how to interpret it
                switch (m.splice(0, 1)[0]) {
                    case 'w': { // welcome to the game
                        if (m[0]) { // Ask to spawn
                            console.log('The server has welcomed us to the game room. Sending spawn request.');
                            socket.talk('s', global.playerName, 1);
                            global.message = '';
                        }
                    }
                    break;
                case 'R': { // room setup
                    global.gameWidth = m[0];
                    global.gameHeight = m[1];
                    global.roomSetup = JSON.parse(m[2]);
                    serverStart = JSON.parse(m[3]);
                    config.roomSpeed = m[4];
                    console.log('Room data recieved. Commencing syncing process.');
                    // Start the syncing process
                    socket.talk('S', getNow());
                }
                break;
                case "r": {
                    global.gameWidth = m[0];
                    global.gameHeight = m[1];
                    global.roomSetup = JSON.parse(m[2]);
                }
                break;
                case 'c': { // force camera move
                    global.player.renderx = global.player.cx = m[0];
                    global.player.rendery = global.player.cy = m[1];
                    global.player.renderv = global.player.view = m[2];
                    global.player.nameColor = m[3];
                    console.log('Camera moved!');
                }
                break;
                case 'S': { // clock syncing
                    let clientTime = m[0],
                        serverTime = m[1],
                        laten = (getNow() - clientTime) / 2,
                        delta = getNow() - laten - serverTime;
                    // Add the datapoint to the syncing data
                    sync.push({
                        delta: delta,
                        latency: laten,
                    });
                    // Do it again a couple times
                    if (sync.length < 10) {
                        // Wait a bit just to space things out
                        setTimeout(() => {
                            socket.talk('S', getNow());
                        }, 10);
                        global.message = "Syncing clocks, please do not tab away. " + sync.length + "/10...";
                    } else {
                        // Calculate the clock error
                        sync.sort((e, f) => {
                            return e.latency - f.latency;
                        });
                        let median = sync[Math.floor(sync.length / 2)].latency;
                        let sd = 0,
                            sum = 0,
                            valid = 0;
                        for (let e of sync) {
                            sd += Math.pow(e.latency - median, 2);
                        }
                        sd = Math.sqrt(sd / sync.length);
                        for (let e of sync) {
                            if (Math.abs(e.latency - median) < sd) {
                                sum += e.delta;
                                valid++;
                            }
                        }
                        clockDiff = Math.round(sum / valid);
                        // Start the game
                        console.log(sync);
                        console.log('Syncing complete, calculated clock difference ' + clockDiff + 'ms. Beginning game.');
                        global.gameStart = true;
                        global.entities = [];
                        global.message = '';
                    }
                }
                break;
                case 'm': { // message
                    global.messages.push({
                        text: m[0],
                        status: 2,
                        alpha: 0,
                        time: Date.now(),
                    });
                }
                break;
                case 'u': { // uplink
                    // Pull the camera info
                    let camtime = m[0],
                        camx = m[1],
                        camy = m[2],
                        camfov = m[3],
                        camvx = m[4],
                        camvy = m[5],
                        // We'll have to do protocol decoding on the remaining data
                        theshit = m.slice(6);
                    // Process the data
                    if (camtime > global.player.lastUpdate) { // Don't accept out-of-date information.
                        // Time shenanigans
                        lag.add(getNow() - camtime);
                        global.player.time = camtime + lag.get();
                        global.metrics.rendergap = camtime - global.player.lastUpdate;
                        if (global.metrics.rendergap <= 0) {
                            console.log('yo some bullshit is up wtf');
                        }
                        global.player.lastUpdate = camtime;
                        // Convert the gui and entities
                        convert.begin(theshit);
                        convert.gui();
                        convert.data();
                        // Save old physics values
                        global.player.lastx = global.player.cx;
                        global.player.lasty = global.player.cy;
                        global.player.lastvx = global.player.vx;
                        global.player.lastvy = global.player.vy;
                        // Get new physics values
                        global.player.cx = camx;
                        global.player.cy = camy;
                        global.player.vx = global.died ? 0 : camvx;
                        global.player.vy = global.died ? 0 : camvy;
                        // Figure out where we're rendering if we don't yet know
                        if (isNaN(global.player.renderx)) {
                            global.player.renderx = global.player.cx;
                        }
                        if (isNaN(global.player.rendery)) {
                            global.player.rendery = global.player.cy;
                        }
                        moveCompensation.reset();
                        // Fov stuff
                        global.player.view = camfov;
                        if (isNaN(global.player.renderv) || global.player.renderv === 0) {
                            global.player.renderv = 2000;
                        }
                        // Metrics
                        global.metrics.lastlag = global.metrics.lag;
                        global.metrics.lastuplink = getNow();
                    } else {
                        console.log("Old data! Last given time: " + global.player.time + "; offered packet timestamp: " + camtime + ".");
                    }
                    // Send the downlink and the target
                    socket.talk('d', Math.max(global.player.lastUpdate, camtime));
                    socket.cmd.talk();
                    global.updateTimes++; // metrics
                }
                break;
                case "b": {
                    convert.begin(m);
                    convert.broadcast();
                }
                break;
                case 'p': { // ping
                    global.metrics.latency = global.time - m[0];
                }
                break;
                case 'F': { // to pay respects
                    global.finalScore = util.Smoothbar(0, 4);
                    global.finalScore.set(m[0]);
                    global.finalLifetime = util.Smoothbar(0, 5);
                    global.finalLifetime.set(m[1]);
                    global.finalKills = [util.Smoothbar(0, 3), util.Smoothbar(0, 4.5), util.Smoothbar(0, 2.5)];
                    global.finalKills[0].set(m[2]);
                    global.finalKills[1].set(m[3]);
                    global.finalKills[2].set(m[4]);
                    global.finalKillers = [];
                    for (let i = 0; i < m[5]; i++) {
                        global.finalKillers.push(m[6 + i]);
                    }
                    window.animations.deathScreen.reset();
                    global.died = true;
                    window.onbeforeunload = () => {
                        return false;
                    };
                }
                break;
                case 'K': { // kicked
                    window.onbeforeunload = () => {
                        return false;
                    };
                }
                break;
                case 'z': { // name color
                    console.log(m[0]);
                    global.nameColor = m[0];
                }
                break;
                default:
                    throw new Error('Unknown message index.');
                }
            };
            // Handle closing
            socket.onclose = function socketClose() {
                socket.open = false;
                global.disconnected = true;
                clearInterval(socket.commandCycle);
                window.onbeforeunload = () => {
                    return false;
                };
                console.log('Socket closed.');
            };
            // Notify about errors
            socket.onerror = function socketError(error) {
                console.log('WebSocket error: ' + error);
                global.message = 'Socket error. Maybe another server will work.';
            };
            // Gift it to the rest of the world
            return socket;
        };
    })(global, util, protocol);
    return {
        socketInit,
        gui,
        leaderboard,
        minimap,
        moveCompensation,
        lag,
        getNow
    };
})();
export {
    socketInit,
    gui,
    leaderboard,
    minimap,
    moveCompensation,
    lag,
    getNow
}