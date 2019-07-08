const mongoose = require('mongoose');
const modal = require('../modal/Commenmodal');
const jwt = require('jsonwebtoken');

exports.ProductEntry = ((req,res)=>{
jwt.verify(req.token,'Secretkey', (err,result) => {
    if (err) res.status(403).send('forbidden');
    const productdata = new modal.Productmodal({
        ProductName: req.body.ProductName,
        Productprice: req.body.Productprice,
        productDescription: req.body.productDescription,
        ProductImage: req.body.ProductImage,
        DiscountPrice: req.body.DiscountPrice,
        category: req.body.category
    });
    jwt.verify(req.token,'secretkey',(err,result)=>{
        if (err) res.status(403).send('forbidden');
        mongoose.connection.db.collection('product').insertOne(productdata,(err,result)=>{
            if (err) res.status(500).send('Server error');
            res.status(200).send();
        });
    });
});
});

exports.GetAllproduct = ((req,res)=>{

    mongoose.connection.db.collection('product').find({}).toArray((err,result)=>{
        if (err) res.status(500).send('Server error');
        if (result != null){
            res.status(200).send(JSON.stringify(result));
        }
    })
})