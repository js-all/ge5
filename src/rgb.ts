/*
 * js-all tout droits non resérvé
 */

/**
 * l'interface de rgb.config
 */
interface rgbConfigInterface {
    warn: boolean,
    defaultColor: rgbConfigDefaultColorInterface
    overwriteColor: boolean,
    defaultAlpha: number,
    codeLogColor: any
}
/**
 * l'interface de defaultColor de l'interface de rgb.config
 */
interface rgbConfigDefaultColorInterface {
    red: number,
    green: number,
    blue: number
}
/**
 * js-all 2018 tout droits non reservé
 * 
 */
class rgb {
    /**
     * donne une couleur aleatoire
     * @param {Boolean} [alpha = false] - dis si l'alpha va etre aussi generé aleatoirement
     * @returns {rgb}
     */
    static random(alpha: boolean = false): rgb {
        let c = new rgb();
        c.red = Math.floor(Math.random() * ((255 - 0) + 1) + 0);
        c.green = Math.floor(Math.random() * ((255 - 0) + 1) + 0);
        c.blue = Math.floor(Math.random() * ((255 - 0) + 1) + 0);
        if (alpha) {
            c.alpha = Math.floor(Math.random() * ((100 - 0) + 1) + 0) / 100;
        }
        return c;
    };
    /**
     * donne une couleur rouge
     * @returns {rgb}
     */
    static get red(): rgb {
        return new rgb(255, 0, 0);
    };
    /**
     * donne une couleur verte
     * @returns {rgb}
     */
    static get green(): rgb {
        return new rgb(0, 255, 0);
    };
    /**
     * donne une couleur bleu
     * @returns {rgb}
     */
    static get blue(): rgb {
        return new rgb(0, 0, 255);
    };
    /**
     * donne une couleur noire
     * @returns {rgb}
     */
    static get black(): rgb {
        return new rgb(0, 0, 0);
    };
    /**
     * donne une couleur blanche
     * @returns {rgb}
     */
    static get white(): rgb {
        return new rgb(255, 255, 255);
    };
    /**
     * donne une couleur grise
     * @returns {rgb}
     */
    static get grey(): rgb {
        return rgb.createGrey(122.5);
    }
    /**
     * crée un gris
     * @param {Number} [g = 122.5] le niveau de gris, de 0 à 255 (0: noir, 255: blanc)
     */
    static createGrey(g: number = 122.5): rgb {
        return new rgb(g, g, g);
    };
    /**
     * renvoi une copie d'une couleure
     * @param {rgb} color la couleur à copier
     * @param {Boolean} [alpha = true] dis si la fonction va copié l'alpha
     */
    static copy(color: rgb, alpha: boolean = true): rgb {
        let res = new rgb(color.red, color.green, color.blue);
        if (alpha) {
            res.alpha = color.alpha;
        }
        return res;
    };
    private static _$$loc(c: string) {
        return "color:" + c + ";";
    }
    private static _$$bloc(c: string) {
        return `background-color: ${rgb.config.codeLogColor.bg};color: ${c};`
    }
    static config: rgbConfigInterface = {
        warn: true,
        defaultColor: {
            red: 0,
            green: 0,
            blue: 0
        },
        overwriteColor: false,
        defaultAlpha: 1,
        codeLogColor: {
            new: 'rgb(198, 120, 221)',
            white: 'rgb(255, 255, 255)',
            bg: 'rgb(40, 44, 52)',
            red: 'rgb(255, 80, 80)',
            class: 'rgb(229, 192, 107)',
            boolean: 'rgb(237, 151, 101)',
            info: 'rgb(0,0,0)',
            operator: 'rgb(84, 82, 194)',
            methode: 'rgb(97, 175, 233)'
        }
    }
    static help(...helps: string[]) {
        for (let i = 0; i < helps.length; i++) {
            const help = helps[i].toLowerCase();
            const code = rgb.config.codeLogColor;
            if (help === 'rgb.config') {
                console.info('%cthe config of rgb class for set his default color and other things.', rgb._$$loc(code.info))
            } else if (help === 'rgb.config.warn') {
                console.info('%cdefault value: %ctrue%c\nactive or unactive rgb warn.', rgb._$$loc(code.info), rgb._$$loc(code.boolean), rgb._$$loc(code.info))
            } else if (help === 'rgb.config.overwritecolor') {
                console.info('%cdefault value: %ctrue%c\n' +
                    'say if methodes will overwrite the color when they are called.\n' +
                    'ex:\n' +
                    '%c const %cmyColor %c= %cnew %crgb%c.%cblack%c(); \n' +
                    '%c myColor%c.%cbrighter%c().%clogColor%c();   \n' +
                    '%c myColor%c.%clogColor%c();              %c\n' +
                    '\n' +
                    'if it is true the two loged color will be the same' +
                    ' but if it is false, the first color will be myColor but brighter of 20 and the second will be just myColor.',
                    rgb._$$loc(code.info),
                    rgb._$$loc(code.boolean),
                    rgb._$$loc(code.info),
                    rgb._$$bloc(code.new) + 'border-top-left-radius:5px;',
                    rgb._$$bloc(code.class),
                    rgb._$$bloc(code.operator),
                    rgb._$$bloc(code.new),
                    rgb._$$bloc(code.class),
                    rgb._$$bloc(code.white),
                    rgb._$$bloc(code.class),
                    rgb._$$bloc(code.white) + 'border-top-right-radius:5px;',
                    rgb._$$bloc(code.red),
                    rgb._$$bloc(code.white),
                    rgb._$$bloc(code.methode),
                    rgb._$$bloc(code.white),
                    rgb._$$bloc(code.methode),
                    rgb._$$bloc(code.white),
                    rgb._$$bloc(code.red) + 'border-bottom-left-radius:5px;',
                    rgb._$$bloc(code.white),
                    rgb._$$bloc(code.methode),
                    rgb._$$bloc(code.white) + 'border-bottom-right-radius:5px;',
                    rgb._$$loc(code.info));
            } else if (help === 'rgb.config.defaultalpha') {

            } else if (help === 'rgb.config.codelogcolor') {

            } else {
                console.info("%chelp, not found or not writed.", rgb._$$loc(code.info))
            }
        }
    }
    red: number;
    green: number;
    blue: number;
    alpha: number;
    /**
     *  @class
     *  @constructor 
     *  @param {Number} [red] - La valeur de rouge dans la couleur. Si non préciser prend la valeur defini dans rgb.config.defaultColor.red.
     *  @param {Number} [green] - La valeur de vert dans la couleur. Si non préciser prend la valeur defini dans rgb.config.defaultColor.green.
     *  @param {Number} [blue] - La valeur de bleu dans la couleur. Si non préciser prend la valeur defini dans rgb.config.defaultColor.blue.
     *  @param {Number} [alpha] - La tansparance de la couleur, valeur entre 0 et 1. Si non préciser prend la valeur defini dans rgb.config.defaultAlpha.
     */
    constructor(red: number = rgb.config.defaultColor.red, green: number = rgb.config.defaultColor.green, blue: number = rgb.config.defaultColor.blue, alpha: number = rgb.config.defaultAlpha) {
        if (typeof red !== 'number' || typeof green !== 'number' || typeof blue !== 'number') throw new TypeError("rgb, constructor: all params type must be number");
        this.red = red;
        this.green = green;
        this.blue = blue;
        if (typeof alpha === 'number') {
            if (alpha >= 0 && alpha <= 1) {
                this.alpha = alpha;
            } else {
                throw new Error("rgb, constructor: alpha params value must be betwin 0 and 1 (0 and 1 include)")
            }
        } else {
            throw new TypeError("rgb, constructor: type of param alha must be number");
        }
    }

