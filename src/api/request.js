// request.js
import axios from 'axios';
// 使用vant组件的Toast提示
import { showToast, showLoadingToast, closeToast, setToastDefaultOptions } from 'vant';
import 'vant/es/toast/style';
setToastDefaultOptions({ duration: 3000 });

const whiteList = ['pagingHonor']; //白名单里面的接口

// 1.创建新的axios实例
const service = axios.create({
  // 环境变量，需要在.env文件中配置
  baseURL: process.env.VUE_APP_BASE_API,
  // 超时时间暂定6s
  timeout: 6000,
});

// loading 次数
let loadingCount = 0;

// 中断请求逻辑
const CancelToken = axios.CancelToken;
let pending = {};
function removePending(key, isRequest = false) {
  if (pending[key] && isRequest) {
    pending[key]('中断请求');
  }
  delete pending[key];
}

// 2.请求拦截器
service.interceptors.request.use(
  config => {
    // 取消请求
    const key = config.url + '&' + config.method;
    removePending(key, true);
    config.cancelToken = new CancelToken(c => {
      pending[key] = c;
    });

    // 加入Loading，白名单控制;
    let url = config.url;
    let index = url.lastIndexOf('/');
    let endIndex = url.lastIndexOf('?') === -1 ? url.length : url.lastIndexOf('?');
    // let path = url.substring(index + 1, url.length);
    // if (path.indexOf(whiteList) === -1) {
    let path = url.substring(index + 1, endIndex);
    console.log({ path });
    if (!whiteList.includes(path)) {
      if (loadingCount === 0) {
        // 加入Loading;
        showLoadingToast({
          message: '加载中...',
          forbidClick: true, //禁止背景点击
        });
      }
      loadingCount++;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 3.响应拦截器
service.interceptors.response.use(
  response => {
    const key = response.config.url + '&' + response.config.method;
    removePending(key);

    // 关闭loading，白名单控制
    let url = response.config.url;
    let index = url.lastIndexOf('/');
    let endIndex = url.lastIndexOf('?') === -1 ? url.length : url.lastIndexOf('?');
    // let path = url.substring(index + 1, url.length);
    // if (path.indexOf(whiteList) === -1) {
    let path = url.substring(index + 1, endIndex);
    if (!whiteList.includes(path)) {
      loadingCount--;
    }
    if (loadingCount === 0) {
      closeToast();
    }
    return response;
  },
  error => {
    closeToast();
    // 处理异常情况，根据项目实际情况处理或不处理
    console.log({ error });
    if (error && error.response) {
      // 根据约定的响应码具体处理
      switch (error.response.status) {
        case 403:
          error.message = '拒绝访问';
          break;
        case 502:
          error.message = '服务器端出错';
          break;
        default:
          error.message = `连接错误${error.response.status}`;
      }
    } else if (error.name === 'CanceledError') {
      return Promise.reject(error.message);
    } else {
      // 超时处理
      error.message = '服务器响应超时，请刷新当前页';
    }
    showToast(error.message);
    return Promise.reject(error.response);
  }
);

//4.封装请求函数
const urlParse = () => {
  let hash = window.location.hash;
  let url = window.location.search || hash.slice(hash.indexOf('?'));
  let obj = {};
  let reg = /[?&][^?&]+=[^?&]+/g;
  let arr = url.match(reg);
  if (arr) {
    arr.forEach(function (item) {
      let tempArr = item.substring(1).split('=');
      let key = decodeURIComponent(tempArr[0]);
      let val = decodeURIComponent(tempArr[1]);
      obj[key] = val;
    });
  }
  return obj;
};
const query = urlParse();
const defaultQuery = {
  zone: 'sa',
  uid: query.uid || query.userId,
  token: query.access_token || query.token,
};

const _addQuery = url => {
  let query = '';
  Object.keys(defaultQuery).map(key => {
    query += `&${key}=${defaultQuery[key]}`;
  });
  if (query) {
    query = '?' + query.slice(1);
  }
  return url + query;
};
const Request = (param_url, options = {}) => {
  let url = _addQuery(param_url);
  let method = options.method || 'get';
  let params = options.params || {};

  if (options.params?.cancel_http) {
    const key = url + '&' + method;
    if (pending[key]) {
      pending[key]('中断请求');
    }
    return;
  }

  if (method === 'get') {
    return new Promise((resolve, reject) => {
      service
        .get(url, {
          params: params,
        })
        .then(res => {
          if (res && res.data) {
            resolve(res.data);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  } else {
    return new Promise((resolve, reject) => {
      service
        .post(url, params)
        .then(res => {
          if (res && res.data) {
            resolve(res.data);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  }
};

// 5.导出api
export default Request;
