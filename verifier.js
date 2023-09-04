const axios = require("axios");

module.exports = async (urll) => {
  const headers = {
    "Content-Type": "application/json",
  };

  const pageValidity = await axios.post(
    "http://apis.buran.team/api/check-page",
    { url: urll },
    { headers }
  );

  return pageValidity.data.result.available;
};
