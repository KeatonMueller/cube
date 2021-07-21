import * as THREE from "https://unpkg.com/three@0.124.0/build/three.module.js";

/**
 * Enum for the axes in three dimensional space,
 * both positive and negative.
 *
 * Positive values correspond to the keys for
 * THREE.Vector3 vectors.
 */
export const Axes = Object.freeze({
    POSITIVE: {
        X: "x",
        Y: "y",
        Z: "z",
    },
    NEGATIVE: {
        X: "-x",
        Y: "-y",
        Z: "-z",
    },
});

/**
 * Normalized axis vectors corresponding to the three axes in either direction.
 */
export const AxisVectors = Object.freeze({
    [Axes.POSITIVE.X]: new THREE.Vector3(1, 0, 0),
    [Axes.POSITIVE.Y]: new THREE.Vector3(0, 1, 0),
    [Axes.POSITIVE.Z]: new THREE.Vector3(0, 0, 1),
    [Axes.NEGATIVE.X]: new THREE.Vector3(-1, 0, 0),
    [Axes.NEGATIVE.Y]: new THREE.Vector3(0, -1, 0),
    [Axes.NEGATIVE.Z]: new THREE.Vector3(0, 0, -1),
});

/**
 * Constant controlling speed of animations.
 */
export const ANIMATION_SPEED = 12.5;

/**
 * Map from key presses to the moves they correspond to.
 */
export const KeysToMoves = Object.freeze({
    u: "U",
    d: "D",
    f: "F",
    b: "B",
    r: "R",
    l: "L",
    m: "M",
    e: "E",
    s: "S",
    x: "X",
    y: "Y",
    z: "Z",
    U: "U'",
    D: "D'",
    F: "F'",
    B: "B'",
    R: "R'",
    L: "L'",
    M: "M'",
    E: "E'",
    S: "S'",
    X: "X'",
    Y: "Y'",
    Z: "Z'",
});
