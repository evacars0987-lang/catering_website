/* ==============================================================
   KHANDELWAL CATERERS - V4 ELITE ERP LOGIC ENGINE
   Real-Time 3D WebGL | SaaS Billing | B2B Estimators | AI Rep
============================================================== */

// --- STATE MANAGEMENT ---
let currentStep = 1;
let selectedItems = [];
let guestCount = 200;
let basePlatePrice = 0;
let addonTotal = 0;
let peakSurcharge = 0;
let selectedTableCloth = 'silk';

// 3D Scene Global Variables
let scene, camera, renderer, controls;
let plateMesh, tableClothMesh, dishesGroup;
let steamParticles;

// Mock Database for Inventory & Nutrients/Allergens
const inventoryDB = [
    { id: 'd1', name: '24K Gold Saffron Water', category: 'Drink', price: 150, active: true, cal: 50, protein: 0, carbs: 12, fat: 0, allergens: [] },
    { id: 'd2', name: 'Smoked Berry Mocktail', category: 'Drink', price: 180, active: true, cal: 120, protein: 0, carbs: 30, fat: 0, allergens: [] },
    { id: 'd3', name: 'Fresh Kiwi Margarita', category: 'Drink', price: 120, active: true, cal: 150, protein: 0, carbs: 35, fat: 0, allergens: [] },
    
    { id: 's1', name: 'Truffle Edamame Dumplings', category: 'Starter', price: 250, active: true, cal: 180, protein: 6, carbs: 24, fat: 4, allergens: ['Gluten', 'Soy'] },
    { id: 's2', name: 'Charcoal Paneer Tikka', category: 'Starter', price: 220, active: true, cal: 250, protein: 15, carbs: 5, fat: 18, allergens: ['Dairy'] },
    { id: 's3', name: 'Crispy Lotus Stem', category: 'Starter', price: 180, active: true, cal: 160, protein: 3, carbs: 22, fat: 6, allergens: [] },
    { id: 's4', name: 'Avocado Papdi Chaat', category: 'Starter', price: 150, active: true, cal: 140, protein: 4, carbs: 18, fat: 5, allergens: ['Gluten'] },
    
    { id: 'm1', name: 'Dal Bukhara (24h Slow Cooked)', category: 'Main', price: 300, active: true, cal: 320, protein: 12, carbs: 28, fat: 16, allergens: ['Dairy'] },
    { id: 'm2', name: 'Artisan Zucchini Lasagna', category: 'Main', price: 350, active: true, cal: 420, protein: 18, carbs: 35, fat: 22, allergens: ['Gluten', 'Dairy'] },
    { id: 'm3', name: 'Saffron Pulao', category: 'Main', price: 150, active: true, cal: 200, protein: 4, carbs: 42, fat: 3, allergens: [] },
    { id: 'm4', name: 'Paneer Lababdar', category: 'Main', price: 280, active: true, cal: 310, protein: 14, carbs: 10, fat: 20, allergens: ['Dairy'] },
    
    { id: 'ds1', name: 'Pista Baklava', category: 'Dessert', price: 200, active: true, cal: 350, protein: 5, carbs: 45, fat: 18, allergens: ['Gluten', 'Nuts'] },
    { id: 'ds2', name: 'Rose Petal Ice Cream', category: 'Dessert', price: 150, active: true, cal: 220, protein: 4, carbs: 25, fat: 12, allergens: ['Dairy'] },
    { id: 'ds3', name: 'Warm Moong Dal Halwa', category: 'Dessert', price: 180, active: true, cal: 400, protein: 6, carbs: 50, fat: 20, allergens: ['Dairy', 'Nuts'] }
];

let crmLeads = [
    { id: 'L1001', name: 'Rajat Khandelwal', date: '2026-11-15', guests: 500, value: 750000, status: 'Pending', items: ['d1', 'd2', 's1', 's2', 'm1', 'ds1'] },
    { id: 'L1002', name: 'Ambani Event', date: '2026-12-05', guests: 1000, value: 2500000, status: 'Negotiation', items: ['d1', 'd2', 's1', 's2', 's3', 'm1', 'm2', 'ds1', 'ds3'] },
    { id: 'L1003', name: 'Sharma Wedding', date: '2026-10-20', guests: 300, value: 450000, status: 'Approved', items: ['d3', 's2', 'm3', 'm4', 'ds2'] },
    { id: 'L1004', name: 'Tech Corp Gala', date: '2026-11-01', guests: 150, value: 180000, status: 'Approved', items: ['d3', 's4', 'm3', 'ds2'] }
];

let reviewsDB = [
    { id: 'r1', author: 'Vinay Khandelwal', text: 'Khandelwal Caters did an amazing job for my daughter\'s wedding! The Saffron Pulao was the highlight. Flawless gold theme service.', approved: true },
    { id: 'r2', author: 'Rajesh Mittal', text: 'Highly professional team. The visual 3D plate planner made menu configuration so easy. Worth every penny!', approved: true },
    { id: 'r3', author: 'Sneha Verma', text: 'Their liquid nitrogen mocktail bar was a massive hit among the guests. 10/10.', approved: true }
];

