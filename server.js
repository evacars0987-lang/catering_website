const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists (ephemeral fallback for local dev)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure backups directory exists
const backupsDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
}

// Database JSON path
const dbPath = path.join(__dirname, 'database.json');

// Default database structure
const defaultDB = {
    "inventory": [
        {
            "id": "bf_oj",
            "name": "Orange Juice",
            "category": "Drink",
            "price": 0,
            "active": true,
            "cal": 80,
            "protein": 1,
            "carbs": 18,
            "fat": 0,
            "allergens": [],
            "desc": "Freshly squeezed sweet oranges served chilled."
        },
        {
            "id": "bf_mj",
            "name": "Mix Fruit Juice",
            "category": "Drink",
            "price": 0,
            "active": true,
            "cal": 90,
            "protein": 1,
            "carbs": 22,
            "fat": 0,
            "allergens": [],
            "desc": "Curated blend of seasonal Indian fruits."
        },
        {
            "id": "bf_pj",
            "name": "Pineapple Juice",
            "category": "Drink",
            "price": 0,
            "active": true,
            "cal": 85,
            "protein": 1,
            "carbs": 20,
            "fat": 0,
            "allergens": [],
            "desc": "Tangy and sweet fresh pineapple juice."
        },
        {
            "id": "d4",
            "name": "Traditional Lassi",
            "category": "Drink",
            "price": 0,
            "active": true,
            "cal": 210,
            "protein": 5,
            "carbs": 22,
            "fat": 8,
            "allergens": [
                "Dairy"
            ],
            "desc": "Thick hand-churned yogurt flavored with cardamom and saffron threads."
        },
        {
            "id": "d5",
            "name": "Butter Milk",
            "category": "Drink",
            "price": 0,
            "active": true,
            "cal": 60,
            "protein": 2,
            "carbs": 5,
            "fat": 2,
            "allergens": [
                "Dairy"
            ],
            "desc": "Traditional spiced buttermilk with roasted cumin and mint."
        },
        {
            "id": "bf_tea",
            "name": "Royal Masala Tea",
            "category": "Drink",
            "price": 0,
            "active": true,
            "cal": 90,
            "protein": 2,
            "carbs": 12,
            "fat": 3,
            "allergens": [
                "Dairy"
            ],
            "desc": "Brewed with fresh milk, ginger, cardamom, and heritage spices."
        },
        {
            "id": "bf_coffee",
            "name": "Premium Filter Coffee",
            "category": "Drink",
            "price": 0,
            "active": true,
            "cal": 110,
            "protein": 3,
            "carbs": 15,
            "fat": 3,
            "allergens": [
                "Dairy"
            ],
            "desc": "Aromatic south Indian decoction blended with steamed hot milk."
        },
        {
            "id": "sb_mocktail",
            "name": "Assorted Mocktails",
            "category": "Drink",
            "price": 0,
            "active": true,
            "cal": 120,
            "protein": 0,
            "carbs": 30,
            "fat": 0,
            "allergens": [],
            "desc": "Bespoke mocktail curations including Mint Mojito and Blue Lagoon."
        },
        {
            "id": "sb_jaljeera",
            "name": "Shahi Jaljeera",
            "category": "Drink",
            "price": 0,
            "active": true,
            "cal": 40,
            "protein": 0,
            "carbs": 8,
            "fat": 0,
            "allergens": [],
            "desc": "Refreshing cumin-coriander spiced water with fresh mint and boondi."
        },
        {
            "id": "sb_softdrinks",
            "name": "Assorted Soft Drinks",
            "category": "Drink",
            "price": 0,
            "active": true,
            "cal": 140,
            "protein": 0,
            "carbs": 35,
            "fat": 0,
            "allergens": [],
            "desc": "Selection of carbonated beverages served chilled."
        },
        {
            "id": "s2",
            "name": "Paneer Tikka",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 250,
            "protein": 15,
            "carbs": 5,
            "fat": 18,
            "allergens": [
                "Dairy"
            ],
            "desc": "Tandoor-charred cottage cheese cubes marinated in Greek yogurt and spices."
        },
        {
            "id": "ex_ps",
            "name": "Paneer Ke Shole",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 280,
            "protein": 14,
            "carbs": 8,
            "fat": 20,
            "allergens": [
                "Dairy",
                "Gluten"
            ],
            "desc": "Spiced paneer rolls wrapped in thin bread and fried to a golden crisp."
        },
        {
            "id": "ex_mp",
            "name": "Malai Paneer Tikka",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 290,
            "protein": 14,
            "carbs": 6,
            "fat": 22,
            "allergens": [
                "Dairy",
                "Nuts"
            ],
            "desc": "Skewered cottage cheese cubes marinated in rich cashew paste and cream."
        },
        {
            "id": "ex_pa",
            "name": "Paneer Amritsari",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 270,
            "protein": 16,
            "carbs": 10,
            "fat": 19,
            "allergens": [
                "Dairy",
                "Gluten"
            ],
            "desc": "Batter-fried paneer strips spiced with carom seeds and yellow chilies."
        },
        {
            "id": "ex_hb",
            "name": "Hara Bhara Kabab",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 180,
            "protein": 5,
            "carbs": 16,
            "fat": 10,
            "allergens": [
                "Gluten"
            ],
            "desc": "Deep-fried patties made of spinach, green peas, potatoes, and spices."
        },
        {
            "id": "ex_ckb",
            "name": "Corn Kabab",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 190,
            "protein": 4,
            "carbs": 20,
            "fat": 9,
            "allergens": [
                "Gluten"
            ],
            "desc": "Golden patties of sweet corn and herbs, shallow fried."
        },
        {
            "id": "ex_sk",
            "name": "Veg Seekh Kabab",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 160,
            "protein": 6,
            "carbs": 14,
            "fat": 8,
            "allergens": [],
            "desc": "Minced vegetables and spices skewered and cooked in tandoor."
        },
        {
            "id": "ex_ta",
            "name": "Tandoori Aloo",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 150,
            "protein": 3,
            "carbs": 22,
            "fat": 5,
            "allergens": [
                "Dairy"
            ],
            "desc": "Scooped potatoes stuffed with cottage cheese and dry fruits, tandoori roasted."
        },
        {
            "id": "ex_sc",
            "name": "Tandoori Soya Chaap",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 210,
            "protein": 12,
            "carbs": 10,
            "fat": 12,
            "allergens": [
                "Soy",
                "Dairy"
            ],
            "desc": "Soya chunks marinated in yogurt masala and cooked in a clay oven."
        },
        {
            "id": "ht1",
            "name": "Vegetable Pakora",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 170,
            "protein": 4,
            "carbs": 18,
            "fat": 9,
            "allergens": [],
            "desc": "Assorted seasonal vegetable fritters coated in gram flour batter."
        },
        {
            "id": "ht2",
            "name": "Dhokla with Chili",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 120,
            "protein": 4,
            "carbs": 20,
            "fat": 3,
            "allergens": [],
            "desc": "Spongy steamed gram flour cakes served with fried green chilies."
        },
        {
            "id": "ht3",
            "name": "Bread Pakora",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 220,
            "protein": 5,
            "carbs": 25,
            "fat": 11,
            "allergens": [
                "Gluten"
            ],
            "desc": "Fried bread slices stuffed with spiced mashed potatoes."
        },
        {
            "id": "ht4",
            "name": "Mini Samosa",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 150,
            "protein": 3,
            "carbs": 18,
            "fat": 8,
            "allergens": [
                "Gluten"
            ],
            "desc": "Crispy pastry cones filled with seasoned potatoes and peas."
        },
        {
            "id": "ex_cp",
            "name": "Chili Paneer Dry",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 260,
            "protein": 12,
            "carbs": 12,
            "fat": 16,
            "allergens": [
                "Dairy",
                "Gluten",
                "Soy"
            ],
            "desc": "Wok-tossed paneer cubes with bell peppers, green chilies, and soy sauce."
        },
        {
            "id": "ex_vm",
            "name": "Veg Manchurian Dry",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 210,
            "protein": 4,
            "carbs": 24,
            "fat": 10,
            "allergens": [
                "Gluten",
                "Soy"
            ],
            "desc": "Crispy vegetable balls tossed in a tangy and spicy soy-garlic sauce."
        },
        {
            "id": "ex_gg",
            "name": "Golgappe (Atta & Suji)",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 110,
            "protein": 2,
            "carbs": 22,
            "fat": 2,
            "allergens": [
                "Gluten"
            ],
            "desc": "Crisp puris served with spiced mint water, sweet tamarind, and potato-chickpea filling."
        },
        {
            "id": "ex_at",
            "name": "Aloo Tikki",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 190,
            "protein": 3,
            "carbs": 25,
            "fat": 8,
            "allergens": [
                "Dairy"
            ],
            "desc": "Pan-fried potato patties served with sweet curd, green chutney, and tamarind."
        },
        {
            "id": "ex_rk",
            "name": "Shahi Raj Kachori",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 320,
            "protein": 6,
            "carbs": 38,
            "fat": 15,
            "allergens": [
                "Dairy",
                "Gluten"
            ],
            "desc": "Grand crispy kachori stuffed with sprouts, yogurt, chutneys, and fine sev."
        },
        {
            "id": "s4",
            "name": "Papdi Chaat",
            "category": "Starter",
            "price": 0,
            "active": true,
            "cal": 240,
            "protein": 5,
            "carbs": 28,
            "fat": 11,
            "allergens": [
                "Dairy",
                "Gluten"
            ],
            "desc": "Crisp flour crackers topped with potatoes, chickpeas, yogurt, and sweet chutneys."
        },
        {
            "id": "ex_sh",
            "name": "Shahi Paneer",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 310,
            "protein": 14,
            "carbs": 10,
            "fat": 22,
            "allergens": [
                "Dairy",
                "Nuts"
            ],
            "desc": "Paneer cooked in a rich, creamy, and mildly sweet tomato-onion gravy."
        },
        {
            "id": "ex_kp",
            "name": "Kadhai Paneer",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 290,
            "protein": 15,
            "carbs": 8,
            "fat": 20,
            "allergens": [
                "Dairy"
            ],
            "desc": "Paneer tossed with capsicum, onions, and freshly ground kadhai masala."
        },
        {
            "id": "m4",
            "name": "Paneer Lababdar",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 320,
            "protein": 14,
            "carbs": 9,
            "fat": 22,
            "allergens": [
                "Dairy",
                "Nuts"
            ],
            "desc": "Cottage cheese cubes in a creamy tomato-cashew gravy with grated paneer."
        },
        {
            "id": "ex_mk",
            "name": "Malai Kofta",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 340,
            "protein": 8,
            "carbs": 20,
            "fat": 24,
            "allergens": [
                "Dairy",
                "Nuts"
            ],
            "desc": "Paneer and potato dumplings in a rich, sweet, cashew-based cream sauce."
        },
        {
            "id": "ex_nv",
            "name": "Navratan Korma",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 280,
            "protein": 6,
            "carbs": 22,
            "fat": 18,
            "allergens": [
                "Dairy",
                "Nuts"
            ],
            "desc": "Rich vegetable curry cooked with nine different fruits, vegetables, and nuts."
        },
        {
            "id": "ex_dm",
            "name": "Kashmiri Dum Aloo",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 210,
            "protein": 4,
            "carbs": 28,
            "fat": 9,
            "allergens": [
                "Dairy"
            ],
            "desc": "Baby potatoes cooked in a rich fennel and ginger flavored yogurt gravy."
        },
        {
            "id": "bf_cb",
            "name": "Chhole Bhature",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 450,
            "protein": 12,
            "carbs": 55,
            "fat": 20,
            "allergens": [
                "Gluten",
                "Dairy"
            ],
            "desc": "Spiced chickpea curry served with fluffy, deep-fried leavened bread."
        },
        {
            "id": "bf_pb",
            "name": "Poori Bhaji",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 380,
            "protein": 8,
            "carbs": 48,
            "fat": 16,
            "allergens": [
                "Gluten"
            ],
            "desc": "Golden-fried whole wheat pooris served with dry potato bhaji."
        },
        {
            "id": "ex_gc",
            "name": "Gatta Curry",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 240,
            "protein": 8,
            "carbs": 18,
            "fat": 15,
            "allergens": [
                "Dairy"
            ],
            "desc": "Gram flour dumplings cooked in a traditional Rajasthani spiced yogurt gravy."
        },
        {
            "id": "m1",
            "name": "Dal Bukhara",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 320,
            "protein": 12,
            "carbs": 28,
            "fat": 16,
            "allergens": [
                "Dairy"
            ],
            "desc": "Signature black lentils slow-cooked overnight with fresh cream and white butter."
        },
        {
            "id": "ex_dmh",
            "name": "Dal Makhani",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 310,
            "protein": 11,
            "carbs": 26,
            "fat": 15,
            "allergens": [
                "Dairy"
            ],
            "desc": "Slow-cooked black lentils and kidney beans enriched with butter and cream."
        },
        {
            "id": "ex_dy",
            "name": "Yellow Dal Tadka",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 180,
            "protein": 9,
            "carbs": 24,
            "fat": 5,
            "allergens": [],
            "desc": "Yellow lentils tempered with ghee, cumin seeds, garlic, and red chilies."
        },
        {
            "id": "ex_vb",
            "name": "Veg Biryani",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 290,
            "protein": 6,
            "carbs": 45,
            "fat": 9,
            "allergens": [
                "Dairy"
            ],
            "desc": "Fragrant basmati rice layered with vegetables, saffron, and aromatic herbs."
        },
        {
            "id": "m3",
            "name": "Kashmiri Pulao",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 260,
            "protein": 5,
            "carbs": 42,
            "fat": 7,
            "allergens": [
                "Nuts"
            ],
            "desc": "Mildly sweet basmati rice cooked with saffron, fresh fruits, and dry fruits."
        },
        {
            "id": "ex_nan",
            "name": "Butter Naan",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 220,
            "protein": 6,
            "carbs": 38,
            "fat": 5,
            "allergens": [
                "Gluten",
                "Dairy"
            ],
            "desc": "Traditional tandoor-baked leavened flatbread brushed with butter."
        },
        {
            "id": "ex_mr",
            "name": "Missi Roti",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 150,
            "protein": 6,
            "carbs": 22,
            "fat": 3,
            "allergens": [
                "Gluten"
            ],
            "desc": "Flatbread made with a blend of gram flour, whole wheat flour, and herbs."
        },
        {
            "id": "bf_sp",
            "name": "Stuffed Parantha with Curd",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 340,
            "protein": 8,
            "carbs": 45,
            "fat": 12,
            "allergens": [
                "Gluten",
                "Dairy"
            ],
            "desc": "Tandoor-baked flatbread stuffed with potato/paneer, served with fresh curd."
        },
        {
            "id": "bf_id",
            "name": "Idli Sambhar",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 180,
            "protein": 6,
            "carbs": 35,
            "fat": 1,
            "allergens": [],
            "desc": "Steamed rice cakes served with hot lentil soup and coconut chutney."
        },
        {
            "id": "bf_ds",
            "name": "Masala Dosa",
            "category": "Main",
            "price": 0,
            "active": true,
            "cal": 260,
            "protein": 5,
            "carbs": 42,
            "fat": 7,
            "allergens": [],
            "desc": "Crispy rice and lentil crepe stuffed with spiced potato mash."
        },
        {
            "id": "ex_rm",
            "name": "Rasmalai",
            "category": "Dessert",
            "price": 0,
            "active": true,
            "cal": 220,
            "protein": 6,
            "carbs": 22,
            "fat": 12,
            "allergens": [
                "Dairy",
                "Nuts"
            ],
            "desc": "Sweet cottage cheese patties soaked in saffron-flavored thickened milk."
        },
        {
            "id": "ex_gj",
            "name": "Gulab Jamun",
            "category": "Dessert",
            "price": 0,
            "active": true,
            "cal": 280,
            "protein": 4,
            "carbs": 45,
            "fat": 10,
            "allergens": [
                "Dairy",
                "Gluten"
            ],
            "desc": "Golden milk-solid spheres fried and soaked in warm cardamom sugar syrup."
        },
        {
            "id": "ex_rj",
            "name": "Jalebi Garam with Rabdi",
            "category": "Dessert",
            "price": 0,
            "active": true,
            "cal": 320,
            "protein": 5,
            "carbs": 55,
            "fat": 9,
            "allergens": [
                "Dairy",
                "Gluten"
            ],
            "desc": "Crispy fermented-batter spirals soaked in sugar syrup, served with creamy rabdi."
        },
        {
            "id": "ds3",
            "name": "Moong Dal Halwa",
            "category": "Dessert",
            "price": 0,
            "active": true,
            "cal": 400,
            "protein": 6,
            "carbs": 50,
            "fat": 20,
            "allergens": [
                "Dairy",
                "Nuts"
            ],
            "desc": "Rich dessert made of split yellow lentils roasted in pure desi ghee."
        },
        {
            "id": "ds2",
            "name": "Vanilla Ice Cream",
            "category": "Dessert",
            "price": 0,
            "active": true,
            "cal": 160,
            "protein": 3,
            "carbs": 18,
            "fat": 9,
            "allergens": [
                "Dairy"
            ],
            "desc": "Rich and creamy vanilla bean ice cream."
        },
        {
            "id": "ex_kp_kulfi",
            "name": "Kesar Pista Kulfi",
            "category": "Dessert",
            "price": 0,
            "active": true,
            "cal": 210,
            "protein": 5,
            "carbs": 20,
            "fat": 12,
            "allergens": [
                "Dairy",
                "Nuts"
            ],
            "desc": "Traditional Indian ice cream flavored with saffron, pistachios, and almonds."
        },
        {
            "id": "ht5",
            "name": "Assorted Pastries",
            "category": "Dessert",
            "price": 0,
            "active": true,
            "cal": 240,
            "protein": 3,
            "carbs": 30,
            "fat": 12,
            "allergens": [
                "Gluten",
                "Dairy"
            ],
            "desc": "Selection of pineapple, strawberry, and chocolate pastries."
        },
        { "id": "guj_dhokla", "name": "Dhokla", "category": "Gujarati-Farsan", "cuisine": "gujarati", "price": 0, "active": true, "cal": 120, "protein": 4, "carbs": 20, "fat": 3, "allergens": [], "desc": "Spongy steamed gram flour cakes with sesame and coriander tempering — a classic Gujarati snack." },
        { "id": "guj_khandvi", "name": "Khandvi", "category": "Gujarati-Farsan", "cuisine": "gujarati", "price": 0, "active": true, "cal": 100, "protein": 3, "carbs": 12, "fat": 4, "allergens": ["Dairy"], "desc": "Soft rolled gram flour bites with mustard and coconut garnish — a delicate Gujarati art." },
        { "id": "guj_patra", "name": "Patra", "category": "Gujarati-Farsan", "cuisine": "gujarati", "price": 0, "active": true, "cal": 130, "protein": 3, "carbs": 18, "fat": 5, "allergens": [], "desc": "Colocasia leaves layered with spiced gram flour paste, steamed and tempered with sesame." },
        { "id": "guj_methi_gota", "name": "Methi Gota", "category": "Gujarati-Farsan", "cuisine": "gujarati", "price": 0, "active": true, "cal": 145, "protein": 4, "carbs": 16, "fat": 7, "allergens": ["Gluten"], "desc": "Crispy fenugreek fritters made with fresh methi leaves and gram flour." },
        { "id": "guj_handvo", "name": "Handvo", "category": "Gujarati-Farsan", "cuisine": "gujarati", "price": 0, "active": true, "cal": 160, "protein": 5, "carbs": 22, "fat": 6, "allergens": [], "desc": "Savory baked lentil and rice cake with vegetables and sesame — a wholesome Gujarati staple." },
        { "id": "guj_fafda", "name": "Fafda with Chutney", "category": "Gujarati-Farsan", "cuisine": "gujarati", "price": 0, "active": true, "cal": 140, "protein": 3, "carbs": 17, "fat": 6, "allergens": ["Gluten"], "desc": "Crunchy gram flour strips served with tangy green chutney and raw papaya." },
        { "id": "guj_undhiyu", "name": "Undhiyu", "category": "Gujarati-Main", "cuisine": "gujarati", "price": 0, "active": true, "cal": 220, "protein": 6, "carbs": 28, "fat": 9, "allergens": [], "desc": "Slow-cooked mixed winter vegetables in a clay pot with fenugreek dumplings — the crown jewel of Gujarati cuisine." },
        { "id": "guj_sev_tameta", "name": "Sev Tameta Nu Shaak", "category": "Gujarati-Main", "cuisine": "gujarati", "price": 0, "active": true, "cal": 150, "protein": 3, "carbs": 16, "fat": 7, "allergens": ["Gluten"], "desc": "Tangy tomato curry topped generously with crispy sev — a sweet-sour Gujarati signature." },
        { "id": "guj_ringan", "name": "Ringan Bateta Nu Shaak", "category": "Gujarati-Main", "cuisine": "gujarati", "price": 0, "active": true, "cal": 170, "protein": 4, "carbs": 20, "fat": 7, "allergens": [], "desc": "Brinjal and potato curry spiced with Gujarati masala and tempered in mustard oil." },
        { "id": "guj_bhindi", "name": "Bhindi Sambhariya", "category": "Gujarati-Main", "cuisine": "gujarati", "price": 0, "active": true, "cal": 130, "protein": 3, "carbs": 12, "fat": 7, "allergens": [], "desc": "Ladies finger stuffed with spiced coconut and sesame paste, dry-cooked to perfection." },
        { "id": "guj_dal", "name": "Gujarati Dal", "category": "Gujarati-Main", "cuisine": "gujarati", "price": 0, "active": true, "cal": 140, "protein": 6, "carbs": 18, "fat": 4, "allergens": [], "desc": "Sweet-sour toor dal tempered with mustard, cumin, curry leaves and a touch of jaggery." },
        { "id": "guj_kadhi", "name": "Gujarati Kadhi", "category": "Gujarati-Main", "cuisine": "gujarati", "price": 0, "active": true, "cal": 110, "protein": 4, "carbs": 10, "fat": 5, "allergens": ["Dairy"], "desc": "Silky yogurt and gram flour curry — sweet, tangy, and uniquely Gujarati." },
        { "id": "guj_dal_dhokli", "name": "Dal Dhokli", "category": "Gujarati-Main", "cuisine": "gujarati", "price": 0, "active": true, "cal": 200, "protein": 7, "carbs": 30, "fat": 5, "allergens": ["Gluten"], "desc": "Spiced wheat dumplings simmered in sweet-sour toor dal — a complete one-pot royal meal." },
        { "id": "guj_khichdi", "name": "Khichdi", "category": "Gujarati-Main", "cuisine": "gujarati", "price": 0, "active": true, "cal": 180, "protein": 6, "carbs": 32, "fat": 4, "allergens": [], "desc": "Soft rice and moong dal cooked together with a golden ghee tempering — comfort cuisine elevated." },
        { "id": "guj_thepla", "name": "Thepla", "category": "Gujarati-Breads", "cuisine": "gujarati", "price": 0, "active": true, "cal": 130, "protein": 4, "carbs": 18, "fat": 5, "allergens": ["Gluten"], "desc": "Thin, spiced flatbreads made with fenugreek and whole wheat — a Gujarati heritage classic." },
        { "id": "guj_rotli", "name": "Rotli", "category": "Gujarati-Breads", "cuisine": "gujarati", "price": 0, "active": true, "cal": 90, "protein": 3, "carbs": 16, "fat": 2, "allergens": ["Gluten"], "desc": "Soft paper-thin whole wheat rotli made fresh and brushed with ghee." },
        { "id": "guj_bhakri", "name": "Bhakri", "category": "Gujarati-Breads", "cuisine": "gujarati", "price": 0, "active": true, "cal": 110, "protein": 4, "carbs": 20, "fat": 2, "allergens": ["Gluten"], "desc": "Rustic coarse millet flatbread — hearty, nutritious, and quintessentially rural Gujarati." },
        { "id": "guj_bajra_rotla", "name": "Bajra Rotla", "category": "Gujarati-Breads", "cuisine": "gujarati", "price": 0, "active": true, "cal": 120, "protein": 4, "carbs": 22, "fat": 2, "allergens": [], "desc": "Pearl millet flatbread served hot with ghee and jaggery — a timeless winter staple." },
        { "id": "guj_puri", "name": "Puri", "category": "Gujarati-Breads", "cuisine": "gujarati", "price": 0, "active": true, "cal": 150, "protein": 3, "carbs": 18, "fat": 8, "allergens": ["Gluten"], "desc": "Golden puffed deep-fried wheat bread — light, crispy, and festive." },
        { "id": "guj_steamed_rice", "name": "Steamed Rice", "category": "Gujarati-Rice", "cuisine": "gujarati", "price": 0, "active": true, "cal": 160, "protein": 3, "carbs": 36, "fat": 0, "allergens": [], "desc": "Perfectly cooked long-grain basmati rice — pure, light and a classic Gujarati meal accompaniment." },
        { "id": "guj_jeera_rice", "name": "Jeera Rice", "category": "Gujarati-Rice", "cuisine": "gujarati", "price": 0, "active": true, "cal": 185, "protein": 3, "carbs": 38, "fat": 3, "allergens": [], "desc": "Cumin-tempered basmati rice with whole spices — aromatic and light." },
        { "id": "guj_vagharelo_bhaat", "name": "Vagharelo Bhaat", "category": "Gujarati-Rice", "cuisine": "gujarati", "price": 0, "active": true, "cal": 195, "protein": 4, "carbs": 38, "fat": 4, "allergens": [], "desc": "Seasoned leftover rice tempered with mustard, turmeric, and green chilies — a home comfort dish." },
        { "id": "guj_veg_pulao", "name": "Vegetable Pulao", "category": "Gujarati-Rice", "cuisine": "gujarati", "price": 0, "active": true, "cal": 200, "protein": 5, "carbs": 40, "fat": 4, "allergens": [], "desc": "Fragrant basmati pilaf with garden vegetables and whole spices." },
        { "id": "guj_chhundo", "name": "Chhundo (Sweet Mango Pickle)", "category": "Gujarati-Accompaniments", "cuisine": "gujarati", "price": 0, "active": true, "cal": 80, "protein": 0, "carbs": 20, "fat": 0, "allergens": [], "desc": "Sweet shredded raw mango pickle with saffron and spices — a prized Gujarati preserve." },
        { "id": "guj_green_chutney", "name": "Green Chutney", "category": "Gujarati-Accompaniments", "cuisine": "gujarati", "price": 0, "active": true, "cal": 30, "protein": 1, "carbs": 4, "fat": 1, "allergens": [], "desc": "Fresh coriander and mint chutney with green chili and lemon — vibrant and cooling." },
        { "id": "guj_papad", "name": "Papad", "category": "Gujarati-Accompaniments", "cuisine": "gujarati", "price": 0, "active": true, "cal": 60, "protein": 3, "carbs": 8, "fat": 2, "allergens": [], "desc": "Crispy roasted and fried lentil wafers — served with every traditional Gujarati thali." },
        { "id": "guj_salad", "name": "Salad", "category": "Gujarati-Accompaniments", "cuisine": "gujarati", "price": 0, "active": true, "cal": 40, "protein": 2, "carbs": 7, "fat": 0, "allergens": [], "desc": "Fresh garden salad with lemon dressing and chaat masala." },
        { "id": "guj_chaas", "name": "Buttermilk (Chaas)", "category": "Gujarati-Accompaniments", "cuisine": "gujarati", "price": 0, "active": true, "cal": 50, "protein": 3, "carbs": 4, "fat": 2, "allergens": ["Dairy"], "desc": "Chilled spiced buttermilk with cumin, ginger, and mint — the perfect Gujarati digestive." },
        { "id": "guj_shrikhand", "name": "Shrikhand", "category": "Gujarati-Desserts", "cuisine": "gujarati", "price": 0, "active": true, "cal": 230, "protein": 6, "carbs": 35, "fat": 7, "allergens": ["Dairy", "Nuts"], "desc": "Strained yogurt sweetened with saffron and cardamom — a festival favourite." },
        { "id": "guj_basundi", "name": "Basundi", "category": "Gujarati-Desserts", "cuisine": "gujarati", "price": 0, "active": true, "cal": 260, "protein": 8, "carbs": 30, "fat": 10, "allergens": ["Dairy", "Nuts"], "desc": "Thickened sweetened milk with saffron, cardamom, and dry fruits — a regal liquid dessert." },
        { "id": "guj_mohanthal", "name": "Mohanthal", "category": "Gujarati-Desserts", "cuisine": "gujarati", "price": 0, "active": true, "cal": 370, "protein": 6, "carbs": 50, "fat": 16, "allergens": ["Dairy", "Nuts"], "desc": "Rich gram flour fudge with ghee, cardamom, and silver leaf — a royal Gujarati mithai." },
        { "id": "guj_jalebi", "name": "Jalebi", "category": "Gujarati-Desserts", "cuisine": "gujarati", "price": 0, "active": true, "cal": 290, "protein": 3, "carbs": 50, "fat": 8, "allergens": ["Gluten", "Dairy"], "desc": "Crispy spirals soaked in sugar syrup — sweet, golden and festive." },
        { "id": "guj_gulab_jamun", "name": "Gulab Jamun", "category": "Gujarati-Desserts", "cuisine": "gujarati", "price": 0, "active": true, "cal": 280, "protein": 4, "carbs": 45, "fat": 10, "allergens": ["Dairy", "Gluten"], "desc": "Soft khoya spheres soaked in warm rose-cardamom sugar syrup." },
        { "id": "raj_mirch_chamki", "name": "Hari Mirch Chamki", "category": "Rajasthani-Accompaniments", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 25, "protein": 1, "carbs": 4, "fat": 0, "allergens": [], "desc": "Whole green chilies tempered in oil — a fiery Rajasthani table condiment." },
        { "id": "raj_lahsun_chutney", "name": "Lahsun & Kachari Chutney", "category": "Rajasthani-Accompaniments", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 45, "protein": 1, "carbs": 6, "fat": 2, "allergens": [], "desc": "Rustic garlic and dried cucumber chutney — bold, spicy, and authentically Rajasthani." },
        { "id": "raj_sugar_ghee", "name": "Sugar, Gud & Ghee", "category": "Rajasthani-Accompaniments", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 180, "protein": 0, "carbs": 25, "fat": 9, "allergens": ["Dairy"], "desc": "Jaggery, sugar, and pure desi ghee served together — the traditional Rajasthani baati accompaniment." },
        { "id": "raj_churma", "name": "Dry Fruit Churma", "category": "Rajasthani-Specialties", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 420, "protein": 7, "carbs": 55, "fat": 20, "allergens": ["Gluten", "Dairy", "Nuts"], "desc": "Coarsely ground wheat sweetened with jaggery and studded with rich dry fruits — a royal Rajasthani treasure." },
        { "id": "raj_mewa_khichdi", "name": "Bikaneri Special Mewa Khichadi", "category": "Rajasthani-Specialties", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 310, "protein": 8, "carbs": 45, "fat": 10, "allergens": ["Dairy", "Nuts"], "desc": "Fragrant rice and dal khichdi garnished with premium dry fruits — a Bikaneri royal court recipe." },
        { "id": "raj_namkeen_khichdi", "name": "Bikaneri Special Namkeen Khichadi", "category": "Rajasthani-Specialties", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 260, "protein": 8, "carbs": 40, "fat": 8, "allergens": [], "desc": "Savory spiced khichdi seasoned with whole spices — a Bikaneri specialty." },
        { "id": "raj_hing_pakodi", "name": "Bikaneri Special Hing Pakodi", "category": "Rajasthani-Specialties", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 170, "protein": 5, "carbs": 18, "fat": 8, "allergens": ["Gluten"], "desc": "Asafoetida-spiced gram flour fritters from the royal kitchens of Bikaner." },
        { "id": "raj_kutodi_rabdi", "name": "Kutodi Rabdi", "category": "Rajasthani-Specialties", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 250, "protein": 7, "carbs": 28, "fat": 11, "allergens": ["Dairy", "Nuts"], "desc": "Thick slow-cooked sweetened milk with rich malai layers — a Rajasthani dessert specialty." },
        { "id": "raj_chenna_sweets", "name": "Chenna Sweets", "category": "Rajasthani-Specialties", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 240, "protein": 6, "carbs": 35, "fat": 8, "allergens": ["Dairy"], "desc": "Soft fresh cottage cheese sweets shaped and flavored with cardamom." },
        { "id": "raj_rabdi_bundi", "name": "Jodhpuri Rabdi Bundi Laddu", "category": "Rajasthani-Specialties", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 340, "protein": 5, "carbs": 50, "fat": 13, "allergens": ["Dairy", "Gluten"], "desc": "Traditional gram flour bundi spheres coated in rabdi cream — a Jodhpuri festive delicacy." },
        { "id": "raj_panchmel_dal", "name": "Panchmel Dal", "category": "Rajasthani-Main", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 190, "protein": 10, "carbs": 26, "fat": 5, "allergens": [], "desc": "Five lentils slow-cooked together with traditional Rajasthani spices — a dal of royal complexity." },
        { "id": "raj_kadhi", "name": "Rajasthani Kadhi", "category": "Rajasthani-Main", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 120, "protein": 4, "carbs": 12, "fat": 6, "allergens": ["Dairy"], "desc": "Thick tangy gram flour and yogurt curry tempered with dried chilies and whole spices." },
        { "id": "raj_govind_gatta", "name": "Govind Gatta", "category": "Rajasthani-Main", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 230, "protein": 8, "carbs": 18, "fat": 14, "allergens": ["Dairy", "Gluten"], "desc": "Stuffed gram flour dumplings in a rich spiced yogurt gravy — a regal Rajasthani creation." },
        { "id": "raj_gwar_fali", "name": "Gwar Fali", "category": "Rajasthani-Main", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 140, "protein": 4, "carbs": 16, "fat": 6, "allergens": [], "desc": "Cluster beans cooked with traditional Rajasthani spices in a dry curry." },
        { "id": "raj_muli_kachar", "name": "Muli Kachar", "category": "Rajasthani-Main", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 120, "protein": 3, "carbs": 14, "fat": 5, "allergens": [], "desc": "Radish and dried cucumber curry with desert spices — a Rajasthani wilderness specialty." },
        { "id": "raj_pyaj_patti", "name": "Pyaj Patti", "category": "Rajasthani-Main", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 110, "protein": 2, "carbs": 12, "fat": 5, "allergens": [], "desc": "Spring onion stalks prepared as a rustic Rajasthani dry curry." },
        { "id": "raj_kaju_ker", "name": "Kaju Ker", "category": "Rajasthani-Main", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 260, "protein": 6, "carbs": 20, "fat": 17, "allergens": ["Nuts"], "desc": "Cashews cooked with dried ker berries in a royal aromatic masala." },
        { "id": "raj_ker_sangri", "name": "Ker Sangri", "category": "Rajasthani-Main", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 180, "protein": 4, "carbs": 18, "fat": 9, "allergens": [], "desc": "Dried ker berries and sangri beans in tangy desert masala — the iconic dish of Rajasthan." },
        { "id": "raj_haldi_kaju", "name": "Haldi Kaju Sabji", "category": "Rajasthani-Main", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 240, "protein": 6, "carbs": 16, "fat": 16, "allergens": ["Dairy", "Nuts"], "desc": "Cashews in a turmeric-golden gravy — a festive Rajasthani curry." },
        { "id": "raj_chatpata_aloo", "name": "Chatpata Aloo", "category": "Rajasthani-Main", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 190, "protein": 3, "carbs": 26, "fat": 8, "allergens": [], "desc": "Spiced whole potatoes in a tangy coriander and red chili masala." },
        { "id": "raj_mutter_paneer", "name": "Mutter Paneer", "category": "Rajasthani-Main", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 280, "protein": 14, "carbs": 16, "fat": 18, "allergens": ["Dairy"], "desc": "Tender peas and cottage cheese in a rich tomato-spiced gravy." },
        { "id": "raj_plain_baati", "name": "Plain Baati", "category": "Rajasthani-Breads", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 180, "protein": 5, "carbs": 28, "fat": 6, "allergens": ["Gluten"], "desc": "Hard wheat flour dumplings baked in a wood fire and dunked in ghee — the soul of Rajasthani cuisine." },
        { "id": "raj_masala_baati", "name": "Masala Baati", "category": "Rajasthani-Breads", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 210, "protein": 6, "carbs": 28, "fat": 9, "allergens": ["Gluten", "Dairy"], "desc": "Spiced stuffed baati with peas and paneer filling — a festive upgrade to the classic." },
        { "id": "raj_moth_bajra_roti", "name": "Moth Bajra Roti", "category": "Rajasthani-Breads", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 140, "protein": 5, "carbs": 24, "fat": 3, "allergens": [], "desc": "Millet and moth bean flatbread — hearty, nutritious, and deeply Rajasthani." },
        { "id": "raj_masala_chaas", "name": "Masala Chaas", "category": "Rajasthani-Beverage", "cuisine": "rajasthani", "price": 0, "active": true, "cal": 55, "protein": 3, "carbs": 5, "fat": 2, "allergens": ["Dairy"], "desc": "Chilled spiced buttermilk with roasted cumin, rock salt, and fresh ginger — Rajasthan in a glass." }
    ],
    "leads": [],
    "reviews": [
        {
            "id": "r1",
            "author": "Vinay Khandelwal",
            "text": "Khandelwal Caters did an amazing job for my daughter's wedding! The Dal Bukhara and Jalebi Rabdi were the highlights. Flawless royal service.",
            "approved": true
        },
        {
            "id": "r2",
            "author": "Rajesh Mittal",
            "text": "Highly professional team. The visual menu catalog and transparent booking coordination were outstanding!",
            "approved": true
        },
        {
            "id": "r3",
            "author": "Sneha Verma",
            "text": "Their mocktail counter and Shahi Raj Kachori were massive hits among the guests. 10/10.",
            "approved": true
        }
    ],
    "gallery": [
        {
            "id": "g01",
            "url": "uploads/WhatsApp Video 2026-06-03 at 20.12.56.mp4",
            "type": "video",
            "caption": "Heritage Catering Entrance Setup"
        },
        {
            "id": "g02",
            "url": "uploads/WhatsApp Video 2026-06-03 at 20.12.56 (1).mp4",
            "type": "video",
            "caption": "Premium Buffet Service & Live Counters"
        },
        {
            "id": "g03",
            "url": "uploads/WhatsApp Video 2026-06-03 at 20.12.57.mp4",
            "type": "video",
            "caption": "Luxury Dining & Live Counter Layout"
        },
        {
            "id": "g04",
            "url": "uploads/WhatsApp Video 2026-06-03 at 20.12.44.mp4",
            "type": "video",
            "caption": "Shahi Presentation & Liquid Nitrogen Counters"
        },
        {
            "id": "g05",
            "url": "uploads/WhatsApp Video 2026-06-03 at 20.15.40.mp4",
            "type": "video",
            "caption": "Royal Guest Dining Area Presentation"
        },
        {
            "id": "g06",
            "url": "uploads/WhatsApp Video 2026-06-03 at 20.34.13.mp4",
            "type": "video",
            "caption": "Live Flambé & Stir Fry Counter"
        },
        {
            "id": "g07",
            "url": "uploads/WhatsApp Video 2026-06-03 at 20.37.15.mp4",
            "type": "video",
            "caption": "Bespoke Dessert Display Counter"
        },
        {
            "id": "g08",
            "url": "uploads/WhatsApp Image 2026-06-03 at 20.12.40.jpeg",
            "type": "image",
            "caption": "Gold Saffron Welcome Goblet Curation"
        },
        {
            "id": "g09",
            "url": "uploads/WhatsApp Image 2026-06-03 at 20.12.45.jpeg",
            "type": "image",
            "caption": "Royal Tandoori Paneer Starter Presentation"
        },
        {
            "id": "g10",
            "url": "uploads/WhatsApp Image 2026-06-03 at 20.12.46.jpeg",
            "type": "image",
            "caption": "Shahi Dal Bukhara Slow Cooking Pot"
        },
        {
            "id": "g11",
            "url": "uploads/WhatsApp Image 2026-06-03 at 20.12.56.jpeg",
            "type": "image",
            "caption": "Liquid Nitrogen Rose Ice Cream Live Station"
        },
        {
            "id": "g12",
            "url": "uploads/WhatsApp Image 2026-06-03 at 20.34.40.jpeg",
            "type": "image",
            "caption": "Heritage Pastry & Dessert Curation Platter"
        }
    ],
    "calendarRules": [],
    "cms": {
        "brand_font": "Cormorant Garamond",
        "color_accent": "#c5a880",
        "hero_title": "WHERE FLAVOUR MEETS LEGEND",
        "hero_sub": "Bespoke royal catering, heritage styling, and heirloom culinary arts for your most celebrated occasions.",
        "hero_video": "uploads/hero_new.mp4"
    }
};

