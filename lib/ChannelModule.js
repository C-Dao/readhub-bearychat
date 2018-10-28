const attachmentsMessage = require('./attachmentsMessage');
const redisClient = require('./redisClient');
const rb = require('./rb');

const textRegExp = [
  {
    num: '#1',
    key: '科技',
    regexp: /科技|动态|资讯|新闻|快讯/g,
    func: 'getNews',
  },
  {
    num: '#2',
    key: '开发者',
    regexp: /开发者|话题|资讯|新闻|快讯/g,
    func: 'getTechNews',
  },
  {
    num: '#3',
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

  async solve() {
    let message = this.message;
    let length = textRegExp.length;
    if (( this.message.fromUid && global.bearychatUid &&
      this.message.fromUid === global.bearychatUid )
      || ( !message.text.includes(`@<=${global.bearychatUid}=>`) )) {
      return 0;
    }

    for (let i = 0; i < length; i++) {
      let match = message.text.match(textRegExp[ i ].regexp) || [];
      if (( match.includes(textRegExp[ i ].key) &&
        match.filter(key => key !== textRegExp[ i ].key).length > 0 ) ||
        message.text.includes(textRegExp[ i ].num)) {
        return this[ textRegExp[ i ].func ]();
      }
    }
    if (/实时热点|热点|资讯|热门|话题|新闻|#0/.test(message.text)) {
      return this.getTopic();
    }

    this.messageCache = await redisClient.get(`${this.message.vchannelId}`);
    this.message.topicId = this.message.text.replace(`@<=${global.bearychatUid}=> `,'');
    if (this.messageCache && /^[0-4]{1}$/.test(this.message.topicId)) {
      this.messageCache = JSON.parse(this.messageCache);
      return this.getTopicDetail();
    } else {
      return this.getHelp();
    }
  }

  async getTopic() {
    let topic = await rb.getTopic();
    const topicString = JSON.stringify(topic);
    await redisClient.set(`${this.message.vchannelId}`,
      topicString);
    redisClient.expire(`${this.message.vchannelId}`,
      1200);
    const topicArray = topic.data;
    let topicTitleArray = topicArray.map((news, index) => {
      let title = news.title.replace(/\n/g, '');
      return `[${index} ${title}](https://readhub.cn/topic/${news.id})`;
    });
    topicTitleArray.push('---------------', '您可以回复 序号 获取新闻详情');
    topicTitleArray.unshift('你要看新闻吗，给你');
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
    let topicId = this.message.topicId;
    let { summary: newsDetail, title: newsTitle, id: newsId } = this.messageCache.data[ topicId ];
    let title = newsTitle.replace('\n', '');
    this.replyMessage(
      `[${title}](https://readhub.cn/topic/${newsId})\n-------------------\n${newsDetail}`);
  }

  getHelp() {
    this.replyMessage(
      `我可以给你最新的最好玩的科技资讯哦，资讯自豪地来自 readhub \n 有如下模块:\n#0 实时热点\n#1 科技动态\n#2 开发者资讯\n#3 区块链快讯 `);
  }
}

module.exports = ChannelHandle;