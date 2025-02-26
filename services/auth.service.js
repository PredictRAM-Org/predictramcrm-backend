const bcrypt = require("bcrypt");
const UserService = require("./user.service");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const localStrategy = require("passport-local").Strategy;

module.exports = class AuthService {
  /**
   * @param {PassportStatic} passport
   */
  constructor(passport) {
    this.loginWithEmailPassword(passport);

    passport.serializeUser((user, cb) => {
      cb(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
      try {
        const user = await UserService.getOneUser({ _id: id });
        done(null, user);
      } catch (err) {
        done(err, false);
      }
    });
  }

  /**
   *
   * @param {PassportStatic} passport
   * @description Used for login with email password
   */
  loginWithEmailPassword(passport) {
    passport.use(
      "login-email-password",
      new localStrategy(
        {
          usernameField: "email",
          passwordField: "password",
        },
        async (email, password, done) => {
          try {
            const user = await UserService.getOneUser({ email });
            if (!user)
              done(
                new ApiError(httpStatus.BAD_REQUEST, "Invalid Credential"),
                false
              );
            const isPasswordMatch = bcrypt.compareSync(
              password,
              user?.password
            );
            if (!isPasswordMatch)
              done(
                new ApiError(httpStatus.BAD_REQUEST, "Invalid Credential"),
                false
              );
            done(null, user);
          } catch (err) {
            done(err, false);
          }
        }
      )
    );
  }

  static async register(payload, organization, options = {}) {
    try {
      const modifiedPayload = payload.map((user) => ({
        ...user,
        password: this.hashUserPassword(user?.password),
        organization: organization,
        username: user?.email
      }));
      const user = await UserService.createUser(modifiedPayload, options);
      return user;
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, err.message);
    }
  }

  static hashUserPassword(payload) {
    const hashPassword = bcrypt.hashSync(payload, 10);
    return hashPassword;
  }
};
