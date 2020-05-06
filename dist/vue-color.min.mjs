var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
    return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var tinycolor = createCommonjsModule(function (module) {
// TinyColor v1.4.1
// https://github.com/bgrins/TinyColor
// Brian Grinstead, MIT License

    (function(Math) {

        var trimLeft = /^\s+/,
            trimRight = /\s+$/,
            tinyCounter = 0,
            mathRound = Math.round,
            mathMin = Math.min,
            mathMax = Math.max,
            mathRandom = Math.random;

        function tinycolor (color, opts) {

            color = (color) ? color : '';
            opts = opts || { };

            // If input is already a tinycolor, return itself
            if (color instanceof tinycolor) {
                return color;
            }
            // If we are called as a function, call using new instead
            if (!(this instanceof tinycolor)) {
                return new tinycolor(color, opts);
            }

            var rgb = inputToRGB(color);
            this._originalInput = color,
                this._r = rgb.r,
                this._g = rgb.g,
                this._b = rgb.b,
                this._a = rgb.a,
                this._roundA = mathRound(100*this._a) / 100,
                this._format = opts.format || rgb.format;
            this._gradientType = opts.gradientType;

            // Don't let the range of [0,255] come back in [0,1].
            // Potentially lose a little bit of precision here, but will fix issues where
            // .5 gets interpreted as half of the total, instead of half of 1
            // If it was supposed to be 128, this was already taken care of by `inputToRgb`
            if (this._r < 1) { this._r = mathRound(this._r); }
            if (this._g < 1) { this._g = mathRound(this._g); }
            if (this._b < 1) { this._b = mathRound(this._b); }

            this._ok = rgb.ok;
            this._tc_id = tinyCounter++;
        }

        tinycolor.prototype = {
            isDark: function() {
                return this.getBrightness() < 128;
            },
            isLight: function() {
                return !this.isDark();
            },
            isValid: function() {
                return this._ok;
            },
            getOriginalInput: function() {
                return this._originalInput;
            },
            getFormat: function() {
                return this._format;
            },
            getAlpha: function() {
                return this._a;
            },
            getBrightness: function() {
                //http://www.w3.org/TR/AERT#color-contrast
                var rgb = this.toRgb();
                return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
            },
            getLuminance: function() {
                //http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
                var rgb = this.toRgb();
                var RsRGB, GsRGB, BsRGB, R, G, B;
                RsRGB = rgb.r/255;
                GsRGB = rgb.g/255;
                BsRGB = rgb.b/255;

                if (RsRGB <= 0.03928) {R = RsRGB / 12.92;} else {R = Math.pow(((RsRGB + 0.055) / 1.055), 2.4);}
                if (GsRGB <= 0.03928) {G = GsRGB / 12.92;} else {G = Math.pow(((GsRGB + 0.055) / 1.055), 2.4);}
                if (BsRGB <= 0.03928) {B = BsRGB / 12.92;} else {B = Math.pow(((BsRGB + 0.055) / 1.055), 2.4);}
                return (0.2126 * R) + (0.7152 * G) + (0.0722 * B);
            },
            setAlpha: function(value) {
                this._a = boundAlpha(value);
                this._roundA = mathRound(100*this._a) / 100;
                return this;
            },
            toHsv: function() {
                var hsv = rgbToHsv(this._r, this._g, this._b);
                return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
            },
            toHsvString: function() {
                var hsv = rgbToHsv(this._r, this._g, this._b);
                var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
                return (this._a == 1) ?
                    "hsv("  + h + ", " + s + "%, " + v + "%)" :
                    "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
            },
            toHsl: function() {
                var hsl = rgbToHsl(this._r, this._g, this._b);
                return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
            },
            toHslString: function() {
                var hsl = rgbToHsl(this._r, this._g, this._b);
                var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
                return (this._a == 1) ?
                    "hsl("  + h + ", " + s + "%, " + l + "%)" :
                    "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
            },
            toHex: function(allow3Char) {
                return rgbToHex(this._r, this._g, this._b, allow3Char);
            },
            toHexString: function(allow3Char) {
                return '#' + this.toHex(allow3Char);
            },
            toHex8: function(allow4Char) {
                return rgbaToHex(this._r, this._g, this._b, this._a, allow4Char);
            },
            toHex8String: function(allow4Char) {
                return '#' + this.toHex8(allow4Char);
            },
            toRgb: function() {
                return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
            },
            toRgbString: function() {
                return (this._a == 1) ?
                    "rgb("  + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
                    "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
            },
            toPercentageRgb: function() {
                return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
            },
            toPercentageRgbString: function() {
                return (this._a == 1) ?
                    "rgb("  + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
                    "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
            },
            toName: function() {
                if (this._a === 0) {
                    return "transparent";
                }

                if (this._a < 1) {
                    return false;
                }

                return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
            },
            toFilter: function(secondColor) {
                var hex8String = '#' + rgbaToArgbHex(this._r, this._g, this._b, this._a);
                var secondHex8String = hex8String;
                var gradientType = this._gradientType ? "GradientType = 1, " : "";

                if (secondColor) {
                    var s = tinycolor(secondColor);
                    secondHex8String = '#' + rgbaToArgbHex(s._r, s._g, s._b, s._a);
                }

                return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
            },
            toString: function(format) {
                var formatSet = !!format;
                format = format || this._format;

                var formattedString = false;
                var hasAlpha = this._a < 1 && this._a >= 0;
                var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "hex4" || format === "hex8" || format === "name");

                if (needsAlphaFormat) {
                    // Special case for "transparent", all other non-alpha formats
                    // will return rgba when there is transparency.
                    if (format === "name" && this._a === 0) {
                        return this.toName();
                    }
                    return this.toRgbString();
                }
                if (format === "rgb") {
                    formattedString = this.toRgbString();
                }
                if (format === "prgb") {
                    formattedString = this.toPercentageRgbString();
                }
                if (format === "hex" || format === "hex6") {
                    formattedString = this.toHexString();
                }
                if (format === "hex3") {
                    formattedString = this.toHexString(true);
                }
                if (format === "hex4") {
                    formattedString = this.toHex8String(true);
                }
                if (format === "hex8") {
                    formattedString = this.toHex8String();
                }
                if (format === "name") {
                    formattedString = this.toName();
                }
                if (format === "hsl") {
                    formattedString = this.toHslString();
                }
                if (format === "hsv") {
                    formattedString = this.toHsvString();
                }

                return formattedString || this.toHexString();
            },
            clone: function() {
                return tinycolor(this.toString());
            },

            _applyModification: function(fn, args) {
                var color = fn.apply(null, [this].concat([].slice.call(args)));
                this._r = color._r;
                this._g = color._g;
                this._b = color._b;
                this.setAlpha(color._a);
                return this;
            },
            lighten: function() {
                return this._applyModification(lighten, arguments);
            },
            brighten: function() {
                return this._applyModification(brighten, arguments);
            },
            darken: function() {
                return this._applyModification(darken, arguments);
            },
            desaturate: function() {
                return this._applyModification(desaturate, arguments);
            },
            saturate: function() {
                return this._applyModification(saturate, arguments);
            },
            greyscale: function() {
                return this._applyModification(greyscale, arguments);
            },
            spin: function() {
                return this._applyModification(spin, arguments);
            },

            _applyCombination: function(fn, args) {
                return fn.apply(null, [this].concat([].slice.call(args)));
            },
            analogous: function() {
                return this._applyCombination(analogous, arguments);
            },
            complement: function() {
                return this._applyCombination(complement, arguments);
            },
            monochromatic: function() {
                return this._applyCombination(monochromatic, arguments);
            },
            splitcomplement: function() {
                return this._applyCombination(splitcomplement, arguments);
            },
            triad: function() {
                return this._applyCombination(triad, arguments);
            },
            tetrad: function() {
                return this._applyCombination(tetrad, arguments);
            }
        };

// If input is an object, force 1 into "1.0" to handle ratios properly
// String input requires "1.0" as input, so 1 will be treated as 1
        tinycolor.fromRatio = function(color, opts) {
            if (typeof color == "object") {
                var newColor = {};
                for (var i in color) {
                    if (color.hasOwnProperty(i)) {
                        if (i === "a") {
                            newColor[i] = color[i];
                        }
                        else {
                            newColor[i] = convertToPercentage(color[i]);
                        }
                    }
                }
                color = newColor;
            }

            return tinycolor(color, opts);
        };

// Given a string or object, convert that input to RGB
// Possible string inputs:
//
//     "red"
//     "#f00" or "f00"
//     "#ff0000" or "ff0000"
//     "#ff000000" or "ff000000"
//     "rgb 255 0 0" or "rgb (255, 0, 0)"
//     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
//     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
//     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
//     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
//     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
//     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
//
        function inputToRGB(color) {

            var rgb = { r: 0, g: 0, b: 0 };
            var a = 1;
            var s = null;
            var v = null;
            var l = null;
            var ok = false;
            var format = false;

            if (typeof color == "string") {
                color = stringInputToObject(color);
            }

            if (typeof color == "object") {
                if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
                    rgb = rgbToRgb(color.r, color.g, color.b);
                    ok = true;
                    format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
                }
                else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
                    s = convertToPercentage(color.s);
                    v = convertToPercentage(color.v);
                    rgb = hsvToRgb(color.h, s, v);
                    ok = true;
                    format = "hsv";
                }
                else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
                    s = convertToPercentage(color.s);
                    l = convertToPercentage(color.l);
                    rgb = hslToRgb(color.h, s, l);
                    ok = true;
                    format = "hsl";
                }

                if (color.hasOwnProperty("a")) {
                    a = color.a;
                }
            }

            a = boundAlpha(a);

            return {
                ok: ok,
                format: color.format || format,
                r: mathMin(255, mathMax(rgb.r, 0)),
                g: mathMin(255, mathMax(rgb.g, 0)),
                b: mathMin(255, mathMax(rgb.b, 0)),
                a: a
            };
        }


// Conversion Functions
// --------------------

// `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
// <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

// `rgbToRgb`
// Handle bounds / percentage checking to conform to CSS color spec
// <http://www.w3.org/TR/css3-color/>
// *Assumes:* r, g, b in [0, 255] or [0, 1]
// *Returns:* { r, g, b } in [0, 255]
        function rgbToRgb(r, g, b){
            return {
                r: bound01(r, 255) * 255,
                g: bound01(g, 255) * 255,
                b: bound01(b, 255) * 255
            };
        }

// `rgbToHsl`
// Converts an RGB color value to HSL.
// *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
// *Returns:* { h, s, l } in [0,1]
        function rgbToHsl(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = mathMax(r, g, b), min = mathMin(r, g, b);
            var h, s, l = (max + min) / 2;

            if(max == min) {
                h = s = 0; // achromatic
            }
            else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch(max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
            }

            return { h: h, s: s, l: l };
        }

// `hslToRgb`
// Converts an HSL color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
        function hslToRgb(h, s, l) {
            var r, g, b;

            h = bound01(h, 360);
            s = bound01(s, 100);
            l = bound01(l, 100);

            function hue2rgb(p, q, t) {
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            if(s === 0) {
                r = g = b = l; // achromatic
            }
            else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            return { r: r * 255, g: g * 255, b: b * 255 };
        }

// `rgbToHsv`
// Converts an RGB color value to HSV
// *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
// *Returns:* { h, s, v } in [0,1]
        function rgbToHsv(r, g, b) {

            r = bound01(r, 255);
            g = bound01(g, 255);
            b = bound01(b, 255);

            var max = mathMax(r, g, b), min = mathMin(r, g, b);
            var h, s, v = max;

            var d = max - min;
            s = max === 0 ? 0 : d / max;

            if(max == min) {
                h = 0; // achromatic
            }
            else {
                switch(max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: h, s: s, v: v };
        }

// `hsvToRgb`
// Converts an HSV color value to RGB.
// *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
// *Returns:* { r, g, b } in the set [0, 255]
        function hsvToRgb(h, s, v) {

            h = bound01(h, 360) * 6;
            s = bound01(s, 100);
            v = bound01(v, 100);

            var i = Math.floor(h),
                f = h - i,
                p = v * (1 - s),
                q = v * (1 - f * s),
                t = v * (1 - (1 - f) * s),
                mod = i % 6,
                r = [v, q, p, p, t, v][mod],
                g = [t, v, v, q, p, p][mod],
                b = [p, p, t, v, v, q][mod];

            return { r: r * 255, g: g * 255, b: b * 255 };
        }

// `rgbToHex`
// Converts an RGB color to hex
// Assumes r, g, and b are contained in the set [0, 255]
// Returns a 3 or 6 character hex
        function rgbToHex(r, g, b, allow3Char) {

            var hex = [
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16))
            ];

            // Return a 3 character hex if possible
            if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
                return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
            }

            return hex.join("");
        }

// `rgbaToHex`
// Converts an RGBA color plus alpha transparency to hex
// Assumes r, g, b are contained in the set [0, 255] and
// a in [0, 1]. Returns a 4 or 8 character rgba hex
        function rgbaToHex(r, g, b, a, allow4Char) {

            var hex = [
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16)),
                pad2(convertDecimalToHex(a))
            ];

            // Return a 4 character hex if possible
            if (allow4Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1) && hex[3].charAt(0) == hex[3].charAt(1)) {
                return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
            }

            return hex.join("");
        }

// `rgbaToArgbHex`
// Converts an RGBA color to an ARGB Hex8 string
// Rarely used, but required for "toFilter()"
        function rgbaToArgbHex(r, g, b, a) {

            var hex = [
                pad2(convertDecimalToHex(a)),
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16))
            ];

            return hex.join("");
        }

