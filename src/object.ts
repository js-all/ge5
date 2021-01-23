import { vec2, mat3 } from "gl-matrix";
import { v4 as uuidV4 } from "uuid";
import rgb from "./rgb";
import { rad, randomFloat } from "./utils";

type vertexLoop = vec2[];
type N2 = [number, number];

class RigidBody {
    static DrawLogs: Map<string, Map<string, string>> = new Map();
    // an array of functions to be called on draw (to log data computed at any other moment)
    onDrawLogsCallback: ((ctx: CanvasRenderingContext2D) => any)[] = [];
    verticies: vertexLoop;
    triangles: [number, number, number][];
    color: rgb;
    id: string;
    world: RigidBodyWorld;
    modelMatrix: mat3 = mat3.create();
    modelViewMatrix: mat3 = mat3.create();
    translation: vec2;
    rotation: number;
    scale: vec2;
    velocity: vec2;
    uuid: string = uuidV4();
    name?: string;
    acceleration: vec2;
    pointRotation: {
        origin: vec2;
        ammount: number;
    } = {
        origin: [0, 0],
        ammount: 0,
    };
    constructor(
        verticies: vertexLoop,
        triangles: [number, number, number][],
        world: RigidBodyWorld,
        translation: vec2 = [0, 0],
        rotation: number = 0,
        scale: vec2 = [1, 1],
        color = rgb.randomHue()
    ) {
        this.verticies = verticies;
        this.triangles = triangles;
        this.color = color;
        this.world = world;
        this.id = uuidV4();
        this.world.addChild(this);
        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
        this.velocity = vec2.create();
        this.acceleration = vec2.create();
        RigidBody.DrawLogs.set(this.uuid, new Map());
        this.updateMatricies(true);
    }
    updateMatricies(worldCall = false) {
        // not optimized but  prefer that than using the old modelMatrix
        // const tempMat = mat3.identity(mat3.create());
        // mat3.translate(tempMat, tempMat, this.translation);
        // mat3.rotate(tempMat, tempMat, this.rotation);
        // mat3.scale(tempMat, tempMat, this.scale);
        mat3.identity(this.modelMatrix);
        // // rotation arround point
        // {
        //     const origin = vec2.transformMat3(
        //         vec2.create(),
        //         this.pointRotation.origin,
        //         tempMat
        //     );
        //     mat3.translate(this.modelMatrix, this.modelMatrix, origin);
        //     mat3.rotate(
        //         this.modelMatrix,
        //         this.modelMatrix,
        //         this.pointRotation.ammount
        //     );
        //     mat3.translate(
        //         this.modelMatrix,
        //         this.modelMatrix,
        //         vec2.negate([0, 0], origin)
        //     );
        // }
        mat3.translate(this.modelMatrix, this.modelMatrix, this.translation);
        mat3.rotate(this.modelMatrix, this.modelMatrix, this.rotation);
        mat3.scale(this.modelMatrix, this.modelMatrix, this.scale);
        if (worldCall) {
            mat3.multiply(
                this.modelViewMatrix,
                this.world.viewMatrix,
                this.modelMatrix
            );
        }
    }
    get ctx() {
        return this.world.ctx;
    }
    getSiblings() {
        const cpyMap = new Map(this.world.childrens);
        for (let k of cpyMap.keys()) {
            if (cpyMap.get(k)?.id === this.id) cpyMap.delete(k);
        }
        return cpyMap;
    }
    getBoundingBox(applyViewMatrix = false): BoundingBox {
        const xs: number[] = [];
        const ys: number[] = [];
        for (let v of this.verticies) {
            const transformedVec = vec2.create();
            if (applyViewMatrix) {
                vec2.transformMat3(transformedVec, v, this.modelViewMatrix);
            } else {
                vec2.transformMat3(transformedVec, v, this.modelMatrix);
            }
            xs.push(transformedVec[0]);
            ys.push(transformedVec[1]);
        }
        const [x, y] = [Math.min(...xs), Math.min(...ys)];
        const [dx, dy] = [Math.max(...xs), Math.max(...ys)];
        return {
            x: x,
            y: y,
            dx: dx,
            dy: dy,
        };
    }
    getBBCollidingSiblings() {
        const otherEls = this.getSiblings();
        const collidingElements: string[] = [];
        for (let i of otherEls.values()) {
            const b1 = this.getBoundingBox();
            const b2 = i.getBoundingBox();
            if (AABBColision(b1, b2)) collidingElements.push(i.id);
        }
        return collidingElements;
    }
    getTransformedVerticies(onlyModel = false) {
        const res: vertexLoop = [];
        for (let i of this.verticies) {
            const vec: vec2 = [0, 0];
            if (onlyModel) {
                vec2.transformMat3(vec, i, this.modelMatrix);
            } else {
                vec2.transformMat3(vec, i, this.modelViewMatrix);
            }
            res.push(vec);
        }
        return res;
    }
    getLogMap() {
        return RigidBody.DrawLogs.get(this.uuid) as Map<string, string>;
    }
    move() {
        const Logs = this.getLogMap();
        this.onDrawLogsCallback = [];  // add acceleration to velocity
        vec2.add(this.velocity, this.velocity, this.acceleration);  // add veloctity to translation
        vec2.add(this.translation, this.translation, this.velocity);  // get the sibling with colliding bounding box with current RigidBody's id and map it with world.children to retrieve their Object
        const probablyColidingSiblings = this.getBBCollidingSiblings().map(
            (v) => this.world.childrens.get(v)
        ) as RigidBody[];  // get the model verticies (with scale rotation and translation applied)
        const transformedVerticies = this.getTransformedVerticies(true);

        let colliding = false;
        for (let o of probablyColidingSiblings) {
            const siblingsTransformedVerticies = o.getTransformedVerticies(true);
            // string here to avoid any kind of weird number comparison with floating point bs
            const satAxis = new Set<string>();
            const triangleVerticiesToAxis = (verts: [vec2, vec2, vec2]) => {
                const edges = [vec2.create(), vec2.create(), vec2.create()];
                vec2.subtract(edges[0], verts[1], verts[0]);
                vec2.subtract(edges[1], verts[2], verts[1]);
                vec2.subtract(edges[2], verts[0], verts[2]);
                const normals = [...edges];
                const nrml = (vec: vec2) =>
                    vec2
                        .normalize(
                            vec,
                            vec2.multiply(vec, vec.reverse() as N2, [-1, 1])
                        )
                        .map((v: number) => v) as N2;
                normals[0] = nrml(normals[0]);
                normals[1] = nrml(normals[1]);
                normals[2] = nrml(normals[2]);
                // turn normals into [string, string][] (first the string representation of the axis, then the negated one) and for each it to add to satAxis
                normals.map(v => [v, vec2.negate(vec2.create(), v)]).map((v) => v.map(n => n.join(":"))).forEach((v) => {
                    // if satAxis doesn't contain the axis or its negated version
                    if(!satAxis.has(v[0]) && !satAxis.has(v[1])) {
                        satAxis.add(v[0]);
                    }
                });
            };
            for (let t of this.triangles) {
                const verts: [vec2, vec2, vec2] = [
                    transformedVerticies[t[0]],
                    transformedVerticies[t[1]],
                    transformedVerticies[t[2]],
                ];
                triangleVerticiesToAxis(verts);
            }
            for (let t of o.triangles) {
                const verts: [vec2, vec2, vec2] = [
                    siblingsTransformedVerticies[t[0]],
                    siblingsTransformedVerticies[t[1]],
                    siblingsTransformedVerticies[t[2]],
                ];
                triangleVerticiesToAxis(verts);
            }
            colliding = true;
            for (let axisString of satAxis) {
                const axis = axisString
                    .split(":")
                    .map((v) => parseFloat(v)) as N2;

                const siblingsProjectedPoints = siblingsTransformedVerticies.map(
                    (v) => vec2.dot(v, axis)
                );
                const thisProjectedPoints = transformedVerticies.map((v) =>
                    vec2.dot(v, axis)
                );
                const siblingMin = Math.min(...siblingsProjectedPoints);
                const siblingMax = Math.max(...siblingsProjectedPoints);
                const thisMin = Math.min(...thisProjectedPoints);
                const thisMax = Math.max(...thisProjectedPoints);
                const axisColliding =
                    (thisMin > siblingMin && thisMin < siblingMax) ||
                    (thisMax > siblingMin && thisMax < siblingMax) ||
                    (siblingMin > thisMin && siblingMin < thisMax) ||
                    (siblingMax > thisMin && siblingMax < thisMax);
                if (!axisColliding) {
                    colliding = false;
                    break;
                }
            }
        }
        if (colliding) this.color = this.color.to(rgb.randomHue(), 5);
        Logs.set("colliding", colliding + "");
    }

