// Main Three.js variables
let scene, camera, renderer, controls, clock;
let planets = [];
let selectedPlanet = null;
let solarSystem;
let orbitsVisible = true;
let rotationEnabled = true;
let autoRotateEnabled = false;
let animationPaused = false;
let darkMode = true;
let labels = [];
let stars;

// Configuration
const config = {
    scale: 1,
    orbitSegments: 128,
    autoRotateSpeed: 0.2,
    starCount: 2000
};

// Planet data with realistic properties
const planetData = [
    { 
        name: "Sun", 
        radius: 10, 
        color: 0xfdb813, 
        distance: 0, 
        orbitSpeed: 0, 
        rotationSpeed: 0.005,
        emissive: 0xfdb813,
        emissiveIntensity: 0.5,
        info: "The Sun is a G-type main-sequence star that contains 99.86% of the mass in the Solar System."
    },
    { 
        name: "Mercury", 
        radius: 1.5, 
        color: 0xb5b5b5, 
        distance: 24, 
        orbitSpeed: 0.04, 
        rotationSpeed: 0.004,
        info: "Mercury is the smallest and innermost planet in the Solar System, orbiting the Sun once every 88 days."
    },
    { 
        name: "Venus", 
        radius: 3.7, 
        color: 0xe6c229, 
        distance: 34, 
        orbitSpeed: 0.015, 
        rotationSpeed: 0.002,
        info: "Venus is the second planet from the Sun and is the hottest planet in the Solar System."
    },
    { 
        name: "Earth", 
        radius: 3.9, 
        color: 0x1078d1, 
        distance: 45, 
        orbitSpeed: 0.01, 
        rotationSpeed: 0.02,
        info: "Earth is the third planet from the Sun and the only astronomical object known to harbor life."
    },
    { 
        name: "Mars", 
        radius: 2.1, 
        color: 0xe27b58, 
        distance: 58, 
        orbitSpeed: 0.008, 
        rotationSpeed: 0.018,
        info: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System."
    },
    { 
        name: "Jupiter", 
        radius: 8.5, 
        color: 0xe3dccb, 
        distance: 90, 
        orbitSpeed: 0.004, 
        rotationSpeed: 0.04,
        info: "Jupiter is the fifth planet from the Sun and the largest in the Solar System."
    },
    { 
        name: "Saturn", 
        radius: 7.2, 
        color: 0xf5e3b5, 
        distance: 115, 
        orbitSpeed: 0.003, 
        rotationSpeed: 0.038,
        hasRing: true,
        ringColor: 0xc0a070,
        ringInnerRadius: 8,
        ringOuterRadius: 12,
        info: "Saturn is the sixth planet from the Sun and is known for its prominent ring system."
    },
    { 
        name: "Uranus", 
        radius: 5.0, 
        color: 0xace5ee, 
        distance: 145, 
        orbitSpeed: 0.0015, 
        rotationSpeed: 0.03,
        info: "Uranus is the seventh planet from the Sun and has the third-largest diameter in our solar system."
    },
    { 
        name: "Neptune", 
        radius: 4.9, 
        color: 0x5b5ddf, 
        distance: 165, 
        orbitSpeed: 0.001, 
        rotationSpeed: 0.032,
        info: "Neptune is the eighth and most distant planet from the Sun in the Solar System."
    }
];

// Initialize the application
function init() {
    // Create clock for consistent animation timing
    clock = new THREE.Clock();
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        60, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        2000
    );
    camera.position.set(0, 50, 180);
    
    // Create renderer with antialiasing
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 30;
    controls.maxDistance = 500;
    controls.autoRotate = autoRotateEnabled;
    controls.autoRotateSpeed = config.autoRotateSpeed;
    
    // Create solar system container
    solarSystem = new THREE.Group();
    scene.add(solarSystem);
    
    // Add stars to the background
    createStars();
    
    // Add lighting
    addLights();
    
    // Create celestial bodies
    createCelestialBodies();
    
    // Create planet labels
    createLabels();
    
    // Add speed controls
    createSpeedControls();
    
    // Add event listeners
    setupEventListeners();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 500);
    }, 500);
    
    // Start animation loop
    animate();
}

// Create starfield background
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });
    
    const starsVertices = [];
    for (let i = 0; i < config.starCount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// Add lighting to the scene
function addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    // Sun light (point light)
    const sunLight = new THREE.PointLight(0xffffff, 1, 300);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);
    
    // Directional light for additional illumination
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
}

