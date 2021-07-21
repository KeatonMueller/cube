import * as THREE from "https://unpkg.com/three@0.124.0/build/three.module.js";

import { Axes } from "./Constants.js";

/**
 * Rotation matrices to rotate the THREE.Vector3 about an axis by
 * a given angle.
 *
 * See: https://en.wikipedia.org/wiki/Rotation_matrix#In_three_dimensions
 * for more info on rotation matrices.
 */

/**
 * Get a rotation matrix to rotate on the X-axis
 * by theta radians.
 */
function getXRotationMatrix(theta) {
    const m = new THREE.Matrix3();
    m.set(
        1,
        0,
        0,
        0,
        Math.cos(theta),
        -Math.sin(theta),
        0,
        Math.sin(theta),
        Math.cos(theta)
    );
    return m;
}

/**
 * Get a rotation matrix to rotate on the Y-axis
 * by theta radians.
 */
function getYRotationMatrix(theta) {
    const m = new THREE.Matrix3();
    m.set(
        Math.cos(theta),
        0,
        Math.sin(theta),
        0,
        1,
        0,
        -Math.sin(theta),
        0,
        Math.cos(theta)
    );
    return m;
}

/**
 * Get a rotation matrix to rotate on the Z-axis
 * by theta radians.
 */
function getZRotationMatrix(theta) {
    const m = new THREE.Matrix3();
    m.set(
        Math.cos(theta),
        -Math.sin(theta),
        0,
        Math.sin(theta),
        Math.cos(theta),
        0,
        0,
        0,
        1
    );
    return m;
}

/**
 * Array of rotation matrices, one per axis.
 */
const rotationMatrices = [
    getXRotationMatrix,
    getYRotationMatrix,
    getZRotationMatrix,
];

/**
 * Map from axis to index into rotationMatrices array.
 */
const axisEnum = Object.freeze({
    [Axes.POSITIVE.X]: 0,
    [Axes.POSITIVE.Y]: 1,
    [Axes.POSITIVE.Z]: 2,
});

/**
 * Get a rotation matrix for the given axis ("x", "y", or "z")
 * for the given number of radians.
 */
export default function getRotationMatrix(axis, theta) {
    return rotationMatrices[axisEnum[axis]](theta);
}
