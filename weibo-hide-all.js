// 1. 使用 chrome 打开 weibo.com （确保你登录了微博）
// 2. 打开调试窗口，在 console 中贴下面的代码后回车
// 3. 输入 start();

var page = 0;
var mids = [];
var midIndex = 0;
var timer = null;
var running = false;
var http = new XMLHttpRequest();

function hideNextPage() {
    page++;
    let url = 'https://weibo.com/ajax/statuses/mymblog?uid=' + $CONFIG['uid'] + '&page=' + page; //&feature=0
    http.open('GET', url, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.send();
    http.onreadystatechange = function () {
        if (http.readyState != 4 || http.status != 200) {
            return;
        }

        var result = JSON.parse(http.responseText);
        if (result === undefined || result.data === undefined || result.data.list === undefined ) {
            return;
        }

        var list = result.data.list;
        if (list.length == 0) {
            stop('恭喜你，可以重新来过了。如果还有请再执行一遍');
            return;
        }

        list.forEach(element => {
            if (element.visible.type == 0) {
                mids.push(element.idstr);
            }
        });

        timer = setInterval(() => {
            hideNextWeibo();
        }, 1000);

        console.log('本页有 ' + mids.length + ' 条公开微博');
    }
}

function hideNextWeibo() {
    if (midIndex < mids.length) {
        hideWeibo(mids[midIndex]);
        midIndex++;
        return;
    }

    mids = [];
    midIndex = 0;
    clearInterval(timer);

    setTimeout(() => {
        hideNextPage();
    }, 1000);
}

function hideWeibo(mid) {
    http.open('POST', 'https://weibo.com/p/aj/v6/mblog/modifyvisible?ajwvr=6&domain=100505&__rnd=' + Date.now(), true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.send('visible=1&mid=' + mid + '&_t=0');
    http.onreadystatechange = function () {
        if (http.readyState != 4 || http.status != 200) {
            return;
        }

        let json = {}
        try {
            json = JSON.parse(http.responseText);
        } catch (error) {
            console.error('隐藏失败 - ' + mid);
            console.error(error);
            return;
        }

        if (json.code == 100000) {
            console.log('隐藏成功 - ' + mid);
        }
    }
}

function stop(message) {
    clearInterval(timer);
    running = false;
    console.log(message);
}

function start() {
    if (running) {
        console.log('进行中...');
        return;
    }

    console.log('开始隐藏');
    running = true;
    mids = [];
    midIndex = 0;
    page = 0;
    hideNextPage();
}
