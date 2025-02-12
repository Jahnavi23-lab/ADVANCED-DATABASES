<template>
  <div class="container">
    <h1>Add Charging Station</h1>
    <form @submit.prevent="addChargingStation" class="needs-validation" novalidate>
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="station.name" class="form-control" required>
        <div class="invalid-feedback">Please enter the charging station name.</div>
      </div>

      <div class="form-group">
        <label for="longitude">Longitude:</label>
        <input type="number" id="longitude" v-model="station.longitude" class="form-control" required>
        <div class="invalid-feedback">Please enter the longitude.</div>
      </div>

      <div class="form-group">
        <label for="latitude">Latitude:</label>
        <input type="number" id="latitude" v-model="station.latitude" class="form-control" required>
        <div class="invalid-feedback">Please enter the latitude.</div>
      </div>

      <button type="submit" class="btn btn-primary">Add Charging Station</button>
      <div v-if="successMessage" class="alert alert-success mt-2">{{ successMessage }}</div>
      <div v-if="errorMessage" class="alert alert-danger mt-2">{{ errorMessage }}</div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      station: {
        name: '',
        longitude: null,
        latitude: null,
      },
      successMessage: null,
      errorMessage: null,
    };
  },
  methods: {
    async addChargingStation() {
      const form = document.querySelector('.needs-validation');

      try {
        const response = await fetch('http://localhost:8080/admin/addChargingStation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...this.station,
            longitude: parseFloat(this.station.longitude),
            latitude: parseFloat(this.station.latitude),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Charging station added:', data);
          this.successMessage = 'Charging station added successfully!';
          this.errorMessage = null;
          this.station = { name: '', longitude: null, latitude: null };
        } else {
          const errorData = await response.json();
          this.errorMessage = errorData.error || 'Failed to add charging station.';
          this.successMessage = null;
          console.error('Error adding charging station:', errorData);
        }
      } catch (error) {
        console.error('Error adding charging station:', error);
        this.errorMessage = 'An error occurred. Please try again later.';
        this.successMessage = null;
      }
    },
  },
};
</script>

<style scoped>
.container {
  margin-top: 20px;
}
</style>