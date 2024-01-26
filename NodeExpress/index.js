const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("./db/config"); // to connect with MangoDB
const User = require("./db/User");
const Product = require("./db/Product");
const Jwt = require("jsonwebtoken");
const jwtKey = "securityBoat";
const axios = require("axios");
const app = express();
app.use(express.json()); //Middelware:- to controll data send from  React
app.use(cors());

//API for Register the user
app.post("/register", async (req, resp) => {
  let user = new User(req.body);
  let result = await user.save();

  result = result.toObject();
  delete result.password;
  Jwt.sign({result},jwtKey,{expiresIn:"1h"},(error,token)=>{
    if(error){
      resp.send("Something went wrong while Log In")
    }
    resp.send({result,auth:token});
  })
});

//API for Login the user
app.post("/login", async (req, resp) => {
  console.log(req.body);
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({user},jwtKey,{expiresIn:"1h"},(error,token)=>{
        if(error){
          resp.send("Something went wrong while Log In")
        }
        resp.send({user,auth:token});
      })
      
    } else {
      resp.send("Noo user found");
    }
  } else {
    resp.send({ result: "No user found" });
  }
});

//API to add the product
app.post("/add-product", async (req, resp) => {
  let product = new Product(req.body);
  let result = await product.save();
  resp.send(result);
  console.log(result);
});

//API to get List of Product
app.get("/products", async (req, resp) => {
  let products = await Product.find();
  if (products.length > 0) {
    resp.send(products);
  } else {
    resp.send({ result: "No product Found" });
  }
});

//API to delete product from ProductList
app.delete("/product/:id", async (req, resp) => {
  const result = await Product.deleteOne({ _id: req.params.id });
  resp.send(result);
});

//API to get details of Product which we want to Update
app.get("/product/:id", async (req, resp) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    resp.send(result);
  } else {
    resp.send("No record found");
  }
});

//ApI to Update Product
app.put("/product/:id", async (req, resp) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );
  resp.send(result);
});

//Search API
app.get("/search/:key", async (req, resp) => {
  let result = await Product.find({
    $or: [
      { category: { $regex: req.params.key } },
      { name: { $regex: req.params.key } },
    ],
  });
  resp.send(result);
});

app.listen(5000, () => {
  console.log("App is running on port 5000");
});

//code to connect node and mongodb and fetching data from DB
// const connectDB= async ()=>{

//     mongoose.connect('mongodb://localhost:27017/e-commerce');
//     const productSchema=new mongoose.Schema({})
//     const product=mongoose.model('user',productSchema);
//     const data=await product.find({});
//     console.warn(data)
// }
// connectDB();
