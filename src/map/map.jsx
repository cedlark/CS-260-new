import React, { useEffect, useRef } from "react";

export function Map() {
  const mapRef = useRef(null);

  useEffect(() => {
    async function loadGoogleMaps() {
      // If script already loaded, return early
      if (window.google && window.google.maps) return;

      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }&v=weekly&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    }

    async function initMap() {
      // ✅ Wait for Google Maps to load before importing libraries
      await loadGoogleMaps();

      const { Map } = await google.maps.importLibrary("maps");
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
      const { Place } = await google.maps.importLibrary("places");

      if (!navigator.geolocation) {
        alert("Geolocation not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // create map centered on user
        const map = new Map(mapRef.current, {
          center: userLocation,
          zoom: 14,
          mapId: "taco-map",
        });

        // marker for user
        new AdvancedMarkerElement({
          map,
          position: userLocation,
          title: "You are here!",
        });

        // ✅ Use the modern Place API
        const request = {
          textQuery: "taco shop",
          fields: ["displayName", "location", "formattedAddress", "rating"],
          locationBias: { center: userLocation, radius: 3000 },
        };

        try {
          const { places } = await Place.searchByText(request);
          if (places && places.length > 0) {
            for (const place of places) {
              new AdvancedMarkerElement({
                map,
                position: place.location,
                title: place.displayName,
              });
            }
          } else {
            alert("No taco shops found nearby 😢");
          }
        } catch (err) {
          console.error("Place search failed:", err);
        }
      });
    }

    initMap();
  }, []);

  return (
    <main className="container-fluid text-center">
      <h2>Find Taco Shops Near You!</h2>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "70vh",
          borderRadius: "10px",
          marginTop: "10px",
        }}
      ></div>
    </main>
  );
}
