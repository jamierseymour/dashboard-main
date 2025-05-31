// composables/useGoogleMaps.ts
export const useGoogleMaps = () => {
  const isLoaded = ref(false);
  const isLoading = ref(false);

  const loadGoogleMaps = async (apiKey: string) => {
    if (isLoaded.value) return Promise.resolve();
    if (isLoading.value) return waitForLoad();

    isLoading.value = true;

    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.maps) {
        isLoaded.value = true;
        isLoading.value = false;
        resolve(undefined);
        return;
      }

      // Create script tag for new Places API
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        isLoaded.value = true;
        isLoading.value = false;
        resolve(undefined);
      };

      script.onerror = () => {
        isLoading.value = false;
        reject(new Error("Failed to load Google Maps API"));
      };

      document.head.appendChild(script);
    });
  };

  const waitForLoad = () => {
    return new Promise((resolve) => {
      const checkLoaded = () => {
        if (isLoaded.value) {
          resolve(undefined);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
    });
  };

  return {
    isLoaded: readonly(isLoaded),
    isLoading: readonly(isLoading),
    loadGoogleMaps,
  };
};

// composables/useGooglePlaces.ts (Updated for PlaceAutocompleteElement)
export const useGooglePlaces = () => {
  const { loadGoogleMaps } = useGoogleMaps();

  const initializePlaceAutocomplete = async (apiKey: string) => {
    await loadGoogleMaps(apiKey);

    // No additional initialization needed for PlaceAutocompleteElement
    // The web component handles everything internally
    return true;
  };

  // Helper function to convert new API format to legacy format
  const convertPlaceData = (newPlace: any) => {
    return {
      // New API properties
      id: newPlace.id,
      displayName: newPlace.displayName,
      formattedAddress: newPlace.formattedAddress,
      location: newPlace.location,
      addressComponents: newPlace.addressComponents,

      // Legacy format for backward compatibility
      place_id: newPlace.id,
      name: newPlace.displayName,
      formatted_address: newPlace.formattedAddress,
      geometry: {
        location: {
          lat: () => newPlace.location?.lat || 0,
          lng: () => newPlace.location?.lng || 0,
        },
      },
      address_components:
        newPlace.addressComponents?.map((component: any) => ({
          long_name: component.longText,
          short_name: component.shortText,
          types: component.types,
        })) || [],
    };
  };

  return {
    initializePlaceAutocomplete,
    convertPlaceData,
  };
};
