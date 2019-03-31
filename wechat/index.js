const Wechat = require("../wechat-lib");
const WechatOAuth = require("../wechat-lib/oauth");
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
exports.getWechat = () => new Wechat(wechatCfg.wechat);
exports.getOAuth = () => new WechatOAuth(wechatCfg.wechat);

