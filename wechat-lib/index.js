const fs = require("fs");
const request = require("request-promise-native");
const base = "https://api.weixin.qq.com/cgi-bin/";
const api = {
  accessToken: base + "token?grant_type=client_credential",
  //临时素材上传
  temporary: {
    upload: base + "media/upload?",
    fetch: base + "media/get?",
  },
  // https://api.weixin.qq.com/cgi-bin/media/upload?access_token=ACCESS_TOKEN&type=TYPE
  //永久素材上传
  permanent: {
    upload: base + "material/add_material?", //新增其他类型永久素材
    uploadNews: base + "material/add_news?", //新增永久图文素材
    uploadNewsPic: base + "media/uploadimg?",//上传图文消息内的图片获取URL
    fetch: base + "material/get_material?",  //获取素材
    batch: base + "material/batchget_material?",//获取素材列表
    count: base + "material/get_materialcount?",//获取素材总数
    del: base + "material/del_material?",//删除永久素材
    update: base + "material/update_news?",//修改永久图文素材
  }
};


class WeChat {
  constructor(opts) {
    this.opts = Object.assign({}, opts);
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
  }

  async request(options) {
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
    if (!this.isValidToken(data)) {
      data = await this.updateAccessToken();
    }
    return data;
  }

  async updateAccessToken() {
    let url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`;
    let data = await this.request({url});
    data.expires_in = Date.now() + (data.expires_in - 20) * 1000;
    return data;
  }

  isValidToken(data) {
    if (!data || !data.expires_in) {
      return false;
    }
    return Date.now() < data.expires_in;
  }

  uploadMaterial(token, type, material, permanent = false) {
    let form = {};
    //默认是临时素材上传
    let url = api.temporary.upload;
    //判断是否临时素材 永久素材 form是个Object
    if (permanent) {
      url = api.permanent.upload;
      form = Object.assign(form, permanent);
    }
    //上传图文消息的图片素材
    if (type === "pic") {
      url = api.permanent.uploadNewsPic;
    }
    // 图文非图文的素材提交表单的切换
    // 如果是图文的话直接把material交给form表单, 如果不是的话则去读传入文件的路径
    if (type === "news") {
      url = api.permanent.uploadNews;
      form = material;
    } else {
      form.media = fs.createReadStream(material);
    }
    let uploadUrl = `${url}access_token=${token}`;
    //根据素材永久性填充token 如果是个form表单则要把token填进去
    if (!permanent) {
      uploadUrl += `&type=${type}`;
    } else {
      if (type !== "news") {
        form.access_token = token;
      }
    }
    let options = {
      method: "POST",
      url: uploadUrl,
      json: true,
    };
    //图文和非图文在request提交主体判断
    if (type === "news") {
      options.body = form;
    } else {
      options.formData = form;
    }
    return options;
  }

  async handle(operation, ...args) {
    let tokenData = await this.fetchAccessToken();
    let options = this[operation](tokenData.access_token, ...args);
    return await this.request(options);
  }

  fetchMaterial(token, mediaId, type, permanent) {
    let form = {};
    let fetchUrl = api.temporary.fetch;
    if (permanent) {
      fetchUrl = api.permanent.fetch;
    }
    let url = fetchUrl + "access_token=" + token;
    let options = {
      method: "POST",
      url,
    };
    if (permanent) {
      form.media_id = mediaId;
      form.access_token = token;
      options.body = form;
    } else {
      if (type === "video") {
        //请注意，视频文件不支持https下载，调用该接口需http协议。
        options.url = options.url.replace("https:", "http:");
      }
      options.url = options.url + "&media_id=" + mediaId;
    }
    return options;
  };

  deleteMaterial(token, mediaId) {
    let form = {
      media_id: mediaId
    };
    let url = `${api.permanent.del}access_token=${token}media_id=${mediaId}`;
    return {
      method: "POST",
      url,
      body: form
    }
  }

  updateMaterial(token, mediaId, news) {
    let form = {
      media_id: mediaId
    };
    form = {...form, ...news};
    let url = `${api.permanent.update}access_token=${token}media_id=${mediaId}`;
    return {
      method: "POST",
      url,
      body: form
    }
  }

  countMaterial(token) {
    let url = `${api.permanent.count}access_token=${token}`;
    return {
      method: "POST",
      url,
    }
  }

  batchMaterial(token, options) {
    options.type = options.type || "image";
    options.offset = options.offset || 0;
    options.count = options.count || 10;
    let url = `${api.permanent.batch}access_token=${token}`;
    return {
      method: "POST",
      url,
      body: options
    }
  }
}

module.exports = WeChat;
