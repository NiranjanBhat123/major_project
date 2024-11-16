// locationHandler.js
export const handleLocationAccess = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
  
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Get detailed address using reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );
            const data = await response.json();
  
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: data.display_name,
              timestamp: new Date().toISOString()
            };
  
            // Store in localStorage
            localStorage.setItem('userLocation', JSON.stringify(locationData));
            resolve(locationData);
          } catch (error) {
            reject(new Error('Failed to get address details'));
          }
        },
        (error) => {
          reject(new Error('Failed to get location: ' + error.message));
        }
      );
    });
  };
  
  export const requestAndStoreLocation = async (onSuccess, onError) => {
    try {
      const locationData = await handleLocationAccess();
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      if (onError) onError(error.message);
      return false;
    }
  };