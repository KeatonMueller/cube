import * as THREE from 'three'
import getRotationMatrix from './RotationMatrices'

var worldAxisEnum = Object.freeze({
	'x': new THREE.Vector3(1, 0, 0),
	'y': new THREE.Vector3(0, 1, 0),
	'z': new THREE.Vector3(0, 0, 1)
})

class Face {
	constructor(x, y, z, facingVector, color){
		this.positionVector = new THREE.Vector3(x, y, z)
		this.fixedPositionVector = new THREE.Vector3(x, y, z)
		this.facingVector = facingVector
		this.fixedFacingVector = new THREE.Vector3(facingVector.x, facingVector.y, facingVector.z)

		this.material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide })
		this.geometry = new THREE.PlaneGeometry(.9, .9)
		this.mesh = new THREE.Mesh(this.geometry, this.material)
		this.updatePosition(this.fixedPositionVector, this.fixedFacingVector)
		this.mesh.rotation.y = Math.PI * 0.5 * Math.abs(this.facingVector.x)
		this.mesh.rotation.x = Math.PI * 0.5 * Math.abs(this.facingVector.y)
	}

	updatePosition(positionVector, facingVector){
		//mesh.position is the actual position of the face, defined as the positionVector translated by the facingVector
		this.mesh.position.x = positionVector.x + (0.5 * facingVector.x)
		this.mesh.position.y = positionVector.y + (0.5 * facingVector.y)
		this.mesh.position.z = positionVector.z + (0.5 * facingVector.z)
		this.mesh.position.x += this.mesh.position.x > 0 ? 0.001 : -0.001
		this.mesh.position.y += this.mesh.position.y > 0 ? 0.001 : -0.001
		this.mesh.position.z += this.mesh.position.z > 0 ? 0.001 : -0.001
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
		this.mesh.rotation.y = Math.PI * 0.5 * Math.abs(this.facingVector.x)
		this.mesh.rotation.x = Math.PI * 0.5 * Math.abs(this.facingVector.y)
		this.mesh.rotation.z = 0
	}
	//performs instantaneous 90 degree turn
	turn(axis, dir){
		var rotationMatrix = getRotationMatrix(axis, dir * Math.PI * 0.5)
		this.fixedFacingVector.applyMatrix3(rotationMatrix)
		this.fixedPositionVector.applyMatrix3(rotationMatrix)
		this.updatePosition(this.fixedPositionVector, this.fixedFacingVector)
		this.lockPosition()
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