// `equals`
// Can be called with any tinycolor input
        tinycolor.equals = function (color1, color2) {
            if (!color1 || !color2) { return false; }
            return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
        };

        tinycolor.random = function() {
            return tinycolor.fromRatio({
                r: mathRandom(),
                g: mathRandom(),
                b: mathRandom()
            });
        };


// Modification Functions
// ----------------------
// Thanks to less.js for some of the basics here
// <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

        function desaturate(color, amount) {
            amount = (amount === 0) ? 0 : (amount || 10);
            var hsl = tinycolor(color).toHsl();
            hsl.s -= amount / 100;
            hsl.s = clamp01(hsl.s);
            return tinycolor(hsl);
        }

        function saturate(color, amount) {
            amount = (amount === 0) ? 0 : (amount || 10);
            var hsl = tinycolor(color).toHsl();
            hsl.s += amount / 100;
            hsl.s = clamp01(hsl.s);
            return tinycolor(hsl);
        }

        function greyscale(color) {
            return tinycolor(color).desaturate(100);
        }

        function lighten (color, amount) {
            amount = (amount === 0) ? 0 : (amount || 10);
            var hsl = tinycolor(color).toHsl();
            hsl.l += amount / 100;
            hsl.l = clamp01(hsl.l);
            return tinycolor(hsl);
        }

        function brighten(color, amount) {
            amount = (amount === 0) ? 0 : (amount || 10);
            var rgb = tinycolor(color).toRgb();
            rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
            rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
            rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
            return tinycolor(rgb);
        }

        function darken (color, amount) {
            amount = (amount === 0) ? 0 : (amount || 10);
            var hsl = tinycolor(color).toHsl();
            hsl.l -= amount / 100;
            hsl.l = clamp01(hsl.l);
            return tinycolor(hsl);
        }

// Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
// Values outside of this range will be wrapped into this range.
        function spin(color, amount) {
            var hsl = tinycolor(color).toHsl();
            var hue = (hsl.h + amount) % 360;
            hsl.h = hue < 0 ? 360 + hue : hue;
            return tinycolor(hsl);
        }

// Combination Functions
// ---------------------
// Thanks to jQuery xColor for some of the ideas behind these
// <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

        function complement(color) {
            var hsl = tinycolor(color).toHsl();
            hsl.h = (hsl.h + 180) % 360;
            return tinycolor(hsl);
        }

        function triad(color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h;
            return [
                tinycolor(color),
                tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
                tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
            ];
        }

        function tetrad(color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h;
            return [
                tinycolor(color),
                tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
                tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
                tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
            ];
        }

        function splitcomplement(color) {
            var hsl = tinycolor(color).toHsl();
            var h = hsl.h;
            return [
                tinycolor(color),
                tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
                tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
            ];
        }

        function analogous(color, results, slices) {
            results = results || 6;
            slices = slices || 30;

            var hsl = tinycolor(color).toHsl();
            var part = 360 / slices;
            var ret = [tinycolor(color)];

            for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
                hsl.h = (hsl.h + part) % 360;
                ret.push(tinycolor(hsl));
            }
            return ret;
        }

        function monochromatic(color, results) {
            results = results || 6;
            var hsv = tinycolor(color).toHsv();
            var h = hsv.h, s = hsv.s, v = hsv.v;
            var ret = [];
            var modification = 1 / results;

            while (results--) {
                ret.push(tinycolor({ h: h, s: s, v: v}));
                v = (v + modification) % 1;
            }

            return ret;
        }

// Utility Functions
// ---------------------

        tinycolor.mix = function(color1, color2, amount) {
            amount = (amount === 0) ? 0 : (amount || 50);

            var rgb1 = tinycolor(color1).toRgb();
            var rgb2 = tinycolor(color2).toRgb();

            var p = amount / 100;

            var rgba = {
                r: ((rgb2.r - rgb1.r) * p) + rgb1.r,
                g: ((rgb2.g - rgb1.g) * p) + rgb1.g,
                b: ((rgb2.b - rgb1.b) * p) + rgb1.b,
                a: ((rgb2.a - rgb1.a) * p) + rgb1.a
            };

            return tinycolor(rgba);
        };


// Readability Functions
// ---------------------
// <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

// `contrast`
// Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
        tinycolor.readability = function(color1, color2) {
            var c1 = tinycolor(color1);
            var c2 = tinycolor(color2);
            return (Math.max(c1.getLuminance(),c2.getLuminance())+0.05) / (Math.min(c1.getLuminance(),c2.getLuminance())+0.05);
        };

// `isReadable`
// Ensure that foreground and background color combinations meet WCAG2 guidelines.
// The third argument is an optional Object.
//      the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
//      the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
// If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.

// *Example*
//    tinycolor.isReadable("#000", "#111") => false
//    tinycolor.isReadable("#000", "#111",{level:"AA",size:"large"}) => false
        tinycolor.isReadable = function(color1, color2, wcag2) {
            var readability = tinycolor.readability(color1, color2);
            var wcag2Parms, out;

            out = false;

            wcag2Parms = validateWCAG2Parms(wcag2);
            switch (wcag2Parms.level + wcag2Parms.size) {
                case "AAsmall":
                case "AAAlarge":
                    out = readability >= 4.5;
                    break;
                case "AAlarge":
                    out = readability >= 3;
                    break;
                case "AAAsmall":
                    out = readability >= 7;
                    break;
            }
            return out;

        };

// `mostReadable`
// Given a base color and a list of possible foreground or background
// colors for that base, returns the most readable color.
// Optionally returns Black or White if the most readable color is unreadable.
// *Example*
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:false}).toHexString(); // "#112255"
//    tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:true}).toHexString();  // "#ffffff"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"large"}).toHexString(); // "#faf3f3"
//    tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"small"}).toHexString(); // "#ffffff"
        tinycolor.mostReadable = function(baseColor, colorList, args) {
            var bestColor = null;
            var bestScore = 0;
            var readability;
            var includeFallbackColors, level, size ;
            args = args || {};
            includeFallbackColors = args.includeFallbackColors ;
            level = args.level;
            size = args.size;

            for (var i= 0; i < colorList.length ; i++) {
                readability = tinycolor.readability(baseColor, colorList[i]);
                if (readability > bestScore) {
                    bestScore = readability;
                    bestColor = tinycolor(colorList[i]);
                }
            }

            if (tinycolor.isReadable(baseColor, bestColor, {"level":level,"size":size}) || !includeFallbackColors) {
                return bestColor;
            }
            else {
                args.includeFallbackColors=false;
                return tinycolor.mostReadable(baseColor,["#fff", "#000"],args);
            }
        };


// Big List of Colors
// ------------------
// <http://www.w3.org/TR/css3-color/#svg-color>
        var names = tinycolor.names = {
            aliceblue: "f0f8ff",
            antiquewhite: "faebd7",
            aqua: "0ff",
            aquamarine: "7fffd4",
            azure: "f0ffff",
            beige: "f5f5dc",
            bisque: "ffe4c4",
            black: "000",
            blanchedalmond: "ffebcd",
            blue: "00f",
            blueviolet: "8a2be2",
            brown: "a52a2a",
            burlywood: "deb887",
            burntsienna: "ea7e5d",
            cadetblue: "5f9ea0",
            chartreuse: "7fff00",
            chocolate: "d2691e",
            coral: "ff7f50",
            cornflowerblue: "6495ed",
            cornsilk: "fff8dc",
            crimson: "dc143c",
            cyan: "0ff",
            darkblue: "00008b",
            darkcyan: "008b8b",
            darkgoldenrod: "b8860b",
            darkgray: "a9a9a9",
            darkgreen: "006400",
            darkgrey: "a9a9a9",
            darkkhaki: "bdb76b",
            darkmagenta: "8b008b",
            darkolivegreen: "556b2f",
            darkorange: "ff8c00",
            darkorchid: "9932cc",
            darkred: "8b0000",
            darksalmon: "e9967a",
            darkseagreen: "8fbc8f",
            darkslateblue: "483d8b",
            darkslategray: "2f4f4f",
            darkslategrey: "2f4f4f",
            darkturquoise: "00ced1",
            darkviolet: "9400d3",
            deeppink: "ff1493",
            deepskyblue: "00bfff",
            dimgray: "696969",
            dimgrey: "696969",
            dodgerblue: "1e90ff",
            firebrick: "b22222",
            floralwhite: "fffaf0",
            forestgreen: "228b22",
            fuchsia: "f0f",
            gainsboro: "dcdcdc",
            ghostwhite: "f8f8ff",
            gold: "ffd700",
            goldenrod: "daa520",
            gray: "808080",
            green: "008000",
            greenyellow: "adff2f",
            grey: "808080",
            honeydew: "f0fff0",
            hotpink: "ff69b4",
            indianred: "cd5c5c",
            indigo: "4b0082",
            ivory: "fffff0",
            khaki: "f0e68c",
            lavender: "e6e6fa",
            lavenderblush: "fff0f5",
            lawngreen: "7cfc00",
            lemonchiffon: "fffacd",
            lightblue: "add8e6",
            lightcoral: "f08080",
            lightcyan: "e0ffff",
            lightgoldenrodyellow: "fafad2",
            lightgray: "d3d3d3",
            lightgreen: "90ee90",
            lightgrey: "d3d3d3",
            lightpink: "ffb6c1",
            lightsalmon: "ffa07a",
            lightseagreen: "20b2aa",
            lightskyblue: "87cefa",
            lightslategray: "789",
            lightslategrey: "789",
            lightsteelblue: "b0c4de",
            lightyellow: "ffffe0",
            lime: "0f0",
            limegreen: "32cd32",
            linen: "faf0e6",
            magenta: "f0f",
            maroon: "800000",
            mediumaquamarine: "66cdaa",
            mediumblue: "0000cd",
            mediumorchid: "ba55d3",
            mediumpurple: "9370db",
            mediumseagreen: "3cb371",
            mediumslateblue: "7b68ee",
            mediumspringgreen: "00fa9a",
            mediumturquoise: "48d1cc",
            mediumvioletred: "c71585",
            midnightblue: "191970",
            mintcream: "f5fffa",
            mistyrose: "ffe4e1",
            moccasin: "ffe4b5",
            navajowhite: "ffdead",
            navy: "000080",
            oldlace: "fdf5e6",
            olive: "808000",
            olivedrab: "6b8e23",
            orange: "ffa500",
            orangered: "ff4500",
            orchid: "da70d6",
            palegoldenrod: "eee8aa",
            palegreen: "98fb98",
            paleturquoise: "afeeee",
            palevioletred: "db7093",
            papayawhip: "ffefd5",
            peachpuff: "ffdab9",
            peru: "cd853f",
            pink: "ffc0cb",
            plum: "dda0dd",
            powderblue: "b0e0e6",
            purple: "800080",
            rebeccapurple: "663399",
            red: "f00",
            rosybrown: "bc8f8f",
            royalblue: "4169e1",
            saddlebrown: "8b4513",
            salmon: "fa8072",
            sandybrown: "f4a460",
            seagreen: "2e8b57",
            seashell: "fff5ee",
            sienna: "a0522d",
            silver: "c0c0c0",
            skyblue: "87ceeb",
            slateblue: "6a5acd",
            slategray: "708090",
            slategrey: "708090",
            snow: "fffafa",
            springgreen: "00ff7f",
            steelblue: "4682b4",
            tan: "d2b48c",
            teal: "008080",
            thistle: "d8bfd8",
            tomato: "ff6347",
            turquoise: "40e0d0",
            violet: "ee82ee",
            wheat: "f5deb3",
            white: "fff",
            whitesmoke: "f5f5f5",
            yellow: "ff0",
            yellowgreen: "9acd32"
        };

// Make it easy to access colors via `hexNames[hex]`
        var hexNames = tinycolor.hexNames = flip(names);


// Utilities
// ---------

// `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
        function flip(o) {
            var flipped = { };
            for (var i in o) {
                if (o.hasOwnProperty(i)) {
                    flipped[o[i]] = i;
                }
            }
            return flipped;
        }

// Return a valid alpha value [0,1] with all invalid values being set to 1
        function boundAlpha(a) {
            a = parseFloat(a);

            if (isNaN(a) || a < 0 || a > 1) {
                a = 1;
            }

            return a;
        }

// Take input from [0, n] and return it as [0, 1]
        function bound01(n, max) {
            if (isOnePointZero(n)) { n = "100%"; }

            var processPercent = isPercentage(n);
            n = mathMin(max, mathMax(0, parseFloat(n)));

            // Automatically convert percentage into number
            if (processPercent) {
                n = parseInt(n * max, 10) / 100;
            }

            // Handle floating point rounding errors
            if ((Math.abs(n - max) < 0.000001)) {
                return 1;
            }

            // Convert into [0, 1] range if it isn't already
            return (n % max) / parseFloat(max);
        }

// Force a number between 0 and 1
        function clamp01(val) {
            return mathMin(1, mathMax(0, val));
        }

// Parse a base-16 hex value into a base-10 integer
        function parseIntFromHex(val) {
            return parseInt(val, 16);
        }

// Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
// <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
        function isOnePointZero(n) {
            return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
        }

// Check to see if string passed in is a percentage
        function isPercentage(n) {
            return typeof n === "string" && n.indexOf('%') != -1;
        }

// Force a hex value to have 2 characters
        function pad2(c) {
            return c.length == 1 ? '0' + c : '' + c;
        }

// Replace a decimal with it's percentage value
        function convertToPercentage(n) {
            if (n <= 1) {
                n = (n * 100) + "%";
            }

            return n;
        }

// Converts a decimal to a hex value
        function convertDecimalToHex(d) {
            return Math.round(parseFloat(d) * 255).toString(16);
        }
