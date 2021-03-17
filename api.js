const flock = require("flockos");

const config = require("./config");
const { debug } = require("./utils");

class API {
  callMethod(name, token, params) {
    return new Promise((resolve, reject) => {
      flock.callMethod(name, token, params, (error, response) => {
        if (error) {
          reject(error);
          debug({ source: name, error });
        }

        resolve(response);
      });
    });
  }

  async sendMessage({
    to,
    text = "",
    html,
    flockml,
    callback = () => {},
    ...args
  }) {
    try {
      const params = {
        to,
        text,
        ...args,
      };

      if (html) {
        params.attachments = [
          {
            views: {
              html,
            },
          },
        ];
      }

      if (flockml) {
        params.attachments = [
          {
            views: {
              flockml,
            },
          },
        ];
      }

      await this.callMethod("chat.sendMessage", config.botToken, params);

      callback();
    } catch (error) {
      // console.log(error)
    }
  }
}

module.exports = new API();
