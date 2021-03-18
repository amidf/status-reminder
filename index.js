const express = require("express");
const flock = require("flockos");

const store = require("./store");
const config = require("./config");
const api = require("./api");
const handlers = require("./handlers");
const launchReminders = require("./handlers/launchReminders");
const templates = require("./templates");
const { getStatusMessage } = require("./utils");

flock.appId = config.appId;
flock.appSecret = config.appSecret;

global.MORNING_TIMER_REMINDER = null;
global.EVENING_TIMER_REMINDER = null;

launchReminders();

const PORT = process.env.PORT || 1337;
const app = express();

app.use(flock.events.tokenVerifier);

app.post("/events", flock.events.listener);

app.get("/sendstatus", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const adminUser = store.getAdminUser();
    const { status, userId } = req.query;
    const user = await api.callMethod(
      "users.getPublicProfile",
      adminUser.token,
      { userId }
    );

    console.log({ user });

    for (let channel of adminUser.selectedChannels) {
      await api.sendMessage({
        to: channel,
        flockml: templates.userStatus({
          status: getStatusMessage(status),
          user,
        }),
        onBehalfOf: adminUser.userId,
      });
    }

    res.status(200);
    res.send("success");
  } catch (error) {
    res.status(400);
    res.json(error);
  }
});

app.get('/db', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.json(store.getDb())
  res.status(200)
})

app.listen(PORT, () => {
  console.log(`Bot is listening at ${PORT} port`);
});

flock.events.on("app.install", (event, callback) => {
  store.saveAdminUser(event.userId, event.token);
  callback();
});

flock.events.on("app.uninstall", (event, callback) => {
  store.resetDb();
  callback();
});

flock.events.on("chat.receiveMessage", (event) => {
  handlers.handleCommand(event);
});
