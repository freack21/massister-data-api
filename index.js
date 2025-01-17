const CONFIG = require("./config");
const axios = require("axios");
const express = require("express");
const app = express();
const port = CONFIG.port || 8502;

app.use(express.json());

app.get("/", async (req, res) => {
  const apiKey = req.query.key;
  if (apiKey !== CONFIG.key) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const response = await axios.get(CONFIG.service_url);
    let data = response.data || [];
    data = data.map((item) => {
      return `https://drive.google.com/uc?export=download&id=${item}`;
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
