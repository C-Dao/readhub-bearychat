const attachmentsMessage = require('./attachmentsMessage');
const rb = require('./rb');

const textRegExp = [
  {
    key: '科技',
    regexp: /科技|动态|资讯|新闻|快讯/g,
    func: 'getNews',
  },
  {
    key: '开发者',
    regexp: /开发者|话题|资讯|新闻|快讯/g,
    func: 'getTechNews',
  },
  {
    key: '区块链',
    regexp: /区块链|动态|资讯|新闻|快讯/g,
    func: 'getBlockChain',
  },
];

class ChannelHandle {
  constructor(message, reply) {
    this.message = {
      createAt: message.create_ts,
      image: message.image,
      key: message.key,
      referKey: message.refer_key,
      subtype: message.subtype,
      text: message.text,
      toUid: message.to_uid,
      type: message.type,
      fromUid: message.uid,
      vchannelId: message.vchannel_id,
    };
    this.replyMessage = (text) => {
      return reply({
        'vchannel_id': this.message.vchannelId,
        'text': text,
        'type': 'message',
        'to_uid': this.message.fromUid,
        'refer_key': this.message.key,
      });
    };
    this.attachmentsMessage = (document) => {
      let vchannel = this.message.vchannelId;
      return attachmentsMessage(document.attachments, vchannel, document.text);
    };
  }

  solve() {
    let message = this.message;
    let length = textRegExp.length;
    if (( this.message.fromUid && global.bearychatUid &&
      this.message.fromUid === global.bearychatUid )
      || ( !message.text.includes(`@<=${global.bearychatUid}=>`) )) {
      return 0;
    }

    for (let i = 0; i < length; i++) {
      let match = message.text.match(textRegExp[ i ].regexp) || [];
      if (match.includes(textRegExp[ i ].key) &&
        match.filter(key => key !== textRegExp[ i ].key).length > 0) {
        return this[ textRegExp[ i ].func ]();
      }
    }
    if (/实时热点|热点|资讯|热门|话题|新闻/.test(message.text)) {
      return this.getTopic();
    } else {
      return this.getHelp();
    }
  }

  async getTopic() {
    let topic = await rb.getTopic();
    const topicArray = topic.data;
    let topicTitleArray = topicArray.map((news, index) => {
      let title = news.title.replace('\n', '');
      return `[${index} ${title}](https://readhub.cn/topic/${news.id})`;
    });
    topicTitleArray.unshift('你要看新闻吗，给你');
    return this.replyMessage(topicTitleArray.join('\n'));

  }

  async getNews() {
    let news = await rb.getNews();
    const newsArray = news.data;
    let newsTitleArray = newsArray.map((news) => {
      let title = news.title.replace('\n', '');
      return `[${news.siteName}  ${title}](${news.url})`;
    });
    newsTitleArray.push('---------------');
    return this.replyMessage(newsTitleArray.join('\n'));
  }

  async getTechNews() {
    let teachNews = await rb.getTechNews();
    const newsArray = teachNews.data;
    let newsTitleArray = newsArray.map((news) => {
      let title = news.title.replace('\n', '');
      return `[${news.siteName}  ${title}](${news.url})`;
    });
    newsTitleArray.push('---------------');
    return this.replyMessage(newsTitleArray.join('\n'));
  }

  async getBlockChain() {
    let teachNews = await rb.getBlockChain();
    const newsArray = teachNews.data;
    let newsTitleArray = newsArray.map((news) => {
      let title = news.title.replace('\n', '');
      return `[${news.siteName}  ${title}](${news.url})`;
    });
    newsTitleArray.push('---------------');
    return this.replyMessage(newsTitleArray.join('\n'));
  }

  getHelp() {
    this.replyMessage(
      `我可以给你最新的最好玩的科技资讯哦，资讯自豪地来自 readhub \n 有如下模块:\n#1 实时热点\n#2 科技动态\n#3 开发者资讯\n#4 区块链快讯 `);
  }
}

module.exports = ChannelHandle;