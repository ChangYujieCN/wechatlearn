const xml2js = require("xml2js");
const template = require("./tpl");
const parseXML = xml => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, {trim: true}, (err, content) => {
      if (err) reject(err);
      else resolve(content);
    })
  })
};

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
// formatMessage(content.xml)
const formatMessage = result => {
  let message = {};
  if (typeof result === "object") {
    let keys = Object.keys(result);
    for (let i = 0; i < keys.length; i++) {
      let item = result[keys[i]];
      let key = keys[i];
      if (!(item instanceof Array) || item.length === 0) {
        continue
      }
      if (item.length === 1) {
        let val = item[0];
        if (typeof val === "object") {
          message[key] = formatMessage(val);
        } else {
          message[key] = (val || "").trim();
        }
      } else {
        message[key] = [];
        for (let j = 0; j < item.length; j++) {
          message[key].push(formatMessage(item[j]));
        }
      }
    }
  }
  return message;
};
const tpl = (content, message) => {
  let type = "text";
  if (Array.isArray(content)) {
    type = "news";
  }
  if (!content) content = "Empty News";
  if (content && content.type) {
    //非图文 非纯文本
    //视频或者语音
    type = content.type;
  }
  let info = Object.assign({}, {
    content,
    msgType: type,
    createTime: Date.now(),
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName
  });
  return template(info);
};


module.exports.formatMessage = formatMessage;
module.exports.parseXML = parseXML;
module.exports.tpl = tpl;
