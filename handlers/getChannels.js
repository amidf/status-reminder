const templates = require("../templates");
const api = require("../api");
const store = require("../store");

module.exports = async (event) => {
  const adminUser = store.getAdminUser();

  try {
    const channels = await api.callMethod("channels.list", adminUser.token, {});
    const normalizedChannels = channels.map((channel) => ({
      ...channel,
      isSelected: adminUser.selectedChannels.find((id) => id === channel.id),
    }));

    await api.sendMessage({
      to: event.message.from,
      html: {
        inline: templates.channels({ channels: normalizedChannels }),
        width: 400,
        height: 500,
      },
    });
  } catch (error) {
    console.log({ error });
  }
};