let galleryDB = [
    { id: 'g0', url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', type: 'video', caption: 'Majestic Royal Wedding (Video)' },
    { id: 'g1', url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80', type: 'image', caption: 'Royal Marwari Wedding at Taj' },
    { id: 'g2', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80', type: 'image', caption: 'Corporate Golden High-Tea' }
];

let calendarRules = [
    { date: '2026-11-15', condition: 'Peak Muhurat Surcharge', rate: '+ 15%' },
    { date: '2026-12-05', condition: 'Peak Muhurat Surcharge', rate: '+ 15%' }
];

// --- INITIALIZATION ---
window.onload = () => {
    // Force cache clear
    if(!localStorage.getItem('v4_update_applied')) {
        localStorage.clear();
        localStorage.setItem('v4_update_applied', 'true');
    }

    // Set body font from local storage CMS branding
    const cmsFont = localStorage.getItem('cms_brand_font') || 'Outfit';
    document.body.style.setProperty('--base-font', `'${cmsFont}', sans-serif`);
    
    // Set color accent from local storage CMS branding
    const cmsColor = localStorage.getItem('cms_color_accent') || '#D4AF37';
    document.body.style.setProperty('--primary', cmsColor);
    document.body.style.setProperty('--primary-glow', hexToRgbA(cmsColor, 0.4));

    if(localStorage.getItem('admin_logged_in') === 'true') {
        showAdminView();
    } else {
        renderMenuGrid('Drink');
        updateGuestSliderVal();
        renderGalleryPosts();
        renderReviewsCarousel();
        loadCMSFromStorage();
        initVFXParticles(); // Mouse trail sparks
        setTimeout(showAIChat, 5000); // Popup AI after 5 seconds
    }
};

function hexToRgbA(hex, alpha){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x' + c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    return 'rgba(212,175,55,'+alpha+')';
}

/* ==============================================================
   VFX: GOLD SPARKLES MOUSE TRAIL
============================================================== */
let particlesArray = [];
function initVFXParticles() {
    const canvas = document.getElementById('vfx-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 5 + 1;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 - 2.5; // Drift upwards
            this.color = getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#D4AF37';
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.015;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.size -= 0.05;
            this.alpha -= this.decay;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    window.addEventListener('mousemove', (e) => {
        for (let i = 0; i < 3; i++) {
            particlesArray.push(new Particle(e.clientX, e.clientY));
        }
    });

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
            
            if (particlesArray[i].alpha <= 0 || particlesArray[i].size <= 0) {
                particlesArray.splice(i, 1);
                i--;
            }
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

/* ==============================================================
   FRONTEND: THEME & STEPPER ENGINE
============================================================== */
function switchThemePreset(themeClass, dotEl) {
    document.body.className = themeClass;
    document.querySelectorAll('.theme-dot').forEach(dot => dot.classList.remove('active'));
    if(dotEl) dotEl.classList.add('active');
    
    // Sync admin skin select dropdown
    const skinSelect = document.getElementById('admin-skin');
    if(skinSelect) skinSelect.value = themeClass;
}

function nextQuiz(step, val) {
    document.querySelectorAll('.quiz-card').forEach(el => el.style.display = 'none');
    if(document.getElementById('quiz-step-' + step)) {
        document.getElementById('quiz-step-' + step).style.display = 'block';
    }
}

function finishQuiz(preset) {
    document.querySelectorAll('.quiz-card').forEach(el => el.style.display = 'none');
    document.getElementById('quiz-result').style.display = 'block';
    applyPackagePreset(preset);
}

function goToStep(step) {
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step-node').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`step-${step}-content`).classList.add('active');
    
    for(let i=1; i<=4; i++) {
        let node = document.getElementById(`node-${i}`);
        if(i < step) node.classList.add('completed');
        else node.classList.remove('completed');
    }
    document.getElementById(`node-${step}`).classList.add('active');
    
    let progress = ((step-1)/3)*100;
    document.getElementById('step-progress-line').style.width = `${progress}%`;
    currentStep = step;

    if(step === 2 || step === 3) document.getElementById('floating-bar').classList.add('show');
    else document.getElementById('floating-bar').classList.remove('show');
    
    if(step === 3) {
        // Initialize or Resize Three.js Plate Visualizer
        setTimeout(init3DPlate, 100);
    }
}

function nextStep() { if(currentStep < 4) goToStep(currentStep + 1); }
window.prevStep = function() { if(currentStep > 1) goToStep(currentStep - 1); }

function updateGuestSliderVal() {
    guestCount = parseInt(document.getElementById('guest-count').value);
    document.getElementById('guest-count-val').innerText = guestCount;
    document.getElementById('summary-guest-count').innerText = guestCount;
    document.getElementById('float-guests').innerText = guestCount;
    
    let badge = document.getElementById('discount-tier-badge');
    if(guestCount >= 800) badge.innerText = "15% VIP Discount";
    else if(guestCount >= 500) badge.innerText = "10% Volume Discount";
    else if(guestCount >= 300) badge.innerText = "5% Discount";
    else badge.innerText = "No Discount";
    
    recalculateTotal();
}

function validateEventDate() {
    let dateVal = document.getElementById('event-date').value;
    let msg = document.getElementById('date-status-msg');
    let surRow = document.getElementById('summary-surcharge-row');
    
    if(dateVal.includes('11-15') || dateVal.includes('12-05')) {
        msg.innerHTML = '<span class="text-danger"><i class="fa-solid fa-bolt"></i> Peak Muhurat Date! 15% Surcharge applies.</span>';
        peakSurcharge = 0.15;
        surRow.style.display = 'flex';
        document.getElementById('summary-surcharge-val').innerText = '+ 15%';
    } else {
        msg.innerHTML = '<span class="text-success"><i class="fa-solid fa-check"></i> Date is available.</span>';
        peakSurcharge = 0;
        surRow.style.display = 'none';
    }
    recalculateTotal();
}

function switchMenuTab(category) {
    document.querySelectorAll('.menu-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    renderMenuGrid(category);
}

function renderMenuGrid(category) {
    let grid = document.getElementById('menu-items-grid');
    grid.innerHTML = '';
    
    let items = inventoryDB.filter(x => x.category === category && x.active);
    items.forEach(item => {
        let isChecked = selectedItems.find(x => x.id === item.id) ? 'checked' : '';
        let rowClass = isChecked ? 'menu-item-row selected' : 'menu-item-row';
        grid.innerHTML += `
            <div class="${rowClass}" id="row-${item.id}">
                <label class="item-lbl-check">
                    <input type="checkbox" ${isChecked} onchange="toggleMenuItem('${item.id}', ${item.price}, '${item.category}')">
                    ${item.name}
                </label>
                <span class="item-price">₹${item.price}</span>
            </div>
        `;
    });
}

function toggleMenuItem(id, price, category) {
    let row = document.getElementById(`row-${id}`);
    let idx = selectedItems.findIndex(x => x.id === id);
    if(idx > -1) {
        selectedItems.splice(idx, 1);
        if(row) row.classList.remove('selected');
    } else {
        selectedItems.push({ id, price, category });
        if(row) row.classList.add('selected');
    }
    recalculateTotal();
}

function applyPackagePreset(preset) {
    selectedItems = [];
    let itemsToSelect = [];
    if(preset === 'maharaja') itemsToSelect = ['d1', 'd2', 's1', 's2', 's3', 'm1', 'm2', 'm3', 'ds1', 'ds3'];
    else if(preset === 'corporate') itemsToSelect = ['d3', 's2', 'm3', 'm4', 'ds2'];
    
    itemsToSelect.forEach(id => {
        let item = inventoryDB.find(x => x.id === id);
        if(item) selectedItems.push({ id: item.id, price: item.price, category: item.category });
    });
    
    let activeTabBtn = document.querySelector('.menu-tab-btn.active');
    if(activeTabBtn) activeTabBtn.click();
    recalculateTotal();
}

function recalculateTotal() {
    basePlatePrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
    addonTotal = 0;
    if(document.getElementById('addon-nitrogen') && document.getElementById('addon-nitrogen').checked) addonTotal += 15000;
    if(document.getElementById('addon-ice') && document.getElementById('addon-ice').checked) addonTotal += 10000;
    if(document.getElementById('addon-pizza') && document.getElementById('addon-pizza').checked) addonTotal += 20000;
    if(document.getElementById('addon-waiters') && document.getElementById('addon-waiters').checked) addonTotal += 12000;
    
    let subtotal = basePlatePrice * guestCount;
    subtotal += (subtotal * peakSurcharge);
    
    let discount = 0;
    if(guestCount >= 800) discount = subtotal * 0.15;
    else if(guestCount >= 500) discount = subtotal * 0.10;
    else if(guestCount >= 300) discount = subtotal * 0.05;
    
    if(discount > 0) {
        document.getElementById('summary-discount-row').style.display = 'flex';
        document.getElementById('summary-discount-val').innerText = '- ₹' + discount.toLocaleString();
    } else {
        document.getElementById('summary-discount-row').style.display = 'none';
    }
    
    let grandTotal = (subtotal - discount) + addonTotal;
    
    document.getElementById('summary-plate-count').innerText = selectedItems.length + ' Items';
    document.getElementById('summary-plate-price').innerText = '₹' + basePlatePrice.toLocaleString();
    document.getElementById('float-plate-price').innerText = '₹' + basePlatePrice.toLocaleString();
    
    document.getElementById('summary-addons-price').innerText = '₹' + addonTotal.toLocaleString();
    document.getElementById('float-addons').innerText = '₹' + addonTotal.toLocaleString();
    
    document.getElementById('summary-total-bill').innerText = '₹' + grandTotal.toLocaleString();
    document.getElementById('float-total-bill').innerText = '₹' + grandTotal.toLocaleString();

    // Update Nutrients & Allergen Widgets
    updateNutrientsPanel();
}

function updateNutrientsPanel() {
    let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    let allergens = new Set();

    selectedItems.forEach(sel => {
        let dbItem = inventoryDB.find(x => x.id === sel.id);
        if(dbItem) {
            totalCal += dbItem.cal;
            totalProtein += dbItem.protein;
            totalCarbs += dbItem.carbs;
            totalFat += dbItem.fat;
            dbItem.allergens.forEach(allg => allergens.add(allg));
        }
    });

    document.getElementById('nutr-cal').innerText = totalCal;
    document.getElementById('nutr-protein').innerText = totalProtein + 'g';
    document.getElementById('nutr-carbs').innerText = totalCarbs + 'g';
    document.getElementById('nutr-fat').innerText = totalFat + 'g';

    const listContainer = document.getElementById('allergens-list-container');
    listContainer.innerHTML = '';
    
    if(allergens.size === 0) {
        listContainer.innerHTML = `<span class="allergen-chip safe"><i class="fa-solid fa-circle-check"></i> Safe from Major Allergens</span>`;
    } else {
        allergens.forEach(allg => {
            listContainer.innerHTML += `<span class="allergen-chip"><i class="fa-solid fa-circle-exclamation"></i> Contains: ${allg}</span>`;
        });
    }
}

/* ==============================================================
   THREE.JS: INTERACTIVE 3D WEBGL DINING ENGINE
============================================================== */
function init3DPlate() {
    const container = document.getElementById('threejs-plate-container');
    const canvas = document.getElementById('threejs-plate-canvas');
    if(!container || !canvas) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 450;

    if (renderer) {
        // Redraw scene if already initialized & fix sizing
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        update3DDishes();
        return;
    }

    // 1. Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0b, 0.015);

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 15, 20);

    // 3. Renderer setup
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1; // Block looking under table
    controls.minDistance = 8;
    controls.maxDistance = 35;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const goldLight = new THREE.PointLight(0xd4af37, 0.5, 30);
    goldLight.position.set(-10, 5, -10);
    scene.add(goldLight);

    // 6. Table Cloth Ground Plane
    const tableGeom = new THREE.PlaneGeometry(100, 100);
    const tableMat = new THREE.MeshStandardMaterial({
        color: 0x131315,
        roughness: 0.85,
        metalness: 0.1
    });
    tableClothMesh = new THREE.Mesh(tableGeom, tableMat);
    tableClothMesh.rotation.x = -Math.PI / 2;
    tableClothMesh.position.y = -0.55;
    tableClothMesh.receiveShadow = true;
    scene.add(tableClothMesh);
    applyTableClothTexture('silk'); // Load default cloth style

    // 7. Bevelled Golden Plate
    const plateGroup = new THREE.Group();
    
    // Plate Rim
    const rimGeom = new THREE.CylinderGeometry(5.2, 5.2, 0.4, 64);
    const goldMat = new THREE.MeshPhysicalMaterial({
        color: 0xd4af37,
        metalness: 0.9,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 0.9
    });
    const rimMesh = new THREE.Mesh(rimGeom, goldMat);
    rimMesh.castShadow = true;
    rimMesh.receiveShadow = true;
    plateGroup.add(rimMesh);

    // Plate Inner Center
    const innerGeom = new THREE.CylinderGeometry(4.6, 4.6, 0.35, 64);
    const whitePorcelainMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.05
    });
    const innerMesh = new THREE.Mesh(innerGeom, whitePorcelainMat);
    innerMesh.position.y = 0.03;
    innerMesh.receiveShadow = true;
    plateGroup.add(innerMesh);

    plateMesh = plateGroup;
    scene.add(plateMesh);

    // 8. Dishes Group
    dishesGroup = new THREE.Group();
    plateMesh.add(dishesGroup);

    // 9. Particles Engine (Steam / Nitrogen)
    const particleCount = 40;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 8; // Spread
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending
    });
    steamParticles = new THREE.Points(particleGeom, particleMat);
    steamParticles.position.y = 1.0;
    scene.add(steamParticles);

    // Render & Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Gentle rotation of the plate
        plateMesh.rotation.y += 0.003;

        // Animate particles (rising steam/vapor)
        if (steamParticles && steamParticles.material.opacity > 0) {
            const positions = steamParticles.geometry.attributes.position.array;
            for(let i=1; i < positions.length; i+=3) {
                positions[i] += 0.04; // Move up
                if (positions[i] > 4.0) {
                    positions[i] = 0; // Reset to bowl level
                    positions[i-1] = (Math.random() - 0.5) * 3;
                    positions[i+1] = (Math.random() - 0.5) * 3;
                }
            }
            steamParticles.geometry.attributes.position.needsUpdate = true;
        }

        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    update3DDishes();

    // Resize event
    window.addEventListener('resize', () => {
        if (!container || !camera || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function switchTableCloth(style, btnEl) {
    document.querySelectorAll('.table-cloth-btn').forEach(btn => btn.classList.remove('active'));
    if(btnEl) btnEl.classList.add('active');
    selectedTableCloth = style;
    applyTableClothTexture(style);
}

function applyTableClothTexture(style) {
    if(!tableClothMesh) return;
    if(style === 'silk') {
        tableClothMesh.material.color.setHex(0xb28c2c);
        tableClothMesh.material.roughness = 0.25;
        tableClothMesh.material.metalness = 0.5;
    } else if(style === 'linen') {
        tableClothMesh.material.color.setHex(0xf5f5f7);
        tableClothMesh.material.roughness = 0.9;
        tableClothMesh.material.metalness = 0.0;
    } else if(style === 'wood') {
        tableClothMesh.material.color.setHex(0x5c4033);
        tableClothMesh.material.roughness = 0.8;
        tableClothMesh.material.metalness = 0.1;
    }
}

function update3DAddons() {
    const isNitrogenChecked = document.getElementById('addon-nitrogen') && document.getElementById('addon-nitrogen').checked;
    if(steamParticles) {
        gsap.to(steamParticles.material, {
            opacity: isNitrogenChecked ? 0.35 : 0.0,
            size: isNitrogenChecked ? 0.25 : 0.15,
            duration: 1.0
        });
    }
}

function update3DDishes() {
    if(!dishesGroup) return;
    // Clear previous models
    while(dishesGroup.children.length > 0){ 
        dishesGroup.remove(dishesGroup.children[0]); 
    }

    if (selectedItems.length === 0) return;

    let hasHotMains = false;
    let angleStep = (Math.PI * 2) / selectedItems.length;

    selectedItems.forEach((sel, i) => {
        let dbItem = inventoryDB.find(x => x.id === sel.id);
        if(!dbItem) return;

        let angle = i * angleStep;
        let radius = 2.4; 
        let x = radius * Math.cos(angle);
        let z = radius * Math.sin(angle);

        let itemMesh = new THREE.Group();
        itemMesh.position.set(x, 0.2, z);

        if(dbItem.category === 'Drink') {
            const glassGeom = new THREE.CylinderGeometry(0.5, 0.3, 1.4, 32, 1, true);
            const glassMat = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3,
                transmission: 0.9,
                roughness: 0.05,
                metalness: 0.05
            });
            const glass = new THREE.Mesh(glassGeom, glassMat);
            glass.position.y = 0.7;
            glass.castShadow = true;
            itemMesh.add(glass);

            let liquidColor = 0xffa500;
            if(dbItem.id === 'd2') liquidColor = 0x8b0000;
            if(dbItem.id === 'd3') liquidColor = 0x39ff14;

            const liquidGeom = new THREE.CylinderGeometry(0.48, 0.28, 1.1, 32);
            const liquidMat = new THREE.MeshStandardMaterial({
                color: liquidColor,
                roughness: 0.1,
                metalness: 0.1
            });
            const liquid = new THREE.Mesh(liquidGeom, liquidMat);
            liquid.position.y = 0.55;
            itemMesh.add(liquid);

        } else if(dbItem.category === 'Starter') {
            if(dbItem.id === 's2') {
                for(let j = 0; j < 3; j++) {
                    const block = new THREE.Mesh(
                        new THREE.BoxGeometry(0.4, 0.4, 0.4),
                        new THREE.MeshStandardMaterial({ color: 0xe65c00, roughness: 0.6 })
                    );
                    block.position.set(0, 0.2 + (j * 0.45), 0);
                    block.rotation.set(Math.random()*0.2, Math.random()*0.2, Math.random()*0.2);
                    block.castShadow = true;
                    itemMesh.add(block);
                }
            } else if(dbItem.id === 's1') {
                for(let j = 0; j < 2; j++) {
                    const dumpling = new THREE.Mesh(
                        new THREE.SphereGeometry(0.3, 16, 16),
                        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
                    );
                    dumpling.position.set(-0.25 + (j * 0.5), 0.2, 0);
                    dumpling.scale.set(1.2, 0.8, 1.2);
                    dumpling.castShadow = true;
                    itemMesh.add(dumpling);
                }
            } else {
                const donut = new THREE.Mesh(
                    new THREE.TorusGeometry(0.3, 0.12, 16, 32),
                    new THREE.MeshStandardMaterial({ color: 0xc29b2b, roughness: 0.4 })
                );
                donut.rotation.x = Math.PI / 2;
                donut.position.y = 0.15;
                donut.castShadow = true;
                itemMesh.add(donut);
            }

        } else if(dbItem.category === 'Main') {
            hasHotMains = true;
            const bowlGeom = new THREE.CylinderGeometry(0.8, 0.6, 0.7, 32);
            const bowlMat = new THREE.MeshStandardMaterial({ color: 0x800000, roughness: 0.7, metalness: 0.1 });
            const bowl = new THREE.Mesh(bowlGeom, bowlMat);
            bowl.position.y = 0.35;
            bowl.castShadow = true;
            itemMesh.add(bowl);

            let gravyColor = 0x4a1212;
            if(dbItem.id === 'm3') gravyColor = 0xffcc00;
            
            const gravy = new THREE.Mesh(
                new THREE.CylinderGeometry(0.76, 0.76, 0.1, 32),
                new THREE.MeshStandardMaterial({ color: gravyColor, roughness: 0.1 })
            );
            gravy.position.y = 0.65;
            itemMesh.add(gravy);

            if(dbItem.id === 'm1') {
                const cream = new THREE.Mesh(
                    new THREE.TorusGeometry(0.35, 0.04, 8, 32),
                    new THREE.MeshBasicMaterial({ color: 0xffffff })
                );
                cream.rotation.x = Math.PI / 2;
                cream.position.y = 0.71;
                itemMesh.add(cream);
            }

        } else if(dbItem.category === 'Dessert') {
            if(dbItem.id === 'ds1') {
                const layer = new THREE.Mesh(
                    new THREE.BoxGeometry(0.6, 0.3, 0.6),
                    new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3 })
                );
                layer.position.y = 0.15;
                layer.castShadow = true;
                itemMesh.add(layer);

                const pistachio = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.05, 0.4),
                    new THREE.MeshStandardMaterial({ color: 0x00E676, roughness: 0.8 })
                );
                pistachio.position.y = 0.31;
                itemMesh.add(pistachio);
            } else {
                const scoop = new THREE.Mesh(
                    new THREE.SphereGeometry(0.4, 32, 32),
                    new THREE.MeshStandardMaterial({ color: 0xffe4e1, roughness: 0.9 })
                );
                scoop.position.y = 0.4;
                scoop.castShadow = true;
                itemMesh.add(scoop);
            }
        }

        // Animated Entrance Transition
        itemMesh.scale.set(0.01, 0.01, 0.01);
        dishesGroup.add(itemMesh);
        
        gsap.to(itemMesh.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: i * 0.15
        });
    });

    if(steamParticles && !document.getElementById('addon-nitrogen').checked) {
        gsap.to(steamParticles.material, {
            opacity: hasHotMains ? 0.25 : 0.0,
            duration: 1.0
        });
    }
}

