import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
// import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import vertexShader from '../shaders/vertexShader.vert'
import fragmentShader from '../shaders/fragmentShader.frag'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#000000');

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.SphereGeometry(1.0,128,128)
const plane = new THREE.PlaneGeometry(10,10)

//Light
const directionalLight = new THREE.DirectionalLight('#fff7e0', 0.25)
directionalLight.position.set(1, -3.5, 3);
directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.castShadow = true

directionalLight.shadow.camera.near = 0.5; // default
directionalLight.shadow.camera.far = 10; 

scene.add( directionalLight );

const ambientLight = new THREE.AmbientLight("#ffffff", 0.25);

//scene.add(ambientLight);

// const helper = new THREE.CameraHelper( directionalLight.shadow.camera );
// scene.add( helper );


// Material
const material = new THREE.ShaderMaterial(
    {
        lights: true,
        uniforms:{ 
            ...THREE.UniformsLib.lights,
            uColor: {value: new THREE.Color('#ff0000')},
            uGlossiness: { value: 1 }
        },
        vertexShader: vertexShader,
       fragmentShader: fragmentShader
    }
    )

const phongMaterial = new THREE.MeshPhongMaterial({color:"#ffffff"})
    

const planeMaterial = new THREE.MeshStandardMaterial({color:'#ff0000'})


// Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.position.z = 0.5
mesh.castShadow = true
mesh.receiveShadow = true


const mesh2 = new THREE.Mesh(geometry, material)
mesh2.position.x = 1.5
mesh2.position.z = 2.5
mesh2.castShadow = true
mesh2.receiveShadow = true

const planeMesh = new THREE.Mesh(plane, material)
planeMesh.position.z = -1
planeMesh.receiveShadow = true

scene.add(mesh,mesh2)
scene.add(planeMesh)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

     // Update effectComposer
     composer.setSize(sizes.width, sizes.height)
     composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

     pass.uniforms.iResolution.value.set(sizes.width, sizes.height);
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0.0, 1.0, 5.0)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap


const VERTEX = `
varying vec2 vUv;
void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
}
`;

const FRAGMENT = `
// Edge detection Pass

varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform vec2 iResolution;

#define Sensitivity (vec2(0.3, 1.5) * iResolution.y / 400.0)
float checkSame(vec4 center, vec4 samplef)
{
    vec2 centerNormal = center.xy;
    float centerDepth = center.z;
    vec2 sampleNormal = samplef.xy;
    float sampleDepth = samplef.z;
    vec2 diffNormal = abs(centerNormal - sampleNormal) * Sensitivity.x;
    bool isSameNormal = (diffNormal.x + diffNormal.y) < 0.1;
    float diffDepth = abs(centerDepth - sampleDepth) * Sensitivity.y;
    bool isSameDepth = diffDepth < 0.1;
    return (isSameNormal && isSameDepth) ? 1.0 : 0.0;
}
void main()
{
    vec4 sample0 = texture(tDiffuse, vUv);
    vec4 sample1 = texture(tDiffuse, vUv + (vec2(1.0, 1.0) / iResolution.xy));
    vec4 sample2 = texture(tDiffuse, vUv + (vec2(-1.0, -1.0) / iResolution.xy));
    vec4 sample3 = texture(tDiffuse, vUv + (vec2(-1.0, 1.0) / iResolution.xy));
    vec4 sample4 = texture(tDiffuse, vUv + (vec2(1.0, -1.0) / iResolution.xy));
    float edge = checkSame(sample1, sample2) * checkSame(sample3, sample4);
    gl_FragColor = vec4(edge, sample0.w, 1.0, 1.0);
}
`;

const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
const drawShader = {
    uniforms: {
        tDiffuse: { value: null },
        iResolution: { type: 'v2', value: resolution },
    },
    vertexShader : VERTEX,
    fragmentShader: FRAGMENT
}


/**
 * 
 */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const pass = new ShaderPass(drawShader);
pass.renderToScreen = true;
composer.addPass(pass);


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    //renderer.render(scene, camera)
    composer.render();

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()