// Backup and Checksum Helpers
function getChecksum(dataString) {
    return crypto.createHash('sha256').update(dataString).digest('hex');
}

function verifyChecksum(dbString) {
    if (!fs.existsSync(dbPath + '.sha256')) return true;
    const expected = fs.readFileSync(dbPath + '.sha256', 'utf8').trim();
    const actual = getChecksum(dbString);
    return expected === actual;
}

function getLatestBackup() {
    if (!fs.existsSync(backupsDir)) return null;
    const files = fs.readdirSync(backupsDir).filter(f => f.startsWith('database-') && f.endsWith('.json'));
    if (files.length === 0) return null;
    files.sort();
    return path.join(backupsDir, files[files.length - 1]);
}

function restoreLatestBackup() {
    const latest = getLatestBackup();
    if (latest) {
        console.error(`Restoring from latest backup: ${latest}`);
        const content = fs.readFileSync(latest, 'utf8');
        fs.writeFileSync(dbPath, content);
        fs.writeFileSync(dbPath + '.sha256', getChecksum(content));
        return JSON.parse(content);
    }
    return null;
}

// Safe Database Read
function safeReadDB() {
    const tryRead = (filePath) => {
        try {
            if (fs.existsSync(filePath)) {
                const raw = fs.readFileSync(filePath, 'utf8');
                return { raw, parsed: JSON.parse(raw) };
            }
        } catch (e) {}
        return null;
    };

    let main = tryRead(dbPath);
    if (main && verifyChecksum(main.raw)) {
        return main.parsed;
    } else if (main) {
        console.error('WARNING: Checksum validation failed or file corrupted. Restoring latest backup.');
        fs.renameSync(dbPath, dbPath + '.corrupt-' + Date.now());
    }

    const restored = restoreLatestBackup();
    if (restored) return restored;

    return JSON.parse(JSON.stringify(defaultDB));
}

