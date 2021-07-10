import Cubie from "./Cubie.js";
class Cube {
    constructor(scene, meshArray, facesMap) {
        this.cubies = [];
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    this.cubies.push(new Cubie(x, y, z));
                }
            }
        }
        this.cubies.forEach((cubie) => {
            scene.add(cubie.mesh);
            meshArray.push(cubie.mesh);
            cubie.faces.forEach((face) => {
                scene.add(face.mesh);
                meshArray.push(face.mesh);
                facesMap.set(face.mesh.uuid, face);
            });
        });

        // store the moves that have been executed
        this.moves = [];
    }

    getMoves() {
        return this.moves.join(" ");
    }

    clearMoves() {
        this.moves = [];
    }

    forEach(fn) {
        this.cubies.forEach((cubie) => {
            fn(cubie);
        });
    }

    moveL(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("L");
            else if (dir === -1) this.moves.push("L'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.x === -1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveR(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("R");
            else if (dir === -1) this.moves.push("R'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.x === 1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
    moveF(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("F");
            else if (dir === -1) this.moves.push("F'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.z === 1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
    moveB(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("B");
            else if (dir === -1) this.moves.push("B'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.z === -1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveU(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("U");
            else if (dir === -1) this.moves.push("U'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.y === 1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
    moveD(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("D");
            else if (dir === -1) this.moves.push("D'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.y === -1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveWideL(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("l");
            else if (dir === -1) this.moves.push("l'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.x === -1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = dir;
                } else if (cubie.positionVector.x === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveWideR(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("r");
            else if (dir === -1) this.moves.push("r'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.x === 1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = -dir;
                } else if (cubie.positionVector.x === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
    moveWideF(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("f");
            else if (dir === -1) this.moves.push("f'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.z === 1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = -dir;
                } else if (cubie.positionVector.z === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
    moveWideB(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("b");
            else if (dir === -1) this.moves.push("b'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.z === -1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = dir;
                } else if (cubie.positionVector.z === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveWideU(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("u");
            else if (dir === -1) this.moves.push("u'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.y === 1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = -dir;
                } else if (cubie.positionVector.y === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
    moveWideD(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("d");
            else if (dir === -1) this.moves.push("d'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.y === -1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = dir;
                } else if (cubie.positionVector.y === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveM(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("M");
            else if (dir === -1) this.moves.push("M'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.x === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveE(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("E");
            else if (dir === -1) this.moves.push("E'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.y === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = dir;
                }
            });
        };
    }
    moveS(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("S");
            else if (dir === -1) this.moves.push("S'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.z === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
    moveX(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("x");
            else if (dir === -1) this.moves.push("x'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.x === 1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = -dir;
                } else if (cubie.positionVector.x === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = -dir;
                } else if (cubie.positionVector.x === -1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "x";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
    moveY(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("y");
            else if (dir === -1) this.moves.push("y'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.y === 1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = -dir;
                } else if (cubie.positionVector.y === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = -dir;
                } else if (cubie.positionVector.y === -1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "y";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
    moveZ(dir) {
        return () => {
            // record the move
            if (dir === 1) this.moves.push("z");
            else if (dir === -1) this.moves.push("z'");

            this.cubies.forEach((cubie) => {
                if (cubie.positionVector.z === 1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = -dir;
                } else if (cubie.positionVector.z === 0) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = -dir;
                } else if (cubie.positionVector.z === -1) {
                    cubie.animating = true;
                    cubie.angle = 0;
                    cubie.animateAxis = "z";
                    cubie.animateDir = -dir;
                }
            });
        };
    }
}

export default Cube;
