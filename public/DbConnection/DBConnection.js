const Mongoose = require('mongoose');
const Url = 'mongodb://localhost:27017/Testdb';

exports.DbConnect = ((req,res)=>{
    Mongoose.connect(Url,{ useNewUrlParser: true }).then(()=>{
        console.log("connected")
    }).catch((error)=>{
        console.error(error)
    })
    });