import {
    global
} from "./global.js";
import {
    config
} from "./config.js";
const util = (function() {
    return {
        submitToLocalStorage: name => {
            localStorage.setItem(name + 'Value', document.getElementById(name).value);
            localStorage.setItem(name + 'Checked', document.getElementById(name).checked);
            return false;
        },
        retrieveFromLocalStorage: name => {
            document.getElementById(name).value = localStorage.getItem(name + 'Value');
            document.getElementById(name).checked = localStorage.getItem(name + 'Checked') === 'true';
            return false;
        },
        handleLargeNumber: (a, cullZeroes = false) => {
            if (cullZeroes && a == 0) {
                return '';
            }
            if (a < Math.pow(10, 3)) {
                return '' + a.toFixed(0);
            }
            if (a < Math.pow(10, 6)) {
                return (a / Math.pow(10, 3)).toFixed(2) + "k";
            }
            if (a < Math.pow(10, 9)) {
                return (a / Math.pow(10, 6)).toFixed(2) + "m";
            }
            if (a < Math.pow(10, 12)) {
                return (a / Math.pow(10, 9)).toFixed(2) + "b";
            }
            if (a < Math.pow(10, 15)) {
                return (a / Math.pow(10, 12)).toFixed(2) + "t";
            }
            return (a / Math.pow(10, 15)).toFixed(2) + "q";
        },
        timeForHumans: x => {
            // ought to be in seconds
            let seconds = x % 60;
            x /= 60;
            x = Math.floor(x);
            let minutes = x % 60;
            x /= 60;
            x = Math.floor(x);
            let hours = x % 24;
            x /= 24;
            x = Math.floor(x);
            let days = x;
            let y = '';

            function weh(z, text) {
                if (z) {
                    y = y + ((y === '') ? '' : ', ') + z + ' ' + text + ((z > 1) ? 's' : '');
                }
            }
            weh(days, 'day');
            weh(hours, 'hour');
            weh(minutes, 'minute');
            weh(seconds, 'second');
            if (y === '') {
                y = 'less than a second';
            }
            return y;
        },
        addArticle: string => {
            return (/[aeiouAEIOU]/.test(string[0])) ? 'an ' + string : 'a ' + string;
        },
        formatLargeNumber: x => {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        pullJSON: fileName => {
            /*let request = new XMLHttpRequest();
            let url = "/lib/" + filename + ".json";
            // Set up the request
            console.log("Loading JSON from " + url);
            request.responseType = 'json';
            // Return a promise
            return new Promise((resolve, reject) => {
                request.open('GET', url);
                request.onload = () => {
                    resolve(request.response);
                    console.log('JSON load complete.');
                };
                request.onerror = () => {
                    reject(request.statusText);
                    console.log('JSON load failed.');
                    console.log(request.statusText);
                };
                request.send();
            });*/
            return new Promise((resolve, reject) => {
                const url = `${location.protocol}//${window.serverAdd}/lib/json/${fileName}.json`;
                console.log("Loading JSON from " + url);
                fetch(url).then(response => response.json()).then(json => {
                    console.log("JSON load from " + url + " complete");
                    resolve(json);
                }).catch(error => {
                    console.log("JSON load from " + url + " complete");
                    reject(error);
                });
            });
        },
        lerp: (a, b, x, syncWithFps = false) => {
            if (syncWithFps) {
                if (global.fps < 20) global.fps = 20;
                x /= global.fps / 120;
            }
            return a + x * (b - a);
        },
        lerpAngle: (is, to, amount, syncWithFps) => {
            var normal = {
                x: Math.cos(is),
                y: Math.sin(is)
            };
            var normal2 = {
                x: Math.cos(to),
                y: Math.sin(to)
            };
            var res = {
                x: util.lerp(normal.x, normal2.x, amount, syncWithFps),
                y: util.lerp(normal.y, normal2.y, amount, syncWithFps)
            };
            return Math.atan2(res.y, res.x);
        },
        getRatio: () => Math.max(global.screenWidth, 16 * global.screenHeight / 9) / global.player.renderv,
        getScreenRatio: () => Math.max(global.screenWidth, 16 * global.screenHeight / 9) / global.screenSize,
        Smoothbar: (value, speed, sharpness = 3, lerpValue = .025) => {
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
        },
        isInView: (x, y, r, mid = false) => {
            let ratio = util.getRatio();
            r += config.graphical.borderChunk;
            if (mid) {
                ratio *= 2;
                return x > -global.screenWidth / ratio - r && x < global.screenWidth / ratio + r && y > -global.screenHeight / ratio - r && y < global.screenHeight / ratio + r;
            }
            return x > -r && x < global.screenWidth / ratio + r && y > -r && y < global.screenHeight / ratio + r;
        },
        getEntityImageFromMockup: (index, color = global.mockups[index].color) => {
            let mockup = global.mockups[index];
            return {
                time: 0,
                index: index,
                x: mockup.x,
                y: mockup.y,
                vx: 0,
                vy: 0,
                size: mockup.size,
                realSize: mockup.realSize,
                color: color,
                render: {
                    status: {
                        getFade: () => {
                            return 1;
                        },
                        getColor: () => {
                            return '#FFFFFF';
                        },
                        getBlend: () => {
                            return 0;
                        },
                        health: {
                            get: () => {
                                return 1;
                            },
                        },
                        shield: {
                            get: () => {
                                return 1;
                            },
                        },
                    },
                },
                facing: mockup.facing,
                shape: mockup.shape,
                name: mockup.name,
                score: 0,
                tiggle: 0,
                layer: mockup.layer,
                guns: {
                    length: mockup.guns.length,
                    getPositions: () => {
                        let a = [];
                        mockup.guns.forEach(() => a.push(0));
                        return a;
                    },
                    update: () => {},
                },
                turrets: mockup.turrets.map((t) => {
                    let o = util.getEntityImageFromMockup(t.index);
                    o.realSize = o.realSize / o.size * mockup.size * t.sizeFactor;
                    o.size = mockup.size * t.sizeFactor;
                    o.angle = t.angle;
                    o.offset = t.offset;
                    o.direction = t.direction;
                    o.facing = t.direction + t.angle;
                    return o;
                }),
            };
        }
    }
})();
export {
    util
}