// Keep getDB for backwards compatibility with read-only routes
function getDB() {
    return safeReadDB();
}

function safeUpdateDB(sectionName, updater) {
    const currentDB = safeReadDB();
    const originalDB = JSON.parse(JSON.stringify(currentDB));
    
    const startMs = Date.now();
    updater(currentDB);
    const duration = Date.now() - startMs;
    
    // Dangerous Write Guards
    const originalInvCount = (originalDB.inventory || []).length;
    const newInvCount = (currentDB.inventory || []).length;
    const originalGalleryCount = (originalDB.gallery || []).length;
    const newGalleryCount = (currentDB.gallery || []).length;
    
    if (newInvCount < 50) {
        throw new Error(`ABORT: Unsafe save. Inventory count < 50 (${newInvCount}).`);
    }
    if (newInvCount < originalInvCount * 0.9) {
        throw new Error(`ABORT: Unsafe save. Inventory count dropped from ${originalInvCount} to ${newInvCount}.`);
    }
    if (sectionName !== 'gallery_delete' && newGalleryCount < originalGalleryCount) {
        throw new Error(`ABORT: Unsafe save. Gallery count dropped from ${originalGalleryCount} to ${newGalleryCount} during ${sectionName}.`);
    }

    const currentDBStr = JSON.stringify(currentDB, null, 4);
    const checksum = getChecksum(currentDBStr);

    // Save versioned backup
    const dateStr = new Date().toISOString().replace(/T/, '-').replace(/:/g, '-').split('.')[0];
    const backupFileName = `database-${dateStr}.json`;
    const newBackupPath = path.join(backupsDir, backupFileName);
    fs.writeFileSync(newBackupPath, currentDBStr);

    // Enforce 20 backups limit
    const backupFiles = fs.readdirSync(backupsDir).filter(f => f.startsWith('database-') && f.endsWith('.json')).sort();
    if (backupFiles.length > 20) {
        const toDelete = backupFiles.slice(0, backupFiles.length - 20);
        toDelete.forEach(f => fs.unlinkSync(path.join(backupsDir, f)));
    }

    // Atomic write
    const tempPath = dbPath + '.tmp';
    fs.writeFileSync(tempPath, currentDBStr);
    fs.renameSync(tempPath, dbPath);
    fs.writeFileSync(dbPath + '.sha256', checksum);
    
    // Log
    const logEntry = `[${new Date().toISOString()}] | Endpoint: ${sectionName} | Inv: ${originalInvCount}->${newInvCount} | Gal: ${originalGalleryCount}->${newGalleryCount} | Backup: ${backupFileName} | Checksum: ${checksum} | Duration: ${duration}ms\n`;
    fs.appendFileSync(path.join(__dirname, 'database.log'), logEntry);
    
    return currentDB;
}

