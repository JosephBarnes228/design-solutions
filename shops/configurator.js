import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

// Configuration State
const shopState = {
    length: 40,    // feet
    width: 30,     // feet
    height: 14,    // feet
    pitch: 4,      // X / 12
    style: 'gable', // gable, monoslope, gambrel
    sidingColor: 0x334155,
    sidingName: 'Slate Charcoal',
    roofColor: 0x0F172A,
    roofName: 'Matte Black',
    trimColor: 0xFFFFFF,
    garageDoorSize: 10, // Default single bay width
    garageDoorsList: [
        { id: 1, side: 'front', size: 10 },
        { id: 2, side: 'front', size: 10 }
    ],
    manDoorsList: [
        { id: 1, side: 'right' }
    ],
    windowsList: [
        { id: 1, side: 'left' },
        { id: 2, side: 'left' }
    ]
};

let scene, camera, renderer, controls;
let shopGroup;

// Initialize 3D Engine
function init3D() {
    const container = document.getElementById('viewport-container');
    const canvas = document.getElementById('shop-canvas');
    if (!canvas || !container) return;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.008);

    // Camera
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(55, 35, 65);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.minDistance = 15;
    controls.maxDistance = 250;
    controls.target.set(0, 7, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.85);
    sunLight.position.set(60, 80, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 250;
    const d = 60;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 0.35);
    scene.add(hemiLight);

    // Ground Plane & Grid
    createEnvironment();

    // Create Shop Group
    shopGroup = new THREE.Group();
    scene.add(shopGroup);

    // Render Initial UI List & Build Shop
    renderItemLists();
    buildShop();

    // Render Loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Handle Resize
    window.addEventListener('resize', onWindowResize);
}

function createEnvironment() {
    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x1e293b, 
        roughness: 0.9, 
        metalness: 0.1 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle Grid Helper
    const grid = new THREE.GridHelper(200, 40, 0x38bdf8, 0x334155);
    grid.position.y = 0;
    scene.add(grid);
}

