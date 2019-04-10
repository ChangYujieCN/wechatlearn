const Koa = require("koa");
const { resolve } = require("path");
const bodyParser = require("koa-bodyparser");
const session = require("koa-session");
const serve = require("koa-static");
const mongoose = require("mongoose");
const moment = require("moment");
const Router = require("koa-router");
const config = require("./config");
const { initSchemas, connect } = require("./app/database/init")

;(async () => {
  await connect(config.dbUrl);

  initSchemas();
  // 生成服务器实例
  const app = new Koa();
  const router = new Router();
  const views = require("koa-views");

  // Must be used before any router is used
  app.use(views(resolve(__dirname, "app/views"), {
    extension: "pug",
    options: {
      moment: moment
    }
  }));

  app.keys = ["imooc"];
  app.use(session(app));
  app.use(bodyParser());
  app.use(serve(resolve(__dirname, "../public")));

  // 植入两个中间件，做前置的微信环境检查、跳转、回调的用户数据存储和状态同步
  const wechatController = require("./app/controllers/wechat");

  app.use(wechatController.checkWechat);
  app.use(wechatController.wechatRedirect);

  app.use(async (ctx, next) => {
    const User = mongoose.model("User");
    let user = ctx.session.user;

    if (user && user._id) {
      user = await User.findOne({ _id: user._id });

      if (user) {
        ctx.session.user = {
          _id: user._id,
          role: user.role,
          nickname: user.nickname
        };
        ctx.state = Object.assign(ctx.state, {
          user: {
            _id: user._id,
            nickname: user.nickname
          }
        });
      }
    } else {
      ctx.session.user = null;
    }

    await next();
  });

  require("./config/routes")(router);

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(config.port);
  console.log("Listen: " + config.port);
})();
