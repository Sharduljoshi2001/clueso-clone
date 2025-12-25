const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3001;
const guideRoutes = require('./routes/guideRoutes');
//middleware
app.use(express.json());
//enabling cors for all origins (crucial for extension to talk to localhost from any site)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
//serving uploaded files statically so frontend can play videos/audio from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//routes
app.use('/api/guides', guideRoutes);
//db connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
app.get('/',(req,res)=>{
    res.send('server is running!');
});
app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});