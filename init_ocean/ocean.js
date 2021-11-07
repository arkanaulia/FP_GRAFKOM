'use strict';

/* global THREE */
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../JS/GLTFLoader.js';
import { Water } from 'https://threejs.org/examples/jsm/objects/Water.js';
import { Sky } from 'https://threejs.org/examples/jsm/objects/Sky.js';

// main();

/*
 * Key Press
 */
const key_press = {
    ArrowLeft: false,
    ArrowUp: false,
    ArrowRight: false,
    ArrowDown: false,
}

/*
 * SceneGraph
 */ 
function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}

function SceneManager() {
    /*
     * Canvas
     */
    const canvas = document.querySelector('#canvas');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('blue');

    /*
     * Renderer
     */
    var renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // canvas.appendChild(renderer.domElement);

    /*
     * Camera
     */
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 30, 100);

    /*
     * Object
     */
    const geometry = new THREE.SphereGeometry(20, 20, 20);
    const material = new THREE.MeshStandardMaterial({
        color: 0xfcc742
    });

    // const sphere = new THREE.Mesh(geometry, material);
    // scene.add(sphere);

    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const sun = new THREE.Vector3();

    const theta = Math.PI * (0.49 - 0.5);
    const phi = 2 * Math.PI * (0.205 - 0.5);

    // sun's position
    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);

    scene.environment = pmremGenerator.fromScene(sky).texture;

    // Ocean
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            alpha: 1.0,
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    water.rotation.x = - Math.PI / 2;
    scene.add(water);
    water.position.y = 2;

    const waterUniforms = water.material.uniforms;

    // Submarine 3D
    let root;
    let kapal;
    let mixer;
    const loaderGLTF = new GLTFLoader();
    loaderGLTF.load('./model/scene.gltf', function (gltf) {
        console.log(gltf);
        root = gltf.scene;
        scene.add(root);
        console.log(dumpObject(root).join('\n'));
        kapal = root.getObjectByName('Assembly_ASSV001');
        root.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        mixer = new THREE.AnimationMixer( root );
    },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + "% Loaded");
        },
        function (error) {
            console.log('An Error Occurred');
        }
    )

    /*
     * Light
     */
    const direcLight = new THREE.DirectionalLight(0xffffff, 1);
    direcLight.position.set( sun.x, sun.y, sun.z);
    direcLight.target.position.set(0, 0, 0);
    direcLight.castShadow = true;
    direcLight.shadow.mapSize.width = 2048;
    direcLight.shadow.mapSize.height = 2048;
    scene.add(direcLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    /*
     * Control
     */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40.0;
    controls.maxDistance = 500.0;
    controls.update();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    function onKeyDown(e){
        if(e.code in key_press){
            if(e.code === "ArrowLeft"){
                key_press.ArrowLeft = true;
            }
            else if(e.code === "ArrowUp"){
                key_press.ArrowUp = true;
            }
            else if(e.code === "ArrowRight"){
                key_press.ArrowRight = true;
            }
            else if(e.code === "ArrowDown"){
                key_press.ArrowDown = true;
            }
        }
    }

    function onKeyUp(e){
        if(e.code in key_press){
            if(e.code === "ArrowLeft"){
                key_press.ArrowLeft = false;
            }
            if(e.code === "ArrowUp"){
                key_press.ArrowUp = false;
            }
            if(e.code === "ArrowRight"){
                key_press.ArrowRight = false;
            }
            if(e.code === "ArrowDown"){
                key_press.ArrowDown = false;
            }
        }
    }

    /*
     * Animasi
     */
    let speed = 0.5;
    let rotation_speed = 0.02;
    this.update = function () {
        // Animates water
        water.material.uniforms['time'].value += 1.0 / 60.0;

        if (key_press.ArrowUp)
        {
            // kapal.position.z += speed;
            kapal.position.x += speed;
        }
        if(key_press.ArrowDown)
        {
            kapal.position.x -= speed;
        }
        if(key_press.ArrowRight)
        {
            // kapal.position.z += speed;
            kapal.rotation.y -= rotation_speed;
        }
        if(key_press.ArrowLeft)
        {
            kapal.rotation.y += rotation_speed;
        }
        
        const time = performance.now() * 0.001;
        root.position.y = Math.sin(time) * 2;
        // root.rotation.x = time * 0.3;
        // root.rotation.z = time * 0.3;
        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);

    // function render(time) {
    //     renderer.render(scene, camera);
    // }
    //
    // requestAnimationFrame(render);

}


const sceneManager = new SceneManager();

function animate() {
    requestAnimationFrame(animate);
    sceneManager.update();
}
animate();