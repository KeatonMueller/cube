import * as THREE from 'three'

function getXRotationMatrix(theta){
	var m = new THREE.Matrix3()
	m.set(
		1, 0, 0,
		0, Math.cos(theta), -Math.sin(theta),
		0, Math.sin(theta), Math.cos(theta)
	)
	return m
}

function getYRotationMatrix(theta){
	var m = new THREE.Matrix3()
	m.set(
		Math.cos(theta), 0, Math.sin(theta),
		0, 1, 0,
		-Math.sin(theta), 0, Math.cos(theta)
	)
	return m
}

function getZRotationMatrix(theta){
	var m = new THREE.Matrix3()
	m.set(
		Math.cos(theta), -Math.sin(theta), 0,
		Math.sin(theta), Math.cos(theta), 0,
		0, 0, 1
	)
	return m
}

var rotationMatrices = [getXRotationMatrix, getYRotationMatrix, getZRotationMatrix]
var axisEnum = Object.freeze({'x': 0, 'y': 1, 'z': 2})

export default function getRotationMatrix(axis, theta){
	return rotationMatrices[axisEnum[axis]](theta)
}