function submitBookingRequest() {
    let name = document.getElementById('cust-name').value;
    let phone = document.getElementById('cust-phone').value;
    if(!name || !phone) { alert("Please fill your Name and WhatsApp Number."); return; }
    
    let totalValStr = document.getElementById('summary-total-bill').innerText.replace(/[^0-9]/g, '');
    let totalVal = parseInt(totalValStr);

    let newLeadId = 'L' + (1000 + crmLeads.length + 1);
    let today = new Date().toISOString().split('T')[0];
    
    let leadItems = selectedItems.map(x => x.id);

    crmLeads.unshift({
        id: newLeadId,
        name: name,
        date: today,
        guests: guestCount,
        value: totalVal,
        status: 'Pending',
        items: leadItems
    });

    alert(`Thank you, ${name}! Your Royal Catering Request for ₹${totalVal.toLocaleString()} has been submitted. Booking details saved to cloud backend DB.`);
    openB2BPOModal(newLeadId);
}

function scrollToPlanner() { document.getElementById('menu-planner').scrollIntoView({behavior: 'smooth'}); }

/* ==============================================================
   FRONTEND: REVIEWS, GALLERY & AI REPRESENTATIVE CHAT
============================================================== */
function renderGalleryPosts() {
    let container = document.getElementById('gallery-posts-grid');
    if(!container) return;
    container.innerHTML = '';
    
    let localGallery = JSON.parse(localStorage.getItem('galleryDB')) || galleryDB;
    localGallery.forEach(post => {
        let mediaHtml = post.type === 'video' 
            ? `<video src="${post.url}" autoplay muted loop playsinline></video>`
            : `<img src="${post.url}" alt="${post.caption}">`;
            
        container.innerHTML += `
            <div class="gallery-item">
                ${mediaHtml}
                <div class="gallery-caption">${post.caption}</div>
            </div>
        `;
    });
}

