import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import vertexShader from '../shaders/vertexShader.vert'
import fragmentShader from '../shaders/fragmentShader.frag'


const debugObject = {}
debugObject.medColor = '#ff4000'
debugObject.shadowColor = '#f18aff'
debugObject.reflectColor = '#ffe2a3'
/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#333333');

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
directionalLight.position.set(1, -0.5, 3);
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
            uColor: {value: new THREE.Color('#ffff00')},
            uGlossiness: { value: 1 },
            _medThreshold: { value: 0.42 },
            _medSmooth: { value: 0.2},
            _shadowThreshold: { value: 0.48 },
            _shadowSmooth: { value: 0.07},
            _reflectThreshold: { value: 0.28 },
            _reflectSmooth: { value: 0.28},
            _medColor: { value: new THREE.Color(debugObject.medColor) },
            _shadowColor: { value: new THREE.Color(debugObject.shadowColor) },
            _reflectColor: { value: new THREE.Color(debugObject.reflectColor)}
        },
        vertexShader: vertexShader,
       fragmentShader: fragmentShader
    }
    )


gui.add(material.uniforms._medThreshold,'value').min(0.0).max(1.0).step(0.001).name('_medThreshold')
gui.add(material.uniforms._medSmooth,'value').min(0.0).max(1.0).step(0.001).name('_medSmooth')

gui.add(material.uniforms._shadowThreshold,'value').min(0.0).max(1.0).step(0.001).name('_shadowThreshold')
gui.add(material.uniforms._shadowSmooth,'value').min(0.0).max(1.0).step(0.001).name('_shadowSmooth')

gui.add(material.uniforms._reflectThreshold,'value').min(0.0).max(1.0).step(0.001).name('_reflectThreshold')
gui.add(material.uniforms._reflectSmooth,'value').min(0.0).max(1.0).step(0.001).name('_reflectSmooth')

gui
    .addColor(debugObject, 'medColor')
    .name('medColor')
    .onChange(()=>
    {
        material.uniforms._medColor.value.set(debugObject.medColor)
    })

gui
    .addColor(debugObject, 'shadowColor')
    .name('shadowColor')
    .onChange(()=>
    {
        material.uniforms._shadowColor.value.set(debugObject.shadowColor)
    })

gui
.addColor(debugObject, 'reflectColor')
.name('reflectColor')
.onChange(()=>
{
    material.uniforms._reflectColor.value.set(debugObject.reflectColor)
})


const phongMaterial = new THREE.MeshPhongMaterial({color:"#ffffff"})
    

const planeMaterial = new THREE.MeshStandardMaterial({color:'#ff0000'})


// Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.position.z = 0.5
mesh.castShadow = true
mesh.receiveShadow = true


const mesh2 = new THREE.Mesh(geometry, material)
mesh2.position.x = 1.5
mesh2.position.z = 1.5
mesh2.castShadow = true
mesh2.receiveShadow = true

const planeMesh = new THREE.Mesh(plane, planeMaterial)
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
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()