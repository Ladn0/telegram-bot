const urlPattern = /^https?:\/\/.*/;
let str = "https://sometext.com";
const form = urlPattern.test(str);
if (form == false) str = "https://" + str;
console.log(str);
