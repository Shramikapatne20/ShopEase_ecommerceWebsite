const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const multer=require("multer");
const path=require("path");
const { error } = require("console");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer=require("nodemailer");


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_djeFhOqR1vS9bu",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "V1ldRK2YfekfIBsc2g3mSycZ",
});


const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"uploads/");
  },
  filename:(req,file,cb)=>{cb(null,Date.now()+path.extname(file.originalname));

  }

});
const upload=multer({storage});

const app = express();
const PORT = 3000;
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads",express.static("uploads"));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "ecomm"
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Database");
});


app.post("/api/signup", async (req, res) => {
  let { username, email, password ,phone,gender,dob} = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    if (dob) {
      dob = new Date(dob).toISOString().split("T")[0]; 
    }

    // Insert new user
    db.query(
      "INSERT INTO users (username, email, password,phone,gender,dob) VALUES (?, ?, ? ,? ,? ,?)",
      [username, email, hashedPassword,phone,gender,dob],
      async (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        try{
          const transporter=nodemailer.createTransport({
            service:"gmail",
            auth:{
              user:process.env.EMAIL_USER,
              pass:process.env.EMAIL_PASS,

            },
          });
          const mailOptions={
            from:process.env.EMAIL_USER,
            to:email,
            subject:"Welcome to My E-Commerce Website",
            html:`
            <h2>Hi ${username},</h2>
            <p>Thank you for signing up at <b>My E-Commerce Website</b>!</p>
            <p>You can now login and start shopping with us.</p>
            <br/>
            <p>Regards,<br/>E-Commerce Team</p>
            `,

          };
          await transporter.sendMail(mailOptions);
          return res.json({message:"User registered successfully & email sent!"});
        }
        catch(mailErr)
        {
          console.error("Email Error: ",mailErr);
          return res.json({message:"User registered,but email failed to send."});
        }

        
      }
    );
  });
});

app.put("/api/users/:id",(req,res)=>{
  const{id}=req.params;
  let{username,email,phone,gender,dob,address}=req.body;
  try{
  if (dob) {
    dob = new Date(dob).toISOString().split("T")[0];  
    //  gives "2003-04-19"
  }
  db.query(
    "UPDATE users SET username=?,email=?,phone=?,gender=?,dob=?,address=? WHERE user_id=?",
    [username,email,phone,gender,dob || null,address || null,id],
    (err,result)=>{
      if(err){
         console.error("DB Update Error:", err.sqlMessage);
         return res.status(500).json({ error: err.sqlMessage });
      }
      res.json({message:"Profile updated successfully"});
    }
  
  
  );
}
  catch (e) {
    console.error("Server Error:", e.message);
    res.status(500).json({ error: e.message });
  }

});
app.get("/api/products",(req,res)=>{
  const search=req.query.search;
  const category=req.query.category;
  let sql="SELECT * FROM products";
  let params=[];
  if(search)
  {
    sql+=" WHERE name LIKE ?";
    params.push(`%${search}%`);

  }
    if (category) {
    sql += " AND category = ?";
    params.push(category);
  }

  db.query(sql,params,(err,results)=>{
    if(err) return res.status(500).send({err});
    res.json(results);
    
  });

});
// Get total number of users
app.get("/api/admin/users-count", (req, res) => {
  db.query("SELECT COUNT(*) AS count FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.json({ count: results[0].count });
  });
});

// Get total number of orders
app.get("/api/admin/orders-count", (req, res) => {
  db.query("SELECT COUNT(*) AS count FROM orders", (err, results) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.json({ count: results[0].count });
  });
});
// Total revenue from all orders
app.get("/api/admin/total-revenue", (req, res) => {
  const sql = `
    SELECT SUM(o.quantity * p.price) AS total_revenue
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.json({ total_revenue: results[0].total_revenue || 0 });
  });
});
// Products sold per category
app.get("/api/admin/sold-per-category", (req, res) => {
  const sql = `
    SELECT p.category, SUM(o.quantity) AS total_sold
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    GROUP BY p.category
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.json(results);
  });
});


app.get("/api/users/:id",(req,res)=>{
  const{id}=req.params;
  db.query("SELECT user_id,username,email,phone,gender,dob,address FROM users WHERE user_id=?",[id],(err,results)=>{
    if(err) return res.status(500).json({message:"DB error"});
    if(results.length===0) return res.status(404).json({message:"User not found"});
    res.json(results[0]);
  });


})
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required!" });
  }

  // Check if user exists
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

   
    const token = jwt.sign(
      { id: user.user_id, username:user.username,email: user.email,role:user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ 
      success:true,
      token:token,
      role:user.role,
      user_id:user.user_id,
      username:user.username,
      message: "Login successful!"});
  });
});

