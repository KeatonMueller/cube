import * as THREE from "https://unpkg.com/three@0.124.0/build/three.module.js";

import getRotationMatrix from "./RotationMatrices.js";
import Sticker from "./Sticker.js";

/**
 * Rounded Box code taken from forum: https://discourse.threejs.org/t/round-edged-box/1402
 */
const width = 1; // width of box
const height = 1; // height of box
const depth = 1; // depth of box
const radius0 = 0.05; // radius of curve
const smoothness = 16; // smoothness of curve

// create a rounded box shape
const shape = new THREE.Shape();
const eps = 0.00001;
const radius = radius0 - eps;
shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
shape.absarc(
    width - radius * 2,
    height - radius * 2,
    eps,
    Math.PI / 2,
    0,
    true
);
shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);

// create the geometry based on the shape
const roundedBoxGeometry = new THREE.ExtrudeBufferGeometry(shape, {
    depth: depth - radius0 * 2,
    bevelEnabled: true,
    bevelSegments: smoothness * 2,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius0,
    curveSegments: smoothness,
});
roundedBoxGeometry.center();

// basic black material for the cubie
const materialBlack = new THREE.MeshBasicMaterial({ color: 0x000000 });

/**
 * Class for each cubie on the cube
 */
class Cubie {
    /**
     * Construct a new cubie at the given coordinates
     * @param {*} x x coordinate
     * @param {*} y y coordinate
     * @param {*} z z coordinate
     */
    constructor(x, y, z) {
        this.angle = 0;
        this.animating = false; // flag indicating if currently animating
        this.animateAxis = null; // axis around which a rotation is being animated
        this.animateDir = 0; // direction of rotation animation

        // real-time position of the cubie, updated during animation
        this.positionVector = new THREE.Vector3(x, y, z);
        // fixed position of the cubie, updated after animation is complete
        this.fixedPositionVector = new THREE.Vector3(x, y, z);

        // create mesh based on rounded box geometry
        this.mesh = new THREE.Mesh(roundedBoxGeometry, materialBlack);

        // store the stickers in an array
        this.stickers = [];

        // add stickers of appropriate color based on cubie's coordinates
        if (x === -1) {
            // add green sticker if part of left face
            this.stickers.push(
                new Sticker(x, y, z, new THREE.Vector3(-1, 0, 0), 0x00ff00)
            );
        } else if (x === 1) {
            // add blue sticker if part of right face
            this.stickers.push(
                new Sticker(x, y, z, new THREE.Vector3(1, 0, 0), 0x0000ff)
            );
        }
        if (y === -1) {
            // add yellow sticker if part of down face
            this.stickers.push(
                new Sticker(x, y, z, new THREE.Vector3(0, -1, 0), 0xffff00)
            );
        } else if (y === 1) {
            // add white sticker if part of up face
            this.stickers.push(
                new Sticker(x, y, z, new THREE.Vector3(0, 1, 0), 0xffffff)
            );
        }
        if (z === -1) {
            // add orange sticker if part of back face
            this.stickers.push(
                new Sticker(x, y, z, new THREE.Vector3(0, 0, -1), 0xff9900)
            );
        } else if (z === 1) {
            // add red sticker if part of front face
            this.stickers.push(
                new Sticker(x, y, z, new THREE.Vector3(0, 0, 1), 0xff0000)
            );
        }
        // set initial position
        this.updatePosition(this.fixedPositionVector);
    }

    /**
     * Update the mesh's position
     * @param {*} vector new position
     */
    updatePosition(vector) {
        this.mesh.position.x = vector.x;
        this.mesh.position.y = vector.y;
        this.mesh.position.z = vector.z;
    }

    /**
     * "Lock" position in place. To be called when a turn is complete.
     *
     * Assumes fixed position vector is the correct position and updates the
     * mesh's actual position to reflect that
     */
    lockPosition() {
        const x = Math.round(this.fixedPositionVector.x);
        const y = Math.round(this.fixedPositionVector.y);
        const z = Math.round(this.fixedPositionVector.z);
        this.positionVector = new THREE.Vector3(x, y, z);
        this.fixedPositionVector = new THREE.Vector3(x, y, z);

        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;
        this.stickers.forEach((sticker) => {
            sticker.lockPosition();
        });
    }

    /**
     * Perform an instantaneous 90 degree turn about the given axis in the specified direction.
     * @param {*} axis axis about which to perform the turn
     * @param {*} dir direction in which to perform the turn
     */
    turn(axis, dir) {
        var rotationMatrix = getRotationMatrix(axis, dir * Math.PI * 0.5);
        this.fixedPositionVector.applyMatrix3(rotationMatrix);
        this.lockPosition();
        this.updatePosition(this.fixedPositionVector); // TODO: remove this?
        this.mesh.rotation.x = 0;
        this.mesh.rotation.y = 0;
        this.mesh.rotation.z = 0;
        this.stickers.forEach((sticker) => {
            sticker.turn(axis, dir);
        });
    }

    /**
     * Rotate the cubie the specified number of radians about the given axis
     * @param {*} axis axis about which to perform the rotation
     * @param {*} theta radians to rotate by
     */
    rotate(axis, theta) {
        // get the rotation matrix corresponding to the requested rotation
        const rotationMatrix = getRotationMatrix(axis, theta);
        // apply rotation to the position vector
        this.positionVector.applyMatrix3(rotationMatrix);
        // update cubie's position
        this.updatePosition(this.positionVector);
        // increment mesh's rotation
        this.mesh.rotation[axis] += theta;

        // rotate each sticker as well
        this.stickers.forEach((sticker) => {
            sticker.rotate(axis, theta);
        });
    }
}

export default Cubie;
