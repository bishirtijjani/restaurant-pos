# Mobile POS Integration Guide

**Quick Start:** Get the mobile POS running in 3 steps

---

## Step 1: Add Redux Reducer

**File:** `frontend/src/app/store.js`

Find the `configureStore` function and add the `mobilePOS` reducer:

```javascript
import mobilePOSReducer from "../features/orders/mobilePOSSlice";

export const store = configureStore({
  reducer: {
    // Existing reducers...
    auth: authReducer,
    pos: posReducer,
    menuItems: menuItemsReducer,
    // ... other reducers ...

    // ADD THIS LINE:
    mobilePOS: mobilePOSReducer,
  },
});
```

---

## Step 2: Import Mobile Styles

**File:** `frontend/src/index.css` (or main CSS file)

Add this import at the top:

```css
@import "./styles/mobile.css";
```

**OR** in `frontend/src/App.jsx`:

```javascript
import "./styles/mobile.css";
```

---

## Step 3: Update POS Route

**Option A: Replace Existing POS (Recommended)**

**File:** `frontend/src/pages/protected/POS.jsx`

```javascript
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import MobilePOS from "../../features/orders/MobilePOS";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Point of Sale" }));
  }, [dispatch]);

  return <MobilePOS />;
}

export default InternalPage;
```

**Option B: Add as New Route**

**File:** `frontend/src/routes/index.js` (or routes file)

```javascript
import MobilePOS from '../features/orders/MobilePOS';

// Add to routes array:
{
  path: '/app/mobile-pos',
  element: <MobilePOS />,
}
```

---

## That's It! 🎉

### Test It:

1. **Desktop (≥1024px):**

   - Navigate to `/app/pos`
   - Should show the **existing desktop POS**

2. **Mobile/Tablet (<1024px):**

   - Navigate to `/app/pos`
   - Should show the **new mobile POS** with tabs

3. **Test Gestures:**
   - Swipe left/right to change tabs
   - Swipe left on cart items to delete
   - Tap heart icon to favorite items

---

## Troubleshooting

### Issue: "mobilePOS is undefined"

**Solution:** Make sure you added the reducer to the store (Step 1)

### Issue: Styles not applying

**Solution:** Import mobile.css (Step 2)

### Issue: Desktop shows mobile UI

**Solution:** Check browser width is ≥1024px

### Issue: Mobile shows desktop UI

**Solution:** Check browser width is <1024px, or clear cache

---

## Mobile Testing

### On Real Device:

1. Find your computer's IP address:

   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. Open on mobile browser:

   ```
   http://[YOUR-IP]:5173/app/pos
   ```

3. Test all features:
   - [ ] Tab navigation
   - [ ] Search
   - [ ] Add to cart
   - [ ] Swipe gestures
   - [ ] Haptic feedback (if supported)
   - [ ] Payment flow

---

## Next Steps

After integration:

1. **Test thoroughly** on multiple devices
2. **Gather feedback** from users
3. **Fix any bugs** that arise
4. **Proceed to Phase 3** for advanced features

---

**Need help? Check the complete documentation in `.gemini/mobile-pos-phase2-complete.md`**
