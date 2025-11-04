import { Store, Settings, UtensilsCrossed, PackagePlus } from "lucide-react";

export const initialSetupTour = {
  id: "initial-setup",
  title: "Welcome to Your Restaurant Management System! 🎉",
  description: "Let's get you set up in just a few minutes",
  order: 1, // Display order
  autoStart: true, // Auto-start for first-time users
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  steps: [
    {
      target: "body",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Store className="w-12 h-12 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Welcome Aboard! 🚀</h2>
              <p className="text-base-content/70">
                Let's set up your restaurant in 4 simple steps
              </p>
            </div>
          </div>
        </div>
      ),
      placement: "center",
      disableBeacon: true,
    },
    {
      target: '[href="/app/settings/general"]',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <h3 className="font-bold text-lg">Step 1: Restaurant Settings</h3>
          </div>
          <p>
            First, let's add your restaurant's basic information - name,
            address, contact details, and currency settings.
          </p>
          <div className="bg-base-200 p-3 rounded-lg text-sm">
            <strong>💡 Tip:</strong> You can always change these settings later
          </div>
        </div>
      ),
      placement: "right",
      spotlightClicks: true,
    },
    {
      target: '[href="/app/categories"]',
      content: (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Step 2: Create Categories</h3>
          <p>
            Organize your menu by creating categories like "Appetizers", "Main
            Courses", "Beverages", etc.
          </p>
          <div className="bg-info/10 p-3 rounded-lg text-sm">
            <strong>✨ Example:</strong> Pizza, Burgers, Drinks, Desserts
          </div>
        </div>
      ),
      placement: "right",
      spotlightClicks: true,
    },
    {
      target: '[href="/app/menu-items"]',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-primary" />
            <h3 className="font-bold text-lg">Step 3: Add Menu Items</h3>
          </div>
          <p>
            Add your delicious menu items with prices, descriptions, and
            preparation times.
          </p>
          <div className="bg-success/10 p-3 rounded-lg text-sm">
            <strong>🎯 Pro tip:</strong> Add item codes for faster order entry
          </div>
        </div>
      ),
      placement: "right",
      spotlightClicks: true,
    },
    {
      target: '[href="/app/orders/add-new"]',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-6 h-6 text-primary" />
            <h3 className="font-bold text-lg">Step 4: You're Ready! 🎊</h3>
          </div>
          <p>
            That's it! You can now start taking orders and managing your
            restaurant.
          </p>
          <div className="bg-primary/10 p-3 rounded-lg text-sm space-y-2">
            <p>
              <strong>Next steps:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Invite your team members</li>
              <li>Set up your Kitchen Display System (KDS)</li>
              <li>Explore analytics and reports</li>
            </ul>
          </div>
        </div>
      ),
      placement: "right",
    },
  ],
  locale: {
    skip: <strong>Skip Tour</strong>,
    next: "Next",
    back: "Back",
    last: "Get Started! 🚀",
  },
  styles: {
    options: {
      primaryColor: "hsl(var(--p))",
      zIndex: 10000,
    },
  },
};
