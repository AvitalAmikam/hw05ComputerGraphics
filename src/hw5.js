import { OrbitControls } from './OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
scene.background = new THREE.Color(0x000000);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(10, 20, 15);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -25;
directionalLight.shadow.camera.right = 25;
directionalLight.shadow.camera.top = 25;
directionalLight.shadow.camera.bottom = -25;
scene.add(directionalLight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

function createCourtLines() {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    function createLine(x1, y1, z1, x2, y2, z2) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, y1, z1),
            new THREE.Vector3(x2, y2, z2)
        ]);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
    }

    // Center line and circle
    const centerLineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.11, -7.5),
        new THREE.Vector3(0, 0.11, 7.5),
    ]);
    const centerLine = new THREE.Line(centerLineGeometry, lineMaterial);
    scene.add(centerLine);

    const circleGeometry = new THREE.CircleGeometry(1.8, 64);
    const circleEdges = new THREE.EdgesGeometry(circleGeometry);
    const centerCircle = new THREE.LineSegments(circleEdges, lineMaterial);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.y = 0.11;
    scene.add(centerCircle);

    // Three-point arcs
    function createThreePointArc(x, flip = false) {
        const shape = new THREE.Shape();
        shape.absarc(0, 0, 6.75, -Math.PI / 2, Math.PI / 2, flip);
        const points = shape.getPoints(100);
        const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0.11, p.y)));
        const arc = new THREE.Line(geometry, lineMaterial);
        arc.position.x = x;
        scene.add(arc);
    }

    createThreePointArc(-13);
    createThreePointArc(13, true);

    // Free throw areas (key/paint)
    createLine(-15, 0.11, -2.9, -10.2, 0.11, -2.9);
    createLine(-15, 0.11, 2.9, -10.2, 0.11, 2.9);
    createLine(-10.2, 0.11, -2.9, -10.2, 0.11, 2.9);
    
    createLine(15, 0.11, -2.9, 10.2, 0.11, -2.9);
    createLine(15, 0.11, 2.9, 10.2, 0.11, 2.9);
    createLine(10.2, 0.11, -2.9, 10.2, 0.11, 2.9);

    // Free throw circles
    const freeThrowCircleGeometry = new THREE.CircleGeometry(1.8, 64);
    const freeThrowCircleEdges = new THREE.EdgesGeometry(freeThrowCircleGeometry);
    
    const leftFreeThrowCircle = new THREE.LineSegments(freeThrowCircleEdges, lineMaterial);
    leftFreeThrowCircle.rotation.x = -Math.PI / 2;
    leftFreeThrowCircle.position.set(-10.2, 0.11, 0);
    scene.add(leftFreeThrowCircle);
    
    const rightFreeThrowCircle = new THREE.LineSegments(freeThrowCircleEdges, lineMaterial);
    rightFreeThrowCircle.rotation.x = -Math.PI / 2;
    rightFreeThrowCircle.position.set(10.2, 0.11, 0);
    scene.add(rightFreeThrowCircle);
}

function createBasketballHoop(x) {
    // Base and pole
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.2),
        new THREE.MeshPhongMaterial({ color: 0x333333 })
    );
    base.position.set(x, 0.1, 0);
    base.castShadow = true;
    scene.add(base);

    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 9.048),
        new THREE.MeshPhongMaterial({ color: 0x444444 })
    );
    pole.position.set(x, 4.524, 0);
    pole.castShadow = true;
    scene.add(pole);

    // Backboard and arm
    const backboard = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 2.5, 4),
        new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    );
    backboard.position.set(x + (x < 0 ? 0.6 : -0.6), 9.048, 0);
    backboard.castShadow = true;
    backboard.receiveShadow = true;
    scene.add(backboard);

    const arm = new THREE.Mesh(
        new THREE.BoxGeometry(Math.abs(0.6), 0.15, 0.15),
        new THREE.MeshPhongMaterial({ color: 0x444444 })
    );
    arm.position.set(x + (x < 0 ? 0.3 : -0.3), 9.048, 0);
    arm.castShadow = true;
    scene.add(arm);

    // Rim and net
    const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.45, 0.04, 8, 16),
        new THREE.MeshPhongMaterial({ color: 0xff6600 })
    );
    rim.position.set(x + (x < 0 ? 1.1 : -1.1), 9.048, 0);
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;
    scene.add(rim);

    const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x1 = rim.position.x + 0.42 * Math.cos(angle);
        const z1 = rim.position.z + 0.42 * Math.sin(angle);
        const x2 = rim.position.x + 0.2 * Math.cos(angle);
        const z2 = rim.position.z + 0.2 * Math.sin(angle);

        const netGeom = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, rim.position.y, z1),
            new THREE.Vector3(x2, rim.position.y - 0.8, z2),
        ]);
        const netLine = new THREE.Line(netGeom, netMaterial);
        scene.add(netLine);
    }
}

