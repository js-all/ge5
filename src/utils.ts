function rad(angle: number): number;
function rad(angles: number[]): number[];
function rad(a: number[] | number): number[] | number {
    if (typeof a === "number") {
        return a / 180 * Math.PI;
    } else {
        return a.map(v => rad(v));
    }
}

function deg(angle: number): number;
function deg(angles: number[]): number[];
function deg(a: number[] | number): number[] | number {
    if (typeof a === "number") {
        return a / Math.PI * 180;
    } else {
        return a.map(v => deg(v));
    }
}

function randomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
    return Math.floor(randomFloat(min, max));
}

export {
    rad, deg,
    randomFloat, randomInt
}