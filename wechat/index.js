const Wechat = require("../wechat-lib");
const WechatOAuth = require("../wechat-lib/oauth");
const config = require("../config");
const mongoose = require("mongoose");
const Token = mongoose.model("Token");
const Ticket = mongoose.model("Ticket");

const wechatCfg = {
  wechat: {
    appID: config.wechat.appID,
    appSecret: config.wechat.appsecret,
    token: config.wechat.token,
    getAccessToken: async () => {
      return Token.getAccessToken();
    },
    saveAccessToken: async (data) => {
      return Token.saveAccessToken(data);
    },
    getTicket: async () => {
      return Ticket.getTicket();

    },
    saveTicket: async (data) => {
      return Ticket.saveTicket(data);
    }
  }
};
exports.getWechat = () => new Wechat(wechatCfg.wechat);
exports.getOAuth = () => new WechatOAuth(wechatCfg.wechat);

