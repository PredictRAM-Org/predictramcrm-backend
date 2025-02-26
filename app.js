const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cors = require("cors");
const passport = require("passport");
const { AuthService } = require("./services");
const envConfig = require("./utils/envConfig");
const { errorConverter, errorHandler } = require("./middlewares/error");
const route = require("./routes/v1");
const http = require("http");
const SocketService = require("./services/socket.service");

const app = express();
const server = http.createServer(app);
SocketService.init(server);

app.use(express.json());

const store = new MongoDBStore({
  uri: envConfig.mongoose.url,
  collection: "authSession",
});

const sessionMiddleware = session({
  secret: envConfig.secret,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: false },
  resave: false,
  saveUninitialized: false,
  store: store,
});

app.use(sessionMiddleware);

app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "https://predictram-crm-backend.azurewebsites.net",
    ],
    credentials: true,
    allowedHeaders: "*",
  })
);

SocketService.configureSocket(sessionMiddleware, passport);

app.use(passport.initialize());
app.use(passport.session());
new AuthService(passport);

app.use("/v1/api", route);

app.use(errorConverter);

app.use(errorHandler);

module.exports = { app: server };
