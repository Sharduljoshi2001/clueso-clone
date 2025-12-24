const mongoose = require('mongoose');
//schema for events occured(step of events/clicks)
const stepSchema = new mongoose.Schema({
    timestamp:{type:String},
    x:{type:Number},//x coordinate
    y:{type:Number},//y coordinate
    text:{type:String},//clicked upon text
    tagName:{type:String},//clicked upon tag name
    url:{type:String},//current pages url
});
//main blueprint for our actual schema that defines the db structure
const guideSchema = new mongoose.Schema({
    title:{
        type:String,
        default:'untitled guide',
    },
    videoUrl:{
        type:String,
        required:true
    },
    steps:[stepSchema],
    createdAt:{
        type:Date,
        default:Date.now,
    },
});
module.exports=mongoose.model('Guide',guideSchema);