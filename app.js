/* ==============================================================
   KHANDELWAL CATERS - V7 ROYAL PALACE CATERING SYSTEM
   Hybrid REST APIs | Three.js 3D Modal | B2B ERP Ingredient Calculator
============================================================== */

// --- STATE MANAGEMENT ---
let currentStep = 1;
let selectedItems = [];
let guestCount = 200;
let basePlatePrice = 0;
let addonTotal = 0;
let peakSurcharge = 0;
let selectedTableCloth = 'silk';
let activePlateStyle = 'gold';

// Databases (fetched from server or local mock fallback)
let inventoryDB = [];
let crmLeads = [];
let reviewsDB = [];
let galleryDB = [];
let calendarRules = [];
let cmsConfig = {
    brand_font: 'Cormorant Garamond',
    color_accent: '#0A4E35',
    hero_title: 'Crafting Royal Culinary Experiences For Your Special Days',
    hero_sub: 'Premium catering, bespoke styling, and flawless service for weddings, corporate galas, and luxury private events.',
    hero_video: 'uploads/hero_new.mp4'
};

// 3D Scene Global Variables for the Modal Dish Viewer
let modalScene = null;
let modalCamera = null;
let modalRenderer = null;
let modalControls = null;
let activeDishMesh = null;
let modalRotationSpeed = 0.005;
let modalSteamParticles = null;
let modalInitialized = false;
let activeDishId = null;

// --- INITIALIZATION ---
window.onload = async () => {
    // Determine if we are hosted on server or file:///
    const isHosted = window.location.protocol.startsWith('http');
    
    if (isHosted) {
        await fetchDatabaseState();
    } else {
        loadMockOfflineDatabase();
    }

    if (localStorage.getItem('admin_logged_in') === 'true') {
        await showAdminView();
    } else {
        // Initialize UI elements
        renderAllMenuGrids();
        renderCuisineScrollSections();
        updateGuestSliderVal();
        renderGalleryPosts();
        renderReviewsCarousel();
        initVFXParticles(); // Sparkles trail
        applyCMSConfig(cmsConfig);
    }

    // Initialize GSAP scroll triggers after dynamic rendering
    initScrollAnimations();

    // Cuisine nav tab active state on scroll
    initCuisineNavScroll();
};

// --- REST API SYNCING (HYBRID CLIENT) ---
async function fetchDatabaseState() {
    try {
        const res = await fetch('/api/db');
        const db = await res.json();
        console.log("REST Server response database:", db);
        inventoryDB = db.inventory.map(item => ({ ...item, price: 0 }));
        crmLeads = db.leads.map(lead => ({ ...lead, value: 0 }));
        reviewsDB = db.reviews;
        galleryDB = db.gallery;
        console.log("fetchDatabaseState: populated galleryDB size =", galleryDB ? galleryDB.length : null);
        calendarRules = db.calendarRules.map(rule => ({ ...rule, rate: '+ 0%' }));
        cmsConfig = db.cms;
    } catch (err) {
        console.warn("REST Server offline, loading local mock database:", err);
        loadMockOfflineDatabase();
    }
}