function renderReviewsCarousel() {
    let container = document.getElementById('reviews-carousel-inner');
    if(!container) return;
    container.innerHTML = '';
    let localReviews = JSON.parse(localStorage.getItem('reviewsDB')) || reviewsDB;
    localReviews.filter(r => r.approved).forEach(review => {
        container.innerHTML += `
            <div class="review-card">
                <div class="stars">
                    <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
                </div>
                <p class="review-text">"${review.text}"</p>
                <div class="review-author">- ${review.author}</div>
            </div>
        `;
    });
}

function submitReview() {
    let name = document.getElementById('review-name').value;
    let text = document.getElementById('review-text').value;
    if(!name || !text) { alert("Please enter name and review."); return; }
    
    let localReviews = JSON.parse(localStorage.getItem('reviewsDB')) || reviewsDB;
    localReviews.push({ id: 'r' + Math.floor(Math.random() * 10000), author: name, text: text, approved: false });
    localStorage.setItem('reviewsDB', JSON.stringify(localReviews));
    alert("Thank you! Review submitted to admin for approval.");
    closeModal('modal-review');
}

// AI Sales Chatbot
function showAIChat() { document.getElementById('ai-chat-widget').classList.add('visible'); }
function toggleAIChat() {
    let body = document.getElementById('ai-chat-body');
    let input = document.getElementById('ai-chat-input-area');
    let icon = document.getElementById('ai-toggle-icon');
    
    if(body.style.display === 'none') {
        body.style.display = 'block';
        input.style.display = 'flex';
        icon.className = 'fa-solid fa-chevron-down';
    } else {
        body.style.display = 'none';
        input.style.display = 'none';
        icon.className = 'fa-solid fa-chevron-up';
    }
}

