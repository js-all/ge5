import { RigidBody, RigidBodyWorld, getListBoundingBox, binaryTree, rayCast } from './object'
import { vec2, mat3 } from 'gl-matrix'
import rgb from './rgb'
import { rad, randomInt, deg } from './utils'


const canvas = <HTMLCanvasElement>document.createElement('canvas');
const cw: number = 1920;
const ch: number = 1080;
const mousePos = {
    x: 0, y: 0
};
let tmpClickPos = [0, 0] as vec2;
const keysDown = new Set<number>();
const KEYS = {
    MOUSE: -1,
    LEFT_ARROW_KEY: 37,
    TOP_ARROW_KEY: 38,
    RIGHT_ARROW_KEY: 39,
    BOTTOM_ARROW_KEY: 40,
    Q_KEY: 81,
    D_KEY: 68,
    Z_KEY: 90,
    S_KEY: 83,
    SPACE_KEY: 32,
    TAB_KEY: 9
}
canvas.height = ch;
canvas.width = cw;
const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

document.body.appendChild(canvas);

const world = new RigidBodyWorld(ctx, [1000, 500], 0);

const obj2 = new RigidBody([[-1, -1], [1, -1], [1, 1], [-1, 1]], [[0, 1, 2], [0, 2, 3]], world, [0, 0], 0, [200, 100]);
const obj1 = new RigidBody([[-1, -1], [1, -1], [1, 1], [-1, 1]], [[0, 1, 2], [0, 2, 3]], world, [0, -90], Math.PI/4, [100, 100]);

obj1.name = 'obj1'

obj1.updateMatricies();

function draw() {
    world.updateMatricies();
    ctx.clearRect(0, 0, cw, ch);
    world.draw();
    requestAnimationFrame(draw);
}
const startTime = performance.now();
function play() {
    const deltaTime = performance.now() - startTime;
    //obj1.rotation = (deltaTime/1000) % (Math.PI*2)
    let rot = 0;
    const fac = rad(1);
    if (keysDown.has(KEYS.Q_KEY)) {
        rot += fac;
    }
    if (keysDown.has(KEYS.D_KEY)) {
        rot -= fac;
    }
    if (rot !== 0) {
        world.camera.rotation += rot;
    }
    world.move();
}

window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const oldMousePos = { ...mousePos };
    mousePos.x = (e.clientX - rect.left) * canvas.width / canvas.clientWidth;
    mousePos.y = (e.clientY - rect.top) * canvas.height / canvas.clientHeight;
    const delta = {
        x: mousePos.x - oldMousePos.x,
        y: mousePos.y - oldMousePos.y
    }

    if (keysDown.has(KEYS.MOUSE)) {
        //vec2.add(world.camera.translation, world.camera.translation, [delta.x, delta.y]);
        vec2.add(obj1.translation, obj1.translation, [delta.x, delta.y]);
    }
});

window.addEventListener('mousedown', () => {
    if (!keysDown.has(KEYS.MOUSE)) {
        keysDown.add(KEYS.MOUSE);
    }
    tmpClickPos = [mousePos.x, mousePos.y];
});
window.addEventListener('mouseup', () => {
    if (keysDown.has(KEYS.MOUSE)) {
        keysDown.delete(KEYS.MOUSE);
    }
});
window.addEventListener('keydown', e => {
    if (!keysDown.has(e.keyCode)) {
        keysDown.add(e.keyCode);
    }
});
window.addEventListener('keyup', e => {
    if (keysDown.has(e.keyCode)) {
        keysDown.delete(e.keyCode);
    }
});
window.addEventListener('blur', () => {
    keysDown.clear();
})

requestAnimationFrame(draw);
setInterval(play, 1000 / 60);
