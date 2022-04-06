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
const drawingFunctions = (function(util, global, config, Canvas, color) {
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
                return color.pink;
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
    return {
        mixColors,
        getColor,
        getColorDark,
        getZoneColor,
        setColor
    }
})(util, global, config, Canvas, color);