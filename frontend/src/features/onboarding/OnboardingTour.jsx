import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import {
  fetchOnboardingProgress,
  completeTour,
  skipTour,
  updateStepProgress,
  startTour,
  stopTour,
  setStepIndex,
} from "./onboardingSlice";
import { getTourById, shouldShowTour } from "./tours/index";
import { Sparkles } from "lucide-react";

const OnboardingTour = ({ tourId }) => {
  const dispatch = useDispatch();
  const { progress, isRunning, stepIndex, activeTourId } = useSelector(
    (state) => state.onboarding
  );
  const [run, setRun] = useState(false);

  // Fetch progress on mount
  useEffect(() => {
    dispatch(fetchOnboardingProgress());
  }, [dispatch]);

  // Check if we should show the tour
  useEffect(() => {
    if (progress && tourId) {
      const shouldShow = shouldShowTour(tourId, progress);
      if (shouldShow && !isRunning) {
        // Delay to ensure DOM is ready
        setTimeout(() => {
          dispatch(startTour(tourId));
          setRun(true);
        }, 500);
      }
    }
  }, [progress, tourId, dispatch, isRunning]);

  // Update run state when Redux state changes
  useEffect(() => {
    setRun(isRunning && activeTourId === tourId);
  }, [isRunning, activeTourId, tourId]);

  const handleJoyrideCallback = useCallback(
    (data) => {
      const { action, index, status, type, lifecycle } = data;

      const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
      const tour = getTourById(tourId);

      if (!tour) return;

      // Update step index
      if (type === EVENTS.STEP_AFTER && lifecycle === "complete") {
        const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
        dispatch(setStepIndex(nextIndex));

        // Track step completion
        const step = tour.steps[index];
        if (step && action !== ACTIONS.PREV) {
          dispatch(
            updateStepProgress({
              tourId,
              stepId: `step-${index}`,
            })
          );
        }
      }

      // Handle tour completion/skip
      if (finishedStatuses.includes(status)) {
        setRun(false);
        dispatch(stopTour());

        if (status === STATUS.FINISHED) {
          dispatch(completeTour(tourId));
        } else if (status === STATUS.SKIPPED) {
          dispatch(skipTour(tourId));
        }
      }
    },
    [dispatch, tourId]
  );

  const tour = getTourById(tourId);

  if (!tour || !run) return null;

  return (
    <Joyride
      steps={tour.steps}
      run={run}
      continuous={tour.continuous}
      showProgress={tour.showProgress}
      showSkipButton={tour.showSkipButton}
      stepIndex={stepIndex}
      callback={handleJoyrideCallback}
      locale={tour.locale}
      styles={{
        options: {
          ...tour.styles?.options,
          primaryColor: "hsl(var(--p))",
          textColor: "hsl(var(--bc))",
          backgroundColor: "#ffffff", // ✅ Solid white fallback
          arrowColor: "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "1rem",
          padding: "1.5rem",
          backgroundColor: "#ffffff", // ✅ Solid background
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)", // Add shadow for better visibility
        },
        tooltipContent: {
          padding: "0.5rem 0",
        },
        buttonNext: {
          backgroundColor: "#000000",
          borderRadius: "0.5rem",
          padding: "0.5rem 1.5rem",
        },
        buttonBack: {
          color: "hsl(var(--bc))",
          marginRight: "0.5rem",
        },
        buttonSkip: {
          color: "hsl(var(--bc) / 0.7)",
        },
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          arrow: {
            length: 8,
            spread: 16,
          },
        },
      }}
    />
  );
};

export default OnboardingTour;
