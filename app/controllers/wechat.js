const {reply} = require("../../wechat/reply");
const config = require("../../config/");
const wechatMiddleware = require("../../wechat-lib/middleware");
const {getOAuth} = require("../../wechat/index");
//接入微信中间件
exports.hear = async (ctx, next) => {
  let middleware = wechatMiddleware(config.wechat, reply);
  await middleware(ctx, next);
};
exports.oauth = async (ctx, next) => {
  let oauth = getOAuth();
  let target = config.baseUrl + "/userinfo";
  let scope = "snsapi_userinfo";
  let state = ctx.query.id;
  let url = oauth.getAuthorizeUrl(scope, target, state);
  ctx.redirect(url);
};
exports.userinfo = async (ctx, next) => {
  let oauth = getOAuth();
  let code = ctx.query.code;
  let data = await oauth.fetchAccessToken(code);
  ctx.body = await oauth.getUserInfo(data.access_token, data.openid);
};
exports.sdk = async (ctx, next) => {
  await ctx.render("wechat/sdk", {
    title: "SDK Test",
    desc: "测试 SDK"
  });
};
