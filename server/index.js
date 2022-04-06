/*jslint node: true */
/*jshint -W061 */
/*global goog, Map, let */
"use strict";
// General requires
require('google-closure-library');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.QuadTree');

const GLOBAL = require("./modules/global.js");
console.log(`[${GLOBAL.creationDate}]: Server initialized.\nRoom Info:\nDimensions: ${room.width} x ${room.height}\nMax Food / Nest Food: ${room.maxFood} / ${room.maxFood * room.nestFoodAmount}`);

// Let's get a cheaper array removal thing
Array.prototype.remove = function(index) {
    if (index === this.length - 1) return this.pop();
    let r = this[index];
    this[index] = this.pop();
    return r;
};

util.log(room.width + ' x ' + room.height + ' room initalized.  Max food: ' + room.maxFood + ', max nest food: ' + (room.maxFood * room.nestFoodAmount) + '.');

// The most important loop. Fast looping.
const gameloop = (() => {
    // Collision stuff
    function collide(collision) {
        // Pull the two objects from the collision grid      
        let instance = collision[0],
            other = collision[1];
        // Check for ghosts...
        if (other.isGhost) {
            util.error('GHOST FOUND');
            util.error(other.label);
            util.error('x: ' + other.x + ' y: ' + other.y);
            util.error(other.collisionArray);
            util.error('health: ' + other.health.amount);
            util.warn('Ghost removed.');
            if (grid.checkIfInHSHG(other)) {
                util.warn('Ghost removed.');
                grid.removeObject(other);
            }
            return 0;
        }
        if (instance.isGhost) {
            util.error('GHOST FOUND');
            util.error(instance.label);
            util.error('x: ' + instance.x + ' y: ' + instance.y);
            util.error(instance.collisionArray);
            util.error('health: ' + instance.health.amount);
            if (grid.checkIfInHSHG(instance)) {
                util.warn('Ghost removed.');
                grid.removeObject(instance);
            }
            return 0;
        }
        if (!instance.activation.check() && !other.activation.check()) {
            return 0;
        }
        switch (true) {
            case (instance.type === "wall" || other.type === "wall"):
                if (instance.type === "wall" && other.type === "wall") return;
                let wall = instance.type === "wall" ? instance : other;
                let entity = instance.type === "wall" ? other : instance;
                switch (wall.shape) {
                    case 4:
                        reflectCollide(wall, entity)
                        break;
                    case 0:
                        mooncollide(wall, entity);
                        break;
                    default:
                        let a = ((entity.type === "bullet") ? 1 + 10 / (entity.velocity.length + 10) : 1);
                        advancedcollide(wall, entity, false, false, a);
                        break;
                };
                break;
            case (instance.team === other.team && (instance.settings.hitsOwnType === "pushOnlyTeam" || other.settings.hitsOwnType === "pushOnlyTeam")): { // Dominator / Mothership collisions
                if (instance.settings.hitsOwnType === other.settings.hitsOwnType) return;
                let pusher = instance.settings.hitsOwnType === "pushOnlyTeam" ? instance : other;
                let entity = instance.settings.hitsOwnType === "pushOnlyTeam" ? other : instance;
                if (entity.type !== "tank" || entity.settings.hitsOwnType === "never") return;
                let a = 1 + 10 / (Math.max(entity.velocity.length, pusher.velocity.length) + 10);
                advancedcollide(pusher, entity, false, false, a);
            }
            break;
        case ((instance.type === 'crasher' && other.type === 'food') || (other.type === 'crasher' && instance.type === 'food')):
            firmcollide(instance, other);
            break;
        case (instance.team !== other.team):
            advancedcollide(instance, other, true, true);
            break;
        case (instance.settings.hitsOwnType == 'never' || other.settings.hitsOwnType == 'never'):
            break;
        case (instance.settings.hitsOwnType === other.settings.hitsOwnType):
            switch (instance.settings.hitsOwnType) {
                case 'push':
                    advancedcollide(instance, other, false, false);
                    break;
                case 'hard':
                    firmcollide(instance, other);
                    break;
                case 'hardWithBuffer':
                    firmcollide(instance, other, 30);
                    break;
                case "hardOnlyTanks":
                    if (instance.type === "tank" && other.type === "tank" && !instance.isDominator && !other.isDominator) firmcollide(instance, other);
                case "hardOnlyBosses":
                    if (instance.type === other.type && instance.type === "miniboss") firmcollide(instance, other);
                case 'repel':
                    simplecollide(instance, other);
                    break;
            };
            break;
        };
    };
    // Living stuff
    function entitiesactivationloop(my) {
        // Update collisions.
        my.collisionArray = [];
        // Activation
        my.activation.update();
        my.updateAABB(my.activation.check());
    }

    function entitiesliveloop(my) {
        // Consider death.
        if (my.contemplationOfMortality()) my.destroy();
        else {
            if (my.bond == null) {
                // Resolve the physical behavior from the last collision cycle.
                logs.physics.set();
                my.physics();
                logs.physics.mark();
            }
            if (my.activation.check() || my.isPlayer) {
                logs.entities.tally();
                // Think about my actions.
                logs.life.set();
                my.life();
                logs.life.mark();
                // Apply friction.
                my.friction();
                my.confinementToTheseEarthlyShackles();
                logs.selfie.set();
                my.takeSelfie();
                logs.selfie.mark();
            }
            entitiesactivationloop(my);
        }
        // Update collisions.
        my.collisionArray = [];
    }
    let time;
    // Return the loop function
    let ticks = 0;
    return () => {
        logs.loops.tally();
        logs.master.set();
        logs.activation.set();
        logs.activation.mark();
        // Do collisions
        logs.collide.set();
        if (entities.length > 1) {
            // Load the grid
            grid.update();
            // Run collisions in each grid
            const pairs = grid.queryForCollisionPairs();
            loopThrough(pairs, collide);
        }
        logs.collide.mark();
        // Do entities life
        logs.entities.set();
        for (let e of entities) entitiesliveloop(e);
        logs.entities.mark();
        logs.master.mark();
        // Remove dead entities
        purgeEntities();
        room.lastCycle = util.time();
        ticks++;
        if (isEven(ticks)) {
            loopThrough(sockets.players, function(instance) {
                instance.socket.view.gazeUpon();
                instance.socket.lastUptime = Infinity;
            });
            if (Math.min(1, global.fps / roomSpeed / 1000 * 30) < 0.8) antiLagbot();
        }
    };
})();

