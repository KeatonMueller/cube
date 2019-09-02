import React from 'react'
import * as THREE from 'three'
import * as OrbitControls from 'three-orbitcontrols'
// import * as math from 'mathjs'

import Cubie from './Cubie'

class App extends React.Component {
    constructor(props){
        super(props)

        this.moveBuffer = []
        this.animating = false

        this.update = this.update.bind(this)
        this.animate = this.animate.bind(this)
        this.onKeyPress = this.onKeyPress.bind(this)
        this.onWindowResize = this.onWindowResize.bind(this)
        this.moveL = this.moveL.bind(this)
        this.moveR = this.moveR.bind(this)
        this.moveF = this.moveF.bind(this)
        this.moveB = this.moveB.bind(this)
        this.moveU = this.moveU.bind(this)
        this.moveD = this.moveD.bind(this)
        this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this)
    }
    onKeyPress(event){
        switch(event.key){
            case 'b':
                this.moveBuffer.push(this.moveB(1))
                break
            case 'd':
                this.moveBuffer.push(this.moveD(1))
                break
            case 'f':
                this.moveBuffer.push(this.moveF(1))
                break
            case 'l':
                this.moveBuffer.push(this.moveL(1))
                break
            case 'm':
                this.moveBuffer.push(this.moveM(1))
                break
            case 'r':
                this.moveBuffer.push(this.moveR(1))
                break
            case 'u':
                this.moveBuffer.push(this.moveU(1))
                break
            case 'B':
                this.moveBuffer.push(this.moveB(-1))
                break
            case 'D':
                this.moveBuffer.push(this.moveD(-1))
                break
            case 'F':
                this.moveBuffer.push(this.moveF(-1))
                break
            case 'L':
                this.moveBuffer.push(this.moveL(-1))
                break
            case 'M':
                this.moveBuffer.push(this.moveM(-1))
                break
            case 'R':
                this.moveBuffer.push(this.moveR(-1))
                break
            case 'U':
                this.moveBuffer.push(this.moveU(-1))
                break
            default:
                break
        }
    }
    moveL = (dir) => () => {
        this.cube.forEach((cubie) => {
            if(cubie.positionVector.x === -1){
                cubie.animating = true
                cubie.angle = 0
                cubie.animateAxis = 'x'
                cubie.animateDir = dir
                // cubie.turn('x', 1)
                // cubie.lockPosition()
            }
        })
    }
    moveR = (dir) => () => {
        this.cube.forEach((cubie) => {
            if(cubie.positionVector.x === 1){
                cubie.animating = true
                cubie.angle = 0
                cubie.animateAxis = 'x'
                cubie.animateDir = -dir
                // cubie.turn('x', -1)
                // cubie.lockPosition()
            }
        })
    }
    moveF = (dir) => () => {
        this.cube.forEach((cubie) => {
            if(cubie.positionVector.z === 1){
                cubie.animating = true
                cubie.angle = 0
                cubie.animateAxis = 'z'
                cubie.animateDir = -dir
                // cubie.turn('z', -1)
                // cubie.lockPosition()
            }
        })
    }
    moveB = (dir) => () => {
        this.cube.forEach((cubie) => {
            if(cubie.positionVector.z === -1){
                cubie.animating = true
                cubie.angle = 0
                cubie.animateAxis = 'z'
                cubie.animateDir = dir
                // cubie.turn('z', 1)
                // cubie.lockPosition()
            }
        })
    }
    moveU = (dir) => () => {
        this.cube.forEach((cubie) => {
            if(cubie.positionVector.y === 1){
                cubie.animating = true
                cubie.angle = 0
                cubie.animateAxis = 'y'
                cubie.animateDir = -dir
                // cubie.turn('y', -1)
                // cubie.lockPosition()
            }
        })
    }
    moveD = (dir) => () => {
        this.cube.forEach((cubie) => {
            if(cubie.positionVector.y === -1){
                cubie.animating = true
                cubie.angle = 0
                cubie.animateAxis = 'y'
                cubie.animateDir = dir
                // cubie.turn('y', 1)
                // cubie.lockPosition()
            }
        })
    }
    moveM = (dir) => () => {
        this.cube.forEach((cubie) => {
            if(cubie.positionVector.x === 0){
                cubie.animating = true
                cubie.angle = 0
                cubie.animateAxis = 'x'
                cubie.animateDir = dir
                // cubie.turn('y', 1)
                // cubie.lockPosition()
            }
        })
    }
    update(){
        if(!this.animating && this.moveBuffer.length > 0){
            this.moveBuffer.pop()()
            this.animating = true
        }
        this.cube.forEach((cubie) => {
            if(cubie.animating){
                if(cubie.angle >= Math.PI * 0.5){
                    cubie.angle = 0
                    cubie.animating = false
                    cubie.turn(cubie.animateAxis, cubie.animateDir)
                    cubie.lockPosition()
                    this.animating = false
                }
                else{
                    cubie.rotate(cubie.animateAxis, cubie.animateDir * 0.2)
                    cubie.angle += 0.2
                }
            }
            // cubie.rotate('z', 0.2)
        })
    }
    animate(){
        requestAnimationFrame(this.animate)

        this.update()
        this.renderer.render(this.scene, this.camera)
    }
    onWindowResize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onDocumentMouseDown(event){
        // event.preventDefault()
        // if(event.button === 2){
        //     this.controls.enabled = false
        // }
        // else if(event.button === 0){
        //     this.controls.enabled = true
        // }
    }
    componentDidMount(){

        // document.addEventListener('mousedown', this.onDocumentMouseDown, false)
        document.addEventListener('keypress', this.onKeyPress, false)
        window.addEventListener('resize', this.onWindowResize, false)
        var domElement = document.getElementById('threejs')
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xf5f5f5);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.position.x = 3
        this.camera.position.y = 4
        this.camera.position.z = 7
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        domElement.appendChild(this.renderer.domElement)

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.minDistance = 5
        this.controls.maxDistance = 20
        this.controls.enablePan = false
        this.controls.update()

        this.cube = []
        for(var x = -1; x <= 1; x++){
            for(var y = -1; y <= 1; y++){
                for(var z = -1; z <= 1; z++){
                    this.cube.push(new Cubie(x, y, z))
                }
            }
        }
        // this.cube[0].highlight()
        this.cube.forEach((cubie) => {
            this.scene.add(cubie.mesh)
            cubie.faces.forEach((face) => {
                this.scene.add(face.mesh)
            })
        })

        this.animate()

    }
    render(){
        return (
            <div id='threejs'>
            </div>
        )
    }
}

export default App
