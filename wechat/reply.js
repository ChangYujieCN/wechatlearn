const {resolve} = require("path");
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
        console.log(data2);
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
          ]
        };
        let uploadData = await client.handle(
          "uploadMaterial",
          "news",
          media,
          {}
        );
        console.log(uploadData);
        reply = "上传成功";
        break;
      }
      case "10": {
        let counts = await client.handle("countMaterial");
        console.log(JSON.stringify(counts));
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
      default:
        reply = "听不太懂(⊙o⊙)？";
        break;
    }
    ctx.body = reply;
  }
  //middleware里流程并未走完  需要next()
  await next();
};

