const request = require("request-promise-native");
const base = "https://api.weixin.qq.com/cgi-bin/";
const api = {
  accessToken: base + "token?grant_type=client_credential",
};

class WeChat {
  constructor(opts) {
    this.opts = Object.assign({}, opts);
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    // this.fetchAccessToken();
  }

  static async request(options) {
    options = Object.assign({}, options, {json: true});
    try {
      return await request(options);
    } catch (e) {
      throw new Error(e);
    }
  }
  //1.检查数据库token是否过期
  //2.过期则刷新
  //3.token入库
  async fetchAccessToken() {
    let data = await this.getAccessToken();
    if (!WeChat.isValidToken(data)) {
      data = await this.updateAccessToken();
    }
    return data;
  }

  async updateAccessToken() {
    let url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`;
    let data = await WeChat.request({url});
    data.expires_in = Date.now() + (data.expires_in - 20) * 1000;
    return data;
  }

  static isValidToken(data) {
    if (!data || !data.expires_in) {
      return false;
    }
    return Date.now() < data.expires_in;
  }
}

module.exports = WeChat;