function loadMockOfflineDatabase() {
    inventoryDB = [
        { id: 'bf_oj', name: 'Orange Juice', category: 'Drink', price: 0, active: true, cal: 80, protein: 1, carbs: 18, fat: 0, allergens: [], desc: 'Freshly squeezed sweet oranges served chilled.' },
        { id: 'bf_mj', name: 'Mix Fruit Juice', category: 'Drink', price: 0, active: true, cal: 90, protein: 1, carbs: 22, fat: 0, allergens: [], desc: 'Curated blend of seasonal Indian fruits.' },
        { id: 'bf_pj', name: 'Pineapple Juice', category: 'Drink', price: 0, active: true, cal: 85, protein: 1, carbs: 20, fat: 0, allergens: [], desc: 'Tangy and sweet fresh pineapple juice.' },
        { id: 'd4', name: 'Traditional Lassi', category: 'Drink', price: 0, active: true, cal: 210, protein: 5, carbs: 22, fat: 8, allergens: ['Dairy'], desc: 'Thick hand-churned yogurt flavored with cardamom and saffron threads.' },
        { id: 'd5', name: 'Butter Milk', category: 'Drink', price: 0, active: true, cal: 60, protein: 2, carbs: 5, fat: 2, allergens: ['Dairy'], desc: 'Traditional spiced buttermilk with roasted cumin and mint.' },
        { id: 'bf_tea', name: 'Royal Masala Tea', category: 'Drink', price: 0, active: true, cal: 90, protein: 2, carbs: 12, fat: 3, allergens: ['Dairy'], desc: 'Brewed with fresh milk, ginger, cardamom, and heritage spices.' },
        { id: 'bf_coffee', name: 'Premium Filter Coffee', category: 'Drink', price: 0, active: true, cal: 110, protein: 3, carbs: 15, fat: 3, allergens: ['Dairy'], desc: 'Aromatic south Indian decoction blended with steamed hot milk.' },
        { id: 'sb_mocktail', name: 'Assorted Mocktails', category: 'Drink', price: 0, active: true, cal: 120, protein: 0, carbs: 30, fat: 0, allergens: [], desc: 'Bespoke mocktail curations including Mint Mojito and Blue Lagoon.' },
        { id: 'sb_jaljeera', name: 'Shahi Jaljeera', category: 'Drink', price: 0, active: true, cal: 40, protein: 0, carbs: 8, fat: 0, allergens: [], desc: 'Refreshing cumin-coriander spiced water with fresh mint and boondi.' },
        { id: 'sb_softdrinks', name: 'Assorted Soft Drinks', category: 'Drink', price: 0, active: true, cal: 140, protein: 0, carbs: 35, fat: 0, allergens: [], desc: 'Selection of carbonated beverages served chilled.' },

        { id: 's2', name: 'Paneer Tikka', category: 'Starter', price: 0, active: true, cal: 250, protein: 15, carbs: 5, fat: 18, allergens: ['Dairy'], desc: 'Tandoor-charred cottage cheese cubes marinated in Greek yogurt and spices.' },
        { id: 'ex_ps', name: 'Paneer Ke Shole', category: 'Starter', price: 0, active: true, cal: 280, protein: 14, carbs: 8, fat: 20, allergens: ['Dairy', 'Gluten'], desc: 'Spiced paneer rolls wrapped in thin bread and fried to a golden crisp.' },
        { id: 'ex_mp', name: 'Malai Paneer Tikka', category: 'Starter', price: 0, active: true, cal: 290, protein: 14, carbs: 6, fat: 22, allergens: ['Dairy', 'Nuts'], desc: 'Skewered cottage cheese cubes marinated in rich cashew paste and cream.' },
        { id: 'ex_pa', name: 'Paneer Amritsari', category: 'Starter', price: 0, active: true, cal: 270, protein: 16, carbs: 10, fat: 19, allergens: ['Dairy', 'Gluten'], desc: 'Batter-fried paneer strips spiced with carom seeds and yellow chilies.' },
        { id: 'ex_hb', name: 'Hara Bhara Kabab', category: 'Starter', price: 0, active: true, cal: 180, protein: 5, carbs: 16, fat: 10, allergens: ['Gluten'], desc: 'Deep-fried patties made of spinach, green peas, potatoes, and spices.' },
        { id: 'ex_ckb', name: 'Corn Kabab', category: 'Starter', price: 0, active: true, cal: 190, protein: 4, carbs: 20, fat: 9, allergens: ['Gluten'], desc: 'Golden patties of sweet corn and herbs, shallow fried.' },
        { id: 'ex_sk', name: 'Veg Seekh Kabab', category: 'Starter', price: 0, active: true, cal: 160, protein: 6, carbs: 14, fat: 8, allergens: [], desc: 'Minced vegetables and spices skewered and cooked in tandoor.' },
        { id: 'ex_ta', name: 'Tandoori Aloo', category: 'Starter', price: 0, active: true, cal: 150, protein: 3, carbs: 22, fat: 5, allergens: ['Dairy'], desc: 'Scooped potatoes stuffed with cottage cheese and dry fruits, tandoori roasted.' },
        { id: 'ex_sc', name: 'Tandoori Soya Chaap', category: 'Starter', price: 0, active: true, cal: 210, protein: 12, carbs: 10, fat: 12, allergens: ['Soy', 'Dairy'], desc: 'Soya chunks marinated in yogurt masala and cooked in a clay oven.' },
        { id: 'ht1', name: 'Vegetable Pakora', category: 'Starter', price: 0, active: true, cal: 170, protein: 4, carbs: 18, fat: 9, allergens: [], desc: 'Assorted seasonal vegetable fritters coated in gram flour batter.' },
        { id: 'ht2', name: 'Dhokla with Chili', category: 'Starter', price: 0, active: true, cal: 120, protein: 4, carbs: 20, fat: 3, allergens: [], desc: 'Spongy steamed gram flour cakes served with fried green chilies.' },
        { id: 'ht3', name: 'Bread Pakora', category: 'Starter', price: 0, active: true, cal: 220, protein: 5, carbs: 25, fat: 11, allergens: ['Gluten'], desc: 'Fried bread slices stuffed with spiced mashed potatoes.' },
        { id: 'ht4', name: 'Mini Samosa', category: 'Starter', price: 0, active: true, cal: 150, protein: 3, carbs: 18, fat: 8, allergens: ['Gluten'], desc: 'Crispy pastry cones filled with seasoned potatoes and peas.' },
        { id: 'ex_cp', name: 'Chili Paneer Dry', category: 'Starter', price: 0, active: true, cal: 260, protein: 12, carbs: 12, fat: 16, allergens: ['Dairy', 'Gluten', 'Soy'], desc: 'Wok-tossed paneer cubes with bell peppers, green chilies, and soy sauce.' },
        { id: 'ex_vm', name: 'Veg Manchurian Dry', category: 'Starter', price: 0, active: true, cal: 210, protein: 4, carbs: 24, fat: 10, allergens: ['Gluten', 'Soy'], desc: 'Crispy vegetable balls tossed in a tangy and spicy soy-garlic sauce.' },
        { id: 'ex_gg', name: 'Golgappe (Atta & Suji)', category: 'Starter', price: 0, active: true, cal: 110, protein: 2, carbs: 22, fat: 2, allergens: ['Gluten'], desc: 'Crisp puris served with spiced mint water, sweet tamarind, and potato-chickpea filling.' },
        { id: 'ex_at', name: 'Aloo Tikki', category: 'Starter', price: 0, active: true, cal: 190, protein: 3, carbs: 25, fat: 8, allergens: ['Dairy'], desc: 'Pan-fried potato patties served with sweet curd, green chutney, and tamarind.' },
        { id: 'ex_rk', name: 'Shahi Raj Kachori', category: 'Starter', price: 0, active: true, cal: 320, protein: 6, carbs: 38, fat: 15, allergens: ['Dairy', 'Gluten'], desc: 'Grand crispy kachori stuffed with sprouts, yogurt, chutneys, and fine sev.' },
        { id: 's4', name: 'Papdi Chaat', category: 'Starter', price: 0, active: true, cal: 240, protein: 5, carbs: 28, fat: 11, allergens: ['Dairy', 'Gluten'], desc: 'Crisp flour crackers topped with potatoes, chickpeas, yogurt, and sweet chutneys.' },

        { id: 'ex_sh', name: 'Shahi Paneer', category: 'Main', price: 0, active: true, cal: 310, protein: 14, carbs: 10, fat: 22, allergens: ['Dairy', 'Nuts'], desc: 'Paneer cooked in a rich, creamy, and mildly sweet tomato-onion gravy.' },
        { id: 'ex_kp', name: 'Kadhai Paneer', category: 'Main', price: 0, active: true, cal: 290, protein: 15, carbs: 8, fat: 20, allergens: ['Dairy'], desc: 'Paneer tossed with capsicum, onions, and freshly ground kadhai masala.' },
        { id: 'm4', name: 'Paneer Lababdar', category: 'Main', price: 0, active: true, cal: 320, protein: 14, carbs: 9, fat: 22, allergens: ['Dairy', 'Nuts'], desc: 'Cottage cheese cubes in a creamy tomato-cashew gravy with grated paneer.' },
        { id: 'ex_mk', name: 'Malai Kofta', category: 'Main', price: 0, active: true, cal: 340, protein: 8, carbs: 20, fat: 24, allergens: ['Dairy', 'Nuts'], desc: 'Paneer and potato dumplings in a rich, sweet, cashew-based cream sauce.' },
        { id: 'ex_nv', name: 'Navratan Korma', category: 'Main', price: 0, active: true, cal: 280, protein: 6, carbs: 22, fat: 18, allergens: ['Dairy', 'Nuts'], desc: 'Rich vegetable curry cooked with nine different fruits, vegetables, and nuts.' },
        { id: 'ex_dm', name: 'Kashmiri Dum Aloo', category: 'Main', price: 0, active: true, cal: 210, protein: 4, carbs: 28, fat: 9, allergens: ['Dairy'], desc: 'Baby potatoes cooked in a rich fennel and yogurt gravy.' },
        { id: 'bf_cb', name: 'Chhole Bhature', category: 'Main', price: 0, active: true, cal: 450, protein: 12, carbs: 55, fat: 20, allergens: ['Gluten', 'Dairy'], desc: 'Spiced chickpea curry served with fluffy, deep-fried leavened bread.' },
        { id: 'bf_pb', name: 'Poori Bhaji', category: 'Main', price: 0, active: true, cal: 380, protein: 8, carbs: 48, fat: 16, allergens: ['Gluten'], desc: 'Golden-fried whole wheat pooris served with dry potato bhaji.' },
        { id: 'ex_gc', name: 'Gatta Curry', category: 'Main', price: 0, active: true, cal: 240, protein: 8, carbs: 18, fat: 15, allergens: ['Dairy'], desc: 'Gram flour dumplings cooked in a traditional Rajasthani spiced yogurt gravy.' },
        { id: 'm1', name: 'Dal Bukhara', category: 'Main', price: 0, active: true, cal: 320, protein: 12, carbs: 28, fat: 16, allergens: ['Dairy'], desc: 'Signature black lentils slow-cooked overnight with fresh cream and butter.' },
        { id: 'ex_dmh', name: 'Dal Makhani', category: 'Main', price: 0, active: true, cal: 310, protein: 11, carbs: 26, fat: 15, allergens: ['Dairy'], desc: 'Slow-cooked black lentils and kidney beans enriched with butter and cream.' },
        { id: 'ex_dy', name: 'Yellow Dal Tadka', category: 'Main', price: 0, active: true, cal: 180, protein: 9, carbs: 24, fat: 5, allergens: [], desc: 'Yellow lentils tempered with ghee, cumin seeds, garlic, and red chilies.' },
        { id: 'ex_vb', name: 'Veg Biryani', category: 'Main', price: 0, active: true, cal: 290, protein: 6, carbs: 45, fat: 9, allergens: ['Dairy'], desc: 'Fragrant basmati rice layered with vegetables, saffron, and aromatic herbs.' },
        { id: 'm3', name: 'Kashmiri Pulao', category: 'Main', price: 0, active: true, cal: 260, protein: 5, carbs: 42, fat: 7, allergens: ['Nuts'], desc: 'Mildly sweet basmati rice cooked with saffron, fresh fruits, and dry fruits.' },
        { id: 'ex_nan', name: 'Butter Naan', category: 'Main', price: 0, active: true, cal: 220, protein: 6, carbs: 38, fat: 5, allergens: ['Gluten', 'Dairy'], desc: 'Traditional tandoor-baked leavened flatbread brushed with butter.' },
        { id: 'ex_mr', name: 'Missi Roti', category: 'Main', price: 0, active: true, cal: 150, protein: 6, carbs: 22, fat: 3, allergens: ['Gluten'], desc: 'Flatbread made with a blend of gram flour, whole wheat flour, and herbs.' },
        { id: 'bf_sp', name: 'Stuffed Parantha with Curd', category: 'Main', price: 0, active: true, cal: 340, protein: 8, carbs: 45, fat: 12, allergens: ['Gluten', 'Dairy'], desc: 'Tandoor-baked flatbread stuffed with potato/paneer, served with fresh curd.' },
        { id: 'bf_id', name: 'Idli Sambhar', category: 'Main', price: 0, active: true, cal: 180, protein: 6, carbs: 35, fat: 1, allergens: [], desc: 'Steamed rice cakes served with hot lentil soup and coconut chutney.' },
        { id: 'bf_ds', name: 'Masala Dosa', category: 'Main', price: 0, active: true, cal: 260, protein: 5, carbs: 42, fat: 7, allergens: [], desc: 'Crispy rice and lentil crepe stuffed with spiced potato mash.' },

        { id: 'ex_rm', name: 'Rasmalai', category: 'Dessert', price: 0, active: true, cal: 220, protein: 6, carbs: 22, fat: 12, allergens: ['Dairy', 'Nuts'], desc: 'Sweet cottage cheese patties soaked in saffron-flavored thickened milk.' },
        { id: 'ex_gj', name: 'Gulab Jamun', category: 'Dessert', price: 0, active: true, cal: 280, protein: 4, carbs: 45, fat: 10, allergens: ['Dairy', 'Gluten'], desc: 'Golden milk-solid spheres fried and soaked in warm cardamom sugar syrup.' },
        { id: 'ex_rj', name: 'Jalebi Garam with Rabdi', category: 'Dessert', price: 0, active: true, cal: 320, protein: 5, carbs: 55, fat: 9, allergens: ['Dairy', 'Gluten'], desc: 'Crispy fermented-batter spirals soaked in sugar syrup, served with creamy rabdi.' },
        { id: 'ds3', name: 'Moong Dal Halwa', category: 'Dessert', price: 0, active: true, cal: 400, protein: 6, carbs: 50, fat: 20, allergens: ['Dairy', 'Nuts'], desc: 'Rich dessert made of split yellow lentils roasted in pure desi ghee.' },
        { id: 'ds2', name: 'Vanilla Ice Cream', category: 'Dessert', price: 0, active: true, cal: 160, protein: 3, carbs: 18, fat: 9, allergens: ['Dairy'], desc: 'Rich and creamy vanilla bean ice cream.' },
        { id: 'ex_kp_kulfi', name: 'Kesar Pista Kulfi', category: 'Dessert', price: 0, active: true, cal: 210, protein: 5, carbs: 20, fat: 12, allergens: ['Dairy', 'Nuts'], desc: 'Traditional Indian ice cream flavored with saffron, pistachios, and almonds.' },
        { id: 'ht5', name: 'Assorted Pastries', category: 'Dessert', price: 0, active: true, cal: 240, protein: 3, carbs: 30, fat: 12, allergens: ['Gluten', 'Dairy'], desc: 'Selection of pineapple, strawberry, and chocolate pastries.' },

        // ══════════════════════════════════════════════════
        // GUJARATI ROYAL CUISINE
        // ══════════════════════════════════════════════════
        // Starters / Farsan
        { id: 'guj_dhokla', name: 'Dhokla', category: 'Gujarati-Farsan', cuisine: 'gujarati', price: 0, active: true, cal: 120, protein: 4, carbs: 20, fat: 3, allergens: [], desc: 'Spongy steamed gram flour cakes with sesame and coriander tempering — a classic Gujarati snack.' },
        { id: 'guj_khandvi', name: 'Khandvi', category: 'Gujarati-Farsan', cuisine: 'gujarati', price: 0, active: true, cal: 100, protein: 3, carbs: 12, fat: 4, allergens: ['Dairy'], desc: 'Soft rolled gram flour bites with mustard and coconut garnish — a delicate Gujarati art.' },
        { id: 'guj_patra', name: 'Patra', category: 'Gujarati-Farsan', cuisine: 'gujarati', price: 0, active: true, cal: 130, protein: 3, carbs: 18, fat: 5, allergens: [], desc: 'Colocasia leaves layered with spiced gram flour paste, steamed and tempered with sesame.' },
        { id: 'guj_methi_gota', name: 'Methi Gota', category: 'Gujarati-Farsan', cuisine: 'gujarati', price: 0, active: true, cal: 145, protein: 4, carbs: 16, fat: 7, allergens: ['Gluten'], desc: 'Crispy fenugreek fritters made with fresh methi leaves and gram flour.' },
        { id: 'guj_handvo', name: 'Handvo', category: 'Gujarati-Farsan', cuisine: 'gujarati', price: 0, active: true, cal: 160, protein: 5, carbs: 22, fat: 6, allergens: [], desc: 'Savory baked lentil and rice cake with vegetables and sesame — a wholesome Gujarati staple.' },
        { id: 'guj_fafda', name: 'Fafda with Chutney', category: 'Gujarati-Farsan', cuisine: 'gujarati', price: 0, active: true, cal: 140, protein: 3, carbs: 17, fat: 6, allergens: ['Gluten'], desc: 'Crunchy gram flour strips served with tangy green chutney and raw papaya.' },
        // Main Course
        { id: 'guj_undhiyu', name: 'Undhiyu', category: 'Gujarati-Main', cuisine: 'gujarati', price: 0, active: true, cal: 220, protein: 6, carbs: 28, fat: 9, allergens: [], desc: 'Slow-cooked mixed winter vegetables in a clay pot with fenugreek dumplings — the crown jewel of Gujarati cuisine.' },
        { id: 'guj_sev_tameta', name: 'Sev Tameta Nu Shaak', category: 'Gujarati-Main', cuisine: 'gujarati', price: 0, active: true, cal: 150, protein: 3, carbs: 16, fat: 7, allergens: ['Gluten'], desc: 'Tangy tomato curry topped generously with crispy sev — a sweet-sour Gujarati signature.' },
        { id: 'guj_ringan', name: 'Ringan Bateta Nu Shaak', category: 'Gujarati-Main', cuisine: 'gujarati', price: 0, active: true, cal: 170, protein: 4, carbs: 20, fat: 7, allergens: [], desc: 'Brinjal and potato curry spiced with Gujarati masala and tempered in mustard oil.' },
        { id: 'guj_bhindi', name: 'Bhindi Sambhariya', category: 'Gujarati-Main', cuisine: 'gujarati', price: 0, active: true, cal: 130, protein: 3, carbs: 12, fat: 7, allergens: [], desc: 'Ladies finger stuffed with spiced coconut and sesame paste, dry-cooked to perfection.' },
        { id: 'guj_dal', name: 'Gujarati Dal', category: 'Gujarati-Main', cuisine: 'gujarati', price: 0, active: true, cal: 140, protein: 6, carbs: 18, fat: 4, allergens: [], desc: 'Sweet-sour toor dal tempered with mustard, cumin, curry leaves and a touch of jaggery.' },
        { id: 'guj_kadhi', name: 'Gujarati Kadhi', category: 'Gujarati-Main', cuisine: 'gujarati', price: 0, active: true, cal: 110, protein: 4, carbs: 10, fat: 5, allergens: ['Dairy'], desc: 'Silky yogurt and gram flour curry — sweet, tangy, and uniquely Gujarati.' },
        { id: 'guj_dal_dhokli', name: 'Dal Dhokli', category: 'Gujarati-Main', cuisine: 'gujarati', price: 0, active: true, cal: 200, protein: 7, carbs: 30, fat: 5, allergens: ['Gluten'], desc: 'Spiced wheat dumplings simmered in sweet-sour toor dal — a complete one-pot royal meal.' },
        { id: 'guj_khichdi', name: 'Khichdi', category: 'Gujarati-Main', cuisine: 'gujarati', price: 0, active: true, cal: 180, protein: 6, carbs: 32, fat: 4, allergens: [], desc: 'Soft rice and moong dal cooked together with a golden ghee tempering — comfort cuisine elevated.' },
        // Breads
        { id: 'guj_thepla', name: 'Thepla', category: 'Gujarati-Breads', cuisine: 'gujarati', price: 0, active: true, cal: 130, protein: 4, carbs: 18, fat: 5, allergens: ['Gluten'], desc: 'Thin, spiced flatbreads made with fenugreek and whole wheat — a Gujarati heritage classic.' },
        { id: 'guj_rotli', name: 'Rotli', category: 'Gujarati-Breads', cuisine: 'gujarati', price: 0, active: true, cal: 90, protein: 3, carbs: 16, fat: 2, allergens: ['Gluten'], desc: 'Soft paper-thin whole wheat rotli made fresh and brushed with ghee.' },
        { id: 'guj_bhakri', name: 'Bhakri', category: 'Gujarati-Breads', cuisine: 'gujarati', price: 0, active: true, cal: 110, protein: 4, carbs: 20, fat: 2, allergens: ['Gluten'], desc: 'Rustic coarse millet flatbread — hearty, nutritious, and quintessentially rural Gujarati.' },
        { id: 'guj_bajra_rotla', name: 'Bajra Rotla', category: 'Gujarati-Breads', cuisine: 'gujarati', price: 0, active: true, cal: 120, protein: 4, carbs: 22, fat: 2, allergens: [], desc: 'Pearl millet flatbread served hot with ghee and jaggery — a timeless winter staple.' },
        { id: 'guj_puri', name: 'Puri', category: 'Gujarati-Breads', cuisine: 'gujarati', price: 0, active: true, cal: 150, protein: 3, carbs: 18, fat: 8, allergens: ['Gluten'], desc: 'Golden puffed deep-fried wheat bread — light, crispy, and festive.' },
        // Rice
        { id: 'guj_steamed_rice', name: 'Steamed Rice', category: 'Gujarati-Rice', cuisine: 'gujarati', price: 0, active: true, cal: 160, protein: 3, carbs: 36, fat: 0, allergens: [], desc: 'Perfectly cooked long-grain basmati rice — pure, light and a classic Gujarati meal accompaniment.' },
        { id: 'guj_jeera_rice', name: 'Jeera Rice', category: 'Gujarati-Rice', cuisine: 'gujarati', price: 0, active: true, cal: 185, protein: 3, carbs: 38, fat: 3, allergens: [], desc: 'Cumin-tempered basmati rice with whole spices — aromatic and light.' },
        { id: 'guj_vagharelo_bhaat', name: 'Vagharelo Bhaat', category: 'Gujarati-Rice', cuisine: 'gujarati', price: 0, active: true, cal: 195, protein: 4, carbs: 38, fat: 4, allergens: [], desc: 'Seasoned leftover rice tempered with mustard, turmeric, and green chilies — a home comfort dish.' },
        { id: 'guj_veg_pulao', name: 'Vegetable Pulao', category: 'Gujarati-Rice', cuisine: 'gujarati', price: 0, active: true, cal: 200, protein: 5, carbs: 40, fat: 4, allergens: [], desc: 'Fragrant basmati pilaf with garden vegetables and whole spices.' },
        // Accompaniments
        { id: 'guj_chhundo', name: 'Chhundo (Sweet Mango Pickle)', category: 'Gujarati-Accompaniments', cuisine: 'gujarati', price: 0, active: true, cal: 80, protein: 0, carbs: 20, fat: 0, allergens: [], desc: 'Sweet shredded raw mango pickle with saffron and spices — a prized Gujarati preserve.' },
        { id: 'guj_green_chutney', name: 'Green Chutney', category: 'Gujarati-Accompaniments', cuisine: 'gujarati', price: 0, active: true, cal: 30, protein: 1, carbs: 4, fat: 1, allergens: [], desc: 'Fresh coriander and mint chutney with green chili and lemon — vibrant and cooling.' },
        { id: 'guj_papad', name: 'Papad', category: 'Gujarati-Accompaniments', cuisine: 'gujarati', price: 0, active: true, cal: 60, protein: 3, carbs: 8, fat: 2, allergens: [], desc: 'Crispy roasted and fried lentil wafers — served with every traditional Gujarati thali.' },
        { id: 'guj_salad', name: 'Salad', category: 'Gujarati-Accompaniments', cuisine: 'gujarati', price: 0, active: true, cal: 40, protein: 2, carbs: 7, fat: 0, allergens: [], desc: 'Fresh garden salad with lemon dressing and chaat masala.' },
        { id: 'guj_chaas', name: 'Buttermilk (Chaas)', category: 'Gujarati-Accompaniments', cuisine: 'gujarati', price: 0, active: true, cal: 50, protein: 3, carbs: 4, fat: 2, allergens: ['Dairy'], desc: 'Chilled spiced buttermilk with cumin, ginger, and mint — the perfect Gujarati digestive.' },
        // Desserts
        { id: 'guj_shrikhand', name: 'Shrikhand', category: 'Gujarati-Desserts', cuisine: 'gujarati', price: 0, active: true, cal: 230, protein: 6, carbs: 35, fat: 7, allergens: ['Dairy', 'Nuts'], desc: 'Strained yogurt sweetened with saffron and cardamom — a festival favourite.' },
        { id: 'guj_basundi', name: 'Basundi', category: 'Gujarati-Desserts', cuisine: 'gujarati', price: 0, active: true, cal: 260, protein: 8, carbs: 30, fat: 10, allergens: ['Dairy', 'Nuts'], desc: 'Thickened sweetened milk with saffron, cardamom, and dry fruits — a regal liquid dessert.' },
        { id: 'guj_mohanthal', name: 'Mohanthal', category: 'Gujarati-Desserts', cuisine: 'gujarati', price: 0, active: true, cal: 370, protein: 6, carbs: 50, fat: 16, allergens: ['Dairy', 'Nuts'], desc: 'Rich gram flour fudge with ghee, cardamom, and silver leaf — a royal Gujarati mithai.' },
        { id: 'guj_jalebi', name: 'Jalebi', category: 'Gujarati-Desserts', cuisine: 'gujarati', price: 0, active: true, cal: 290, protein: 3, carbs: 50, fat: 8, allergens: ['Gluten', 'Dairy'], desc: 'Crispy spirals soaked in sugar syrup — sweet, golden and festive.' },
        { id: 'guj_gulab_jamun', name: 'Gulab Jamun', category: 'Gujarati-Desserts', cuisine: 'gujarati', price: 0, active: true, cal: 280, protein: 4, carbs: 45, fat: 10, allergens: ['Dairy', 'Gluten'], desc: 'Soft khoya spheres soaked in warm rose-cardamom sugar syrup.' },

        // ══════════════════════════════════════════════════
        // ROYAL RAJASTHANI CUISINE
        // ══════════════════════════════════════════════════
        // Traditional Accompaniments
        { id: 'raj_mirch_chamki', name: 'Hari Mirch Chamki', category: 'Rajasthani-Accompaniments', cuisine: 'rajasthani', price: 0, active: true, cal: 25, protein: 1, carbs: 4, fat: 0, allergens: [], desc: 'Whole green chilies tempered in oil — a fiery Rajasthani table condiment.' },
        { id: 'raj_lahsun_chutney', name: 'Lahsun & Kachari Chutney', category: 'Rajasthani-Accompaniments', cuisine: 'rajasthani', price: 0, active: true, cal: 45, protein: 1, carbs: 6, fat: 2, allergens: [], desc: 'Rustic garlic and dried cucumber chutney — bold, spicy, and authentically Rajasthani.' },
        { id: 'raj_sugar_ghee', name: 'Sugar, Gud & Ghee', category: 'Rajasthani-Accompaniments', cuisine: 'rajasthani', price: 0, active: true, cal: 180, protein: 0, carbs: 25, fat: 9, allergens: ['Dairy'], desc: 'Jaggery, sugar, and pure desi ghee served together — the traditional Rajasthani baati accompaniment.' },
        // Royal Specialties
        { id: 'raj_churma', name: 'Dry Fruit Churma', category: 'Rajasthani-Specialties', cuisine: 'rajasthani', price: 0, active: true, cal: 420, protein: 7, carbs: 55, fat: 20, allergens: ['Gluten', 'Dairy', 'Nuts'], desc: 'Coarsely ground wheat sweetened with jaggery and studded with rich dry fruits — a royal Rajasthani treasure.' },
        { id: 'raj_mewa_khichdi', name: 'Bikaneri Special Mewa Khichadi', category: 'Rajasthani-Specialties', cuisine: 'rajasthani', price: 0, active: true, cal: 310, protein: 8, carbs: 45, fat: 10, allergens: ['Dairy', 'Nuts'], desc: 'Fragrant rice and dal khichdi garnished with premium dry fruits — a Bikaneri royal court recipe.' },
        { id: 'raj_namkeen_khichdi', name: 'Bikaneri Special Namkeen Khichadi', category: 'Rajasthani-Specialties', cuisine: 'rajasthani', price: 0, active: true, cal: 260, protein: 8, carbs: 40, fat: 8, allergens: [], desc: 'Savory spiced khichdi seasoned with whole spices — a Bikaneri specialty.' },
        { id: 'raj_hing_pakodi', name: 'Bikaneri Special Hing Pakodi', category: 'Rajasthani-Specialties', cuisine: 'rajasthani', price: 0, active: true, cal: 170, protein: 5, carbs: 18, fat: 8, allergens: ['Gluten'], desc: 'Asafoetida-spiced gram flour fritters from the royal kitchens of Bikaner.' },
        { id: 'raj_kutodi_rabdi', name: 'Kutodi Rabdi', category: 'Rajasthani-Specialties', cuisine: 'rajasthani', price: 0, active: true, cal: 250, protein: 7, carbs: 28, fat: 11, allergens: ['Dairy', 'Nuts'], desc: 'Thick slow-cooked sweetened milk with rich malai layers — a Rajasthani dessert specialty.' },
        { id: 'raj_chenna_sweets', name: 'Chenna Sweets', category: 'Rajasthani-Specialties', cuisine: 'rajasthani', price: 0, active: true, cal: 240, protein: 6, carbs: 35, fat: 8, allergens: ['Dairy'], desc: 'Soft fresh cottage cheese sweets shaped and flavored with cardamom.' },
        { id: 'raj_rabdi_bundi', name: 'Jodhpuri Rabdi Bundi Laddu', category: 'Rajasthani-Specialties', cuisine: 'rajasthani', price: 0, active: true, cal: 340, protein: 5, carbs: 50, fat: 13, allergens: ['Dairy', 'Gluten'], desc: 'Traditional gram flour bundi spheres coated in rabdi cream — a Jodhpuri festive delicacy.' },
        // Main Course
        { id: 'raj_panchmel_dal', name: 'Panchmel Dal', category: 'Rajasthani-Main', cuisine: 'rajasthani', price: 0, active: true, cal: 190, protein: 10, carbs: 26, fat: 5, allergens: [], desc: 'Five lentils slow-cooked together with traditional Rajasthani spices — a dal of royal complexity.' },
        { id: 'raj_kadhi', name: 'Rajasthani Kadhi', category: 'Rajasthani-Main', cuisine: 'rajasthani', price: 0, active: true, cal: 120, protein: 4, carbs: 12, fat: 6, allergens: ['Dairy'], desc: 'Thick tangy gram flour and yogurt curry tempered with dried chilies and whole spices.' },
        { id: 'raj_govind_gatta', name: 'Govind Gatta', category: 'Rajasthani-Main', cuisine: 'rajasthani', price: 0, active: true, cal: 230, protein: 8, carbs: 18, fat: 14, allergens: ['Dairy', 'Gluten'], desc: 'Stuffed gram flour dumplings in a rich spiced yogurt gravy — a regal Rajasthani creation.' },
        { id: 'raj_gwar_fali', name: 'Gwar Fali', category: 'Rajasthani-Main', cuisine: 'rajasthani', price: 0, active: true, cal: 140, protein: 4, carbs: 16, fat: 6, allergens: [], desc: 'Cluster beans cooked with traditional Rajasthani spices in a dry curry.' },
        { id: 'raj_muli_kachar', name: 'Muli Kachar', category: 'Rajasthani-Main', cuisine: 'rajasthani', price: 0, active: true, cal: 120, protein: 3, carbs: 14, fat: 5, allergens: [], desc: 'Radish and dried cucumber curry with desert spices — a Rajasthani wilderness specialty.' },
        { id: 'raj_pyaj_patti', name: 'Pyaj Patti', category: 'Rajasthani-Main', cuisine: 'rajasthani', price: 0, active: true, cal: 110, protein: 2, carbs: 12, fat: 5, allergens: [], desc: 'Spring onion stalks prepared as a rustic Rajasthani dry curry.' },
        { id: 'raj_kaju_ker', name: 'Kaju Ker', category: 'Rajasthani-Main', cuisine: 'rajasthani', price: 0, active: true, cal: 260, protein: 6, carbs: 20, fat: 17, allergens: ['Nuts'], desc: 'Cashews cooked with dried ker berries in a royal aromatic masala.' },
        { id: 'raj_ker_sangri', name: 'Ker Sangri', category: 'Rajasthani-Main', cuisine: 'rajasthani', price: 0, active: true, cal: 180, protein: 4, carbs: 18, fat: 9, allergens: [], desc: 'Dried ker berries and sangri beans in tangy desert masala — the iconic dish of Rajasthan.' },
        { id: 'raj_haldi_kaju', name: 'Haldi Kaju Sabji', category: 'Rajasthani-Main', cuisine: 'rajasthani', price: 0, active: true, cal: 240, protein: 6, carbs: 16, fat: 16, allergens: ['Dairy', 'Nuts'], desc: 'Cashews in a turmeric-golden gravy — a festive Rajasthani curry.' },
        { id: 'raj_chatpata_aloo', name: 'Chatpata Aloo', category: 'Rajasthani-Main', cuisine: 'rajasthani', price: 0, active: true, cal: 190, protein: 3, carbs: 26, fat: 8, allergens: [], desc: 'Spiced whole potatoes in a tangy coriander and red chili masala.' },
        { id: 'raj_mutter_paneer', name: 'Mutter Paneer', category: 'Rajasthani-Main', cuisine: 'rajasthani', price: 0, active: true, cal: 280, protein: 14, carbs: 16, fat: 18, allergens: ['Dairy'], desc: 'Tender peas and cottage cheese in a rich tomato-spiced gravy.' },
        // Breads
        { id: 'raj_plain_baati', name: 'Plain Baati', category: 'Rajasthani-Breads', cuisine: 'rajasthani', price: 0, active: true, cal: 180, protein: 5, carbs: 28, fat: 6, allergens: ['Gluten'], desc: 'Hard wheat flour dumplings baked in a wood fire and dunked in ghee — the soul of Rajasthani cuisine.' },
        { id: 'raj_masala_baati', name: 'Masala Baati', category: 'Rajasthani-Breads', cuisine: 'rajasthani', price: 0, active: true, cal: 210, protein: 6, carbs: 28, fat: 9, allergens: ['Gluten', 'Dairy'], desc: 'Spiced stuffed baati with peas and paneer filling — a festive upgrade to the classic.' },
        { id: 'raj_moth_bajra_roti', name: 'Moth Bajra Roti', category: 'Rajasthani-Breads', cuisine: 'rajasthani', price: 0, active: true, cal: 140, protein: 5, carbs: 24, fat: 3, allergens: [], desc: 'Millet and moth bean flatbread — hearty, nutritious, and deeply Rajasthani.' },
        // Beverage
        { id: 'raj_masala_chaas', name: 'Masala Chaas', category: 'Rajasthani-Beverage', cuisine: 'rajasthani', price: 0, active: true, cal: 55, protein: 3, carbs: 5, fat: 2, allergens: ['Dairy'], desc: 'Chilled spiced buttermilk with roasted cumin, rock salt, and fresh ginger — Rajasthan in a glass.' }
    ];
    crmLeads = [];
    reviewsDB = [
        { id: 'r1', author: 'Vinay Khandelwal', text: 'Khandelwal Caters did an amazing job for my daughter\'s wedding! The Dal Bukhara and Jalebi Rabdi were the highlights. Flawless royal service.', approved: true },
        { id: 'r2', author: 'Rajesh Mittal', text: 'Highly professional team. The visual menu catalog and transparent booking coordination were outstanding!', approved: true },
        { id: 'r3', author: 'Sneha Verma', text: 'Their mocktail counter and Shahi Raj Kachori were massive hits among the guests. 10/10.', approved: true }
    ];
    galleryDB = [
        { id: 'g01', url: 'uploads/WhatsApp Video 2026-06-03 at 20.12.56.mp4', type: 'video', caption: 'Heritage Catering Entrance Setup' },
        { id: 'g02', url: 'uploads/WhatsApp Video 2026-06-03 at 20.12.56 (1).mp4', type: 'video', caption: 'Premium Buffet Service & Live Counters' },
        { id: 'g03', url: 'uploads/WhatsApp Video 2026-06-03 at 20.12.57.mp4', type: 'video', caption: 'Luxury Dining & Live Counter Layout' },
        { id: 'g04', url: 'uploads/WhatsApp Video 2026-06-03 at 20.12.44.mp4', type: 'video', caption: 'Shahi Presentation & Liquid Nitrogen Counters' },
        { id: 'g05', url: 'uploads/WhatsApp Video 2026-06-03 at 20.15.40.mp4', type: 'video', caption: 'Royal Guest Dining Area Presentation' },
        { id: 'g06', url: 'uploads/WhatsApp Video 2026-06-03 at 20.34.13.mp4', type: 'video', caption: 'Live Flambé & Stir Fry Counter' },
        { id: 'g07', url: 'uploads/WhatsApp Video 2026-06-03 at 20.37.15.mp4', type: 'video', caption: 'Bespoke Dessert Display Counter' },
        { id: 'g08', url: 'uploads/WhatsApp Image 2026-06-03 at 20.12.40.jpeg', type: 'image', caption: 'Gold Saffron Welcome Goblet Curation' },
        { id: 'g09', url: 'uploads/WhatsApp Image 2026-06-03 at 20.12.45.jpeg', type: 'image', caption: 'Royal Tandoori Paneer Starter Presentation' },
        { id: 'g10', url: 'uploads/WhatsApp Image 2026-06-03 at 20.12.46.jpeg', type: 'image', caption: 'Shahi Dal Bukhara Slow Cooking Pot' },
        { id: 'g11', url: 'uploads/WhatsApp Image 2026-06-03 at 20.12.56.jpeg', type: 'image', caption: 'Liquid Nitrogen Rose Ice Cream Live Station' },
        { id: 'g12', url: 'uploads/WhatsApp Image 2026-06-03 at 20.34.40.jpeg', type: 'image', caption: 'Heritage Pastry & Dessert Curation Platter' }
    ];
    calendarRules = [];
}

function applyCMSConfig(config) {
    document.body.style.setProperty('--base-font', `'${config.brand_font}', sans-serif`);
    document.body.style.setProperty('--primary', config.color_accent);
    document.body.style.setProperty('--primary-glow', hexToRgbA(config.color_accent, 0.15));
    
    const hTitle = document.getElementById('hero-title');
    const hSub = document.getElementById('hero-subtitle');
    const hVid = document.getElementById('hero-bg-video');
    const cmsF = document.getElementById('cms-font-select');
    const cmsC = document.getElementById('cms-color-picker');
    const cmsT = document.getElementById('cms-hero-title');
    const cmsS = document.getElementById('cms-hero-sub');

    if (hTitle) hTitle.innerText = config.hero_title;
    if (hSub) hSub.innerText = config.hero_sub;
    if (hVid && config.hero_video) hVid.src = config.hero_video;
    
    // Sync admin inputs
    if (cmsF) cmsF.value = config.brand_font;
    if (cmsC) {
        cmsC.value = config.color_accent;
        document.getElementById('cms-color-val').innerText = config.color_accent;
    }
    if (cmsT) cmsT.value = config.hero_title;
    if (cmsS) cmsS.value = config.hero_sub;
}

function hexToRgbA(hex, alpha) {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x' + c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    return 'rgba(10,78,53,'+alpha+')';
}

// --- FRONTEND STEPS ENGINE ---
window.switchThemePreset = function(themeClass, dotEl) {
    document.body.className = themeClass;
    document.querySelectorAll('.theme-dot').forEach(dot => dot.classList.remove('active'));
    if(dotEl) dotEl.classList.add('active');
    
    const skinSelect = document.getElementById('admin-skin');
    if(skinSelect) skinSelect.value = themeClass;
}

window.nextQuiz = function(step, val) {
    document.querySelectorAll('.quiz-card').forEach(el => el.style.display = 'none');
    if(document.getElementById('quiz-step-' + step)) {
        document.getElementById('quiz-step-' + step).style.display = 'block';
    }
}

window.finishQuiz = function(preset) {
    document.querySelectorAll('.quiz-card').forEach(el => el.style.display = 'none');
    document.getElementById('quiz-result').style.display = 'block';
    applyPackagePreset(preset);
}

window.goToStep = function(step) {
    document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step-node').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`step-${step}-content`).classList.add('active');
    
    for(let i=1; i<=4; i++) {
        let node = document.getElementById(`node-${i}`);
        if(node) {
            if(i < step) node.classList.add('completed');
            else node.classList.remove('completed');
        }
    }
    const currentNode = document.getElementById(`node-${step}`);
    if(currentNode) currentNode.classList.add('active');
    
    let progress = ((step-1)/3)*100;
    const progressLine = document.getElementById('step-progress-line');
    if(progressLine) progressLine.style.width = `${progress}%`;
    currentStep = step;

    const floatingBar = document.getElementById('floating-bar');
    if(floatingBar) {
        if(step === 2 || step === 3) floatingBar.classList.add('show');
        else floatingBar.classList.remove('show');
    }

    if (step === 3) {
        setTimeout(() => {
            init3DPlate();
            update3DDishes();
        }, 150);
    }
}