// Converts a hex value to a decimal
        function convertHexToDecimal(h) {
            return (parseIntFromHex(h) / 255);
        }

        var matchers = (function() {

            // <http://www.w3.org/TR/css3-values/#integers>
            var CSS_INTEGER = "[-\\+]?\\d+%?";

            // <http://www.w3.org/TR/css3-values/#number-value>
            var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

            // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
            var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

            // Actual matching.
            // Parentheses and commas are optional, but not required.
            // Whitespace can take the place of commas or opening paren
            var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
            var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

            return {
                CSS_UNIT: new RegExp(CSS_UNIT),
                rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
                rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
                hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
                hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
                hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
                hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
                hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
                hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
                hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
                hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
            };
        })();

// `isValidCSSUnit`
// Take in a single string / number and check to see if it looks like a CSS unit
// (see `matchers` above for definition).
        function isValidCSSUnit(color) {
            return !!matchers.CSS_UNIT.exec(color);
        }

// `stringInputToObject`
// Permissive string parsing.  Take in a number of formats, and output an object
// based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
        function stringInputToObject(color) {

            color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
            var named = false;
            if (names[color]) {
                color = names[color];
                named = true;
            }
            else if (color == 'transparent') {
                return { r: 0, g: 0, b: 0, a: 0, format: "name" };
            }

            // Try to match string input using regular expressions.
            // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
            // Just return an object and let the conversion functions handle that.
            // This way the result will be the same whether the tinycolor is initialized with string or object.
            var match;
            if ((match = matchers.rgb.exec(color))) {
                return { r: match[1], g: match[2], b: match[3] };
            }
            if ((match = matchers.rgba.exec(color))) {
                return { r: match[1], g: match[2], b: match[3], a: match[4] };
            }
            if ((match = matchers.hsl.exec(color))) {
                return { h: match[1], s: match[2], l: match[3] };
            }
            if ((match = matchers.hsla.exec(color))) {
                return { h: match[1], s: match[2], l: match[3], a: match[4] };
            }
            if ((match = matchers.hsv.exec(color))) {
                return { h: match[1], s: match[2], v: match[3] };
            }
            if ((match = matchers.hsva.exec(color))) {
                return { h: match[1], s: match[2], v: match[3], a: match[4] };
            }
            if ((match = matchers.hex8.exec(color))) {
                return {
                    r: parseIntFromHex(match[1]),
                    g: parseIntFromHex(match[2]),
                    b: parseIntFromHex(match[3]),
                    a: convertHexToDecimal(match[4]),
                    format: named ? "name" : "hex8"
                };
            }
            if ((match = matchers.hex6.exec(color))) {
                return {
                    r: parseIntFromHex(match[1]),
                    g: parseIntFromHex(match[2]),
                    b: parseIntFromHex(match[3]),
                    format: named ? "name" : "hex"
                };
            }
            if ((match = matchers.hex4.exec(color))) {
                return {
                    r: parseIntFromHex(match[1] + '' + match[1]),
                    g: parseIntFromHex(match[2] + '' + match[2]),
                    b: parseIntFromHex(match[3] + '' + match[3]),
                    a: convertHexToDecimal(match[4] + '' + match[4]),
                    format: named ? "name" : "hex8"
                };
            }
            if ((match = matchers.hex3.exec(color))) {
                return {
                    r: parseIntFromHex(match[1] + '' + match[1]),
                    g: parseIntFromHex(match[2] + '' + match[2]),
                    b: parseIntFromHex(match[3] + '' + match[3]),
                    format: named ? "name" : "hex"
                };
            }

            return false;
        }

        function validateWCAG2Parms(parms) {
            // return valid WCAG2 parms for isReadable.
            // If input parms are invalid, return {"level":"AA", "size":"small"}
            var level, size;
            parms = parms || {"level":"AA", "size":"small"};
            level = (parms.level || "AA").toUpperCase();
            size = (parms.size || "small").toLowerCase();
            if (level !== "AA" && level !== "AAA") {
                level = "AA";
            }
            if (size !== "small" && size !== "large") {
                size = "small";
            }
            return {"level":level, "size":size};
        }

// Node: Export function
        if ( module.exports) {
            module.exports = tinycolor;
        }
// AMD/requirejs: Define the module
        else {
            window.tinycolor = tinycolor;
        }

    })(Math);
});

function _colorChange (data, oldHue) {
    const alpha = data && data.a;
    let color;

    // hsl is better than hex between conversions
    if (data && data.hsl) {
        color = tinycolor(data.hsl);
    } else if (data && data.hex && data.hex.length > 0) {
        color = tinycolor(data.hex);
    } else if (data && data.hsv) {
        color = tinycolor(data.hsv);
    } else if (data && data.rgba) {
        color = tinycolor(data.rgba);
    } else if (data && data.rgb) {
        color = tinycolor(data.rgb);
    } else {
        color = tinycolor(data);
    }

    if (color && (color._a === undefined || color._a === null)) {
        color.setAlpha(alpha || 1);
    }

    const hsl = color.toHsl();
    const hsv = color.toHsv();

    if (hsl.s === 0) {
        hsv.h = hsl.h = data.h || (data.hsl && data.hsl.h) || oldHue || 0;
    }

    /* --- comment this block to fix #109, may cause #25 again --- */
    // when the hsv.v is less than 0.0164 (base on test)
    // because of possible loss of precision
    // the result of hue and saturation would be miscalculated
    // if (hsv.v < 0.0164) {
    //   hsv.h = data.h || (data.hsv && data.hsv.h) || 0
    //   hsv.s = data.s || (data.hsv && data.hsv.s) || 0
    // }

    // if (hsl.l < 0.01) {
    //   hsl.h = data.h || (data.hsl && data.hsl.h) || 0
    //   hsl.s = data.s || (data.hsl && data.hsl.s) || 0
    // }
    /* ------ */

    return {
        hsl: hsl,
        hex: color.toHexString().toUpperCase(),
        hex8: color.toHex8String().toUpperCase(),
        rgba: color.toRgb(),
        hsv: hsv,
        oldHue: data.h || oldHue || hsl.h,
        source: data.source,
        a: data.a || color.getAlpha()
    }
}

var colorMixin = {
    props: ['value'],
    data () {
        return {
            val: _colorChange(this.value)
        }
    },
    computed: {
        colors: {
            get () {
                return this.val
            },
            set (newVal) {
                this.val = newVal;
                this.$emit('input', newVal);
            }
        }
    },
    watch: {
        value (newVal) {
            this.val = _colorChange(newVal);
        }
    },
    methods: {
        colorChange (data, oldHue) {
            this.oldHue = this.colors.hsl.h;
            this.colors = _colorChange(data, oldHue || this.oldHue);
        },
        isValidHex (hex) {
            return tinycolor(hex).isValid()
        },
        simpleCheckForValidColor (data) {
            const keysToCheck = ['r', 'g', 'b', 'a', 'h', 's', 'l', 'v'];
            let checked = 0;
            let passed = 0;

            for (let i = 0; i < keysToCheck.length; i++) {
                const letter = keysToCheck[i];
                if (data[letter]) {
                    checked++;
                    if (!isNaN(data[letter])) {
                        passed++;
                    }
                }
            }

            if (checked === passed) {
                return data
            }
        },
        paletteUpperCase (palette) {
            return palette.map(c => c.toUpperCase())
        },
        isTransparent (color) {
            return tinycolor(color).getAlpha() === 0
        }
    }
};

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script = {
    name: 'editableInput',
    props: {
        label: String,
        labelText: String,
        desc: String,
        value: [String, Number],
        max: Number,
        min: Number,
        arrowOffset: {
            type: Number,
            default: 1
        }
    },
    computed: {
        val: {
            get () {
                return this.value
            },
            set (v) {
                if (!(this.max === undefined) && +v > this.max) {
                    this.$refs.input.value = this.max;
                } else {
                    return v
                }
            }
        },
        labelId () {
            return `input__label__${this.label}__${Math.random().toString().slice(2, 5)}`
        },
        labelSpanText () {
            return this.labelText || this.label
        }
    },
    methods: {
        update (e) {
            this.handleChange(e.target.value);
        },
        handleChange (newVal) {
            let data = {};
            data[this.label] = newVal;
            if (data.hex === undefined && data['#'] === undefined) {
                this.$emit('change', data);
            } else if (newVal.length > 5) {
                this.$emit('change', data);
            }
        },

        handleKeyDown (e) {
            let val = this.val;
            let number = Number(val);

            if (number) {
                let amount = this.arrowOffset || 1;

                // Up
                if (e.keyCode === 38) {
                    val = number + amount;
                    this.handleChange(val);
                    e.preventDefault();
                }

                // Down
                if (e.keyCode === 40) {
                    val = number - amount;
                    this.handleChange(val);
                    e.preventDefault();
                }
            }
        }
    }
};

function /*#__PURE__*/normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                (this.$vnode && this.$vnode.ssrContext) || // stateful
                (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vc-editable-input"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.val),expression:"val"}],ref:"input",staticClass:"vc-input__input",attrs:{"aria-labelledby":_vm.labelId},domProps:{"value":(_vm.val)},on:{"keydown":_vm.handleKeyDown,"input":[function($event){if($event.target.composing){ return; }_vm.val=$event.target.value;},_vm.update]}}),_vm._v(" "),_c('span',{staticClass:"vc-input__label",attrs:{"for":_vm.label,"id":_vm.labelId}},[_vm._v(_vm._s(_vm.labelSpanText))]),_vm._v(" "),_c('span',{staticClass:"vc-input__desc"},[_vm._v(_vm._s(_vm.desc))])])};

    return r
})();
var __vue_staticRenderFns__ = [];

/* style */
const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-68903e05_0", { source: ".vc-editable-input{position:relative}.vc-input__input{padding:0;border:0;outline:0}.vc-input__label{text-transform:capitalize}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__ = undefined;
/* module identifier */
const __vue_module_identifier__ = undefined;
/* functional template */
const __vue_is_functional_template__ = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
);

//

const defaultColors = [
    '#4D4D4D', '#999999', '#FFFFFF', '#F44E3B', '#FE9200', '#FCDC00',
    '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF',
    '#333333', '#808080', '#CCCCCC', '#D33115', '#E27300', '#FCC400',
    '#B0BC00', '#68BC00', '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF',
    '#000000', '#666666', '#B3B3B3', '#9F0500', '#C45100', '#FB9E00',
    '#808900', '#194D33', '#0C797D', '#0062B1', '#653294', '#AB149E'
];

var script$1 = {
    name: 'Compact',
    mixins: [colorMixin],
    props: {
        palette: {
            type: Array,
            default () {
                return defaultColors
            }
        }
    },
    components: {
        'ed-in': __vue_component__
    },
    computed: {
        pick () {
            return this.colors.hex.toUpperCase()
        }
    },
    methods: {
        handlerClick (c) {
            this.colorChange({
                hex: c,
                source: 'hex'
            });
        }
    }
};

/* script */
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vc-compact",attrs:{"role":"application","aria-label":"Compact color picker"}},[_c('ul',{staticClass:"vc-compact-colors",attrs:{"role":"listbox"}},_vm._l((_vm.paletteUpperCase(_vm.palette)),function(c){return _c('li',{key:c,staticClass:"vc-compact-color-item",class:{'vc-compact-color-item--white': c === '#FFFFFF' },style:({background: c}),attrs:{"role":"option","aria-label":'color:' + c,"aria-selected":c === _vm.pick},on:{"click":function($event){return _vm.handlerClick(c)}}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(c === _vm.pick),expression:"c === pick"}],staticClass:"vc-compact-dot"})])}),0)])};

    return r
})();
var __vue_staticRenderFns__$1 = [];

/* style */
const __vue_inject_styles__$1 = function (inject) {
    if (!inject) return
    inject("data-v-3392c6a9_0", { source: ".vc-compact{padding-top:5px;padding-left:5px;width:245px;border-radius:2px;box-sizing:border-box;box-shadow:0 2px 10px rgba(0,0,0,.12),0 2px 5px rgba(0,0,0,.16);background-color:#fff}.vc-compact-colors{overflow:hidden;padding:0;margin:0}.vc-compact-color-item{list-style:none;width:15px;height:15px;float:left;margin-right:5px;margin-bottom:5px;position:relative;cursor:pointer}.vc-compact-color-item--white{box-shadow:inset 0 0 0 1px #ddd}.vc-compact-color-item--white .vc-compact-dot{background:#000}.vc-compact-dot{position:absolute;top:5px;right:5px;bottom:5px;left:5px;border-radius:50%;opacity:1;background:#fff}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__$1 = undefined;
/* module identifier */
const __vue_module_identifier__$1 = undefined;
/* functional template */
const __vue_is_functional_template__$1 = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__$1 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    false,
    createInjector,
    undefined,
    undefined
);

//

const defaultColors$1 = [
    '#FFFFFF', '#F2F2F2', '#E6E6E6', '#D9D9D9', '#CCCCCC', '#BFBFBF', '#B3B3B3',
    '#A6A6A6', '#999999', '#8C8C8C', '#808080', '#737373', '#666666', '#595959',
    '#4D4D4D', '#404040', '#333333', '#262626', '#0D0D0D', '#000000'
];

var script$2 = {
    name: 'Grayscale',
    mixins: [colorMixin],
    props: {
        palette: {
            type: Array,
            default () {
                return defaultColors$1
            }
        }
    },
    components: {

    },
    computed: {
        pick () {
            return this.colors.hex.toUpperCase()
        }
    },
    methods: {
        handlerClick (c) {
            this.colorChange({
                hex: c,
                source: 'hex'
            });
        }
    }
};

/* script */
const __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vc-grayscale",attrs:{"role":"application","aria-label":"Grayscale color picker"}},[_c('ul',{staticClass:"vc-grayscale-colors",attrs:{"role":"listbox"}},_vm._l((_vm.paletteUpperCase(_vm.palette)),function(c){return _c('li',{key:c,staticClass:"vc-grayscale-color-item",class:{'vc-grayscale-color-item--white': c == '#FFFFFF'},style:({background: c}),attrs:{"role":"option","aria-label":'Color:' + c,"aria-selected":c === _vm.pick},on:{"click":function($event){return _vm.handlerClick(c)}}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(c === _vm.pick),expression:"c === pick"}],staticClass:"vc-grayscale-dot"})])}),0)])};

    return r
})();
var __vue_staticRenderFns__$2 = [];

