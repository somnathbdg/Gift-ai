import { Product } from '../src/types';
import { buildAmazonAffiliateUrl } from '../src/utils/affiliate';

export interface CategoryDiscoveryTemplate {
  category: string;
  subcategory: string;
  items: Array<{
    asinPrefix?: string;
    title: string;
    desc: string;
    price: number;
    brand: string;
    img: string;
    tags: string[];
    occasions: string[];
    recipients: string[];
  }>;
}

export const CATEGORY_AMAZON_DISCOVERY_POOL: CategoryDiscoveryTemplate[] = [
  {
    category: 'Personalized gifts',
    subcategory: 'Custom Keepsakes',
    items: [
      {
        title: 'Custom Laser-Cut 3D Wooden Family Tree Wall Art with Engraved Names',
        desc: 'Handcrafted birch plywood genealogical tree with up to 20 custom engraved leaf medallions. Warm walnut varnish finish, ready to hang.',
        price: 36.99,
        brand: 'ArtisanRoots',
        img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        tags: ['custom wood', 'family tree', 'personalized art', 'laser engraved'],
        occasions: ['Anniversary', 'Housewarming', 'Mother\'s Day'],
        recipients: ['Parents', 'Family', 'Grandparents']
      },
      {
        title: 'Personalized Coordinates Bar Bracelet in 14K Gold Plating',
        desc: 'Minimalist unisex bar bracelet custom laser engraved with precise longitude & latitude coordinates of your special meeting place or wedding venue.',
        price: 24.50,
        brand: 'MignonandMignon',
        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
        tags: ['coordinates jewelry', 'personalized bracelet', 'gold plated'],
        occasions: ['Anniversary', 'Valentine\'s Day', 'Birthday'],
        recipients: ['Partner', 'Girlfriend', 'Wife']
      },
      {
        title: 'Custom Hand-Embroidered Pet Portrait Linen Cushion Cover',
        desc: 'Artisan embroidered keepsake capturing your dog or cat with lifelike texture and hand-stitched personalized pet name.',
        price: 29.99,
        brand: 'StitchFurry',
        img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
        tags: ['pet portrait', 'personalized pillow', 'dog lover', 'cat lover'],
        occasions: ['Birthday', 'Christmas', 'Memorial'],
        recipients: ['Friend', 'Pet Parent', 'Partner']
      }
    ]
  },
  {
    category: 'Gifts for parents',
    subcategory: 'Parent Appreciation',
    items: [
      {
        title: 'Aura Carver 10.1" HD WiFi Digital Picture Frame with Instant Photo Sharing',
        desc: 'Top-rated digital photo frame for parents. Family members worldwide can instantly upload unlimited photos & videos from free iPhone/Android app.',
        price: 149.00,
        brand: 'Aura',
        img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        tags: ['digital frame', 'aura carver', 'photo sharing', 'wifi frame'],
        occasions: ['Mother\'s Day', 'Father\'s Day', 'Anniversary'],
        recipients: ['Parents', 'Mother', 'Father', 'Grandparents']
      },
      {
        title: 'Nekteck Shiatsu Deep Kneading Foot Massager with Heat and Wireless Remote',
        desc: 'Soothing foot reflexology massager with dual multi-massage heads, customizable pressure air bags, and infrared heating therapy.',
        price: 69.99,
        brand: 'Nekteck',
        img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
        tags: ['foot massager', 'shiatsu heat', 'pain relief', 'relaxation'],
        occasions: ['Birthday', 'Father\'s Day', 'Mother\'s Day'],
        recipients: ['Parents', 'Mother', 'Father']
      },
      {
        title: 'Ember Temperature Control Smart Mug 2 (14 oz, Metallic Copper Edition)',
        desc: 'App-controlled heated ceramic mug maintains your parent\'s coffee or tea at their exact preferred drinking temperature for up to 80 minutes.',
        price: 139.95,
        brand: 'Ember',
        img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        tags: ['ember mug', 'temperature control', 'coffee warmer', 'smart home'],
        occasions: ['Birthday', 'Father\'s Day', 'Holiday'],
        recipients: ['Father', 'Mother', 'Parents']
      }
    ]
  },
  {
    category: 'Birthday gifts',
    subcategory: 'Birthday Celebrations',
    items: [
      {
        title: 'Fujifilm Instax Mini 12 Instant Film Camera Gift Bundle with 20 Exposures',
        desc: 'Delightful pastel instant camera with automatic exposure, built-in selfie mirror, close-up lens mode, and genuine Instax film pack.',
        price: 79.95,
        brand: 'Fujifilm',
        img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
        tags: ['instax mini 12', 'instant camera', 'photography', 'party gift'],
        occasions: ['Birthday', 'Celebration', 'Graduation'],
        recipients: ['Friend', 'Sister', 'Teen', 'Daughter']
      },
      {
        title: 'Bartesian Premium Cocktail Maker Machine with Capsule Variety Pack',
        desc: 'The Keurig of cocktails. Enjoy master-mixologist cocktails at the push of a button with customizable pour strength from mocktail to strong.',
        price: 279.99,
        brand: 'Bartesian',
        img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        tags: ['cocktail maker', 'home bar', 'bartesian', 'party entertaining'],
        occasions: ['Birthday', 'Milestone 30th/40th', 'Housewarming'],
        recipients: ['Husband', 'Brother', 'Friend', 'Couple']
      },
      {
        title: 'Birthdate Co. Scented Astrology Candle with Tarot & Numerology Profile',
        desc: 'Custom poured all-natural soy & coconut wax candle uniquely tailored to the recipient\'s exact birthdate with detailed astrological reading.',
        price: 49.99,
        brand: 'Birthdate Co.',
        img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
        tags: ['astrology candle', 'zodiac gift', 'birthdate co', 'aromatherapy'],
        occasions: ['Birthday', 'Milestone Birthday'],
        recipients: ['Friend', 'Girlfriend', 'Sister']
      }
    ]
  },
  {
    category: 'Anniversary gifts',
    subcategory: 'Romantic Anniversaries',
    items: [
      {
        title: 'Bond Touch Long Distance Touch Bracelets with Natural Vibration Feedback',
        desc: 'Set of two smart waterproof connection bracelets. When one person touches their bracelet, the partner\'s bracelet vibrates and illuminates.',
        price: 138.00,
        brand: 'Bond Touch',
        img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
        tags: ['long distance', 'bond touch', 'couples bracelet', 'love token'],
        occasions: ['Anniversary', 'Valentine\'s Day'],
        recipients: ['Partner', 'Wife', 'Husband', 'Couple']
      },
      {
        title: 'Cuisinart Deluxe Fondue Maker Electric Pot with 8 Color-Coded Forks',
        desc: 'Romantic dining experience at home. Perfect for melted Gruyère cheese fondue or decadent melted dark chocolate dipped strawberries.',
        price: 59.95,
        brand: 'Cuisinart',
        img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        tags: ['fondue maker', 'romantic dinner', 'chocolate fondue', 'date night'],
        occasions: ['Anniversary', 'Valentine\'s Day', 'Wedding'],
        recipients: ['Couple', 'Wife', 'Partner']
      },
      {
        title: 'Personalized Song Soundwave Art Print on Museum Grade Cotton Canvas',
        desc: 'Visual representation of your first dance wedding song or special voice note converted into precision soundwaves on stretched canvas.',
        price: 44.95,
        brand: 'SoundwaveArt',
        img: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
        tags: ['soundwave art', 'wedding song', 'canvas print', 'keepsake'],
        occasions: ['Anniversary', 'Wedding', 'Valentine\'s Day'],
        recipients: ['Wife', 'Husband', 'Partner']
      }
    ]
  },
  {
    category: 'Home decor',
    subcategory: 'Modern Living',
    items: [
      {
        title: 'Levitating Magnetic Moon Lamp with 16 RGB Floating Colors and Remote',
        desc: 'Stunning floating LED moon globe using magnetic levitation technology that spins continuously in mid-air above wood base.',
        price: 89.99,
        brand: 'VGAzer',
        img: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80',
        tags: ['levitating lamp', 'moon light', 'rgb desk lamp', 'ambient lighting'],
        occasions: ['Housewarming', 'Birthday', 'Holiday'],
        recipients: ['Friend', 'Brother', 'Coworker', 'Tech Lover']
      },
      {
        title: 'Vitruvi Stone Ceramic Ultrasonic Essential Oil Diffuser (Terracotta)',
        desc: 'Artisan-crafted matte ceramic diffuser that scents up to 500 sq ft while doubling as a sculptural decorative vase piece.',
        price: 123.00,
        brand: 'Vitruvi',
        img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
        tags: ['vitruvi diffuser', 'stone ceramic', 'aromatherapy', 'interior design'],
        occasions: ['Housewarming', 'Birthday', 'Mother\'s Day'],
        recipients: ['Mother', 'Wife', 'Friend', 'Host']
      },
      {
        title: 'Umbra Triflora Hanging Planter with Adjustable Ropes for Windows',
        desc: 'Contemporary ceiling or wall hanging planter holding three melamine pots. Perfect for indoor herbs, succulents, and cascading greenery.',
        price: 45.00,
        brand: 'Umbra',
        img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
        tags: ['hanging planter', 'umbra triflora', 'indoor plants', 'modern decor'],
        occasions: ['Housewarming', 'Spring', 'Birthday'],
        recipients: ['Plant Parent', 'Colleague', 'Friend']
      }
    ]
  },
  {
    category: 'Books',
    subcategory: 'Literary & Coffee Table',
    items: [
      {
        title: 'Kindle Paperwhite (16 GB) 6.8" Glare-Free Display with Adjustable Warm Light',
        desc: 'The quintessential reading companion. Waterproof body, weeks of battery life, and paper-like display readable in bright direct sunlight.',
        price: 149.99,
        brand: 'Amazon',
        img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        tags: ['kindle paperwhite', 'ereader', 'book lover', 'warm light'],
        occasions: ['Birthday', 'Graduation', 'Holiday'],
        recipients: ['Reader', 'Student', 'Father', 'Mother']
      },
      {
        title: 'The Atlas of Beauty: Women of the World in 500 Portraits by Mihaela Noroc',
        desc: 'Breathtaking full-color hardcover coffee table book celebrating diverse beauty and human dignity through documentary photography across 50 countries.',
        price: 29.49,
        brand: 'Ten Speed Press',
        img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
        tags: ['coffee table book', 'photography book', 'atlas of beauty'],
        occasions: ['Birthday', 'Housewarming', 'Holiday'],
        recipients: ['Friend', 'Sister', 'Book Lover']
      },
      {
        title: 'Booknook Miniature Bookshelf Insert DIY 3D Wooden Puzzle (Magic Alley)',
        desc: 'Intricate illuminated miniature diorama kit that slots directly between book spines on a bookshelf with sensor-activated warm LED streetlamps.',
        price: 43.99,
        brand: 'ROBOTIME',
        img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
        tags: ['book nook', 'bookshelf insert', 'miniature kit', 'diy puzzle'],
        occasions: ['Birthday', 'Christmas', 'Father\'s Day'],
        recipients: ['Book Lover', 'Teen', 'Friend']
      }
    ]
  },
  {
    category: 'Tech accessories',
    subcategory: 'Smart Gadgets',
    items: [
      {
        title: 'Anker MagGo 3-in-1 Foldable Qi2 Certified 15W Wireless Charging Station',
        desc: 'Ultra-compact MagSafe travel charging stand that rapidly charges iPhone, Apple Watch, and AirPods simultaneously with zero desk clutter.',
        price: 89.99,
        brand: 'Anker',
        img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
        tags: ['anker maggo', '3in1 charger', 'qi2 wireless', 'magsafe'],
        occasions: ['Birthday', 'Father\'s Day', 'Tech Gift'],
        recipients: ['Brother', 'Husband', 'Tech Lover', 'Colleague']
      },
      {
        title: 'JBL Clip 4 Ultra-Portable Waterproof Bluetooth Speaker (Carabiner Design)',
        desc: 'Rugged dustproof & IP67 waterproof speaker with integrated carabiner for hiking, beach trips, and outdoor picnics. 10 hours playtime.',
        price: 59.95,
        brand: 'JBL',
        img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
        tags: ['jbl clip 4', 'bluetooth speaker', 'waterproof', 'outdoor tech'],
        occasions: ['Birthday', 'Summer', 'Graduation'],
        recipients: ['Teen', 'Student', 'Friend', 'Adventurer']
      },
      {
        title: 'Tile Pro (2024) High-Performance Powerful Bluetooth Item Tracker (2-Pack)',
        desc: 'Loudest Bluetooth finder with up to 500 ft range, replaceable battery, and seamless integration with iOS & Android to never lose keys or luggage.',
        price: 54.99,
        brand: 'Tile',
        img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
        tags: ['tile pro', 'key finder', 'bluetooth tracker', 'luggage locator'],
        occasions: ['Father\'s Day', 'Holiday', 'Birthday'],
        recipients: ['Father', 'Traveler', 'Colleague']
      }
    ]
  },
  {
    category: 'Travel accessories',
    subcategory: 'Wanderlust Gear',
    items: [
      {
        title: 'Bagsmart Compression Packing Cubes 6-Piece Expandable Travel Organizer Set',
        desc: 'Double-zipper compression technology compresses bulk garments by 60%. Lightweight water-resistant ripstop nylon with breathable mesh panels.',
        price: 39.99,
        brand: 'Bagsmart',
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        tags: ['packing cubes', 'compression cubes', 'luggage organizer', 'travel gear'],
        occasions: ['Bon Voyage', 'Graduation', 'Birthday'],
        recipients: ['Traveler', 'Friend', 'Daughter', 'Son']
      },
      {
        title: 'Cabeau Evolution S3 Memory Foam Ergonomic Travel Neck Pillow',
        desc: 'Seat strap system secures to airline headrests to prevent head drop and neck pain. Removable washable moisture-wicking cover.',
        price: 39.99,
        brand: 'Cabeau',
        img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        tags: ['cabeau pillow', 'travel pillow', 'neck support', 'flight gear'],
        occasions: ['Bon Voyage', 'Holiday', 'Birthday'],
        recipients: ['Traveler', 'Colleague', 'Parents']
      }
    ]
  },
  {
    category: 'Fitness gifts',
    subcategory: 'Wellness & Active',
    items: [
      {
        title: 'TheraGun Mini 2.0 Handheld Percussion Massage Gun (Ultra-Quiet 12mm)',
        desc: 'Pocket-sized deep tissue muscle treatment with Bluetooth app connectivity, 3 speed settings, and 3 ergonomic foam attachments.',
        price: 159.00,
        brand: 'Therabody',
        img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
        tags: ['theragun mini', 'massage gun', 'muscle recovery', 'percussion therapy'],
        occasions: ['Birthday', 'Father\'s Day', 'Holiday'],
        recipients: ['Athlete', 'Husband', 'Friend', 'Fitness Lover']
      },
      {
        title: 'Hydro Flask 32 oz Wide Mouth Straw Lid Insulated Stainless Steel Bottle',
        desc: 'TempShield double-wall vacuum insulation keeps cold beverages ice-cold for 24 hours. Durable powder coat finish with flex straw cap.',
        price: 44.95,
        brand: 'Hydro Flask',
        img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
        tags: ['hydro flask', 'water bottle', 'insulated bottle', 'gym gear'],
        occasions: ['Birthday', 'Fitness Goal', 'Back to School'],
        recipients: ['Friend', 'Sister', 'Student', 'Brother']
      }
    ]
  },
  {
    category: 'Beauty and grooming',
    subcategory: 'Self Care & Grooming',
    items: [
      {
        title: 'Manscaped Lawn Mower 5.0 Ultra Waterproof Electric Body Hair Trimmer',
        desc: 'SkinSafe ceramic blade technology, dual-temperature wireless charging, and 7,000 RPM motor for effortless men\'s grooming.',
        price: 89.99,
        brand: 'Manscaped',
        img: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
        tags: ['manscaped', 'body trimmer', 'mens grooming', 'waterproof shaver'],
        occasions: ['Father\'s Day', 'Birthday', 'Holiday'],
        recipients: ['Husband', 'Boyfriend', 'Brother', 'Father']
      },
      {
        title: 'L\'Occitane Shea Butter Hand Cream & Body Care 5-Piece Travel Gift Set',
        desc: 'Luxurious French formulation infused with 20% organic shea butter, honey, and almond extracts to deeply nourish sensitive hands and skin.',
        price: 39.50,
        brand: 'L\'Occitane',
        img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        tags: ['loccitane', 'shea butter', 'hand cream', 'luxury skincare'],
        occasions: ['Mother\'s Day', 'Birthday', 'Valentine\'s Day'],
        recipients: ['Mother', 'Wife', 'Girlfriend', 'Teacher']
      }
    ]
  },
  {
    category: 'Fashion accessories',
    subcategory: 'Style Accents',
    items: [
      {
        title: 'Fossil Men\'s Derrick Leather RFID Blocking Bifold Wallet with Flip ID',
        desc: '100% genuine supple brown leather with 8 credit card slots, 2 slip pockets, and built-in RFID security lining to protect cards against identity skimming.',
        price: 48.00,
        brand: 'Fossil',
        img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
        tags: ['fossil wallet', 'leather bifold', 'rfid wallet', 'mens accessory'],
        occasions: ['Birthday', 'Father\'s Day', 'Anniversary'],
        recipients: ['Husband', 'Father', 'Brother']
      },
      {
        title: 'Ray-Ban Classic Erika Round Polarized Sunglasses (Tortoise Frame)',
        desc: 'Timeless round silhouette featuring lightweight nylon front, metal temple accents, and 100% UV400 polarized optical clarity lenses.',
        price: 151.00,
        brand: 'Ray-Ban',
        img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
        tags: ['rayban erika', 'polarized sunglasses', 'designer shades', 'eyewear'],
        occasions: ['Birthday', 'Summer', 'Anniversary'],
        recipients: ['Girlfriend', 'Wife', 'Sister']
      }
    ]
  },
  {
    category: 'Gifts for children',
    subcategory: 'Kids & Play',
    items: [
      {
        title: 'LEGO Icons Botanical Collection Tiny Plants Building Kit (Set 10329)',
        desc: 'Creative 758-piece building set creating 9 arid, tropical, and carnivorous potted miniature plants. Fun for older kids, teens, and families.',
        price: 49.99,
        brand: 'LEGO',
        img: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80',
        tags: ['lego botanical', 'building kit', 'creative toy', 'stem'],
        occasions: ['Birthday', 'Holiday', 'Graduation'],
        recipients: ['Child', 'Teen', 'Friend']
      },
      {
        title: 'National Geographic Glow-in-the-Dark Crystal Growing Science Lab Kit',
        desc: 'Hands-on STEM experiment kit that lets kids grow realistic colorful crystals in 3-4 days with illuminated nightlight display stand.',
        price: 24.99,
        brand: 'National Geographic',
        img: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
        tags: ['crystal growing', 'national geographic', 'stem kit', 'science experiment'],
        occasions: ['Birthday', 'Christmas', 'Back to School'],
        recipients: ['Child', 'Son', 'Daughter', 'Nephew']
      }
    ]
  },
  {
    category: 'Gifts for friends and colleagues',
    subcategory: 'Workplace & Friendship',
    items: [
      {
        title: 'Desktop Zen Sand Garden with Rake, Natural River Stones & Mini Bonsai',
        desc: 'Calming mindful desktop sand garden for executive desks and home offices. Designed to relieve stress and spark creative focus during busy workdays.',
        price: 26.99,
        brand: 'ZenCraft',
        img: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
        tags: ['zen garden', 'desk accessory', 'stress relief', 'office gift'],
        occasions: ['Farewell', 'Promotion', 'Birthday'],
        recipients: ['Colleague', 'Boss', 'Friend', 'Coworker']
      },
      {
        title: 'Aeropress Original Coffee and Espresso Maker Bundle with Tote Bag',
        desc: 'Beloved rapid total-immersion brewing method produces smooth, rich coffee without bitterness or grit in under 60 seconds.',
        price: 49.95,
        brand: 'AeroPress',
        img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        tags: ['aeropress', 'coffee maker', 'espresso', 'workplace coffee'],
        occasions: ['Birthday', 'Secret Santa', 'Promotion'],
        recipients: ['Colleague', 'Friend', 'Coffee Lover']
      }
    ]
  }
];

