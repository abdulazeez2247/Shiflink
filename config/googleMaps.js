const axios = require('axios');

const googleMapsClient = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api',
  timeout: 5000
});

const geocodeAddress = async (address) => {
  const response = await googleMapsClient.get('/geocode/json', {
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  });

  if (response.data.status !== 'OK') {
    throw new Error(`Google Maps API error: ${response.data.status}`);
  }

  return response.data.results[0];
};

module.exports = {
  geocodeAddress
};
