'use strict';

/* global THREE */
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../JS/GLTFLoader.js';
import { Water } from 'https://threejs.org/examples/jsm/objects/Water.js';
import { Sky } from 'https://threejs.org/examples/jsm/objects/Sky.js';
import { Clock } from '../JS/three.module.js';
import { ColladaLoader } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/ColladaLoader.js';
import { PID } from './PID.js';


// main();

const loadingManager = new THREE.LoadingManager(() => {

    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('fade-out');

    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener('transitionend', onTransitionEnd);

});

var card_showed_at = 0;
var kapal_on_zone = 0;
var kapal_on_zone_before = 0;

var root;
var kapal;

var cards = [];
var card_dist_to_island = 70;

var collision_bbox = [];
collision_bbox.push([310,-115]);
collision_bbox.push([227,-25]);
collision_bbox.push([-146.5 - 200, -261.5 + 400]);
collision_bbox.push([-259.5 - 200, -127.5 + 400]);
collision_bbox.push([43,-480 - 200]);
collision_bbox.push([-125,-310 - 200]);

let card_zone = [];
let bigger_than_coll = 130;
for (let i =0; i < 6;i+=2){
    card_zone.push([collision_bbox[i][0] + bigger_than_coll,collision_bbox[i][1] - bigger_than_coll]);
    card_zone.push([collision_bbox[i+1][0] - bigger_than_coll,collision_bbox[i+1][1] + bigger_than_coll]);
}

var all_rumah_pos_init = [];
all_rumah_pos_init.push([240, 0, -50]);
all_rumah_pos_init.push([-400, 20, 200]);
all_rumah_pos_init.push([-50, 20, -600]);

var all_cards_pos_init = [];
all_cards_pos_init.push([270,-50,20]);
all_cards_pos_init.push([-400, -50, 300]);
all_cards_pos_init.push([-50, -50, -500]);

console.log("CARD ZONE", card_zone)

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
 * Third Person Camera
 */

var camera, goal;

var dir = new THREE.Vector3;
var a = new THREE.Vector3;
var card_vector_camera = new THREE.Vector3;
var b = new THREE.Vector3;
let dist_camera = 70;


/*
 * END Third Person Camera
 */

let pid_control_kapal_throtle = new PID(0.2, 0.01, 0.03);
let pid_control_kapal_turn = new PID(0.2, 0.03, 0.04);

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

function isInsideBoundingBoxCard(){
    let zone = 0;
    // for
    for (let i = 0; i < 3; i++){
        if ((kapal.position.x) <= card_zone[i*2][0] && (kapal.position.x) >= card_zone[i*2+1][0]
            && (kapal.position.z) >= card_zone[i*2][1] && (kapal.position.z) <= card_zone[i*2+1][1]){
            zone = i + 1;
            // console.log("MASUK BBOX");
        }
    }

    return zone;
}

function isInFrontBoundingBox() {
    let inside_bbox = false;

    var rotation_k = new THREE.Euler().setFromQuaternion(kapal.quaternion, "ZXY");
    let yaw_kapal = - (rotation_k.y);
    let distance = 1;

    // for
    for (let i = 0; i < 6; i+=2){
        if ((kapal.position.x + (Math.cos(yaw_kapal) * distance)) <= collision_bbox[i][0] && (kapal.position.x + (Math.cos(yaw_kapal) * distance)) >= collision_bbox[i+1][0]
            && (kapal.position.z + (Math.sin(yaw_kapal) * distance)) >= collision_bbox[i][1] && (kapal.position.z + (Math.sin(yaw_kapal) * distance)) <= collision_bbox[i+1][1]){
            inside_bbox = true;
            // console.log("MASUK BBOX");
        }
    }

    return inside_bbox;
}

function getAngleOfKapalToIsland(island_number){ //start from 0 island number

    let x_island = (card_zone[island_number*2][0] + card_zone[island_number*2+1][0]) / 2;
    let y_island = (card_zone[island_number*2][1] + card_zone[island_number*2+1][1]) / 2;
    let angle_ = Math.atan2(kapal.position.x - x_island, kapal.position.z - y_island) - (Math.PI/4);
    console.log("ANGLE TO ISLAND", island_number,angle_*180/Math.PI);

    let res = angle_ / (Math.PI /2);

    console.log("RETURN ANGLE CARD CNS", Math.ceil(res));
    return Math.ceil(res);


}

