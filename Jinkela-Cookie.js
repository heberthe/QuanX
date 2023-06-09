const cookieName = 'jinkela'
const signurlKey = 'hex_signurl_jinkela'
const signheaderKey = 'hex_signheader_jinkela'
const hex = init()

if ($request && $request.method != 'OPTIONS') {
    const signurlVal = $request.url
    const signheaderVal = JSON.stringify($request.headers)
    if (signurlVal) hex.setdata(signurlVal, signurlKey)
    if (signheaderVal) hex.setdata(signheaderVal, signheaderKey)
    hex.msg(cookieName, `获取Cookie: 成功`,``)
}

function init () {
    isSurge = () => {
        return undefined === this.$httpClient ? false : true
    }
    isQuanX = () => {
        return undefined === this.$task ? false : true
    }
    getdata = (key) => {
        if (isSurge()) return $persistentStore.read(key)
        if (isQuanX()) return $prefs.valueForKey(key)
    }
    setdata = (val, key) => {
        if (isSurge()) return $persistentStore.write(val, key)
        if (isQuanX()) return $prefs.setValueForKey(val, key)
    }
    msg = (title, subtitle, body) => {
        if (isSurge()) $notification.post(title, subtitle, body)
        if (isQuanX()) $notify(title, subtitle, body)
    }
    log = (message) => console.log(message)
    get = (url, cb) => {
        if (isSurge()) {
            $httpClient.get(url, cb)
        }
        if (isQuanX()) {
            url.method = 'GET'
            $task.fetch(url).then((resp) => cb(null, {}, resp.body))
        }
    }
    post = (url, cb) => {
        if (isSurge()) {
            $httpClient.post(url, cb)
        }
        if (isQuanX()) {
            url.method = 'POST'
            $task.fetch(url).then((resp) => cb(null, {}, resp.body))
        }
    }
    done = (value = {}) => {
        $done(value)
    }
    return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
hex.done()