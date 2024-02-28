import "../style/3dstyle.css" // <------ wtf
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import {TeapotGeometry} from 'three/examples/jsm/geometries/TeapotGeometry';
//import typefaceFont from 'three/examples/fonts/helvetinnnker_regular.typeface.json';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader';
import GUI from 'lil-gui';

// Game Object
class Game {
    constructor(){
        this.ScreenWidth = window.innerWidth;
        this.ScreenHeight = window.innerHeight;
        this.LoadingManager = new THREE.LoadingManager(); // loading Mangager
        this.TextureLoader = new THREE.TextureLoader(this.LoadingManager); // texture loader
        this.FontLoader = new FontLoader();
        this.DebugGui = new GUI({width:300,title:"debug",closeFolders:true}); // the debug gui
        this.DebugGuiAssets = {
            randomnessPower: 8,
            randomness: 1.543,
            spin: -0.376,
            radius: 12,
            branches: 9,
            count:17000, 
            size:0.012, 
            insideColor: "#dc0365",
            outsideColor: "#df8600",
            subdivision: 5,}; // Modifable items in the debug gui
        // Canvas
        this.Canvas = document.querySelector("canvas.webgl");
        // Camera
        this.Camera = new THREE.PerspectiveCamera(75,this.ScreenWidth / this.ScreenHeight,0.1, 100);
        // Scene
        this.Scene = new THREE.Scene();
        // Renderer
        this.Renderer = new THREE.WebGLRenderer(
            {canvas:this.Canvas}
        );
        // Orbit Controller
        this.OrbitControl = new OrbitControls(this.Camera,this.Canvas);
        // Map Of Meshes
        this.Geometries = {};
        this.Meshes = {}; // access mesh by name
        this.Materials = {}; // access materials
        this.TexturesMap = {}; // access texture by name
        // Game Clock to get delta time
        this.Clock = new THREE.Clock();
        this.RGBELoader = new RGBELoader();
    }
}

const GameObject = new Game();

// font loader funtions

function LoadFonts(){
    GameObject.FontLoader.load("./static/fonts/helvetiker_regular.typeface.json", (font) =>{
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

// load textures functon
function LoadTextures(){
}

// Load Materials
function LoadMaterials(){
    const cubeMaterial = new THREE.MeshBasicMaterial({wireframe:true});
    GameObject.Materials.cubeMaterial = cubeMaterial;

    const particleMaterial = new THREE.PointsMaterial({
        size:GameObject.DebugGuiAssets.size,
        sizeAttenuation:true,
        depthWrite:false,
        blending:THREE.AdditiveBlending,
        vertexColors: true,
    });
    GameObject.Materials.particleMaterial = particleMaterial;
}

function LoadGeometries(){
    const particleGeometry = new THREE.BufferGeometry();
    GameObject.Geometries.particleGeometry = particleGeometry;
    const cubeGeometry = new THREE.BoxGeometry(1,1,1,5,5);
    GameObject.Geometries.cubeGeometry = cubeGeometry;
}

function LoadLights(){
    const ambientLight = new THREE.AmbientLight(0xffffff,1);
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF,0.9);
}

// event listeners

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
    GameObject.OrbitControl.enableDamping = true;
    // set render size
    GameObject.Renderer.setSize(GameObject.ScreenWidth,GameObject.ScreenHeight);
    // set pixel ratio could be different per device
    GameObject.Renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); // max set to 2 
    // Set Camera Position
    GameObject.Camera.position.z = 10;
    GameObject.Camera.position.y = 10;
    // Add Camera To Scene
    //const axisHelper = new THREE.AxesHelper();
    //GameObject.Scene.add(axisHelper);
    GameObject.Scene.add(GameObject.Camera);
    // enable shadow maps
    //GameObject.Renderer.shadowMap.enabled = true;
    //GameObject.Renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function AddDebugUI(){
    GameObject.DebugGui.add(GameObject.DebugGuiAssets,'count').min(1000).max(100000).step(1000).onFinishChange(GenerateGalaxy);
    GameObject.DebugGui.add(GameObject.DebugGuiAssets,'size').min(0.001).max(0.1).step(0.001).onFinishChange(GenerateGalaxy);
    GameObject.DebugGui.add(GameObject.DebugGuiAssets,'radius').min(0.01).max(20).step(0.001).onFinishChange(GenerateGalaxy);
    GameObject.DebugGui.add(GameObject.DebugGuiAssets,'branches').min(2).max(20).step(1).onFinishChange(GenerateGalaxy);
    GameObject.DebugGui.add(GameObject.DebugGuiAssets,'spin').min(-5).max(5).step(0.001).onFinishChange(GenerateGalaxy);
    GameObject.DebugGui.add(GameObject.DebugGuiAssets,'randomness').min(0).max(2).step(0.001).onFinishChange(GenerateGalaxy);
    GameObject.DebugGui.add(GameObject.DebugGuiAssets,'randomnessPower').min(1).max(10).step(0.001).onFinishChange(GenerateGalaxy);

    GameObject.DebugGui.addColor(GameObject.DebugGuiAssets,'insideColor').onFinishChange(GenerateGalaxy);
    GameObject.DebugGui.addColor(GameObject.DebugGuiAssets,'outsideColor').onFinishChange(GenerateGalaxy);
    // Modifying A Material
    //GameObject.DebugGui.add(GameObject.Materials.standard1,'metalness').min(0).max(1).step(0.001);
}