    draw() {
        if (this.name && this.getLogMap().get("name") !== this.name) {
            this.getLogMap().set("name", this.name);
        }
        const { ctx } = this;
        ctx.fillStyle = this.color.value;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5;
        const tverts = this.getTransformedVerticies();
        for (let t of this.triangles) {
            const verts = t.map((i) => tverts[i]);
            ctx.beginPath();
            ctx.moveTo(...(verts[0] as N2));
            ctx.lineTo(...(verts[1] as N2));
            ctx.lineTo(...(verts[2] as N2));
            ctx.lineTo(...(verts[0] as N2));
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }
        this.onDrawLogsCallback.forEach((f) => f.bind(this)(ctx));
    }

    static createRandomShape(
        size: number,
        vertex: number = 8,
        RingRandomness = 2,
        ringSizeRng = 2,
        ringSizeRng2 = 0.1
    ) {
        const shape: vertexLoop = [];
        const localeSize =
            RingRandomness === 0
                ? size
                : size * (RingRandomness - 1 / RingRandomness) +
                  1 / RingRandomness;
        let restAngle = Math.PI * 2;
        for (let i = vertex; i > 0; i--) {
            const angle = randomFloat(
                restAngle / i / ringSizeRng,
                (restAngle / i) * ringSizeRng
            );
            const vec = vec2.fromValues(
                randomFloat(
                    localeSize * (1 - ringSizeRng2),
                    localeSize * (1 + ringSizeRng2)
                ),
                0
            );
            vec2.rotate(vec, vec, [0, 0], angle + (Math.PI * 2 - restAngle));
            shape.push(vec);
            restAngle -= angle;
        }
        return shape;
    }
    static renderLogs(ctx: CanvasRenderingContext2D) {
        // test if logs are empty
        let logsAreEmpty = true;
        RigidBody.DrawLogs.forEach(
            (v) => (logsAreEmpty = logsAreEmpty && v.size < 1)
        );
        if (!logsAreEmpty) {
            const Colors = {
                U: "rgb(0, 153, 255)",
                P: "rgb(255, 255, 255)",
                O: "rgb(128, 128, 128)",
                Y: "rgb(255, 204, 0)",
                W: "rgb(255, 115, 0)",
                R: "rgb(255, 0, 0)",
                M: "rgb(255, 0, 162)",
            };

            let logStrings: string[] = [];
            RigidBody.DrawLogs.forEach((v, k) => {
                // otherwise don't add the name or any logs
                if (v.size > 0) {
                    // adding letters at the start to remove them later and know what color it should be
                    // add two line with the name
                    logStrings.push("U", "U" + k + ":");

                    v.forEach((lv, lk) => {
                        let strk = "";
                        //deal with color
                        if (lk[0] === "\\" && lk[1] === "C") {
                            strk = "P    " + lk.substring(1);
                        } else if (lk[0] === "C") {
                            strk = lk[1] + "    " + lk.substring(2);
                        } else {
                            strk = "P    " + lk;
                        }
                        // push the string
                        logStrings.push(strk + ": " + lv);
                    });
                }
            });
            // remove first blank line
            logStrings.splice(0, 1);
            ctx.font = `${40}px monospace`;
            // to make the background black box the right size
            let maxWidth = 0;
            let totalHeight = 20;

            const LogsWithTopOffset = logStrings.map((v) => {
                const color = v[0];
                const metrics = ctx.measureText(v);
                // + 8 for line height
                const height =
                    metrics.actualBoundingBoxAscent +
                    metrics.actualBoundingBoxDescent +
                    8;
                totalHeight += height;
                if (maxWidth < metrics.width) maxWidth = metrics.width;
                return {
                    // rmeove first chr as it is already stored in color
                    text: v.substring(1),
                    offset: height,
                    color: color,
                };
            });
            // draw the background
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, maxWidth + 20, totalHeight + 20);

            let currentOffset = 40;
            for (let i = 0; i < LogsWithTopOffset.length; i++) {
                const stringWithOffset = LogsWithTopOffset[i];
                ///@ts-expect-error
                ctx.fillStyle = Colors[stringWithOffset.color] || "grey";
                ctx.textAlign = "start";
                ctx.textBaseline = "middle";
                ctx.fillText(stringWithOffset.text, 10, currentOffset);
                currentOffset += stringWithOffset.offset;
            }
        }
    }
}

