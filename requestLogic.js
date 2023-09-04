const axios = require("axios");

module.exports = async (url, prompt, language) => {
  const postData = {
    url: url,
    style_preprompt: prompt,
    lang: language,
  };
  const headers = {
    "Content-Type": "application/json",
  };

  const reply = await axios.post(
    "http://apis.buran.team/api/parse-articles",
    postData,
    { headers }
  );

  let str = ``;

  reply.data.result.map(
    (article) =>
      (str += `Title of the article: ${article["article-title"]} \n \n${article["article-url"]}\n\n${article["article-summary-original"]}\n \n \n`)
  );

  return str;
};
