const sha1 = require("sha1");
const getRawBody = require("raw-body");
const tool = require("./tool");
module.exports = config => {
  return async (ctx, next) => {
    let {
      signature,
      timestamp,
      nonce,
      echostr
    } = ctx.query;
    const token = config.token;
    let str = [token, timestamp, nonce].sort().join("");
    const shaStr = sha1(str);
    if (ctx.method === "GET") {
      if (shaStr === signature) {
        ctx.body = echostr;
      } else {
        ctx.body = "Failed";
      }
    } else if (ctx.method === "POST") {
      if (shaStr !== signature) {
        return (ctx.body = "Failed");
      }
      //Buffer值
      let data = await getRawBody(ctx.req, {
        length: ctx.length,
        limit: "1mb",
        encoding: ctx.charset
      });
      let content = await tool.parseXML(data);
      let message = tool.formatMessage(content.xml);
      // content = {
      //   xml:
      //     {
      //       ToUserName: ['gh_d983a7829343'],
      //       FromUserName: ['oLvk56FuXUd228wOAGqEEySnlQVI'],
      //       CreateTime: ['1551183309'],
      //       MsgType: ['text'],
      //       Content: ['。'],
      //       MsgId: ['22207605671471755']
      //     }
      // }
      // message = {
      //     ToUserName: 'gh_d983a7829343',
      //     FromUserName: 'oLvk56FuXUd228wOAGqEEySnlQVI',
      //     CreateTime: '1551183309',
      //     MsgType: 'text',
      //     Content: '。',
      //     MsgId: '22207605671471755'
      //   }
      ctx.status = 200;
      ctx.type = "application/xml";
      ctx.body = `<xml>
                    <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                    <CreateTime>${Date.now()}</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType> 
                    <Content><![CDATA[${message.Content}]]></Content>
                  </xml>`
    }
  }
};
