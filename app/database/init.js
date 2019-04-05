const mongoose = require("mongoose");
const {resolve} = require("path");
mongoose.Promise = global.Promise;
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
const glob = require("glob");
exports.initSchema = () => {
  glob.sync(resolve(__dirname, "./schema", "**/*.js")).forEach(require);
};
// 创建管理员权限
exports.initAdmin = async () => {
  const User = mongoose.model("User");
  let user = await User.findOne({
    nickname: "Roger"
  });
  if (!user) {
    const user = new User({
      nickname: "Roger",
      email: "1092622350@qq.com",
      password: "1",
      role: "admin"
    });
    await user.save();
    console.log("管理员创建完毕");
  }
};
exports.connect = (dbUrl) => {
  let maxConnectTimes = 0;
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV !== "production") {
      mongoose.set("debug", true);
    }
    mongoose.connect(dbUrl);
    mongoose.connection.on("disconnected", () => {
      maxConnectTimes++;
      if (maxConnectTimes < 5) {
        mongoose.connect(dbUrl);
      } else {
        reject(err);
        throw new Error("数据库挂了");
      }
    });
    mongoose.connection.on("error", err => {
      maxConnectTimes++;
      if (maxConnectTimes < 5) {
        mongoose.connect(dbUrl);
      } else {
        throw new Error("数据库挂了");
      }
    });
    mongoose.connection.once("open", () => {
      resolve();
      console.log("database connected successfully...");
    });
  });
};
