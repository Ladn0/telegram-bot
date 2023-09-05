const axios = require("axios");

module.exports = async (urll, prompt, language) => {
  const postData = {
    url: urll,
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

  let str = [];

  for (let article of reply.data.result) {
    str.push(
      `${article["article-title"]} \n \n${article["article-url"]}\n\n${article["article-summary-translated"]}\n \n \n`
    );
  }

  return str;
};
