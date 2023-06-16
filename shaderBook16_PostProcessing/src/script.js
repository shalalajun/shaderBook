import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import * as dat from 'lil-gui'

import StyleShader from './styleShader.js'
/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}





// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('#dee0f7');

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const catHead = textureLoader.load('./textures/head.jpg')
catHead.flipY = false

const catBody = textureLoader.load('./textures/body.jpg')
catBody.flipY = false

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.SphereGeometry(1.0,128,128)
const plane = new THREE.PlaneGeometry(10,10)

//Light
const directionalLight = new THREE.DirectionalLight('#ffffff', 0.3)
directionalLight.position.set(1, 3.5, 3);
directionalLight.shadow.mapSize.width = 4096    
directionalLight.shadow.mapSize.height = 4096
directionalLight.castShadow = true

directionalLight.shadow.camera.near = 0.5; // default
directionalLight.shadow.camera.far = 10; 
directionalLight.shadow.bias = 0.002;
directionalLight.shadow.normalBias = 0.003;

scene.add( directionalLight );

const ambientLight = new THREE.AmbientLight("#ffffff", 0.02);

scene.add(ambientLight);

// const helper = new THREE.CameraHelper( directionalLight.shadow.camera );
// scene.add( helper );


// Material
const shadowColor = new THREE.Color(0.158,0.137,0.735)

const headMaterial = new StyleShader({color:'#ffffff', map: catHead, shadowColor: new THREE.Color(0.158,0.137,0.735)})
const bodyMaterial = new StyleShader({color:'#ffffff', map: catBody, shadowColor: new THREE.Color(0.158,0.137,0.735)})
const planeMaterial = new StyleShader({color:'#ffffff', shadowColor: new THREE.Color(0.158,0.137,0.735)})



gui.add(bodyMaterial.uniforms.uMedThreshold,'value').min(0.0).max(1.0).step(0.001).name('_medThreshold')
gui.add(bodyMaterial.uniforms.uMedSmooth,'value').min(0.0).max(1.0).step(0.001).name('_medSmooth')

gui.add(bodyMaterial.uniforms.uShadowThreshold,'value').min(0.0).max(1.0).step(0.001).name('_shadowThreshold')
gui.add(bodyMaterial.uniforms.uShadowSmooth,'value').min(0.0).max(1.0).step(0.001).name('_shadowSmooth')


const planeMesh = new THREE.Mesh(plane, planeMaterial)
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

    effectComposer.setSize(sizes.width, sizes.height)
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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

        if(character instanceof THREE.Mesh && character.name == "Head")
        {
            character.material = headMaterial
            character.castShadow = true
            character.receiveShadow = true
        }

       
    
    })

    model.traverse((character)=>{
        if(character instanceof THREE.Mesh && character.name == "Body")
        {
            character.material = bodyMaterial
            character.castShadow = true
            character.receiveShadow = true
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


renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 2.0
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(sizes.width, sizes.height)


//postprocessing
const renderTarget = new THREE.WebGLRenderTarget(
    800,
    600,
    {
        samples: renderer.getPixelRatio() === 1 ? 2 : 0
    }
)

const effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

effectComposer.setSize(sizes.width, sizes.height)
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass) 

const TintShader = {
    uniforms: {
        tDiffuse: { value: null}
    },
    vertexShader: `

        varying vec2 vUv;

        void main()
        {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `

        varying vec2 vUv;

        uniform sampler2D tDiffuse;

        void main()
        {
            vec4 color = texture2D(tDiffuse, vUv);
            // color.r += 0.1;
            color.b += 0.1;
            gl_FragColor = color;
        }
    `
}

const tintPass = new ShaderPass(TintShader)
effectComposer.addPass(tintPass)

const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.strength = 0.1
unrealBloomPass.radius = 0.2
unrealBloomPass.threshold = 0.7
effectComposer.addPass(unrealBloomPass)

if(renderer.getPixelRatio()===1 && !renderer.capabilities.isWebGL2)
{
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)
}

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
    // renderer.render(scene, camera)
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()