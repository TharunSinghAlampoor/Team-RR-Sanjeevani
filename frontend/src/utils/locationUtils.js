// Utility to handle browser geolocation, Nominatim reverse geocoding & IP fallback for Android, iPhone, iPad, and PC

export const detectUserLocation = () => {
  return new Promise((resolve, reject) => {
    // Helper for IP-based Location Fallback (Works on PCs without GPS chips & denied permissions)
    const fallbackToIPLocation = async (originalErrorMsg) => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData && (ipData.city || ipData.region)) {
            resolve({
              formattedAddress: `${ipData.city || ''}, ${ipData.region || ''}, ${ipData.country_name || 'India'} - ${ipData.postal || ''}`,
              raw: {
                address: {
                  suburb: ipData.city || 'City Center',
                  city: ipData.city || 'Hyderabad',
                  state: ipData.region || 'Telangana',
                  postcode: ipData.postal || '500033'
                }
              },
              latitude: ipData.latitude,
              longitude: ipData.longitude,
              isFallback: true
            });
            return;
          }
        }
      } catch (e) {
        console.warn('IP location fallback error:', e);
      }
      reject(new Error(originalErrorMsg || 'Unable to detect location. Please enter manually.'));
    };

    if (!navigator.geolocation) {
      fallbackToIPLocation('Geolocation is not supported by your browser.');
      return;
    }

    // High Accuracy GPS detection (Optimized for Android & iPhone iOS)
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
          console.warn('Reverse geocoding error, using coordinates:', err);
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
        console.warn('GPS position error:', error.message);
        let msg = 'Unable to retrieve GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS signal unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'GPS request timed out.';
        }
        fallbackToIPLocation(msg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  });
};

export const getSavedAddress = () => {
  try {
    return sessionStorage.getItem('user_shipping_address') || '';
  } catch {
    return '';
  }
};

export const saveAddress = (address) => {
  try {
    if (address) {
      sessionStorage.setItem('user_shipping_address', address);
    }
  } catch (e) {
    console.error('Failed to save address:', e);
  }
};
