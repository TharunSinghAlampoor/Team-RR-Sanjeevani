// Utility to handle browser geolocation and reverse geocoding

export const detectUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocode via OpenStreetMap Nominatim free API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          if (!response.ok) {
            throw new Error('Failed to retrieve address details from coordinates.');
          }
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            const parts = [
              addr.building || addr.house_number || addr.amenity || addr.office,
              addr.road || addr.street || addr.pedestrian || addr.suburb || addr.neighbourhood,
              addr.city_district || addr.suburb || addr.residential,
              addr.city || addr.town || addr.village || addr.county,
              addr.state || addr.region,
              addr.postcode ? `- ${addr.postcode}` : '',
            ].filter(Boolean);

            const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name;
            resolve({
              formattedAddress,
              raw: data,
              latitude,
              longitude
            });
          } else if (data && data.display_name) {
            resolve({
              formattedAddress: data.display_name,
              raw: data,
              latitude,
              longitude
            });
          } else {
            resolve({
              formattedAddress: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
              latitude,
              longitude
            });
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          // Fallback to coordinates string
          const lat = position.coords.latitude.toFixed(4);
          const lon = position.coords.longitude.toFixed(4);
          resolve({
            formattedAddress: `Location Pin (${lat}, ${lon})`,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please allow location access or type your address manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
};

export const getSavedAddress = () => {
  try {
    return localStorage.getItem('user_shipping_address') || '';
  } catch {
    return '';
  }
};

export const saveAddress = (address) => {
  try {
    if (address) {
      localStorage.setItem('user_shipping_address', address);
    }
  } catch (e) {
    console.error('Failed to save address to localStorage:', e);
  }
};
