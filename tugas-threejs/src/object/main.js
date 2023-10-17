import * as THREE from '../../node_modules/three/build/three.module.js';
import * as dat from '../../node_modules/dat.gui/build/dat.gui.module.js';
import { ImprovedNoise } from './improved-noise.js';
import { RGBELoader } from './rgbe-loader.js';
import { OrbitControls } from './orbit-control.js';

const gui = new dat.GUI();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(15, 5, 24);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene()

renderer.render(scene, camera);

// set up ground
const groundGeometry = new THREE.BoxGeometry(15, 1, 15);
const groundMaterial = new THREE.ShadowMaterial({
    color: 0xafafaf,
    fog: true,  
    transparent: false,
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.receiveShadow = true;
groundMesh.position.y = -3;
scene.add(groundMesh);


// const textureTetrahedronGeometry = new THREE.TextureLoader().load('../../public/asset/texture/RoofShinglesOld002/RoofShinglesOld002_COL_1K_METALNESS.png');
const geometryParameter = {
    radius: 1,
    detail: 0,
}

const tetrahedronGeometry = new THREE.TetrahedronGeometry(geometryParameter.radius, geometryParameter.detail);
const tetrahedMaterial = new THREE.MeshNormalMaterial({
});
let object1 = new THREE.Mesh(tetrahedronGeometry, tetrahedMaterial);
object1.castShadow = true;
object1.position.x = -5;
scene.add(object1);

// set up green TorusKnotGeometry mesh
const textureTorusKnotGeometry = new THREE.TextureLoader().load('../../public/asset/texture/GroundWoodChips001/GroundWoodChips001_COL_1K.jpg');
const torusKnotGeometry = new THREE.TorusKnotGeometry(geometryParameter.radius);
const torusKnotMaterial = new THREE.MeshPhysicalMaterial({
    map: textureTorusKnotGeometry,
    roughness: 0.1,
});
let object2 = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
object2.castShadow = true;
object2.position.x = 0;
scene.add(object2);

// set up blue IcosahedronGeometry mesh
const textureIcosahedronGeometry = new THREE.TextureLoader().load('../../public/asset/texture/WickerWeavesBrownRattan001/WickerWeavesBrownRattan001_COL_VAR1_1K.jpg');
const icosahedronGeometry = new THREE.IcosahedronGeometry(geometryParameter.radius, geometryParameter.detail);
const icosahedronMaterial = new THREE.MeshPhysicalMaterial({
    map: textureIcosahedronGeometry,
});
let object3 = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
object3.castShadow = true;
object3.position.x = 5;
scene.add(object3);

// set up camera gui
const cameraSettings = {
    posX: camera.position.x,
    posY: camera.position.y,
    posZ: camera.position.z,
};
const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(cameraSettings, 'posX', -30, 30).onChange(() => {
    camera.position.x = cameraSettings.posX;
});
cameraFolder.add(cameraSettings, 'posY', -30, 30).onChange(() => {
    camera.position.y = cameraSettings.posY;
});
cameraFolder.add(cameraSettings, 'posZ', -30, 30).onChange(() => {
    camera.position.z = cameraSettings.posZ;
});

// set up ground and shadow gui
const groundFolder = gui.addFolder('Ground');
groundFolder.add(groundMaterial, 'transparent').name('ground transparent').onChange(() => {
    groundMaterial.needsUpdate = true;
});
groundFolder.close();

// set up geometry gui
const gemoetryFolder = gui.addFolder('Geometry');
gemoetryFolder.add(geometryParameter, 'radius', 1, 20).step(1).onChange((value) => {
    geometryParameter.radius = value;
    updateGeometry();
});
gemoetryFolder.add(geometryParameter, 'detail', 0, 5).step(1).onChange((value) => {
    geometryParameter.detail = value;
    updateGeometry();
});

function updateGeometry() {
    // Remove the old geometry
    scene.remove(object1);
    scene.remove(object2);
    scene.remove(object3);

    // Create a new geometry with updated parameters
    const updatedGeometry1 = new THREE.TetrahedronGeometry(geometryParameter.radius, geometryParameter.detail);
    const updatedGeometry2 = new THREE.TorusKnotGeometry(geometryParameter.radius);
    const updatedGeometry3 = new THREE.IcosahedronGeometry(geometryParameter.radius, geometryParameter.detail);

    // Create a new mesh with the updated geometry
    const updatedObject1 = new THREE.Mesh(updatedGeometry1, tetrahedMaterial);
    updatedObject1.castShadow = true;
    updatedObject1.position.x = -5;
    
    const updatedObject2 = new THREE.Mesh(updatedGeometry2, torusKnotMaterial);
    updatedObject2.castShadow = true;
    
    const updatedObject3 = new THREE.Mesh(updatedGeometry3, icosahedronMaterial);
    updatedObject3.castShadow = true;
    updatedObject3.position.x = 5;

    // Add the updated object to the scene
    scene.add(updatedObject1);
    scene.add(updatedObject2);
    scene.add(updatedObject3);

    // Update the reference to the current object
    object1 = updatedObject1;
    object2 = updatedObject2;
    object3 = updatedObject3;
}

// set up ambient light
const al = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(al);

// set up ambient light gui
const lightFolder = gui.addFolder('Lighting');
const alFolder = lightFolder.addFolder('ambient light');
const alSettings = { color: al.color.getHex() };
alFolder.add(al, 'visible');
alFolder.add(al, 'intensity', 0, 1, 0.1);
alFolder
    .addColor(alSettings, 'color')
    .onChange((value) => al.color.set(value));
alFolder.open();

// setup directional light + helper
const dl = new THREE.DirectionalLight(0xffffff, 0.5);
dl.position.set(150, 200, 200);
dl.castShadow = true;
const dlHelper = new THREE.DirectionalLightHelper(dl, 3);
scene.add(dl)
// mainGroup.add(dlHelper);

// set up directional light gui
const dlSettings = {
    visible: true,
    color: dl.color.getHex(),
};
const dlFolder = lightFolder.addFolder('directional light');
dlFolder.add(dlSettings, 'visible').onChange((value) => {
    dl.visible = value;
    dlHelper.visible = value;
});
dlFolder.add(dl, 'intensity', 0, 1, 0.25);
dlFolder.add(dl.position, 'y', 1, 4, 0.5);
dlFolder.add(dl, 'castShadow');
dlFolder
    .addColor(dlSettings, 'color')
    .onChange((value) => dl.color.set(value));
dlFolder.open();

function updateCamera() {
    camera.lookAt(0, 0, 0);
}

// Texture

const size = 128;
const data = new Uint8Array(size * size * size);

let i = 0;
const perlin = new ImprovedNoise();
const vector = new THREE.Vector3();

for (let z = 0; z < size; z++) {

    for (let y = 0; y < size; y++) {

        for (let x = 0; x < size; x++) {

            vector.set(x, y, z).divideScalar(size);

            const d = perlin.noise(vector.x * 6.5, vector.y * 6.5, vector.z * 6.5);

            data[i++] = d * 128 + 128;

        }

    }

}

const texture = new THREE.Data3DTexture(data, size, size, size);
texture.format = THREE.RedFormat;
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;
texture.unpackAlignment = 1;
texture.needsUpdate = true;

// Material

const vertexShader = /* glsl */`
					in vec3 position;

					uniform mat4 modelMatrix;
					uniform mat4 modelViewMatrix;
					uniform mat4 projectionMatrix;
					uniform vec3 cameraPos;

					out vec3 vOrigin;
					out vec3 vDirection;

					void main() {
						vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

						vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
						vDirection = position - vOrigin;

						gl_Position = projectionMatrix * mvPosition;
					}
				`;

const fragmentShader = /* glsl */`
					precision highp float;
					precision highp sampler3D;

					uniform mat4 modelViewMatrix;
					uniform mat4 projectionMatrix;

					in vec3 vOrigin;
					in vec3 vDirection;

					out vec4 color;

					uniform sampler3D map;

					uniform float threshold;
					uniform float steps;

					vec2 hitBox( vec3 orig, vec3 dir ) {
						const vec3 box_min = vec3( - 0.5 );
						const vec3 box_max = vec3( 0.5 );
						vec3 inv_dir = 1.0 / dir;
						vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
						vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
						vec3 tmin = min( tmin_tmp, tmax_tmp );
						vec3 tmax = max( tmin_tmp, tmax_tmp );
						float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
						float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
						return vec2( t0, t1 );
					}

					float sample1( vec3 p ) {
						return texture( map, p ).r;
					}

					#define epsilon .0001

					vec3 normal( vec3 coord ) {
						if ( coord.x < epsilon ) return vec3( 1.0, 0.0, 0.0 );
						if ( coord.y < epsilon ) return vec3( 0.0, 1.0, 0.0 );
						if ( coord.z < epsilon ) return vec3( 0.0, 0.0, 1.0 );
						if ( coord.x > 1.0 - epsilon ) return vec3( - 1.0, 0.0, 0.0 );
						if ( coord.y > 1.0 - epsilon ) return vec3( 0.0, - 1.0, 0.0 );
						if ( coord.z > 1.0 - epsilon ) return vec3( 0.0, 0.0, - 1.0 );

						float step = 0.01;
						float x = sample1( coord + vec3( - step, 0.0, 0.0 ) ) - sample1( coord + vec3( step, 0.0, 0.0 ) );
						float y = sample1( coord + vec3( 0.0, - step, 0.0 ) ) - sample1( coord + vec3( 0.0, step, 0.0 ) );
						float z = sample1( coord + vec3( 0.0, 0.0, - step ) ) - sample1( coord + vec3( 0.0, 0.0, step ) );

						return normalize( vec3( x, y, z ) );
					}

					void main(){

						vec3 rayDir = normalize( vDirection );
						vec2 bounds = hitBox( vOrigin, rayDir );

						if ( bounds.x > bounds.y ) discard;

						bounds.x = max( bounds.x, 0.0 );

						vec3 p = vOrigin + bounds.x * rayDir;
						vec3 inc = 1.0 / abs( rayDir );
						float delta = min( inc.x, min( inc.y, inc.z ) );
						delta /= steps;

						for ( float t = bounds.x; t < bounds.y; t += delta ) {

							float d = sample1( p + 0.5 );

							if ( d > threshold ) {

								color.rgb = normal( p + 0.5 ) * 0.5 + ( p * 1.5 + 0.25 );
								color.a = 1.;
								break;

							}

							p += rayDir * delta;

						}

						if ( color.a == 0.0 ) discard;

					}
				`;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: {
        map: { value: texture },
        cameraPos: { value: new THREE.Vector3() },
        threshold: { value: 0.69 },
        steps: { value: 200 }
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
});

const mesh = new THREE.Mesh(geometry, material);
mesh.position.z = 5;
scene.add(mesh);

//

const parameters = { threshold: 0.69, steps: 200 };

function update() {

    material.uniforms.threshold.value = parameters.threshold;
    material.uniforms.steps.value = parameters.steps;

}


const textureFolder = gui.addFolder('Texture');
textureFolder.add(parameters, 'threshold', 0, 1, 0.01).onChange(update);
textureFolder.add(parameters, 'steps', 0, 300, 1).onChange(update);

scene.fog = new THREE.Fog(0xcccccc, 1, 100);

const fogFolder = gui.addFolder('Fog');

fogFolder.add(scene.fog, 'near', 0, 10).onChange(function (value) {
    scene.fog.near = value;
});
fogFolder.add(scene.fog, 'far', 10, 200).onChange(function (value) {
    scene.fog.far = value;
});

const shadowFolder = gui.addFolder('Shadow');
const groundSetting = { color: groundMaterial.color.getHex() };
shadowFolder.add(dl, 'castShadow');
shadowFolder
    .addColor(groundSetting, 'color').name('shadow color')
    .onChange((value) => groundMaterial.color.set(value));
shadowFolder.add(groundMaterial, 'fog').name('shadow fog').onChange(() => {
    groundMaterial.needsUpdate = true;
});
shadowFolder.close();

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

new RGBELoader()
    .setPath('../../public/asset/texture/')
    .load('quarry_01_1k.hdr', function (texture) {

        texture.mapping = THREE.EquirectangularReflectionMapping;

        scene.background = texture;
        scene.environment = texture;

    });

//

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
cubeRenderTarget.texture.type = THREE.HalfFloatType;

const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

const sphereMaterial = new THREE.MeshStandardMaterial({
    envMap: cubeRenderTarget.texture,
    roughness: 0.05,
    metalness: 1
});

const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 8), sphereMaterial);
sphere.castShadow = true;
sphere.position.z = -5
scene.add(sphere);

const panoramaFolder = gui.addFolder('Panorama');
panoramaFolder.add(renderer, 'toneMappingExposure', 0, 2).name('exposure');
panoramaFolder.add(sphereMaterial, 'roughness', 0, 1);
panoramaFolder.add(sphereMaterial, 'metalness', 0, 1);

const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;

const animate = function () {
    requestAnimationFrame(animate);

    object1.rotateX(0.003);
    object1.rotateY(-0.005);
    object1.rotateZ(0.008);

    object2.rotateX(-0.003);
    object2.rotateY(-0.005);
    object2.rotateZ(0.008);

    object3.rotateX(-0.003);
    object3.rotateY(0.005);
    object3.rotateZ(-0.008);

    updateCamera();

    cubeCamera.update(renderer, scene);

    renderer.render(scene, camera);
};

animate();