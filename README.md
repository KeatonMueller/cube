# Rubik's Cube

This application is a virtual Rubik's Cube implemented in JavaScript using Three.js to handle 3D Rendering.

This project began in 2019 during my junior year of college.

In 2021, I completed a C++ application that solves a Rubik's Cube using the CFOP method. That program was compiled into web assembly and integrated into this one. You can read more about the solver [here](https://github.com/KeatonMueller/cube-solver).

To view this program running in browser, visit https://keatonmueller.com/cube.html.

Alternatively, you can clone this repo and open `index.html` using a server (see [here](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for an easy way to do that using VS Code).

## Controls

The controls support clockwise and counterclockwise face and slice rotations, as well as entire cube rotations.

A lowercase keystroke indicates a clockwise turn corresponding to standard cube notation, and a capital keystroke indicates a counterclockwise turn.

Wide turns are input by holding `W` and then doing the keystroke for any outer layer turn.

A table containing valid inputs is below, and you can learn about Rubik's Cube notation [here](https://ruwix.com/the-rubiks-cube/notation/) if you are unfamiliar.

The program also supports clicking and dragging to make turns. To execute a turn, click on a sticker and drag in the direction you want it to move. Clicking and dragging outside of the cube causes cube rotations.

In addition to turning, hitting the `ENTER` key or the solve button will run the cube solver program, and you can watch as the cube solves itself.

Below are keystrokes and the moves they correspond to:

| Keystroke | Result     | Keystroke       | Result |
| --------- | ---------- | --------------- | ------ |
| `U`       | U          | `SHIFT + U`     | U'     |
| `D`       | D          | `SHIFT + D`     | D'     |
| `F`       | F          | `SHIFT + F`     | F'     |
| `B`       | B          | `SHIFT + B`     | B'     |
| `R`       | R          | `SHIFT + R`     | R'     |
| `L`       | L          | `SHIFT + L`     | L'     |
| `W + U`   | u          | `W + SHIFT + U` | u'     |
| `W + D`   | d          | `W + SHIFT + D` | d'     |
| `W + F`   | f          | `W + SHIFT + F` | f'     |
| `W + B`   | b          | `W + SHIFT + B` | b'     |
| `W + R`   | r          | `W + SHIFT + R` | r'     |
| `W + L`   | l          | `W + SHIFT + L` | l'     |
| `M`       | M          | `SHIFT + M`     | M'     |
| `E`       | E          | `SHIFT + E`     | E'     |
| `S`       | S          | `SHIFT + S`     | S'     |
| `X`       | x          | `SHIFT + X`     | x'     |
| `Y`       | y          | `SHIFT + Y`     | y'     |
| `Z`       | z          | `SHIFT + Z`     | z'     |
| `ENTER`   | Solve Cube |                 |        |