function createBasketball() {
    const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 32, 32),
        new THREE.MeshPhongMaterial({ color: 0xff7700, shininess: 10 })
    );
    ball.position.set(0, 3.5, 0);
    ball.castShadow = true;
    scene.add(ball);

    // Basketball seam lines
    const seamMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 6 });

    for (let curveIndex = 0; curveIndex < 3; curveIndex++) {
        const curvePoints = [];
        for (let i = 0; i <= 32; i++) {
            const t = (i / 32) * Math.PI * 2;
            let x, y, z;
            
            if (curveIndex === 0) {
                x = Math.cos(t) * 0.82;
                y = Math.sin(t * 0.5) * 0.3;
                z = Math.sin(t) * 0.82;
            } else if (curveIndex === 1) {
                x = Math.sin(t * 0.5) * 0.3;
                y = Math.cos(t) * 0.82;
                z = Math.sin(t) * 0.82;
            } else {
                x = Math.cos(t) * 0.82;
                y = -Math.sin(t * 0.5) * 0.3;
                z = Math.sin(t) * 0.82;
            }
            
            curvePoints.push(new THREE.Vector3(x, y, z));
        }
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const curve = new THREE.Line(curveGeometry, seamMaterial);
        curve.position.copy(ball.position);
        scene.add(curve);
    }
}

function createUIContainers() {
    const scoreContainer = document.createElement('div');
    scoreContainer.id = 'score-display';
    Object.assign(scoreContainer.style, {
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px'
    });
    scoreContainer.innerHTML = '<div>Score: 0</div>';
    document.body.appendChild(scoreContainer);
}

function createBleachers(xPos, zPos, width, height, depth, numRows, color) {
    const bleacherGroup = new THREE.Group();
    const stepHeight = height / numRows;
    const stepDepth = depth / numRows;

    for (let i = 0; i < numRows; i++) {
        const currentHeight = (i + 0.5) * stepHeight;
        const currentDepth = zPos > 0 ? (i + 0.5) * stepDepth : -(i + 0.5) * stepDepth;

        const bleacher = new THREE.Mesh(
            new THREE.BoxGeometry(width, stepHeight, stepDepth * 1.5),
            new THREE.MeshPhongMaterial({ color: color, shininess: 30 })
        );
        bleacher.position.set(xPos, currentHeight, zPos + currentDepth);
        bleacher.castShadow = true;
        bleacher.receiveShadow = true;
        bleacherGroup.add(bleacher);
    }
    return bleacherGroup;
}

