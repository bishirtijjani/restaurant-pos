/**
 * seedDemoRestaurant.js
 * 
 * Creates a complete demo restaurant with:
 * - Full brand settings and configuration
 * - Staff users with different roles
 * - Complete floor plan with tables
 * - Suppliers and inventory items (linked to menu items)
 * - Menu categories, add-on groups, and menu items
 * - Discounts and promo codes
 * - KDS stations
 * - Customer database
 * - A full week of historical orders (for analytics)
 * - Reservations (past and upcoming)
 * - Purchase orders and stock adjustments
 * - Expenses across categories
 * 
 * All data is realistic and internationally-neutral.
 * 
 * Usage: node scripts/seedDemoRestaurant.js [--drop]
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

// Models
const User = require("../models/User");
const Organization = require("../models/Organization");
const Store = require("../models/Store");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const AddOnGroup = require("../models/AddOnGroup");
const Floor = require("../models/Floor");
const Table = require("../models/Table");
const Supplier = require("../models/Supplier");
const InventoryItem = require("../models/InventoryItem");
const PurchaseOrder = require("../models/PurchaseOrder");
const StockAdjustment = require("../models/StockAdjustment");
const Expense = require("../models/Expense");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const Discount = require("../models/Discount");
const KDSStation = require("../models/KDSStation");
const PromoCode = require("../models/PromoCode");
const VoidLog = require("../models/VoidLog");
const AuditLog = require("../models/AuditLog");

// Load env vars - works when run from project root or backend directory
const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

// ============================================================================
// REALISTIC DATA GENERATORS - International/Neutral
// ============================================================================

const FIRST_NAMES = [
  "James", "Maria", "Robert", "Jennifer", "Michael", "Linda", "William", "Patricia",
  "David", "Elizabeth", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah",
  "Charles", "Karen", "Daniel", "Nancy", "Matthew", "Lisa", "Anthony", "Betty",
  "Mark", "Margaret", "Donald", "Sandra", "Steven", "Ashley", "Paul", "Kimberly",
  "Andrew", "Emily", "Joshua", "Donna", "Kenneth", "Michelle", "Kevin", "Dorothy",
  "Brian", "Carol", "George", "Amanda", "Timothy", "Melissa", "Ronald", "Deborah",
  "Edward", "Stephanie", "Jason", "Rebecca", "Jeffrey", "Laura", "Ryan", "Sharon",
  "Jacob", "Cynthia", "Gary", "Kathleen", "Nicholas", "Amy", "Eric", "Angela",
  "Jonathan", "Shirley", "Stephen", "Anna", "Larry", "Brenda", "Justin", "Pamela",
  "Scott", "Emma", "Brandon", "Nicole", "Benjamin", "Helen", "Samuel", "Samantha",
  "Frank", "Katherine", "Gregory", "Christine", "Raymond", "Debra", "Alexander", "Rachel",
  "Patrick", "Catherine", "Jack", "Carolyn", "Dennis", "Janet", "Jerry", "Ruth",
  "Tyler", "Julie", "Aaron", "Olivia", "Adam", "Joyce", "Henry", "Virginia",
  "Nathan", "Victoria", "Douglas", "Lauren", "Zachary", "Kelly", "Peter", "Christina",
  "Kyle", "Joan", "Walter", "Evelyn", "Ethan", "Judith", "Jeremy", "Megan",
  "Harold", "Cheryl", "Keith", "Andrea", "Christian", "Hannah", "Roger", "Martha",
  "Noah", "Jacqueline", "Gerald", "Frances", "Carl", "Gloria", "Terry", "Ann",
  "Sean", "Teresa", "Austin", "Kathryn", "Arthur", "Sara", "Lawrence", "Janice",
  "Jesse", "Jean", "Dylan", "Alice", "Bryan", "Madison", "Joe", "Doris",
  "Jordan", "Abigail", "Billy", "Julia", "Bruce", "Grace", "Albert", "Judy",
  "Willie", "Denise", "Gabriel", "Amber", "Logan", "Marilyn", "Alan", "Beverly",
  "Juan", "Danielle", "Wayne", "Isabella", "Roy", "Theresa", "Ralph", "Sophia",
  "Randy", "Marie", "Eugene", "Diana", "Vincent", "Brittany"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
  "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
  "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
  "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
  "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza",
  "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers"
];

const MENU_ITEMS = {
  // Items with ingredients that link to inventory
  withIngredients: [
    {
      name: "Classic Beef Burger",
      category: "Burgers",
      price: 14.50,
      costPrice: 4.20,
      prepTime: 12,
      description: "Premium beef patty, fresh lettuce, tomato, onion, pickles, house sauce on toasted brioche bun.",
      allergens: ["Gluten", "Eggs", "Dairy"],
      ingredients: [
        { name: "Ground Beef Patty", qty: 1 },
        { name: "Brioche Bun", qty: 1 },
        { name: "Lettuce", qty: 0.05 },
        { name: "Tomato", qty: 0.08 },
        { name: "Cheddar Cheese", qty: 0.05 },
        { name: "Pickles", qty: 0.03 }
      ]
    },
    {
      name: "Grilled Chicken Sandwich",
      category: "Burgers",
      price: 13.00,
      costPrice: 3.80,
      prepTime: 14,
      description: "Marinated grilled chicken breast, avocado, bacon, lettuce, tomato, herb mayo on ciabatta.",
      allergens: ["Gluten", "Eggs", "Dairy"],
      ingredients: [
        { name: "Chicken Breast", qty: 1 },
        { name: "Ciabatta Roll", qty: 1 },
        { name: "Bacon Strips", qty: 2 },
        { name: "Avocado", qty: 0.5 },
        { name: "Lettuce", qty: 0.05 }
      ]
    },
    {
      name: "Margherita Pizza",
      category: "Pizza",
      price: 16.00,
      costPrice: 4.50,
      prepTime: 18,
      description: "San Marzano tomato sauce, fresh mozzarella, basil, extra virgin olive oil on hand-stretched dough.",
      allergens: ["Gluten", "Dairy"],
      dietaryTags: ["Vegetarian"],
      ingredients: [
        { name: "Pizza Dough", qty: 1 },
        { name: "Tomato Sauce", qty: 0.1 },
        { name: "Fresh Mozzarella", qty: 0.15 },
        { name: "Fresh Basil", qty: 0.02 },
        { name: "Olive Oil", qty: 0.01 }
      ]
    },
    {
      name: "Pepperoni Pizza",
      category: "Pizza",
      price: 18.50,
      costPrice: 5.20,
      prepTime: 18,
      description: "Tomato sauce, mozzarella, premium pepperoni, oregano on hand-stretched dough.",
      allergens: ["Gluten", "Dairy"],
      ingredients: [
        { name: "Pizza Dough", qty: 1 },
        { name: "Tomato Sauce", qty: 0.1 },
        { name: "Shredded Mozzarella", qty: 0.15 },
        { name: "Pepperoni Slices", qty: 12 },
        { name: "Dried Oregano", qty: 0.005 }
      ]
    },
    {
      name: "Caesar Salad",
      category: "Salads",
      price: 12.00,
      costPrice: 3.00,
      prepTime: 8,
      description: "Romaine lettuce, parmesan, croutons, Caesar dressing. Add grilled chicken or shrimp.",
      allergens: ["Gluten", "Dairy", "Eggs", "Fish"],
      ingredients: [
        { name: "Romaine Lettuce", qty: 0.2 },
        { name: "Parmesan Cheese", qty: 0.03 },
        { name: "Croutons", qty: 0.05 },
        { name: "Caesar Dressing", qty: 0.05 }
      ]
    },
    {
      name: "Grilled Salmon Fillet",
      category: "Mains",
      price: 26.00,
      costPrice: 9.50,
      prepTime: 20,
      description: "Atlantic salmon, lemon herb butter, seasonal vegetables, roasted potatoes.",
      allergens: ["Fish", "Dairy"],
      dietaryTags: ["Gluten-Free"],
      ingredients: [
        { name: "Salmon Fillet", qty: 1 },
        { name: "Butter", qty: 0.03 },
        { name: "Lemon", qty: 0.5 },
        { name: "Seasonal Vegetables", qty: 0.2 },
        { name: "Roasted Potatoes", qty: 0.25 }
      ]
    },
    {
      name: "Fish and Chips",
      category: "Mains",
      price: 19.50,
      costPrice: 6.00,
      prepTime: 16,
      description: "Beer-battered cod, hand-cut fries, tartar sauce, lemon wedge.",
      allergens: ["Gluten", "Fish", "Eggs", "Dairy"],
      ingredients: [
        { name: "Cod Fillet", qty: 1 },
        { name: "Beer Batter Mix", qty: 0.1 },
        { name: "Potatoes", qty: 0.3 },
        { name: "Tartar Sauce", qty: 0.05 }
      ]
    },
    {
      name: "Chicken Wings (10 pcs)",
      category: "Starters",
      price: 14.00,
      costPrice: 4.50,
      prepTime: 15,
      description: "Crispy fried wings with choice of buffalo, BBQ, or garlic parmesan sauce.",
      allergens: ["Gluten", "Dairy"],
      ingredients: [
        { name: "Chicken Wings", qty: 10 },
        { name: "Buffalo Sauce", qty: 0.08 },
        { name: "Blue Cheese Dressing", qty: 0.05 },
        { name: "Celery Sticks", qty: 2 }
      ]
    },
    {
      name: "Chocolate Lava Cake",
      category: "Desserts",
      price: 10.00,
      costPrice: 2.80,
      prepTime: 12,
      description: "Warm chocolate cake with molten center, vanilla ice cream, raspberry coulis.",
      allergens: ["Gluten", "Dairy", "Eggs"],
      dietaryTags: ["Vegetarian"],
      ingredients: [
        { name: "Chocolate Cake Mix", qty: 1 },
        { name: "Vanilla Ice Cream", qty: 0.1 },
        { name: "Raspberry Coulis", qty: 0.02 },
        { name: "Butter", qty: 0.02 }
      ]
    },
    {
      name: "Tiramisu",
      category: "Desserts",
      price: 9.50,
      costPrice: 2.50,
      prepTime: 5,
      description: "Classic Italian dessert with espresso-soaked ladyfingers, mascarpone cream, cocoa.",
      allergens: ["Gluten", "Dairy", "Eggs"],
      dietaryTags: ["Vegetarian"],
      ingredients: [
        { name: "Ladyfingers", qty: 4 },
        { name: "Mascarpone Cheese", qty: 0.1 },
        { name: "Espresso Beans", qty: 0.1 },
        { name: "Cocoa Powder", qty: 0.01 }
      ]
    }
  ],
  // Items without ingredient tracking
  withoutIngredients: [
    {
      name: "Craft IPA Beer",
      category: "Beverages",
      price: 7.50,
      costPrice: 2.50,
      prepTime: 2,
      description: "Local craft IPA, hoppy and refreshing. 6.5% ABV.",
      allergens: ["Gluten"],
      dietaryTags: ["Vegetarian", "Vegan"]
    },
    {
      name: "House Red Wine",
      category: "Beverages",
      price: 9.00,
      costPrice: 3.00,
      prepTime: 2,
      description: "Cabernet Sauvignon, notes of blackberry and oak.",
      dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free"]
    },
    {
      name: "Fresh Lemonade",
      category: "Beverages",
      price: 5.50,
      costPrice: 1.00,
      prepTime: 3,
      description: "Freshly squeezed lemons, pure cane sugar, sparkling water.",
      dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free"]
    },
    {
      name: "Iced Caramel Latte",
      category: "Beverages",
      price: 6.50,
      costPrice: 1.80,
      prepTime: 4,
      description: "Espresso, cold milk, caramel syrup, ice.",
      allergens: ["Dairy"],
      dietaryTags: ["Vegetarian"]
    },
    {
      name: "Artisan Bread Basket",
      category: "Starters",
      price: 6.00,
      costPrice: 1.50,
      prepTime: 3,
      description: "Selection of freshly baked sourdough, focaccia, and herb butter.",
      allergens: ["Gluten", "Dairy"],
      dietaryTags: ["Vegetarian"]
    },
    {
      name: "Loaded Nachos",
      category: "Starters",
      price: 13.50,
      costPrice: 4.00,
      prepTime: 10,
      description: "Tortilla chips, cheese sauce, jalapenos, salsa, sour cream, guacamole.",
      allergens: ["Dairy"],
      dietaryTags: ["Vegetarian", "Gluten-Free"]
    },
    {
      name: "Soup of the Day",
      category: "Starters",
      price: 7.00,
      costPrice: 2.00,
      prepTime: 5,
      description: "Chef's daily selection. Ask your server for today's offering.",
      allergens: ["Gluten", "Dairy"]
    },
    {
      name: "Truffle Mac and Cheese",
      category: "Sides",
      price: 9.00,
      costPrice: 2.50,
      prepTime: 15,
      description: "Creamy four-cheese sauce, truffle oil, breadcrumbs.",
      allergens: ["Gluten", "Dairy"],
      dietaryTags: ["Vegetarian"]
    },
    {
      name: "Garlic Parmesan Fries",
      category: "Sides",
      price: 6.50,
      costPrice: 1.80,
      prepTime: 8,
      description: "Hand-cut fries, garlic butter, parmesan, herbs.",
      allergens: ["Dairy"],
      dietaryTags: ["Vegetarian", "Gluten-Free"]
    },
    {
      name: "Onion Rings",
      category: "Sides",
      price: 7.00,
      costPrice: 2.00,
      prepTime: 10,
      description: "Beer-battered onion rings with chipotle aioli.",
      allergens: ["Gluten", "Eggs", "Dairy"]
    },
    {
      name: "Steamed Asparagus",
      category: "Sides",
      price: 6.00,
      costPrice: 2.00,
      prepTime: 8,
      description: "Fresh asparagus, lemon zest, sea salt.",
      dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free"]
    },
    {
      name: "New York Cheesecake",
      category: "Desserts",
      price: 9.00,
      costPrice: 2.50,
      prepTime: 5,
      description: "Classic creamy cheesecake with strawberry compote.",
      allergens: ["Gluten", "Dairy", "Eggs"],
      dietaryTags: ["Vegetarian"]
    },
    {
      name: "Creme Brulee",
      category: "Desserts",
      price: 10.50,
      costPrice: 2.80,
      prepTime: 5,
      description: "Rich vanilla custard with caramelized sugar top.",
      allergens: ["Dairy", "Eggs"],
      dietaryTags: ["Vegetarian", "Gluten-Free"]
    },
    {
      name: "Affogato",
      category: "Desserts",
      price: 7.50,
      costPrice: 2.00,
      prepTime: 3,
      description: "Vanilla gelato drowned in hot espresso.",
      allergens: ["Dairy"],
      dietaryTags: ["Vegetarian", "Gluten-Free"]
    }
  ]
};

const INVENTORY_ITEMS = [
  // Raw Materials
  { name: "Ground Beef Patty", category: "Raw Materials", unit: "pcs", minStock: 50, costPrice: 2.00 },
  { name: "Chicken Breast", category: "Raw Materials", unit: "pcs", minStock: 40, costPrice: 1.80 },
  { name: "Chicken Wings", category: "Raw Materials", unit: "pcs", minStock: 200, costPrice: 0.25 },
  { name: "Salmon Fillet", category: "Raw Materials", unit: "pcs", minStock: 20, costPrice: 6.50 },
  { name: "Cod Fillet", category: "Raw Materials", unit: "pcs", minStock: 25, costPrice: 3.50 },
  { name: "Bacon Strips", category: "Raw Materials", unit: "pcs", minStock: 100, costPrice: 0.40 },
  { name: "Pepperoni Slices", category: "Raw Materials", unit: "pcs", minStock: 300, costPrice: 0.10 },
  // Produce
  { name: "Romaine Lettuce", category: "Raw Materials", unit: "kg", minStock: 5, costPrice: 3.50 },
  { name: "Lettuce", category: "Raw Materials", unit: "kg", minStock: 3, costPrice: 2.80 },
  { name: "Tomato", category: "Raw Materials", unit: "kg", minStock: 8, costPrice: 3.00 },
  { name: "Onion", category: "Raw Materials", unit: "kg", minStock: 5, costPrice: 1.50 },
  { name: "Avocado", category: "Raw Materials", unit: "pcs", minStock: 30, costPrice: 1.20 },
  { name: "Lemon", category: "Raw Materials", unit: "pcs", minStock: 50, costPrice: 0.50 },
  { name: "Fresh Basil", category: "Raw Materials", unit: "kg", minStock: 0.5, costPrice: 12.00 },
  { name: "Celery Sticks", category: "Raw Materials", unit: "pcs", minStock: 40, costPrice: 0.20 },
  { name: "Potatoes", category: "Raw Materials", unit: "kg", minStock: 15, costPrice: 1.80 },
  { name: "Seasonal Vegetables", category: "Raw Materials", unit: "kg", minStock: 10, costPrice: 4.00 },
  { name: "Asparagus", category: "Raw Materials", unit: "kg", minStock: 3, costPrice: 8.00 },
  { name: "Garlic", category: "Raw Materials", unit: "kg", minStock: 2, costPrice: 6.00 },
  { name: "Jalapenos", category: "Raw Materials", unit: "kg", minStock: 2, costPrice: 5.00 },
  // Dairy
  { name: "Cheddar Cheese", category: "Raw Materials", unit: "kg", minStock: 5, costPrice: 8.50 },
  { name: "Fresh Mozzarella", category: "Raw Materials", unit: "kg", minStock: 4, costPrice: 9.00 },
  { name: "Shredded Mozzarella", category: "Raw Materials", unit: "kg", minStock: 6, costPrice: 7.50 },
  { name: "Parmesan Cheese", category: "Raw Materials", unit: "kg", minStock: 3, costPrice: 15.00 },
  { name: "Mascarpone Cheese", category: "Raw Materials", unit: "kg", minStock: 2, costPrice: 12.00 },
  { name: "Butter", category: "Raw Materials", unit: "kg", minStock: 5, costPrice: 6.00 },
  { name: "Vanilla Ice Cream", category: "Raw Materials", unit: "L", minStock: 8, costPrice: 5.00 },
  { name: "Blue Cheese Dressing", category: "Raw Materials", unit: "L", minStock: 3, costPrice: 8.00 },
  { name: "Cream Cheese", category: "Raw Materials", unit: "kg", minStock: 4, costPrice: 7.00 },
  { name: "Heavy Cream", category: "Raw Materials", unit: "L", minStock: 5, costPrice: 4.50 },
  // Bakery
  { name: "Brioche Bun", category: "Raw Materials", unit: "pcs", minStock: 80, costPrice: 0.60 },
  { name: "Ciabatta Roll", category: "Raw Materials", unit: "pcs", minStock: 60, costPrice: 0.80 },
  { name: "Pizza Dough", category: "Raw Materials", unit: "pcs", minStock: 50, costPrice: 1.20 },
  { name: "Ladyfingers", category: "Raw Materials", unit: "pcs", minStock: 100, costPrice: 0.30 },
  { name: "Sourdough Bread", category: "Raw Materials", unit: "pcs", minStock: 30, costPrice: 3.00 },
  { name: "Focaccia", category: "Raw Materials", unit: "pcs", minStock: 25, costPrice: 2.50 },
  { name: "Tortilla Chips", category: "Raw Materials", unit: "kg", minStock: 5, costPrice: 6.00 },
  { name: "Croutons", category: "Raw Materials", unit: "kg", minStock: 3, costPrice: 7.00 },
  { name: "Breadcrumbs", category: "Raw Materials", unit: "kg", minStock: 2, costPrice: 4.00 },
  { name: "Chocolate Cake Mix", category: "Raw Materials", unit: "pcs", minStock: 20, costPrice: 2.50 },
  // Sauces & Condiments
  { name: "Tomato Sauce", category: "Raw Materials", unit: "L", minStock: 8, costPrice: 3.00 },
  { name: "Caesar Dressing", category: "Raw Materials", unit: "L", minStock: 4, costPrice: 6.00 },
  { name: "Tartar Sauce", category: "Raw Materials", unit: "L", minStock: 3, costPrice: 7.00 },
  { name: "Buffalo Sauce", category: "Raw Materials", unit: "L", minStock: 4, costPrice: 5.00 },
  { name: "BBQ Sauce", category: "Raw Materials", unit: "L", minStock: 5, costPrice: 4.00 },
  { name: "Raspberry Coulis", category: "Raw Materials", unit: "L", minStock: 2, costPrice: 10.00 },
  { name: "Salsa", category: "Raw Materials", unit: "L", minStock: 3, costPrice: 4.50 },
  { name: "Sour Cream", category: "Raw Materials", unit: "L", minStock: 4, costPrice: 3.50 },
  { name: "Guacamole", category: "Raw Materials", unit: "kg", minStock: 3, costPrice: 8.00 },
  { name: "Caramel Syrup", category: "Raw Materials", unit: "L", minStock: 2, costPrice: 8.00 },
  { name: "Olive Oil", category: "Raw Materials", unit: "L", minStock: 10, costPrice: 8.00 },
  { name: "Truffle Oil", category: "Raw Materials", unit: "L", minStock: 1, costPrice: 50.00 },
  { name: "Chipotle Aioli", category: "Raw Materials", unit: "L", minStock: 2, costPrice: 12.00 },
  { name: "Pickles", category: "Raw Materials", unit: "kg", minStock: 3, costPrice: 4.00 },
  // Spices
  { name: "Dried Oregano", category: "Raw Materials", unit: "kg", minStock: 1, costPrice: 15.00 },
  { name: "Cocoa Powder", category: "Raw Materials", unit: "kg", minStock: 2, costPrice: 10.00 },
  { name: "Sea Salt", category: "Raw Materials", unit: "kg", minStock: 5, costPrice: 2.00 },
  { name: "Black Pepper", category: "Raw Materials", unit: "kg", minStock: 2, costPrice: 12.00 },
  // Dry Goods
  { name: "Beer Batter Mix", category: "Raw Materials", unit: "kg", minStock: 5, costPrice: 4.00 },
  { name: "Espresso Beans", category: "Raw Materials", unit: "kg", minStock: 5, costPrice: 18.00 },
  { name: "Sugar", category: "Raw Materials", unit: "kg", minStock: 10, costPrice: 2.00 },
  { name: "Flour", category: "Raw Materials", unit: "kg", minStock: 25, costPrice: 1.50 },
  // Beverages
  { name: "Craft IPA Beer", category: "Beverages", unit: "pcs", minStock: 48, costPrice: 2.50 },
  { name: "House Red Wine", category: "Beverages", unit: "pcs", minStock: 36, costPrice: 3.00 },
  { name: "House White Wine", category: "Beverages", unit: "pcs", minStock: 36, costPrice: 3.00 },
  { name: "Sparkling Water", category: "Beverages", unit: "L", minStock: 50, costPrice: 0.80 },
  { name: "Cola Syrup", category: "Beverages", unit: "L", minStock: 20, costPrice: 4.00 },
  // Packaging
  { name: "Takeout Boxes Large", category: "Packaging", unit: "pcs", minStock: 200, costPrice: 0.40 },
  { name: "Takeout Boxes Small", category: "Packaging", unit: "pcs", minStock: 200, costPrice: 0.30 },
  { name: "Pizza Boxes 14in", category: "Packaging", unit: "pcs", minStock: 100, costPrice: 0.80 },
  { name: "Paper Bags", category: "Packaging", unit: "pcs", minStock: 300, costPrice: 0.15 },
  { name: "Plastic Cups 16oz", category: "Packaging", unit: "pcs", minStock: 500, costPrice: 0.08 },
  { name: "Paper Napkins", category: "Packaging", unit: "pcs", minStock: 1000, costPrice: 0.02 },
  { name: "Plastic Cutlery Sets", category: "Packaging", unit: "pcs", minStock: 400, costPrice: 0.10 },
  // Cleaning Supplies
  { name: "Dish Soap", category: "Cleaning Supplies", unit: "L", minStock: 10, costPrice: 3.50 },
  { name: "Sanitizer", category: "Cleaning Supplies", unit: "L", minStock: 15, costPrice: 4.00 },
  { name: "Dishwasher Detergent", category: "Cleaning Supplies", unit: "kg", minStock: 8, costPrice: 5.00 },
  { name: "Paper Towels", category: "Cleaning Supplies", unit: "pcs", minStock: 50, costPrice: 1.50 },
  { name: "Trash Bags", category: "Cleaning Supplies", unit: "pcs", minStock: 100, costPrice: 0.20 },
  { name: "Floor Cleaner", category: "Cleaning Supplies", unit: "L", minStock: 8, costPrice: 4.50 },
  { name: "Glass Cleaner", category: "Cleaning Supplies", unit: "L", minStock: 6, costPrice: 3.50 },
  { name: "Oven Cleaner", category: "Cleaning Supplies", unit: "L", minStock: 4, costPrice: 6.00 },
  { name: "Hand Soap", category: "Cleaning Supplies", unit: "L", minStock: 10, costPrice: 3.00 },
  { name: "Bleach", category: "Cleaning Supplies", unit: "L", minStock: 8, costPrice: 2.50 }
];

const SUPPLIERS = [
  { name: "Metro Food Distributors", phone: "+1-555-0100", email: "orders@metrofood.com", address: "2400 Industrial Blvd, Metro City, MC 10001" },
  { name: "Premium Meats Inc.", phone: "+1-555-0101", email: "sales@premium-meats.com", address: "1850 Butcher Way, Metro City, MC 10002" },
  { name: "Fresh Harvest Produce", phone: "+1-555-0102", email: "fresh@harvestproduce.com", address: "3200 Farmers Market Dr, Metro City, MC 10003" },
  { name: "Artisan Bakery Supply", phone: "+1-555-0103", email: "wholesale@artisanbakery.com", address: "780 Baker Street, Metro City, MC 10004" },
  { name: "Dairy Direct Co.", phone: "+1-555-0104", email: "orders@dairydirect.com", address: "1500 Dairy Lane, Metro City, MC 10005" },
  { name: "Beverage World", phone: "+1-555-0105", email: "sales@beverageworld.com", address: "4200 Distribution Center, Metro City, MC 10006" },
  { name: "Restaurant Supply Depot", phone: "+1-555-0106", email: "orders@rsdepot.com", address: "900 Commerce St, Metro City, MC 10007" }
];

const ADDON_GROUPS = [
  {
    name: "Cooking Temperature",
    description: "How would you like your meat prepared?",
    selectionType: "single",
    isRequired: true,
    minSelections: 1,
    maxSelections: 1,
    items: [
      { name: "Rare", price: 0 },
      { name: "Medium Rare", price: 0 },
      { name: "Medium", price: 0 },
      { name: "Medium Well", price: 0 },
      { name: "Well Done", price: 0 }
    ]
  },
  {
    name: "Cheese Options",
    description: "Add extra cheese to your order",
    selectionType: "multiple",
    isRequired: false,
    items: [
      { name: "Extra Cheddar", price: 1.50 },
      { name: "Swiss Cheese", price: 1.50 },
      { name: "Blue Cheese", price: 2.00 },
      { name: "Pepper Jack", price: 1.50 }
    ]
  },
  {
    name: "Premium Toppings",
    description: "Elevate your dish with premium additions",
    selectionType: "multiple",
    isRequired: false,
    items: [
      { name: "Bacon", price: 2.50, allergens: ["Pork"] },
      { name: "Avocado", price: 2.00, dietaryTags: ["Vegan"] },
      { name: "Fried Egg", price: 1.50, allergens: ["Eggs"] },
      { name: "Grilled Mushrooms", price: 1.50, dietaryTags: ["Vegan"] },
      { name: "Caramelized Onions", price: 1.00, dietaryTags: ["Vegan"] },
      { name: "Truffle Oil Drizzle", price: 3.00, dietaryTags: ["Vegan"] }
    ]
  },
  {
    name: "Dietary Modifications",
    description: "Adjust for dietary needs",
    selectionType: "multiple",
    isRequired: false,
    items: [
      { name: "Gluten-Free Bun", price: 2.00, dietaryTags: ["Gluten-Free"] },
      { name: "Lettuce Wrap (No Bun)", price: 0, dietaryTags: ["Gluten-Free", "Low-Carb", "Keto"] },
      { name: "Dairy-Free Cheese", price: 2.00, dietaryTags: ["Vegan", "Dairy-Free"] },
      { name: "No Sauce", price: 0 }
    ]
  },
  {
    name: "Side Substitutions",
    description: "Swap your side dish",
    selectionType: "single",
    isRequired: false,
    maxSelections: 1,
    items: [
      { name: "Side Salad (+$2)", price: 2.00, dietaryTags: ["Vegetarian", "Gluten-Free"] },
      { name: "Sweet Potato Fries (+$2)", price: 2.00, dietaryTags: ["Vegan", "Gluten-Free"] },
      { name: "Onion Rings (+$2)", price: 2.00 },
      { name: "Steamed Vegetables (+$2)", price: 2.00, dietaryTags: ["Vegetarian", "Vegan", "Gluten-Free"] },
      { name: "Truffle Mac & Cheese (+$4)", price: 4.00, dietaryTags: ["Vegetarian"] }
    ]
  },
  {
    name: "Wing Sauce",
    description: "Choose your wing flavor",
    selectionType: "single",
    isRequired: true,
    items: [
      { name: "Classic Buffalo", price: 0 },
      { name: "Honey BBQ", price: 0 },
      { name: "Garlic Parmesan", price: 0 },
      { name: "Lemon Pepper", price: 0 },
      { name: "Mango Habanero", price: 0 },
      { name: "Korean BBQ", price: 0 }
    ]
  },
  {
    name: "Beverage Size",
    description: "Choose your size",
    selectionType: "single",
    isRequired: true,
    items: [
      { name: "Regular (12oz)", price: 0 },
      { name: "Large (20oz)", price: 2.00 },
      { name: "Pitcher (60oz)", price: 8.00 }
    ]
  },
  {
    name: "Ice Cream Flavor",
    description: "Choose your flavor",
    selectionType: "single",
    isRequired: false,
    maxSelections: 1,
    items: [
      { name: "Vanilla", price: 0 },
      { name: "Chocolate", price: 0 },
      { name: "Strawberry", price: 0 },
      { name: "Salted Caramel", price: 0 },
      { name: "Mint Chip", price: 0 }
    ]
  }
];

const CATEGORIES = [
  { name: "Starters", description: "Appetizers and small plates to begin your meal" },
  { name: "Burgers", description: "Hand-crafted burgers made with premium ingredients" },
  { name: "Pizza", description: "Stone-fired pizzas with fresh toppings" },
  { name: "Salads", description: "Fresh and healthy salad options" },
  { name: "Mains", description: "Chef's signature main courses" },
  { name: "Sides", description: "Perfect accompaniments to your meal" },
  { name: "Desserts", description: "Sweet treats to finish your dining experience" },
  { name: "Beverages", description: "Refreshing drinks, cocktails, and coffee" }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateName = () => {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return { first, last, full: `${first} ${last}` };
};

const generatePhone = () => {
  const areaCode = Math.floor(200 + Math.random() * 799);
  const prefix = Math.floor(200 + Math.random() * 799);
  const line = Math.floor(1000 + Math.random() * 9000);
  return `+1-${areaCode}-${prefix}-${line}`;
};

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomElements = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

let orderCounter = 0;
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  orderCounter++;
  return `${dateStr}-${orderCounter}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

const seedDemoRestaurant = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("MongoDB Connected...");

    const args = process.argv.slice(2);
    const dropData = args.includes("--drop");

    if (dropData) {
      console.log("Dropping existing database...");
      await mongoose.connection.db.dropDatabase();
      console.log("Existing database dropped.");
    }

    console.log("\nCreating Demo Restaurant: Riverside Bistro\n");

    const now = new Date();
    const oneWeekAgo = addDays(now, -7);

    // STEP 1: Create Organization
    console.log("Step 1: Creating Organization...");
    const tempOwnerId = new mongoose.Types.ObjectId();
    const org = await Organization.create({
      name: "Riverside Bistro",
      plan: "pro",
      industry: "Restaurant",
      status: "active",
      ownerId: tempOwnerId,
      brandSettings: {
        branding: {
          restaurantMotto: "Where Every Meal Tells a Story",
          restaurantEmail: "hello@riversidebistro.com",
          website: "www.riversidebistro.com"
        },
        currency: { code: "USD", symbol: "$", name: "US Dollar" },
        dateFormat: "MM/DD/YYYY",
        timezone: "America/New_York",
        inventory: { lowStockAlert: 10, autoGenerateSKU: true },
        globalDiscount: { enabled: false, name: "Member Discount", type: "percentage", value: 5, applicableOrderTypes: ["dine-in", "takeaway", "delivery"] },
        printerSettings: { mode: "browser", paperWidth: "80mm" },
        communication: {
          email: { provider: "log", enabled: true, config: {} },
          sms: { provider: "log", enabled: false, config: {} },
          whatsapp: { provider: "log", enabled: false, config: {} }
        },
        taxSettings: { enabled: true, globalRate: 8.5, name: "Sales Tax", mode: "per-item", includeInPrice: false },
        serviceCharge: { enabled: true, rate: 18, name: "Gratuity", applyTo: "dine-in" },
        paymentGateways: { stripe: { enabled: false, publishableKey: "", secretKey: "", webhookSecret: "" } },
        menuSettings: { enforceBrandPricing: false, allowLocalModifiers: true, notifyOnUpdates: true }
      }
    });
    console.log(`  Created: ${org.name}`);

    // STEP 2: Create Owner
    console.log("\nStep 2: Creating Owner...");
    const ownerName = generateName();
    const ownerUser = new User({
      fullname: `${ownerName.full} (Owner)`,
      email: "owner@riversidebistro.com",
      password: "demo123",
      currentOrganizationId: org._id,
      stores: [],
      role: "admin"
    });
    org.ownerId = ownerUser._id;
    await org.save();
    await ownerUser.save();
    console.log(`  Created: ${ownerUser.email}`);

    // STEP 2B: Create Standalone Super Admin (not part of any restaurant)
    console.log("\nStep 2B: Creating Super Admin...");
    const superAdminName = generateName();
    const superAdminUser = new User({
      fullname: `${superAdminName.full} (Super Admin)`,
      email: "admin@codeket.com",
      password: "demo123",
      isSuperAdmin: true,
      role: "admin",
      stores: [],
      currentOrganizationId: null
    });
    await superAdminUser.save();
    console.log(`  Created: ${superAdminUser.email}`);

    // STEP 3: Create Store
    console.log("\nStep 3: Creating Store...");
    const store = await Store.create({
      name: "Riverside Bistro - Main Location",
      organizationId: org._id,
      location: "482 Waterfront Drive, Metro City, MC 10010",
      contactPhone: "+1-555-RIVERSIDE",
      status: "active",
      ownerId: ownerUser._id,
      settings: { timezone: "America/New_York", currency: { code: "USD", symbol: "$", name: "US Dollar" }, taxRate: 8.5 }
    });
    ownerUser.stores.push({ storeId: store._id, organizationId: org._id, role: "admin", isDefault: true, status: "active" });
    ownerUser.lastActiveStore = store._id;
    await ownerUser.save();
    console.log(`  Created: ${store.name}`);

    // STEP 4: Create Staff
    console.log("\nStep 4: Creating Staff...");
    const staffRoles = [
      { role: "manager", email: "manager@riversidebistro.com" },
      { role: "cashier", email: "cashier@riversidebistro.com" },
      { role: "cashier", email: "cashier2@riversidebistro.com" },
      { role: "waiter", email: "server1@riversidebistro.com" },
      { role: "waiter", email: "server2@riversidebistro.com" },
      { role: "waiter", email: "server3@riversidebistro.com" },
      { role: "kitchen", email: "kitchen@riversidebistro.com" },
      { role: "kitchen", email: "grill@riversidebistro.com" },
      { role: "kitchen", email: "prep@riversidebistro.com" },
      { role: "staff", email: "host@riversidebistro.com" }
    ];
    const staffUsers = [];
    for (const staff of staffRoles) {
      const name = generateName();
      const user = await User.create({
        fullname: `${name.full} (${staff.role.charAt(0).toUpperCase() + staff.role.slice(1)})`,
        email: staff.email,
        password: "demo123",
        isSuperAdmin: false,
        currentOrganizationId: org._id,
        lastActiveStore: store._id,
        stores: [{ storeId: store._id, organizationId: org._id, role: staff.role, isDefault: true, status: "active" }]
      });
      staffUsers.push(user);
      console.log(`  ${staff.role}: ${user.email}`);
    }
    const managerUser = staffUsers.find(u => u.email === "manager@riversidebistro.com");
    const cashierUsers = staffUsers.filter(u => u.email.includes("cashier"));
    const serverUsers = staffUsers.filter(u => u.email.includes("server"));
    const kitchenUsers = staffUsers.filter(u => u.email.includes("kitchen") || u.email.includes("grill") || u.email.includes("prep"));
    const hostUser = staffUsers.find(u => u.email === "host@riversidebistro.com"); // host is a staff role

    // STEP 5: Create Floors and Tables
    console.log("\nStep 5: Creating Floor Plan...");
    const mainFloor = await Floor.create({ name: "Main Dining Room", storeId: store._id, organizationId: org._id, description: "Elegant indoor dining with waterfront views", order: 1, layout: { width: 1400, height: 1000, gridSize: 20 } });
    const barFloor = await Floor.create({ name: "Bar & Lounge", storeId: store._id, organizationId: org._id, description: "Cocktail bar with high-top seating", order: 2, layout: { width: 800, height: 600, gridSize: 20 } });
    const patioFloor = await Floor.create({ name: "Riverside Patio", storeId: store._id, organizationId: org._id, description: "Outdoor dining with heating and shade", order: 3, layout: { width: 1200, height: 800, gridSize: 20 } });

    // Create tables for each floor
    const mainTables = [
      { num: "M1", cap: 2, pos: { x: 80, y: 80 }, shape: "circle" },
      { num: "M2", cap: 2, pos: { x: 200, y: 80 }, shape: "circle" },
      { num: "M3", cap: 2, pos: { x: 320, y: 80 }, shape: "circle" },
      { num: "M4", cap: 2, pos: { x: 440, y: 80 }, shape: "circle" },
      { num: "M5", cap: 4, pos: { x: 80, y: 200 }, shape: "rectangle" },
      { num: "M6", cap: 4, pos: { x: 280, y: 200 }, shape: "rectangle" },
      { num: "M7", cap: 4, pos: { x: 480, y: 200 }, shape: "rectangle" },
      { num: "M8", cap: 6, pos: { x: 80, y: 360 }, shape: "rectangle" },
      { num: "M9", cap: 6, pos: { x: 350, y: 360 }, shape: "rectangle" },
      { num: "M10", cap: 8, pos: { x: 80, y: 540 }, shape: "rectangle" },
      { num: "VIP-1", cap: 10, pos: { x: 300, y: 720 }, shape: "rectangle" }
    ];
    for (const table of mainTables) {
      await Table.create({ floorId: mainFloor._id, storeId: store._id, organizationId: org._id, tableNumber: table.num, capacity: table.cap, originalCapacity: table.cap, status: "available", position: { x: table.pos.x, y: table.pos.y, width: table.shape === "circle" ? 80 : 120, height: table.shape === "circle" ? 80 : 100 }, shape: table.shape });
    }

    const barTables = [
      { num: "B1", cap: 2, pos: { x: 100, y: 100 }, shape: "circle" },
      { num: "B2", cap: 2, pos: { x: 220, y: 100 }, shape: "circle" },
      { num: "B3", cap: 4, pos: { x: 100, y: 250 }, shape: "rectangle" },
      { num: "B4", cap: 4, pos: { x: 300, y: 250 }, shape: "rectangle" }
    ];
    for (const table of barTables) {
      await Table.create({ floorId: barFloor._id, storeId: store._id, organizationId: org._id, tableNumber: table.num, capacity: table.cap, originalCapacity: table.cap, status: "available", position: { x: table.pos.x, y: table.pos.y, width: table.shape === "circle" ? 60 : 100, height: table.shape === "circle" ? 60 : 80 }, shape: table.shape });
    }

    const patioTables = [
      { num: "P1", cap: 2, pos: { x: 100, y: 100 }, shape: "circle" },
      { num: "P2", cap: 2, pos: { x: 220, y: 100 }, shape: "circle" },
      { num: "P3", cap: 4, pos: { x: 100, y: 250 }, shape: "rectangle" },
      { num: "P4", cap: 4, pos: { x: 300, y: 250 }, shape: "rectangle" },
      { num: "P5", cap: 6, pos: { x: 100, y: 420 }, shape: "rectangle" },
      { num: "P6", cap: 8, pos: { x: 300, y: 600 }, shape: "rectangle" }
    ];
    for (const table of patioTables) {
      await Table.create({ floorId: patioFloor._id, storeId: store._id, organizationId: org._id, tableNumber: table.num, capacity: table.cap, originalCapacity: table.cap, status: "available", position: { x: table.pos.x, y: table.pos.y, width: table.shape === "circle" ? 80 : 120, height: table.shape === "circle" ? 80 : 100 }, shape: table.shape });
    }
    const allTables = await Table.find({ storeId: store._id });
    console.log(`  Created ${allTables.length} tables across 3 floors`);

    // STEP 6: Create Suppliers
    console.log("\nStep 6: Creating Suppliers...");
    const createdSuppliers = [];
    for (const supplierData of SUPPLIERS) {
      const supplier = await Supplier.create({ ...supplierData, storeId: store._id, organizationId: org._id });
      createdSuppliers.push(supplier);
    }
    console.log(`  Created ${createdSuppliers.length} suppliers`);

    // STEP 7: Create Inventory Items
    console.log("\nStep 7: Creating Inventory...");
    const inventoryMap = {};
    for (const itemData of INVENTORY_ITEMS) {
      const supplier = getRandomElement(createdSuppliers);
      const stockRandom = Math.random();
      let currentStock;
      if (stockRandom < 0.1) currentStock = Math.floor(itemData.minStock * 0.3);
      else if (stockRandom < 0.3) currentStock = itemData.minStock;
      else currentStock = Math.floor(itemData.minStock * getRandomInt(2, 8));
      
      const item = await InventoryItem.create({
        name: itemData.name,
        sku: `RIV-${itemData.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '')}${Math.floor(1000 + Math.random() * 9000)}`,
        category: itemData.category,
        unit: itemData.unit,
        currentStock,
        minStockLevel: itemData.minStock,
        costPrice: itemData.costPrice,
        supplier: supplier._id,
        storeId: store._id,
        organizationId: org._id,
        linkedMenuItems: [],
        lastRestockDate: stockRandom > 0.3 ? new Date(oneWeekAgo.getTime() + Math.random() * (now.getTime() - oneWeekAgo.getTime())) : null,
        isActive: true
      });
      inventoryMap[itemData.name] = item;
    }
    console.log(`  Created ${Object.keys(inventoryMap).length} inventory items`);

    // STEP 8: Create Categories and Add-on Groups
    console.log("\nStep 8: Creating Categories & Add-ons...");
    const masterCategories = [];
    for (const catData of CATEGORIES) {
      const cat = await Category.create({ name: catData.name, organizationId: org._id, isMaster: true, description: catData.description });
      masterCategories.push(cat);
    }
    const masterAddonGroups = [];
    const addonGroupMap = {};
    for (const addonData of ADDON_GROUPS) {
      const addon = await AddOnGroup.create({
        name: addonData.name,
        organizationId: org._id,
        isMaster: true,
        description: addonData.description,
        selectionType: addonData.selectionType,
        isRequired: addonData.isRequired,
        minSelections: addonData.minSelections,
        maxSelections: addonData.maxSelections,
        items: addonData.items.map(item => ({ name: item.name, price: item.price, isAvailable: true, originalPrice: item.price, localPrice: item.price, allergens: item.allergens || [], dietaryTags: item.dietaryTags || [] }))
      });
      masterAddonGroups.push(addon);
      addonGroupMap[addonData.name] = addon;
    }
    console.log(`  Created ${masterCategories.length} categories, ${masterAddonGroups.length} add-on groups`);

    // STEP 9: Create Menu Items
    console.log("\nStep 9: Creating Menu Items...");
    const masterMenuItems = [];
    const menuItemWithIngredients = [];
    for (const itemData of MENU_ITEMS.withIngredients) {
      const linkedAddons = [];
      if (["Burgers", "Mains"].includes(itemData.category)) {
        linkedAddons.push(addonGroupMap["Cooking Temperature"]?._id, addonGroupMap["Cheese Options"]?._id, addonGroupMap["Premium Toppings"]?._id, addonGroupMap["Dietary Modifications"]?._id, addonGroupMap["Side Substitutions"]?._id);
      }
      if (itemData.category === "Starters" && itemData.name.includes("Wings")) linkedAddons.push(addonGroupMap["Wing Sauce"]?._id);
      if (itemData.category === "Desserts") linkedAddons.push(addonGroupMap["Ice Cream Flavor"]?._id);
      
      const item = await MenuItem.create({
        name: itemData.name,
        organizationId: org._id,
        category: itemData.category,
        price: itemData.price,
        costPrice: itemData.costPrice,
        isAvailable: true,
        preparationTime: itemData.prepTime,
        description: itemData.description,
        allergens: itemData.allergens || [],
        dietaryTags: itemData.dietaryTags || [],
        addOnGroups: linkedAddons.filter(Boolean),
        isMaster: true
      });
      masterMenuItems.push(item);
      menuItemWithIngredients.push({ item, ingredients: itemData.ingredients });
    }
    for (const itemData of MENU_ITEMS.withoutIngredients) {
      const linkedAddons = [];
      if (itemData.category === "Beverages") linkedAddons.push(addonGroupMap["Beverage Size"]?._id);
      const item = await MenuItem.create({
        name: itemData.name,
        organizationId: org._id,
        category: itemData.category,
        price: itemData.price,
        costPrice: itemData.costPrice,
        isAvailable: true,
        preparationTime: itemData.prepTime,
        description: itemData.description,
        allergens: itemData.allergens || [],
        dietaryTags: itemData.dietaryTags || [],
        addOnGroups: linkedAddons.filter(Boolean),
        isMaster: true
      });
      masterMenuItems.push(item);
    }
    console.log(`  Created ${masterMenuItems.length} menu items`);

    // STEP 10: Link Menu Items to Inventory
    console.log("\nStep 10: Linking inventory to menu...");
    for (const { item, ingredients } of menuItemWithIngredients) {
      for (const ing of ingredients) {
        const inventoryItem = inventoryMap[ing.name];
        if (inventoryItem) {
          const alreadyLinked = inventoryItem.linkedMenuItems.some(lm => lm.menuItemId?.toString() === item._id.toString());
          if (!alreadyLinked) {
            inventoryItem.linkedMenuItems.push({ menuItemId: item._id, quantityUsed: ing.qty });
            await inventoryItem.save();
          }
        }
      }
    }
    console.log(`  Linked ingredients to inventory`);

    // STEP 11: Sync Menu to Store
    console.log("\nStep 11: Syncing menu to store...");
    const storeCategories = [];
    for (const mCat of masterCategories) {
      const cat = await Category.create({ name: mCat.name, storeId: store._id, organizationId: org._id, description: mCat.description, isMaster: false, masterId: mCat._id, version: mCat.version, masterVersion: mCat.version });
      storeCategories.push(cat);
    }
    const addonIdMap = {};
    for (const mAddon of masterAddonGroups) {
      const localAddon = await AddOnGroup.create({
        name: mAddon.name,
        storeId: store._id,
        organizationId: org._id,
        description: mAddon.description,
        items: mAddon.items.map(item => ({ name: item.name, price: item.price, isAvailable: item.isAvailable, originalPrice: item.originalPrice, localPrice: item.localPrice, allergens: item.allergens, dietaryTags: item.dietaryTags })),
        selectionType: mAddon.selectionType,
        isRequired: mAddon.isRequired,
        minSelections: mAddon.minSelections,
        maxSelections: mAddon.maxSelections,
        isActive: mAddon.isActive,
        isMaster: false,
        masterId: mAddon._id,
        version: mAddon.version,
        masterVersion: mAddon.version
      });
      addonIdMap[mAddon._id.toString()] = localAddon._id;
    }
    const storeMenuItems = [];
    const storeMenuItemMap = {};
    for (const mItem of masterMenuItems) {
      const localAddonGroups = mItem.addOnGroups.map(id => addonIdMap[id.toString()]).filter(Boolean);
      const storeItem = await MenuItem.create({
        name: mItem.name,
        storeId: store._id,
        organizationId: org._id,
        category: mItem.category,
        price: mItem.price,
        costPrice: mItem.costPrice,
        isAvailable: mItem.isAvailable,
        preparationTime: mItem.preparationTime,
        description: mItem.description,
        allergens: mItem.allergens,
        dietaryTags: mItem.dietaryTags,
        addOnGroups: localAddonGroups,
        isMaster: false,
        masterId: mItem._id,
        version: mItem.version,
        masterVersion: mItem.version
      });
      storeMenuItems.push(storeItem);
      storeMenuItemMap[mItem._id.toString()] = storeItem;
    }
    console.log(`  Synced ${storeMenuItems.length} items to store`);

    // STEP 12: Create Discounts and Promo Codes
    console.log("\nStep 12: Creating Discounts & Promos...");
    await Discount.create({
      name: "Happy Hour - 20% Off",
      storeId: store._id,
      organizationId: org._id,
      description: "Enjoy 20% off all beverages and appetizers during happy hour",
      type: "percentage",
      value: 20,
      scope: "category",
      applicableCategories: ["Starters", "Beverages"],
      isActive: true,
      isHappyHour: true,
      happyHourConfig: { daysOfWeek: [1, 2, 3, 4, 5], startTime: "15:00", endTime: "18:00" },
      applicableOrderTypes: ["dine-in", "takeaway"]
    });
    await Discount.create({
      name: "Weekend Brunch Special",
      storeId: store._id,
      organizationId: org._id,
      description: "10% off brunch items on weekends",
      type: "percentage",
      value: 10,
      scope: "category",
      applicableCategories: ["Burgers", "Mains"],
      isActive: true,
      startDate: oneWeekAgo,
      endDate: addDays(now, 30),
      applicableOrderTypes: ["dine-in"]
    });
    await PromoCode.create({
      code: "WELCOME20",
      description: "20% off your first order",
      storeId: store._id,
      discountType: "percentage",
      discountValue: 20,
      isActive: true,
      startDate: oneWeekAgo,
      endDate: addDays(now, 90),
      minimumOrderAmount: 25,
      maximumDiscountAmount: 25,
      usageLimit: 100,
      usageCount: 12,
      applicableOrderTypes: ["dine-in", "takeaway", "delivery"]
    });
    await PromoCode.create({
      code: "FAMILY15",
      description: "$15 off orders over $75",
      storeId: store._id,
      discountType: "fixed",
      discountValue: 15,
      isActive: true,
      startDate: oneWeekAgo,
      endDate: addDays(now, 60),
      minimumOrderAmount: 75,
      usageCount: 8,
      applicableOrderTypes: ["dine-in", "takeaway", "delivery"]
    });
    console.log(`  Created discounts and promo codes`);

    // STEP 13: Create KDS Stations
    console.log("\nStep 13: Creating KDS Stations...");
    await KDSStation.create({
      name: "Grill Station",
      storeId: store._id,
      organizationId: org._id,
      type: "grill",
      categories: ["Burgers", "Mains"],
      displaySettings: { columns: 3, autoAdvance: false, soundEnabled: true, soundVolume: 0.7, colorScheme: "default", fontSize: "medium" },
      timingSettings: { warningTime: 12, criticalTime: 18 },
      isActive: true,
      assignedUsers: [kitchenUsers[0]._id, kitchenUsers[1]._id]
    });
    await KDSStation.create({
      name: "Fryer Station",
      storeId: store._id,
      organizationId: org._id,
      type: "fryer",
      categories: ["Starters", "Sides"],
      displaySettings: { columns: 3, autoAdvance: false, soundEnabled: true, soundVolume: 0.8, colorScheme: "default", fontSize: "medium" },
      timingSettings: { warningTime: 8, criticalTime: 12 },
      isActive: true,
      assignedUsers: [kitchenUsers[2]._id]
    });
    await KDSStation.create({
      name: "Pizza Station",
      storeId: store._id,
      organizationId: org._id,
      type: "pizza",
      categories: ["Pizza"],
      displaySettings: { columns: 3, autoAdvance: false, soundEnabled: true, soundVolume: 0.7, colorScheme: "default", fontSize: "medium" },
      timingSettings: { warningTime: 15, criticalTime: 22 },
      isActive: true,
      assignedUsers: [kitchenUsers[0]._id]
    });
    await KDSStation.create({
      name: "Salad & Cold Prep",
      storeId: store._id,
      organizationId: org._id,
      type: "salad",
      categories: ["Salads", "Desserts"],
      displaySettings: { columns: 3, autoAdvance: false, soundEnabled: true, soundVolume: 0.6, colorScheme: "default", fontSize: "medium" },
      timingSettings: { warningTime: 6, criticalTime: 10 },
      isActive: true,
      assignedUsers: [kitchenUsers[2]._id]
    });
    await KDSStation.create({
      name: "Bar & Beverages",
      storeId: store._id,
      organizationId: org._id,
      type: "beverage",
      categories: ["Beverages"],
      displaySettings: { columns: 4, autoAdvance: true, soundEnabled: true, soundVolume: 0.5, colorScheme: "default", fontSize: "medium" },
      timingSettings: { warningTime: 5, criticalTime: 8 },
      isActive: true,
      assignedUsers: [serverUsers[0]._id]
    });
    await KDSStation.create({
      name: "Expo Station",
      storeId: store._id,
      organizationId: org._id,
      type: "expo",
      categories: [],
      displaySettings: { columns: 6, autoAdvance: false, soundEnabled: true, soundVolume: 0.9, colorScheme: "high-contrast", fontSize: "large" },
      timingSettings: { warningTime: 10, criticalTime: 15 },
      isActive: true,
      assignedUsers: [managerUser._id]
    });
    console.log(`  Created 6 KDS stations`);

    // STEP 14: Create Customers
    console.log("\nStep 14: Creating Customers...");
    const customers = [];
    const customerOrderHistory = [];
    for (let i = 0; i < 50; i++) {
      const name = generateName();
      const phone = generatePhone();
      const email = `${name.first.toLowerCase()}.${name.last.toLowerCase()}.${getRandomInt(1000, 9999)}@email.com`;
      const customer = await Customer.create({
        fullname: name.full,
        phone,
        email,
        storeId: store._id,
        organizationId: org._id,
        address: `${getRandomInt(100, 9999)} ${getRandomElement(["Main St", "Oak Ave", "Park Rd", "Lake Dr", "River St"])}, Metro City, MC ${getRandomInt(10000, 99999)}`,
        debtLimit: 0
      });
      customers.push(customer);
      customerOrderHistory.push({ customer, orderCount: 0 });
    }
    for (let i = 0; i < 10; i++) {
      const name = generateName();
      const phone = generatePhone();
      const email = `vip.${name.first.toLowerCase()}.${getRandomInt(1000, 9999)}@email.com`;
      const customer = await Customer.create({
        fullname: `${name.full} (VIP)`,
        phone,
        email,
        storeId: store._id,
        organizationId: org._id,
        address: `${getRandomInt(100, 9999)} Elite Plaza, Metro City, MC ${getRandomInt(10000, 99999)}`,
        debtLimit: 500
      });
      customers.push(customer);
      customerOrderHistory.push({ customer, orderCount: 0, isVIP: true });
    }
    console.log(`  Created ${customers.length} customers`);

    // STEP 15: Generate Historical Orders (Optimized)
    console.log("\nStep 15: Generating Historical Orders (1 Week)...");
    
    // Pre-load data for fast access
    const menuItemsByCategory = {};
    for (const item of storeMenuItems) {
      if (!menuItemsByCategory[item.category]) menuItemsByCategory[item.category] = [];
      menuItemsByCategory[item.category].push(item);
    }
    
    // Pre-load all add-on groups into a Map
    const localAddonGroupMap = new Map();
    const allAddonGroups = await AddOnGroup.find({ storeId: store._id });
    for (const group of allAddonGroups) {
      localAddonGroupMap.set(group._id.toString(), group);
    }
    
    // Pre-load inventory links: menuItemId -> [{inventoryItemId, quantityUsed}]
    const inventoryLinkMap = new Map();
    const allInventory = await InventoryItem.find({ storeId: store._id });
    for (const invItem of allInventory) {
      for (const link of invItem.linkedMenuItems || []) {
        if (!inventoryLinkMap.has(link.menuItemId.toString())) {
          inventoryLinkMap.set(link.menuItemId.toString(), []);
        }
        inventoryLinkMap.get(link.menuItemId.toString()).push({
          inventoryItemId: invItem._id,
          quantityUsed: link.quantityUsed
        });
      }
    }
    
    const tableNumbers = allTables.map(t => t.tableNumber);
    const ordersToInsert = [];
    const inventoryDeductions = new Map(); // inventoryItemId -> total quantity to deduct
    let totalOrders = 0;

    for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
      const orderDate = addDays(now, -dayOffset);
      const isToday = dayOffset === 0;
      const isWeekend = orderDate.getDay() === 0 || orderDate.getDay() === 6;
      const ordersForDay = isToday ? getRandomInt(10, 25) : isWeekend ? getRandomInt(50, 70) : getRandomInt(35, 55);

      for (let i = 0; i < ordersForDay; i++) {
        const hour = getRandomInt(11, 22);
        const minute = getRandomInt(0, 59);
        const createdAt = new Date(orderDate);
        createdAt.setHours(hour, minute, getRandomInt(0, 59));
        if (createdAt > now) continue;

        const orderTypeRand = Math.random();
        const orderType = orderTypeRand < 0.6 ? "dine-in" : orderTypeRand < 0.8 ? "takeaway" : "delivery";
        const table = orderType === "dine-in" ? getRandomElement(tableNumbers) : "Takeaway";

        let customerDetails = { name: "Walk-in", phone: "", email: "", customerId: null };
        if (Math.random() < 0.7) {
          const customerData = getRandomElement(customerOrderHistory);
          customerData.orderCount++;
          customerDetails = { name: customerData.customer.fullname, phone: customerData.customer.phone, email: customerData.customer.email, customerId: customerData.customer._id };
        }

        // Build order items
        const numItems = getRandomInt(2, 6);
        const orderItems = [];
        let subtotal = 0;
        let addOnsTotal = 0;

        for (let j = 0; j < numItems; j++) {
          const category = getRandomElement(Object.keys(menuItemsByCategory));
          const itemsInCategory = menuItemsByCategory[category];
          if (!itemsInCategory?.length) continue;
          const menuItem = getRandomElement(itemsInCategory);
          const quantity = getRandomInt(1, 3);

          let itemAddOns = [];
          let itemAddOnsTotal = 0;
          if (menuItem.addOnGroups?.length > 0) {
            const numAddonGroups = getRandomInt(0, Math.min(2, menuItem.addOnGroups.length));
            const selectedGroups = getRandomElements(menuItem.addOnGroups, numAddonGroups);
            for (const groupId of selectedGroups) {
              const addonGroup = localAddonGroupMap.get(groupId.toString());
              if (!addonGroup?.items?.length) continue;
              const numSelections = addonGroup.selectionType === "single" ? 1 : getRandomInt(1, 2);
              const selectedItems = getRandomElements(addonGroup.items, numSelections);
              const groupAddOns = {
                groupId: groupId,
                groupName: addonGroup.name,
                selectedItems: selectedItems.map(item => ({ itemId: new mongoose.Types.ObjectId(), name: item.name, price: item.price, quantityUsed: 1, allergens: item.allergens || [], dietaryTags: item.dietaryTags || [] })),
                addOnSubtotal: selectedItems.reduce((sum, item) => sum + item.price, 0)
              };
              itemAddOns.push(groupAddOns);
              itemAddOnsTotal += groupAddOns.addOnSubtotal;
            }
          }

          const itemSubtotal = (menuItem.price * quantity) + (itemAddOnsTotal * quantity);
          subtotal += itemSubtotal;
          addOnsTotal += itemAddOnsTotal * quantity;

          orderItems.push({
            menuItemId: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity,
            itemNote: Math.random() < 0.2 ? getRandomElement(["Extra sauce on the side", "No onions", "Make it spicy", "Well done please"]) : "",
            addOns: itemAddOns,
            addOnsTotal: itemAddOnsTotal * quantity,
            subtotal: itemSubtotal,
            itemStatus: "completed",
            voidInfo: { isVoided: false }
          });

          // Accumulate inventory deductions
          const links = inventoryLinkMap.get(menuItem._id.toString()) || [];
          for (const link of links) {
            const current = inventoryDeductions.get(link.inventoryItemId.toString()) || 0;
            inventoryDeductions.set(link.inventoryItemId.toString(), current + (link.quantityUsed * quantity));
          }
        }

        const taxRate = org.brandSettings.taxSettings.globalRate;
        const taxAmount = (subtotal * taxRate) / 100;
        const serviceCharge = orderType === "dine-in" ? (subtotal * 0.18) : 0;
        const totalAmount = subtotal + taxAmount + serviceCharge;
        const paymentMethod = getRandomElement(["cash", "card", "Transfer"]);

        const order = {
          orderNumber: generateOrderNumber(),
          storeId: store._id,
          organizationId: org._id,
          table,
          customerDetails,
          orderType,
          orderItems,
          servedBy: getRandomElement(serverUsers)._id,
          orderNote: Math.random() < 0.1 ? "Special request" : "",
          totalAmount,
          addOnsTotal,
          taxBreakdown: { items: orderItems.map(item => ({ menuItemId: item.menuItemId, name: item.name, taxRate, taxAmount: (item.subtotal * taxRate) / 100 })), totalTax: taxAmount, serviceCharge, subtotal },
          discountBreakdown: { hasDiscount: false, originalSubtotal: subtotal, totalDiscountAmount: 0, discountedSubtotal: subtotal, appliedDiscounts: [], itemDiscounts: [] },
          packagingFee: orderType === "delivery" ? 2.00 : orderType === "takeaway" ? 1.00 : 0,
          deliveryFee: orderType === "delivery" ? 5.00 : 0,
          amountPaid: totalAmount,
          balance: 0,
          change: 0,
          payments: [{ method: paymentMethod, amount: totalAmount, timestamp: new Date(createdAt.getTime() + 5 * 60000) }],
          paymentMethod,
          paymentStatus: "paid",
          orderStatus: "completed",
          completedAt: new Date(createdAt.getTime() + 30 * 60000),
          lastAction: { action: "complete", performedBy: getRandomElement(cashierUsers)._id, createdAt: new Date(createdAt.getTime() + 30 * 60000) },
          createdAt,
          updatedAt: new Date(createdAt.getTime() + 30 * 60000)
        };
        ordersToInsert.push(order);
        totalOrders++;
      }
    }

    // Batch insert all orders
    if (ordersToInsert.length > 0) {
      await Order.insertMany(ordersToInsert);
    }

    // Batch update inventory
    const inventoryUpdates = [];
    for (const [invId, deductQty] of inventoryDeductions) {
      inventoryUpdates.push({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(invId) },
          update: { $inc: { currentStock: -deductQty } }
        }
      });
    }
    if (inventoryUpdates.length > 0) {
      await InventoryItem.bulkWrite(inventoryUpdates);
    }

    console.log(`  Created ${totalOrders} orders over 7 days (batch inserted)`);

    // STEP 16: Create Reservations
    console.log("\nStep 16: Creating Reservations...");
    let reservationCount = 0;
    // Past reservations (completed)
    for (let i = 0; i < 30; i++) {
      const resDate = addDays(now, -getRandomInt(1, 6));
      const customerData = getRandomElement(customerOrderHistory);
      await Reservation.create({
        tableId: getRandomElement(allTables)._id,
        storeId: store._id,
        customerName: customerData.customer.fullname,
        customerId: customerData.customer._id,
        customerPhone: customerData.customer.phone,
        customerEmail: customerData.customer.email,
        partySize: getRandomInt(2, 8),
        reservationDate: resDate,
        reservationTime: `${getRandomInt(17, 21)}:00`,
        duration: 120,
        status: "completed",
        notes: Math.random() < 0.3 ? getRandomElement(["Anniversary dinner", "Birthday celebration", "Business meeting"]) : "",
        createdBy: hostUser._id,
        orderId: null
      });
      reservationCount++;
    }
    // Upcoming reservations
    for (let i = 0; i < 15; i++) {
      const resDate = addDays(now, getRandomInt(0, 7));
      if (resDate < now) resDate.setHours(23, 59);
      const customerData = getRandomElement(customerOrderHistory);
      await Reservation.create({
        tableId: getRandomElement(allTables)._id,
        storeId: store._id,
        customerName: customerData.customer.fullname,
        customerId: customerData.customer._id,
        customerPhone: customerData.customer.phone,
        customerEmail: customerData.customer.email,
        partySize: getRandomInt(2, 10),
        reservationDate: resDate,
        reservationTime: `${getRandomInt(11, 21)}:${getRandomElement(["00", "30"])}`,
        duration: 120,
        status: resDate > now ? "confirmed" : "seated",
        notes: Math.random() < 0.3 ? getRandomElement(["High chair needed", "Window seat preferred", "Allergies noted"]) : "",
        createdBy: hostUser._id,
        orderId: null
      });
      reservationCount++;
    }
    console.log(`  Created ${reservationCount} reservations`);

    // STEP 17: Create Purchase Orders
    console.log("\nStep 17: Creating Purchase Orders...");
    const invItemsForPO = await InventoryItem.find({ storeId: store._id, category: { $in: ["Raw Materials", "Beverages"] } });
    for (let i = 0; i < 12; i++) {
      const items = getRandomElements(invItemsForPO, getRandomInt(3, 8));
      const orderItems = items.map(item => {
        const quantity = getRandomInt(item.minStockLevel * 2, item.minStockLevel * 5);
        return {
          inventoryItem: item._id,
          name: item.name,
          quantity,
          unit: item.unit,
          unitPrice: item.costPrice,
          subtotal: quantity * item.costPrice,
          receivedQuantity: 0
        };
      });
      const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      const poDate = addDays(now, -getRandomInt(1, 14));
      const status = Math.random() < 0.7 ? "received" : Math.random() < 0.5 ? "approved" : "pending";
      const poNumber = `PO${poDate.toISOString().slice(0, 10).replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`;
      const po = await PurchaseOrder.create({
        orderNumber: poNumber,
        storeId: store._id,
        organizationId: org._id,
        supplier: getRandomElement(createdSuppliers)._id,
        orderDate: poDate,
        expectedDeliveryDate: addDays(poDate, 2),
        actualDeliveryDate: status === "received" ? addDays(poDate, 2) : null,
        items: orderItems,
        totalAmount,
        status,
        paymentStatus: status === "received" ? "paid" : "unpaid",
        amountPaid: status === "received" ? totalAmount : 0,
        paymentMethod: status === "received" ? "transfer" : null,
        notes: Math.random() < 0.3 ? "Regular weekly order" : "",
        createdBy: managerUser._id
      });
      // If received, update inventory
      if (status === "received") {
        for (const item of orderItems) {
          const invItem = await InventoryItem.findById(item.inventoryItem);
          if (invItem) {
            invItem.currentStock += item.quantity;
            invItem.lastRestockDate = po.actualDeliveryDate;
            await invItem.save();
          }
        }
        po.items = po.items.map(item => ({ ...item, receivedQuantity: item.quantity }));
        await po.save();
      }
    }
    console.log(`  Created 12 purchase orders`);

    // STEP 18: Create Stock Adjustments
    console.log("\nStep 18: Creating Stock Adjustments...");
    const adjReasons = ["wastage", "damage", "correction", "stock_take"];
    const adjTypes = ["subtraction", "addition", "correction"];
    for (let i = 0; i < 8; i++) {
      const invItem = getRandomElement(invItemsForPO);
      const type = getRandomElement(adjTypes);
      const reason = getRandomElement(adjReasons);
      const quantity = getRandomInt(1, Math.min(10, Math.floor(invItem.currentStock * 0.1) + 1));
      const previousStock = invItem.currentStock;
      const newStock = type === "addition" ? previousStock + quantity : type === "subtraction" ? Math.max(0, previousStock - quantity) : previousStock;
      const adjDate = addDays(now, -getRandomInt(0, 7));
      const adjNumber = `ADJ${adjDate.toISOString().slice(0, 10).replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`;
      await StockAdjustment.create({
        adjustmentNumber: adjNumber,
        storeId: store._id,
        inventoryItem: invItem._id,
        type,
        reason,
        quantity,
        previousStock,
        newStock,
        notes: reason === "wastage" ? "Expired items discarded" : reason === "damage" ? "Spill during prep" : "Inventory count correction",
        performedBy: managerUser._id
      });
      invItem.currentStock = newStock;
      await invItem.save();
    }
    console.log(`  Created 8 stock adjustments`);

    // STEP 19: Create Expenses
    console.log("\nStep 19: Creating Expenses...");
    const expenseCategories = ["Utilities", "Rent", "Salaries", "Maintenance", "Miscellaneous", "Other"];
    const expenseDescriptions = {
      "Utilities": ["Electric bill", "Gas bill", "Water bill", "Internet service"],
      "Rent": ["Monthly location rent", "Equipment lease"],
      "Salaries": ["Staff wages", "Overtime pay", "Bonus payment"],
      "Maintenance": ["HVAC repair", "Kitchen equipment service", "Plumbing fix"],
      "Miscellaneous": ["Office supplies", "Staff training", "Marketing materials"],
      "Other": ["Insurance premium", "License renewal"]
    };
    for (let i = 0; i < 20; i++) {
      const category = getRandomElement(expenseCategories);
      const description = getRandomElement(expenseDescriptions[category]);
      const amount = category === "Rent" ? getRandomInt(3000, 5000) : category === "Salaries" ? getRandomInt(2000, 8000) : category === "Utilities" ? getRandomInt(200, 800) : getRandomInt(50, 500);
      await Expense.create({
        date: addDays(now, -getRandomInt(0, 30)),
        category,
        amount,
        description,
        paymentMethod: getRandomElement(["Bank Transfer", "Credit", "Cash"]),
        invoice: Math.random() < 0.7 ? `INV-${2024}${String(getRandomInt(1, 999)).padStart(3, "0")}` : "",
        storeId: store._id,
        organizationId: org._id,
        createdBy: managerUser._id
      });
    }
    console.log(`  Created 20 expense records`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("Demo Restaurant Seeding Complete!");
    console.log("=".repeat(60));
    console.log("\nRestaurant: Riverside Bistro");
    console.log("Location: 482 Waterfront Drive, Metro City");
    console.log("\n--- LOGIN CREDENTIALS ---");
    console.log(`Super Admin: admin@codeket.com / demo123 (platform management)`);
    console.log(`Owner:       owner@riversidebistro.com / demo123`);
    console.log(`Manager:     manager@riversidebistro.com / demo123`);
    console.log(`Cashier:     cashier@riversidebistro.com / demo123`);
    console.log(`Kitchen:     kitchen@riversidebistro.com / demo123`);
    console.log(`Server:      server1@riversidebistro.com / demo123`);
    console.log("\n--- DATA SUMMARY ---");
    console.log(`- Organization: ${org.name}`);
    console.log(`- Store: ${store.name}`);
    console.log(`- Staff: ${staffUsers.length + 1} users`);
    console.log(`- Floors: 3 (Main Dining, Bar, Patio)`);
    console.log(`- Tables: ${allTables.length}`);
    console.log(`- Suppliers: ${createdSuppliers.length}`);
    console.log(`- Inventory: ${Object.keys(inventoryMap).length} items`);
    console.log(`- Menu Items: ${masterMenuItems.length}`);
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Orders: ${totalOrders} (7 days history)`);
    console.log(`- Reservations: ${reservationCount}`);
    console.log(`- Purchase Orders: 12`);
    console.log(`- Expenses: 20`);
    console.log("\n" + "=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("Error seeding demo restaurant:", error);
    process.exit(1);
  }
};

seedDemoRestaurant();