app.post("/api/cart/add",(req,res) => {
  const {user_id,product_id,quantity}=req.body;
  if(!user_id || !product_id)
  {
    return res.status(400).json({message:"User ID and Product ID required"});

  }
  const checkQuery="SELECT * FROM cart WHERE user_id=? AND product_id=?";
  db.query(checkQuery,[user_id,product_id],(err,results)=>{
    if(err) return res.status(500).json({error:err});
    if(results.length>0)
    {
      const updateQuery="UPDATE cart SET quantity = quantity+ ? WHERE user_id=? and product_id=?"
      db.query(updateQuery,[quantity || 1,user_id,product_id],(err2)=>{
        if(err2) return res.status(500).json({error:err2});
        return res.json({message:"Cart updated successfully"});
      });

    }
    else
    {
      const insertQuery="INSERT INTO cart (user_id,product_id,quantity) VALUES(?,?,?)";
      db.query(insertQuery,[user_id,product_id,quantity || 1],(err3)=>{
        if(err3) return res.status(500).json({error:err3});
        return res.json({message:"Product added to cart"});
      });
    }
  });
});

app.post("/api/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  db.query("SELECT * FROM users WHERE email=?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "DB Error" });
    if (results.length === 0)
      return res.status(400).json({ message: "Email not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 3600000; // 1 hour

    db.query(
      "UPDATE users SET reset_token=?, reset_expires=? WHERE email=?",
      [token, expires, email],
      (err) => {
        if (err) return res.status(500).json({ message: "DB error" });

        const resetLink = `http://localhost:3000/reset-password/${token}`;

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Password Reset Request",
          html: `
            <h3>Password Reset</h3>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 1 hour.</p>
          `,
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ message: "Email not sent" });
          }
          res.json({ message: "Reset link sent to email" });
        });
      }
    );
  });
});

// Reset Password
app.post("/api/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) return res.status(400).json({ message: "Password required" });

  db.query("SELECT * FROM users WHERE reset_token=? AND reset_expires > ?", 
    [token, Date.now()], 
    async (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (results.length === 0) return res.status(400).json({ message: "Invalid or expired token" });

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "UPDATE users SET password=?, reset_token=NULL, reset_expires=NULL WHERE reset_token=?",
        [hashedPassword, token],
        (err2) => {
          if (err2) return res.status(500).json({ message: "DB error" });
          res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
});



app.get("/api/cart/:userId", (req, res) => {
  const userId = req.params.userId;   // ✅ correct
  const sql = `
    SELECT c.id as cart_id, c.quantity, p.product_id, p.name, p.price, p.image_url
    FROM cart c
    JOIN products p ON c.product_id = p.product_id
    WHERE c.user_id = ?`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// REMOVE item from cart
app.delete("/api/cart/:cart_id", (req, res) => {
  const { cart_id } = req.params;
  db.query("DELETE FROM cart WHERE id = ?", [cart_id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Item removed from cart" });
  });
});

// add product
app.post("/api/products", upload.single("image"), (req, res) => {
  const { name, price, category } = req.body;
  const image_url = req.file ? req.file.filename : req.body.image_url;  // store filename
  if(!name || !price || !category)
  {
    return res.status(400).json({message:"All fields required"});

  }

  db.query(
    "INSERT INTO products (name, price, image_url, category) VALUES (?, ?, ?, ?)",
    [name, price, image_url, category],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error", details: err });
      }
      res.json({ message: "Product added", id: results.insertId, image_url });
    }
  );
});

// Fetch products
const fetchProducts = async (query = "", category = "") => {
  try {
    const res = await axios.get("http://localhost:3000/api/products", {
      params: { search: query, category }, // ✅ pass category to backend
    });
    setProducts(res.data);
  } catch (err) {
    console.error(err);
  }
};



// Update product
app.put("/api/products/:id", upload.single("image"),(req, res) => {
  const{id}=req.params;
  const { name, price,category } = req.body;
  const image_url=req.file?req.file.filename:req.body.image_url;
  const sql = "UPDATE products SET name=?, price=?, image_url=?,category=? WHERE product_id=?";
  db.query(sql, [name, price, image_url,category, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Product updated" });
  });
});

app.put("/api/cart/:id", (req, res) => {
  const { id } = req.params;          // get cart id from URL
  const { quantity } = req.body;      // get new quantity from body

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1" });
  }

  db.query(
    "UPDATE cart SET quantity=? WHERE id=?",
    [quantity, id],
    (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json({ success: true, id, quantity });
    }
  );
});
// Delete product
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;

  // First delete from cart
  const sqlCart = "DELETE FROM cart WHERE product_id = ?";
  db.query(sqlCart, [id], (err) => {
    if (err) return res.status(500).json({ error: err });

    // Then delete from products
    const sqlProduct = "DELETE FROM products WHERE product_id = ?";
    db.query(sqlProduct, [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ message: "Product deleted successfully" });
    });
  });
});