/* style */
const __vue_inject_styles__$2 = function (inject) {
    if (!inject) return
    inject("data-v-614e74bc_0", { source: ".vc-grayscale{width:125px;border-radius:2px;box-shadow:0 2px 15px rgba(0,0,0,.12),0 2px 10px rgba(0,0,0,.16);background-color:#fff}.vc-grayscale-colors{border-radius:2px;overflow:hidden;padding:0;margin:0}.vc-grayscale-color-item{list-style:none;width:25px;height:25px;float:left;position:relative;cursor:pointer}.vc-grayscale-color-item--white .vc-grayscale-dot{background:#000}.vc-grayscale-dot{position:absolute;top:50%;left:50%;width:6px;height:6px;margin:-3px 0 0 -2px;border-radius:50%;opacity:1;background:#fff}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__$2 = undefined;
/* module identifier */
const __vue_module_identifier__$2 = undefined;
/* functional template */
const __vue_is_functional_template__$2 = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__$2 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    false,
    createInjector,
    undefined,
    undefined
);

//

var script$3 = {
    name: 'Material',
    mixins: [colorMixin],
    components: {
        'ed-in': __vue_component__
    },
    methods: {
        onChange (data) {
            if (!data) {
                return
            }
            if (data.hex) {
                this.isValidHex(data.hex) && this.colorChange({
                    hex: data.hex,
                    source: 'hex'
                });
            } else if (data.r || data.g || data.b) {
                this.colorChange({
                    r: data.r || this.colors.rgba.r,
                    g: data.g || this.colors.rgba.g,
                    b: data.b || this.colors.rgba.b,
                    a: data.a || this.colors.rgba.a,
                    source: 'rgba'
                });
            }
        }
    }
};

/* script */
const __vue_script__$3 = script$3;

/* template */
var __vue_render__$3 = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vc-material",attrs:{"role":"application","aria-label":"Material color picker"}},[_c('ed-in',{staticClass:"vc-material-hex",style:({ borderColor: _vm.colors.hex }),attrs:{"label":"hex"},on:{"change":_vm.onChange},model:{value:(_vm.colors.hex),callback:function ($$v) {_vm.$set(_vm.colors, "hex", $$v);},expression:"colors.hex"}}),_vm._v(" "),_c('div',{staticClass:"vc-material-split"},[_c('div',{staticClass:"vc-material-third"},[_c('ed-in',{attrs:{"label":"r"},on:{"change":_vm.onChange},model:{value:(_vm.colors.rgba.r),callback:function ($$v) {_vm.$set(_vm.colors.rgba, "r", $$v);},expression:"colors.rgba.r"}})],1),_vm._v(" "),_c('div',{staticClass:"vc-material-third"},[_c('ed-in',{attrs:{"label":"g"},on:{"change":_vm.onChange},model:{value:(_vm.colors.rgba.g),callback:function ($$v) {_vm.$set(_vm.colors.rgba, "g", $$v);},expression:"colors.rgba.g"}})],1),_vm._v(" "),_c('div',{staticClass:"vc-material-third"},[_c('ed-in',{attrs:{"label":"b"},on:{"change":_vm.onChange},model:{value:(_vm.colors.rgba.b),callback:function ($$v) {_vm.$set(_vm.colors.rgba, "b", $$v);},expression:"colors.rgba.b"}})],1)])],1)};

    return r
})();
var __vue_staticRenderFns__$3 = [];

/* style */
const __vue_inject_styles__$3 = function (inject) {
    if (!inject) return
    inject("data-v-58fe4321_0", { source: ".vc-material{width:98px;height:98px;padding:16px;font-family:Roboto;position:relative;border-radius:2px;box-shadow:0 2px 10px rgba(0,0,0,.12),0 2px 5px rgba(0,0,0,.16);background-color:#fff}.vc-material .vc-input__input{width:100%;margin-top:12px;font-size:15px;color:#333;height:30px}.vc-material .vc-input__label{position:absolute;top:0;left:0;font-size:11px;color:#999;text-transform:capitalize}.vc-material-hex{border-bottom-width:2px;border-bottom-style:solid}.vc-material-split{display:flex;margin-right:-10px;padding-top:11px}.vc-material-third{flex:1;padding-right:10px}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__$3 = undefined;
/* module identifier */
const __vue_module_identifier__$3 = undefined;
/* functional template */
const __vue_is_functional_template__$3 = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__$3 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    false,
    createInjector,
    undefined,
    undefined
);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script$4 = {
    name: 'Hue',
    props: {
        value: Object,
        direction: {
            type: String,
            // [horizontal | vertical]
            default: 'horizontal'
        }
    },
    data () {
        return {
            oldHue: 0,
            pullDirection: ''
        }
    },
    computed: {
        colors () {
            const h = this.value.hsl.h;
            if (h !== 0 && h - this.oldHue > 0) this.pullDirection = 'right';
            if (h !== 0 && h - this.oldHue < 0) this.pullDirection = 'left';
            this.oldHue = h;

            return this.value
        },
        directionClass () {
            return {
                'vc-hue--horizontal': this.direction === 'horizontal',
                'vc-hue--vertical': this.direction === 'vertical'
            }
        },
        pointerTop () {
            if (this.direction === 'vertical') {
                if (this.colors.hsl.h === 0 && this.pullDirection === 'right') return 0
                return -((this.colors.hsl.h * 100) / 360) + 100 + '%'
            } else {
                return 0
            }
        },
        pointerLeft () {
            if (this.direction === 'vertical') {
                return 0
            } else {
                if (this.colors.hsl.h === 0 && this.pullDirection === 'right') return '100%'
                return (this.colors.hsl.h * 100) / 360 + '%'
            }
        }
    },
    methods: {
        handleChange (e, skip) {
            !skip && e.preventDefault();

            const container = this.$refs.container;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            const xOffset = container.getBoundingClientRect().left + window.pageXOffset;
            const yOffset = container.getBoundingClientRect().top + window.pageYOffset;
            const pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
            const pageY = e.pageY || (e.touches ? e.touches[0].pageY : 0);
            const left = pageX - xOffset;
            const top = pageY - yOffset;

            let h;
            let percent;

            if (this.direction === 'vertical') {
                if (top < 0) {
                    h = 360;
                } else if (top > containerHeight) {
                    h = 0;
                } else {
                    percent = -(top * 100 / containerHeight) + 100;
                    h = (360 * percent / 100);
                }

                if (this.colors.hsl.h !== h) {
                    this.$emit('change', {
                        h: h,
                        s: this.colors.hsl.s,
                        l: this.colors.hsl.l,
                        a: this.colors.hsl.a,
                        source: 'hsl'
                    });
                }
            } else {
                if (left < 0) {
                    h = 0;
                } else if (left > containerWidth) {
                    h = 360;
                } else {
                    percent = left * 100 / containerWidth;
                    h = (360 * percent / 100);
                }

                if (this.colors.hsl.h !== h) {
                    this.$emit('change', {
                        h: h,
                        s: this.colors.hsl.s,
                        l: this.colors.hsl.l,
                        a: this.colors.hsl.a,
                        source: 'hsl'
                    });
                }
            }
        },
        handleMouseDown (e) {
            this.handleChange(e, true);
            window.addEventListener('mousemove', this.handleChange);
            window.addEventListener('mouseup', this.handleMouseUp);
        },
        handleMouseUp (e) {
            this.unbindEventListeners();
        },
        unbindEventListeners () {
            window.removeEventListener('mousemove', this.handleChange);
            window.removeEventListener('mouseup', this.handleMouseUp);
        }
    }
};

/* script */
const __vue_script__$4 = script$4;

/* template */
var __vue_render__$4 = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:['vc-hue', _vm.directionClass]},[_c('div',{ref:"container",staticClass:"vc-hue-container",attrs:{"role":"slider","aria-valuenow":_vm.colors.hsl.h,"aria-valuemin":"0","aria-valuemax":"360"},on:{"mousedown":_vm.handleMouseDown,"touchmove":_vm.handleChange,"touchstart":_vm.handleChange}},[_c('div',{staticClass:"vc-hue-pointer",style:({top: _vm.pointerTop, left: _vm.pointerLeft}),attrs:{"role":"presentation"}},[_c('div',{staticClass:"vc-hue-picker"})])])])};

    return r
})();
var __vue_staticRenderFns__$4 = [];

