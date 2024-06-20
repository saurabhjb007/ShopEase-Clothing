const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");

app.use(express.json());
app.use(cors());

// Database connection with MongoDB
mongoose.connect(
  "mongodb+srv://SaurabhSharma:Saurabhjb007@cluster0.eels58a.mongodb.net/e-commerce"
);

// API creation
app.get("/", (req, res) => {
  res.send("Hello Express!");
});

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage: storage });

// Creating upload endpoint for image
app.use("/images", express.static("./upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `https://shopease-backend-9ho7.onrender.com//images/${req.file.filename}`,
  });
});

// Schema for Creating Product
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

// Creating Api for adding product
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  await product.save();
  res.json({
    success: true,
    name: req.body.name,
  });
});

// Creating Api for deleting product
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({
    success: true,
    name: req.body.name,
  });
});

// Creating Api for getting all products
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  res.send(products);
});

// Schema Creating for User Model
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Creating Endpoint for Signup
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({
      success: false,
      errors: "existing user found with same email address",
    });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });
  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, process.env.JWT_SECRET || "secret_ecom");
  res.json({ success: true, token });
});

// Creating Endpoint for Login
app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secret_ecom");
      res.json({ success: true, token });
    } else {
      res.json({
        success: false,
        errors: "wrong password",
      });
    }
  } else {
    res.json({
      success: false,
      errors: "wrong email id",
    });
  }
});

// Creating Endpoint for New-collection data
app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  res.send(newcollection);
});

// Creating Endpoint for Popular data
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let popularinwomen = products.slice(0, 4);
  res.send(popularinwomen);
});

// Creating middleware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ errors: "auth-token not found" });
  } else {
    try {
      const data = jwt.verify(token, "secret_ecom");
      req.user = data.user;
      next();
    } catch (error) {
      res.status(401).send({ errors: "please authenticate with valid token" });
    }
  }
};

// Creating Endpoint for adding data in cart
app.post("/addtocart", fetchUser, async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId]) {
    userData.cartData[req.body.itemId] += 1;
  } else {
    userData.cartData[req.body.itemId] = 1;
  }
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.json("Added to cart");
});

// Endpoint for removing data from cart
app.post("/removefromcart", fetchUser, async (req, res) => {
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData && userData.cartData[req.body.itemId]) {
      if (userData.cartData[req.body.itemId] > 1) {
        userData.cartData[req.body.itemId] -= 1;
      } else {
        delete userData.cartData[req.body.itemId];
      }
      await Users.findOneAndUpdate(
        { _id: req.user.id },
        { cartData: userData.cartData }
      );
      res.json("Removed from cart");
    } else {
      res.status(404).send("Item not found in cart");
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Creating Endpoint to get cartdata
app.post("/getcart", fetchUser, async(req,res)=>{
  let userData=await Users.findOne({_id:req.user.id})
  res.json(userData.cartData)
})

app.listen(port, () => {
});
