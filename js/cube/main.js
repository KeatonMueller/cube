import * as THREE from "https://unpkg.com/three@0.124.0/build/three.module.js";
import { OrbitControls } from "../three/OrbitControls.js";

import Cube from "./Cube.js";
import {
    Axes,
    KeysToMoves,
    ClickFlags,
    MoveFlags,
    ANIMATION_SPEED,
} from "./Constants.js";

/**
 * Get height of header, for when this project is embedded in
 * another website that contains a header.
 * @returns Height (in pixels) of header
 */
const getHeaderSize = () => {
    return 0;
};

/**
 * Get the height of the window
 * @returns Height (in pixels) of main content
 */
const getHeight = () => {
    return window.innerHeight * 0.95;
};

/**
 * Get the tolerance for mouse/pointer moves.
 *
 * Higher tolerance on mobile since fingers are less
 * precise than computer mice.
 *
 * Tolerance is the minimum distance needed to drag the
 * mouse/pointer to trigger a move.
 * @returns Length of tolerance for mouse/pointer moves
 */
const getTolerance = () => {
    if (window.innerWidth <= 500) {
        return 0.1;
    }
    return 0.05;
};

// FIFO buffer storing moves when they are input using the keyboard.
const moveBuffer = [];
// flags to keep track of state.
let animating = false;
let solving = false;

// find the dom element designated for the threejs content
const domElement = document.getElementById("three");
// find the solve button
const solveButton = document.getElementById("solve-button");

// create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5f5);

// create a camera and set its position
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / getHeight(),
    0.1,
    1000
);
camera.position.x = 4;
camera.position.y = 4;
camera.position.z = 6;

// create a renderer and add it to the dom
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, getHeight());
domElement.appendChild(renderer.domElement);

// create a raycaster for handling click and drag turns
const raycaster = new THREE.Raycaster();
// vectors to store mouse position information
const mouse = new THREE.Vector2();
const delta = new THREE.Vector2();

// configure orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 15;
// only allow zooming
controls.enablePan = false;
controls.enableRotate = false;
controls.update();

// create a new cube
const cube = new Cube(scene);

// variable to store cutoff pixel location for changing cube rotations
let rotationPixelCutoff;

/**
 * Locate the front, bottom, right cubie and set its x
 * coordinate to be the new rotationPixelCutoff value.
 */
const updateRotationPixelCutoff = () => {
    const halfWidth = window.innerWidth / 2;

    // find the cubie in the front, bottom, right position
    cube.cubies.forEach((cubie) => {
        if (
            cubie.fixedPositionVector.x === 1 &&
            cubie.fixedPositionVector.y === -1 &&
            cubie.fixedPositionVector.z === 1
        ) {
            // pick its x position
            const pos = cubie.fixedPositionVector.clone();
            pos.project(camera);
            rotationPixelCutoff = pos.x * halfWidth + halfWidth;
        }
    });
};
updateRotationPixelCutoff();
// update position when zooming
controls.addEventListener("change", updateRotationPixelCutoff);

/**
 * Solve the cube.
 *
 * Adds moves needed to solve the cube to the moveBuffer, followed by SOLUTION_END.
 *
 * Uses the web assembly module compiled from the C++ solver code.
 */
const solveCube = () => {
    // get the cube state
    const state = cube.repr();
    // get the solution from the web assembly module
    const solution = Module.getSolution(state).trim();

    // do nothing if cube is already solved
    if (solution.length === 0) {
        solving = false;
        return;
    }

    // process each solution move
    solution.split(" ").forEach((move) => {
        if (move[1] === "2") {
            // if a double move, push two of the single version
            moveBuffer.push(move[0]);
            moveBuffer.push(move[0]);
        } else {
            // otherwise push the regular or prime move
            moveBuffer.push(move);
        }
    });
    // push flag signaling end of the solution
    moveBuffer.push(MoveFlags.SOLUTION_END);
};

// clock for keeping track of time
const clock = new THREE.Clock();
/**
 * "next frame" function.
 *
 * Make all necessary updates that happen per tick.
 */
const update = () => {
    // get the time since last tick
    const delta = clock.getDelta();

    // if idle, and move is pending, execute it
    if (!animating && moveBuffer.length > 0) {
        // get the move off the queue
        const move = moveBuffer.shift();

        if (move === MoveFlags.SOLUTION_END) {
            solving = false;
            animating = false;
        } else if (move === MoveFlags.SOLUTION_START) {
            solveCube();
        } else {
            // normal move. execute it and set animating to true
            cube.move(move);
            animating = true;
        }
    }
    // if any cubie is animating, perform the animation
    cube.forEach((cubie) => {
        if (cubie.animating) {
            if (cubie.angle >= Math.PI * 0.5) {
                // if it's finished rotating 90 degrees
                cubie.angle = 0;
                cubie.animating = false;
                cubie.turn(cubie.animateAxis, cubie.animateDir);
                cubie.lockPosition();
                animating = false;
            } else {
                // if it's still rotating
                cubie.rotate(
                    cubie.animateAxis,
                    cubie.animateDir * delta * ANIMATION_SPEED
                );
                cubie.angle += delta * ANIMATION_SPEED;
            }
        }
    });
};

