import Cubie from "./Cubie.js";
import { Axes } from "./Constants.js";

/**
 * Class to store the meshes for the cubies and stickers comprising a Rubik's Cube.
 */
class Cube {
    /**
     * Construct a new cube.
     * @param {*} scene threejs scene the cube is a part of
     */
    constructor(scene) {
        // array to store every Cubie object
        this.cubies = [];
        // array to store all the meshes comprising the cube
        this.meshes = [];
        // map from sticker's mesh uuid to the mesh itself
        this.stickersMap = new Map();

        // initialize 26 cubies (ignoring the very center)
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    if (x !== 0 || y !== 0 || z !== 0)
                        this.cubies.push(new Cubie(x, y, z));
                }
            }
        }
        // for each cubie
        this.cubies.forEach((cubie) => {
            // add it to the scene
            scene.add(cubie.mesh);
            // add cubie's mesh to mesh array
            this.meshes.push(cubie.mesh);
            // for each sticker on the cubie
            cubie.stickers.forEach((sticker) => {
                // add sticker to scene, mesh array, and stickers map
                scene.add(sticker.mesh);
                this.meshes.push(sticker.mesh);
                this.stickersMap.set(sticker.mesh.uuid, sticker);
            });
        });
    }

    /**
     * Perform a given function on every cubie in the cube.
     * @param {*} fn function to perform on each cubie
     */
    forEach(fn) {
        this.cubies.forEach((cubie) => {
            fn(cubie);
        });
    }

    /**
     * Generate and return a unique string representation of the cube state.
     * @returns string representation of the cube state
     */
    repr() {
        // first figure out what stickers are where by examining the cubies array

        // stickers[face][x][y] = sticker at x, y on that face,
        // where faces are ordered up, down, front, back, right, left
        const stickers = [
            [
                ["B", "B", "B"],
                ["B", "B", "B"],
                ["B", "B", "B"],
            ],
            [
                ["B", "B", "B"],
                ["B", "B", "B"],
                ["B", "B", "B"],
            ],
            [
                ["B", "B", "B"],
                ["B", "B", "B"],
                ["B", "B", "B"],
            ],
            [
                ["B", "B", "B"],
                ["B", "B", "B"],
                ["B", "B", "B"],
            ],
            [
                ["B", "B", "B"],
                ["B", "B", "B"],
                ["B", "B", "B"],
            ],
            [
                ["B", "B", "B"],
                ["B", "B", "B"],
                ["B", "B", "B"],
            ],
        ];
        // for each cubie, store its face color
        this.cubies.forEach((cubie) => {
            // up face
            if (cubie.positionVector.y === 1) {
                cubie.stickers.forEach((sticker) => {
                    if (sticker.facingVector.y === 1)
                        stickers[0][sticker.fixedPositionVector.z + 1][
                            sticker.fixedPositionVector.x + 1
                        ] = sticker.getColor();
                });
            }
            // down face
            if (cubie.positionVector.y === -1) {
                cubie.stickers.forEach((sticker) => {
                    if (sticker.facingVector.y === -1) {
                        stickers[1][-1 * sticker.fixedPositionVector.z + 1][
                            sticker.fixedPositionVector.x + 1
                        ] = sticker.getColor();
                    }
                });
            }
            // front face
            if (cubie.positionVector.z === 1) {
                cubie.stickers.forEach((sticker) => {
                    if (sticker.facingVector.z === 1)
                        stickers[2][-1 * sticker.fixedPositionVector.y + 1][
                            sticker.fixedPositionVector.x + 1
                        ] = sticker.getColor();
                });
            }
            // back face
            if (cubie.positionVector.z === -1) {
                cubie.stickers.forEach((sticker) => {
                    if (sticker.facingVector.z === -1)
                        stickers[3][-1 * sticker.fixedPositionVector.y + 1][
                            -1 * sticker.fixedPositionVector.x + 1
                        ] = sticker.getColor();
                });
            }
            // right face
            if (cubie.positionVector.x === 1) {
                cubie.stickers.forEach((sticker) => {
                    if (sticker.facingVector.x === 1)
                        stickers[4][-1 * sticker.fixedPositionVector.y + 1][
                            -1 * sticker.fixedPositionVector.z + 1
                        ] = sticker.getColor();
                });
            }
            // left face
            if (cubie.positionVector.x === -1) {
                cubie.stickers.forEach((sticker) => {
                    if (sticker.facingVector.x === -1)
                        stickers[5][-1 * sticker.fixedPositionVector.y + 1][
                            sticker.fixedPositionVector.z + 1
                        ] = sticker.getColor();
                });
            }
        });

        // construct the repr from the extracted stickers data
        let cubeRepr = "";
        stickers.forEach((sticker) => {
            sticker.forEach((line) => {
                cubeRepr += line.join("");
            });
        });

        return cubeRepr;
    }

    /**
     * Initiate the animation for the requested move.
     *
     * The move string should correspond to standard cube notation.
     *
     * @param {string} moveStr Move to perform
     */
    move(moveStr) {
        switch (moveStr) {
            case "U":
                this.moveLayer(Axes.POSITIVE.Y, 1, 1);
                return;
            case "U'":
                this.moveLayer(Axes.POSITIVE.Y, 1, -1);
                return;
            case "u":
                this.moveLayer(Axes.POSITIVE.Y, 1, 1);
                this.moveLayer(Axes.POSITIVE.Y, 0, -1);
                return;
            case "u'":
                this.moveLayer(Axes.POSITIVE.Y, 1, -1);
                this.moveLayer(Axes.POSITIVE.Y, 0, 1);
                return;
            case "D":
                this.moveLayer(Axes.POSITIVE.Y, -1, 1);
                return;
            case "D'":
                this.moveLayer(Axes.POSITIVE.Y, -1, -1);
                return;
            case "d":
                this.moveLayer(Axes.POSITIVE.Y, -1, 1);
                this.moveLayer(Axes.POSITIVE.Y, 0, 1);
                return;
            case "d'":
                this.moveLayer(Axes.POSITIVE.Y, -1, -1);
                this.moveLayer(Axes.POSITIVE.Y, 0, -1);
                return;
            case "F":
                this.moveLayer(Axes.POSITIVE.Z, 1, 1);
                return;
            case "F'":
                this.moveLayer(Axes.POSITIVE.Z, 1, -1);
                return;
            case "f":
                this.moveLayer(Axes.POSITIVE.Z, 1, 1);
                this.moveLayer(Axes.POSITIVE.Z, 0, 1);
                return;
            case "f'":
                this.moveLayer(Axes.POSITIVE.Z, 1, -1);
                this.moveLayer(Axes.POSITIVE.Z, 0, -1);
                return;
            case "B":
                this.moveLayer(Axes.POSITIVE.Z, -1, 1);
                return;
            case "B'":
                this.moveLayer(Axes.POSITIVE.Z, -1, -1);
                return;
            case "b":
                this.moveLayer(Axes.POSITIVE.Z, -1, 1);
                this.moveLayer(Axes.POSITIVE.Z, 0, -1);
                return;
            case "b'":
                this.moveLayer(Axes.POSITIVE.Z, -1, -1);
                this.moveLayer(Axes.POSITIVE.Z, 0, 1);
                return;
            case "R":
                this.moveLayer(Axes.POSITIVE.X, 1, 1);
                return;
            case "R'":
                this.moveLayer(Axes.POSITIVE.X, 1, -1);
                return;
            case "r":
                this.moveLayer(Axes.POSITIVE.X, 1, 1);
                this.moveLayer(Axes.POSITIVE.X, 0, -1);
                return;
            case "r'":
                this.moveLayer(Axes.POSITIVE.X, 1, -1);
                this.moveLayer(Axes.POSITIVE.X, 0, 1);
                return;
            case "L":
                this.moveLayer(Axes.POSITIVE.X, -1, 1);
                return;
            case "L'":
                this.moveLayer(Axes.POSITIVE.X, -1, -1);
                return;
            case "l":
                this.moveLayer(Axes.POSITIVE.X, -1, 1);
                this.moveLayer(Axes.POSITIVE.X, 0, 1);
                return;
            case "l'":
                this.moveLayer(Axes.POSITIVE.X, -1, -1);
                this.moveLayer(Axes.POSITIVE.X, 0, -1);
                return;
            case "M":
                this.moveLayer(Axes.POSITIVE.X, 0, 1);
                return;
            case "M'":
                this.moveLayer(Axes.POSITIVE.X, 0, -1);
                return;
            case "E":
                this.moveLayer(Axes.POSITIVE.Y, 0, 1);
                return;
            case "E'":
                this.moveLayer(Axes.POSITIVE.Y, 0, -1);
                return;
            case "S":
                this.moveLayer(Axes.POSITIVE.Z, 0, 1);
                return;
            case "S'":
                this.moveLayer(Axes.POSITIVE.Z, 0, -1);
                return;
            case "x":
            case "X":
                this.moveLayer(Axes.POSITIVE.X, -1, -1);
                this.moveLayer(Axes.POSITIVE.X, 0, -1);
                this.moveLayer(Axes.POSITIVE.X, 1, 1);
                return;
            case "x'":
            case "X'":
                this.moveLayer(Axes.POSITIVE.X, -1, 1);
                this.moveLayer(Axes.POSITIVE.X, 0, 1);
                this.moveLayer(Axes.POSITIVE.X, 1, -1);
                return;
            case "y":
            case "Y":
                this.moveLayer(Axes.POSITIVE.Y, -1, -1);
                this.moveLayer(Axes.POSITIVE.Y, 0, -1);
                this.moveLayer(Axes.POSITIVE.Y, 1, 1);
                return;
            case "y'":
            case "Y'":
                this.moveLayer(Axes.POSITIVE.Y, -1, 1);
                this.moveLayer(Axes.POSITIVE.Y, 0, 1);
                this.moveLayer(Axes.POSITIVE.Y, 1, -1);
                return;
            case "z":
            case "Z":
                this.moveLayer(Axes.POSITIVE.Z, -1, -1);
                this.moveLayer(Axes.POSITIVE.Z, 0, 1);
                this.moveLayer(Axes.POSITIVE.Z, 1, 1);
                return;
            case "z'":
            case "Z'":
                this.moveLayer(Axes.POSITIVE.Z, -1, 1);
                this.moveLayer(Axes.POSITIVE.Z, 0, -1);
                this.moveLayer(Axes.POSITIVE.Z, 1, -1);
                return;
        }
    }

    /**
     * Initiate the animation for the given layer of the cube.
     *
     * dir = -1 indicates a counter clockwise turn, and
     * dir = 1 indicates a clockwise turn.
     *
     * @param {*} axis axis used to identify pieces to turn
     * @param {*} axisValue sign (-1, 0, or 1) of the axis to identify pieces to turn
     * @param {*} dir direction (-1 or 1) to turn pieces
     * @returns a function that triggers the requested outer layer turn
     */
    moveLayer(axis, axisValue, dir) {
        // have axisValue change animDir only if non-zero
        let animDir = dir;
        // performing an outer layer turn
        if (axisValue !== 0) animDir *= -1 * axisValue;
        // performing a slice move, so the dir is a bit trickier to determine
        else if (axis == Axes.POSITIVE.Z) {
            // S slice gets the opposite sign
            animDir *= -1;
        }

        // turn all pieces who are positioned in the correct layer
        this.cubies.forEach((cubie) => {
            if (cubie.positionVector[axis] === axisValue) {
                cubie.animating = true;
                cubie.angle = 0;
                cubie.animateAxis = axis;
                cubie.animateDir = animDir;
            }
        });
    }
}

export default Cube;
