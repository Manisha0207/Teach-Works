const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// PUT YOUR ACTUAL MONGO URL HERE:
const DB_URL = 'mongodb+srv://manisha7022004_db_user:Fv2FvJkZI16wEEGo@cluster0.dmyyu24.mongodb.net/';

mongoose.connect(DB_URL).then(async () => {
  const hash = await bcrypt.hash("admin", 10);

  await mongoose.connection.collection("users").insertOne({
    email: "admin@gmail.com",
    name: "Admin",
    department: "Administration",
    subject: [],
    age: 30,
    roles: "admin",
    password: hash,
    admissionStatus: true
  });

  console.log("Admin created successfully");
  process.exit();
});