function card1(scene) {
    let root5;
    let card1;
    // let mixer;
    const loaderGLTF = new GLTFLoader(loadingManager);
    loaderGLTF.load('./model/card1.gltf', function (gltf) {
        console.log(gltf);
        gltf.scene.scale.set(10, 10, 10);
        // gltf.scene.position.set(260,-50,0);
        gltf.scene.position.set(all_cards_pos_init[0][0],all_cards_pos_init[0][1],all_cards_pos_init[0][2]);
        root5 = gltf.scene;
        scene.add(root5);
        console.log(dumpObject(root5).join('\n'));
        cards[0] = gltf.scene;
        // cards[0] = root5.getObjectByName('Mesh_0');
        // card1.translateY(-5);
        // cards.push(card1);
        root5.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        // mixer = new THREE.AnimationMixer( root );
    },
    )



}

function card2(scene) {
    let root5;
    let card1;
    // let mixer;
    const loaderGLTF = new GLTFLoader(loadingManager);
    loaderGLTF.load('./model/card2.gltf', function (gltf) {
        // console.log(gltf);
        gltf.scene.scale.set(10, 10, 10);
        // gltf.scene.position.set(-50,20,-400);
        gltf.scene.position.set(all_cards_pos_init[1][0],all_cards_pos_init[1][1],all_cards_pos_init[1][2]);
        root5 = gltf.scene;
        scene.add(root5);
        // console.log(dumpObject(root5).join('\n'));
        // cards[1] = root5.getObjectByName('Mesh_0');
        cards[1] = gltf.scene;
        // cards.push(card1);
        root5.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        // mixer = new THREE.AnimationMixer( root );
    },
    )


}