window.nextStep = function() { if(currentStep < 4) goToStep(currentStep + 1); }
window.prevStep = function() { if(currentStep > 1) goToStep(currentStep - 1); }

window.updateGuestSliderVal = function() {
    const slider = document.getElementById('guest-count');
    if(slider) guestCount = parseInt(slider.value);
    
    const valLabel = document.getElementById('guest-count-val');
    if(valLabel) valLabel.innerText = guestCount;
    
    const sumGuestLabel = document.getElementById('summary-guest-count');
    if(sumGuestLabel) sumGuestLabel.innerText = guestCount;
    
    const floatLabel = document.getElementById('float-guests');
    if(floatLabel) floatLabel.innerText = guestCount;
    
    let badge = document.getElementById('discount-tier-badge');
    if(badge) {
        if(guestCount >= 800) badge.innerText = "15% VIP Discount";
        else if(guestCount >= 500) badge.innerText = "10% Volume Discount";
        else if(guestCount >= 300) badge.innerText = "5% Discount";
        else badge.innerText = "No Discount";
    }
    
    recalculateTotal();
}

window.validateEventDate = function() {
    let dateVal = document.getElementById('event-date').value;
    let msg = document.getElementById('date-status-msg');
    let surRow = document.getElementById('summary-surcharge-row');
    
    const matchedRule = calendarRules.find(r => r.date === dateVal);
    if(matchedRule && matchedRule.condition.includes('Surcharge')) {
        const ratePct = parseInt(matchedRule.rate.replace(/[^0-9]/g, '')) / 100;
        msg.innerHTML = `<span class="text-danger"><i class="fa-solid fa-bolt"></i> ${matchedRule.condition}! ${matchedRule.rate} Surcharge applies.</span>`;
        peakSurcharge = ratePct;
        if(surRow) surRow.style.display = 'flex';
        const surVal = document.getElementById('summary-surcharge-val');
        if(surVal) surVal.innerText = matchedRule.rate;
    } else if (matchedRule && matchedRule.condition.includes('Sold Out')) {
        msg.innerHTML = '<span class="text-danger"><i class="fa-solid fa-circle-xmark"></i> Date is Sold Out. Please select another date.</span>';
        peakSurcharge = 0;
        if(surRow) surRow.style.display = 'none';
    } else {
        msg.innerHTML = '<span class="text-success"><i class="fa-solid fa-check"></i> Date is available.</span>';
        peakSurcharge = 0;
        if(surRow) surRow.style.display = 'none';
    }
    recalculateTotal();
}

window.switchMenuTab = function(category) {
    switchBookPage(category);
}

function getCategoryIcon(category) {
    switch(category) {
        case 'Drink': return '<i class="fa-solid fa-glass-water"></i>';
        case 'Starter': return '<i class="fa-solid fa-cookie"></i>';
        case 'Main': return '<i class="fa-solid fa-bowl-food"></i>';
        case 'Dessert': return '<i class="fa-solid fa-ice-cream"></i>';
        default: return '<i class="fa-solid fa-plate-wheat"></i>';
    }
}

window.toggleMenuItem = function(id, price, category) {
    let card = document.getElementById(`card-${id}`);
    let idx = selectedItems.findIndex(x => x.id === id);
    if(idx > -1) {
        selectedItems.splice(idx, 1);
        if(card) card.classList.remove('selected');
    } else {
        selectedItems.push({ id, price, category });
        if(card) card.classList.add('selected');
    }
    recalculateTotal();
    
    // Update active grids to ensure border updates in all circular cards
    renderAllMenuGrids();
    
    if (plateInitialized && currentStep === 3) {
        update3DDishes();
    }
}

function applyPackagePreset(preset) {
    switchActiveMenuPreset(preset, null);
}

function recalculateTotal() {
    basePlatePrice = 0;
    addonTotal = 0;
    
    const plateCountEl = document.getElementById('summary-plate-count');
    if(plateCountEl) plateCountEl.innerText = selectedItems.length + ' Items';
    
    const floatItemsEl = document.getElementById('float-items-count');
    if(floatItemsEl) floatItemsEl.innerText = selectedItems.length + ' Items';
    
    const platePriceEl = document.getElementById('summary-plate-price');
    if(platePriceEl) platePriceEl.innerText = '₹0';
    
    const floatPlateEl = document.getElementById('float-plate-price');
    if(floatPlateEl) floatPlateEl.innerText = '₹0';
    
    const addonsEl = document.getElementById('summary-addons-price');
    if(addonsEl) addonsEl.innerText = '₹0';
    
    const floatAddonsEl = document.getElementById('float-addons');
    if(floatAddonsEl) floatAddonsEl.innerText = '₹0';
    
    const totalEl = document.getElementById('summary-total-bill');
    if(totalEl) totalEl.innerText = '₹0';
    
    const floatTotalEl = document.getElementById('float-total-bill');
    if(floatTotalEl) floatTotalEl.innerText = '₹0';

    // Update design aesthetic descriptions
    const styleDisplayMap = { 'gold': 'Gold Rim', 'silver': 'Silver Rim', 'obsidian': 'Obsidian Style' };
    const styleName = styleDisplayMap[activePlateStyle] || 'Gold Rim';
    
    const summaryDiningEl = document.getElementById('summary-dining-style');
    if(summaryDiningEl) summaryDiningEl.innerText = styleName;

    const floatDiningEl = document.getElementById('float-dining-style');
    if(floatDiningEl) floatDiningEl.innerText = styleName;

    const clothDisplayMap = { 'silk': 'Gold Silk', 'linen': 'White Linen', 'wood': 'Rustic Wood' };
    const clothName = clothDisplayMap[selectedTableCloth] || 'Gold Silk';
    
    const summaryClothEl = document.getElementById('summary-tablecloth');
    if(summaryClothEl) summaryClothEl.innerText = clothName;

    const addN = document.getElementById('addon-nitrogen');
    const addI = document.getElementById('addon-ice');
    const addP = document.getElementById('addon-pizza');
    const addW = document.getElementById('addon-waiters');
    let selectedAddonNames = [];
    if(addN && addN.checked) selectedAddonNames.push("Nitrogen Mocktails");
    if(addI && addI.checked) selectedAddonNames.push("Ice Sculpture");
    if(addP && addP.checked) selectedAddonNames.push("Pizza Station");
    if(addW && addW.checked) selectedAddonNames.push("Silver Service");

    const addonsListEl = document.getElementById('summary-addons-list-names');
    if(addonsListEl) {
        addonsListEl.innerText = selectedAddonNames.length > 0 ? selectedAddonNames.join(', ') : 'None';
    }
}

function updateNutrientsPanel() {
    let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    let allergens = new Set();

    selectedItems.forEach(sel => {
        let dbItem = inventoryDB.find(x => x.id === sel.id);
        if(dbItem) {
            totalCal += dbItem.cal || 0;
            totalProtein += dbItem.protein || 0;
            totalCarbs += dbItem.carbs || 0;
            totalFat += dbItem.fat || 0;
            if(dbItem.allergens) {
                dbItem.allergens.forEach(allg => allergens.add(allg));
            }
        }
    });

    const calEl = document.getElementById('nutr-cal');
    const protEl = document.getElementById('nutr-protein');
    const carbEl = document.getElementById('nutr-carbs');
    const fatEl = document.getElementById('nutr-fat');

    if(calEl) calEl.innerText = totalCal;
    if(protEl) protEl.innerText = totalProtein + 'g';
    if(carbEl) carbEl.innerText = totalCarbs + 'g';
    if(fatEl) fatEl.innerText = totalFat + 'g';

    const listContainer = document.getElementById('allergens-list-container');
    if(listContainer) {
        listContainer.innerHTML = '';
        if(allergens.size === 0) {
            listContainer.innerHTML = `<span class="allergen-chip safe"><i class="fa-solid fa-circle-check"></i> Safe from Major Allergens</span>`;
        } else {
            allergens.forEach(allg => {
                listContainer.innerHTML += `<span class="allergen-chip"><i class="fa-solid fa-circle-exclamation"></i> Contains: ${allg}</span>`;
            });
        }
    }
}

// --- CALENDAR & surcharges ---
let calActiveMonth = 10; // November (0-indexed 10)
let calActiveYear = 2026;

window.adjustCalendarMonth = function(dir) {
    calActiveMonth += dir;
    if (calActiveMonth < 0) { calActiveMonth = 11; calActiveYear--; }
    if (calActiveMonth > 11) { calActiveMonth = 0; calActiveYear++; }
    
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('calendar-month-year').innerText = `${months[calActiveMonth]} ${calActiveYear}`;
    renderAdminCalendarGrid();
}

function renderAdminCalendarGrid() {
    const grid = document.getElementById('visual-calendar-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    // First day of active month
    const firstDay = new Date(calActiveYear, calActiveMonth, 1).getDay();
    const daysInMonth = new Date(calActiveYear, calActiveMonth + 1, 0).getDate();
    
    // Blank padding nodes
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div class="calendar-day-node empty" style="border:none; background:transparent; cursor:default;"></div>`;
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${calActiveYear}-${String(calActiveMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const rule = calendarRules.find(r => r.date === dateStr);
        
        let nodeClass = "calendar-day-node";
        let statusText = "Open";
        
        if (rule) {
            if (rule.condition.includes('Surcharge')) {
                nodeClass += " surcharged";
                statusText = rule.rate + " Peak";
            } else if (rule.condition.includes('Sold Out')) {
                nodeClass += " blocked";
                statusText = "Blocked";
            }
        }
        
        grid.innerHTML += `
            <div class="${nodeClass}" id="cal-day-${dateStr}" onclick="selectAdminCalendarDate('${dateStr}')">
                <span class="day-num">${day}</span>
                <span class="day-status">${statusText}</span>
            </div>
        `;
    }
}

window.selectAdminCalendarDate = function(dateStr) {
    document.querySelectorAll('.calendar-day-node').forEach(n => n.classList.remove('selected'));
    const matchedNode = document.getElementById('cal-day-' + dateStr);
    if (matchedNode) matchedNode.classList.add('selected');
    
    document.getElementById('lock-date-input').value = dateStr;
    const rule = calendarRules.find(r => r.date === dateStr);
    
    const actSel = document.getElementById('date-action');
    const surPct = document.getElementById('surcharge-pct');
    const surGrp = document.getElementById('surcharge-input-group');

    if (rule) {
        if (rule.condition.includes('Surcharge')) {
            actSel.value = 'surcharge';
            surPct.value = rule.rate.replace(/[^0-9]/g, '');
            surGrp.style.display = 'block';
        } else if (rule.condition.includes('Sold Out')) {
            actSel.value = 'block';
            surGrp.style.display = 'none';
        }
    } else {
        actSel.value = 'unlock';
        surGrp.style.display = 'none';
    }
}

window.toggleSurchargeInput = function(val) {
    document.getElementById('surcharge-input-group').style.display = val === 'surcharge' ? 'block' : 'none';
}

window.applyCalendarConfig = async () => {
    const date = document.getElementById('lock-date-input').value;
    const action = document.getElementById('date-action').value;
    
    if (!date) { alert("Please select a date from the calendar first."); return; }
    
    let body = { date };
    if (action === 'unlock') {
        body.remove = true;
    } else if (action === 'surcharge') {
        body.condition = 'Peak Muhurat Surcharge';
        body.rate = '+ 0%';
    } else if (action === 'block') {
        body.condition = 'Sold Out (Blocked)';
        body.rate = 'Blocked';
    }

    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        try {
            const res = await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const dbRules = await res.json();
            calendarRules = dbRules.rules;
        } catch (e) { console.error(e); }
    } else {
        if (body.remove) {
            calendarRules = calendarRules.filter(r => r.date !== date);
        } else {
            calendarRules = calendarRules.filter(r => r.date !== date);
            calendarRules.push({ date, condition: body.condition, rate: body.rate });
        }
        localStorage.setItem('local_calendarRules', JSON.stringify(calendarRules));
    }
    
    alert("Calendar rule updated successfully.");
    renderAdminCalendarGrid();
    renderCalendarRulesTable();
}

function renderCalendarRulesTable() {
    const tbody = document.getElementById('calendar-rules-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    calendarRules.forEach(rule => {
        tbody.innerHTML += `
            <tr>
                <td>${rule.date}</td>
                <td>${rule.condition}</td>
                <td>${rule.rate}</td>
                <td><button class="small-btn primary-btn" style="background:#FF1744;" onclick="removeCalendarRuleDirect('${rule.date}')"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
    });
}

window.removeCalendarRuleDirect = async (date) => {
    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        try {
            const res = await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, remove: true })
            });
            const dbRules = await res.json();
            calendarRules = dbRules.rules;
        } catch (e) { console.error(e); }
    } else {
        calendarRules = calendarRules.filter(r => r.date !== date);
        localStorage.setItem('local_calendarRules', JSON.stringify(calendarRules));
    }
    renderAdminCalendarGrid();
    renderCalendarRulesTable();
}

// --- Event Aesthetics Curation (Tablecloth and Plate Rim styles) ---
window.switchTableCloth = function(style, btnEl) {
    document.querySelectorAll('.table-cloth-btn').forEach(btn => btn.classList.remove('active'));
    if(btnEl) btnEl.classList.add('active');
    selectedTableCloth = style;
}

window.switchPlateFinish = function(style, btnEl) {
    document.querySelectorAll('.plate-finish-panel button').forEach(btn => btn.classList.remove('active'));
    if(btnEl) btnEl.classList.add('active');
    activePlateStyle = style;
}

// --- 3D DISH POPUP MODAL THR// --- 3D Scene Global Variables for the Step 3 Plate Planner
let plateScene = null;
let plateCamera = null;
let plateRenderer = null;
let plateControls = null;
let plateMesh = null;
let rimMeshStep3 = null;
let tableClothMesh = null;
let dishesGroup = null;
let plateSteamParticles = null;
let plateInitialized = false;

// --- 3D DISH POPUP MODAL THREEJS ENGINE ---
window.open3DDishModal = function(itemId) {
    const item = inventoryDB.find(x => x.id === itemId);
    if (!item) return;

    activeDishId = itemId;
    
    document.getElementById('dish-modal-title').innerText = item.name;
    document.getElementById('dish-modal-price').innerText = `₹${item.price}`;
    document.getElementById('dish-modal-desc').innerText = item.desc || "Our handcrafted luxury culinary recipe made with premium locally sourced ingredients, customized with royal heritage garnish.";
    
    // Nutrition sync
    document.getElementById('modal-cal').innerText = item.cal || 150;
    document.getElementById('modal-protein').innerText = (item.protein || 4) + 'g';
    document.getElementById('modal-carbs').innerText = (item.carbs || 20) + 'g';
    document.getElementById('modal-fat').innerText = (item.fat || 5) + 'g';

    // Button status sync
    const isSelected = selectedItems.find(x => x.id === itemId);
    const addBtn = document.getElementById('modal-add-to-menu-btn');
    if (isSelected) {
        addBtn.innerHTML = `<i class="fa-solid fa-circle-minus"></i> Remove from Custom Menu`;
        addBtn.style.background = '#801818';
    } else {
        addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add to Custom Menu`;
        addBtn.style.background = 'var(--primary)';
    }

    document.getElementById('dish-3d-modal').classList.add('show');
    
    // Initialize 3D scene in modal
    setTimeout(() => {
        initDish3DScene();
        loadDishModel(itemId);
    }, 150);
}

window.close3DDishModal = function() {
    document.getElementById('dish-3d-modal').classList.remove('show');
    // Stop animations and clear geometries to free memory
    if (activeDishMesh) {
        modalScene.remove(activeDishMesh);
        activeDishMesh = null;
    }
}

window.toggleMenuItemFromModal = function() {
    if(!activeDishId) return;
    const item = inventoryDB.find(x => x.id === activeDishId);
    if(!item) return;

    toggleMenuItem(item.id, item.price, item.category);
    
    // Update button display
    const isSelected = selectedItems.find(x => x.id === item.id);
    const addBtn = document.getElementById('modal-add-to-menu-btn');
    if (isSelected) {
        addBtn.innerHTML = `<i class="fa-solid fa-circle-minus"></i> Remove from Custom Menu`;
        addBtn.style.background = '#801818';
    } else {
        addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add to Custom Menu`;
        addBtn.style.background = 'var(--primary)';
    }
}

function initDish3DScene() {
    if (modalInitialized) {
        // Handle resizing if container changed
        const container = document.querySelector('.dish-modal-canvas-area');
        if (container && modalRenderer) {
            modalCamera.aspect = container.clientWidth / container.clientHeight;
            modalCamera.updateProjectionMatrix();
            modalRenderer.setSize(container.clientWidth, container.clientHeight);
        }
        return;
    }

    const container = document.querySelector('.dish-modal-canvas-area');
    const canvas = document.getElementById('dish-modal-canvas');
    if (!container || !canvas) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // 1. Scene
    modalScene = new THREE.Scene();
    modalScene.fog = new THREE.FogExp2(0x0a2216, 0.015);

    // 2. Camera
    modalCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    modalCamera.position.set(0, 4, 7);

    // 3. Renderer
    modalRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    modalRenderer.setSize(width, height);
    modalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    modalRenderer.shadowMap.enabled = true;
    modalRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Controls
    modalControls = new THREE.OrbitControls(modalCamera, modalRenderer.domElement);
    modalControls.enableDamping = true;
    modalControls.dampingFactor = 0.05;
    modalControls.minDistance = 3;
    modalControls.maxDistance = 15;
    modalControls.maxPolarAngle = Math.PI / 2.1; // Block looking under plate

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    modalScene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    modalScene.add(dirLight);

    const accentLight = new THREE.PointLight(0xd4af37, 0.75, 15);
    accentLight.position.set(-4, 2, -4);
    modalScene.add(accentLight);

    // 6. Plate
    const plateGroup = new THREE.Group();
    plateGroup.position.y = -0.5;
    
    // Gold/Silver rim cylinder
    const rimGeom = new THREE.CylinderGeometry(2.1, 2.1, 0.15, 64);
    let rimColor = 0xd4af37;
    if (activePlateStyle === 'silver') rimColor = 0xcccccc;
    if (activePlateStyle === 'obsidian') rimColor = 0x1a1a1a;

    const rimMat = new THREE.MeshPhysicalMaterial({
        color: rimColor,
        metalness: activePlateStyle === 'obsidian' ? 0.2 : 0.9,
        roughness: 0.1,
        clearcoat: 1.0
    });
    const rimMesh = new THREE.Mesh(rimGeom, rimMat);
    rimMesh.receiveShadow = true;
    rimMesh.castShadow = true;
    plateGroup.add(rimMesh);

    // Porcelain center
    const porcelainGeom = new THREE.CylinderGeometry(1.85, 1.85, 0.12, 64);
    const porcelainMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.05
    });
    const porcelainMesh = new THREE.Mesh(porcelainGeom, porcelainMat);
    porcelainMesh.position.y = 0.02;
    porcelainMesh.receiveShadow = true;
    plateGroup.add(porcelainMesh);

    modalScene.add(plateGroup);

    // 7. Vapor/Steam particles
    const particleCount = 20;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 2;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    });
    modalSteamParticles = new THREE.Points(particleGeom, particleMat);
    modalSteamParticles.position.y = 0.2;
    modalScene.add(modalSteamParticles);

    // Animation loop
    function animateModal() {
        requestAnimationFrame(animateModal);
        
        // Spin the dish
        if (activeDishMesh) {
            activeDishMesh.rotation.y += modalRotationSpeed;
        }

        // Animate steam particles rising
        if (modalSteamParticles) {
            const positions = modalSteamParticles.geometry.attributes.position.array;
            for(let i = 1; i < positions.length; i += 3) {
                positions[i] += 0.015;
                if (positions[i] > 1.8) {
                    positions[i] = 0;
                    positions[i-1] = (Math.random() - 0.5) * 1.5;
                    positions[i+1] = (Math.random() - 0.5) * 1.5;
                }
            }
            modalSteamParticles.geometry.attributes.position.needsUpdate = true;
        }

        if (modalControls) modalControls.update();
        if (modalRenderer && modalScene && modalCamera) {
            modalRenderer.render(modalScene, modalCamera);
        }
    }
    
    animateModal();
    modalInitialized = true;
}

