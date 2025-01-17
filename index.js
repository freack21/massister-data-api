const CONFIG = require("./config");
const axios = require("axios");
const express = require("express");
const app = express();
const port = CONFIG.port || 8502;
const launchChrome = require("./launch");

launchChrome()
  .then((browser) => {
    app.use(express.json());
    app.use((req, res, next) => {
      const apiKey = req.query.key;
      if (apiKey !== CONFIG.key) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      next();
    });

    app.get("/", async (req, res) => {
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

    app.get("/search", async (req, res) => {
      const keyword = req.query.q;
      if (!keyword) {
        return res.status(400).json({ message: "'q' is required!" });
      }
      const page = await browser.newPage();
      try {
        await page.goto("https://www.bing.com/search?q=" + keyword, {
          waitUntil: "networkidle2",
          timeout: 0,
        });
        const suggestion =
          (await (
            await page.$(".b_promtxt.sp_requery")
          )?.$eval("a", (node) => node.textContent)) || "";
        const results = await page.$$eval(".b_algo h2 a", (nodes) =>
          nodes.map((node) => node.textContent)
        );
        const related = await page.$$eval(".b_suggestionText", (nodes) =>
          nodes.map((node) => node.textContent)
        );
        await page.close();
        return res.json({
          suggestion,
          results,
          related,
        });
      } catch (error) {
        await page.close();
        return res.status(500).json({ message: "Internal Server Error" });
      }
    });

    app.use((req, res) => {
      return res.status(404).json({ message: "Not Found" });
    });

    app.listen(port, () => {
      console.log(`Server is running on port http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error(error);
  });
