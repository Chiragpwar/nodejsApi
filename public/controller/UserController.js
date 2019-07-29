const mongoose = require('mongoose');
const CommenModal = require('../modal/Commenmodal');
const jwt= require('jsonwebtoken');
const ObjectId = require('mongoose').Types.ObjectId;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const doc = new PDFDocument();
const path = require('path');
const stripe_payment = require('stripe')('sk_test_9x4rYVKwymxdZ3kHHeC2wLr700dbxtJtKa');
var braintree = require('braintree');
var paypal = require('paypal-rest-sdk');
const {google} = require('googleapis');
const _  = require('underscore');
const request = require('request');
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

exports.findall = (async (req, res) => {
 const ids = req.params.id;
 let splitedids = ids.split(',');
 if (splitedids == null && splitedids == undefined && splitedids == ""){
   splitedids = ids;
 }
 splitedids = splitedids.map(sp => ObjectId(sp));
try{
  await mongoose.connection.db.collection('product').find({ _id : { $in : splitedids}}).toArray((err, result)=>{
    if(err){
      return res.status(404).json({status : 0, message : 'something went wrong'});
    }
    return res.status(200).send(result);
  });
}catch(e){
  res.status(200).send({ status : 0, message : 'no data found'});
  console.log('\n Err : ', e);
}
});

exports.paymentStripe =  (req,res) =>{

  const PaymentData = {
    Token: req.body.token,
    Email: req.body.Email,
    Price: req.body.Price
  };


  var charge =  stripe_payment.charges.create({
    amount: PaymentData.Price,
    currency:'usd',
    source:PaymentData.Token,
    statement_descriptor: 'Custom descriptor',
    receipt_email: PaymentData.Email,
    description: 'App cart charge',
  },(err,result)=>{
    if (err) res.send(err);
    res.status(200).send(result);
    res.end();
  });

}

exports.pdfshow = (req,res) => { 

  doc.pipe(fs.createWriteStream('output.pdf'));
  const pathfont = path.join(__dirname , "../../font/paltno.ttf");
  doc.font(pathfont)
   .fontSize(25)
   .text('Some text with an embedded font!', 100, 100);

//    doc.image('path/to/image.png', {
//     fit: [250, 300],
//     align: 'center',
//     valign: 'center'
//  });

 doc.addPage()
   .fontSize(25)
   .text('Here is some vector graphics...', 100, 100);

   doc.save()
   .moveTo(100, 150)
   .lineTo(100, 250)
   .lineTo(200, 250)
   .fill("#FF3300");

   doc.scale(0.6)
   .translate(470, -380)
   .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
   .fill('red', 'even-odd')
   .restore();

   doc.addPage()
   .fillColor("blue")
   .text('Here is a link!', 100, 100)
   .underline(100, 100, 160, 27, {color: "#0000FF"})
   .link(100, 100, 160, 27, 'http://google.com/');
 
// Finalize PDF file
doc.end();
  
}

exports.braintreepayment = (req,res) => {

  var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: 'wkb34nzn6sbpvn4r',
    publicKey: 'rg89hrc87nxx5qng',
    privateKey: '8192c7bcca6a5252d4d53a8794951b61'
  });

  gateway.transaction.sale({
    amount: '100.00',
    customer : {              
     firstName : 'chirag',
     lastName: 'pawar',
     email: 'pawarcrg@live.com',
     phone: '9979901785', 
    },
    creditCard :{
     cardholderName: 'chirag',
     cvv:'555',
     expirationMonth: '05',
     expirationYear: '35',                                                 
     number: '5555555555554444'
    },
    billing :{
    firstName: 'chirag',
    company: 'test_chirag',
    countryName: 'india',
    lastName: 'pawar',
    postalCode:'395009',
    streetAddress: '401, vandan apartment'  
    },
    paymentMethodNonce: 'nonce-from-the-client',
    options: {
      submitForSettlement: true
    }
  }, function (err, result) {
    if (err) {
      console.error(err);
      return;
    }
  
    if (result.success) {
      console.log('Transaction ID: ' + result.transaction.id);
    } else {
      console.error(result.message);
    }
  });

}

exports.paypalpayment = ((req, res) => {
 
  paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ARBe9uS3y58d3_T9jf-zqCPZ8KnH2H_ECuBPOvhl84qSJZBljCRZKmngfmDeeYP5fM3wJ1Jh8oJ5p-gv',
    'client_secret': 'EPs4kYpyE8JMBVRv1Ge4TIkBYAvrPTHujxr9phfzJtL-vAqn9rJA1ePjBBEag8AUWiKMOna4mcrXF0kF'
  });

  var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://return.url",
        "cancel_url": "http://cancel.url"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Jeans",
                "sku": "item",
                "price": "1.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "1.00"
        },
        "description": "This is the payment description."
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      console.log("Create Payment Response");
      res.status(200).send(payment);
  }
});
});

