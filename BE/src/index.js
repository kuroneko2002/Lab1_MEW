const express = require("express");
require('dotenv').config();
const { PORT } = require("./infrastructure/config/config");
const expressApp = require("./interfaces/http/app");
const cors = require("cors"); // Import the cors package

const StartServer = async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  await expressApp(app);

  app
    .listen(PORT, () => {
      console.log(`User service listening on port ${PORT}`);
    })
    .on("error", (err) => {
      console.log(err);
      process.exit();
    });
};

StartServer();
