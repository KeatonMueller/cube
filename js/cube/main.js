import * as THREE from "https://unpkg.com/three@0.124.0/build/three.module.js";
import { OrbitControls } from "../three/OrbitControls.js";

import Cube from "./Cube.js";
import {
    Axes,
    AxisVectors,
    KeysToMoves,
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
    return 0.015;
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
camera.position.x = 3;
camera.position.y = 4;
camera.position.z = 7;

// create a renderer and add it to the dom
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, getHeight());
domElement.appendChild(renderer.domElement);

// create a raycaster for handling click and drag turns
const raycaster = new THREE.Raycaster();
// vectors to store mouse position information
const mouse = new THREE.Vector2();
const delta = new THREE.Vector2();

// enable orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 5;
controls.maxDistance = 15;
controls.enablePan = false;
controls.update();

// create a new cube
const cube = new Cube(scene);

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

/**
 * Handle key press event
 */
const onKeyPress = (event) => {
    // do nothing if solving
    if (solving) return;

    if (KeysToMoves[event.key] !== undefined) {
        // push normal move if key is in KeysToMoves map
        moveBuffer.push(KeysToMoves[event.key]);
    } else if (event.key === "Enter") {
        // set solving to true and queue a solve request
        solving = true;
        moveBuffer.push(MoveFlags.SOLUTION_START);
    }
};
document.addEventListener("keypress", onKeyPress, false);

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
// variable to store the clicked object
let selectedObject;

// variables to store the chosen move based on the mouse events
let chosenAxis = null;
let chosenDir = 0;

/**
 * Handle clicks by finding the mesh that was clicked.
 */
const onDocumentMouseDown = (event) => {
    // update mouse location
    mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.offsetY / getHeight()) * 2 + 1;

    // use raycaster to find what cube meshes intersect mouse position
    raycaster.setFromCamera(mouse.clone(), camera);
    const intersects = raycaster.intersectObjects(cube.meshes, true);

    // do nothing if nothing was clicked
    if (intersects.length === 0) return;

    // update selectedObject if the topmost mesh is in the cube's stickersMap
    if (cube.stickersMap.has(intersects[0].object.uuid)) {
        // disable orbit controls so clicking the cube doesn't also move the camera
        controls.enabled = false;
        selectedObject = intersects[0];
    }
};
document.addEventListener("pointerdown", onDocumentMouseDown, false);

/**
 * Handle mouse release by enabling controls and
 * unsetting chosen axis and direction.
 */
const onDocumentMouseUp = (event) => {
    controls.enabled = true;
    chosenAxis = null;
    chosenDir = 0;
};
document.addEventListener("pointerup", onDocumentMouseUp, false);

/**
 * Handle mouse move events by determining what
 * move is being requested, and pushing it to the moveBuffer.
 *
 * Haven't figured out a good way to do this, so this method is
 * kind of terrifying, but functional at least.
 */
