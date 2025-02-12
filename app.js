const express = require('express');
const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');

const app = express();
app.use(express.json()); // to parse JSON request bodies


const MONGODB_URI="mongodb://localhost:27017/car_rental_service"
const NEO4J_USER="neo4j"
const NEO4J_PASSWORD=12345678
const NEO4J_URI="bolt://localhost:7687"

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose Schemas (if not already defined)
const carSchema = new mongoose.Schema({
    make: String,
    model: String,
    type: String,
    location: { type: 'Point', coordinates: [Number, Number] }, // [longitude, latitude]
});

const chargingStationSchema = new mongoose.Schema({
    name: String,
    location: { type: 'Point', coordinates: [Number, Number] }, // [longitude, latitude]
});

const Car = mongoose.model('Car', carSchema);
const ChargingStation = mongoose.model('ChargingStation', chargingStationSchema);


// Neo4j Connection
const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

// Admin Routes

app.post('/admin/addCar', async (req, res) => {
    try {
        const { make, model, type, longitude, latitude } = req.body;

        const newCar = new Car({
            make, model, type, longitude,
            location: { type: 'Point', coordinates: [longitude, latitude] },
        });

        const savedCar = await newCar.save();

        // Neo4j: Create Car Node
        const session = driver.session();
        await session.run(
            'CREATE (car:Car {id: $carId, make: $make, model: $model,  type: $typḛ})',
            { carId: savedCar._id.toString(), make, model, type } // Convert ObjectId to string
        );
        session.close();

        res.status(201).json(savedCar); // 201 Created
    } catch (error) {
        console.error("Error adding car:", error);
        res.status(500).json({ error: 'Failed to add car' });
    }
});

app.post('/admin/addChargingStation', async (req, res) => {
    try {
        const { name, longitude, latitude } = req.body;

        const newStation = new ChargingStation({
            name,
            location: { type: 'Point', coordinates: [longitude, latitude] },
        });

        const savedStation = await newStation.save();

        // Neo4j: Create Charging Station Node
        const session = driver.session();
        await session.run(
            'CREATE (station:ChargingStation {id: $stationId, name: $name})',
            { stationId: savedStation._id.toString(), name } // Convert ObjectId to string
        );
        session.close();

        res.status(201).json(savedStation);
    } catch (error) {
        console.error("Error adding charging station:", error);
        res.status(500).json({ error: 'Failed to add charging station' });
    }
});


// Example: Connecting Car and Charging Station (after adding both)
app.post('/admin/connectCarToStation', async (req, res) => {
    try {
        const { carId, stationId } = req.body;

        const session = driver.session();
        await session.run(
            'MATCH (car:Car {id: $carId}), (station:ChargingStation {id: $stationId}) CREATE (car)-[:LOCATED_NEAR]->(station)',
            { carId, stationId } // Assuming you have the string IDs
        );
        session.close();

        res.status(200).json({ message: 'Car and station connected' });
    } catch (error) {
        console.error("Error connecting car and station:", error);
        res.status(500).json({ error: 'Failed to connect car and station' });
    }
});



const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});