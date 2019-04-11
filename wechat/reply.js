const {resolve} = require("path");
const commonMenu = require("./menu");
const config = require("../config");
const api = require("../app/api");
const help = "亲爱的，欢迎关注时光的余热\n" +
  "回复 1-2，测试文字回复\n" +
  "回复 3，测试图片回复\n" +
  "回复 首页，进入网站首页\n" +
  "回复 电影名字，查询电影信息\n" +
  "点击帮助，获取帮助信息\n" +
  "某些功能呢订阅号无权限，比如网页授权\n" +
  "回复语音，查询电影信息\n" +
  "也可以点击 <a href=\"" + config.baseUrl + "/sdk\">语音查电影</a>，查询电影信息\n";

exports.reply = async (ctx, next) => {
  let message = ctx.weixin;
  let mp = require("./index");
  let client = mp.getWechat();
  // console.log(ctx.res)
  // console.log(message)
  if (message.MsgType === "text") {
    let content = message.Content;
    let reply = `你刚说的:"${content}",太复杂了,我暂时还听不懂`;
    switch (content.trim()) {
      case "imooc": {
        let countData = await api.wechat.saveMPUser(message, "imooc");
        console.log(countData);
        let user = countData.user;
        let count = countData.count;
        let nickname = countData.nickname;
        if (user.gender === "1") {
          nickname = `小鲜肉 - ${nickname}`;
        } else {
          nickname = `小姐姐 - ${nickname}`;
        }
        let guess = "我猜不出你来自哪里, ";
        if (user.province || user.city) {
          guess = `我猜你来自${user.province}省,${user.city}市`;
        }
        let end = `${guess} 哈哈`;
        reply = `nickname:${nickname},你有${count}个小伙伴`;
        break;
      }
      case "1":
        reply = "1..";
        break;
      case "2":
        reply = "2..";
        break;
      case "3": {
        let data = await client.handle("uploadMaterial", "image", resolve(__dirname, "../2.jpg"));
        reply = {
          type: "image",
          mediaId: data.media_id
        };
        break;
      }
      case "4": {
        let data = await client.handle("uploadMaterial", "video", resolve(__dirname, "../6.mp4"));
        console.log(data);
        reply = {
          type: "video",
          title: "回复的视频标题",
          description: "打篮球",
          mediaId: data.media_id
        };
        break;
      }
      //上传永久视频
      case "5": {
        let data = await client.handle(
          "uploadMaterial",
          "video",
          resolve(__dirname, "../6.mp4"),
          {
            type: "video",
            description: JSON.stringify({
              "title": "VIDEO_TITLE",
              "introduction": "INTRODUCTION"
            }),
          }
        );
        console.log(data);
        reply = {
          type: "video",
          title: "回复的视频标题2",
          description: "打篮球",
          mediaId: data.media_id
        };
        break;
      }
      case "6": {
        let data = await client.handle(
          "uploadMaterial",
          "image",
          resolve(__dirname, "../2.jpg"),
          {type: "image"}
        );
        reply = {
          type: "image",
          mediaId: data.media_id
        };
        break;
      }
      case "7": {
        let data = await client.handle(
          "uploadMaterial",
          "image",
          resolve(__dirname, "../2.jpg"),
          {type: "image"}
        );
        let data2 = await client.handle(
          "uploadMaterial",
          "pic",
          resolve(__dirname, "../2.jpg"),
          {type: "image"}
        );
        let media = {
          articles: [
            {
              title: "这是服务端上传的图文1",
              thumb_media_id: data.media_id,
              author: "Chang",
              digest: "这就是摘要",
              show_cover_pic: 1,
              content: "点击去往百度",
              content_source_url: "https://www.baidu.com/",
              need_open_comment: 1,
              only_fans_can_comment: 1
            },
            {
              title: "这是服务端上传的图文2",
              thumb_media_id: data.media_id,
              author: "Chang",
              digest: "这就是摘要",
              show_cover_pic: 1,
              content: "点击去往github",
              content_source_url: "https://github.com/",
              need_open_comment: 1,
              only_fans_can_comment: 1
            },
            //若新增的是多图文素材，则此处应还有几段articles结构
            //微信更新后貌似只能被动回复一条数据
          ]
        };
        let uploadData = await client.handle(
          "uploadMaterial",
          "news",
          media,
          {}
        );
        let newMedia = {
          index: 0,
          media_id: uploadData.media_id,
          articles: {
            title: "这是服务端上传的图文1",
            thumb_media_id: data.media_id,
            author: "Chang",
            digest: "这就是摘要",
            show_cover_pic: 1,
            content: "点击去往百度",
            content_source_url: "https://www.baidu.com/",
            need_open_comment: 1,
            only_fans_can_comment: 1
          }
        };
        let mediaData = await client.handle(
          "updateMaterial",
          uploadData.media_id,
          newMedia
        );
        console.log(mediaData);
        let newsData = await client.handle(
          "fetchMaterial",
          uploadData.media_id,
          "news",
          true
        );
        let items = newsData.news_item;
        let news = [];
        items.forEach(item => {
          news.push({
            title: item.title,
            description: item.description,
            picUrl: data2.url,
            url: item.url
          });
        });
        reply = news;
        break;
      }
      case "8": {
        let counts = await client.handle("countMaterial");
        let res = await Promise.all([
          client.handle("batchMaterial", {
            type: "image",
            offset: 0,
            count: 10
          }),
          client.handle("batchMaterial", {
            type: "video",
            offset: 0,
            count: 10
          }),
          client.handle("batchMaterial", {
            type: "voice",
            offset: 0,
            count: 10
          }),
          client.handle("batchMaterial", {
            type: "news",
            offset: 0,
            count: 10
          }),
        ]);
        console.log(res);
        reply = `
          image: ${res[0].total_count}
          video: ${res[1].total_count}
          voice: ${res[2].total_count}
          news: ${res[3].total_count}
        `;
        break;
      }
      case "9": {
        //标签的测试 https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140837
        // let newTag = await client.handle("createTag","new")
        // await client.handle("delTag",100);
        // await client.handle("updateTag",101,"newnewTag");
        // let batchData = await client.handle("batchTag", [message.FromUserName], 2);
        await client.handle("batchUntag", [message.FromUserName], 2);
        let userList = await client.handle("fetchTagUsers", 2);
        let userList2 = await client.handle("fetchTagUsers", 101);
        let data = await client.handle("fetchTags");
        // let userTags = await client.handle("getUserTags", message.FromUserName);
        reply = data.tags.length;
        break;
      }
      case "10": {
        let data = await client.handle("getUserList");
        console.log(data);
        reply = data.total + "个关注者";
        break;
      }
      case "11": {
        let data = await client.handle("remarkUser", message.FromUserName, "Roger");
        if (data.errcode === 0) {
          reply = "备注成功";
        } else {
          reply = "备注失败";
        }
        break;
      }
      case "12": {
        let UserData = await client.handle("getUserInfo", message.FromUserName);
        if (UserData && UserData.openid) {
          reply = JSON.stringify(UserData);
        }
        break;
      }
      //测试批量获取用户数据
      case "13": {
        let data = await client.handle(
          "batchGetUserInfo",
          [
            {
              openid: message.FromUserName,
              lang: "zh_CN"
            },
          ]
        );
        if (data && data.user_info_list.length > 0) {
          reply = JSON.stringify(data);
        }
        break;
      }
      case "14": {
        let tempQRData = {
          "expire_seconds": 604800,
          "action_name": "QR_SCENE",
          "action_info": {"scene": {"scene_id": 123}}
        };
        let ticketData = await client.handle("createQRCodeTicket", tempQRData);
        let tempQRCodeUrl = client.showQRCode(ticketData.ticket);
        console.log(tempQRCodeUrl);
        reply = "二维码URL: " + tempQRCodeUrl;
        break;
      }
      case "15": {
        let longUrl = "https://coding.imooc.com/class/321.html?mc_marking=2930925e59b139366b87988853e7a0c4&mc_channel=banner";
        let data = await client.handle("createShortUrl", longUrl);
        if (data.errcode === 0) {
          reply = data.short_url;
        } else {
          reply = "获取短链接失败";
        }
        break;
      }
      case "16": {
        let semanticData = {
          query: "查一下明天从北京到上海的南航机票",
          city: "北京",
          category: "flight,hotel",
          appid: "wxaaaaaaaaaaaaaaaa",
          uid: message.FromUserName
        };
        let searchData = await client.handle("semantic", semanticData);
        if (searchData.errcode === 0) {
          reply = JSON.stringify(searchData);
        } else {
          reply = "语义理解失败";
        }
        break;
      }
      case "17": {
        let content = "翻译一下这句话";
        let data = await client.handle("aiTranslate", content, "zh_CN", "en_US");
        reply = `原文本:${data.from_content},翻译后文本:${data.to_content}`;
        break;
      }
      case "18": {
        let menu = {
          button: [
            {
              name: "一级菜单",
              sub_button: [
                {
                  name: "二级菜单 1",
                  type: "click",
                  key: "no_1",
                },
                {
                  name: "二级菜单 2",
                  type: "click",
                  key: "no_2",
                },
                {
                  name: "二级菜单 3",
                  type: "click",
                  key: "no_3",
                }
              ]
            },
            {
              name: "分类",
              type: "view",
              url: "https://www.imooc.com"
            },
            {
              name: "新菜单" + Math.random(),
              type: "click",
              key: "new_111"
            },
          ]
        };
        let data = await client.handle("createMenu", menu);
        if (data.errcode === 0) {
          reply = "菜单创建成功,请等待5分钟,或者取消关注并重新关注";
        }
        break;
      }
      case "19": {
        let data = await client.handle("deleteMenu");
        if (data.errcode === 0) {
          reply = "菜单删除成功,请等待5分钟,或者取消关注并重新关注";
        }
        break;
      }
      case "20": {
        let menu = {
          button: [
            {
              name: "发图扫码",
              sub_button: [
                {
                  name: "系统拍照",
                  type: "pic_sysphoto",
                  key: "no_1",
                },
                {
                  name: "拍照或者发图",
                  type: "pic_photo_or_album",
                  key: "no_2",
                },
                {
                  name: "微信相册发图",
                  type: "pic_weixin",
                  key: "no_3",
                },
                {
                  name: "扫码",
                  type: "scancode_push",
                  key: "no_3",
                },
                {
                  name: "等待中扫码",
                  type: "scancode_waitmsg",
                  key: "no_3",
                },
              ]
            },
            {
              name: "跳新连接",
              type: "view",
              url: "https://www.imooc.com"
            },
            {
              name: "其他",
              sub_button: [
                {
                  name: "系统拍照",
                  type: "pic_sysphoto",
                  key: "no_11",
                },
                {
                  name: "地理位置",
                  type: "location_select",
                  key: "no_12",
                },
              ]
            },
          ]
        };
        let data = await client.handle("createMenu", menu);
        if (data.errcode === 0) {
          reply = "菜单创建成功,请等待5分钟,或者取消关注并重新关注";
        }
        break;
      }
      case "21": {
        let menu = {
          button: [
            {
              name: "Scan",
              sub_button: [
                {
                  name: "系统拍照",
                  type: "pic_sysphoto",
                  key: "no_1",
                },
                {
                  name: "拍照或者发图",
                  type: "pic_photo_or_album",
                  key: "no_2",
                },
                {
                  name: "微信相册发图",
                  type: "pic_weixin",
                  key: "no_3",
                },
                {
                  name: "扫码",
                  type: "scancode_push",
                  key: "no_3",
                },
                {
                  name: "等待中扫码",
                  type: "scancode_waitmsg",
                  key: "no_3",
                },
              ]
            },
            {
              name: "跳新连接",
              type: "view",
              url: "https://www.imooc.com"
            },
            {
              name: "其他",
              sub_button: [
                {
                  name: "系统拍照",
                  type: "pic_sysphoto",
                  key: "no_11",
                },
                {
                  name: "地理位置",
                  type: "location_select",
                  key: "no_12",
                },
              ]
            },
          ]
        };
        let matchRule = {
          // "tag_id": "2",
          // "sex": "1",
          // "country": "中国",
          // "province": "广东",
          // "city": "广州",
          // "client_platform_type": "2",
          "language": "en"
        };
        let data = await client.handle("customMenu", menu, matchRule);
        let menuData = await client.handle("fetchMenu");

        console.log(JSON.stringify(menuData));
        break;
      }
      case "更新菜单": {
        try {
          let delData = await client.handle("deleteMenu");
          let createData = await client.handle("createMenu", commonMenu);
        } catch (e) {
          console.log(e);
        }
        reply = "菜单创建成功,请等待5分钟,或者取消关注并重新关注";
        break;
      }
      case "首页": {
        reply = [{
          title: "时光的余热",
          description: "匆匆岁月",
          picUrl: "https://imoocday7.oss-cn-beijing.aliyuncs.com/WX20180701-224844.png",
          url: config.baseUrl
        }];
        break;
      }
      default: {
        let movies = await api.movie.searchByKeyword(content);
        reply = [];

        if (!movies || movies.length === 0) {
          let catData = await api.movie.findMoviesByCat(content);

          if (catData) {
            movies = catData.movies;
          }
        }

        if (!movies || movies.length === 0) {
          movies = await api.movie.searchByDouban(content);
        }

        if (!movies || movies.length) {
          movies = movies.slice(0, 4);

          movies.forEach(movie => {
            reply.push({
              title: movie.title,
              description: movie.summary,
              picUrl: movie.poster.indexOf("http") > -1 ? movie.poster : (config.baseUrl + "/upload/" + movie.poster),
              url: config.baseUrl + "/movie/" + movie._id
            });
          });
        } else {
          reply = "没有查询到与 " + content + " 相关的电影，要不要换一个名字试试看哦！";
        }
        break;
      }

    }
    ctx.body = reply;
  }
  //middleware里流程并未走完  需要next()
  //测试定位功能 注意只有公众号可用
  if (message.MsgType === "voice") {
    console.log(JSON.stringify(message));
    let content = message.Recognition;
    let reply = "";
    let movies = await api.movie.searchByKeyword(content);
    reply = [];

    if (!movies || movies.length === 0) {
      let catData = await api.movie.findMoviesByCat(content);

      if (catData) {
        movies = catData.movies;
      }
    }

    if (!movies || movies.length === 0) {
      movies = await api.movie.searchByDouban(content);
    }

    if (!movies || movies.length) {
      movies = movies.slice(0, 4);

      movies.forEach(movie => {
        reply.push({
          title: movie.title,
          description: movie.summary,
          picUrl: movie.poster.indexOf("http") > -1 ? movie.poster : (config.baseUrl + "/upload/" + movie.poster),
          url: config.baseUrl + "/movie/" + movie._id
        });
      });
    } else {
      reply = "没有查询到与 " + content + " 相关的电影，要不要换一个名字试试看哦！";
    }

    ctx.body = reply;
  } else if (message.MsgType === "event") {
    let reply = "";
    switch (message.Event) {
      //有部分消息会收不到
      //文档 自定义菜单>自定义菜单事件推送  消息管理>接受事件推送
      case "LOCATION":
        reply = `您上报的位置是:${message.Latitude}-${message.Longitude}-${message.Precision};`;
        break;
      case "CLICK": {
        switch (message.EventKey) {
          case "help": {
            reply = help;
            break;
          }
          case "movie_hot": {
            let movies = await api.movie.findHotMovies(-1, 4);
            reply = [];
            movies.forEach(movie => {
              reply.push({
                title: movie.title,
                description: movie.summary,
                picUrl: movie.poster.includes("http") ? movie.poster : (config.baseUrl + "/upload/" + movie.poster),
                url: config.baseUrl + "/movie/" + movie._id,
              });
            });
            break;
          }
          case "movie_cold": {
            let movies = await api.movie.findHotMovies(1, 4);
            reply = [];
            movies.forEach(movie => {
              reply.push({
                title: movie.title,
                description: movie.summary,
                picUrl: movie.poster.includes("http") ? movie.poster : (config.baseUrl + "/upload/" + movie.poster),
                url: config.baseUrl + "/movie/" + movie._id,
              });
            });
            break;
          }
          case "movie_sci": {
            let movies = await api.movie.findMoviesByCat("科幻") || [];
            reply = [];
            movies.forEach(movie => {
              reply.push({
                title: movie.title,
                description: movie.summary,
                picUrl: movie.poster.includes("http") ? movie.poster : (config.baseUrl + "/upload/" + movie.poster),
                url: config.baseUrl + "/movie/" + movie._id,
              });
            });
            break;
          }
          case "movie_love": {
            let movies = await api.movie.findMoviesByCat("爱情") || [];
            reply = [];
            movies.forEach(movie => {
              reply.push({
                title: movie.title,
                description: movie.summary,
                picUrl: movie.poster.includes("http") ? movie.poster : (config.baseUrl + "/upload/" + movie.poster),
                url: config.baseUrl + "/movie/" + movie._id,
              });
            });
            break;
          }
          default:
            break;
        }
      }
        console.log(`你点击了菜单的: ${message.EventKey}`);
        break;
      case "VIEW":
        reply = `你点击了菜单链接 ${message.EventKey} ${message.MenuId}`;
        break;
      case "scancode_push":
        reply = `你扫码了: ${message.ScanCodeInfo} ${message.ScanCodeInfo.ScanResult}`;
        break;
      case "scancode_waitmsg":
        reply = `你扫码了: ${message.ScanCodeInfo} ${message.ScanCodeInfo.ScanResult}`;
        break;
      case "pic_sysphoto":
        reply = `系统拍照: ${message.SendPicsInfo.count} ${JSON.stringify(message.SendPicsInfo.PicList)}`;
        break;
      case "pic_photo_or_album":
        reply = `拍照或者相册: ${message.SendPicsInfo.count} ${JSON.stringify(message.SendPicsInfo.PicList)}`;
        break;
      case "pic_wexin":
        reply = `微信相册发图: ${message.SendPicsInfo.count} ${JSON.stringify(message.SendPicsInfo.PicList)}`;
        break;
      case "location_select":
        console.log(message);
        reply = "地理位置";
        break;
      case "subscribe":
        reply = "欢迎订阅";
        break;
      case "unsubscribe":
        reply = "取消订阅";
        break;
      case "SCAN":
        reply = `关注后扫二维码 扫码参数:${message.EventKey} ${message.Ticket}`;
        break;
      case "image":
        console.log(message.PicUrl);
    }
    ctx.body = reply;
  }
  await next();
};