function handleAIKeyPress(e) { if(e.key === 'Enter') sendAIMessage(); }

function sendAIMessage() {
    let input = document.getElementById('ai-user-input');
    let text = input.value.trim();
    if(!text) return;
    
    let body = document.getElementById('ai-chat-body');
    body.innerHTML += `<div class="chat-msg user-msg">${text}</div>`;
    input.value = '';
    body.scrollTop = body.scrollHeight;
    
    setTimeout(() => {
        let reply = "Namaste! I am the virtual sales representative for Khandelwal Caters. Let me know your query or budget!";
        
        let lowerText = text.toLowerCase();
        if(lowerText.includes('budget') || lowerText.includes('price') || lowerText.includes('discount')) {
            reply = "Bhai, Khandelwal Caters delivers 100% premium quality. I can offer you a special AI sales discount code: **SAASWOW10** which gets you a flat 10% off. You can use the Menu Planner wizard to configure it!";
        } else if(lowerText.includes('paneer') || lowerText.includes('tikka') || lowerText.includes('dal')) {
            reply = "Great choice! Our Dal Bukhara is slow-cooked for 24 hours on coal. I highly recommend including our Truffle Dumplings alongside it.";
        } else if(lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('namaste')) {
            reply = "Namaste! Hope you are having a wonderful day. Let me know how I can customize your event menus!";
        }
        
        body.innerHTML += `<div class="chat-msg ai-msg">${reply}</div>`;
        body.scrollTop = body.scrollHeight;
    }, 800);
}