function buildShop() {
    // Clear existing mesh
    while (shopGroup.children.length > 0) {
        const obj = shopGroup.children[0];
        shopGroup.remove(obj);
    }

    const L = shopState.length;
    const W = shopState.width;
    const H = shopState.height;
    const pitchRatio = shopState.pitch / 12;
    const roofPeakHeight = (W / 2) * pitchRatio;

    // Materials
    const sidingMat = new THREE.MeshStandardMaterial({
        color: shopState.sidingColor,
        roughness: 0.55,
        metalness: 0.2
    });

    const roofMat = new THREE.MeshStandardMaterial({
        color: shopState.roofColor,
        roughness: 0.4,
        metalness: 0.35,
        side: THREE.DoubleSide
    });

    const trimMat = new THREE.MeshStandardMaterial({
        color: shopState.trimColor,
        roughness: 0.3
    });

    const concreteMat = new THREE.MeshStandardMaterial({
        color: 0x94A3B8,
        roughness: 0.8
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x38BDF8,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0.9
    });

    // 1. Concrete Slab Foundation
    const slabGeo = new THREE.BoxGeometry(W + 1, 0.5, L + 1);
    const slab = new THREE.Mesh(slabGeo, concreteMat);
    slab.position.set(0, 0.25, 0);
    slab.receiveShadow = true;
    shopGroup.add(slab);

    // 2. Main Wall Body
    const wallGeo = new THREE.BoxGeometry(W, H, L);
    const mainWalls = new THREE.Mesh(wallGeo, sidingMat);
    mainWalls.position.set(0, H / 2 + 0.5, 0);
    mainWalls.castShadow = true;
    mainWalls.receiveShadow = true;
    shopGroup.add(mainWalls);

    // Corner Trims
    const trimWidth = 0.5;
    const corners = [
        [-W/2 - 0.05, -L/2 - 0.05],
        [ W/2 + 0.05, -L/2 - 0.05],
        [-W/2 - 0.05,  L/2 + 0.05],
        [ W/2 + 0.05,  L/2 + 0.05]
    ];
    corners.forEach(([cx, cz]) => {
        const cGeo = new THREE.BoxGeometry(trimWidth, H, trimWidth);
        const cTrim = new THREE.Mesh(cGeo, trimMat);
        cTrim.position.set(cx, H/2 + 0.5, cz);
        shopGroup.add(cTrim);
    });

    // 3. Roof Construction & Solid End Walls
    if (shopState.style === 'gable') {
        // Gable End Triangles (Front & Back)
        const gableShape = new THREE.Shape();
        gableShape.moveTo(-W / 2, 0);
        gableShape.lineTo(0, roofPeakHeight);
        gableShape.lineTo(W / 2, 0);
        gableShape.closePath();

        const extrudeSettings = { depth: 0.2, bevelEnabled: false };
        const gableGeo = new THREE.ExtrudeGeometry(gableShape, extrudeSettings);

        // Front Gable
        const frontGable = new THREE.Mesh(gableGeo, sidingMat);
        frontGable.position.set(0, H + 0.5, L / 2 - 0.1);
        frontGable.castShadow = true;
        shopGroup.add(frontGable);

        // Back Gable
        const backGable = new THREE.Mesh(gableGeo, sidingMat);
        backGable.position.set(0, H + 0.5, -L / 2 - 0.1);
        backGable.castShadow = true;
        shopGroup.add(backGable);

        // Roof Slopes
        const eaveOverhang = 1.2;
        const slopeLen = Math.sqrt(Math.pow(W / 2 + eaveOverhang, 2) + Math.pow(roofPeakHeight, 2));
        const roofAngle = Math.atan2(roofPeakHeight, W / 2 + eaveOverhang);

        // Left Roof Panel
        const roofLeftGeo = new THREE.BoxGeometry(slopeLen, 0.3, L + eaveOverhang * 2);
        const roofLeft = new THREE.Mesh(roofLeftGeo, roofMat);
        roofLeft.position.set(-(W / 4 + eaveOverhang / 4), H + 0.5 + roofPeakHeight / 2, 0);
        roofLeft.rotation.z = roofAngle;
        roofLeft.castShadow = true;
        shopGroup.add(roofLeft);

        // Right Roof Panel
        const roofRight = new THREE.Mesh(roofLeftGeo, roofMat);
        roofRight.position.set(W / 4 + eaveOverhang / 4, H + 0.5 + roofPeakHeight / 2, 0);
        roofRight.rotation.z = -roofAngle;
        roofRight.castShadow = true;
        shopGroup.add(roofRight);

        // Ridge Cap Trim
        const capGeo = new THREE.BoxGeometry(0.8, 0.4, L + eaveOverhang * 2 + 0.2);
        const cap = new THREE.Mesh(capGeo, trimMat);
        cap.position.set(0, H + 0.5 + roofPeakHeight + 0.2, 0);
        shopGroup.add(cap);

    } else if (shopState.style === 'monoslope') {
        // Monoslope / Lean-To Roof & Solid 4-Side Walls
        const eaveOverhang = 1.2;
        const monoHeight = Math.max(3.5, W * pitchRatio);

        // High Wall Longitudinal Extension Fill (along x = -W/2)
        const highWallGeo = new THREE.BoxGeometry(0.2, monoHeight, L);
        const highWall = new THREE.Mesh(highWallGeo, sidingMat);
        highWall.position.set(-W / 2 + 0.1, H + 0.5 + monoHeight / 2, 0);
        highWall.castShadow = true;
        shopGroup.add(highWall);

        // Fill triangular side end walls on Front (z = L/2) and Back (z = -L/2)
        const monoShape = new THREE.Shape();
        monoShape.moveTo(-W / 2, 0);
        monoShape.lineTo(-W / 2, monoHeight);
        monoShape.lineTo(W / 2, 0);
        monoShape.closePath();

        const extrudeSettings = { depth: 0.2, bevelEnabled: false };
        const monoGableGeo = new THREE.ExtrudeGeometry(monoShape, extrudeSettings);

        const frontMonoGable = new THREE.Mesh(monoGableGeo, sidingMat);
        frontMonoGable.position.set(0, H + 0.5, L / 2 - 0.1);
        frontMonoGable.castShadow = true;
        shopGroup.add(frontMonoGable);

        const backMonoGable = new THREE.Mesh(monoGableGeo, sidingMat);
        backMonoGable.position.set(0, H + 0.5, -L / 2 - 0.1);
        backMonoGable.castShadow = true;
        shopGroup.add(backMonoGable);

        // Single Sloped Roof Panel (slopes down from high wall at -W/2 to low wall at +W/2)
        const spanW = W + eaveOverhang * 2;
        const monoSlopeLen = Math.sqrt(Math.pow(spanW, 2) + Math.pow(monoHeight, 2));
        const monoAngle = Math.atan2(monoHeight, spanW);

        const roofMonoGeo = new THREE.BoxGeometry(monoSlopeLen, 0.35, L + eaveOverhang * 2);
        const roofMono = new THREE.Mesh(roofMonoGeo, roofMat);
        roofMono.position.set(0, H + 0.5 + monoHeight / 2, 0);
        roofMono.rotation.z = -monoAngle;
        roofMono.castShadow = true;
        shopGroup.add(roofMono);

        // High Eave Trim Cap
        const eaveTrimGeo = new THREE.BoxGeometry(0.5, 0.5, L + eaveOverhang * 2 + 0.2);
        const highEaveTrim = new THREE.Mesh(eaveTrimGeo, trimMat);
        highEaveTrim.position.set(-W/2 - eaveOverhang / 2, H + 0.5 + monoHeight, 0);
        shopGroup.add(highEaveTrim);

    } else if (shopState.style === 'gambrel') {
        // Barn Gambrel Style Roof & 100% Solid Barn End Walls
        const eaveOverhang = 1.2;
        const gPeakH = (W / 2) * pitchRatio * 1.35;
        const breakH = gPeakH * 0.65;
        const breakX = W / 4;

        // 1. Gambrel 5-Point Barn End Walls (Front & Back)
        const gambrelShape = new THREE.Shape();
        gambrelShape.moveTo(-W / 2, 0);
        gambrelShape.lineTo(-breakX, breakH);
        gambrelShape.lineTo(0, gPeakH);
        gambrelShape.lineTo(breakX, breakH);
        gambrelShape.lineTo(W / 2, 0);
        gambrelShape.closePath();

        const extrudeSettings = { depth: 0.2, bevelEnabled: false };
        const gambrelGableGeo = new THREE.ExtrudeGeometry(gambrelShape, extrudeSettings);

        const frontGambrel = new THREE.Mesh(gambrelGableGeo, sidingMat);
        frontGambrel.position.set(0, H + 0.5, L / 2 - 0.1);
        frontGambrel.castShadow = true;
        shopGroup.add(frontGambrel);

        const backGambrel = new THREE.Mesh(gambrelGableGeo, sidingMat);
        backGambrel.position.set(0, H + 0.5, -L / 2 - 0.1);
        backGambrel.castShadow = true;
        shopGroup.add(backGambrel);

        // 2. Four Roof Panels (Lower Steep + Upper Shallow Slopes)
        const lowerSpanX = W / 4 + eaveOverhang;
        const lowerLen = Math.sqrt(Math.pow(lowerSpanX, 2) + Math.pow(breakH, 2));
        const lowerAngle = Math.atan2(breakH, lowerSpanX);

        const lowerRoofGeo = new THREE.BoxGeometry(lowerLen, 0.35, L + eaveOverhang * 2);

        // Lower Left Roof Panel
        const lowerLeft = new THREE.Mesh(lowerRoofGeo, roofMat);
        lowerLeft.position.set(-(W / 2 + breakX) / 2 - eaveOverhang / 2, H + 0.5 + breakH / 2, 0);
        lowerLeft.rotation.z = lowerAngle;
        lowerLeft.castShadow = true;
        shopGroup.add(lowerLeft);

        // Lower Right Roof Panel
        const lowerRight = new THREE.Mesh(lowerRoofGeo, roofMat);
        lowerRight.position.set((W / 2 + breakX) / 2 + eaveOverhang / 2, H + 0.5 + breakH / 2, 0);
        lowerRight.rotation.z = -lowerAngle;
        lowerRight.castShadow = true;
        shopGroup.add(lowerRight);

        // Upper Shallow Slopes
        const upperSpanX = W / 4;
        const upperSpanY = gPeakH - breakH;
        const upperLen = Math.sqrt(Math.pow(upperSpanX, 2) + Math.pow(upperSpanY, 2));
        const upperAngle = Math.atan2(upperSpanY, upperSpanX);

        const upperRoofGeo = new THREE.BoxGeometry(upperLen + 0.2, 0.35, L + eaveOverhang * 2);

        // Upper Left Roof Panel
        const upperLeft = new THREE.Mesh(upperRoofGeo, roofMat);
        upperLeft.position.set(-breakX / 2, H + 0.5 + breakH + upperSpanY / 2, 0);
        upperLeft.rotation.z = upperAngle;
        upperLeft.castShadow = true;
        shopGroup.add(upperLeft);

        // Upper Right Roof Panel
        const upperRight = new THREE.Mesh(upperRoofGeo, roofMat);
        upperRight.position.set(breakX / 2, H + 0.5 + breakH + upperSpanY / 2, 0);
        upperRight.rotation.z = -upperAngle;
        upperRight.castShadow = true;
        shopGroup.add(upperRight);

        // Ridge Cap
        const capGeo = new THREE.BoxGeometry(0.8, 0.4, L + eaveOverhang * 2 + 0.2);
        const cap = new THREE.Mesh(capGeo, trimMat);
        cap.position.set(0, H + 0.5 + gPeakH + 0.2, 0);
        shopGroup.add(cap);
    }

    // 4. Doors & Windows Placement (Supports Single 10' & Double 16' Garage Bays; Unscaled Omit Overflow)
    let anyCollisionWarning = false;
    const sides = ['front', 'back', 'left', 'right'];

    sides.forEach(side => {
        const wallSpan = (side === 'front' || side === 'back') ? W : L;

        // Gather Garage Doors assigned to this side
        const gItems = shopState.garageDoorsList.filter(item => item.side === side);
        
        // Gather Man Doors assigned to this side
        const mItems = shopState.manDoorsList.filter(item => item.side === side);
        const mW = 3.6;
        const mH = 7.0;

        // Gather Windows assigned to this side
        const wItems = shopState.windowsList.filter(item => item.side === side);
        const winW = 4.2;
        const winH = 4.0;

        // Side Partitioning Order: Left Windows -> Garage Bays -> Man Doors -> Right Windows
        let wLeft = [], wRight = [];
        if (wItems.length > 1 && (gItems.length > 0 || mItems.length > 0)) {
            const half = Math.floor(wItems.length / 2);
            wLeft = wItems.slice(0, half);
            wRight = wItems.slice(half);
        } else {
            wRight = wItems;
        }

        const candidateItems = [];
        wLeft.forEach(item => candidateItems.push({ type: 'window', baseW: winW, h: winH }));
        
        gItems.forEach(item => {
            const gW = item.size || 10;
            const gH = Math.min(10, H - 2);
            candidateItems.push({ type: 'garage', isDouble: gW === 16, baseW: gW, h: gH });
        });

        mItems.forEach(item => candidateItems.push({ type: 'mandoor', baseW: mW, h: mH }));
        wRight.forEach(item => candidateItems.push({ type: 'window', baseW: winW, h: winH }));

        if (candidateItems.length === 0) return;

        // Capacity check: Keep items at 100% full unscaled size; omit elements that overflow wallSpan
        const gap = 1.8;
        const endPad = 1.8;
        let currentReqSpan = 0;
        const acceptedItems = [];

        candidateItems.forEach(item => {
            const testSpan = currentReqSpan + (acceptedItems.length > 0 ? gap : 0) + item.baseW;
            if (testSpan + 2 * endPad <= wallSpan) {
                acceptedItems.push(item);
                currentReqSpan = testSpan;
            } else {
                anyCollisionWarning = true; // Dropped overflow item
            }
        });

        if (acceptedItems.length === 0) return;

        // Spacing accepted items evenly along wall
        const totalItemW = acceptedItems.reduce((acc, item) => acc + item.baseW, 0);
        const remainingSpace = wallSpan - totalItemW;
        const actualGap = remainingSpace / (acceptedItems.length + 1);

        let currX = -wallSpan / 2 + actualGap;

        acceptedItems.forEach(item => {
            const itemW = item.baseW; // Full standard size
            const posInWall = currX + itemW / 2;
            currX += itemW + actualGap;

            let px = 0, py = 0, pz = 0, rotY = 0;
            const offset = 0.3;

            if (side === 'front') {
                px = posInWall; pz = L / 2 + offset; rotY = 0; py = item.h / 2 + 0.5;
            } else if (side === 'back') {
                px = posInWall; pz = -L / 2 - offset; rotY = Math.PI; py = item.h / 2 + 0.5;
            } else if (side === 'left') {
                px = -W / 2 - offset; pz = posInWall; rotY = -Math.PI / 2; py = item.h / 2 + 0.5;
            } else if (side === 'right') {
                px = W / 2 + offset; pz = posInWall; rotY = Math.PI / 2; py = item.h / 2 + 0.5;
            }

            if (item.type === 'window') {
                py = H * 0.55 + 0.5;
            }

            const group = new THREE.Group();
            group.position.set(px, py, pz);
            group.rotation.y = rotY;

            if (item.type === 'garage') {
                // Outer Frame
                const frameGeo = new THREE.BoxGeometry(itemW + 0.6, item.h + 0.3, 0.4);
                const frame = new THREE.Mesh(frameGeo, trimMat);
                group.add(frame);

                // Inner Door Panel
                const doorGeo = new THREE.BoxGeometry(itemW, item.h, 0.3);
                const doorMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.3, metalness: 0.1 });
                const door = new THREE.Mesh(doorGeo, doorMat);
                door.position.z = 0.08;
                group.add(door);

                // Horizontal Slat Reliefs
                for (let s = 1; s < 4; s++) {
                    const lineGeo = new THREE.BoxGeometry(itemW - 0.2, 0.1, 0.35);
                    const line = new THREE.Mesh(lineGeo, trimMat);
                    line.position.set(0, (item.h / 4) * s - item.h / 2, 0.1);
                    group.add(line);
                }

                // Double Door Center Seam Divider (for 16' Double Garage Bays)
                if (item.isDouble) {
                    const centerLineGeo = new THREE.BoxGeometry(0.12, item.h - 0.2, 0.35);
                    const centerLine = new THREE.Mesh(centerLineGeo, trimMat);
                    centerLine.position.set(0, 0, 0.1);
                    group.add(centerLine);
                }
            } else if (item.type === 'mandoor') {
                // Frame & Panel
                const frameGeo = new THREE.BoxGeometry(itemW, item.h + 0.3, 0.4);
                const frame = new THREE.Mesh(frameGeo, trimMat);
                group.add(frame);

                const panelGeo = new THREE.BoxGeometry(itemW - 0.5, item.h - 0.2, 0.3);
                const panelMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.4 });
                const panel = new THREE.Mesh(panelGeo, panelMat);
                panel.position.z = 0.08;
                group.add(panel);

                // Doorknob
                const handleGeo = new THREE.SphereGeometry(0.18, 12, 12);
                const handleMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.95 });
                const handle = new THREE.Mesh(handleGeo, handleMat);
                handle.position.set(1.1, 0, 0.25);
                group.add(handle);
            } else if (item.type === 'window') {
                // Frame
                const wFrameGeo = new THREE.BoxGeometry(itemW, item.h + 0.3, 0.4);
                const wFrame = new THREE.Mesh(wFrameGeo, trimMat);
                group.add(wFrame);

                // Glass Pane
                const glassGeo = new THREE.BoxGeometry(itemW - 0.6, item.h - 0.4, 0.2);
                const glass = new THREE.Mesh(glassGeo, glassMat);
                glass.position.z = 0.08;
                group.add(glass);

                // Window Mullions
                const mullionH = new THREE.BoxGeometry(itemW - 0.6, 0.08, 0.22);
                const mullH = new THREE.Mesh(mullionH, trimMat);
                mullH.position.z = 0.1;
                group.add(mullH);

                const mullionV = new THREE.BoxGeometry(0.08, item.h - 0.4, 0.22);
                const mullV = new THREE.Mesh(mullionV, trimMat);
                mullV.position.z = 0.1;
                group.add(mullV);
            }

            shopGroup.add(group);
        });
    });

    // Toggle Warning Banner
    const warningEl = document.getElementById('wall-warning');
    if (warningEl) {
        warningEl.style.display = anyCollisionWarning ? 'flex' : 'none';
        if (anyCollisionWarning) {
            warningEl.innerHTML = '⚠️ Wall Capacity Exceeded: Opening(s) removed to fit wall without overlap.';
        }
    }

    // Update Stats Display
    updateStats();
}

