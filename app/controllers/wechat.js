const {reply} = require("../../wechat/reply");
const config = require("../../config/");
const wechatMiddleware = require("../../wechat-lib/middleware");
const api = require("../api");
//接入微信中间件
exports.hear = async (ctx, next) => {
  let middleware = wechatMiddleware(config.wechat, reply);
  await middleware(ctx, next);
};
exports.oauth = async (ctx, next) => {
  let target = config.baseUrl + "/userinfo";
  let scope = "snsapi_userinfo";
  let state = ctx.query.id;
  let url = api.wechat.getAuthorizeUrl(scope, target, state);
  ctx.redirect(url);
};
exports.userinfo = async (ctx, next) => {
  let oauth = getOAuth();
  let code = ctx.query.code;
  let data = await oauth.fetchAccessToken(code);
  ctx.body = await oauth.getUserInfo(data.access_token, data.openid);
};
exports.sdk = async (ctx, next) => {
  let params = await api.wechat.getSignature(ctx.href);
  await ctx.render("wechat/sdk", params);
};
