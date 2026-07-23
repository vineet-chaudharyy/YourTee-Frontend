// Dev-only: starts an ephemeral in-memory MongoDB on port 27017
// so the app's default MONGODB_URI works for local verification.
import { MongoMemoryServer } from "mongodb-memory-server";

const mongod = await MongoMemoryServer.create({
  instance: { port: 27017, dbName: "yourtee" },
});
console.log("MEMORY_MONGO_URI=" + mongod.getUri());

const stop = async () => {
  await mongod.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
