// frontend/src/features/orders/mobile/MenuTab.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, X, Heart, Clock, Star, Plus, ChevronRight, Utensils, AlertTriangle, Search as SearchIcon } from "lucide-react";
import { useHaptic } from "../../../hooks/useHaptic";
import { useLongPress } from "../../../hooks/useLongPress";
import { fetchAllMenuItems } from "../../menuItems/menuItemsSlice";
import { fetchAllCategories } from "../../categories/categoriesSlice";
import { addToCart } from "../posSlice";
import {
  addToSearchHistory,
  toggleFavoriteItem,
  setActiveSheet,
} from "../mobilePOSSlice";
import { openModal } from "../../common/modalSlice";
import { MODAL_BODY_TYPES } from "../../../utils/globalConstantUtil";
import { BottomSheet } from "../../../components/Mobile";
import { DIETARY_TAG_STYLES } from "../../../utils/dietaryConstants";

const MenuItemCard = ({
  item,
  isFavorite,
  currency,
  onAddToCart,
  onToggleFavorite,
  onLongPress,
}) => {
  const haptic = useHaptic();

  const longPressHandlers = useLongPress(
    () => {
      haptic.heavy();
      onLongPress(item);
    },
    {
      threshold: 500,
      onClick: () => onAddToCart(item),
    },
  );

  const hasAddOns = item.addOnGroups && item.addOnGroups.length > 0;

  return (
    <div
      {...longPressHandlers}
      className="bg-base-100 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md active:scale-95 transition-all relative"
    >
      {/* Favorite Button */}
      <button
        onClick={(e) => onToggleFavorite(item._id, e)}
        className="absolute top-2 right-2 z-10 btn btn-circle btn-xs bg-base-100/80 backdrop-blur-sm border-none"
      >
        <Heart
          size={14}
          className={isFavorite ? "fill-error text-error" : ""}
        />
      </button>

      {/* Image */}
      <div className="h-24 w-full bg-base-200 flex items-center justify-center">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Utensils className="w-10 h-10 opacity-30" />
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        <h3 className="font-semibold text-xs line-clamp-2 mb-1">{item.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-primary font-bold text-xs">
            {currency}
            {item.price.toFixed(2)}
          </span>
          <div className="flex items-center gap-1">
            {hasAddOns && (
              <span className="badge badge-secondary badge-xs">+</span>
            )}
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Plus size={12} className="text-white" />
            </div>
          </div>
        </div>
        
        {/* Dietary Indicators */}
        {(item.dietaryTags?.length > 0 || item.allergens?.length > 0) && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {item.dietaryTags?.slice(0, 3).map(tag => {
              const style = DIETARY_TAG_STYLES[tag];
              if (!style || !style.icon) return null;
              return (
                <span key={tag} className="text-[10px]" title={tag}>{style.icon}</span>
              )
            })}
            {item.allergens?.length > 0 && (
              <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0" title="Contains Allergens" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Menu Tab - Mobile optimized menu browsing
 * Features: Search, categories, favorites, quick add
 */
const MenuTab = () => {
  const dispatch = useDispatch();
  const haptic = useHaptic();

  // Redux state
  const menuItems = useSelector((state) => state.menuItems.menuItems);
  const categories = useSelector((state) => state.categories.categories);
  const settings = useSelector(
    (state) => state.generalSettings.generalSettings,
  );
  const { favoriteItems, searchHistory } = useSelector(
    (state) => state.mobilePOS,
  );

  const currency = settings?.currency?.symbol || "$";

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [dietaryFilter, setDietaryFilter] = useState("All");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // Sheet state
  const [quickActionItem, setQuickActionItem] = useState(null);

  // Load data
  useEffect(() => {
    dispatch(fetchAllMenuItems());
    dispatch(fetchAllCategories());
  }, [dispatch]);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    
    let matchesDietary = true;
    if (dietaryFilter !== "All") {
      if (dietaryFilter === "Allergen-Free") {
        matchesDietary = !item.allergens || item.allergens.length === 0;
      } else {
        matchesDietary = item.dietaryTags?.includes(dietaryFilter);
      }
    }

    const isAvailable = item.isAvailable;

    return matchesSearch && matchesCategory && matchesDietary && isAvailable;
  });

  // Favorite items
  const favoriteItemsList = menuItems.filter((item) =>
    favoriteItems.includes(item._id),
  );

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    if (value.length > 0) {
      setShowSearchSuggestions(true);
    } else {
      setShowSearchSuggestions(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      dispatch(addToSearchHistory(searchQuery));
      setShowSearchSuggestions(false);
    }
  };

  const handleSearchHistoryClick = (query) => {
    setSearchQuery(query);
    setShowSearchSuggestions(false);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    haptic.light();
    setActiveCategory(category);
  };

  // Handle add to cart
  const handleAddToCart = (item) => {
    haptic.medium();

    if (item.addOnGroups && item.addOnGroups.length > 0) {
      dispatch(
        openModal({
          title: `Customize ${item.name}`,
          bodyType: MODAL_BODY_TYPES.ADD_ON_SELECTOR,
          extraObject: {
            menuItem: item,
            onConfirm: (addOnData) => {
              dispatch(addToCart({ item, addOnData }));
            },
          },
          size: "lg",
        }),
      );
    } else {
      // Add directly
      dispatch(
        addToCart({
          item,
          addOnData: { addOns: [], itemNote: "", total: item.price },
        }),
      );
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = (itemId, e) => {
    if (e) e.stopPropagation();
    haptic.light();
    dispatch(toggleFavoriteItem(itemId));
  };

  const handleLongPress = (item) => {
    setQuickActionItem(item);
  };

  return (
    <div className="h-full flex flex-col bg-base-200">
      {/* Search Bar */}
      <div className="bg-base-100 p-4 shadow-sm sticky top-0 z-10">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            onFocus={() => searchQuery && setShowSearchSuggestions(true)}
            placeholder="Search menu items..."
            className="input input-bordered w-full pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSearchSuggestions(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X size={20} className="text-base-content/50" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSearchSuggestions && searchHistory.length > 0 && (
          <div className="mt-2 bg-base-200 rounded-lg p-2">
            <div className="text-xs text-base-content/60 mb-2 flex items-center gap-1">
              <Clock size={12} />
              Recent Searches
            </div>
            {searchHistory.slice(0, 5).map((query, index) => (
              <button
                key={index}
                onClick={() => handleSearchHistoryClick(query)}
                className="block w-full text-left px-3 py-2 hover:bg-base-300 rounded text-sm"
              >
                {query}
              </button>
            ))}
          </div>
        )}

        {/* Dietary Filters */}
        <div className="mt-3 relative">
          <div
            className="flex overflow-x-auto gap-2 pb-1 pr-8 scrollbar-thin"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { haptic.light(); setDietaryFilter("All"); }}
              className={`btn btn-xs rounded-full ${dietaryFilter === "All" ? "btn-primary" : "btn-outline border-base-300"}`}
            >
              All Diets
            </button>
            <button
              onClick={() => { haptic.light(); setDietaryFilter("Allergen-Free"); }}
              className={`btn btn-xs rounded-full ${dietaryFilter === "Allergen-Free" ? "btn-success" : "btn-outline border-base-300"}`}
            >
              Allergen-Free
            </button>
            {Object.keys(DIETARY_TAG_STYLES).map(tag => (
              <button
                key={tag}
                onClick={() => { haptic.light(); setDietaryFilter(tag); }}
                className={`btn btn-xs rounded-full ${dietaryFilter === tag ? "btn-secondary" : "btn-outline border-base-300"}`}
              >
                {DIETARY_TAG_STYLES[tag].icon} {tag}
              </button>
            ))}
          </div>
          {/* Scroll indicator */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center">
            <div className="bg-gradient-to-l from-base-100 via-base-100/80 to-transparent pl-6 pr-1 py-1 flex items-center">
              <ChevronRight size={16} className="text-base-content/40 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-base-100 px-4 py-3 shadow-sm relative">
        <div
          className="flex gap-2 overflow-x-auto snap-scroll pr-8 pb-1 scrollbar-thin"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleCategoryChange("All")}
            className={`btn btn-sm flex-shrink-0 ${
              activeCategory === "All" ? "btn-primary" : "btn-outline"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryChange(category.name)}
              className={`btn btn-sm flex-shrink-0 ${
                activeCategory === category.name ? "btn-primary" : "btn-outline"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        {/* Scroll indicator */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none">
          <div className="bg-gradient-to-l from-base-100 via-base-100/90 to-transparent pl-8 pr-2 py-2 flex items-center">
            <ChevronRight size={18} className="text-base-content/40 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      {favoriteItemsList.length > 0 &&
        activeCategory === "All" &&
        !searchQuery && (
          <div className="bg-base-100 p-4 mb-2">
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="text-warning fill-warning" />
              <h3 className="font-semibold">Favorites</h3>
            </div>
            <div
              className="flex gap-3 overflow-x-auto snap-scroll pb-2 scrollbar-thin"
              onTouchStart={(e) => e.stopPropagation()}
            >
              {favoriteItemsList.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleAddToCart(item)}
                  className="flex-shrink-0 w-24 bg-base-200 rounded-lg p-2 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="aspect-square bg-base-300 rounded-lg mb-2 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Utensils className="w-8 h-8 opacity-30" />
                    )}
                  </div>
                  <div className="text-xs font-medium line-clamp-1">
                    {item.name}
                  </div>
                  <div className="text-primary font-bold text-xs">
                    {currency}
                    {item.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Menu Items Grid */}
      <div className="flex-1 overflow-y-auto p-3 pb-20">
        <div className="grid grid-cols-3 gap-2">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              isFavorite={favoriteItems.includes(item._id)}
              currency={currency}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              onLongPress={handleLongPress}
            />
          ))}
        </div>
        {/* End of list indicator */}
        {filteredItems.length > 0 && (
          <div className="text-center py-6 text-base-content/30">
            <div className="flex items-center justify-center gap-2 text-xs">
              <span>End of menu</span>
              <span className="w-8 h-px bg-base-content/20"></span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-base-content/50">
            <SearchIcon className="w-16 h-16 mb-4 text-base-content/30" />
            <p className="text-lg font-medium">No items found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Quick Action Sheet */}
      <BottomSheet
        isOpen={!!quickActionItem}
        onClose={() => setQuickActionItem(null)}
        title="Quick Actions"
        snapPoints={[0.4]}
      >
        {quickActionItem && (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-base-200 rounded-lg overflow-hidden">
                {quickActionItem.image ? (
                  <img
                    src={quickActionItem.image}
                    alt={quickActionItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Utensils className="w-6 h-6 opacity-30" />
                )}
              </div>
              <div>
                <h3 className="font-bold">{quickActionItem.name}</h3>
                <p className="text-primary font-medium">
                  {currency}
                  {quickActionItem.price.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                handleToggleFavorite(quickActionItem._id);
                setQuickActionItem(null);
              }}
              className="btn btn-outline w-full gap-2 justify-start"
            >
              <Heart
                className={
                  favoriteItems.includes(quickActionItem._id)
                    ? "fill-error text-error"
                    : ""
                }
              />
              {favoriteItems.includes(quickActionItem._id)
                ? "Remove from Favorites"
                : "Add to Favorites"}
            </button>

            <button
              onClick={() => {
                handleAddToCart(quickActionItem);
                setQuickActionItem(null);
              }}
              className="btn btn-primary w-full gap-2 justify-start"
            >
              <X className="rotate-45" /> {/* Plus icon rotated */}
              Add to Cart
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default MenuTab;