function loadDishModel(itemId) {
    if (activeDishMesh) {
        modalScene.remove(activeDishMesh);
        activeDishMesh = null;
    }

    activeDishMesh = new THREE.Group();
    activeDishMesh.position.y = -0.35; // Position on top of the porcelain plate
    modalScene.add(activeDishMesh);

    // Try to load the 3D model .glb from local folder, otherwise fallback to procedural
    if (typeof THREE.GLTFLoader !== 'undefined') {
        const loader = new THREE.GLTFLoader();
        loader.load(`/uploads/models/${itemId}.glb`, (gltf) => {
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scaleFactor = 1.6 / maxDim; // Fit nicely on plate
            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
            
            const center = box.getCenter(new THREE.Vector3());
            model.position.copy(center).multiplyScalar(-scaleFactor);
            model.position.y += 0.1;

            model.traverse(node => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            activeDishMesh.add(model);
        }, undefined, () => {
            // Fallback to beautiful procedural 3D model
            buildProceduralDishGeometry(itemId, activeDishMesh);
        });
    } else {
        buildProceduralDishGeometry(itemId, activeDishMesh);
    }
}

function buildProceduralDishGeometry(itemId, parentGroup) {
    const item = inventoryDB.find(x => x.id === itemId);
    if (!item) return;

    if (item.category === 'Drink') {
        if (itemId.includes('shot')) {
            // Revolving Belt Shot Bottle
            const bottleGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.9, 16);
            const neckGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16);
            const capGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16);
            
            const bottleMat = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3,
                transmission: 0.9,
                roughness: 0.1
            });
            const capMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 });
            
            const bottle = new THREE.Mesh(bottleGeom, bottleMat);
            const neck = new THREE.Mesh(neckGeom, bottleMat);
            const cap = new THREE.Mesh(capGeom, capMat);
            
            bottle.position.y = 0.45;
            neck.position.y = 1.05;
            cap.position.y = 1.2;
            
            parentGroup.add(bottle);
            parentGroup.add(neck);
            parentGroup.add(cap);
            
            // Shot content color
            let fluidColor = 0x2e7d32; // Paan (green)
            if (itemId.includes('jamun')) fluidColor = 0x4a148c; // Jamun (purple)
            if (itemId.includes('coconut')) fluidColor = 0xffffff; // Coconut (white)
            
            const fluidGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.75, 16);
            const fluidMat = new THREE.MeshStandardMaterial({ color: fluidColor, roughness: 0.2, transparent: true, opacity: 0.85 });
            const fluid = new THREE.Mesh(fluidGeom, fluidMat);
            fluid.position.y = 0.38;
            parentGroup.add(fluid);
            
        } else if (itemId.includes('martini')) {
            // Elegant Martini Glass
            const coneGeom = new THREE.ConeGeometry(0.5, 0.5, 32, 1, true);
            const stemGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 16);
            const baseGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 32);
            
            const glassMat = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.2,
                transmission: 0.95,
                roughness: 0.05
            });
            
            const bowl = new THREE.Mesh(coneGeom, glassMat);
            const stem = new THREE.Mesh(stemGeom, glassMat);
            const base = new THREE.Mesh(baseGeom, glassMat);
            
            bowl.position.y = 1.05;
            stem.position.y = 0.4;
            base.position.y = 0.02;
            
            parentGroup.add(bowl);
            parentGroup.add(stem);
            parentGroup.add(base);
            
            // Fusion liquid
            let fluidColor = 0xffb300; // Chili Aamras (orange/mango)
            if (itemId.includes('peru')) fluidColor = 0xff8a80; // Chili Peru (pink/guava)
            
            const fluidGeom = new THREE.ConeGeometry(0.46, 0.35, 32);
            const fluidMat = new THREE.MeshStandardMaterial({ color: fluidColor, roughness: 0.2 });
            const fluid = new THREE.Mesh(fluidGeom, fluidMat);
            fluid.position.y = 1.08;
            parentGroup.add(fluid);
            
            // Red chili garnish on rim
            const chiliGeom = new THREE.CylinderGeometry(0.04, 0.01, 0.25, 8);
            const chiliMat = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.5 });
            const chili = new THREE.Mesh(chiliGeom, chiliMat);
            chili.position.set(0.48, 1.25, 0);
            chili.rotation.z = -Math.PI / 4;
            parentGroup.add(chili);
            
        } else if (itemId.includes('lassi') || itemId.includes('milk') || itemId.includes('butter') || itemId === 'd4' || itemId === 'd5') {
            // Earthen Kulhad Pot for Lassi / Buttermilk
            const potBase = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.2, 0.7, 32),
                new THREE.MeshStandardMaterial({ color: 0xa16f5c, roughness: 0.9 })
            );
            potBase.position.y = 0.35;
            parentGroup.add(potBase);

            const potRim = new THREE.Mesh(
                new THREE.CylinderGeometry(0.45, 0.35, 0.3, 32),
                new THREE.MeshStandardMaterial({ color: 0xa16f5c, roughness: 0.9 })
            );
            potRim.position.y = 0.85;
            parentGroup.add(potRim);

            // Cream/Lassi liquid
            let liquidColor = 0xfff3e0; // thick sweet cream
            if (itemId.includes('butter') || itemId === 'd5') liquidColor = 0xf5f5f5;

            const liquidGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.1, 32);
            const liquidMat = new THREE.MeshStandardMaterial({ color: liquidColor, roughness: 0.5 });
            const liquid = new THREE.Mesh(liquidGeom, liquidMat);
            liquid.position.y = 0.96;
            parentGroup.add(liquid);

            // Garnish: cardamom particles, pistachio slivers
            for(let k=0; k<12; k++) {
                const bit = new THREE.Mesh(
                    new THREE.SphereGeometry(0.02, 6, 6),
                    new THREE.MeshBasicMaterial({ color: k % 2 === 0 ? 0x2e7d32 : 0xfbc02d })
                );
                const r = 0.15 + Math.random()*0.2;
                const theta = Math.random()*Math.PI*2;
                bit.position.set(r*Math.cos(theta), 0.98, r*Math.sin(theta));
                parentGroup.add(bit);
            }

            // Saffron lines
            for(let k=0; k<4; k++) {
                const lineGeom = new THREE.BoxGeometry(0.12, 0.005, 0.015);
                const lineMat = new THREE.MeshBasicMaterial({ color: 0xff6d00 });
                const line = new THREE.Mesh(lineGeom, lineMat);
                line.position.set((Math.random()-0.5)*0.3, 0.985, (Math.random()-0.5)*0.3);
                line.rotation.y = Math.random()*Math.PI;
                parentGroup.add(line);
            }
            
        } else {
            // High-end crystal glass
            const glassGeom = new THREE.CylinderGeometry(0.45, 0.25, 1.4, 32, 1, true);
            const glassMat = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.2,
                transmission: 0.95,
                roughness: 0.05,
                metalness: 0.05,
                ior: 1.5,
                thickness: 0.1
            });
            const glass = new THREE.Mesh(glassGeom, glassMat);
            glass.position.y = 0.7;
            glass.castShadow = true;
            parentGroup.add(glass);

            const stemGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 16);
            const baseGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 32);
            const stemMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.1 });
            const stem = new THREE.Mesh(stemGeom, stemMat);
            const base = new THREE.Mesh(baseGeom, stemMat);
            stem.position.y = 0.25;
            base.position.y = 0.025;
            parentGroup.add(stem);
            parentGroup.add(base);

            let liquidColor = 0xffd700; // saffron gold
            if (itemId.includes('berry')) liquidColor = 0x8b0000;
            if (itemId.includes('kiwi')) liquidColor = 0x2e8b57;
            if (itemId.includes('tea') || itemId === 'bf_tea') liquidColor = 0x8d6e63;
            if (itemId.includes('coffee') || itemId === 'bf_coffee') liquidColor = 0x4e342e;
            if (itemId.includes('pineapple')) liquidColor = 0xfbc02d;

            const liquidGeom = new THREE.CylinderGeometry(0.43, 0.24, 0.9, 32);
            const liquidMat = new THREE.MeshPhysicalMaterial({
                color: liquidColor,
                roughness: 0.1,
                metalness: 0.1,
                transmission: 0.65,
                thickness: 0.3,
                transparent: true,
                opacity: 0.85
            });
            const liquid = new THREE.Mesh(liquidGeom, liquidMat);
            liquid.position.y = 0.65;
            parentGroup.add(liquid);

            // Foam / Bubbles
            if (itemId.includes('tea') || itemId.includes('coffee') || itemId === 'bf_tea' || itemId === 'bf_coffee') {
                const foamGeom = new THREE.CylinderGeometry(0.44, 0.44, 0.08, 32);
                const foamMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.8 });
                const foam = new THREE.Mesh(foamGeom, foamMat);
                foam.position.y = 1.1;
                parentGroup.add(foam);
            }

            const strawGeom = new THREE.CylinderGeometry(0.025, 0.025, 1.6, 8);
            const strawMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
            const straw = new THREE.Mesh(strawGeom, strawMat);
            straw.position.set(0.2, 0.95, 0.2);
            straw.rotation.set(Math.PI/6, 0, Math.PI/12);
            parentGroup.add(straw);
        }

    } else if (item.category === 'Starter') {
        if (itemId.includes('paneer') || itemId.includes('tikka') || itemId.includes('chaap') || itemId.includes('shole') || itemId.includes('aloo') || itemId === 's2' || itemId === 'ex_sc') {
            // Highly realistic tandoori skewer
            const skewerGeom = new THREE.CylinderGeometry(0.015, 0.015, 2.2, 8);
            const skewerMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
            const skewer = new THREE.Mesh(skewerGeom, skewerMat);
            skewer.position.y = 0.45;
            skewer.rotation.x = Math.PI / 2.2;
            parentGroup.add(skewer);

            const handleGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 16);
            const handleMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });
            const handle = new THREE.Mesh(handleGeom, handleMat);
            handle.position.set(0, 0.45, 1.0);
            handle.rotation.x = Math.PI / 2.2;
            parentGroup.add(handle);

            for (let j = 0; j < 4; j++) {
                const z = -0.7 + (j * 0.42);
                
                let paneerColor = 0xffb300; // tandoori yellow-orange
                if (itemId.includes('malai')) paneerColor = 0xfffee0;
                if (itemId.includes('amritsari')) paneerColor = 0xe64a19;
                if (itemId.includes('chaap') || itemId === 'ex_sc') paneerColor = 0xd84315;
                if (itemId.includes('aloo')) paneerColor = 0xffca28;

                let chunk;
                if (itemId.includes('chaap') || itemId === 'ex_sc') {
                    chunk = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.25, 0.25, 0.35, 16),
                        new THREE.MeshStandardMaterial({ color: paneerColor, roughness: 0.7 })
                    );
                    chunk.rotation.x = Math.PI / 2;
                } else if (itemId.includes('aloo')) {
                    chunk = new THREE.Mesh(
                        new THREE.SphereGeometry(0.28, 16, 16),
                        new THREE.MeshStandardMaterial({ color: paneerColor, roughness: 0.8 })
                    );
                    chunk.scale.set(1.0, 1.2, 1.0);
                } else {
                    chunk = new THREE.Mesh(
                        new THREE.BoxGeometry(0.38, 0.38, 0.38),
                        new THREE.MeshStandardMaterial({ color: paneerColor, roughness: 0.7 })
                    );
                }
                chunk.position.set(0, 0.45, z);
                chunk.rotation.set(Math.random()*0.1, Math.random()*0.1, Math.random()*0.2);
                parentGroup.add(chunk);

                // Charred spots
                for(let k=0; k<3; k++) {
                    const charSpot = new THREE.Mesh(
                        new THREE.BoxGeometry(0.15, 0.02, 0.39),
                        new THREE.MeshBasicMaterial({ color: 0x111111 })
                    );
                    charSpot.position.copy(chunk.position);
                    charSpot.position.x += (Math.random() - 0.5) * 0.2;
                    charSpot.position.y += (Math.random() - 0.5) * 0.2;
                    charSpot.rotation.y = Math.random() * Math.PI;
                    parentGroup.add(charSpot);
                }

                const pepper = new THREE.Mesh(
                    new THREE.BoxGeometry(0.34, 0.1, 0.34),
                    new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.5 })
                );
                pepper.position.set(0, 0.45, z - 0.2);
                parentGroup.add(pepper);

                const onion = new THREE.Mesh(
                    new THREE.BoxGeometry(0.32, 0.08, 0.32),
                    new THREE.MeshStandardMaterial({ color: 0x6a1b9a, roughness: 0.6 })
                );
                onion.position.set(0, 0.45, z - 0.1);
                onion.rotation.y = Math.PI / 4;
                parentGroup.add(onion);
            }

            const lemon = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16),
                new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.5 })
            );
            lemon.position.set(-0.7, 0.05, 0.7);
            lemon.rotation.set(Math.PI/2, 0, Math.PI/4);
            parentGroup.add(lemon);

        } else if (itemId.includes('kabab') || itemId.includes('hb') || itemId.includes('ckb') || itemId === 'ex_hb' || itemId === 'ex_ckb') {
            // Realistic Patties / Kababs
            for (let j = 0; j < 4; j++) {
                const kababColor = (itemId.includes('hara') || itemId.includes('hb') || itemId === 'ex_hb') ? 0x1b5e20 : 0xe65100;
                const kabab = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.28, 0.28, 0.12, 16),
                    new THREE.MeshStandardMaterial({ color: kababColor, roughness: 0.9 })
                );
                const angle = (j / 4) * Math.PI * 2;
                const r = 0.5;
                kabab.position.set(r*Math.cos(angle), 0.08, r*Math.sin(angle));
                kabab.rotation.set(Math.PI/12, Math.random()*Math.PI, Math.PI/20);
                parentGroup.add(kabab);

                // Cashew nut
                const cashew = new THREE.Mesh(
                    new THREE.TorusGeometry(0.08, 0.03, 8, 16, Math.PI * 1.2),
                    new THREE.MeshStandardMaterial({ color: 0xfffde7, roughness: 0.6 })
                );
                cashew.position.copy(kabab.position);
                cashew.position.y += 0.07;
                cashew.rotation.set(Math.PI/2, 0, Math.random()*Math.PI);
                parentGroup.add(cashew);

                const grillLine = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.015, 0.015),
                    new THREE.MeshBasicMaterial({ color: 0x3e2723 })
                );
                grillLine.position.copy(kabab.position);
                grillLine.position.y += 0.065;
                grillLine.rotation.y = Math.PI / 4;
                parentGroup.add(grillLine);
            }
        } else if (itemId.includes('samosa') || itemId.includes('pakora') || itemId.includes('pakoda') || itemId.includes('rolls') || itemId.includes('dhokla') || itemId === 'ht1' || itemId === 'ht2' || itemId === 'ht3' || itemId === 'ht4') {
            if (itemId.includes('dhokla') || itemId === 'ht2') {
                // Golden spongy Dhokla blocks
                for(let j=0; j<4; j++) {
                    const dhokla = new THREE.Mesh(
                        new THREE.BoxGeometry(0.32, 0.32, 0.32),
                        new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.8 })
                    );
                    const angle = (j / 4) * Math.PI * 2;
                    const r = 0.45;
                    dhokla.position.set(r*Math.cos(angle), 0.16, r*Math.sin(angle));
                    dhokla.rotation.set(0, Math.random()*0.2, 0);
                    parentGroup.add(dhokla);

                    for(let k=0; k<5; k++) {
                        const seed = new THREE.Mesh(
                            new THREE.SphereGeometry(0.015, 4, 4),
                            new THREE.MeshBasicMaterial({ color: 0x000000 })
                        );
                        seed.position.copy(dhokla.position);
                        seed.position.x += (Math.random()-0.5)*0.2;
                        seed.position.y += 0.17;
                        seed.position.z += (Math.random()-0.5)*0.2;
                        parentGroup.add(seed);
                    }

                    const chiliSlice = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8),
                        new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 })
                    );
                    chiliSlice.position.copy(dhokla.position);
                    chiliSlice.position.y += 0.175;
                    chiliSlice.rotation.set(Math.PI/2, 0, Math.random()*Math.PI);
                    parentGroup.add(chiliSlice);
                }
            } else if (itemId.includes('samosa') || itemId === 'ht4') {
                // Triangular Samosas
                for(let j=0; j<3; j++) {
                    const samosa = new THREE.Mesh(
                        new THREE.ConeGeometry(0.32, 0.4, 3),
                        new THREE.MeshStandardMaterial({ color: 0xe6a15c, roughness: 0.7 })
                    );
                    const angle = (j / 3) * Math.PI * 2;
                    const r = 0.45;
                    samosa.position.set(r*Math.cos(angle), 0.2, r*Math.sin(angle));
                    samosa.rotation.set(Math.PI/2, 0, angle + Math.PI/6);
                    parentGroup.add(samosa);

                    const spots = new THREE.Mesh(
                        new THREE.SphereGeometry(0.06, 6, 6),
                        new THREE.MeshBasicMaterial({ color: 0xb5651d })
                    );
                    spots.scale.set(1.5, 0.2, 1.0);
                    spots.position.copy(samosa.position);
                    spots.position.y += 0.1;
                    parentGroup.add(spots);
                }
            } else {
                // Crispy golden bread rolls / Pakoras
                for (let j = 0; j < 5; j++) {
                    const roll = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.12, 0.12, 0.85, 16),
                        new THREE.MeshStandardMaterial({ color: 0xb5893c, roughness: 0.5 })
                    );
                    roll.position.set((j-2)*0.25, 0.15, (Math.random()-0.5)*0.2);
                    roll.rotation.set(Math.PI/2.3, Math.PI/12 * j, 0);
                    parentGroup.add(roll);
                }
            }
        } else {
            // Chaat items
            if (itemId.includes('kachori') || itemId.includes('rk') || itemId === 'ex_rk') {
                // Grand Shahi Raj Kachori
                const kachori = new THREE.Mesh(
                    new THREE.SphereGeometry(0.55, 32, 32),
                    new THREE.MeshStandardMaterial({ color: 0xe6a15c, roughness: 0.6 })
                );
                kachori.scale.set(1.1, 0.8, 1.1);
                kachori.position.y = 0.3;
                parentGroup.add(kachori);

                const curdSpill = new THREE.Mesh(
                    new THREE.SphereGeometry(0.42, 16, 16),
                    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
                );
                curdSpill.scale.set(1.0, 0.2, 1.0);
                curdSpill.position.set(0, 0.64, 0);
                parentGroup.add(curdSpill);

                for(let k=0; k<15; k++) {
                    const pomegranate = new THREE.Mesh(
                        new THREE.SphereGeometry(0.03, 6, 6),
                        new THREE.MeshBasicMaterial({ color: 0xd32f2f })
                    );
                    const r = Math.random()*0.35;
                    const theta = Math.random()*Math.PI*2;
                    pomegranate.position.set(r*Math.cos(theta), 0.69, r*Math.sin(theta));
                    parentGroup.add(pomegranate);

                    const strand = new THREE.Mesh(
                        new THREE.BoxGeometry(0.08, 0.005, 0.015),
                        new THREE.MeshBasicMaterial({ color: 0xffeb3b })
                    );
                    strand.position.set((Math.random()-0.5)*0.7, 0.7, (Math.random()-0.5)*0.7);
                    strand.rotation.y = Math.random()*Math.PI;
                    parentGroup.add(strand);
                }
            } else if (itemId.includes('golgappe') || itemId.includes('gg') || itemId === 'ex_gg') {
                for (let j = 0; j < 5; j++) {
                    const puri = new THREE.Mesh(
                        new THREE.SphereGeometry(0.2, 16, 16),
                        new THREE.MeshStandardMaterial({ color: 0xffca28, roughness: 0.6 })
                    );
                    const angle = (j / 5) * Math.PI * 2;
                    const r = 0.55;
                    puri.position.set(r*Math.cos(angle), 0.15, r*Math.sin(angle));
                    parentGroup.add(puri);

                    const filling = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12),
                        new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.9 })
                    );
                    filling.position.copy(puri.position);
                    filling.position.y += 0.18;
                    parentGroup.add(filling);
                }
            } else {
                for (let j = 0; j < 4; j++) {
                    const disk = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16),
                        new THREE.MeshStandardMaterial({ color: 0xbcaaa4, roughness: 0.8 })
                    );
                    const angle = (j / 4) * Math.PI * 2;
                    const r = 0.38;
                    disk.position.set(r*Math.cos(angle), 0.08, r*Math.sin(angle));
                    parentGroup.add(disk);

                    const sauce = new THREE.Mesh(
                        new THREE.SphereGeometry(0.24, 12, 12),
                        new THREE.MeshStandardMaterial({ color: j%2===0 ? 0xffffff : 0xb71c1c, roughness: 0.3 })
                    );
                    sauce.scale.set(1.0, 0.1, 1.0);
                    sauce.position.copy(disk.position);
                    sauce.position.y += 0.05;
                    parentGroup.add(sauce);
                }
            }
        }

    } else if (item.category === 'Main') {
        if (itemId.includes('nan') || itemId.includes('roti') || itemId.includes('parantha') || itemId.includes('bhatura') || itemId === 'ex_nan' || itemId === 'ex_mr' || itemId === 'bf_sp') {
            const basketGeom = new THREE.CylinderGeometry(1.25, 0.95, 0.45, 24);
            const basketMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 1.0 });
            const basket = new THREE.Mesh(basketGeom, basketMat);
            basket.position.y = 0.2;
            parentGroup.add(basket);
            
            for(let j=0; j<3; j++) {
                const naanGeom = new THREE.BoxGeometry(0.95, 0.02, 0.7);
                const naanMat = new THREE.MeshStandardMaterial({
                    color: 0xffe082,
                    roughness: 0.8
                });
                const naan = new THREE.Mesh(naanGeom, naanMat);
                naan.position.set((j-1)*0.24, 0.32, (j-1)*0.08);
                naan.rotation.set(Math.PI/3.5, 0.3 * (j-1), 0.2);
                
                for(let k=0; k<4; k++) {
                    const spot = new THREE.Mesh(
                        new THREE.SphereGeometry(0.07, 6, 6),
                        new THREE.MeshBasicMaterial({ color: 0x8d4f1d })
                    );
                    spot.scale.set(1.6, 0.1, 1.0);
                    spot.position.set((Math.random()-0.5)*0.6, 0.012, (Math.random()-0.5)*0.4);
                    naan.add(spot);
                }
                
                parentGroup.add(naan);
            }
            
        } else {
            const bowlGeom = new THREE.CylinderGeometry(1.3, 0.9, 0.7, 32);
            const bowlMat = new THREE.MeshPhysicalMaterial({ color: 0x4e342e, roughness: 0.8, metalness: 0.2 });
            const bowl = new THREE.Mesh(bowlGeom, bowlMat);
            bowl.position.y = 0.35;
            bowl.castShadow = true;
            parentGroup.add(bowl);

            const rimGeom = new THREE.TorusGeometry(1.3, 0.05, 8, 32);
            const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.1 });
            const bowlRim = new THREE.Mesh(rimGeom, rimMat);
            bowlRim.rotation.x = Math.PI / 2;
            bowlRim.position.y = 0.68;
            parentGroup.add(bowlRim);

            let gravyColor = 0x4a1212;
            if (itemId.includes('pulao') || itemId.includes('rice') || itemId.includes('biryani') || itemId === 'ex_vb' || itemId === 'm3') gravyColor = 0xffe082;
            if (itemId.includes('paneer') || itemId.includes('kofta') || itemId.includes('curry') || itemId === 'ex_sh' || itemId === 'ex_kp' || itemId === 'm4' || itemId === 'ex_mk' || itemId === 'ex_gc') gravyColor = 0xe65100;

            const gravyGeom = new THREE.CylinderGeometry(1.24, 1.24, 0.1, 32);
            const gravyMat = new THREE.MeshStandardMaterial({ color: gravyColor, roughness: 0.2 });
            const gravy = new THREE.Mesh(gravyGeom, gravyMat);
            gravy.position.y = 0.63;
            parentGroup.add(gravy);

            if (itemId.includes('dal') || itemId.includes('bukhara') || itemId.includes('makhani') || itemId === 'm1' || itemId === 'ex_dmh' || itemId === 'ex_dy') {
                const cream1 = new THREE.Mesh(
                    new THREE.TorusGeometry(0.5, 0.04, 8, 32),
                    new THREE.MeshBasicMaterial({ color: 0xffffff })
                );
                cream1.rotation.x = Math.PI/2;
                cream1.position.y = 0.69;
                parentGroup.add(cream1);
                
                const cream2 = new THREE.Mesh(
                    new THREE.TorusGeometry(0.24, 0.04, 8, 24),
                    new THREE.MeshBasicMaterial({ color: 0xffffff })
                );
                cream2.rotation.x = Math.PI/2;
                cream2.position.y = 0.69;
                parentGroup.add(cream2);

                const butter = new THREE.Mesh(
                    new THREE.BoxGeometry(0.22, 0.04, 0.22),
                    new THREE.MeshBasicMaterial({ color: 0xffeb3b })
                );
                butter.position.set(0.1, 0.7, -0.1);
                butter.rotation.y = Math.PI/6;
                parentGroup.add(butter);

                const cilantro = new THREE.Mesh(
                    new THREE.SphereGeometry(0.08, 6, 6),
                    new THREE.MeshBasicMaterial({ color: 0x4caf50 })
                );
                cilantro.scale.set(1.5, 0.1, 1.0);
                cilantro.position.set(-0.25, 0.71, 0.25);
                parentGroup.add(cilantro);

            } else if (itemId.includes('paneer') || itemId.includes('kofta') || itemId === 'ex_sh' || itemId === 'ex_kp' || itemId === 'm4' || itemId === 'ex_mk') {
                for (let j = 0; j < 5; j++) {
                    const paneer = new THREE.Mesh(
                        new THREE.BoxGeometry(0.28, 0.28, 0.28),
                        new THREE.MeshStandardMaterial({ color: 0xfffde7, roughness: 0.5 })
                    );
                    const angle = (j / 5) * Math.PI * 2;
                    const r = 0.45;
                    paneer.position.set(r*Math.cos(angle), 0.7, r*Math.sin(angle));
                    paneer.rotation.set(Math.random()*0.3, Math.random()*0.3, 0);
                    parentGroup.add(paneer);
                }

                const cream = new THREE.Mesh(
                    new THREE.TorusGeometry(0.4, 0.03, 8, 24),
                    new THREE.MeshBasicMaterial({ color: 0xffffff })
                );
                cream.rotation.x = Math.PI/2;
                cream.position.y = 0.69;
                parentGroup.add(cream);
                
            } else if (itemId.includes('pulao') || itemId.includes('rice') || itemId.includes('biryani') || itemId === 'ex_vb' || itemId === 'm3') {
                for (let j = 0; j < 45; j++) {
                    const grainColor = j % 3 === 0 ? 0xfff9c4 : (j % 5 === 0 ? 0xffb300 : 0xffffff);
                    const grain = new THREE.Mesh(
                        new THREE.SphereGeometry(0.08, 6, 6),
                        new THREE.MeshStandardMaterial({ color: grainColor, roughness: 0.6 })
                    );
                    grain.scale.set(0.5, 2.2, 0.5);
                    
                    const r = Math.random() * 0.9;
                    const theta = Math.random() * Math.PI * 2;
                    grain.position.set(r*Math.cos(theta), 0.66 + (Math.random()*0.1), r*Math.sin(theta));
                    grain.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
                    parentGroup.add(grain);
                }

                for(let k=0; k<6; k++) {
                    const pea = new THREE.Mesh(
                        new THREE.SphereGeometry(0.06, 8, 8),
                        new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 0.6 })
                    );
                    const r1 = Math.random() * 0.8;
                    const theta1 = Math.random() * Math.PI * 2;
                    pea.position.set(r1*Math.cos(theta1), 0.74, r1*Math.sin(theta1));
                    parentGroup.add(pea);

                    const carrot = new THREE.Mesh(
                        new THREE.BoxGeometry(0.12, 0.12, 0.12),
                        new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: 0.6 })
                    );
                    const r2 = Math.random() * 0.8;
                    const theta2 = Math.random() * Math.PI * 2;
                    carrot.position.set(r2*Math.cos(theta2), 0.74, r2*Math.sin(theta2));
                    parentGroup.add(carrot);
                }

                for(let k=0; k<6; k++) {
                    const pom = new THREE.Mesh(
                        new THREE.SphereGeometry(0.045, 6, 6),
                        new THREE.MeshBasicMaterial({ color: 0xd32f2f })
                    );
                    const r = Math.random() * 0.8;
                    const theta = Math.random() * Math.PI * 2;
                    pom.position.set(r*Math.cos(theta), 0.75, r*Math.sin(theta));
                    parentGroup.add(pom);
                }
            }
        }

    } else if (item.category === 'Dessert') {
        if (itemId.includes('baklava') || itemId === 'ds1') {
            const baseGeom = new THREE.BoxGeometry(1.0, 0.45, 1.0);
            const baseMat = new THREE.MeshStandardMaterial({ color: 0xd7a15c, roughness: 0.6 });
            const base = new THREE.Mesh(baseGeom, baseMat);
            base.position.y = 0.225;
            parentGroup.add(base);

            for(let j=1; j<=4; j++) {
                const layer = new THREE.Mesh(
                    new THREE.BoxGeometry(1.02, 0.03, 1.02),
                    new THREE.MeshStandardMaterial({ color: 0xa16f3c, roughness: 0.8 })
                );
                layer.position.y = 0.05 + (j * 0.09);
                parentGroup.add(layer);
            }

            for (let j = 0; j < 20; j++) {
                const crumb = new THREE.Mesh(
                    new THREE.SphereGeometry(0.05, 6, 6),
                    new THREE.MeshBasicMaterial({ color: 0x4caf50 })
                );
                crumb.position.set((Math.random()-0.5)*0.8, 0.48, (Math.random()-0.5)*0.8);
                parentGroup.add(crumb);
            }
            
        } else if (itemId.includes('ice') || itemId.includes('cream') || itemId === 'ds2') {
            const waffle = new THREE.Mesh(
                new THREE.CylinderGeometry(1.0, 0.7, 0.35, 16),
                new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.9 })
            );
            waffle.position.y = 0.175;
            parentGroup.add(waffle);

            const scoop = new THREE.Mesh(
                new THREE.SphereGeometry(0.68, 32, 32),
                new THREE.MeshStandardMaterial({ color: 0xffc0cb, roughness: 0.9 })
            );
            scoop.position.y = 0.5;
            scoop.castShadow = true;
            parentGroup.add(scoop);

            for (let j = 0; j < 6; j++) {
                const petal = new THREE.Mesh(
                    new THREE.SphereGeometry(0.16, 8, 8),
                    new THREE.MeshBasicMaterial({ color: 0xc2185b })
                );
                petal.scale.set(1.5, 0.2, 1.0);
                const angle = (j / 6) * Math.PI * 2;
                petal.position.set(0.6 * Math.cos(angle), 0.65 + (Math.random()*0.1), 0.6 * Math.sin(angle));
                petal.rotation.set(Math.PI/3.5, angle, Math.PI/6);
                parentGroup.add(petal);
            }
            
        } else if (itemId.includes('rasmalai') || itemId.includes('rm') || itemId === 'ex_rm') {
            const bowl = new THREE.Mesh(
                new THREE.CylinderGeometry(1.1, 0.8, 0.3, 32),
                new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.8, roughness: 0.1 })
            );
            bowl.position.y = 0.15;
            parentGroup.add(bowl);

            const milk = new THREE.Mesh(
                new THREE.CylinderGeometry(1.05, 1.05, 0.05, 32),
                new THREE.MeshStandardMaterial({ color: 0xfff176, roughness: 0.3 })
            );
            milk.position.y = 0.26;
            parentGroup.add(milk);

            for(let j=0; j<3; j++) {
                const disc = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16),
                    new THREE.MeshStandardMaterial({ color: 0xfffde7, roughness: 0.7 })
                );
                const angle = (j / 3) * Math.PI * 2;
                const r = 0.38;
                disc.position.set(r*Math.cos(angle), 0.32, r*Math.sin(angle));
                disc.rotation.y = Math.random()*0.5;
                parentGroup.add(disc);

                const silverLeaf = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.005, 0.15),
                    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 })
                );
                silverLeaf.position.copy(disc.position);
                silverLeaf.position.y += 0.05;
                parentGroup.add(silverLeaf);
            }

            for(let k=0; k<12; k++) {
                const nut = new THREE.Mesh(
                    new THREE.SphereGeometry(0.02, 6, 6),
                    new THREE.MeshBasicMaterial({ color: k%2===0 ? 0x2e7d32 : 0x8d6e63 })
                );
                const r = Math.random()*0.7;
                const theta = Math.random()*Math.PI*2;
                nut.position.set(r*Math.cos(theta), 0.35, r*Math.sin(theta));
                parentGroup.add(nut);
            }

        } else if (itemId.includes('jamun') || itemId.includes('gj') || itemId === 'ex_gj') {
            const bowl = new THREE.Mesh(
                new THREE.CylinderGeometry(1.0, 0.7, 0.35, 32),
                new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.2 })
            );
            bowl.position.y = 0.175;
            parentGroup.add(bowl);

            const syrup = new THREE.Mesh(
                new THREE.CylinderGeometry(0.95, 0.95, 0.05, 32),
                new THREE.MeshStandardMaterial({ color: 0xe65100, roughness: 0.1, transparent: true, opacity: 0.8 })
            );
            syrup.position.y = 0.28;
            parentGroup.add(syrup);

            for(let j=0; j<3; j++) {
                const sphere = new THREE.Mesh(
                    new THREE.SphereGeometry(0.3, 16, 16),
                    new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.4 })
                );
                const angle = (j / 3) * Math.PI * 2;
                const r = 0.36;
                sphere.position.set(r*Math.cos(angle), 0.38, r*Math.sin(angle));
                parentGroup.add(sphere);

                const sliver = new THREE.Mesh(
                    new THREE.BoxGeometry(0.12, 0.015, 0.05),
                    new THREE.MeshStandardMaterial({ color: 0xfff9e6, roughness: 0.6 })
                );
                sliver.position.copy(sphere.position);
                sliver.position.y += 0.31;
                sliver.rotation.y = Math.random()*Math.PI;
                parentGroup.add(sliver);
            }

        } else if (itemId.includes('jalebi') || itemId.includes('rj') || itemId === 'ex_rj') {
            const bowl = new THREE.Mesh(
                new THREE.CylinderGeometry(1.1, 0.8, 0.32, 32),
                new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.8, roughness: 0.2 })
            );
            bowl.position.y = 0.16;
            parentGroup.add(bowl);

            for(let j=0; j<4; j++) {
                const jalebi = new THREE.Mesh(
                    new THREE.TorusGeometry(0.24, 0.05, 8, 24),
                    new THREE.MeshStandardMaterial({ color: 0xff7043, roughness: 0.2 })
                );
                const rx = (j - 1.5) * 0.24;
                const rz = (Math.random() - 0.5) * 0.2;
                jalebi.rotation.x = Math.PI / 2;
                jalebi.rotation.z = Math.random()*Math.PI;
                jalebi.position.set(rx, 0.26 + (j*0.04), rz);
                parentGroup.add(jalebi);
            }

            const rabdi = new THREE.Mesh(
                new THREE.SphereGeometry(0.28, 12, 12),
                new THREE.MeshStandardMaterial({ color: 0xfffde7, roughness: 0.9 })
            );
            rabdi.scale.set(1.2, 0.4, 1.2);
            rabdi.position.set(0.1, 0.44, 0.1);
            parentGroup.add(rabdi);

        } else if (itemId.includes('kulfi') || itemId === 'ex_kp_kulfi') {
            const stickGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
            const kulfiGeom = new THREE.CylinderGeometry(0.18, 0.26, 0.9, 16);
            
            const stickMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.9 });
            const kulfiMat = new THREE.MeshStandardMaterial({ color: 0xfff59d, roughness: 0.8 });
            
            const stick = new THREE.Mesh(stickGeom, stickMat);
            const kulfi = new THREE.Mesh(kulfiGeom, kulfiMat);
            
            stick.position.set(0, 0.3, 0);
            stick.rotation.x = Math.PI / 2;
            
            kulfi.position.set(0, 0.3, -0.6);
            kulfi.rotation.x = Math.PI / 2;
            
            parentGroup.add(stick);
            parentGroup.add(kulfi);

            for(let k=0; k<12; k++) {
                const crumb = new THREE.Mesh(
                    new THREE.SphereGeometry(0.025, 4, 4),
                    new THREE.MeshBasicMaterial({ color: 0x33691e })
                );
                const angle = Math.random()*Math.PI*2;
                const cz = -0.2 - Math.random()*0.8;
                crumb.position.set(0.2*Math.cos(angle), 0.3 + 0.2*Math.sin(angle), cz);
                parentGroup.add(crumb);
            }
            
        } else {
            const cup = new THREE.Mesh(
                new THREE.CylinderGeometry(0.95, 0.65, 0.4, 24),
                new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 })
            );
            cup.position.y = 0.2;
            parentGroup.add(cup);

            const halwa = new THREE.Mesh(
                new THREE.SphereGeometry(0.6, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0xd8a35c, roughness: 0.9 })
            );
            halwa.scale.set(1.2, 0.6, 1.2);
            halwa.position.y = 0.38;
            halwa.castShadow = true;
            parentGroup.add(halwa);

            for(let j=0; j<6; j++) {
                const flake = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2, 0.02, 0.15),
                    new THREE.MeshStandardMaterial({ color: 0xfff9e6, roughness: 0.5 })
                );
                flake.position.set((Math.random()-0.5)*0.6, 0.66, (Math.random()-0.5)*0.6);
                flake.rotation.set(Math.random()*0.4, Math.random()*Math.PI, 0);
                parentGroup.add(flake);
            }
        }
    }
}

