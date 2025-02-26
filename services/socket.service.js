// socketService.js
const { Server } = require("socket.io");
const http = require("http");
const { ROLES } = require("../enums");

class SocketService {
  constructor() {
    this.server = null;
    this.io = null;
  }

  init(server) {
    this.server = server;
    this.io = new Server(server);
  }

  onlyForHandshake(middleware) {
    return (req, res, next) => {
      const isHandshake = req._query.sid === undefined;
      if (isHandshake) {
        middleware(req, res, next);
      } else {
        next();
      }
    };
  }

  async getConnectionNumber(rooomId) {
    const sockets = await this.io.sockets.in(rooomId).fetchSockets();
    console.log(rooomId, sockets.length);
    return sockets.length;
  }

  configureSocket(sessionMiddleware, passport) {
    if (!this.io) {
      throw new Error("Socket.IO server is not initialized");
    }

    this.io.engine.use(this.onlyForHandshake(sessionMiddleware));
    this.io.engine.use(this.onlyForHandshake(passport.session()));
    this.io.engine.use(
      this.onlyForHandshake((req, res, next) => {
        if (req.user) {
          next();
        } else {
          res.writeHead(401);
          res.end();
        }
      })
    );

    this.io.on("connection", async (socket) => {
      const user = socket.request.user;

      if (user.role === ROLES.ADMIN) {
        const roomId = `${user?.organization}`;

        socket.join(roomId);
      }

      if (user.role === ROLES.CLIENT && !!user.managedBy) {
        const roomId = `${user?.managedBy}-public`;
        const ownRoomId = `${user?._id}`;
        socket.join(roomId);
        socket.join(ownRoomId);
      }

      if (user.role === ROLES.EMPLOYEE) {
        const publicRoomId = `${user?._id}-public`;
        const roomId = `${user?._id}`;
        socket.join(publicRoomId);
        socket.join(roomId);
      }

      socket.on("connect-to-response", (data) => {
        const roomId = data?.maketCallId;
        if (roomId) {
          socket.join(`${roomId}`);
        }
      });

      // console.log("A user connected", user._id, user.role);

      socket.on("disconnect", () => {
        // console.log("User disconnected", user._id, user.role);
      });
    });
  }

  getInstance() {
    if (!this.io) {
      throw new Error("Socket.IO server is not initialized");
    }
    return this.io;
  }
}

module.exports = new SocketService();