app.put("/api/products/:id",upload.single("image"),(req,res)=>{
  const{name,price,category}=req.body;
  const image_url=req.file?req.file.filename:req.body.image_url;
  const sql =
    "UPDATE products SET name=?, price=?, category=?, image_url=? WHERE product_id=?";
  db.query(sql, [name, price, category, image_url, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Product updated successfully!" });
  });
});




app.post("/api/payment/orders", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: "order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).send("Error creating order");
  }
});
app.post("/api/payment/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id } = req.body;
  const sign=razorpay_order_id+"|"+razorpay_payment_id;
  const expectedSign=crypto
  .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
  .update(sign.toString())
  .digest("hex");
  if(expectedSign!==razorpay_signature)
  {
    return res.status(400).json({success:false,message:"Invalid signature"});
    
  }
 

  // ✅ Fetch cart items for user
  const cartQuery = `SELECT product_id, quantity FROM cart WHERE user_id = ?`;
  db.query(cartQuery, [user_id], (err, cartItems) => {
    if (err) {
      console.error("Cart fetch error:", err);
      return res.status(500).json({ success: false ,message:"DB error"});
    }

    if (cartItems.length === 0) {
      return res.json({ success: false, message: "Cart is empty" });
    }

    // ✅ Save each item as an order
    const insertOrderQuery = `
      INSERT INTO orders (user_id, product_id, quantity, payment_method, payment_status, status) 
      VALUES (?, ?, ?, 'razorpay', 'paid', 'placed')
    `;

    cartItems.forEach((item) => {
      db.query(insertOrderQuery, [user_id, item.product_id, item.quantity], (err2) => {
        if (err2) console.error("Error inserting order:", err2);
      });
    });

    // ✅ Clear cart
    db.query("DELETE FROM cart WHERE user_id = ?", [user_id], (err3) => {
      if (err3) console.error("Error clearing cart:", err3);
    });
    db.query("SELECT username,email FROM users WHERE user_id=?",[user_id],async(err4,results)=>{
      if(err4|| results.length===0)
      {
        console.error("Error fetching user for email:",err4);
        return res.json({success:true,message:"Order placed,but email not sent"});

      }
      const{username,email}=results[0];
      try{
        const transporter=nodemailer.createTransport({
          service:"gmail",
          auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS,
          },
        });
        const mailOptions={
          from:process.env.EMAIL_USER,
          to:email,
          subject:"Order Confirmation - My E-Commerce Store",
          html:`
            <h2>Hi ${username},</h2>
            <p>Your payment was successful!</p>
            <p>Your order has been placed successfully. Thank you for shopping with us.</p>
            <p><b>Order ID:</b> ${razorpay_order_id}</p>
            <p><b>Payment ID:</b> ${razorpay_payment_id}</p>
            <p>We will notify you once your order is shipped.</p>
            <br/>
            <p>Best Regards,<br/>E-Commerce Team</p>
          `,
        };
        await transporter.sendMail(mailOptions);
        console.log("Order confirmation email sent to",email);
      }
      catch(mailErr)
      {
        console.error("Email error: ",mailErr);

      }
      
    });

    return res.json({ success: true, message: "Order placed successfully" });
  });
});

// Get orders for a user with product details grouped by order
app.get("/api/orders/:userId", (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT o.id as order_id, o.quantity, o.payment_method, o.payment_status, o.status, o.created_at,
           p.product_id, p.name, p.price, p.image_url
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    // Group by order_id
    const grouped = {};
    results.forEach((row) => {
      if (!grouped[row.order_id]) {
        grouped[row.order_id] = {
          order_id: row.order_id,
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          status: row.status,
          created_at: row.created_at,
          products: [],
        };
      }
      grouped[row.order_id].products.push({
        product_id: row.product_id,
        name: row.name,
        price: row.price,
        image_url: row.image_url,
        quantity: row.quantity,
      });
    });

    res.json(Object.values(grouped));
  });
});
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM users WHERE user_id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "DB Error" });
    res.json(results[0]);
  });
});
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  let { username, email, phone, gender, dob, address } = req.body;
  if(dob){
    dob=new Date(dob).toISOString().split("T")[0];
  }

  db.query(
    "UPDATE users SET username=?, email=?, phone=?, gender=?, dob=?, address=? WHERE user_id=?",
    [username, email, phone, gender, dob, address, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB Error",error:err });
      res.json({ message: "Profile updated successfully!" });
    }
  );
});


app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
