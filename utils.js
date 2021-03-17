exports.debug = (info) => {
  console.log({ info });
};

const STATUS_MESSAGES = {
  vacation: "в отпуске",
  sick: "болеет",
};

exports.getStatusMessage = (status) => STATUS_MESSAGES[status];