/* style */
const __vue_inject_styles__$4 = function (inject) {
    if (!inject) return
    inject("data-v-6e7de10c_0", { source: ".vc-hue{position:absolute;top:0;right:0;bottom:0;left:0;border-radius:2px}.vc-hue--horizontal{background:linear-gradient(to right,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red 100%)}.vc-hue--vertical{background:linear-gradient(to top,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red 100%)}.vc-hue-container{cursor:pointer;margin:0 2px;position:relative;height:100%}.vc-hue-pointer{z-index:2;position:absolute}.vc-hue-picker{cursor:pointer;margin-top:1px;width:4px;border-radius:1px;height:8px;box-shadow:0 0 2px rgba(0,0,0,.6);background:#fff;transform:translateX(-2px)}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__$4 = undefined;
/* module identifier */
const __vue_module_identifier__$4 = undefined;
/* functional template */
const __vue_is_functional_template__$4 = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__$4 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
    __vue_inject_styles__$4,
    __vue_script__$4,
    __vue_scope_id__$4,
    __vue_is_functional_template__$4,
    __vue_module_identifier__$4,
    false,
    createInjector,
    undefined,
    undefined
);

var red = {"50":"#ffebee","100":"#ffcdd2","200":"#ef9a9a","300":"#e57373","400":"#ef5350","500":"#f44336","600":"#e53935","700":"#d32f2f","800":"#c62828","900":"#b71c1c","a100":"#ff8a80","a200":"#ff5252","a400":"#ff1744","a700":"#d50000"};
var pink = {"50":"#fce4ec","100":"#f8bbd0","200":"#f48fb1","300":"#f06292","400":"#ec407a","500":"#e91e63","600":"#d81b60","700":"#c2185b","800":"#ad1457","900":"#880e4f","a100":"#ff80ab","a200":"#ff4081","a400":"#f50057","a700":"#c51162"};
var purple = {"50":"#f3e5f5","100":"#e1bee7","200":"#ce93d8","300":"#ba68c8","400":"#ab47bc","500":"#9c27b0","600":"#8e24aa","700":"#7b1fa2","800":"#6a1b9a","900":"#4a148c","a100":"#ea80fc","a200":"#e040fb","a400":"#d500f9","a700":"#aa00ff"};
var deepPurple = {"50":"#ede7f6","100":"#d1c4e9","200":"#b39ddb","300":"#9575cd","400":"#7e57c2","500":"#673ab7","600":"#5e35b1","700":"#512da8","800":"#4527a0","900":"#311b92","a100":"#b388ff","a200":"#7c4dff","a400":"#651fff","a700":"#6200ea"};
var indigo = {"50":"#e8eaf6","100":"#c5cae9","200":"#9fa8da","300":"#7986cb","400":"#5c6bc0","500":"#3f51b5","600":"#3949ab","700":"#303f9f","800":"#283593","900":"#1a237e","a100":"#8c9eff","a200":"#536dfe","a400":"#3d5afe","a700":"#304ffe"};
var blue = {"50":"#e3f2fd","100":"#bbdefb","200":"#90caf9","300":"#64b5f6","400":"#42a5f5","500":"#2196f3","600":"#1e88e5","700":"#1976d2","800":"#1565c0","900":"#0d47a1","a100":"#82b1ff","a200":"#448aff","a400":"#2979ff","a700":"#2962ff"};
var lightBlue = {"50":"#e1f5fe","100":"#b3e5fc","200":"#81d4fa","300":"#4fc3f7","400":"#29b6f6","500":"#03a9f4","600":"#039be5","700":"#0288d1","800":"#0277bd","900":"#01579b","a100":"#80d8ff","a200":"#40c4ff","a400":"#00b0ff","a700":"#0091ea"};
var cyan = {"50":"#e0f7fa","100":"#b2ebf2","200":"#80deea","300":"#4dd0e1","400":"#26c6da","500":"#00bcd4","600":"#00acc1","700":"#0097a7","800":"#00838f","900":"#006064","a100":"#84ffff","a200":"#18ffff","a400":"#00e5ff","a700":"#00b8d4"};
var teal = {"50":"#e0f2f1","100":"#b2dfdb","200":"#80cbc4","300":"#4db6ac","400":"#26a69a","500":"#009688","600":"#00897b","700":"#00796b","800":"#00695c","900":"#004d40","a100":"#a7ffeb","a200":"#64ffda","a400":"#1de9b6","a700":"#00bfa5"};
var green = {"50":"#e8f5e9","100":"#c8e6c9","200":"#a5d6a7","300":"#81c784","400":"#66bb6a","500":"#4caf50","600":"#43a047","700":"#388e3c","800":"#2e7d32","900":"#1b5e20","a100":"#b9f6ca","a200":"#69f0ae","a400":"#00e676","a700":"#00c853"};
var lightGreen = {"50":"#f1f8e9","100":"#dcedc8","200":"#c5e1a5","300":"#aed581","400":"#9ccc65","500":"#8bc34a","600":"#7cb342","700":"#689f38","800":"#558b2f","900":"#33691e","a100":"#ccff90","a200":"#b2ff59","a400":"#76ff03","a700":"#64dd17"};
var lime = {"50":"#f9fbe7","100":"#f0f4c3","200":"#e6ee9c","300":"#dce775","400":"#d4e157","500":"#cddc39","600":"#c0ca33","700":"#afb42b","800":"#9e9d24","900":"#827717","a100":"#f4ff81","a200":"#eeff41","a400":"#c6ff00","a700":"#aeea00"};
var yellow = {"50":"#fffde7","100":"#fff9c4","200":"#fff59d","300":"#fff176","400":"#ffee58","500":"#ffeb3b","600":"#fdd835","700":"#fbc02d","800":"#f9a825","900":"#f57f17","a100":"#ffff8d","a200":"#ffff00","a400":"#ffea00","a700":"#ffd600"};
var amber = {"50":"#fff8e1","100":"#ffecb3","200":"#ffe082","300":"#ffd54f","400":"#ffca28","500":"#ffc107","600":"#ffb300","700":"#ffa000","800":"#ff8f00","900":"#ff6f00","a100":"#ffe57f","a200":"#ffd740","a400":"#ffc400","a700":"#ffab00"};
var orange = {"50":"#fff3e0","100":"#ffe0b2","200":"#ffcc80","300":"#ffb74d","400":"#ffa726","500":"#ff9800","600":"#fb8c00","700":"#f57c00","800":"#ef6c00","900":"#e65100","a100":"#ffd180","a200":"#ffab40","a400":"#ff9100","a700":"#ff6d00"};
var deepOrange = {"50":"#fbe9e7","100":"#ffccbc","200":"#ffab91","300":"#ff8a65","400":"#ff7043","500":"#ff5722","600":"#f4511e","700":"#e64a19","800":"#d84315","900":"#bf360c","a100":"#ff9e80","a200":"#ff6e40","a400":"#ff3d00","a700":"#dd2c00"};
var brown = {"50":"#efebe9","100":"#d7ccc8","200":"#bcaaa4","300":"#a1887f","400":"#8d6e63","500":"#795548","600":"#6d4c41","700":"#5d4037","800":"#4e342e","900":"#3e2723"};
var grey = {"50":"#fafafa","100":"#f5f5f5","200":"#eeeeee","300":"#e0e0e0","400":"#bdbdbd","500":"#9e9e9e","600":"#757575","700":"#616161","800":"#424242","900":"#212121"};
var blueGrey = {"50":"#eceff1","100":"#cfd8dc","200":"#b0bec5","300":"#90a4ae","400":"#78909c","500":"#607d8b","600":"#546e7a","700":"#455a64","800":"#37474f","900":"#263238"};
var darkText = {"primary":"rgba(0, 0, 0, 0.87)","secondary":"rgba(0, 0, 0, 0.54)","disabled":"rgba(0, 0, 0, 0.38)","dividers":"rgba(0, 0, 0, 0.12)"};
var lightText = {"primary":"rgba(255, 255, 255, 1)","secondary":"rgba(255, 255, 255, 0.7)","disabled":"rgba(255, 255, 255, 0.5)","dividers":"rgba(255, 255, 255, 0.12)"};
var darkIcons = {"active":"rgba(0, 0, 0, 0.54)","inactive":"rgba(0, 0, 0, 0.38)"};
var lightIcons = {"active":"rgba(255, 255, 255, 1)","inactive":"rgba(255, 255, 255, 0.5)"};
var white = "#ffffff";
var black = "#000000";

var material = {
    red: red,
    pink: pink,
    purple: purple,
    deepPurple: deepPurple,
    indigo: indigo,
    blue: blue,
    lightBlue: lightBlue,
    cyan: cyan,
    teal: teal,
    green: green,
    lightGreen: lightGreen,
    lime: lime,
    yellow: yellow,
    amber: amber,
    orange: orange,
    deepOrange: deepOrange,
    brown: brown,
    grey: grey,
    blueGrey: blueGrey,
    darkText: darkText,
    lightText: lightText,
    darkIcons: darkIcons,
    lightIcons: lightIcons,
    white: white,
    black: black
};

//

const colorMap = [
    'red', 'pink', 'purple', 'deepPurple',
    'indigo', 'blue', 'lightBlue', 'cyan',
    'teal', 'green', 'lightGreen', 'lime',
    'yellow', 'amber', 'orange', 'deepOrange',
    'brown', 'blueGrey', 'black'
];
const colorLevel = ['900', '700', '500', '300', '100'];
const defaultColors$2 = /*#__PURE__*/(() => {
    const colors = [];
    colorMap.forEach((type) => {
        let typeColor = [];
        if (type.toLowerCase() === 'black' || type.toLowerCase() === 'white') {
            typeColor = typeColor.concat(['#000000', '#FFFFFF']);
        } else {
            colorLevel.forEach((level) => {
                const color = material[type][level];
                typeColor.push(color.toUpperCase());
            });
        }
        colors.push(typeColor);
    });
    return colors
})();

var script$5 = {
    name: 'Swatches',
    mixins: [colorMixin],
    props: {
        palette: {
            type: Array,
            default () {
                return defaultColors$2
            }
        }
    },
    computed: {
        pick () {
            return this.colors.hex
        }
    },
    methods: {
        equal (color) {
            return color.toLowerCase() === this.colors.hex.toLowerCase()
        },
        handlerClick (c) {
            this.colorChange({
                hex: c,
                source: 'hex'
            });
        }
    }

};

/* script */
const __vue_script__$5 = script$5;

/* template */
var __vue_render__$5 = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vc-swatches",attrs:{"role":"application","aria-label":"Swatches color picker","data-pick":_vm.pick}},[_c('div',{staticClass:"vc-swatches-box",attrs:{"role":"listbox"}},_vm._l((_vm.palette),function(group,$idx){return _c('div',{key:$idx,staticClass:"vc-swatches-color-group"},_vm._l((group),function(c){return _c('div',{key:c,class:['vc-swatches-color-it', {'vc-swatches-color--white': c === '#FFFFFF' }],style:({background: c}),attrs:{"role":"option","aria-label":'Color:' + c,"aria-selected":_vm.equal(c),"data-color":c},on:{"click":function($event){return _vm.handlerClick(c)}}},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.equal(c)),expression:"equal(c)"}],staticClass:"vc-swatches-pick"},[_c('svg',{staticStyle:{"width":"24px","height":"24px"},attrs:{"viewBox":"0 0 24 24"}},[_c('path',{attrs:{"d":"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"}})])])])}),0)}),0)])};

    return r
})();
var __vue_staticRenderFns__$5 = [];

/* style */
const __vue_inject_styles__$5 = function (inject) {
    if (!inject) return
    inject("data-v-228324d9_0", { source: ".vc-swatches{width:320px;height:240px;overflow-y:scroll;background-color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.12),0 2px 5px rgba(0,0,0,.16)}.vc-swatches-box{padding:16px 0 6px 16px;overflow:hidden}.vc-swatches-color-group{padding-bottom:10px;width:40px;float:left;margin-right:10px}.vc-swatches-color-it{box-sizing:border-box;width:40px;height:24px;cursor:pointer;background:#880e4f;margin-bottom:1px;overflow:hidden;-ms-border-radius:2px 2px 0 0;-moz-border-radius:2px 2px 0 0;-o-border-radius:2px 2px 0 0;-webkit-border-radius:2px 2px 0 0;border-radius:2px 2px 0 0}.vc-swatches-color--white{border:1px solid #ddd}.vc-swatches-pick{fill:#fff;margin-left:8px;display:block}.vc-swatches-color--white .vc-swatches-pick{fill:#333}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__$5 = undefined;
/* module identifier */
const __vue_module_identifier__$5 = undefined;
/* functional template */
const __vue_is_functional_template__$5 = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__$5 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
    __vue_inject_styles__$5,
    __vue_script__$5,
    __vue_scope_id__$5,
    __vue_is_functional_template__$5,
    __vue_module_identifier__$5,
    false,
    createInjector,
    undefined,
    undefined
);

//
var script$6 = {
    name: 'Slider',
    mixins: [colorMixin],
    props: {
        swatches: {
            type: Array,
            default () {
                return ['.80', '.65', '.50', '.35', '.20']
            }
        }
    },
    components: {
        hue: __vue_component__$4
    },
    computed: {
        activeOffset () {
            const hasBlack = this.swatches.includes('0');
            const hasWhite = this.swatches.includes('1');
            const hsl = this.colors.hsl;

            if (Math.round(hsl.s * 100) / 100 === 0.50) {
                return Math.round(hsl.l * 100) / 100
            } else if (hasBlack && hsl.l === 0) {
                return 0
            } else if (hasWhite && hsl.l === 1) {
                return 1
            }
            return -1
        }
    },
    methods: {
        hueChange (data) {
            this.colorChange(data);
        },
        handleSwClick (index, offset) {
            this.colorChange({
                h: this.colors.hsl.h,
                s: 0.5,
                l: offset,
                source: 'hsl'
            });
        }
    }
};

/* script */
const __vue_script__$6 = script$6;

/* template */
var __vue_render__$6 = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vc-slider",attrs:{"role":"application","aria-label":"Slider color picker"}},[_c('div',{staticClass:"vc-slider-hue-warp"},[_c('hue',{on:{"change":_vm.hueChange},model:{value:(_vm.colors),callback:function ($$v) {_vm.colors=$$v;},expression:"colors"}})],1),_vm._v(" "),_c('div',{staticClass:"vc-slider-swatches",attrs:{"role":"group"}},_vm._l((_vm.swatches),function(offset,index){return _c('div',{key:index,staticClass:"vc-slider-swatch",attrs:{"data-index":index,"aria-label":'color:' + _vm.colors.hex,"role":"button"},on:{"click":function($event){return _vm.handleSwClick(index, offset)}}},[_c('div',{staticClass:"vc-slider-swatch-picker",class:{'vc-slider-swatch-picker--active': offset == _vm.activeOffset, 'vc-slider-swatch-picker--white': offset === '1'},style:({background: 'hsl(' + _vm.colors.hsl.h + ', 50%, ' + (offset * 100) + '%)'})})])}),0)])};

    return r
})();
var __vue_staticRenderFns__$6 = [];

/* style */
const __vue_inject_styles__$6 = function (inject) {
    if (!inject) return
    inject("data-v-38114b99_0", { source: ".vc-slider{position:relative;width:410px}.vc-slider-hue-warp{height:12px;position:relative}.vc-slider-hue-warp .vc-hue-picker{width:14px;height:14px;border-radius:6px;transform:translate(-7px,-2px);background-color:#f8f8f8;box-shadow:0 1px 4px 0 rgba(0,0,0,.37)}.vc-slider-swatches{display:flex;margin-top:20px}.vc-slider-swatch{margin-right:1px;flex:1;width:20%}.vc-slider-swatch:first-child{margin-right:1px}.vc-slider-swatch:first-child .vc-slider-swatch-picker{border-radius:2px 0 0 2px}.vc-slider-swatch:last-child{margin-right:0}.vc-slider-swatch:last-child .vc-slider-swatch-picker{border-radius:0 2px 2px 0}.vc-slider-swatch-picker{cursor:pointer;height:12px}.vc-slider-swatch:nth-child(n) .vc-slider-swatch-picker.vc-slider-swatch-picker--active{transform:scaleY(1.8);border-radius:3.6px/2px}.vc-slider-swatch-picker--white{box-shadow:inset 0 0 0 1px #ddd}.vc-slider-swatch-picker--active.vc-slider-swatch-picker--white{box-shadow:inset 0 0 0 .6px #ddd}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__$6 = undefined;
/* module identifier */
const __vue_module_identifier__$6 = undefined;
/* functional template */
const __vue_is_functional_template__$6 = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__$6 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$6, staticRenderFns: __vue_staticRenderFns__$6 },
    __vue_inject_styles__$6,
    __vue_script__$6,
    __vue_scope_id__$6,
    __vue_is_functional_template__$6,
    __vue_module_identifier__$6,
    false,
    createInjector,
    undefined,
    undefined
);

var clamp_1 = clamp;

function clamp(value, min, max) {
    return min < max
        ? (value < min ? min : value > max ? max : value)
        : (value < max ? max : value > min ? min : value)
}

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
    return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
    var lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true;

    if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
        leading = !!options.leading;
        maxing = 'maxWait' in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
        var args = lastArgs,
            thisArg = lastThis;

        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
    }

    function leadingEdge(time) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time;
        // Start the timer for the trailing edge.
        timerId = setTimeout(timerExpired, wait);
        // Invoke the leading edge.
        return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime,
            result = wait - timeSinceLastCall;

        return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
    }

    function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime;

        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
            (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        // Restart the timer.
        timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
        timerId = undefined;

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
    }

    function cancel() {
        if (timerId !== undefined) {
            clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
        return timerId === undefined ? result : trailingEdge(now());
    }

    function debounced() {
        var time = now(),
            isInvoking = shouldInvoke(time);

        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
            if (timerId === undefined) {
                return leadingEdge(lastCallTime);
            }
            if (maxing) {
                // Handle invocations in a tight loop.
                timerId = setTimeout(timerExpired, wait);
                return invokeFunc(lastCallTime);
            }
        }
        if (timerId === undefined) {
            timerId = setTimeout(timerExpired, wait);
        }
        return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
    var leading = true,
        trailing = true;

    if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
    }
    if (isObject(options)) {
        leading = 'leading' in options ? !!options.leading : leading;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
    }
    return debounce(func, wait, {
        'leading': leading,
        'maxWait': wait,
        'trailing': trailing
    });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
    return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
    return typeof value == 'symbol' ||
        (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
    if (typeof value == 'number') {
        return value;
    }
    if (isSymbol(value)) {
        return NAN;
    }
    if (isObject(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
        return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
}

var lodash_throttle = throttle;

//

var script$7 = {
    name: 'Saturation',
    props: {
        value: Object
    },
    computed: {
        colors () {
            return this.value
        },
        bgColor () {
            return `hsl(${this.colors.hsv.h}, 100%, 50%)`
        },
        pointerTop () {
            return (-(this.colors.hsv.v * 100) + 1) + 100 + '%'
        },
        pointerLeft () {
            return this.colors.hsv.s * 100 + '%'
        }
    },
    methods: {
        throttle: lodash_throttle((fn, data) => {
                fn(data);
            }, 20,
            {
                'leading': true,
                'trailing': false
            }),
        handleChange (e, skip) {
            !skip && e.preventDefault();
            const container = this.$refs.container;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            const xOffset = container.getBoundingClientRect().left + window.pageXOffset;
            const yOffset = container.getBoundingClientRect().top + window.pageYOffset;
            const pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
            const pageY = e.pageY || (e.touches ? e.touches[0].pageY : 0);
            const left = clamp_1(pageX - xOffset, 0, containerWidth);
            const top = clamp_1(pageY - yOffset, 0, containerHeight);
            const saturation = left / containerWidth;
            const bright = clamp_1(-(top / containerHeight) + 1, 0, 1);

            this.throttle(this.onChange, {
                h: this.colors.hsv.h,
                s: saturation,
                v: bright,
                a: this.colors.hsv.a,
                source: 'hsva'
            });
        },
        onChange (param) {
            this.$emit('change', param);
        },
        handleMouseDown (e) {
            // this.handleChange(e, true)
            window.addEventListener('mousemove', this.handleChange);
            window.addEventListener('mouseup', this.handleChange);
            window.addEventListener('mouseup', this.handleMouseUp);
        },
        handleMouseUp (e) {
            this.unbindEventListeners();
        },
        unbindEventListeners () {
            window.removeEventListener('mousemove', this.handleChange);
            window.removeEventListener('mouseup', this.handleChange);
            window.removeEventListener('mouseup', this.handleMouseUp);
        }
    }
};

/* script */
const __vue_script__$7 = script$7;

/* template */
var __vue_render__$7 = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{ref:"container",staticClass:"vc-saturation",style:({background: _vm.bgColor}),on:{"mousedown":_vm.handleMouseDown,"touchmove":_vm.handleChange,"touchstart":_vm.handleChange}},[_c('div',{staticClass:"vc-saturation--white"}),_vm._v(" "),_c('div',{staticClass:"vc-saturation--black"}),_vm._v(" "),_c('div',{staticClass:"vc-saturation-pointer",style:({top: _vm.pointerTop, left: _vm.pointerLeft})},[_c('div',{staticClass:"vc-saturation-circle"})])])};

    return r
})();
var __vue_staticRenderFns__$7 = [];