/**
 * animation function
 */
const animate = () => {
    requestAnimationFrame(animate);

    update();
    renderer.render(scene, camera);
};
animate();

window.scrollTo(0, 0);

// variable to track if 'w' or 'W' is being held
let holdingW = false;

/**
 * Handle key press event
 */
const onKeyPress = (event) => {
    // do nothing if solving
    if (solving) return;

    // append 'w' if holding w
    const key = holdingW ? "w" + event.key : event.key;

    if (KeysToMoves[key] !== undefined) {
        // push normal move if key is in KeysToMoves map
        moveBuffer.push(KeysToMoves[key]);
    } else if (event.key === "Enter") {
        // set solving to true and queue a solve request
        solving = true;
        moveBuffer.push(MoveFlags.SOLUTION_START);
    } else if (event.key === "w" || event.key === "W") {
        holdingW = true;
    }
};
document.addEventListener("keypress", onKeyPress, false);

/**
 * Handle key up event
 */
const onKeyUp = (event) => {
    // unset holdingW if released w
    if (event.key === "w" || event.key === "W") holdingW = false;
};
document.addEventListener("keyup", onKeyUp, false);

// have solve button queue a solve
solveButton.onclick = () => {
    // do nothing if solving
    if (solving) return;

    // set solving to true and queue a solve request
    solving = true;
    moveBuffer.push(MoveFlags.SOLUTION_START);
};

/**
 * Resize canvas on window resize
 */
const onWindowResize = () => {
    camera.aspect = window.innerWidth / getHeight();
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, getHeight());
    updateRotationPixelCutoff();
};
window.addEventListener("resize", onWindowResize, false);

/**
 * Route touch events to mouse events
 */
const onTouchStart = (event) => {
    event.offsetX = event.touches[0].clientX;
    event.offsetY = event.touches[0].clientY - getHeaderSize();
    onDocumentMouseDown(event);
};
document.addEventListener("touchstart", onTouchStart, false);

const onTouchEnd = (event) => {
    onDocumentMouseUp(event);
};
document.addEventListener("touchend", onTouchEnd, false);

const onTouchMove = (event) => {
    event.offsetX = event.touches[0].clientX;
    event.offsetY = event.touches[0].clientY - getHeaderSize();
    onDocumentMouseMove(event);
};
document.addEventListener("touchmove", onTouchMove, false);

/**
 * Mouse events
 */
// variables to store the chosen move based on the mouse events
let chosenAxis = null;
let chosenDir = 0;
let selectedObject = ClickFlags.NONE;
let dragging = false;

/**
 * Handle clicks by finding the mesh that was clicked.
 */
const onDocumentMouseDown = (event) => {
    // only handle events targeting the canvas
    if (event.target.tagName.toLowerCase() !== "canvas") return;

    // set dragging to true
    dragging = true;

    // update mouse location
    mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.offsetY / getHeight()) * 2 + 1;

    // use raycaster to find what cube meshes intersect mouse position
    raycaster.setFromCamera(mouse.clone(), camera);
    const intersects = raycaster.intersectObjects(cube.meshes, true);

    // if nothing was clicked, signal a cube rotation
    if (intersects.length === 0) {
        selectedObject = ClickFlags.ROTATION;
        return;
    }

    // update selectedObject if the topmost mesh is in the cube's stickersMap
    if (cube.stickersMap.has(intersects[0].object.uuid)) {
        selectedObject = intersects[0];
    } else {
        // this case happens when the black cubie in between the stickers is clicked
        // set selectedObject to special CUBIE flag
        selectedObject = ClickFlags.CUBIE;
    }
};
document.addEventListener("pointerdown", onDocumentMouseDown, false);

/**
 * Handle mouse release by unsetting chosen axis, direction, and selected object.
 */
const onDocumentMouseUp = (event) => {
    dragging = false;
    selectedObject = ClickFlags.NONE;
    chosenAxis = null;
    chosenDir = 0;
};
document.addEventListener("pointerup", onDocumentMouseUp, false);

/**
 * Handle mouse move events by determining what
 * move is being requested, and pushing it to the moveBuffer.
 */
