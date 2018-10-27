const axios = require('axios');
const token = process.env.HUBOT_BEARYCHAT_TOKENS;

module.exports = function(attachmentsMessage, vchannel, messageText) {
  return axios.post('https://rtm.bearychat.com/message', {
    token,
    vchannel,
    text: messageText,
    markdown: true,
    attachments: attachmentsMessage,
  }).then((response) => {
    console.log(response);
    return response.data;
  }).catch((error) => {
    console.log(error);
  });
};