/* style */
const __vue_inject_styles__$7 = function (inject) {
    if (!inject) return
    inject("data-v-95c67c86_0", { source: ".vc-saturation,.vc-saturation--black,.vc-saturation--white{cursor:pointer;position:absolute;top:0;left:0;right:0;bottom:0}.vc-saturation--white{background:linear-gradient(to right,#fff,rgba(255,255,255,0))}.vc-saturation--black{background:linear-gradient(to top,#000,rgba(0,0,0,0))}.vc-saturation-pointer{cursor:pointer;position:absolute}.vc-saturation-circle{cursor:head;width:4px;height:4px;box-shadow:0 0 0 1.5px #fff,inset 0 0 1px 1px rgba(0,0,0,.3),0 0 1px 2px rgba(0,0,0,.4);border-radius:50%;transform:translate(-2px,-2px)}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__$7 = undefined;
/* module identifier */
const __vue_module_identifier__$7 = undefined;
/* functional template */
const __vue_is_functional_template__$7 = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__$7 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$7, staticRenderFns: __vue_staticRenderFns__$7 },
    __vue_inject_styles__$7,
    __vue_script__$7,
    __vue_scope_id__$7,
    __vue_is_functional_template__$7,
    __vue_module_identifier__$7,
    false,
    createInjector,
    undefined,
    undefined
);

//
//
//
//

let _checkboardCache = {};

var script$8 = {
    name: 'Checkboard',
    props: {
        size: {
            type: [Number, String],
            default: 8
        },
        white: {
            type: String,
            default: '#fff'
        },
        grey: {
            type: String,
            default: '#e6e6e6'
        }
    },
    computed: {
        bgStyle () {
            return {
                'background-image': 'url(' + getCheckboard(this.white, this.grey, this.size) + ')'
            }
        }
    }
};

/**
 * get base 64 data by canvas
 *
 * @param {String} c1 hex color
 * @param {String} c2 hex color
 * @param {Number} size
 */

function renderCheckboard (c1, c2, size) {
    // Dont Render On Server
    if (typeof document === 'undefined') {
        return null
    }
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size * 2;
    const ctx = canvas.getContext('2d');
    // If no context can be found, return early.
    if (!ctx) {
        return null
    }
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = c2;
    ctx.fillRect(0, 0, size, size);
    ctx.translate(size, size);
    ctx.fillRect(0, 0, size, size);
    return canvas.toDataURL()
}

/**
 * get checkboard base data and cache
 *
 * @param {String} c1 hex color
 * @param {String} c2 hex color
 * @param {Number} size
 */

function getCheckboard (c1, c2, size) {
    const key = c1 + ',' + c2 + ',' + size;

    if (_checkboardCache[key]) {
        return _checkboardCache[key]
    } else {
        const checkboard = renderCheckboard(c1, c2, size);
        _checkboardCache[key] = checkboard;
        return checkboard
    }
}

/* script */
const __vue_script__$8 = script$8;

/* template */
var __vue_render__$8 = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vc-checkerboard",style:(_vm.bgStyle)})};

    return r
})();
var __vue_staticRenderFns__$8 = [];

/* style */
const __vue_inject_styles__$8 = function (inject) {
    if (!inject) return
    inject("data-v-a402a7ce_0", { source: ".vc-checkerboard{position:absolute;top:0;right:0;bottom:0;left:0;background-size:contain}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__$8 = undefined;
/* module identifier */
const __vue_module_identifier__$8 = undefined;
/* functional template */
const __vue_is_functional_template__$8 = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__$8 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$8, staticRenderFns: __vue_staticRenderFns__$8 },
    __vue_inject_styles__$8,
    __vue_script__$8,
    __vue_scope_id__$8,
    __vue_is_functional_template__$8,
    __vue_module_identifier__$8,
    false,
    createInjector,
    undefined,
    undefined
);

//

var script$9 = {
    name: 'Alpha',
    props: {
        value: Object,
        onChange: Function
    },
    components: {
        checkboard: __vue_component__$8
    },
    computed: {
        colors () {
            return this.value
        },
        gradientColor () {
            const rgba = this.colors.rgba;
            const rgbStr = [rgba.r, rgba.g, rgba.b].join(',');
            return 'linear-gradient(to right, rgba(' + rgbStr + ', 0) 0%, rgba(' + rgbStr + ', 1) 100%)'
        }
    },
    methods: {
        handleChange (e, skip) {
            !skip && e.preventDefault();
            const container = this.$refs.container;
            const containerWidth = container.clientWidth;

            const xOffset = container.getBoundingClientRect().left + window.pageXOffset;
            const pageX = e.pageX || (e.touches ? e.touches[0].pageX : 0);
            const left = pageX - xOffset;

            let a;
            if (left < 0) {
                a = 0;
            } else if (left > containerWidth) {
                a = 1;
            } else {
                a = Math.round(left * 100 / containerWidth) / 100;
            }

            if (this.colors.a !== a) {
                this.$emit('change', {
                    h: this.colors.hsl.h,
                    s: this.colors.hsl.s,
                    l: this.colors.hsl.l,
                    a: a,
                    source: 'rgba'
                });
            }
        },
        handleMouseDown (e) {
            this.handleChange(e, true);
            window.addEventListener('mousemove', this.handleChange);
            window.addEventListener('mouseup', this.handleMouseUp);
        },
        handleMouseUp () {
            this.unbindEventListeners();
        },
        unbindEventListeners () {
            window.removeEventListener('mousemove', this.handleChange);
            window.removeEventListener('mouseup', this.handleMouseUp);
        }
    }
};

/* script */
const __vue_script__$9 = script$9;

/* template */
var __vue_render__$9 = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vc-alpha"},[_c('div',{staticClass:"vc-alpha-checkboard-wrap"},[_c('checkboard')],1),_vm._v(" "),_c('div',{staticClass:"vc-alpha-gradient",style:({background: _vm.gradientColor})}),_vm._v(" "),_c('div',{ref:"container",staticClass:"vc-alpha-container",on:{"mousedown":_vm.handleMouseDown,"touchmove":_vm.handleChange,"touchstart":_vm.handleChange}},[_c('div',{staticClass:"vc-alpha-pointer",style:({left: _vm.colors.a * 100 + '%'})},[_c('div',{staticClass:"vc-alpha-picker"})])])])};

    return r
})();
var __vue_staticRenderFns__$9 = [];

/* style */
const __vue_inject_styles__$9 = function (inject) {
    if (!inject) return
    inject("data-v-d64ef1ca_0", { source: ".vc-alpha{position:absolute;top:0;right:0;bottom:0;left:0}.vc-alpha-checkboard-wrap{position:absolute;top:0;right:0;bottom:0;left:0;overflow:hidden}.vc-alpha-gradient{position:absolute;top:0;right:0;bottom:0;left:0}.vc-alpha-container{cursor:pointer;position:relative;z-index:2;height:100%;margin:0 3px}.vc-alpha-pointer{z-index:2;position:absolute}.vc-alpha-picker{cursor:pointer;width:4px;border-radius:1px;height:8px;box-shadow:0 0 2px rgba(0,0,0,.6);background:#fff;margin-top:1px;transform:translateX(-2px)}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__$9 = undefined;
/* module identifier */
const __vue_module_identifier__$9 = undefined;
/* functional template */
const __vue_is_functional_template__$9 = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__$9 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$9, staticRenderFns: __vue_staticRenderFns__$9 },
    __vue_inject_styles__$9,
    __vue_script__$9,
    __vue_scope_id__$9,
    __vue_is_functional_template__$9,
    __vue_module_identifier__$9,
    false,
    createInjector,
    undefined,
    undefined
);

//

var script$a = {
    name: 'Photoshop',
    mixins: [colorMixin],
    props: {
        head: {
            type: String,
            default: 'Color Picker'
        },
        disableFields: {
            type: Boolean,
            default: false
        },
        hasResetButton: {
            type: Boolean,
            default: false
        },
        acceptLabel: {
            type: String,
            default: 'OK'
        },
        cancelLabel: {
            type: String,
            default: 'Cancel'
        },
        resetLabel: {
            type: String,
            default: 'Reset'
        },
        newLabel: {
            type: String,
            default: 'new'
        },
        currentLabel: {
            type: String,
            default: 'current'
        }
    },
    components: {
        saturation: __vue_component__$7,
        hue: __vue_component__$4,
        alpha: __vue_component__$9,
        'ed-in': __vue_component__
    },
    data () {
        return {
            currentColor: '#FFF'
        }
    },
    computed: {
        hsv () {
            const hsv = this.colors.hsv;
            return {
                h: hsv.h.toFixed(),
                s: (hsv.s * 100).toFixed(),
                v: (hsv.v * 100).toFixed()
            }
        },
        hex () {
            const hex = this.colors.hex;
            return hex && hex.replace('#', '')
        }
    },
    created () {
        this.currentColor = this.colors.hex;
    },
    methods: {
        childChange (data) {
            this.colorChange(data);
        },
        inputChange (data) {
            if (!data) {
                return
            }
            if (data['#']) {
                this.isValidHex(data['#']) && this.colorChange({
                    hex: data['#'],
                    source: 'hex'
                });
            } else if (data.r || data.g || data.b || data.a) {
                this.colorChange({
                    r: data.r || this.colors.rgba.r,
                    g: data.g || this.colors.rgba.g,
                    b: data.b || this.colors.rgba.b,
                    a: data.a || this.colors.rgba.a,
                    source: 'rgba'
                });
            } else if (data.h || data.s || data.v) {
                this.colorChange({
                    h: data.h || this.colors.hsv.h,
                    s: (data.s / 100) || this.colors.hsv.s,
                    v: (data.v / 100) || this.colors.hsv.v,
                    source: 'hsv'
                });
            }
        },
        clickCurrentColor () {
            this.colorChange({
                hex: this.currentColor,
                source: 'hex'
            });
        },
        handleAccept () {
            this.$emit('ok');
        },
        handleCancel () {
            this.$emit('cancel');
        },
        handleReset () {
            this.$emit('reset');
        }
    }

};

/* script */
const __vue_script__$a = script$a;

/* template */
var __vue_render__$a = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:['vc-photoshop', _vm.disableFields ? 'vc-photoshop__disable-fields' : ''],attrs:{"role":"application","aria-label":"PhotoShop color picker"}},[_c('div',{staticClass:"vc-ps-head",attrs:{"role":"heading"}},[_vm._v(_vm._s(_vm.head))]),_vm._v(" "),_c('div',{staticClass:"vc-ps-body"},[_c('div',{staticClass:"vc-ps-saturation-wrap"},[_c('saturation',{on:{"change":_vm.childChange},model:{value:(_vm.colors),callback:function ($$v) {_vm.colors=$$v;},expression:"colors"}})],1),_vm._v(" "),_c('div',{staticClass:"vc-ps-hue-wrap"},[_c('hue',{attrs:{"direction":"vertical"},on:{"change":_vm.childChange},model:{value:(_vm.colors),callback:function ($$v) {_vm.colors=$$v;},expression:"colors"}},[_c('div',{staticClass:"vc-ps-hue-pointer"},[_c('i',{staticClass:"vc-ps-hue-pointer--left"}),_c('i',{staticClass:"vc-ps-hue-pointer--right"})])])],1),_vm._v(" "),_c('div',{class:['vc-ps-controls', _vm.disableFields ? 'vc-ps-controls__disable-fields' : '']},[_c('div',{staticClass:"vc-ps-previews"},[_c('div',{staticClass:"vc-ps-previews__label"},[_vm._v(_vm._s(_vm.newLabel))]),_vm._v(" "),_c('div',{staticClass:"vc-ps-previews__swatches"},[_c('div',{staticClass:"vc-ps-previews__pr-color",style:({background: _vm.colors.hex}),attrs:{"aria-label":("New color is " + (_vm.colors.hex))}}),_vm._v(" "),_c('div',{staticClass:"vc-ps-previews__pr-color",style:({background: _vm.currentColor}),attrs:{"aria-label":("Current color is " + _vm.currentColor)},on:{"click":_vm.clickCurrentColor}})]),_vm._v(" "),_c('div',{staticClass:"vc-ps-previews__label"},[_vm._v(_vm._s(_vm.currentLabel))])]),_vm._v(" "),(!_vm.disableFields)?_c('div',{staticClass:"vc-ps-actions"},[_c('div',{staticClass:"vc-ps-ac-btn",attrs:{"role":"button","aria-label":_vm.acceptLabel},on:{"click":_vm.handleAccept}},[_vm._v(_vm._s(_vm.acceptLabel))]),_vm._v(" "),_c('div',{staticClass:"vc-ps-ac-btn",attrs:{"role":"button","aria-label":_vm.cancelLabel},on:{"click":_vm.handleCancel}},[_vm._v(_vm._s(_vm.cancelLabel))]),_vm._v(" "),_c('div',{staticClass:"vc-ps-fields"},[_c('ed-in',{attrs:{"label":"h","desc":"°","value":_vm.hsv.h},on:{"change":_vm.inputChange}}),_vm._v(" "),_c('ed-in',{attrs:{"label":"s","desc":"%","value":_vm.hsv.s,"max":100},on:{"change":_vm.inputChange}}),_vm._v(" "),_c('ed-in',{attrs:{"label":"v","desc":"%","value":_vm.hsv.v,"max":100},on:{"change":_vm.inputChange}}),_vm._v(" "),_c('div',{staticClass:"vc-ps-fields__divider"}),_vm._v(" "),_c('ed-in',{attrs:{"label":"r","value":_vm.colors.rgba.r},on:{"change":_vm.inputChange}}),_vm._v(" "),_c('ed-in',{attrs:{"label":"g","value":_vm.colors.rgba.g},on:{"change":_vm.inputChange}}),_vm._v(" "),_c('ed-in',{attrs:{"label":"b","value":_vm.colors.rgba.b},on:{"change":_vm.inputChange}}),_vm._v(" "),_c('div',{staticClass:"vc-ps-fields__divider"}),_vm._v(" "),_c('ed-in',{staticClass:"vc-ps-fields__hex",attrs:{"label":"#","value":_vm.hex},on:{"change":_vm.inputChange}})],1),_vm._v(" "),(_vm.hasResetButton)?_c('div',{staticClass:"vc-ps-ac-btn",attrs:{"aria-label":"reset"},on:{"click":_vm.handleReset}},[_vm._v(_vm._s(_vm.resetLabel))]):_vm._e()]):_vm._e()])])])};

    return r
})();
var __vue_staticRenderFns__$a = [];

