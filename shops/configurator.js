import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

// Configuration State
const shopState = {
    length: 40,    // feet
    width: 30,     // feet
    height: 14,    // feet
    pitch: 4,      // X / 12
    style: 'gable', // gable, monoslope, gambrel
    sidingColor: 0x2D3748,
    sidingName: 'Slate Charcoal',
    roofColor: 0x1A202C,
    roofName: 'Matte Black',
    trimColor: 0xFFFFFF,
    garageDoors: 2,
    garageDoorSize: 10, // 10ft x 10ft
    manDoors: 1,
    windows: 2
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

    // Build Initial Shop
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

    // 3. Roof Construction
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
        const roofAngle = Math.atan2(roofPeakHeight, W / 2);

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
        // Monoslope / Lean-To Roof
        const eaveOverhang = 1.2;
        const monoHeight = roofPeakHeight * 1.5;
        
        // Single Slope Roof Panel
        const monoSlopeLen = Math.sqrt(Math.pow(W + eaveOverhang * 2, 2) + Math.pow(monoHeight, 2));
        const monoAngle = Math.atan2(monoHeight, W);

        const roofMonoGeo = new THREE.BoxGeometry(monoSlopeLen, 0.3, L + eaveOverhang * 2);
        const roofMono = new THREE.Mesh(roofMonoGeo, roofMat);
        roofMono.position.set(0, H + 0.5 + monoHeight / 2, 0);
        roofMono.rotation.z = -monoAngle;
        roofMono.castShadow = true;
        shopGroup.add(roofMono);

    } else if (shopState.style === 'gambrel') {
        // Barn Gambrel Style Roof
        const eaveOverhang = 1.2;
        const gGeoLeft = new THREE.BoxGeometry(W/2 + eaveOverhang, 0.3, L + eaveOverhang*2);
        const gLeft = new THREE.Mesh(gGeoLeft, roofMat);
        gLeft.position.set(-W/4, H + 0.5 + roofPeakHeight*0.7, 0);
        gLeft.rotation.z = Math.PI / 6;
        gLeft.castShadow = true;
        shopGroup.add(gLeft);

        const gRight = new THREE.Mesh(gGeoLeft, roofMat);
        gRight.position.set(W/4, H + 0.5 + roofPeakHeight*0.7, 0);
        gRight.rotation.z = -Math.PI / 6;
        gRight.castShadow = true;
        shopGroup.add(gRight);
    }

    // 4. Garage Doors (Front Wall L/2)
    const numGarage = shopState.garageDoors;
    const gWidth = shopState.garageDoorSize;
    const gHeight = Math.min(shopState.garageDoorSize, H - 2);

    if (numGarage > 0) {
        const spacing = W / (numGarage + 1);
        for (let i = 1; i <= numGarage; i++) {
            const gx = -W / 2 + spacing * i;
            
            // Door Frame
            const frameGeo = new THREE.BoxGeometry(gWidth + 0.6, gHeight + 0.3, 0.3);
            const frame = new THREE.Mesh(frameGeo, trimMat);
            frame.position.set(gx, gHeight / 2 + 0.5, L / 2 + 0.1);
            shopGroup.add(frame);

            // Door Panel
            const doorGeo = new THREE.BoxGeometry(gWidth, gHeight, 0.2);
            const doorMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.4 });
            const door = new THREE.Mesh(doorGeo, doorMat);
            door.position.set(gx, gHeight / 2 + 0.5, L / 2 + 0.15);
            shopGroup.add(door);

            // Panel Slats (details)
            for (let s = 1; s < 4; s++) {
                const lineGeo = new THREE.BoxGeometry(gWidth - 0.2, 0.08, 0.25);
                const line = new THREE.Mesh(lineGeo, trimMat);
                line.position.set(gx, (gHeight / 4) * s + 0.5, L / 2 + 0.16);
                shopGroup.add(line);
            }
        }
    }

    // 5. Entry Man Doors (Side Wall)
    if (shopState.manDoors > 0) {
        for (let i = 0; i < shopState.manDoors; i++) {
            const mZ = -L / 4 + i * (L / 2);
            const mGeo = new THREE.BoxGeometry(0.2, 7, 3.5);
            const mDoor = new THREE.Mesh(mGeo, trimMat);
            mDoor.position.set(W / 2 + 0.1, 4, mZ);
            shopGroup.add(mDoor);
        }
    }

    // 6. Glass Windows (Side Wall -W/2)
    if (shopState.windows > 0) {
        const winSpacing = L / (shopState.windows + 1);
        for (let i = 1; i <= shopState.windows; i++) {
            const wZ = -L / 2 + winSpacing * i;

            // Frame
            const wFrameGeo = new THREE.BoxGeometry(0.3, 4, 4);
            const wFrame = new THREE.Mesh(wFrameGeo, trimMat);
            wFrame.position.set(-W / 2 - 0.1, H / 2 + 0.5, wZ);
            shopGroup.add(wFrame);

            // Glass Pane
            const glassGeo = new THREE.BoxGeometry(0.1, 3.6, 3.6);
            const glass = new THREE.Mesh(glassGeo, glassMat);
            glass.position.set(-W / 2 - 0.12, H / 2 + 0.5, wZ);
            shopGroup.add(glass);
        }
    }

    // Update Stats Display
    updateStats();
}

