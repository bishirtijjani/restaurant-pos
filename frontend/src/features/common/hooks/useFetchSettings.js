import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSettings,
  selectSettings,
  selectSettingsLoading,
} from "../../settings/generalSettings/generalSettingsSlice";

export function useFetchSettings() {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  const loading = useSelector(selectSettingsLoading);

  useEffect(() => {
    // fetch only when there are no settings present (or empty)
    if (!settings || Object.keys(settings).length === 0) {
      dispatch(fetchSettings());
    }
  }, [settings, dispatch]);

  return { settings, loading };
}