setTimeout(closeArena, 60000 * 120); // Restart every 2 hours

// A less important loop. Runs at an actual 5Hz regardless of game speed.
const maintainloop = (() => {
    // Place obstacles
    function placeRoids() {
        function placeRoid(type, entityClass) {
            let x = 0;
            let position;
            do {
                position = room.randomType(type);
                x++;
                if (x > 200) {
                    util.warn("Could not place some roids.");
                    return 0;
                }
            } while (dirtyCheck(position, 10 + entityClass.SIZE));
            let o = new Entity(position);
            o.define(entityClass);
            o.team = -101;
            o.facing = ran.randomAngle();
            o.protect();
            o.life();
        }
        // Start placing them
        let roidcount = room.roid.length * room.width * room.height / room.xgrid / room.ygrid / 50000 / 1.5;
        let rockcount = room.rock.length * room.width * room.height / room.xgrid / room.ygrid / 250000 / 1.5;
        let count = 0;
        for (let i = Math.ceil(roidcount); i; i--) {
            count++;
            placeRoid('roid', Class.obstacle);
        }
        for (let i = Math.ceil(roidcount * 0.3); i; i--) {
            count++;
            placeRoid('rock', Class.babyObstacle);
        }
        for (let i = Math.ceil(rockcount * 0.8); i; i--) {
            count++;
            placeRoid('rock', Class.obstacle);
        }
        for (let i = Math.ceil(rockcount * 0.5); i; i--) {
            count++;
            placeRoid('rock', Class.babyObstacle);
        }
        util.log('Placing ' + count + ' obstacles!');
    }
    placeRoids();

    function spawnWall(loc) {
        let o = new Entity(loc);
        o.define(Class.mazeWall);
        o.team = -101;
        o.SIZE = (room.width / room.xgrid) / 2;
        o.protect();
        o.life();
    };
    for (let loc of room["wall"]) spawnWall(loc);
    // Spawning functions
    let spawnBosses = (() => {
        let timer = Math.round((c.bossSpawnInterval || 8) * 60); // It's in minutes
        const selections = [{
            bosses: [Class.elite_destroyer, Class.elite_sprayer, Class.elite_gunner, Class.elite_battleship],
            location: "nest",
            amount: [1, 3],
            nameType: "a",
            message: "Influx detected...",
            chance: 2
        }, {
            bosses: [Class.palisade, Class.summoner, Class.skimboss, Class.nestKeeper],
            location: "norm",
            amount: [1, 2],
            nameType: "castle",
            message: "A strange trembling...",
            chance: 1
        }];
        return (census) => {
            if (!census.miniboss && !timer --) {
                timer --;
                const selection = selections[ran.chooseChance(...selections.map(selection => selection.chance))];
                const amount = Math.floor(Math.random() * selection.amount[1]) + selection.amount[0];
                sockets.broadcast(amount > 1 ? "Visitors are coming..." : "A visitor is coming...");
                if (selection.message) {
                    setTimeout(sockets.broadcast, 2500, selection.message);
                }
                setTimeout(() => {
                    const names = ran.chooseBossName(selection.nameType, amount);
                    sockets.broadcast(amount > 1 ? util.listify(names) + " have arrived!" : names[0] + " has arrived!");
                    names.forEach((name, i) => {
                        let spot, m = 0;
                        do {
                            spot = room.randomType(selection.location);
                            m ++;
                        } while (dirtyCheck(spot, 500) && m < 30);
                        let boss = new Entity(spot);
                        boss.name = name;
                        boss.define(selection.bosses.sort(() => .5 - Math.random())[i % selection.bosses.length]);
                        boss.team = -100;
                    });
                }, 5000);
                timer = Math.round((c.bossSpawnInterval || 8) * 65); // 5 seconds due to spawning process
            }
        }
    })();
    /*let spawnBosses = (() => {
        let timer = 0;
        let boss = (() => {
            let i = 0,
                names = [],
                bois = [Class.egg],
                n = 0,
                begin = 'yo some shit is about to move to a lower position',
                arrival = 'Something happened lol u should probably let Neph know this broke',
                loc = 'norm';
            let spawn = () => {
                let spot, m = 0;
                do {
                    spot = room.randomType(loc);
                    m++;
                } while (dirtyCheck(spot, 500) && m < 30);
                let o = new Entity(spot);
                o.name = names[i++];
                o.define(ran.choose(bois));
                o.team = -100;
            };
            return {
                prepareToSpawn: (classArray, number, nameClass, typeOfLocation = 'norm') => {
                    n = number;
                    bois = classArray;
                    loc = typeOfLocation;
                    names = ran.chooseBossName(nameClass, number);
                    i = 0;
                    if (n === 1) {
                        begin = 'A visitor is coming.';
                        arrival = names[0] + ' has arrived.';
                    } else {
                        begin = 'Visitors are coming.';
                        arrival = '';
                        for (let i = 0; i < n - 2; i++) arrival += names[i] + ', ';
                        arrival += names[n - 2] + ' and ' + names[n - 1] + ' have arrived.';
                    }
                },
                spawn: () => {
                    sockets.broadcast(begin);
                    for (let i = 0; i < n; i++) {
                        setTimeout(spawn, ran.randomRange(3500, 5000));
                    }
                    // Wrap things up.
                    setTimeout(() => sockets.broadcast(arrival), 5000);
                    util.log('[SPAWN] ' + arrival);
                },
            };
        })();
        return census => {
            let timerThing = 60 * .5;
            if (timer > timerThing && ran.dice(timerThing - timer)) {
                util.log('[SPAWN] Preparing to spawn...');
                timer = 0;
                let choice = [];
                switch (ran.chooseChance(2, 1)) {
                    case 0:
                        choice = [
                            [Class.elite_destroyer, Class.elite_gunner, Class.elite_sprayer], Math.floor(Math.random() * 2) + 1, 'a', 'nest'
                        ];
                        break;
                    case 1:
                        choice = [
                            [Class.palisade, Class.summoner, Class.skimboss], Math.floor(Math.random() * 2) + 1, 'castle', 'norm'
                        ];
                        sockets.broadcast('A strange trembling...');
                        break;
                }
                boss.prepareToSpawn(...choice);
                setTimeout(boss.spawn, 3000);
                // Set the timeout for the spawn functions
            } else if (!census.miniboss) timer++;
        };
    })();*/
    let spawnCrasher = (() => {
        const config = {
            max: Math.floor(room["nest"].length * c.CRASHER_RATIO),
            chance: .9,
            sentryChance: 0.95,
            crashers: [Class.crasher],
            sentries: [Class.sentryGun, Class.sentrySwarm, Class.sentryTrap]
        };
        function getType() {
            const seed = Math.random();
            if (seed > config.sentryChance) return ran.choose(config.sentries);
            return ran.choose(config.crashers);
        }
        return census => {
            if (census.crasher < config.max) {
                for (let i = 0; i < config.max - census.crasher; i ++) {
                    if (Math.random() > config.chance) {
                        let spot, i = 25;
                        do {
                            spot = room.randomType('nest');
                            i --;
                            if (!i) return 0;
                        } while (dirtyCheck(spot, 250));
                        let o = new Entity(spot);
                        o.define(getType());
                        o.team = -100;
                    }
                }
            }
        }
    })();

    function spawnBot(TEAM = null) {
        let set = ran.choose(botSets);
        let team = TEAM ? TEAM : getTeam();
        const botName = ran.chooseBotName();
        let color = [10, 11, 12, 15][team - 1];
        if (room.gameMode === "ffa") color = (c.RANDOM_COLORS ? Math.floor(Math.random() * 20) : 12);
        let loc = c.SPECIAL_BOSS_SPAWNS ? room.randomType("nest") : room.randomType("norm");
        let o = new Entity(loc);
        o.color = color;
        o.invuln = true;
        o.define(Class[set.startClass]);
        o.name += botName;
        o.refreshBodyAttributes();
        o.color = color;
        if (room.gameMode === "tdm") o.team = -team;
        o.skill.score = 23500;
        o.isBot = true;
        if (c.GROUPS) {
            let master = {
                player: {
                    body: o
                }
            };
            groups.addMember(master);
            o.team = -master.rememberedTeam;
            o.ondead = function() {
                groups.removeMember(master);
            }
        }
        setTimeout(function() {
            if (!o || o.isDead()) return;
            const index = o.index;
            let className = set.startClass;
            for (let key in Class)
                if (Class[key].index === index) className = key;
            o.define(Class[set.ai]);
            o.define(Class[className]);
            o.refreshBodyAttributes();
            o.name += botName;
            o.invuln = false;
            o.skill.set(set.build);
        }, 3000 + (Math.floor(Math.random() * 7000)));
        return o;
    };
    if (c.SPACE_MODE) {
        console.log("Spawned moon.");
        let o = new Entity({
            x: room.width / 2,
            y: room.height / 2
        });
        o.define(Class.moon);
        o.team = -101;
        o.SIZE = room.width / 10;
        o.protect();
        o.life();
        room.blackHoles.push(o);
    }
    // The NPC function
    let makenpcs = (() => {
        // Make base protectors if needed.
        let f = (loc, team) => {
            let o = new Entity(loc);
            o.define(Class.baseProtector);
            o.team = -team;
            o.color = [10, 11, 12, 15][team - 1];
        };
        for (let i = 1; i < 5; i++) {
            room['bap' + i].forEach((loc) => {
                f(loc, i);
            });
        }
        // Return the spawning function
        let bots = [];
        return () => {
            let census = {
                crasher: 0,
                miniboss: 0,
                tank: 0,
                mothership: 0,
                sanctuary: 0
            };
            let npcs = entities.map(function npcCensus(instance) {
                if (instance.isSanctuary) {
                    census.sanctuary++;
                    return instance;
                }
                if (census[instance.type] != null) {
                    census[instance.type]++;
                    return instance;
                }
                if (instance.isMothership) {
                    census.mothership++;
                    return instance;
                }
            }).filter(e => {
                return e;
            });
            // Spawning
            spawnCrasher(census);
            spawnBosses(census);
            // Bots
            if (bots.length < c.BOTS && !global.arenaClosed) bots.push(spawnBot(global.nextTagBotTeam || null));
            // Remove dead ones
            bots = bots.filter(e => {
                return !e.isDead();
            });
            // Slowly upgrade them
            loopThrough(bots, function(o) {
                if (o.skill.level < 45) {
                    o.skill.score += 35;
                    o.skill.maintain();
                }
                if (o.upgrades.length && Math.random() > 0.5) o.upgrade(Math.floor(Math.random() * o.upgrades.length));
            });
        };
    })();
    // The big food function
    const makefood = (() => {
        class FoodType {
            constructor(groupName, types, chances, chance, isNestFood = false) {
                if (chances[0] === "scale") {
                    const scale = chances[1];
                    chances = [];
                    for (let i = types.length; i > 0; i --) {
                        chances.push(i ** scale);
                    }
                }
                this.name = groupName;
                if (types.length !== chances.length) {
                    throw new RangeError(groupName + ": error with group. Please make sure there is the same number of types as chances.");
                }
                this.types = types;
                this.chances = chances;
                this.chance = chance;
                this.isNestFood = isNestFood;
            }
            choose() {
                return this.types[ran.chooseChance(...this.chances)];
            }
        }
        const types = [
            new FoodType("Normal Food", [
                Class.egg, Class.square, Class.triangle,
                Class.pentagon, Class.bigPentagon
            ], ["scale", 4], 2000),
            new FoodType("Rare Food", [
                Class.gem, Class.greensquare, Class.greentriangle,
                Class.greenpentagon
            ], ["scale", 5], 1),
            new FoodType("Nest Food", [
                Class.pentagon, Class.bigPentagon, Class.hugePentagon, Class.greenpentagon
                /*Class.alphaHexagon, Class.alphaHeptagon, Class.alphaOctogon,
                Class.alphaNonagon, Class.alphaDecagon, Class.icosagon*/ // Commented out because stats aren't done yet.
            ], ["scale", 4], 1, true)
        ];
        function getFoodType(isNestFood = false) {
            const possible = [[], []];
            for (let i = 0; i < types.length; i ++) {
                if (types[i].isNestFood == isNestFood) {
                    possible[0].push(i);
                    possible[1].push(types[i].chance);
                }
            }
            return possible[0][ran.chooseChance(...possible[1])];
        }
        function spawnShape(location, type = 0) {
            let o = new Entity(location);
            type = types[type].choose();
            o.define(type);
            o.define({
                BODY: {
                    ACCELERATION: 0.015 / (type.FOOD.LEVEL + 1)
                }
            });
            o.facing = ran.randomAngle();
            o.team = -100;
            return o;
        };
        function spawnGroupedFood() {
            let location, i = 5;
            do {
                location = room.random();
                i --;
                if (i <= 0) {
                    return;
                }
            } while (room.isIn("nest", location));
            for (let i = 0, amount = (Math.random() * 20) | 0; i < amount; i ++) {
                const angle = Math.random() * Math.PI * 2;
                spawnShape({
                    x: location.x + Math.cos(angle) * (Math.random() * 50),
                    y: location.y + Math.sin(angle) * (Math.random() * 50)
                }, getFoodType());
            }
        }
        function spawnDistributedFood() {
            let location, i = 5;
            do {
                location = room.random();
                i --;
                if (i <= 0) {
                    return;
                }
            } while (room.isIn("nest", location));
            spawnShape(location, getFoodType());
        }
        function spawnNestFood() {
            let shape = spawnShape(room.randomType("nest"), getFoodType(true));
            shape.isNestFood = true;
        }
        return () => {
            const maxFood = Math.sqrt(c.FOOD_AMOUNT) + Math.sqrt(room.width * room.height) / c.FOOD_AMOUNT * views.length;
            const maxNestFood = maxFood * (room["nest"].length / (room.xgrid * room.ygrid)) * c.NEST_FOOD_AMOUNT;
            const census = (() => {
                let food = 0;
                let nestFood = 0;
                for (let instance of entities) {
                    if (instance.type === "food") {
                        if (instance.isNestFood) nestFood ++;
                        else food ++;
                    }
                }
                return {
                    food,
                    nestFood
                };
            })();
            if (census.food < maxFood) {
                for (let i = 0; i < maxFood - census.food; i ++) {
                    if (Math.random() > .875) {
                        if (Math.random() > .375) {
                            spawnDistributedFood();
                        } else {
                            spawnGroupedFood();
                        }
                    }
                }
            }
            if (census.nestFood < maxNestFood) {
                for (let i = 0; i < maxNestFood - census.nestFood; i ++) {
                    if (Math.random() > .75) {
                        spawnNestFood();
                    }
                }
            }
        };
    })();
    // Define food and food spawning
    return () => {
        // Do stuff
        makenpcs();
        makefood();
        // Regen health and update the grid
        loopThrough(entities, function(instance) {
            if (instance.shield.max) instance.shield.regenerate();
            if (instance.health.amount) instance.health.regenerate(instance.shield.max && instance.shield.max === instance.shield.amount);
        });
    };
})();

// Bring it to life
setInterval(gameloop, room.cycleSpeed);
setInterval(maintainloop, 1000);
setInterval(speedcheckloop, 1000);
setInterval(gamemodeLoop, 1000);