/* ==============================================================
   ADMIN PORTAL: ERP MANAGEMENT MODULES
============================================================== */
function showAdminView() {
    document.getElementById('customer-view').style.display = 'none';
    document.querySelector('.luxury-header').style.display = 'none';
    document.getElementById('admin-view').style.display = 'block';
    
    renderCRMPipeline();
    renderFinancials();
    renderInventory();
    renderCMSPanel();
    renderRosterList();
    renderCalendarRules();
    startKOTSimulator();
}

function logoutAdmin() {
    localStorage.setItem('admin_logged_in', 'false');
    window.location.reload();
}

function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.admin-nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.getElementById(`btn-tab-${tabId}`).classList.add('active');
}

function changeThemeSkin(theme) {
    document.body.className = theme;
}

// B2B CRM Pipeline Render
function renderCRMPipeline() {
    ['Pending', 'Negotiation', 'Approved', 'Lost'].forEach(status => {
        let container = document.getElementById(`crm-list-${status.toLowerCase()}`);
        if(!container) return;
        container.innerHTML = '';
        let leads = crmLeads.filter(x => x.status === status);
        document.getElementById(`count-lead-${status.toLowerCase()}`).innerText = leads.length;
        leads.forEach(lead => {
            container.innerHTML += `
                <div class="crm-lead-card" draggable="true" onclick="openB2BPOModal('${lead.id}')">
                    <h4>${lead.name}</h4>
                    <div class="lead-meta">
                        <span><i class="fa-regular fa-calendar"></i> ${lead.date}</span>
                        <span><i class="fa-solid fa-users"></i> ${lead.guests} Guests</span>
                    </div>
                    <span class="lead-price">₹${lead.value.toLocaleString()}</span>
                    <button class="secondary-btn small-btn border-btn spacer-top" style="padding: 4px 8px; font-size: 0.75rem;"><i class="fa-solid fa-receipt"></i> View B2B PO</button>
                </div>
            `;
        });
    });
}

// B2B CRM Add Lead Creator
function openCRMLeadCreator() {
    let name = prompt("Enter Client Name:");
    let phone = prompt("Enter WhatsApp Number:");
    let guests = parseInt(prompt("Enter Guest Count:", "200"));
    let val = parseInt(prompt("Enter Booking Value (₹):", "500000"));
    if(!name || !phone || isNaN(guests) || isNaN(val)) return;

    crmLeads.unshift({
        id: 'L' + (1000 + crmLeads.length + 1),
        name: name,
        date: new Date().toISOString().split('T')[0],
        guests: guests,
        value: val,
        status: 'Pending',
        items: ['d1', 's2', 'm1', 'ds1']
    });
    renderCRMPipeline();
    renderFinancials();
}

// B2B Purchase Order (PO) & Raw Ingredient Calculation logic
function openB2BPOModal(leadId) {
    const lead = crmLeads.find(x => x.id === leadId);
    if(!lead) return;

    let modalFrame = document.getElementById('b2b-po-bill-view');
    modalFrame.innerHTML = '';

    // Standard recipe ratios per guest (kg/L)
    let ingredientQuotes = [
        { name: 'Basmati Long Grain Rice', qty: (lead.guests * 0.12).toFixed(1) + ' Kg' },
        { name: 'Organic Paneer block', qty: (lead.guests * 0.15).toFixed(1) + ' Kg' },
        { name: 'Shahi Urad Dal (Black Lentils)', qty: (lead.guests * 0.08).toFixed(1) + ' Kg' },
        { name: 'Kashmiri Saffron threads', qty: (lead.guests * 0.1).toFixed(1) + ' g' },
        { name: 'Premium Milk/Cream', qty: (lead.guests * 0.15).toFixed(1) + ' Liters' },
        { name: 'Refined Ghee & Spices mix', qty: (lead.guests * 0.05).toFixed(1) + ' Kg' }
    ];

    let itemsText = lead.items ? lead.items.map(id => {
        let it = inventoryDB.find(x => x.id === id);
        return it ? it.name : id;
    }).join(', ') : 'Custom selection';

    let template = `
        <h3 class="text-center" style="letter-spacing: 2px; margin-bottom: 20px;">KHANDELWAL CATERS B2B P.O.</h3>
        <p><strong>Purchase Order ID:</strong> PO-${lead.id}-${Math.floor(Math.random()*900+100)}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Client Booking Name:</strong> ${lead.name}</p>
        <p><strong>Expected Guest Count:</strong> ${lead.guests}</p>
        <p><strong>Selected Menu List:</strong> ${itemsText}</p>
        <hr style="border: 1px dashed #ccc; margin: 20px 0;">
        <h4>ESTIMATED RAW INGREDIENTS REQUIREMENT:</h4>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
                <tr style="border-bottom: 1px solid #000; text-align: left;">
                    <th style="padding: 8px 0;">Ingredient Item</th>
                    <th style="padding: 8px 0; text-align: right;">Total Required Quantity</th>
                </tr>
            </thead>
            <tbody>
                ${ingredientQuotes.map(item => `
                    <tr style="border-bottom: 1px dashed #eee;">
                        <td style="padding: 8px 0;">${item.name}</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${item.qty}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <hr style="border: 1px dashed #ccc; margin: 20px 0;">
        <p style="font-size: 0.8rem; text-align: center;">Generated automatically by Khandelwal Caters B2B Estimator Engine</p>
    `;

    modalFrame.innerHTML = template;
    document.getElementById('modal-b2b-po').classList.add('active');
}

function printB2BPO() {
    const content = document.getElementById('b2b-po-bill-view').innerHTML;
    let win = window.open('', '', 'height=700,width=700');
    win.document.write('<html><head><title>B2B PO Print</title></head><body style="font-family:monospace; padding:30px;">');
    win.document.write(content);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
}

function sendB2BPOToVendor() {
    alert("Purchase Order exported. Dispatching raw material requisition PO to Dairy & Grocery supplier on WhatsApp.");
}

// B2B Staff scheduling Duty Roster & Payroll ERP logic
const staffData = [
    { name: 'Chef Ramesh', role: 'Head Chef (Mains)', rate: 1200, hours: 8, event: 'Ambani Event' },
    { name: 'Chef Amit', role: 'Assistant Chef', rate: 700, hours: 8, event: 'Ambani Event' },
    { name: 'Sanjay Kumar', role: 'Floor Manager', rate: 800, hours: 9, event: 'Rajat Wedding' },
    { name: 'Rahul Sharma', role: 'VIP Waitstaff Coordinator', rate: 450, hours: 8, event: 'Sharma Wedding' },
    { name: '12 Service Waiters', role: 'Buffet Servers Group', rate: 300, hours: 8, event: 'Ambani Event' },
    { name: '4 Cleaners & Helpers', role: 'Cleaning Operations', rate: 250, hours: 8, event: 'Sharma Wedding' }
];

function renderRosterList() {
    let tbody = document.getElementById('roster-table-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    let totalPayroll = 0;
    let rosterCount = staffData.length;

    staffData.forEach(staff => {
        let totalWages = staff.rate * staff.hours;
        if(staff.name.includes('12')) totalWages = staff.rate * staff.hours * 12;
        if(staff.name.includes('4')) totalWages = staff.rate * staff.hours * 4;

        totalPayroll += totalWages;

        tbody.innerHTML += `
            <tr>
                <td><strong>${staff.name}</strong></td>
                <td>${staff.event}</td>
                <td><span class="badge gold-badge" style="font-size:0.7rem;">${staff.role}</span></td>
                <td>${staff.hours} Hours</td>
                <td>₹${staff.rate} / hr</td>
                <td class="highlight-gold">₹${totalWages.toLocaleString()}</td>
            </tr>
        `;
    });

    document.getElementById('roster-staff-count').innerText = rosterCount + ' Personnel';
    document.getElementById('roster-total-payroll').innerText = '₹' + totalPayroll.toLocaleString();
}

// Financials Analytics
function renderFinancials() {
    let approvedLeads = crmLeads.filter(x => x.status === 'Approved');
    let totalRevenue = approvedLeads.reduce((sum, l) => sum + l.value, 0);
    let expenses = totalRevenue * 0.45;
    let profit = totalRevenue - expenses;
    
    document.getElementById('fin-revenue').innerText = '₹' + totalRevenue.toLocaleString();
    document.getElementById('fin-expenses').innerText = '₹' + expenses.toLocaleString();
    document.getElementById('fin-profit').innerText = '₹' + profit.toLocaleString();
    
    document.getElementById('chart-svg-container').innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 500 250" style="border-bottom: 2px solid #333; border-left: 2px solid #333;">
            <rect x="50" y="${250 - Math.min(220, totalRevenue/15000)}" width="80" height="${Math.min(220, totalRevenue/15000)}" fill="#00E676" />
            <text x="90" y="${230 - Math.min(220, totalRevenue/15000)}" text-anchor="middle" font-size="12" fill="#fff">Revenue</text>
            <rect x="200" y="${250 - Math.min(220, expenses/15000)}" width="80" height="${Math.min(220, expenses/15000)}" fill="#FF1744" />
            <text x="240" y="${230 - Math.min(220, expenses/15000)}" text-anchor="middle" font-size="12" fill="#fff">COGS</text>
            <rect x="350" y="${250 - Math.min(220, profit/15000)}" width="80" height="${Math.min(220, profit/15000)}" fill="#D4AF37" />
            <text x="390" y="${230 - Math.min(220, profit/15000)}" text-anchor="middle" font-size="12" fill="#fff">Net Profit</text>
        </svg>
    `;
}