// Startup Validation
function validateStartup() {
    const db = safeReadDB();
    const invCount = (db.inventory || []).length;
    const catCount = new Set((db.inventory || []).map(i => i.cuisine || i.category)).size;
    
    if (invCount < 50 || catCount < 3) {
        console.error(`Startup Validation Failed! Inv: ${invCount}, Categories: ${catCount}. Restoring from backup...`);
        const restored = restoreLatestBackup();
        if (!restored) {
            console.error("No valid backup found to restore during startup failure!");
        } else {
            console.log("Restored successfully from latest backup.");
        }
    } else {
        console.log("Startup validation passed.");
    }
}
validateStartup();

// Media Integrity Verification
const manifestPath = path.join(__dirname, 'uploads-manifest.json');

function verifyMediaIntegrity() {
    console.log("Starting media integrity scan...");
    
    let actualFiles = [];
    if (fs.existsSync(uploadsDir)) {
        actualFiles = fs.readdirSync(uploadsDir);
    }
    
    const manifest = {
        lastScan: new Date().toISOString(),
        totalFiles: actualFiles.length,
        files: actualFiles
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));

    const db = safeReadDB();
    let brokenCount = 0;
    let missingFound = false;
    let missingFilenames = [];
    
    db.gallery.forEach(item => {
        if (item.url && item.url.startsWith('/uploads/')) {
            const filename = item.url.replace('/uploads/', '');
            const exists = actualFiles.includes(filename);
            
            if (!exists && !item.isBroken) {
                missingFound = true;
                missingFilenames.push(filename);
                console.error(`Missing file detected: ${filename} for item ${item.id}`);
            } else if (exists && item.isBroken) {
                missingFound = true;
            }
            if (!exists) brokenCount++;
        }
    });
    
    if (missingFound) {
        try {
            safeUpdateDB('media_integrity_scan', draft => {
                draft.gallery.forEach(draftItem => {
                    if (draftItem.url && draftItem.url.startsWith('/uploads/')) {
                        const filename = draftItem.url.replace('/uploads/', '');
                        draftItem.isBroken = !actualFiles.includes(filename);
                    }
                });
            });
            console.log(`Media integrity scan fixed DB flags. Found ${missingFilenames.length} new broken files.`);
            if (missingFilenames.length > 0) {
                const logEntry = `[${new Date().toISOString()}] | Endpoint: SYSTEM_SCAN | Broken Media Found: ${missingFilenames.length} | Missing Files: ${missingFilenames.join(', ')}\n`;
                fs.appendFileSync(path.join(__dirname, 'database.log'), logEntry);
            }
        } catch (e) {
            console.error("Failed to update database during media integrity scan:", e);
        }
    }
}

