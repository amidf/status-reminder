const moment = require("moment");

const api = require("../api");
const config = require("../config");
const store = require("../store");
const templates = require("../templates");

const getHandlerTimer = (time) => async () => {
  const adminUser = store.getAdminUser();

  const currentTime = moment().format("HH:mm:ss");

  if (currentTime === time) {
    const channels = await api.callMethod("channels.list", adminUser.token, {});
    const hub = channels.find((channel) =>
      channel.id.includes("announcements")
    );

    if (!hub) {
      return;
    }

    const users = await api.callMethod(
      "channels.listMembers",
      adminUser.token,
      { channelId: hub.id, showPublicProfile: true }
    );

    const filteredUsers = users.filter(
      (user) => !adminUser.ignoredUsers.includes(user.userId)
    );

    for (let user of filteredUsers) {
      await api.sendMessage({
        to: user.userId,
        html: {
          inline: templates.userAnswer({ userId: user.userId }),
          height: 400,
        },
      });
    }
  }
};

module.exports = () => {
  const adminUser = store.getAdminUser();

  if (!adminUser || adminUser.selectedChannels.length === 0) {
    return;
  }

  global.MORNING_TIMER_REMINDER = setInterval(
    getHandlerTimer("10:00:00"),
    1000
  );

  global.EVENING_TIMER_REMINDER = setInterval(
    getHandlerTimer("19:00:00"),
    1000
  );
};