// Create planets and orbits
function createCelestialBodies() {
    planetData.forEach((data, index) => {
        // Create planet geometry and material
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: data.color,
            emissive: data.emissive || 0x000000,
            emissiveIntensity: data.emissiveIntensity || 0,
            shininess: 10,
            specular: 0x111111
        });
        
        const planet = new THREE.Mesh(geometry, material);
        planet.castShadow = true;
        planet.receiveShadow = true;
        
        // Create orbit path
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitMaterial = new THREE.LineBasicMaterial({ 
            color: 0x555555,
            transparent: true,
            opacity: 0.5
        });
        
        const points = [];
        for (let i = 0; i <= config.orbitSegments; i++) {
            const theta = (i / config.orbitSegments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(theta) * data.distance,
                0,
                Math.sin(theta) * data.distance
            ));
        }
        orbitGeometry.setFromPoints(points);
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        orbit.rotation.x = -Math.PI / 2; // Align orbits with the solar plane
        
        // Create planet container
        const planetContainer = new THREE.Group();
        planetContainer.add(planet);
        planetContainer.add(orbit);
        
        // Position the planet
        planet.position.x = data.distance;
        
        // Add random starting position
        const angle = Math.random() * Math.PI * 2;
        planetContainer.position.x = Math.cos(angle) * data.distance;
        planetContainer.position.z = Math.sin(angle) * data.distance;
        
        // Add to solar system
        solarSystem.add(planetContainer);
        
        // Add rings for Saturn
        if (data.hasRing) {
            const ringGeometry = new THREE.RingGeometry(
                data.ringInnerRadius, 
                data.ringOuterRadius, 
                64
            );
            const ringMaterial = new THREE.MeshPhongMaterial({
                color: data.ringColor,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.y = Math.PI / 4;
            planet.add(ring);
        }
        
        // Store planet data
        planets.push({
            container: planetContainer,
            planet: planet,
            orbit: orbit,
            data: data,
            angle: angle,
            baseOrbitSpeed: data.orbitSpeed,
            baseRotationSpeed: data.rotationSpeed
        });
        
        // Add interaction data
        planet.userData = {
            index: index,
            name: data.name,
            info: data.info
        };
    });
}

// Create planet labels
function createLabels() {
    const labelContainer = document.createElement('div');
    labelContainer.style.position = 'absolute';
    labelContainer.style.top = '0';
    labelContainer.style.left = '0';
    labelContainer.style.width = '100%';
    labelContainer.style.height = '100%';
    labelContainer.style.pointerEvents = 'none';
    document.body.appendChild(labelContainer);
    
    planetData.forEach((data, index) => {
        if (index === 0) return; // Skip sun
        
        const label = document.createElement('div');
        label.className = 'planet-label';
        label.textContent = data.name;
        label.id = `label-${index}`;
        labelContainer.appendChild(label);
        labels.push(label);
    });
}

// Update planet labels position
function updateLabels() {
    planets.forEach((planet, index) => {
        if (index === 0) return; // Skip sun
        
        const label = labels[index - 1];
        if (!label) return;
        
        // Get planet position in screen space
        const position = planet.planet.getWorldPosition(new THREE.Vector3());
        position.project(camera);
        
        // Convert to CSS coordinates
        const x = (position.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(position.y * 0.5) + 0.5) * window.innerHeight;
        
        // Only show label if planet is in front of camera
        const distance = position.z;
        if (distance < 1) {
            label.style.left = `${x}px`;
            label.style.top = `${y}px`;
            
            // Show label on hover
            const planetElement = planet.planet;
            if (planetElement.userData.isHovered) {
                label.style.opacity = '1';
            } else {
                label.style.opacity = '0';
            }
        } else {
            label.style.opacity = '0';
        }
    });
}

