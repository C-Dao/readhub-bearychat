const bearychat = require('bearychat');
const RTMClient = require('bearychat-rtm-client');
const WebSocket = require('ws');
const RTMClientEvents = RTMClient.RTMClientEvents;

const client = new RTMClient({
  url: () => {
    return bearychat.rtm.start({ token: process.env.HUBOT_BEARYCHAT_TOKENS })
      .then(resp => resp.json())
      .then(data => data.ws_host).catch(err => {
        console.log('BearyChatError: token is invalid');
        process.exit(1);
      });
  },
  WebSocket,
});

client.on(RTMClientEvents.ONLINE, function() {
  console.log('----------------------------');
  console.log('RTM online, time: ' + new Date());
  console.log('----------------------------');
});

client.on(RTMClientEvents.OFFLINE, function() {
  console.log('----------------------------');
  console.log('RTM offline, time: ' + new Date());
  console.log('----------------------------');
});

client.on(RTMClientEvents.ERROR, (error) => {
  console.error('RtmError: ', error);
  process.exit(1);
});

exports.RTMClientEvents = RTMClient.RTMClientEvents;
exports.RTMClientState = RTMClient.RTMClientState;
exports.ARTMClient = client;