# Rubik's Cube

This application is a virtual Rubik's Cube implemented in JavaScript using Three.js to handle 3D Rendering.

This project began in 2019 during my junior year of college.

In 2021, I completed a C++ application that solved a Rubik's Cube using the CFOP method. That program was compiled into web assembly and integrated into this one. You can read more about the solver [here](https://github.com/KeatonMueller/cube-solver).

To view this program running in browser, visit https://keatonmueller.com/cube.html.

Alternatively, you can clone this repo and open `index.html` using a live server.

# Controls

The controls support clockwise and counterclockwise face and slice rotations, as well as entire cube rotations. A lowercase keystroke indicates a clockwise turn of the corresponding face or slice, and a capital keystroke indicates a counterclockwise rotation.

You cannot do wide turns since there was no easy way of encoding them into keystrokes.

You can learn more about traditional Rubik's Cube notation [here](https://ruwix.com/the-rubiks-cube/notation/).

In addition to turning, hitting `ENTER` will run the cube solver program, and you can watch as the cube solves itself.

Below are keystrokes and the moves they correspond to:

| Keystroke   | Result     |
|-------------|------------|
| `U`         | U          |
| `SHIFT + U` | U'         |
| `D`         | D          |
| `SHIFT + D` | D'         |
| `F`         | F          |
| `SHIFT + F` | F'         |
| `B`         | B          |
| `SHIFT + B` | B'         |
| `R`         | R          |
| `SHIFT + R` | R'         |
| `L`         | L          |
| `SHIFT + L` | L'         |
| `M`         | M          |
| `SHIFT + M` | M'         |
| `E`         | E          |
| `SHIFT + E` | E'         |
| `S`         | S          |
| `SHIFT + S` | S'         |
| `X`         | x          |
| `SHIFT + X` | x'         |
| `Y`         | y          |
| `SHIFT + Y` | y'         |
| `Z`         | z          |
| `SHIFT + Z` | z'         |
| `ENTER`     | Solve Cube |
