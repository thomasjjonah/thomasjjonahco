import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { Sky } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/objects/Sky.js";

const canvas = document.querySelector("#canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	60,
	window.innerWidth / window.innerHeight,
	0.1,
	2000
);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;

const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;
skyUniforms["turbidity"].value = 10;
skyUniforms["rayleigh"].value = 5;
skyUniforms["mieCoefficient"].value = 0.005;
skyUniforms["mieDirectionalG"].value = 0.8;

const sunPosition = new THREE.Vector3();
const sunLight = new THREE.DirectionalLight(0xffffff, 2);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const waterGeo = new THREE.PlaneGeometry(500, 500, 150, 150);
const waterMat = new THREE.MeshStandardMaterial({
	color: 0x001e0f,
	roughness: 0.1,
	metalness: 0.95
});
const water = new THREE.Mesh(waterGeo, waterMat);

water.rotation.x = -Math.PI / 2;
water.position.y = -5;
scene.add(water);

camera.position.set(0, 5, 50);
camera.lookAt(0, 0, -100);

let mouseX = 0;
let mouseY = 0;
const clock = new THREE.Clock();

function updateSun() {
	const phi = THREE.MathUtils.degToRad(90 - (mouseY * 20 + 2));
	const theta = THREE.MathUtils.degToRad(180);

	sunPosition.setFromSphericalCoords(1, phi, theta);

	sky.material.uniforms["sunPosition"].value.copy(sunPosition);
	sunLight.position.copy(sunPosition).multiplyScalar(100);

	const elevation = 90 - THREE.MathUtils.radToDeg(phi);
	if (elevation > 5) {
		renderer.toneMappingExposure = 0.5;
	} else if (elevation > -5) {
		renderer.toneMappingExposure = THREE.MathUtils.lerp(
			0.1,
			0.5,
			(elevation + 5) / 10
		);
	} else {
		renderer.toneMappingExposure = 0.1;
	}
}

function animate() {
	requestAnimationFrame(animate);

	const time = clock.getElapsedTime();
	const positionAttribute = waterGeo.attributes.position;

	for (let i = 0; i < positionAttribute.count; i++) {
		const u = positionAttribute.getX(i);
		const v = positionAttribute.getY(i);
		const z =
			Math.sin(u * 0.1 + time * 1.5) * 1.2 + Math.cos(v * 0.1 + time * 1.5) * 1.2;
		positionAttribute.setZ(i, z);
	}

	waterGeo.computeVertexNormals();
	positionAttribute.needsUpdate = true;

	updateSun();
	renderer.render(scene, camera);
}

mouseX = 5;
mouseY = -0.04;

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

updateSun();
animate();
