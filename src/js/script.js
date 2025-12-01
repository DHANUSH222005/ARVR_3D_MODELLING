import {
    ACESFilmicToneMapping,
    AmbientLight,
    Box3,
    Clock,
    Color,
    DirectionalLight,
    DoubleSide,
    MathUtils,
    Mesh,
    MeshStandardMaterial,
    PCFSoftShadowMap,
    PerspectiveCamera,
    PlaneGeometry,
    Scene,
    SRGBColorSpace,
    Vector3,
    WebGLRenderer
} from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

// ======================================================
// 1. RENDERER & SCENE
// ======================================================
const canvas = document.getElementById("renderCanvas");
const renderer = new WebGLRenderer({ canvas, antialias: true });

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;

const scene = new Scene();
scene.background = new Color(0x0f121b);
const clock = new Clock();

// ======================================================
// 2. LIGHTS & GROUND
// ======================================================
scene.add(new AmbientLight(0xffffff, 1.2));

const dirLight = new DirectionalLight(0xffffff, 4);
dirLight.position.set(15, 20, 12);
scene.add(dirLight);

scene.add(
    new Mesh(
        new PlaneGeometry(200, 200),
        new MeshStandardMaterial({ color: 0x1a1d29, roughness: 0.9 })
    )
);

// ======================================================
// 3. CAMERAS & CONTROLS
// ======================================================
const thirdPersonCamera = new PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
thirdPersonCamera.position.set(38, 4, -32);

const firstPersonCamera = new PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

const FIRST_PERSON_HEIGHT = 3.4;

const orbitControls = new OrbitControls(thirdPersonCamera, canvas);
orbitControls.enableDamping = true;
orbitControls.enablePan = false;
orbitControls.minDistance = 3;
orbitControls.maxDistance = 15;
orbitControls.maxPolarAngle = Math.PI / 2; // Don't go below ground
orbitControls.minPolarAngle = 0.3; // Don't go too far above

const pointerControls = new PointerLockControls(firstPersonCamera, canvas);

let activeCamera = thirdPersonCamera;
let activeMode = "third-person";

// ======================================================
// 4. MOVEMENT & PHYSICS
// ======================================================
const movement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
};

const MOVEMENT_SPEED = 3.8;
const SPRINT_MULTIPLIER = 1.6;

let velocityY = 0;
const GRAVITY = -25;
const JUMP_POWER = 8;
let onGround = true;

// ======================================================
// 5. LOAD MAP (RAISED BY 3 METERS)
// ======================================================
const gltfLoader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath("/draco/");
gltfLoader.setDRACOLoader(draco);
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

gltfLoader.load(
    new URL("../assets/layout12.glb", import.meta.url).href,
    (gltf) => {
        const map = gltf.scene;
        map.position.y += 1.0;

        map.traverse((o) => {
            if (o.isMesh) {
                o.material.side = DoubleSide;
                o.material.metalness = 0;
                o.material.roughness = 0.8;
            }
        });

        scene.add(map);
        console.log("Map loaded (raised 3m)");
    }
);

// ======================================================
// 6. LOAD MINION (1.5m TALL, 1m WIDE)
// ======================================================
let player = new Mesh();
player.position.set(38, 0, -38);
scene.add(player);

let playerModel = null;

const fbxLoader = new FBXLoader();
fbxLoader.load(
    new URL("../assets/Minion_FBX.fbx", import.meta.url).href,
    (fbx) => {
        playerModel = fbx;

        const box = new Box3().setFromObject(playerModel);
        const originalHeight = box.max.y - box.min.y;
        const originalWidth = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);

        const scaleY = 3.5 / originalHeight;
        const scaleXZ = 2.0 / originalWidth;

        playerModel.scale.set(scaleXZ, scaleY, scaleXZ);
        playerModel.rotation.y = Math.PI;

        player.add(playerModel);
        console.log("Minion loaded (3.5m tall, 2m wide)");
    }
);

// ======================================================
// 7. MODE SWITCHING
// ======================================================
function setMode(mode) {
    if (activeMode === mode) return;

    if (mode === "first-person") {
        if (playerModel) playerModel.visible = false;
        orbitControls.enabled = false;
        pointerControls.lock();
        activeCamera = firstPersonCamera;
        activeMode = "first-person";
    } else {
        if (playerModel) playerModel.visible = true;
        orbitControls.enabled = true;
        pointerControls.unlock();
        activeCamera = thirdPersonCamera;
        activeMode = "third-person";
    }
}

