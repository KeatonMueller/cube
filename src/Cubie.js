import * as THREE from 'three'
import getRotationMatrix from './RotationMatrices'
import Face from './Face'
var geometry = new THREE.BoxGeometry(1, 1, 1)
var materialBlack = new THREE.MeshBasicMaterial({ color: 0x000000 })

class Cubie {
	constructor(x, y, z){
		this.angle = 0
		this.animating = false
		this.animateAxis = null
		this.animateDir = 0

		this.positionVector = new THREE.Vector3(x, y, z)
		this.fixedPositionVector = new THREE.Vector3(x, y, z)
		this.mesh = new THREE.Mesh(geometry, materialBlack)
		this.faces = []
		if(x === -1){
			this.faces.push(new Face(x, y, z, new THREE.Vector3(-1, 0, 0), 0x00ff00))
		}
		else if(x === 1){
			this.faces.push(new Face(x, y, z, new THREE.Vector3(1, 0, 0), 0x0000ff))
		}
		if(y === -1){
			this.faces.push(new Face(x, y, z, new THREE.Vector3(0, -1, 0), 0xffff00))
		}
		else if(y === 1){
			this.faces.push(new Face(x, y, z, new THREE.Vector3(0, 1, 0), 0xffffff))
		}
		if(z === -1){
			this.faces.push(new Face(x, y, z, new THREE.Vector3(0, 0, -1), 0xff9900))
		}
		else if(z === 1){
			this.faces.push(new Face(x, y, z, new THREE.Vector3(0, 0, 1), 0xff0000))
		}

        // var geo = new THREE.EdgesGeometry( this.mesh.geometry )
        // var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 10 } )
        // var wireframe = new THREE.LineSegments( geo, mat )
        // wireframe.renderOrder = 2
        // this.mesh.add(wireframe)


		this.updatePosition(this.fixedPositionVector)
	}
	updatePosition(vector){
        this.mesh.position.x = vector.x
        this.mesh.position.y = vector.y
        this.mesh.position.z = vector.z
	}

	lockPosition(){
		var x = Math.round(this.fixedPositionVector.x)
		var y = Math.round(this.fixedPositionVector.y)
		var z = Math.round(this.fixedPositionVector.z)
		this.positionVector = new THREE.Vector3(x, y, z)
		this.fixedPositionVector = new THREE.Vector3(x, y, z)

		this.mesh.position.x = x
		this.mesh.position.y = y
		this.mesh.position.z = z
		this.faces.forEach((face) => {
			face.lockPosition()
		})
	}
	//performs instantaneous 90 degree turn
	turn(axis, dir){
		var rotationMatrix = getRotationMatrix(axis, dir * Math.PI * 0.5)
		this.fixedPositionVector.applyMatrix3(rotationMatrix)

		this.updatePosition(this.fixedPositionVector)
		this.lockPosition()
		this.mesh.rotation.x = 0
		this.mesh.rotation.y = 0
		this.mesh.rotation.z = 0
		this.faces.forEach((face) => {
			face.turn(axis, dir)
		})
	}

	rotate(axis, theta){
		var rotationMatrix = getRotationMatrix(axis, theta)
		this.positionVector.applyMatrix3(rotationMatrix)

		this.updatePosition(this.positionVector)
		this.mesh.rotation[axis] += theta

		this.faces.forEach((face) => {
			face.rotate(axis, theta)
		})
	}
}

export default Cubie