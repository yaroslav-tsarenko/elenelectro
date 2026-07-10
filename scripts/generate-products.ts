import fs from "fs";
import path from "path";

const categories = {
  electronics: {
    brands: ["Sony", "Samsung", "Apple", "Logitech", "Corsair", "Anker", "JBL", "Dell", "Belkin", "Ring", "Bose", "LG"],
    items: [
      ["Wireless Bluetooth Headphones", 79.99, 99.99, "Premium over-ear wireless headphones with ANC, 30hr battery"],
      ["Mechanical Gaming Keyboard", 129.99, null, "RGB backlit mechanical keyboard with Cherry MX switches"],
      ["USB-C Hub Adapter 7-in-1", 34.99, 49.99, "Compact hub with HDMI 4K, 3x USB 3.0, SD reader"],
      ["27-Inch 4K Monitor", 349.99, null, "IPS display with 4K UHD, HDR10, 99% sRGB"],
      ["Portable Bluetooth Speaker", 49.99, 69.99, "Waterproof speaker with 360-degree sound, 12hr battery"],
      ["Wireless Charging Pad", 24.99, null, "Fast Qi wireless charging with LED indicator"],
      ["Smart Security Camera", 89.99, 119.99, "1080p indoor camera with night vision and two-way audio"],
      ["Ergonomic Wireless Mouse", 59.99, null, "Vertical ergonomic mouse with adjustable DPI"],
      ["Noise Cancelling Earbuds", 149.99, 179.99, "True wireless ANC earbuds with spatial audio"],
      ["65W GaN USB-C Charger", 39.99, 54.99, "Ultra-compact 65W charger with 3 ports"],
      ["Smart Watch Fitness Tracker", 199.99, null, "GPS, heart rate, SpO2, 7-day battery life"],
      ["Webcam 4K Streaming", 79.99, 99.99, "4K webcam with autofocus and dual mics"],
      ["External SSD 1TB", 89.99, null, "Portable SSD with 1050MB/s read speed"],
      ["Smart LED Light Strip 5m", 29.99, 39.99, "RGB LED strip with app control and music sync"],
      ["Wireless Gaming Headset", 119.99, null, "7.1 surround sound, 20hr battery, detachable mic"],
      ["Tablet Stand Adjustable", 24.99, null, "Aluminum stand for tablets and phones"],
      ["HDMI 2.1 Cable 2m", 14.99, 19.99, "8K@60Hz, 4K@120Hz certified cable"],
      ["Power Bank 20000mAh", 44.99, null, "Fast charging power bank with USB-C PD"],
      ["Smart Plug Wi-Fi 4-Pack", 34.99, 49.99, "Voice control compatible smart plugs"],
      ["Microphone USB Condenser", 69.99, null, "Studio-quality USB mic for streaming"],
      ["Router Wi-Fi 6E Mesh", 249.99, 299.99, "Tri-band mesh system covers 5000 sq ft"],
      ["Drone Mini with Camera", 299.99, null, "4K camera drone, 30min flight, GPS return"],
      ["VR Headset Standalone", 399.99, 449.99, "All-in-one VR with 128GB storage"],
      ["Portable Projector Mini", 179.99, null, "1080p pocket projector with built-in speaker"],
      ["Electric Toothbrush Smart", 89.99, 119.99, "Sonic toothbrush with app tracking"],
      ["Air Purifier HEPA", 149.99, null, "True HEPA filter, covers 500 sq ft"],
      ["Keyboard Wireless Compact", 49.99, 64.99, "75% layout, Bluetooth + 2.4GHz dual mode"],
      ["Dash Cam 4K Front+Rear", 129.99, null, "Dual camera with night vision and parking mode"],
      ["Smart Doorbell Video", 149.99, 179.99, "1080p doorbell with two-way talk and motion zones"],
      ["Cable Management Kit", 19.99, null, "Complete desk cable organizer set"],
    ],
  },
  clothing: {
    brands: ["Nike", "Adidas", "Levi's", "H&M", "Zara", "Uniqlo", "Ralph Lauren", "Tommy Hilfiger", "Calvin Klein", "Puma"],
    items: [
      ["Classic Fit Cotton T-Shirt", 24.99, null, "100% organic cotton crew neck tee"],
      ["Slim Fit Denim Jeans", 59.99, 79.99, "Stretch denim with tapered leg"],
      ["Hooded Zip-Up Sweatshirt", 49.99, null, "Fleece-lined hoodie with front pockets"],
      ["Running Sneakers Lightweight", 89.99, 119.99, "Breathable mesh with responsive cushioning"],
      ["Wool Blend Overcoat", 149.99, null, "Classic single-breasted winter coat"],
      ["Casual Chino Pants", 44.99, 59.99, "Stretch cotton chinos, regular fit"],
      ["Performance Polo Shirt", 34.99, null, "Moisture-wicking polo for sport and casual"],
      ["Canvas Tote Bag", 29.99, null, "Heavy-duty canvas with leather handles"],
      ["Leather Belt Classic", 39.99, 49.99, "Full-grain leather with brushed buckle"],
      ["Athletic Shorts Quick-Dry", 29.99, null, "Lightweight shorts with zip pocket"],
      ["Flannel Shirt Plaid", 44.99, null, "Brushed cotton flannel, relaxed fit"],
      ["Down Puffer Jacket", 129.99, 169.99, "Lightweight 700-fill down jacket"],
      ["Merino Wool Sweater", 79.99, null, "Fine merino V-neck pullover"],
      ["Swimwear Board Shorts", 34.99, 44.99, "Quick-dry swim trunks with stretch"],
      ["Linen Button-Down Shirt", 54.99, null, "Relaxed fit linen for warm weather"],
      ["Ankle Boots Leather", 119.99, 149.99, "Chelsea boots with elastic side panels"],
      ["Graphic Print Sweatshirt", 39.99, null, "Oversized crew neck with chest print"],
      ["Cargo Jogger Pants", 49.99, 64.99, "Tapered joggers with cargo pockets"],
      ["Striped Knit Scarf", 24.99, null, "Soft acrylic knit scarf, 180cm"],
      ["Rain Jacket Waterproof", 69.99, null, "Seam-sealed waterproof shell with hood"],
      ["Oxford Dress Shirt", 54.99, 69.99, "Wrinkle-free cotton Oxford"],
      ["Denim Trucker Jacket", 89.99, null, "Classic denim jacket with sherpa collar"],
      ["Compression Leggings", 39.99, 54.99, "High-waist compression for training"],
      ["Baseball Cap Adjustable", 19.99, null, "Cotton twill cap with curved brim"],
      ["Silk Tie Collection", 34.99, null, "100% silk tie with gift box"],
      ["Thermal Underwear Set", 44.99, 59.99, "Merino wool base layer top and bottom"],
      ["Platform Sneakers White", 79.99, null, "Leather platform sneakers, cushioned sole"],
      ["Corduroy Trousers", 54.99, 69.99, "Wide-wale corduroy, straight fit"],
      ["Sports Bra High Impact", 34.99, null, "Supportive sports bra with racerback"],
      ["Quilted Vest Lightweight", 59.99, 79.99, "Insulated vest with stand collar"],
    ],
  },
  home: {
    brands: ["IKEA", "Dyson", "KitchenAid", "Philips", "Bosch", "Tefal", "Weber", "Brabantia", "Joseph Joseph", "Le Creuset"],
    items: [
      ["Ceramic Dinner Set 16pc", 79.99, 99.99, "Modern ceramic dinnerware for 4 people"],
      ["Memory Foam Pillow", 39.99, null, "Contour memory foam with cooling gel"],
      ["Cast Iron Dutch Oven 5L", 89.99, 119.99, "Enameled cast iron for slow cooking"],
      ["Bamboo Cutting Board Set", 29.99, null, "Set of 3 organic bamboo boards"],
      ["Scented Candle Collection", 34.99, 44.99, "3-pack soy candles in glass jars"],
      ["Cotton Bath Towel Set 6pc", 49.99, null, "600GSM Egyptian cotton towels"],
      ["Stainless Steel Cookware 10pc", 199.99, 249.99, "Tri-ply stainless set with lids"],
      ["Plant Pot Ceramic Set", 24.99, null, "Set of 3 minimalist ceramic planters"],
      ["Duvet Cover King Linen", 89.99, null, "Stonewashed linen duvet cover"],
      ["Kitchen Scale Digital", 19.99, 29.99, "Precision digital scale, 5kg capacity"],
      ["Wall Art Canvas 3-Panel", 59.99, null, "Abstract canvas art set, ready to hang"],
      ["Coffee Maker Drip 12-Cup", 69.99, 89.99, "Programmable coffee maker with thermal carafe"],
      ["Throw Blanket Sherpa", 34.99, null, "Ultra-soft sherpa fleece throw, 150x200cm"],
      ["Knife Set Block 8pc", 79.99, 99.99, "German steel knives with wooden block"],
      ["Aromatherapy Diffuser", 29.99, null, "Ultrasonic essential oil diffuser with LED"],
      ["Storage Basket Woven Set", 24.99, 34.99, "Set of 3 handwoven seagrass baskets"],
      ["Non-Stick Frying Pan 28cm", 44.99, null, "Titanium-coated non-stick with cool handle"],
      ["Blackout Curtains Pair", 39.99, null, "Thermal insulated blackout curtains"],
      ["Glass Food Containers 10pc", 34.99, 49.99, "Borosilicate glass with snap-lock lids"],
      ["Table Lamp Modern", 49.99, null, "Minimalist ceramic lamp with linen shade"],
      ["Vacuum Cleaner Cordless", 249.99, 299.99, "Lightweight stick vacuum, 45min runtime"],
      ["Rug Area 160x230cm", 119.99, null, "Low-pile geometric pattern area rug"],
      ["Bread Maker Automatic", 89.99, 109.99, "13 programs, delay timer, keep warm"],
      ["Floating Wall Shelves 3pc", 29.99, null, "White oak floating shelves with hardware"],
      ["Espresso Machine Semi-Auto", 299.99, 349.99, "15-bar pump, milk frother, stainless steel"],
      ["Mattress Topper Gel 5cm", 79.99, null, "Cooling gel memory foam topper"],
      ["Wind Chime Bamboo", 14.99, 19.99, "Handmade bamboo wind chime, 60cm"],
      ["Kitchen Trash Can 50L", 44.99, null, "Stainless steel sensor bin with dual compartments"],
      ["Linen Napkins Set of 6", 24.99, null, "Pre-washed linen napkins, 45x45cm"],
      ["Robot Vacuum Cleaner", 349.99, 429.99, "LIDAR navigation, auto-empty, mopping"],
    ],
  },
  sports: {
    brands: ["Nike", "Adidas", "Under Armour", "The North Face", "Columbia", "Patagonia", "Decathlon", "Wilson", "Garmin", "Osprey"],
    items: [
      ["Yoga Mat Non-Slip 6mm", 29.99, null, "Eco-friendly TPE mat with alignment marks"],
      ["Dumbbell Set Adjustable", 149.99, 199.99, "5-25kg adjustable dumbbell pair"],
      ["Cycling Helmet Aero", 79.99, null, "MIPS-certified with ventilation channels"],
      ["Resistance Bands Set 5pc", 19.99, 29.99, "Latex bands with different resistance levels"],
      ["Hiking Backpack 40L", 89.99, null, "Waterproof daypack with rain cover"],
      ["Tennis Racket Pro", 129.99, 159.99, "Graphite frame with vibration dampening"],
      ["Running Watch GPS", 199.99, null, "GPS, heart rate, pace tracking, 14-day battery"],
      ["Camping Tent 3-Person", 149.99, 189.99, "Waterproof dome tent with vestibule"],
      ["Jump Rope Speed", 14.99, null, "Adjustable steel cable speed rope"],
      ["Foam Roller 45cm", 24.99, 34.99, "High-density EVA foam for muscle recovery"],
      ["Ski Goggles Anti-Fog", 59.99, null, "Dual-lens with UV400 protection"],
      ["Basketball Indoor/Outdoor", 34.99, 44.99, "Composite leather, official size 7"],
      ["Insulated Water Bottle 1L", 29.99, null, "Double-wall stainless, 24hr cold"],
      ["Pull-Up Bar Doorway", 34.99, null, "Multi-grip bar, fits doors 60-90cm"],
      ["Climbing Chalk Bag", 19.99, 24.99, "Drawstring bag with belt loop and pocket"],
      ["Kayak Paddle Adjustable", 79.99, null, "Fiberglass shaft, adjustable feather angle"],
      ["Boxing Gloves 12oz", 49.99, 64.99, "Synthetic leather with wrist support"],
      ["Trekking Poles Carbon", 69.99, null, "Ultralight carbon fiber, cork grips"],
      ["Snorkel Set Mask+Tube", 39.99, 54.99, "Tempered glass mask with dry snorkel"],
      ["Ab Roller Wheel", 19.99, null, "Wide wheel with knee pad included"],
      ["Golf Balls Premium 12-Pack", 34.99, null, "3-piece urethane cover, tour performance"],
      ["Cycling Gloves Padded", 24.99, 34.99, "Gel-padded palm with touchscreen fingers"],
      ["Surfboard Foam 7ft", 249.99, null, "Soft-top foam board for beginners"],
      ["Badminton Set Complete", 44.99, 59.99, "2 rackets, shuttlecocks, net, and case"],
      ["Kettlebell Cast Iron 16kg", 39.99, null, "Powder-coated cast iron with flat base"],
      ["Ski Gloves Waterproof", 49.99, 64.99, "Thinsulate insulated touchscreen gloves"],
      ["Skateboard Complete 31in", 59.99, null, "Maple deck with ABEC-7 bearings"],
      ["Fishing Rod Spinning", 69.99, 89.99, "Carbon fiber rod with reel combo"],
      ["Gymnastics Ring Set", 34.99, null, "Wooden rings with adjustable straps"],
      ["Trail Running Shoes", 119.99, 149.99, "Vibram sole, waterproof membrane"],
    ],
  },
};

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const desktopPath = path.join("/Users/yaroslav/Desktop", "products-import.csv");

