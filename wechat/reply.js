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
      default:
        reply = "听不太懂(⊙o⊙)？";
        break;
    }
    ctx.body = reply;
  }
  //middleware里流程并未走完  需要next()
  await next();
};