function card3(scene) {
    let root5;
    let card1;
    // let mixer;
    const loaderGLTF = new GLTFLoader(loadingManager);
    loaderGLTF.load('./model/card3.gltf', function (gltf) {
        // console.log(gltf);
        gltf.scene.scale.set(10, 10, 10);
        // gltf.scene.position.set(-50,20,-400);
        gltf.scene.position.set(all_cards_pos_init[2][0],all_cards_pos_init[2][1],all_cards_pos_init[2][2]);
        // gltf.scene.rotation.set(0,1,0)
        root5 = gltf.scene;
        scene.add(root5);
        // console.log(dumpObject(root5).join('\n'));
        // cards[2] = root5.getObjectByName('Mesh_0');
        cards[2] = gltf.scene;
        // cards.push(card1);
        root5.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        // mixer = new THREE.AnimationMixer( root );
    },
    )


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
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(0, 40, 0);
    // const thirdPersonCamera = new ThirdPersonCamera({
    //     camera: camera,
    // });
    goal = new THREE.Object3D;
    goal.position.x = -20;
    goal.add(camera);
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

    const theta = Math.PI * (0.49 - 0.55);
    const phi = 2 * Math.PI * (0.205 - 0.4);

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

    let mixer;
    const loaderGLTF = new GLTFLoader(loadingManager);
    loaderGLTF.load('./model/scene.gltf', function (gltf) {
        // console.log(gltf);
        // gltf.scene.position.set(-200,0,0);
        root = gltf.scene;
        scene.add(root);
        // console.log(dumpObject(root).join('\n'));
        kapal = root.getObjectByName('Assembly_ASSV001');
        root.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        mixer = new THREE.AnimationMixer(root);
    },
        function (xhr) {
            // console.log((xhr.loaded / xhr.total * 100) + "% Loaded");
        },
        function (error) {
            // console.log('An Error Occurred');
        }
    )


    // rumah air
    let root2;
    let rumah1;
    var box = new THREE.Box3();
    // let mixer;
    // loaderGLTF = new GLTFLoader();
    loaderGLTF.load('./model/rumahlaut1.gltf', function (gltf) {
        console.log(gltf);
        gltf.scene.scale.set(5, 5, 5);
        // gltf.scene.position.set(240, 0, -50);
        gltf.scene.position.set(all_rumah_pos_init[0][0],all_rumah_pos_init[0][1],all_rumah_pos_init[0][2]);
        root2 = gltf.scene;
        scene.add(root2);
        console.log(dumpObject(root2).join('\n'));
        rumah1 = root2.getObjectByName('Wood_support3');
        // box.setFromObject( rumah1 );
        root2.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        // mixer = new THREE.AnimationMixer( root );
    },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + "% Loaded");
        },
        function (error) {
            console.log('An Error Occurred');
        }
    )

    // console.log("BOX UKURAN",box);
    // console.log("RUMAH 1",rumah1.position);
    // for (let i = 0; i < 6; i+=2){
    //     var geometry_rumah1 = new THREE.BoxGeometry(Math.abs(collision_bbox[i][0] -
    //                                                             collision_bbox[i+1][0]), 13,
    //                                                             Math.abs(collision_bbox[i][1] -
    //                                                                 collision_bbox[i+1][1]),1,1,1);
    //
    //     var material_ = new THREE.MeshNormalMaterial( {color: 0xffff00} );
    //     var boxx = new THREE.Mesh( geometry_rumah1, material_ );
    //     boxx.position.set((collision_bbox[i][0] + collision_bbox[i+1][0])/2, 0, (collision_bbox[i][1] + collision_bbox[i+1][1])/2);
    //     scene.add(boxx);
    // }
    //
    // for (let i = 0; i < 6; i+=2){
    //     var geometry_rumah1 = new THREE.BoxGeometry(Math.abs(card_zone[i][0] -
    //         card_zone[i+1][0]), 5,
    //         Math.abs(card_zone[i][1] -
    //             card_zone[i+1][1]),1,1,1);
    //
    //     var material_ = new THREE.MeshNormalMaterial( {color: 0xffff00} );
    //     var boxx = new THREE.Mesh( geometry_rumah1, material_ );
    //     boxx.position.set((card_zone[i][0] + card_zone[i+1][0])/2, 0, (card_zone[i][1] + card_zone[i+1][1])/2);
    //     scene.add(boxx);
    // }

    // console.log("BOX UKURAN RUMAH 1",boxx.parameters.width, boxx.parameters.depth);
    console.log("BBOX COLLISION", collision_bbox);
    // rumah1.position.x = 2;

    // rumah air
    let root3;
    let rumah2;
    // let mixer;
    // loaderGLTF = new GLTFLoader();
    loaderGLTF.load('./model/rumah2.gltf', function (gltf) {
        console.log(gltf);
        gltf.scene.scale.set(5, 5, 5);
        // gltf.scene.position.set(-200, 20, -200);
        // gltf.scene.position.set(-400, 20, 200);
        gltf.scene.position.set(all_rumah_pos_init[1][0],all_rumah_pos_init[1][1],all_rumah_pos_init[1][2]);
        gltf.scene.rotation.set(0, Math.PI/2, 0);
        root3 = gltf.scene;
        scene.add(root3);
        console.log(dumpObject(root3).join('\n'));
        rumah2 = root3.getObjectByName('Wood');
        root3.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        // mixer = new THREE.AnimationMixer( root );
    },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + "% Loaded");
        },
        function (error) {
            console.log('An Error Occurred');
        }
    )

    // rumah air
    let root4;
    let rumah3;
    // let mixer;
    // loaderGLTF = new GLTFLoader();
    loaderGLTF.load('./model/rumah3.gltf', function (gltf) {
        console.log(gltf);
        gltf.scene.scale.set(5, 5, 5);
        // gltf.scene.position.set(-50, 20, -400);
        // gltf.scene.position.set(-50, 20, -600);
        gltf.scene.position.set(all_rumah_pos_init[2][0],all_rumah_pos_init[2][1],all_rumah_pos_init[2][2]);
        root4 = gltf.scene;
        scene.add(root4);
        console.log(dumpObject(root4).join('\n'));
        rumah3 = root4.getObjectByName('m_WoodenBeams');
        root4.traverse(function (object) {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        // mixer = new THREE.AnimationMixer( root );
    },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + "% Loaded");
        },
        function (error) {
            console.log('An Error Occurred');
        }
    )

    // card1
    card1(scene);
    card2(scene);
    card3(scene);

    console.log("CARDS ISINYA", cards, cards.length);



    /*
     * Light
     */
    const direcLight = new THREE.DirectionalLight(0xffffff, 1);
    direcLight.position.set(sun.x, sun.y, sun.z);
    direcLight.target.position.set(0, 0, 0);
    direcLight.castShadow = true;
    direcLight.shadow.mapSize.width = 2048;
    direcLight.shadow.mapSize.height = 2048;
    scene.add(direcLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    /*
         * music
         */

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    const sound = new THREE.Audio(listener);
    const sound2 = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    const audioLoader2 = new THREE.AudioLoader();
    audioLoader.load('./model/ocean.wav', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });

    /*
     * Control
     */
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.maxPolarAngle = Math.PI * 0.495;
    // controls.target.set(0, 10, 0);
    // controls.minDistance = 40.0;
    // controls.maxDistance = 500.0;
    // controls.update();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    function onKeyDown(e) {
        if (e.code in key_press) {
            if (e.code === "ArrowLeft") {
                key_press.ArrowLeft = true;
            }
            else if (e.code === "ArrowUp") {
                key_press.ArrowUp = true;
                document.getElementById('blocker').style.display = 'none'
                audioLoader2.load('./model/engine.ogg', function (buffer) {
                    sound2.setBuffer(buffer);
                    sound2.setLoop(true);
                    sound2.setVolume(0.5);
                    sound2.play();
                });
            }
            else if (e.code === "ArrowRight") {
                key_press.ArrowRight = true;
                document.getElementById('blocker').style.display = 'none'
            }
            else if (e.code === "ArrowDown") {
                key_press.ArrowDown = true;
                document.getElementById('blocker').style.display = 'none'
                audioLoader2.load('./model/engine.ogg', function (buffer) {
                    sound2.setBuffer(buffer);
                    sound2.setLoop(true);
                    sound2.setVolume(0.5);
                    sound2.play();
                });
            }
        }else if (e.code === "KeyQ"){

            // cards[0].rotation.set(0,-Math.PI/2,0);
            cards[0].translateY(1);
            // var rotation_k = new THREE.Euler().setFromQuaternion(kapal.quaternion, "ZXY");
            // // let yaw_kapal = - (rotation_k.y);
            // cards[1].quaternion.set(rotation_k);

        }else if (e.code === "KeyW"){
            // cards[0].rotation.set(0,0,0);
        }else if (e.code === "KeyE"){
            cards[0].rotation.set(0,Math.PI/2,0);
        }else if (e.code === "KeyR"){
            cards[0].rotation.set(0,Math.PI,0);
        }
        // else if (e.code === "KeyW"){
        //     cards[0].rotateY(-Math.PI / 2);
        // }else if (e.code === "KeyS"){
        //     cards[0].rotateY(-Math.PI / 2);
        // }



        // console.log("e code", e.code);
    }

    function onKeyUp(e) {
        if (e.code in key_press) {
            if (e.code === "ArrowLeft") {
                key_press.ArrowLeft = false;
            }
            if (e.code === "ArrowUp") {
                key_press.ArrowUp = false;
                audioLoader2.load('./model/engine.ogg', function (buffer) {
                    sound2.setBuffer(buffer);
                    sound2.setLoop(true);
                    sound2.setVolume(0.5);
                    sound2.stop();
                });
            }
            if (e.code === "ArrowRight") {
                key_press.ArrowRight = false;
            }
            if (e.code === "ArrowDown") {
                key_press.ArrowDown = false;
                audioLoader2.load('./model/engine.ogg', function (buffer) {
                    sound2.setBuffer(buffer);
                    sound2.setLoop(true);
                    sound2.setVolume(0.5);
                    sound2.stop();
                });
            }
        }
    }





    /*
     * Animasi
     */
    let speed = 1;
    let rotation_speed = 0.02;
    let card_raise_speed = 2;
    let card_target_Y = 400;
    let card_target_counter = 0;
    let hiding_card = 0;
    this.update = function () {
        let clock = new THREE.Clock();
        kapal_on_zone = isInsideBoundingBoxCard();
        dist_camera = 70;
        if(kapal_on_zone != 0){
            if (kapal_on_zone != kapal_on_zone_before){
                kapal_on_zone_before = kapal_on_zone;
                card_target_counter = 0;
                //rotate card
                let yaw_to_island = ((Math.PI/2) * getAngleOfKapalToIsland(kapal_on_zone - 1));

                cards[kapal_on_zone - 1].position.set(
                    (Math.cos(-yaw_to_island) * (all_cards_pos_init[kapal_on_zone - 1][0] - all_rumah_pos_init[kapal_on_zone - 1][0]))
                    - (Math.sin(-yaw_to_island) * (all_cards_pos_init[kapal_on_zone - 1][2] - all_rumah_pos_init[kapal_on_zone - 1][2]))
                    + (all_rumah_pos_init[kapal_on_zone - 1][0]),
                    -50,
                    (Math.sin(-yaw_to_island) * (all_cards_pos_init[kapal_on_zone - 1][0] - all_rumah_pos_init[kapal_on_zone - 1][0]))
                    + (Math.cos(-yaw_to_island) * (all_cards_pos_init[kapal_on_zone - 1][2] - all_rumah_pos_init[kapal_on_zone - 1][2]))
                    + (all_rumah_pos_init[kapal_on_zone - 1][2])
                    );
                cards[kapal_on_zone - 1].rotation.set(0,yaw_to_island,0);

                card_showed_at = kapal_on_zone;
                //show card
                console.log("SHOWING CARD", kapal_on_zone, ((Math.PI/2) *
                    getAngleOfKapalToIsland(kapal_on_zone - 1)), getAngleOfKapalToIsland(kapal_on_zone - 1),
                    (Math.cos(yaw_to_island) * (all_cards_pos_init[kapal_on_zone - 1][0] - all_rumah_pos_init[kapal_on_zone - 1][0]))
                    - (Math.sin(yaw_to_island) * (all_cards_pos_init[kapal_on_zone - 1][2] - all_rumah_pos_init[kapal_on_zone - 1][2]))
                    + (all_rumah_pos_init[kapal_on_zone - 1][0]),
                    -50,
                    (Math.sin(yaw_to_island) * (all_cards_pos_init[kapal_on_zone - 1][0] - all_rumah_pos_init[kapal_on_zone - 1][0]))
                    + (Math.cos(yaw_to_island) * (all_cards_pos_init[kapal_on_zone - 1][2] - all_rumah_pos_init[kapal_on_zone - 1][2]))
                    + (all_rumah_pos_init[kapal_on_zone - 1][2])

                    );

            }else{


                if (card_target_counter < card_target_Y){
                    // card_target_counter += card_raise_speed;
                    const targetPosition = cards[kapal_on_zone - 1].position.clone();
                    targetPosition.y += card_raise_speed;

                    cards[kapal_on_zone - 1].position.lerp(targetPosition, 0.2);
                    // // cards[kapal_on_zone - 1].translateY(card_raise_speed);
                    // dist_camera = 200;
                    // a.lerp(cards[kapal_on_zone - 1].position, 0.2);
                    // camera.lookAt(new THREE.Vector3(cards[kapal_on_zone - 1].position.x, cards[kapal_on_zone - 1].position.y + 25, cards[kapal_on_zone - 1].position.z));
                }

                if (card_target_counter < card_target_Y * 2){
                    card_target_counter += card_raise_speed;

                    // cards[kapal_on_zone - 1].position.lerp(targetPosition, 0.2);
                    // cards[kapal_on_zone - 1].translateY(card_raise_speed);
                    dist_camera = 200;
                    a.lerp(cards[kapal_on_zone - 1].position, 0.25);
                    camera.lookAt(new THREE.Vector3(cards[kapal_on_zone - 1].position.x, cards[kapal_on_zone - 1].position.y + 25, cards[kapal_on_zone - 1].position.z));

                    key_press.ArrowUp = false;
                }


                a.lerp(kapal.position, 0.4);
                camera.lookAt(new THREE.Vector3(kapal.position.x, kapal.position.y + 35, kapal.position.z));
            }
        }else{
            if (kapal_on_zone != kapal_on_zone_before) {
                kapal_on_zone_before = kapal_on_zone;

                //hide card
                // card_zone[card_showed_at].translate
                hiding_card = card_showed_at;
                console.log("HIDING CARD", card_showed_at);
            }else{
                if (hiding_card != 0){
                    card_target_counter -= card_raise_speed;
                    const targetPosition = cards[hiding_card - 1].position.clone();
                    targetPosition.y -= card_raise_speed;

                    if (card_target_counter > 0){
                        cards[hiding_card - 1].position.lerp(targetPosition, 0.2);
                        // cards[kapal_on_zone - 1].translateY(card_raise_speed);

                    }
                }
            }

            a.lerp(kapal.position, 0.6);
            camera.lookAt(new THREE.Vector3(kapal.position.x, kapal.position.y + 35, kapal.position.z));

        }
        // Animates water
        water.material.uniforms['time'].value += 1.0 / 60.0;

        // Camera Update

        if (key_press.ArrowUp && !isInFrontBoundingBox()) {
            let cur_speed = pid_control_kapal_throtle.setTarget(speed)
            kapal.translateX(cur_speed);
        } else if (key_press.ArrowDown) {
            let cur_speed = pid_control_kapal_throtle.setTarget(-speed)
            kapal.translateX(cur_speed);
        } else if (isInFrontBoundingBox()) {
            pid_control_kapal_throtle.setTarget(0);
            kapal.translateX(0);
        } else {
            let cur_speed = pid_control_kapal_throtle.setTarget(0);
            kapal.translateX(cur_speed);
        }


        //Belok, threshold kecepatan
        let thresh_vel_to_turn = 0.001;
        let vel_kapal = pid_control_kapal_throtle.getCurrentCond();

        if (key_press.ArrowRight) {
            if (vel_kapal > thresh_vel_to_turn) {
                let cur_speed = pid_control_kapal_turn.setTarget(-rotation_speed * (vel_kapal));
                kapal.rotateY(cur_speed);
            } else if (vel_kapal < -thresh_vel_to_turn) {
                let cur_speed = pid_control_kapal_turn.setTarget(-rotation_speed * (vel_kapal));
                kapal.rotateY(cur_speed);
            }

            // if (key_press.ArrowUp)
            //     // kapal.rotation.y -= rotation_speed;
            //     kapal.rotateY(-rotation_speed);
            // else if (key_press.ArrowDown)
            //     // kapal.rotation.y += rotation_speed;
            //     kapal.rotateY(+rotation_speed);
        } else if (key_press.ArrowLeft) {
            if (vel_kapal > thresh_vel_to_turn) {
                let cur_speed = pid_control_kapal_turn.setTarget(rotation_speed * (vel_kapal));
                kapal.rotateY(cur_speed);
            } else if (vel_kapal < -thresh_vel_to_turn) {
                let cur_speed = pid_control_kapal_turn.setTarget(rotation_speed * (vel_kapal));
                kapal.rotateY(cur_speed);
            }

            // if (key_press.ArrowUp)
            //     // kapal.rotation.y += rotation_speed;
            //     kapal.rotateY(+rotation_speed);
            // else if (key_press.ArrowDown)
            //     // kapal.rotation.y -= rotation_speed;
            //     kapal.rotateY(-rotation_speed);
        } else {
            let cur_speed = pid_control_kapal_turn.setTarget(0)
            kapal.rotateY(cur_speed);
        }
        // console.log(kapal.type)
        // if(kapal_on_zone != 0){
        //     dist_camera = 200;
        //     a.lerp(cards[kapal_on_zone - 1].position, 0.2);
        //     camera.lookAt(new THREE.Vector3(cards[kapal_on_zone - 1].position.x, cards[kapal_on_zone - 1].position.y + 25, cards[kapal_on_zone - 1].position.z));
        // }else{
        //     a.lerp(kapal.position, 0.2);
        //     camera.lookAt(new THREE.Vector3(kapal.position.x, kapal.position.y + 25, kapal.position.z));
        // }
        b.copy(goal.position);

        // dir.copy( a ).sub( b ).normalize();
        dir.copy(a).sub(b);

        var rotation_k = new THREE.Euler().setFromQuaternion(kapal.quaternion, "ZXY");
        let yaw_kapal = - (rotation_k.y)

        goal.position.addScaledVector(new THREE.Vector3(
            dir.x - (Math.cos(yaw_kapal) * dist_camera), dir.y,
            dir.z - (Math.sin(yaw_kapal) * dist_camera)), 0.01);


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

//Hide all cards
for (let i = 0; i < 3; i++){
    // cards[i].translateX(-2);
    console.log("BAWAH card",i);
}

animate();