class RigidBodyWorld {
    camera: {
        translation: vec2;
        rotation: number;
    };
    viewMatrix: mat3 = mat3.create();
    ctx: CanvasRenderingContext2D;
    childrens: Map<string, RigidBody> = new Map();
    constructor(
        ctx: CanvasRenderingContext2D,
        camTranslation: vec2 = [0, 0],
        camRotation: number = 0
    ) {
        this.ctx = ctx;
        this.camera = {
            translation: camTranslation,
            rotation: camRotation,
        };
        this.updateMatricies();
    }
    updateMatricies() {
        mat3.identity(this.viewMatrix);
        mat3.translate(
            this.viewMatrix,
            this.viewMatrix,
            vec2.mul(vec2.create(), this.camera.translation, [1, 1])
        );
        mat3.rotate(this.viewMatrix, this.viewMatrix, this.camera.rotation);
        this.childrens.forEach((v) => v.updateMatricies(true));
    }
    addChild(rb: RigidBody) {
        this.childrens.set(rb.id, rb);
    }
    draw(logs = true) {
        this.childrens.forEach((v) => v.draw());
        RigidBody.renderLogs(this.ctx);
    }
    move() {
        this.childrens.forEach((v) => v.move());
    }
    // TODO fix that shit
    /**
     * @description
     * return the BVH as a Binarytree
     * @deprecated
     * !! CURENTLY BROKEN MIGHT FIX IT LATER
     */
    getBVH(): binaryTree<RigidBody> {
        const alg = (rootNode: RigidBody[]) => {
            const box = getListBoundingBox(rootNode);
            const sortFunction =
                Math.abs(box.dx - box.x) > Math.abs(box.dy - box.y)
                    ? (a: RigidBody, b: RigidBody) =>
                          a.translation[0] - b.translation[0]
                    : (a: RigidBody, b: RigidBody) =>
                          a.translation[1] - b.translation[1];
            const sortedRoot = rootNode.sort(sortFunction);
            const midIndex = Math.ceil(sortedRoot.length / 2);
            const res1 = sortedRoot.splice(0, midIndex);
            const res2 = sortedRoot;
            let res: binaryTree<RigidBody> = {
                child1: res1.length <= 1 ? res1[0] : alg(res1),
                child2: res2.length <= 1 ? res2[0] : alg(res2),
            };
            return res;
        };
        return alg(Array.from(this.childrens.values()));
    }
}

