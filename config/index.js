const {resolve} = require("path");
const config = require(resolve(__dirname, "../../../../config/config.json"));
const isProd = process.NODE_ENV === "production";

let cfg = {
  port: 9999,
  wechat: {
    appID: "wx77ed97e5c04d0a78",
    appsecret: "a1c7bf3bd5e7d4b9c71ad44e19d4ccf9",
    token: "tokenisjustatokenhehe"
  },
  dbUrl: "mongodb://localhost:27017/wechat",
  // baseUrl:"http://learnwechatcyj.vipgz1.idcfengye.com"
  baseUrl: "http://learnwechatcyj.free.idcfengye.com"
};

if (isProd) {
  cfg = {...cfg, ...config};
}

module.exports = cfg;
