const axios = require("axios");

const config = require("./config");

const store = {};

const API_URL = "https://fedinamid.monster";

store.init = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/db`);

    store.data = data;
  } catch (error) {
    console.log({ error });
  }
};

store.saveAdminUser = async ({ userId, token, hub }) => {
  try {
    const { data } = await axios.get(
      `${API_URL}/install?userId=${userId}&token=${token}&hub=${hub}`
    );

    store.data.adminUser = data;
  } catch (error) {
    console.log({ error });
  }
};

store.saveIgnoredUsers = async (users) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/saveusers`,
      JSON.stringify(data)
    );

    console.log({ data });

    store.data.adminUser.ignoredUsers = users;
  } catch (error) {
    console.log({ error });
  }
};

store.saveSelectedChannels = async (channels) => {
  try {
    const { data } = await axios.post(
      `${API_URL}/savechannels`,
      { channels }
    );
    console.log({ channels});

    console.log({ store });

    store.data.adminUser.selectedChannels = channels;
  } catch (error) {
    console.log({ error });
  }
};

store.saveTimezone = async (userId, utc) => {
  try {
    const { data } = await axios.get(
      `${API_URL}/savetimezone?userId=${userId}&utc=${utc}`
    );

    store.data = data;
  } catch (error) {
    console.log({ error });
  }
};

store.resetDb = async () => {
  try {
    await axios.get(`${API_URL}/reset`);
  } catch (error) {
    console.log({ error });
  }
};

module.exports = store;