function AddMeshesToScene(){
    // create meshes and add them to the scene
    //const cubeMesh = new THREE.Mesh(GameObject.Geometries.cubeGeometry,GameObject.Materials.cubeMaterial);
    // use existing geometries textures and materials
    //GameObject.Meshes.cube = cubeMesh;
    //GameObject.Scene.add(GameObject.Meshes.cube);
    const points = new THREE.Points(GameObject.Geometries.particleGeometry, GameObject.Materials.particleMaterial);
    GameObject.Meshes.particles = points;
    GameObject.Scene.add(GameObject.Meshes.particles);
}
function Update(deltaTime){
    // Update Objects
    GameObject.OrbitControl.update();
    // Tell Camera to keep looking at something instead of looking at 0,0,0
    //GameObject.Camera.lookAt(GameObject.Meshes.cube1.position);

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


function GenerateGalaxy(){
    // Destroy Old Particles From Scene
    // free particle geometry
    if (GameObject.Geometries.particleGeometry !== null){
        GameObject.Geometries.particleGeometry.dispose();
    }
    // free particle material
    if (GameObject.Materials.particleMaterial !== null){
        GameObject.Materials.particleMaterial.dispose();
    }
    // meshes cannot be disposed
    // remove mesh from the scene
    GameObject.Scene.remove(GameObject.Meshes.particles);
    // Reinit the stuff again
    // geometry
    const particleGeometry = new THREE.BufferGeometry();
    GameObject.Geometries.particleGeometry = particleGeometry;
    // material
    const particleMaterial = new THREE.PointsMaterial({
        size:GameObject.DebugGuiAssets.size,
        sizeAttenuation:true,
        depthWrite:false,
        blending:THREE.AdditiveBlending,
        vertexColors: true,
    });
    GameObject.Materials.particleMaterial = particleMaterial;
    // mesh
    const points = new THREE.Points(GameObject.Geometries.particleGeometry, GameObject.Materials.particleMaterial);
    GameObject.Meshes.particles = points;
    GameObject.Scene.add(GameObject.Meshes.particles);
    // Generate The Galaxy Here
    const insideColor = new THREE.Color(GameObject.DebugGuiAssets.insideColor);
    const outsideColor = new THREE.Color(GameObject.DebugGuiAssets.outsideColor);
    // Radius of galaxy is used to 
    // By Setting Each Particles X,Y,Z
    const positions = new Float32Array(GameObject.DebugGuiAssets.count * 3);
    const colors = new Float32Array(GameObject.DebugGuiAssets.count * 3);
    for (let i = 0; i < GameObject.DebugGuiAssets.count; i++){
        const i3 = i * 3;
        const radius = Math.random() * GameObject.DebugGuiAssets.radius;
        const spinAngle = radius * GameObject.DebugGuiAssets.spin;
        const branchAngle = (i % GameObject.DebugGuiAssets.branches) / GameObject.DebugGuiAssets.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(),GameObject.DebugGuiAssets.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * GameObject.DebugGuiAssets.randomness;
        const randomY = Math.pow(Math.random(),GameObject.DebugGuiAssets.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * GameObject.DebugGuiAssets.randomness;
        const randomZ = Math.pow(Math.random(),GameObject.DebugGuiAssets.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * GameObject.DebugGuiAssets.randomness;

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1]  = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius / GameObject.DebugGuiAssets.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1]  = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }
    // sets position
    GameObject.Geometries.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    // sets color
    GameObject.Geometries.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    GameObject.Scene.add(GameObject.Meshes.points);
}


InitLoadingManager();
LoadFonts(); 
LoadGeometries();
LoadTextures();
LoadMaterials();
LoadLights();
InitGameObject();
AddMeshesToScene();
GenerateGalaxy();
AddDebugUI();
GameLoop();