function renderItemLists() {
    // 1. Garage Bays (with Side & Size Selectors)
    const gContainer = document.getElementById('garage-items-list');
    const gBadge = document.getElementById('val-garage-count');
    if (gBadge) gBadge.textContent = shopState.garageDoorsList.length;
    if (gContainer) {
        gContainer.innerHTML = '';
        shopState.garageDoorsList.forEach((item, idx) => {
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <span class="item-row-title">Bay #${idx + 1}</span>
                <select class="item-row-select" data-type="garage" data-index="${idx}">
                    <option value="front" ${item.side === 'front' ? 'selected' : ''}>Front Wall</option>
                    <option value="back" ${item.side === 'back' ? 'selected' : ''}>Back Wall</option>
                    <option value="left" ${item.side === 'left' ? 'selected' : ''}>Left Wall</option>
                    <option value="right" ${item.side === 'right' ? 'selected' : ''}>Right Wall</option>
                </select>
                <select class="item-row-size-select" data-type="garage-size" data-index="${idx}">
                    <option value="10" ${item.size === 10 ? 'selected' : ''}>Single (10')</option>
                    <option value="16" ${item.size === 16 ? 'selected' : ''}>Double (16')</option>
                </select>
                <button type="button" class="item-delete-btn" data-type="garage" data-index="${idx}" title="Remove Bay">&times;</button>
            `;
            gContainer.appendChild(row);
        });
    }

    // 2. Man Doors
    const mContainer = document.getElementById('mandoor-items-list');
    const mBadge = document.getElementById('val-mandoor-count');
    if (mBadge) mBadge.textContent = shopState.manDoorsList.length;
    if (mContainer) {
        mContainer.innerHTML = '';
        shopState.manDoorsList.forEach((item, idx) => {
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <span class="item-row-title">Door #${idx + 1}</span>
                <select class="item-row-select" data-type="mandoor" data-index="${idx}">
                    <option value="front" ${item.side === 'front' ? 'selected' : ''}>Front Wall</option>
                    <option value="back" ${item.side === 'back' ? 'selected' : ''}>Back Wall</option>
                    <option value="left" ${item.side === 'left' ? 'selected' : ''}>Left Wall</option>
                    <option value="right" ${item.side === 'right' ? 'selected' : ''}>Right Wall</option>
                </select>
                <button type="button" class="item-delete-btn" data-type="mandoor" data-index="${idx}" title="Remove Door">&times;</button>
            `;
            mContainer.appendChild(row);
        });
    }

    // 3. Windows
    const wContainer = document.getElementById('window-items-list');
    const wBadge = document.getElementById('val-window-count');
    if (wBadge) wBadge.textContent = shopState.windowsList.length;
    if (wContainer) {
        wContainer.innerHTML = '';
        shopState.windowsList.forEach((item, idx) => {
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <span class="item-row-title">Window #${idx + 1}</span>
                <select class="item-row-select" data-type="window" data-index="${idx}">
                    <option value="front" ${item.side === 'front' ? 'selected' : ''}>Front Wall</option>
                    <option value="back" ${item.side === 'back' ? 'selected' : ''}>Back Wall</option>
                    <option value="left" ${item.side === 'left' ? 'selected' : ''}>Left Wall</option>
                    <option value="right" ${item.side === 'right' ? 'selected' : ''}>Right Wall</option>
                </select>
                <button type="button" class="item-delete-btn" data-type="window" data-index="${idx}" title="Remove Window">&times;</button>
            `;
            wContainer.appendChild(row);
        });
    }

    // Attach listeners to dynamic elements
    document.querySelectorAll('.item-row-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
            const type = e.target.dataset.type;
            const idx = parseInt(e.target.dataset.index);
            const side = e.target.value;
            if (type === 'garage') shopState.garageDoorsList[idx].side = side;
            if (type === 'mandoor') shopState.manDoorsList[idx].side = side;
            if (type === 'window') shopState.windowsList[idx].side = side;
            buildShop();
            focusCameraOnSide(side);
        });
    });

    document.querySelectorAll('.item-row-size-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index);
            const size = parseInt(e.target.value);
            shopState.garageDoorsList[idx].size = size;
            buildShop();
        });
    });

    document.querySelectorAll('.item-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            const idx = parseInt(e.target.dataset.index);
            if (type === 'garage') shopState.garageDoorsList.splice(idx, 1);
            if (type === 'mandoor') shopState.manDoorsList.splice(idx, 1);
            if (type === 'window') shopState.windowsList.splice(idx, 1);
            renderItemLists();
            buildShop();
        });
    });

    // Sync legacy numbers
    shopState.garageDoors = shopState.garageDoorsList.length;
    shopState.manDoors = shopState.manDoorsList.length;
    shopState.windows = shopState.windowsList.length;
}

function focusCameraOnSide(side) {
    if (!camera || !controls) return;
    const L = shopState.length;
    const W = shopState.width;
    const H = shopState.height;
    const dist = Math.max(W, L) * 1.4 + 15;

    let targetCamX = 0, targetCamY = H + 12, targetCamZ = 0;

    if (side === 'front') {
        targetCamX = 0; targetCamZ = dist;
    } else if (side === 'back') {
        targetCamX = 0; targetCamZ = -dist;
    } else if (side === 'left') {
        targetCamX = -dist; targetCamZ = 0;
    } else if (side === 'right') {
        targetCamX = dist; targetCamZ = 0;
    } else if (side === 'both') {
        targetCamX = -dist * 0.75; targetCamZ = dist * 0.75;
    }

    camera.position.set(targetCamX, targetCamY, targetCamZ);
    controls.target.set(0, H / 2, 0);
    controls.update();
}

function updateStats() {
    const sqft = shopState.length * shopState.width;
    const wallArea = 2 * (shopState.length * shopState.height) + 2 * (shopState.width * shopState.height);
    const pitchRatio = shopState.pitch / 12;
    const peakHeight = shopState.height + (shopState.width / 2) * pitchRatio;

    const elSqft = document.getElementById('stat-sqft');
    const elWall = document.getElementById('stat-wall-area');
    const elEave = document.getElementById('stat-eave');
    const elPeak = document.getElementById('stat-peak');

    if (elSqft) elSqft.textContent = `${sqft.toLocaleString()} sq ft`;
    if (elWall) elWall.textContent = `${Math.round(wallArea).toLocaleString()} sq ft`;
    if (elEave) elEave.textContent = `${shopState.height}'`;
    if (elPeak) elPeak.textContent = `${Math.round(peakHeight)}'`;
}

function onWindowResize() {
    const container = document.getElementById('viewport-container');
    if (!container || !renderer || !camera) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function sideCounts(list, isGarage = false) {
    const counts = { front: [], back: [], left: [], right: [] };
    list.forEach(i => {
        if (counts[i.side] !== undefined) {
            const desc = isGarage ? (i.size === 16 ? "Double 16'" : "Single 10'") : "";
            counts[i.side].push(desc);
        }
    });
    const parts = [];
    ['front', 'back', 'left', 'right'].forEach(side => {
        if (counts[side].length > 0) {
            const name = side.charAt(0).toUpperCase() + side.slice(1);
            if (isGarage) {
                const sCount = counts[side].filter(d => d.includes('Single')).length;
                const dCount = counts[side].filter(d => d.includes('Double')).length;
                const details = [];
                if (sCount > 0) details.push(`${sCount}x Single 10'`);
                if (dCount > 0) details.push(`${dCount}x Double 16'`);
                parts.push(`${name} Wall (${details.join(', ')})`);
            } else {
                parts.push(`${name} Wall (${counts[side].length})`);
            }
        }
    });
    return parts.length > 0 ? parts.join(' | ') : 'None';
}

// Bind UI Listeners
function bindUIEvents() {
    // Dimension Sliders
    const lengthInput = document.getElementById('input-length');
    if (lengthInput) {
        const updateLen = (e) => {
            shopState.length = parseInt(e.target.value);
            document.getElementById('val-length').textContent = `${shopState.length}'`;
            buildShop();
        };
        lengthInput.addEventListener('input', updateLen);
        lengthInput.addEventListener('change', updateLen);
    }

    const widthInput = document.getElementById('input-width');
    if (widthInput) {
        const updateWidth = (e) => {
            shopState.width = parseInt(e.target.value);
            document.getElementById('val-width').textContent = `${shopState.width}'`;
            buildShop();
        };
        widthInput.addEventListener('input', updateWidth);
        widthInput.addEventListener('change', updateWidth);
    }

    const heightInput = document.getElementById('input-height');
    if (heightInput) {
        const updateH = (e) => {
            shopState.height = parseInt(e.target.value);
            document.getElementById('val-height').textContent = `${shopState.height}'`;
            buildShop();
        };
        heightInput.addEventListener('input', updateH);
        heightInput.addEventListener('change', updateH);
    }

    const pitchInput = document.getElementById('input-pitch');
    if (pitchInput) {
        const updatePitch = (e) => {
            shopState.pitch = parseInt(e.target.value);
            document.getElementById('val-pitch').textContent = `${shopState.pitch}/12`;
            buildShop();
        };
        pitchInput.addEventListener('input', updatePitch);
        pitchInput.addEventListener('change', updatePitch);
    }

    // Plus / Minus Button Controls
    document.getElementById('btn-add-garage')?.addEventListener('click', () => {
        shopState.garageDoorsList.push({ id: Date.now(), side: 'front', size: 10 });
        renderItemLists();
        buildShop();
        focusCameraOnSide('front');
    });

    document.getElementById('btn-sub-garage')?.addEventListener('click', () => {
        if (shopState.garageDoorsList.length > 0) {
            shopState.garageDoorsList.pop();
            renderItemLists();
            buildShop();
        }
    });

    document.getElementById('btn-add-mandoor')?.addEventListener('click', () => {
        shopState.manDoorsList.push({ id: Date.now(), side: 'right' });
        renderItemLists();
        buildShop();
        focusCameraOnSide('right');
    });

    document.getElementById('btn-sub-mandoor')?.addEventListener('click', () => {
        if (shopState.manDoorsList.length > 0) {
            shopState.manDoorsList.pop();
            renderItemLists();
            buildShop();
        }
    });

    document.getElementById('btn-add-window')?.addEventListener('click', () => {
        shopState.windowsList.push({ id: Date.now(), side: 'left' });
        renderItemLists();
        buildShop();
        focusCameraOnSide('left');
    });

    document.getElementById('btn-sub-window')?.addEventListener('click', () => {
        if (shopState.windowsList.length > 0) {
            shopState.windowsList.pop();
            renderItemLists();
            buildShop();
        }
    });

    // Style Buttons
    const styleBtns = document.querySelectorAll('.type-btn');
    styleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            styleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            shopState.style = btn.dataset.style;
            buildShop();
        });
    });

    // Color Swatches
    const sidingSwatches = document.querySelectorAll('.siding-swatch');
    sidingSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            sidingSwatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            shopState.sidingColor = parseInt(swatch.dataset.color, 16);
            shopState.sidingName = swatch.dataset.name;
            buildShop();
        });
    });

    const roofSwatches = document.querySelectorAll('.roof-swatch');
    roofSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            roofSwatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            shopState.roofColor = parseInt(swatch.dataset.color, 16);
            shopState.roofName = swatch.dataset.name;
            buildShop();
        });
    });

    // Viewport Controls
    const resetCamBtn = document.getElementById('btn-reset-cam');
    if (resetCamBtn) {
        resetCamBtn.addEventListener('click', () => {
            camera.position.set(55, 35, 65);
            controls.target.set(0, 7, 0);
            controls.update();
        });
    }

    const topViewBtn = document.getElementById('btn-top-view');
    if (topViewBtn) {
        topViewBtn.addEventListener('click', () => {
            camera.position.set(0, 90, 0.1);
            controls.target.set(0, 0, 0);
            controls.update();
        });
    }

    // Modal Events
    const openModalBtn = document.getElementById('btn-open-inquiry');
    const disclaimerModalLink = document.getElementById('link-disclaimer-modal');
    const modal = document.getElementById('inquiry-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');

    if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', () => {
            populateModalSummary();
            modal.classList.add('open');
        });
    }

    if (disclaimerModalLink && modal) {
        disclaimerModalLink.addEventListener('click', (e) => {
            e.preventDefault();
            populateModalSummary();
            modal.classList.add('open');
        });
    }

    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('open');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('open');
            }
        });
    }

    // Send Inquiry Button
    const sendInquiryBtn = document.getElementById('btn-send-inquiry');
    if (sendInquiryBtn) {
        sendInquiryBtn.addEventListener('click', sendCADInquiry);
    }

    const copySpecsBtn = document.getElementById('btn-copy-specs');
    if (copySpecsBtn) {
        copySpecsBtn.addEventListener('click', copySpecsToClipboard);
    }
}