function rayCast(
    origin: vec2,
    direction: vec2,
    segPoint1: vec2,
    segPoint2: vec2,
    backward = true
) {
    const [s1p1, s1p2] = [origin, vec2.add([0, 0], origin, direction)],
        [s2p1, s2p2] = [segPoint1, segPoint2];
    const data = lineLineIntersection(s1p1, s1p2, s2p1, s2p2);
    if (data.failed) {
        return {
            hit: false,
            hitLocation: [0, 0] as vec2,
            failed: true,
            t: 0,
            u: 0,
        };
    }
    const hit = data.u <= 0 && data.u >= -1 && (backward ? true : data.t >= 0);
    const position = [
        s1p1[0] + data.t * (s1p2[0] - s1p1[0]),
        s1p1[1] + data.t * (s1p2[1] - s1p1[1]),
    ] as vec2;
    return {
        hit: hit,
        hitLocation: position,
        failed: false,
        t: data.t,
        u: data.u,
    };
}
interface segSegIntersection {
    failed: boolean;
    intersecting: boolean;
    intersectionLocation: vec2;
    t: number;
    u: number;
}
function sgementSegmentIntersection(
    p1: vec2,
    p2: vec2,
    p3: vec2,
    p4: vec2
): segSegIntersection {
    const { u, t, failed } = lineLineIntersection(p1, p2, p3, p4);
    const loc = [
        p1[0] + t * (p2[0] - p1[0]),
        p3[1] + t * (p4[1] - p3[1]),
    ] as vec2;
    if (u <= 0 && u >= -1 && t <= 1 && t >= 0 && !failed) {
        return {
            failed: false,
            intersecting: true,
            intersectionLocation: loc,
            t: t,
            u: u,
        };
    } else if (failed) {
        return {
            failed: true,
            intersecting: false,
            intersectionLocation: [0, 0] as vec2,
            u: u,
            t: t,
        };
    } else {
        return {
            failed: false,
            intersecting: false,
            intersectionLocation: [0, 0] as vec2,
            u: u,
            t: t,
        };
    }
}