const headers = [
  "name", "sku", "price", "comparePrice", "description", "shortDescription",
  "brand", "status", "quantity", "condition", "category", "isFeatured", "imageUrl",
];

const rows: string[] = [headers.join(",")];
let skuCounter = 1;

const colorMap: Record<string, string> = {
  electronics: "e2e8f0/475569",
  clothing: "fce7f3/9d174d",
  home: "dcfce7/166534",
  sports: "fef3c7/92400e",
};

for (const [catSlug, catData] of Object.entries(categories)) {
  const color = colorMap[catSlug];
  for (let i = 0; i < catData.items.length; i++) {
    const [name, price, comparePrice, desc] = catData.items[i] as [string, number, number | null, string];
    const brand = catData.brands[i % catData.brands.length];
    const sku = `${catSlug.substring(0, 4).toUpperCase()}-${String(skuCounter).padStart(3, "0")}`;
    const quantity = Math.floor(Math.random() * 250) + 10;
    const isFeatured = i < 5;
    const imgText = encodeURIComponent(name.substring(0, 25));
    const imageUrl = `https://placehold.co/600x600/${color}?text=${imgText}`;

    const row = [
      escapeCSV(name),
      sku,
      String(price),
      comparePrice ? String(comparePrice) : "",
      escapeCSV(desc),
      escapeCSV(desc.split(",")[0]),
      brand,
      "ACTIVE",
      String(quantity),
      "new",
      catSlug,
      String(isFeatured),
      imageUrl,
    ];

    rows.push(row.join(","));
    skuCounter++;
  }
}

const csvContent = rows.join("\n");
fs.writeFileSync(desktopPath, csvContent, "utf-8");

console.log(`Generated ${skuCounter - 1} products`);
console.log(`Saved to: ${desktopPath}`);
