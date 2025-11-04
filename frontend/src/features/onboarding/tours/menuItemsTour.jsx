export const menuItemsTour = {
  id: "menu-items",
  title: "Managing Menu Items",
  description: "Learn how to add, edit, and organize your menu",
  order: 2,
  autoStart: false,
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  steps: [
    {
      target: ".btn-primary", // The "Add Menu Item" button
      content: (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Adding Menu Items</h3>
          <p>Click here to add a new item to your menu.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "body",
      content: (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Menu Item Features</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Set custom prices and cost prices</li>
            <li>Add preparation times for kitchen coordination</li>
            <li>Upload item images</li>
            <li>Toggle availability instantly</li>
            <li>Track item-wise analytics</li>
          </ul>
        </div>
      ),
      placement: "center",
    },
  ],
};
