/*
机场签到脚本

脚本兼容: QuantumultX

*************************
【 抢购脚本注意事项 】:
*************************

该脚本需要使用签到脚本获取Cookie后方可使用.

BoxJs订阅地址: https://raw.githubusercontent.com/hex/Script/master/hex_BoxJs.json
*************************
【 QX 1.0.10+ 脚本配置 】 :
*************************

[task_local]
0 12 * * * https://raw.githubusercontent.com/heberthe/QuanX/main/SignIn.js, tag=金坷垃签到, enabled=true

*/

// 新建一个实例对象, 把兼容函数定义到$中, 以便统一调用
let $ = new hex();

// headers
let signHeaders = $.read('hex_signheader_jinkela');
// 读取headrs的Cookie
let cookie = $.read('hex_signheader_jinkela');

// 预留的空对象, 便于函数之间读取数据
let user = {};

(async function() { // 立即运行的匿名异步函数
	// 使用await关键字声明, 表示以同步方式执行异步函数, 可以简单理解为顺序执行
	await Promise.all([ //该方法用于将多个实例包装成一个新的实例, 可以简单理解为同时调用函数, 以进一步提高执行速度
		checkin(), //签到
	]);
	$.done(); //抢购完成后调用Surge、QX内部特有的函数, 用于退出脚本执行
})();

function checkin() {
	const headers = {
        "Host": "jinkela.one",
        "X-Requested-With": "XMLHttpRequest",
        "Sec-Fetch-Site": "same-origin",
        "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Sec-Fetch-Mode": "cors",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Origin": "https://jinkela.one",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1",
        "Referer": "https://jinkela.one/user",
        "Content-Length": "0",
        "Connection": "keep-alive",
			"Cookie": "crisp-client%2Fsession%2Fc9c91de1-3677-4918-822b-49c23c9cc9f6=session_23cff3bf-2e96-472a-a59a-0284a1e9a731; crisp-client%2Fsession%2Fc9c91de1-3677-4918-822b-49c23c9cc9f6%2F2021-12-10%2009%3A37%3A2579426lengfenghhxg%40gmail.com=session_23cff3bf-2e96-472a-a59a-0284a1e9a731; _ga=GA1.2.1655246409.1682590078; _gid=GA1.2.433241957.1682590078; email=lengfenghhxg%40gmail.com; expire_in=1682738396; ip=bfc7ec86a79f6a419a7207c945dd0ef2; key=a5225ec036de28892a9aca8bfc0e81fa906b2ef8a4fb0; uid=79426",
        "Sec-Fetch-Dest": "empty",
    }
	const pointUrl = { //查询积分接口
		url: 'https://jinkela.one/user/checkin',
		headers: headers
		// { //请求头
		// 	'Cookie': JSON.parse(cookie) //用户鉴权Cookie
		// }
	}
	console.log(`\n cookie: `, $.read('hex_signheader_jinkela'));
	return new Promise((resolve) => { //主函数返回Promise实例对象, 以便后续调用时可以实现顺序执行异步函数
		$.post(pointUrl, (error, resp, data) => { //使用post请求查询, 再使用回调函数处理返回的结果
			try { //使用try方法捕获可能出现的代码异常
				if (error) {
					throw new Error(error); //如果请求失败, 例如无法联网, 则抛出一个异常
				} else {
					console.log(data,'ss');
					const body = JSON.parse(data); //解析响应体json并转化为对象
					if (body.ret == 1) { //如果响应体为预期格式
						console.log(`\n 签到成功: ${body.data}`); //打印日志
					} else { //否则抛出一个异常
						throw new Error(body.msg || data);
					}
				}
			} catch (e) { //接住try代码块中抛出的异常, 并打印日志
				console.log(`\n 签到失败: 失败\n出现错误: ${e.message}`);
			} finally { //finally语句在try和catch之后无论有无异常都会执行
				resolve(); //异步操作成功时调用, 将Promise对象的状态标记为"成功", 表示已完成查询积分
			}
		})
	})
}


function hex() {
	const isSurge = typeof $httpClient != "undefined";
	const isQuanX = typeof $task != "undefined";
	const isNode = typeof require == "function";
	const node = (() => {
		if (isNode) {
			const request = require('request');
			return {
				request
			}
		} else {
			return null;
		}
	})()
	const adapterStatus = (response) => {
		if (response) {
			if (response.status) {
				response["statusCode"] = response.status
			} else if (response.statusCode) {
				response["status"] = response.statusCode
			}
		}
		return response
	}
	this.read = (key) => {
		if (isQuanX) return $prefs.valueForKey(key)
		if (isSurge) return $persistentStore.read(key)
	}
	this.notify = (title, subtitle, message) => {
		if (isQuanX) $notify(title, subtitle, message)
		if (isSurge) $notification.post(title, subtitle, message)
		if (isNode) console.log(`${title}\n${subtitle}\n${message}`)
	}
	this.post = (options, callback) => {
		// options.headers['User-Agent'] = 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_6_1 like Mac OS X) AppleWebKit/609.3.5.0.2 (KHTML, like Gecko) Mobile/17G80 BiliApp/822 mobi_app/ios_comic channel/AppStore BiliComic/822'
		if (isQuanX) {
			if (typeof options == "string") options = {
				url: options
			}
			options["method"] = "POST"
			$task.fetch(options).then(response => {
				callback(null, adapterStatus(response), response.body)
			}, reason => callback(reason.error, null, null))
		}
		if (isSurge) {
			options.headers['X-Surge-Skip-Scripting'] = false
			$httpClient.post(options, (error, response, body) => {
				callback(error, adapterStatus(response), body)
			})
		}
		if (isNode) {
			node.request.post(options, (error, response, body) => {
				callback(error, adapterStatus(response), body)
			})
		}
	}
	this.done = () => {
		if (isQuanX || isSurge) {
			$done()
		}
	}
};