const {getOAuth, getWechat} = require("../../wechat/index");
const tool = require("../../wechat-lib/tool");
exports.getSignature = async url => {
  let client = getWechat();
  let data = await client.fetchAccessToken();
  let ticketData = await client.fetchTicket(data.access_token);
  let ticket = ticketData.ticket;
  let params = tool.sign(ticket, url);
  params.appId = client.appID;
  return params;
};

exports.getAuthorizeUrl = (scope, target, state) => {
  let oauth = getOAuth();
  return oauth.getAuthorizeUrl(scope, target, state);
};
