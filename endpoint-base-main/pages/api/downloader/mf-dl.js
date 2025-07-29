import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ 
      creator: "Zypher",
      error: "url belum di masukin ( url=https://exemple.com belum ada )" 
    });
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const judul = $('body > div.mf-dlr.page.ads-alternate > div.content > div.center > div > div.dl-btn-cont > div.dl-btn-labelWrap > div.promoDownloadName.notranslate > div').text();
    const size = $('body > div.mf-dlr.page.ads-alternate > div.content > div.center > div > div.dl-info > ul > li:nth-child(1) > span').text();
    const upload_date = $('body > div.mf-dlr.page.ads-alternate > div.content > div.center > div > div.dl-info > ul > li:nth-child(2) > span').text();
    const link = $('#downloadButton').attr('href');

    if (!link) {
      return res.status(404).json({ 
        creator: "Zypher",
        error: "Download link not found. Make sure the URL is a valid MediaFire download page." 
      });
    }

    const response = {
      creator: "Zypher",
      judul: link.split('/')[5],
      upload_date,
      size,
      mime: link.split('/')[5].split('.')[1],
      link
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ 
      creator: "Zypher",
      error: "api failed", 
      detail: error.message });
  }
}
