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
    }

    forEach(fn) {
        this.cubies.forEach((cubie) => {
            fn(cubie);
        });
    }

    repr() {
        // stickers[face][x][y] = sticker at x, y on that face
        let stickers = [
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
                cubie.faces.forEach((face) => {
                    if (face.facingVector.y === 1)
                        stickers[0][face.fixedPositionVector.z + 1][
                            face.fixedPositionVector.x + 1
                        ] = face.getColor();
                });
            }
            // down face
            if (cubie.positionVector.y === -1) {
                cubie.faces.forEach((face) => {
                    if (face.facingVector.y === -1) {
                        stickers[1][-1 * face.fixedPositionVector.z + 1][
                            face.fixedPositionVector.x + 1
                        ] = face.getColor();
                    }
                });
            }
            // front face
            if (cubie.positionVector.z === 1) {
                cubie.faces.forEach((face) => {
                    if (face.facingVector.z === 1)
                        stickers[2][-1 * face.fixedPositionVector.y + 1][
                            face.fixedPositionVector.x + 1
                        ] = face.getColor();
                });
            }
            // back face
            if (cubie.positionVector.z === -1) {
                cubie.faces.forEach((face) => {
                    if (face.facingVector.z === -1)
                        stickers[3][-1 * face.fixedPositionVector.y + 1][
                            -1 * face.fixedPositionVector.x + 1
                        ] = face.getColor();
                });
            }
            // right face
            if (cubie.positionVector.x === 1) {
                cubie.faces.forEach((face) => {
                    if (face.facingVector.x === 1)
                        stickers[4][-1 * face.fixedPositionVector.y + 1][
                            -1 * face.fixedPositionVector.z + 1
                        ] = face.getColor();
                });
            }
            // left face
            if (cubie.positionVector.x === -1) {
                cubie.faces.forEach((face) => {
                    if (face.facingVector.x === -1)
                        stickers[5][-1 * face.fixedPositionVector.y + 1][
                            face.fixedPositionVector.z + 1
                        ] = face.getColor();
                });
            }
        });
        let cubeRepr = "";

        stickers.forEach((face) => {
            face.forEach((line) => {
                cubeRepr += line.join("");
            });
        });

        return cubeRepr;
    }

    moveL(dir) {
        return () => {
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
