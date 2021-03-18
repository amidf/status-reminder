const templates = require("../templates");
const store = require("../store");
const api = require("../api");

const launchReminders = require("./launchReminders");
const getChannels = require("./getChannels");
const getUsers = require("./getUsers");

exports.handleCommand = async (event) => {
  const normalizedText = event.message.text.trim().split(" ");
  const command = normalizedText[0].toLowerCase();
  const args = normalizedText.slice(1).map((arg) => arg.trim());
  const adminUser = store.getAdminUser();

  if (!adminUser) {
    return
  }

  if (adminUser.userId !== event.userId) {
    await sendMessage({
      to: event.message.from,
      text: "You have not enough permissions for this action.",
    });

    return;
  }

  switch (command) {
    case "/getusers": {
      await getUsers(event);

      break;
    }
    case "/adduser": {
      const newIgnoredUsers = [...adminUser.ignoredUsers, ...args];
      store.saveIgnoredUsers(newIgnoredUsers);

      await api.sendMessage({
        to: event.message.from,
        text: "Users were added to ignore.",
      });
      await getUsers(event);

      break;
    }
    case "/deleteuser": {
      const newIgnoredUsers = adminUser.ignoredUsers.filter(
        (user) => !args.includes(user)
      );
      store.saveIgnoredUsers(newIgnoredUsers);
      await api.sendMessage({
        to: event.message.from,
        text: "Users were deleted from ignore.",
      });
      await getChannels(event);

      break;
    }
    case "/getchannels": {
      await getChannels(event);

      break;
    }
    case "/deletechannel": {
      const newSelectedChannels = adminUser.selectedChannels.filter(
        (channel) => !args.includes(channel)
      );
      store.saveSelectedChannels(newSelectedChannels);
      await api.sendMessage({
        to: event.message.from,
        text: "Channels were deleted.",
      });
      await getChannels(event);

      break;
    }
    case "/addchannel": {
      const newSelectedChannels = [...adminUser.selectedChannels, ...args];
      store.saveSelectedChannels(newSelectedChannels);

      await api.sendMessage({
        to: event.message.from,
        text: "Channels were added.",
      });
      await getChannels(event);

      break;
    }
    case "/help": {
      await api.sendMessage({
        to: event.message.from,
        html: {
          inline: templates.help(),
          height: 300,
        },
      });

      break;
    }
    case "/test": {
      await api.sendMessage({
        to: event.message.from,
        html: {
          inline: templates.userAnswer({ userId: event.userId }),
          height: 300,
        },
      });

      break;
    }
    case "/start": {
      if (adminUser.selectedChannels.length === 0) {
        await getChannels(event);

        break;
      }

      launchReminders();
      break;
    }
    default: {
      await api.sendMessage({
        to: event.message.from,
        text: "Unknown command. Please enter correct command.",
      });
    }
  }
};
