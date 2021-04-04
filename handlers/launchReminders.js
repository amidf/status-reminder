const moment = require("moment");

const api = require("../api");
const store = require("../store");
const templates = require("../templates");

const getTimeout = (obj, userId, timezone, time) => {
  const currentTime = moment().utcOffset(timezone).unix();
  let futureTime = moment(time, "HH:mm:ss").utcOffset(timezone).unix();

  if (currentTime > futureTime) {
    futureTime = moment(time, "HH:mm:ss")
      .utcOffset(timezone)
      .add(1, "day")
      .unix();
  }

  return setTimeout(async () => {
    console.log({ currentTime, futureTime });

    await api.sendMessage({
      to: userId,
      html: {
        inline: templates.userAnswer({ userId }),
        height: 400,
      },
    });

    obj[userId] = getTimeout(obj, userId, timezone, time);
  }, (futureTime - currentTime) * 1000);
};

const setHandlerTimer = async (obj, time) => {
  try {
    console.log("start timer");

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

    for (let user of filteredUsers) {
      if (!store.data.users[user.userId]) {
        continue;
      }

      console.log({ user });

      const { timezone } = store.data.users[user.userId];

      obj[user.userId] = getTimeout(obj, user.userId, timezone, time);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = async () => {
  const { adminUser } = store.data;

  if (!adminUser || adminUser.selectedChannels.length === 0) {
    return;
  }

  try {
    global.MORNING_REMINDER = {};
    setHandlerTimer(global.MORNING_REMINDER, "19:00:00");
    global.EVENING_REMINDER = {};
    setHandlerTimer(global.EVENING_REMINDER, "10:00:00");
  } catch (error) {
    console.log(error);
  }
};