// --- STEP 3 3D PLATE SCENE INITIALIZER ---
function init3DPlate() {
    if (plateInitialized) {
        // Resize check
        const container = document.getElementById('threejs-plate-container');
        if (container && plateRenderer) {
            plateCamera.aspect = container.clientWidth / container.clientHeight;
            plateCamera.updateProjectionMatrix();
            plateRenderer.setSize(container.clientWidth, container.clientHeight);
        }
        return;
    }

    const container = document.getElementById('threejs-plate-container');
    const canvas = document.getElementById('threejs-plate-canvas');
    if (!container || !canvas) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene
    plateScene = new THREE.Scene();
    plateScene.fog = new THREE.FogExp2(0x0a2216, 0.015);

    // 2. Camera
    plateCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    plateCamera.position.set(0, 4.5, 6);

    // 3. Renderer
    plateRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    plateRenderer.setSize(width, height);
    plateRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    plateRenderer.shadowMap.enabled = true;
    plateRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Controls
    plateControls = new THREE.OrbitControls(plateCamera, plateRenderer.domElement);
    plateControls.enableDamping = true;
    plateControls.dampingFactor = 0.05;
    plateControls.minDistance = 2.5;
    plateControls.maxDistance = 12;
    plateControls.maxPolarAngle = Math.PI / 2.1; // Block looking under table

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    plateScene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(4, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    plateScene.add(dirLight);

    const accentLight = new THREE.PointLight(0xd4af37, 0.8, 10);
    accentLight.position.set(-3, 3, -3);
    plateScene.add(accentLight);

    // 6. Table Cloth (As ground plane)
    const tableClothGeom = new THREE.CylinderGeometry(4, 4, 0.1, 32);
    // Table cloth colors/materials based on selectedTableCloth
    let clothColor = 0xb59c5c; // default silk gold
    if (selectedTableCloth === 'linen') clothColor = 0xf5f5f5; // linen white
    if (selectedTableCloth === 'wood') clothColor = 0x5d4037; // brown wood

    const clothMat = new THREE.MeshStandardMaterial({
        color: clothColor,
        roughness: 0.8,
        metalness: selectedTableCloth === 'silk' ? 0.3 : 0.05
    });
    tableClothMesh = new THREE.Mesh(tableClothGeom, clothMat);
    tableClothMesh.position.y = -0.66;
    tableClothMesh.receiveShadow = true;
    plateScene.add(tableClothMesh);

    // 7. Plate Group
    const plateGroup = new THREE.Group();
    plateGroup.position.y = -0.55;
    
    // Rim
    const rimGeom = new THREE.CylinderGeometry(2.1, 2.1, 0.15, 64);
    let rimColor = 0xd4af37; // gold
    if (activePlateStyle === 'silver') rimColor = 0xcccccc;
    if (activePlateStyle === 'obsidian') rimColor = 0x1a1a1a;

    const rimMat = new THREE.MeshPhysicalMaterial({
        color: rimColor,
        metalness: activePlateStyle === 'obsidian' ? 0.2 : 0.9,
        roughness: 0.1,
        clearcoat: 1.0
    });
    rimMeshStep3 = new THREE.Mesh(rimGeom, rimMat);
    rimMeshStep3.receiveShadow = true;
    rimMeshStep3.castShadow = true;
    plateGroup.add(rimMeshStep3);

    // Porcelain center
    const porcelainGeom = new THREE.CylinderGeometry(1.85, 1.85, 0.12, 64);
    const porcelainMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.05
    });
    const porcelainMesh = new THREE.Mesh(porcelainGeom, porcelainMat);
    porcelainMesh.position.y = 0.02;
    porcelainMesh.receiveShadow = true;
    plateGroup.add(porcelainMesh);

    plateScene.add(plateGroup);

    // 8. Dishes Group
    dishesGroup = new THREE.Group();
    dishesGroup.position.y = -0.55 + 0.15; // slightly above plate porcelain
    plateScene.add(dishesGroup);

    // 9. Vapor/Steam particles for Plate
    const particleCount = 20;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 1.5;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending
    });
    plateSteamParticles = new THREE.Points(particleGeom, particleMat);
    plateSteamParticles.position.y = -0.2;
    plateScene.add(plateSteamParticles);

    // Animation Loop
    function animatePlate() {
        requestAnimationFrame(animatePlate);
        
        // Spin the table/cloth and plate slightly to keep it alive
        if (dishesGroup) {
            dishesGroup.rotation.y += 0.002;
        }
        if (plateGroup) {
            plateGroup.rotation.y += 0.002;
        }

        // Rise steam particles
        if (plateSteamParticles) {
            const positions = plateSteamParticles.geometry.attributes.position.array;
            for(let i = 1; i < positions.length; i += 3) {
                positions[i] += 0.012;
                if (positions[i] > 1.5) {
                    positions[i] = -0.3;
                    positions[i-1] = (Math.random() - 0.5) * 1.5;
                    positions[i+1] = (Math.random() - 0.5) * 1.5;
                }
            }
            plateSteamParticles.geometry.attributes.position.needsUpdate = true;
        }

        if (plateControls) plateControls.update();
        if (plateRenderer && plateScene && plateCamera) {
            plateRenderer.render(plateScene, plateCamera);
        }
    }

    animatePlate();
    plateInitialized = true;
}

function update3DDishes() {
    if (!dishesGroup) return;
    
    // Clear existing meshes in dishesGroup
    while (dishesGroup.children.length > 0) {
        dishesGroup.remove(dishesGroup.children[0]);
    }

    if (selectedItems.length === 0) return;

    // Arrange items on the plate.
    // If there is only 1 item, put it in the center.
    // If there are multiple, arrange them in a circle around the center.
    const count = selectedItems.length;
    
    selectedItems.forEach((sel, idx) => {
        const itemGroup = new THREE.Group();
        
        // If multiple items, space them out radially
        if (count > 1) {
            const angle = (idx / count) * Math.PI * 2;
            const r = 0.9; // radius on plate
            itemGroup.position.set(r * Math.cos(angle), -0.05, r * Math.sin(angle));
            itemGroup.scale.set(0.65, 0.65, 0.65); // Scale down to fit multiple
        } else {
            itemGroup.position.set(0, -0.05, 0);
            itemGroup.scale.set(1.0, 1.0, 1.0);
        }
        
        // Build the procedural geometry for this item
        buildProceduralDishGeometry(sel.id, itemGroup);
        dishesGroup.add(itemGroup);
    });
}

// --- 3D BINDER FLIPBOOK ENGINGE ---
let activeBookPageCategory = 'Drink';

window.switchBookPage = function(category) {
    if (category === activeBookPageCategory) return;
    
    document.querySelectorAll('.book-cat-btn').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.getElementById('btn-page-' + category);
    if(targetBtn) targetBtn.classList.add('active');
    
    const activePage = document.querySelector('.book-page.active');
    const targetPage = document.getElementById('page-' + category);
    
    if (activePage && targetPage) {
        // 3D fold page flip animation using GSAP
        gsap.to(activePage, {
            duration: 0.35,
            rotateY: -90,
            opacity: 0,
            ease: "power2.in",
            onComplete: () => {
                activePage.classList.remove('active');
                activePage.style.display = 'none';
                
                targetPage.style.display = 'flex';
                targetPage.style.transform = 'rotateY(90deg)';
                targetPage.style.opacity = '0';
                
                gsap.to(targetPage, {
                    duration: 0.35,
                    rotateY: 0,
                    opacity: 1,
                    ease: "power2.out",
                    onComplete: () => {
                        targetPage.classList.add('active');
                        activeBookPageCategory = category;
                    }
                });
            }
        });
    }
}

let activeMenuPreset = 'custom';

window.switchActiveMenuPreset = function(preset, btnEl) {
    document.querySelectorAll('.menu-folio-btn').forEach(btn => btn.classList.remove('active'));
    if(btnEl) btnEl.classList.add('active');
    activeMenuPreset = preset;
    
    // Update the binder title
    const titleEl = document.getElementById('book-selected-menu-title');
    if (titleEl) {
        let titleText = "All Cuisines";
        if (preset === 'breakfast') titleText = "Breakfast Menu";
        if (preset === 'hitea') titleText = "Hi-Tea Menu";
        if (preset === 'superexec') titleText = "Super Executive";
        if (preset === 'maharaja') titleText = "Maharaja Feast";
        if (preset === 'corporate') titleText = "Corporate Brunch";
        titleEl.innerText = titleText;
    }
    
    // Auto-select recommended items for that menu package
    selectedItems = [];
    let itemsToSelect = [];
    if(preset === 'maharaja') itemsToSelect = ['d1', 'ex_mp', 'ex_rk', 'm1', 'm3', 'ex_sh', 'ex_nan', 'ds1', 'ex_rj'];
    else if(preset === 'corporate') itemsToSelect = ['d2', 's1', 's7', 'ex_rs', 'm2', 'm5', 'ds2'];
    else if(preset === 'breakfast') itemsToSelect = ['bf_oj', 'bf_sp', 'bf_cb', 'bf_id', 'bf_jb'];
    else if(preset === 'hitea') itemsToSelect = ['d2', 'ht_cb', 'ht1', 'ht2', 'ht4', 'ht5'];
    else if(preset === 'superexec') itemsToSelect = ['ex_ts', 'ex_mp', 'ex_rk', 'ex_sh', 'ex_dmh', 'ex_vb', 'ex_nan', 'ex_rj', 'ex_kp_kulfi'];
    else if(preset === 'custom') itemsToSelect = ['d1', 's1', 'm1', 'ds1'];
    
    itemsToSelect.forEach(id => {
        let item = inventoryDB.find(x => x.id === id);
        if(item) selectedItems.push({ id: item.id, price: item.price, category: item.category });
    });

    renderAllMenuGrids();
    recalculateTotal();
    
    if (plateInitialized && currentStep === 3) {
        update3DDishes();
    }
}

