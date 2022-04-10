import {
    global
} from "./global.js";
class Canvas {
    constructor(params) {
        this.directionLock = false;
        this.target = global.target;
        this.reenviar = true;
        this.socket = global.socket;
        this.directions = [];
        var self = this;
        this.cv = document.getElementById('gameCanvas');
        this.cv.width = innerWidth;
        this.cv.height = innerHeight;
        this.cv.addEventListener('mousemove', this.gameInput, false);
        this.cv.addEventListener('keydown', this.keyboardDown, false);
        this.cv.addEventListener('keyup', this.keyboardUp, false);
        this.cv.addEventListener("mousedown", this.mouseDown, false);
        this.cv.addEventListener("mouseup", this.mouseUp, false);
        this.cv.parent = self;
        global.canvas = this;
    }
    keyboardDown(event) {
        switch (event.keyCode) {
            case 13:
                if (global.died) this.parent.socket.talk('s', global.playerName, 0);
                global.died = false;
                break; // Enter to respawn
            case global.KEY_UP_ARROW:
                if (!global.died && global.showTree) return global.realScrollX = 0;
            case global.KEY_UP:
                this.parent.socket.cmd.set(0, true);
                break;
            case global.KEY_DOWN_ARROW:
                if (!global.died && global.showTree) return global.realScrollX = 1;
            case global.KEY_DOWN:
                this.parent.socket.cmd.set(1, true);
                break;
            case global.KEY_LEFT_ARROW:
                if (!global.died && global.showTree) return global.realScrollX -= global.realScrollX <= 0 ? 0 : .01;
            case global.KEY_LEFT:
                this.parent.socket.cmd.set(2, true);
                break;
            case global.KEY_RIGHT_ARROW:
                if (!global.died && global.showTree) return global.realScrollX += global.realScrollX >= 1 ? 0 : .01;
            case global.KEY_RIGHT:
                this.parent.socket.cmd.set(3, true);
                break;
            case global.KEY_MOUSE_0:
                this.parent.socket.cmd.set(4, true);
                break;
            case global.KEY_MOUSE_1:
                this.parent.socket.cmd.set(5, true);
                break;
            case global.KEY_MOUSE_2:
                this.parent.socket.cmd.set(6, true);
                break;
            case global.KEY_LEVEL_UP:
                this.parent.socket.talk('L');
                break;
            case global.KEY_FUCK_YOU:
                this.parent.socket.talk('0');
                break;
            case global.KEY_MAX_STAT:
                global.statMaxing = true;
                break;
        }
        if (!event.repeat) {
            switch (event.keyCode) {
                case global.KEY_AUTO_SPIN:
                    this.parent.socket.talk('t', 0);
                    break;
                case global.KEY_AUTO_FIRE:
                    this.parent.socket.talk('t', 1);
                    break;
                case global.KEY_OVER_RIDE:
                    this.parent.socket.talk('t', 2);
                    break;
                case global.KEY_CLASS_TREE:
                    global.showTree = !global.showTree;
                    break;
            }
            if (global.canSkill) {
                for (let i = 0; i < 1 + (8 * global.statMaxing); i ++) {
                    switch (event.keyCode) {
                        case global.KEY_UPGRADE_ATK:
                            this.parent.socket.talk('x', 0);
                            break;
                        case global.KEY_UPGRADE_HTL:
                            this.parent.socket.talk('x', 1);
                            break;
                        case global.KEY_UPGRADE_SPD:
                            this.parent.socket.talk('x', 2);
                            break;
                        case global.KEY_UPGRADE_STR:
                            this.parent.socket.talk('x', 3);
                            break;
                        case global.KEY_UPGRADE_PEN:
                            this.parent.socket.talk('x', 4);
                            break;
                        case global.KEY_UPGRADE_DAM:
                            this.parent.socket.talk('x', 5);
                            break;
                        case global.KEY_UPGRADE_RLD:
                            this.parent.socket.talk('x', 6);
                            break;
                        case global.KEY_UPGRADE_MOB:
                            this.parent.socket.talk('x', 7);
                            break;
                        case global.KEY_UPGRADE_RGN:
                            this.parent.socket.talk('x', 8);
                            break;
                        case global.KEY_UPGRADE_SHI:
                            this.parent.socket.talk('x', 9);
                            break;
                    }
                }
            }
            if (global.canUpgrade) {
                switch (event.keyCode) {
                    case global.KEY_CHOOSE_1:
                        this.parent.socket.talk('U', 0);
                        break;
                    case global.KEY_CHOOSE_2:
                        this.parent.socket.talk('U', 1);
                        break;
                    case global.KEY_CHOOSE_3:
                        this.parent.socket.talk('U', 2);
                        break;
                    case global.KEY_CHOOSE_4:
                        this.parent.socket.talk('U', 3);
                        break;
                    case global.KEY_CHOOSE_5:
                        this.parent.socket.talk('U', 4);
                        break;
                    case global.KEY_CHOOSE_6:
                        this.parent.socket.talk('U', 5);
                        break;
                    case global.KEY_CHOOSE_7:
                        this.parent.socket.talk('U', 6);
                        break;
                    case global.KEY_CHOOSE_8:
                        this.parent.socket.talk('U', 7);
                        break;
                }
            }
        }
    }
    keyboardUp(event) {
        switch (event.keyCode) {
            case global.KEY_UP_ARROW:
            case global.KEY_UP:
                this.parent.socket.cmd.set(0, false);
                break;
            case global.KEY_DOWN_ARROW:
            case global.KEY_DOWN:
                this.parent.socket.cmd.set(1, false);
                break;
            case global.KEY_LEFT_ARROW:
            case global.KEY_LEFT:
                this.parent.socket.cmd.set(2, false);
                break;
            case global.KEY_RIGHT_ARROW:
            case global.KEY_RIGHT:
                this.parent.socket.cmd.set(3, false);
                break;
            case global.KEY_MOUSE_0:
                this.parent.socket.cmd.set(4, false);
                break;
            case global.KEY_MOUSE_1:
                this.parent.socket.cmd.set(5, false);
                break;
            case global.KEY_MOUSE_2:
                this.parent.socket.cmd.set(6, false);
                break;
            case global.KEY_MAX_STAT:
                global.statMaxing = false;
                break;
        }
    }
    mouseDown(mouse) {
        switch (mouse.button) {
            case 0:
                let mpos = {
                    x: mouse.clientX * global.ratio,
                    y: mouse.clientY * global.ratio,
                };
                let statIndex = global.clickables.stat.check(mpos);
                if (statIndex !== -1) this.parent.socket.talk('x', statIndex);
                else if (global.clickables.skipUpgrades.check(mpos) !== -1) global.clearUpgrades();
                else {
                    let upgradeIndex = global.clickables.upgrade.check(mpos);
                    if (upgradeIndex !== -1) this.parent.socket.talk('U', upgradeIndex);
                    else this.parent.socket.cmd.set(4, true);
                }
                break;
            case 1:
                this.parent.socket.cmd.set(5, true);
                break;
            case 2:
                this.parent.socket.cmd.set(6, true);
                break;
        }
    }
    mouseUp(mouse) {
        switch (mouse.button) {
            case 0:
                this.parent.socket.cmd.set(4, false);
                break;
            case 1:
                this.parent.socket.cmd.set(5, false);
                break;
            case 2:
                this.parent.socket.cmd.set(6, false);
                break;
        }
    }
    // Mouse location (we send target information in the heartbeat)
    gameInput(mouse) {
        this.parent.target.x = (mouse.clientX * global.ratio) - this.width / 2;
        this.parent.target.y = (mouse.clientY * global.ratio) - this.height / 2;
        global.target = this.parent.target;
        global.statHover = global.clickables.hover.check({
            x: mouse.clientX * global.ratio,
            y: mouse.clientY * global.ratio,
        }) === 0;
    }
}
export {
    Canvas
}