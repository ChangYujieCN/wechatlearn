const Koa = require("koa");
const {initSchema, connect, initAdmin} = require("./app/database/init");
const wechat = require("./wechat-lib/middleware");
const config = require("./config");
const {reply} = require("./wechat/reply");

(async () => {
  await connect(config.dbUrl);
  initSchema();
  const {test} = require("./wechat");
  // initAdmin();
  await test();
  const app = new Koa();
  app.use(wechat(config.wechat, reply.reply));
  app.listen(config.port);
  console.log(`Listening ${config.port}`);
})();

