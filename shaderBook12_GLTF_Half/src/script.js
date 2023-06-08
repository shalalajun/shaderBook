import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'
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
const directionalLight = new THREE.DirectionalLight('#ffffff', 0.25)
directionalLight.position.set(1, 3.5, 3);
directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.castShadow = true

directionalLight.shadow.camera.near = 0.5; // default
directionalLight.shadow.camera.far = 10; 
directionalLight.shadow.bias = 0.0001;
directionalLight.shadow.normalBias = 0.006;

scene.add( directionalLight );

const ambientLight = new THREE.AmbientLight("#ffffff", 0.08);

scene.add(ambientLight);

// const helper = new THREE.CameraHelper( directionalLight.shadow.camera );
// scene.add( helper );


// Material
const material = new THREE.ShaderMaterial(
    {
        lights: true,
        uniforms:{ 
            ...THREE.UniformsLib.lights,
            uColor: {value: new THREE.Color('#ffffff')},
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
planeMesh.rotation.x = -Math.PI / 2 
planeMesh.position.y = -1
planeMesh.receiveShadow = true

// scene.add(mesh,mesh2)
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
 *gltf 
 */
let model;
 const loader = new GLTFLoader()
 loader.load("./model/cat.glb",(gltf)=>{

    model = gltf.scene;
    model.scale.set(12.0,12.0,12.0);
    model.position.y = -1
    //model.rotation.x = Math.PI / 2;
    model.traverse((character)=>{
        
        if(character.isMesh){

            character.castShadow = true
            character.receiveShadow = true
            character.material = material
          
        }
    })
    scene.add(model)
    console.log(gltf.scene)
 })



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