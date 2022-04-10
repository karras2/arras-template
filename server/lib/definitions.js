// GUN DEFINITIONS
const combineStats = function(arr) {
    try {
        // Build a blank array of the appropiate length
        let data = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        arr.forEach(function(component) {
            for (let i = 0; i < data.length; i++) {
                data[i] = data[i] * component[i];
            }
        });
        return {
            reload: data[0],
            recoil: data[1],
            shudder: data[2],
            size: data[3],
            health: data[4],
            damage: data[5],
            pen: data[6],
            speed: data[7],
            maxSpeed: data[8],
            range: data[9],
            density: data[10],
            spray: data[11],
            resist: data[12],
        };
    } catch (err) {
        console.log(err);
        console.log(JSON.stringify(arr));
    }
};
const setBuild = build => {
    let skills = build.split(build.includes('/') ? '/' : '').map(r => +r);
    if (skills.length !== 10) throw new RangeError('Build must be made up of 10 numbers');
    return [6, 4, 3, 5, 2, 9, 0, 1, 8, 7].map(r => skills[r]);
};
const skillSet = (() => {
    let config = require('../config.json');
    let skcnv = {
        rld: 0,
        pen: 1,
        str: 2,
        dam: 3,
        spd: 4,
        shi: 5,
        atk: 6,
        hlt: 7,
        rgn: 8,
        mob: 9,
    };
    return args => {
        let skills = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let s in args) {
            if (!args.hasOwnProperty(s)) continue;
            skills[skcnv[s]] = Math.round(config.MAX_SKILL * args[s]);
        }
        return skills;
    };
})();
const g = { // Reload, recoil, shudder (speed variation), size, health, damage, penetration, speed, max speed, range, density, spray (accuracy variation), resist
    trap: [39, 1, .25, .65, 1.025, .325, 1.1, 4.9, 1, 1.125, 1, 15, 3],
    swarm: [27, .25, .05, .4, .9, .235, .65, 3.5, 1, 1, 1.25, 5, 1.25],
    drone: [66, .25, .1, .6, 5, .295, 1, 2.35, 1, 1, 1, .1, 1.1],
    factory: [72, 1, .1, .7, 2, .2, 1, 3, 1, 1, 1, .1, 1],
    basic: [18.25, 1.4, .1, 1, 2, .2, 1, 4.5, 1, 1, 1, 15, 1],
    destroyerDominator: [6.5, 0, 1, .975, 6, 6, 6, .575, .475, 1, 1, .5, 1],
    gunnerDominator: [1.1, 0, 1.1, .5, .5, .5, 1, 1.1, 1, 1, .9, 1.2, .8],
    trapperDominator: [1.26, 0, .25, 1, 1.25, 1.45, 1.6, .5, 2, .7, 1, .5, 1],
    mothership: [1.25, 1, 1, 1, 1, 1, 1.1, .775, .8, 15, 1, 1, 1.15],
    closer: [1.25, .25, 1, 1, 1e3, 1e3, 1e3, 2.5, 2.25, 1.4, 4, .25, 1],
    blank: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    spam: [1.1, 1, 1, 1.05, 1, 1.1, 1, .9, .7, 1, 1, 1, 1.05],
    hurricane: [1, 1, 1, 1, 1.3, 1.3, 1.1, 1.5, 1.15, 1, 1, 1, 1],
    minion: [1, 1, 2, 1, .4, .4, 1.2, 1, 1, .75, 1, 2, 1],
    single: [1.05, 1, 1, 1, 1, 1, 1, 1.05, 1, 1, 1, 1, 1],
    sniper: [1.35, 1, .25, 1, 1, .8, 1.1, 1.5, 1.5, 1, 1.5, .2, 1.15],
    rifle: [.8, .8, 1.5, 1, .8, .8, .9, 1, 1, 1, 1, 2, 1],
    assass: [1.65, 1, .25, 1, 1.15, 1, 1.1, 1.18, 1.18, 1, 3, 1, 1.3],
    hunter: [1.5, .7, 1, .95, 1, .9, 1, 1.1, .8, 1, 1.2, 1, 1.15],
    hunter2: [1, 1, 1, .9, 2, .5, 1.5, 1, 1, 1, 1.2, 1, 1.1],
    preda: [1.4, 1, 1, .8, 1.5, .9, 1.2, .9, .9, 1, 1, 1, 1],
    snake: [.4, 1, 4, 1, 1.5, .9, 1.2, .2, .35, 1, 3, 6, .5],
    sidewind: [1.5, 2, 1, 1, 1.5, .9, 1, .15, .5, 1, 1, 1, 1],
    snakeskin: [.6, 1, 2, 1, .5, .5, 1, 1, .2, .4, 1, 5, 1],
    mach: [.5, .8, 1.7, 1, .7, .7, 1, 1, .8, 1, 1, 2.5, 1],
    blaster: [1, 1.2, 1.25, 1.1, 1.5, 1, .6, .8, .33, .6, .5, 1.5, .8],
    chain: [1.25, 1.33, .8, 1, .8, 1, 1.1, 1.25, 1.25, 1.1, 1.25, .5, 1.1],
    mini: [1.25, .6, 1, .8, .55, .45, 1.25, 1.33, 1, 1, 1.25, .5, 1.1],
    stream: [1.1, .6, 1, 1, 1, .65, 1, 1.24, 1, 1, 1, 1, 1],
    shotgun: [8, .4, 1, 1.5, 1, .4, .8, 1.8, .6, 1, 1.2, 1.2, 1],
    flank: [1, 1.2, 1, 1, 1.02, .81, .9, 1, .85, 1, 1.2, 1, 1],
    tri: [1, .9, 1, 1, .9, 1, 1, .8, .8, .6, 1, 1, 1],
    trifront: [1, .2, 1, 1, 1, 1, 1, 1.3, 1.1, 1.5, 1, 1, 1],
    thruster: [1, 1.5, 2, 1, .5, .5, .7, 1, 1, 1, 1, .5, .7],
    auto: [1.8, .75, .5, .8, .9, .6, 1.2, 1.1, 1, .8, 1.3, 1, 1.25],
    five: [1.15, 1, 1, 1, 1, 1, 1, 1.05, 1.05, 1.1, 2, 1, 1],
    autosnipe: [1, 1, 1, 1.4, 2, 1, 1, 1, 1, 1, 1, 1, 1],
    pound: [2, 1.6, 1, 1, 1, 2, 1, .85, .8, 1, 1.5, 1, 1.15],
    destroy: [2.2, 1.8, .5, 1, 2, 2, 1.2, .65, .5, 1, 2, 1, 3],
    anni: [.8, 1.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    hive: [1.5, .8, 1, .8, .7, .3, 1, 1, .6, 1, 1, 1, 1],
    arty: [1.2, .7, 1, .9, 1, 1, 1, 1.15, 1.1, 1, 1.5, 1, 1],
    mortar: [1.2, 1, 1, 1, 1.1, 1, 1, .8, .8, 1, 1, 1, 1],
    spreadmain: [.78125, .25, .5, 1, .5, 1, 1, 1.5 / .78, .9 / .78, 1, 1, 1, 1],
    spread: [1.5, 1, .25, 1, 1, 1, 1, .7, .7, 1, 1, .25, 1],
    skim: [1, .8, .8, .9, 1.35, .8, 2, .3, .3, 1, 1, 1, 1.1],
    twin: [1, .5, .9, 1, .9, .7, 1, 1, 1, 1, 1, 1.2, 1],
    bent: [1.1, 1, .8, 1, .9, 1, .8, 1, 1, 1, .8, .5, 1],
    triple: [1.2, .667, .9, 1, .85, .85, .9, 1, 1, 1, 1.1, .9, .95],
    quint: [1.5, .667, .9, 1, 1, 1, .9, 1, 1, 1, 1.1, .9, .95],
    dual: [2, 1, .8, 1, 1.5, 1, 1, 1.3, 1.1, 1, 1, 1, 1.25],
    double: [1, 1, 1, 1, 1, .9, 1, 1, 1, 1, 1, 1, 1],
    hewn: [1.25, 1.5, 1, 1, .9, .85, 1, 1, .9, 1, 1, 1, 1],
    puregunner: [1, .25, 1.5, 1.2, 1.35, .25, 1.25, .8, .65, 1, 1.5, 1.5, 1.2],
    machgun: [.66, .8, 2, 1, 1, .75, 1, 1.2, .8, 1, 1, 2.5, 1],
    gunner: [1.25, .25, 1.5, 1.1, 1, .35, 1.35, .9, .8, 1, 1.5, 1.5, 1.2],
    power: [1, 1, .6, 1.2, 1, 1, 1.25, 2, 1.7, 1, 2, .5, 1.5],
    nail: [.85, 2.5, 1, .8, 1, .7, 1, 1, 1, 1, 2, 1, 1],
    fast: [1, 1, 1, 1, 1, 1, 1, 1.2, 1, 1, 1, 1, 1],
    turret: [2, 1, 1, 1, .8, .6, .7, 1, 1, 1, .1, 1, 1],
    battle: [1, 1, 1, 1, 1.25, 1.15, 1, 1, .85, 1, 1, 1, 1.1],
    bees: [1.3, 1, 1, 1.4, 1, 1.5, .5, 3, 1.5, 1, .25, 1, 1],
    carrier: [1.5, 1, 1, 1, 1, .8, 1, 1.3, 1.2, 1.2, 1, 1, 1],
    hexatrap: [1.3, 1, 1.25, 1, 1, 1, 1, .8, 1, .5, 1, 1, 1],
    block: [1.1, 2, .1, 1.5, 2, 1, 1.25, 1.5, 2.5, 1.25, 1, 1, 1.25],
    construct: [1.3, 1, 1, .9, 1, 1, 1, 1, 1.1, 1, 1, 1, 1],
    boomerang: [.8, 1, 1, 1, .5, .5, 1, .75, .75, 1.333, 1, 1, 1],
    over: [1.25, 1, 1, .85, .7, .8, 1, 1, .9, 1, 2, 1, 1],
    meta: [1.333, 1, 1, 1, 1, .667, 1, 1, 1, 1, 1, 1, 1],
    overdrive: [5, 1, 1, 1, .8, .8, .8, .9, .9, .9, 1, 1.2, 1],
    weak: [2, 1, 1, 1, .6, .6, .8, .5, .7, .25, .3, 1, 1],
    master: [3, 1, 1, .7, .4, .7, 1, 1, 1, .1, .5, 1, 1],
    sunchip: [5, 1, 1, 1.4, .5, .4, .6, 1, 1, 1, .8, 1, 1],
    male: [.5, 1, 1, 1.05, 1.15, 1.15, 1.15, .8, .8, 1, 1.15, 1, 1],
    babyfactory: [1.5, 1, 1, 1, 1, 1, 1, 1, 1.35, 1, 1, 1, 1],
    lowpower: [1, 1, 2, 1, .5, .5, .7, 1, 1, 1, 1, .5, .7],
    halfrecoil: [1, .5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    morerecoil: [1, 1.15, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    muchmorerecoil: [1, 1.35, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    lotsmorrecoil: [1, 1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    tonsmorrecoil: [1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    doublereload: [.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    morereload: [.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    halfreload: [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    lessreload: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    threequartersrof: [1.333, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    morespeed: [1, 1, 1, 1, 1, 1, 1, 1.3, 1.3, 1, 1, 1, 1],
    bitlessspeed: [1, 1, 1, 1, 1, 1, 1, .93, .93, 1, 1, 1, 1],
    slow: [1, 1, 1, 1, 1, 1, 1, .7, .7, 1, 1, 1, 1],
    halfspeed: [1, 1, 1, 1, 1, 1, 1, .5, .5, 1, 1, 1, 1],
    notdense: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, .1, 1, 1],
    halfrange: [1, 1, 1, 1, 1, 1, 1, 1, 1, .5, 1, 1, 1],
    fake: [1, 1, 1, 1e-5, 1e-4, 1, 1, 1e-5, 2, 0, 1, 1, 1],
    op: [.5, 1.3, 1, 1, 4, 4, 4, 3, 2, 1, 5, 2, 1],
    protectorswarm: [5, 1e-6, 1, 1, 100, 1, 1, 1, 1, .5, 5, 1, 10],
    summoner: [.3, 1, 1, 1.125, .4, .345, .4, 1, 1, 1, .8, 1, 1],
    nest_keeper: [3, 1, 1, .75, 1.05, 1.05, 1.1, .5, .5, .5, 1.1, 1, 1],
    more_speed: [1, 1, 1, 1, 1, 1, 1, 1.3, 1.3, 1, 1, 1, 1],
    one_third_reload: [1.333, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
};
const dfltskl = 9;
// NAMES
const statnames = {
    smasher: 1,
    drone: 2,
    necro: 3,
    swarm: 4,
    trap: 5,
    generic: 6,
};
const gunCalcNames = {
    default: 0,
    bullet: 1,
    drone: 2,
    swarm: 3,
    fixedReload: 4,
    thruster: 5,
    sustained: 6,
    necro: 7,
    trap: 8,
};
const basePolygonDamage = 1;
const basePolygonHealth = 2;
const base = {
    ACCEL: 1.6,
    SPEED: 5.25,
    HEALTH: 20,
    DAMAGE: 3,
    RESIST: 1,
    PENETRATION: 1.05,
    SHIELD: 3,
    REGEN: .025,
    DENSITY: .5,
    FOV: 1.125
};
function makeAuto(type, name = -1, options = {}) {
    let turret = {
        type: exports.autoTurret,
        size: 10,
        independent: true,
    };
    if (options.type != null) {
        turret.type = options.type;
    }
    if (options.size != null) {
        turret.size = options.size;
    }
    if (options.independent != null) {
        turret.independent = options.independent;
    }
    let output = JSON.parse(JSON.stringify(type));
    let autogun = {
        /********* SIZE X Y ANGLE ARC */
        POSITION: [turret.size, 0, 0, 180, 360, 1, ],
        TYPE: [turret.type, {
            CONTROLLERS: ['nearestDifferentMaster'],
            INDEPENDENT: turret.independent,
        }],
    };
    if (type.GUNS != null) {
        output.GUNS = type.GUNS;
    }
    if (type.TURRETS == null) {
        output.TURRETS = [autogun];
    } else {
        output.TURRETS = [...type.TURRETS, autogun];
    }
    if (name == -1) {
        output.LABEL = 'Auto-' + type.LABEL;
    } else {
        output.LABEL = name;
    }
    output.DANGER = type.DANGER + 1;
    return output;
}

function makeHybrid(type, name = -1) {
    let output = JSON.parse(JSON.stringify(type));
    let spawner = {
        /********* LENGTH WIDTH ASPECT X Y ANGLE DELAY */
        POSITION: [7, 12, 1.2, 8, 0, 180, 0, ],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.weak]),
            TYPE: [exports.drone, {
                INDEPENDENT: true,
            }],
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: false,
            MAX_CHILDREN: 3,
        },
    };
    if (type.TURRETS != null) {
        output.TURRETS = type.TURRETS;
    }
    if (type.GUNS == null) {
        output.GUNS = [spawner];
    } else {
        output.GUNS = [...type.GUNS, spawner];
    }
    if (name == -1) {
        output.LABEL = 'Hybrid ' + type.LABEL;
    } else {
        output.LABEL = name;
    }
    return output;
}
function makeSwarmSpawner(guntype) {
    return {
        PARENT: [exports.genericTank],
        LABEL: '',
        BODY: {
            FOV: 2,
        },
        CONTROLLERS: ['nearestDifferentMaster'],
        COLOR: 16,
        AI: {
            NO_LEAD: true,
            SKYNET: true,
            FULL_VIEW: true,
        },
        GUNS: [{
            /*** LENGTH WIDTH ASPECT X Y ANGLE DELAY */
            POSITION: [14, 15, 0.6, 14, 0, 0, 0, ],
            PROPERTIES: {
                SHOOT_SETTINGS: guntype,
                TYPE: exports.swarm,
                STAT_CALCULATOR: gunCalcNames.swarm,
            },
        }],
    };
}
let smshskl = 12; //13;
exports.genericEntity = {
    NAME: "",
    LABEL: "Unknown Entity",
    TYPE: "unknown",
    DAMAGE_CLASS: 0,
    DANGER: 0,
    VALUE: 0,
    SHAPE: 0,
    COLOR: 16,
    INDEPENDENT: false,
    CONTROLLERS: ["doNothing"],
    HAS_NO_MASTER: false,
    MOTION_TYPE: "glide",
    FACING_TYPE: "toTarget",
    DRAW_HEALTH: false,
    DRAW_SELF: true,
    DAMAGE_EFFECTS: true,
    RATEFFECTS: true,
    MOTION_EFFECTS: true,
    INTANGIBLE: false,
    ACCEPTS_SCORE: true,
    GIVE_KILL_MESSAGE: false,
    CAN_GO_OUTSIDE_ROOM: false,
    HITS_OWN_TYPE: "normal",
    DIE_AT_LOW_SPEED: false,
    DIE_AT_RANGE: false,
    CLEAR_ON_MASTER_UPGRADE: false,
    PERSISTS_AFTER_DEATH: false,
    VARIES_IN_SIZE: false,
    HEALTH_WITH_LEVEL: true,
    CAN_BE_ON_LEADERBOARD: true,
    HAS_NO_RECOIL: false,
    AUTO_UPGRADE: "none",
    BUFF_VS_FOOD: false,
    OBSTACLE: false,
    CRAVES_ATTENTION: false,
    NECRO: false,
    UPGRADES_TIER_1: [],
    UPGRADES_TIER_2: [],
    UPGRADES_TIER_3: [],
    SKILL: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    LEVEL: 0,
    SKILL_CAP: [dfltskl, dfltskl, dfltskl, dfltskl, dfltskl, dfltskl, dfltskl, dfltskl, dfltskl, dfltskl],
    GUNS: [],
    MAX_CHILDREN: 0,
    BODY: {
        ACCELERATION: 1,
        SPEED: 0,
        HEALTH: 1,
        RESIST: 1,
        SHIELD: 0,
        REGEN: 0,
        DAMAGE: 1,
        PENETRATION: 1,
        RANGE: 0,
        FOV: 1,
        DENSITY: 1,
        STEALTH: 1,
        PUSHABILITY: 1,
        HETERO: 2
    },
    FOOD: {
        LEVEL: -1
    }
};
exports.food = {
    TYPE: "food",
    DAMAGE_CLASS: 1,
    CONTROLLERS: ["moveInCircles"],
    HITS_OWN_TYPE: "repel",
    MOTION_TYPE: "drift",
    FACING_TYPE: "turnWithSpeed",
    VARIES_IN_SIZE: true,
    BODY: {
        STEALTH: 30,
        PUSHABILITY: 1
    },
    DAMAGE_EFFECTS: false,
    RATEFFECTS: false,
    HEALTH_WITH_LEVEL: false
};
exports.hugePentagon = {
    PARENT: [exports.food],
    FOOD: {
        LEVEL: 5
    },
    LABEL: "Alpha Pentagon",
    VALUE: 15e3,
    SHAPE: -5,
    SIZE: 58,
    COLOR: 14,
    BODY: {
        DAMAGE: 2 * basePolygonDamage,
        DENSITY: 80,
        HEALTH: 300 * basePolygonHealth,
        RESIST: Math.pow(1.25, 3),
        SHIELD: 40 * basePolygonHealth,
        REGEN: .6
    },
    DRAW_HEALTH: true,
    GIVE_KILL_MESSAGE: true
};
exports.bigPentagon = {
    PARENT: [exports.food],
    FOOD: {
        LEVEL: 4
    },
    LABEL: "Beta Pentagon",
    VALUE: 2500,
    SHAPE: 5,
    SIZE: 30,
    COLOR: 14,
    BODY: {
        DAMAGE: 2 * basePolygonDamage,
        DENSITY: 30,
        HEALTH: 50 * basePolygonHealth,
        RESIST: Math.pow(1.25, 2),
        SHIELD: 20 * basePolygonHealth,
        REGEN: .2
    },
    DRAW_HEALTH: true,
    GIVE_KILL_MESSAGE: true
};
exports.pentagon = {
    PARENT: [exports.food],
    FOOD: {
        LEVEL: 3
    },
    LABEL: "Pentagon",
    VALUE: 400,
    SHAPE: 5,
    SIZE: 16,
    COLOR: 14,
    BODY: {
        DAMAGE: 1.5 * basePolygonDamage,
        DENSITY: 8,
        HEALTH: 10 * basePolygonHealth,
        RESIST: 1.25,
        PENETRATION: 1.1
    },
    DRAW_HEALTH: true
};
exports.triangle = {
    PARENT: [exports.food],
    FOOD: {
        LEVEL: 2
    },
    LABEL: "Triangle",
    VALUE: 120,
    SHAPE: 3,
    SIZE: 9,
    COLOR: 2,
    BODY: {
        DAMAGE: basePolygonDamage,
        DENSITY: 6,
        HEALTH: 3 * basePolygonHealth,
        RESIST: 1.15,
        PENETRATION: 1.5
    },
    DRAW_HEALTH: true
};
exports.square = {
    PARENT: [exports.food],
    FOOD: {
        LEVEL: 1
    },
    LABEL: "Square",
    VALUE: 30,
    SHAPE: 4,
    SIZE: 10,
    COLOR: 13,
    BODY: {
        DAMAGE: basePolygonDamage,
        DENSITY: 4,
        HEALTH: basePolygonHealth,
        PENETRATION: 2
    },
    DRAW_HEALTH: true,
    INTANGIBLE: false
};
exports.egg = {
    PARENT: [exports.food],
    FOOD: {
        LEVEL: 0
    },
    LABEL: "Egg",
    VALUE: 10,
    SHAPE: 0,
    SIZE: 5,
    COLOR: 6,
    INTANGIBLE: true,
    BODY: {
        DAMAGE: 0,
        DENSITY: 2,
        HEALTH: .0011,
        PUSHABILITY: 0
    },
    DRAW_HEALTH: false
};
exports.greenpentagon = {
    PARENT: [exports.food],
    LABEL: "Pentagon",
    VALUE: 3e4,
    SHAPE: 5,
    SIZE: 16,
    COLOR: 1,
    BODY: {
        DAMAGE: 3,
        DENSITY: 8,
        HEALTH: 200,
        RESIST: 1.25,
        PENETRATION: 1.1
    },
    DRAW_HEALTH: true,
    FOOD: {
        LEVEL: 6
    }
};
exports.greentriangle = {
    PARENT: [exports.food],
    LABEL: "Triangle",
    VALUE: 7e3,
    SHAPE: 3,
    SIZE: 9,
    COLOR: 1,
    BODY: {
        DAMAGE: 1,
        DENSITY: 6,
        HEALTH: 60,
        RESIST: 1.15,
        PENETRATION: 1.5
    },
    DRAW_HEALTH: true,
    FOOD: {
        LEVEL: 6
    }
};
exports.greensquare = {
    PARENT: [exports.food],
    LABEL: "Square",
    VALUE: 2e3,
    SHAPE: 4,
    SIZE: 10,
    COLOR: 1,
    BODY: {
        DAMAGE: .5,
        DENSITY: 4,
        HEALTH: 20,
        PENETRATION: 2
    },
    DRAW_HEALTH: true,
    INTANGIBLE: false,
    FOOD: {
        LEVEL: 6
    }
};
exports.gem = {
    PARENT: [exports.food],
    LABEL: "Gem",
    VALUE: 2e3,
    SHAPE: 6,
    SIZE: 5,
    COLOR: 0,
    BODY: {
        DAMAGE: basePolygonDamage / 4,
        DENSITY: 4,
        HEALTH: 10,
        PENETRATION: 2,
        RESIST: 2,
        PUSHABILITY: .25
    },
    DRAW_HEALTH: true,
    INTANGIBLE: false,
    FOOD: {
        LEVEL: 6
    }
};
exports.obstacle = {
    TYPE: "wall",
    DAMAGE_CLASS: 1,
    LABEL: "Rock",
    FACING_TYPE: "turnWithSpeed",
    SHAPE: -9,
    BODY: {
        PUSHABILITY: 0,
        HEALTH: 1e4,
        SHIELD: 1e4,
        REGEN: 1e3,
        DAMAGE: 1,
        RESIST: 100,
        STEALTH: 1
    },
    VALUE: 0,
    SIZE: 60,
    COLOR: 16,
    VARIES_IN_SIZE: true,
    GIVE_KILL_MESSAGE: true,
    ACCEPTS_SCORE: false
};
exports.babyObstacle = {
    PARENT: [exports.obstacle],
    SIZE: 25,
    SHAPE: -7,
    LABEL: "Gravel"
};
exports.mazeWall = {
    PARENT: [exports.obstacle],
    SIZE: 25,
    SHAPE: 4,
    LABEL: "Wall"
};
exports.bullet = {
    LABEL: "Bullet",
    TYPE: "bullet",
    ACCEPTS_SCORE: false,
    BODY: {
        PENETRATION: 1,
        SPEED: 3.75,
        RANGE: 90,
        DENSITY: 1.25,
        HEALTH: .165,
        DAMAGE: 6,
        PUSHABILITY: .3
    },
    FACING_TYPE: "smoothWithMotion",
    CAN_GO_OUTSIDE_ROOM: true,
    HITS_OWN_TYPE: "never",
    DIE_AT_RANGE: true
};
exports.casing = {
    PARENT: [exports.bullet],
    LABEL: "Shell",
    TYPE: "swarm"
};
exports.swarm = {
    LABEL: "Swarm Drone",
    TYPE: "swarm",
    ACCEPTS_SCORE: false,
    SHAPE: 3,
    MOTION_TYPE: "swarm",
    FACING_TYPE: "smoothWithMotion",
    CONTROLLERS: ["nearestDifferentMaster", "mapTargetToGoal"],
    CRAVES_ATTENTION: true,
    BODY: {
        ACCELERATION: 3,
        PENETRATION: 1.5,
        HEALTH: .175,
        DAMAGE: 2.25,
        SPEED: 4.5,
        RESIST: 1.6,
        RANGE: 225,
        DENSITY: 12,
        PUSHABILITY: .6,
        FOV: 1.5
    },
    DIE_AT_RANGE: true,
    BUFF_VS_FOOD: true
};
exports.bee = {
    PARENT: [exports.swarm],
    PERSISTS_AFTER_DEATH: true,
    SHAPE: 4,
    LABEL: "Drone",
    HITS_OWN_TYPE: "hardWithBuffer"
};
exports.autoswarm = {
    PARENT: [exports.swarm],
    AI: {
        FARMER: true
    },
    INDEPENDENT: true
};
exports.trap = {
    LABEL: "Thrown Trap",
    TYPE: "trap",
    ACCEPTS_SCORE: false,
    SHAPE: -3,
    MOTION_TYPE: "glide",
    FACING_TYPE: "turnWithSpeed",
    HITS_OWN_TYPE: "push",
    DIE_AT_RANGE: true,
    BODY: {
        HEALTH: .5,
        DAMAGE: 3,
        RANGE: 450,
        DENSITY: 2.5,
        RESIST: 2.5,
        SPEED: 0
    }
};
exports.block = {
    LABEL: "Set Trap",
    PARENT: [exports.trap],
    SHAPE: -4,
    MOTION_TYPE: "motor",
    CONTROLLERS: ["goToMasterTarget"],
    BODY: {
        SPEED: 1,
        DENSITY: 5
    }
};
exports.boomerang = {
    LABEL: "Boomerang",
    PARENT: [exports.trap],
    CONTROLLERS: ["boomerang"],
    MOTION_TYPE: "motor",
    HITS_OWN_TYPE: "never",
    SHAPE: -5,
    BODY: {
        SPEED: 1.25,
        RANGE: 120
    }
};
exports.drone = {
    LABEL: "Drone",
    TYPE: "drone",
    ACCEPTS_SCORE: false,
    DANGER: 2,
    CONTROL_RANGE: 0,
    SHAPE: 3,
    MOTION_TYPE: "chase",
    FACING_TYPE: "smoothToTarget",
    CONTROLLERS: ["nearestDifferentMaster", "canRepel", "mapTargetToGoal", "hangOutNearMaster"],
    AI: {
        BLIND: true
    },
    BODY: {
        PENETRATION: 1.2,
        PUSHABILITY: .6,
        ACCELERATION: .05,
        HEALTH: .3,
        DAMAGE: 3.375,
        SPEED: 3.8,
        RANGE: 200,
        DENSITY: .03,
        RESIST: 1.5,
        FOV: .5
    },
    HITS_OWN_TYPE: "hard",
    DRAW_HEALTH: false,
    CLEAR_ON_MASTER_UPGRADE: true,
    BUFF_VS_FOOD: true
};
exports.sunchip = {
    PARENT: [exports.drone],
    SHAPE: 4,
    NECRO: true,
    HITS_OWN_TYPE: "hard",
    BODY: {
        FOV: .5
    },
    AI: {
        BLIND: true,
        FARMER: true
    },
    DRAW_HEALTH: false
};
exports.autosunchip = {
    PARENT: [exports.sunchip],
    AI: {
        BLIND: true,
        FARMER: true
    },
    INDEPENDENT: true
};
exports.gunchip = {
    PARENT: [exports.drone],
    SHAPE: -2,
    NECRO: true,
    HITS_OWN_TYPE: "hard",
    BODY: {
        FOV: .5
    },
    AI: {
        BLIND: true,
        FARMER: true
    },
    DRAW_HEALTH: false
};
exports.missile = {
    PARENT: [exports.bullet],
    LABEL: "Missile",
    INDEPENDENT: true,
    BODY: {
        RANGE: 120
    },
    GUNS: [{
        POSITION: [14, 6, 1, 0, -2, 130, 0],
        PROPERTIES: {
            AUTOFIRE: true,
            SHOOT_SETTINGS: combineStats([g.basic, g.skim, g.doublereload, g.lowpower, g.muchmorerecoil, g.morespeed, g.morespeed]),
            TYPE: [exports.bullet, {
                PERSISTS_AFTER_DEATH: true
            }],
            STAT_CALCULATOR: gunCalcNames.thruster
        }
    }, {
        POSITION: [14, 6, 1, 0, 2, 230, 0],
        PROPERTIES: {
            AUTOFIRE: true,
            SHOOT_SETTINGS: combineStats([g.basic, g.skim, g.doublereload, g.lowpower, g.muchmorerecoil, g.morespeed, g.morespeed]),
            TYPE: [exports.bullet, {
                PERSISTS_AFTER_DEATH: true
            }],
            STAT_CALCULATOR: gunCalcNames.thruster
        }
    }]
};
exports.spinmissile = {
    PARENT: [exports.bullet],
    LABEL: "Missile",
    INDEPENDENT: !0,
    BODY: {
        RANGE: 120
    },
    FACING_TYPE: "fastspin",
    GUNS: [{
        POSITION: [14, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            AUTOFIRE: !0,
            SHOOT_SETTINGS: combineStats([g.basic, g.skim, g.doublereload, g.lowpower, g.morereload, g.morespeed]),
            TYPE: [exports.bullet, {
                PERSISTS_AFTER_DEATH: !0
            }],
            STAT_CALCULATOR: gunCalcNames.thruster
        }
    }, {
        POSITION: [14, 8, 1, 0, 0, 180, 0],
        PROPERTIES: {
            AUTOFIRE: !0,
            SHOOT_SETTINGS: combineStats([g.basic, g.skim, g.doublereload, g.lowpower, g.morereload, g.morespeed]),
            TYPE: [exports.bullet, {
                PERSISTS_AFTER_DEATH: !0
            }],
            STAT_CALCULATOR: gunCalcNames.thruster
        }
    }]
};
exports.hypermissile = {
    PARENT: [exports.missile],
    GUNS: [{
        POSITION: [14, 6, 1, 0, -2, 150, 0],
        PROPERTIES: {
            AUTOFIRE: true,
            SHOOT_SETTINGS: combineStats([g.basic, [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]),
            TYPE: [exports.bullet, {
                PERSISTS_AFTER_DEATH: true
            }],
            STAT_CALCULATOR: gunCalcNames.thruster
        }
    }, {
        POSITION: [14, 6, 1, 0, 2, 210, 0],
        PROPERTIES: {
            AUTOFIRE: true,
            SHOOT_SETTINGS: combineStats([g.basic, [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]),
            TYPE: [exports.bullet, {
                PERSISTS_AFTER_DEATH: true
            }],
            STAT_CALCULATOR: gunCalcNames.thruster
        }
    }, {
        POSITION: [14, 6, 1, 0, -2, 90, .5],
        PROPERTIES: {
            AUTOFIRE: true,
            SHOOT_SETTINGS: combineStats([g.basic, [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]),
            TYPE: [exports.bullet, {
                PERSISTS_AFTER_DEATH: true
            }]
        }
    }, {
        POSITION: [14, 6, 1, 0, 2, 270, .5],
        PROPERTIES: {
            AUTOFIRE: true,
            SHOOT_SETTINGS: combineStats([g.basic, [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]),
            TYPE: [exports.bullet, {
                PERSISTS_AFTER_DEATH: true
            }]
        }
    }]
};
exports.snake = {
    PARENT: [exports.bullet],
    LABEL: "Snake",
    INDEPENDENT: true,
    BODY: {
        RANGE: 120
    },
    GUNS: [{
        POSITION: [6, 12, 1.4, 8, 0, 180, 0],
        PROPERTIES: {
            AUTOFIRE: true,
            STAT_CALCULATOR: gunCalcNames.thruster,
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter, g.hunter2, g.snake, g.snakeskin]),
            TYPE: [exports.bullet, {
                PERSISTS_AFTER_DEATH: true
            }]
        }
    }, {
        POSITION: [10, 12, .8, 8, 0, 180, .5],
        PROPERTIES: {
            AUTOFIRE: true,
            NEGATIVE_RECOIL: true,
            STAT_CALCULATOR: gunCalcNames.thruster,
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter, g.hunter2, g.snake]),
            TYPE: [exports.bullet, {
                PERSISTS_AFTER_DEATH: true
            }]
        }
    }]
};
exports.hive = {
    PARENT: [exports.bullet],
    LABEL: "Hive",
    BODY: {
        RANGE: 90,
        FOV: .5
    },
    FACING_TYPE: "turnWithSpeed",
    INDEPENDENT: true,
    CONTROLLERS: ["alwaysFire", "nearestDifferentMaster", "targetSelf"],
    AI: {
        NO_LEAD: true
    },
    GUNS: [{
        POSITION: [7, 9.5, .6, 7, 0, 108, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.hive, g.bees]),
            TYPE: exports.bee,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [7, 9.5, .6, 7, 0, 180, .2],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.hive, g.bees]),
            TYPE: exports.bee,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [7, 9.5, .6, 7, 0, 252, .4],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.hive, g.bees]),
            TYPE: exports.bee,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [7, 9.5, .6, 7, 0, 324, .6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.hive, g.bees]),
            TYPE: exports.bee,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [7, 9.5, .6, 7, 0, 36, .8],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.hive, g.bees]),
            TYPE: exports.bee,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }]
};
exports.genericTank = {
    LABEL: "Unknown Class",
    TYPE: "tank",
    DAMAGE_CLASS: 2,
    DANGER: 5,
    MOTION_TYPE: "motor",
    FACING_TYPE: "toTarget",
    SIZE: 12,
    MAX_CHILDREN: 0,
    DAMAGE_EFFECTS: false,
    BODY: {
        ACCELERATION: base.ACCEL,
        SPEED: base.SPEED,
        HEALTH: base.HEALTH,
        DAMAGE: base.DAMAGE,
        PENETRATION: base.PENETRATION,
        SHIELD: base.SHIELD,
        REGEN: base.REGEN,
        FOV: base.FOV,
        DENSITY: base.DENSITY,
        PUSHABILITY: 1,
        HETERO: 3
    },
    GUNS: [],
    TURRETS: [],
    GIVE_KILL_MESSAGE: true,
    DRAW_HEALTH: true,
    HITS_OWN_TYPE: "hardOnlyTanks"
};
exports.turretParent = {
    PARENT: [exports.genericTank],
    LABEL: "Turret",
    DANGER: 0,
    BODY: {
        FOV: 4
    },
    AI: {
        BLIND: true,
        SKYNET: true
    },
    CONTROLLERS: ["canRepel", "onlyAcceptInArc", "mapAltToFire", "nearestDifferentMaster"]
};
exports.autoTurret = {
    PARENT: [exports.genericTank],
    LABEL: "Turret",
    BODY: {
        FOV: .8
    },
    COLOR: 16,
    GUNS: [{
        POSITION: [22, 10, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.morerecoil, g.turret]),
            TYPE: exports.bullet
        }
    }]
};
exports.machineAutoTurret = {
    PARENT: [exports.genericTank],
    LABEL: "Turret",
    COLOR: 16,
    GUNS: [{
        POSITION: [14, 11, 1.3, 8, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.morerecoil, g.turret, g.mach, g.slow]),
            TYPE: exports.bullet
        }
    }]
};
exports.autoSmasherTurret = {
    PARENT: [exports.genericTank],
    LABEL: "Turret",
    COLOR: 16,
    GUNS: [{
        POSITION: [20, 6, 1, 0, 5, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.morerecoil, g.turret, g.fast, g.mach, g.pound, g.morereload, g.morereload]),
            TYPE: exports.bullet,
            STAT_CALCULATOR: gunCalcNames.fixedReload
        }
    }, {
        POSITION: [20, 6, 1, 0, -5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.morerecoil, g.turret, g.fast, g.mach, g.pound, g.morereload, g.morereload]),
            TYPE: exports.bullet,
            STAT_CALCULATOR: gunCalcNames.fixedReload
        }
    }]
};
exports.oldAutoSmasherTurret = {
    PARENT: [exports.genericTank],
    LABEL: "Turret",
    COLOR: 16,
    GUNS: [{
        POSITION: [20, 7, 1, 0, -5.75, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.lotsmorrecoil, g.morereload]),
            TYPE: exports.bullet,
            STAT_CALCULATOR: gunCalcNames.fixedReload
        }
    }, {
        POSITION: [20, 7, 1, 0, 5.75, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.lotsmorrecoil, g.morereload]),
            TYPE: exports.bullet,
            STAT_CALCULATOR: gunCalcNames.fixedReload
        }
    }]
};
exports.droneAutoTurret = {
    PARENT: [exports.genericTank],
    LABEL: "Turret",
    BODY: {
        FOV: .8
    },
    COLOR: 16,
    GUNS: [{
        POSITION: [22, 10, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.morerecoil, g.turret, g.overdrive]),
            TYPE: exports.bullet
        }
    }]
};
exports.auto3gun = {
    PARENT: [exports.genericTank],
    LABEL: "",
    BODY: {
        FOV: 3
    },
    CONTROLLERS: ["canRepel", "onlyAcceptInArc", "mapAltToFire", "nearestDifferentMaster"],
    COLOR: 16,
    GUNS: [{
        POSITION: [22, 10, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.auto]),
            TYPE: exports.bullet
        }
    }]
};
exports.auto5gun = {
    PARENT: [exports.genericTank],
    LABEL: "",
    BODY: {
        FOV: 3
    },
    CONTROLLERS: ["canRepel", "onlyAcceptInArc", "mapAltToFire", "nearestDifferentMaster"],
    COLOR: 16,
    GUNS: [{
        POSITION: [24, 11, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.auto, g.five]),
            TYPE: exports.bullet
        }
    }]
};
exports.heavy3gun = {
    PARENT: [exports.genericTank],
    LABEL: "",
    BODY: {
        FOV: 2,
        SPEED: .9
    },
    CONTROLLERS: ["canRepel", "onlyAcceptInArc", "mapAltToFire", "nearestDifferentMaster"],
    COLOR: 16,
    GUNS: [{
        POSITION: [22, 14, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.auto]),
            TYPE: exports.bullet
        }
    }]
};
exports.masterGun = {
    PARENT: [exports.genericTank],
    LABEL: "",
    BODY: {
        FOV: 3
    },
    CONTROLLERS: ["nearestDifferentMaster"],
    COLOR: 16,
    MAX_CHILDREN: 6,
    AI: {
        NO_LEAD: true,
        SKYNET: true,
        FULL_VIEW: true
    },
    GUNS: [{
        POSITION: [8, 14, 1.3, 8, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.master]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone
        }
    }]
};
exports.sniper3gun = {
    PARENT: [exports.genericTank],
    LABEL: "",
    BODY: {
        FOV: 5
    },
    CONTROLLERS: ["canRepel", "onlyAcceptInArc", "mapAltToFire", "nearestDifferentMaster"],
    COLOR: 16,
    GUNS: [{
        POSITION: [27, 9, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.auto, g.assass, g.autosnipe]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [5, 9, -1.5, 8, 0, 0, 0]
    }]
};
exports.bansheegun = {
    PARENT: [exports.genericTank],
    LABEL: "",
    CONTROLLERS: ["canRepel", "onlyAcceptInArc", "mapAltToFire", "nearestDifferentMaster"],
    COLOR: 16,
    INDEPENDENT: true,
    GUNS: [{
        POSITION: [26, 10, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.auto, g.lessreload]),
            TYPE: exports.bullet
        }
    }]
};
exports.auto4gun = {
    PARENT: [exports.genericTank],
    LABEL: "",
    BODY: {
        FOV: 2
    },
    CONTROLLERS: ["canRepel", "onlyAcceptInArc", "mapAltToFire", "nearestDifferentMaster"],
    COLOR: 16,
    GUNS: [{
        POSITION: [16, 4, 1, 0, -3.5, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.auto, g.gunner, g.twin, g.power, g.slow]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [16, 4, 1, 0, 3.5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.auto, g.gunner, g.twin, g.power, g.slow]),
            TYPE: exports.bullet
        }
    }]
};
exports.bigauto4gun = {
    PARENT: [exports.genericTank],
    LABEL: "",
    CONTROLLERS: ["canRepel", "onlyAcceptInArc", "mapAltToFire", "nearestDifferentMaster"],
    COLOR: 16,
    GUNS: [{
        POSITION: [14, 5, 1, 0, -4.5, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.auto, g.gunner, g.twin, g.twin, g.power, g.halfreload]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [14, 5, 1, 0, 4.5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.auto, g.gunner, g.twin, g.twin, g.power, g.halfreload]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [16, 5, 1, 0, 0, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.auto, g.gunner, g.twin, g.twin, g.power, g.halfreload]),
            TYPE: exports.bullet
        }
    }]
};
exports.tritrapgun = {
    PARENT: [exports.genericTank],
    LABEL: "",
    COLOR: 16,
    GUNS: [{
        POSITION: [20, 16, 1, 0, 0, 0, 0]
    }, {
        POSITION: [2, 16, 1.1, 20, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.block, g.auto]),
            TYPE: exports.block
        }
    }]
};
exports.smasherBody = {
    LABEL: "",
    CONTROLLERS: ["spin"],
    COLOR: 9,
    SHAPE: 6,
    INDEPENDENT: true
};
exports.landmineBody = {
    LABEL: "",
    CONTROLLERS: ["fastspin"],
    COLOR: 9,
    SHAPE: 6,
    INDEPENDENT: !0
};
exports.spikeBody = {
    LABEL: "",
    CONTROLLERS: ["spin"],
    COLOR: 9,
    SHAPE: -4,
    INDEPENDENT: true
};
exports.spikeBody1 = {
    LABEL: "",
    CONTROLLERS: ["fastspin"],
    COLOR: 9,
    SHAPE: 3,
    INDEPENDENT: true
};
exports.spikeBody2 = {
    LABEL: "",
    CONTROLLERS: ["reversespin"],
    COLOR: 9,
    SHAPE: 3,
    INDEPENDENT: true
};
exports.megasmashBody = {
    LABEL: "",
    CONTROLLERS: ["spin"],
    COLOR: 9,
    SHAPE: -6,
    INDEPENDENT: true
};
exports.dominationBody = {
    LABEL: "",
    CONTROLLERS: ["dontTurn"],
    COLOR: 9,
    SHAPE: 8,
    INDEPENDENT: true
};
exports.baseSwarmTurret = {
    PARENT: [exports.genericTank],
    LABEL: "Protector",
    COLOR: 16,
    BODY: {
        FOV: 2
    },
    CONTROLLERS: ["nearestDifferentMaster"],
    AI: {
        NO_LEAD: true,
        LIKES_SHAPES: true
    },
    INDEPENDENT: true,
    GUNS: [{
        POSITION: [5, 4.5, .6, 7, 2, 0, .15],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.protectorswarm]),
            TYPE: exports.swarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [5, 4.5, .6, 7, -2, 0, .15],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.protectorswarm]),
            TYPE: exports.swarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [5, 4.5, .6, 7.5, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.protectorswarm]),
            TYPE: [exports.swarm, {
                INDEPENDENT: true,
                AI: {
                    LIKES_SHAPES: true
                }
            }],
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }]
};
exports.baseGunTurret = {
    PARENT: [exports.genericTank],
    LABEL: "Protector",
    BODY: {
        FOV: 5
    },
    ACCEPTS_SCORE: false,
    CONTROLLERS: ["nearestDifferentMaster"],
    INDEPENDENT: true,
    COLOR: 16,
    GUNS: [{
        POSITION: [12, 12, 1, 6, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.destroy]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [11, 13, 1, 6, 0, 0, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.destroy]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [7, 13, -1.3, 6, 0, 0, 0]
    }]
};
exports.baseBody = {
    LABEL: "",
    CONTROLLERS: ["dontTurn"],
    COLOR: 9,
    SHAPE: 8,
    INDEPENDENT: true
};
exports.baseProtector = {
    PARENT: [exports.genericTank],
    LABEL: "Base",
    SIZE: 64,
    DAMAGE_CLASS: 0,
    ACCEPTS_SCORE: false,
    CAN_BE_ON_LEADERBOARD: false,
    SKILL: skillSet({
        rld: 1,
        dam: 1,
        pen: 1,
        spd: 1,
        str: 1
    }),
    BODY: {
        SPEED: 0,
        HEALTH: 1e4,
        DAMAGE: 10,
        PENETRATION: .25,
        SHIELD: 1e3,
        REGEN: 100,
        FOV: 1,
        PUSHABILITY: 0,
        HETERO: 0
    },
    FACING_TYPE: "autospin",
    TURRETS: [{
        POSITION: [25, 0, 0, 0, 360, 0],
        TYPE: exports.baseBody
    }, {
        POSITION: [12, 7, 0, 45, 100, 0],
        TYPE: exports.baseSwarmTurret
    }, {
        POSITION: [12, 7, 0, 135, 100, 0],
        TYPE: exports.baseSwarmTurret
    }, {
        POSITION: [12, 7, 0, 225, 100, 0],
        TYPE: exports.baseSwarmTurret
    }, {
        POSITION: [12, 7, 0, 315, 100, 0],
        TYPE: exports.baseSwarmTurret
    }],
    GUNS: [{
        POSITION: [4.5, 11.5, -1.3, 6, 0, 45, 0]
    }, {
        POSITION: [4.5, 11.5, -1.3, 6, 0, 135, 0]
    }, {
        POSITION: [4.5, 11.5, -1.3, 6, 0, 225, 0]
    }, {
        POSITION: [4.5, 11.5, -1.3, 6, 0, 315, 0]
    }, {
        POSITION: [4.5, 8.5, -1.5, 7, 0, 45, 0]
    }, {
        POSITION: [4.5, 8.5, -1.5, 7, 0, 135, 0]
    }, {
        POSITION: [4.5, 8.5, -1.5, 7, 0, 225, 0]
    }, {
        POSITION: [4.5, 8.5, -1.5, 7, 0, 315, 0]
    }]
};
exports.minion = {
    PARENT: [exports.genericTank],
    LABEL: "Minion",
    TYPE: "minion",
    DAMAGE_CLASS: 0,
    HITS_OWN_TYPE: "hardWithBuffer",
    FACING_TYPE: "smoothToTarget",
    BODY: {
        FOV: .5,
        SPEED: 3,
        ACCELERATION: .4,
        HEALTH: 5,
        SHIELD: 0,
        DAMAGE: 1.2,
        RESIST: 1,
        PENETRATION: 1,
        DENSITY: .4
    },
    AI: {
        BLIND: true
    },
    DRAW_HEALTH: false,
    CLEAR_ON_MASTER_UPGRADE: true,
    GIVE_KILL_MESSAGE: false,
    CONTROLLERS: ["nearestDifferentMaster", "mapAltToFire", "minion", "canRepel", "hangOutNearMaster"],
    GUNS: [{
        POSITION: [17, 9, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.minion]),
            WAIT_TO_CYCLE: true,
            TYPE: exports.bullet
        }
    }]
};
exports.pillboxTurret = {
    PARENT: [exports.genericTank],
    LABEL: "",
    COLOR: 16,
    BODY: {
        FOV: 2
    },
    HAS_NO_RECOIL: true,
    GUNS: [{
        POSITION: [22, 11, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.minion, g.turret, g.power, g.auto, g.notdense]),
            TYPE: exports.bullet
        }
    }]
};
exports.pillbox = {
    LABEL: "Pillbox",
    PARENT: [exports.trap],
    SHAPE: -4,
    MOTION_TYPE: "motor",
    CONTROLLERS: ["goToMasterTarget", "nearestDifferentMaster"],
    INDEPENDENT: true,
    BODY: {
        SPEED: 1,
        DENSITY: 5
    },
    DIE_AT_RANGE: true,
    TURRETS: [{
        POSITION: [11, 0, 0, 0, 360, 1],
        TYPE: exports.pillboxTurret
    }]
};
exports.skimturret = {
    PARENT: [exports.genericTank],
    BODY: {
        FOV: 2 * base.FOV
    },
    COLOR: 2,
    CONTROLLERS: ["canRepel", "onlyAcceptInArc", "mapAltToFire", "nearestDifferentMaster"],
    LABEL: "",
    GUNS: [{
        POSITION: [10, 14, -.5, 9, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.arty, g.arty, g.skim]),
            TYPE: exports.hypermissile
        }
    }, {
        POSITION: [17, 15, 1, 0, 0, 0, 0]
    }]
};
exports.basic = {
    PARENT: [exports.genericTank],
    LABEL: "Basic",
    GUNS: [{
        POSITION: [18, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic]),
            TYPE: exports.bullet,
            LABEL: "",
            STAT_CALCULATOR: 0,
            WAIT_TO_CYCLE: false,
            AUTOFIRE: false,
            SYNCS_SKILLS: false,
            MAX_CHILDREN: 0,
            ALT_FIRE: false,
            NEGATIVE_RECOIL: false
        }
    }]
};
exports.testbed = {
    PARENT: [exports.genericTank],
    LABEL: "TESTBED",
    GUNS: [{
        POSITION: [18, 10, -1.4, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic]),
            TYPE: exports.bullet
        }
    }]
};
exports.betaTanks = {
    PARENT: [exports.genericTank],
    LABEL: "Beta Tanks",
    GUNS: [{
        POSITION: [18, 10, -1.4, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic]),
            TYPE: exports.bullet
        }
    }]
};
exports.bosses = {
    PARENT: [exports.genericTank],
    LABEL: "Bosses",
    GUNS: [{
        POSITION: [18, 10, -1.4, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic]),
            TYPE: exports.bullet
        }
    }]
};
exports.misc = {
    PARENT: [exports.genericTank],
    LABEL: "Misc",
    GUNS: [{
        POSITION: [18, 10, -1.4, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic]),
            TYPE: exports.bullet
        }
    }]
};
exports.single = {
    PARENT: [exports.genericTank],
    LABEL: "Single",
    GUNS: [{
        POSITION: [19, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.single]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [5.5, 8, -1.8, 6.5, 0, 0, 0]
    }]
};
exports.smash = {
    PARENT: [exports.genericTank],
    LABEL: "Smasher",
    DANGER: 6,
    BODY: {
        FOV: 1.05 * base.FOV,
        DENSITY: 2 * base.DENSITY
    },
    TURRETS: [{
        POSITION: [21.5, 0, 0, 0, 360, 0],
        TYPE: exports.smasherBody
    }],
    IS_SMASHER: true,
    SKILL_CAP: [smshskl, 0, 0, 0, 0, smshskl, smshskl, smshskl, smshskl, smshskl],
    STAT_NAMES: statnames.smasher
};
exports.megasmash = {
    PARENT: [exports.genericTank],
    LABEL: "Mega-Smasher",
    DANGER: 7,
    BODY: {
        SPEED: 1.05 * base.speed,
        FOV: 1.1 * base.FOV,
        DENSITY: 4 * base.DENSITY
    },
    IS_SMASHER: true,
    SKILL_CAP: [smshskl, 0, 0, 0, 0, smshskl, smshskl, smshskl, smshskl, smshskl],
    STAT_NAMES: statnames.smasher,
    TURRETS: [{
        POSITION: [24, 0, 0, 0, 360, 0],
        TYPE: exports.megasmashBody
    }]
};
exports.spike = {
    PARENT: [exports.genericTank],
    LABEL: "Spike",
    DANGER: 7,
    BODY: {
        SPEED: .9 * base.speed,
        DAMAGE: 1.1 * base.DAMAGE,
        FOV: 1.05 * base.FOV,
        DENSITY: 2 * base.DENSITY
    },
    IS_SMASHER: true,
    SKILL_CAP: [smshskl, 0, 0, 0, 0, smshskl, smshskl, smshskl, smshskl, smshskl],
    STAT_NAMES: statnames.smasher,
    TURRETS: [{
        POSITION: [20.5, 0, 0, 0, 360, 0],
        TYPE: exports.spikeBody
    }, {
        POSITION: [20.5, 0, 0, 120, 360, 0],
        TYPE: exports.spikeBody
    }, {
        POSITION: [20.5, 0, 0, 240, 360, 0],
        TYPE: exports.spikeBody
    }]
};
exports.landmine = {
    PARENT: [exports.genericTank],
    LABEL: "Landmine",
    INVISIBLE: [.06, .01],
    DANGER: 7,
    BODY: {
        SPEED: 1.1 * base.SPEED,
        FOV: 1.05 * base.FOV,
        DENSITY: 2 * base.DENSITY
    },
    TURRETS: [{
        POSITION: [21.5, 0, 0, 0, 360, 0],
        TYPE: exports.smasherBody
    }, {
        POSITION: [21.5, 0, 0, 0, 360, 0],
        TYPE: exports.landmineBody
    }],
    IS_SMASHER: !0,
    SKILL_CAP: [smshskl, 0, 0, 0, 0, smshskl, smshskl, smshskl, smshskl, smshskl],
    STAT_NAMES: statnames.smasher
};
exports.weirdspike = {
    PARENT: [exports.genericTank],
    LABEL: "Spike",
    DANGER: 7,
    BODY: {
        DAMAGE: 1.15 * base.DAMAGE,
        FOV: 1.05 * base.FOV,
        DENSITY: 1.5 * base.DENSITY
    },
    IS_SMASHER: true,
    SKILL_CAP: [smshskl, 0, 0, 0, 0, smshskl, smshskl, smshskl, smshskl, smshskl],
    STAT_NAMES: statnames.smasher,
    TURRETS: [{
        POSITION: [20.5, 0, 0, 0, 360, 0],
        TYPE: exports.spikeBody1
    }, {
        POSITION: [20.5, 0, 0, 180, 360, 0],
        TYPE: exports.spikeBody2
    }]
};
exports.autosmash = makeAuto(exports.smash, "Auto-Smasher", {
    type: exports.autoSmasherTurret,
    size: 11
}), exports.autosmash.SKILL_CAP = [smshskl, smshskl, smshskl, smshskl, smshskl, smshskl, smshskl, smshskl, smshskl, smshskl];
exports.twin = {
    PARENT: [exports.genericTank],
    LABEL: "Twin",
    GUNS: [{
        POSITION: [20, 8, 1, 0, 5.5, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, -5.5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin]),
            TYPE: exports.bullet
        }
    }]
};
exports.gunner = {
    PARENT: [exports.genericTank],
    LABEL: "Gunner",
    DANGER: 6,
    GUNS: [{
        POSITION: [12, 3.5, 1, 0, 7.25, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.fast]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [12, 3.5, 1, 0, -7.25, 0, .75],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.fast]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [16, 3.5, 1, 0, 3.75, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.fast]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [16, 3.5, 1, 0, -3.75, 0, .25],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.fast]),
            TYPE: exports.bullet
        }
    }]
};
exports.machinegunner = {
    PARENT: [exports.genericTank],
    LABEL: "Machine Gunner",
    DANGER: 6,
    BODY: {
        SPEED: .9 * base.SPEED
    },
    GUNS: [{
        POSITION: [14, 3, 4, -3, 5, 0, .6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.machgun]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [14, 3, 4, -3, -5, 0, .8],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.machgun]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [14, 3, 4, 0, 2.5, 0, .4],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.machgun]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [14, 3, 4, 0, -2.5, 0, .2],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.machgun]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [14, 3, 4, 3, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.machgun]),
            TYPE: exports.bullet
        }
    }]
};
exports.autogunner = makeAuto(exports.gunner), exports.nailgun = {
    PARENT: [exports.genericTank],
    LABEL: "Nailgun",
    DANGER: 7,
    BODY: {
        FOV: 1.1 * base.FOV,
        SPEED: .9 * base.SPEED
    },
    GUNS: [{
        POSITION: [19, 2, 1, 0, -2.5, 0, .25],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.twin, g.nail]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 2, 1, 0, 2.5, 0, .75],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.twin, g.nail]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 2, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.twin, g.nail]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [5.5, 8, -1.8, 6.5, 0, 0, 0]
    }]
};
exports.double = {
    PARENT: [exports.genericTank],
    LABEL: "Double Twin",
    DANGER: 6,
    GUNS: [{
        POSITION: [20, 8, 1, 0, 5.5, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, -5.5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, 5.5, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, -5.5, 180, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double]),
            TYPE: exports.bullet
        }
    }]
};
exports.tripletwin = {
    PARENT: [exports.genericTank],
    LABEL: "Triple Twin",
    DANGER: 7,
    GUNS: [{
        POSITION: [20, 8, 1, 0, 5.5, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.spam, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, -5.5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.spam, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, 5.5, 120, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.spam, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, -5.5, 120, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.spam, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, 5.5, 240, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.spam, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, -5.5, 240, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.spam, g.double]),
            TYPE: exports.bullet
        }
    }]
};
exports.autodouble = makeAuto(exports.double, "Auto-Double"), exports.split = {
    PARENT: [exports.genericTank],
    LABEL: "Hewn Double",
    DANGER: 7,
    GUNS: [{
        POSITION: [19, 8, 1, 0, 5.5, 25, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.twin, g.double, g.hewn, g.morerecoil]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 8, 1, 0, -5.5, -25, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.twin, g.double, g.hewn, g.morerecoil]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, 5.5, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double, g.hewn, g.morerecoil]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, -5.5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double, g.hewn, g.morerecoil]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, 5.5, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double, g.hewn]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, -5.5, 180, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.double, g.hewn]),
            TYPE: exports.bullet
        }
    }]
};
exports.bent = {
    PARENT: [exports.genericTank],
    LABEL: "Triple Shot",
    DANGER: 6,
    BODY: {
        SPEED: .9 * base.SPEED
    },
    GUNS: [{
        POSITION: [19, 8, 1, 0, -2, -20, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 8, 1, 0, 2, 20, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [22, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
            TYPE: exports.bullet
        }
    }]
};
exports.bentdouble = {
    PARENT: [exports.genericTank],
    LABEL: "Bent Double",
    DANGER: 7,
    GUNS: [{
        POSITION: [19, 8, 1, 0, -1, -25, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 8, 1, 0, 1, 25, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [22, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 8, 1, 0, -1, 155, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 8, 1, 0, 1, -155, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent, g.double]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [22, 8, 1, 0, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent, g.double]),
            TYPE: exports.bullet
        }
    }]
};
exports.penta = {
    PARENT: [exports.genericTank],
    LABEL: "Penta Shot",
    DANGER: 7,
    BODY: {
        SPEED: .85 * base.SPEED
    },
    GUNS: [{
        POSITION: [16, 8, 1, 0, -3, -30, .667],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [16, 8, 1, 0, 3, 30, .667],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 8, 1, 0, -2, -15, .333],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 8, 1, 0, 2, 15, .333],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [22, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.bent]),
            TYPE: exports.bullet
        }
    }]
};
exports.benthybrid = makeHybrid(exports.bent, "Bent Hybrid"), exports.triple = {
    PARENT: [exports.genericTank],
    DANGER: 6,
    BODY: {
        FOV: 1.05 * base.FOV
    },
    LABEL: "Triplet",
    GUNS: [{
        POSITION: [18, 10, 1, 0, 5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 10, 1, 0, -5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [21, 10, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple]),
            TYPE: exports.bullet
        }
    }]
};
exports.quint = {
    PARENT: [exports.genericTank],
    DANGER: 7,
    BODY: {
        FOV: 1.1 * base.FOV
    },
    LABEL: "Quintuplet",
    GUNS: [{
        POSITION: [16, 10, 1, 0, -5, 0, .667],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple, g.quint]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [16, 10, 1, 0, 5, 0, .667],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple, g.quint]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 10, 1, 0, -3, 0, .333],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple, g.quint]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 10, 1, 0, 3, 0, .333],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple, g.quint]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [22, 10, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.triple, g.quint]),
            TYPE: exports.bullet
        }
    }]
};
exports.dual = {
    PARENT: [exports.genericTank],
    DANGER: 7,
    BODY: {
        ACCEL: .8 * base.ACCEL,
        FOV: 1.1 * base.FOV
    },
    LABEL: "Dual",
    GUNS: [{
        POSITION: [18, 7, 1, 0, 5.5, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.dual, g.lowpower]),
            TYPE: exports.bullet,
            LABEL: "Small"
        }
    }, {
        POSITION: [18, 7, 1, 0, -5.5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.dual, g.lowpower]),
            TYPE: exports.bullet,
            LABEL: "Small"
        }
    }, {
        POSITION: [16, 8.5, 1, 0, 5.5, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.dual]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [16, 8.5, 1, 0, -5.5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.dual]),
            TYPE: exports.bullet
        }
    }]
};
exports.sniper = {
    PARENT: [exports.genericTank],
    LABEL: "Sniper",
    BODY: {
        ACCELERATION: .7 * base.ACCEL,
        FOV: 1.2 * base.FOV
    },
    GUNS: [{
        POSITION: [24, 8.5, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper]),
            TYPE: exports.bullet
        }
    }]
};
exports.rifle = {
    PARENT: [exports.genericTank],
    LABEL: "Rifle",
    BODY: {
        ACCELERATION: .7 * base.ACCEL,
        FOV: 1.225 * base.FOV
    },
    GUNS: [{
        POSITION: [20, 10.5, 1, 0, 0, 0, 0]
    }, {
        POSITION: [24, 7, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.rifle]),
            TYPE: exports.bullet
        }
    }]
};
exports.musket = {
    PARENT: [exports.genericTank],
    LABEL: "Musket",
    BODY: {
        ACCELERATION: .7 * base.ACCEL,
        FOV: 1.2 * base.FOV
    },
    GUNS: [{
        POSITION: [15.5, 19.5, 1, 0, 0, 0, 0]
    }, {
        POSITION: [18, 7, 1, 0, 4.15, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.twin, g.rifle]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 7, 1, 0, -4.15, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.twin, g.rifle]),
            TYPE: exports.bullet
        }
    }]
};
exports.assassin = {
    PARENT: [exports.genericTank],
    DANGER: 6,
    LABEL: "Assassin",
    BODY: {
        ACCELERATION: .6 * base.ACCEL,
        SPEED: .85 * base.SPEED,
        FOV: 1.4 * base.FOV
    },
    GUNS: [{
        POSITION: [27, 8.5, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [5, 8.5, -1.6, 8, 0, 0, 0]
    }]
};
exports.ranger = {
    PARENT: [exports.genericTank],
    LABEL: "Ranger",
    DANGER: 7,
    BODY: {
        ACCELERATION: .5 * base.ACCEL,
        SPEED: .8 * base.SPEED,
        FOV: 1.5 * base.FOV
    },
    GUNS: [{
        POSITION: [32, 8.5, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [5, 8.5, -1.6, 8, 0, 0, 0]
    }]
};
exports.stalker = {
    PARENT: [exports.genericTank],
    DANGER: 7,
    LABEL: "Stalker",
    BODY: {
        ACCELERATION: .55 * base.ACCEL,
        SPEED: .85 * base.SPEED,
        FOV: 1.35 * base.FOV
    },
    INVISIBLE: [.08, .03],
    GUNS: [{
        POSITION: [27, 8.5, -2, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass]),
            TYPE: exports.bullet
        }
    }]
}
exports.autoass = makeAuto(exports.assassin), exports.hunter = {
    PARENT: [exports.genericTank],
    LABEL: "Hunter",
    DANGER: 6,
    BODY: {
        ACCELERATION: .7 * base.ACCEL,
        SPEED: .9 * base.SPEED,
        FOV: 1.25 * base.FOV
    },
    GUNS: [{
        POSITION: [24, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter, g.hunter2]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [21, 12, 1, 0, 0, 0, .25],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter]),
            TYPE: exports.bullet
        }
    }]
};
exports.preda = {
    PARENT: [exports.genericTank],
    LABEL: "Predator",
    DANGER: 7,
    BODY: {
        ACCELERATION: .7 * base.ACCEL,
        SPEED: .85 * base.SPEED,
        FOV: 1.3 * base.FOV
    },
    GUNS: [{
        POSITION: [24, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter, g.hunter2, g.hunter2, g.preda]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [21, 12, 1, 0, 0, 0, .15],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter, g.hunter2, g.preda]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 16, 1, 0, 0, 0, .3],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter, g.preda]),
            TYPE: exports.bullet
        }
    }]
};
exports.poach = makeHybrid(exports.hunter, "Poacher"), exports.sidewind = {
    PARENT: [exports.genericTank],
    LABEL: "Sidewinder",
    DANGER: 7,
    BODY: {
        ACCELERATION: .7 * base.ACCEL,
        SPEED: .8 * base.SPEED,
        FOV: 1.3 * base.FOV
    },
    GUNS: [{
        POSITION: [10, 11, -.5, 14, 0, 0, 0]
    }, {
        POSITION: [21, 12, -1.1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.hunter, g.sidewind]),
            TYPE: exports.snake,
            STAT_CALCULATOR: gunCalcNames.sustained
        }
    }]
};
exports.director = {
    PARENT: [exports.genericTank],
    LABEL: "Director",
    STAT_NAMES: statnames.drone,
    DANGER: 5,
    BODY: {
        ACCELERATION: .75 * base.ACCEL,
        FOV: 1.1 * base.FOV
    },
    MAX_CHILDREN: 5,
    GUNS: [{
        POSITION: [6, 12, 1.2, 8, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone
        }
    }]
};
exports.manager = {
    PARENT: [exports.genericTank],
    LABEL: "Manager",
    DANGER: 7,
    STAT_NAMES: statnames.drone,
    BODY: {
        ACCELERATION: .6 * base.ACCEL,
        SPEED: .85 * base.SPEED,
        FOV: 1.1 * base.FOV
    },
    INVISIBLE: [.08, .03],
    MAX_CHILDREN: 8,
    GUNS: [{
        POSITION: [6, 12, 1.2, 8, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over, g.doublereload]),
            TYPE: exports.drone,
            AUTOFIRE: !0,
            SYNCS_SKILLS: !0,
            STAT_CALCULATOR: gunCalcNames.drone
        }
    }]
};
exports.master = {
    PARENT: [exports.genericTank],
    LABEL: "Master",
    STAT_NAMES: statnames.drone,
    DANGER: 7,
    BODY: {
        ACCELERATION: .75 * base.ACCEL,
        FOV: 1.15 * base.FOV
    },
    FACING_TYPE: "autospin",
    TURRETS: [{
        POSITION: [16, 1, 0, 0, 0, 0],
        TYPE: exports.masterGun
    }, {
        POSITION: [16, 1, 0, 120, 0, 0],
        TYPE: [exports.masterGun, {
            INDEPENDENT: true
        }]
    }, {
        POSITION: [16, 1, 0, 240, 0, 0],
        TYPE: [exports.masterGun, {
            INDEPENDENT: true
        }]
    }]
};
exports.overseer = {
    PARENT: [exports.genericTank],
    LABEL: "Overseer",
    DANGER: 6,
    STAT_NAMES: statnames.drone,
    BODY: {
        ACCELERATION: .75 * base.ACCEL,
        SPEED: .9 * base.SPEED,
        FOV: 1.1 * base.FOV
    },
    MAX_CHILDREN: 8,
    GUNS: [{
        POSITION: [6, 12, 1.2, 8, 0, 90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true
        }
    }, {
        POSITION: [6, 12, 1.2, 8, 0, 270, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true
        }
    }]
};
exports.overlord = {
    PARENT: [exports.genericTank],
    LABEL: "Overlord",
    DANGER: 7,
    STAT_NAMES: statnames.drone,
    BODY: {
        ACCELERATION: .75 * base.ACCEL,
        SPEED: .8 * base.SPEED,
        FOV: 1.1 * base.FOV
    },
    MAX_CHILDREN: 8,
    GUNS: [{
        POSITION: [6, 12, 1.2, 8, 0, 90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true
        }
    }, {
        POSITION: [6, 12, 1.2, 8, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true
        }
    }, {
        POSITION: [6, 12, 1.2, 8, 0, 270, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true
        }
    }, {
        POSITION: [6, 12, 1.2, 8, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true
        }
    }]
};
exports.autodrone = makeAuto(exports.drone, "Auto-Drone", {
    type: exports.droneAutoTurret,
    size: 9
});
exports.overdrivesquare = {
    PARENT: [exports.genericEntity],
    LABEL: "Drive Square",
    SHAPE: 4,
    SIZE: 10
};
exports.overdrive = {
    PARENT: [exports.genericTank],
    LABEL: "Overdrive",
    DANGER: 7,
    STAT_NAMES: statnames.drone,
    BODY: {
        ACCELERATION: .75 * base.ACCEL,
        SPEED: .9 * base.SPEED,
        FOV: 1.1 * base.FOV
    },
    MAX_CHILDREN: 8,
    GUNS: [{
        POSITION: [6, 12, 1.2, 8, 0, 90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over]),
            TYPE: exports.autodrone,
            AUTOFIRE: !0,
            SYNCS_SKILLS: !0,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: !0
        }
    }, {
        POSITION: [6, 12, 1.2, 8, 0, 270, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over]),
            TYPE: exports.autodrone,
            AUTOFIRE: !0,
            SYNCS_SKILLS: !0,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: !0
        }
    }],
    TURRETS: [{
        POSITION: [9, 0, 0, 0, 360, 1],
        TYPE: exports.overdrivesquare
    }]
};
exports.overtrap = {
    PARENT: [exports.genericTank],
    LABEL: "Overtrapper",
    DANGER: 7,
    STAT_NAMES: statnames.generic,
    BODY: {
        ACCELERATION: .6 * base.ACCEL,
        SPEED: .8 * base.SPEED,
        FOV: 1.2 * base.FOV
    },
    GUNS: [{
        POSITION: [6, 11, 1.2, 8, 0, 125, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over, g.meta]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true,
            MAX_CHILDREN: 3
        }
    }, {
        POSITION: [6, 11, 1.2, 8, 0, 235, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over, g.meta]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true,
            MAX_CHILDREN: 3
        }
    }, {
        POSITION: [14, 8, 1, 0, 0, 0, 0]
    }, {
        POSITION: [4, 8, 1.5, 14, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }]
};
exports.banshee = {
    PARENT: [exports.genericTank],
    LABEL: "Banshee",
    DANGER: 7,
    BODY: {
        ACCELERATION: .5 * base.ACCEL,
        SPEED: .8 * base.SPEED,
        FOV: 1.1 * base.FOV
    },
    FACING_TYPE: "autospin",
    TURRETS: [{
        POSITION: [10, 8, 0, 0, 80, 0],
        TYPE: exports.bansheegun
    }, {
        POSITION: [10, 8, 0, 120, 80, 0],
        TYPE: exports.bansheegun
    }, {
        POSITION: [10, 8, 0, 240, 80, 0],
        TYPE: exports.bansheegun
    }],
    GUNS: [{
        POSITION: [6, 11, 1.2, 8, 0, 60, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true,
            MAX_CHILDREN: 2
        }
    }, {
        POSITION: [6, 11, 1.2, 8, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true,
            MAX_CHILDREN: 2
        }
    }, {
        POSITION: [6, 11, 1.2, 8, 0, 300, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true,
            MAX_CHILDREN: 2
        }
    }]
};
exports.autoover = makeAuto(exports.overseer), exports.overgunner = {
    PARENT: [exports.genericTank],
    LABEL: "Overgunner",
    DANGER: 7,
    STAT_NAMES: statnames.generic,
    BODY: {
        ACCELERATION: .75 * base.ACCEL,
        SPEED: .9 * base.SPEED,
        FOV: 1.1 * base.FOV
    },
    GUNS: [{
        POSITION: [6, 11, 1.2, 8, 0, 125, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over, g.meta]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true,
            MAX_CHILDREN: 3
        }
    }, {
        POSITION: [6, 11, 1.2, 8, 0, 235, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.over, g.meta]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.drone,
            WAIT_TO_CYCLE: true,
            MAX_CHILDREN: 3
        }
    }, {
        POSITION: [19, 2, 1, 0, -2.5, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.twin, g.slow, g.flank, g.lotsmorrecoil]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 2, 1, 0, 2.5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.twin, g.slow, g.flank, g.lotsmorrecoil]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [12, 11, 1, 0, 0, 0, 0]
    }]
};
exports.cruiserGun = makeSwarmSpawner(combineStats([g.swarm])), exports.cruiser = {
    PARENT: [exports.genericTank],
    LABEL: "Cruiser",
    DANGER: 6,
    FACING_TYPE: "locksFacing",
    STAT_NAMES: statnames.swarm,
    BODY: {
        ACCELERATION: .85 * base.ACCEL,
        FOV: 1.2 * base.FOV
    },
    GUNS: [{
        POSITION: [7, 7.5, .6, 7, 4, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm]),
            TYPE: exports.swarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [7, 7.5, .6, 7, -4, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm]),
            TYPE: exports.swarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }]
};
exports.battleship = {
    PARENT: [exports.genericTank],
    LABEL: "Battleship",
    DANGER: 7,
    STAT_NAMES: statnames.swarm,
    FACING_TYPE: "locksFacing",
    BODY: {
        ACCELERATION: base.ACCEL,
        FOV: 1.2 * base.FOV
    },
    GUNS: [{
        POSITION: [7, 7.5, .6, 7, 4, 90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
            TYPE: exports.swarm,
            STAT_CALCULATOR: gunCalcNames.swarm,
            LABEL: "Guided"
        }
    }, {
        POSITION: [7, 7.5, .6, 7, -4, 90, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm]),
            TYPE: [exports.autoswarm],
            STAT_CALCULATOR: gunCalcNames.swarm,
            LABEL: "Autonomous"
        }
    }, {
        POSITION: [7, 7.5, .6, 7, 4, 270, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm]),
            TYPE: [exports.autoswarm],
            STAT_CALCULATOR: gunCalcNames.swarm,
            LABEL: "Autonomous"
        }
    }, {
        POSITION: [7, 7.5, .6, 7, -4, 270, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
            TYPE: exports.swarm,
            STAT_CALCULATOR: gunCalcNames.swarm,
            LABEL: "Guided"
        }
    }]
};
exports.carrier = {
    PARENT: [exports.genericTank],
    LABEL: "Carrier",
    DANGER: 7,
    STAT_NAMES: statnames.swarm,
    FACING_TYPE: "locksFacing",
    BODY: {
        ACCELERATION: .75 * base.ACCEL,
        FOV: 1.3 * base.FOV
    },
    GUNS: [{
        POSITION: [7, 7.5, .6, 7, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle, g.carrier]),
            TYPE: exports.swarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [7, 7.5, .6, 7, 2, 40, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle, g.carrier]),
            TYPE: exports.swarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [7, 7.5, .6, 7, -2, -40, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle, g.carrier]),
            TYPE: exports.swarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }]
};
exports.autocruiser = makeAuto(exports.cruiser), exports.fortress = {
    PARENT: [exports.genericTank],
    LABEL: "Fortress",
    DANGER: 7,
    STAT_NAMES: statnames.generic,
    BODY: {
        SPEED: .8 * base.SPEED,
        FOV: 1.2 * base.FOV
    },
    GUNS: [{
        POSITION: [7, 7.5, .6, 7, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm]),
            TYPE: [exports.swarm, {
                CONTROLLERS: ["canRepel"]
            }],
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [7, 7.5, .6, 7, 0, 120, 1 / 3],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm]),
            TYPE: [exports.swarm, {
                CONTROLLERS: ["canRepel"]
            }],
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [7, 7.5, .6, 7, 0, 240, 2 / 3],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm]),
            TYPE: [exports.swarm, {
                CONTROLLERS: ["canRepel"]
            }],
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [14, 9, 1, 0, 0, 60, 0]
    }, {
        POSITION: [4, 9, 1.5, 14, 0, 60, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.halfrange, g.slow]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }, {
        POSITION: [14, 9, 1, 0, 0, 180, 0]
    }, {
        POSITION: [4, 9, 1.5, 14, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.halfrange, g.slow]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }, {
        POSITION: [14, 9, 1, 0, 0, 300, 0]
    }, {
        POSITION: [4, 9, 1.5, 14, 0, 300, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.halfrange, g.slow]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }]
};
exports.underseer = {
    PARENT: [exports.genericTank],
    LABEL: "Underseer",
    DANGER: 6,
    STAT_NAMES: statnames.drone,
    BODY: {
        ACCELERATION: .7 * base.ACCEL,
        SPEED: .9 * base.SPEED,
        FOV: 1.1 * base.FOV
    },
    SHAPE: 4,
    MAX_CHILDREN: 14,
    GUNS: [{
        POSITION: [5, 12, 1.2, 8, 0, 90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.sunchip]),
            TYPE: exports.sunchip,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.necro
        }
    }, {
        POSITION: [5, 12, 1.2, 8, 0, 270, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.sunchip]),
            TYPE: exports.sunchip,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.necro
        }
    }]
};
exports.necromancer = {
    PARENT: [exports.genericTank],
    LABEL: "Necromancer",
    DANGER: 7,
    STAT_NAMES: statnames.necro,
    BODY: {
        ACCELERATION: .7 * base.ACCEL,
        SPEED: .8 * base.SPEED,
        FOV: 1.15 * base.FOV
    },
    SHAPE: 4,
    FACING_TYPE: "autospin",
    MAX_CHILDREN: 14,
    GUNS: [{
        POSITION: [5, 12, 1.2, 8, 0, 90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.sunchip]),
            TYPE: exports.sunchip,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.necro
        }
    }, {
        POSITION: [5, 12, 1.2, 8, 0, 270, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.sunchip]),
            TYPE: exports.sunchip,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.necro
        }
    }, {
        POSITION: [5, 12, 1.2, 8, 0, 0, .25],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.sunchip, g.weak, g.doublereload]),
            TYPE: exports.autosunchip,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            MAX_CHILDREN: 4,
            STAT_CALCULATOR: gunCalcNames.necro,
            LABEL: "Guard"
        }
    }, {
        POSITION: [5, 12, 1.2, 8, 0, 180, .75],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.sunchip, g.weak, g.doublereload]),
            TYPE: exports.autosunchip,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            MAX_CHILDREN: 4,
            STAT_CALCULATOR: gunCalcNames.necro,
            LABEL: "Guard"
        }
    }]
};
exports.maleficitor = {
    PARENT: [exports.genericTank],
    LABEL: "Maleficitor",
    DANGER: 7,
    STAT_NAMES: statnames.necro,
    BODY: {
        ACCELERATION: .75 * base.ACCEL,
        SPEED: .85 * base.SPEED,
        FOV: 1.1 * base.FOV
    },
    SHAPE: 4,
    MAX_CHILDREN: 20,
    GUNS: [{
        POSITION: [5, 12, 1.2, 8, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.sunchip, g.male]),
            TYPE: [exports.sunchip, {
                INVISIBLE: [.06, .03]
            }],
            AUTOFIRE: !0,
            SYNCS_SKILLS: !0,
            STAT_CALCULATOR: gunCalcNames.necro
        }
    }]
};
exports.lilfact = {
    PARENT: [exports.genericTank],
    LABEL: "Spawner",
    DANGER: 6,
    STAT_NAMES: statnames.drone,
    BODY: {
        SPEED: .8 * base.SPEED,
        ACCELERATION: .5 * base.ACCEL,
        FOV: 1.1
    },
    GUNS: [{
        POSITION: [4.5, 10, 1, 10.5, 0, 0, 0]
    }, {
        POSITION: [1, 12, 1, 15, 0, 0, 0],
        PROPERTIES: {
            MAX_CHILDREN: 4,
            SHOOT_SETTINGS: combineStats([g.factory, g.babyfactory]),
            TYPE: exports.minion,
            STAT_CALCULATOR: gunCalcNames.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true
        }
    }, {
        POSITION: [3.5, 12, 1, 8, 0, 0, 0]
    }]
};
exports.factory = {
    PARENT: [exports.genericTank],
    LABEL: "Factory",
    DANGER: 7,
    STAT_NAMES: statnames.drone,
    BODY: {
        SPEED: .8 * base.SPEED,
        FOV: 1.1
    },
    MAX_CHILDREN: 6,
    GUNS: [{
        POSITION: [5, 11, 1, 10.5, 0, 0, 0]
    }, {
        POSITION: [2, 14, 1, 15.5, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.factory]),
            TYPE: exports.minion,
            STAT_CALCULATOR: gunCalcNames.drone,
            AUTOFIRE: true,
            SYNCS_SKILLS: true
        }
    }, {
        POSITION: [4, 14, 1, 8, 0, 0, 0]
    }]
};
exports.autospawner = makeAuto(exports.lilfact);
exports.machine = {
    PARENT: [exports.genericTank],
    LABEL: "Machine Gun",
    GUNS: [{
        POSITION: [12, 10, 1.4, 8, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mach]),
            TYPE: exports.bullet
        }
    }]
};
exports.spray = {
    PARENT: [exports.genericTank],
    LABEL: "Sprayer",
    GUNS: [{
        POSITION: [23, 7, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.lowpower, g.mach, g.morerecoil]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [12, 10, 1.4, 8, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mach]),
            TYPE: exports.bullet
        }
    }]
};
exports.mini = {
    PARENT: [exports.genericTank],
    LABEL: "Minigun",
    DANGER: 6,
    BODY: {
        FOV: 1.2
    },
    GUNS: [{
        POSITION: [22, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mini]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [20, 8, 1, 0, 0, 0, .333],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mini]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 0, .667],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mini]),
            TYPE: exports.bullet
        }
    }]
};
exports.stream = {
    PARENT: [exports.genericTank],
    LABEL: "Streamliner",
    DANGER: 7,
    BODY: {
        FOV: 1.3
    },
    GUNS: [{
        POSITION: [25, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [23, 8, 1, 0, 0, 0, .2],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [21, 8, 1, 0, 0, 0, .4],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 8, 1, 0, 0, 0, .6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [17, 8, 1, 0, 0, 0, .8],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mini, g.stream]),
            TYPE: exports.bullet
        }
    }]
};
exports.hybridmini = makeHybrid(exports.mini, "Cropduster"), exports.minitrap = {
    PARENT: [exports.genericTank],
    DANGER: 6,
    LABEL: "Barricade",
    STAT_NAMES: statnames.trap,
    BODY: {
        FOV: 1.15
    },
    GUNS: [{
        POSITION: [24, 8, 1, 0, 0, 0, 0]
    }, {
        POSITION: [4, 8, 1.3, 22, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.mini, g.halfrange]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }, {
        POSITION: [4, 8, 1.3, 18, 0, 0, .333],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.mini, g.halfrange]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }, {
        POSITION: [4, 8, 1.3, 14, 0, 0, .667],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.mini, g.halfrange]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }]
};
exports.pound = {
    PARENT: [exports.genericTank],
    DANGER: 5,
    BODY: {
        ACCELERATION: .8 * base.ACCEL
    },
    LABEL: "Pounder",
    GUNS: [{
        POSITION: [20, 12, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound]),
            TYPE: exports.bullet
        }
    }]
};
exports.destroy = {
    PARENT: [exports.genericTank],
    DANGER: 6,
    BODY: {
        ACCELERATION: .75 * base.ACCEL
    },
    LABEL: "Destroyer",
    GUNS: [{
        POSITION: [21, 14, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.destroy]),
            TYPE: exports.bullet
        }
    }]
};
exports.anni = {
    PARENT: [exports.genericTank],
    BODY: {
        ACCELERATION: .75 * base.ACCEL
    },
    LABEL: "Annihilator",
    DANGER: 7,
    GUNS: [{
        POSITION: [20.5, 19.5, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.destroy, g.anni]),
            TYPE: exports.bullet
        }
    }]
};
exports.hiveshooter = {
    PARENT: [exports.genericTank],
    DANGER: 6,
    LABEL: "Swarmer",
    GUNS: [{
        POSITION: [14, 14, -1.2, 5, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.destroy, g.hive]),
            TYPE: exports.hive
        }
    }, {
        POSITION: [15, 12, 1, 5, 0, 0, 0]
    }]
};
exports.hybrid = makeHybrid(exports.destroy, "Hybrid"), exports.shotgun2 = {
    PARENT: [exports.genericTank],
    DANGER: 7,
    LABEL: "Shotgun",
    BODY: {
        ACCELERATION: .7 * base.ACCEL
    },
    GUNS: [{
        POSITION: [4, 3, 1, 11, -3, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [4, 3, 1, 11, 3, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [4, 4, 1, 13, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
            TYPE: exports.casing
        }
    }, {
        POSITION: [1, 4, 1, 12, -1, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
            TYPE: exports.casing
        }
    }, {
        POSITION: [1, 4, 1, 11, 1, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
            TYPE: exports.casing
        }
    }, {
        POSITION: [1, 3, 1, 13, -1, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [1, 3, 1, 13, 1, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [1, 2, 1, 13, 2, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
            TYPE: exports.casing
        }
    }, {
        POSITION: [1, 2, 1, 13, -2, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun]),
            TYPE: exports.casing
        }
    }, {
        POSITION: [15, 14, 1, 6, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.mach, g.shotgun, g.fake]),
            TYPE: exports.casing
        }
    }, {
        POSITION: [8, 14, -1.3, 4, 0, 0, 0]
    }]
};
exports.trapper = {
    PARENT: [exports.genericTank],
    LABEL: "Trapper",
    STAT_NAMES: statnames.trap,
    GUNS: [{
        POSITION: [15, 7, 1, 0, 0, 0, 0]
    }, {
        POSITION: [3, 7, 1.7, 15, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }]
};
exports.tritrapper = {
    PARENT: [exports.genericTank],
    LABEL: "Tri-Trapper",
    DANGER: 6,
    STAT_NAMES: statnames.trap,
    GUNS: [{
        POSITION: [15, 7, 1, 0, 0, 0, 0]
    }, {
        POSITION: [3, 7, 1.7, 15, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.flank]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }, {
        POSITION: [15, 7, 1, 0, 0, 120, 0]
    }, {
        POSITION: [3, 7, 1.7, 15, 0, 120, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.flank]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }, {
        POSITION: [15, 7, 1, 0, 0, 240, 0]
    }, {
        POSITION: [3, 7, 1.7, 15, 0, 240, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.flank]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }]
}
exports.builder = {
    PARENT: [exports.genericTank],
    DANGER: 6,
    LABEL: "Trapper",
    STAT_NAMES: statnames.trap,
    BODY: {
        SPEED: .8 * base.SPEED,
        FOV: 1.15 * base.FOV
    },
    GUNS: [{
        POSITION: [18, 12, 1, 0, 0, 0, 0]
    }, {
        POSITION: [2, 12, 1.1, 18, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.block]),
            TYPE: exports.block
        }
    }]
};
exports.engineer = {
    PARENT: [exports.genericTank],
    DANGER: 7,
    LABEL: "Engineer",
    STAT_NAMES: statnames.trap,
    BODY: {
        SPEED: .75 * base.SPEED,
        FOV: 1.15 * base.FOV
    },
    GUNS: [{
        POSITION: [5, 11, 1, 10.5, 0, 0, 0]
    }, {
        POSITION: [3, 14, 1, 15.5, 0, 0, 0]
    }, {
        POSITION: [2, 14, 1.3, 18, 0, 0, 0],
        PROPERTIES: {
            MAX_CHILDREN: 6,
            SHOOT_SETTINGS: combineStats([g.trap, g.block]),
            TYPE: exports.pillbox,
            SYNCS_SKILLS: true,
            DESTROY_OLDEST_CHILD: true
        }
    }, {
        POSITION: [4, 14, 1, 8, 0, 0, 0]
    }]
};
exports.construct = {
    PARENT: [exports.genericTank],
    LABEL: "Mega Trapper",
    STAT_NAMES: statnames.trap,
    DANGER: 7,
    BODY: {
        ACCELERATION: .5 * base.ACCEL,
        SPEED: .7 * base.SPEED,
        FOV: 1.15 * base.FOV
    },
    GUNS: [{
        POSITION: [18, 18, 1, 0, 0, 0, 0]
    }, {
        POSITION: [2, 18, 1.2, 18, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.block, g.construct]),
            TYPE: exports.block
        }
    }]
};
exports.autobuilder = makeAuto(exports.builder), exports.conq = {
    PARENT: [exports.genericTank],
    DANGER: 7,
    LABEL: "Conqueror",
    STAT_NAMES: statnames.trap,
    BODY: {
        SPEED: .8 * base.SPEED
    },
    GUNS: [{
        POSITION: [21, 14, 1, 0, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 14, 1, 0, 0, 0, 0]
    }, {
        POSITION: [2, 14, 1.1, 18, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.block]),
            TYPE: exports.block
        }
    }]
};
exports.bentboomer = {
    PARENT: [exports.genericTank],
    DANGER: 7,
    LABEL: "Boomer",
    STAT_NAMES: statnames.trap,
    BODY: {
        SPEED: .8 * base.SPEED,
        FOV: 1.15 * base.FOV
    },
    GUNS: [{
        POSITION: [8, 10, 1, 8, -2, -35, 0]
    }, {
        POSITION: [8, 10, 1, 8, 2, 35, 0]
    }, {
        POSITION: [2, 10, 1.3, 16, -2, -35, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.block, g.fast, g.twin]),
            TYPE: exports.boomerang
        }
    }, {
        POSITION: [2, 10, 1.3, 16, 2, 35, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.block, g.fast, g.twin]),
            TYPE: exports.boomerang
        }
    }]
};
exports.boomer = {
    PARENT: [exports.genericTank],
    DANGER: 7,
    LABEL: "Boomer",
    STAT_NAMES: statnames.trap,
    FACING_TYPE: "locksFacing",
    BODY: {
        SPEED: .8 * base.SPEED,
        FOV: 1.15 * base.FOV
    },
    GUNS: [{
        POSITION: [5, 10, 1, 14, 0, 0, 0]
    }, {
        POSITION: [6, 10, -1.5, 7, 0, 0, 0]
    }, {
        POSITION: [2, 10, 1.3, 18, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.block, g.boomerang]),
            TYPE: exports.boomerang
        }
    }]
};
exports.quadtrapper = {
    PARENT: [exports.genericTank],
    DANGER: 7,
    LABEL: "Quad Builder",
    STAT_NAMES: statnames.trap,
    BODY: {
        SPEED: .8 * base.SPEED,
        FOV: 1.15 * base.FOV
    },
    GUNS: [{
        POSITION: [14, 6, 1, 0, 0, 45, 0]
    }, {
        POSITION: [2, 6, 1.1, 14, 0, 45, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.block, g.weak]),
            TYPE: exports.block
        }
    }, {
        POSITION: [14, 6, 1, 0, 0, 135, 0]
    }, {
        POSITION: [2, 6, 1.1, 14, 0, 135, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.block, g.weak]),
            TYPE: exports.block
        }
    }, {
        POSITION: [14, 6, 1, 0, 0, 225, 0]
    }, {
        POSITION: [2, 6, 1.1, 14, 0, 225, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.block, g.weak]),
            TYPE: exports.block
        }
    }, {
        POSITION: [14, 6, 1, 0, 0, 315, 0]
    }, {
        POSITION: [2, 6, 1.1, 14, 0, 315, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.block, g.weak]),
            TYPE: exports.block
        }
    }]
};
exports.artillery = {
    PARENT: [exports.genericTank],
    DANGER: 6,
    LABEL: "Artillery",
    GUNS: [{
        POSITION: [17, 3, 1, 0, -6, -7, .25],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty]),
            TYPE: exports.bullet,
            LABEL: "Secondary"
        }
    }, {
        POSITION: [17, 3, 1, 0, 6, 7, .75],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty]),
            TYPE: exports.bullet,
            LABEL: "Secondary"
        }
    }, {
        POSITION: [19, 12, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.arty]),
            TYPE: exports.bullet,
            LABEL: "Heavy"
        }
    }]
};
exports.mortar = {
    PARENT: [exports.genericTank],
    LABEL: "Mortar",
    DANGER: 7,
    GUNS: [{
        POSITION: [13, 3, 1, 0, -8, -7, .6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin]),
            TYPE: exports.bullet,
            LABEL: "Secondary"
        }
    }, {
        POSITION: [13, 3, 1, 0, 8, 7, .8],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin]),
            TYPE: exports.bullet,
            LABEL: "Secondary"
        }
    }, {
        POSITION: [17, 3, 1, 0, -6, -7, .2],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin]),
            TYPE: exports.bullet,
            LABEL: "Secondary"
        }
    }, {
        POSITION: [17, 3, 1, 0, 6, 7, .4],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin]),
            TYPE: exports.bullet,
            LABEL: "Secondary"
        }
    }, {
        POSITION: [19, 12, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.arty]),
            TYPE: exports.bullet,
            LABEL: "Heavy"
        }
    }]
};
exports.skimmer = {
    PARENT: [exports.genericTank],
    BODY: {
        FOV: 1.15 * base.FOV
    },
    LABEL: "Skimmer",
    DANGER: 7,
    GUNS: [{
        POSITION: [10, 14, -.5, 9, 0, 0, 0]
    }, {
        POSITION: [17, 15, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.arty, g.arty, g.skim]),
            TYPE: exports.missile,
            STAT_CALCULATOR: gunCalcNames.sustained
        }
    }]
};
exports.spinner = {
    PARENT: [exports.genericTank],
    BODY: {
        FOV: 1.1 * base.FOV
    },
    LABEL: "Twister",
    DANGER: 7,
    GUNS: [{
        POSITION: [10, 13, -.5, 9, 0, 0, 0]
    }, {
        POSITION: [17, 14, -1.4, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.arty, g.arty, g.skim, g.morespeed, g.threequartersrof]),
            TYPE: exports.spinmissile,
            STAT_CALCULATOR: gunCalcNames.sustained
        }
    }]
};
exports.spread = {
    PARENT: [exports.genericTank],
    LABEL: "Spreadshot",
    DANGER: 7,
    GUNS: [{
        POSITION: [13, 4, 1, 0, -.8, -75, 5 / 6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin, g.spread]),
            TYPE: exports.bullet,
            LABEL: "Spread"
        }
    }, {
        POSITION: [14.5, 4, 1, 0, -1, -60, 4 / 6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin, g.spread]),
            TYPE: exports.bullet,
            LABEL: "Spread"
        }
    }, {
        POSITION: [16, 4, 1, 0, -1.6, -45, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin, g.spread]),
            TYPE: exports.bullet,
            LABEL: "Spread"
        }
    }, {
        POSITION: [17.5, 4, 1, 0, -2.4, -30, 2 / 6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin, g.spread]),
            TYPE: exports.bullet,
            LABEL: "Spread"
        }
    }, {
        POSITION: [19, 4, 1, 0, -3, -15, 1 / 6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin, g.spread]),
            TYPE: exports.bullet,
            LABEL: "Spread"
        }
    }, {
        POSITION: [13, 4, 1, 0, .8, 75, 5 / 6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin, g.spread]),
            TYPE: exports.bullet,
            LABEL: "Spread"
        }
    }, {
        POSITION: [14.5, 4, 1, 0, 1, 60, 4 / 6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin, g.spread]),
            TYPE: exports.bullet,
            LABEL: "Spread"
        }
    }, {
        POSITION: [16, 4, 1, 0, 1.6, 45, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin, g.spread]),
            TYPE: exports.bullet,
            LABEL: "Spread"
        }
    }, {
        POSITION: [17.5, 4, 1, 0, 2.4, 30, 2 / 6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin, g.spread]),
            TYPE: exports.bullet,
            LABEL: "Spread"
        }
    }, {
        POSITION: [19, 4, 1, 0, 3, 15, 1 / 6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.arty, g.twin, g.spread]),
            TYPE: exports.bullet,
            LABEL: "Spread"
        }
    }, {
        POSITION: [13, 10, 1.3, 8, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.spreadmain, g.spread]),
            TYPE: exports.bullet,
            LABEL: "Pounder"
        }
    }]
};
exports.eagle = {
    PARENT: [exports.genericTank],
    LABEL: "Eagle",
    DANGER: 7,
    BODY: {
        ACCELERATION: base.ACCEL
    },
    GUNS: [{
        POSITION: [20, 12, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound]),
            TYPE: exports.bullet,
            LABEL: "Pounder",
            ALT_FIRE: !0
        }
    }, {
        POSITION: [16, 8, 1, 0, 0, 150, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster, g.halfrecoil]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }, {
        POSITION: [16, 8, 1, 0, 0, 210, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster, g.halfrecoil]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 180, .6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster, g.halfrecoil]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }]
};
exports.flank = {
    PARENT: [exports.genericTank],
    LABEL: "Flank Guard",
    BODY: {
        SPEED: 1.1 * base.SPEED
    },
    GUNS: [{
        POSITION: [18, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 120, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 240, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank]),
            TYPE: exports.bullet
        }
    }]
};
exports.hexa = {
    PARENT: [exports.genericTank],
    LABEL: "Hexa Tank",
    DANGER: 6,
    GUNS: [{
        POSITION: [18, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 120, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 240, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 60, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 180, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 300, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
            TYPE: exports.bullet
        }
    }]
};
exports.octo = {
    PARENT: [exports.genericTank],
    LABEL: "Octo Tank",
    DANGER: 7,
    GUNS: [{
        POSITION: [18, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 270, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 45, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 135, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 225, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 315, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.spam]),
            TYPE: exports.bullet
        }
    }]
};
exports.hurricane = {
    PARENT: [exports.genericTank],
    LABEL: "Cyclone",
    DANGER: 7,
    GUNS: [{
        POSITION: [15, 3.5, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.hurricane]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [15, 3.5, 1, 0, 0, 30, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.hurricane]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [15, 3.5, 1, 0, 0, 60, .25],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.hurricane]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [15, 3.5, 1, 0, 0, 90, .75],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.hurricane]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [15, 3.5, 1, 0, 0, 120, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.hurricane]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [15, 3.5, 1, 0, 0, 150, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.hurricane]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [15, 3.5, 1, 0, 0, 180, .25],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.hurricane]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [15, 3.5, 1, 0, 0, 210, .75],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.hurricane]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [15, 3.5, 1, 0, 0, 240, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.hurricane]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [15, 3.5, 1, 0, 0, 270, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.hurricane]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [15, 3.5, 1, 0, 0, 300, .25],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.hurricane]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [15, 3.5, 1, 0, 0, 330, .75],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.twin, g.puregunner, g.hurricane]),
            TYPE: exports.bullet
        }
    }]
};
exports.heptatrap = (() => {
    let T = 360 / 7,
        e = 1 / 7;
    return {
        PARENT: [exports.genericTank],
        LABEL: "Hepta-Trapper",
        DANGER: 7,
        BODY: {
            SPEED: .8 * base.SPEED
        },
        STAT_NAMES: statnames.trap,
        HAS_NO_RECOIL: true,
        GUNS: [{
            POSITION: [15, 7, 1, 0, 0, 0, 0]
        }, {
            POSITION: [3, 7, 1.7, 15, 0, 0, 0],
            PROPERTIES: {
                SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
                TYPE: exports.trap,
                STAT_CALCULATOR: gunCalcNames.trap
            }
        }, {
            POSITION: [15, 7, 1, 0, 0, T, 4 * e]
        }, {
            POSITION: [3, 7, 1.7, 15, 0, T, 4 * e],
            PROPERTIES: {
                SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
                TYPE: exports.trap,
                STAT_CALCULATOR: gunCalcNames.trap
            }
        }, {
            POSITION: [15, 7, 1, 0, 0, 2 * T, 1 * e]
        }, {
            POSITION: [3, 7, 1.7, 15, 0, 2 * T, 1 * e],
            PROPERTIES: {
                SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
                TYPE: exports.trap,
                STAT_CALCULATOR: gunCalcNames.trap
            }
        }, {
            POSITION: [15, 7, 1, 0, 0, 3 * T, 5 * e]
        }, {
            POSITION: [3, 7, 1.7, 15, 0, 3 * T, 5 * e],
            PROPERTIES: {
                SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
                TYPE: exports.trap,
                STAT_CALCULATOR: gunCalcNames.trap
            }
        }, {
            POSITION: [15, 7, 1, 0, 0, 4 * T, 2 * e]
        }, {
            POSITION: [3, 7, 1.7, 15, 0, 4 * T, 2 * e],
            PROPERTIES: {
                SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
                TYPE: exports.trap,
                STAT_CALCULATOR: gunCalcNames.trap
            }
        }, {
            POSITION: [15, 7, 1, 0, 0, 5 * T, 6 * e]
        }, {
            POSITION: [3, 7, 1.7, 15, 0, 5 * T, 6 * e],
            PROPERTIES: {
                SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
                TYPE: exports.trap,
                STAT_CALCULATOR: gunCalcNames.trap
            }
        }, {
            POSITION: [15, 7, 1, 0, 0, 6 * T, 3 * e]
        }, {
            POSITION: [3, 7, 1.7, 15, 0, 6 * T, 3 * e],
            PROPERTIES: {
                SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
                TYPE: exports.trap,
                STAT_CALCULATOR: gunCalcNames.trap
            }
        }]
    }
})(), exports.hexatrap = makeAuto({
    PARENT: [exports.genericTank],
    LABEL: "Hexa-Trapper",
    DANGER: 7,
    BODY: {
        SPEED: .8 * base.SPEED
    },
    STAT_NAMES: statnames.trap,
    HAS_NO_RECOIL: true,
    GUNS: [{
        POSITION: [15, 7, 1, 0, 0, 0, 0]
    }, {
        POSITION: [3, 7, 1.7, 15, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }, {
        POSITION: [15, 7, 1, 0, 0, 60, .5]
    }, {
        POSITION: [3, 7, 1.7, 15, 0, 60, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }, {
        POSITION: [15, 7, 1, 0, 0, 120, 0]
    }, {
        POSITION: [3, 7, 1.7, 15, 0, 120, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }, {
        POSITION: [15, 7, 1, 0, 0, 180, .5]
    }, {
        POSITION: [3, 7, 1.7, 15, 0, 180, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }, {
        POSITION: [15, 7, 1, 0, 0, 240, 0]
    }, {
        POSITION: [3, 7, 1.7, 15, 0, 240, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }, {
        POSITION: [15, 7, 1, 0, 0, 300, .5]
    }, {
        POSITION: [3, 7, 1.7, 15, 0, 300, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }]
}, "Hexa-Trapper"), exports.tri = {
    PARENT: [exports.genericTank],
    LABEL: "Tri-Angle",
    BODY: {
        HEALTH: .8 * base.HEALTH,
        SHIELD: .8 * base.SHIELD,
        DENSITY: .6 * base.DENSITY
    },
    DANGER: 6,
    GUNS: [{
        POSITION: [18, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.trifront, g.tonsmorrecoil]),
            TYPE: exports.bullet,
            LABEL: "Front"
        }
    }, {
        POSITION: [16, 8, 1, 0, 0, 150, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }, {
        POSITION: [16, 8, 1, 0, 0, 210, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }]
};
exports.booster = {
    PARENT: [exports.genericTank],
    LABEL: "Booster",
    BODY: {
        HEALTH: .6 * base.HEALTH,
        SHIELD: .6 * base.SHIELD,
        DENSITY: .2 * base.DENSITY
    },
    DANGER: 7,
    GUNS: [{
        POSITION: [18, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.trifront, g.muchmorerecoil]),
            TYPE: exports.bullet,
            LABEL: "Front"
        }
    }, {
        POSITION: [13, 8, 1, 0, -1, 135, .6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster, g.halfrecoil]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }, {
        POSITION: [13, 8, 1, 0, 1, 225, .6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster, g.halfrecoil]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }, {
        POSITION: [16, 8, 1, 0, 0, 145, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }, {
        POSITION: [16, 8, 1, 0, 0, 215, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }]
};
exports.fighter = {
    PARENT: [exports.genericTank],
    LABEL: "Fighter",
    BODY: {
        DENSITY: .6 * base.DENSITY
    },
    DANGER: 7,
    GUNS: [{
        POSITION: [18, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.trifront]),
            TYPE: exports.bullet,
            LABEL: "Front"
        }
    }, {
        POSITION: [16, 8, 1, 0, -1, 90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.trifront]),
            TYPE: exports.bullet,
            LABEL: "Side"
        }
    }, {
        POSITION: [16, 8, 1, 0, 1, -90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.trifront]),
            TYPE: exports.bullet,
            LABEL: "Side"
        }
    }, {
        POSITION: [16, 8, 1, 0, 0, 150, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }, {
        POSITION: [16, 8, 1, 0, 0, 210, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }]
};
exports.brutalizer = {
    PARENT: [exports.genericTank],
    LABEL: "Surfer",
    BODY: {
        DENSITY: .6 * base.DENSITY
    },
    DANGER: 7,
    GUNS: [{
        POSITION: [18, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.trifront]),
            TYPE: exports.bullet,
            LABEL: "Front"
        }
    }, {
        POSITION: [7, 7.5, .6, 7, -1, 90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm]),
            TYPE: [exports.autoswarm],
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [7, 7.5, .6, 7, 1, -90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm]),
            TYPE: [exports.autoswarm],
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [16, 8, 1, 0, 0, 150, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }, {
        POSITION: [16, 8, 1, 0, 0, 210, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }]
};
exports.bomber = {
    PARENT: [exports.genericTank],
    LABEL: "Bomber",
    BODY: {
        DENSITY: .6 * base.DENSITY
    },
    DANGER: 7,
    GUNS: [{
        POSITION: [20, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.trifront]),
            TYPE: exports.bullet,
            LABEL: "Front"
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 130, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri]),
            TYPE: exports.bullet,
            LABEL: "Wing"
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 230, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri]),
            TYPE: exports.bullet,
            LABEL: "Wing"
        }
    }, {
        POSITION: [14, 8, 1, 0, 0, 180, 0]
    }, {
        POSITION: [4, 8, 1.5, 14, 0, 180, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.morerecoil]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }]
};
exports.autotri = makeAuto(exports.tri), exports.autotri.BODY = {
    SPEED: base.SPEED
};
exports.falcon = {
    PARENT: [exports.genericTank],
    LABEL: "Falcon",
    DANGER: 7,
    BODY: {
        ACCELERATION: .8 * base.ACCEL,
        FOV: 1.2 * base.FOV
    },
    GUNS: [{
        POSITION: [27, 8.5, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.assass, g.lessreload]),
            TYPE: exports.bullet,
            LABEL: "Assassin",
            ALT_FIRE: true
        }
    }, {
        POSITION: [5, 8.5, -1.6, 8, 0, 0, 0]
    }, {
        POSITION: [16, 8, 1, 0, 0, 150, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster, g.halfrecoil]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }, {
        POSITION: [16, 8, 1, 0, 0, 210, .1],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster, g.halfrecoil]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }, {
        POSITION: [18, 8, 1, 0, 0, 180, .6],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.tri, g.thruster, g.halfrecoil]),
            TYPE: exports.bullet,
            LABEL: gunCalcNames.thruster
        }
    }]
};
exports.auto3 = {
    PARENT: [exports.genericTank],
    LABEL: "Auto-3",
    DANGER: 6,
    FACING_TYPE: "autospin",
    TURRETS: [{
        POSITION: [11, 8, 0, 0, 190, 0],
        TYPE: exports.auto3gun
    }, {
        POSITION: [11, 8, 0, 120, 190, 0],
        TYPE: exports.auto3gun
    }, {
        POSITION: [11, 8, 0, 240, 190, 0],
        TYPE: exports.auto3gun
    }]
};
exports.auto5 = {
    PARENT: [exports.genericTank],
    LABEL: "Auto-5",
    DANGER: 7,
    FACING_TYPE: "autospin",
    TURRETS: [{
        POSITION: [11, 8, 0, 0, 190, 0],
        TYPE: exports.auto5gun
    }, {
        POSITION: [11, 8, 0, 72, 190, 0],
        TYPE: exports.auto5gun
    }, {
        POSITION: [11, 8, 0, 144, 190, 0],
        TYPE: exports.auto5gun
    }, {
        POSITION: [11, 8, 0, 216, 190, 0],
        TYPE: exports.auto5gun
    }, {
        POSITION: [11, 8, 0, 288, 190, 0],
        TYPE: exports.auto5gun
    }]
};
exports.heavy3 = {
    BODY: {
        SPEED: .95 * base.SPEED
    },
    PARENT: [exports.genericTank],
    LABEL: "Mega-3",
    DANGER: 7,
    FACING_TYPE: "autospin",
    TURRETS: [{
        POSITION: [14, 8, 0, 0, 190, 0],
        TYPE: exports.heavy3gun
    }, {
        POSITION: [14, 8, 0, 120, 190, 0],
        TYPE: exports.heavy3gun
    }, {
        POSITION: [14, 8, 0, 240, 190, 0],
        TYPE: exports.heavy3gun
    }]
};
exports.tritrap = {
    LABEL: "Architect",
    BODY: {
        SPEED: 1.1 * base.SPEED
    },
    PARENT: [exports.genericTank],
    DANGER: 6,
    FACING_TYPE: "autospin",
    TURRETS: [{
        POSITION: [12, 8, 0, 0, 190, 0],
        TYPE: exports.tritrapgun
    }, {
        POSITION: [12, 8, 0, 120, 190, 0],
        TYPE: exports.tritrapgun
    }, {
        POSITION: [12, 8, 0, 240, 190, 0],
        TYPE: exports.tritrapgun
    }]
};
exports.sniper3 = {
    PARENT: [exports.genericTank],
    DANGER: 7,
    LABEL: "Sniper-3",
    BODY: {
        ACCELERATION: .6 * base.ACCEL,
        SPEED: .8 * base.SPEED,
        FOV: 1.25 * base.FOV
    },
    FACING_TYPE: "autospin",
    TURRETS: [{
        POSITION: [13, 8, 0, 0, 170, 0],
        TYPE: exports.sniper3gun
    }, {
        POSITION: [13, 8, 0, 120, 170, 0],
        TYPE: exports.sniper3gun
    }, {
        POSITION: [13, 8, 0, 240, 170, 0],
        TYPE: exports.sniper3gun
    }]
};
exports.auto4 = {
    PARENT: [exports.genericTank],
    DANGER: 5,
    LABEL: "Auto-4",
    FACING_TYPE: "autospin",
    TURRETS: [{
        POSITION: [13, 6, 0, 45, 160, 0],
        TYPE: exports.auto4gun
    }, {
        POSITION: [13, 6, 0, 135, 160, 0],
        TYPE: exports.auto4gun
    }, {
        POSITION: [13, 6, 0, 225, 160, 0],
        TYPE: exports.auto4gun
    }, {
        POSITION: [13, 6, 0, 315, 160, 0],
        TYPE: exports.auto4gun
    }]
};
exports.flanktrap = {
    PARENT: [exports.genericTank],
    LABEL: "Trap Guard",
    STAT_NAMES: statnames.generic,
    DANGER: 6,
    GUNS: [{
        POSITION: [20, 8, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [13, 8, 1, 0, 0, 180, 0]
    }, {
        POSITION: [4, 8, 1.7, 13, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }]
};
exports.twintrap = {
    PARENT: [exports.genericTank],
    LABEL: "Bulwark",
    STAT_NAMES: statnames.generic,
    DANGER: 7,
    GUNS: [{
        POSITION: [20, 8, 1, 0, 5.5, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.twin]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [13, 8, 1, 0, 5.5, 190, 0]
    }, {
        POSITION: [4, 8, 1.7, 13, 5.5, 190, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.twin]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }, {
        POSITION: [20, 8, 1, 0, -5.5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.flank, g.flank, g.twin]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [13, 8, 1, 0, -5.5, 170, .5]
    }, {
        POSITION: [4, 8, 1.7, 13, -5.5, 170, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.twin]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }]
};
exports.guntrap = {
    PARENT: [exports.genericTank],
    LABEL: "Gunner Trapper",
    DANGER: 7,
    STAT_NAMES: statnames.generic,
    BODY: {
        FOV: 1.25 * base.FOV
    },
    GUNS: [{
        POSITION: [19, 2, 1, 0, -2.5, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.twin, g.tonsmorrecoil, g.lotsmorrecoil]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [19, 2, 1, 0, 2.5, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunner, g.power, g.twin, g.tonsmorrecoil, g.lotsmorrecoil]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [12, 11, 1, 0, 0, 0, 0]
    }, {
        POSITION: [13, 11, 1, 0, 0, 180, 0]
    }, {
        POSITION: [4, 11, 1.7, 13, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.fast, g.halfrecoil]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }]
};
exports.bushwhack = {
    PARENT: [exports.genericTank],
    LABEL: "Bushwhacker",
    BODY: {
        ACCELERATION: .7 * base.ACCEL,
        FOV: 1.2 * base.FOV
    },
    DANGER: 7,
    GUNS: [{
        POSITION: [24, 8.5, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.sniper, g.morerecoil]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [13, 8.5, 1, 0, 0, 180, 0]
    }, {
        POSITION: [4, 8.5, 1.7, 13, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }]
};
exports.crasher = {
    TYPE: "crasher",
    LABEL: "Crasher",
    COLOR: 5,
    SHAPE: 3,
    SIZE: 5,
    VARIES_IN_SIZE: true,
    CONTROLLERS: ["nearestDifferentMaster", "mapTargetToGoal"],
    AI: {
        NO_LEAD: true
    },
    BODY: {
        SPEED: 5,
        ACCELERATION: 1.4,
        HEALTH: .5,
        DAMAGE: 5,
        PENETRATION: 2,
        PUSHABILITY: .5,
        DENSITY: 10,
        RESIST: 2
    },
    MOTION_TYPE: "motor",
    FACING_TYPE: "smoothWithMotion",
    HITS_OWN_TYPE: "hard",
    HAS_NO_MASTER: true,
    DRAW_HEALTH: true
};
exports.sentry = {
    PARENT: [exports.genericTank],
    TYPE: "crasher",
    LABEL: "Sentry",
    DANGER: 3,
    COLOR: 5,
    SHAPE: 3,
    SIZE: 10,
    SKILL: skillSet({
        rld: .5,
        dam: .8,
        pen: .8,
        str: .1,
        spd: 1,
        atk: .5,
        hlt: 0,
        shi: 0,
        rgn: .7,
        mob: 0
    }),
    VALUE: 1500,
    VARIES_IN_SIZE: true,
    CONTROLLERS: ["nearestDifferentMaster", "mapTargetToGoal"],
    AI: {
        NO_LEAD: true
    },
    BODY: {
        FOV: .5,
        ACCELERATION: .75,
        DAMAGE: 1.5 * base.DAMAGE,
        HEALTH: 1.5 * base.HEALTH,
        SPEED: .5 * base.SPEED
    },
    MOTION_TYPE: "motor",
    FACING_TYPE: "smoothToTarget",
    HITS_OWN_TYPE: "hard",
    HAS_NO_MASTER: true,
    DRAW_HEALTH: true,
    GIVE_KILL_MESSAGE: true
};
exports.trapTurret = {
    PARENT: [exports.genericTank],
    LABEL: "Turret",
    BODY: {
        FOV: .5
    },
    INDEPENDENT: true,
    CONTROLLERS: ["nearestDifferentMaster"],
    COLOR: 16,
    AI: {
        SKYNET: true,
        FULL_VIEW: true
    },
    GUNS: [{
        POSITION: [16, 14, 1, 0, 0, 0, 0]
    }, {
        POSITION: [4, 14, 1.8, 16, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.lowpower, g.fast, g.halfreload]),
            TYPE: exports.trap,
            STAT_CALCULATOR: gunCalcNames.trap
        }
    }]
};
exports.sentrySwarm = {
    PARENT: [exports.sentry],
    DANGER: 3,
    GUNS: [{
        POSITION: [7, 14, .6, 7, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.morerecoil]),
            TYPE: exports.swarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }]
};
exports.sentryGun = makeAuto(exports.sentry, "Sentry", {
    type: exports.heavy3gun,
    size: 12
}), exports.sentryTrap = makeAuto(exports.sentry, "Sentry", {
    type: exports.trapTurret,
    size: 12
}), exports.miniboss = {
    PARENT: [exports.genericTank],
    TYPE: "miniboss",
    DANGER: 6,
    SKILL: skillSet({
        rld: .7,
        dam: .5,
        pen: .8,
        str: .8,
        spd: .2,
        atk: .3,
        hlt: 1,
        shi: .7,
        rgn: .7,
        mob: 0
    }),
    LEVEL: 45,
    CONTROLLERS: ["nearestDifferentMaster", "minion", "canRepel"],
    AI: {
        NO_LEAD: true
    },
    FACING_TYPE: "autospin",
    HITS_OWN_TYPE: "hardOnlyBosses",
    BROADCAST_MESSAGE: "A visitor has left!"
};
exports.crasherSpawner = {
    PARENT: [exports.genericTank],
    LABEL: "Spawned",
    STAT_NAMES: statnames.drone,
    CONTROLLERS: ["nearestDifferentMaster"],
    COLOR: 5,
    INDEPENDENT: true,
    AI: {
        chase: true
    },
    MAX_CHILDREN: 4,
    GUNS: [{
        POSITION: [6, 12, 1.2, 8, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.weak, g.weak]),
            TYPE: [exports.drone, {
                LABEL: "Crasher",
                VARIES_IN_SIZE: true,
                DRAW_HEALTH: true
            }],
            SYNCS_SKILLS: true,
            AUTOFIRE: true,
            STAT_CALCULATOR: gunCalcNames.drone
        }
    }]
};
exports.elite = {
    PARENT: [exports.miniboss],
    LABEL: "Elite Crasher",
    COLOR: 5,
    SHAPE: 3,
    SIZE: 27,
    VARIES_IN_SIZE: true,
    VALUE: 15e4,
    BODY: {
        FOV: 1.25,
        SPEED: .1 * base.SPEED,
        HEALTH: 7 * base.HEALTH,
        DAMAGE: 2.5 * base.DAMAGE
    }
};
exports.elite_destroyer = {
    PARENT: [exports.elite],
    GUNS: [{
        POSITION: [5, 16, 1, 6, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.pound, g.destroy]),
            TYPE: exports.bullet,
            LABEL: "Devastator"
        }
    }, {
        POSITION: [5, 16, 1, 6, 0, 60, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.pound, g.destroy]),
            TYPE: exports.bullet,
            LABEL: "Devastator"
        }
    }, {
        POSITION: [5, 16, 1, 6, 0, -60, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.pound, g.pound, g.destroy]),
            TYPE: exports.bullet,
            LABEL: "Devastator"
        }
    }],
    TURRETS: [{
        POSITION: [11, 0, 0, 180, 360, 0],
        TYPE: [exports.crasherSpawner]
    }, {
        POSITION: [11, 0, 0, 60, 360, 0],
        TYPE: [exports.crasherSpawner]
    }, {
        POSITION: [11, 0, 0, -60, 360, 0],
        TYPE: [exports.crasherSpawner]
    }, {
        POSITION: [11, 0, 0, 0, 360, 1],
        TYPE: [exports.bigauto4gun, {
            INDEPENDENT: true,
            COLOR: 5
        }]
    }]
};
exports.elite_gunner = {
    PARENT: [exports.elite],
    GUNS: [{
        POSITION: [14, 16, 1, 0, 0, 180, 0]
    }, {
        POSITION: [4, 16, 1.5, 14, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.hexatrap]),
            TYPE: [exports.pillbox, {
                INDEPENDENT: true
            }]
        }
    }, {
        POSITION: [6, 14, -2, 2, 0, 60, 0]
    }, {
        POSITION: [6, 14, -2, 2, 0, 300, 0]
    }],
    AI: {
        NO_LEAD: false
    },
    TURRETS: [{
        POSITION: [14, 8, 0, 60, 180, 0],
        TYPE: [exports.auto4gun]
    }, {
        POSITION: [14, 8, 0, 300, 180, 0],
        TYPE: [exports.auto4gun]
    }]
};
exports.elite_sprayer = {
    PARENT: [exports.elite],
    AI: {
        NO_LEAD: false
    },
    TURRETS: [{
        POSITION: [14, 6, 0, 180, 190, 0],
        TYPE: [exports.spray, {
            COLOR: 5
        }]
    }, {
        POSITION: [14, 6, 0, 60, 190, 0],
        TYPE: [exports.spray, {
            COLOR: 5
        }]
    }, {
        POSITION: [14, 6, 0, -60, 190, 0],
        TYPE: [exports.spray, {
            COLOR: 5
        }]
    }]
};
exports.elite_battleship = {
    PARENT: [exports.elite],
    GUNS: [{
        POSITION: [4, 6, .6, 7, -8, 60, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
            TYPE: exports.autoswarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [4, 6, .6, 7, 0, 60, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
            TYPE: exports.autoswarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [4, 6, .6, 7, 8, 60, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
            TYPE: exports.autoswarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [4, 6, .6, 7, -8, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
            TYPE: exports.autoswarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [4, 6, .6, 7, 0, 180, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
            TYPE: exports.autoswarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [4, 6, .6, 7, 8, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
            TYPE: exports.autoswarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [4, 6, .6, 7, -8, -60, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
            TYPE: exports.autoswarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [4, 6, .6, 7, 0, -60, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
            TYPE: exports.autoswarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }, {
        POSITION: [4, 6, .6, 7, 8, -60, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.swarm, g.battle]),
            TYPE: exports.autoswarm,
            STAT_CALCULATOR: gunCalcNames.swarm
        }
    }],
    TURRETS: [{
        POSITION: [5, 7, 0, 0, 360, 1],
        TYPE: [exports.auto3gun, {
            INDEPENDENT: true,
            COLOR: 5
        }]
    }, {
        POSITION: [5, 7, 0, 120, 360, 1],
        TYPE: [exports.auto3gun, {
            INDEPENDENT: true,
            COLOR: 5
        }]
    }, {
        POSITION: [5, 7, 0, 240, 360, 1],
        TYPE: [exports.auto3gun, {
            INDEPENDENT: true,
            COLOR: 5
        }]
    }]
};
exports.palisade = (() => {
    let T = {
        SHOOT_SETTINGS: combineStats([g.factory, g.pound, g.halfreload, g.halfreload]),
        TYPE: exports.minion,
        STAT_CALCULATOR: gunCalcNames.drone,
        AUTOFIRE: true,
        MAX_CHILDREN: 1,
        SYNCS_SKILLS: true,
        WAIT_TO_CYCLE: true
    };
    return {
        PARENT: [exports.miniboss],
        LABEL: "Rogue Palisade",
        COLOR: 17,
        SHAPE: 6,
        SIZE: 30,
        VALUE: 5e5,
        BODY: {
            FOV: 1.4,
            SPEED: .05 * base.SPEED,
            HEALTH: 16 * base.HEALTH,
            SHIELD: 3 * base.SHIELD,
            DAMAGE: 3 * base.DAMAGE
        },
        GUNS: [{
            POSITION: [4, 6, -1.6, 8, 0, 0, 0],
            PROPERTIES: T
        }, {
            POSITION: [4, 6, -1.6, 8, 0, 60, 0],
            PROPERTIES: T
        }, {
            POSITION: [4, 6, -1.6, 8, 0, 120, 0],
            PROPERTIES: T
        }, {
            POSITION: [4, 6, -1.6, 8, 0, 180, 0],
            PROPERTIES: {
                SHOOT_SETTINGS: combineStats([g.factory, g.pound]),
                TYPE: exports.minion,
                STAT_CALCULATOR: gunCalcNames.drone,
                AUTOFIRE: true,
                MAX_CHILDREN: 1,
                SYNCS_SKILLS: true,
                WAIT_TO_CYCLE: true
            }
        }, {
            POSITION: [4, 6, -1.6, 8, 0, 240, 0],
            PROPERTIES: T
        }, {
            POSITION: [4, 6, -1.6, 8, 0, 300, 0],
            PROPERTIES: T
        }],
        TURRETS: [{
            POSITION: [5, 10, 0, 30, 110, 0],
            TYPE: exports.trapTurret
        }, {
            POSITION: [5, 10, 0, 90, 110, 0],
            TYPE: exports.trapTurret
        }, {
            POSITION: [5, 10, 0, 150, 110, 0],
            TYPE: exports.trapTurret
        }, {
            POSITION: [5, 10, 0, 210, 110, 0],
            TYPE: exports.trapTurret
        }, {
            POSITION: [5, 10, 0, 270, 110, 0],
            TYPE: exports.trapTurret
        }, {
            POSITION: [5, 10, 0, 330, 110, 0],
            TYPE: exports.trapTurret
        }]
    }
})(), exports.skimboss = {
    PARENT: [exports.elite],
    LABEL: "Elite Skimmer",
    COLOR: 2,
    TURRETS: [{
        POSITION: [15, 5, 0, 60, 170, 0],
        TYPE: exports.skimturret
    }, {
        POSITION: [15, 5, 0, 180, 170, 0],
        TYPE: exports.skimturret
    }, {
        POSITION: [15, 5, 0, 300, 170, 0],
        TYPE: exports.skimturret
    }]
};
exports.summoner = {
    PARENT: [exports.miniboss],
    LABEL: "Summoner",
    DANGER: 8,
    SHAPE: 4,
    COLOR: 13,
    SIZE: 26,
    MAX_CHILDREN: 28,
    FACING_TYPE: "autospin",
    VALUE: 3e5,
    BODY: {
        FOV: .5,
        SPEED: .1 * base.SPEED,
        HEALTH: 7 * base.HEALTH,
        DAMAGE: 2.6 * base.DAMAGE
    },
    GUNS: [{
        POSITION: [3.5, 8.65, 1.2, 8, 0, 90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.summoner]),
            TYPE: exports.sunchip,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.necro,
            WAIT_TO_CYCLE: true
        }
    }, {
        POSITION: [3.5, 8.65, 1.2, 8, 0, 270, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.summoner]),
            TYPE: exports.sunchip,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.necro,
            WAIT_TO_CYCLE: true
        }
    }, {
        POSITION: [3.5, 8.65, 1.2, 8, 0, 0, .25],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.summoner]),
            TYPE: exports.sunchip,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.necro,
            WAIT_TO_CYCLE: true
        }
    }, {
        POSITION: [3.5, 8.65, 1.2, 8, 0, 180, .75],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.summoner]),
            TYPE: exports.sunchip,
            AUTOFIRE: true,
            SYNCS_SKILLS: true,
            STAT_CALCULATOR: gunCalcNames.necro,
            WAIT_TO_CYCLE: true
        }
    }]
};
exports.nestKeeperTurret = {
    PARENT: [exports.genericTank],
    LABEL: 'Boomer Turret',
    CONTROLLERS: ['nearestDifferentMaster'],
    BODY: {
        SPEED: base.SPEED * .8,
        FOV: base.FOV * 1.15
    },
    GUNS: [{
        POSITION: [18, 10, 1, 0, 0, 0, 0]
    }, {
        POSITION: [6, 10, -1.5, 7, 0, 0, 0]
    }, {
        POSITION: [2, 10, 1.3, 18, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.block, g.boomerang, g.one_third_reload, g.more_speed]),
            TYPE: exports.boomerang
        }
    }]
};
exports.nestKeeper = {
    PARENT: [exports.miniboss],
    LABEL: 'Nest Keeper',
    COLOR: 14,
    SHAPE: 5,
    SIZE: 50,
    BODY: {
        FOV: 1.3,
        SPEED: base.SPEED * .25,
        HEALTH: base.HEALTH * 9,
        SHIELD: base.SHIELD * 1.5,
        REGEN: base.REGEN,
        DAMAGE: base.DAMAGE * 2.5
    },
    MAX_CHILDREN: 15,
    GUNS: [{
        POSITION: [3.5, 6.65, 1.2, 8, 0, 35, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.nest_keeper]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            LABEL: 'Nest Keeper Mega Crasher',
        },
    }, {
        POSITION: [3.5, 6.65, 1.2, 8, 0, -35, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.nest_keeper]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            LABEL: 'Nest Keeper Mega Crasher'
        }
    }, {
        POSITION: [3.5, 6.65, 1.2, 8, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.nest_keeper]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            LABEL: 'Nest Keeper Mega Crasher'
        }
    }, {
        POSITION: [3.5, 6.65, 1.2, 8, 0, 108, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.nest_keeper]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            LABEL: 'Nest Keeper Mega Crasher'
        }
    }, {
        POSITION: [3.5, 6.65, 1.2, 8, 0, -108, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.drone, g.nest_keeper]),
            TYPE: exports.drone,
            AUTOFIRE: true,
            LABEL: 'Nest Keeper Mega Crasher'
        }
    }],
    TURRETS: [{
        POSITION: [8, 9, 0, 72, 120, 0],
        TYPE: [exports.auto4gun, {
            INDEPENDENT: true,
            COLOR: 14
        }]
    }, {
        POSITION: [8, 9, 0, 0, 120, 0],
        TYPE: [exports.auto4gun, {
            INDEPENDENT: true,
            COLOR: 14
        }]
    }, {
        POSITION: [8, 9, 0, 144, 120, 0],
        TYPE: [exports.auto4gun, {
            INDEPENDENT: true,
            COLOR: 14
        }]
    }, {
        POSITION: [8, 9, 0, 216, 120, 0],
        TYPE: [exports.auto4gun, {
            INDEPENDENT: true,
            COLOR: 14
        }]
    }, {
        POSITION: [8, 9, 0, -72, 120, 0],
        TYPE: [exports.auto4gun, {
            INDEPENDENT: true,
            COLOR: 14
        }]
    }, {
        POSITION: [9, 0, 0, 0, 360, 1],
        TYPE: [exports.nestKeeperTurret, {
            INDEPENDENT: true,
            COLOR: 14
        }]
    }]
};
exports.mothership = {
    PARENT: [exports.genericTank],
    LABEL: "Mothership",
    DANGER: 10,
    SIZE: exports.genericTank.SIZE * (7 / 3),
    SHAPE: 16,
    STAT_NAMES: statnames.drone,
    VALUE: 5e5,
    SKILL: [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
    BODY: {
        REGEN: 0,
        FOV: 1,
        SHIELD: 0,
        ACCEL: .2,
        SPEED: .3,
        HEALTH: 2000,
        PUSHABILITY: .15,
        DENSITY: .2,
        DAMAGE: 1.5
    },
    HITS_OWN_TYPE: "pushOnlyTeam",
    GUNS: (() => {
        let e = [],
            T = [1];
        for (let e = 1; e < 8.5; e += .5) {
            let t = e / 16;
            T.push(t);
        }
        for (let t = 0; t < 16; t++) {
            let S = 22.5 * (t + 1),
                E = {
                    MAX_CHILDREN: 2,
                    SHOOT_SETTINGS: combineStats([g.drone, g.over, g.mothership]),
                    TYPE: exports.drone,
                    AUTOFIRE: true,
                    SYNCS_SKILLS: true,
                    STAT_CALCULATOR: gunCalcNames.drone,
                    WAIT_TO_CYCLE: true
                };
            t % 2 == 0 && (E.TYPE = [exports.drone, {
                AI: {
                    skynet: true
                },
                INDEPENDENT: true,
                LAYER: 10,
                BODY: {
                    FOV: 2
                }
            }]);
            let O = {
                POSITION: [4.3, 3.1, 1.2, 8, 0, S, T[t]],
                PROPERTIES: E
            };
            e.push(O);
        }
        return e;
    })()
};
exports.dominationBody = {
    LABEL: "",
    CONTROLLERS: ["dontTurnDominator"],
    COLOR: 9,
    SHAPE: 6,
    INDEPENDENT: true
};
exports.dominator = {
    PARENT: [exports.genericTank],
    LABEL: "Dominator",
    DANGER: 10,
    SKILL: skillSet({
        rld: 1,
        dam: 1,
        pen: 1,
        str: 1,
        spd: 1
    }),
    LEVEL: -1,
    BODY: {
        RESIST: 100,
        SPEED: 1.32,
        ACCELERATION: .8,
        HEALTH: 590,
        DAMAGE: 6,
        PENETRATION: .25,
        FOV: 1,
        PUSHABILITY: 0,
        HETERO: 0,
        SHIELD: base.SHIELD * 1.4
    },
    CONTROLLERS: ["nearestDifferentMaster"],
    DISPLAY_NAME: true,
    TURRETS: [{
        POSITION: [22, 0, 0, 0, 360, 0],
        TYPE: exports.dominationBody
    }],
    CAN_BE_ON_LEADERBOARD: false,
    GIVE_KILL_MESSAGE: false,
    ACCEPTS_SCORE: false,
    HITS_OWN_TYPE: "pushOnlyTeam"
};
exports.destroyerDominator = {
    PARENT: [exports.dominator],
    GUNS: [{
        POSITION: [15.25, 6.75, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.destroyerDominator]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [5, 6.75, -1.6, 6.75, 0, 0, 0]
    }]
};
exports.gunnerDominator = {
    PARENT: [exports.dominator],
    GUNS: [{
        POSITION: [14.25, 3, 1, 0, -2, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunnerDominator]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [14.25, 3, 1, 0, 2, 0, .5],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunnerDominator]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [15.85, 3, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.gunnerDominator]),
            TYPE: exports.bullet
        }
    }, {
        POSITION: [5, 8.5, -1.6, 6.25, 0, 0, 0]
    }]
};
exports.trapperDominator = {
    PARENT: [exports.dominator],
    FACING_TYPE: 'autospin',
    CONTROLLERS: ['alwaysFire'],
    GUNS: [{
        POSITION: [4, 3.75, 1, 8, 0, 0, 0]
    }, {
        POSITION: [1.25, 3.75, 1.7, 12, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.trapperDominator]),
            TYPE: exports.trap
        }
    }, {
        POSITION: [4, 3.75, 1, 8, 0, 45, 0]
    }, {
        POSITION: [1.25, 3.75, 1.7, 12, 0, 45, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.trapperDominator]),
            TYPE: exports.trap
        }
    }, {
        POSITION: [4, 3.75, 1, 8, 0, 90, 0]
    }, {
        POSITION: [1.25, 3.75, 1.7, 12, 0, 90, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.trapperDominator]),
            TYPE: exports.trap
        }
    }, {
        POSITION: [4, 3.75, 1, 8, 0, 135, 0]
    }, {
        POSITION: [1.25, 3.75, 1.7, 12, 0, 135, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.trapperDominator]),
            TYPE: exports.trap
        }
    }, {
        POSITION: [4, 3.75, 1, 8, 0, 180, 0]
    }, {
        POSITION: [1.25, 3.75, 1.7, 12, 0, 180, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.trapperDominator]),
            TYPE: exports.trap
        }
    }, {
        POSITION: [4, 3.75, 1, 8, 0, 225, 0]
    }, {
        POSITION: [1.25, 3.75, 1.7, 12, 0, 225, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.trapperDominator]),
            TYPE: exports.trap
        }
    }, {
        POSITION: [4, 3.75, 1, 8, 0, 270, 0]
    }, {
        POSITION: [1.25, 3.75, 1.7, 12, 0, 270, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.trapperDominator]),
            TYPE: exports.trap
        }
    }, {
        POSITION: [4, 3.75, 1, 8, 0, 315, 0]
    }, {
        POSITION: [1.25, 3.75, 1.7, 12, 0, 315, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.trap, g.trapperDominator]),
            TYPE: exports.trap
        }
    }]
};
exports.arenaCloser = {
    PARENT: [exports.genericTank],
    LABEL: 'Arena Closer',
    DANGER: 10,
    SIZE: 34,
    COLOR: 13,
    LAYER: 13,
    BODY: {
        REGEN: 1e5,
        HEALTH: 1e6,
        DENSITY: 30,
        DAMAGE: 1e5,
        FOV: 1.15,
        SPEED: 8
    },
    DRAW_HEALTH: false,
    HITS_OWN_TYPE: 'never',
    GUNS: [{
        POSITION: [14, 10, 1, 0, 0, 0, 0],
        PROPERTIES: {
            SHOOT_SETTINGS: combineStats([g.basic, g.closer]),
            TYPE: [exports.bullet, {
                LAYER: 12
            }]
        }
    }]
};
exports.bot = {
    AUTO_UPGRADE: "random",
    FACING_TYPE: "looseToTarget",
    BODY: {
        SIZE: 10
    },
    NAME: "ai_",
    CONTROLLERS: ["nearestDifferentMaster", "mapAltToFire", "minion", "fleeAtLowHealth"],
    AI: {
        STRAFE: true
    }
};
exports.ramBot = {
    AUTO_UPGRADE: "random",
    FACING_TYPE: "looseToTarget",
    BODY: {
        SIZE: 10
    },
    NAME: "ai_",
    CONTROLLERS: ["nearestDifferentMaster", "mapAltToFire", "minion", "fleeAtLowHealth"],
    AI: {
        STRAFE: true
    }
};
exports.tagMode = {
    PARENT: [exports.bullet],
    LABEL: "Players"
};
exports.testbed.UPGRADES_TIER_1 = [exports.betaTanks, exports.bosses, exports.misc, exports.basic];
exports.betaTanks.UPGRADES_TIER_1 = [exports.autocruiser, exports.master, exports.quint, exports.bentboomer, exports.quadtrapper, exports.sniper3];
exports.bosses.UPGRADES_TIER_1 = [exports.elite_destroyer, exports.elite_gunner, exports.elite_sprayer, exports.elite_battleship, exports.palisade, exports.skimboss, exports.summoner, exports.nestKeeper];
exports.misc.UPGRADES_TIER_1 = [exports.dominator, exports.destroyerDominator, exports.gunnerDominator, exports.trapperDominator, exports.mothership, exports.arenaCloser]
exports.basic.UPGRADES_TIER_1 = [exports.twin, exports.sniper, exports.machine, exports.flank, exports.director, exports.trapper, exports.pound];
exports.basic.UPGRADES_TIER_3 = [exports.single];
exports.basic.UPGRADES_TIER_2 = [exports.smash];
exports.smash.UPGRADES_TIER_3 = [exports.megasmash, exports.spike, exports.autosmash, exports.landmine];
exports.twin.UPGRADES_TIER_2 = [exports.double, exports.bent, exports.gunner, exports.hexa];
exports.twin.UPGRADES_TIER_3 = [exports.dual, exports.musket, exports.twintrap];
exports.double.UPGRADES_TIER_3 = [exports.tripletwin, exports.split, exports.autodouble, exports.bentdouble];
exports.bent.UPGRADES_TIER_3 = [exports.penta, exports.spread, exports.benthybrid, exports.bentdouble, exports.triple];
exports.gunner.UPGRADES_TIER_3 = [exports.autogunner, exports.nailgun, exports.auto4, exports.machinegunner, exports.guntrap, exports.hurricane, exports.overgunner];
exports.sniper.UPGRADES_TIER_2 = [exports.assassin, exports.hunter, exports.mini, exports.rifle];
exports.sniper.UPGRADES_TIER_3 = [exports.bushwhack];
exports.rifle.UPGRADES_TIER_3 = [exports.musket];
exports.assassin.UPGRADES_TIER_3 = [exports.ranger, exports.falcon, exports.stalker, exports.autoass];
exports.hunter.UPGRADES_TIER_3 = [exports.preda, exports.poach, exports.sidewind, exports.dual];
exports.builder.UPGRADES_TIER_3 = [exports.construct, exports.autobuilder, exports.engineer, exports.boomer, exports.tritrap, exports.conq];
exports.machine.UPGRADES_TIER_2 = [exports.artillery, exports.mini, exports.gunner];
exports.machine.UPGRADES_TIER_3 = [exports.spray];
exports.artillery.UPGRADES_TIER_3 = [exports.mortar, exports.spread, exports.skimmer, exports.spinner];
exports.mini.UPGRADES_TIER_3 = [exports.stream, exports.nailgun, exports.hybridmini, exports.minitrap];
exports.flank.UPGRADES_TIER_2 = [exports.hexa, exports.tri, exports.auto3, exports.flanktrap, exports.tritrapper];
exports.flank.UPGRADES_TIER_3 = [];
exports.tri.UPGRADES_TIER_3 = [exports.fighter, exports.booster, exports.falcon, exports.bomber, exports.autotri, exports.brutalizer, exports.eagle];
exports.hexa.UPGRADES_TIER_3 = [exports.octo, exports.hurricane, exports.hexatrap];
exports.auto3.UPGRADES_TIER_3 = [exports.auto5, exports.heavy3, exports.auto4, exports.banshee];
exports.flanktrap.UPGRADES_TIER_3 = [exports.bushwhack, exports.guntrap, exports.fortress, exports.bomber, exports.conq, exports.twintrap];
exports.director.UPGRADES_TIER_2 = [exports.overseer, exports.cruiser, exports.underseer, exports.lilfact];
exports.director.UPGRADES_TIER_3 = [exports.manager];
exports.lilfact.UPGRADES_TIER_3 = [exports.factory, exports.autospawner];
exports.overseer.UPGRADES_TIER_3 = [exports.overlord, exports.overtrap, exports.overgunner, exports.banshee, exports.autoover, exports.overdrive];
exports.underseer.UPGRADES_TIER_3 = [exports.necromancer, exports.maleficitor];
exports.cruiser.UPGRADES_TIER_3 = [exports.carrier, exports.battleship, exports.fortress];
exports.trapper.UPGRADES_TIER_2 = [exports.tritrapper, exports.builder, exports.flanktrap];
exports.trapper.UPGRADES_TIER_3 = [exports.minitrap, exports.overtrap];
exports.tritrapper.UPGRADES_TIER_3 = [exports.fortress, exports.hexatrap, exports.heptatrap, exports.tritrap];
exports.pound.UPGRADES_TIER_2 = [exports.destroy, exports.builder, exports.artillery];
exports.pound.UPGRADES_TIER_3 = [exports.shotgun2, exports.eagle];
exports.destroy.UPGRADES_TIER_3 = [exports.conq, exports.anni, exports.hybrid, exports.construct, exports.hiveshooter];