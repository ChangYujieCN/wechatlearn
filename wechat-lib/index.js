const fs = require("fs");
const request = require("request-promise-native");
const base = "https://api.weixin.qq.com/cgi-bin/";
const api = {
  accessToken: base + "token?grant_type=client_credential",
  temporary: {
    upload: base + "media/upload?"
  }
  // https://api.weixin.qq.com/cgi-bin/media/upload?access_token=ACCESS_TOKEN&type=TYPE
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

  static uploadMaterial(token, type, material, permanent = false) {
    let form = {};
    let url = api.temporary.upload;
    //判断是否临时素材
    if (permanent) {
      // url= api.perman
    }
    form.media = fs.createReadStream(material);
    let uploadUrl = `${url}access_token=${token}&type=${type}`;
    return {
      method: "POST",
      url: uploadUrl,
      json: true,
      formData: form
    };
  }

  async handle(operation, ...args) {
    let tokenData = await this.fetchAccessToken();
    let options = this[operation](tokenData.access_token, ...args);
    let data = await WeChat.request(options);
  }
}

module.exports = WeChat;
