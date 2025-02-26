const { app } = require("./app");
const envConfig = require("./utils/envConfig");
const { DBConnect } = require("./utils/DBconfig");

let server;

async function startServer() {
  try {
    await DBConnect();
    console.log("DB CONNECTED");

    app.listen(envConfig.port, () => {
      console.log(`Server is running on port ${envConfig.port}`);
    });
  } catch (e) {
    console.log("DB CONNECTION ERROR =>", e.message);
  }
}

// Call the startServer function to start the server
startServer();

const exitHandler = () => {
  if (server) {
    server.close();
    console.log("Server closed");
    process.exit(1);
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  console.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  console.info("SIGTERM recieved");
  if (server) {
    server.close();
  }
});
