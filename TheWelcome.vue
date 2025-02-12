<template>
  <div>
    <button @click="getLocation" :disabled="locationLoading">
      {{ locationLoading ? 'Getting Location...' : 'Get My Location' }}
    </button>
    <div v-if="location">
      <p>Latitude: {{ location.latitude }}</p>
      <p>Longitude: {{ location.longitude }}</p>
    </div>
    <div v-if="cars.length > 0">
      <h2>Nearest Cars</h2>
      <ul>
        <li v-for="car in cars" :key="car._id">  {{ car.make }} {{ car.model }} ({{car.distance}} km)
        </li>
      </ul>
    </div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      location: null,
      locationLoading: false,
      error: null,
      cars: [], 
    };
  },
  methods: {
    getLocation() {
      this.locationLoading = true;
      this.error = null; // Clear any previous errors

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          this.handleLocationSuccess,
          this.handleLocationError
        );
      } else {
        this.error = "Geolocation is not supported by this browser.";
        this.locationLoading = false;
      }
    },
    handleLocationSuccess(position) {
      this.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      this.locationLoading = false;
      this.sendLocationToBackend(); 
    },
    
    handleLocationError(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          this.error = "User denied the request for Geolocation.";
          break;
        case error.POSITION_UNAVAILABLE:
          this.error = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          this.error = "The request to get user location timed out.";
          break;
        case error.UNKNOWN_ERROR:
          this.error = "An unknown error occurred.";
          break;
      }
      this.locationLoading = false;
    },
    async sendLocationToBackend() {
      try {
        const response = await fetch('http://localhost:8080/api/nearestCars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.location),
        });

        if (response.ok) {
          const data = await response.json();
          this.cars = data.cars; // Assign data.cars to this.cars
          this.error = null; // Clear any previous errors

        } else {
          const errorData = await response.json();
          this.error = errorData.error || 'Error getting nearest cars.';
          console.error("Backend error:", errorData);
          this.cars = []; // Clear cars on error
        }
      } catch (err) {
        this.error = 'Error sending location to backend.';
        console.error("Fetch error:", err);
        this.cars = []; // Clear cars on error
      }
    },
  },
};
</script>