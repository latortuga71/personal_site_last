import "../style/scroll.css" // <------ wtf
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import {TeapotGeometry} from 'three/examples/jsm/geometries/TeapotGeometry';
//import typefaceFont from 'three/examples/fonts/helvetinnnker_regular.typeface.json';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader';
import gsap from 'gsap';
import GUI from 'lil-gui';

// Game Object
class Game {
    constructor(){
        this.Groups = new THREE.Group();
        this.ScreenWidth = window.innerWidth;
        this.ScreenHeight = window.innerHeight;
        this.LoadingManager = new THREE.LoadingManager(); // loading Mangager
        this.TextureLoader = new THREE.TextureLoader(this.LoadingManager); // texture loader
        this.FontLoader = new FontLoader();
        this.DebugGui = new GUI({width:300,title:"debug",closeFolders:true}); // the debug gui
        this.DebugGuiAssets = {materialColor:'#872e2e'}; // Modifable items in the debug gui
        // Canvas
        this.Canvas = document.querySelector("canvas.webgl");
        // Camera
        this.Camera = new THREE.PerspectiveCamera(35,this.ScreenWidth / this.ScreenHeight,0.1, 100);
        // Scene
        this.Scene = new THREE.Scene();
        // Renderer
        this.Renderer = new THREE.WebGLRenderer(
            {
                canvas:this.Canvas,
                alpha:true,
            }
        );
        // Orbit Controller
        //this.OrbitControl = new OrbitControls(this.Camera,this.Canvas);
        // Map Of Meshes
        this.Geometries = {};
        this.Meshes = {}; // access mesh by name
        this.Materials = {}; // access materials
        this.TexturesMap = {}; // access texture by name
        // Game Clock to get delta time
        this.Clock = new THREE.Clock();
        this.RGBELoader = new RGBELoader();
        this.CurrentSection = 0;
        this.ScrollY = window.scrollY;
        this.ObjectsDistance = 5;
        this.Cursor = {x:0,y:0};
        this.ParticlesCount = 500;
    }
}

const GameObject = new Game();

// font loader funtions

function LoadFonts(){
    GameObject.FontLoader.load("../static/fonts/helvetiker_regular.typeface.json", (font) =>{
        console.log("Font Loaded\n");
        /*
        const textGeometry = new TextGeometry("Latortuga0x71",{
            font: font,
            size: 0.5,
            height:0.2,
            curveSegments:5,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset:0,
            bevelSegments:5
        });
        textGeometry.computeBoundingBox();
        textGeometry.center();
        const textMaterial = new THREE.MeshMatcapMaterial({wireframe:true,matcap:GameObject.TexturesMap.matcap1});
        GameObject.Materials.textMaterial = textMaterial;
        const textMesh = new THREE.Mesh(textGeometry,GameObject.Materials.textMaterial);
        GameObject.Meshes.textMesh = textMesh;
        GameObject.Scene.add(GameObject.Meshes.textMesh);
        */
    });
}

// Loading Mangager Functions
function LoadingManagerOnStart() {
    console.log("Loading Manager On Start");
}
function LoadingManagerOnLoad() {
    console.log("Loading Manager On Load");
}
function LoadingManagerOnProgress() {
    console.log("Loading Manager On Progress");
}
function LoadingManagerOnError() {
    console.log("Loading Manager On Error");
}

function InitLoadingManager(){
    GameObject.LoadingManager.onStart = LoadingManagerOnStart;
    GameObject.LoadingManager.onError= LoadingManagerOnError
    GameObject.LoadingManager.onProgress = LoadingManagerOnProgress
    GameObject.LoadingManager.onLoad = LoadingManagerOnLoad
}



function LoadLights(){
    //const ambientLight = new THREE.AmbientLight(0xffffff,1);
    const directionalLight = new THREE.DirectionalLight('#ffffff',3);
    directionalLight.position.set(1,1,0);
    GameObject.Scene.add(directionalLight);
}

// event listeners

// cursor event listener
window.addEventListener('mousemove', (event) => {
    // normalize values
    GameObject.Cursor.x = event.clientX / GameObject.ScreenWidth - 0.5;
    GameObject.Cursor.y = event.clientY / GameObject.ScreenHeight - 0.5;
});

