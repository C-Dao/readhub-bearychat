const redisClient = require('./redisClient');
const attachmentsMessage = require('./attachmentsMessage');
const rb = require('./rb');

const textRegExp = [
  {
    id: '#0',
    regexp: /help/,
    func: 'getHelp',
  },
  {
    id: '#1',
    regexp: /实时热点/,
    func: 'getTopic',
  },
  {
    id: '#2',
    regexp: /科技动态/,
    func: 'getNews',
  },
  {
    id: '#3',
    regexp: /开发者资讯/,
    func: 'getTechNews',
  },
  {
    id: '#4',
    regexp: /区块链快讯/,
    func: 'getBlockChain',
  },
];

class P2PHandle {
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

  async solve() {
    let message = this.message;
    let length = textRegExp.length;
    if (this.message.fromUid && global.bearychatUid && this.message.fromUid ===
      global.bearychatUid) {
      return 0;
    }
    for (let i = 0; i < length; i++) {
      if (textRegExp[ i ].regexp.test(message.text) ||
        textRegExp[ i ].id === message.text) {
        return this[ textRegExp[ i ].func ]();
      }
    }
    this.messageCache = await redisClient.get(
      `${this.message.fromUid}_${this.message.vchannelId}`);
    if (!this.messageCache || !/^[0-4]{1}$/.test(this.message.text)) {
      return this.replyMessage('你说啥，我听不懂,你可以回复 /help/ 获取帮助');
    }
    this.messageCache = JSON.parse(this.messageCache);
    return this.getTopicDetail();
  }

  async getTopic() {
    let topic = await rb.getTopic();
    const topicString = JSON.stringify(topic);
    await redisClient.set(`${this.message.fromUid}_${this.message.vchannelId}`,
      topicString);
    redisClient.expire(`${this.message.fromUid}_${this.message.vchannelId}`,
      1200);
    const topicArray = topic.data;
    let topicTitleArray = topicArray.map((news, index) => {
      let title = news.title.replace(/\n/g, '');
      return `[${index} ${title}](https://readhub.cn/topic/${news.id})`;
    });

    topicTitleArray.push('---------------', '您可以回复 序号 获取新闻详情');
    return this.replyMessage(topicTitleArray.join('\n'));

  }

  async getNews() {
    let news = await rb.getNews();
    const newsArray = news.data;
    let newsTitleArray = newsArray.map((news) => {
      let title = news.title.replace(/\n/g, '');
      return `[${news.siteName}  ${title}](${news.url})`;
    });
    newsTitleArray.push('---------------');
    return this.replyMessage(newsTitleArray.join('\n'));
  }

  async getTechNews() {
    let teachNews = await rb.getTechNews();
    const newsArray = teachNews.data;
    let newsTitleArray = newsArray.map((news) => {
      let title = news.title.replace(/\n/g, '');
      return `[${news.siteName}  ${title}](${news.url})`;
    });
    newsTitleArray.push('---------------');
    return this.replyMessage(newsTitleArray.join('\n'));
  }

  async getBlockChain() {
    let teachNews = await rb.getBlockChain();
    const newsArray = teachNews.data;
    let newsTitleArray = newsArray.map((news) => {
      let title = news.title.replace(/\n/g, '');
      return `[${news.siteName}  ${title}](${news.url})`;
    });
    newsTitleArray.push('---------------');
    return this.replyMessage(newsTitleArray.join('\n'));
  }

  getTopicDetail() {
    let topicId = this.message.text;
    let { summary: newsDetail, title: newsTitle, id: newsId } = this.messageCache.data[ topicId ];
    let title = newsTitle.replace('\n', '');
    this.replyMessage(
      `[${title}](https://readhub.cn/topic/${newsId})\n-------------------\n${newsDetail}`);
  }

  getHelp() {
    this.replyMessage(`你可以回复如下Id，获取服务:\n#1 实时热点\n#2 科技动态\n#3 开发者资讯\n#4 区块链快讯 `);
  }
}

module.exports = P2PHandle;