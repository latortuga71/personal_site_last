import "../style/3dstyle.css" // <------ wtf
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';


// Textures
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
/*
const colorTexture = textureLoader.load('./static/checkerboard-1024x1024.png');
colorTexture.colorSpace = THREE.SRGBColorSpace;
colorTexture.generateMipmaps = false;
/*
colorTexture.repeat.x = 2;
colorTexture.repeat.y = 3;
colorTexture.wrapS = THREE.RepeatWrapping;
colorTexture.wrapT = THREE.RepeatWrapping;
*/
//colorTexture.minFilter = THREE.NearestFilter; // if we are using this we dont need mipmappings
//colorTexture.magFilter = THREE.NearestFilter; makes small textures magnified and sharp

// loading manager events handler
loadingManager.onStart = () => {
    console.log("Loading Manager On Start");
}

loadingManager.onLoad = () => {
    console.log("Loading Manager On Loading");
}

loadingManager.onProgress = () => {
    console.log("Loading Manager On Loading");
}

loadingManager.onError = () => {
    console.log("Loading Manager On Error");
}

// Instantiate LilGui
const gui = new GUI({
    width:300,
    title:"Debug",
    closeFolders: true
});

gui.close();
gui.hide();

// event listener for h key to show debug
window.addEventListener('keydown',(event) => {
    if (event.key === 'h'){
        gui.show(gui._hidden);
    }
})


// gui.add (OBJECT, PROPERTY OBJECT)

const guiAssets = {
};
guiAssets.color = "#3a6ea6";
guiAssets.subdivision = 5;

// Global window size
const sceneSize = {
    width: window.innerWidth,
    height: window.innerHeight
}
// handle fullscreen window

window.addEventListener("dblclick", () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
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
    sceneSize.width = window.innerWidth;
    sceneSize.height = window.innerHeight;
    // Update Camera Aspect Ratio
    camera.aspect = sceneSize.width / sceneSize.height;
    // Update camera projection matrix
    camera.updateProjectionMatrix();
    // Update Renderer Size
    renderer.setSize( sceneSize.width, sceneSize.height);
})

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, sceneSize.width / sceneSize.height, 0.1, 100 );

// Orbit control
const controls = new OrbitControls(camera,canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
    canvas:canvas
});
// set render size
renderer.setSize( sceneSize.width, sceneSize.height);
// set pixel ratio could be different per device
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); // max set to 2 


// Custom Geometry
/*
const count = 50; //  50 triangles
const positionArrays = new Float32Array(count * 3 * 3); // three faces three values per vertex


for (let i = 0; i <  count * 3 * 3; i++){
    positionArrays[i] = Math.random() - 0.5;
}

const positionAttribute = new THREE.BufferAttribute(positionArrays,3);

const geometry = new THREE.BufferGeometry();

// position shaders will use our attribute
geometry.setAttribute('position',positionAttribute);
// shaders automatically create the faces for us
*/
const geometry = new THREE.BoxGeometry( 1, 1, 1, 5, 5, 5 ); // segments creates panels from the triangles.

// more segments allow more details and smoother shapes
// example ff7 looks like shit cause they dont have many segments clouds hair is like 1 whole triangle lol
//const material = new THREE.MeshBasicMaterial( { wireframe:true,map:colorTexture});
const material = new THREE.MeshBasicMaterial( { wireframe:true,color: guiAssets.color});
const cube = new THREE.Mesh( geometry, material );

// Gui Folder
const cubeTweaks = gui.addFolder('Cube');


guiAssets.spin = () => {
    console.log("clicked");
}

//
gui.add(cube.position,'y').min(-3).max(3).step(0.01).name('elevation');
gui.add(material,'wireframe');

// only when we stop tweaking the value
gui.add(guiAssets,'subdivision').min(1).max(20).step(1).onFinishChange(() => {
    // clear the old geometry from the gpu
    cube.geometry.dispose();
    cube.geometry = new THREE.BoxGeometry(1, 1, 1, guiAssets.subdivision, guiAssets.subdivision, guiAssets.subdivision);
})

// update color
gui.addColor(guiAssets,'color').onChange(()=> {
    material.color.set(guiAssets.color)
});
gui.add(guiAssets,'spin');
//
const group = new THREE.Group();


scene.add( cube );
scene.add( camera );

camera.position.z = 5;

function GameLoop(){
    // Update
    controls.update();
    // Render
	renderer.render( scene, camera );
    // Loop
    window.requestAnimationFrame(GameLoop);
}

GameLoop();



/*
PBR

Physically Based Rendering  -> Realistic Results


*/


/*
UV unwrapping
texture stretches to match the geometry
texture is unwrapped to become a 2d flat texture
each vertex becomes flat and 2d instead of 3d points

*/