// scroll event listener
window.addEventListener('scroll', (event) => {
    GameObject.ScrollY = window.scrollY;
    const newSection = Math.round(GameObject.ScrollY / GameObject.ScreenHeight);
    if (newSection != GameObject.CurrentSection){
        // trigger animation
        // .....
        const idx = GameObject.Meshes[Object.keys(GameObject.Meshes)[0]];
        gsap.to(
            GameObject.Meshes[Object.keys(GameObject.Meshes)[newSection]].rotation,
            {
                duration:1.5,
                ease:'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5',
            }
        )
        // section change
        GameObject.CurrentSection = newSection;
    }

});

// event listener for h key to show debug
window.addEventListener('keydown',(event) => {
    if (event.key === 'h'){
        GameObject.DebugGui.show(GameObject.DebugGui._hidden);
    }
})
// handle fullscreen window
window.addEventListener("dblclick", () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    const canvas = GameObject.Canvas;
    if (!fullscreenElement){
        if (canvas.requestFullscreen){
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen){
            canvas.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen){
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen){
            document.webkitExitFullscreen();
        }
    }
})

// handle resize window
window.addEventListener("resize",() => {
    GameObject.ScreenWidth = window.innerWidth;
    GameObject.ScreenHeight = window.innerHeight;
    // Update Camera Aspect Ratio
    GameObject.Camera.aspect = GameObject.ScreenWidth / GameObject.ScreenHeight;
    // Update camera projection matrix
    GameObject.Camera.updateProjectionMatrix();
    // Update Renderer Size
    GameObject.Renderer.setSize( GameObject.ScreenWidth,GameObject.ScreenHeight);
})




// Initialize The Game Object
// Create Loading Manager, Load Textures, Load Materials
function InitGameObject(){
    // Load Environment Map
    // Init Orbit
    //GameObject.OrbitControl.enableDamping = true;
    // set render size
    GameObject.Renderer.setSize(GameObject.ScreenWidth,GameObject.ScreenHeight);
    // set pixel ratio could be different per device
    GameObject.Renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); // max set to 2 
    // Set Camera Position
    GameObject.Camera.position.z = 10;
    // Add Camera To Group
    GameObject.Groups.add(GameObject.Camera);
    // Add Camera To Scene
    //const axisHelper = new THREE.AxesHelper();
    //GameObject.Scene.add(axisHelper);
    GameObject.Scene.add(GameObject.Groups);
    //GameObject.Scene.add(GameObject.Camera);
    // enable shadow maps
    //GameObject.Renderer.shadowMap.enabled = true;
    //GameObject.Renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function AddDebugUI(){
    // Modifying A Material
    GameObject.DebugGui.addColor(GameObject.DebugGuiAssets,'materialColor').onChange( () => {
        GameObject.Materials.toonMaterial.color.set(GameObject.DebugGuiAssets.materialColor);
        GameObject.Materials.particlesMaterial.color.set(GameObject.DebugGuiAssets.materialColor);
    })
}

// load textures functon
function LoadTextures(){
    const gradientTexture = GameObject.TextureLoader.load("../static/gradients/3.jpg");
    gradientTexture.magFilter = THREE.NearestFilter;
    GameObject.TexturesMap.gradient = gradientTexture;
}

// Load Materials
function LoadMaterials(){
    const basicMaterial = new THREE.MeshBasicMaterial({color:'red',wireframe:false});
    const toonMaterial = new THREE.MeshToonMaterial({color:'red',gradientMap:GameObject.TexturesMap.gradient});
    GameObject.Materials.toonMaterial = toonMaterial;
    GameObject.Materials.basicMaterial = basicMaterial;
}

function LoadGeometries(){
    const torusGeometry = new THREE.TorusGeometry(1,0.4,16,60);
    const coneGeometry = new THREE.ConeGeometry(1,2,32);
    const knotGeometry = new THREE.TorusKnotGeometry(0.8,0.35,100,16);
    const particlesGeometry  = new THREE.BufferGeometry();
    GameObject.Geometries.particlesGeometry = particlesGeometry;
    GameObject.Geometries.torusGeometry = torusGeometry;
    GameObject.Geometries.coneGeometry = coneGeometry;
    GameObject.Geometries.knotGeometry = knotGeometry;
}

