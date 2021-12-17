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

var root;
var kapal;

var cards = [];
var collision_bbox = [];
collision_bbox.push([110,-115]);
collision_bbox.push([27,-25]);
collision_bbox.push([43,-480]);
collision_bbox.push([-125,-310]);
collision_bbox.push([-136,-251]);
collision_bbox.push([-270,-138]);

let card_zone = [];
let bigger_than_coll = 1.5;
for (let i =0; i < 6;i++){
    card_zone.push([collision_bbox[i][0]*bigger_than_coll,collision_bbox[i][1]*bigger_than_coll]);
}
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
var b = new THREE.Vector3;

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

function isInsideBoundingBox(){
    let inside_bbox = false;

    // if (kapal.position.x <= collision_bbox[0][0] && kapal.position.x >= collision_bbox[1][0]
    //     && kapal.position.z >= collision_bbox[0][1] && kapal.position.z <= collision_bbox[1][1]){
    //     inside_bbox = true;
    //     console.log("MASUK BBOX");
    // }

    return inside_bbox;
}

function isInFrontBoundingBox(){
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

function getAngleOfCard(){
    for (let i = 0; i < 6; i+=2){
        if ((kapal.position.x + (Math.cos(yaw_kapal) * distance)) <= collision_bbox[i][0] && (kapal.position.x + (Math.cos(yaw_kapal) * distance)) >= collision_bbox[i+1][0]
            && (kapal.position.z + (Math.sin(yaw_kapal) * distance)) >= collision_bbox[i][1] && (kapal.position.z + (Math.sin(yaw_kapal) * distance)) <= collision_bbox[i+1][1]){
            inside_bbox = true;
            // console.log("MASUK BBOX");
        }
    }

    return
}

function card1(scene) {
    let root5;
    let card1;
    // let mixer;
    const loaderGLTF = new GLTFLoader(loadingManager);
    loaderGLTF.load('./model/card1.gltf', function (gltf) {
        console.log(gltf);
        gltf.scene.scale.set(10, 10, 10);
        gltf.scene.position.set(-50,20,-400);
        root5 = gltf.scene;
        scene.add(root5);
        console.log(dumpObject(root5).join('\n'));
        cards[0] = root5.getObjectByName('Mesh_0');
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
        console.log(gltf);
        gltf.scene.scale.set(10, 10, 10);
        // gltf.scene.position.set(-50,20,-400);
        gltf.scene.position.set(100, 0, 0);
        root5 = gltf.scene;
        scene.add(root5);
        console.log(dumpObject(root5).join('\n'));
        cards[1] = root5.getObjectByName('Mesh_0');
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
        console.log(gltf);
        gltf.scene.scale.set(10, 10, 10);
        // gltf.scene.position.set(-50,20,-400);
        gltf.scene.position.set(200, 0, 0);
        gltf.scene.rotation.set(0,1,0)
        root5 = gltf.scene;
        scene.add(root5);
        console.log(dumpObject(root5).join('\n'));
        cards[2] = root5.getObjectByName('Mesh_0');
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

        mixer = new THREE.AnimationMixer(root);
    },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + "% Loaded");
        },
        function (error) {
            console.log('An Error Occurred');
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
        gltf.scene.position.set(40, 0, -50);
        root2 = gltf.scene;
        scene.add(root2);
        console.log(dumpObject(root2).join('\n'));
        rumah1 = root2.getObjectByName('Wood_support3');
        box.setFromObject( rumah1 );
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
    for (let i = 0; i < 6; i+=2){
        var geometry_rumah1 = new THREE.BoxGeometry(Math.abs(collision_bbox[i][0] -
                                                                collision_bbox[i+1][0]), 13,
                                                                Math.abs(collision_bbox[i][1] -
                                                                    collision_bbox[i+1][1]),1,1,1);

        var material_ = new THREE.MeshNormalMaterial( {color: 0xffff00} );
        var boxx = new THREE.Mesh( geometry_rumah1, material_ );
        boxx.position.set((collision_bbox[i][0] + collision_bbox[i+1][0])/2, 0, (collision_bbox[i][1] + collision_bbox[i+1][1])/2);
        scene.add(boxx);
    }

    for (let i = 0; i < 6; i+=2){
        var geometry_rumah1 = new THREE.BoxGeometry(Math.abs(card_zone[i][0] -
            card_zone[i+1][0]), 5,
            Math.abs(card_zone[i][1] -
                card_zone[i+1][1]),1,1,1);

        var material_ = new THREE.MeshNormalMaterial( {color: 0xffff00} );
        var boxx = new THREE.Mesh( geometry_rumah1, material_ );
        boxx.position.set((card_zone[i][0] + card_zone[i+1][0])/2, 0, (card_zone[i][1] + card_zone[i+1][1])/2);
        scene.add(boxx);
    }

    // console.log("BOX UKURAN RUMAH 1",boxx.parameters.width, boxx.parameters.depth);
    console.log("BBOX COLLISION",collision_bbox);
    // rumah1.position.x = 2;

    // rumah air
    let root3;
    let rumah2;
    // let mixer;
    // loaderGLTF = new GLTFLoader();
    loaderGLTF.load('./model/rumah2.gltf', function (gltf) {
        console.log(gltf);
        gltf.scene.scale.set(5, 5, 5);
        gltf.scene.position.set(-200, 20, -200);
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
        gltf.scene.position.set(-50, 20, -400);
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

    console.log("CARDS ISINYA",cards, cards.length);



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
                document.getElementById('blocker').style.display='none'
            }
            else if (e.code === "ArrowUp") {
                key_press.ArrowUp = true;
                document.getElementById('blocker').style.display='none'
            }
            else if (e.code === "ArrowRight") {
                key_press.ArrowRight = true;
                document.getElementById('blocker').style.display='none'
            }
            else if (e.code === "ArrowDown") {
                key_press.ArrowDown = true;
                document.getElementById('blocker').style.display='none'
            }
        }else if (e.code === "KeyQ"){
            cards[1].rotateY(Math.PI / 4);
            // var rotation_k = new THREE.Euler().setFromQuaternion(kapal.quaternion, "ZXY");
            // // let yaw_kapal = - (rotation_k.y);
            // cards[1].quaternion.set(rotation_k);

        }else if (e.code === "KeyA"){
            cards[1].rotateY(-Math.PI / 2);
        }else if (e.code === "KeyE"){
            cards[1].rotateZ(Math.PI / 2);
        }else if (e.code === "KeyD"){
            cards[1].rotateZ(-Math.PI / 2);
        }else if (e.code === "KeyW"){
            cards[1].rotateX(Math.PI / 2);
        }else if (e.code === "KeyS"){
            cards[1].rotateX(-Math.PI / 2);
        }



        // console.log("e code", e.code);
    }

    function onKeyUp(e) {
        if (e.code in key_press) {
            if (e.code === "ArrowLeft") {
                key_press.ArrowLeft = false;
            }
            if (e.code === "ArrowUp") {
                key_press.ArrowUp = false;
            }
            if (e.code === "ArrowRight") {
                key_press.ArrowRight = false;
            }
            if (e.code === "ArrowDown") {
                key_press.ArrowDown = false;
            }
        }
    }

    /*
     * music
     */

    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    const sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('./model/ocean.wav', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });



    /*
     * Animasi
     */
    let speed = 1;
    let rotation_speed = 0.02;

    this.update = function () {
        let clock = new THREE.Clock();
        isInsideBoundingBox();
        // Animates water
        water.material.uniforms['time'].value += 1.0 / 60.0;

        // Camera Update

        if (key_press.ArrowUp && !isInFrontBoundingBox()) {
            let cur_speed = pid_control_kapal_throtle.setTarget(speed)
            kapal.translateX(cur_speed);
        } else if (key_press.ArrowDown) {
            let cur_speed = pid_control_kapal_throtle.setTarget(-speed)
            kapal.translateX(cur_speed);
        } else if(isInFrontBoundingBox()){
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

        a.lerp(kapal.position, 0.6);
        b.copy(goal.position);

        // dir.copy( a ).sub( b ).normalize();
        dir.copy(a).sub(b);
        // const dis = (a.distanceTo( b ) - SafetyDistance);
        // console.log("dir", dir);
        // goal.position.add( dir);
        var rotation_k = new THREE.Euler().setFromQuaternion(kapal.quaternion, "ZXY");
        let yaw_kapal = - (rotation_k.y)
        // console.log("dis", dis);
        goal.position.addScaledVector(new THREE.Vector3(
            dir.x - (Math.cos(yaw_kapal) * 70), dir.y,
            dir.z - (Math.sin(yaw_kapal) * 70)), 0.01);
        // goal.position.set(kapal.position.x - (Math.cos(yaw_kapal) * 70), kapal.position.y,
        //     kapal.position.z - (Math.sin(yaw_kapal) * 70))
        console.log("kapalpos", kapal.position);
        // console.log("goalpos", goal.position);

        // console.log("kapalYaw", yaw_kapal);
        // console.log("kapalRot", (yaw_kapal / Math.PI) * 180);
        // console.log("sinrot", Math.sin(-kapal.rotation.y));

        // kapal.rotateY(+0.010)
        // kapal.rotation.order = "XYZ"

        // console.log("kapalpos", new THREE.Vector3( kapal.position.x, kapal.position.y + 10, kapal.position.z ));

        // camera.lookAt( kapal.position );
        camera.lookAt(new THREE.Vector3(kapal.position.x, kapal.position.y + 25, kapal.position.z));

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