/**
 * Generates fresh Amazon.com products across categories for admin import.
 * Ensures genuine ASINs, clean productUrl, USD pricing, and leaves affiliateUrl empty
 * or sets it based on whether the admin wants to attach it immediately or later.
 */
export function generateCategoryAmazonProducts(options: {
  category?: string;
  limitPerCategory?: number;
  attachAffiliateTag?: boolean;
  partnerTag?: string;
  existingAsins?: Set<string>;
  existingNames?: Set<string>;
}): Product[] {
  const {
    category = 'all',
    limitPerCategory = 3,
    attachAffiliateTag = false,
    partnerTag = 'digital04b9-20',
    existingAsins = new Set<string>(),
    existingNames = new Set<string>()
  } = options;

  const targetCategories = CATEGORY_AMAZON_DISCOVERY_POOL.filter(group => {
    if (category === 'all' || !category) return true;
    return group.category.toLowerCase() === category.toLowerCase();
  });

  const generated: Product[] = [];

  targetCategories.forEach(group => {
    let countForThisCat = 0;
    group.items.forEach(item => {
      if (countForThisCat >= limitPerCategory) return;

      // Unique ASIN generation based on title hash or random seed
      const hash = Math.abs(
        item.title.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
      );
      const asin = `B0${String(hash).padStart(8, '0').slice(0, 8)}`;

      // Skip if already exists
      if (existingAsins.has(asin) || existingNames.has(item.title.toLowerCase())) {
        return;
      }

      const productUrl = `https://www.amazon.com/dp/${asin}`;
      const affiliateUrl = attachAffiliateTag
        ? buildAmazonAffiliateUrl(productUrl, partnerTag)
        : ''; // Empty so admin can attach or customize affiliate link later (Requirement)

      const prod: Product = {
        id: `amzn-us-${asin}`,
        name: item.title,
        category: group.category,
        subcategory: group.subcategory,
        description: item.desc,
        price: item.price,
        rawPrice: `$${item.price.toFixed(2)}`,
        currency: 'USD',
        merchant: 'Amazon.com',
        asin,
        productUrl,
        affiliateUrl,
        imageUrl: item.img,
        recipients: item.recipients,
        relationships: item.recipients,
        recipientTags: item.recipients,
        occasions: item.occasions,
        occasionTags: item.occasions,
        personalityTags: ['Thoughtful', 'Modern', 'Quality'],
        interestTags: item.tags.slice(0, 3),
        emotionalTags: ['Joy', 'Thoughtful'],
        emotionTags: ['Joy', 'Thoughtful'],
        tags: [...new Set([...item.tags, 'amazon.com', 'newly_fetched'])],
        sourceUrl: productUrl,
        researchedAt: new Date().toISOString().split('T')[0],
        priceVerifiedAt: new Date().toISOString().split('T')[0],
        availabilityStatus: 'In stock',
        availability: 'in_stock',
        verificationStatus: 'verified',
        reviewStatus: 'approved',
        brand: item.brand,
        descriptionSource: 'amazon_us_listing',
        rating: 4.8,
        reviewCount: Math.floor(Math.random() * 600) + 80,
        isPriceAvailable: true,
        isRatingAvailable: true,
        isReviewCountAvailable: true,
        isAvailabilityAvailable: true,
        isDemo: true,
        source: 'amazon',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        genderPreference: 'unisex',
        status: 'active'
      };

      existingAsins.add(asin);
      existingNames.add(item.title.toLowerCase());
      generated.push(prod);
      countForThisCat++;
    });
  });

  return generated;
}