function getFormattedSummaryText() {
    const sqft = shopState.length * shopState.width;
    const styleCap = shopState.style.toUpperCase();
    return `=== DESIGN SOLUTIONS 3D SHOP CONFIGURATION SUMMARY ===
• Style: ${styleCap} Shop / Outbuilding
• Dimensions: ${shopState.length}' L x ${shopState.width}' W x ${shopState.height}' Wall Height
• Total Footprint: ${sqft.toLocaleString()} Sq. Ft.
• Roof Pitch: ${shopState.pitch}/12
• Siding Color: ${shopState.sidingName}
• Roof Color: ${shopState.roofName}
• Overhead Garage Bays: ${shopState.garageDoorsList.length} Bays [${sideCounts(shopState.garageDoorsList, true)}]
• Man Entry Doors: ${shopState.manDoorsList.length} Doors [${sideCounts(shopState.manDoorsList)}]
• Windows: ${shopState.windowsList.length} Windows [${sideCounts(shopState.windowsList)}]
=========================================================`;
}

function populateModalSummary() {
    const summaryBox = document.getElementById('modal-specs-summary');
    if (!summaryBox) return;

    const sqft = shopState.length * shopState.width;
    summaryBox.innerHTML = `
        <div class="specs-summary-grid">
            <div class="specs-summary-item"><span>Dimensions:</span> <span>${shopState.length}' x ${shopState.width}' x ${shopState.height}'</span></div>
            <div class="specs-summary-item"><span>Footprint:</span> <span>${sqft.toLocaleString()} sq ft</span></div>
            <div class="specs-summary-item"><span>Roof Pitch:</span> <span>${shopState.pitch}/12 (${shopState.style})</span></div>
            <div class="specs-summary-item"><span>Siding:</span> <span>${shopState.sidingName}</span></div>
            <div class="specs-summary-item"><span>Roof Finish:</span> <span>${shopState.roofName}</span></div>
            <div class="specs-summary-item"><span>Garage Bays:</span> <span>${shopState.garageDoorsList.length} Bays [${sideCounts(shopState.garageDoorsList, true)}]</span></div>
            <div class="specs-summary-item"><span>Man Doors:</span> <span>${shopState.manDoorsList.length} Doors [${sideCounts(shopState.manDoorsList)}]</span></div>
            <div class="specs-summary-item"><span>Windows:</span> <span>${shopState.windowsList.length} Windows [${sideCounts(shopState.windowsList)}]</span></div>
        </div>
    `;
}

