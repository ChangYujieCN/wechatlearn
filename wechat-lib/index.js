const fs = require("fs");
const request_native = require("request-promise-native");
const base = "https://api.weixin.qq.com/cgi-bin/";
const mpBase = "https://mp.weixin.qq.com/cgi-bin/";

const semanticUrl = "https://api.weixin.qq.com/semantic/semproxy/search?";
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
  },
  tag: {
    create: base + "tags/create?",
    fetch: base + "tags/get?",
    update: base + "tags/update?",
    del: base + "tags/delete?",
    fetchUsers: base + "user/tag/get?",
    batchTag: base + "tags/members/batchtagging?",
    batchUntag: base + "tags/members/batchuntagging?",
    getUserTags: base + "tags/getidlist?",
  },
  user: {
    fetch: base + "user/get?",
    remark: base + "user/info/updateremark?",
    info: base + "user/info?",
    batch: `${base}user/info/batchget?`,
  },
  qrcode: {
    create: `${base}qrcode/create?`,
    show: `${mpBase}showqrcode?`
  },
  shortUrl: {
    create: base + "shorturl?"
  },
  //语义接口
  semanticUrl,
  ai: {
    translate: `${base}media/voice/translatecontent?`
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
    options = {...options, json: true};
    try {
      return await request_native(options);
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

  createTag(token, name) {
    let body = {
      tag: {
        name
      }
    };
    let url = api.tag.create + "access_token=" + token;
    return {
      method: "POST",
      url,
      body
    };
  }

  fetchTags(token) {
    let url = `${api.tag.fetch}access_token=${token}`;
    return {url};
  }

  updateTag(token, id, name) {
    let body = {
      tag: {
        id,
        name
      }
    };
    let url = api.tag.update + "access_token=" + token;
    return {
      method: "POST",
      url,
      body
    };
  }

  delTag(token, id) {
    let body = {
      tag: {
        id
      }
    };
    let url = api.tag.del + "access_token=" + token;
    return {
      method: "POST",
      url,
      body
    };
  }

  fetchTagUsers(token, id, openId) {
    let body = {
      tagid: id,
      next_openid: openId || ""
    };
    let url = api.tag.fetchUsers + "access_token=" + token;
    return {
      method: "POST",
      url,
      body
    };
  }

  batchTag(token, openidList, id) {
    let body = {
      openid_list: openidList,
      tagid: id
    };
    let url = api.tag.batchTag + "access_token=" + token;
    return {
      method: "POST",
      url,
      body
    };
  }

  batchUntag(token, openidList, id) {
    let body = {
      openid_list: openidList,
      tagid: id
    };
    let url = api.tag.batchUntag + "access_token=" + token;
    return {
      method: "POST",
      url,
      body
    };
  }

  getUserTags(token, openId) {
    let body = {
      openid: openId,
    };
    let url = api.tag.getUserTags + "access_token=" + token;
    return {
      method: "POST",
      url,
      body
    };
  }

  getUserList(token, openId) {
    let url = api.user.fetch + "access_token=" + token + "&next_openid=" + (openId || "");
    return {
      url,
    };
  }

  //注意  订阅号不支持
  remarkUser(token, openId, remark) {
    let body = {
      openid: openId,
      remark
    };
    let url = api.user.remark + "access_token=" + token;
    return {
      method: "POST",
      url,
      body,
    };
  }

  getUserInfo(token, openId, lang = "zh_CN") {
    let url = api.user.info + "access_token=" + token + "&openid=" + openId + "&lang=" + lang;
    return {url};
  }

  //批量获取用户信息
  batchGetUserInfo(token, openIdList) {
    let body = {
      user_list: openIdList
    };
    let url = `${api.user.batch}access_token=${token}`;
    return {
      method: "POST",
      url,
      body,
    }
  }

  //创建二维码ticket
  createQRCodeTicket(token, qr) {
    let url = `${api.qrcode.create}access_token=${token}`;
    return {
      method: "POST",
      url,
      body: qr,
    }
  }

  //通过ticket换取二维码
  showQRCode(ticket) {
    return api.qrcode.show + "ticket=" + encodeURI(ticket);
  }

  //长连接转短链接

  createShortUrl(token, longUrl) {
    let body = {
      action: "long2short",
      long_url: longUrl
    };
    let url = `${api.shortUrl.create}access_token=${token}`;
    return {
      method: "POST",
      url,
      body,
    }
  }

  semantic(token, semanticData) {
    let url = `${api.semanticUrl}access_token=${token}`;
    semanticData.appid = this.appID;
    return {
      method: "POST",
      url,
      body: semanticData,
    }
  }

  //AI接口
  aiTranslate(token, content, lfrom, lto) {
    let url = `${api.ai.translate}access_token=${token}&lfrom=${lfrom}&lto=${lto}`;
    return {
      method: "POST",
      url,
      body: content,
    }
  }
}

module.exports = WeChat;
