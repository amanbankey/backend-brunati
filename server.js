require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const dotenv = require('dotenv');


dotenv.config()

// console.log('env ifl', process.env.MONGO_URL)
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  