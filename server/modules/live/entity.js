/*jslint node: true */
/*jshint -W061 */
/*global goog, Map, let */
"use strict";
// General requires
require('google-closure-library');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.QuadTree');

class Gun {
    constructor(body, info) {
        this.lastShot = {
            time: 0,
            power: 0,
        };
        this.body = body;
        this.master = body.source;
        this.label = '';
        this.controllers = [];
        this.children = [];
        this.control = {
            target: new Vector(0, 0),
            goal: new Vector(0, 0),
            main: false,
            alt: false,
            fire: false,
        };
        this.color = 16;
        this.canShoot = false;
        if (info.PROPERTIES != null && info.PROPERTIES.TYPE != null) {
            this.canShoot = true;
            this.label = (info.PROPERTIES.LABEL == null) ?
                '' : info.PROPERTIES.LABEL;
            if (Array.isArray(info.PROPERTIES.TYPE)) { // This is to be nicer about our definitions
                this.bulletTypes = info.PROPERTIES.TYPE;
                this.natural = info.PROPERTIES.TYPE.BODY;
            } else {
                this.bulletTypes = [info.PROPERTIES.TYPE];
            }
            // Pre-load bullet definitions so we don't have to recalculate them every shot
            let natural = {};
            this.bulletTypes.forEach(function setNatural(type) {
                if (type.PARENT != null) { // Make sure we load from the parents first
                    for (let i = 0; i < type.PARENT.length; i++) {
                        setNatural(type.PARENT[i]);
                    }
                }
                if (type.BODY != null) { // Get values if they exist
                    for (let index in type.BODY) {
                        natural[index] = type.BODY[index];
                    }
                }
            });
            this.natural = natural; // Save it
            if (info.PROPERTIES.GUN_CONTROLLERS != null) {
                let toAdd = [];
                let self = this;
                info.PROPERTIES.GUN_CONTROLLERS.forEach(function(ioName) {
                    toAdd.push(new ioTypes[ioName](self));
                });
                this.controllers = toAdd.concat(this.controllers);
            }
            this.onShoot = (info.PROPERTIES.ON_SHOOT == null) ?
                null : info.PROPERTIES.ON_SHOOT;
            this.autofire = (info.PROPERTIES.AUTOFIRE == null) ?
                false : info.PROPERTIES.AUTOFIRE;
            this.altFire = (info.PROPERTIES.ALT_FIRE == null) ?
                false : info.PROPERTIES.ALT_FIRE;
            this.settings = (info.PROPERTIES.SHOOT_SETTINGS == null) ? [] : info.PROPERTIES.SHOOT_SETTINGS;
            this.settings2 = (info.PROPERTIES.SHOOT_SETTINGS2 == null) ? [] : info.PROPERTIES.SHOOT_SETTINGS2;
            this.settings3 = (info.PROPERTIES.SHOOT_SETTINGS3 == null) ? [] : info.PROPERTIES.SHOOT_SETTINGS3;
            this.calculator = (info.PROPERTIES.STAT_CALCULATOR == null) ?
                'default' : info.PROPERTIES.STAT_CALCULATOR;
            this.waitToCycle = (info.PROPERTIES.WAIT_TO_CYCLE == null) ?
                false : info.PROPERTIES.WAIT_TO_CYCLE;
            this.bulletStats = (info.PROPERTIES.BULLET_STATS == null || info.PROPERTIES.BULLET_STATS == 'master') ?
                'master' : new Skill(info.PROPERTIES.BULLET_STATS);
            this.settings = (info.PROPERTIES.SHOOT_SETTINGS == null) ? [] : info.PROPERTIES.SHOOT_SETTINGS;
            this.countsOwnKids = (info.PROPERTIES.MAX_CHILDREN == null) ?
                false : info.PROPERTIES.MAX_CHILDREN;
            this.syncsSkills = (info.PROPERTIES.SYNCS_SKILLS == null) ?
                false : info.PROPERTIES.SYNCS_SKILLS;
            this.negRecoil = (info.PROPERTIES.NEGATIVE_RECOIL == null) ?
                false : info.PROPERTIES.NEGATIVE_RECOIL;
            this.destroyOldestChild = info.PROPERTIES.DESTROY_OLDEST_CHILD == null ? false : info.PROPERTIES.DESTROY_OLDEST_CHILD;
            if (info.PROPERTIES.COLOR != null && info.PROPERTIES != null) {
                this.color = info.PROPERTIES.COLOR
            }
        }
        if (info.PROPERTIES != null && info.PROPERTIES.COLOR != null) this.color = info.PROPERTIES.COLOR;
        if (info.PROPERTIES != null && info.PROPERTIES.ON_SHOOT != null) this.onshoot = info.PROPERTIES.ON_SHOOT;
        let position = info.POSITION;
        this.length = position[0] / 10;
        this.width = position[1] / 10;
        this.aspect = position[2];
        let _off = new Vector(position[3], position[4]);
        this.angle = position[5] * Math.PI / 180;
        this.direction = _off.direction;
        this.offset = _off.length / 10;
        this.delay = position[6];
        this.position = 0;
        this.motion = 0;
        if (this.canShoot) {
            this.cycle = !this.waitToCycle - this.delay;
            this.trueRecoil = this.settings.recoil;
            this.recoilDir = 0;
        }
    }
    recoil() {
        if (this.motion || this.position) {
            // Simulate recoil
            this.motion -= 0.25 * this.position / roomSpeed;
            this.position += this.motion;
            if (this.position < 0) { // Bouncing off the back
                this.position = 0;
                this.motion = -this.motion;
            }
            if (this.motion > 0) {
                this.motion *= 0.75;
            }
        }
        if (this.canShoot && !this.body.settings.hasNoRecoil) {
            // Apply recoil to motion
            if (this.motion > 0) {
                let recoilForce = -this.position * this.trueRecoil * 0.045 / roomSpeed;
                this.body.accel.x += recoilForce * Math.cos(this.recoilDir);
                this.body.accel.y += recoilForce * Math.sin(this.recoilDir);
            }
        }
    }
    getSkillRaw() {
        if (this.bulletStats === 'master') {
            return [
                this.body.skill.raw[0],
                this.body.skill.raw[1],
                this.body.skill.raw[2],
                this.body.skill.raw[3],
                this.body.skill.raw[4],
                0, 0, 0, 0, 0,
            ];
        }
        return this.bulletStats.raw;
    }
    getLastShot() {
        return this.lastShot;
    }
    live() {
        // Do 
        this.recoil();
        // Dummies ignore this
        if (this.canShoot) {
            // Find the proper skillset for shooting
            let sk = (this.bulletStats === 'master') ? this.body.skill : this.bulletStats;
            // Decides what to do based on child-counting settings
            let shootPermission = (this.countsOwnKids) ?
                this.countsOwnKids > this.children.length * ((this.calculator == 'necro') ? sk.rld : 1) :
                (this.body.maxChildren) ?
                this.body.maxChildren > this.body.children.length * ((this.calculator == 'necro') ? sk.rld : 1) :
                true;
            if (this.destroyOldestChild) {
                if (!shootPermission) {
                    shootPermission = true;
                    this.destroyOldest();
                }
            }
            // Override in invuln
            if (this.body.master.invuln) {
                shootPermission = false;
            }
            // Cycle up if we should
            if (shootPermission || !this.waitToCycle) {
                if (this.cycle < 1) {
                    this.cycle += 1 / this.settings.reload / roomSpeed / ((this.calculator == 'necro' || this.calculator == 'fixed reload') ? 1 : sk.rld);
                }
            }
            // Firing routines
            if (shootPermission && (this.autofire || ((this.altFire) ? this.body.control.alt : this.body.control.fire))) {
                if (this.cycle >= 1) {
                    // Find the end of the gun barrel
                    let gx =
                        this.offset * Math.cos(this.direction + this.angle + this.body.facing) +
                        (1.5 * this.length - this.width * this.settings.size / 2) * Math.cos(this.angle + this.body.facing);
                    let gy =
                        this.offset * Math.sin(this.direction + this.angle + this.body.facing) +
                        (1.5 * this.length - this.width * this.settings.size / 2) * Math.sin(this.angle + this.body.facing);
                    // Shoot, multiple times in a tick if needed
                    while (shootPermission && this.cycle >= 1) {
                        this.fire(gx, gy, sk);
                        // Figure out if we may still shoot
                        shootPermission = (this.countsOwnKids) ?
                            this.countsOwnKids > this.children.length :
                            (this.body.maxChildren) ?
                            this.body.maxChildren > this.body.children.length :
                            true;
                        // Cycle down
                        this.cycle -= 1;
                    }
                } // If we're not shooting, only cycle up to where we'll have the proper firing delay
            } else if (this.cycle > !this.waitToCycle - this.delay) {
                this.cycle = !this.waitToCycle - this.delay;
            }
        }
    }
    destroyOldest() {
        /*let oldest = this.children.length - this.countsOwnKids;
        for (let i = oldest - 1; i < oldest; i++) {
          let o = this.children[i];
          if (o) o.kill();
        }*/
        let child = this.children.map(entry => entry).filter(instance => !!instance).sort((a, b) => a.creationTime - b.creationTime)[0];
        if (child) child.kill();
    }
    syncChildren() {
        if (this.syncsSkills) {
            let self = this;
            for (let i = 0; i < this.children.length; i++) {
                let child = this.children[i];
                child.define({
                    BODY: self.interpret(),
                    SKILL: self.getSkillRaw()
                });
                child.refreshBodyAttributes();
            }
        }
    }
    fire(gx, gy, sk) {
        // Recoil
        this.lastShot.time = util.time();
        this.lastShot.power = 3 * Math.log(Math.sqrt(sk.spd) + this.trueRecoil + 1) + 1;
        this.motion += this.lastShot.power;
        // Find inaccuracy
        let ss, sd;
        do {
            ss = ran.gauss(0, Math.sqrt(this.settings.shudder));
        } while (Math.abs(ss) >= this.settings.shudder * 2);
        do {
            sd = ran.gauss(0, this.settings.spray * this.settings.shudder);
        } while (Math.abs(sd) >= this.settings.spray / 2);
        sd *= Math.PI / 180;
        // Find speed
        let s = new Vector(
            ((this.negRecoil) ? -1 : 1) * this.settings.speed * c.runSpeed * sk.spd * (1 + ss) * Math.cos(this.angle + this.body.facing + sd),
            ((this.negRecoil) ? -1 : 1) * this.settings.speed * c.runSpeed * sk.spd * (1 + ss) * Math.sin(this.angle + this.body.facing + sd)
        );
        // Boost it if we shouldw
        if (this.body.velocity.length) {
            let extraBoost =
                Math.max(0, s.x * this.body.velocity.x + s.y * this.body.velocity.y) / this.body.velocity.length / s.length;
            if (extraBoost) {
                let len = s.length;
                s.x += this.body.velocity.length * extraBoost * s.x / len;
                s.y += this.body.velocity.length * extraBoost * s.y / len;
            }
        }
        // Create the bullet
        var o = new Entity({
            x: this.body.x + this.body.size * gx - s.x,
            y: this.body.y + this.body.size * gy - s.y,
        }, this.master.master);
        /*let jumpAhead = this.cycle - 1;
        if (jumpAhead) {
            o.x += s.x * this.cycle / jumpAhead;
            o.y += s.y * this.cycle / jumpAhead;
        }*/
        o.velocity = s;
        this.bulletInit(o);
        o.coreSize = o.SIZE;
    }
    bulletInit(o) {
        // Define it by its natural properties
        this.bulletTypes.forEach(type => o.define(type));
        // Pass the gun attributes
        o.define({
            BODY: this.interpret(),
            SKILL: this.getSkillRaw(),
            SIZE: this.body.size * this.width * this.settings.size / 2,
            LABEL: this.master.label + ((this.label) ? ' ' + this.label : '') + ' ' + o.label,
        });
        o.color = this.body.master.color;
        // Keep track of it and give it the function it needs to deutil.log itself upon death
        if (this.countsOwnKids) {
            o.parent = this;
            this.children.push(o);
        } else if (this.body.maxChildren) {
            o.parent = this.body;
            this.body.children.push(o);
            this.children.push(o);
        }
        o.source = this.body;
        o.facing = o.velocity.direction;
        // Necromancers.
        let oo = o;
        o.necro = host => {
            let shootPermission = (this.countsOwnKids) ?
                this.countsOwnKids > this.children.length *
                ((this.bulletStats === 'master') ? this.body.skill.rld : this.bulletStats.rld) :
                (this.body.maxChildren) ?
                this.body.maxChildren > this.body.children.length *
                ((this.bulletStats === 'master') ? this.body.skill.rld : this.bulletStats.rld) :
                true;
            if (shootPermission) {
                let save = {
                    facing: host.facing,
                    size: host.SIZE,
                };
                host.define(Class.genericEntity);
                this.bulletInit(host);
                host.team = oo.master.master.team;
                host.master = oo.master;
                host.color = oo.color;
                host.facing = save.facing;
                host.SIZE = save.size;
                host.health.amount = host.health.max;
                return true;
            }
            return false;
        };
        // Otherwise
        o.refreshBodyAttributes();
        o.life();
        this.onShootFunction();
        this.recoilDir = this.body.facing + this.angle;
    }
    onShootFunction() {
        switch (this.onShoot) {
            case "hitScan":
            case "hitScan1":
            case "hitScan2":
            case "hitScan3": {
                if (this.body.master.health.amount < 0) break;
                let save = {
                    x: this.body.master.x,
                    y: this.body.master.y,
                    angle: this.body.master.facing + this.angle
                };
                let s = this.body.size * this.width * this.settings2.size;
                let target = {
                    x: save.x + this.body.master.control.target.x,
                    y: save.y + this.body.master.control.target.y
                };
                let amount = util.getDistance(target, save) / s | 0;
                let explode = e => {
                    e.onDead = () => {
                        let o = new Entity(e, this.body);
                        o.accel = {
                            x: 3 * Math.cos(save.angle),
                            y: 3 * Math.sin(save.angle)
                        };
                        o.color = this.body.master.color;
                        o.define(Class.hitScanExplosion);
                        // Pass the gun attributes
                        o.define({
                            BODY: this.interpret(this.settings3),
                            SKILL: this.getSkillRaw(),
                            SIZE: (this.body.size * this.width * this.settings3.size) / 2,
                            LABEL: this.master.label + (this.label ? " " + this.label : "") + " " + o.label
                        });
                        o.refreshBodyAttributes();
                        o.life();
                        o.source = this.body;
                    }
                };
                let branchAlt = 0;
                let branchLength = 0;
                let branch = (e, a, b = false, g = 0, z = amount) => {
                    if (!b) branchAlt++;
                    let total = (z / 5 | 0) || 2;
                    let dir = (a ? Math.PI / 2 : -Math.PI / 2) + g;
                    for (let i = 0; i < total; i++) setTimeout(() => {
                        let ss = s * 1.5;
                        let x = e.x + (ss * Math.cos(save.angle + dir)) * i;
                        let y = e.y + (ss * Math.sin(save.angle + dir)) * i;
                        let o = new Entity({
                            x,
                            y
                        }, this.body);
                        o.facing = Math.atan2(target.y - y, target.x - x) + dir;
                        o.color = this.body.master.color;
                        o.define(Class.hitScanBullet);
                        // Pass the gun attributes
                        o.define({
                            BODY: this.interpret(this.settings3),
                            SKILL: this.getSkillRaw(),
                            SIZE: (this.body.size * this.width * this.settings2.size) / 2,
                            LABEL: this.master.label + (this.label ? " " + this.label : "") + " " + o.label
                        });
                        o.refreshBodyAttributes();
                        o.life();
                        o.source = this.body;
                        if (i === total - 1) {
                            if (branchLength < 3) {
                                branchLength++;
                                branch(o, a, true, dir + g, total);
                            } else branchLength = 0;
                        }
                    }, (500 / amount) * i);
                };
                const hitScanLevel = +this.onShoot.split("hitScan").pop();
                for (let i = 0; i < amount; i++) {
                    setTimeout(() => {
                        if (this.body.master.health.amount < 0) return;
                        let x = save.x + (s * Math.cos(save.angle)) * i;
                        let y = save.y + (s * Math.sin(save.angle)) * i;
                        let e = new Entity({
                            x: x,
                            y: y
                        }, this.body);
                        e.facing = Math.atan2(target.y - y, target.x - x);
                        e.color = this.body.master.color;
                        e.define(Class.hitScanBullet);
                        // Pass the gun attributes
                        e.define({
                            BODY: this.interpret(this.settings2),
                            SKILL: this.getSkillRaw(),
                            SIZE: (this.body.size * this.width * this.settings2.size) / 2,
                            LABEL: this.master.label + (this.label ? " " + this.label : "") + " " + e.label
                        });
                        e.refreshBodyAttributes();
                        e.life();
                        e.source = this.body;
                        switch (hitScanLevel) {
                            case 1: {
                                if (i % 5 === 0)
                                    branch(e, branchAlt % 2 === 0);
                            }
                            break;
                        case 2: { // Superlaser
                            if (i === amount - 1)
                                explode(e);
                        }
                        break;
                        case 3: { // Death Star
                            if (i % 3 === 0)
                                explode(e);
                        }
                        break;
                        }
                    }, 10 * i);
                }
            }
            break;
        }
    }
    getTracking() {
        return {
            speed: c.runSpeed * ((this.bulletStats == 'master') ? this.body.skill.spd : this.bulletStats.spd) *
                this.settings.maxSpeed *
                this.natural.SPEED,
            range: Math.sqrt((this.bulletStats == 'master') ? this.body.skill.spd : this.bulletStats.spd) *
                this.settings.range *
                this.natural.RANGE,
        };
    }
    interpret(alt = false) {
        let sizeFactor = this.master.size / this.master.SIZE;
        let shoot = alt ? alt : this.settings;
        let sk = (this.bulletStats == 'master') ? this.body.skill : this.bulletStats;
        // Defaults
        let out = {
            SPEED: shoot.maxSpeed * sk.spd,
            HEALTH: shoot.health * sk.str,
            RESIST: shoot.resist + sk.rst,
            DAMAGE: shoot.damage * sk.dam,
            PENETRATION: Math.max(1, shoot.pen * sk.pen),
            RANGE: shoot.range / Math.sqrt(sk.spd),
            DENSITY: shoot.density * sk.pen * sk.pen / sizeFactor,
            PUSHABILITY: 1 / sk.pen,
            HETERO: 3 - 2.8 * sk.ghost,
        };
        // Special cases
        switch (this.calculator) {
            case 'thruster':
                this.trueRecoil = shoot.recoil * Math.sqrt(sk.rld * sk.spd);
                break;
            case 'sustained':
                out.RANGE = shoot.range;
                break;
            case 'swarm':
                out.PENETRATION = Math.max(1, shoot.pen * (0.5 * (sk.pen - 1) + 1));
                out.HEALTH /= shoot.pen * sk.pen;
                break;
            case 'trap':
            case 'block':
                out.PUSHABILITY = 1 / Math.pow(sk.pen, 0.5);
                out.RANGE = shoot.range;
                break;
            case 'necro':
            case 'drone':
                out.PUSHABILITY = 1;
                out.PENETRATION = Math.max(1, shoot.pen * (0.5 * (sk.pen - 1) + 1));
                out.HEALTH = (shoot.health * sk.str + sizeFactor) / Math.pow(sk.pen, 0.8);
                out.DAMAGE = shoot.damage * sk.dam * Math.sqrt(sizeFactor) * shoot.pen * sk.pen;
                out.RANGE = shoot.range * Math.sqrt(sizeFactor);
                break;
        }
        // Go through and make sure we respect its natural properties
        for (let property in out) {
            if (this.natural[property] == null || !out.hasOwnProperty(property)) continue;
            out[property] *= this.natural[property];
        }
        return out;
    }
}
let entitiesIdLog = 0;
class Entity {
    constructor(position, master = this) {
        this.isGhost = false;
        this.killCount = {
            solo: 0,
            assists: 0,
            bosses: 0,
            killers: [],
        };
        this.creationTime = (new Date()).getTime();
        // Inheritance
        this.master = master;
        this.source = this;
        this.parent = this;
        this.control = {
            target: new Vector(0, 0),
            goal: new Vector(0, 0),
            main: false,
            alt: false,
            fire: false,
            power: 0,
        };
        this.isInGrid = false;
        this.removeFromGrid = () => {
            if (this.isInGrid) {
                grid.removeObject(this);
                this.isInGrid = false;
            }
        };
        this.addToGrid = () => {
            if (!mockupsLoaded) return;
            if (!this.isInGrid && this.bond == null) {
                grid.addObject(this);
                this.isInGrid = true;
            }
        };
        this.activation = (() => {
            let active = true;
            let timer = ran.irandom(15);
            return {
                update: () => {
                    if (this.isDead()) {
                        return 0;
                    }
                    if (!active) {
                        this.removeFromGrid();
                        if (this.settings.diesAtRange) {
                            this.kill();
                        }
                        if (!(timer--)) {
                            active = true;
                        }
                    } else {
                        this.addToGrid();
                        timer = 15;
                        active = views.some(v => v.check(this, 0.6)) || this.alwaysActive || this.isPlayer || this.isBot;
                    }
                },
                check: () => {
                    return active;
                }
            };
        })();
        this.autoOverride = false;
        this.controllers = [];
        this.blend = {
            color: '#FFFFFF',
            amount: 0,
        };
        // Objects
        this.skill = new Skill();
        this.health = new HealthType(1, 'static', 0);
        this.shield = new HealthType(0, 'dynamic');
        this.guns = [];
        this.turrets = [];
        this.upgrades = [];
        this.settings = {};
        this.aiSettings = {};
        this.children = [];
        // Define it
        this.SIZE = 1;
        this.define(Class.genericEntity);
        // Initalize physics and collision
        this.maxSpeed = 0;
        this.facing = 0;
        this.vfacing = 0;
        this.range = 0;
        this.damageRecieved = 0;
        this.stepRemaining = 1;
        this.x = position.x;
        this.y = position.y;
        this.velocity = new Vector(0, 0);
        this.accel = new Vector(0, 0);
        this.damp = 0.05;
        this.collisionArray = [];
        this.invuln = false;
        this.alpha = 1;
        this.invisible = [0, 0];
        this.antiNaN = (function(me) {
            let nansInARow = 0;
            let data = {
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                ax: 0,
                ay: 0
            };

            function update(my) {
                data.x = my.x;
                data.y = my.y;
                data.vx = my.velocity.x;
                data.vy = my.velocity.y;
                data.ax = my.accel.x;
                data.ay = my.accel.y;
            };

            function set() {
                me.x = data.x;
                me.y = data.y;
                me.velocity.x = data.vx;
                me.velocity.y = data.vy;
                me.accel.x = data.ax;
                me.accel.y = data.ay;
                me.velocity.update();
                me.accel.update();
            };

            function check() {
                let amNaN = () => [
                    isNaN(me.x),
                    isNaN(me.y),
                    isNaN(me.velocity.x),
                    isNaN(me.velocity.y),
                    isNaN(me.accel.x),
                    isNaN(me.accel.x),
                ].map(entry => !!entry).some(entry => entry);
                if (amNaN()) {
                    nansInARow++;
                    if (nansInARow > 50) {
                        console.log("NaN instance found. (Repeated)");
                        console.log("Debug:", [
                            isNaN(me.x),
                            isNaN(me.y),
                            isNaN(me.velocity.x),
                            isNaN(me.velocity.y),
                            isNaN(me.accel.x),
                            isNaN(me.accel.y)
                        ].map(entry => !!entry));
                    }
                    set();
                    if (amNaN()) console.log("NaN instance is still NaN.");
                } else {
                    update(me);
                    if (nansInARow > 0) nansInARow--;
                }
            };
            return check;
        })(this);
        // Get a new unique id
        this.id = entitiesIdLog++;
        this.team = this.id;
        this.team = master.team;
        this.turnAngle = 0;
        // This is for collisions
        this.updateAABB = () => {};
        this.getAABB = (() => {
            let data = {},
                savedSize = 0;
            let getLongestEdge = (x1, y1, x2, y2) => {
                return Math.max(
                    Math.abs(x2 - x1),
                    Math.abs(y2 - y1)
                );
            };
            this.updateAABB = active => {
                if (this.bond != null) return 0;
                if (!active) {
                    data.active = false;
                    return 0;
                }
                if (this.isPlayer && !this.isDead()) this.refreshBodyAttributes();
                this.antiNaN();
                // Get bounds
                let x1 = Math.min(this.x, this.x + this.velocity.x + this.accel.x) - this.realSize - 5;
                let y1 = Math.min(this.y, this.y + this.velocity.y + this.accel.y) - this.realSize - 5;
                let x2 = Math.max(this.x, this.x + this.velocity.x + this.accel.x) + this.realSize + 5;
                let y2 = Math.max(this.y, this.y + this.velocity.y + this.accel.y) + this.realSize + 5;
                // Size check
                let size = getLongestEdge(x1, y1, x2, y1);
                let sizeDiff = savedSize / size;
                // Update data
                data = {
                    min: [x1, y1],
                    max: [x2, y2],
                    active: true,
                    size: size,
                };
                // Update grid if needed
                if (sizeDiff > Math.SQRT2 || sizeDiff < Math.SQRT1_2) {
                    this.removeFromGrid();
                    this.addToGrid();
                    savedSize = data.size;
                }
            };
            return () => {
                return data;
            };
        })();
        this.updateAABB(true);
        entities.push(this); // everything else
        views.forEach(v => v.add(this));
        this.activation.update(); 
    }
    life() {
        bringToLife(this);
    }
    addController(newIO) {
        if (Array.isArray(newIO)) {
            this.controllers = newIO.concat(this.controllers);
        } else {
            this.controllers.unshift(newIO);
        }
    }
    become(player, dom = false) {
        this.addController(dom ? new ioTypes.listenToPlayerStatic(this, player) : new ioTypes.listenToPlayer(this, player));
        this.sendMessage = (content, color) => player.socket.talk("m", content);
        this.kick = (reason) => player.socket.kick(reason);
    }
    giveUp(player, name = "Mothership") {
        if (!player.body.isMothership) player.body.controllers = [new ioTypes.nearestDifferentMaster(player.body), new ioTypes.spinWhenIdle(player.body)];
        else if (player.body.isMothership) player.body.controllers = [new ioTypes.nearestDifferentMaster(player.body), new ioTypes.botMovement(player.body), new ioTypes.mapTargetToGoal(player.body)];
        player.body.name = player.body.label;
        player.body.underControl = false;
        player.body.sendMessage = content => {};
        let fakeBody = new Entity({
            x: player.body.x,
            y: player.body.y
        });
        fakeBody.passive = true;
        fakeBody.underControl = true;
        player.body = fakeBody;
        player.body.kill();
    }
    define(set) {
        if (set.PARENT != null) {
            for (let i = 0; i < set.PARENT.length; i++) {
                this.define(set.PARENT[i]);
            }
        }
        if (set.LAYER != null) this.layerID = set.LAYER;
        if (set.index != null) {
            this.index = set.index;
        }
        if (set.NAME != null) {
            this.name = set.NAME;
        }
        if (set.LABEL != null) {
            this.label = set.LABEL;
        }
        if (set.TYPE != null) {
            this.type = set.TYPE;
        }
        if (set.SHAPE != null) {
            this.shape = typeof set.SHAPE === 'number' ? set.SHAPE : 0
            this.shapeData = set.SHAPE;
        }
        if (set.COLOR != null) {
            this.color = set.COLOR;
        }
        if (set.CONTROLLERS != null) {
            let toAdd = [];
            set.CONTROLLERS.forEach((ioName) => {
                toAdd.push(new ioTypes[ioName](this));
            });
            this.addController(toAdd);
        }
        if (set.MOTION_TYPE != null) {
            this.motionType = set.MOTION_TYPE;
        }
        if (set.FACING_TYPE != null) {
            this.facingType = set.FACING_TYPE;
        }
        if (set.DRAW_HEALTH != null) {
            this.settings.drawHealth = set.DRAW_HEALTH;
        }
        if (set.DRAW_SELF != null) {
            this.settings.drawShape = set.DRAW_SELF;
        }
        if (set.DAMAGE_EFFECTS != null) {
            this.settings.damageEffects = set.DAMAGE_EFFECTS;
        }
        if (set.RATIO_EFFECTS != null) {
            this.settings.ratioEffects = set.RATIO_EFFECTS;
        }
        if (set.MOTION_EFFECTS != null) {
            this.settings.motionEffects = set.MOTION_EFFECTS;
        }
        if (set.ACCEPTS_SCORE != null) {
            this.settings.acceptsScore = set.ACCEPTS_SCORE;
        }
        if (set.GIVE_KILL_MESSAGE != null) {
            this.settings.givesKillMessage = set.GIVE_KILL_MESSAGE;
        }
        if (set.CAN_GO_OUTSIDE_ROOM != null) {
            this.settings.canGoOutsideRoom = set.CAN_GO_OUTSIDE_ROOM;
        }
        if (set.HITS_OWN_TYPE != null) {
            this.settings.hitsOwnType = set.HITS_OWN_TYPE;
        }
        if (set.DIE_AT_LOW_SPEED != null) {
            this.settings.diesAtLowSpeed = set.DIE_AT_LOW_SPEED;
        }
        if (set.DIE_AT_RANGE != null) {
            this.settings.diesAtRange = set.DIE_AT_RANGE;
        }
        if (set.INDEPENDENT != null) {
            this.settings.independent = set.INDEPENDENT;
        }
        if (set.PERSISTS_AFTER_DEATH != null) {
            this.settings.persistsAfterDeath = set.PERSISTS_AFTER_DEATH;
        }
        if (set.CLEAR_ON_MASTER_UPGRADE != null) {
            this.settings.clearOnMasterUpgrade = set.CLEAR_ON_MASTER_UPGRADE;
        }
        if (set.HEALTH_WITH_LEVEL != null) {
            this.settings.healthWithLevel = set.HEALTH_WITH_LEVEL;
        }
        if (set.ACCEPTS_SCORE != null) {
            this.settings.acceptsScore = set.ACCEPTS_SCORE;
        }
        if (set.OBSTACLE != null) {
            this.settings.obstacle = set.OBSTACLE;
        }
        if (set.NECRO != null) {
            this.settings.isNecromancer = set.NECRO;
        }
        if (set.AUTO_UPGRADE != null) {
            this.settings.upgrading = set.AUTO_UPGRADE;
        }
        if (set.HAS_NO_RECOIL != null) {
            this.settings.hasNoRecoil = set.HAS_NO_RECOIL;
        }
        if (set.CRAVES_ATTENTION != null) {
            this.settings.attentionCraver = set.CRAVES_ATTENTION;
        }
        if (set.BROADCAST_MESSAGE != null) {
            this.settings.broadcastMessage = (set.BROADCAST_MESSAGE === '') ? undefined : set.BROADCAST_MESSAGE;
        }
        if (set.DEFEAT_MESSAGE) this.settings.defeatMessage = true;
        if (set.DAMAGE_CLASS != null) {
            this.settings.damageClass = set.DAMAGE_CLASS;
        }
        if (set.BUFF_VS_FOOD != null) {
            this.settings.buffVsFood = set.BUFF_VS_FOOD;
        }
        if (set.CAN_BE_ON_LEADERBOARD != null) {
            this.settings.leaderboardable = set.CAN_BE_ON_LEADERBOARD;
        }
        if (set.INTANGIBLE != null) {
            this.intangibility = set.INTANGIBLE;
        }
        if (set.IS_SMASHER != null) {
            this.settings.reloadToAcceleration = set.IS_SMASHER;
        }
        if (set.STAT_NAMES != null) {
            this.settings.skillNames = set.STAT_NAMES;
        }
        if (set.AI != null) {
            this.aiSettings = set.AI;
        }
        if (set.ALPHA != null) {
            this.alpha = set.ALPHA;
        }
        if (set.INVISIBLE != null) {
            this.invisible = set.INVISIBLE;
        }
        if (set.DANGER != null) {
            this.dangerValue = set.DANGER;
        }
        if (set.VARIES_IN_SIZE != null) {
            this.settings.variesInSize = set.VARIES_IN_SIZE;
            this.squiggle = (this.settings.variesInSize) ? ran.randomRange(0.8, 1.2) : 1;
        }
        if (set.RESET_UPGRADES) {
            this.upgrades = [];
        }
        if (set.UPGRADES_TIER_1 != null) {
            set.UPGRADES_TIER_1.forEach((e) => {
                this.upgrades.push({
                    class: e,
                    level: c.TIER_1,
                    index: e.index,
                    tier: 1
                });
            });
        }
        if (set.UPGRADES_TIER_2 != null) {
            set.UPGRADES_TIER_2.forEach((e) => {
                this.upgrades.push({
                    class: e,
                    level: c.TIER_2,
                    index: e.index,
                    tier: 2
                });
            });
        }
        if (set.UPGRADES_TIER_3 != null) {
            set.UPGRADES_TIER_3.forEach((e) => {
                this.upgrades.push({
                    class: e,
                    level: c.TIER_3,
                    index: e.index,
                    tier: 3
                });
            });
        }
        if (set.SIZE != null) {
            this.SIZE = set.SIZE * this.squiggle;
            if (this.coreSize == null) {
                this.coreSize = this.SIZE;
            }
        }
        if (set.SKILL != null && set.SKILL != []) {
            if (set.SKILL.length != 10) {
                throw ('Inappropiate skill raws.');
            }
            this.skill.set(set.SKILL);
        }
        if (set.LEVEL != null) {
            if (set.LEVEL === -1) {
                this.skill.reset();
            }
            while (this.skill.level < c.SKILL_CHEAT_CAP && this.skill.level < set.LEVEL) {
                this.skill.score += this.skill.levelScore;
                this.skill.maintain();
            }
            this.refreshBodyAttributes();
        }
        if (set.SKILL_CAP != null && set.SKILL_CAP != []) {
            if (set.SKILL_CAP.length != 10) {
                throw ('Inappropiate skill caps.');
            }
            this.skill.setCaps(set.SKILL_CAP);
        }
        if (set.VALUE != null) {
            this.skill.score = Math.max(this.skill.score, set.VALUE * this.squiggle);
        }
        if (set.ALT_ABILITIES != null) {
            this.abilities = set.ALT_ABILITIES;
        }
        if (set.GUNS != null) {
            let newGuns = [];
            set.GUNS.forEach((gundef) => {
                newGuns.push(new Gun(this, gundef));
            });
            this.guns = newGuns;
        }
        if (set.MAX_CHILDREN != null) {
            this.maxChildren = set.MAX_CHILDREN;
        }
        if (set.FOOD != null) {
            if (set.FOOD.LEVEL != null) {
                this.foodLevel = set.FOOD.LEVEL;
                this.foodCountup = 0;
            }
        }
        if (set.BODY != null) {
            if (set.BODY.ACCELERATION != null) {
                this.ACCELERATION = set.BODY.ACCELERATION;
            }
            if (set.BODY.SPEED != null) {
                this.SPEED = set.BODY.SPEED;
            }
            if (set.BODY.HEALTH != null) {
                this.HEALTH = set.BODY.HEALTH;
            }
            if (set.BODY.RESIST != null) {
                this.RESIST = set.BODY.RESIST;
            }
            if (set.BODY.SHIELD != null) {
                this.SHIELD = set.BODY.SHIELD;
            }
            if (set.BODY.REGEN != null) {
                this.REGEN = set.BODY.REGEN;
            }
            if (set.BODY.DAMAGE != null) {
                this.DAMAGE = set.BODY.DAMAGE;
            }
            if (set.BODY.PENETRATION != null) {
                this.PENETRATION = set.BODY.PENETRATION;
            }
            if (set.BODY.FOV != null) {
                this.FOV = set.BODY.FOV;
            }
            if (set.BODY.RANGE != null) {
                this.RANGE = set.BODY.RANGE;
            }
            if (set.BODY.SHOCK_ABSORB != null) {
                this.SHOCK_ABSORB = set.BODY.SHOCK_ABSORB;
            }
            if (set.BODY.DENSITY != null) {
                this.DENSITY = set.BODY.DENSITY;
            }
            if (set.BODY.STEALTH != null) {
                this.STEALTH = set.BODY.STEALTH;
            }
            if (set.BODY.PUSHABILITY != null) {
                this.PUSHABILITY = set.BODY.PUSHABILITY;
            }
            if (set.BODY.HETERO != null) {
                this.heteroMultiplier = set.BODY.HETERO;
            }
            this.refreshBodyAttributes();
        }
        if (set.SPAWN_ON_DEATH) this.spawnOnDeath = set.SPAWN_ON_DEATH;
        if (set.TURRETS != null) {
            let o;
            this.turrets.forEach(o => o.destroy());
            this.turrets = [];
            set.TURRETS.forEach(def => {
                o = new Entity(this, this.master);
                let turretDanger = false;
                ((Array.isArray(def.TYPE)) ? def.TYPE : [def.TYPE]).forEach(type => {
                    o.define(type);
                    if (type.TURRET_DANGER) turretDanger = true;
                });
                if (!turretDanger) o.define({
                    DANGER: 0
                });
                o.bindToMaster(def.POSITION, this);
            });
        }
        if (set.mockup != null) {
            this.mockup = set.mockup;
        }
    }
    refreshBodyAttributes() {
        let speedReduce = Math.pow(this.size / (this.coreSize || this.SIZE), 1);
        this.acceleration = c.runSpeed * this.ACCELERATION / speedReduce;
        if (this.settings.reloadToAcceleration) this.acceleration *= this.skill.acl;
        this.topSpeed = c.runSpeed * this.SPEED * this.skill.mob / speedReduce;
        if (this.settings.reloadToAcceleration) this.topSpeed /= Math.sqrt(this.skill.acl);
        this.health.set(
            (((this.settings.healthWithLevel) ? 2 * this.skill.level : 0) + this.HEALTH) * this.skill.hlt
        );
        this.health.resist = 1 - 1 / Math.max(1, this.RESIST + this.skill.brst);
        this.shield.set(
            (((this.settings.healthWithLevel) ? 0.6 * this.skill.level : 0) + this.SHIELD) * this.skill.shi,
            Math.max(0, ((((this.settings.healthWithLevel) ? 0.006 * this.skill.level : 0) + 1) * this.REGEN) * this.skill.rgn)
        );
        this.damage = this.DAMAGE * this.skill.atk;
        this.penetration = this.PENETRATION + 1.5 * (this.skill.brst + 0.8 * (this.skill.atk - 1));
        if (!this.settings.dieAtRange || !this.range) {
            this.range = this.RANGE;
        }
        this.fov = this.FOV * 250 * Math.sqrt(this.size) * (1 + 0.003 * this.skill.level);
        this.density = (1 + 0.08 * this.skill.level) * this.DENSITY;
        this.stealth = this.STEALTH;
        this.pushability = this.PUSHABILITY;
    }
    bindToMaster(position, bond) {
        this.bond = bond;
        this.source = bond;
        this.bond.turrets.push(this);
        this.skill = this.bond.skill;
        this.label = this.bond.label + ' ' + this.label;
        // It will not be in collision calculations any more nor shall it be seen.
        this.removeFromGrid();
        this.settings.drawShape = false;
        // Get my position.
        this.bound = {};
        this.bound.size = position[0] / 20;
        let _off = new Vector(position[1], position[2]);
        this.bound.angle = position[3] * Math.PI / 180;
        this.bound.direction = _off.direction;
        this.bound.offset = _off.length / 10;
        this.bound.arc = position[4] * Math.PI / 180;
        // Figure out how we'll be drawn.
        this.bound.layer = position[5];
        // Initalize.
        this.facing = this.bond.facing + this.bound.angle;
        this.facingType = 'bound';
        this.motionType = 'bound';
        this.move();
    }
    get size() {
        if (this.bond == null) return (this.coreSize || this.SIZE) * (1 + this.skill.level / 45);
        return this.bond.size * this.bound.size;
    }
    get mass() {
        return this.density * (this.size * this.size + 1);
    }
    get realSize() {
        return this.size * ((Math.abs(this.shape) > lazyRealSizes.length) ? 1 : lazyRealSizes[Math.abs(this.shape)]);
    }
    get m_x() {
        return (this.velocity.x + this.accel.x) / roomSpeed;
    }
    get m_y() {
        return (this.velocity.y + this.accel.y) / roomSpeed;
    }
    camera(tur = false) {
        return {
            type: 0 + tur * 0x01 + this.settings.drawHealth * 0x02 + (this.type === 'tank') * 0x04,
            id: this.id,
            index: this.index,
            x: this.x,
            y: this.y,
            vx: this.velocity.x,
            vy: this.velocity.y,
            size: this.size,
            rsize: this.realSize,
            status: 1,
            health: this.health.display(),
            shield: this.shield.display(),
            alpha: this.alpha,
            facing: this.facing,
            vfacing: this.vfacing,
            twiggle: this.facingType === 'autospin' || (this.facingType === 'locksFacing' && this.control.alt),
            layer: this.layerID ? this.layerID : (this.bond != null) ? this.bound.layer : (this.type === 'wall') ? 11 : (this.type === 'food') ? 10 : (this.type === 'tank') ? 5 : (this.type === 'crasher') ? 1 : 0,
            color: this.color,
            name: (this.nameColor || "#FFFFFF") + this.name,
            score: this.skill.score,
            guns: this.guns.map(gun => gun.getLastShot()),
            turrets: this.turrets.map(turret => turret.camera(true)),
        };
    }
    skillUp(stat) {
        let suc = this.skill.upgrade(stat);
        if (suc) {
            this.refreshBodyAttributes();
            for (let i = 0; i < this.guns.length; i++) this.guns[i].syncChildren();
        }
        return suc;
    }
    upgrade(number) {
        if (number < this.upgrades.length && this.skill.level >= this.upgrades[number].level) {
            let saveMe = this.upgrades[number].class;
            this.upgrades = [];
            this.define(saveMe);
            this.sendMessage('You have upgraded to ' + this.label + '.');
            for (let instance of entities) {
                if (instance.settings.clearOnMasterUpgrade && instance.master.id === this.id) {
                    instance.kill();
                }
            }
            this.skill.update();
            this.refreshBodyAttributes();
        }
    }
    damageMultiplier() {
        switch (this.type) {
            case 'swarm':
                return 0.25 + 1.5 * util.clamp(this.range / (this.RANGE + 1), 0, 1);
            default:
                return 1;
        }
    }
    move() {
        let g = {
                x: this.control.goal.x - this.x,
                y: this.control.goal.y - this.y,
            },
            gactive = (g.x !== 0 || g.y !== 0),
            engine = {
                x: 0,
                y: 0,
            },
            a = this.acceleration / roomSpeed;
        if (c.SPACE_PHYSICS) {
            this.maxSpeed = this.topSpeed;
            this.damp = 100;
        }
        switch (this.motionType) {
            case "grow":
                this.SIZE += 5;
                break;
            case 'glide':
                this.maxSpeed = this.topSpeed;
                this.damp = 0.05;
                break;
            case 'motor':
                this.maxSpeed = 0;
                if (this.topSpeed) {
                    this.damp = a / this.topSpeed;
                }
                if (gactive) {
                    let len = Math.sqrt(g.x * g.x + g.y * g.y);
                    engine = {
                        x: a * g.x / len,
                        y: a * g.y / len,
                    };
                }
                break;
            case "spgw":
                this.SIZE += 0.75;
                this.maxSpeed = this.topSpeed;
                this.damp = -0.025;
                break;
            case "chonk":
                this.SIZE += 50;
                this.maxSpeed = this.topSpeed;
                this.damp = -0.025;
                break;
            case 'swarm':
                this.maxSpeed = this.topSpeed;
                let l = util.getDistance({
                    x: 0,
                    y: 0,
                }, g) + 1;
                if (gactive && l > this.size) {
                    let desiredxspeed = this.topSpeed * g.x / l,
                        desiredyspeed = this.topSpeed * g.y / l,
                        turning = Math.sqrt((this.topSpeed * Math.max(1, this.range) + 1) / a);
                    engine = {
                        x: (desiredxspeed - this.velocity.x) / Math.max(5, turning),
                        y: (desiredyspeed - this.velocity.y) / Math.max(5, turning),
                    };
                } else {
                    if (this.velocity.length < this.topSpeed) {
                        engine = {
                            x: this.velocity.x * a / 20,
                            y: this.velocity.y * a / 20,
                        };
                    }
                }
                break;
            case 'chase':
                if (gactive) {
                    let l = util.getDistance({
                        x: 0,
                        y: 0,
                    }, g);
                    if (l > this.size * 2) {
                        this.maxSpeed = this.topSpeed;
                        let desiredxspeed = this.topSpeed * g.x / l,
                            desiredyspeed = this.topSpeed * g.y / l;
                        engine = {
                            x: (desiredxspeed - this.velocity.x) * a,
                            y: (desiredyspeed - this.velocity.y) * a,
                        };
                    } else {
                        this.maxSpeed = 0;
                    }
                } else {
                    this.maxSpeed = 0;
                }
                break;
            case 'drift':
                this.maxSpeed = 0;
                engine = {
                    x: g.x * a,
                    y: g.y * a,
                };
                break;
            case 'bound':
                let bound = this.bound,
                    ref = this.bond;
                this.x = ref.x + ref.size * bound.offset * Math.cos(bound.direction + bound.angle + ref.facing);
                this.y = ref.y + ref.size * bound.offset * Math.sin(bound.direction + bound.angle + ref.facing);
                this.bond.velocity.x += bound.size * this.accel.x;
                this.bond.velocity.y += bound.size * this.accel.y;
                this.firingArc = [ref.facing + bound.angle, bound.arc / 2];
                nullVector(this.accel);
                this.blend = ref.blend;
                break;
        }
        this.accel.x += engine.x * this.control.power;
        this.accel.y += engine.y * this.control.power;
    }
    face() {
        let t = this.control.target,
            tactive = (t.x !== 0 || t.y !== 0),
            oldFacing = this.facing;
        switch (this.facingType) {
            case 'autospin':
                this.facing += 0.02 / roomSpeed;
                break;
            case 'turnWithSpeed':
                this.facing += this.velocity.length / 90 * Math.PI / roomSpeed;
                break;
            case 'spin':
                this.facing += 0.05 / roomSpeed;
                break;
            case 'fastspin':
                this.facing += 0.1 / roomSpeed;
                break;
            case 'withMotion':
                this.facing = this.velocity.direction;
                break;
            case 'smoothWithMotion':
            case 'looseWithMotion':
                this.facing += util.loopSmooth(this.facing, this.velocity.direction, 4 / roomSpeed);
                break;
            case 'withTarget':
            case 'toTarget':
                this.facing = Math.atan2(t.y, t.x);
                break;
            case 'locksFacing':
                if (!this.control.alt) this.facing = Math.atan2(t.y, t.x);
                break;
            case 'looseWithTarget':
            case 'looseToTarget':
            case 'smoothToTarget':
                this.facing += util.loopSmooth(this.facing, Math.atan2(t.y, t.x), 4 / roomSpeed);
                break;
            case 'bound':
                let givenangle;
                if (this.control.main) {
                    givenangle = Math.atan2(t.y, t.x);
                    let diff = util.angleDifference(givenangle, this.firingArc[0]);
                    if (Math.abs(diff) >= this.firingArc[1]) {
                        givenangle = this.firingArc[0]; // - util.clamp(Math.sign(diff), -this.firingArc[1], this.firingArc[1]);
                    }
                } else {
                    givenangle = this.firingArc[0];
                }
                this.facing += util.loopSmooth(this.facing, givenangle, 4 / roomSpeed);
                break;
        }
        this.facing += this.turnAngle;
        // Loop
        const TAU = 2 * Math.PI;
        this.facing = (this.facing % TAU + TAU) % TAU;
        this.vfacing = util.angleDifference(oldFacing, this.facing) * roomSpeed;
    }
    takeSelfie() {
        this.flattenedPhoto = null;
        this.photo = (this.settings.drawShape) ? this.camera() : this.photo = undefined;
    }
    physics() {
        if (this.accel.x == null || this.velocity.x == null) {
            util.error('Void Error!');
            util.error(this.collisionArray);
            util.error(this.label);
            util.error(this);
            nullVector(this.accel);
            nullVector(this.velocity);
        }
        // Apply acceleration
        this.velocity.x += this.accel.x;
        this.velocity.y += this.accel.y;
        // Reset acceleration
        nullVector(this.accel);
        // Apply motion
        this.stepRemaining = 1;
        if (c.SPACE_PHYSICS) this.stepRemaining = 2;
        this.x += this.stepRemaining * this.velocity.x / roomSpeed;
        this.y += this.stepRemaining * this.velocity.y / roomSpeed;
    }
    friction() {
        var motion = this.velocity.length,
            excess = motion - this.maxSpeed;
        if (excess > 0 && this.damp) {
            var k = this.damp / roomSpeed,
                drag = excess / (k + 1),
                finalvelocity = this.maxSpeed + drag;
            if (c.SPACE_PHYSICS) finalvelocity *= (this.type === "bullet" ? 1.005 : 1.1);
            this.velocity.x = finalvelocity * this.velocity.x / motion;
            this.velocity.y = finalvelocity * this.velocity.y / motion;
        }
    }
    confinementToTheseEarthlyShackles() {
        if (this.x == null || this.x == null) {
            util.error('Void Error!');
            util.error(this.collisionArray);
            util.error(this.label);
            util.error(this);
            nullVector(this.accel);
            nullVector(this.velocity);
            return 0;
        }
        if (room.port.length) {
            let loc = {
                x: this.x,
                y: this.y
            };
            if (room.isIn("port", loc) && !this.passive && !this.settings.goThruObstacle && this.facingType !== "bound") {
                let myRoom = room.isAt(loc);
                let otherPortals = room.port.map(e => e).filter(r => (r.x !== myRoom.x && r.y !== myRoom.y));
                let dx = loc.x - myRoom.x;
                let dy = loc.y - myRoom.y;
                let dist2 = dx * dx + dy * dy;
                let force = c.ROOM_BOUND_FORCE;
                let portals = {
                    launchForce: 1250,
                    gravity: 13500,
                    threshold: 200
                };
                if (this.type === "miniboss" || this.isMothership) {
                    this.accel.x += 3e4 * dx / dist2 * force / roomSpeed;
                    this.accel.y += 3e4 * dy / dist2 * force / roomSpeed;
                } else if (this.type === "tank") {
                    if (dist2 <= portals.threshold) {
                        let angle = Math.random() * Math.PI * 2;
                        let ax = Math.cos(angle);
                        let ay = Math.sin(angle);
                        this.velocity.x = portals.launchForce * ax * force / roomSpeed;
                        this.velocity.y = portals.launchForce * ay * force / roomSpeed;
                        let portTo = (otherPortals.length ? ran.choose(otherPortals) : room.random());
                        let rx = ax * (room.width / room.xgrid) + (this.size * 2);
                        let ry = ay * (room.width / room.ygrid) + (this.size * 2);
                        this.x = portTo.x + rx;
                        this.y = portTo.y + ry;
                        this.invuln = true;
                        for (let o of entities)
                            if (o.id !== this.id && o.master.id === this.id && (o.type === "drone" || o.type === "minion")) {
                                o.x = this.x + (ay * 30 * (Math.random() - .5));
                                o.y = portTo.y + (ay * 30 * (Math.random() - .5));
                            }
                    } else {
                        this.velocity.x -= portals.gravity * dx / dist2 * force / roomSpeed;
                        this.velocity.y -= portals.gravity * dy / dist2 * force / roomSpeed;
                    }
                } else this.kill();
            }
        }
        if (!this.settings.canGoOutsideRoom) {
            if (c.ARENA_TYPE === "circle") {
                const centerPoint = {
                    x: room.width / 2,
                    y: room.height / 2
                };
                const dist = util.getDistance(this, centerPoint);
                if (dist > room.width / 2) {
                    let lerp = (a, b, x) => a + x * (b - a);
                    let strength = ((dist - room.width / 2) * (c.ROOM_BOUND_FORCE / roomSpeed)) / 750;
                    this.x = lerp(this.x, room.width / 2, strength);
                    this.y = lerp(this.y, room.height / 2, strength);
                }
            } else {
                this.accel.x -= Math.min(this.x - this.realSize + 50, 0) * c.ROOM_BOUND_FORCE / roomSpeed;
                this.accel.x -= Math.max(this.x + this.realSize - room.width - 50, 0) * c.ROOM_BOUND_FORCE / roomSpeed;
                this.accel.y -= Math.min(this.y - this.realSize + 50, 0) * c.ROOM_BOUND_FORCE / roomSpeed;
                this.accel.y -= Math.max(this.y + this.realSize - room.height - 50, 0) * c.ROOM_BOUND_FORCE / roomSpeed;
            }
        }
        if (c.SPECIAL_BOSS_SPAWNS && (this.type === "tank" || this.type === "food") && room.isIn("outb", {
                x: this.x,
                y: this.y
            })) this.kill();
        if (this.type === "food" && room.isIn("boss", {
                x: this.x,
                y: this.y
            })) this.kill();
        if (room.gameMode === 'tdm' && this.type !== 'food') {
            let loc = {
                x: this.x,
                y: this.y,
            };
            let inEnemyBase = false;
            for (let i = 1; i < 5; i++) {
                if (room["bas" + i].length)
                    if (this.team !== -i && room.isIn("bas" + i, loc)) inEnemyBase = true;
                if (room["bap" + i].length)
                    if (this.team !== -i && room.isIn("bap" + i, loc)) inEnemyBase = true;
            }
            if (c.TEAMS === 1) inEnemyBase = false;
            if (room.isIn("boss", loc) && this.team !== -100) inEnemyBase = true;
            if (inEnemyBase && !this.isArenaCloser && !this.master.isArenaCloser) this.kill();
        }
    }
    contemplationOfMortality() {
        if (this.invuln) {
            this.damageRecieved = 0;
            return 0;
        }
        // Life-limiting effects
        if (this.settings.diesAtRange) {
            this.range -= 1 / roomSpeed;
            if (this.range < 0) {
                this.kill();
            }
        }
        if (this.settings.diesAtLowSpeed) {
            if (!this.collisionArray.length && this.velocity.length < this.topSpeed / 2) {
                this.health.amount -= this.health.getDamage(1 / roomSpeed);
            }
        }
        // Shield regen and damage
        if (this.shield.max) {
            if (this.damageRecieved !== 0) {
                let shieldDamage = this.shield.getDamage(this.damageRecieved);
                this.damageRecieved -= shieldDamage;
                this.shield.amount -= shieldDamage;
            }
        }
        // Health damage 
        if (this.damageRecieved !== 0) {
            let healthDamage = this.health.getDamage(this.damageRecieved);
            this.blend.amount = 1;
            this.health.amount -= healthDamage;
        }
        this.damageRecieved = 0;
        // Check for death
        if (this.isDead()) {
            if (this.onDead) this.onDead();
            if (c.TAG && (this.isPlayer || this.isBot)) tagDeathEvent(this);
            // Initalize message arrays
            let killers = [],
                killTools = [],
                notJustFood = false;
            // If I'm a tank, call me a nameless player
            let name = (this.master.name == '') ?
                (this.master.type === 'tank') ?
                "a nameless player's " + this.label :
                (this.master.type === 'miniboss') ?
                "a visiting " + this.label :
                util.addArticle(this.label) :
                this.master.name + "'s " + this.label;
            // Calculate the jackpot
            let jackpot = Math.ceil(util.getJackpot(this.skill.score) / this.collisionArray.length);
            // Now for each of the things that kill me...
            this.collisionArray.forEach(instance => {
                if (instance.type === 'wall') return 0;
                if (instance.master.settings.acceptsScore) { // If it's not food, give its master the score
                    if (instance.master.type === 'tank' || instance.master.type === 'miniboss') notJustFood = true;
                    instance.master.skill.score += jackpot;
                    killers.push(instance.master); // And keep track of who killed me
                } else if (instance.settings.acceptsScore) {
                    instance.skill.score += jackpot;
                }
                killTools.push(instance); // Keep track of what actually killed me
            });
            // Remove duplicates
            killers = killers.filter((elem, index, self) => {
                return index == self.indexOf(elem);
            });
            // If there's no valid killers (you were killed by food), change the message to be more passive
            let killText = (notJustFood) ? '' : "You have been killed by ",
                dothISendAText = this.settings.givesKillMessage;
            killers.forEach(instance => {
                this.killCount.killers.push(instance.index);
                if (this.type === 'tank') {
                    if (killers.length > 1) instance.killCount.assists++;
                    else instance.killCount.solo++;
                } else if (this.type === "miniboss") instance.killCount.bosses++;
            });
            // Add the killers to our death message, also send them a message
            if (notJustFood) {
                killers.forEach(instance => {
                    if (instance.master.type !== 'food' && instance.master.type !== 'crasher') {
                        killText += (instance.name == '') ? (killText == '') ? 'An unnamed player' : 'an unnamed player' : instance.name;
                        killText += ' and ';
                    }
                    // Only if we give messages
                    if (dothISendAText) {
                        instance.sendMessage('You killed ' + name + ((killers.length > 1) ? ' (with some help).' : '.'));
                    }
                });
                // Prepare the next part of the next 
                killText = killText.slice(0, -4);
                killText += 'killed you with ';
            }
            // Broadcast
            if (this.settings.broadcastMessage) sockets.broadcast(this.settings.broadcastMessage);
            if (this.settings.defeatMessage) {
                let text = util.addArticle(this.label, true);
                if (notJustFood) {
                    text += ' has been defeated by';
                    killers.forEach(instance => {
                        text += ' ';
                        text += (instance.name === '') ? 'an unnamed player' : instance.name;
                        text += ' and';
                    });
                    text = text.slice(0, -4);
                    text += '!';
                } else {
                    text += ' fought a polygon... and the polygon won.';
                }
                sockets.broadcast(text);
            }
            // Add the implements to the message
            killTools.forEach((instance) => {
                killText += util.addArticle(instance.label) + ' and ';
            });
            // Prepare it and clear the collision array.
            killText = killText.slice(0, -5);
            if (killText === 'You have been kille') killText = 'You have died a stupid death';
            this.sendMessage(killText + '.');
            // If I'm the leader, broadcast it:
            if (this.id === room.topPlayerID) {
                let usurptText = (this.name === '') ? 'The leader' : this.name;
                if (notJustFood) {
                    usurptText += ' has been usurped by';
                    killers.forEach(instance => {
                        usurptText += ' ';
                        usurptText += (instance.name === '') ? 'an unnamed player' : instance.name;
                        usurptText += ' and';
                    });
                    usurptText = usurptText.slice(0, -4);
                    usurptText += '!';
                } else {
                    usurptText += ' fought a polygon... and the polygon won.';
                }
                sockets.broadcast(usurptText);
            }
            this.setKillers(killers);
            // Kill it
            return 1;
        }
        return 0;
    }
    protect() {
        entitiesToAvoid.push(this);
        this.isProtected = true;
    }
    sendMessage(message) {} // Dummy
    setKillers(killers) {} // Dummy
    kill() {
        this.invuln = false;
        this.health.amount = -100;
    }
    destroy() {
        // Remove from the protected entities list
        if (this.isProtected) util.remove(entitiesToAvoid, entitiesToAvoid.indexOf(this));
        // Remove from minimap
        let i = minimap.findIndex(entry => {
            return entry[0] === this.id;
        });
        if (i != -1) util.remove(minimap, i);
        // Remove this from views
        for (let view of views) {
            view.remove(this);
        }
        // Remove from parent lists if needed
        if (this.parent != null) util.remove(this.parent.children, this.parent.children.indexOf(this));
        // Kill all of its children
        let ID = this.id;
        for (let instance of entities) {
            if (instance.source.id === this.id) {
                if (instance.settings.persistsAfterDeath) {
                    instance.source = instance;
                } else {
                    instance.kill();
                }
            }
            if (instance.parent && instance.parent.id === this.id) {
                instance.parent = null;
            }
            if (instance.master.id === this.id) {
                instance.kill();
                instance.master = instance;
            }
        }
        // Remove everything bound to it
        for (let i = 0; i < this.turrets.length; i++) this.turrets[i].destroy();
        // Remove from the collision grid
        this.removeFromGrid();
        this.isGhost = true;
    }
    isDead() {
        return this.health.amount <= 0;
    }
}
module.exports = {
    Gun,
    Entity
};