function filterItemsForMenu(item, menuType) {
    if (menuType === 'custom') return true;
    if (menuType === 'breakfast') {
        return item.id.startsWith('bf_') || ['d4', 'd5', 'ds3'].includes(item.id);
    }
    if (menuType === 'hitea') {
        return item.id.startsWith('ht_') || ['bf_ws', 'bf_gs', 'bf_vd', 'bf_ab', 'd2', 'd3', 'd5', 'sb_custard_apple', 'sb_badam_khajur', 'sb_thandai', 'sb_badshahi_gulab', 'sb_sharbat_jannat', 'sb_fruit_cocktail', 'sb_guava', 'sb_sugandh', 'sb_strawberry_daiquiri', 'sb_kiwi_daiquiri', 'sb_veg_jaljeera', 'sb_pineapple_slush', 'sb_coconut_sikanji'].includes(item.id);
    }
    if (menuType === 'superexec') {
        return item.id.startsWith('ex_') || item.id.startsWith('sb_') || ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'd1', 'd2', 'd3', 'd4', 'd5', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 'ds1', 'ds2', 'ds3', 'ht5'].includes(item.id);
    }
    if (menuType === 'maharaja') {
        return ['d1', 'd4', 'ex_ts', 's2', 'ex_mp', 'ex_at', 'ex_rk', 'm1', 'm3', 'ex_sh', 'ex_mk', 'ex_nan', 'ds1', 'ds3', 'ex_rj'].includes(item.id) || item.id.startsWith('sb_');
    }
    if (menuType === 'corporate') {
        return ['d2', 'd3', 'd5', 's1', 's7', 'ex_hb', 'ex_rs', 'm2', 'm5', 'ex_vb', 'ds2', 'ex_kp_kulfi'].includes(item.id) || item.id.startsWith('sb_');
    }
    return false;
}

function renderAllMenuGrids() {
    ['Drink', 'Starter', 'Main', 'Dessert'].forEach(category => {
        let grid = document.getElementById('grid-' + category);
        if(!grid) return;
        grid.innerHTML = '';
        
        let items = inventoryDB.filter(x => x.category === category && x.active && filterItemsForMenu(x, activeMenuPreset));
        
        if (items.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-style: italic;">No items available in this course for the selected menu.</div>`;
            return;
        }

        items.forEach(item => {
            let isSelected = selectedItems.find(x => x.id === item.id) ? true : false;
            let cardClass = isSelected ? 'menu-card-3d selected' : 'menu-card-3d';
            
            let allergenList = item.allergens && item.allergens.length > 0 
                ? item.allergens.join(', ') 
                : 'None';
                
            grid.innerHTML += `
                <div class="${cardClass}" id="card-${item.id}" onclick="toggleMenuItem('${item.id}', ${item.price}, '${item.category}')">
                    <div class="card-3d-inner">
                        <div class="card-3d-front">
                            <span class="card-category-badge">${getCategoryIcon(item.category)} ${item.category}</span>
                            <div class="card-dish-name">${item.name}</div>
                            <div class="card-dish-price" style="display: none;">₹${item.price}</div>
                            
                            <div style="display:flex; justify-content:space-between; width:100%; align-items:center; position: absolute; bottom: 15px; padding: 0 20px; box-sizing: border-box; z-index:2;">
                                <span class="card-flip-hint"><i class="fa-solid fa-rotate"></i> Details</span>
                                <span class="card-view-3d-btn" onclick="event.stopPropagation(); open3DDishModal('${item.id}')" style="background:var(--primary); color:#FFF; padding:5px 8px; border-radius:30px; font-size:0.65rem; font-weight:700;"><i class="fa-solid fa-cube"></i> 3D</span>
                            </div>
                        </div>
                        <div class="card-3d-back">
                            <span class="card-nutrition-title">Nutrition Facts</span>
                            <div style="text-align: left; width: 100%; margin-top: 8px; font-size: 0.75rem;">
                                <div class="card-nutr-item" style="display:flex; justify-content:space-between; margin-bottom:3px;"><span>Calories:</span> <strong style="color:var(--gold);">${item.cal || 150} kcal</strong></div>
                                <div class="card-nutr-item" style="display:flex; justify-content:space-between; margin-bottom:3px;"><span>Protein:</span> <strong style="color:var(--gold);">${item.protein || 4}g</strong></div>
                                <div class="card-nutr-item" style="display:flex; justify-content:space-between; margin-bottom:3px;"><span>Carbs:</span> <strong style="color:var(--gold);">${item.carbs || 20}g</strong></div>
                                <div class="card-nutr-item" style="display:flex; justify-content:space-between; margin-bottom:3px;"><span>Fats:</span> <strong style="color:var(--gold);">${item.fat || 5}g</strong></div>
                                <div class="card-nutr-item" style="display:flex; justify-content:space-top; margin-top:5px; font-size:0.65rem; color:#ff8a65;"><span>Allergens:</span> <strong style="color:#ff8a65;">${allergenList}</strong></div>
                            </div>
                            <div class="card-select-status" style="margin-top: 8px; font-size: 0.7rem; font-weight:700; color:#00E676;"><i class="fa-solid fa-circle-check"></i> Selected</div>
                        </div>
                    </div>
                </div>
            `;
        });
    });
}

// ─────────────────────────────────────────────────────────────────
// CUISINE SCROLL SECTIONS RENDERER
// Builds Gujarati & Rajasthani cuisine sections dynamically
// ─────────────────────────────────────────────────────────────────

const CUISINE_SUBCATEGORY_META = {
    'Gujarati-Farsan':         { label: 'Starters & Farsan',       icon: 'fa-leaf' },
    'Gujarati-Main':           { label: 'Main Course',              icon: 'fa-bowl-food' },
    'Gujarati-Breads':         { label: 'Indian Breads',            icon: 'fa-bread-slice' },
    'Gujarati-Rice':           { label: 'Rice Preparations',        icon: 'fa-seedling' },
    'Gujarati-Accompaniments': { label: 'Accompaniments',           icon: 'fa-jar' },
    'Gujarati-Desserts':       { label: 'Royal Desserts',           icon: 'fa-ice-cream' },
    'Rajasthani-Accompaniments': { label: 'Traditional Accompaniments', icon: 'fa-mortar-pestle' },
    'Rajasthani-Specialties':    { label: 'Royal Specialties',        icon: 'fa-crown' },
    'Rajasthani-Main':           { label: 'Main Course',              icon: 'fa-bowl-food' },
    'Rajasthani-Breads':         { label: 'Breads',                   icon: 'fa-bread-slice' },
    'Rajasthani-Beverage':       { label: 'Royal Beverage',           icon: 'fa-glass-water' }
};

function buildCuisineDishCard(item) {
    return `
        <div class="cuisine-dish-card" id="ccard-${item.id}">
            <div class="cuisine-dish-icon">
                <i class="fa-solid ${getCuisineDishIcon(item)}"></i>
            </div>
            <div class="cuisine-dish-info">
                <div class="cuisine-dish-name">${item.name}</div>
                <div class="cuisine-dish-desc">${item.desc}</div>
            </div>
            <div class="cuisine-dish-nutr">
                <span class="nutr-pill"><i class="fa-solid fa-fire-flame-curved"></i> ${item.cal} kcal</span>
            </div>
        </div>
    `;
}

function getCuisineDishIcon(item) {
    const cat = item.category || '';
    if (cat.includes('Farsan') || cat.includes('Specialties')) return 'fa-cookie-bite';
    if (cat.includes('Main'))       return 'fa-bowl-food';
    if (cat.includes('Breads'))     return 'fa-bread-slice';
    if (cat.includes('Rice'))       return 'fa-seedling';
    if (cat.includes('Accomp'))     return 'fa-jar';
    if (cat.includes('Desserts'))   return 'fa-ice-cream';
    if (cat.includes('Beverage'))   return 'fa-glass-water';
    return 'fa-plate-wheat';
}

function renderCuisineSubSection(containerId, cuisineName, categories) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    categories.forEach(catKey => {
        const items = inventoryDB.filter(x => x.category === catKey && x.active && x.cuisine === cuisineName);
        if (items.length === 0) return;

        const meta = CUISINE_SUBCATEGORY_META[catKey] || { label: catKey, icon: 'fa-plate-wheat' };

        let cardsHtml = items.map(buildCuisineDishCard).join('');

        container.innerHTML += `
            <div class="cuisine-subsection">
                <div class="cuisine-subsection-header">
                    <i class="fa-solid ${meta.icon} cuisine-sub-icon"></i>
                    <h3 class="cuisine-subsection-title">${meta.label}</h3>
                    <div class="cuisine-sub-line"></div>
                </div>
                <div class="cuisine-dishes-grid">
                    ${cardsHtml}
                </div>
            </div>
        `;
    });
}