function AddMeshesToScene(){
    // create meshes and add them to the scene
    const torusMesh = new THREE.Mesh(GameObject.Geometries.torusGeometry ,GameObject.Materials.toonMaterial);
    const coneMesh = new THREE.Mesh(GameObject.Geometries.coneGeometry ,GameObject.Materials.toonMaterial);
    const knotMesh = new THREE.Mesh(GameObject.Geometries.knotGeometry,GameObject.Materials.toonMaterial);
    // use existing geometries textures and materials
    GameObject.Meshes.torus = torusMesh;
    GameObject.Meshes.cone = coneMesh;
    GameObject.Meshes.knot = knotMesh;
    GameObject.Scene.add(GameObject.Meshes.torus);
    GameObject.Scene.add(GameObject.Meshes.cone);
    GameObject.Scene.add(GameObject.Meshes.knot);
    // set object distance Y
    GameObject.Meshes.torus.position.y = -GameObject.ObjectsDistance * 0;
    GameObject.Meshes.cone.position.y = -GameObject.ObjectsDistance * 1;
    GameObject.Meshes.knot.position.y = -GameObject.ObjectsDistance * 2;
    // set object distance X
    GameObject.Meshes.torus.position.x = 2;
    GameObject.Meshes.cone.position.x = -2;
    GameObject.Meshes.knot.position.x = 2;
    // Initialize the particles in the scene
    const particlesPos = new Float32Array(GameObject.ParticlesCount * 3);
    for (let i = 0; i < GameObject.ParticlesCount; i++){
        particlesPos[i * 3  + 0 ] = (Math.random() - 0.5) * 10
        particlesPos[i * 3  + 1 ] = GameObject.ObjectsDistance * 0.5 - Math.random() * GameObject.ObjectsDistance * 3;
        particlesPos[i * 3  + 2 ] = (Math.random() - 0.5) * 10
    }
    GameObject.Geometries.particlesGeometry.setAttribute('position',new THREE.BufferAttribute(particlesPos,3));
    const particlesMaterial = new THREE.PointsMaterial({
        color:'white',
        sizeAttenuation:true,
        size:0.03,
    })
    GameObject.Materials.particlesMaterial = particlesMaterial;
    const particlesMesh = new THREE.Points(GameObject.Geometries.particlesGeometry,GameObject.Materials.particlesMaterial);
    GameObject.Scene.add(particlesMesh);
}
function Update(deltaTime){
    // Update Objects
    //GameObject.OrbitControl.update();
    // Tell Camera to keep looking at something instead of looking at 0,0,0
    //GameObject.Camera.lookAt(GameObject.Meshes.cube1.position);
    // animate the camera
    GameObject.Camera.position.y = -GameObject.ScrollY / GameObject.ScreenHeight * GameObject.ObjectsDistance;
    const parallaxX = GameObject.Cursor.x;
    const parallaxY = -GameObject.Cursor.y;

    GameObject.Groups.position.x += (parallaxX - GameObject.Groups.position.x) * 0.1;
    GameObject.Groups.position.y += (parallaxY - GameObject.Groups.position.y) * 0.1;
    // mesh rotations
    for (const mesh in GameObject.Meshes){
        GameObject.Meshes[mesh].rotation.y += 0.12 * deltaTime;
        GameObject.Meshes[mesh].rotation.x += 0.5 * deltaTime;
    }

}

function Render(){
    // Render Objects
    GameObject.Renderer.render(GameObject.Scene,GameObject.Camera);
}

function GameLoop(){
    const dt = GameObject.Clock.getDelta();
    Update(dt);
    Render();
    // Loop
    window.requestAnimationFrame(GameLoop);
}




InitLoadingManager();
LoadTextures();
LoadFonts(); 
LoadGeometries();
LoadMaterials();
LoadLights();
InitGameObject();
AddMeshesToScene();
AddDebugUI();
GameLoop();