/* style */
const __vue_inject_styles__$a = function (inject) {
    if (!inject) return
    inject("data-v-616228f8_0", { source: ".vc-photoshop{background:#dcdcdc;border-radius:4px;box-shadow:0 0 0 1px rgba(0,0,0,.25),0 8px 16px rgba(0,0,0,.15);box-sizing:initial;width:513px;font-family:Roboto}.vc-photoshop__disable-fields{width:390px}.vc-ps-head{background-image:linear-gradient(-180deg,#f0f0f0 0,#d4d4d4 100%);border-bottom:1px solid #b1b1b1;box-shadow:inset 0 1px 0 0 rgba(255,255,255,.2),inset 0 -1px 0 0 rgba(0,0,0,.02);height:23px;line-height:24px;border-radius:4px 4px 0 0;font-size:13px;color:#4d4d4d;text-align:center}.vc-ps-body{padding:15px;display:flex}.vc-ps-saturation-wrap{width:256px;height:256px;position:relative;border:2px solid #b3b3b3;border-bottom:2px solid #f0f0f0;overflow:hidden}.vc-ps-saturation-wrap .vc-saturation-circle{width:12px;height:12px}.vc-ps-hue-wrap{position:relative;height:256px;width:19px;margin-left:10px;border:2px solid #b3b3b3;border-bottom:2px solid #f0f0f0}.vc-ps-hue-pointer{position:relative}.vc-ps-hue-pointer--left,.vc-ps-hue-pointer--right{position:absolute;width:0;height:0;border-style:solid;border-width:5px 0 5px 8px;border-color:transparent transparent transparent #555}.vc-ps-hue-pointer--left:after,.vc-ps-hue-pointer--right:after{content:\"\";width:0;height:0;border-style:solid;border-width:4px 0 4px 6px;border-color:transparent transparent transparent #fff;position:absolute;top:1px;left:1px;transform:translate(-8px,-5px)}.vc-ps-hue-pointer--left{transform:translate(-13px,-4px)}.vc-ps-hue-pointer--right{transform:translate(20px,-4px) rotate(180deg)}.vc-ps-controls{width:180px;margin-left:10px;display:flex}.vc-ps-controls__disable-fields{width:auto}.vc-ps-actions{margin-left:20px;flex:1}.vc-ps-ac-btn{cursor:pointer;background-image:linear-gradient(-180deg,#fff 0,#e6e6e6 100%);border:1px solid #878787;border-radius:2px;height:20px;box-shadow:0 1px 0 0 #eaeaea;font-size:14px;color:#000;line-height:20px;text-align:center;margin-bottom:10px}.vc-ps-previews{width:60px}.vc-ps-previews__swatches{border:1px solid #b3b3b3;border-bottom:1px solid #f0f0f0;margin-bottom:2px;margin-top:1px}.vc-ps-previews__pr-color{height:34px;box-shadow:inset 1px 0 0 #000,inset -1px 0 0 #000,inset 0 1px 0 #000}.vc-ps-previews__label{font-size:14px;color:#000;text-align:center}.vc-ps-fields{padding-top:5px;padding-bottom:9px;width:80px;position:relative}.vc-ps-fields .vc-input__input{margin-left:40%;width:40%;height:18px;border:1px solid #888;box-shadow:inset 0 1px 1px rgba(0,0,0,.1),0 1px 0 0 #ececec;margin-bottom:5px;font-size:13px;padding-left:3px;margin-right:10px}.vc-ps-fields .vc-input__desc,.vc-ps-fields .vc-input__label{top:0;text-transform:uppercase;font-size:13px;height:18px;line-height:22px;position:absolute}.vc-ps-fields .vc-input__label{left:0;width:34px}.vc-ps-fields .vc-input__desc{right:0;width:0}.vc-ps-fields__divider{height:5px}.vc-ps-fields__hex .vc-input__input{margin-left:20%;width:80%;height:18px;border:1px solid #888;box-shadow:inset 0 1px 1px rgba(0,0,0,.1),0 1px 0 0 #ececec;margin-bottom:6px;font-size:13px;padding-left:3px}.vc-ps-fields__hex .vc-input__label{position:absolute;top:0;left:0;width:14px;text-transform:uppercase;font-size:13px;height:18px;line-height:22px}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__$a = undefined;
/* module identifier */
const __vue_module_identifier__$a = undefined;
/* functional template */
const __vue_is_functional_template__$a = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__$a = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$a, staticRenderFns: __vue_staticRenderFns__$a },
    __vue_inject_styles__$a,
    __vue_script__$a,
    __vue_scope_id__$a,
    __vue_is_functional_template__$a,
    __vue_module_identifier__$a,
    false,
    createInjector,
    undefined,
    undefined
);

//

const presetColors = [
    '#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321',
    '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2',
    '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF',
    'rgba(0,0,0,0)'
];

var script$b = {
    name: 'Sketch',
    mixins: [colorMixin],
    components: {
        saturation: __vue_component__$7,
        hue: __vue_component__$4,
        alpha: __vue_component__$9,
        'ed-in': __vue_component__,
        checkboard: __vue_component__$8
    },
    props: {
        presetColors: {
            type: Array,
            default () {
                return presetColors
            }
        },
        disableAlpha: {
            type: Boolean,
            default: false
        },
        disableFields: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        hex () {
            let hex;
            if (this.colors.a < 1) {
                hex = this.colors.hex8;
            } else {
                hex = this.colors.hex;
            }
            return hex.replace('#', '')
        },
        activeColor () {
            const rgba = this.colors.rgba;
            return 'rgba(' + [rgba.r, rgba.g, rgba.b, rgba.a].join(',') + ')'
        }
    },
    methods: {
        handlePreset (c) {
            this.colorChange({
                hex: c,
                source: 'hex'
            });
        },
        childChange (data) {
            this.colorChange(data);
        },
        inputChange (data) {
            if (!data) {
                return
            }
            if (data.hex) {
                this.isValidHex(data.hex) && this.colorChange({
                    hex: data.hex,
                    source: 'hex'
                });
            } else if (data.r || data.g || data.b || data.a) {
                this.colorChange({
                    r: data.r || this.colors.rgba.r,
                    g: data.g || this.colors.rgba.g,
                    b: data.b || this.colors.rgba.b,
                    a: data.a || this.colors.rgba.a,
                    source: 'rgba'
                });
            }
        }
    }
};

/* script */
const __vue_script__$b = script$b;

/* template */
var __vue_render__$b = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:['vc-sketch', _vm.disableAlpha ? 'vc-sketch__disable-alpha' : ''],attrs:{"role":"application","aria-label":"Sketch color picker"}},[_c('div',{staticClass:"vc-sketch-saturation-wrap"},[_c('saturation',{on:{"change":_vm.childChange},model:{value:(_vm.colors),callback:function ($$v) {_vm.colors=$$v;},expression:"colors"}})],1),_vm._v(" "),_c('div',{staticClass:"vc-sketch-controls"},[_c('div',{staticClass:"vc-sketch-sliders"},[_c('div',{staticClass:"vc-sketch-hue-wrap"},[_c('hue',{on:{"change":_vm.childChange},model:{value:(_vm.colors),callback:function ($$v) {_vm.colors=$$v;},expression:"colors"}})],1),_vm._v(" "),(!_vm.disableAlpha)?_c('div',{staticClass:"vc-sketch-alpha-wrap"},[_c('alpha',{on:{"change":_vm.childChange},model:{value:(_vm.colors),callback:function ($$v) {_vm.colors=$$v;},expression:"colors"}})],1):_vm._e()]),_vm._v(" "),_c('div',{staticClass:"vc-sketch-color-wrap"},[_c('div',{staticClass:"vc-sketch-active-color",style:({background: _vm.activeColor}),attrs:{"aria-label":("Current color is " + _vm.activeColor)}}),_vm._v(" "),_c('checkboard')],1)]),_vm._v(" "),(!_vm.disableFields)?_c('div',{staticClass:"vc-sketch-field"},[_c('div',{staticClass:"vc-sketch-field--double"},[_c('ed-in',{attrs:{"label":"hex","value":_vm.hex},on:{"change":_vm.inputChange}})],1),_vm._v(" "),_c('div',{staticClass:"vc-sketch-field--single"},[_c('ed-in',{attrs:{"label":"r","value":_vm.colors.rgba.r},on:{"change":_vm.inputChange}})],1),_vm._v(" "),_c('div',{staticClass:"vc-sketch-field--single"},[_c('ed-in',{attrs:{"label":"g","value":_vm.colors.rgba.g},on:{"change":_vm.inputChange}})],1),_vm._v(" "),_c('div',{staticClass:"vc-sketch-field--single"},[_c('ed-in',{attrs:{"label":"b","value":_vm.colors.rgba.b},on:{"change":_vm.inputChange}})],1),_vm._v(" "),(!_vm.disableAlpha)?_c('div',{staticClass:"vc-sketch-field--single"},[_c('ed-in',{attrs:{"label":"a","value":_vm.colors.a,"arrow-offset":0.01,"max":1},on:{"change":_vm.inputChange}})],1):_vm._e()]):_vm._e(),_vm._v(" "),_c('div',{staticClass:"vc-sketch-presets",attrs:{"role":"group","aria-label":"A color preset, pick one to set as current color"}},[_vm._l((_vm.presetColors),function(c){return [(!_vm.isTransparent(c))?_c('div',{key:c,staticClass:"vc-sketch-presets-color",style:({background: c}),attrs:{"aria-label":'Color:' + c},on:{"click":function($event){return _vm.handlePreset(c)}}}):_c('div',{key:c,staticClass:"vc-sketch-presets-color",attrs:{"aria-label":'Color:' + c},on:{"click":function($event){return _vm.handlePreset(c)}}},[_c('checkboard')],1)]})],2)])};

    return r
})();
var __vue_staticRenderFns__$b = [];

