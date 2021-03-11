function hidden() {
    this.reset();
}

hidden.prototype.reset = function () {
    this.running = false;
    this.mids = [];
    this.midIndex = 0;
    if (this.timer) {
        clearInterval(this.timer);
    }
};

hidden.prototype.hideNextPage = function () {
    this.reset();
    this.running = true;
    this.page++;
    const url = 'https://weibo.com/ajax/statuses/mymblog?uid=' + $CONFIG['uid'] + '&page=' + this.page; //&feature=0
    let http = new XMLHttpRequest();
    http.open('GET', url, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.send();

    var _this = this;
    http.onreadystatechange = function () {
        if (http.readyState != 4 || http.status != 200) {
            return;
        }

        let json = JSON.parse(http.responseText);
        if (json === undefined || json.data === undefined || json.data.list === undefined) {
            console.log("无法获取到微博列表");
        }

        let statuses = json.data.list;
        if (statuses.length == 0) {
            _this.stop("恭喜你！如有漏网，请再执行一遍");
            return;
        }

        _this.statuses = {};
        statuses.forEach(status => {
            let status_type = status.visible.type;
            if (status_type == 0) {
                _this.statuses[status.id] = status;
            } else if (status_type == 7) {
                console.log("此微博无法隐藏，请手动处理 https://weibo.com/%d/%s", status.user.id, status.mblogid);
            }
        });

        _this.mids = Object.keys(_this.statuses);
        _this.timer = setInterval(function () {
            _this.hideNextWeibo();
        }, 1000);

        console.log('本页已完成 %d 条，即将进入下一页 %d', statuses.length, _this.page + 1);
    }
};

hidden.prototype.hideNextWeibo = function () {
    if (this.midIndex < this.mids.length) {
        this.deleteWeibo(this.mids[this.midIndex]);
        this.midIndex++;
        return;
    }

    clearInterval(this.timer);

    var _this = this;
    setTimeout(function () {
        _this.hideNextPage();
    }, 1000);
};

hidden.prototype.deleteWeibo = function (mid) {
    const status = this.statuses[mid];
    http = new XMLHttpRequest();
    http.open('POST', 'https://weibo.com/p/aj/v6/mblog/modifyvisible?ajwvr=6&domain=100505&__rnd=' + Date.now(), true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.send('visible=1&mid=' + mid + '&_t=0');
    http.onreadystatechange = function () {
        if (http.readyState != 4 || http.status != 200) {
            return;
        }

        try {
            const json = JSON.parse(http.responseText);
            if (json.code == 100000) {
                console.log("隐藏 %s，发布于'%s'，内容：'%s'", mid, status.created_at, status.text);
            }
        } catch (error) {
            return;
        }
    }
};

hidden.prototype.stop = function (message) {
    console.log(message);
    this.running = false;
    clearInterval(this.timer);
};

hidden.prototype.start = function () {
    if (this.running) {
        console.log('正在进行中，请稍后或者刷新页面后再执行.');
        return;
    }

    console.log(`

 _    _      _ _             _   _ _     _     _            
| |  | |    (_) |           | | | (_)   | |   | |           
| |  | | ___ _| |__   ___   | |_| |_  __| | __| | ___ _ __  
| |/\\| |/ _ \\ | '_ \\ / _ \\  |  _  | |/ _\` |/ _\` |/ _ \\ '_ \\ 
\\  /\\  /  __/ | |_) | (_) | | | | | | (_| | (_| |  __/ | | |
 \\/  \\/ \\___|_|_.__/ \\___/  \\_| |_/_|\\__,_|\\__,_|\\___|_| |_|   v1.3
`);
    console.log("开始执行");

    this.page = 0;
    this.hideNextPage();
};

// weiboHidden = new hidden();
// weiboHidden.start();