    get value() {
        let alpha = this.alpha == 1 ? false : true;
        if (typeof alpha != 'boolean') throw new TypeError("rgb, get: alpha type must be a boolean");
        let red = this.red > 255 ? 255 : this.red < 0 ? 0 : this.red;
        let green = this.green > 255 ? 255 : this.green < 0 ? 0 : this.green;
        let blue = this.blue > 255 ? 255 : this.blue < 0 ? 0 : this.blue;
        let res = `(${red}, ${green}, ${blue}`;
        let Alpha = this.alpha > 1 ? 1 : this.alpha < 0 ? 0 : this.alpha;
        if (alpha) {
            res = 'rgba' + res + ' ,' + Alpha + ')';
        } else {
            res = 'rgb' + res + ')';
        }
        return res;
    }
    /**
     * Augmente la luminositer de la couleur.
     * @param {Number} [bright = 20] - la valeur de l'eclairssicement.
     */
    brighter(bright: number = 20) {
        if (typeof bright != 'number') throw new TypeError("rgb, brighter: bright params type must be a number");
        let res = rgb.config.overwriteColor ? <rgb>this : <rgb>rgb.copy(this);
        res.red += bright;
        res.green += bright;
        res.blue += bright;
        return res;
    }
    /** Baisse la luminositer de la couleur.
      * @param {Number} [dark = 20] - la valeur de l'assombricement. Si non preciser prend 20.
      */
    darker(dark: number = 20) {
        if (typeof dark != 'number') throw new TypeError("rgb, darker: dark params type must be a number");
        let res = rgb.config.overwriteColor ? <rgb>this : <rgb>rgb.copy(this);
        res.red -= dark;
        res.green -= dark;
        res.blue -= dark;
        return res;
    }
    /** 
     * La meme chose que value mais renvoi de l'hexadecimal.
     */
    get hex() {
        let alpha = false;
        let red = this.red < 255 ? this.red < 0 ? 0 : this.red : 255;
        let green = this.green < 255 ? this.green < 0 ? 0 : this.green : 255;
        let blue = this.blue < 255 ? this.blue < 0 ? 0 : this.blue : 255;
        let sred = red.toString(16);
        let sgreen = green.toString(16);
        let sblue = blue.toString(16);
        let Sred = sred.length === 2 ? sred : '0' + sred;
        let Sgreen = sgreen.length === 2 ? sgreen : '0' + sgreen;
        let Sblue = sblue.length === 2 ? sblue : '0' + sblue;
        let res = `#${Sred}${Sgreen}${Sblue}`;
        if (alpha) {
            res += (255 * ((Math.round(this.alpha) * 100) / 100)).toString(16);
        }
        return res;
    }
    /**
     * rend un tableau [h, s, v, a] (360, 100, 100, 1)
     */
    get hsv(): [number, number, number, number] {
        // code sale parce que stack overflow et js
        let rabs: number, gabs: number, babs: number, rr: number, gg: number, bb: number, h: number, s: number, v: number, diff: number, diffc: Function, percentRoundFn: Function;
        rabs = this.red / 255;
        gabs = this.green / 255;
        babs = this.blue / 255;
        h = 0;
        v = Math.max(rabs, gabs, babs),
            diff = v - Math.min(rabs, gabs, babs);
        diffc = (c: number) => (v - c) / 6 / diff + 1 / 2;
        percentRoundFn = (num: number) => Math.round(num * 100) / 100;
        if (diff == 0) {
            h = s = 0;
        } else {
            s = diff / v;
            rr = diffc(rabs);
            gg = diffc(gabs);
            bb = diffc(babs);

            if (rabs === v) {
                h = bb - gg;
            } else if (gabs === v) {
                h = (1 / 3) + rr - bb;
            } else if (babs === v) {
                h = (2 / 3) + gg - rr;
            }
            if (h < 0) {
                h += 1;
            } else if (h > 1) {
                h -= 1;
            }
        }
        return [
            <number>(<number>h * 360),
            <number>percentRoundFn(s * 100),
            <number>percentRoundFn(v * 100),
            this.alpha
        ];
    }
    /**
     * random hue
     */
    static randomHue() {
        return this.fromHSVA(Math.random() * (361), 100, 100, 1);
    }
    /**
     * inverse la couleur
     */