function renderSignatureGujaratiThali() {
    // Append a signature thali card at the end of gujarati-grid-container
    const container = document.getElementById('gujarati-grid-container');
    if (!container) return;

    container.innerHTML += `
        <div class="signature-thali-section">
            <div class="signature-thali-card">
                <div class="thali-crown-badge">
                    <i class="fa-solid fa-crown"></i> SIGNATURE COLLECTION
                </div>
                <div class="thali-card-body">
                    <div class="thali-left">
                        <div class="thali-hero-tag">HERITAGE EXPERIENCE</div>
                        <h2 class="thali-title">Signature Gujarati<br><span>Royal Thali</span></h2>
                        <p class="thali-desc">The complete royal Gujarati dining experience — curated with time-honoured tradition, presented with heritage elegance.</p>
                        <div class="thali-cta">
                            <a href="#booking-inquiry" class="primary-btn gold-accent-btn" onclick="document.getElementById('booking-inquiry').scrollIntoView({behavior:'smooth'}); return false;">
                                <i class="fa-solid fa-paper-plane"></i> Inquire for Full Thali
                            </a>
                        </div>
                    </div>
                    <div class="thali-right">
                        <div class="thali-plate">
                            <div class="thali-plate-rim"></div>
                            <div class="thali-items-grid">
                                <div class="thali-item"><i class="fa-solid fa-leaf"></i><span>Farsan</span></div>
                                <div class="thali-item"><i class="fa-solid fa-bowl-food"></i><span>2 Sabzi</span></div>
                                <div class="thali-item"><i class="fa-solid fa-droplet"></i><span>Gujarati Dal</span></div>
                                <div class="thali-item"><i class="fa-solid fa-mug-hot"></i><span>Gujarati Kadhi</span></div>
                                <div class="thali-item"><i class="fa-solid fa-bread-slice"></i><span>Rotli / Puri</span></div>
                                <div class="thali-item"><i class="fa-solid fa-seedling"></i><span>Rice / Khichdi</span></div>
                                <div class="thali-item"><i class="fa-solid fa-jar"></i><span>Papad & Pickle</span></div>
                                <div class="thali-item"><i class="fa-solid fa-glass-water"></i><span>Chaas</span></div>
                                <div class="thali-item thali-item-sweet"><i class="fa-solid fa-ice-cream"></i><span>Sweet Dish</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCuisineScrollSections() {
    // Render Super Executive, Breakfast, Hi-Tea sections into their containers
    renderCuisineMenuSection('superexec-grid-container', 'superexec');
    renderCuisineMenuSection('breakfast-grid-container', 'breakfast');
    renderCuisineMenuSection('hitea-grid-container', 'hitea');

    // Render Gujarati Cuisine
    renderCuisineSubSection('gujarati-grid-container', 'gujarati', [
        'Gujarati-Farsan',
        'Gujarati-Main',
        'Gujarati-Breads',
        'Gujarati-Rice',
        'Gujarati-Accompaniments',
        'Gujarati-Desserts'
    ]);
    // Append Signature Thali as final block
    renderSignatureGujaratiThali();

    // Render Rajasthani Cuisine
    renderCuisineSubSection('rajasthani-grid-container', 'rajasthani', [
        'Rajasthani-Accompaniments',
        'Rajasthani-Specialties',
        'Rajasthani-Main',
        'Rajasthani-Breads',
        'Rajasthani-Beverage'
    ]);
}

// Renders a standard menu type (superexec/breakfast/hitea) into its cuisine scroll container
function renderCuisineMenuSection(containerId, menuType) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const categories = ['Drink', 'Starter', 'Main', 'Dessert'];
    const catMeta = {
        'Drink':   { label: 'Drinks & Refreshments',   icon: 'fa-glass-water' },
        'Starter': { label: 'Exquisite Starters',       icon: 'fa-cookie-bite' },
        'Main':    { label: 'Shahi Main Course',        icon: 'fa-bowl-food' },
        'Dessert': { label: 'Royal Desserts',           icon: 'fa-ice-cream' }
    };

    const menuTypeDisplay = {
        'superexec': 'superexec',
        'breakfast':  'breakfast',
        'hitea':      'hitea'
    };

    categories.forEach(cat => {
        const items = inventoryDB.filter(x =>
            x.category === cat &&
            x.active &&
            filterItemsForMenu(x, menuTypeDisplay[menuType] || menuType)
        );
        if (items.length === 0) return;

        const meta = catMeta[cat] || { label: cat, icon: 'fa-plate-wheat' };
        const cardsHtml = items.map(buildCuisineDishCard).join('');

        container.innerHTML += `
            <div class="cuisine-subsection">
                <div class="cuisine-subsection-header">
                    <i class="fa-solid ${meta.icon} cuisine-sub-icon"></i>
                    <h3 class="cuisine-subsection-title">${meta.label}</h3>
                    <div class="cuisine-sub-line"></div>
                </div>
                <div class="cuisine-dishes-grid">
                    ${cardsHtml}
                </div>
            </div>
        `;
    });
}

// ─────────────────────────────────────────────────────────────────
// CUISINE NAVIGATION SCROLL
// ─────────────────────────────────────────────────────────────────
window.scrollToCuisine = function(cuisineSectionId) {
    const el = document.getElementById(cuisineSectionId);
    if (!el) return;
    const offset = 100;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });

    // Update active tab
    document.querySelectorAll('.cuisine-tab-btn').forEach(btn => btn.classList.remove('active'));
    // Find the tab that scrolls to this section
    document.querySelectorAll('.cuisine-tab-btn').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick') || '';
        if (onclickAttr.includes(cuisineSectionId)) btn.classList.add('active');
    });
};

function initCuisineNavScroll() {
    if (typeof IntersectionObserver === 'undefined') return;
    const sections = document.querySelectorAll('.cuisine-section');
    const tabs = document.querySelectorAll('.cuisine-tab-btn');
    if (!sections.length || !tabs.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
                const id = entry.target.id;
                tabs.forEach(tab => {
                    tab.classList.remove('active');
                    const attr = tab.getAttribute('onclick') || '';
                    if (attr.includes(id)) tab.classList.add('active');
                });
            }
        });
    }, { threshold: 0.25 });

    sections.forEach(s => observer.observe(s));
}

// --- REST API WRAPPERS FOR GALLERY POSTS & HERO BACKGROUND VIDEOS ---
window.uploadHeroVideo = async function(inputEl) {
    const file = inputEl.files[0];
    if (!file) return;

    const statusEl = document.getElementById('cms-video-upload-status');
    if (statusEl) statusEl.innerText = "Uploading background video...";

    const fd = new FormData();
    fd.append('videoFile', file);

    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        try {
            const res = await fetch('/api/cms/video', {
                method: 'POST',
                body: fd
            });
            const data = await res.json();
            if (data.success) {
                cmsConfig.hero_video = data.videoUrl;
                document.getElementById('hero-bg-video').src = data.videoUrl;
                if (statusEl) statusEl.innerText = "Video uploaded and published live!";
            } else {
                if (statusEl) statusEl.innerText = "Upload failed: " + data.error;
            }
        } catch (e) {
            console.error(e);
            if (statusEl) statusEl.innerText = "Error uploading video to server.";
        }
    } else {
        // Offline mock upload
        const objUrl = URL.createObjectURL(file);
        cmsConfig.hero_video = objUrl;
        document.getElementById('hero-bg-video').src = objUrl;
        if (statusEl) statusEl.innerText = "Demo Mode: Cached video link locally.";
    }
}

window.uploadCMSGalleryPost = async function() {
    const fileInput = document.getElementById('cms-gallery-file-upload');
    const capInput = document.getElementById('cms-gallery-cap');
    
    const file = fileInput.files[0];
    const caption = capInput.value.trim();

    if (!file || !caption) { alert("Please choose a file and write a caption."); return; }

    const fd = new FormData();
    fd.append('mediaFile', file);
    fd.append('caption', caption);

    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        try {
            const res = await fetch('/api/gallery', { method: 'POST', body: fd });
            const data = await res.json();
            if (data.success) {
                galleryDB.unshift(data.post);
                renderGalleryPosts();
                fileInput.value = '';
                capInput.value = '';
                alert("Gallery post uploaded and published live!");
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error("Gallery upload error:", e);
            alert("Error uploading gallery file to server. Check console for details.");
        }
    } else {
        // Offline demo upload
        const objUrl = URL.createObjectURL(file);
        const newPost = {
            id: 'g' + Date.now(),
            url: objUrl,
            type: file.type.startsWith('video/') ? 'video' : 'image',
            caption: caption
        };
        galleryDB.unshift(newPost);
        localStorage.setItem('galleryDB', JSON.stringify(galleryDB));
        renderGalleryPosts();
        fileInput.value = '';
        capInput.value = '';
        alert("Demo Mode: Simulated local file upload in gallery.");
    }
}

// --- CLIENT REVIEWS & TESTIMONIALS SLIDER ---
window.submitReview = async function() {
    const authInput = document.getElementById('review-name');
    const textInput = document.getElementById('review-text');

    const author = authInput.value.trim();
    const text = textInput.value.trim();

    if (!author || !text) { alert("Please enter your name and a comment."); return; }

    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        try {
            await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author, text })
            });
            alert("Appreciation submitted! It will appear on the slider after admin verification.");
        } catch (e) { console.error(e); }
    } else {
        const newReview = { id: 'r' + Date.now(), author, text, approved: true };
        reviewsDB.push(newReview);
        localStorage.setItem('local_reviews', JSON.stringify(reviewsDB));
        alert("Demo Mode: Appreciation submitted and auto-approved locally!");
        renderReviewsCarousel();
    }
    
    authInput.value = '';
    textInput.value = '';
    closeModal('modal-review');
}

function renderReviewsCarousel() {
    const inner = document.getElementById('reviews-carousel-inner');
    if(!inner) return;
    inner.innerHTML = '';
    
    const approvedReviews = reviewsDB.filter(r => r.approved);
    if (approvedReviews.length === 0) {
        inner.innerHTML = `<div class="review-card"><p>"Experience the heritage royalty of fine Indian culinary banqueting."</p><h4>Khandelwal Caters Heritage</h4></div>`;
        return;
    }
    
    approvedReviews.forEach(r => {
        inner.innerHTML += `
            <div class="review-card">
                <p>"${r.text}"</p>
                <h4>${r.author}</h4>
            </div>
        `;
    });

    // Auto-scroll loop
    let idx = 0;
    setInterval(() => {
        idx = (idx + 1) % approvedReviews.length;
        inner.style.transform = `translateX(-${idx * 100}%)`;
    }, 5000);
}

// --- PDF INVOICES PROPOSAL GENERATOR ---
window.downloadCustomerProposal = function() {
    let name = document.getElementById('cust-name').value.trim() || "Valued Client";
    let phone = document.getElementById('cust-phone').value.trim() || "+91 XXXXX XXXXX";
    let eventDate = document.getElementById('event-date').value || "Not Scheduled";
    let eventLoc = document.getElementById('event-location').value || "Not Specified";
    
    let plateCountStr = document.getElementById('summary-plate-count').innerText;
    let guestCountVal = document.getElementById('summary-guest-count').innerText;

    let itemsListHtml = selectedItems.map(item => {
        let dbItem = inventoryDB.find(x => x.id === item.id);
        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-weight: bold; color: #1c2e24;">${dbItem ? dbItem.name : item.id}</td>
                <td style="padding: 12px; text-align: right; color: #666; text-transform: uppercase; font-size: 0.8rem;">${item.category}</td>
            </tr>
        `;
    }).join('');

    let addonsListHtml = '';
    ['nitrogen', 'ice', 'pizza', 'waiters'].forEach(id => {
        let ch = document.getElementById('addon-' + id);
        if (ch && ch.checked) {
            let label = ch.closest('.addon-card').querySelector('.addon-title').innerText;
            addonsListHtml += `
                <tr style="border-bottom: 1px dashed #eee; font-size: 0.9rem;">
                    <td style="padding: 8px 12px; color: #555;">+ ${label}</td>
                    <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #2e7d32;">Selected Upgrade</td>
                </tr>
            `;
        }
    });
    if(!addonsListHtml) {
        addonsListHtml = `<tr><td colspan="2" style="padding: 8px 12px; color: #999; font-style: italic;">No luxury upgrades selected.</td></tr>`;
    }

    let reportHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Heritage Catering Curation - Khandelwal Caters</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Cinzel:wght@700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Outfit', sans-serif; background: #FAF9F6; color: #1c2e24; margin: 0; padding: 40px; }
            .po-card { max-width: 800px; margin: 0 auto; background: #fff; border: 1.5px solid #d4af37; box-shadow: 0 10px 40px rgba(0,0,0,0.05); padding: 50px; border-radius: 16px; position: relative; }
            .header-banner { background: #0a4e35; color: #fff; padding: 40px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #d4af37; margin-bottom: 40px; }
            .header-banner h1 { font-family: 'Cinzel', serif; font-size: 2.2rem; margin: 0; color: #d4af37; letter-spacing: 1px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; font-size: 0.95rem; border-bottom: 1px solid #eee; padding-bottom: 30px; }
            .details-grid strong { color: #111; }
            .section-title { font-family: 'Cinzel', serif; font-size: 1.2rem; border-bottom: 2px solid #d4af37; padding-bottom: 8px; margin-top: 40px; margin-bottom: 20px; color: #0a4e35; text-transform: uppercase; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; background: #f8f8f9; color: #666; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #eee; }
            .pricing-summary { background: #fdfbf7; border: 1px solid #f3eedd; border-radius: 12px; padding: 25px; margin-top: 30px; }
            .summary-item { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.95rem; }
            .summary-item.total { border-top: 2px solid #d4af37; padding-top: 15px; font-size: 1.4rem; font-weight: 700; color: #0a4e35; }
            .footer-sig { display: flex; justify-content: space-between; margin-top: 60px; font-size: 0.85rem; color: #888; border-top: 1px dashed #eee; padding-top: 30px; }
            @media print {
                body { padding: 0; background: #fff; }
                .po-card { border: none; box-shadow: none; padding: 0; }
                button { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="po-card">
            <div class="header-banner">
                <div>
                    <h1>Khandelwal Caters</h1>
                    <span style="font-size:0.8rem; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:#ccc;">Elite Gastronomy & Event Styling</span>
                </div>
                <div style="text-align:right;">
                    <h3 style="margin:0; font-size:1.1rem; color:#d4af37; font-weight:600; letter-spacing:1px;">CURATION DETAILS</h3>
                    <span style="font-size:0.8rem; color:#aaa;">Ref: EST-${Date.now().toString().slice(-6)}</span>
                </div>
            </div>

            <div class="details-grid">
                <div>
                    <span style="color:#888; text-transform:uppercase; font-size:0.75rem; display:block; margin-bottom:5px; letter-spacing:0.5px;">Client Details:</span>
                    <strong>Name:</strong> ${name}<br>
                    <strong>WhatsApp:</strong> ${phone}
                </div>
                <div style="text-align:right;">
                    <span style="color:#888; text-transform:uppercase; font-size:0.75rem; display:block; margin-bottom:5px; letter-spacing:0.5px;">Event Identity:</span>
                    <strong>Event Date:</strong> ${eventDate}<br>
                    <strong>Venue / Location:</strong> ${eventLoc}
                </div>
            </div>

            <div class="section-title">Selected Cuisines Menu (${plateCountStr})</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 70%;">Dish Item</th>
                        <th style="width: 30%; text-align: right;">Course Category</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsListHtml}
                </tbody>
            </table>

            <div class="section-title">Upgrade Add-ons & Premium Setup</div>
            <table style="margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th style="width: 70%;">Addon Service / Live Kitchen Counter</th>
                        <th style="width: 30%; text-align: right;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${addonsListHtml}
                </tbody>
            </table>

            <div class="pricing-summary">
                <div class="summary-item">
                    <span>Total Event Guest Pax:</span>
                    <strong>${guestCountVal} Guests</strong>
                </div>
                <div class="summary-item">
                    <span>Selected Dishes Count:</span>
                    <strong>${plateCountStr}</strong>
                </div>
                <div class="summary-item">
                    <span>Tablecloth Theme:</span>
                    <strong>${document.getElementById('summary-tablecloth').innerText}</strong>
                </div>
                <div class="summary-item">
                    <span>Dining Aesthetics Finish:</span>
                    <strong>${document.getElementById('summary-dining-style').innerText}</strong>
                </div>
            </div>

            <div class="footer-sig">
                <div>
                    <span>Prepared by:<br><br><br><strong>Khandelwal Caters Representative</strong></span>
                </div>
                <div style="text-align:right;">
                    <span>Client Signature Approval:<br><br><br><strong>___________________________</strong></span>
                </div>
            </div>
            
            <div style="text-align:center; margin-top:50px;">
                <button onclick="window.print()" style="background:#0a4e35; color:#FFF; border:none; padding:12px 30px; font-family:'Outfit',sans-serif; font-size:0.95rem; font-weight:700; border-radius:30px; cursor:pointer; box-shadow:0 5px 15px rgba(10,78,53,0.3); transition:all 0.3s;">Print/Download PDF Proposal</button>
            </div>
        </div>
    </body>
    </html>
    `;

    let win = window.open('', '', 'height=800,width=850');
    if (win) {
        win.document.write(reportHtml);
        win.document.close();
    }
}

window.submitBookingRequest = async function() {
    let name = document.getElementById('cust-name').value.trim();
    let phone = document.getElementById('cust-phone').value.trim();
    if(!name || !phone) { alert("Please fill your Name and WhatsApp Number."); return; }
    
    // Read guest count from #inquiry-guests if it exists
    const inquiryGuestsEl = document.getElementById('inquiry-guests');
    if (inquiryGuestsEl) {
        guestCount = parseInt(inquiryGuestsEl.value) || 200;
    }

    let newLeadId = 'L' + (1000 + crmLeads.length + 1);
    let today = new Date().toISOString().split('T')[0];
    let leadItems = selectedItems.map(x => x.id);

    const newLead = {
        id: newLeadId,
        name: name,
        date: today,
        guests: guestCount,
        value: 0,
        status: 'Pending',
        items: leadItems,
        phone: phone
    };

    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLead)
            });
        } catch (e) { console.error(e); }
    } else {
        crmLeads.unshift(newLead);
        localStorage.setItem('local_leads', JSON.stringify(crmLeads));
    }
    
    alert(`Thank you, ${name}! Your Royal Catering Curation Request has been submitted successfully.`);
    downloadCustomerProposal();
    
    // REDIRECT TO WHATSAPP
    let waText = `Hello Khandelwal Caters,\nI want to book an exquisite catering service.\n\nName: ${name}\nPhone: ${phone}\nGuests: ${guestCount}\nSelected Menu Items: ${selectedItems.length}`;
    window.open(`https://wa.me/919634885573?text=${encodeURIComponent(waText)}`, '_blank');
}

window.scrollToPlanner = function() { 
    const el = document.getElementById('menu-planner');
    if(el) el.scrollIntoView({behavior: 'smooth'}); 
}

// --- RENDERS GALLERY & CAROUSELS ---
function renderGalleryPosts() {
    let container = document.getElementById('gallery-posts-grid');
    if(!container) return;
    container.innerHTML = '';
    console.log("renderGalleryPosts: galleryDB size =", galleryDB ? galleryDB.length : null);
    if (!galleryDB || galleryDB.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-style: italic;">No gallery celebrations available to show.</div>`;
        return;
    }
    
    galleryDB.forEach(post => {
        let safeUrl = encodeURI(post.url);
        let mediaHtml = post.type === 'video' 
            ? `<video src="${safeUrl}" autoplay muted loop playsinline></video>`
            : `<img src="${safeUrl}" alt="${post.caption}">`;
            
        container.innerHTML += `
            <div class="gallery-card">
                <div class="gallery-media-wrapper">${mediaHtml}</div>
                <div class="gallery-caption">${post.caption}</div>
            </div>
        `;
    });
}

// --- ADMIN / OWNER ERP LOGIC SYSTEM ---
window.toggleGlobalLightDark = function() {
    const isLight = document.body.classList.toggle('mode-light');
    localStorage.setItem('theme_mode', isLight ? 'light' : 'dark');
    updateThemeToggleUI(isLight);
}

function updateThemeToggleUI(isLight) {
    const btns = [document.getElementById('theme-mode-toggle-btn'), document.getElementById('admin-mode-toggle-btn')];
    btns.forEach(btn => {
        if(btn) {
            btn.innerHTML = isLight 
                ? '<i class="fa-solid fa-moon"></i> Dark Mode' 
                : '<i class="fa-solid fa-sun"></i> Light Mode';
        }
    });
}

// --- LEAFLET INTERACTIVE EVENT MAP PICKER SYSTEM ---
let leafletMap = null;
let mapMarker = null;
let tempSelectedAddress = '';
let tempCoords = null;

window.openMapModal = function() {
    document.getElementById('modal-map-picker').classList.add('show');
    // We need a short timeout so that Leaflet can measure the visible dimensions of the container
    setTimeout(() => {
        initLeafletMap();
    }, 150);
}

function initLeafletMap() {
    const initialLat = 27.4924; // Vrindavan / Mathura area as default
    const initialLng = 77.6737;

    if (leafletMap) {
        leafletMap.invalidateSize();
        return;
    }

    leafletMap = L.map('map-container').setView([initialLat, initialLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap);

    leafletMap.on('click', function(e) {
        const { lat, lng } = e.latlng;
        setMapMarker(lat, lng);
    });

    setMapMarker(initialLat, initialLng);
}

function setMapMarker(lat, lng) {
    if (mapMarker) {
        mapMarker.setLatLng([lat, lng]);
    } else {
        mapMarker = L.marker([lat, lng], { draggable: true }).addTo(leafletMap);
        mapMarker.on('dragend', function(e) {
            const newLatLng = mapMarker.getLatLng();
            reverseGeocode(newLatLng.lat, newLatLng.lng);
        });
    }
    tempCoords = { lat, lng };
    reverseGeocode(lat, lng);
}

async function reverseGeocode(lat, lng) {
    const textEl = document.getElementById('selected-address-text');
    if (textEl) textEl.innerText = "Resolving address details...";

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        if (data && data.display_name) {
            tempSelectedAddress = data.display_name;
            if (textEl) textEl.innerText = tempSelectedAddress;
        } else {
            tempSelectedAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            if (textEl) textEl.innerText = tempSelectedAddress;
        }
    } catch (e) {
        console.error("Reverse geocoding error:", e);
        tempSelectedAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        if (textEl) textEl.innerText = tempSelectedAddress;
    }
}

window.handleMapSearchKeyPress = function(e) {
    if (e.key === 'Enter') {
        searchMapAddress();
    }
}

window.searchMapAddress = async function() {
    const input = document.getElementById('map-search-input');
    if (!input || !input.value.trim()) return;

    const query = input.value.trim();
    const textEl = document.getElementById('selected-address-text');
    if (textEl) textEl.innerText = "Locating venue...";

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
            const first = data[0];
            const lat = parseFloat(first.lat);
            const lng = parseFloat(first.lon);
            leafletMap.setView([lat, lng], 15);
            setMapMarker(lat, lng);
        } else {
            if (textEl) textEl.innerText = "Location not found. Try clicking on map.";
        }
    } catch (e) {
        console.error("Geocoding search error:", e);
        if (textEl) textEl.innerText = "Search failed. Check your internet connection.";
    }
}

window.confirmMapLocation = function() {
    const inputEl = document.getElementById('event-location');
    if (inputEl && tempSelectedAddress) {
        inputEl.value = tempSelectedAddress;
    }
    closeModal('modal-map-picker');
}

window.openAdminLoginModal = function() {
    document.getElementById('modal-admin-login').classList.add('show');
}

window.openTrackModal = function() {
    document.getElementById('modal-track').classList.add('show');
}

window.closeModal = function(id) {
    document.getElementById(id).classList.remove('show');
}

window.verifyAdminLogin = function() {
    const pin = document.getElementById('admin-pin').value;
    if (pin === '8888' || pin === '1234') {
        localStorage.setItem('admin_logged_in', 'true');
        closeModal('modal-admin-login');
        showAdminView();
    } else {
        alert("Invalid Executive Access PIN.");
    }
}

window.logoutAdmin = function() {
    localStorage.setItem('admin_logged_in', 'false');
    window.location.reload();
}

async function showAdminView() {
    document.getElementById('customer-view').style.display = 'none';
    document.getElementById('admin-view').style.display = 'block';
    document.querySelector('.luxury-header').style.display = 'none';
    
    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        await fetchDatabaseState();
    }
    
    renderAdminCRMBoard();
    renderKOTGrid();
    renderCalendarRulesTable();
    renderAdminInventoryTable();
    renderRosterPayrollTable();
    renderAnalyticsSVG();
    renderCMSReviewsGrid();
    renderAdminGalleryList();
}

window.switchAdminTab = function(tabId) {
    document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById('tab-' + tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

window.changeThemeSkin = function(skinClass) {
    document.body.className = skinClass;
    cmsConfig.color_accent = skinClass === 'theme-gold' ? '#D4AF37' : (skinClass === 'theme-crimson' ? '#801818' : '#0A4E35');
    document.body.style.setProperty('--primary', cmsConfig.color_accent);
    document.body.style.setProperty('--primary-glow', hexToRgbA(cmsConfig.color_accent, 0.15));
}

// --- B2B CRM KANBAN & INGREDIENT CALCULATOR DRAWERS ---
function renderAdminCRMBoard() {
    const lists = {
        Pending: document.getElementById('crm-list-pending'),
        Negotiation: document.getElementById('crm-list-negotiation'),
        Approved: document.getElementById('crm-list-approved'),
        Lost: document.getElementById('crm-list-lost')
    };
    
    // Clear lists
    for (let k in lists) {
        if(lists[k]) lists[k].innerHTML = '';
    }

    let confirmedCount = 0;
    let pendingCount = 0;

    crmLeads.forEach(lead => {
        lead.value = 0; // Force lead value to 0
        if (lead.status === 'Approved') {
            confirmedCount++;
        } else if (lead.status === 'Pending' || lead.status === 'Negotiation') {
            pendingCount++;
        }

        const container = lists[lead.status];
        if (container) {
            container.innerHTML += `
                <div class="crm-lead-card" draggable="true" ondragstart="dragCRMLead(event, '${lead.id}')" onclick="openCRMLeadDrawer('${lead.id}')">
                    <div class="crm-lead-title">${lead.name}</div>
                    <div class="crm-lead-info">
                        <span><i class="fa-regular fa-calendar-check"></i> Date: ${lead.date}</span>
                        <span><i class="fa-solid fa-users"></i> Guests: ${lead.guests}</span>
                    </div>
                    <div class="crm-lead-value">₹0</div>
                </div>
            `;
        }
    });

    document.getElementById('stat-total-revenue').innerText = '₹0';
    document.getElementById('stat-confirmed-events').innerText = confirmedCount;
    document.getElementById('stat-pending-leads').innerText = pendingCount;
    
    // Sync counts
    for(let k in lists) {
        const badge = document.getElementById(`count-lead-${k.toLowerCase()}`);
        if (badge) badge.innerText = crmLeads.filter(l => l.status === k).length;
    }
}

window.dragCRMLead = function(e, leadId) {
    e.dataTransfer.setData('text/plain', leadId);
}

window.allowCRMDrop = function(e) {
    e.preventDefault();
}

window.dragCRMEnter = function(e, colEl) {
    colEl.classList.add('drag-over');
}

window.dragCRMLeave = function(e, colEl) {
    colEl.classList.remove('drag-over');
}

window.dropCRMLead = async function(e, newStatus) {
    e.preventDefault();
    const columns = document.querySelectorAll('.crm-column');
    columns.forEach(col => col.classList.remove('drag-over'));

    const leadId = e.dataTransfer.getData('text/plain');
    const lead = crmLeads.find(l => l.id === leadId);
    
    if (lead) {
        lead.status = newStatus;
        const isHosted = window.location.protocol.startsWith('http');
        if (isHosted) {
            try {
                await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(lead)
                });
            } catch (err) { console.error(err); }
        } else {
            localStorage.setItem('local_leads', JSON.stringify(crmLeads));
        }
        renderAdminCRMBoard();
        renderKOTGrid();
        renderAnalyticsSVG();
    }
}

// B2B Raw Ingredient Requisition Calculator Logic
window.openCRMLeadDrawer = function(leadId) {
    const lead = crmLeads.find(l => l.id === leadId);
    if (!lead) return;

    const drawer = document.getElementById('crm-lead-drawer');
    const content = document.getElementById('crm-drawer-content');
    if (!drawer || !content) return;

    // Calculate Ingredients Requisition coefficients
    let ingredients = {
        'Basmati Rice': 0,
        'Paneer (Cheese)': 0,
        'Premium Saffron': 0, // grams
        'Fresh Dairy Cream': 0,
        'Whole Lentils (Black Urad)': 0,
        'Assorted Vegetables': 0,
        'Desi Ghee': 0,
        'Organic Sugar': 0,
        'All-Purpose Flour (Maida)': 0
    };

    // Selected dishes display list
    let dishListHtml = lead.items.map(itemId => {
        let item = inventoryDB.find(x => x.id === itemId);
        if(!item) return `<li>Unknown Dish ID: ${itemId}</li>`;
        
        // Accumulate B2B weights per guest
        if (itemId === 'm3') { // Saffron Pulao
            ingredients['Basmati Rice'] += 0.08 * lead.guests;
            ingredients['Premium Saffron'] += 0.005 * lead.guests;
        } else if (itemId === 's2') { // Paneer Tikka
            ingredients['Paneer (Cheese)'] += 0.15 * lead.guests;
            ingredients['Assorted Vegetables'] += 0.05 * lead.guests;
        } else if (itemId === 'm4') { // Paneer Lababdar
            ingredients['Paneer (Cheese)'] += 0.12 * lead.guests;
            ingredients['Fresh Dairy Cream'] += 0.02 * lead.guests;
        } else if (itemId === 'm1') { // Dal Bukhara
            ingredients['Whole Lentils (Black Urad)'] += 0.1 * lead.guests;
            ingredients['Fresh Dairy Cream'] += 0.03 * lead.guests;
            ingredients['Desi Ghee'] += 0.02 * lead.guests;
        } else if (itemId === 'd1') { // Saffron Water
            ingredients['Premium Saffron'] += 0.01 * lead.guests;
        } else if (itemId === 'ds3') { // Halwa
            ingredients['Desi Ghee'] += 0.05 * lead.guests;
            ingredients['Organic Sugar'] += 0.08 * lead.guests;
        } else if (itemId === 'm5' || itemId === 's1' || itemId === 's5') { // Flour dishes
            ingredients['All-Purpose Flour (Maida)'] += 0.06 * lead.guests;
        }

        // Generic ingredients
        if (item.category === 'Starter') ingredients['Assorted Vegetables'] += 0.03 * lead.guests;
        if (item.category === 'Main') ingredients['Assorted Vegetables'] += 0.06 * lead.guests;

        return `<li><strong>${item.name}</strong></li>`;
    }).join('');

    // Generate table rows for ingredients
    let ingredientRowsHtml = '';
    for (let item in ingredients) {
        let weight = ingredients[item];
        if (weight > 0) {
            let unit = item.includes('Saffron') ? 'g' : 'kg';
            ingredientRowsHtml += `
                <div class="ingredient-row">
                    <span>${item}</span>
                    <strong>${weight.toFixed(1)} ${unit}</strong>
                </div>
            `;
        }
    }

    if(!ingredientRowsHtml) {
        ingredientRowsHtml = '<p style="font-size:0.85rem; color:var(--text-muted); text-align:center;">No ingredients calculated. Choose dishes to estimate raw materials.</p>';
    }

    content.innerHTML = `
        <h3 class="crm-drawer-title">${lead.name}</h3>
        <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom: 20px;"><i class="fa-regular fa-envelope"></i> Contact: ${lead.phone || 'Not provided'}</p>
        
        <div class="form-group">
            <label>Event Date</label>
            <input type="date" value="${lead.date}" class="form-control" onchange="updateCRMLeadDate('${lead.id}', this.value)">
        </div>

        <div class="form-group">
            <label>Guest Multiplier</label>
            <input type="number" value="${lead.guests}" class="form-control" onchange="updateCRMLeadGuests('${lead.id}', this.value)">
        </div>

        <h4 style="margin-top:20px; font-size:1.1rem; border-bottom:1px solid var(--border-color); padding-bottom:8px;"><i class="fa-solid fa-utensils"></i> Configured Menu Checklist</h4>
        <ul style="padding-left:20px; margin-top:10px; font-size:0.9rem; display:flex; flex-direction:column; gap:8px;">
            ${dishListHtml}
        </ul>

        <!-- B2B ERP Raw ingredients Calculators -->
        <div class="calculator-section">
            <h4><i class="fa-solid fa-calculator"></i> B2B Ingredients Requisition</h4>
            <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:15px;">Auto-multiplied for ${lead.guests} guests to lock vendor quotes.</p>
            <div class="ingredients-list">
                ${ingredientRowsHtml}
            </div>
            <button class="secondary-btn border-btn w-100" style="margin-top:20px; font-size:0.8rem;" onclick="dispatchPurchaseOrderToVendor('${lead.id}')"><i class="fa-solid fa-truck-fast"></i> Dispatch PO to Vendors</button>
        </div>

        <button class="primary-btn w-100" style="background:#FF1744; margin-top:auto;" onclick="deleteCRMLead('${lead.id}')"><i class="fa-solid fa-trash"></i> Delete Inquiry Lead</button>
    `;
    
    drawer.classList.add('open');
}

window.closeCRMDrawer = function() {
    document.getElementById('crm-lead-drawer').classList.remove('open');
}

window.updateCRMLeadDate = async function(leadId, val) {
    const lead = crmLeads.find(l => l.id === leadId);
    if(lead) {
        lead.date = val;
        await syncLeadToServer(lead);
        renderAdminCRMBoard();
    }
}

window.updateCRMLeadGuests = async function(leadId, val) {
    const lead = crmLeads.find(l => l.id === leadId);
    if(lead) {
        lead.guests = parseInt(val) || 100;
        lead.value = 0;
        
        await syncLeadToServer(lead);
        renderAdminCRMBoard();
        openCRMLeadDrawer(leadId); // refresh calculator
    }
}

async function syncLeadToServer(lead) {
    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lead)
            });
        } catch (e) { console.error(e); }
    } else {
        localStorage.setItem('local_leads', JSON.stringify(crmLeads));
    }
}

window.deleteCRMLead = async function(leadId) {
    if(!confirm("Are you sure you want to permanently delete this lead?")) return;
    
    crmLeads = crmLeads.filter(l => l.id !== leadId);
    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        try {
            await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
        } catch(e) {}
    } else {
        localStorage.setItem('local_leads', JSON.stringify(crmLeads));
    }
    
    closeCRMDrawer();
    renderAdminCRMBoard();
    renderKOTGrid();
    renderAnalyticsSVG();
}

