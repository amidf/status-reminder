const express = require("express");
const flock = require("flockos");

const config = require("./config");
const api = require("./api");
const handlers = require("./handlers");
const launchReminders = require("./handlers/launchReminders");
const templates = require("./templates");
const { getStatusMessage } = require("./utils");
const store = require("./store");

flock.appId = config.appId;
flock.appSecret = config.appSecret;

global.MORNING_REMINDER = null;
global.EVENING_REMINDER = null;

(async () => {
  await store.init();

  const PORT = process.env.PORT || 1337;
  const app = express();

  app.use(flock.events.tokenVerifier);

  app.post("/events", flock.events.listener);

  app.get("/savetimezone", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    try {
      const { utc, userId } = req.query;

      await store.saveTimezone(userId, utc);

      launchReminders();

      res.status(200);
      res.send("successful");
    } catch (error) {
      console.log({ error });
      res.status(400);
    }
  });

  app.get("/sendstatus", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    try {
      const { adminUser } = store.data;
      const { status, userId } = req.query;
      const user = await api.callMethod(
        "users.getPublicProfile",
        adminUser.token,
        { userId }
      );

      for (let channel of adminUser.selectedChannels) {
        console.log({ channel });

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
      console.log(error);
      res.status(400);
      res.json(error);
    }
  });

  app.listen(PORT, () => {
    console.log(`Bot is listening at ${PORT} port`);
  });

  flock.events.on("app.install", async (event, callback) => {
    callback();

    try {
      const channels = await api.callMethod("channels.list", event.token, {});
      const hub = channels.find((channel) =>
        channel.id.includes("announcements")
      );

      if (!hub) {
        return;
      }

      store.saveAdminUser({
        userId: event.userId,
        token: event.token,
        hub: hub.id,
      });

      const users = await api.callMethod("channels.listMembers", event.token, {
        channelId: hub.id,
        showPublicProfile: false,
      });

      for (let user of users) {
        await api.sendMessage({
          to: user.userId,
          html: {
            inline: templates.timezones({ userId: user.userId }),
            height: 400,
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  flock.events.on("app.uninstall", (event, callback) => {
    store.resetDb();
    global.MORNING_REMINDER = null;
    global.EVENING_REMINDER = null;
    callback();
  });

  flock.events.on("chat.receiveMessage", (event) => {
    handlers.handleCommand(event);
  });

  launchReminders();
})();
