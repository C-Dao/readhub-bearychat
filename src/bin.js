require('dotenv').config();
require('../lib/redisClient');

const bearychat = require('bearychat');
const rtmClient = require('../lib/rtmClient');
const P2PModule = require('../lib/P2PModule');
const ChannelModule = require('../lib/ChannelModule');

if (!global.bearychatUid) {
  bearychat.user.me({
    token: process.env.HUBOT_BEARYCHAT_TOKENS,
  }).then(resp => resp.json())
    .then(data => {
      global.bearychatUid = data.id;
      return rtmClient.ARTMClient.on(rtmClient.RTMClientEvents.EVENT,
        function(message) {
          console.log('----------------------------');
          console.log(
            'event message received, time: ' + new Date() + '\ncontent: ' +
            JSON.stringify(message));
          console.log('----------------------------');

          switch (message.type) {
            case bearychat.rtm.message.type.P2P_MESSAGE:
              let p2pModule = new P2PModule(message, reply);
              return p2pModule.solve();
            case bearychat.rtm.message.type.CHANNEL_MESSAGE:
              let channelModule = new ChannelModule(message, reply);
              return channelModule.solve();
            default:
              return 0;
          }
        });
    }).catch(err => {
    console.log(err);
  });
}

function reply(message) {
  return rtmClient.ARTMClient.send(message);
}