// Initial scan and setup interval (30 min)
verifyMediaIntegrity();
setInterval(verifyMediaIntegrity, 30 * 60 * 1000);

// Multer Storage config with 100MB limit
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve HTML/JS/CSS from root
app.use('/uploads', express.static(uploadsDir)); // Serve uploaded files

// --- API ROUTES ---

// GET database state
app.get('/api/db', (req, res) => {
    const db = getDB();
    console.log('GET /api/db returning gallery count:', db.gallery.length);
    res.json(db);
});

// Update CMS configs
app.post('/api/cms', (req, res) => {
    try {
        let updatedCms;
        safeUpdateDB('cms', db => {
            db.cms = { ...db.cms, ...req.body };
            updatedCms = db.cms;
        });
        res.json({ success: true, cms: updatedCms });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Gallery
app.get('/api/gallery', (req, res) => {
    res.json(getDB().gallery);
});

// Delete Gallery item (first instance)
app.delete('/api/gallery/:id', (req, res) => {
    try {
        let found = false;
        safeUpdateDB('gallery_delete', db => {
            const idx = db.gallery.findIndex(item => item.id === req.params.id);
            if (idx !== -1) {
                db.gallery.splice(idx, 1);
                found = true;
            }
        });
        if (found) return res.json({ success: true });
        res.status(404).json({ error: 'Gallery item not found' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Post Media to Gallery (via file upload or link)
app.post('/api/gallery', upload.single('mediaFile'), (req, res) => {
    let fileUrl = req.body.url;
    let fileType = req.body.type || 'image';

    if (req.file) {
        console.log('POST /api/gallery received file:', req.file.originalname, 'mimetype:', req.file.mimetype);
        fileUrl = '/uploads/' + req.file.filename;
        const isVideoMimetype = req.file.mimetype.startsWith('video/');
        const isVideoExt = /\.(mp4|webm|ogg|mov)$/i.test(req.file.originalname);
        fileType = isVideoMimetype || isVideoExt ? 'video' : 'image';
        console.log('Saved file path:', fileUrl, 'type:', fileType);
    }

    if (!fileUrl) {
        return res.status(400).json({ error: 'No media file or URL provided.' });
    }

    if (req.file) {
        const filePath = path.join(uploadsDir, req.file.filename);
        if (!fs.existsSync(filePath)) {
            return res.status(500).json({ error: 'Uploaded file missing from disk immediately after upload!' });
        }
    }

    const newPost = {
        id: 'g' + Date.now(),
        url: fileUrl,
        type: fileType,
        caption: req.body.caption || 'Event Celebration'
    };
    console.log('Added gallery item id:', newPost.id);

    try {
        safeUpdateDB('gallery_upload', db => {
            if (!db.gallery) db.gallery = [];
            db.gallery.unshift(newPost);
        });
        console.log('database.json written successfully');
        res.json({ success: true, post: newPost });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Upload video path for hero
app.post('/api/cms/video', upload.single('videoFile'), (req, res) => {
    if (req.file) {
        try {
            let videoUrl = '/uploads/' + req.file.filename;
            safeUpdateDB('cms_video', db => {
                db.cms.hero_video = videoUrl;
            });
            return res.json({ success: true, videoUrl });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
    res.status(400).json({ error: 'No video file provided' });
});

// Get Reviews
app.get('/api/reviews', (req, res) => {
    res.json(getDB().reviews);
});

// Post Review
app.post('/api/reviews', (req, res) => {
    const newReview = {
        id: 'r' + Date.now(),
        author: req.body.author || 'Anonymous Guest',
        text: req.body.text || '',
        approved: false
    };
    try {
        safeUpdateDB('review_post', db => {
            if (!db.reviews) db.reviews = [];
            db.reviews.push(newReview);
        });
        res.json({ success: true, review: newReview });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Approve/Reject Review
app.post('/api/reviews/approve', (req, res) => {
    const { id, approved } = req.body;
    try {
        let found = false;
        safeUpdateDB('review_approve', db => {
            const review = db.reviews.find(r => r.id === id);
            if (review) {
                review.approved = approved;
                found = true;
            }
        });
        if (found) return res.json({ success: true });
        res.status(404).json({ error: 'Review not found' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete Review
app.delete('/api/reviews/:id', (req, res) => {
    try {
        safeUpdateDB('review_delete', db => {
            db.reviews = db.reviews.filter(r => r.id !== req.params.id);
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Inventory
app.get('/api/inventory', (req, res) => {
    res.json(getDB().inventory);
});

// Add/Modify Inventory Item
app.post('/api/inventory', (req, res) => {
    const item = req.body;
    try {
        let updatedInventory;
        safeUpdateDB('inventory_update', db => {
            if (!db.inventory) db.inventory = [];
            const existingIdx = db.inventory.findIndex(i => i.id === item.id);
            
            if (existingIdx > -1) {
                db.inventory[existingIdx] = { ...db.inventory[existingIdx], ...item };
            } else {
                item.id = item.id || 'd' + Date.now();
                db.inventory.push(item);
            }
            updatedInventory = db.inventory;
        });
        res.json({ success: true, inventory: updatedInventory });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Leads (CRM)
app.get('/api/leads', (req, res) => {
    res.json(getDB().leads);
});

// Update/Save Lead
app.post('/api/leads', (req, res) => {
    const lead = req.body;
    try {
        safeUpdateDB('lead_update', db => {
            if (!db.leads) db.leads = [];
            const existingIdx = db.leads.findIndex(l => l.id === lead.id);
        
            if (existingIdx > -1) {
                db.leads[existingIdx] = { ...db.leads[existingIdx], ...lead };
            } else {
                lead.id = lead.id || 'L' + (1000 + db.leads.length + 1);
                db.leads.push(lead);
            }
        });
        res.json({ success: true, lead });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete Lead
app.delete('/api/leads/:id', (req, res) => {
    try {
        safeUpdateDB('lead_delete', db => {
            db.leads = db.leads.filter(l => l.id !== req.params.id);
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Calendar Rules
app.get('/api/calendar', (req, res) => {
    res.json(getDB().calendarRules);
});

// Update Calendar Rules
app.post('/api/calendar', (req, res) => {
    const { date, condition, rate, remove } = req.body;
    try {
        let rules;
        safeUpdateDB('calendar_update', db => {
            if (!db.calendarRules) db.calendarRules = [];
            if (remove) {
                db.calendarRules = db.calendarRules.filter(r => r.date !== date);
            } else {
                db.calendarRules = db.calendarRules.filter(r => r.date !== date);
                db.calendarRules.push({ date, condition, rate });
            }
            rules = db.calendarRules;
        });
        res.json({ success: true, rules });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin Backups Endpoints
app.get('/api/admin/backups', (req, res) => {
    try {
        const files = fs.readdirSync(backupsDir)
            .filter(f => f.startsWith('database-') && f.endsWith('.json'))
            .sort().reverse();
        res.json({ success: true, backups: files });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/restore/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        // strictly alphanumeric + dashes + json
        if (!filename.match(/^database-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.json$/)) {
            return res.status(400).json({ error: 'Invalid backup filename format' });
        }
        const targetPath = path.join(backupsDir, filename);
        if (!fs.existsSync(targetPath)) {
            return res.status(404).json({ error: 'Backup not found' });
        }
        
        // Final backup before restore
        const currentDB = safeReadDB();
        const dateStr = new Date().toISOString().replace(/T/, '-').replace(/:/g, '-').split('.')[0];
        const preRestoreBackup = `database-prerestore-${dateStr}.json`;
        fs.writeFileSync(path.join(backupsDir, preRestoreBackup), JSON.stringify(currentDB, null, 4));

        const content = fs.readFileSync(targetPath, 'utf8');
        fs.writeFileSync(dbPath, content);
        fs.writeFileSync(dbPath + '.sha256', getChecksum(content));

        const logEntry = `[${new Date().toISOString()}] | Endpoint: ADMIN_RESTORE | Restored from: ${filename} | Pre-Restore Backup: ${preRestoreBackup}\n`;
        fs.appendFileSync(path.join(__dirname, 'database.log'), logEntry);

        res.json({ success: true, message: `Restored ${filename} successfully` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/system-health', (req, res) => {
    try {
        const db = safeReadDB();
        const dbStr = JSON.stringify(db, null, 4);
        const checksumValid = verifyChecksum(dbStr);
        
        let backups = [];
        if (fs.existsSync(backupsDir)) {
            backups = fs.readdirSync(backupsDir).filter(f => f.startsWith('database-') && f.endsWith('.json'));
        }
        const lastBackup = backups.length > 0 ? backups.sort().reverse()[0] : 'None';
        
        let uploads = 0;
        if (fs.existsSync(uploadsDir)) {
            uploads = fs.readdirSync(uploadsDir).length;
        }
        
        let brokenMedia = 0;
        (db.gallery || []).forEach(item => {
            if (item.isBroken) brokenMedia++;
        });
        
        let lastIntegrityCheck = 'Never';
        if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            lastIntegrityCheck = manifest.lastScan;
        }

        res.json({
            database: "healthy",
            checksum: checksumValid ? "valid" : "invalid",
            backups: backups.length,
            uploads: uploads,
            brokenMedia: brokenMedia,
            inventory: (db.inventory || []).length,
            gallery: (db.gallery || []).length,
            lastBackup: lastBackup,
            lastIntegrityCheck: lastIntegrityCheck
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Luxury Catering Server running on http://localhost:${PORT}`);
});
