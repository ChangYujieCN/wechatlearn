const {reply} = require("../../wechat/reply");
const config = require("../../config/");
const wechatMiddleware = require("../../wechat-lib/middleware");
const api = require("../api");
//接入微信中间件
exports.getSDKSignature = async (ctx, next) => {
  let url = ctx.query.url;

  url = decodeURIComponent(url);

  const params = await api.wechat.getSignature(url);

  ctx.body = {
    success: true,
    data: params
  };
};
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

function isWechat (ua) {
  return ua.indexOf("MicroMessenger") >= 0;
}

exports.checkWechat = async (ctx, next) => {
  const ua = ctx.headers["user-agent"];
  const code = ctx.query.code;

  // 所有的网页请求都会流经这个中间件，包括微信的网页访问
  // 针对 POST 非 GET 请求，不走用户授权流程
  if (ctx.method === "GET") {
    // 如果参数带 code，说明用户已经授权
    if (code) {
      await next();
      // 如果没有 code，且来自微信访问，就可以配置授权的跳转
    } else if (isWechat(ua)) {
      const target = ctx.href;
      const scope = "snsapi_userinfo";
      const url = api.wechat.getAuthorizeURL(scope, target, "fromWechat");

      ctx.redirect(url);
    } else {
      await next();
    }
  } else {
    await next();
  }
};

exports.wechatRedirect = async (ctx, next) => {
  const { code, state } = ctx.query;

  if (code && state === "fromWechat") {
    const userData = await api.wechat.getUserinfoByCode(code);
    const user = await api.wechat.saveWechatUser(userData);

    ctx.session.user = {
      _id: user._id,
      role: user.role,
      nickname: user.nickname
    };

    ctx.state = Object.assign(ctx.state, {
      user: {
        _id: user._id,
        role: user.role,
        nickname: user.nickname
      }
    });
  }

  await next();
};
