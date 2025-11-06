import React, { useEffect, useRef } from 'react';

export function Map() {
  const mapRef = useRef(null);

  useEffect(() => {
    // Load Google Maps script dynamically
    const existingScript = document.getElementById('googleMapsScript');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'googleMapsScript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  function initMap() {
    // Ensure browser supports geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Create map centered on user
          const map = new window.google.maps.Map(mapRef.current, {
            center: userLocation,
            zoom: 14,
          });

          // Marker for user
          new window.google.maps.Marker({
            position: userLocation,
            map,
            title: 'You are here!',
          });

          // Search for nearby taco shops
          const service = new window.google.maps.places.PlacesService(map);
          const request = {
            location: userLocation,
            radius: '3000', // meters
            keyword: 'taco',
          };

          service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              results.forEach((place) => {
                new window.google.maps.Marker({
                  map,
                  position: place.geometry.location,
                  title: place.name,
                });
              });
            }
          });
        },
        () => alert('Unable to get your location 😢')
      );
    } else {
      alert('Geolocation not supported by this browser.');
    }
  }

  return (
    <main className="container-fluid text-center">
      <h2>Find Taco Shops Near You!</h2>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '70vh',
          borderRadius: '10px',
          marginTop: '10px',
        }}
      ></div>
    </main>
  );
}
