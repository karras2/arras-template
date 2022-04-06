/*jslint node: true */
/*jshint -W061 */
/*global goog, Map, let */
"use strict";
// General requires
require('google-closure-library');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.QuadTree');

// Define IOs (AI)
class IO {
    constructor(body) {
        this.body = body
        this.acceptsFromTop = true
    }
    think() {
        return {
            target: null,
            goal: null,
            fire: null,
            main: null,
            alt: null,
            power: null,
        }
    }
}
let ioTypes = {};
ioTypes.slowSpin = class extends IO {
    constructor(b) {
        super(b);
        this.a = 0;
    }
    think(input) {
        this.a += 0.01;
        let offset = 0;
        if (this.body.bond != null) {
            offset = this.body.bound.angle;
        }
        return {
            target: {
                x: Math.cos(this.a + offset),
                y: Math.sin(this.a + offset)
            },
            main: true
        };
    }
}
ioTypes.reverseSlowSpin = class extends IO {
    constructor(body) {
        super(body)
        this.a = 0
    }
    think(input) {
        this.a -= 0.01;
        let offset = 0
        if (this.body.bond != null) {
            offset = this.body.bound.angle
        }
        return {
            target: {
                x: Math.cos(this.a + offset),
                y: Math.sin(this.a + offset),
            },
            main: true,
        };
    }
}
ioTypes.bossRushAI = class extends IO {
    constructor(body) {
        super(body);
        this.enabled = true;
        this.goal = {
            x: room.width / 2,
            y: room.height / 2
        }
    }
    think(input) {
        if (room.isIn("nest", this.body)) {
            this.enabled = false;
        }
        if (this.enabled) {
            return {
                goal: this.goal
            }
        }
    }
}
ioTypes.doNothing = class extends IO {
    constructor(body) {
        super(body)
        this.acceptsFromTop = false
    }
    think() {
        return {
            goal: {
                x: this.body.x,
                y: this.body.y,
            },
            main: false,
            alt: false,
            fire: false,
        }
    }
}
ioTypes.moveInCircles = class extends IO {
    constructor(body) {
        super(body)
        this.acceptsFromTop = false
        this.timer = ran.irandom(10) + 3
        this.goal = {
            x: this.body.x + 10 * Math.cos(-this.body.facing),
            y: this.body.y + 10 * Math.sin(-this.body.facing),
        }
    }
    think() {
        if (!(this.timer--)) {
            this.timer = 10
            this.goal = {
                x: this.body.x + 10 * Math.cos(-this.body.facing),
                y: this.body.y + 10 * Math.sin(-this.body.facing),
            }
        }
        return {
            goal: this.goal
        }
    }
}
ioTypes.listenToPlayer = class extends IO {
    constructor(b, p) {
        super(b)
        this.player = p
        this.acceptsFromTop = false
    }
    // THE PLAYER MUST HAVE A VALID COMMAND AND TARGET OBJECT
    think() {
        let targ = {
            x: this.player.target.x,
            y: this.player.target.y,
        }
        if (this.player.command.autospin) {
            let kk = Math.atan2(this.body.control.target.y, this.body.control.target.x) + 0.02
            targ = {
                x: 100 * Math.cos(kk),
                y: 100 * Math.sin(kk),
            }
        }
        if (this.body.invuln) {
            if (this.player.command.right || this.player.command.left || this.player.command.up || this.player.command.down || this.player.command.lmb) {
                this.body.invuln = false
            }
        }
        this.body.autoOverride = this.player.command.override
        let left = this.player.command.lmb
        let right = this.player.command.rmb
        left = this.player.command.autofire || left
        return {
            target: targ,
            goal: {
                x: this.body.x + this.player.command.right - this.player.command.left,
                y: this.body.y + this.player.command.down - this.player.command.up,
            },
            fire: left,
            main: left || this.player.command.autospin,
            alt: right
        }
    }
}
ioTypes.mapTargetToGoal = class extends IO {
    constructor(b) {
        super(b)
    }
    think(input) {
        if (input.main || input.alt) {
            return {
                goal: {
                    x: input.target.x + this.body.x,
                    y: input.target.y + this.body.y,
                },
                power: 1,
            }
        }
    }
}
ioTypes.boomerang = class extends IO {
    constructor(b) {
        super(b)
        this.r = 0
        this.b = b
        this.m = b.master
        this.turnover = false
        let len = 10 * util.getDistance({
            x: 0,
            y: 0
        }, b.master.control.target)
        this.myGoal = {
            x: 3 * b.master.control.target.x + b.master.x,
            y: 3 * b.master.control.target.y + b.master.y,
        }
    }
    think(input) {
        if (this.b.range > this.r) this.r = this.b.range
        let t = 1; //1 - Math.sin(2 * Math.PI * this.b.range / this.r) || 1
        if (!this.turnover) {
            if (this.r && this.b.range < this.r * 0.5) {
                this.turnover = true;
            }
            return {
                goal: this.myGoal,
                power: t,
            }
        } else {
            return {
                goal: {
                    x: this.m.x,
                    y: this.m.y,
                },
                power: t,
            }
        }
    }
}
ioTypes.goToMasterTarget = class extends IO {
    constructor(body) {
        super(body)
        this.myGoal = {
            x: body.master.control.target.x + body.master.x,
            y: body.master.control.target.y + body.master.y,
        }
        this.countdown = 5
    }
    think() {
        if (this.countdown) {
            if (util.getDistance(this.body, this.myGoal) < 1) {
                this.countdown--;
            }
            return {
                goal: {
                    x: this.myGoal.x,
                    y: this.myGoal.y,
                },
            }
        }
    }
}
ioTypes.canRepel = class extends IO {
    constructor(b) {
        super(b)
    }
    think(input) {
        if (input.alt && input.target) {
            let x = this.body.master.master.x - this.body.x
            let y = this.body.master.master.y - this.body.y
            // if (x * x + y * y < 2250000) // (50 * 30) ^ 2
            return {
                target: {
                    x: -input.target.x,
                    y: -input.target.y,
                },
                main: true,
            }
        }
    }
}
ioTypes.alwaysFire = class extends IO {
    constructor(body) {
        super(body)
    }
    think() {
        return {
            fire: true,
        }
    }
}
ioTypes.targetSelf = class extends IO {
    constructor(body) {
        super(body)
    }
    think() {
        return {
            main: true,
            target: {
                x: 0,
                y: 0,
            },
        }
    }
}
ioTypes.mapAltToFire = class extends IO {
    constructor(body) {
        super(body)
    }
    think(input) {
        if (input.alt) {
            return {
                fire: true,
            }
        }
    }
}
ioTypes.onlyAcceptInArc = class extends IO {
    constructor(body) {
        super(body)
    }
    think(input) {
        if (input.target && this.body.firingArc != null) {
            if (Math.abs(util.angleDifference(Math.atan2(input.target.y, input.target.x), this.body.firingArc[0])) >= this.body.firingArc[1]) {
                return {
                    fire: false,
                    alt: false,
                    main: false,
                }
            }
        }
    }
}
ioTypes.nearestDifferentMaster = class extends IO {
    constructor(body) {
        super(body);
        this.targetLock = undefined;
        this.tick = ran.irandom(30);
        this.lead = 0;
        this.validTargets = this.buildList(body.fov);
        this.oldHealth = body.health.display();
    }
    validate(e, m, mm, sqrRange, sqrRangeMaster) {
        return (e.health.amount > 0) &&
        (!isNaN(e.dangerValue)) &&
        (!e.invuln && !e.master.master.passive && !this.body.master.master.passive) &&
        (e.master.master.team !== this.body.master.master.team) &&
        (e.master.master.team !== -101) &&
        (this.body.aiSettings.seeInvisible || this.body.isArenaCloser || e.alpha > 0.5) &&
        (e.type === "miniboss" || e.type === "tank" || e.type === "crasher" || (!this.body.aiSettings.IGNORE_SHAPES && e.type === 'food')) &&
        (this.body.aiSettings.BLIND || ((e.x - m.x) * (e.x - m.x) < sqrRange && (e.y - m.y) * (e.y - m.y) < sqrRange)) &&
        (this.body.aiSettings.SKYNET || ((e.x - mm.x) * (e.x - mm.x) < sqrRangeMaster && (e.y - mm.y) * (e.y - mm.y) < sqrRangeMaster));
    }
    buildList(range) {
        // Establish whom we judge in reference to
        let mostDangerous = 0,
            keepTarget = false;
        // Filter through everybody...
        let out = entities.filter(e => {
            // Only look at those within our view, and our parent's view, not dead, not invisible, not our kind, not a bullet/trap/block etc
            return this.validate(e, {
                    x: this.body.x,
                    y: this.body.y,
                }, {
                    x: this.body.master.master.x,
                    y: this.body.master.master.y,
                }, range * range, range * range * 4 / 3);
        }).filter((e) => {
            // Only look at those within range and arc (more expensive, so we only do it on the few)
            if (this.body.firingArc == null || this.body.aiSettings.view360 || Math.abs(util.angleDifference(util.getDirection(this.body, e), this.body.firingArc[0])) < this.body.firingArc[1]) {
                mostDangerous = Math.max(e.dangerValue, mostDangerous);
                return true;
            }
            return false;
        }).filter((e) => {
            // Only return the highest tier of danger
            if (this.body.aiSettings.farm || e.dangerValue === mostDangerous) {
                if (this.targetLock && e.id === this.targetLock.id) keepTarget = true;
                return true;
            }
            return false;
        });
        // Reset target if it's not in there
        if (!keepTarget) this.targetLock = undefined;
        return out;
    }
    think(input) {
        // Override target lock upon other commands
        if (input.main || input.alt || this.body.master.autoOverride) {
            this.targetLock = undefined;
            return {};
        }
        // Otherwise, consider how fast we can either move to ram it or shoot at a potiential target.
        let tracking = this.body.topSpeed,
            range = this.body.fov;
        // Use whether we have functional guns to decide
        for (let i = 0; i < this.body.guns.length; i++) {
            if (this.body.guns[i].canShoot && !this.body.aiSettings.SKYNET) {
                let v = this.body.guns[i].getTracking();
                tracking = v.speed;
                //if (!this.body.isPlayer || this.body.type === "miniboss" || this.body.master !== this.body) range = 640 * this.body.FOV;
                //else range = Math.min(range, (v.speed || 1) * (v.range || 90));
                range = Math.min(range, (v.speed || 1.5) * (v.range < (this.body.size * 2) ? this.body.fov : v.range));
                break;
            }
        }
        if (!Number.isFinite(tracking)) {
            tracking = this.body.topSpeed + .01;
        }
        if (!Number.isFinite(range)) {
            range = 640 * this.body.FOV;
        }
        // Check if my target's alive
        if (this.targetLock) {
            if (!this.validate(this.targetLock, {
                    x: this.body.x,
                    y: this.body.y,
                }, {
                    x: this.body.master.master.x,
                    y: this.body.master.master.y,
                }, range * range, range * range * 4 / 3)) {
                this.targetLock = undefined;
                this.tick = 100;
            }
        }
        // Think damn hard
        if (this.tick++ > 15 * roomSpeed) {
            this.tick = 0;
            this.validTargets = this.buildList(range);
            // Ditch our old target if it's invalid
            if (this.targetLock && this.validTargets.indexOf(this.targetLock) === -1) {
                this.targetLock = undefined;
            }
            // Lock new target if we still don't have one.
            if (this.targetLock == null && this.validTargets.length) {
                this.targetLock = (this.validTargets.length === 1) ? this.validTargets[0] : nearest(this.validTargets, {
                    x: this.body.x,
                    y: this.body.y
                });
                this.tick = -90;
            }
        }
        // Lock onto whoever's shooting me.
        // let damageRef = (this.body.bond == null) ? this.body : this.body.bond
        // if (damageRef.collisionArray.length && damageRef.health.display() < this.oldHealth) {
        //     this.oldHealth = damageRef.health.display()
        //     if (this.validTargets.indexOf(damageRef.collisionArray[0]) === -1) {
        //         this.targetLock = (damageRef.collisionArray[0].master.id === -1) ? damageRef.collisionArray[0].source : damageRef.collisionArray[0].master
        //     }
        // }
        // Consider how fast it's moving and shoot at it
        if (this.targetLock != null) {
            let radial = this.targetLock.velocity;
            let diff = {
                x: this.targetLock.x - this.body.x,
                y: this.targetLock.y - this.body.y,
            }
            /// Refresh lead time
            if (this.tick % 4 === 0) {
                this.lead = 0
                // Find lead time (or don't)
                if (!this.body.aiSettings.chase) {
                    let toi = timeOfImpact(diff, radial, tracking)
                    this.lead = toi
                }
            }
            if (!Number.isFinite(this.lead)) {
                this.lead = 0;
            }
            // And return our aim
            return {
                target: {
                    x: diff.x + this.lead * radial.x,
                    y: diff.y + this.lead * radial.y,
                },
                fire: true,
                main: true
            };
        }
        return {};
    }
}
ioTypes.avoid = class extends IO {
    constructor(body) {
        super(body)
    }
    think(input) {
        let masterId = this.body.master.id
        let range = this.body.size * this.body.size * 100
        this.avoid = nearest(entities, {
            x: this.body.x,
            y: this.body.y
        }, function (test, sqrdst) {
            return (test.master.id !== masterId && (test.type === 'bullet' || test.type === 'drone' || test.type === 'swarm' || test.type === 'trap' || test.type === 'block') && sqrdst < range);
        })
        // Aim at that target
        if (this.avoid != null) {
            // Consider how fast it's moving.
            let delt = new Vector(this.body.velocity.x - this.avoid.velocity.x, this.body.velocity.y - this.avoid.velocity.y)
            let diff = new Vector(this.avoid.x - this.body.x, this.avoid.y - this.body.y);
            let comp = (delt.x * diff.x + delt.y * diff.y) / delt.length / diff.length
            let goal = {}
            if (comp > 0) {
                if (input.goal) {
                    let goalDist = Math.sqrt(range / (input.goal.x * input.goal.x + input.goal.y * input.goal.y))
                    goal = {
                        x: input.goal.x * goalDist - diff.x * comp,
                        y: input.goal.y * goalDist - diff.y * comp,
                    }
                } else {
                    goal = {
                        x: -diff.x * comp,
                        y: -diff.y * comp,
                    }
                }
                return goal
            }
        }
    }
}
ioTypes.minion = class extends IO {
    constructor(body) {
        super(body)
        this.turnwise = 1
    }
    think(input) {
        if (this.body.aiSettings.reverseDirection && ran.chance(0.005)) {
            this.turnwise = -1 * this.turnwise;
        }
        if (input.target != null && (input.alt || input.main)) {
            let sizeFactor = Math.sqrt(this.body.master.size / this.body.master.SIZE)
            let leash = 82 * sizeFactor
            let orbit = 140 * sizeFactor
            let repel = 142 * sizeFactor
            let goal
            let power = 1
            let target = new Vector(input.target.x, input.target.y)
            if (input.alt) {
                // Leash
                if (target.length < leash) {
                    goal = {
                        x: this.body.x + target.x,
                        y: this.body.y + target.y,
                    }
                    // Spiral repel
                } else if (target.length < repel) {
                    let dir = -this.turnwise * target.direction + Math.PI / 5
                    goal = {
                        x: this.body.x + Math.cos(dir),
                        y: this.body.y + Math.sin(dir),
                    }
                    // Free repel
                } else {
                    goal = {
                        x: this.body.x - target.x,
                        y: this.body.y - target.y,
                    }
                }
            } else if (input.main) {
                // Orbit point
                let dir = this.turnwise * target.direction + 0.01
                goal = {
                    x: this.body.x + target.x - orbit * Math.cos(dir),
                    y: this.body.y + target.y - orbit * Math.sin(dir),
                }
                if (Math.abs(target.length - orbit) < this.body.size * 2) {
                    power = 0.7
                }
            }
            return {
                goal: goal,
                power: power,
            }
        }
    }
}
ioTypes.hangOutNearMaster = class extends IO {
    constructor(body) {
        super(body)
        this.acceptsFromTop = false
        this.orbit = 30
        this.currentGoal = {
            x: this.body.source.x,
            y: this.body.source.y,
        }
        this.timer = 0
    }
    think(input) {
        if (this.body.invisible[1]) return {}
        if (this.body.source !== this.body) {
            let bound1 = this.orbit * 0.8 + this.body.source.size + this.body.size
            let bound2 = this.orbit * 1.5 + this.body.source.size + this.body.size
            let dist = util.getDistance(this.body, this.body.source) + Math.PI / 8;
            let output = {
                target: {
                    x: this.body.velocity.x,
                    y: this.body.velocity.y,
                },
                goal: this.currentGoal,
                power: undefined,
            };
            // Set a goal
            if (dist > bound2 || this.timer > 30) {
                this.timer = 0
                let dir = util.getDirection(this.body, this.body.source) + Math.PI * ran.random(0.5);
                let len = ran.randomRange(bound1, bound2)
                let x = this.body.source.x - len * Math.cos(dir)
                let y = this.body.source.y - len * Math.sin(dir)
                this.currentGoal = {
                    x: x,
                    y: y,
                };
            }
            if (dist < bound2) {
                output.power = 0.15
                if (ran.chance(0.3)) {
                    this.timer++;
                }
            }
            return output
        }
    }
}
ioTypes.spinWhenIdle = class extends IO {
    constructor(b) {
        super(b)
        this.a = 0
    }
    think(input) {
        if (input.target) {
            this.a = Math.atan2(input.target.y, input.target.x)
            return input
        }
        this.a += 0.02
        return {
            target: {
                x: Math.cos(this.a),
                y: Math.sin(this.a),
            },
            main: true
        }
    }
}
ioTypes.spin = class extends IO {
    constructor(b) {
        super(b)
        this.a = 0
    }
    think(input) {
        this.a += 0.04
        let offset = 0
        if (this.body.bond != null) {
            offset = this.body.bound.angle
        }
        return {
            target: {
                x: Math.cos(this.a + offset),
                y: Math.sin(this.a + offset),
            },
            main: true,
        };
    }
}
ioTypes.fastspin = class extends IO {
    constructor(b) {
        super(b)
        this.a = 0
    }
    think(input) {
        this.a += 0.08
        let offset = 0
        if (this.body.bond != null) {
            offset = this.body.bound.angle
        }
        return {
            target: {
                x: Math.cos(this.a + offset),
                y: Math.sin(this.a + offset),
            },
            main: true,
        };
    }
}
ioTypes.reversespin = class extends IO {
    constructor(b) {
        super(b)
        this.a = 0
    }
    think(input) {
        this.a -= 0.05
        let offset = 0
        if (this.body.bond != null) {
            offset = this.body.bound.angle
        }
        return {
            target: {
                x: Math.cos(this.a + offset),
                y: Math.sin(this.a + offset),
            },
            main: true,
        };
    }
}
ioTypes.dontTurn = class extends IO {
    constructor(b) {
        super(b)
    }
    think(input) {
        return {
            target: {
                x: 0,
                y: 1,
            },
            main: true,
        };
    }
}
ioTypes.dontTurnDominator = class extends IO {
    constructor(b) {
        super(b);
    }
    think(input) {
        return {
            target: rotatePoint({
                x: 10,
                y: 10
            }, Math.PI / 4),
            main: true,
        };
    }
}
ioTypes.fleeAtLowHealth = class extends IO {
    constructor(b) {
        super(b)
        this.fear = util.clamp(ran.gauss(0.7, 0.15), 0.1, 0.9)
    }
    think(input) {
        if (input.fire && input.target != null && this.body.health.amount < this.body.health.max * this.fear) {
            return {
                goal: {
                    x: this.body.x - input.target.x,
                    y: this.body.y - input.target.y,
                },
            }
        }
    }
}

module.exports = {
    ioTypes,
    IO
};