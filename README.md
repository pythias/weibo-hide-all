# weibo-hide-all

隐藏所有微博

## 使用方法

1. 使用 chrome 打开 [https://weibo.com](https://weibo.com) 并登录
2. 打开调试窗口，复制以下代码至console，执行既可

```js
fetch("https://raw.githubusercontent.com/pythias/weibo-hide-all/master/weibo-hide-all.js")
    .then(response => response.text())
    .then(text => {
        eval(text);
        weiboHidden = new hidden();
        weiboHidden.start();
    });
```
