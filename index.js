const PORT = 8000;
import express from "express";
import axios from "axios";
import cors from "cors";
import * as cheerio from "cheerio";
const app = express();
app.use(express.json());
app.use(cors());
const newspapers = [
  {
    name: "bbc",
    address: "https://indianexpress.com/section/lifestyle/health",
    base: "",
  },
];

const articles = [];

newspapers.forEach((newspaper) => {
  axios
    .get(newspaper.address)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      $("div.articles").each(function () {
        const anchor = $(this).find("a");
        const link = anchor.attr("href");
        const text = anchor.text().trim();
        const image =
          $(this).find("img.lazyloading").attr("data-src") ||
          $(this).find("img.lazyloading").attr("src");
        const title = $(this).find("h2.title").text().trim();
        const description = $(this).find("p").text().trim();
        const date = $(this).find("div.date").text().trim();

        if (link && title) {
          articles.push({
            link: link.startsWith("http") ? link : newspaper.base + link,
            text,
            image: image,
            title,
            date,
            description,
            source: newspaper.name,
          });
        }
      });
    })
    .catch((err) => console.log(err));
});

app.get("/", (req, res) => {
  res.json("Welcome to my Scrapper API");
});
app.get("/proxy-image", async (req, res) => {
  const imageUrl = req.query.url;
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    const contentType = response.headers["content-type"];
    res.set("Content-Type", contentType);
    res.send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching image");
  }
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