const onDocumentMouseMove = (event) => {
    // do nothing if not dragging, or if solving
    if (!dragging || chosenAxis !== null || solving) return;

    // do nothing if clicked a cubie
    if (selectedObject === ClickFlags.CUBIE) return;

    // find the difference of the current mouse position from where the click began
    delta.x = (event.offsetX / window.innerWidth) * 2 - 1 - mouse.x;
    delta.y = -(event.offsetY / getHeight()) * 2 + 1 - mouse.y;

    // do nothing if mouse hasn't moved far enough
    if (delta.length() <= getTolerance()) return;

    // determine if swipe is up/down or left/right
    if (Math.abs(delta.x) > Math.abs(delta.y)) {
        // if change was more in X direction than Y, then moving left/right
        chosenAxis = Axes.POSITIVE.X;
        chosenDir = delta.x > 0 ? 1 : -1;
    } else {
        // if change was more in Y direction than X, then moving up/down
        chosenAxis = Axes.POSITIVE.Y;
        chosenDir = delta.y > 0 ? 1 : -1;
    }

    // check if this is a cube rotation or a turn
    if (selectedObject === ClickFlags.ROTATION) {
        // do a cube rotation
        if (chosenAxis === Axes.POSITIVE.X) {
            if (chosenDir === -1) moveBuffer.push("y");
            else if (chosenDir === 1) moveBuffer.push("y'");
        } else if (chosenAxis === Axes.POSITIVE.Y) {
            if (event.offsetX < rotationPixelCutoff) {
                // do an x rotation if to the left of the pixel cutoff
                if (chosenDir === -1) moveBuffer.push("x'");
                else if (chosenDir === 1) moveBuffer.push("x");
            } else {
                // do a z rotation if to the right
                if (chosenDir === -1) moveBuffer.push("z");
                else if (chosenDir === 1) moveBuffer.push("z'");
            }
        }
        return;
    }

    // user is performing a move

    // get the mesh for the selected sticker
    const selectedSticker = cube.stickersMap.get(selectedObject.object.uuid);
    // check what direction the swipe was in
    if (chosenAxis === Axes.POSITIVE.X) {
        // swiping right/left
        if (selectedSticker.fixedFacingVector.y === 1) {
            // the selected sticker is facing up
            switch (selectedSticker.fixedPositionVector.z) {
                // piece is in the back layer
                case -1:
                    if (-1 * chosenDir === -1) moveBuffer.push("B'");
                    else if (-1 * chosenDir === 1) moveBuffer.push("B");
                    break;
                // piece is in the S slice
                case 0:
                    if (chosenDir === -1) moveBuffer.push("S'");
                    else if (chosenDir === 1) moveBuffer.push("S");
                    break;
                // piece is in the front layer
                case 1:
                    if (chosenDir === -1) moveBuffer.push("F'");
                    else if (chosenDir === 1) moveBuffer.push("F");
                    break;
                default:
                    break;
            }
        } else {
            // the selected sticker is facing right or front
            switch (selectedSticker.fixedPositionVector.y) {
                // piece is in bottom layer
                case -1:
                    if (chosenDir === -1) moveBuffer.push("D'");
                    else if (chosenDir === 1) moveBuffer.push("D");
                    break;
                // piece is in E slice
                case 0:
                    if (chosenDir === -1) moveBuffer.push("E'");
                    else if (chosenDir === 1) moveBuffer.push("E");
                    break;
                // piece is in up layer
                case 1:
                    if (-1 * chosenDir === -1) moveBuffer.push("U'");
                    else if (-1 * chosenDir === 1) moveBuffer.push("U");
                    break;
                default:
                    break;
            }
        }
    } else if (chosenAxis === Axes.POSITIVE.Y) {
        // swiping up/down
        if (selectedSticker.fixedFacingVector.x === 1) {
            // selected sticker is facing right
            switch (selectedSticker.fixedPositionVector.z) {
                // piece is in back layer
                case -1:
                    if (chosenDir === -1) moveBuffer.push("B'");
                    else if (chosenDir === 1) moveBuffer.push("B");
                    break;
                // piece is in S slice
                case 0:
                    if (-1 * chosenDir === -1) moveBuffer.push("S'");
                    else if (-1 * chosenDir === 1) moveBuffer.push("S");
                    break;
                // piece is in front layer
                case 1:
                    if (-1 * chosenDir === -1) moveBuffer.push("F'");
                    else if (-1 * chosenDir === 1) moveBuffer.push("F");
                    break;
                default:
                    break;
            }
        } else {
            // selected sticker is facing up or front
            switch (selectedSticker.fixedPositionVector.x) {
                // piece is in left layer
                case -1:
                    if (-1 * chosenDir === -1) moveBuffer.push("L'");
                    else if (-1 * chosenDir === 1) moveBuffer.push("L");
                    break;
                // piece is in M slice
                case 0:
                    if (-1 * chosenDir === -1) moveBuffer.push("M'");
                    else if (-1 * chosenDir === 1) moveBuffer.push("M");
                    break;
                // piece is in right layer
                case 1:
                    if (chosenDir === -1) moveBuffer.push("R'");
                    else if (chosenDir === 1) moveBuffer.push("R");
                    break;
                default:
                    break;
            }
        }
    }
    // set dragging to false to not trigger another move
    dragging = false;
};
document.addEventListener("pointermove", onDocumentMouseMove, false);