// --- B2B DISPATCH VENDOR PURCHASE ORDER (PO) INVOICES ---
window.dispatchPurchaseOrderToVendor = function(leadId) {
    const lead = crmLeads.find(l => l.id === leadId);
    if (!lead) return;

    let ingredients = {
        'Basmati Rice': 0, 'Paneer (Cheese)': 0, 'Premium Saffron': 0, 
        'Fresh Dairy Cream': 0, 'Whole Lentils (Black Urad)': 0, 
        'Assorted Vegetables': 0, 'Desi Ghee': 0, 'Organic Sugar': 0, 'All-Purpose Flour (Maida)': 0
    };

    lead.items.forEach(itemId => {
        if (itemId === 'm3') { ingredients['Basmati Rice'] += 0.08 * lead.guests; ingredients['Premium Saffron'] += 0.005 * lead.guests; }
        else if (itemId === 's2') { ingredients['Paneer (Cheese)'] += 0.15 * lead.guests; ingredients['Assorted Vegetables'] += 0.05 * lead.guests; }
        else if (itemId === 'm4') { ingredients['Paneer (Cheese)'] += 0.12 * lead.guests; ingredients['Fresh Dairy Cream'] += 0.02 * lead.guests; }
        else if (itemId === 'm1') { ingredients['Whole Lentils (Black Urad)'] += 0.1 * lead.guests; ingredients['Fresh Dairy Cream'] += 0.03 * lead.guests; ingredients['Desi Ghee'] += 0.02 * lead.guests; }
        else if (itemId === 'd1') { ingredients['Premium Saffron'] += 0.01 * lead.guests; }
        else if (itemId === 'ds3') { ingredients['Desi Ghee'] += 0.05 * lead.guests; ingredients['Organic Sugar'] += 0.08 * lead.guests; }
        else if (itemId === 'm5' || itemId === 's1' || itemId === 's5') { ingredients['All-Purpose Flour (Maida)'] += 0.06 * lead.guests; }
    });

    let lines = '';
    for (let name in ingredients) {
        if (ingredients[name] > 0) {
            let unit = name.includes('Saffron') ? 'g' : 'kg';
            lines += `
                <tr style="border-bottom:1px solid #eee; font-size:0.9rem;">
                    <td style="padding:10px; font-weight:bold;">${name}</td>
                    <td style="padding:10px; text-align:right;">${ingredients[name].toFixed(1)} ${unit}</td>
                </tr>
            `;
        }
    }

    const htmlInvoice = `
        <div style="font-family:'Outfit',sans-serif; color:#1c2e24; border:1px solid #d4af37; border-radius:12px; padding:30px; background:#fff;">
            <div style="display:flex; justify-content:space-between; border-bottom:2px solid #0a4e35; padding-bottom:15px; margin-bottom:20px;">
                <div><h3 style="margin:0; font-family:'Cinzel',serif; color:#0a4e35;">Khandelwal Caters</h3><span>Purchase Order Requisition</span></div>
                <div style="text-align:right;"><span>Ref: PO-${lead.id}</span><br><span>Date: ${lead.date}</span></div>
            </div>
            <p><strong>Catering Event:</strong> ${lead.name}<br><strong>Total Guests:</strong> ${lead.guests} Pax</p>
            <table style="width:100%; border-collapse:collapse; margin-top:20px;">
                <thead>
                    <tr style="background:#f8f9fa;">
                        <th style="padding:10px; text-align:left; font-size:0.75rem; border-bottom:1px solid #ccc;">Raw Material</th>
                        <th style="padding:10px; text-align:right; font-size:0.75rem; border-bottom:1px solid #ccc;">Required Qty</th>
                    </tr>
                </thead>
                <tbody>
                    ${lines}
                </tbody>
            </table>
            <div style="margin-top:25px; font-size:0.8rem; color:#666; font-style:italic;">This order has been automatically scaled based on standard recipe multiplier profiles.</div>
        </div>
    `;

    document.getElementById('b2b-po-bill-view').innerHTML = htmlInvoice;
    document.getElementById('modal-b2b-po').classList.add('show');
}

window.printB2BPO = function() {
    const content = document.getElementById('b2b-po-bill-view').innerHTML;
    let win = window.open('', '', 'height=600,width=700');
    if (win) {
        win.document.write(`<html><head><title>Print PO</title></head><body onload="window.print()">${content}</body></html>`);
        win.document.close();
    }
}

window.sendB2BPOToVendor = function() {
    alert("Purchase Order Requisition dispatched to raw materials vendor team via automated systems!");
    closeModal('modal-b2b-po');
}

// --- KITCHEN ORDERS (KOT) GRID ---
function renderKOTGrid() {
    const grid = document.getElementById('kot-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    // Only approved (confirmed) bookings go to kitchen
    const confirmedLeads = crmLeads.filter(l => l.status === 'Approved');
    if (confirmedLeads.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--text-muted);"><i class="fa-solid fa-fire-burner" style="font-size:3rem; margin-bottom:15px; color:var(--gold);"></i><p>No active kitchen orders. Approve event leads to trigger production tickets.</p></div>';
        return;
    }

    confirmedLeads.forEach(lead => {
        let dishLinesHtml = lead.items.map(itemId => {
            let item = inventoryDB.find(x => x.id === itemId);
            return `<li class="kot-item"><span>${item ? item.name : itemId}</span><strong>Qty: ${lead.guests}</strong></li>`;
        }).join('');

        grid.innerHTML += `
            <div class="kot-ticket">
                <div class="kot-header">
                    <h4>${lead.name}</h4>
                    <span class="badge gold-badge" style="font-size:0.6rem;">KOT-${lead.id}</span>
                </div>
                <div class="kot-body">
                    <ul class="kot-items-list">${dishLinesHtml}</ul>
                </div>
                <div class="kot-footer" style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center;">
                    <span>Date: ${lead.date}</span>
                    <button class="primary-btn small-btn" onclick="completeKOTOrder('${lead.id}')"><i class="fa-solid fa-circle-check"></i> Dispatched</button>
                </div>
            </div>
        `;
    });
}

window.completeKOTOrder = function(id) {
    alert("Kitchen order ticket dispatched and cleared for KOT-" + id);
    // Mark as archived / lost so it clears out
    const lead = crmLeads.find(l => l.id === id);
    if(lead) {
        lead.status = 'Lost'; // Archive
        syncLeadToServer(lead);
        renderAdminCRMBoard();
        renderKOTGrid();
    }
}

// --- STAFF ROSTER AND PAYROLL ERP ---
const rosterDB = [
    { name: 'Chef Hari Lal', role: 'Head Banquet Chef', hourly: 0 },
    { name: 'Chef Rajesh Sharma', role: 'Main Tandoori Chef', hourly: 0 },
    { name: 'Vinod Kumar', role: 'Silver Service Waiter', hourly: 0 },
    { name: 'Amit Singh', role: 'Silver Service Waiter', hourly: 0 },
    { name: 'Ramesh Lal', role: 'Utility Cleaning staff', hourly: 0 }
];

function renderRosterPayrollTable() {
    const tbody = document.getElementById('roster-table-body');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    let activeEventsCount = crmLeads.filter(l => l.status === 'Approved').length;
    let totalPayroll = 0;
    let staffCount = 0;

    rosterDB.forEach((staff, i) => {
        let hoursLogged = activeEventsCount > 0 ? (8 * activeEventsCount) : 0;
        let payout = hoursLogged * staff.hourly;
        totalPayroll += payout;
        if(hoursLogged > 0) staffCount++;

        tbody.innerHTML += `
            <tr>
                <td><strong>${staff.name}</strong></td>
                <td>${activeEventsCount > 0 ? `${activeEventsCount} Active Banquets` : 'No shifts assigned'}</td>
                <td><span class="badge emerald-badge" style="font-size:0.65rem;">${staff.role}</span></td>
                <td>${hoursLogged} Hrs logged</td>
                <td>₹${staff.hourly}/hr</td>
                <td><strong class="highlight-gold">₹${payout.toLocaleString()}</strong></td>
            </tr>
        `;
    });

    document.getElementById('roster-staff-count').innerText = staffCount + ' Crew members';
    document.getElementById('roster-total-payroll').innerText = '₹' + totalPayroll.toLocaleString();
    document.getElementById('stat-roster-payroll').innerText = '₹' + totalPayroll.toLocaleString();
}

// --- FINANCIAL PERFORMANCE ANALYTICS CHART ---
function renderAnalyticsSVG() {
    const container = document.getElementById('chart-svg-container');
    if(!container) return;
    container.innerHTML = '';
    
    document.getElementById('fin-revenue').innerText = '₹0';
    document.getElementById('fin-expenses').innerText = '₹0';
    document.getElementById('fin-profit').innerText = '₹0';

    // Draw empty/zeroed analytics SVG
    container.innerHTML = `
        <div class="chart-bar-col">
            <div class="chart-bar-group">
                <div class="chart-bar" style="height: 10px;"></div>
            </div>
            <span class="chart-col-label">Revenue</span>
        </div>
        <div class="chart-bar-col">
            <div class="chart-bar-group">
                <div class="chart-bar expenses" style="height: 10px;"></div>
            </div>
            <span class="chart-col-label">Expenses</span>
        </div>
        <div class="chart-bar-col">
            <div class="chart-bar-group">
                <div class="chart-bar profits" style="height: 10px;"></div>
            </div>
            <span class="chart-col-label">Net Profit</span>
        </div>
    `;
}

// --- MENU INVENTORY MANAGER TAB ---
function renderAdminInventoryTable() {
    const tbody = document.getElementById('admin-inventory-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    inventoryDB.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td><span class="badge gold-badge" style="font-size:0.65rem;">${item.category}</span></td>
                <td>₹0</td>
                <td><span style="color:${item.active?'#00E676':'#FF1744'}; font-weight:700;">${item.active?'In Stock':'Out of Stock'}</span></td>
                <td>
                    <button class="small-btn primary-btn" onclick="toggleInventoryStatus('${item.id}')">${item.active?'Disable':'Enable'}</button>
                </td>
            </tr>
        `;
    });
}

window.openNewInventoryItemModal = async function() {
    let name = prompt("Enter Dish Name:");
    let cat = prompt("Enter Category (Drink, Starter, Main, Dessert):");
    if(!name || !cat) return;

    let newItem = {
        id: 'd' + Date.now(),
        name: name,
        category: cat,
        price: 0,
        active: true,
        cal: 150, protein: 5, carbs: 20, fat: 5, allergens: [],
        desc: "Our handcrafted luxury culinary recipe made with premium locally sourced ingredients, customized with royal heritage garnish."
    };

    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            const dbData = await res.json();
            inventoryDB = dbData.inventory.map(item => ({ ...item, price: 0 }));
        } catch (e) { console.error(e); }
    } else {
        inventoryDB.push(newItem);
        localStorage.setItem('local_inventory', JSON.stringify(inventoryDB));
    }
    renderAdminInventoryTable();
}

window.toggleInventoryStatus = async function(id) {
    const item = inventoryDB.find(i => i.id === id);
    if (item) {
        item.active = !item.active;
        
        const isHosted = window.location.protocol.startsWith('http');
        if (isHosted) {
            try {
                await fetch('/api/inventory', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
            } catch (e) { console.error(e); }
        } else {
            localStorage.setItem('local_inventory', JSON.stringify(inventoryDB));
        }
        renderAdminInventoryTable();
    }
}

// --- CMS CONFIG SAVES ---
window.updateBrandFont = function(val) {
    cmsConfig.brand_font = val;
    document.body.style.setProperty('--base-font', `'${val}', sans-serif`);
}

window.updateBrandColorAccent = function(val) {
    cmsConfig.color_accent = val;
    document.body.style.setProperty('--primary', val);
    document.body.style.setProperty('--primary-glow', hexToRgbA(val, 0.15));
    document.getElementById('cms-color-val').innerText = val;
}

window.saveCMSBanners = async function() {
    cmsConfig.hero_title = document.getElementById('cms-hero-title').value;
    cmsConfig.hero_sub = document.getElementById('cms-hero-sub').value;
    
    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        try {
            await fetch('/api/cms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cmsConfig)
            });
        } catch (e) { console.error(e); }
    } else {
        localStorage.setItem('local_cmsConfig', JSON.stringify(cmsConfig));
    }
    
    alert("Branding identity published successfully.");
}

function renderCMSReviewsGrid() {
    const container = document.getElementById('cms-reviews-grid');
    if(!container) return;
    container.innerHTML = '';
    
    reviewsDB.forEach(r => {
        container.innerHTML += `
            <div style="background:var(--bg-card); border:1px solid var(--border-color); padding:20px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${r.author}</strong>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-top:5px;">"${r.text}"</p>
                </div>
                <div style="display:flex; gap:10px;">
                    ${!r.approved ? `<button class="small-btn primary-btn" onclick="approveReview('${r.id}', true)"><i class="fa-solid fa-check"></i> Approve</button>` : ''}
                    <button class="small-btn primary-btn" style="background:#FF1744;" onclick="deleteReview('${r.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            </div>
        `;
    });
}

window.approveReview = async function(id, status) {
    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        try {
            await fetch('/api/reviews/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, approved: status })
            });
        } catch (e) {}
    }
    const r = reviewsDB.find(x => x.id === id);
    if(r) r.approved = status;
    
    renderCMSReviewsGrid();
    renderReviewsCarousel();
}

window.deleteReview = async function(id) {
    if(!confirm("Delete review comment?")) return;
    const isHosted = window.location.protocol.startsWith('http');
    if (isHosted) {
        try {
            await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
        } catch (e) {}
    }
    reviewsDB = reviewsDB.filter(x => x.id !== id);
    
    renderCMSReviewsGrid();
    renderReviewsCarousel();
}

// --- AI Heritage Curation Assistant ---
window.toggleAIChat = function() {
    let widget = document.getElementById('ai-chat-widget');
    let input = document.getElementById('ai-chat-input-area');
    let icon = document.getElementById('ai-toggle-icon');
    let isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        widget.classList.toggle('mobile-expanded');
        if (widget.classList.contains('mobile-expanded')) {
            input.style.display = 'flex';
            widget.style.width = 'calc(100% - 30px)';
            widget.style.height = 'auto';
        } else {
            input.style.display = 'none';
            widget.style.width = '56px';
            widget.style.height = '56px';
        }
    } else {
        widget.classList.toggle('collapsed');
        if (widget.classList.contains('collapsed')) {
            input.style.display = 'none';
            icon.className = 'fa-solid fa-chevron-up';
        } else {
            input.style.display = 'flex';
            icon.className = 'fa-solid fa-chevron-down';
        }
    }
}

window.handleAIKeyPress = function(e) { 
    if(e.key === 'Enter') sendAIMessage(); 
}

window.sendAIMessage = function() {
    let input = document.getElementById('ai-user-input');
    let text = input.value.trim();
    if(!text) return;
    
    let body = document.getElementById('ai-chat-body');
    body.innerHTML += `<div class="chat-msg user-msg">${text}</div>`;
    input.value = '';
    body.scrollTop = body.scrollHeight;
    
    setTimeout(() => {
        let reply = "Namaste! I am the Virtual Heritage Chef representing Khandelwal Caters. Let me know your guest count or cuisine preferences, and I will recommend the perfect heritage package for you!";
        
        let lowerText = text.toLowerCase();
        if(lowerText.includes('paneer') || lowerText.includes('tikka') || lowerText.includes('dal') || lowerText.includes('bukhara') || lowerText.includes('makhani')) {
            reply = "Excellent choice! Our Shahi Dal Bukhara is slow-cooked for 24 hours on coal, and our Paneer Tikka is prepared using fresh cottage cheese skewered with charcoal-grilled spices. They are signature items in our Super Executive Menu!";
        } else if(lowerText.includes('owner') || lowerText.includes('owner name') || lowerText.includes('kiski') || lowerText.includes('pradeep') || lowerText.includes('khandelwal')) {
            reply = "Khandelwal Caters was founded and is proudly owned by Shri Pradeep Khandelwal. He personally supervises the curation and execution of every event to ensure royal standards.";
        } else if(lowerText.includes('price') || lowerText.includes('rate') || lowerText.includes('cost') || lowerText.includes('paisa') || lowerText.includes('budget')) {
            reply = "We believe in tailor-made styling for every heritage celebration. There are no fixed prices or booking fees shown here. Simply fill out our Inquiry Form, and our team will get in touch with a customized quote!";
        } else if(lowerText.includes('menu') || lowerText.includes('dish') || lowerText.includes('cuisine') || lowerText.includes('item') || lowerText.includes('food')) {
            reply = "We offer three curated heritage menus: Breakfast (with Pooris, Chhole Bhature, Upma), Hi-Tea (with Pakoras, Dhoklas, Samosas, Pastries), and the luxury Super Executive Menu (with 8 Starters, 7 Chaat stalls, 2 Paneer dishes, 6 Vegetables, 2 Dals, and 5 Desserts). Let me know if you want to know about any specific dish!";
        } else if(lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('namaste') || lowerText.includes('hey')) {
            reply = "Namaste! Hope you are having a wonderful day. I am the AI representative of Shri Pradeep Khandelwal. How can I help you curate the perfect menu for your celebration?";
        } else if(lowerText.includes('location') || lowerText.includes('address') || lowerText.includes('jaipur') || lowerText.includes('kahan')) {
            reply = "We are located in Jaipur, Rajasthan, and serve destination weddings and elite gatherings all over India. You can enter your preferred location in the booking form!";
        } else if(lowerText.includes('contact') || lowerText.includes('phone') || lowerText.includes('whatsapp') || lowerText.includes('number')) {
            reply = "You can submit your WhatsApp number and contact details in the Booking Inquiry Form on this page, and our team will send a custom PDF proposal directly to you!";
        } else if(lowerText.includes('shake') || lowerText.includes('mocktail') || lowerText.includes('shot') || lowerText.includes('drink')) {
            reply = "We offer a luxurious welcome bar with Assorted Mocktails, Shahi Jaljeera, Butter Milk, and our signature revolving belt Shot Bar with Paan, Jamun, and Coconut shots.";
        } else if(lowerText.includes('sweet') || lowerText.includes('dessert') || lowerText.includes('halwa') || lowerText.includes('jalebi') || lowerText.includes('rabdi') || lowerText.includes('rasmalai') || lowerText.includes('jamun')) {
            reply = "Our desserts are legendary! We serve soft Rasmalai, hot Jalebi Garam with creamy Rabdi, Gulab Jamun, Moong Dal Halwa roasted in pure ghee, and Kesar Pista Kulfi.";
        }
        
        body.innerHTML += `<div class="chat-msg ai-msg">${reply}</div>`;
        body.scrollTop = body.scrollHeight;
    }, 800);
}

// --- VFX: GOLD MOUSE SPARKLES TRAIL ---
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

    let particlesArray = [];

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 4 + 1;
            this.speedX = Math.random() * 2 - 1.0;
            this.speedY = Math.random() * 2 - 1.8; // upward draft
            this.color = '#D4AF37'; // gold
            this.alpha = 1.0;
            this.decay = Math.random() * 0.02 + 0.015;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.size -= 0.04;
            this.alpha -= this.decay;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, Math.max(0, this.size), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    window.addEventListener('mousemove', (e) => {
        for (let i = 0; i < 2; i++) {
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

// --- GSAP INTRO BANNER ANIMATIONS ---
window.initScrollAnimations = function() {
    // Check if ScrollTrigger is loaded
    if(typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        const animateIfExists = (selector, config) => {
            if (document.querySelector(selector)) {
                if (config.scrollTrigger && config.scrollTrigger.trigger) {
                    if (!document.querySelector(config.scrollTrigger.trigger)) {
                        return; // Trigger doesn't exist
                    }
                }
                gsap.from(selector, config);
            }
        };

        // Parallax hero text entrance
        animateIfExists("#hero-title", {
            y: 50,
            opacity: 0,
            duration: 1.5,
            ease: "power4.out"
        });
        
        animateIfExists("#hero-subtitle", {
            y: 30,
            opacity: 0,
            duration: 1.2,
            delay: 0.4,
            ease: "power3.out"
        });
        
        animateIfExists(".hero-buttons", {
            y: 20,
            opacity: 0,
            duration: 1.0,
            delay: 0.7,
            ease: "power2.out"
        });

        // Scroll animations disabled to prevent elements from not loading properly

    }
};

// --- GALLERY MANAGER LOGIC ---
window.uploadGalleryItem = async function() {
    const fileInput = document.getElementById('admin-gallery-file');
    const captionInput = document.getElementById('admin-gallery-caption').value.trim();
    
    if(!fileInput.files[0] || !captionInput) {
        alert("Please select a file and enter a caption.");
        return;
    }
    
    const file = fileInput.files[0];
    const isVideo = file.type.startsWith('video');
    
    const fileUrl = URL.createObjectURL(file);
    
    const newId = 'G' + (1000 + galleryDB.length);
    const newPost = {
        id: newId,
        type: isVideo ? 'video' : 'image',
        url: fileUrl,
        caption: captionInput
    };
    
    galleryDB.unshift(newPost);
    alert("Media uploaded to Gallery successfully!");
    
    fileInput.value = '';
    document.getElementById('admin-gallery-caption').value = '';
    
    renderGalleryPosts();
    renderAdminGalleryList();
};

window.renderAdminGalleryList = function() {
    const list = document.getElementById('admin-gallery-list');
    if(!list) return;
    list.innerHTML = '';
    galleryDB.forEach((post, idx) => {
        list.innerHTML += `
            <div style="border:1px solid var(--border-color); padding:10px; border-radius:5px; display:flex; align-items:center; gap:10px; background:var(--bg-card);">
                <div style="width:80px; height:80px; background:#000; overflow:hidden; border-radius:4px; flex-shrink:0;">
                    ${post.type === 'video' ? `<video src="${post.url}" style="width:100%; height:100%; object-fit:cover;"></video>` : `<img src="${post.url}" style="width:100%; height:100%; object-fit:cover;">`}
                </div>
                <div style="flex:1;">
                    <strong style="color:var(--primary);">${post.caption}</strong>
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-top:5px;">Type: ${post.type.toUpperCase()}</div>
                </div>
                <button class="secondary-btn border-btn small-btn" onclick="deleteGalleryItem(${idx})" style="padding:8px 12px; font-size:1rem; color:#ff4d4d; border-color:#ff4d4d;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
};

window.deleteGalleryItem = async function(idx) {
    if(confirm("Are you sure you want to delete this media from the gallery?")) {
        const item = galleryDB[idx];
        if (window.location.protocol.startsWith('http')) {
            try {
                await fetch('/api/gallery/' + item.id, { method: 'DELETE' });
            } catch (e) {
                console.error('Delete error:', e);
            }
        }
        galleryDB.splice(idx, 1);
        renderGalleryPosts();
        renderAdminGalleryList();
    }
};

// --- MOBILE MENU LOGIC ---
window.toggleMobileMenu = function() {
    const nav = document.getElementById('main-navigation');
    if (nav) {
        nav.classList.toggle('open');
    }
};

window.closeMobileMenu = function() {
    const nav = document.getElementById('main-navigation');
    if (nav) {
        nav.classList.remove('open');
    }
};
