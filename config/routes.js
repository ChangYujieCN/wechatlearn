const Wechat = require("../app/controllers/wechat");
module.exports = router => {
  router.get("/wx-hear", Wechat.hear);
  router.post("/wx-hear", Wechat.hear);
  //跳转到授权中间服务页面
  router.get("/wx-oauth", Wechat.oauth);
  //通过code获取用户信息
  router.get("/userinfo", Wechat.userinfo);
};
