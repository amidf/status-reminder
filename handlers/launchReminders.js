const moment = require("moment");

const api = require("../api");
const store = require("../store");
const templates = require("../templates");

const setHandlerTimer = (time) =>
  setInterval(async () => {
    const { adminUser } = store.data;

    const users = await api.callMethod(
      "channels.listMembers",
      adminUser.token,
      {
        channelId: adminUser.hub,
        showPublicProfile: true,
      }
    );

    const filteredUsers = users.filter(
      (user) => !adminUser.ignoredUsers.includes(user.userId)
    );

    console.log({ users: store.data.users, filteredUsers });

    for (let user of filteredUsers) {
      if (!store.data.users[user.userId]) {
        continue;
      }

      const currentTime = moment()
        .utcOffset(store.data.users[user.userId].timezone)
        .format("HH:mm:ss");

      console.log({ currentTime, time });

      if (currentTime === time) {
        await api.sendMessage({
          to: user.userId,
          html: {
            inline: templates.userAnswer({ userId: user.userId }),
            height: 400,
          },
        });
      }
    }
  }, 1000);

module.exports = async () => {
  const { adminUser } = store.data;

  if (!adminUser || adminUser.selectedChannels.length === 0) {
    return;
  }

  try {
    global.MORNING_REMINDER = setHandlerTimer("15:25:00");
    global.EVENING_REMINDER = setHandlerTimer("15:30:00");
  } catch (error) {
    console.log(error);
  }
};