function lineLineIntersection(p1: vec2, p2: vec2, p3: vec2, p4: vec2) {
    const [x1, y1] = p1,
        [x2, y2] = p2,
        [x3, y3] = p3,
        [x4, y4] = p4;
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    // parallel or coincident
    if (den === 0) {
        return {
            t: 0,
            u: 0,
            failed: true,
        };
    }
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = ((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
    return {
        t: t,
        u: u,
        failed: false,
    };
}

function triangulatePolygon(polygon: vertexLoop[]) {}

function getListBoundingBox(
    list: Set<RigidBody> | Map<any, RigidBody> | Array<RigidBody>,
    applyViewMatrix = false
): BoundingBox {
    const arr =
            list instanceof Map ? Array.from(list.values()) : Array.from(list),
        xs: number[] = [],
        ys: number[] = [];
    for (let o of arr) {
        for (let v of o.verticies) {
            const transformedVec = vec2.create();
            if (applyViewMatrix) {
                vec2.transformMat3(transformedVec, v, o.modelViewMatrix);
            } else {
                vec2.transformMat3(transformedVec, v, o.modelMatrix);
            }
            xs.push(transformedVec[0]);
            ys.push(transformedVec[1]);
        }
    }
    const [x, y] = [Math.min(...xs), Math.min(...ys)];
    const [dx, dy] = [Math.max(...xs), Math.max(...ys)];
    return {
        x: x,
        y: y,
        dx: dx,
        dy: dy,
    };
}
interface BoundingBox {
    x: number;
    y: number;
    dx: number;
    dy: number;
}

function AABBColision(boxA: BoundingBox, boxB: BoundingBox): boolean;
function AABBColision(
    ax: number,
    ay: number,
    adx: number,
    ady: number,
    bx: number,
    by: number,
    bdx: number,
    bdy: number
): boolean;
function AABBColision(
    ax: number | BoundingBox,
    ay: number | BoundingBox,
    adx?: number,
    ady?: number,
    bx?: number,
    by?: number,
    bdx?: number,
    bdy?: number
): boolean {
    if (typeof ax === "number" && typeof ay === "number") {
        return (
            (ax as number) < (bdx as number) &&
            (adx as number) > (bx as number) &&
            (ay as number) < (bdy as number) &&
            (ady as number) > (by as number)
        );
    } else {
        ax = <BoundingBox>ax;
        ay = <BoundingBox>ay;
        return AABBColision(ax.x, ax.y, ax.dx, ax.dy, ay.x, ay.y, ay.dx, ay.dy);
    }
}

interface binaryTree<T> {
    child1: binaryTree<T> | T;
    child2: binaryTree<T> | T;
}

export { RigidBody, RigidBodyWorld, getListBoundingBox, binaryTree, rayCast };
