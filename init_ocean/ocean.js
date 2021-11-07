'use strict';

/* global THREE */
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../JS/GLTFLoader.js';
import { Water } from 'https://threejs.org/examples/jsm/objects/Water.js';
import { Sky } from 'https://threejs.org/examples/jsm/objects/Sky.js';

// main();

function SceneManager() {
    const canvas = document.querySelector('#canvas');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('blue');

    var renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // canvas.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 30, 100);

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

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);

    scene.environment = pmremGenerator.fromScene(sky).texture;

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
    water.position.y=2;

    const waterUniforms = water.material.uniforms;
    let root;
    const loaderGLTF = new GLTFLoader();
    loaderGLTF.load('./model/scene.gltf', function (gltf) {
        console.log(gltf);
        root = gltf.scene;
        scene.add(root);
        console.log(dumpObject(root).join('\n'));
        root.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
                roughnessMipmapper.generateMipmaps(object.material);
            }
        
        });

    },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + "% Loaded");
        },
        function (error) {
            console.log('An Error Occurred');
        })
        
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.maxPolarAngle = Math.PI * 0.495;
        controls.target.set(0, 10, 0);
        controls.minDistance = 40.0;
        controls.maxDistance = 500.0;
        controls.update();
        

    this.update = function () {
        // Animates water
        water.material.uniforms['time'].value += 1.0 / 60.0;

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