function sendCADInquiry() {
    const name = document.getElementById('user-name')?.value || 'Valued Client';
    const email = document.getElementById('user-email')?.value || '';
    const phone = document.getElementById('user-phone')?.value || '';
    const location = document.getElementById('user-location')?.value || '';
    const notes = document.getElementById('user-notes')?.value || '';

    const summary = getFormattedSummaryText();
    const subject = encodeURIComponent(`CAD Blueprint Request for ${shopState.length}x${shopState.width} Shop - ${name}`);
    
    const bodyText = `Hello Rob & Design Solutions Team,

I have customized a shop building using your 3D Shop Configurator and would like to request custom CAD drawings & blueprint pricing.

CLIENT DETAILS:
Name: ${name}
Email: ${email}
Phone: ${phone}
Project Location: ${location}

CONFIGURATION SPECIFICATIONS:
${summary}

ADDITIONAL NOTES:
${notes || 'None provided.'}

Thank you!`;

    const mailtoUrl = `mailto:designguyrob@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;

    showToast('Inquiry pre-filled in your email client!');
}

function copySpecsToClipboard() {
    const text = getFormattedSummaryText();
    navigator.clipboard.writeText(text).then(() => {
        showToast('Configuration specs copied to clipboard!');
    }).catch(() => {
        showToast('Failed to copy. Please copy manually.');
    });
}

function showToast(msg) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    init3D();
    bindUIEvents();
});
