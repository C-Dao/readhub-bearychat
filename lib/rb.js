const axios = require('axios');

exports.getTopic = (options = {}) => {
  const params = {};
  params.pageSize = options.pageSize || 5;
  return axios.get('https://api.readhub.cn/topic', {
    params,
  }).then((response) => {
    return response.data;
  }).catch(function(error) {
    console.log(error);
  });
};

exports.getNews = (options = {}) => {
  const params = {};
  const now = new Date().valueOf();
  params.lastCursor = options.lastCursor || now;
  params.pageSize = options.pageSize || 5;
  return axios.get('https://api.readhub.cn/news', {
    params,
  }).then((response) => {
    return response.data;
  }).catch(function(error) {
    console.log(error);
  });
};
exports.getTechNews = (options = {}) => {
  const params = {};
  const now = new Date().valueOf()
  params.lastCursor = options.lastCursor || now;
  params.pageSize = options.pageSize || 5;

  return axios.get('https://api.readhub.cn/technews', {
    params,
  }).then((response) => {
    return response.data;
  }).catch(function(error) {
    console.log(error);
  });
};

exports.getBlockChain = (options = {}) => {
  const params = {};
  const now = new Date().valueOf()
  params.lastCursor = options.lastCursor || now;
  params.pageSize = options.pageSize || 5;
  return axios.get('https://api.readhub.cn/blockchain', {
    params,
  }).then((response) => {
    return response.data;
  }).catch(function(error) {
    console.log(error);
  });
};

exports.getTopicdetail = (topicId) => {
  return axios.get('https://api.readhub.cn/topic/' + topicId)
    .then((response) => {
      return response.data;
    })
    .catch(function(error) {
      console.log(error);
    });
};

