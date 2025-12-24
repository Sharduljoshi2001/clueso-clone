const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const app = express();
const PORT = 3001;
const guideRoutes = require('../server/routes/guideRoutes');
//middleware
app.use(express.json());
app.use(cors());
//routes
app.use('/api/guides',guideRoutes)
//db connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));
app.get('/',(req,res)=>{
    res.send('server is running!');
});
app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})