// White Label CMS Customizer Settings
function updateBrandFont(fontName) {
    localStorage.setItem('cms_brand_font', fontName);
    document.body.style.setProperty('--base-font', `'${fontName}', sans-serif`);
}

function updateBrandColorAccent(colorHex) {
    localStorage.setItem('cms_color_accent', colorHex);
    document.body.style.setProperty('--primary', colorHex);
    document.getElementById('cms-color-val').innerText = colorHex;
    document.body.style.setProperty('--primary-glow', hexToRgbA(colorHex, 0.4));
}

// Inventory Logic
function renderInventory() {
    let tbody = document.getElementById('admin-inventory-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    inventoryDB.forEach(item => {
        let statusBadge = item.active ? '<span class="badge" style="background:#d4edda; color:#155724;">In Stock</span>' : '<span class="badge" style="background:#f8d7da; color:#721c24;">Out of Stock</span>';
        tbody.innerHTML += `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td>₹${item.price}</td>
                <td>${statusBadge}</td>
                <td><button class="secondary-btn small-btn border-btn" style="padding: 4px 10px;" onclick="toggleStock('${item.id}')"><i class="fa-solid fa-rotate"></i> Toggle</button></td>
            </tr>
        `;
    });
}

function openNewInventoryItemModal() {
    let name = prompt("Enter Dish Name:");
    let cat = prompt("Enter Category (Drink, Starter, Main, Dessert):");
    let price = parseInt(prompt("Enter Base Plate Price (₹):"));
    if(!name || !cat || isNaN(price)) return;

    inventoryDB.push({
        id: 'new' + Math.floor(Math.random()*10000),
        name: name,
        category: cat,
        price: price,
        active: true,
        cal: 150, protein: 5, carbs: 20, fat: 5, allergens: []
    });
    renderInventory();
}

function toggleStock(id) {
    let item = inventoryDB.find(x => x.id === id);
    if(item) item.active = !item.active;
    renderInventory();
}

// KOT Simulator (Live Kitchen Orders)
function startKOTSimulator() {
    let kotGrid = document.getElementById('kot-grid');
    if(!kotGrid) return;
    kotGrid.innerHTML = '';
    
    const dishes = ["Dal Bukhara", "Paneer Tikka", "Saffron Pulao", "Baklava"];
    
    // Initial static tickets
    for(let i=0; i<3; i++) {
        addKOTTicket(dishes[Math.floor(Math.random()*4)], Math.floor(Math.random()*30)+10);
    }
    
    setInterval(() => {
        if(kotGrid.children.length > 5) kotGrid.removeChild(kotGrid.lastChild);
        addKOTTicket(dishes[Math.floor(Math.random()*4)], Math.floor(Math.random()*30)+10);
    }, 8000); 
}

function addKOTTicket(dishName, qty) {
    let kotGrid = document.getElementById('kot-grid');
    if(!kotGrid) return;

    let card = document.createElement('div');
    card.className = 'kot-card new-kot';
    card.innerHTML = `
        <div class="kot-card-header">
            <span class="kot-table">Event ID: Tech Gala</span>
            <span class="kot-time">0m ago</span>
        </div>
        <ul class="kot-items">
            <li><span class="kot-qty">${qty}x</span> ${dishName}</li>
        </ul>
        <div class="kot-footer" style="margin-top:10px; font-size:0.85rem; color:#888;">Chef assigned: Ramesh</div>
    `;
    kotGrid.prepend(card);
}

