import React from 'react'
import * as THREE from 'three'
import * as OrbitControls from 'three-orbitcontrols'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Cubie from './Cubie'

const ANIMATION_SPEED = 0.2
const HEADER_SIZE = 36
const axes = new Map([
    ['x', new THREE.Vector3(1, 0, 0)],
    ['y', new THREE.Vector3(0, 1, 0)],
    ['z', new THREE.Vector3(0, 0, 1)],
    ['-x', new THREE.Vector3(-1, 0, 0)],
    ['-y', new THREE.Vector3(0, -1, 0)],
    ['-z', new THREE.Vector3(0, 0, -1)],
])

class App extends React.Component {
    constructor(props){
        super(props)

        this.moveBuffer = []
        this.animating = false

        this.update = this.update.bind(this)
        this.animate = this.animate.bind(this)
        this.onKeyPress = this.onKeyPress.bind(this)
        this.onWindowResize = this.onWindowResize.bind(this)
        this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this)
        this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this)
        this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this)
        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)
        this.onTouchMove = this.onTouchMove.bind(this)
    }
    componentDidMount(){
        document.addEventListener('touchstart', this.onTouchStart, false)
        document.addEventListener('touchend', this.onTouchEnd, false)
        document.addEventListener('touchmove', this.onTouchMove, false)
        document.addEventListener('mousedown', this.onDocumentMouseDown, false)
        document.addEventListener('mouseup', this.onDocumentMouseUp, false)
        document.addEventListener('mousemove', this.onDocumentMouseMove, false)

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
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        domElement.appendChild(this.renderer.domElement)

        this.raycaster = new THREE.Raycaster();
        this.meshArray = []
        this.facesMap = new Map()
        this.mouse = new THREE.Vector2()
        this.delta = new THREE.Vector2()

        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.minDistance = 5
        this.controls.maxDistance = 15
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
            this.meshArray.push(cubie.mesh)
            cubie.faces.forEach((face) => {
                this.scene.add(face.mesh)
                this.meshArray.push(face.mesh)
                this.facesMap.set(face.mesh.uuid, face)
            })
        })

        this.animate()

        window.scrollTo(0, 0)
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
                    cubie.rotate(cubie.animateAxis, cubie.animateDir * ANIMATION_SPEED)
                    cubie.angle += ANIMATION_SPEED
                }
            }
        })
    }
    animate(){
        requestAnimationFrame(this.animate)

        this.update()
        this.renderer.render(this.scene, this.camera)
    }
    onKeyPress(event){
        switch(event.key){
            // case 'a':
            //     this.cube.forEach((cubie) => {
            //         if(cubie.fixedPositionVector.z === 1){
            //             cubie.rotate('z', Math.PI * 0.25)
            //         }
            //     })
            //     break
            case 'b':
                this.moveBuffer.push(this.moveB(1))
                break
            case 'd':
                this.moveBuffer.push(this.moveD(1))
                break
            case 'e':
                this.moveBuffer.push(this.moveE(1))
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
            case 's':
                this.moveBuffer.push(this.moveS(1))
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
            case 'E':
                this.moveBuffer.push(this.moveE(-1))
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
            case 'S':
                this.moveBuffer.push(this.moveS(-1))
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
    moveE = (dir) => () => {
        this.cube.forEach((cubie) => {
            if(cubie.positionVector.y === 0){
                cubie.animating = true
                cubie.angle = 0
                cubie.animateAxis = 'y'
                cubie.animateDir = dir
            }
        })
    }
    moveS = (dir) => () => {
        this.cube.forEach((cubie) => {
            if(cubie.positionVector.z === 0){
                cubie.animating = true
                cubie.angle = 0
                cubie.animateAxis = 'z'
                cubie.animateDir = -dir
            }
        })
    }
    onWindowResize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    onTouchStart(event){
        event.offsetX = event.touches[0].clientX
        event.offsetY = event.touches[0].clientY - HEADER_SIZE
        this.onDocumentMouseDown(event)
    }
    onTouchEnd(event){
        this.onDocumentMouseUp(event)
    }
    onTouchMove(event){
        event.offsetX = event.touches[0].clientX
        event.offsetY = event.touches[0].clientY - HEADER_SIZE
        this.onDocumentMouseMove(event)
    }
    onDocumentMouseDown(event){
        this.mouse.x = (event.offsetX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1

        this.raycaster.setFromCamera(this.mouse.clone(), this.camera);

        var intersects = this.raycaster.intersectObjects(this.meshArray, true)
        if(intersects.length > 0 && this.facesMap.has(intersects[0].object.uuid)){
            this.controls.enabled = false
            this.selectedObject = intersects[0];
            // console.log(this.selectedObject);
            // console.log(this.facesMap.get(this.selectedObject.object.uuid).fixedPositionVector)
            // console.log(this.facesMap.get(this.selectedObject.object.uuid).fixedFacingVector)
        }
    }
    onDocumentMouseUp(event){
        this.controls.enabled = true
        this.chosenAxis = null
        this.chosenDir = 0
    }
    onDocumentMouseMove(event){
        if(!this.controls.enabled && this.chosenAxis == null){
            this.delta.x = ((event.offsetX / window.innerWidth) * 2 - 1) - this.mouse.x
            this.delta.y = (-(event.offsetY / window.innerHeight) * 2 + 1) - this.mouse.y
            if(this.delta.length() > 0.015){
                if(Math.abs(this.delta.x) > Math.abs(this.delta.y)){
                    // console.log('going left/right')
                    this.chosenAxis = 'x'
                    this.chosenDir = this.delta.x > 0 ? 1 : -1
                }
                else{
                    // console.log('going up/down')
                    this.chosenAxis = 'y'
                    this.chosenDir = this.delta.y > 0 ? 1 : -1
                }
                var closestDistance = Infinity
                var closestAxis = null
                var cameraVector = new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z)
                var distance
                for(var [axis, axisVector] of axes){
                    distance = axisVector.distanceTo(cameraVector)
                    if(distance < closestDistance){
                        closestDistance = distance
                        closestAxis = axis
                    }
                }
                // console.log('closest axis:', closestAxis)
                var selectedFace = this.facesMap.get(this.selectedObject.object.uuid)
                var sign = -1
                switch(closestAxis){
                    case 'z':
                        sign = 1
                        // purposefully no `break` here
                    // eslint-disable-next-line
                    case '-z':
                        switch(this.chosenAxis){
                            case 'x':
                                if(Math.abs(selectedFace.fixedFacingVector.y) === 1){
                                    switch(selectedFace.fixedPositionVector.z){
                                        case -1:
                                            this.moveBuffer.push(this.moveB(-1*this.chosenDir*selectedFace.fixedFacingVector.y*sign))
                                            break
                                        case 0:
                                            this.moveBuffer.push(this.moveS(this.chosenDir*selectedFace.fixedFacingVector.y*sign))
                                            break
                                        case 1:
                                            this.moveBuffer.push(this.moveF(this.chosenDir*selectedFace.fixedFacingVector.y*sign))
                                            break
                                        default:
                                            break
                                    }
                                }
                                else{
                                    switch(selectedFace.fixedPositionVector.y){
                                        case -1:
                                            this.moveBuffer.push(this.moveD(this.chosenDir))
                                            break
                                        case 0:
                                            this.moveBuffer.push(this.moveE(this.chosenDir))
                                            break
                                        case 1:
                                            this.moveBuffer.push(this.moveU(-1*this.chosenDir))
                                            break
                                        default:
                                            break
                                    }
                                }
                                break
                            case 'y':
                                if(Math.abs(selectedFace.fixedFacingVector.x) === 1){
                                    switch(selectedFace.fixedPositionVector.z){
                                        case -1:
                                            this.moveBuffer.push(this.moveB(this.chosenDir*selectedFace.fixedFacingVector.x))
                                            break
                                        case 0:
                                            this.moveBuffer.push(this.moveS(-1*this.chosenDir*selectedFace.fixedFacingVector.x))
                                            break
                                        case 1:
                                            this.moveBuffer.push(this.moveF(-1*this.chosenDir*selectedFace.fixedFacingVector.x))
                                            break
                                        default:
                                            break
                                    }
                                }
                                else{
                                    switch(selectedFace.fixedPositionVector.x){
                                        case -1:
                                            this.moveBuffer.push(this.moveL(-1*this.chosenDir*sign))
                                            break
                                        case 0:
                                            this.moveBuffer.push(this.moveM(-1*this.chosenDir*sign))
                                            break
                                        case 1:
                                            this.moveBuffer.push(this.moveR(this.chosenDir*sign))
                                            break
                                        default:
                                            break
                                    }
                                }
                                break
                            default:
                                break
                        }
                        break
                    case 'x':
                        sign = 1
                        // purposefully no `break` here
                    // eslint-disable-next-line
                    case '-x':
                        switch(this.chosenAxis){
                            case 'x':
                                if(Math.abs(selectedFace.fixedFacingVector.y) === 1){
                                    switch(selectedFace.fixedPositionVector.x){
                                        case -1:
                                            this.moveBuffer.push(this.moveL(-1*this.chosenDir*selectedFace.fixedFacingVector.y*sign))
                                            break
                                        case 0:
                                            this.moveBuffer.push(this.moveM(-1*this.chosenDir*selectedFace.fixedFacingVector.y*sign))
                                            break
                                        case 1:
                                            this.moveBuffer.push(this.moveR(this.chosenDir*selectedFace.fixedFacingVector.y*sign))
                                            break
                                        default:
                                            break
                                    }
                                }
                                else{
                                    switch(selectedFace.fixedPositionVector.y){
                                        case -1:
                                            this.moveBuffer.push(this.moveD(this.chosenDir))
                                            break
                                        case 0:
                                            this.moveBuffer.push(this.moveE(this.chosenDir))
                                            break
                                        case 1:
                                            this.moveBuffer.push(this.moveU(-1*this.chosenDir))
                                            break
                                        default:
                                            break
                                    }
                                }
                                break
                            case 'y':
                                if(Math.abs(selectedFace.fixedFacingVector.z) === 1){
                                    switch(selectedFace.fixedPositionVector.x){
                                        case -1:
                                            this.moveBuffer.push(this.moveL(-1*this.chosenDir*selectedFace.fixedFacingVector.z))
                                            break
                                        case 0:
                                            this.moveBuffer.push(this.moveM(-1*this.chosenDir*selectedFace.fixedFacingVector.z))
                                            break
                                        case 1:
                                            this.moveBuffer.push(this.moveR(this.chosenDir*selectedFace.fixedFacingVector.z))
                                            break
                                        default:
                                            break
                                    }
                                }
                                else{
                                    switch(selectedFace.fixedPositionVector.z){
                                        case -1:
                                            this.moveBuffer.push(this.moveB(this.chosenDir*sign))
                                            break
                                        case 0:
                                            this.moveBuffer.push(this.moveS(-1*this.chosenDir*sign))
                                            break
                                        case 1:
                                            this.moveBuffer.push(this.moveF(-1*this.chosenDir*sign))
                                            break
                                        default:
                                            break
                                    }
                                }
                                break
                            default:
                                break
                        }
                        break
                    case 'y':
                        sign = 1
                        // purposefully no `break` here
                    // eslint-disable-next-line
                    case '-y':
                        // need to determine which axis is 'up' relative to the camera
                        var closestTopDistance = Infinity
                        var closestTopAxis = null
                        var topSign = null
                        var rotation = this.camera.rotation.z / Math.PI * 10
                        // console.log(rotation)
                        for(var n of [-10, -5, 0, 5, 10]){
                            var diff = Math.abs(n - rotation)
                            if(diff < closestTopDistance){
                                closestTopDistance = diff
                                switch(n){
                                    case 0:
                                        closestTopAxis = 'z'
                                        topSign = sign > 0 ? -1 : 1
                                        break
                                    case -10:
                                    case 10:
                                        closestTopAxis = 'z'
                                        topSign = sign > 0 ? 1 : -1
                                        break
                                    case -5:
                                        closestTopAxis = 'x'
                                        topSign = 1
                                        break
                                    case 5:
                                        closestTopAxis = 'x'
                                        topSign = -1
                                        break
                                    default:
                                        break
                                }
                            }
                        }
                        // console.log(topSign)
                        // console.log(closestTopAxis)
                        switch(this.chosenAxis){
                            case 'x':
                                switch(closestTopAxis){
                                    case 'z':
                                        if(Math.abs(selectedFace.fixedFacingVector.y) === 1){
                                            switch(selectedFace.fixedPositionVector.z){
                                                case -1:
                                                    this.moveBuffer.push(this.moveB(this.chosenDir*topSign*sign*selectedFace.fixedFacingVector.y))
                                                    break
                                                case 0:
                                                    this.moveBuffer.push(this.moveS(-1*this.chosenDir*topSign*sign*selectedFace.fixedFacingVector.y))
                                                    break
                                                case 1:
                                                    this.moveBuffer.push(this.moveF(-1*this.chosenDir*topSign*sign*selectedFace.fixedFacingVector.y))
                                                    break
                                                default:
                                                    break
                                            }
                                        }
                                        else{
                                            switch(selectedFace.fixedPositionVector.y){
                                                case -1:
                                                    this.moveBuffer.push(this.moveD(this.chosenDir))
                                                    break
                                                case 0:
                                                    this.moveBuffer.push(this.moveE(this.chosenDir))
                                                    break
                                                case 1:
                                                    this.moveBuffer.push(this.moveU(-1*this.chosenDir))
                                                    break
                                                default:
                                                    break
                                            }
                                        }
                                        break
                                    case 'x':
                                        if(Math.abs(selectedFace.fixedFacingVector.y) === 1){
                                            switch(selectedFace.fixedPositionVector.x){
                                                case -1:
                                                    this.moveBuffer.push(this.moveL(this.chosenDir*topSign*sign*selectedFace.fixedFacingVector.y))
                                                    break
                                                case 0:
                                                    this.moveBuffer.push(this.moveM(this.chosenDir*topSign*sign*selectedFace.fixedFacingVector.y))
                                                    break
                                                case 1:
                                                    this.moveBuffer.push(this.moveR(-1*this.chosenDir*topSign*sign*selectedFace.fixedFacingVector.y))
                                                    break
                                                default:
                                                    break
                                            }
                                        }
                                        else{
                                            switch(selectedFace.fixedPositionVector.y){
                                                case -1:
                                                    this.moveBuffer.push(this.moveD(this.chosenDir))
                                                    break
                                                case 0:
                                                    this.moveBuffer.push(this.moveE(this.chosenDir))
                                                    break
                                                case 1:
                                                    this.moveBuffer.push(this.moveU(-1*this.chosenDir))
                                                    break
                                                default:
                                                    break
                                            }
                                        }
                                        break
                                    default:
                                        break
                                }
                                break
                            case 'y':
                                switch(closestTopAxis){
                                    case 'z':
                                        if(Math.abs(selectedFace.fixedFacingVector.x) === 1){
                                            switch(selectedFace.fixedPositionVector.z){
                                                case -1:
                                                    this.moveBuffer.push(this.moveB(this.chosenDir*selectedFace.fixedFacingVector.x))
                                                    break
                                                case 0:
                                                    this.moveBuffer.push(this.moveS(-1*this.chosenDir*selectedFace.fixedFacingVector.x))
                                                    break
                                                case 1:
                                                    this.moveBuffer.push(this.moveF(-1*this.chosenDir*selectedFace.fixedFacingVector.x))
                                                    break
                                                default:
                                                    break
                                            }
                                        }
                                        else{
                                            switch(selectedFace.fixedPositionVector.x){
                                                case -1:
                                                    this.moveBuffer.push(this.moveL(this.chosenDir*topSign*sign))
                                                    break
                                                case 0:
                                                    this.moveBuffer.push(this.moveM(this.chosenDir*topSign*sign))
                                                    break
                                                case 1:
                                                    this.moveBuffer.push(this.moveR(-1*this.chosenDir*topSign*sign))
                                                    break
                                                default:
                                                    break
                                            }
                                        }
                                        break
                                    case 'x':
                                        if(Math.abs(selectedFace.fixedFacingVector.z) === 1){
                                            switch(selectedFace.fixedPositionVector.x){
                                                case -1:
                                                    this.moveBuffer.push(this.moveL(-1*this.chosenDir*selectedFace.fixedFacingVector.z))
                                                    break
                                                case 0:
                                                    this.moveBuffer.push(this.moveM(-1*this.chosenDir*selectedFace.fixedFacingVector.z))
                                                    break
                                                case 1:
                                                    this.moveBuffer.push(this.moveR(this.chosenDir*selectedFace.fixedFacingVector.z))
                                                    break
                                                default:
                                                    break
                                            }
                                        }
                                        else{
                                            switch(selectedFace.fixedPositionVector.z){
                                                case -1:
                                                    this.moveBuffer.push(this.moveB(-1*this.chosenDir*topSign*sign))
                                                    break
                                                case 0:
                                                    this.moveBuffer.push(this.moveS(this.chosenDir*topSign*sign))
                                                    break
                                                case 1:
                                                    this.moveBuffer.push(this.moveF(this.chosenDir*topSign*sign))
                                                    break
                                                default:
                                                    break
                                            }
                                        }
                                        break
                                    default:
                                        break
                                }
                                break
                            default:
                                break
                        }
                        break
                    default:
                        break
                }
            }
        }
    }
    render(){
        return (
            <div id='threejs'>
            <Grid container justify='center'>
                <Button
                    variant='contained'
                >
                    Controls
                </Button>
            </Grid>
            </div>
        )
    }
}

export default App