const onDocumentMouseMove = (event) => {
    // do nothing if not clicking, or if solving
    if (controls.enabled || chosenAxis !== null || solving) return;

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

    // find which axis is closest to the camera's vector, ie which side is facing the camera
    const cameraVector = new THREE.Vector3(
        camera.position.x,
        camera.position.y,
        camera.position.z
    );
    let closestDistance = Infinity;
    let closestAxis = null;
    let distance;
    for (var [axis, axisVector] of Object.entries(AxisVectors)) {
        distance = axisVector.distanceTo(cameraVector);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestAxis = axis;
        }
    }

    // moveBuffer.push\([\n| ]+cube.move(.)\(([\n| |\w|*|\.|1|\-]*)\)[\n| ]*\);
    // const dir = $2;\nif(dir===-1) moveBuffer.push("$1'");\nelse if(dir === 1) moveBuffer.push("$1");
    // get the mesh for the selected sticker
    const selectedSticker = cube.stickersMap.get(selectedObject.object.uuid);
    let sign = -1;
    let dir;
    switch (closestAxis) {
        case Axes.POSITIVE.Z:
            // if facing front, flip the sign
            sign = 1;
        // purposefully no `break` here
        // eslint-disable-next-line
        case Axes.NEGATIVE.Z:
            // facing front or back

            // check what direction the swipe was in
            switch (chosenAxis) {
                // swiping right/left
                case Axes.POSITIVE.X:
                    if (Math.abs(selectedSticker.fixedFacingVector.y) === 1) {
                        // the selected sticker is facing up or down
                        switch (selectedSticker.fixedPositionVector.z) {
                            case -1:
                                dir =
                                    -1 *
                                    chosenDir *
                                    selectedSticker.fixedFacingVector.y *
                                    sign;
                                if (dir === -1) moveBuffer.push("B'");
                                else if (dir === 1) moveBuffer.push("B");
                                break;
                            case 0:
                                dir =
                                    chosenDir *
                                    selectedSticker.fixedFacingVector.y *
                                    sign;
                                if (dir === -1) moveBuffer.push("S'");
                                else if (dir === 1) moveBuffer.push("S");
                                break;
                            case 1:
                                dir =
                                    chosenDir *
                                    selectedSticker.fixedFacingVector.y *
                                    sign;
                                if (dir === -1) moveBuffer.push("F'");
                                else if (dir === 1) moveBuffer.push("F");
                                break;
                            default:
                                break;
                        }
                    } else {
                        // the selected sticker is facing right, left, front, or back
                        switch (selectedSticker.fixedPositionVector.y) {
                            case -1:
                                if (chosenDir === -1) moveBuffer.push("D'");
                                else if (chosenDir === 1) moveBuffer.push("D");
                                break;
                            case 0:
                                if (chosenDir === -1) moveBuffer.push("E'");
                                else if (chosenDir === 1) moveBuffer.push("E");
                                break;
                            case 1:
                                if (-1 * chosenDir === -1)
                                    moveBuffer.push("U'");
                                else if (-1 * chosenDir === 1)
                                    moveBuffer.push("U");
                                break;
                            default:
                                break;
                        }
                    }
                    break;
                // swiping up/down
                case Axes.POSITIVE.Y:
                    if (Math.abs(selectedSticker.fixedFacingVector.x) === 1) {
                        // selected sticker is facing left or right
                        switch (selectedSticker.fixedPositionVector.z) {
                            case -1:
                                dir =
                                    chosenDir *
                                    selectedSticker.fixedFacingVector.x;
                                if (dir === -1) moveBuffer.push("B'");
                                else if (dir === 1) moveBuffer.push("B");
                                break;
                            case 0:
                                dir =
                                    -1 *
                                    chosenDir *
                                    selectedSticker.fixedFacingVector.x;
                                if (dir === -1) moveBuffer.push("S'");
                                else if (dir === 1) moveBuffer.push("S");
                                break;
                            case 1:
                                dir =
                                    -1 *
                                    chosenDir *
                                    selectedSticker.fixedFacingVector.x;
                                if (dir === -1) moveBuffer.push("F'");
                                else if (dir === 1) moveBuffer.push("F");
                                break;
                            default:
                                break;
                        }
                    } else {
                        // selected sticker is facing up, down, front, or back
                        switch (selectedSticker.fixedPositionVector.x) {
                            case -1:
                                dir = -1 * chosenDir * sign;
                                if (dir === -1) moveBuffer.push("L'");
                                else if (dir === 1) moveBuffer.push("L");
                                break;
                            case 0:
                                dir = -1 * chosenDir * sign;
                                if (dir === -1) moveBuffer.push("M'");
                                else if (dir === 1) moveBuffer.push("M");
                                break;
                            case 1:
                                dir = chosenDir * sign;
                                if (dir === -1) moveBuffer.push("R'");
                                else if (dir === 1) moveBuffer.push("R");
                                break;
                            default:
                                break;
                        }
                    }
                    break;
                default:
                    break;
            }
            break;
        case Axes.POSITIVE.X:
            // if facing right, flip the sign
            sign = 1;
        // purposefully no `break` here
        // eslint-disable-next-line
        case Axes.NEGATIVE.X:
            // facing right or left

            // check what direction the swipe was in
            switch (chosenAxis) {
                // swiping left/right
                case Axes.POSITIVE.X:
                    if (Math.abs(selectedSticker.fixedFacingVector.y) === 1) {
                        // selected sticker is facing up or down
                        switch (selectedSticker.fixedPositionVector.x) {
                            case -1:
                                dir =
                                    -1 *
                                    chosenDir *
                                    selectedSticker.fixedFacingVector.y *
                                    sign;
                                if (dir === -1) moveBuffer.push("L'");
                                else if (dir === 1) moveBuffer.push("L");
                                break;
                            case 0:
                                dir =
                                    -1 *
                                    chosenDir *
                                    selectedSticker.fixedFacingVector.y *
                                    sign;
                                if (dir === -1) moveBuffer.push("M'");
                                else if (dir === 1) moveBuffer.push("M");
                                break;
                            case 1:
                                dir =
                                    chosenDir *
                                    selectedSticker.fixedFacingVector.y *
                                    sign;
                                if (dir === -1) moveBuffer.push("R'");
                                else if (dir === 1) moveBuffer.push("R");
                                break;
                            default:
                                break;
                        }
                    } else {
                        // selected sticker is facing front, back, right, or left
                        switch (selectedSticker.fixedPositionVector.y) {
                            case -1:
                                if (chosenDir === -1) moveBuffer.push("D'");
                                else if (chosenDir === 1) moveBuffer.push("D");
                                break;
                            case 0:
                                if (chosenDir === -1) moveBuffer.push("E'");
                                else if (chosenDir === 1) moveBuffer.push("E");
                                break;
                            case 1:
                                if (-1 * chosenDir === -1)
                                    moveBuffer.push("U'");
                                else if (-1 * chosenDir === 1)
                                    moveBuffer.push("U");
                                break;
                            default:
                                break;
                        }
                    }
                    break;
                // swiping up/down
                case Axes.POSITIVE.Y:
                    if (Math.abs(selectedSticker.fixedFacingVector.z) === 1) {
                        // selected sticker is facing front or back
                        switch (selectedSticker.fixedPositionVector.x) {
                            case -1:
                                dir =
                                    -1 *
                                    chosenDir *
                                    selectedSticker.fixedFacingVector.z;
                                if (dir === -1) moveBuffer.push("L'");
                                else if (dir === 1) moveBuffer.push("L");
                                break;
                            case 0:
                                dir =
                                    -1 *
                                    chosenDir *
                                    selectedSticker.fixedFacingVector.z;
                                if (dir === -1) moveBuffer.push("M'");
                                else if (dir === 1) moveBuffer.push("M");
                                break;
                            case 1:
                                dir =
                                    chosenDir *
                                    selectedSticker.fixedFacingVector.z;
                                if (dir === -1) moveBuffer.push("R'");
                                else if (dir === 1) moveBuffer.push("R");
                                break;
                            default:
                                break;
                        }
                    } else {
                        // selected sticker is facing up, down, right, or left
                        switch (selectedSticker.fixedPositionVector.z) {
                            case -1:
                                dir = chosenDir * sign;
                                if (dir === -1) moveBuffer.push("B'");
                                else if (dir === 1) moveBuffer.push("B");
                                break;
                            case 0:
                                dir = -1 * chosenDir * sign;
                                if (dir === -1) moveBuffer.push("S'");
                                else if (dir === 1) moveBuffer.push("S");
                                break;
                            case 1:
                                dir = -1 * chosenDir * sign;
                                if (dir === -1) moveBuffer.push("F'");
                                else if (dir === 1) moveBuffer.push("F");
                                break;
                            default:
                                break;
                        }
                    }
                    break;
                default:
                    break;
            }
            break;
        case Axes.POSITIVE.Y:
            // if facing up, flip the sign
            sign = 1;
        // purposefully no `break` here
        // eslint-disable-next-line
        case Axes.NEGATIVE.Y:
            // facing up or down

            // need to determine which axis is 'up' relative to the camera based on camera's rotation
            let closestTopDistance = Infinity;
            let closestTopAxis = null;
            let topSign = null;
            const rotation = (camera.rotation.z / Math.PI) * 10;
            for (let n of [-10, -5, 0, 5, 10]) {
                const diff = Math.abs(n - rotation);
                if (diff < closestTopDistance) {
                    closestTopDistance = diff;
                    switch (n) {
                        case 0:
                            closestTopAxis = Axes.POSITIVE.Z;
                            topSign = sign > 0 ? -1 : 1;
                            break;
                        case -10:
                        case 10:
                            closestTopAxis = Axes.POSITIVE.Z;
                            topSign = sign > 0 ? 1 : -1;
                            break;
                        case -5:
                            closestTopAxis = Axes.POSITIVE.X;
                            topSign = 1;
                            break;
                        case 5:
                            closestTopAxis = Axes.POSITIVE.X;
                            topSign = -1;
                            break;
                        default:
                            break;
                    }
                }
            }
            // check what direction the swipe was in
            switch (chosenAxis) {
                // swiping left/right
                case Axes.POSITIVE.X:
                    // check what axis is "top" for current camera position
                    switch (closestTopAxis) {
                        case Axes.POSITIVE.Z:
                            if (
                                Math.abs(
                                    selectedSticker.fixedFacingVector.y
                                ) === 1
                            ) {
                                switch (selectedSticker.fixedPositionVector.z) {
                                    case -1:
                                        dir =
                                            chosenDir *
                                            topSign *
                                            sign *
                                            selectedSticker.fixedFacingVector.y;
                                        if (dir === -1) moveBuffer.push("B'");
                                        else if (dir === 1)
                                            moveBuffer.push("B");
                                        break;
                                    case 0:
                                        dir =
                                            -1 *
                                            chosenDir *
                                            topSign *
                                            sign *
                                            selectedSticker.fixedFacingVector.y;
                                        if (dir === -1) moveBuffer.push("S'");
                                        else if (dir === 1)
                                            moveBuffer.push("S");
                                        break;
                                    case 1:
                                        dir =
                                            -1 *
                                            chosenDir *
                                            topSign *
                                            sign *
                                            selectedSticker.fixedFacingVector.y;
                                        if (dir === -1) moveBuffer.push("F'");
                                        else if (dir === 1)
                                            moveBuffer.push("F");
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                switch (selectedSticker.fixedPositionVector.y) {
                                    case -1:
                                        if (chosenDir === -1)
                                            moveBuffer.push("D'");
                                        else if (chosenDir === 1)
                                            moveBuffer.push("D");
                                        break;
                                    case 0:
                                        if (chosenDir === -1)
                                            moveBuffer.push("E'");
                                        else if (chosenDir === 1)
                                            moveBuffer.push("E");
                                        break;
                                    case 1:
                                        if (-1 * chosenDir === -1)
                                            moveBuffer.push("U'");
                                        else if (-1 * chosenDir === 1)
                                            moveBuffer.push("U");
                                        break;
                                    default:
                                        break;
                                }
                            }
                            break;
                        case Axes.POSITIVE.X:
                            if (
                                Math.abs(
                                    selectedSticker.fixedFacingVector.y
                                ) === 1
                            ) {
                                switch (selectedSticker.fixedPositionVector.x) {
                                    case -1:
                                        dir =
                                            chosenDir *
                                            topSign *
                                            sign *
                                            selectedSticker.fixedFacingVector.y;
                                        if (dir === -1) moveBuffer.push("L'");
                                        else if (dir === 1)
                                            moveBuffer.push("L");
                                        break;
                                    case 0:
                                        dir =
                                            chosenDir *
                                            topSign *
                                            sign *
                                            selectedSticker.fixedFacingVector.y;
                                        if (dir === -1) moveBuffer.push("M'");
                                        else if (dir === 1)
                                            moveBuffer.push("M");
                                        break;
                                    case 1:
                                        dir =
                                            -1 *
                                            chosenDir *
                                            topSign *
                                            sign *
                                            selectedSticker.fixedFacingVector.y;
                                        if (dir === -1) moveBuffer.push("R'");
                                        else if (dir === 1)
                                            moveBuffer.push("R");
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                switch (selectedSticker.fixedPositionVector.y) {
                                    case -1:
                                        if (chosenDir === -1)
                                            moveBuffer.push("D'");
                                        else if (chosenDir === 1)
                                            moveBuffer.push("D");
                                        break;
                                    case 0:
                                        if (chosenDir === -1)
                                            moveBuffer.push("E'");
                                        else if (chosenDir === 1)
                                            moveBuffer.push("E");
                                        break;
                                    case 1:
                                        if (-1 * chosenDir === -1)
                                            moveBuffer.push("U'");
                                        else if (-1 * chosenDir === 1)
                                            moveBuffer.push("U");
                                        break;
                                    default:
                                        break;
                                }
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                // swiping up/down
                case Axes.POSITIVE.Y:
                    // check what axis is "top" for current camera position
                    switch (closestTopAxis) {
                        case Axes.POSITIVE.Z:
                            if (
                                Math.abs(
                                    selectedSticker.fixedFacingVector.x
                                ) === 1
                            ) {
                                switch (selectedSticker.fixedPositionVector.z) {
                                    case -1:
                                        dir =
                                            chosenDir *
                                            selectedSticker.fixedFacingVector.x;
                                        if (dir === -1) moveBuffer.push("B'");
                                        else if (dir === 1)
                                            moveBuffer.push("B");
                                        break;
                                    case 0:
                                        dir =
                                            -1 *
                                            chosenDir *
                                            selectedSticker.fixedFacingVector.x;
                                        if (dir === -1) moveBuffer.push("S'");
                                        else if (dir === 1)
                                            moveBuffer.push("S");
                                        break;
                                    case 1:
                                        dir =
                                            -1 *
                                            chosenDir *
                                            selectedSticker.fixedFacingVector.x;
                                        if (dir === -1) moveBuffer.push("F'");
                                        else if (dir === 1)
                                            moveBuffer.push("F");
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                switch (selectedSticker.fixedPositionVector.x) {
                                    case -1:
                                        dir = chosenDir * topSign * sign;
                                        if (dir === -1) moveBuffer.push("L'");
                                        else if (dir === 1)
                                            moveBuffer.push("L");
                                        break;
                                    case 0:
                                        dir = chosenDir * topSign * sign;
                                        if (dir === -1) moveBuffer.push("M'");
                                        else if (dir === 1)
                                            moveBuffer.push("M");
                                        break;
                                    case 1:
                                        dir = -1 * chosenDir * topSign * sign;
                                        if (dir === -1) moveBuffer.push("R'");
                                        else if (dir === 1)
                                            moveBuffer.push("R");
                                        break;
                                    default:
                                        break;
                                }
                            }
                            break;
                        case Axes.POSITIVE.X:
                            if (
                                Math.abs(
                                    selectedSticker.fixedFacingVector.z
                                ) === 1
                            ) {
                                switch (selectedSticker.fixedPositionVector.x) {
                                    case -1:
                                        dir =
                                            -1 *
                                            chosenDir *
                                            selectedSticker.fixedFacingVector.z;
                                        if (dir === -1) moveBuffer.push("L'");
                                        else if (dir === 1)
                                            moveBuffer.push("L");
                                        break;
                                    case 0:
                                        dir =
                                            -1 *
                                            chosenDir *
                                            selectedSticker.fixedFacingVector.z;
                                        if (dir === -1) moveBuffer.push("M'");
                                        else if (dir === 1)
                                            moveBuffer.push("M");
                                        break;
                                    case 1:
                                        dir =
                                            chosenDir *
                                            selectedSticker.fixedFacingVector.z;
                                        if (dir === -1) moveBuffer.push("R'");
                                        else if (dir === 1)
                                            moveBuffer.push("R");
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                switch (selectedSticker.fixedPositionVector.z) {
                                    case -1:
                                        dir = -1 * chosenDir * topSign * sign;
                                        if (dir === -1) moveBuffer.push("B'");
                                        else if (dir === 1)
                                            moveBuffer.push("B");
                                        break;
                                    case 0:
                                        dir = chosenDir * topSign * sign;
                                        if (dir === -1) moveBuffer.push("S'");
                                        else if (dir === 1)
                                            moveBuffer.push("S");
                                        break;
                                    case 1:
                                        dir = chosenDir * topSign * sign;
                                        if (dir === -1) moveBuffer.push("F'");
                                        else if (dir === 1)
                                            moveBuffer.push("F");
                                        break;
                                    default:
                                        break;
                                }
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
};
document.addEventListener("pointermove", onDocumentMouseMove, false);