function updateStats() {
    const sqft = shopState.length * shopState.width;
    const wallArea = 2 * (shopState.length * shopState.height) + 2 * (shopState.width * shopState.height);
    const pitchRatio = shopState.pitch / 12;
    const peakHeight = shopState.height + (shopState.width / 2) * pitchRatio;

    document.getElementById('stat-sqft').textContent = `${sqft.toLocaleString()} sq ft`;
    document.getElementById('stat-wall-area').textContent = `${Math.round(wallArea).toLocaleString()} sq ft`;
    document.getElementById('stat-eave').textContent = `${shopState.height}'`;
    document.getElementById('stat-peak').textContent = `${Math.round(peakHeight)}'`;
}

function onWindowResize() {
    const container = document.getElementById('viewport-container');
    if (!container || !renderer || !camera) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Bind UI Listeners
function bindUIEvents() {
    // Dimension Sliders
    const lengthInput = document.getElementById('input-length');
    if (lengthInput) {
        lengthInput.addEventListener('input', (e) => {
            shopState.length = parseInt(e.target.value);
            document.getElementById('val-length').textContent = `${shopState.length}'`;
            buildShop();
        });
    }

    const widthInput = document.getElementById('input-width');
    if (widthInput) {
        widthInput.addEventListener('input', (e) => {
            shopState.width = parseInt(e.target.value);
            document.getElementById('val-width').textContent = `${shopState.width}'`;
            buildShop();
        });
    }

    const heightInput = document.getElementById('input-height');
    if (heightInput) {
        heightInput.addEventListener('input', (e) => {
            shopState.height = parseInt(e.target.value);
            document.getElementById('val-height').textContent = `${shopState.height}'`;
            buildShop();
        });
    }

    const pitchInput = document.getElementById('input-pitch');
    if (pitchInput) {
        pitchInput.addEventListener('input', (e) => {
            shopState.pitch = parseInt(e.target.value);
            document.getElementById('val-pitch').textContent = `${shopState.pitch}/12`;
            buildShop();
        });
    }

    // Door & Window Selectors
    const garageInput = document.getElementById('input-garage');
    if (garageInput) {
        garageInput.addEventListener('change', (e) => {
            shopState.garageDoors = parseInt(e.target.value);
            buildShop();
        });
    }

    const manDoorInput = document.getElementById('input-mandoor');
    if (manDoorInput) {
        manDoorInput.addEventListener('change', (e) => {
            shopState.manDoors = parseInt(e.target.value);
            buildShop();
        });
    }

    const windowInput = document.getElementById('input-windows');
    if (windowInput) {
        windowInput.addEventListener('change', (e) => {
            shopState.windows = parseInt(e.target.value);
            buildShop();
        });
    }

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
    const modal = document.getElementById('inquiry-modal');
    const closeModalBtn = document.getElementById('btn-close-modal');

    if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', () => {
            populateModalSummary();
            modal.classList.add('open');
        });
    }

    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('open');
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
• Overhead Garage Doors: ${shopState.garageDoors} Bays (${shopState.garageDoorSize}'x${shopState.garageDoorSize}')
• Man Entry Doors: ${shopState.manDoors}
• Windows: ${shopState.windows}
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
            <div class="specs-summary-item"><span>Doors / Windows:</span> <span>${shopState.garageDoors} Garage, ${shopState.manDoors} Man, ${shopState.windows} Win</span></div>
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
