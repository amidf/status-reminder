const moment = require("moment");

const api = require("../api");
const store = require("../store");
const templates = require("../templates");

const getHandlerTimer = (time) => async () => {
  const adminUser = store.getAdminUser();

  const currentTime = moment().format("HH:mm:ss");
  console.log({ currentTime })

  if (currentTime === time) {
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

module.exports = async () => {
  const adminUser = store.getAdminUser();

  if (!adminUser || adminUser.selectedChannels.length === 0) {
    return;
  }

  try {
    const users = await api.callMethod('channels.listMember', adminUser.token, { channelId: adminUser.hub, showPublicProfile: false })
    const filteredUsers = users.filter(user => !adminUser.ignoredUsers.includes(user.userId))

    for (let user of filteredUsers) {
      const { timezone } = await api.callMethod('users.getInfo', )
    }
  } catch (error) {
    console.log(error)
  }

  global.MORNING_TIMER_REMINDER = setInterval(
    getHandlerTimer("14:45:00"),
    1000
  );

  global.EVENING_TIMER_REMINDER = setInterval(
    getHandlerTimer("14:50:00"),
    1000
  );
};