function createScoreboard(xPos, yPos, zPos, width, height, thickness) {
    const scoreboardGroup = new THREE.Group();

    // Main frame
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, thickness),
        new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 10 })
    );
    frame.castShadow = true;
    frame.receiveShadow = true;
    scoreboardGroup.add(frame);

    // Suspension cables
    const cableMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    
    [-width/3, width/3].forEach(xOffset => {
        const cable = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 8),
            cableMaterial
        );
        cable.position.set(xOffset, height/2 + 4, 0);
        cable.castShadow = true;
        scoreboardGroup.add(cable);
    });

    // Text displays
    const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textConfigs = [
            { text: '85', size: 0.8, color: 0x00ff00, x: -width * 0.3, y: 0.2, z: thickness/2 + 0.01, align: 'center' },
            { text: 'HOME', size: 0.3, color: 0x00ff00, x: -width * 0.3, y: -0.3, z: thickness/2 + 0.01, align: 'center' },
            { text: '92', size: 0.8, color: 0x00ff00, x: width * 0.3, y: 0.2, z: thickness/2 + 0.01, align: 'center' },
            { text: 'GUEST', size: 0.3, color: 0x00ff00, x: width * 0.3, y: -0.3, z: thickness/2 + 0.01, align: 'center' },
            { text: '00:00', size: 0.4, color: 0xff6600, x: 0, y: 0.3, z: thickness/2 + 0.01, align: 'center' },
            { text: '4TH', size: 0.3, color: 0xffff00, x: 0, y: -0.3, z: thickness/2 + 0.01, align: 'center' }
        ];

        textConfigs.forEach(config => {
            // Front side
            const frontGeo = new THREE.TextGeometry(config.text, {
                font: font, size: config.size, height: 0.02, curveSegments: 8
            });
            frontGeo.computeBoundingBox();
            const frontMesh = new THREE.Mesh(frontGeo, new THREE.MeshPhongMaterial({ color: config.color }));
            const textWidth = frontGeo.boundingBox.max.x - frontGeo.boundingBox.min.x;
            frontMesh.position.set(config.x - textWidth/2, config.y, config.z);
            scoreboardGroup.add(frontMesh);

            // Back side
            const backGeo = new THREE.TextGeometry(config.text, {
                font: font, size: config.size, height: 0.02, curveSegments: 8
            });
            backGeo.computeBoundingBox();
            const backMesh = new THREE.Mesh(backGeo, new THREE.MeshPhongMaterial({ color: config.color }));
            const backTextWidth = backGeo.boundingBox.max.x - backGeo.boundingBox.min.x;
            backMesh.position.set(config.x + backTextWidth/2, config.y, -thickness/2 - 0.01);
            backMesh.rotation.y = Math.PI;
            scoreboardGroup.add(backMesh);
        });
    });

    scoreboardGroup.position.set(xPos, yPos, zPos);
    return scoreboardGroup;
}

function createBasketballCourt() {
    // Court floor
    const court = new THREE.Mesh(
        new THREE.BoxGeometry(30, 0.2, 15),
        new THREE.MeshPhongMaterial({ color: 0xc68642, shininess: 50 })
    );
    court.receiveShadow = true;
    scene.add(court);

    createCourtLines();
    createBasketballHoop(-15);
    createBasketballHoop(15);
    createBasketball();
    createUIContainers();

    // Stadium environment
    const bleacherColor = 0x663300;
    const bleachersLeft = createBleachers(0, 9.5, 30, 5, 8, 10, bleacherColor);
    const bleachersRight = createBleachers(0, -9.5, 30, 5, 8, 10, bleacherColor);
    scene.add(bleachersLeft);
    scene.add(bleachersRight);

    const scoreboard = createScoreboard(0, 12, 0, 8, 3, 0.3);
    scene.add(scoreboard);
}

// Initialize scene
createBasketballCourt();

// Camera setup
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// UI controls display
const instructionsElement = document.createElement('div');
Object.assign(instructionsElement.style, {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    color: 'white',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '15px',
    borderRadius: '8px',
    lineHeight: '1.4'
});
instructionsElement.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #ffaa00;">Controls:</h3>
    <div>• O - Toggle orbit camera</div>
    <div>• Arrow Keys - Move ball</div>
    <div>• W/S - Adjust shot power</div>
    <div>• SPACE - Shoot ball</div>
    <div>• R - Reset ball</div>
`;
document.body.appendChild(instructionsElement);

// Event handlers
document.addEventListener('keydown', function(e) {
    if (e.key === "o" || e.key === "O") {
        isOrbitEnabled = !isOrbitEnabled;
        console.log("Orbit controls:", isOrbitEnabled ? "enabled" : "disabled");
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.enabled = isOrbitEnabled;
    controls.update();
    renderer.render(scene, camera);
}

animate();