    invert() {
        let res = rgb.config.overwriteColor ? <rgb>this : <rgb>rgb.copy(this);
        res.red = 255 - res.red;
        res.green = 255 - res.green;
        res.blue = 255 - res.blue;
        return res;
    }
    /**  affiche la couleure dans la console.
      *  @param {any} [log] - text à afficher en dessous de la couleure.
      *  @param {any[]} [logParam] - parametre du text a afficher comme dans console.log().
      */
    logColor(log?: string, ...logParam: string[]) {
        let strr = log === undefined ? "" : "\n" + log;
        let br = 10;
        let unit = 'px';
        let op = `color: ${this.value};background-color: ${this.value};`;
        let opp = op + 'border-top-left-radius:' + br + unit + ';border-top-right-radius:' + br + unit + ';';
        let oppp = op + 'border-bottom-left-radius:' + br + unit + ';border-bottom-right-radius:' + br + unit + ';';
        console.log('%c      \n' +
            '%c      \n' +
            '%c      %c' +
            strr,
            opp, op, oppp, '', ...logParam
        );
        return this;
    }
    /**
     * change la teinte d'une couleure
     * @param hue la hue
     */
    setHue(hue: number) {
        const hsv = this.hsv;
        hsv[0] = hue;
        return rgb.fromHSVA(...hsv);
    }
    /**
     * permet de rajouter des couleure a rgb ex: rgb.red
     * @param {String} name - le nom de la nouvelle couleur a rajouter
     * @param {rgb} color - la couleure qui serat retourner par l'appel de ce nouveau getter
     */
    static addColorGetter(name: string, color: rgb = new rgb()) {
        if (name === undefined) throw new Error('rgb, addColorClass: name arg is required');
        if (typeof name !== 'string') throw new TypeError('rgb, addColorClass: name arg must be a string');
        Object.defineProperty(rgb, name, {
            get: function () {
                return new rgb(color.red, color.green, color.blue, color.alpha);
            }
        })
    }