// ======================================================
// 8. INPUT HANDLING (WITH JUMP)
// ======================================================
window.addEventListener("keydown", (e) => {
    switch (e.code) {
        case "Digit1": setMode("first-person"); break;
        case "Digit3": setMode("third-person"); break;
        case "KeyW": movement.forward = true; break;
        case "KeyS": movement.backward = true; break;
        case "KeyA": movement.left = true; break;
        case "KeyD": movement.right = true; break;
        case "ShiftLeft": movement.sprint = true; break;
        case "Space":
            if (onGround) {
                velocityY = JUMP_POWER;
                onGround = false;
            }
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.code) {
        case "KeyW": movement.forward = false; break;
        case "KeyS": movement.backward = false; break;
        case "KeyA": movement.left = false; break;
        case "KeyD": movement.right = false; break;
        case "ShiftLeft": movement.sprint = false; break;
    }
});

// ======================================================
// 9. MOVEMENT WITHOUT COLLISION
// ======================================================
function updateMovement(dt) {
    const speed = MOVEMENT_SPEED * (movement.sprint ? SPRINT_MULTIPLIER : 1);

    // CAMERA-BASED MOVEMENT
    const forward = new Vector3();
    activeCamera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new Vector3();
    right.crossVectors(forward, new Vector3(0, 1, 0)).normalize();

    let move = new Vector3();

    if (movement.forward) move.add(forward);
    if (movement.backward) move.sub(forward);
    if (movement.left) move.sub(right);
    if (movement.right) move.add(right);

    if (move.lengthSq() > 0) {
        move.normalize();
        move.multiplyScalar(speed * dt);

        player.position.add(move);

        if (playerModel) {
            player.rotation.y = Math.atan2(move.x, move.z);
        }
    }

    // GRAVITY & JUMP (no collision)
    velocityY += GRAVITY * dt;
    player.position.y += velocityY * dt;

    if (player.position.y < 0) {
        player.position.y = 0;
        onGround = true;
        velocityY = 0;
    }

    // FIRST PERSON CAMERA POS
    if (activeMode === "first-person") {
        firstPersonCamera.position.set(
            player.position.x,
            player.position.y + FIRST_PERSON_HEIGHT,
            player.position.z
        );
    }
}

// ======================================================
// 10. THIRD PERSON CAMERA
// ======================================================
let previousPlayerPos = new Vector3(38, 0, -38);
let isFirstFrame = true;

function updateThirdPersonCamera(dt) {
    if (activeMode !== "third-person") return;

    // Set initial target on first frame
    if (isFirstFrame) {
        const targetPos = player.position.clone();
        targetPos.y += 1.5;
        orbitControls.target.copy(targetPos);
        isFirstFrame = false;
        previousPlayerPos.copy(player.position);
        return;
    }

    // Calculate how much the player moved this frame
    const playerMovement = player.position.clone().sub(previousPlayerPos);
    
    // Move the camera by the same amount the player moved
    thirdPersonCamera.position.add(playerMovement);
    
    // Update orbit controls target to follow the player
    const targetPos = player.position.clone();
    targetPos.y += 1.5; // Look at player's center/chest height
    
    orbitControls.target.copy(targetPos);
    
    // Store current position for next frame
    previousPlayerPos.copy(player.position);
}

// ======================================================
// 11. RESIZE
// ======================================================
function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    renderer.setSize(w, h);
    thirdPersonCamera.aspect = w / h;
    firstPersonCamera.aspect = w / h;
    thirdPersonCamera.updateProjectionMatrix();
    firstPersonCamera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

// ======================================================
// 12. ANIMATION LOOP
// ======================================================
const coordsDisplay = document.getElementById("coords");

function animate() {
    const dt = Math.min(clock.getDelta(), 0.05);

    updateMovement(dt);

    if (activeMode === "third-person") {
        updateThirdPersonCamera(dt);
        orbitControls.update();
    }

    // Update coordinates display
    if (coordsDisplay) {
        coordsDisplay.innerHTML = `<span>X:</span> ${player.position.x.toFixed(2)} | <span>Y:</span> ${player.position.y.toFixed(2)} | <span>Z:</span> ${player.position.z.toFixed(2)}`;
    }

    renderer.render(scene, activeCamera);
}

renderer.setAnimationLoop(animate);
resize();
