import { initialSetupTour } from "./initialSetupTour";
import { menuItemsTour } from "./menuItemsTour";

// Registry of all tours
export const TOURS = {
  "initial-setup": initialSetupTour,
  "menu-items": menuItemsTour,
};

// Helper to get tour by ID
export const getTourById = (tourId) => TOURS[tourId];

// Helper to check if user should see a tour
export const shouldShowTour = (tourId, progress) => {
  if (!progress) return false;

  // Check if tour was completed
  const isCompleted = progress.completedTours?.some((t) => t.tourId === tourId);
  if (isCompleted) return false;

  // Check if tour was skipped
  const isSkipped = progress.skippedTours?.some((t) => t.tourId === tourId);
  if (isSkipped) return false;

  return true;
};