/* style */
const __vue_inject_styles__$b = function (inject) {
    if (!inject) return
    inject("data-v-6488ec9c_0", { source: ".vc-sketch{position:relative;width:200px;padding:10px 10px 0;box-sizing:initial;background:#fff;border-radius:4px;box-shadow:0 0 0 1px rgba(0,0,0,.15),0 8px 16px rgba(0,0,0,.15)}.vc-sketch-saturation-wrap{width:100%;padding-bottom:75%;position:relative;overflow:hidden}.vc-sketch-controls{display:flex}.vc-sketch-sliders{padding:4px 0;flex:1}.vc-sketch-sliders .vc-alpha-gradient,.vc-sketch-sliders .vc-hue{border-radius:2px}.vc-sketch-hue-wrap{position:relative;height:10px}.vc-sketch-alpha-wrap{position:relative;height:10px;margin-top:4px;overflow:hidden}.vc-sketch-color-wrap{width:24px;height:24px;position:relative;margin-top:4px;margin-left:4px;border-radius:3px}.vc-sketch-active-color{position:absolute;top:0;left:0;right:0;bottom:0;border-radius:2px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15),inset 0 0 4px rgba(0,0,0,.25);z-index:2}.vc-sketch-color-wrap .vc-checkerboard{background-size:auto}.vc-sketch-field{display:flex;padding-top:4px}.vc-sketch-field .vc-input__input{width:90%;padding:4px 0 3px 10%;border:none;box-shadow:inset 0 0 0 1px #ccc;font-size:10px}.vc-sketch-field .vc-input__label{display:block;text-align:center;font-size:11px;color:#222;padding-top:3px;padding-bottom:4px;text-transform:capitalize}.vc-sketch-field--single{flex:1;padding-left:6px}.vc-sketch-field--double{flex:2}.vc-sketch-presets{margin-right:-10px;margin-left:-10px;padding-left:10px;padding-top:10px;border-top:1px solid #eee}.vc-sketch-presets-color{border-radius:3px;overflow:hidden;position:relative;display:inline-block;margin:0 10px 10px 0;vertical-align:top;cursor:pointer;width:16px;height:16px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15)}.vc-sketch-presets-color .vc-checkerboard{box-shadow:inset 0 0 0 1px rgba(0,0,0,.15);border-radius:3px}.vc-sketch__disable-alpha .vc-sketch-color-wrap{height:10px}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__$b = undefined;
/* module identifier */
const __vue_module_identifier__$b = undefined;
/* functional template */
const __vue_is_functional_template__$b = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__$b = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$b, staticRenderFns: __vue_staticRenderFns__$b },
    __vue_inject_styles__$b,
    __vue_script__$b,
    __vue_scope_id__$b,
    __vue_is_functional_template__$b,
    __vue_module_identifier__$b,
    false,
    createInjector,
    undefined,
    undefined
);

//

var script$c = {
    name: 'Chrome',
    mixins: [colorMixin],
    props: {
        disableAlpha: {
            type: Boolean,
            default: false
        },
        disableFields: {
            type: Boolean,
            default: false
        }
    },
    components: {
        saturation: __vue_component__$7,
        hue: __vue_component__$4,
        alpha: __vue_component__$9,
        'ed-in': __vue_component__,
        checkboard: __vue_component__$8
    },
    data () {
        return {
            fieldsIndex: 0,
            highlight: false
        }
    },
    computed: {
        hsl () {
            const { h, s, l } = this.colors.hsl;
            return {
                h: h.toFixed(),
                s: `${(s * 100).toFixed()}%`,
                l: `${(l * 100).toFixed()}%`
            }
        },
        activeColor () {
            const rgba = this.colors.rgba;
            return 'rgba(' + [rgba.r, rgba.g, rgba.b, rgba.a].join(',') + ')'
        },
        hasAlpha () {
            return this.colors.a < 1
        }
    },
    methods: {
        childChange (data) {
            this.colorChange(data);
        },
        inputChange (data) {
            if (!data) {
                return
            }
            if (data.hex) {
                this.isValidHex(data.hex) && this.colorChange({
                    hex: data.hex,
                    source: 'hex'
                });
            } else if (data.r || data.g || data.b || data.a) {
                this.colorChange({
                    r: data.r || this.colors.rgba.r,
                    g: data.g || this.colors.rgba.g,
                    b: data.b || this.colors.rgba.b,
                    a: data.a || this.colors.rgba.a,
                    source: 'rgba'
                });
            } else if (data.h || data.s || data.l) {
                const s = data.s ? (data.s.replace('%', '') / 100) : this.colors.hsl.s;
                const l = data.l ? (data.l.replace('%', '') / 100) : this.colors.hsl.l;

                this.colorChange({
                    h: data.h || this.colors.hsl.h,
                    s,
                    l,
                    source: 'hsl'
                });
            }
        },
        toggleViews () {
            if (this.fieldsIndex >= 2) {
                this.fieldsIndex = 0;
                return
            }
            this.fieldsIndex ++;
        },
        showHighlight () {
            this.highlight = true;
        },
        hideHighlight () {
            this.highlight = false;
        }
    }
};

/* script */
const __vue_script__$c = script$c;

/* template */
var __vue_render__$c = /*#__PURE__*/(function(){
    var r = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:['vc-chrome', _vm.disableAlpha ? 'vc-chrome__disable-alpha' : ''],attrs:{"role":"application","aria-label":"Chrome color picker"}},[_c('div',{staticClass:"vc-chrome-saturation-wrap"},[_c('saturation',{on:{"change":_vm.childChange},model:{value:(_vm.colors),callback:function ($$v) {_vm.colors=$$v;},expression:"colors"}})],1),_vm._v(" "),_c('div',{staticClass:"vc-chrome-body"},[_c('div',{staticClass:"vc-chrome-controls"},[_c('div',{staticClass:"vc-chrome-color-wrap"},[_c('div',{staticClass:"vc-chrome-active-color",style:({background: _vm.activeColor}),attrs:{"aria-label":("current color is " + (_vm.colors.hex))}}),_vm._v(" "),(!_vm.disableAlpha)?_c('checkboard'):_vm._e()],1),_vm._v(" "),_c('div',{staticClass:"vc-chrome-sliders"},[_c('div',{staticClass:"vc-chrome-hue-wrap"},[_c('hue',{on:{"change":_vm.childChange},model:{value:(_vm.colors),callback:function ($$v) {_vm.colors=$$v;},expression:"colors"}})],1),_vm._v(" "),(!_vm.disableAlpha)?_c('div',{staticClass:"vc-chrome-alpha-wrap"},[_c('alpha',{on:{"change":_vm.childChange},model:{value:(_vm.colors),callback:function ($$v) {_vm.colors=$$v;},expression:"colors"}})],1):_vm._e()])]),_vm._v(" "),(!_vm.disableFields)?_c('div',{staticClass:"vc-chrome-fields-wrap"},[_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.fieldsIndex === 0),expression:"fieldsIndex === 0"}],staticClass:"vc-chrome-fields"},[_c('div',{staticClass:"vc-chrome-field"},[(!_vm.hasAlpha)?_c('ed-in',{attrs:{"label":"hex","value":_vm.colors.hex},on:{"change":_vm.inputChange}}):_vm._e(),_vm._v(" "),(_vm.hasAlpha)?_c('ed-in',{attrs:{"label":"hex","value":_vm.colors.hex8},on:{"change":_vm.inputChange}}):_vm._e()],1)]),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.fieldsIndex === 1),expression:"fieldsIndex === 1"}],staticClass:"vc-chrome-fields"},[_c('div',{staticClass:"vc-chrome-field"},[_c('ed-in',{attrs:{"label":"r","value":_vm.colors.rgba.r},on:{"change":_vm.inputChange}})],1),_vm._v(" "),_c('div',{staticClass:"vc-chrome-field"},[_c('ed-in',{attrs:{"label":"g","value":_vm.colors.rgba.g},on:{"change":_vm.inputChange}})],1),_vm._v(" "),_c('div',{staticClass:"vc-chrome-field"},[_c('ed-in',{attrs:{"label":"b","value":_vm.colors.rgba.b},on:{"change":_vm.inputChange}})],1),_vm._v(" "),(!_vm.disableAlpha)?_c('div',{staticClass:"vc-chrome-field"},[_c('ed-in',{attrs:{"label":"a","value":_vm.colors.a,"arrow-offset":0.01,"max":1},on:{"change":_vm.inputChange}})],1):_vm._e()]),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.fieldsIndex === 2),expression:"fieldsIndex === 2"}],staticClass:"vc-chrome-fields"},[_c('div',{staticClass:"vc-chrome-field"},[_c('ed-in',{attrs:{"label":"h","value":_vm.hsl.h},on:{"change":_vm.inputChange}})],1),_vm._v(" "),_c('div',{staticClass:"vc-chrome-field"},[_c('ed-in',{attrs:{"label":"s","value":_vm.hsl.s},on:{"change":_vm.inputChange}})],1),_vm._v(" "),_c('div',{staticClass:"vc-chrome-field"},[_c('ed-in',{attrs:{"label":"l","value":_vm.hsl.l},on:{"change":_vm.inputChange}})],1),_vm._v(" "),(!_vm.disableAlpha)?_c('div',{staticClass:"vc-chrome-field"},[_c('ed-in',{attrs:{"label":"a","value":_vm.colors.a,"arrow-offset":0.01,"max":1},on:{"change":_vm.inputChange}})],1):_vm._e()]),_vm._v(" "),_c('div',{staticClass:"vc-chrome-toggle-btn",attrs:{"role":"button","aria-label":"Change another color definition"},on:{"click":_vm.toggleViews}},[_c('div',{staticClass:"vc-chrome-toggle-icon"},[_c('svg',{staticStyle:{"width":"24px","height":"24px"},attrs:{"viewBox":"0 0 24 24"},on:{"mouseover":_vm.showHighlight,"mouseenter":_vm.showHighlight,"mouseout":_vm.hideHighlight}},[_c('path',{attrs:{"fill":"#333","d":"M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z"}})])]),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm.highlight),expression:"highlight"}],staticClass:"vc-chrome-toggle-icon-highlight"})])]):_vm._e()])])};

    return r
})();
var __vue_staticRenderFns__$c = [];

/* style */
const __vue_inject_styles__$c = function (inject) {
    if (!inject) return
    inject("data-v-7bf70314_0", { source: ".vc-chrome{background:#fff;border-radius:2px;box-shadow:0 0 2px rgba(0,0,0,.3),0 4px 8px rgba(0,0,0,.3);box-sizing:initial;width:225px;font-family:Menlo;background-color:#fff}.vc-chrome-controls{display:flex}.vc-chrome-color-wrap{position:relative;width:36px}.vc-chrome-active-color{position:relative;width:30px;height:30px;border-radius:15px;overflow:hidden;z-index:1}.vc-chrome-color-wrap .vc-checkerboard{width:30px;height:30px;border-radius:15px;background-size:auto}.vc-chrome-sliders{flex:1}.vc-chrome-fields-wrap{display:flex;padding-top:16px}.vc-chrome-fields{display:flex;margin-left:-6px;flex:1}.vc-chrome-field{padding-left:6px;width:100%}.vc-chrome-toggle-btn{width:32px;text-align:right;position:relative}.vc-chrome-toggle-icon{margin-right:-4px;margin-top:12px;cursor:pointer;position:relative;z-index:2}.vc-chrome-toggle-icon-highlight{position:absolute;width:24px;height:28px;background:#eee;border-radius:4px;top:10px;left:12px}.vc-chrome-hue-wrap{position:relative;height:10px;margin-bottom:8px}.vc-chrome-alpha-wrap{position:relative;height:10px}.vc-chrome-hue-wrap .vc-hue{border-radius:2px}.vc-chrome-alpha-wrap .vc-alpha-gradient{border-radius:2px}.vc-chrome-alpha-wrap .vc-alpha-picker,.vc-chrome-hue-wrap .vc-hue-picker{width:12px;height:12px;border-radius:6px;transform:translate(-6px,-2px);background-color:#f8f8f8;box-shadow:0 1px 4px 0 rgba(0,0,0,.37)}.vc-chrome-body{padding:16px 16px 12px;background-color:#fff}.vc-chrome-saturation-wrap{width:100%;padding-bottom:55%;position:relative;border-radius:2px 2px 0 0;overflow:hidden}.vc-chrome-saturation-wrap .vc-saturation-circle{width:12px;height:12px}.vc-chrome-fields .vc-input__input{font-size:11px;color:#333;width:100%;border-radius:2px;border:none;box-shadow:inset 0 0 0 1px #dadada;height:21px;text-align:center}.vc-chrome-fields .vc-input__label{text-transform:uppercase;font-size:11px;line-height:11px;color:#969696;text-align:center;display:block;margin-top:12px}.vc-chrome__disable-alpha .vc-chrome-active-color{width:18px;height:18px}.vc-chrome__disable-alpha .vc-chrome-color-wrap{width:30px}.vc-chrome__disable-alpha .vc-chrome-hue-wrap{margin-top:4px;margin-bottom:4px}", map: undefined, media: undefined });

};
/* scoped */
const __vue_scope_id__$c = undefined;
/* module identifier */
const __vue_module_identifier__$c = undefined;
/* functional template */
const __vue_is_functional_template__$c = false;
/* style inject SSR */

/* style inject shadow dom */



const __vue_component__$c = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$c, staticRenderFns: __vue_staticRenderFns__$c },
    __vue_inject_styles__$c,
    __vue_script__$c,
    __vue_scope_id__$c,
    __vue_is_functional_template__$c,
    __vue_module_identifier__$c,
    false,
    createInjector,
    undefined,
    undefined
);

export { __vue_component__$9 as Alpha, __vue_component__$8 as Checkboard, __vue_component__$c as Chrome, colorMixin as ColorMixin, __vue_component__$1 as Compact, __vue_component__ as EditableInput, __vue_component__$2 as Grayscale, __vue_component__$4 as Hue, __vue_component__$3 as Material, __vue_component__$a as Photoshop, __vue_component__$7 as Saturation, __vue_component__$b as Sketch, __vue_component__$6 as Slider, __vue_component__$5 as Swatches };
