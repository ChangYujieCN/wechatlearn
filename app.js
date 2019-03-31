const Koa = require("koa");
const Router = require("koa-router");
const {initSchema, connect, initAdmin} = require("./app/database/init");
const wechat = require("./wechat-lib/middleware");
const config = require("./config");
const {reply} = require("./wechat/reply");

(async () => {
  await connect(config.dbUrl);
  initSchema();
  // initAdmin();
  const app = new Koa();
  const router = new Router();
  require("./config/routes")(router);
  //接入微信消息中间件
  app.use(router.routes()).use(router.allowedMethods());
  app.listen(config.port);
  console.log(`Listening ${config.port}`);
})();