    static fromHSVA(h: number, s: number, v: number, a: number) {
        h /= 360;
        s /= 100;
        v /= 100;
        let r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return new rgb(
            (<number>r * 255),
            (<number>g * 255),
            (<number>b * 255),
            a
        )
    }
    /**
     * pars de la couleure actuelle pour aller vers une aurte couleure passer en paramatre
     * @param {rgb} color - la couleure vers la quelle on veut aller
     * @param {Number} [percent = 50] - le pourcentage de la transformation vers la couleure
     */
    to(color: rgb, percent: number = 50) {
        if (color === undefined) throw new Error('rgb, to: color arg is required');
        if (typeof percent !== 'number') throw new TypeError('rgb, to: percent arg must be a number between 0 and 100 (0 and 100 include)');
        if (percent > 100 || percent < 0) throw new Error('rgb, to: percent arg must be between 0 and 100 (0 and 100 include)');
        let res = rgb.config.overwriteColor ? <rgb>this : <rgb>rgb.copy(this);
        let toRed = color.red - res.red;
        let toGreen = color.green - res.green;
        let toBlue = color.blue - res.blue;
        let toAlpha = color.alpha - res.alpha;
        let red = toRed * (percent / 100);
        let green = toGreen * (percent / 100);
        let blue = toBlue * (percent / 100);
        let alpha = toAlpha * (percent / 100);
        res.red += red;
        res.green += green;
        res.blue += blue;
        res.alpha += alpha;
        return res;
    }
    /**
     * equivalent a rgb.copy: clone une couleur.
     * @param {Boolean} [alpha = true] - boolean disant si la fonction doit aussi copié l'aplha de la couleure 
     */
    clone(alpha: boolean = true) {
        return rgb.copy(this, alpha);
    }
    /**
     * cree un object rgb a partire d'un objet normal
     * @param {{red:number, green:number, blue:number, alpha?: number}} obj l'objet en question
     */
    static fromObject(obj: { red: number, green: number, blue: number, alpha?: number }) {
        if (obj.alpha === undefined) obj.alpha = 1;
        return new rgb(obj.red, obj.green, obj.blue, obj.alpha);
    }
}


export default rgb;