// Create speed control sliders
function createSpeedControls() {
    const container = document.getElementById('speedSliders');
    
    planetData.forEach((data, index) => {
        if (index === 0) return; // Skip sun
        
        const controlDiv = document.createElement('div');
        controlDiv.className = 'speed-control';
        
        const label = document.createElement('label');
        label.textContent = `${data.name}: `;
        label.htmlFor = `speed-${index}`;
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = `speed-${index}`;
        slider.min = '0';
        slider.max = '200';
        slider.value = '100';
        slider.step = '1';
        
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = '100%';
        valueDisplay.style.marginLeft = '5px';
        valueDisplay.style.fontSize = '12px';
        
        slider.addEventListener('input', () => {
            const percent = parseInt(slider.value);
            valueDisplay.textContent = `${percent}%`;
            
            // Update planet speed
            planets[index].data.orbitSpeed = planets[index].baseOrbitSpeed * (percent / 100);
            planets[index].data.rotationSpeed = planets[index].baseRotationSpeed * (percent / 100);
        });
        
        label.appendChild(slider);
        label.appendChild(valueDisplay);
        controlDiv.appendChild(label);
        container.appendChild(controlDiv);
    });
}

// Animation loop using THREE.Clock
function animate() {
    const delta = clock.getDelta();
    
    if (!animationPaused) {
        requestAnimationFrame(animate);
        
        // Update planet positions and rotations
        if (rotationEnabled) {
            planets.forEach((planetObj) => {
                if (planetObj.data.orbitSpeed > 0) {
                    planetObj.angle += planetObj.data.orbitSpeed * delta;
                    planetObj.container.position.x = Math.cos(planetObj.angle) * planetObj.data.distance;
                    planetObj.container.position.z = Math.sin(planetObj.angle) * planetObj.data.distance;
                }
                
                // Rotate planet on its axis
                planetObj.planet.rotation.y += planetObj.data.rotationSpeed * delta;
            });
        }
        
        // Update controls
        controls.autoRotate = autoRotateEnabled && !selectedPlanet;
        controls.update();
        
        // Update labels
        updateLabels();
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle planet selection
function onPlanetSelect(index) {
    // Deselect current planet if any
    if (selectedPlanet !== null) {
        const prevPlanet = planets[selectedPlanet].planet;
        prevPlanet.material.emissive.setHex(planets[selectedPlanet].data.emissive || 0x000000);
        prevPlanet.material.emissiveIntensity = planets[selectedPlanet].data.emissiveIntensity || 0;
        prevPlanet.userData.isSelected = false;
    }
    
    // Select new planet
    selectedPlanet = index;
    const planet = planets[index].planet;
    planet.material.emissive.setHex(0x4a8af7);
    planet.material.emissiveIntensity = 0.5;
    planet.userData.isSelected = true;
    
    // Update UI
    updatePlanetInfo(index);
    
    // Focus camera on planet
    if (index !== 0) { // Not the sun
        const targetPosition = planets[index].container.position.clone();
        controls.target.copy(targetPosition);
        
        // Calculate camera position
        const cameraDistance = Math.max(planets[index].data.radius * 8, 30);
        const cameraPosition = targetPosition.clone().add(
            new THREE.Vector3(0, cameraDistance * 0.5, cameraDistance)
        );
        
        // Animate camera
        animateCamera(camera.position, cameraPosition, controls.target, targetPosition);
    } else {
        // For the sun, reset to default view
        animateCamera(
            camera.position, 
            new THREE.Vector3(0, 50, 180),
            controls.target, 
            new THREE.Vector3(0, 0, 0)
        );
    }
    
    // Disable auto-rotate when planet is selected
    autoRotateEnabled = false;
    document.getElementById('toggleAutoRotate').classList.remove('active');
}

// Animate camera movement
function animateCamera(fromPos, toPos, fromTarget, toTarget) {
    const duration = 1;
    const startTime = Date.now();
    
    function update() {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out function
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        camera.position.lerpVectors(fromPos, toPos, easedProgress);
        controls.target.lerpVectors(fromTarget, toTarget, easedProgress);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// Update planet information display
function updatePlanetInfo(index) {
    const data = planetData[index];
    const infoElement = document.getElementById('planetInfo');
    
    infoElement.innerHTML = `
        <div class="planet-name">${data.name}</div>
        <div>${data.info}</div>
        <div style="margin-top: 5px; font-size: 12px;">
            Orbit Speed: ${(data.orbitSpeed * 100).toFixed(2)}<br>
            Rotation Speed: ${(data.rotationSpeed * 100).toFixed(2)}
        </div>
    `;
}

// Deselect planet
function deselectPlanet() {
    if (selectedPlanet !== null) {
        const planet = planets[selectedPlanet].planet;
        planet.material.emissive.setHex(planets[selectedPlanet].data.emissive || 0x000000);
        planet.material.emissiveIntensity = planets[selectedPlanet].data.emissiveIntensity || 0;
        planet.userData.isSelected = false;
        selectedPlanet = null;
    }
    document.getElementById('planetInfo').innerHTML = "Click/tap on planets to select";
}

// Toggle orbit visibility
function toggleOrbits() {
    orbitsVisible = !orbitsVisible;
    planets.forEach(planet => {
        if (planet.orbit) {
            planet.orbit.visible = orbitsVisible;
        }
    });
    document.getElementById('toggleOrbits').classList.toggle('active', orbitsVisible);
}

// Toggle planet rotation
function toggleRotation() {
    rotationEnabled = !rotationEnabled;
    document.getElementById('toggleRotation').classList.toggle('active', rotationEnabled);
}

// Toggle auto-rotate
function toggleAutoRotate() {
    autoRotateEnabled = !autoRotateEnabled;
    document.getElementById('toggleAutoRotate').classList.toggle('active', autoRotateEnabled);
    if (autoRotateEnabled) {
        deselectPlanet();
    }
}

// Toggle pause/resume
function togglePause() {
    animationPaused = !animationPaused;
    const button = document.getElementById('pauseResume');
    button.textContent = animationPaused ? "Resume" : "Pause";
    
    if (!animationPaused) {
        animate();
    }
}

// Reset view to default
function resetView() {
    animateCamera(
        camera.position, 
        new THREE.Vector3(0, 50, 180),
        controls.target, 
        new THREE.Vector3(0, 0, 0)
    );
    deselectPlanet();
}

// Toggle dark/light mode
function toggleTheme() {
    darkMode = !darkMode;
    const button = document.getElementById('theme-toggle');
    
    if (darkMode) {
        scene.background = new THREE.Color(0x000000);
        button.textContent = "🌙 Dark Mode";
        
        // Update orbit colors
        planets.forEach(planet => {
            if (planet.orbit) {
                planet.orbit.material.color.setHex(0x555555);
            }
        });
    } else {
        scene.background = new THREE.Color(0xf0f0f0);
        button.textContent = "☀️ Light Mode";
        
        // Update orbit colors
        planets.forEach(planet => {
            if (planet.orbit) {
                planet.orbit.material.color.setHex(0x999999);
            }
        });
    }
}

// Handle planet hover
function handlePlanetHover(planet, isHovered) {
    planet.userData.isHovered = isHovered;
    
    if (!planet.userData.isSelected) {
        planet.material.emissive.setHex(isHovered ? 0x333333 : 0x000000);
        planet.material.emissiveIntensity = isHovered ? 0.3 : 0;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Planet selection
    renderer.domElement.addEventListener('click', (event) => {
        if (event.target.tagName === 'INPUT') return;
        
        // Calculate mouse position
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycast to find clicked object
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(
            planets.map(p => p.planet), 
            true
        );
        
        if (intersects.length > 0) {
            const planet = intersects[0].object;
            onPlanetSelect(planet.userData.index);
        } else {
            deselectPlanet();
        }
    });
    
    // Planet hover
    renderer.domElement.addEventListener('mousemove', (event) => {
        // Calculate mouse position
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycast to find hovered object
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(
            planets.map(p => p.planet), 
            true
        );
        
        // Reset all hover states
        planets.forEach(p => {
            if (p.planet.userData.isHovered && (!intersects.length || intersects[0].object !== p.planet)) {
                handlePlanetHover(p.planet, false);
            }
        });
        
        // Set new hover state
        if (intersects.length > 0) {
            const planet = intersects[0].object;
            if (!planet.userData.isHovered) {
                handlePlanetHover(planet, true);
            }
        }
    });
    
    // Control buttons
    document.getElementById('toggleOrbits').addEventListener('click', toggleOrbits);
    document.getElementById('toggleRotation').addEventListener('click', toggleRotation);
    document.getElementById('toggleAutoRotate').addEventListener('click', toggleAutoRotate);
    document.getElementById('pauseResume').addEventListener('click', togglePause);
    document.getElementById('resetView').addEventListener('click', resetView);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Touch events for mobile
    renderer.domElement.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('click', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        renderer.domElement.dispatchEvent(mouseEvent);
    }, { passive: false });
}

// Initialize the application when loaded
window.addEventListener('load', init);