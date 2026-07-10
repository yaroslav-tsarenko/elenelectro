import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DIRECT_URL ||
  "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

interface ProductDef {
  name: string;
  price: number;
  comparePrice: number | null;
  description: string;
  shortDescription: string;
  brand: string;
  isFeatured: boolean;
  imageKeywords: string;
}

interface CategoryDef {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  subcategories: { name: string; slug: string; description: string }[];
  brands: string[];
  products: ProductDef[];
}

function unsplash(query: string, w = 640, h = 640, idx = 0): string {
  const seed = encodeURIComponent(`${query}-${idx}`);
  return `https://images.unsplash.com/photo-${seed}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

function picsum(id: number, w = 640, h = 640): string {
  return `https://picsum.photos/id/${id}/${w}/${h}`;
}

function loremFlickr(query: string, w = 640, h = 640): string {
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(query)}?lock=${Math.floor(Math.random() * 99999)}`;
}

const CATEGORIES: CategoryDef[] = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Smartphones, laptops, gadgets, and cutting-edge technology",
    imageUrl: picsum(1, 400, 400),
    subcategories: [
      { name: "Smartphones", slug: "smartphones", description: "Latest smartphones and mobile devices" },
      { name: "Laptops & Computers", slug: "laptops-computers", description: "Notebooks, desktops, and workstations" },
      { name: "Audio & Headphones", slug: "audio-headphones", description: "Headphones, speakers, and audio gear" },
      { name: "Cameras & Photography", slug: "cameras-photography", description: "Digital cameras, lenses, and accessories" },
      { name: "Wearable Technology", slug: "wearable-tech", description: "Smartwatches, fitness trackers, and wearables" },
    ],
    brands: ["Apple", "Samsung", "Sony", "LG", "Xiaomi", "Lenovo", "ASUS", "Dell", "HP", "Bose", "JBL", "Anker"],
    products: [
      { name: "iPhone 16 Pro Max 256GB", price: 1199.99, comparePrice: null, description: "Apple's flagship smartphone with A18 Pro chip, 48MP camera system, titanium design, and all-day battery life. Features the most advanced display ever in an iPhone.", shortDescription: "A18 Pro chip, 48MP camera, titanium design", brand: "Apple", isFeatured: true, imageKeywords: "iphone smartphone" },
      { name: "Samsung Galaxy S25 Ultra", price: 1099.99, comparePrice: 1299.99, description: "Samsung's premium smartphone with Snapdragon 8 Elite, 200MP camera, S Pen support, and Galaxy AI features. Titanium frame for ultimate durability.", shortDescription: "Snapdragon 8 Elite, 200MP camera, S Pen", brand: "Samsung", isFeatured: true, imageKeywords: "samsung galaxy smartphone" },
      { name: "MacBook Pro 14-inch M4 Pro", price: 1999.99, comparePrice: null, description: "Professional laptop with M4 Pro chip, 18GB RAM, 512GB SSD, Liquid Retina XDR display, and up to 17 hours of battery life.", shortDescription: "M4 Pro chip, Liquid Retina XDR display", brand: "Apple", isFeatured: true, imageKeywords: "macbook laptop" },
      { name: "Sony WH-1000XM5 Headphones", price: 299.99, comparePrice: 399.99, description: "Industry-leading noise cancellation with Auto NC Optimizer, exceptional sound quality, 30-hour battery life, and multipoint connection.", shortDescription: "Best-in-class ANC, 30hr battery", brand: "Sony", isFeatured: true, imageKeywords: "headphones wireless" },
      { name: "iPad Air M3 11-inch", price: 599.99, comparePrice: null, description: "Powerful and versatile tablet with M3 chip, 11-inch Liquid Retina display, Apple Pencil Pro support, and all-day battery life.", shortDescription: "M3 chip, Liquid Retina display", brand: "Apple", isFeatured: true, imageKeywords: "ipad tablet" },
      { name: "Dell XPS 15 Laptop", price: 1499.99, comparePrice: 1699.99, description: "Premium 15.6-inch laptop with Intel Core Ultra, 16GB RAM, 512GB SSD, OLED display, and sleek aluminum chassis.", shortDescription: "Intel Core Ultra, OLED display", brand: "Dell", isFeatured: false, imageKeywords: "dell laptop" },
      { name: "Samsung Galaxy Tab S10 Ultra", price: 1199.99, comparePrice: null, description: "14.6-inch AMOLED tablet with Snapdragon 8 Gen 3, 12GB RAM, S Pen included, and DeX mode for desktop experience.", shortDescription: "14.6-inch AMOLED, S Pen included", brand: "Samsung", isFeatured: false, imageKeywords: "samsung tablet" },
      { name: "AirPods Pro 3rd Generation", price: 249.99, comparePrice: null, description: "Apple's premium earbuds with H2 chip, adaptive audio, personalized spatial audio, and USB-C MagSafe charging case.", shortDescription: "H2 chip, adaptive audio, ANC", brand: "Apple", isFeatured: false, imageKeywords: "airpods earbuds" },
      { name: "Sony Alpha A7 IV Camera", price: 2499.99, comparePrice: 2799.99, description: "Full-frame mirrorless camera with 33MP Exmor R sensor, real-time AF tracking, 4K 60fps video, and 5-axis stabilization.", shortDescription: "33MP full-frame, 4K 60fps video", brand: "Sony", isFeatured: false, imageKeywords: "camera mirrorless" },
      { name: "LG C4 65-inch OLED TV", price: 1799.99, comparePrice: 2199.99, description: "65-inch OLED evo TV with α9 AI Processor, Dolby Vision & Atmos, 120Hz refresh rate, and webOS 24.", shortDescription: "OLED evo, Dolby Vision & Atmos", brand: "LG", isFeatured: false, imageKeywords: "oled tv" },
      { name: "Bose QuietComfort Ultra Earbuds", price: 299.99, comparePrice: null, description: "Premium true wireless earbuds with immersive audio, CustomTune technology, and world-class noise cancellation.", shortDescription: "Immersive audio, CustomTune ANC", brand: "Bose", isFeatured: false, imageKeywords: "bose earbuds" },
      { name: "ASUS ROG Zephyrus G16 Gaming Laptop", price: 1899.99, comparePrice: 2199.99, description: "16-inch gaming laptop with Intel Core i9, RTX 4070, 16GB RAM, 240Hz OLED display, and per-key RGB.", shortDescription: "Core i9, RTX 4070, 240Hz OLED", brand: "ASUS", isFeatured: false, imageKeywords: "gaming laptop" },
      { name: "JBL Charge 5 Bluetooth Speaker", price: 149.99, comparePrice: 179.99, description: "Portable Bluetooth speaker with IP67 waterproof rating, 20-hour playtime, JBL PartyBoost, and built-in power bank.", shortDescription: "IP67 waterproof, 20hr playtime", brand: "JBL", isFeatured: false, imageKeywords: "bluetooth speaker" },
      { name: "Apple Watch Ultra 2", price: 799.99, comparePrice: null, description: "The most rugged Apple Watch with precision dual-frequency GPS, 36-hour battery, 100m water resistance, and titanium case.", shortDescription: "Titanium, 36hr battery, 100m WR", brand: "Apple", isFeatured: false, imageKeywords: "apple watch smartwatch" },
      { name: "Samsung 55-inch Neo QLED 4K", price: 999.99, comparePrice: 1299.99, description: "55-inch Neo QLED 4K TV with Neural Quantum Processor, Anti-Reflection screen, and Dolby Atmos sound.", shortDescription: "Neo QLED 4K, Neural Quantum Processor", brand: "Samsung", isFeatured: false, imageKeywords: "samsung tv" },
      { name: "Xiaomi 14 Ultra Smartphone", price: 899.99, comparePrice: 999.99, description: "Flagship smartphone with Leica optics, Snapdragon 8 Gen 3, 50MP quad camera, and 90W fast charging.", shortDescription: "Leica optics, Snapdragon 8 Gen 3", brand: "Xiaomi", isFeatured: false, imageKeywords: "xiaomi smartphone" },
      { name: "Lenovo ThinkPad X1 Carbon", price: 1649.99, comparePrice: null, description: "Business ultrabook with Intel Core Ultra 7, 14-inch 2.8K OLED, 32GB RAM, and legendary ThinkPad keyboard.", shortDescription: "Core Ultra 7, 2.8K OLED, 32GB RAM", brand: "Lenovo", isFeatured: false, imageKeywords: "thinkpad laptop business" },
      { name: "Sony LinkBuds S Earbuds", price: 149.99, comparePrice: 199.99, description: "Ultra-lightweight noise cancelling earbuds weighing only 4.8g with LDAC Hi-Res Audio and 6-hour battery.", shortDescription: "Ultra-light ANC, Hi-Res Audio", brand: "Sony", isFeatured: false, imageKeywords: "earbuds wireless" },
      { name: "Anker 737 Power Bank 24000mAh", price: 109.99, comparePrice: 139.99, description: "High-capacity 140W power bank with smart digital display, USB-C PD, and PowerIQ 3.0 technology.", shortDescription: "24000mAh, 140W USB-C PD", brand: "Anker", isFeatured: false, imageKeywords: "power bank charger" },
      { name: "HP Spectre x360 14 Laptop", price: 1399.99, comparePrice: null, description: "2-in-1 convertible laptop with Intel Core Ultra, 14-inch 2.8K OLED touchscreen, and gem-cut design.", shortDescription: "2-in-1, Core Ultra, 2.8K OLED", brand: "HP", isFeatured: false, imageKeywords: "hp laptop convertible" },
      { name: "Samsung Galaxy Buds3 Pro", price: 229.99, comparePrice: 249.99, description: "Premium wireless earbuds with intelligent ANC, 360 Audio, Hi-Fi 24-bit audio, and blade light design.", shortDescription: "Intelligent ANC, Hi-Fi 24-bit audio", brand: "Samsung", isFeatured: false, imageKeywords: "earbuds samsung" },
      { name: "Canon EOS R6 Mark II Camera", price: 2299.99, comparePrice: null, description: "Full-frame mirrorless camera with 24.2MP sensor, up to 40fps shooting, 6K RAW video, and dual card slots.", shortDescription: "24.2MP, 40fps burst, 6K RAW video", brand: "Sony", isFeatured: false, imageKeywords: "canon camera dslr" },
      { name: "LG UltraGear 27-inch Gaming Monitor", price: 449.99, comparePrice: 549.99, description: "27-inch QHD gaming monitor with 240Hz refresh rate, 1ms response time, NVIDIA G-Sync, and HDR400.", shortDescription: "QHD, 240Hz, 1ms, G-Sync", brand: "LG", isFeatured: false, imageKeywords: "gaming monitor" },
      { name: "Xiaomi Smart Band 9", price: 39.99, comparePrice: null, description: "Fitness tracker with 1.62-inch AMOLED display, 150+ sport modes, heart rate monitoring, and 14-day battery.", shortDescription: "AMOLED, 150+ sport modes, 14-day battery", brand: "Xiaomi", isFeatured: false, imageKeywords: "fitness tracker band" },
      { name: "ASUS ProArt Display 32-inch 4K", price: 799.99, comparePrice: 899.99, description: "Professional 32-inch 4K monitor with 99% DCI-P3 color, Calman Verified, and HDR600 for creative work.", shortDescription: "4K, 99% DCI-P3, Calman Verified", brand: "ASUS", isFeatured: false, imageKeywords: "professional monitor" },
      { name: "Bose SoundLink Max Speaker", price: 399.99, comparePrice: null, description: "Premium portable speaker with rope handle, stereo sound, 20-hour battery, IP67 waterproof, and deep bass.", shortDescription: "Stereo sound, IP67, 20hr battery", brand: "Bose", isFeatured: false, imageKeywords: "portable speaker" },
      { name: "Dell UltraSharp 27 USB-C Hub Monitor", price: 549.99, comparePrice: 649.99, description: "27-inch 4K USB-C hub monitor with 90W power delivery, KVM switch, and factory-calibrated sRGB coverage.", shortDescription: "4K USB-C Hub, 90W PD, KVM", brand: "Dell", isFeatured: false, imageKeywords: "dell monitor ultrasharp" },
      { name: "Samsung Galaxy Watch7 Classic", price: 379.99, comparePrice: 429.99, description: "Premium smartwatch with rotating bezel, BioActive sensor, Wear OS, and 2-day battery life.", shortDescription: "Rotating bezel, BioActive sensor", brand: "Samsung", isFeatured: false, imageKeywords: "samsung smartwatch" },
      { name: "Anker Soundcore Motion X600 Speaker", price: 199.99, comparePrice: null, description: "Spatial audio speaker with Hi-Res Audio certification, 50W output, IPX7 waterproof, and 12-hour playtime.", shortDescription: "Spatial audio, 50W, IPX7", brand: "Anker", isFeatured: false, imageKeywords: "anker speaker" },
      { name: "Lenovo Tab P12 Pro Tablet", price: 499.99, comparePrice: 599.99, description: "12.7-inch 3K AMOLED tablet with Snapdragon 870, JBL speakers, stylus included, and 10,200mAh battery.", shortDescription: "12.7-inch 3K AMOLED, stylus included", brand: "Lenovo", isFeatured: false, imageKeywords: "lenovo tablet" },
      { name: "Sony Xperia 1 VI Smartphone", price: 1299.99, comparePrice: null, description: "Creator-focused smartphone with 4K HDR OLED display, ZEISS optics, Cinematography Pro, and 5000mAh battery.", shortDescription: "4K HDR OLED, ZEISS optics", brand: "Sony", isFeatured: false, imageKeywords: "sony xperia phone" },
      { name: "JBL Tour Pro 3 Earbuds", price: 299.99, comparePrice: null, description: "True wireless earbuds with smart charging case display, spatial sound, True Adaptive ANC, and LDAC support.", shortDescription: "Smart case display, spatial sound", brand: "JBL", isFeatured: false, imageKeywords: "jbl earbuds" },
      { name: "HP Envy Move All-in-One PC", price: 899.99, comparePrice: 1099.99, description: "Portable all-in-one desktop with 23.8-inch FHD touchscreen, Intel Core i5, 8GB RAM, and built-in battery.", shortDescription: "Portable AiO, 23.8-inch touch, battery", brand: "HP", isFeatured: false, imageKeywords: "all-in-one computer" },
      { name: "Samsung T7 Shield Portable SSD 2TB", price: 159.99, comparePrice: 199.99, description: "Rugged portable SSD with 1,050MB/s transfers, IP65 dust and water resistance, and drop-resistant design.", shortDescription: "2TB, 1050MB/s, IP65 rugged", brand: "Samsung", isFeatured: false, imageKeywords: "portable ssd drive" },
      { name: "Apple TV 4K 128GB", price: 149.99, comparePrice: null, description: "Premium streaming device with A15 Bionic chip, Dolby Vision & Atmos, Siri Remote, and Thread smart home support.", shortDescription: "A15 Bionic, Dolby Vision & Atmos", brand: "Apple", isFeatured: false, imageKeywords: "apple tv streaming" },
      { name: "LG Gram 16 Ultralight Laptop", price: 1349.99, comparePrice: 1499.99, description: "Ultra-lightweight 16-inch laptop at only 1.19kg with Intel Core Ultra, 16GB RAM, and 25.5-hour battery.", shortDescription: "1.19kg, Core Ultra, 25.5hr battery", brand: "LG", isFeatured: false, imageKeywords: "lightweight laptop ultrabook" },
      { name: "Xiaomi Robot Vacuum X20 Max", price: 599.99, comparePrice: 749.99, description: "Advanced robot vacuum with 8000Pa suction, LiDAR navigation, self-emptying base, and hot water mopping.", shortDescription: "8000Pa, LiDAR, self-empty, hot mop", brand: "Xiaomi", isFeatured: false, imageKeywords: "robot vacuum" },
      { name: "ASUS ZenBook 14 OLED Laptop", price: 1099.99, comparePrice: null, description: "14-inch OLED ultrabook with Intel Core Ultra 7, 16GB RAM, 1TB SSD, and Pantone Validated display.", shortDescription: "14-inch OLED, Core Ultra 7, 1TB", brand: "ASUS", isFeatured: false, imageKeywords: "asus zenbook laptop" },
      { name: "Anker 3-in-1 MagSafe Charger", price: 35.99, comparePrice: 45.99, description: "Foldable 3-in-1 wireless charging station for iPhone, Apple Watch, and AirPods with Qi2 support.", shortDescription: "3-in-1 MagSafe, Qi2, foldable", brand: "Anker", isFeatured: false, imageKeywords: "wireless charger magsafe" },
      { name: "Sony PlayStation 5 Slim Console", price: 449.99, comparePrice: null, description: "Next-gen gaming console with ultra-high-speed SSD, ray tracing, 4K gaming, and DualSense wireless controller.", shortDescription: "PS5 Slim, 4K gaming, DualSense", brand: "Sony", isFeatured: false, imageKeywords: "playstation console gaming" },
      { name: "Samsung Odyssey OLED G8 34-inch", price: 1299.99, comparePrice: 1499.99, description: "34-inch ultrawide OLED gaming monitor with 175Hz, 0.03ms response, AMD FreeSync Premium Pro, and smart TV features.", shortDescription: "34-inch OLED, 175Hz, ultrawide", brand: "Samsung", isFeatured: false, imageKeywords: "ultrawide monitor gaming" },
      { name: "Dell Alienware Aurora R16 Desktop", price: 2199.99, comparePrice: 2499.99, description: "High-performance gaming desktop with Intel Core i9, RTX 4080, 32GB DDR5 RAM, and liquid cooling.", shortDescription: "Core i9, RTX 4080, 32GB DDR5", brand: "Dell", isFeatured: false, imageKeywords: "gaming desktop pc" },
      { name: "JBL Flip 6 Portable Speaker", price: 99.99, comparePrice: 129.99, description: "Compact Bluetooth speaker with IP67 waterproof, 12-hour playtime, PartyBoost, and powerful JBL Original Pro Sound.", shortDescription: "IP67, 12hr, JBL Pro Sound", brand: "JBL", isFeatured: false, imageKeywords: "jbl flip speaker" },
      { name: "HP DeskJet 4155e All-in-One Printer", price: 89.99, comparePrice: 119.99, description: "Wireless all-in-one printer with HP+ smart features, auto-duplex printing, and 6 months of Instant Ink.", shortDescription: "Wireless, auto-duplex, HP+", brand: "HP", isFeatured: false, imageKeywords: "printer wireless" },
      { name: "LG Tone Free T90S Earbuds", price: 229.99, comparePrice: null, description: "True wireless earbuds with Dolby Head Tracking, ANC, UVnano charging case, and Plug & Wireless connectivity.", shortDescription: "Dolby Head Tracking, ANC, UVnano", brand: "LG", isFeatured: false, imageKeywords: "lg earbuds wireless" },
      { name: "Lenovo IdeaPad Duet Chromebook", price: 299.99, comparePrice: 349.99, description: "2-in-1 Chromebook tablet with 10.1-inch FHD display, detachable keyboard, MediaTek Helio P60T, and all-day battery.", shortDescription: "2-in-1 Chromebook, detachable keyboard", brand: "Lenovo", isFeatured: false, imageKeywords: "chromebook tablet" },
      { name: "Sony WF-1000XM5 Earbuds", price: 279.99, comparePrice: 299.99, description: "World's smallest and lightest noise cancelling earbuds with Hi-Res Audio, LDAC, and IPX4 splash proof.", shortDescription: "Smallest ANC earbuds, Hi-Res Audio", brand: "Sony", isFeatured: false, imageKeywords: "sony earbuds small" },
      { name: "ASUS ROG Ally X Handheld Gaming", price: 799.99, comparePrice: null, description: "Windows handheld gaming device with AMD Ryzen Z1 Extreme, 7-inch 120Hz FHD display, and 80Wh battery.", shortDescription: "Ryzen Z1 Extreme, 120Hz, 80Wh", brand: "ASUS", isFeatured: false, imageKeywords: "handheld gaming device" },
      { name: "Samsung Galaxy Ring", price: 399.99, comparePrice: null, description: "Smart ring with health tracking, sleep analysis, gesture controls, titanium build, and 7-day battery life.", shortDescription: "Health tracking, titanium, 7-day battery", brand: "Samsung", isFeatured: false, imageKeywords: "smart ring wearable" },
      { name: "Bose Smart Soundbar 600", price: 449.99, comparePrice: 499.99, description: "Compact soundbar with Dolby Atmos, TrueSpace technology, voice assistant support, and SimpleSync with Bose headphones.", shortDescription: "Dolby Atmos, TrueSpace, compact", brand: "Bose", isFeatured: false, imageKeywords: "soundbar home theater" },
    ],
  },
  {
    name: "Clothing & Fashion",
    slug: "clothing",
    description: "Trendy apparel, shoes, and accessories for every style",
    imageUrl: picsum(20, 400, 400),
    subcategories: [
      { name: "Men's Clothing", slug: "mens-clothing", description: "T-shirts, shirts, pants, and outerwear for men" },
      { name: "Women's Clothing", slug: "womens-clothing", description: "Dresses, tops, pants, and outerwear for women" },
      { name: "Shoes & Footwear", slug: "shoes-footwear", description: "Sneakers, boots, sandals, and formal shoes" },
      { name: "Bags & Accessories", slug: "bags-accessories", description: "Handbags, wallets, belts, and fashion accessories" },
    ],
    brands: ["Nike", "Adidas", "Levi's", "Zara", "H&M", "Uniqlo", "Ralph Lauren", "Tommy Hilfiger", "Calvin Klein", "Puma", "New Balance", "The North Face"],
    products: [
      { name: "Nike Air Max 270 Sneakers", price: 149.99, comparePrice: 169.99, description: "Iconic Air Max sneakers with lifestyle comfort, large Air unit in the heel, and lightweight mesh upper for breathability.", shortDescription: "Max Air unit, lightweight mesh upper", brand: "Nike", isFeatured: true, imageKeywords: "nike sneakers shoes" },
      { name: "Levi's 501 Original Fit Jeans", price: 89.99, comparePrice: null, description: "The original blue jean since 1873. Straight leg, button fly, iconic leather patch. 100% cotton denim.", shortDescription: "Original fit, button fly, 100% cotton", brand: "Levi's", isFeatured: true, imageKeywords: "levis jeans denim" },
      { name: "Adidas Ultraboost Light Running Shoes", price: 179.99, comparePrice: 199.99, description: "Premium running shoes with LIGHT BOOST midsole, Continental rubber outsole, and Primeknit+ upper.", shortDescription: "LIGHT BOOST midsole, Primeknit+ upper", brand: "Adidas", isFeatured: true, imageKeywords: "adidas running shoes" },
      { name: "The North Face Thermoball Eco Jacket", price: 199.99, comparePrice: null, description: "Lightweight insulated jacket with recycled ThermoBall Eco insulation, packable design, and DWR finish.", shortDescription: "ThermoBall Eco insulation, packable", brand: "The North Face", isFeatured: true, imageKeywords: "north face jacket" },
      { name: "Calvin Klein Essential Slim Fit T-Shirt", price: 39.99, comparePrice: null, description: "Classic slim fit crew neck t-shirt in soft cotton jersey with iconic CK logo. Essential wardrobe staple.", shortDescription: "Slim fit, soft cotton jersey, CK logo", brand: "Calvin Klein", isFeatured: true, imageKeywords: "tshirt plain cotton" },
      { name: "Ralph Lauren Polo Classic Fit", price: 89.99, comparePrice: 109.99, description: "Iconic polo shirt in breathable cotton mesh with signature embroidered Pony. Ribbed collar and armbands.", shortDescription: "Cotton mesh, signature Pony logo", brand: "Ralph Lauren", isFeatured: false, imageKeywords: "polo shirt classic" },
      { name: "New Balance 990v6 Made in USA", price: 199.99, comparePrice: null, description: "Premium made-in-USA sneaker with ENCAP midsole, pigskin and mesh upper, and legendary comfort.", shortDescription: "Made in USA, ENCAP midsole", brand: "New Balance", isFeatured: false, imageKeywords: "new balance sneakers" },
      { name: "Tommy Hilfiger Essential Down Jacket", price: 249.99, comparePrice: 299.99, description: "Warm down-filled puffer jacket with Tommy branding, stand collar, and water-resistant outer shell.", shortDescription: "Down-filled, water-resistant, Tommy logo", brand: "Tommy Hilfiger", isFeatured: false, imageKeywords: "puffer jacket down" },
      { name: "Zara Oversized Blazer", price: 79.99, comparePrice: null, description: "Modern oversized blazer in structured fabric with notch lapels, flap pockets, and single-button closure.", shortDescription: "Oversized fit, structured fabric", brand: "Zara", isFeatured: false, imageKeywords: "blazer oversized" },
      { name: "H&M Relaxed Fit Hoodie", price: 29.99, comparePrice: null, description: "Comfortable relaxed fit hoodie in soft sweatshirt fabric with drawstring hood, kangaroo pocket, and ribbed cuffs.", shortDescription: "Relaxed fit, soft sweatshirt fabric", brand: "H&M", isFeatured: false, imageKeywords: "hoodie sweatshirt" },
      { name: "Uniqlo Ultra Light Down Vest", price: 59.99, comparePrice: 79.99, description: "Ultralight premium down vest that packs into its own pouch. Water-repellent outer, 90% down fill.", shortDescription: "Ultralight, packable, 90% down", brand: "Uniqlo", isFeatured: false, imageKeywords: "down vest lightweight" },
      { name: "Puma Suede Classic Sneakers", price: 69.99, comparePrice: 84.99, description: "Iconic Puma sneakers in premium suede with the signature Formstrip, rubber outsole, and cushioned midsole.", shortDescription: "Premium suede, iconic Formstrip", brand: "Puma", isFeatured: false, imageKeywords: "puma suede sneakers" },
      { name: "Nike Dri-FIT Training Shorts", price: 34.99, comparePrice: null, description: "Performance training shorts with Dri-FIT moisture-wicking technology, elastic waistband, and side pockets.", shortDescription: "Dri-FIT technology, elastic waist", brand: "Nike", isFeatured: false, imageKeywords: "sports shorts training" },
      { name: "Adidas Originals Trefoil Hoodie", price: 74.99, comparePrice: null, description: "Classic hoodie with the iconic Trefoil logo, kangaroo pocket, and ribbed cuffs in French terry fabric.", shortDescription: "Trefoil logo, French terry fabric", brand: "Adidas", isFeatured: false, imageKeywords: "adidas hoodie trefoil" },
      { name: "Levi's Trucker Denim Jacket", price: 119.99, comparePrice: 139.99, description: "The original denim jacket since 1967. Button closure, chest pockets, adjustable waist tabs. Non-stretch denim.", shortDescription: "Original trucker, non-stretch denim", brand: "Levi's", isFeatured: false, imageKeywords: "denim jacket trucker" },
      { name: "Calvin Klein Modern Cotton Bralette", price: 34.99, comparePrice: null, description: "Iconic Calvin Klein bralette in soft modal-cotton blend with the signature elastic band. Unlined for comfort.", shortDescription: "Modal-cotton blend, signature band", brand: "Calvin Klein", isFeatured: false, imageKeywords: "underwear bralette" },
      { name: "The North Face Borealis Backpack", price: 99.99, comparePrice: null, description: "Classic daypack with FlexVent suspension system, padded laptop sleeve, and multiple organizational pockets.", shortDescription: "FlexVent suspension, laptop sleeve", brand: "The North Face", isFeatured: false, imageKeywords: "backpack northface" },
      { name: "Nike Air Force 1 '07 Low", price: 109.99, comparePrice: null, description: "Legendary basketball sneaker turned streetwear icon. Full-grain leather upper, Air-Sole unit, and rubber outsole.", shortDescription: "Full-grain leather, Air-Sole unit", brand: "Nike", isFeatured: false, imageKeywords: "air force one sneakers white" },
      { name: "H&M Linen Blend Shirt", price: 34.99, comparePrice: 44.99, description: "Relaxed fit shirt in airy linen-cotton blend with a resort collar, chest pocket, and pearl buttons.", shortDescription: "Linen-cotton blend, resort collar", brand: "H&M", isFeatured: false, imageKeywords: "linen shirt summer" },
      { name: "Ralph Lauren Cable-Knit Sweater", price: 129.99, comparePrice: null, description: "Classic cable-knit cotton sweater with ribbed crew neck, cuffs, and hem. Embroidered Pony at chest.", shortDescription: "Cable-knit cotton, embroidered Pony", brand: "Ralph Lauren", isFeatured: false, imageKeywords: "cable knit sweater" },
      { name: "Adidas Stan Smith Sneakers", price: 89.99, comparePrice: 109.99, description: "Timeless tennis-inspired sneaker with smooth leather upper, perforated 3-Stripes, and green heel tab.", shortDescription: "Leather upper, perforated 3-Stripes", brand: "Adidas", isFeatured: false, imageKeywords: "stan smith sneakers white" },
      { name: "Tommy Hilfiger Slim Fit Chinos", price: 79.99, comparePrice: null, description: "Versatile slim fit chinos in stretch cotton twill with Tommy flag logo at the back waistband.", shortDescription: "Slim fit, stretch cotton twill", brand: "Tommy Hilfiger", isFeatured: false, imageKeywords: "chino pants slim" },
      { name: "Zara Leather Effect Biker Jacket", price: 69.99, comparePrice: 89.99, description: "Edgy biker jacket in faux leather with asymmetric zip closure, snap collar, and zip pockets.", shortDescription: "Faux leather, asymmetric zip", brand: "Zara", isFeatured: false, imageKeywords: "biker jacket leather" },
      { name: "Uniqlo Heattech Ultra Warm Tights", price: 19.99, comparePrice: null, description: "Ultra warm base layer tights with bio-warming HEATTECH technology, moisture-wicking, and stretch fit.", shortDescription: "HEATTECH technology, ultra warm", brand: "Uniqlo", isFeatured: false, imageKeywords: "thermal tights base layer" },
      { name: "Puma RS-X Reinvention Sneakers", price: 109.99, comparePrice: 129.99, description: "Retro-futuristic chunky sneakers with RS cushioning technology, mesh and leather upper, and bold colorway.", shortDescription: "RS cushioning, retro-futuristic design", brand: "Puma", isFeatured: false, imageKeywords: "puma chunky sneakers" },
      { name: "Nike Sportswear Club Fleece Joggers", price: 59.99, comparePrice: null, description: "Comfortable fleece joggers with tapered leg, elastic waistband with drawcord, and embroidered Swoosh.", shortDescription: "Club Fleece, tapered leg, Swoosh", brand: "Nike", isFeatured: false, imageKeywords: "jogger pants fleece" },
      { name: "New Balance 574 Classic Sneakers", price: 89.99, comparePrice: null, description: "Heritage sneaker with ENCAP midsole cushioning, suede and mesh upper, and classic N logo.", shortDescription: "ENCAP midsole, suede and mesh", brand: "New Balance", isFeatured: false, imageKeywords: "new balance 574 sneakers" },
      { name: "Calvin Klein Slim Fit Dress Shirt", price: 69.99, comparePrice: 79.99, description: "Refined slim fit dress shirt in non-iron cotton with spread collar and French placket. Office essential.", shortDescription: "Non-iron cotton, slim fit, spread collar", brand: "Calvin Klein", isFeatured: false, imageKeywords: "dress shirt formal" },
      { name: "The North Face Resolve 2 Rain Jacket", price: 99.99, comparePrice: 119.99, description: "Waterproof rain jacket with DryVent technology, mesh lining, and adjustable hood. Packable into chest pocket.", shortDescription: "DryVent waterproof, packable", brand: "The North Face", isFeatured: false, imageKeywords: "rain jacket waterproof" },
      { name: "Adidas Essentials 3-Stripes Track Pants", price: 44.99, comparePrice: null, description: "Classic track pants with iconic 3-Stripes, tricot fabric, zip pockets, and open hem for a relaxed fit.", shortDescription: "3-Stripes, tricot fabric, zip pockets", brand: "Adidas", isFeatured: false, imageKeywords: "track pants adidas" },
      { name: "Levi's Ribcage Straight Ankle Jeans", price: 98.99, comparePrice: null, description: "High-rise straight ankle jeans with Levi's highest rise ever. Non-stretch denim for a vintage feel.", shortDescription: "Highest rise, straight ankle, vintage", brand: "Levi's", isFeatured: false, imageKeywords: "high rise jeans women" },
      { name: "Ralph Lauren Canvas Duffel Bag", price: 149.99, comparePrice: 179.99, description: "Heritage canvas duffel bag with leather trim, detachable shoulder strap, and embroidered Big Pony.", shortDescription: "Canvas, leather trim, Big Pony", brand: "Ralph Lauren", isFeatured: false, imageKeywords: "duffel bag canvas" },
      { name: "H&M Oversized Denim Jacket", price: 44.99, comparePrice: null, description: "Trendy oversized denim jacket in washed cotton with button closure, chest pockets, and drop shoulders.", shortDescription: "Oversized, washed cotton, drop shoulders", brand: "H&M", isFeatured: false, imageKeywords: "oversized denim jacket" },
      { name: "Nike React Infinity Run FK 4", price: 159.99, comparePrice: null, description: "Stability running shoes with ReactX foam, Flyknit upper, wide rocker geometry for a smooth ride.", shortDescription: "ReactX foam, Flyknit, stability", brand: "Nike", isFeatured: false, imageKeywords: "nike running shoes" },
      { name: "Uniqlo Supima Cotton Crew Neck T-Shirt", price: 14.99, comparePrice: null, description: "Premium Supima cotton t-shirt with a smooth feel, durable construction, and slightly relaxed fit. Pack of 1.", shortDescription: "Supima cotton, smooth feel, durable", brand: "Uniqlo", isFeatured: false, imageKeywords: "plain tshirt cotton" },
      { name: "Tommy Hilfiger Leather Sneakers", price: 119.99, comparePrice: 149.99, description: "Clean leather sneakers with Tommy branding, cushioned insole, and durable rubber outsole.", shortDescription: "Clean leather, cushioned insole", brand: "Tommy Hilfiger", isFeatured: false, imageKeywords: "leather sneakers white" },
      { name: "Zara Knit Midi Dress", price: 49.99, comparePrice: 69.99, description: "Ribbed knit midi dress with round neckline, long sleeves, and figure-hugging silhouette. Perfect for layering.", shortDescription: "Ribbed knit, midi length, fitted", brand: "Zara", isFeatured: false, imageKeywords: "knit dress midi" },
      { name: "Puma Essentials Logo Hoodie", price: 49.99, comparePrice: null, description: "Classic pullover hoodie with Puma cat logo, kangaroo pocket, and drawstring hood in soft cotton blend.", shortDescription: "Cat logo, cotton blend, kangaroo pocket", brand: "Puma", isFeatured: false, imageKeywords: "puma hoodie logo" },
      { name: "New Balance Fresh Foam X 1080v14", price: 159.99, comparePrice: null, description: "Premium cushioned running shoe with Fresh Foam X midsole, Hypoknit upper, and ultra-comfortable ride.", shortDescription: "Fresh Foam X, Hypoknit upper", brand: "New Balance", isFeatured: false, imageKeywords: "new balance running shoes" },
      { name: "Calvin Klein Leather Belt Set", price: 59.99, comparePrice: 79.99, description: "Reversible leather belt set with two interchangeable buckles. Black and brown genuine leather.", shortDescription: "Reversible, two buckles, genuine leather", brand: "Calvin Klein", isFeatured: false, imageKeywords: "leather belt men" },
      { name: "Adidas Gazelle Indoor Sneakers", price: 99.99, comparePrice: null, description: "Retro indoor sneakers with premium suede upper, gum rubber outsole, and classic 3-Stripes design.", shortDescription: "Suede upper, gum outsole, retro", brand: "Adidas", isFeatured: false, imageKeywords: "adidas gazelle sneakers" },
      { name: "The North Face Nuptse 700 Down Jacket", price: 299.99, comparePrice: null, description: "Iconic puffer jacket with 700-fill goose down, water-resistant DWR finish, and retro boxy silhouette.", shortDescription: "700-fill down, DWR, iconic puffer", brand: "The North Face", isFeatured: false, imageKeywords: "nuptse puffer jacket" },
      { name: "Nike Windrunner Woven Jacket", price: 109.99, comparePrice: 129.99, description: "Lightweight woven jacket with chevron design at the chest, full-zip closure, and adjustable hood.", shortDescription: "Lightweight woven, chevron design", brand: "Nike", isFeatured: false, imageKeywords: "nike windbreaker jacket" },
      { name: "Levi's 511 Slim Fit Stretch Jeans", price: 79.99, comparePrice: null, description: "Modern slim fit jeans with advanced stretch denim for all-day comfort. Sits below waist, slim through hip and thigh.", shortDescription: "Slim fit, advanced stretch denim", brand: "Levi's", isFeatured: false, imageKeywords: "slim jeans stretch denim" },
      { name: "H&M Wool-Blend Coat", price: 99.99, comparePrice: 149.99, description: "Elegant double-breasted coat in wool blend with notch lapels, welt pockets, and back vent.", shortDescription: "Wool blend, double-breasted, elegant", brand: "H&M", isFeatured: false, imageKeywords: "wool coat overcoat" },
      { name: "Ralph Lauren Performance Polo", price: 98.99, comparePrice: null, description: "High-performance polo with moisture-wicking fabric, UPF sun protection, and stretch for active movement.", shortDescription: "Moisture-wicking, UPF protection", brand: "Ralph Lauren", isFeatured: false, imageKeywords: "performance polo shirt" },
      { name: "Uniqlo AIRism Cotton Boxer Briefs 3-Pack", price: 24.99, comparePrice: null, description: "Ultra-comfortable boxer briefs with AIRism cotton technology for breathability and smooth feel. Pack of 3.", shortDescription: "AIRism cotton, breathable, 3-pack", brand: "Uniqlo", isFeatured: false, imageKeywords: "boxer briefs underwear" },
      { name: "Tommy Hilfiger Signature Backpack", price: 89.99, comparePrice: null, description: "Classic backpack with Tommy signature stripe, padded laptop compartment, and multiple pockets.", shortDescription: "Signature stripe, laptop compartment", brand: "Tommy Hilfiger", isFeatured: false, imageKeywords: "backpack tommy hilfiger" },
      { name: "Zara Wide Leg Tailored Trousers", price: 59.99, comparePrice: null, description: "High-waisted wide leg trousers in flowing fabric with front pleats and side pockets. Office to evening versatility.", shortDescription: "High-waist, wide leg, flowing fabric", brand: "Zara", isFeatured: false, imageKeywords: "wide leg trousers" },
      { name: "Puma Mayze Platform Sneakers", price: 99.99, comparePrice: 119.99, description: "Trendy platform sneakers with stacked midsole, leather upper, and Puma Formstrip. Street style essential.", shortDescription: "Platform, leather upper, Formstrip", brand: "Puma", isFeatured: false, imageKeywords: "platform sneakers women" },
    ],
  },
  {
    name: "Home & Garden",
    slug: "home-garden",
    description: "Furniture, kitchen essentials, decor, and garden tools",
    imageUrl: picsum(30, 400, 400),
    subcategories: [
      { name: "Kitchen & Dining", slug: "kitchen-dining", description: "Cookware, appliances, and dining essentials" },
      { name: "Furniture", slug: "furniture", description: "Living room, bedroom, and office furniture" },
      { name: "Home Decor", slug: "home-decor", description: "Wall art, lighting, rugs, and decorative items" },
      { name: "Garden & Outdoor", slug: "garden-outdoor", description: "Garden tools, outdoor furniture, and landscaping" },
      { name: "Bedding & Bath", slug: "bedding-bath", description: "Sheets, towels, pillows, and bath accessories" },
    ],
    brands: ["IKEA", "Dyson", "KitchenAid", "Philips", "Bosch", "Tefal", "Weber", "Le Creuset", "Brabantia", "Joseph Joseph", "Nespresso", "iRobot"],
    products: [
      { name: "Dyson V15 Detect Cordless Vacuum", price: 749.99, comparePrice: 849.99, description: "Most powerful cordless vacuum with laser dust detection, piezo sensor, LCD screen showing particle count in real-time.", shortDescription: "Laser dust detection, piezo sensor, LCD", brand: "Dyson", isFeatured: true, imageKeywords: "dyson vacuum cordless" },
      { name: "KitchenAid Artisan Stand Mixer 5Qt", price: 449.99, comparePrice: null, description: "Iconic tilt-head stand mixer with 10 speeds, 5-quart stainless steel bowl, and 300W motor. 15+ attachments available.", shortDescription: "5Qt bowl, 10 speeds, 300W motor", brand: "KitchenAid", isFeatured: true, imageKeywords: "stand mixer kitchen" },
      { name: "Nespresso Vertuo Next Coffee Machine", price: 179.99, comparePrice: 219.99, description: "Premium coffee machine with centrifusion technology, 5 cup sizes from espresso to carafe, Bluetooth connectivity.", shortDescription: "Centrifusion tech, 5 cup sizes", brand: "Nespresso", isFeatured: true, imageKeywords: "coffee machine nespresso" },
      { name: "Le Creuset Dutch Oven 5.5Qt", price: 399.99, comparePrice: null, description: "Enameled cast iron Dutch oven with superior heat distribution, stainless steel knob, and lifetime warranty.", shortDescription: "Cast iron, lifetime warranty, 5.5Qt", brand: "Le Creuset", isFeatured: true, imageKeywords: "dutch oven cast iron" },
      { name: "iRobot Roomba j9+ Robot Vacuum", price: 799.99, comparePrice: 999.99, description: "Self-emptying robot vacuum with PrecisionVision Navigation, 3-stage cleaning, and Smart Mapping for room-level control.", shortDescription: "Self-emptying, PrecisionVision, Smart Map", brand: "iRobot", isFeatured: true, imageKeywords: "roomba robot vacuum" },
      { name: "Dyson Purifier Big Quiet+", price: 599.99, comparePrice: 699.99, description: "Whole-room air purifier with HEPA H13 filtration, formaldehyde sensor, and whisper-quiet operation at just 56dB.", shortDescription: "HEPA H13, formaldehyde sensor, quiet", brand: "Dyson", isFeatured: false, imageKeywords: "air purifier dyson" },
      { name: "Philips Sonicare DiamondClean 9000", price: 199.99, comparePrice: 249.99, description: "Premium sonic toothbrush with 4 brushing modes, pressure sensor, smart timer, and elegant glass charger.", shortDescription: "4 modes, pressure sensor, glass charger", brand: "Philips", isFeatured: false, imageKeywords: "electric toothbrush" },
      { name: "Weber Spirit II E-310 Gas Grill", price: 549.99, comparePrice: null, description: "3-burner gas grill with GS4 grilling system, porcelain-enameled lid, and 529 sq. in. cooking area.", shortDescription: "3-burner, GS4 system, 529 sq in", brand: "Weber", isFeatured: false, imageKeywords: "gas grill bbq" },
      { name: "Bosch Serie 8 Dishwasher", price: 899.99, comparePrice: 1099.99, description: "Premium dishwasher with PerfectDry, Home Connect app, 42dB quiet operation, and flexible 3rd rack.", shortDescription: "PerfectDry, Home Connect, 42dB", brand: "Bosch", isFeatured: false, imageKeywords: "dishwasher kitchen" },
      { name: "Tefal Ingenio Ultimate 20-Piece Set", price: 299.99, comparePrice: 369.99, description: "Stackable cookware set with removable handles, titanium non-stick coating, and oven-safe pans up to 250°C.", shortDescription: "Removable handles, titanium, stackable", brand: "Tefal", isFeatured: false, imageKeywords: "cookware set pans" },
      { name: "Brabantia Bo Touch Bin 60L", price: 249.99, comparePrice: null, description: "Stylish touch-open bin with soft-close lid, fingerprint-proof matt steel, and 2 inner buckets for waste separation.", shortDescription: "Touch-open, fingerprint-proof, 60L", brand: "Brabantia", isFeatured: false, imageKeywords: "trash bin kitchen" },
      { name: "Joseph Joseph Nest 9 Plus Set", price: 59.99, comparePrice: 79.99, description: "Space-saving set of 9 food preparation tools that nest within each other. Colander, mixing bowls, and measuring cups.", shortDescription: "9 nesting tools, space-saving design", brand: "Joseph Joseph", isFeatured: false, imageKeywords: "kitchen utensils set" },
      { name: "IKEA KALLAX Shelf Unit 4x4", price: 99.99, comparePrice: null, description: "Versatile 16-cube shelf unit that works as room divider, display shelf, or storage. Compatible with inserts.", shortDescription: "16 cubes, room divider, versatile", brand: "IKEA", isFeatured: false, imageKeywords: "shelf unit bookcase" },
      { name: "Dyson Supersonic Hair Dryer", price: 429.99, comparePrice: null, description: "Fast-drying hair dryer with intelligent heat control, 4 styling attachments, and controlled airflow for shine.", shortDescription: "Intelligent heat, fast-drying, 4 attachments", brand: "Dyson", isFeatured: false, imageKeywords: "hair dryer dyson" },
      { name: "Philips Hue Starter Kit E27 3-Pack", price: 129.99, comparePrice: 159.99, description: "Smart LED bulb starter kit with Hue Bridge, 3 color-changing bulbs, and app control for 16 million colors.", shortDescription: "3 bulbs, Hue Bridge, 16M colors", brand: "Philips", isFeatured: false, imageKeywords: "smart light bulbs" },
      { name: "KitchenAid Hand Mixer 7-Speed", price: 79.99, comparePrice: null, description: "Versatile hand mixer with 7 speeds, soft-start feature, stainless steel turbo beaters, and lockable swivel cord.", shortDescription: "7 speeds, soft-start, turbo beaters", brand: "KitchenAid", isFeatured: false, imageKeywords: "hand mixer kitchen" },
      { name: "Le Creuset Stoneware Mug Set of 4", price: 79.99, comparePrice: 99.99, description: "Premium stoneware mugs with vibrant enamel glaze, 350ml capacity, microwave and dishwasher safe.", shortDescription: "Stoneware, 350ml, dishwasher safe", brand: "Le Creuset", isFeatured: false, imageKeywords: "ceramic mugs colorful" },
      { name: "Weber Smokey Mountain Cooker 18.5-inch", price: 399.99, comparePrice: null, description: "Legendary charcoal smoker with porcelain-enameled bowl and lid, 2 cooking grates, and built-in thermometer.", shortDescription: "Charcoal smoker, 2 grates, thermometer", brand: "Weber", isFeatured: false, imageKeywords: "charcoal smoker bbq" },
      { name: "Bosch Rotak 43 LI Cordless Lawnmower", price: 449.99, comparePrice: 499.99, description: "Cordless lawnmower with 43cm cutting width, 36V Lithium-ion battery, and ergonomic Ergoflex handles.", shortDescription: "43cm cut, 36V battery, ergonomic", brand: "Bosch", isFeatured: false, imageKeywords: "cordless lawnmower" },
      { name: "Tefal OptiGrill+ Smart GC712D", price: 149.99, comparePrice: 179.99, description: "Smart contact grill with automatic sensor cooking, 6 programs, die-cast aluminum plates, and indicator light.", shortDescription: "Auto sensor cooking, 6 programs", brand: "Tefal", isFeatured: false, imageKeywords: "contact grill electric" },
      { name: "Brabantia Ironing Board Size D", price: 149.99, comparePrice: null, description: "Extra-large ironing board (135x45cm) with solid steam iron rest, height adjustment, and child safety lock.", shortDescription: "Extra-large, steam rest, child lock", brand: "Brabantia", isFeatured: false, imageKeywords: "ironing board" },
      { name: "Joseph Joseph ElevateCarousel 6-Piece Set", price: 89.99, comparePrice: 109.99, description: "Kitchen tool set with integrated tool rests that keep tips off the counter. Includes spatula, spoon, ladle, and more.", shortDescription: "Elevated tips, carousel stand, 6 tools", brand: "Joseph Joseph", isFeatured: false, imageKeywords: "kitchen tools carousel" },
      { name: "IKEA MALM Bed Frame King", price: 299.99, comparePrice: null, description: "Clean-lined bed frame in white with adjustable bed sides, LURÖY slatted bed base compatible, and under-bed storage space.", shortDescription: "King size, clean design, storage space", brand: "IKEA", isFeatured: false, imageKeywords: "bed frame modern" },
      { name: "Nespresso Lattissima One Machine", price: 299.99, comparePrice: 349.99, description: "One-touch latte and cappuccino maker with integrated milk system, compact design, and automatic shut-off.", shortDescription: "One-touch latte, integrated milk system", brand: "Nespresso", isFeatured: false, imageKeywords: "coffee machine latte" },
      { name: "iRobot Braava Jet m6 Robot Mop", price: 449.99, comparePrice: 499.99, description: "Robot mop with Precision Jet Spray, wet and dry mopping, Smart Mapping, and automatic pad detachment.", shortDescription: "Precision Jet Spray, wet/dry mopping", brand: "iRobot", isFeatured: false, imageKeywords: "robot mop cleaning" },
      { name: "Dyson Pure Cool Tower Fan TP07", price: 549.99, comparePrice: null, description: "Air purifier and tower fan with HEPA H13 filter, real-time air quality display, and oscillation up to 350°.", shortDescription: "HEPA H13, purifier + fan, 350° oscillation", brand: "Dyson", isFeatured: false, imageKeywords: "tower fan purifier" },
      { name: "Philips Air Fryer XXL Premium", price: 249.99, comparePrice: 299.99, description: "Extra-large air fryer with Fat Removal technology, digital display, 7 presets, and 1.4kg capacity for family meals.", shortDescription: "XXL capacity, Fat Removal, 7 presets", brand: "Philips", isFeatured: false, imageKeywords: "air fryer kitchen" },
      { name: "KitchenAid Classic Kettle 1.25L", price: 99.99, comparePrice: null, description: "Stove-top kettle in Empire Red with trim band, removable lid, and comfortable handle. Fits all stove types.", shortDescription: "1.25L, Empire Red, all stove types", brand: "KitchenAid", isFeatured: false, imageKeywords: "kettle red kitchen" },
      { name: "Le Creuset Toughened Non-Stick Frying Pan 28cm", price: 99.99, comparePrice: 119.99, description: "Professional-grade non-stick frying pan with 3-layer coating, forged aluminum body, and stay-cool handles.", shortDescription: "3-layer non-stick, forged aluminum", brand: "Le Creuset", isFeatured: false, imageKeywords: "frying pan nonstick" },
      { name: "Bosch Tassimo My Way 2 Coffee Machine", price: 99.99, comparePrice: 139.99, description: "Single-serve coffee machine with INTELLIBREW barcode technology, adjustable drink settings, and 1.3L water tank.", shortDescription: "INTELLIBREW, adjustable settings, 1.3L", brand: "Bosch", isFeatured: false, imageKeywords: "tassimo coffee machine" },
      { name: "Weber iGrill 3 Smart Thermometer", price: 109.99, comparePrice: null, description: "App-connected smart meat thermometer with 4 probe ports, LED fuel gauge, and real-time temperature monitoring.", shortDescription: "App-connected, 4 probes, LED gauge", brand: "Weber", isFeatured: false, imageKeywords: "meat thermometer smart" },
      { name: "Tefal Easy Fry & Grill Precision", price: 129.99, comparePrice: 159.99, description: "2-in-1 air fryer and grill with 8 automatic programs, XL capacity, and touch screen digital display.", shortDescription: "Air fryer + grill, 8 programs, XL", brand: "Tefal", isFeatured: false, imageKeywords: "air fryer grill combo" },
      { name: "Brabantia Rotary Airer Lift-O-Matic 60m", price: 199.99, comparePrice: null, description: "Outdoor rotary clothesline with 60m line length, height adjustment, protective cover included, and ground spike.", shortDescription: "60m line, height adjust, cover included", brand: "Brabantia", isFeatured: false, imageKeywords: "clothesline rotary outdoor" },
      { name: "IKEA POÄNG Armchair", price: 149.99, comparePrice: null, description: "Classic bentwood armchair with layer-glued birch veneer frame, cushion in Knisa light beige, and gentle rocking motion.", shortDescription: "Bentwood birch, cushioned, rocking", brand: "IKEA", isFeatured: false, imageKeywords: "armchair modern comfortable" },
      { name: "Joseph Joseph Index Chopping Board Set", price: 49.99, comparePrice: 64.99, description: "Hygienic chopping board set with 4 color-coded boards (raw meat, cooked food, fish, vegetables) and storage case.", shortDescription: "4 color-coded boards, hygienic", brand: "Joseph Joseph", isFeatured: false, imageKeywords: "chopping board set" },
      { name: "Philips PerfectCare Elite Plus Steam Iron", price: 349.99, comparePrice: 399.99, description: "Smart steam generator iron with OptimalTEMP technology (no burns guaranteed), 7.7 bar pressure, and DynamiQ mode.", shortDescription: "OptimalTEMP, no burns, 7.7 bar", brand: "Philips", isFeatured: false, imageKeywords: "steam iron generator" },
      { name: "Nespresso Creatista Plus Machine", price: 549.99, comparePrice: 649.99, description: "Barista-grade machine with automatic milk frother, TFT display, 8 coffee and 11 milk temperature settings.", shortDescription: "Barista-grade, auto frother, TFT display", brand: "Nespresso", isFeatured: false, imageKeywords: "barista coffee machine" },
      { name: "iRobot Roomba Combo j7+ 2-in-1", price: 899.99, comparePrice: 1099.99, description: "Robot vacuum and mop combo with auto-empty base, retractable mop pad, and obstacle avoidance using PrecisionVision.", shortDescription: "Vacuum + mop, auto-empty, obstacle avoid", brand: "iRobot", isFeatured: false, imageKeywords: "robot vacuum mop combo" },
      { name: "KitchenAid Classic Blender 1.5L", price: 129.99, comparePrice: null, description: "Die-cast metal base blender with Intelli-Speed motor, 56oz BPA-free jar, and stainless steel blade.", shortDescription: "Die-cast metal, Intelli-Speed, 1.5L", brand: "KitchenAid", isFeatured: false, imageKeywords: "blender kitchen" },
      { name: "Le Creuset Skinny Grill 27cm", price: 149.99, comparePrice: null, description: "Cast iron rectangular grill pan with ribbed cooking surface, enameled interior, and easy-grip handle.", shortDescription: "Cast iron, ribbed surface, enameled", brand: "Le Creuset", isFeatured: false, imageKeywords: "grill pan cast iron" },
      { name: "Bosch UniversalGardenTidy Blower/Vacuum", price: 119.99, comparePrice: 149.99, description: "3-in-1 garden blower, vacuum, and shredder with variable speed, 45L collection bag, and 1800W motor.", shortDescription: "3-in-1, 1800W, 45L bag", brand: "Bosch", isFeatured: false, imageKeywords: "garden blower leaf" },
      { name: "Dyson Airwrap Multi-Styler Complete", price: 599.99, comparePrice: null, description: "Hair styling tool with Coanda airflow technology, 6 attachments for curl, wave, smooth, and dry. No extreme heat.", shortDescription: "Coanda airflow, 6 attachments, no heat damage", brand: "Dyson", isFeatured: false, imageKeywords: "hair styler dyson airwrap" },
      { name: "Tefal ActiFry Genius XL Air Fryer", price: 199.99, comparePrice: 249.99, description: "Unique air fryer with automatic stirring paddle, 9 automatic programs, 1.7kg capacity, and dual motion technology.", shortDescription: "Auto stirring, 9 programs, 1.7kg", brand: "Tefal", isFeatured: false, imageKeywords: "actifry air fryer" },
      { name: "IKEA HEMNES 8-Drawer Dresser", price: 249.99, comparePrice: null, description: "Classic solid wood dresser with 8 smooth-running drawers. Timeless design in white stain finish.", shortDescription: "Solid wood, 8 drawers, white stain", brand: "IKEA", isFeatured: false, imageKeywords: "dresser chest drawers" },
      { name: "Weber Compact Charcoal Grill 57cm", price: 199.99, comparePrice: 239.99, description: "Classic kettle grill with One-Touch cleaning system, plated steel cooking grate, and precision heat control.", shortDescription: "One-Touch clean, 57cm kettle, precision heat", brand: "Weber", isFeatured: false, imageKeywords: "charcoal grill kettle" },
      { name: "Brabantia PerfectFit Bin Liners Size L 30-Pack", price: 14.99, comparePrice: null, description: "Premium bin liners with perfect fit, easy tie closure, 45L capacity, and tear-resistant material.", shortDescription: "Perfect fit, 45L, tear-resistant", brand: "Brabantia", isFeatured: false, imageKeywords: "bin liners bags" },
      { name: "Joseph Joseph Totem Max 60L Waste & Recycling", price: 199.99, comparePrice: 229.99, description: "2-compartment waste and recycling bin with odor filter, easy-access door, and compact 60L design.", shortDescription: "2 compartments, odor filter, 60L", brand: "Joseph Joseph", isFeatured: false, imageKeywords: "recycling bin kitchen" },
      { name: "Philips 3200 Series Espresso Machine", price: 699.99, comparePrice: 799.99, description: "Fully automatic espresso machine with LatteGo milk system, 5 coffee varieties, and ceramic grinders.", shortDescription: "LatteGo milk, 5 varieties, ceramic grinders", brand: "Philips", isFeatured: false, imageKeywords: "espresso machine automatic" },
      { name: "Bosch IXO 7 Cordless Screwdriver", price: 59.99, comparePrice: 69.99, description: "Compact cordless screwdriver with 3.6V battery, LED light, and multiple adapters including corkscrew and cutter.", shortDescription: "3.6V, LED light, multi-adapters", brand: "Bosch", isFeatured: false, imageKeywords: "cordless screwdriver tool" },
      { name: "Le Creuset Heritage Baking Dish Set", price: 89.99, comparePrice: null, description: "Set of 2 stoneware baking dishes with easy-grip side handles, vibrant glaze, and superior heat distribution.", shortDescription: "Stoneware, 2 dishes, vibrant glaze", brand: "Le Creuset", isFeatured: false, imageKeywords: "baking dish stoneware" },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports",
    description: "Fitness equipment, outdoor gear, and sportswear",
    imageUrl: picsum(40, 400, 400),
    subcategories: [
      { name: "Fitness Equipment", slug: "fitness-equipment", description: "Gym equipment, weights, and training accessories" },
      { name: "Outdoor Recreation", slug: "outdoor-recreation", description: "Camping, hiking, and adventure gear" },
      { name: "Team Sports", slug: "team-sports", description: "Football, basketball, volleyball, and team sport equipment" },
      { name: "Cycling", slug: "cycling", description: "Bikes, helmets, and cycling accessories" },
      { name: "Water Sports", slug: "water-sports", description: "Swimming, surfing, and water sports equipment" },
    ],
    brands: ["Nike", "Adidas", "Under Armour", "The North Face", "Columbia", "Garmin", "Decathlon", "Wilson", "Osprey", "Patagonia", "Salomon", "Speedo"],
    products: [
      { name: "Garmin Fenix 8 GPS Smartwatch", price: 899.99, comparePrice: null, description: "Premium multisport GPS watch with AMOLED display, built-in flashlight, dive computer, and up to 48-day battery life.", shortDescription: "AMOLED, flashlight, dive computer, 48-day", brand: "Garmin", isFeatured: true, imageKeywords: "garmin smartwatch fitness" },
      { name: "Salomon X Ultra 4 GTX Hiking Shoes", price: 159.99, comparePrice: 189.99, description: "Waterproof hiking shoes with GORE-TEX membrane, Advanced Chassis, Contagrip MA outsole, and SensiFit design.", shortDescription: "GORE-TEX, Contagrip, SensiFit", brand: "Salomon", isFeatured: true, imageKeywords: "hiking shoes outdoor" },
      { name: "Osprey Atmos AG 65 Backpack", price: 299.99, comparePrice: null, description: "Award-winning backpacking pack with Anti-Gravity suspension, ventilated mesh back, and adjustable fit-on-the-fly hip belt.", shortDescription: "Anti-Gravity suspension, 65L, ventilated", brand: "Osprey", isFeatured: true, imageKeywords: "hiking backpack large" },
      { name: "Under Armour HOVR Phantom 3 Running Shoes", price: 149.99, comparePrice: null, description: "Connected running shoes with UA HOVR cushioning, MapMyRun integration, and lightweight mesh upper.", shortDescription: "UA HOVR, MapMyRun, lightweight mesh", brand: "Under Armour", isFeatured: true, imageKeywords: "running shoes sporty" },
      { name: "Wilson Pro Staff 97 v14 Tennis Racket", price: 249.99, comparePrice: null, description: "Pro-level tennis racket with Braid 45 technology, 97 sq in head size, and classic 16x19 string pattern.", shortDescription: "Braid 45 tech, 97 sq in, pro-level", brand: "Wilson", isFeatured: true, imageKeywords: "tennis racket wilson" },
      { name: "Nike Metcon 9 Training Shoes", price: 134.99, comparePrice: null, description: "Elite training shoes with wide, flat heel for stability, Hyperlift insert, textured rubber wrap for rope climbs.", shortDescription: "Flat heel stability, Hyperlift, rope-ready", brand: "Nike", isFeatured: false, imageKeywords: "training shoes crossfit" },
      { name: "Adidas Predator Accuracy.1 FG Boots", price: 249.99, comparePrice: 279.99, description: "Pro-level football boots with HYBRIDTOUCH upper, Zone Skin elements for control, and Controlframe outsole.", shortDescription: "HYBRIDTOUCH, Zone Skin control", brand: "Adidas", isFeatured: false, imageKeywords: "football boots soccer" },
      { name: "The North Face Summit Verto FUTURELIGHT Jacket", price: 349.99, comparePrice: null, description: "Ultralight alpine jacket with FUTURELIGHT waterproof breathable membrane, L3 insulation, and PackKnit backer.", shortDescription: "FUTURELIGHT, ultralight, alpine", brand: "The North Face", isFeatured: false, imageKeywords: "alpine jacket outdoor" },
      { name: "Columbia Silver Ridge Cargo Pants", price: 59.99, comparePrice: 69.99, description: "Quick-dry hiking pants with Omni-Wick moisture management, UPF 50 sun protection, and gusseted crotch.", shortDescription: "Quick-dry, UPF 50, cargo pockets", brand: "Columbia", isFeatured: false, imageKeywords: "hiking pants cargo" },
      { name: "Garmin Edge 1050 Cycling Computer", price: 599.99, comparePrice: null, description: "Premium cycling GPS with 3.5-inch touchscreen, built-in speaker, AMOLED display, and turn-by-turn navigation.", shortDescription: "3.5-inch AMOLED, speaker, navigation", brand: "Garmin", isFeatured: false, imageKeywords: "cycling computer gps" },
      { name: "Decathlon Domyos Adjustable Dumbbell Set 40kg", price: 179.99, comparePrice: 219.99, description: "Adjustable dumbbell set from 2-20kg per hand with quick-change mechanism and compact storage tray.", shortDescription: "2-20kg adjustable, quick-change", brand: "Decathlon", isFeatured: false, imageKeywords: "adjustable dumbbells weights" },
      { name: "Patagonia Black Hole Duffel 55L", price: 149.99, comparePrice: null, description: "Burly, weather-resistant duffel bag made from 100% recycled body fabric with padded shoulder straps and daisy chains.", shortDescription: "55L, 100% recycled, weather-resistant", brand: "Patagonia", isFeatured: false, imageKeywords: "duffel bag travel" },
      { name: "Speedo Fastskin Pure Focus Mirror Goggles", price: 59.99, comparePrice: 74.99, description: "Competition swimming goggles with IQfit leak-free technology, mirrored lenses, and hydrodynamic frame.", shortDescription: "IQfit leak-free, mirrored, competition", brand: "Speedo", isFeatured: false, imageKeywords: "swimming goggles competition" },
      { name: "Wilson Evolution Basketball Indoor", price: 69.99, comparePrice: null, description: "Premium indoor basketball with moisture-absorbing composite leather, cushion core carcass, and laid-in channels.", shortDescription: "Composite leather, cushion core, indoor", brand: "Wilson", isFeatured: false, imageKeywords: "basketball indoor" },
      { name: "Nike Yoga Dri-FIT Tank Top", price: 44.99, comparePrice: null, description: "Lightweight yoga tank with Dri-FIT moisture-wicking fabric, open back design, and relaxed fit for movement.", shortDescription: "Dri-FIT, open back, relaxed fit", brand: "Nike", isFeatured: false, imageKeywords: "yoga tank top" },
      { name: "Adidas Tiro 24 Training Jacket", price: 54.99, comparePrice: 69.99, description: "Athletic training jacket with AEROREADY moisture management, slim fit, full-zip closure, and 3-Stripes detailing.", shortDescription: "AEROREADY, slim fit, 3-Stripes", brand: "Adidas", isFeatured: false, imageKeywords: "training jacket sports" },
      { name: "Under Armour Storm Run Hooded Jacket", price: 129.99, comparePrice: null, description: "Waterproof running jacket with UA Storm technology, 360° reflectivity, packable design, and mesh venting.", shortDescription: "UA Storm, reflective, packable", brand: "Under Armour", isFeatured: false, imageKeywords: "running jacket waterproof" },
      { name: "Salomon Speedcross 6 Trail Running Shoes", price: 139.99, comparePrice: 159.99, description: "Aggressive trail running shoes with Contagrip MA outsole, Sensifit cradle, and Quicklace system.", shortDescription: "Contagrip MA, Sensifit, Quicklace", brand: "Salomon", isFeatured: false, imageKeywords: "trail running shoes" },
      { name: "Columbia Newton Ridge Plus II Hiking Boots", price: 99.99, comparePrice: null, description: "Waterproof hiking boots with seam-sealed construction, Techlite midsole, and Omni-Grip traction outsole.", shortDescription: "Waterproof, Techlite, Omni-Grip", brand: "Columbia", isFeatured: false, imageKeywords: "hiking boots waterproof" },
      { name: "Osprey Talon 22 Day Pack", price: 139.99, comparePrice: null, description: "Lightweight day pack with AirScape back panel, Stow-on-the-Go trekking pole attachment, and LidLock helmet holder.", shortDescription: "22L, AirScape back, pole attachment", brand: "Osprey", isFeatured: false, imageKeywords: "day pack hiking light" },
      { name: "Garmin Venu 3 GPS Smartwatch", price: 449.99, comparePrice: null, description: "AMOLED smartwatch with Health Snapshot, Body Battery energy monitoring, Fitness Age, and up to 14-day battery.", shortDescription: "AMOLED, Body Battery, 14-day battery", brand: "Garmin", isFeatured: false, imageKeywords: "garmin venu smartwatch" },
      { name: "Decathlon Van Rysel RCR Pro Road Bike", price: 1999.99, comparePrice: 2399.99, description: "Carbon road bike with Shimano 105 Di2 groupset, aero frame design, internal cable routing, and tubeless-ready wheels.", shortDescription: "Carbon, Shimano 105 Di2, aero frame", brand: "Decathlon", isFeatured: false, imageKeywords: "road bike cycling" },
      { name: "Patagonia Nano Puff Insulated Jacket", price: 219.99, comparePrice: null, description: "Windproof and water-resistant insulated jacket with 60g PrimaLoft Gold Eco insulation and 100% recycled polyester.", shortDescription: "PrimaLoft Gold Eco, windproof, recycled", brand: "Patagonia", isFeatured: false, imageKeywords: "insulated jacket outdoor" },
      { name: "Speedo Endurance+ Swimsuit Women", price: 49.99, comparePrice: 64.99, description: "Chlorine-resistant swimsuit with Endurance+ fabric, Xtra Life Lycra, and flattering high-leg cut.", shortDescription: "Endurance+, chlorine-resistant, Lycra", brand: "Speedo", isFeatured: false, imageKeywords: "swimsuit women sport" },
      { name: "Wilson Blade v9 16x19 Tennis Racket", price: 269.99, comparePrice: null, description: "Feel-oriented racket with FortyFive carbon fiber layup, Agiplast material for vibration dampening, and 304g weight.", shortDescription: "FortyFive carbon, vibration dampening", brand: "Wilson", isFeatured: false, imageKeywords: "tennis racket pro" },
      { name: "Nike Air Zoom Pegasus 41 Running Shoes", price: 129.99, comparePrice: null, description: "Versatile daily running shoes with React foam midsole, Zoom Air unit in the forefoot, and engineered mesh upper.", shortDescription: "React foam, Zoom Air, versatile daily", brand: "Nike", isFeatured: false, imageKeywords: "nike pegasus running" },
      { name: "Adidas Terrex Free Hiker 2 GTX", price: 229.99, comparePrice: 259.99, description: "Premium GORE-TEX hiking shoe with Boost and Lightstrike midsole, Continental rubber outsole, and sock-like fit.", shortDescription: "GORE-TEX, Boost, Continental rubber", brand: "Adidas", isFeatured: false, imageKeywords: "adidas hiking shoe" },
      { name: "The North Face Base Camp Duffel XL 132L", price: 179.99, comparePrice: null, description: "Legendary expedition duffel with Base Camp material, alpine-cut shoulder straps, and 132L capacity.", shortDescription: "132L, Base Camp material, expedition", brand: "The North Face", isFeatured: false, imageKeywords: "expedition duffel bag" },
      { name: "Columbia PFG Tamiami II Fishing Shirt", price: 44.99, comparePrice: null, description: "Quick-drying fishing shirt with Omni-Shade UPF 40, mesh-lined venting, and rod holder at the chest.", shortDescription: "UPF 40, mesh venting, rod holder", brand: "Columbia", isFeatured: false, imageKeywords: "fishing shirt outdoor" },
      { name: "Under Armour Project Rock 6 Training Shoes", price: 159.99, comparePrice: null, description: "Training shoes designed with Dwayne Johnson: UA TriBase sole, Charged Cushioning midsole, and TPU heel clip.", shortDescription: "TriBase sole, Charged Cushioning, Rock", brand: "Under Armour", isFeatured: false, imageKeywords: "training shoes gym" },
      { name: "Salomon ADV Skin 12 Running Vest", price: 139.99, comparePrice: 159.99, description: "Ultra-lightweight trail running vest with 2 soft flasks, SensiFit comfort, and stretch mesh construction.", shortDescription: "12L, 2 soft flasks, SensiFit comfort", brand: "Salomon", isFeatured: false, imageKeywords: "running vest hydration" },
      { name: "Garmin Rally RS200 Power Meter Pedals", price: 699.99, comparePrice: null, description: "Dual-sensing power meter pedals with cycling dynamics, left/right balance, and compatibility with Shimano SPD-SL.", shortDescription: "Dual-sensing power, cycling dynamics", brand: "Garmin", isFeatured: false, imageKeywords: "cycling power meter pedals" },
      { name: "Decathlon Quechua MH500 Hiking Jacket", price: 79.99, comparePrice: 99.99, description: "Waterproof hiking jacket with 10,000mm rating, pit-zip ventilation, and adjustable hood. Weighs just 460g.", shortDescription: "10,000mm waterproof, pit-zip, 460g", brand: "Decathlon", isFeatured: false, imageKeywords: "hiking jacket waterproof" },
      { name: "Osprey Stratos 36 Hiking Pack", price: 189.99, comparePrice: null, description: "Ventilated hiking pack with AirSpeed suspension, integrated rain cover, Stow-on-the-Go, and hydration compatible.", shortDescription: "36L, AirSpeed, rain cover, hydration", brand: "Osprey", isFeatured: false, imageKeywords: "hiking pack backpack" },
      { name: "Patagonia Baggies Shorts 5-inch", price: 59.99, comparePrice: null, description: "Iconic multi-purpose shorts with DWR finish, mesh liner, elastic waistband, and quick-dry nylon fabric.", shortDescription: "DWR finish, mesh liner, quick-dry", brand: "Patagonia", isFeatured: false, imageKeywords: "outdoor shorts casual" },
      { name: "Speedo Biofuse 2.0 Training Fins", price: 39.99, comparePrice: null, description: "Comfortable training swim fins with Biofuse technology, short blade for natural kick, and ergonomic foot pocket.", shortDescription: "Biofuse tech, short blade, ergonomic", brand: "Speedo", isFeatured: false, imageKeywords: "swim fins training" },
      { name: "Nike Brasilia 9.5 Training Duffel XL", price: 49.99, comparePrice: null, description: "Extra-large 101L training duffel with ventilated shoe compartment, dual-zip main compartment, and padded shoulder strap.", shortDescription: "101L, shoe compartment, padded strap", brand: "Nike", isFeatured: false, imageKeywords: "gym duffel bag" },
      { name: "Wilson NFL Duke Official Football", price: 149.99, comparePrice: null, description: "Official NFL game ball with exclusive Horween leather, hand-sewn construction, and ACL lacing for better grip.", shortDescription: "Official NFL, Horween leather, hand-sewn", brand: "Wilson", isFeatured: false, imageKeywords: "american football nfl" },
      { name: "Adidas Copa Pure II+ FG Football Boots", price: 299.99, comparePrice: null, description: "Laceless football boots with Fusionskin upper, Leathertouch panels for ball control, and lightweight frame.", shortDescription: "Laceless, Fusionskin, Leathertouch", brand: "Adidas", isFeatured: false, imageKeywords: "football boots laceless" },
      { name: "The North Face Recon Backpack 30L", price: 109.99, comparePrice: 129.99, description: "Daily backpack with FlexVent suspension, padded laptop sleeve, fleece-lined tech pocket, and reflective details.", shortDescription: "FlexVent, laptop sleeve, 30L", brand: "The North Face", isFeatured: false, imageKeywords: "daily backpack school" },
      { name: "Columbia Bugaboo IV Ski Pants", price: 129.99, comparePrice: null, description: "Waterproof ski pants with Omni-Heat thermal reflective lining, Omni-Tech waterproofing, and internal gaiters.", shortDescription: "Omni-Heat, Omni-Tech, ski gaiters", brand: "Columbia", isFeatured: false, imageKeywords: "ski pants winter" },
      { name: "Under Armour Tech 2.0 Training T-Shirt", price: 24.99, comparePrice: null, description: "Lightweight training t-shirt with anti-odor technology, 4-way stretch fabric, and UPF 30 sun protection.", shortDescription: "Anti-odor, 4-way stretch, UPF 30", brand: "Under Armour", isFeatured: false, imageKeywords: "training tshirt sport" },
      { name: "Salomon Quest 4 GTX Hiking Boots", price: 219.99, comparePrice: 249.99, description: "Premium waterproof hiking boots with 4D Advanced Chassis, GORE-TEX, Contagrip MA outsole, and OrthoLite sockliner.", shortDescription: "4D Chassis, GORE-TEX, Contagrip MA", brand: "Salomon", isFeatured: false, imageKeywords: "hiking boots premium" },
      { name: "Garmin HRM-Pro Plus Heart Rate Monitor", price: 129.99, comparePrice: null, description: "Premium chest strap heart rate monitor with running dynamics, swimming-compatible, and dual ANT+/Bluetooth.", shortDescription: "Running dynamics, swim-ready, dual connect", brand: "Garmin", isFeatured: false, imageKeywords: "heart rate monitor strap" },
      { name: "Decathlon Kiprun KD900X Carbon Running Shoes", price: 179.99, comparePrice: null, description: "Carbon-plated racing shoes with PEBAX foam, 8mm drop, and full-length carbon plate for maximum propulsion.", shortDescription: "Carbon plate, PEBAX foam, racing", brand: "Decathlon", isFeatured: false, imageKeywords: "carbon running shoes racing" },
      { name: "Patagonia R1 Air Full-Zip Hoody", price: 169.99, comparePrice: null, description: "Lightweight technical fleece with R1 Air construction, HeiQ Fresh odor control, and Fair Trade Certified sewing.", shortDescription: "R1 Air fleece, odor control, Fair Trade", brand: "Patagonia", isFeatured: false, imageKeywords: "fleece hoodie outdoor" },
      { name: "Osprey Daylite Plus 20L Daypack", price: 64.99, comparePrice: 79.99, description: "Everyday daypack with mesh-covered back panel, laptop sleeve, and attachment loops for Osprey travel packs.", shortDescription: "20L, laptop sleeve, mesh back panel", brand: "Osprey", isFeatured: false, imageKeywords: "small daypack daily" },
      { name: "Speedo Fastskin LZR Pure Intent 2.0", price: 499.99, comparePrice: null, description: "FINA-approved competition jammer with bonded seams, ultra-lightweight fabric, and precision-engineered compression.", shortDescription: "FINA-approved, bonded seams, competition", brand: "Speedo", isFeatured: false, imageKeywords: "competition swimwear jammer" },
      { name: "Nike ZoomX Vaporfly Next% 3", price: 249.99, comparePrice: null, description: "Elite marathon racing shoes with ZoomX foam, full-length carbon fiber plate, and VaporWeave upper.", shortDescription: "ZoomX foam, carbon plate, marathon", brand: "Nike", isFeatured: false, imageKeywords: "marathon racing shoes" },
      { name: "Wilson Clash 100 v2 Tennis Racket", price: 229.99, comparePrice: 259.99, description: "All-court tennis racket with FreeFlex technology for flexibility and stability, V-Energy Shaft, and 295g weight.", shortDescription: "FreeFlex tech, V-Energy, all-court", brand: "Wilson", isFeatured: false, imageKeywords: "tennis racket allcourt" },
    ],
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}

async function main() {
  console.log("Starting product seeding...\n");

  const categoryMap: Record<string, string> = {};
  let totalProducts = 0;
  let totalImages = 0;

  for (const cat of CATEGORIES) {
    const mainCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        isActive: true,
        sortOrder: CATEGORIES.indexOf(cat),
      },
    });
    categoryMap[cat.slug] = mainCat.id;
    console.log(`Category: ${cat.name} (${mainCat.id})`);

    for (const sub of cat.subcategories) {
      const subCat = await prisma.category.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          description: sub.description,
          parentId: mainCat.id,
        },
        create: {
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          parentId: mainCat.id,
          isActive: true,
          sortOrder: cat.subcategories.indexOf(sub),
        },
      });
      categoryMap[sub.slug] = subCat.id;
      console.log(`  Subcategory: ${sub.name}`);
    }
  }

  console.log(`\nCreated ${Object.keys(categoryMap).length} categories\n`);

  let globalIdx = 0;
  for (const cat of CATEGORIES) {
    console.log(`\nSeeding products for ${cat.name}...`);

    for (let i = 0; i < cat.products.length; i++) {
      const p = cat.products[i];
      const slug = slugify(p.name);
      const sku = `${cat.slug.substring(0, 4).toUpperCase()}-${String(globalIdx + 1).padStart(4, "0")}`;
      const quantity = Math.floor(Math.random() * 300) + 5;

      const picsumBase = (globalIdx * 7 + i * 3) % 1000;

      const images = [
        { url: picsum(picsumBase + 1, 640, 640), alt: p.name, sortOrder: 0 },
        { url: picsum(picsumBase + 2, 640, 640), alt: `${p.name} - side view`, sortOrder: 1 },
        { url: picsum(picsumBase + 3, 640, 640), alt: `${p.name} - detail`, sortOrder: 2 },
      ];

      try {
        const existing = await prisma.product.findUnique({ where: { slug } });

        if (existing) {
          await prisma.product.update({
            where: { slug },
            data: {
              name: p.name,
              price: p.price,
              comparePrice: p.comparePrice,
              description: p.description,
              shortDescription: p.shortDescription,
              brand: p.brand,
              isFeatured: p.isFeatured,
              quantity,
              status: "ACTIVE",
              condition: "new",
            },
          });

          const imageCount = await prisma.productImage.count({ where: { productId: existing.id } });
          if (imageCount === 0) {
            await prisma.productImage.createMany({
              data: images.map((img) => ({ ...img, productId: existing.id })),
            });
            totalImages += images.length;
          }
        } else {
          const product = await prisma.product.create({
            data: {
              name: p.name,
              slug,
              sku,
              price: p.price,
              comparePrice: p.comparePrice,
              description: p.description,
              shortDescription: p.shortDescription,
              brand: p.brand,
              isFeatured: p.isFeatured,
              quantity,
              status: "ACTIVE",
              condition: "new",
              trackInventory: true,
              lowStockAlert: 5,
              images: {
                create: images,
              },
              categories: {
                create: { categoryId: categoryMap[cat.slug] },
              },
            },
          });
          totalImages += images.length;
          totalProducts++;

          if ((i + 1) % 10 === 0) {
            console.log(`  Created ${i + 1}/${cat.products.length} products...`);
          }
        }
      } catch (err) {
        const existingBySku = await prisma.product.findUnique({ where: { sku } });
        if (existingBySku) {
          console.log(`  Skipping duplicate SKU: ${sku} (${p.name})`);
        } else {
          console.error(`  Error creating ${p.name}:`, err);
        }
      }

      globalIdx++;
    }

    console.log(`  Done: ${cat.products.length} products for ${cat.name}`);
  }

  console.log(`\n========================================`);
  console.log(`Seeding complete!`);
  console.log(`  Categories: ${Object.keys(categoryMap).length}`);
  console.log(`  Products created: ${totalProducts}`);
  console.log(`  Images created: ${totalImages}`);
  console.log(`========================================`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
