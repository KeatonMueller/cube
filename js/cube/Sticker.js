import * as THREE from "https://unpkg.com/three@0.124.0/build/three.module.js";

import getRotationMatrix from "./RotationMatrices.js";
import { Axes, AxisVectors } from "./Constants.js";

/**
 * Rounded Rectangle code taken from three.js examples: https://threejs.org/examples/#webgl_geometry_shapes
 */
// create a new shape and manually construct a rounded square
const shape = new THREE.Shape();
const pos = 0; // the initial x and y coordinate of the square
const size = 0.925; // side length of the rounded square
const radius = 0.1; // radius of the curves in the corners of the square
// draw left side
shape.moveTo(pos, pos + radius);
shape.lineTo(pos, pos + size - radius);
// curve and draw top side
shape.quadraticCurveTo(pos, pos + size, pos + radius, pos + size);
shape.lineTo(pos + size - radius, pos + size);
// curve and draw right side
shape.quadraticCurveTo(pos + size, pos + size, pos + size, pos + size - radius);
shape.lineTo(pos + size, pos + radius);
// curve and draw bottom side
shape.quadraticCurveTo(pos + size, pos, pos + size - radius, pos);
shape.lineTo(pos + radius, pos);
// draw final curve connecting to left side
shape.quadraticCurveTo(pos, pos, pos, pos + radius);

// create a geometry from the rounded square shape
const roundedSquareGeometry = new THREE.ShapeBufferGeometry(shape);
roundedSquareGeometry.center();

/**
 * Class for an individual sticker on the cube.
 */
class Sticker {
    /**
     * Construct a new sticker at the given position facing the given
     * direction with the specified color.
     * @param {number} x X position of sticker
     * @param {number} y Y position of sticker
     * @param {number} z Z position of sticker
     * @param {*} facingVector Direction sticker is facing
     * @param {number} color Color of sticker
     */
    constructor(x, y, z, facingVector, color) {
        // real-time position of the sticker, updated during animation
        this.positionVector = new THREE.Vector3(x, y, z);
        // fixed position of the sticker, updated after animation is complete
        this.fixedPositionVector = new THREE.Vector3(x, y, z);
        // real-time direction sticker is facing, updated during animation
        this.facingVector = facingVector;
        // fixed direction sticker is facing, updated after animation is complete
        this.fixedFacingVector = new THREE.Vector3(
            facingVector.x,
            facingVector.y,
            facingVector.z
        );
        // store the color
        this.color = color;

        // create a basic material with given color
        this.material = new THREE.MeshBasicMaterial({
            color: this.color,
            side: THREE.DoubleSide,
        });
        // use the rounded square geometry for the mesh
        this.mesh = new THREE.Mesh(roundedSquareGeometry, this.material);

        // set initial position and rotation
        this.updatePosition(this.fixedPositionVector, this.fixedFacingVector);
        this.mesh.rotation.y = Math.PI * 0.5 * Math.abs(this.facingVector.x);
        this.mesh.rotation.x = Math.PI * 0.5 * Math.abs(this.facingVector.y);
    }

    getColor() {
        if (this.color === 0x00ff00) return "G";
        if (this.color === 0x0000ff) return "B";
        if (this.color === 0xffff00) return "Y";
        if (this.color === 0xffffff) return "W";
        if (this.color === 0xff9900) return "O";
        if (this.color === 0xff0000) return "R";
    }

    /**
     * Update the position of the sticker based on the new position and facing direction.
     * @param {*} positionVector new position
     * @param {*} facingVector new facing direction
     */
    updatePosition(positionVector, facingVector) {
        // this.mesh.position is the actual position of the face
        // it is defined as the positionVector translated by the facingVector
        this.mesh.position.x = positionVector.x + 0.5 * facingVector.x;
        this.mesh.position.y = positionVector.y + 0.5 * facingVector.y;
        this.mesh.position.z = positionVector.z + 0.5 * facingVector.z;
        // translate slightly further so the sticker appears above the cubie's surface
        this.mesh.position.x += this.mesh.position.x > 0 ? 0.001 : -0.001;
        this.mesh.position.y += this.mesh.position.y > 0 ? 0.001 : -0.001;
        this.mesh.position.z += this.mesh.position.z > 0 ? 0.001 : -0.001;

        const axes = Object.values(Axes.POSITIVE);
        axes.forEach((axis) => {
            // find the axis the sticker is currently facing
            if (
                positionVector[axis] === facingVector[axis] &&
                Math.abs(positionVector[axis]) === 1
            ) {
                // for the other two axes
                for (const rest of axes.filter((elt) => elt !== axis)) {
                    // translate slightly inward on that axis (if non-zero)
                    // this centers the sticker on the cubie
                    if (positionVector[rest] === 1) {
                        this.mesh.position[rest] -= 0.025;
                    } else if (positionVector[rest] === -1) {
                        this.mesh.position[rest] += 0.025;
                    }
                }
            }
        });
    }

    /**
     * "Lock" position in place. To be called when a turn is complete.
     *
     * Assumes the fixed vectors are correct and updates the mesh's position
     * and all other vectors to reflect that
     */
    lockPosition() {
        // update position vectors
        const x = Math.round(this.fixedPositionVector.x);
        const y = Math.round(this.fixedPositionVector.y);
        const z = Math.round(this.fixedPositionVector.z);
        this.positionVector = new THREE.Vector3(x, y, z);
        this.fixedPositionVector = new THREE.Vector3(x, y, z);

        // update facing vectors
        this.facingVector = new THREE.Vector3(
            Math.round(this.fixedFacingVector.x),
            Math.round(this.fixedFacingVector.y),
            Math.round(this.fixedFacingVector.z)
        );
        this.fixedFacingVector = new THREE.Vector3(
            this.facingVector.x,
            this.facingVector.y,
            this.facingVector.z
        );

        // set mesh's rotation
        this.mesh.rotation.y = Math.PI * 0.5 * Math.abs(this.facingVector.x);
        this.mesh.rotation.x = Math.PI * 0.5 * Math.abs(this.facingVector.y);
        this.mesh.rotation.z = 0;
    }
    // perform instantaneous 90 degree turn
    turn(axis, dir) {
        var rotationMatrix = getRotationMatrix(axis, dir * Math.PI * 0.5);
        this.fixedFacingVector.applyMatrix3(rotationMatrix);
        this.fixedPositionVector.applyMatrix3(rotationMatrix);
        this.lockPosition();
        this.updatePosition(this.fixedPositionVector, this.fixedFacingVector);
        this.mesh.rotation.y = Math.PI * 0.5 * Math.abs(this.facingVector.x);
        this.mesh.rotation.x = Math.PI * 0.5 * Math.abs(this.facingVector.y);
    }
    // perform a rotation of theta radians
    rotate(axis, theta) {
        var rotationMatrix = getRotationMatrix(axis, theta);
        this.facingVector.applyMatrix3(rotationMatrix);
        this.positionVector.applyMatrix3(rotationMatrix);
        this.updatePosition(this.positionVector, this.facingVector);
        this.mesh.rotateOnWorldAxis(AxisVectors[axis], theta);
    }
}

export default Sticker;
