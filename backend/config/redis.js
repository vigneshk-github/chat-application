require("dotenv").config();

const Redis = require("ioredis");

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASS,
};

const pub = new Redis(redisConfig);
const sub = new Redis(redisConfig);

sub.subscribe("Messages", (err) => {
  if (err) console.error("Redis Subscription Error:", err);
  else console.log("Subscribed to Messages channel");
});

module.exports = { pub, sub };
