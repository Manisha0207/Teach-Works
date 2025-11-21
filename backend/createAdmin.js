const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const DB_uRL = process.env.DB_URL
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
