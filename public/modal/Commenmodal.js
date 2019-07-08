const mongoose = require('mongoose');


const RegistrationSchema = mongoose.Schema({  
FirstName : String,
LastName : String,
Email : String,
Password : String,
Address : String,
City : String,
Phone: String,
Role: { type: String, default:"User"},
Imageurl: String,
provider: String
})


exports.RegisterModal =  mongoose.model('Registration',RegistrationSchema,'register');

const ProductSchema = mongoose.Schema({
    ProductName: String,
    Productprice: String,
    productDescription: String,
    ProductImage: String,
    DiscountPrice: String,
    category: String
})
exports.Productmodal =  mongoose.model('Product', ProductSchema, 'Products');

const SocialSchema = mongoose.Schema({  
    FirstName : String,
    LastName : String,
    Email : String,
    Role: { type: String, default:"User"},
    Imageurl: String,
    provider: String
});

exports.SocialModal =  mongoose.model('Social',SocialSchema,'socialregister');

const Cartschema = mongoose.Schema({
    ProductName: String,
    Productprice: String,
    productDescription: String,
    ProductImage: String,
    DiscountPrice: String,
    category: String,
    Email: String
})
exports.cartModal =  mongoose.model('carts', Cartschema, 'cart');