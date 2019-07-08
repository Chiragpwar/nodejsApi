const mongoose = require('mongoose');
const CommenModal = require('../modal/Commenmodal');
const jwt= require('jsonwebtoken');
const ObjectId = require('mongoose').Types.ObjectId;

exports.Registeruser = ((req,res)=> {

    const UserData = new CommenModal.RegisterModal ({    
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Password: req.body.Password,
        Role: CommenModal.RegisterModal.Role,
        City: req.body.City,
        Address: req.body.Address,
        Imageurl: req.body.Imageurl      
    });
   
    mongoose.connection.db.collection('register').insertOne(UserData, (err,result) => {
      if (err) res.send(err);
      if (result != null)
      {
          mongoose.connection.db.collection('register').findOne({Email : UserData.Email}, (err,result)=> {
              if (err) res.send(err);
              if (result != null)
              {
                jwt.sign(UserData.Email,'Secretkey',(err,token)=>{
                  if (err) res.status(403).send('forbidden');
                  result.token = token;
                   res.status(200).send(JSON.stringify({'user': result}));
                });
              }
          });        
      }
     });
});

exports.Loginuser = ((req,res) => {

  const Logindata = {
    Email : req.body.Email,
    Password: req.body.Password
  }
  mongoose.connection.db.collection('register').findOne({Email: Logindata.Email, Password: Logindata.Password},(err,result)=>{
    if (err) res.status(403).send('forbidden');
    if (result != null && result != undefined){
      jwt.sign(Logindata.Email,'Secretkey',(err,token)=>{
        if (err) res.status(403).send('forbidden');
        result.token = token;
        const user = {
          id : result._id,
          token : token
        }
         res.status(200).send(JSON.stringify({'user': user}));
      });
    }
  });

});

exports.Getmensproducts = ((req,res)=>{

  mongoose.connection.db.collection('product').find({category : 'male'}).toArray((err,result)=>{
    if (err) res.status(500).send('server error');
    if (result != null && result != "" && result != undefined){
        res.status(200).send(JSON.stringify(result));
    }
  })
});

exports.Getwomenproducts = ((req,res)=>{

  mongoose.connection.db.collection('product').find({category : 'Female'}).toArray((err,result)=>{
    if (err) res.status(500).send('server error');
    if (result != null && result != "" && result != undefined){
        res.status(200).send(JSON.stringify(result));
    }
  })
});

exports.Getprofile = ((req,res)=>{
 const Id = req.params.Id;
 jwt.verify(req.token,'Secretkey',(err,authdata)=> {
    if (err) res.status(403).send('forbidden');
    mongoose.connection.db.collection('register').findOne({_id: ObjectId(Id)}, (err,result)=>{
      if (err) res.status(500).send('server error');
      if (result != null && result != "" && result != undefined){
        res.status(200).send(JSON.stringify(result));
      }
    });
 });
});

exports.updateUser = ((req,res)=>{
  jwt.verify(req.token,'Secretkey',(err,result)=> {

    const UserData = new CommenModal.RegisterModal ({
        _id : req.body._Id, 
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Phone: req.body.Phone,
        Password: req.body.Password,
        Role: CommenModal.RegisterModal.Role,
        City: req.body.City,
        Address: req.body.Address,
        Imageurl: req.body.Imageurl      
    });
    mongoose.connection.db.collection('register').findOne({_id: ObjectId(UserData._id)}, (err,result)=>{
      if (err) res.status(500).send('server error');
      if (result != null && result != "" && result != undefined){
        mongoose.connection.db.collection('register').update(result,UserData,(err,newresult)=>{
          if (err) res.status(500).send('server error');
          res.status(200).send(JSON.stringify(newresult));
        })
      }
    })
  });


});

exports.SocialLogin = ((req,res)=>{

  const SocialData = new CommenModal.RegisterModal ({    
    FirstName : req.body.firstName,
    LastName : req.body.lastName,
    Email : req.body.email,
    Role: CommenModal.RegisterModal.Role,
    Imageurl: req.body.photoUrl,
    provider: req.body.provider     
});
    mongoose.connection.db.collection('Socialregister').insertOne(SocialData, (err,result)=>{
      if (err) res.status(500).send('server error');
      mongoose.connection.db.collection('Socialregister').findOne({Email : SocialData.Email},(err,newresult)=>{
        if (err) res.status(500).send('server error');
        if (newresult != null){
          jwt.sign(SocialData.Email,'Secretkey',(err,token)=>{
            const socialuser = {
              id : newresult._id,
              token: token
            };
             res.status(200).send(JSON.stringify({'user':socialuser}));
          });
        }
      })
    })
});

exports.AddTocart = ((req,res)=> {
 const cartData = {
  ProductName: req.body.ProductName,
  Productprice: req.body.Productprice,
  productDescription: req.body.productDescription,
  ProductImage: req.body.ProductImage,
  DiscountPrice: req.body.DiscountPrice,
  category: req.body.category,
  Email: req.body.Email
 }

});

exports.findall = ((req, res) => {
 const ids = req.params.id;
 var prodlist = [];
 const splitedids = ids.split(',');

  splitedids.forEach(element => {
    mongoose.connection.db.collection('product').findOne({_id: ObjectId(element)}, (err, result) => {
      if (err) res.status(403).send('server error');
      if (result != null)
      {    
        prodlist.push(result);
      }
   //   
      });
          
 });
});