const global = {
    // Keys and other mathematical constants
    KEY_ESC: 27,
    KEY_ENTER: 13,
    KEY_CHAT: 13,
    KEY_FIREFOOD: 119,
    KEY_SPLIT: 32,
    KEY_LEFT: 65,
    KEY_UP: 87,
    KEY_RIGHT: 68,
    KEY_DOWN: 83,
    KEY_LEFT_ARROW: 37,
    KEY_UP_ARROW: 38,
    KEY_RIGHT_ARROW: 39,
    KEY_DOWN_ARROW: 40,
    KEY_AUTO_SPIN: 67,
    KEY_AUTO_FIRE: 69,
    KEY_OVER_RIDE: 82,
    KEY_UPGRADE_ATK: 49,
    KEY_UPGRADE_HTL: 50,
    KEY_UPGRADE_SPD: 51,
    KEY_UPGRADE_STR: 52,
    KEY_UPGRADE_PEN: 53,
    KEY_UPGRADE_DAM: 54,
    KEY_UPGRADE_RLD: 55,
    KEY_UPGRADE_MOB: 56,
    KEY_UPGRADE_RGN: 57,
    KEY_UPGRADE_SHI: 48,
    KEY_MOUSE_0: 32,
    KEY_MOUSE_1: 86,
    KEY_MOUSE_2: 16,
    KEY_CHOOSE_1: 89,
    KEY_CHOOSE_2: 72,
    KEY_CHOOSE_3: 85,
    KEY_CHOOSE_4: 74,
    KEY_CHOOSE_5: 73,
    KEY_CHOOSE_6: 75,
    KEY_CHOOSE_7: 79,
    KEY_CHOOSE_8: 76,
    KEY_LEVEL_UP: 78,
    KEY_FUCK_YOU: 192,
    KEY_CLASS_TREE: 84,
    KEY_MAX_STAT: 77,
    showTree: false,
    scrollX: 0,
    realScrollX: 0,
    // Canvas
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    gameWidth: 0,
    gameHeight: 0,
    xoffset: -0,
    yoffset: -0,
    gameStart: false,
    disconnected: false,
    died: false,
    kicked: false,
    continuity: false,
    startPingTime: 0,
    toggleMassState: 0,
    backgroundColor: '#f2fbff',
    lineColor: '#000000',
    nameColor: "#FFFFFF",
    player: {},
    messages: [],
    mockups: [],
    roomSetup: [],
    entities: [],
    updateTimes: 0,
    clickables: (() => {
        let Region = (() => {
            // Protected classes
            function Clickable() {
                let region = {
                    x: 0,
                    y: 0,
                    w: 0,
                    h: 0,
                };
                let active = false;
                return {
                    set: (x, y, w, h) => {
                        region.x = x * global.ratio;
                        region.y = y * global.ratio;
                        region.w = w * global.ratio;
                        region.h = h * global.ratio;
                        active = true;
                    },
                    check: target => {
                        let dx = Math.round(target.x - region.x);
                        let dy = Math.round(target.y - region.y);
                        return active && dx >= 0 && dy >= 0 && dx <= region.w && dy <= region.h;
                    },
                    hide: () => {
                        active = false;
                    },
                };
            }
            // Return the constructor
            return (size) => {
                // Define the region
                let data = [];
                for (let i = 0; i < size; i++) {
                    data.push(Clickable());
                }
                // Return the region methods
                return {
                    place: (index, ...a) => {
                        if (index >= data.length) {
                            console.log(index);
                            console.log(data);
                            throw new Error('Trying to reference a clickable outside a region!');
                        }
                        data[index].set(...a);
                    },
                    hide: () => {
                        data.forEach(r => r.hide());
                    },
                    check: x => {
                        return data.findIndex(r => {
                            return r.check(x);
                        });
                    }
                };
            };
        })();
        return {
            stat: Region(10),
            upgrade: Region(16),
            hover: Region(1),
            skipUpgrades: Region(1),
        };
    })(),
    statHover: false,
    upgradeHover: false,
    statMaxing: false,
    metrics: {
        latency: 0,
        lag: 0,
        rendertime: 0,
        updatetime: 0,
        lastlag: 0,
        lastrender: 0,
        rendergap: 0,
        lastuplink: 0,
    },
    target: {
        x: 0,
        y: 0
    },
    fps: 60,
    screenSize: Math.min(1920, Math.max(window.innerWidth, 1280)),
    ratio: window.devicePixelRatio
};
export {
    global
}