import {
    util
} from "./lib/util.js";
import {
    global
} from "./lib/global.js";
import {
    config
} from "./lib/config.js";
import {
    Canvas
} from "./lib/canvas.js";
import {
    color
} from "./lib/color.js";
import * as socketStuff from "./lib/socketInit.js";
(async function(util, global, config, Canvas, color, socketStuff) {
    let {
        socketInit,
        gui,
        leaderboard,
        minimap,
        moveCompensation,
        lag,
        getNow
    } = socketStuff;
    fetch("changelog.md", {
        cache: "no-cache"
    }).then(response => response.text()).then(response => {
        const changelogs = response.split("\n\n").map(changelog => changelog.split("\n"));
        console.log(changelogs);
        changelogs.forEach(changelog => {
            changelog[0] = changelog[0].split(":").map(line => line.trim());
            document.getElementById("patchNotes").innerHTML += `<div><b>${changelog[0][0].slice(1).trim()}</b>: ${changelog[0].slice(1).join(":") || "Update lol"}<ul>${changelog.slice(1).map(line => `<li>${line.slice(1).trim()}</li>`).join("")}</ul><hr></div>`;
        });
    });
    util.pullJSON("mockups").then(data => global.mockups = data);
    let animations = ((module) => {
        class Animation {
            constructor(start, to, smoothness = .05) {
                this.start = start;
                this.to = to;
                this.value = start;
                this.smoothness = smoothness;
            }
            reset() {
                this.value = this.start;
                return this.value;
            }
            getLerp() {
                this.value = util.lerp(this.value, this.to, this.smoothness, true);
                return this.value;
            }
            getNoLerp() {
                this.value = this.to;
                return this.value;
            }
            get() {
                return config.graphical.fancyAnimations ? this.getLerp() : this.getNoLerp();
            }
            flip() {
                const start = this.to;
                const to = this.start;
                this.start = start;
                this.to = to;
            }
            goodEnough(val = .5) {
                return Math.abs(this.to - this.value) < val;
            }
        }
        let library = {};
        library.connecting = new Animation(1, 0);
        library.disconnected = new Animation(1, 0);
        library.deathScreen = new Animation(1, 0);
        library.upgradeMenu = new Animation(0, 1, 0.01);
        library.skillMenu = new Animation(0, 1, 0.01);
        library.optionsMenu = new Animation(1, 0);
        library.minimap = new Animation(-1, 1, 0.025);
        library.leaderboard = new Animation(-1, 1, 0.025);
        module.animations = library;
        return library;
    })(window);
    // Color functions
    let mixColors = (() => {
        /** https://gist.github.com/jedfoster/7939513 **/
        function d2h(d) {
            return d.toString(16);
        } // convert a decimal value to hex
        function h2d(h) {
            return parseInt(h, 16);
        } // convert a hex value to decimal
        return (color_2, color_1, weight = 0.5) => {
            if (weight === 1) return color_1;
            if (weight === 0) return color_2;
            var col = "#";
            for (var i = 1; i <= 6; i += 2) { // loop through each of the 3 hex pairs—red, green, and blue, skip the '#'
                var v1 = h2d(color_1.substr(i, 2)), // extract the current pairs
                    v2 = h2d(color_2.substr(i, 2)),
                    // combine the current pairs from each source color, according to the specified weight
                    val = d2h(Math.floor(v2 + (v1 - v2) * weight));
                while (val.length < 2) {
                    val = '0' + val;
                } // prepend a '0' if val results in a single digit
                col += val; // concatenate val to our new color string
            }
            return col; // PROFIT!
        };
    })();

    function getColor(colorNumber) {
        switch (colorNumber) {
            case 0:
                return color.teal;
            case 1:
                return color.lgreen;
            case 2:
                return color.orange;
            case 3:
                return color.yellow;
            case 4:
                return color.lavender;
            case 5:
                return color.pink;
            case 6:
                return color.vlgrey;
            case 7:
                return color.lgrey;
            case 8:
                return color.guiwhite;
            case 9:
                return color.black;
            case 10:
                return color.blue;
            case 11:
                return color.green;
            case 12:
                return color.red;
            case 13:
                return color.gold;
            case 14:
                return color.purple;
            case 15:
                return color.magenta;
            case 16:
                return color.grey;
            case 17:
                return color.dgrey;
            case 18:
                return color.white;
            case 19:
                return color.guiblack;
            default:
                return '#FF0000';
        }
    }

    function getColorDark(givenColor) {
        let dark = (config.graphical.neon) ? color.white : color.black;
        if (config.graphical.darkBorders) return dark;
        return mixColors(givenColor, dark, color.border);
    }

    function getZoneColor(cell, real) {
        switch (cell) {
            case 'bas1':
            case 'bap1':
            case 'dom1':
                return color.blue;
            case 'bas2':
            case 'bap2':
            case 'dom2':
                return color.green;
            case 'bas3':
            case 'bap3':
            case 'dom3':
            case 'boss':
                return color.red;
            case 'bas4':
            case 'bap4':
            case 'dom4':
                return color.magenta;
            case 'nest':
                return (real) ? color.purple : color.lavender;
            case 'dom0':
                return color.gold;
            default:
                return (real) ? color.white : color.lgrey;
        }
    }

    function setColor(context, givenColor) {
        if (config.graphical.neon) {
            context.fillStyle = getColorDark(givenColor);
            context.strokeStyle = givenColor;
        } else {
            context.fillStyle = givenColor;
            context.strokeStyle = getColorDark(givenColor);
        }
    }
    // Mockup functions
    // Prepare stuff
    global.player = { //Set up the player
        id: -1,
        x: global.screenWidth / 2,
        y: global.screenHeight / 2,
        vx: 0,
        vy: 0,
        cx: 0,
        cy: 0,
        renderx: global.screenWidth / 2,
        rendery: global.screenHeight / 2,
        renderv: 1,
        slip: 0,
        view: 1,
        time: 0,
        screenWidth: global.screenWidth,
        screenHeight: global.screenHeight,
        nameColor: "#ffffff"
    };
    var upgradeSpin = 0,
        lastPing = 0,
        renderTimes = 0;
    global.clearUpgrades = () => {
        gui.upgrades = [];
    };
    // Build the leaderboard object
    global.player = global.player;
    global.canUpgrade = false;
    global.canSkill = false;
    global.message = '';
    global.time = 0;
    // Window setup <3
    global.mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    var serverName = 'Connected';
    var provider = "Unknown";
    window.onload = () => {
        util.pullJSON("gamemodeData").then(json => {
            document.getElementById('serverName').innerHTML = `<h4 class="nopadding">${json.gameMode} | ${json.players} Players</h4>`;
        });
        // Save forms
        util.retrieveFromLocalStorage('playerNameInput');
        util.retrieveFromLocalStorage('playerKeyInput');
        util.retrieveFromLocalStorage('optScreenshotMode');
        util.retrieveFromLocalStorage('optPredictive');
        util.retrieveFromLocalStorage('optFancy');
        util.retrieveFromLocalStorage('coloredHealthbars');
        util.retrieveFromLocalStorage('optColors');
        util.retrieveFromLocalStorage('optNoPointy');
        util.retrieveFromLocalStorage('optBorders');
        // Set default theme
        if (document.getElementById('optColors').value === '') {
            document.getElementById('optColors').value = 'normal';
        }
        if (document.getElementById('optBorders').value === '') {
            document.getElementById('optBorders').value = 'normal';
        }
        // Game start stuff
        document.getElementById('startButton').onclick = () => startGame();
        document.onkeydown = e => {
            var key = e.which || e.keyCode;
            if (key === global.KEY_ENTER && (global.dead || !global.gameStart)) {
                startGame();
            }
        };
        window.addEventListener("resize", resizeEvent);
        // Resizing stuff
    };
    // Prepare canvas stuff
    function resizeEvent() {
        let scale = window.devicePixelRatio;
        if (!config.graphical.fancyAnimations) {
            scale *= .5;
        }
        c.width = global.screenWidth = window.innerWidth * scale;
        c.height = global.screenHeight = window.innerHeight * scale;
        global.ratio = scale;
        global.screenSize = Math.min(1920, Math.max(window.innerWidth, 1280));
    }
    window.resizeEvent = resizeEvent;
    window.canvas = new Canvas();
    var c = window.canvas.cv;
    var ctx = c.getContext('2d');
    var c2 = document.createElement('canvas');
    var ctx2 = c2.getContext('2d');
    ctx2.imageSmoothingEnabled = false;
    // Animation things
    function Smoothbar(value, speed, sharpness = 3, lerpValue = .025) {
        let time = Date.now();
        let display = value;
        let oldvalue = value;
        return {
            set: val => {
                if (value !== val) {
                    oldvalue = display;
                    value = val;
                    time = Date.now();
                }
            },
            get: (round = false) => {
                display = util.lerp(display, value, lerpValue);
                if (Math.abs(value - display) < 0.1 && round) display = value;
                return display;
            },
        };
    }
    global.player = {
        vx: 0,
        vy: 0,
        lastvx: 0,
        lastvy: 0,
        renderx: global.player.cx,
        rendery: global.player.cy,
        lastx: global.player.x,
        lasty: global.player.y,
        cx: 0,
        cy: 0,
        target: window.canvas.target,
        name: '',
        lastUpdate: 0,
        time: 0,
        nameColor: "#ffffff"
    };
    // This starts the game and sets up the websocket
    function startGame() {
        // Get options
        util.submitToLocalStorage('optScreenshotMode');
        config.graphical.screenshotMode = document.getElementById('optScreenshotMode').checked;
        util.submitToLocalStorage('optFancy');
        config.graphical.pointy = !document.getElementById('optNoPointy').checked;
        util.submitToLocalStorage('optNoPointy');
        config.graphical.fancyAnimations = !document.getElementById('optFancy').checked;
        util.submitToLocalStorage("coloredHealthbars");
        config.graphical.coloredHealthbars = document.getElementById('coloredHealthbars').checked;
        util.submitToLocalStorage('optPredictive');
        config.lag.unresponsive = document.getElementById('optPredictive').checked;
        util.submitToLocalStorage('optBorders');
        switch (document.getElementById('optBorders').value) {
            case 'normal':
                config.graphical.darkBorders = config.graphical.neon = false;
                break;
            case 'dark':
                config.graphical.darkBorders = true;
                config.graphical.neon = false;
                break;
            case 'glass':
                config.graphical.darkBorders = false;
                config.graphical.neon = true;
                break;
            case 'neon':
                config.graphical.darkBorders = config.graphical.neon = true;
                break;
        }
        util.submitToLocalStorage('optColors');
        let a = document.getElementById('optColors').value;
        color = color[(a === '') ? 'normal' : a];
        // Other more important stuff
        let playerNameInput = document.getElementById('playerNameInput');
        let playerKeyInput = document.getElementById('playerKeyInput');
        // Name and keys
        util.submitToLocalStorage('playerNameInput');
        util.submitToLocalStorage('playerKeyInput');
        global.playerName = global.player.name = playerNameInput.value;
        global.playerKey = playerKeyInput.value.replace(/(<([^>]+)>)/ig, '').substring(0, 64);
        // Change the screen
        global.screenWidth = window.innerWidth;
        global.screenHeight = window.innerHeight;
        document.getElementById('startMenuWrapper').style.maxHeight = '0px';
        document.getElementById('gameAreaWrapper').style.opacity = 1;
        // Set up the socket
        if (!global.socket) {
            global.socket = socketInit(3000);
        }
        if (!global.animLoopHandle) {
            animloop();
        }
        window.canvas.socket = global.socket;
        setInterval(() => moveCompensation.iterate(global.socket.cmd.getMotion()), 1000 / 30);
        document.getElementById('gameCanvas').focus();
        window.onbeforeunload = () => {
            return true;
        };
    }
    // Background clearing
    function clearScreen(clearColor, alpha) {
        ctx.fillStyle = clearColor;
        ctx.globalAlpha = alpha;
        ctx.fillRect(0, 0, global.screenWidth, global.screenHeight);
        ctx.globalAlpha = 1;
    }
    // Text functions
    const fontWidth = "bold";
    const measureText = (() => {
        return (text, fontSize, twod = false) => {
            fontSize += config.graphical.fontSizeBoost;
            ctx.font = fontWidth + ' ' + fontSize + 'px Ubuntu';
            return (twod) ? {
                width: ctx.measureText(text).width,
                height: fontSize
            } : ctx.measureText(text).width;
        };
    })();
    const TextObj = (() => {
        // A thing
        let floppy = (value = null) => {
            let flagged = true;
            // Methods
            return {
                update: newValue => {
                    let eh = false;
                    if (value == null) {
                        eh = true;
                    } else {
                        if (typeof newValue != typeof value) {
                            eh = true;
                        }
                        // Decide what to do based on what type it is
                        switch (typeof newValue) {
                            case 'number':
                            case 'string': {
                                if (newValue !== value) {
                                    eh = true;
                                }
                            }
                            break;
                        case 'object': {
                            if (Array.isArray(newValue)) {
                                if (newValue.length !== value.length) {
                                    eh = true;
                                } else {
                                    for (let i = 0, len = newValue.length; i < len; i++) {
                                        if (newValue[i] !== value[i]) eh = true;
                                    }
                                }
                                break;
                            }
                        } // jshint ignore:line
                        default:
                            //logger.error("Unsupported type for a floppyvar: " + newValue);
                            //throw new Error('Unsupported type for a floppyvar!');
                        }
                    }
                    // Update if neeeded
                    if (eh) {
                        flagged = true;
                        value = newValue;
                    }
                },
                publish: () => {
                    return value;
                },
                check: () => {
                    if (flagged) {
                        flagged = false;
                        return true;
                    }
                    return false;
                },
            };
        };
        // An index
        let index = 0;
        return () => {
            // Init stuff
            let floppies = [
                floppy(''),
                floppy(0),
                floppy(0),
                floppy(1),
                floppy('#FF0000'),
                floppy('left'),
            ];
            let vals = floppies.map(f => f.publish());
            let xx = 0;
            let yy = 0;
            return {
                draw: (text, x, y, size, fill, align = 'left', center = false, fade = 1, stroke = true, context = ctx) => {
                    size += config.graphical.fontSizeBoost;
                    // Update stuff
                    floppies[0].update(text);
                    floppies[1].update(x);
                    floppies[2].update(y);
                    floppies[3].update(size);
                    floppies[4].update(fill);
                    floppies[5].update(align);
                    // Check stuff
                    //if (floppies.some(f => f.check())) {
                    // Get text dimensions and resize/reset the canvas
                    let offset = size / 5;
                    let ratio = 1;
                    let transform = null;
                    context.getTransform && (transform = ctx.getTransform(), ratio = transform.d, offset *= ratio);
                    if (ratio !== 1) {
                        size *= ratio;
                    }
                    context.font = fontWidth + " " + size + 'px Ubuntu';
                    let dim = ctx.measureText(text);
                    // Redraw it
                    switch (align) {
                        case 'left':
                            xx = offset;
                            break;
                        case 'center':
                            xx = (dim.width + 2 * offset) / 2;
                            break;
                        case 'right':
                            xx = (dim.width + 2 * offset) - offset;
                    }
                    yy = (size + 2 * offset) / 2;
                    // Draw it
                    context.lineWidth = ((size + 1) / config.graphical.fontStrokeRatio);
                    context.font = fontWidth + ' ' + size + 'px Ubuntu';
                    context.textAlign = align;
                    context.textBaseline = 'middle';
                    context.strokeStyle = color.black;
                    context.fillStyle = fill;
                    context.save();
                    if (ratio !== 1) {
                        context.scale(1 / ratio, 1 / ratio);
                    }
                    context.lineCap = config.graphical.miterText ? 'miter' : 'round';
                    context.lineJoin = config.graphical.miterText ? 'miter' : 'round';
                    if (stroke) context.strokeText(text, xx + Math.round((x * ratio) - xx), yy + Math.round((y * ratio) - yy * (center ? 1.05 : 1.5)));
                    context.fillText(text, xx + Math.round((x * ratio) - xx), yy + Math.round((y * ratio) - yy * (center ? 1.05 : 1.5)));
                    context.restore();
                    //}
                },
                remove: () => {},
            };
        };
    })();
    // Gui drawing functions
    function drawGuiRect(x, y, length, height, stroke = false) {
        switch (stroke) {
            case true:
                ctx.strokeRect(x, y, length, height);
                break;
            case false:
                ctx.fillRect(x, y, length, height);
                break;
        }
    }

    function drawGuiCircle(x, y, radius, stroke = false) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        stroke ? ctx.stroke() : ctx.fill();
    }

    function drawGuiLine(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.lineTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5);
        ctx.lineTo(Math.round(x2) + 0.5, Math.round(y2) + 0.5);
        ctx.closePath();
        ctx.stroke();
    }

    function drawBar(x1, x2, y, width, color) {
        ctx.beginPath();
        ctx.lineTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.closePath();
        ctx.stroke();
    }
    // Entity drawing (this is a function that makes a function)
    const drawEntity = (() => {
        // Sub-drawing functions
        function drawPoly(context, centerX, centerY, radius, sides, angle = 0, fill = true) {
            angle += (sides % 2) ? 0 : Math.PI / sides;
            // Start drawing
            context.beginPath();
            if (!sides) { // Circle
                let fillcolor = context.fillStyle;
                let strokecolor = context.strokeStyle;
                radius += context.lineWidth / 4;
                context.arc(centerX, centerY, radius + context.lineWidth / 4, 0, 2 * Math.PI);
                context.fillStyle = strokecolor;
                context.fill();
                context.closePath();
                context.beginPath();
                context.arc(centerX, centerY, radius - context.lineWidth / 4, 0, 2 * Math.PI);
                context.fillStyle = fillcolor;
                context.fill();
                context.closePath();
                return;
            } else if (sides < 0) { // Star
                if (config.graphical.pointy) context.lineJoin = 'miter';
                let dip = 1 - (6 / sides / sides);
                sides = -sides;
                context.moveTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
                for (let i = 0; i < sides; i++) {
                    var theta = (i + 1) / sides * 2 * Math.PI;
                    var htheta = (i + 0.5) / sides * 2 * Math.PI;
                    var c = {
                        x: centerX + radius * dip * Math.cos(htheta + angle),
                        y: centerY + radius * dip * Math.sin(htheta + angle),
                    };
                    var p = {
                        x: centerX + radius * Math.cos(theta + angle),
                        y: centerY + radius * Math.sin(theta + angle),
                    };
                    context.quadraticCurveTo(c.x, c.y, p.x, p.y);
                }
            } else if (sides === 600) {
                for (let i = 0; i < 6; i++) {
                    let theta = (i / 6) * 2 * Math.PI,
                        x = centerX + radius * 1.1 * Math.cos(180 / 6 + theta + angle + 0.385),
                        y = centerY + radius * 1.1 * Math.sin(180 / 6 + theta + angle + 0.385);
                    context.lineTo(x, y);
                }
            } else if (sides > 0) { // Polygon
                for (let i = 0; i < sides; i++) {
                    let theta = (i / sides) * 2 * Math.PI;
                    let x = centerX + radius * Math.cos(theta + angle);
                    let y = centerY + radius * Math.sin(theta + angle);
                    context.lineTo(x, y);
                }
            }
            context.closePath();
            context.stroke();
            if (fill) {
                context.fill();
            }
            context.lineJoin = 'round';
        }

        function drawTrapezoid(context, x, y, length, height, aspect, angle) {
            let h = [];
            h = (aspect > 0) ? [height * aspect, height] : [height, -height * aspect];
            let r = [
                Math.atan2(h[0], length),
                Math.atan2(h[1], length)
            ];
            let l = [
                Math.sqrt(length * length + h[0] * h[0]),
                Math.sqrt(length * length + h[1] * h[1])
            ];
            context.beginPath();
            context.lineTo(x + l[0] * Math.cos(angle + r[0]), y + l[0] * Math.sin(angle + r[0]));
            context.lineTo(x + l[1] * Math.cos(angle + Math.PI - r[1]), y + l[1] * Math.sin(angle + Math.PI - r[1]));
            context.lineTo(x + l[1] * Math.cos(angle + Math.PI + r[1]), y + l[1] * Math.sin(angle + Math.PI + r[1]));
            context.lineTo(x + l[0] * Math.cos(angle - r[0]), y + l[0] * Math.sin(angle - r[0]));
            context.closePath();
            context.stroke();
            context.fill();
        }
        // The big drawing function
        return (x, y, instance, ratio, alpha = 1, scale = 1, rot = 0, turretsObeyRot = false, assignedContext = false, turretInfo = false, render = instance.render) => {
            let context = (assignedContext) ? assignedContext : ctx;
            let fade = turretInfo ? 1 : render.status.getFade(),
                drawSize = scale * ratio * instance.size,
                m = global.mockups[instance.index],
                xx = x,
                yy = y,
                source = (turretInfo === false) ? instance : turretInfo;
            if (fade === 0 || alpha === 0) return;
            if (render.expandsWithDeath) drawSize *= (1 + 0.5 * (1 - fade));
            if (config.graphical.fancyAnimations && assignedContext != ctx2 && (fade !== 1 || alpha !== 1)) {
                context = ctx2;
                context.canvas.width = context.canvas.height = drawSize * m.position.axis + ratio * 20;
                xx = context.canvas.width / 2 - drawSize * m.position.axis * m.position.middle.x * Math.cos(rot) / 4;
                yy = context.canvas.height / 2 - drawSize * m.position.axis * m.position.middle.x * Math.sin(rot) / 4;
                context.translate(0.5, 0.5);
            } else {
                if (fade * alpha < 0.5) return;
            }
            context.lineCap = 'round';
            context.lineJoin = 'round';
            // Draw turrets beneath us
            if (source.turrets.length === m.turrets.length) {
                for (let i = 0; i < m.turrets.length; i++) {
                    let t = m.turrets[i];
                    source.turrets[i].lerpedFacing == undefined ? source.turrets[i].lerpedFacing = source.turrets[i].facing : source.turrets[i].lerpedFacing = util.lerpAngle(source.turrets[i].lerpedFacing, source.turrets[i].facing, .1, true);
                    if (t.layer === 0) {
                        let ang = t.direction + t.angle + rot,
                            len = t.offset * drawSize;
                        drawEntity((xx + len * Math.cos(ang)), (yy + len * Math.sin(ang)), t, ratio, 1, drawSize / ratio / t.size * t.sizeFactor, source.turrets[i].lerpedFacing + turretsObeyRot * rot, turretsObeyRot, context, source.turrets[i], render);
                    }
                }
            } else {
                throw new Error("Mismatch turret number with mockup.");
            }
            // Draw guns
            source.guns.update();
            context.lineWidth = Math.max(config.graphical.mininumBorderChunk, ratio * config.graphical.borderChunk);
            setColor(context, mixColors(color.grey, render.status.getColor(), render.status.getBlend()));
            if (source.guns.length === m.guns.length) {
                let positions = source.guns.getPositions();
                for (let i = 0; i < m.guns.length; i++) {
                    let g = m.guns[i],
                        position = positions[i] / ((g.aspect === 1) ? 2 : 1),
                        gx = g.offset * Math.cos(g.direction + g.angle + rot) + (g.length / 2 - position) * Math.cos(g.angle + rot),
                        gy = g.offset * Math.sin(g.direction + g.angle + rot) + (g.length / 2 - position) * Math.sin(g.angle + rot);
                    drawTrapezoid(context, xx + drawSize * gx, yy + drawSize * gy, drawSize * (g.length / 2 - ((g.aspect === 1) ? position * 2 : 0)), drawSize * g.width / 2, g.aspect, g.angle + rot);
                }
            } else {
                throw new Error("Mismatch gun number with mockup.");
            }
            // Draw body
            context.globalAlpha = 1;
            setColor(context, mixColors(getColor(instance.color), render.status.getColor(), render.status.getBlend()));
            drawPoly(context, xx, yy, drawSize / m.size * m.realSize, m.shape, rot);
            // Draw turrets above us
            if (source.turrets.length === m.turrets.length) {
                for (let i = 0; i < m.turrets.length; i++) {
                    let t = m.turrets[i];
                    if (t.layer === 1) {
                        let ang = t.direction + t.angle + rot,
                            len = t.offset * drawSize;
                        drawEntity((xx + len * Math.cos(ang)), (yy + len * Math.sin(ang)), t, ratio, 1, drawSize / ratio / t.size * t.sizeFactor, source.turrets[i].lerpedFacing + turretsObeyRot * rot, turretsObeyRot, context, source.turrets[i], render);
                    }
                }
            } else {
                throw new Error("Mismatch turret number with mockup.");
            }
            if (assignedContext == false && context != ctx && context.canvas.width > 0 && context.canvas.height > 0) {
                ctx.save();
                ctx.globalAlpha = alpha * fade;
                ctx.imageSmoothingEnabled = false;
                //ctx.globalCompositeOperation = "overlay";
                ctx.drawImage(context.canvas, x - xx, y - yy);
                ctx.restore();
                //ctx.globalCompositeOperation = "source-over";
            }
        };
    })();
    /*function drawHealth(x, y, instance, ratio) {
        // Draw health bar
        ctx.globalAlpha = Math.pow(instance.render.status.getFade(), 2) * (instance.alpha);
        let size = instance.size * ratio;
        let m = global.mockups[instance.index];
        let realSize = size / m.size * m.realSize;
        // Draw health
        if (instance.drawsHealth) {
            let health = instance.render.health.get();
            let shield = instance.render.shield.get();
            if (health < 1 || shield < 1) {
                let yy = y + 1.1 * realSize + 15;
                drawBar(x - size, x + size, yy, 3 + config.graphical.barChunk, color.black);
                drawBar(x - size, x - size + 2 * size * health, yy, 3, color.lgreen);
                if (shield) {
                    ctx.globalAlpha = 0.3 + shield * 0.3;
                    drawBar(x - size, x - size + 2 * size * shield, yy, 3, color.teal);
                    ctx.globalAlpha = 1;
                }
            }
        }
        // Draw label
        if (instance.nameplate && instance.id !== gui.playerid) {
            if (instance.render.textobjs == null) instance.render.textobjs = [TextObj(), TextObj()];
            if (instance.name !== '\u0000') {
                var name = instance.name.substring(7, instance.name.length + 1);
                var namecolor = instance.name.substring(0, 7);
                instance.render.textobjs[0].draw(name, x, y - realSize - 30, 16, namecolor, 'center');
                instance.render.textobjs[1].draw(util.handleLargeNumber(instance.score, true), x, y - realSize - 16, 8, namecolor, 'center');
            } else {
                instance.render.textobjs[0].draw('a spoopy 👻', x, y - realSize - 30, 16, color.lavender, 'center');
                instance.render.textobjs[1].draw(util.handleLargeNumber(instance.score, true), x, y - realSize - 16, 8, color.lavender, 'center');
            }
        }
    }*/
    function drawHealth(x, y, instance, ratio, alpha) {
        let fade = instance.render.status.getFade();
        ctx.globalAlpha = fade * fade;
        let size = instance.size * ratio,
            m = global.mockups[instance.index],
            realSize = size / m.size * m.realSize;
        if (instance.drawsHealth) {
            let health = instance.render.health.get(),
                shield = instance.render.shield.get();
            if (health < 1 || shield < 1) {
                const col = config.graphical.coloredHealthbars ? mixColors(getColor(instance.color), color.guiwhite, .5) : color.lgreen;
                let yy = y + 1.1 * realSize + 15;
                ctx.globalAlpha = alpha * alpha * fade;
                drawBar(x - size, x + size, yy, 3 + config.graphical.barChunk, color.black);
                drawBar(x - size, x - size + 2 * size * health, yy, 3, col);
                if (shield) {
                    ctx.globalAlpha = (0.3 + shield * .3) * alpha * alpha * fade;
                    drawBar(x - size, x - size + 2 * size * shield, yy, 3, config.graphical.coloredHealthbars ? mixColors(col, color.guiblack, .25) : color.teal);
                    ctx.globalAlpha = 1;
                }
            }
        }
        if (instance.id !== gui.playerid) {
            if (instance.nameplate) {
                if (instance.render.textobjs == null) instance.render.textobjs = [TextObj(), TextObj()];
                var name = instance.name.substring(7, instance.name.length + 1);
                var namecolor = instance.name.substring(0, 7);
                ctx.globalAlpha = alpha;
                instance.render.textobjs[0].draw(name, x, y - realSize - 30, 16, namecolor, "center");
                instance.render.textobjs[1].draw(util.handleLargeNumber(instance.score, 1), x, y - realSize - 16, 8, namecolor, "center");
                ctx.globalAlpha = 1;
            }
        }
    }
    // Start animation
    window.requestAnimFrame = (() => {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            //window.setTimeout(callback, 1000 / 60);
        };
    })();
    window.cancelAnimFrame = (() => {
        return window.cancelAnimationFrame || window.mozCancelAnimationFrame;
    })();
    // Drawing states
    const gameDraw = (() => {
        const statMenu = Smoothbar(0, 0.7, 1.5, .05);
        const upgradeMenu = Smoothbar(0, 2, 3, .05);
        // Define the graph constructor
        function graph() {
            var data = [];
            return (point, x, y, w, h, col) => {
                // Add point and push off old ones
                data.push(point);
                while (data.length > w) {
                    data.splice(0, 1);
                }
                // Get scale
                let min = Math.min(...data),
                    max = Math.max(...data),
                    range = max - min;
                // Draw zero
                if (max > 0 && min < 0) {
                    drawBar(x, x + w, y + h * max / range, 2, color.guiwhite);
                }
                // Draw points
                ctx.beginPath();
                let i = -1;
                for (let p of data) {
                    if (!++i) {
                        ctx.moveTo(x, y + h * (max - p) / range);
                    } else {
                        ctx.lineTo(x + i, y + h * (max - p) / range);
                    }
                }
                ctx.lineWidth = 1;
                ctx.strokeStyle = col;
                ctx.stroke();
            };
        }
        // Lag compensation functions
        const compensation = (() => {
            // Protected functions
            function interpolate(p1, p2, v1, v2, ts, tt) {
                let k = Math.cos((1 + tt) * Math.PI);
                return 0.5 * (((1 + tt) * v1 + p1) * (k + 1) + (-tt * v2 + p2) * (1 - k));
            }

            function extrapolate(p1, p2, v1, v2, ts, tt) {
                return p2 + (p2 - p1) * tt; /*v2 + 0.5 * tt * (v2 - v1) * ts*/
            }
            // Useful thing
            function angleDifference(sourceA, targetA) {
                let mod = function(a, n) {
                    return (a % n + n) % n;
                };
                let a = targetA - sourceA;
                return mod(a + Math.PI, 2 * Math.PI) - Math.PI;
            }
            // Constructor
            return () => {
                // Protected vars
                let timediff = 0,
                    t = 0,
                    tt = 0,
                    ts = 0;
                // Methods
                return {
                    set: (time = global.player.time, interval = global.metrics.rendergap) => {
                        t = Math.max(getNow() - time - 80, -interval);
                        if (t > 150 && t < 1000) {
                            t = 150;
                        }
                        if (t > 1000) {
                            t = 1000 * 1000 * Math.sin(t / 1000 - 1) / t + 1000;
                        }
                        tt = t / interval;
                        ts = config.roomSpeed * 30 * t / 1000;
                    },
                    predict: (p1, p2, v1, v2) => {
                        return (t >= 0) ? extrapolate(p1, p2, v1, v2, ts, tt) : interpolate(p1, p2, v1, v2, ts, tt);
                    },
                    predictFacing: (f1, f2) => {
                        return f1 + (1 + tt) * angleDifference(f1, f2);
                    },
                    getPrediction: () => {
                        return t;
                    }
                };
            };
        })();
        // Make graphs
        const timingGraph = graph(),
            lagGraph = graph(),
            gapGraph = graph();
        // The skill bar dividers
        const ska = (() => {
            function make(x) {
                return Math.log(4 * x + 1) / Math.log(5);
            }
            let a = [];
            for (let i = 0; i < config.gui.expectedMaxSkillLevel * 2; i++) {
                a.push(make(i / config.gui.expectedMaxSkillLevel));
            }
            // The actual lookup function
            return x => {
                return a[x];
            };
        })();
        // Text objects
        const text = {
            skillNames: [
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
            ],
            skillKeys: [
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
            ],
            skillValues: [
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
            ],
            skillPoints: TextObj(),
            score: TextObj(),
            name: TextObj(),
            class: TextObj(),
            debug: [
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
            ],
            lbtitle: TextObj(),
            leaderboard: [
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
            ],
            upgradeNames: [
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
            ],
            upgradeKeys: [
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
                TextObj(),
            ],
            skipUpgrades: TextObj(),
        };
        // The drawing loop
        return (ratio, drawRatio) => {
            //lag.set();
            let GRAPHDATA = 0;
            // Prep stuff
            renderTimes++;
            let px, py; { // Move the camera
                let motion = compensation();
                motion.set();
                let smear = {
                    x: 0,
                    y: 0,
                }; // moveCompensation.get();
                GRAPHDATA = motion.getPrediction();
                // Don't move the camera if you're dead. This helps with jitter issues
                global.player.renderx = util.lerp(global.player.renderx, global.player.cx, .1, true);
                global.player.rendery = util.lerp(global.player.rendery, global.player.cy, .1, true);
                //player.renderx += (desiredx - player.renderx) / 5;
                //player.rendery += (desiredy - player.rendery) / 5;
                px = ratio * global.player.renderx;
                py = ratio * global.player.rendery;
            } { // Clear the background + draw grid
                clearScreen(color.white, 1);
                clearScreen(color.guiblack, 0.1);
                let W = global.roomSetup[0].length,
                    H = global.roomSetup.length,
                    i = 0;
                for (let row of global.roomSetup) {
                    let j = 0;
                    for (let cell of row) {
                        let left = Math.max(0, ratio * j * global.gameWidth / W - px + global.screenWidth / 2),
                            top = Math.max(0, ratio * i * global.gameHeight / H - py + global.screenHeight / 2),
                            right = Math.min(global.screenWidth, (ratio * (j + 1) * global.gameWidth / W - px) + global.screenWidth / 2),
                            bottom = Math.min(global.screenHeight, (ratio * (i + 1) * global.gameHeight / H - py) + global.screenHeight / 2);
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = (config.graphical.screenshotMode) ? color.guiwhite : color.white;
                        ctx.fillRect(left, top, right - left, bottom - top);
                        ctx.globalAlpha = 0.3;
                        ctx.fillStyle = (config.graphical.screenshotMode) ? color.guiwhite : getZoneColor(cell, true);
                        ctx.fillRect(left, top, right - left, bottom - top);
                        j++;
                    }
                    i++;
                }
                ctx.lineWidth = 1;
                ctx.strokeStyle = (config.graphical.screenshotMode) ? color.guiwhite : color.guiblack;
                ctx.globalAlpha = 0.04;
                ctx.beginPath();
                let gridsize = 30 * ratio;
                for (let x = (global.screenWidth / 2 - px) % gridsize; x < global.screenWidth; x += gridsize) {
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, global.screenHeight);
                }
                for (let y = (global.screenHeight / 2 - py) % gridsize; y < global.screenHeight; y += gridsize) {
                    ctx.moveTo(0, y);
                    ctx.lineTo(global.screenWidth, y);
                }
                ctx.stroke();
                ctx.globalAlpha = 1;
            } { // Draw things
                for (let instance of global.entities) {
                    if (!instance.render.draws) {
                        continue;
                    }
                    let motion = compensation();
                    if (instance.render.status.getFade() === 1) {
                        motion.set();
                    } else {
                        motion.set(instance.render.lastRender, instance.render.interval);
                    }
                    instance.render.x = util.lerp(instance.render.x, Math.round(instance.x + instance.vx), .1, true);
                    instance.render.y = util.lerp(instance.render.y, Math.round(instance.y + instance.vy), .1, true);
                    instance.render.f = (instance.id === gui.playerid && !instance.twiggle && !global.died) ? Math.atan2(global.target.y, global.target.x) : util.lerpAngle(instance.render.f, instance.facing, .15, true);
                    let x = (instance.id === gui.playerid) ? 0 : ratio * instance.render.x - px,
                        y = (instance.id === gui.playerid) ? 0 : ratio * instance.render.y - py;
                    x += global.screenWidth / 2;
                    y += global.screenHeight / 2;
                    drawEntity(x, y, instance, ratio, instance.id === gui.playerid || global.showInvisible ? instance.alpha ? instance.alpha * 0.6 + 0.4 : 0.25 : instance.alpha, 1.1, instance.render.f);
                }
                if (!config.graphical.screenshotMode) {
                    for (let instance of global.entities) {
                        let x = (instance.id === gui.playerid) ? 0 : ratio * instance.render.x - px,
                            y = (instance.id === gui.playerid) ? 0 : ratio * instance.render.y - py;
                        x += global.screenWidth / 2;
                        y += global.screenHeight / 2;
                        drawHealth(x, y, instance, ratio, instance.alpha);
                    }
                }
            }
            ratio = util.getScreenRatio();
            let scaleScreenRatio = (by, unset) => {
                global.screenWidth /= by;
                global.screenHeight /= by;
                ctx.scale(by, by);
                if (!unset) ratio *= by;
            };
            scaleScreenRatio(ratio, true);
            // Draw GUI
            let alcoveSize = 200 / ratio;// / drawRatio * global.screenWidth;
            let spacing = 20;
            gui.__s.update();
            let lb = leaderboard.get();
            let max = lb.max; {
                do {
                    if (!global.showTree) break;
                    if (global.died) {
                        global.showTree = false;
                        global.scrollX = global.realScrollX = 0;
                    }
                    global.scrollX = util.lerp(global.scrollX, global.realScrollX, .1);
                    let basic = global.mockups.find(r => r.name === "Basic");
                    if (!basic) {
                        console.log("No basic");
                        break;
                    }
                    let tiles = [],
                        branches = [],
                        measureSize = (x, y, colorIndex, {
                            index,
                            tier = 0
                        }) => {
                            tiles.push({
                                x,
                                y,
                                colorIndex,
                                index
                            });
                            let {
                                upgrades
                            } = global.mockups[index];
                            switch (tier) {
                                case 3:
                                    return {
                                        width: 1,
                                            height: 1
                                    };
                                case 2:
                                    upgrades.forEach((u, i) => measureSize(x, y + 2 + i, i, u));
                                    branches.push([{
                                        x,
                                        y
                                    }, {
                                        x,
                                        y: y + 1 + upgrades.length
                                    }]);
                                    return {
                                        width: 1,
                                            height: 2 + upgrades.length
                                    };
                                    //case 2:
                                case 1:
                                case 0: {
                                    let xStart = x,
                                        us = upgrades.map((u, i) => {
                                            let spacing = 2 * (u.tier - tier),
                                                measure = measureSize(x, y + spacing, i, u);
                                            branches.push([{
                                                x,
                                                y: y + (i === 0 ? 0 : 1)
                                            }, {
                                                x,
                                                y: y + spacing
                                            }]);
                                            if (i + 1 === upgrades.length) branches.push([{
                                                x: xStart,
                                                y: y + 1
                                            }, {
                                                x,
                                                y: y + 1
                                            }]);
                                            x += measure.width;
                                            return measure;
                                        });
                                    return {
                                        width: us.map(r => r.width).reduce((a, b) => a + b, 0),
                                        height: 2 + Math.max(...us.map(r => r.height))
                                    };
                                }
                            }
                        },
                        full = measureSize(0, 0, 0, {
                            index: basic.index
                        }),
                        tileDiv = true ? 1 : 1.25,
                        tileSize = Math.min(
                            ((global.screenWidth * 0.9) / full.width) * 55,
                            (global.screenHeight * 0.9) / full.height) / tileDiv,
                        size = tileSize - 4;
                    for (let [start, end] of branches) {
                        let sx = global.screenWidth / 2 + (start.x - full.width * global.scrollX) * tileSize + 1 + 0.5 * size,
                            sy = global.screenHeight / 2 + (start.y - full.height / 2) * tileSize + 1 + 0.5 * size,
                            ex = global.screenWidth / 2 + (end.x - full.width * global.scrollX) * tileSize + 1 + 0.5 * size,
                            ey = global.screenHeight / 2 + (end.y - full.height / 2) * tileSize + 1 + 0.5 * size;
                        ctx.strokeStyle = color.black;
                        ctx.lineWidth = 2;
                        drawGuiLine(sx, sy, ex, ey);
                    }
                    ctx.globalAlpha = 0.5;
                    ctx.fillStyle = color.guiwhite;
                    ctx.fillRect(0, 0, innerWidth, innerHeight);
                    let text = "Use the arrow keys to navigate the class tree. Press T again to close it.";
                    ctx.font = "20px Ubuntu";
                    let w = ctx.measureText(text).width;
                    ctx.globalAlpha = 1;
                    ctx.lineWidth = 1;
                    ctx.fillStyle = color.red;
                    ctx.strokeStyle = color.black;
                    ctx.fillText(text, (innerWidth / 2) - (w / 2), innerHeight * 0.04);
                    ctx.strokeText(text, (innerWidth / 2) - (w / 2), innerHeight * 0.04);
                    ctx.globalAlpha = 1;
                    for (let {
                            x,
                            y,
                            colorIndex,
                            index
                        } of tiles) {
                        let ax = global.screenWidth / 2 + (x - full.width * global.scrollX) * tileSize,
                            ay = global.screenHeight / 2 + (y - full.height / 2) * tileSize,
                            size = tileSize;
                        if (ax < -50 || ax + size - 50 > global.screenWidth) continue;
                        ctx.globalAlpha = 0.75;
                        ctx.fillStyle = getColor(10);
                        drawGuiRect(ax, ay, size, size);
                        ctx.globalAlpha = 0.15;
                        ctx.fillStyle = getColor(0);
                        drawGuiRect(ax, ay, size, size * 0.6);
                        ctx.fillStyle = color.black;
                        drawGuiRect(ax, ay + size * 0.6, size, size * 0.4);
                        ctx.globalAlpha = 1;
                        let angle = -Math.PI / 4,
                            picture = util.getEntityImageFromMockup(index, 10),
                            position = global.mockups[index].position,
                            scale = (0.8 * size) / position.axis,
                            xx = ax + 0.5 * size - scale * position.middle.x * Math.cos(angle),
                            yy = ay + 0.5 * size - scale * position.middle.x * Math.sin(angle);
                        drawEntity(xx, yy, picture, 0.5, 1,
                            (scale / picture.size) * 2, angle, true);
                        ctx.strokeStyle = color.black;
                        ctx.globalAlpha = 1;
                        ctx.lineWidth = 2;
                        drawGuiRect(ax, ay, size, size, true);
                    }
                } while (false);
            } { // Draw messages
                if (global.showTree) return;
                let vspacing = 4;
                let len = 0;
                let height = 18;
                let x = global.screenWidth / 2;
                let y = spacing;
                // Draw each message
                for (let i = global.messages.length - 1; i >= 0; i--) {
                    let msg = global.messages[i],
                        txt = msg.text,
                        text = txt; //txt[0].toUpperCase() + txt.substring(1);
                    // Give it a textobj if it doesn't have one
                    if (msg.textobj == null) msg.textobj = TextObj();
                    if (msg.len == null) msg.len = measureText(text, height - 4);
                    // Draw the background
                    ctx.globalAlpha = 0.5 * msg.alpha;
                    drawBar(x - msg.len / 2, x + msg.len / 2, y + height / 2, height, color.black);
                    // Draw the text
                    ctx.globalAlpha = Math.min(1, msg.alpha);
                    msg.textobj.draw(text, x, y + height / 2, height - 4, color.guiwhite, 'center', true);
                    // Iterate and move
                    y += (vspacing + height);
                    if (msg.status > 1) {
                        y -= (vspacing + height) * (1 - Math.sqrt(msg.alpha));
                    }
                    if (msg.status > 1) {
                        msg.status -= 0.05;
                        msg.alpha += 0.05;
                    } else if (i === 0 && (global.messages.length > 5 || Date.now() - msg.time > 10000)) {
                        msg.status -= 0.05;
                        msg.alpha -= 0.05;
                        // Remove
                        if (msg.alpha <= 0) {
                            global.messages[0].textobj.remove();
                            global.messages.splice(0, 1);
                        }
                    }
                }
                ctx.globalAlpha = 1;
            } { // Draw skill bars
                if (global.showTree) return;
                global.canSkill = !!gui.points;
                statMenu.set(0 + (global.canSkill || global.died || global.statHover));
                global.clickables.stat.hide();
                let vspacing = 4;
                let height = 15;
                let gap = 35;
                let len = alcoveSize; // * global.screenWidth; // The 30 is for the value modifiers
                let save = len;
                let x = -spacing - 2 * len + statMenu.get() * (2 * spacing + 2 * len);
                let y = global.screenHeight - spacing - height;
                let ticker = 11;
                let namedata = gui.getStatNames(global.mockups[gui.type].statnames || -1);
                gui.skills.forEach(function drawASkillBar(skill) { // Individual skill bars
                    ticker--;
                    let name = namedata[ticker - 1],
                        level = skill.amount,
                        col = color[skill.color],
                        cap = skill.softcap,
                        maxLevel = skill.cap;
                    if (cap) {
                        len = save;
                        let max = config.gui.expectedMaxSkillLevel,
                            extension = cap > max,
                            blocking = cap < maxLevel;
                        if (extension) {
                            max = cap;
                        }
                        drawBar(x + height / 2, x - height / 2 + len * ska(cap), y + height / 2, height - 3 + config.graphical.barChunk, color.black);
                        drawBar(x + height / 2, x + height / 2 + (len - gap) * ska(cap), y + height / 2, height - 3, color.grey);
                        drawBar(x + height / 2, x + height / 2 + (len - gap) * ska(level), y + height / 2, height - 3.5, col);
                        // Blocked-off area
                        if (blocking) {
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = color.grey;
                            for (let j = cap + 1; j < max; j++) {
                                drawGuiLine(x + (len - gap) * ska(j), y + 1.5, x + (len - gap) * ska(j), y - 3 + height);
                            }
                        }
                        // Vertical dividers
                        ctx.strokeStyle = color.black;
                        ctx.lineWidth = 1;
                        for (let j = 1; j < level + 1; j++) {
                            drawGuiLine(x + (len - gap) * ska(j), y + 1.5, x + (len - gap) * ska(j), y - 3 + height);
                        }
                        // Skill name
                        len = save * ska(max);
                        let textcolor = (level == maxLevel) ? col : (!gui.points || (cap !== maxLevel && level == cap)) ? color.grey : color.guiwhite;
                        text.skillNames[ticker - 1].draw(name, Math.round(x + len / 2) + 0.5, y + height / 2, height - 5, textcolor, 'center', true);
                        // Skill key
                        text.skillKeys[ticker - 1].draw('[' + (ticker % 10) + ']', Math.round(x + len - height * 0.25) - 1.5, y + height / 2, height - 5, textcolor, 'right', true);
                        if (textcolor === color.guiwhite) { // If it's active
                            global.clickables.stat.place(ticker - 1, x, y, len, height);
                        }
                        // Skill value
                        if (level) {
                            text.skillValues[ticker - 1].draw(
                                (textcolor === col) ? 'MAX' : '+' + level, Math.round(x + len + 4) + 0.5, y + height / 2, height - 5, col, 'left', true);
                        }
                        // Move on
                        y -= height + vspacing;
                    }
                });
                global.clickables.hover.place(0, 0, y, 0.8 * len, 0.8 * (global.screenHeight - y));
                if (gui.points !== 0) { // Draw skillpoints to spend
                    text.skillPoints.draw('x' + gui.points, Math.round(x + len - 2) + 0.5, Math.round(y + height - 4) + 0.5, 20, color.guiwhite, 'right');
                }
            } { // Draw name, exp and score bar
                if (global.showTree) return;
                let vspacing = 4;
                let len = 1.65 * alcoveSize; // * global.screenWidth;
                let height = 25;
                let x = (global.screenWidth - len) / 2;
                let y = global.screenHeight - spacing - height;
                ctx.lineWidth = 1;
                // Handle exp
                // Draw the exp bar
                drawBar(x, x + len, y + height / 2, height - 3 + config.graphical.barChunk, color.black);
                drawBar(x, x + len, y + height / 2, height - 3, color.grey);
                drawBar(x, x + len * gui.__s.getProgress(), y + height / 2, height - 3.5, color.gold);
                // Draw the class type
                text.class.draw('Level ' + gui.__s.getLevel() + ' ' + global.mockups[gui.type].name, x + len / 2, y + height / 2, height - 4, color.guiwhite, 'center', true);
                height = 14;
                y -= height + vspacing;
                // Draw the %-of-leader bar
                drawBar(x + len * 0.1, x + len * 0.9, y + height / 2, height - 3 + config.graphical.barChunk, color.black);
                drawBar(x + len * 0.1, x + len * 0.9, y + height / 2, height - 3, color.grey);
                drawBar(x + len * 0.1, x + len * (0.1 + 0.8 * ((max) ? Math.min(1, gui.__s.getScore() / max) : 1)), y + height / 2, height - 3.5, color.green);
                // Draw the score
                text.score.draw('Score: ' + util.handleLargeNumber(gui.__s.getScore()), x + len / 2, y + height / 2, height - 2, color.guiwhite, 'center', true);
                // Draw the name
                ctx.lineWidth = 4;
                text.name.draw(global.player.name, Math.round(x + len / 2) + 0.5, Math.round(y - 10 - vspacing) + 0.5, 32, global.nameColor, 'center');
            } { // Draw minimap and FPS monitors
                if (global.showTree) return;
                let len = alcoveSize; // * global.screenWidth;
                let height = len / global.gameWidth * global.gameHeight;
                if (global.gameHeight > global.gameWidth || global.gameHeight < global.gameWidth) {
                    let ratio = [global.gameWidth / global.gameHeight, global.gameHeight / global.gameWidth];
                    len /= ratio[1] * 1.5;
                    height /= ratio[1] * 1.5;
                    if (len > alcoveSize * 2) {
                        ratio = len / (alcoveSize * 2);
                    } else if (height > alcoveSize * 2) {
                        ratio = height / (alcoveSize * 2);
                    } else {
                        ratio = 1;
                    }
                    len /= ratio;
                    height /= ratio;
                }
                let x = global.screenWidth - spacing - len;
                let y = global.screenHeight - height - spacing;
                ctx.globalAlpha = 0.4;
                let W = global.roomSetup[0].length,
                    H = global.roomSetup.length,
                    i = 0;
                for (let ycell = 0; ycell < H; ycell++) {
                    let row = global.roomSetup[ycell]
                    let j = 0;
                    for (let xcell = 0; xcell < W; xcell++) {
                        let cell = global.roomSetup[ycell][xcell];
                        ctx.fillStyle = getZoneColor(cell);
                        if (getZoneColor(cell) !== color.white) {
                            drawGuiRect(x + j * len / W, y + i * height / H, len / W, height / H);
                        }
                        j++;
                    }
                    i++;
                }
                ctx.fillStyle = color.white;
                drawGuiRect(x, y, len, height);
                for (let entity of minimap.get()) {
                    ctx.fillStyle = mixColors(getColor(entity.color), color.black, 0.3);
                    ctx.globalAlpha = entity.alpha;
                    switch (entity.type) {
                        case 2: {
                            drawGuiRect(x + ((entity.x - entity.size) / global.gameWidth) * len - 0.4, y + ((entity.y - entity.size) / global.gameHeight) * height - 1, ((2 * entity.size) / global.gameWidth) * len + 0.2, ((2 * entity.size) / global.gameWidth) * len + 0.2);
                        }
                        break;
                    case 1: {
                        drawGuiCircle(x + (entity.x / global.gameWidth) * len, y + (entity.y / global.gameHeight) * height, (entity.size / global.gameWidth) * len + 0.2);
                    }
                    break;
                    case 0: {
                        if (entity.id !== gui.playerid) drawGuiCircle(x + (entity.x / global.gameWidth) * len, y + (entity.y / global.gameHeight) * height, 2);
                    }
                    break;
                    }
                }
                ctx.globalAlpha = 1;
                ctx.lineWidth = 1;
                ctx.strokeStyle = color.black;
                ctx.fillStyle = color.black;
                drawGuiCircle(x + (global.player.cx / global.gameWidth) * len - 1, y + (global.player.cy / global.gameHeight) * height - 1, 2, false);
                ctx.lineWidth = 3;
                ctx.fillStyle = color.black;
                drawGuiRect(x, y, len, height, true); // Border
                if (global.showDebug) {
                    drawGuiRect(x, y - 40, len, 30);
                    lagGraph(lag.get(), x, y - 40, len, 30, color.teal);
                    gapGraph(global.metrics.rendergap, x, y - 40, len, 30, color.pink);
                    timingGraph(GRAPHDATA, x, y - 40, len, 30, color.yellow);
                }
                if (!global.showDebug) y += 14 * 3;
                // Text
                if (global.showDebug) {
                    text.debug[5].draw('arras.io', x + len, y - 50 - (5 * 14) - 2, 15, "#B6E57C", 'right');
                    text.debug[4].draw('Prediction: ' + Math.round(GRAPHDATA) + 'ms', x + len, y - 50 - 4 * 14, 10, color.guiwhite, 'right');
                    text.debug[3].draw(`Bandwidth: ${gui.bandwidth.in} in, ${gui.bandwidth.out} out`, x + len, y - 50 - 3 * 14, 10, color.guiwhite, 'right');
                    text.debug[2].draw('Update Rate: ' + global.metrics.updatetime + 'Hz', x + len, y - 50 - 2 * 14, 10, color.guiwhite, 'right');
                    text.debug[1].draw((100 * gui.fps).toFixed(2) + '% : ' + global.metrics.rendertime + " FPS", x + len, y - 50 - 1 * 14, 10, global.metrics.rendertime > 10 ? color.guiwhite : color.orange, 'right');
                    text.debug[0].draw(global.metrics.latency + " ms - " + global.serverName, x + len, y - 50, 10, color.guiwhite, 'right');
                } else {
                    text.debug[2].draw('arras.io', x + len, y - 50 - (2 * 14) - 2, 15, "#B6E57C", 'right');
                    text.debug[1].draw((100 * gui.fps).toFixed(2) + '% : ' + global.metrics.rendertime + " FPS", x + len, y - 50 - 1 * 14, 10, global.metrics.rendertime > 10 ? color.guiwhite : color.orange, 'right');
                    text.debug[0].draw(global.metrics.latency + " ms : " + global.metrics.updatetime + "Hz", x + len, y - 50, 10, color.guiwhite, 'right');
                }
                global.fps = global.metrics.rendertime;
            }
            /*{ // Draw minimap and FPS monitors
                            if (global.showTree) return;
                            let len = alcoveSize * global.screenWidth;
                            let height = len;
                            let x = global.screenWidth - len - spacing;
                            let y = global.screenHeight - height - spacing;
                            ctx.globalAlpha = 0.5;
                            let W = global.roomSetup[0].length,
                                H = global.roomSetup.length,
                                i = 0;
                            global.roomSetup.forEach((row) => {
                                let j = 0;
                                row.forEach((cell) => {
                                    ctx.fillStyle = getZoneColor(cell, false);
                                    drawGuiRect(x + (j++) * len / W, y + i * height / H, len / W, height / H);
                                });
                                i++;
                            });
                            ctx.fillStyle = color.grey;
                            drawGuiRect(x, y, len, height);
                            for (let entity of minimap.get()) {
                                ctx.fillStyle = mixColors(getColor(entity.color), color.black, 0.3);
                                ctx.globalAlpha = entity.alpha;
                                switch (entity.type) {
                                    case 3: {
                                        const size = 3;
                                        drawGuiRect(x + ((entity.x - size) / global.gameWidth) * len, y + ((entity.y - size) / global.gameHeight) * height, size, size);
                                    }
                                    break;
                                case 2: {
                                    const width = entity.size * (entity.width || 1);
                                    const hgt = entity.size * (entity.height || 1);
                                    drawGuiRect(x + ((entity.x - width) / global.gameWidth) * len - 0.4, y + ((entity.y - hgt) / global.gameHeight) * height - 1, ((2 * width) / global.gameWidth) * len + 0.2, ((2 * hgt) / global.gameWidth) * len + 0.2);
                                }
                                break;
                                case 1: {
                                    drawGuiCircle(x + (entity.x / global.gameWidth) * len, y + (entity.y / global.gameHeight) * height, (entity.size / global.gameWidth) * len + 0.2);
                                }
                                break;
                                case 0: {
                                    if (entity.id !== gui.playerid) drawGuiCircle(x + (entity.x / global.gameWidth) * len, y + (entity.y / global.gameHeight) * height, 2);
                                }
                                break;
                                }
                            }
                            ctx.globalAlpha = 1;
                            ctx.lineWidth = 1;
                            ctx.fillStyle = color.black;
                            ctx.beginPath();
                            ctx.arc(x + (global.player.cx / global.gameWidth) * len - 1, y + (global.player.cy / global.gameWidth) * height - 1, 3, 0, Math.PI * 2);
                            ctx.closePath();
                            ctx.fill();
                            ctx.lineWidth = 3;
                            ctx.strokeStyle = color.black;
                            drawGuiRect(x, y, len, height, true); // Border
                            drawGuiRect(x, y - 40, len, 30);
                            lagGraph(lag.get(), x, y - 40, len, 30, color.teal);
                            gapGraph(global.metrics.rendergap, x, y - 40, len, 30, color.pink);
                            timingGraph(GRAPHDATA, x, y - 40, len, 30, color.yellow);
                            // Text
                            text.debug[5].draw('Prediction: ' + Math.round(GRAPHDATA) + 'ms', x + len, y - 50 - 5 * 14, 10, color.guiwhite, 'right');
                            text.debug[4].draw('Update Rate: ' + global.metrics.updatetime + 'Hz', x + len, y - 50 - 4 * 14, 10, color.guiwhite, 'right');
                            text.debug[3].draw('Latency: ' + global.metrics.latency + 'ms', x + len, y - 50 - 3 * 14, 10, color.guiwhite, 'right');
                            text.debug[2].draw('Client FPS: ' + global.metrics.rendertime, x + len, y - 50 - 2 * 14, 10, color.guiwhite, 'right');
                            text.debug[1].draw('Server Speed: ' + (100 * gui.fps).toFixed(2) + '%' + ((gui.fps === 1) ? '' : ' OVERLOADED!'), x + len, y - 50 - 1 * 14, 10, (gui.fps === 1) ? color.guiwhite : color.orange, 'right');
                            text.debug[0].draw(serverName, x + len, y - 50, 10, color.guiwhite, 'right');
                            global.fps = global.metrics.rendertime;
                        }*/
            { // Draw leaderboard
                if (global.showTree) return;
                let lb = leaderboard.get();
                let vspacing = 4;
                let len = alcoveSize; // * global.screenWidth;
                let height = 14;
                let x = global.screenWidth - len - spacing;
                let y = spacing + height + 7;
                text.lbtitle.draw('Leaderboard:', Math.round(x + len / 2) + 0.5, Math.round(y - 6) + 0.5, height + 4, color.guiwhite, 'center');
                for (let i = 0; i < lb.data.length; i++) {
                    let entry = lb.data[i];
                    drawBar(x, x + len, y + height / 2, height - 3 + config.graphical.barChunk, color.black);
                    drawBar(x, x + len, y + height / 2, height - 3, color.grey);
                    let shift = Math.min(1, entry.score / max);
                    drawBar(x, x + len * shift, y + height / 2, height - 3.5, getColor(entry.barColor));
                    // Leadboard name + score
                    let nameColor = entry.nameColor || '#FFFFFF';
                    text.leaderboard[i].draw(entry.label + (': ' + util.handleLargeNumber(Math.round(entry.score))), x + len / 2, y + height / 2, height - 5, nameColor, 'center', true);
                    // Mini-image
                    let scale = height / entry.position.axis,
                        xx = x - 1.5 * height - scale * entry.position.middle.x * 0.707,
                        yy = y + 0.5 * height + scale * entry.position.middle.x * 0.707;
                    drawEntity(xx, yy, entry.image, 1 / scale, 1, scale * scale / entry.image.size, -Math.PI / 4, true);
                    // Move down
                    y += vspacing + height;
                }
            } { // Draw upgrade menu
                if (global.showTree) return;
                upgradeMenu.set(0 + (global.canUpgrade || global.upgradeHover));
                let glide = upgradeMenu.get();
                global.clickables.upgrade.hide();
                if (gui.upgrades.length > 0) {
                    global.canUpgrade = true;
                    var getClassUpgradeKey = function(number) {
                        switch (number) {
                            case 0:
                                return 'y';
                            case 1:
                                return 'h';
                            case 2:
                                return 'u';
                            case 3:
                                return 'j';
                            case 4:
                                return 'i';
                            case 5:
                                return 'k';
                            case 6:
                                return 'o';
                            case 7:
                                return 'l';
                            default:
                                return "N/A";
                        }
                    };
                    let internalSpacing = 8;
                    let len = alcoveSize / 2; // * global.screenWidth / 2 * 1;
                    let height = len;
                    let x = glide * 2 * spacing - spacing;
                    let y = spacing;
                    let xStart = x;
                    let xo = x;
                    let xxx = 0;
                    let yo = y;
                    let ticker = 0;
                    upgradeSpin += 0.01;
                    let colorIndex = 10;
                    let i = 0;
                    gui.upgrades.forEach(function drawAnUpgrade(model) {
                        if (y > yo) yo = y;
                        xxx = x;
                        global.clickables.upgrade.place(i++, x, y, len, height);
                        // Draw box
                        ctx.globalAlpha = 0.5;
                        ctx.fillStyle = getColor((colorIndex > 15 ? colorIndex - 16 : colorIndex));
                        drawGuiRect(x, y, len, height);
                        ctx.globalAlpha = 0.1;
                        ctx.fillStyle = getColor(-10 + colorIndex++);
                        drawGuiRect(x, y, len, height * 0.6);
                        ctx.fillStyle = color.black;
                        drawGuiRect(x, y + height * 0.6, len, height * 0.4);
                        ctx.globalAlpha = 1;
                        // Find offset location with rotation
                        let picture = util.getEntityImageFromMockup(model, gui.color),
                            position = global.mockups[model].position,
                            scale = 0.6 * len / position.axis,
                            xx = x + 0.5 * len - scale * position.middle.x * Math.cos(upgradeSpin),
                            yy = y + 0.5 * height - scale * position.middle.x * Math.sin(upgradeSpin);
                        drawEntity(xx, yy, picture, 1, 1, scale / picture.size, upgradeSpin, true);
                        // Tank name
                        text.upgradeNames[i - 1].draw(picture.name, x + 0.9 * len / 2, y + height - 6, height / 8 - 3, color.guiwhite, 'center');
                        // Upgrade key
                        text.upgradeKeys[i - 1].draw('[' + getClassUpgradeKey(ticker) + ']', x + len - 4, y + height - 6, height / 8 - 3, color.guiwhite, 'right');
                        ctx.strokeStyle = color.black;
                        ctx.globalAlpha = 1;
                        ctx.lineWidth = 3;
                        drawGuiRect(x, y, len, height, true); // Border
                        if (++ticker % 3 === 0) {
                            x = xStart;
                            y += height + internalSpacing;
                        } else {
                            x += glide * (len + internalSpacing);
                        }
                    });
                    // Draw box
                    let h = 14,
                        msg = "Don't Upgrade",
                        m = measureText(msg, h - 3) + 10;
                    let xx = xo + (xxx + len + internalSpacing - xo) / 2,
                        yy = yo + height + internalSpacing;
                    drawBar(xx - m / 2, xx + m / 2, yy + h / 2, h + config.graphical.barChunk, color.black);
                    drawBar(xx - m / 2, xx + m / 2, yy + h / 2, h, color.white);
                    text.skipUpgrades.draw(msg, xx, yy + h / 2, h - 2, color.guiwhite, 'center', true);
                    global.clickables.skipUpgrades.place(0, xx - m / 2, yy, m, h);
                } else {
                    global.canUpgrade = false;
                    global.clickables.upgrade.hide();
                    global.clickables.skipUpgrades.hide();
                }
            }
            global.metrics.lastrender = getNow();
        };
    })();
    const gameDrawDead = (() => {
        let text = {
            taunt: TextObj(),
            level: TextObj(),
            score: TextObj(),
            time: TextObj(),
            kills: TextObj(),
            death: TextObj(),
            playagain: TextObj(),
        };
        let getKills = () => {
            let finalKills = [Math.round(global.finalKills[0].get()), Math.round(global.finalKills[1].get()), Math.round(global.finalKills[2].get())];
            let b = finalKills[0] + 0.5 * finalKills[1] + 3 * finalKills[2];
            return ((b === 0) ? '🌼' : (b < 4) ? '🎯' : (b < 8) ? '💥' : (b < 15) ? '💢' : (b < 25) ? '🔥' : (b < 50) ? '💣' : (b < 75) ? '👺' : (b < 100) ? '🌶️' : '💯') + ((finalKills[0] || finalKills[1] || finalKills[2]) ? ' ' + ((finalKills[0]) ? finalKills[0] + ' kills' : '') + ((finalKills[0] && finalKills[1]) ? ' and ' : '') + ((finalKills[1]) ? finalKills[1] + ' assists' : '') + (((finalKills[0] || finalKills[1]) && finalKills[2]) ? ' and ' : '') + ((finalKills[2]) ? finalKills[2] + ' visitors defeated' : '') : ' A true pacifist') + '.';
        };
        let getDeath = () => {
            let txt = '';
            if (global.finalKillers.length) {
                txt = '🔪 Succumbed to';
                global.finalKillers.forEach(e => {
                    txt += ' ' + util.addArticle(global.mockups[e].name) + ' and';
                });
                txt = txt.slice(0, -4) + '.';
            } else {
                txt += '🤷 Well that was kinda dumb huh';
            }
            return txt;
        };
        return () => {
            clearScreen(color.black, 0.25);
            let x = global.screenWidth / 2,
                y = global.screenHeight / 2 - 50;
            let picture = util.getEntityImageFromMockup(gui.type, gui.color),
                len = 140,
                position = global.mockups[gui.type].position,
                scale = len / position.axis,
                xx = global.screenWidth / 2 - scale * position.middle.x * 0.707,
                yy = global.screenHeight / 2 - 35 + scale * position.middle.x * 0.707;
            drawEntity((xx - 190 - len / 2) + .5 | 0, (yy - 10) + .5 | 0, picture, 1.5, 1, 0.5 * scale / picture.realSize, -Math.PI / 4, true);
            text.taunt.draw('If you think you have a record, submit it using the link on the start menu. Make sure you have a screenshot.', x, y - 80, 8, color.guiwhite, 'center');
            text.level.draw('Level ' + gui.__s.getLevel() + ' ' + global.mockups[gui.type].name + '.', x - 170, y - 30, 24, color.guiwhite);
            text.score.draw('Final score: ' + util.formatLargeNumber(Math.round(global.finalScore.get())), x - 170, y + 25, 50, color.guiwhite);
            text.time.draw('⌚ Survived for ' + util.timeForHumans(Math.round(global.finalLifetime.get())) + '.', x - 170, y + 55, 16, color.guiwhite);
            text.kills.draw(getKills(), x - 170, y + 77, 16, color.guiwhite);
            text.death.draw(getDeath(), x - 170, y + 99, 16, color.guiwhite);
            text.playagain.draw('Press enter to play again!', x, y + 125, 16, color.guiwhite, 'center');
        };
    })();
    const gameDrawBeforeStart = (() => {
        let text = {
            connecting: TextObj(),
            message: TextObj(),
        };
        return () => {
            clearScreen(color.white, 0.5);
            let shift = animations.connecting.get();
            ctx.translate(0, -shift * global.screenHeight);
            text.connecting.draw('Connecting...', global.screenWidth / 2, global.screenHeight / 2, 30, color.guiwhite, 'center');
            text.message.draw(global.message, global.screenWidth / 2, global.screenHeight / 2 + 30, 15, color.lgreen, 'center');
            ctx.translate(0, shift * global.screenHeight);
        };
    })();
    const gameDrawDisconnected = (() => {
        let text = {
            disconnected: TextObj(),
            message: TextObj(),
        };
        return () => {
            clearScreen(mixColors(color.red, color.guiblack, 0.3), 0.25);
            text.disconnected.draw('💀 Disconnected. 💀', global.screenWidth / 2, global.screenHeight / 2, 30, color.guiwhite, 'center');
            text.message.draw(global.message, global.screenWidth / 2, global.screenHeight / 2 + 30, 15, color.orange, 'center');
        };
    })();
    // The main function
    function animloop() {
        global.animLoopHandle = window.requestAnimFrame(animloop);
        global.player.renderv += (global.player.view - global.player.renderv) / 30;
        var ratio = (config.graphical.screenshotMode) ? 2 : util.getRatio();
        // Set the drawing style
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Draw the game
        if (global.gameStart && !global.disconnected) {
            global.time = getNow();
            if (global.time - lastPing > 1000) { // Latency
                // Do ping.
                global.socket.ping(global.time);
                lastPing = global.time;
                // Do rendering speed.
                global.metrics.rendertime = renderTimes;
                renderTimes = 0;
                // Do update rate.
                global.metrics.updatetime = global.updateTimes;
                global.updateTimes = 0;
            }
            global.metrics.lag = global.time - global.player.time;
        }
        ctx.translate(.5, .5);
        if (global.gameStart) {
            gameDraw(ratio, util.getScreenRatio());
        } else if (!global.disconnected) {
            gameDrawBeforeStart();
        }
        if (global.died) {
            gameDrawDead();
        }
        if (global.disconnected) {
            gameDrawDisconnected();
        }
        ctx.translate(-.5, -.5);
    }
})(util, global, config, Canvas, color, socketStuff);