import * as THREE from 'three'
import getRotationMatrix from './RotationMatrices'
import Config from './Config'
const CUBIE_SIZE = Config.CUBIE_SIZE

var worldAxisEnum = Object.freeze({
	'x': new THREE.Vector3(1, 0, 0),
	'y': new THREE.Vector3(0, 1, 0),
	'z': new THREE.Vector3(0, 0, 1)
})

//Rounded Rectangle code taken from three.js examples: https://threejs.org/examples/#webgl_geometry_shapes
var shape = new THREE.Shape()
var pos = 0
var size = .925*CUBIE_SIZE
var radius = .1*CUBIE_SIZE
shape.moveTo(pos, pos + radius)
shape.lineTo(pos, pos + size - radius)
shape.quadraticCurveTo(pos, pos + size, pos + radius, pos + size)
shape.lineTo(pos + size - radius, pos + size)
shape.quadraticCurveTo(pos + size, pos + size, pos + size, pos + size - radius)
shape.lineTo(pos + size, pos + radius)
shape.quadraticCurveTo(pos + size, pos, pos + size - radius, pos)
shape.lineTo(pos + radius, pos)
shape.quadraticCurveTo(pos, pos, pos, pos + radius)
var geometry = new THREE.ShapeBufferGeometry(shape)
geometry.center()

class Face {
	constructor(x, y, z, facingVector, color){
		this.positionVector = new THREE.Vector3(x, y, z)
		this.fixedPositionVector = new THREE.Vector3(x, y, z)
		this.facingVector = facingVector
		this.fixedFacingVector = new THREE.Vector3(facingVector.x, facingVector.y, facingVector.z)
		this.color = color

		this.material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide })
		this.geometry = geometry
		this.mesh = new THREE.Mesh(this.geometry, this.material)
		this.updatePosition(this.fixedPositionVector, this.fixedFacingVector)
		this.mesh.rotation.y = Math.PI * 0.5 * Math.abs(this.facingVector.x / CUBIE_SIZE)
		this.mesh.rotation.x = Math.PI * 0.5 * Math.abs(this.facingVector.y / CUBIE_SIZE)
	}

	updatePosition(positionVector, facingVector){
		//mesh.position is the actual position of the face, defined as the positionVector translated by the facingVector
		this.mesh.position.x = positionVector.x + (0.5 * facingVector.x)
		this.mesh.position.y = positionVector.y + (0.5 * facingVector.y)
		this.mesh.position.z = positionVector.z + (0.5 * facingVector.z)
		this.mesh.position.x += this.mesh.position.x > 0 ? 0.001*CUBIE_SIZE : -0.001*CUBIE_SIZE
		this.mesh.position.y += this.mesh.position.y > 0 ? 0.001*CUBIE_SIZE : -0.001*CUBIE_SIZE
		this.mesh.position.z += this.mesh.position.z > 0 ? 0.001*CUBIE_SIZE : -0.001*CUBIE_SIZE

		var axes = ['x', 'y', 'z']
		axes.forEach((axis) => {
			if(positionVector[axis] === facingVector[axis] && Math.abs(positionVector[axis]) === 1){
				for(var rest of ['x', 'y', 'z'].filter((elt) => elt !== axis)){
					if(positionVector[rest] === 1){
						this.mesh.position[rest] -= .025*CUBIE_SIZE
					}
					else if(positionVector[rest] === -1){
						this.mesh.position[rest] += .025*CUBIE_SIZE
					}
				}
			}
		})
	}

	lockPosition(){

		var x = Math.round(this.fixedPositionVector.x)
		var y = Math.round(this.fixedPositionVector.y)
		var z = Math.round(this.fixedPositionVector.z)
		this.positionVector = new THREE.Vector3(x, y, z)
		this.fixedPositionVector = new THREE.Vector3(x, y, z)

		this.facingVector = new THREE.Vector3(
			Math.round(this.fixedFacingVector.x),
			Math.round(this.fixedFacingVector.y),
			Math.round(this.fixedFacingVector.z)
		)
		this.fixedFacingVector = new THREE.Vector3(this.facingVector.x, this.facingVector.y, this.facingVector.z)
		this.mesh.rotation.y = Math.PI * 0.5 * Math.abs(this.facingVector.x / CUBIE_SIZE)
		this.mesh.rotation.x = Math.PI * 0.5 * Math.abs(this.facingVector.y / CUBIE_SIZE)
		this.mesh.rotation.z = 0
	}
	//performs instantaneous 90 degree turn
	turn(axis, dir){
		var rotationMatrix = getRotationMatrix(axis, dir * Math.PI * 0.5)
		this.fixedFacingVector.applyMatrix3(rotationMatrix)
		this.fixedPositionVector.applyMatrix3(rotationMatrix)
		this.lockPosition()
		this.updatePosition(this.fixedPositionVector, this.fixedFacingVector)
		this.mesh.rotation.y = Math.PI * 0.5 * Math.abs(this.facingVector.x)
		this.mesh.rotation.x = Math.PI * 0.5 * Math.abs(this.facingVector.y)
	}
	//performs a rotation of theta radians
	rotate(axis, theta){
		var rotationMatrix = getRotationMatrix(axis, theta)
		this.facingVector.applyMatrix3(rotationMatrix)
		this.positionVector.applyMatrix3(rotationMatrix)
		this.updatePosition(this.positionVector, this.facingVector)
		this.mesh.rotateOnWorldAxis(worldAxisEnum[axis], theta)
	}
}

export default Face
