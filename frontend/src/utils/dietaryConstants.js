// frontend/src/utils/dietaryConstants.js

export const ALLERGENS = [
  "Celery",
  "Cereals containing gluten",
  "Crustaceans",
  "Eggs",
  "Fish",
  "Lupin",
  "Milk",
  "Molluscs",
  "Mustard",
  "Peanuts",
  "Sesame",
  "Soybeans",
  "Sulphur dioxide and sulphites",
  "Tree nuts",
];

export const DIETARY_TAGS = [
  "Halal",
  "Kosher",
  "Vegan",
  "Vegetarian",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Spicy",
];

// Helper mapping for icons or short labels if needed in the UI
export const DIETARY_TAG_STYLES = {
  "Halal": { icon: "H", color: "bg-green-100 text-green-800 border-green-200" },
  "Kosher": { icon: "K", color: "bg-blue-100 text-blue-800 border-blue-200" },
  "Vegan": { icon: "V", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  "Vegetarian": { icon: "VG", color: "bg-lime-100 text-lime-800 border-lime-200" },
  "Gluten-Free": { icon: "GF", color: "bg-amber-100 text-amber-800 border-amber-200" },
  "Dairy-Free": { icon: "DF", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  "Nut-Free": { icon: "NF", color: "bg-teal-100 text-teal-800 border-teal-200" },
  "Spicy": { icon: "🌶️", color: "bg-red-100 text-red-800 border-red-200" },
};
