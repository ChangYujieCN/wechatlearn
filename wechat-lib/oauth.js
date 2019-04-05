//1. 用户访问网页 /a
//2. 服务器二跳网页地址 /b?state&appid 各种参数追加
//3. 跳到微信授权也,用户主动授权,调回来到 /a?code
//4. 通过code获取token code => wechat => access_token,openid
//5. 通过token+openid换取用户资料
// 文档 https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842
const base = "https://api.weixin.qq.com/sns/";
const request_native = require("request-promise-native");
const api = {
  authorize: "https://open.weixin.qq.com/connect/oauth2/authorize?",
  access_token: `${base}oauth2/access_token?`,
  userInfo: `${base}userinfo?`
};

class WechatOauth {
  constructor(opts) {
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
  }

  async request(options) {
    options = {...options, json: true};
    try {
      return request_native(options);
    } catch (e) {
      throw new Error(e);
    }
  }

  //详细信息/主动授权: snsapi_userinfo
  //基本信息/静默授权: snsapi_base
  getAuthorizeUrl(scope = "snsapi_userinfo", target, state) {
    return `${api.authorize}appid=${this.appID}&redirect_uri=${encodeURIComponent(target)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
  }

  async fetchAccessToken(code) {
    let url = `${api.access_token}appid=${this.appID}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`;
    return this.request({url});
  }

  async getUserInfo(token, openID, lang = "zh_CN") {
    let url = `${api.userInfo}access_token=${token}&openid=${openID}&lang=${lang}`;
    return this.request({url});
  }
}

module.exports = WechatOauth;
