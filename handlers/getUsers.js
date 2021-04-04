const templates = require("../templates");
const store = require("../store");
const api = require("../api");

module.exports = async (event) => {
  const { adminUser } = store.data;

  try {
    const channels = await api.callMethod("channels.list", adminUser.token, {});

    const general = channels.find((channel) => channel.id.includes("lobby"));

    if (!general) {
      console.log("general channel is not found");

      return;
    }

    const users = await api.callMethod(
      "channels.listMembers",
      adminUser.token,
      { channelId: general.id, showPublicProfile: true }
    );
    const normalizedUsers = users.map((user) => ({
      ...user,
      isIgnored: !!adminUser.ignoredUsers.find((id) => id === user.userId),
    }));

    await api.sendMessage({
      to: event.message.from,
      html: {
        inline: templates.users({ users: normalizedUsers }),
        width: 400,
        height: 300,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
