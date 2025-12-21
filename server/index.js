const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;
//middleware
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('server is running!');
});
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})