// CMS Banner Update Logic
function renderCMSPanel() {
    let tbody = document.getElementById('cms-reviews-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';

    document.getElementById('cms-hero-title').value = localStorage.getItem('cms_hero_title') || "Crafting Royal Culinary Experiences For Your Special Days";
    document.getElementById('cms-hero-sub').value = localStorage.getItem('cms_hero_sub') || "Premium catering, bespoke styling, and flawless service for weddings, corporate galas, and luxury private events.";

    let localReviews = JSON.parse(localStorage.getItem('reviewsDB')) || reviewsDB;
    localReviews.forEach(review => {
        let badge = review.approved ? `<span class="badge" style="background: #d4edda; color: #155724;">Approved</span>` : `<span class="badge" style="background: #fff3cd; color: #856404;">Pending</span>`;
        tbody.innerHTML += `
            <tr>
                <td><strong>${review.author}</strong></td>
                <td>"${review.text}"</td>
                <td>${badge}</td>
                <td>
                    <button class="secondary-btn small-btn border-btn" style="padding:4px 8px; font-size:0.75rem;" onclick="toggleReviewApproval('${review.id}')">Toggle</button>
                </td>
            </tr>
        `;
    });
}

function toggleReviewApproval(id) {
    let localReviews = JSON.parse(localStorage.getItem('reviewsDB')) || reviewsDB;
    let rev = localReviews.find(r => r.id === id);
    if(rev) {
        rev.approved = !rev.approved;
        localStorage.setItem('reviewsDB', JSON.stringify(localReviews));
        renderCMSPanel();
    }
}

function saveCMSBanners() {
    let title = document.getElementById('cms-hero-title').value;
    let sub = document.getElementById('cms-hero-sub').value;
    
    let videoInput = document.getElementById('cms-hero-video-upload');
    if(videoInput.files && videoInput.files[0]) {
        let fileUrl = URL.createObjectURL(videoInput.files[0]);
        localStorage.setItem('cms_hero_video_url', fileUrl);
    }
    
    localStorage.setItem('cms_hero_title', title);
    localStorage.setItem('cms_hero_sub', sub);
    alert("Hero Banners & Background Video updated live on Website!");
}

function addCMSGalleryPost() {
    let cap = document.getElementById('cms-gallery-cap').value;
    let fileInput = document.getElementById('cms-gallery-file-upload');
    
    if(!fileInput.files || !fileInput.files[0] || !cap) {
        alert("Please provide both a Media File from your PC and a Caption.");
        return;
    }
    
    let file = fileInput.files[0];
    let fileUrl = URL.createObjectURL(file);
    let type = file.type.startsWith('video/') ? 'video' : 'image';

    let localGallery = JSON.parse(localStorage.getItem('galleryDB')) || galleryDB;
    localGallery.unshift({ id: 'g' + Math.floor(Math.random() * 10000), url: fileUrl, type: type, caption: cap });
    localStorage.setItem('galleryDB', JSON.stringify(localGallery));
    
    alert("PC Media published to Frontend Gallery successfully!");
    document.getElementById('cms-gallery-cap').value = '';
    fileInput.value = '';
    renderGalleryPosts();
}

function loadCMSFromStorage() {
    let title = localStorage.getItem('cms_hero_title');
    let sub = localStorage.getItem('cms_hero_sub');
    let videoUrl = localStorage.getItem('cms_hero_video_url');
    
    if(title) { let el = document.getElementById('hero-title'); if(el) el.innerText = title; }
    if(sub) { let el = document.getElementById('hero-subtitle'); if(el) el.innerText = sub; }
    if(videoUrl) {
        let vidEl = document.getElementById('hero-bg-video');
        if(vidEl) vidEl.src = videoUrl;
    }
}

// Calendar Blocker ERP logic
function renderCalendarRules() {
    let tbody = document.getElementById('calendar-rules-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    calendarRules.forEach((rule, idx) => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${rule.date}</strong></td>
                <td>${rule.condition}</td>
                <td class="text-danger">${rule.rate}</td>
                <td><button class="secondary-btn small-btn border-btn" style="padding:4px 8px; font-size:0.75rem;" onclick="deleteCalendarRule(${idx})">Delete</button></td>
            </tr>
        `;
    });
}

function applyCalendarConfig() {
    let date = document.getElementById('lock-date-input').value;
    let action = document.getElementById('date-action').value;
    if(!date) { alert("Please select a date."); return; }

    if(action === 'block') {
        calendarRules.push({ date, condition: 'Sold Out (Blocked)', rate: 'Blocked' });
    } else if(action === 'surcharge') {
        let pct = document.getElementById('surcharge-pct').value;
        calendarRules.push({ date, condition: 'Peak Muhurat Surcharge', rate: `+ ${pct}%` });
    } else {
        calendarRules = calendarRules.filter(x => x.date !== date);
    }
    renderCalendarRules();
    alert("Calendar rules updated successfully!");
}

function deleteCalendarRule(idx) {
    calendarRules.splice(idx, 1);
    renderCalendarRules();
}

function toggleSurchargeInput(val) {
    let group = document.getElementById('surcharge-input-group');
    if(group) group.style.display = val === 'surcharge' ? 'block' : 'none';
}

function shareMenuWithFamily() {
    alert("Sharing your customized menu list and current pricing summary with family on WhatsApp.");
}

// Modals Open / Close Helper Functions
function openAdminLoginModal() { document.getElementById('modal-admin-login').classList.add('active'); }
function openTrackModal() { document.getElementById('modal-track').classList.add('active'); }
function openReviewSubmissionModal() { document.getElementById('modal-review').classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function verifyAdminLogin() {
    if(document.getElementById('admin-pin').value === '1234') {
        localStorage.setItem('admin_logged_in', 'true'); window.location.reload();
    } else alert("Incorrect PIN!");
}

function checkBookingStatus() {
    let phone = document.getElementById('track-phone').value;
    if(!phone) { alert("Please enter your phone number."); return;}
    document.getElementById('track-result').style.display = 'block';
    document.getElementById('track-result').innerText = "Event Status: Confirmed. Chef & Staff Roster Assigned.";
}
