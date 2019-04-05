const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 100;
const userSchema = new Schema({
  nickname: {
    type: String,
  },
  email: {
    type: String,
    unique: true
  },
  password: String,
  openId: [String],
  unionId: String,
  address: String,
  province: String,
  country: String,
  city: String,
  gender: String,
  lockUntil: Number,
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  role: {
    type: String,
    default: "user"
  },
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    UpdatedAt: {
      type: Date,
      default: Date.now()
    }
  }
});
userSchema.virtual("isLocked").get(() => {
  return this.lockUntil && (this.lockUntil > Date.now());
});
userSchema.pre("save", function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now();
  } else {
    this.meta.updatedAt = Date.now();
  }
  next();
});
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  bcrypt.hash(this.password, SALT_WORK_FACTOR, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});
userSchema.methods = {
  comparePassword: (plaintextPassword, hashedPassword) => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plaintextPassword, hashedPassword, (err, isMatch) => {
        if (err) {
          reject(err);
        } else {
          resolve(isMatch);
        }
      });
    });
  },
  incLoginAttempts: user => {
    return new Promise((resolve, reject) => {
      if (this.lockUntil && this.lockUntil < Date.now()) {
        this.updateOne({
          $set: {
            loginAttempts: 1
          },
          //直接抹除lockUntil这个字段
          $unset: {
            lockUntil: ""
          }
        }, err => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      } else {
        let updates = {
          $inc: {
            loginAttempts: 1
          }
        };
        if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
          updates.$set = {
            lockUntil: Date.now() + LOCK_TIME
          };
        }
        this.updateOne(updates, err => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      }
    });
  }
};
mongoose.model("User", userSchema);
