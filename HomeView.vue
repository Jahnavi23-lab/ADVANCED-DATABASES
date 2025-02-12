<template>
  <div class="container">
    <h1>Add Car</h1>
    <form @submit.prevent="addCar" class="needs-validation" novalidate>
      <div class="form-group">
        <label for="make">Make:</label>
        <input type="text" id="make" v-model="car.make" class="form-control" required>
        <div class="invalid-feedback">Please enter the car make.</div>
      </div>
      <div class="form-group">
        <label for="model">Model:</label>
        <input type="text" id="model" v-model="car.model" class="form-control" required>
        <div class="invalid-feedback">Please enter the car model.</div>
      </div>
      <div class="form-group">
        <label for="type">Type:</label>
        <input type="text" id="type" v-model="car.type" class="form-control" required>
        <div class="invalid-feedback">Please enter the car type.</div>
      </div>

      <div class="form-group">
        <label for="longitude">Longitude:</label>
        <input type="number" id="longitude" v-model="car.longitude" class="form-control" required>
        <div class="invalid-feedback">Please enter the longitude.</div>
      </div>

      <div class="form-group">
        <label for="latitude">Latitude:</label>
        <input type="number" id="latitude" v-model="car.latitude" class="form-control" required>
        <div class="invalid-feedback">Please enter the latitude.</div>
      </div>

      <button type="submit" class="btn btn-primary">Add Car</button>
      <div v-if="successMessage" class="alert alert-success mt-2">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-danger mt-2">{{ errorMessage }}</div>
    </form>
  <HelloWorld/>
  <TheWelcome/>
  </div>
</template>

<script>
import HelloWorld from '../components/HelloWorld.vue'
import TheWelcome from '../components/TheWelcome.vue'

export default {
  data() {
    return {
      car: {
        make: '',
        model: '',
        type: '',
        longitude: null,
        latitude: null,
      },
      successMessage: null,
      errorMessage: null,
    };
  
  },
  components:{
      HelloWorld,TheWelcome
    },
  methods: {
    
    async addCar() {
      try {
        const response = await fetch('http://localhost:8080/admin/addCar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...this.car, // Spread the car object
            longitude: parseFloat(this.car.longitude), // Ensure numbers
            latitude: parseFloat(this.car.latitude),
            location: { type: 'Point', coordinates: [parseFloat(this.car.longitude), parseFloat(this.car.latitude)] } // Include location object

          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Car added:', data);
          this.successMessage = 'Car added successfully!';
          this.errorMessage = null;
          this.car = { make: '', model: '', type: '', longitude: null, latitude: null }; // Reset
        } else {
          const errorData = await response.json();
          this.errorMessage = errorData.error || 'Failed to add car.';
          this.successMessage = null;
          console.error('Error adding car:', errorData);
        }
      } catch (error) {
        console.error('Error adding car:', error);
        this.errorMessage = 'An error occurred. Please try again later.';
        this.successMessage = null;
      }
    },
  },
};
</script>

<style scoped>
.container {
  margin-top: 20px; /* Add some top margin to the container */
}
</style>