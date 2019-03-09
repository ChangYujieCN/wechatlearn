const Wechat = require("../wechat-lib");
const config = require("../config");
const mongoose = require("mongoose");
const Token = mongoose.model("Token");

const wechatCfg = {
  wechat: {
    appID: config.wechat.appID,
    appSecret: config.wechat.appsecret,
    token: config.wechat.token,
    getAccessToken: async () => {
      return await Token.getAccessToken();

    },
    saveAccessToken: async (data) => {
      return await Token.saveAccessToken(data);
    }
  }
};
exports.getWechat = () => {
  return new Wechat(wechatCfg.wechat);
};

