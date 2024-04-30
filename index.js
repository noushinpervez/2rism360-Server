const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// config
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9crls8f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const touristSpotCollection = client.db("touristSpotDB").collection("touristSpot");

        app.get("/my-list/:uid", async (req, res) => {
            const cursor = touristSpotCollection.find({ uid: req.params.uid });
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get("/tourist-spot/:id", async (req, res) => {
            const result = await touristSpotCollection.findOne({ _id: new ObjectId(req.params.id) });
            res.send(result);
        });

        app.put("/update-tourist-spot/:id", async (req, res) => {
            const query = { _id: new ObjectId(req.params.id) };
            const options = { upsert: true };

            const data = {
                $set: {
                    image: req.body.image,
                    tourist_spot_name: req.body.tourist_spot_name,
                    location: req.body.location,
                    short_description: req.body.short_description,
                    average_cost: req.body.average_cost,
                    seasonality: req.body.seasonality,
                    travel_time: req.body.travel_time,
                    totalVisitorsPerYear: req.body.totalVisitorsPerYear,
                    email: req.body.email,
                    username: req.body.username,
                }
            };
            
            const result = await touristSpotCollection.updateOne(query, data, options);
            res.send(result);
        });

        app.post("/add-spot", async (req, res) => {
            const newSpot = req.body;
            const result = await touristSpotCollection.insertOne(newSpot);
            res.send(result);
        });

        app.delete("/delete/:id", async (req, res) => {
            const result = await touristSpotCollection.deleteOne({ _id: new ObjectId(req.params.id) });
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});