exports.Adddataondrive = ((req, res) => {

  const oauth2Client = new google.auth.OAuth2(
    '268181517598-ksrkm9i6r4nj5lm1rvk6uri0fb3fm2q6.apps.googleusercontent.com',
    'EZf9RQX53HmfW1hocYyT8fA3',
    'http://localhost:3000/oauth2callback'
  );
  const scopes = [
    "https://www.googleapis.com/auth/drive"
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
 
    res.status(200).send(url);

});

exports.callbacks = ((req,res) =>  {

  const pathimg = path.join(__dirname, '../images/b2.jpg');  
    async function token(){
      const oauth2Client = new google.auth.OAuth2(
        '268181517598-ksrkm9i6r4nj5lm1rvk6uri0fb3fm2q6.apps.googleusercontent.com',
        'EZf9RQX53HmfW1hocYyT8fA3',
        'http://localhost:3000/oauth2callback'
      );
      const {tokens} = await oauth2Client.getToken(req.query.code)
      oauth2Client.credentials = {
        refresh_token: tokens.refresh_token
      };
      oauth2Client.refreshAccessToken(function(err, tokens){
        oauth2Client.credentials = {access_token : tokens.access_token}
      });
      const chirag = google.drive({ version: 'v3', auth : oauth2Client });

        const result =  chirag.files.create({
              requestBody: {
                name: 'testimage.png',
                mimeType: 'image/png'
              },
              media: {
                mimeType: 'image/png',      
               // body: fs.createReadStream(pathimg)
               body : 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
              }
            });
  }
  token().catch(console.error);
   
});

exports.Youtubedata = ((req, res) => {

  const oauth2Client = new google.auth.OAuth2(
    '268181517598-ksrkm9i6r4nj5lm1rvk6uri0fb3fm2q6.apps.googleusercontent.com',
    'EZf9RQX53HmfW1hocYyT8fA3',
    'http://localhost:3000/channelList'
  );
  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly"
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });
    res.status(200).send(url);

});

exports.channelList = ((req,res)=> {

  async function Youtubedata(){


    const oauth2Client = new google.auth.OAuth2(
      '268181517598-ksrkm9i6r4nj5lm1rvk6uri0fb3fm2q6.apps.googleusercontent.com',
      'EZf9RQX53HmfW1hocYyT8fA3',
      'http://localhost:3000/channelList'
    );
    const {tokens} = await oauth2Client.getToken(req.query.code);
    oauth2Client.credentials = tokens;

    var service = google.youtube('v3');
    service.channels.list({
      auth: oauth2Client,
      part: 'snippet,contentDetails,statistics',
      forUsername: 'GoogleDevelopers'
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      debugger
      var channels = response.data.items;
      res.send(channels);
      if (channels.length == 0) {
        console.log('No channel found.');
      } else {
        console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                    'it has %s views.',
                    channels[0].id,
                    channels[0].snippet.title,
                    channels[0].statistics.viewCount);
      }
    });
  }
  Youtubedata().catch(console.error) 
});

exports.youtubevideo = ((req, res) => {
  
  const channelId = req.params.channelId;
   const ApiYoutube = 'AIzaSyA8R3un4hDo1gaNynVlXO-ifcFoCrS4sT0';
   const url = 'https://www.googleapis.com/youtube/v3/search?key='+ApiYoutube+'&channelId='+channelId+'&part=snippet,id&order=date&maxResults=15'
  request(url, { json: true }, (err, result, body) => {
  if (err) { return console.log(err); }
    res.status(200).send(body);
});

})


exports.getGoogleMail = ((req, res) => {
      const oauth2Client = new google.auth.OAuth2(
        '268181517598-ksrkm9i6r4nj5lm1rvk6uri0fb3fm2q6.apps.googleusercontent.com',
        'EZf9RQX53HmfW1hocYyT8fA3',
        'http://localhost:4200'
      );
    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly"
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'online',
      scope: scopes
    });
    res.status(200).send(JSON.stringify(url));
   // res.send(url);
});

exports.GmailCallback = ((req,res) => {
   const code = req.body.code;
  async function token(){
    const oauth2Client = new google.auth.OAuth2(
      '268181517598-ksrkm9i6r4nj5lm1rvk6uri0fb3fm2q6.apps.googleusercontent.com',
      'EZf9RQX53HmfW1hocYyT8fA3',
      'http://localhost:4200'
    );
    const {tokens} = await oauth2Client.getToken(code)
       oauth2Client.setCredentials(tokens);
     const gmail = google.gmail({version: 'v1', auth: oauth2Client});
     gmail.users.threads.list({
      userId: 'me',
      labelIds:  'INBOX',
      'maxResults': 10
      }, (err, result) => {
      if (err) return console.log('The API returned an error: ' + err);
      const labels = result.data.threads;
       var  mail = [];
      labels.forEach(element => {
        gmail.users.messages.get({
          userId: 'me',
          id: element.id
        }, (err, resultdata) => {
          if (err) return console.log('The API returned an error: ' + err);
         // mail += resultdata.data;
          mail.push(resultdata['data']);
          if (mail.length >= 10){
            res.send(mail);
          }
        })
      });
       
      if (labels.length) {
        // console.log('Labels:', object);
        console.log('Labels:',  labels .length);
       // res.send(labels)
      } else {
        console.log('No labels found.');
      }
    });

  }
  token().catch(console.error);
});

