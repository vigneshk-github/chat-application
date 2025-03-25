const Redis = require("ioredis");

const redisConfig = {
  host: "redis-12331.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 12331,
  password: "cWpIz3AQeAIYldgdmLWJN3WqO6sHL8gT",
};

const pub = new Redis(redisConfig);
const sub = new Redis(redisConfig);

sub.subscribe("Messages", (err) => {
  if (err) console.error("Redis Subscription Error:", err);
  else console.log("Subscribed to Messages channel");
});

module.exports = { pub, sub };
