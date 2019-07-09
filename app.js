const express = require('express');
const app = express();
app.use(express.json());
const UserAuthController = require('./public/controller/UserController');
const AdminAuthController = require('./public/controller/AdminController');
const DbAuth = require('./public/DbConnection/DBConnection');
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


app.get('/', DbAuth.DbConnect);

// User Section 
app.post('/UserRegistration',UserAuthController.Registeruser);

app.post('/Login', UserAuthController.Loginuser);

app.get('/GetMensProduct',UserAuthController.Getmensproducts);

app.get('/GetWomenProduct',UserAuthController.Getwomenproducts);

app.get('/GetuserbyID/:Id',varifyToken, UserAuthController.Getprofile);

app.post('/UpdateUser',varifyToken, UserAuthController.updateUser);

app.post('/AddSocialUser',UserAuthController.SocialLogin);

 // app.post('/AddTocart',)

 app.get('/findall/:id',UserAuthController.findall);

 app.post('/stripepayment', UserAuthController.paymentStripe);

// Admin Section

app.post('/AddProducts', varifyToken,AdminAuthController.ProductEntry);

app.get('/GetAllproducts',AdminAuthController.GetAllproduct);


function varifyToken(req, res, next)
{
    const bereartoken = req.headers["authorization"];
    if (bereartoken != null && bereartoken != undefined && bereartoken != ''){
        const Valid_Token = bereartoken.split(' ')[1];
        req.token = Valid_Token;
        next();
    }
    else {
        res.status(401).send('Un-authorized access');
    }

}

const port = process.env.PORT || 3000;

app.listen(port);