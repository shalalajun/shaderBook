import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import vertexShader from '../shaders/vertexShader.vert'
import fragmentShader from '../shaders/fragmentShader.frag'
import planeFragmentShader from '../shaders/planeFragmentShader.frag'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#ff00ff');

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
const directionalLight = new THREE.DirectionalLight('#fff7e0', 0.3)
directionalLight.position.set(2.0, 3.0, 2.5);
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
            uColor: {value: new THREE.Color('#ffffff')},
            uGlossiness: { value: 1 },
            bottomColor: { value: new THREE.Vector3(1.0,1.0,1.0)},
            topColor:{ value:new THREE.Vector3(1.0,0.0,1.0) },
            minHeight: { value: 0.02 },
            maxHeight: { value: 0.1}

        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    }
    )



const planeMaterial = new THREE.ShaderMaterial(
    {
        lights: true,
        uniforms:{ 
            ...THREE.UniformsLib.lights,
            uColor: {value: new THREE.Color('#ffffff')},
            uGlossiness: { value: 1 },
            topColor: { value: new THREE.Vector3(1.0,1.0,1.0)},
            bottomColor:{ value:new THREE.Vector3(1.0,0.0,1.0) },
            minHeight: { value: 0.02 },
            maxHeight: { value: 0.1}

        },
        vertexShader: vertexShader,
        fragmentShader: planeFragmentShader
       
    }
    )


    




// Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.position.z = 0.5
//mesh.rotation.y = 2.0;
mesh.castShadow = true
mesh.receiveShadow = true


const mesh2 = new THREE.Mesh(geometry, material)
mesh2.position.x = 1.5
mesh2.position.y = 2.5
mesh2.position.z = 1.5
mesh2.castShadow = true
mesh2.receiveShadow = true

const planeMesh = new THREE.Mesh(plane, planeMaterial)
planeMesh.rotation.x = -Math.PI/2;
planeMesh.receiveShadow = true

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
 * model
 */
const loader = new GLTFLoader();
loader.load('classic-mug.glb',(gltf) =>
    {
        console.log(gltf);
        gltf.scene.position.set(0,0.2,0,);
        gltf.scene.scale.set(20.0,20.0,20.0);
    
        gltf.scene.traverse((o)=>{
            if(o.isMesh)
            {
                o.material = material;
                o.castShadow = true;
                o.receiveShadow = true;
            }
        })
 
	    scene.add( gltf.scene );
    })

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0.0, 5.0, 3.0)
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