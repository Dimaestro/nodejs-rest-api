const app = require("./app");

const mongoose = require("mongoose");

require('dotenv').config();

mongoose
  .connect(process.env.DB_HOST)
  .then(() => {
    console.log('Database connection successful');
    app.listen(process.env.PORT, () => {
      console.log("Server running. Use our API on port: 3000");
    });
  })
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });

// n8yQLZ82JsvOzKeJ vidi
