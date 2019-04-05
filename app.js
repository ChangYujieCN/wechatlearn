const Koa = require("koa");
const {resolve} = require("path");
const bodyParser = require("koa-bodyparser");
const session = require("koa-session");
const moment = require("moment");
const Router = require("koa-router");
const {initSchema, connect, initAdmin} = require("./app/database/init");
const wechat = require("./wechat-lib/middleware");
const config = require("./config");
const {reply} = require("./wechat/reply");
const views = require("koa-views");
const mongoose = require("mongoose");


(async () => {
  await connect(config.dbUrl);
  initSchema();
  initAdmin();
  const app = new Koa();
  const router = new Router();
  app.use(views(resolve(__dirname + "/app/views"), {
    extension: "pug",
    options: {
      moment,
    }
  }));
  app.keys = ["imooc"];
  app.use(session(app));
  app.use(bodyParser);
  app.use(async (ctx, next) => {
    let {user} = ctx.session;
    if (user && user._id) {
      const User = mongoose.model("User");
      user = await User.findOne({_id});
      ctx.session.user = {
        _id: user._id,
        nickname: user.nickname,
      };
      ctx.state = {...ctx.state, user: {_id: user.id, nickname: user.nickname}};
    } else {
      ctx.session.user = null;
    }
  });
  require("./config/routes")(router);
  //接入微信消息中间件
  app.use(router.routes()).use(router.allowedMethods());
  app.listen(config.port);
  console.log(`Listening ${config.port}`);
})();
