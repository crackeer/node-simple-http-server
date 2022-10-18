"use strict";
//加载所需要的模块
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var process = require('process');
const querystring = require('querystring');
var api = require('./request/api')
var env = require('./util/env')

var constValue = require('./request/const')


var init = () => {
    console.log(process.cwd())
    env.setEnv('HOME', process.cwd() + "/")
    env.applyEnvFile() 
}

//响应请求的函数
var processRequest = async (request, response) => {
    let proxyHost = env.getEnv('PROXY_HOST')
    if (request.url.indexOf("/login/callback") == 0 || request.url.indexOf("/login/callback") == 0 ) {
        let fullURL = proxyHost + request.url
        apiProxy(request, response, fullURL)
        return
    }

    //API 代理
    if (request.url.indexOf("/_proxy_") == 0) {
        let fullURL = proxyHost + request.url.substr(6)
        apiProxy(request, response, fullURL)
        return
    }
    let requestUrl = getURLPath(request);
    responseAssets(requestUrl, request, response)
}

var apiProxy =   (request, response, fullURL) => {
    var options = {
        method: request.method,
        headers: {
            'Content-Type': request.headers["content-type"] || '',
            'admin-token': request.headers["admin-token"] || '',
            'test-admin-token': request.headers["test-admin-token"] || '',
            'Env': request.headers["env"] || '',
        }
    }
    let contentType = request.headers["content-type"] || ''
    var newRequest = http.request(fullURL, options, function (res) {
        res.on("data", function (chunk) {
            response.end(chunk.toString())
        });
    });
    newRequest.on("response", function (incomeMsg) {
        let keys = Object.keys(incomeMsg.headers)
        for(var i in keys) {
            response.setHeader(keys[i], incomeMsg.headers[keys[i]])
        }
    });

    newRequest.setTimeout(5000, function () {
        console.log("timeout")
    })
    newRequest.on("error", function (err) {
        console.log(err.message);
    })

    if (request.method == constValue.GET) {
        newRequest.end();
    } else if (request.method == constValue.POST && contentType == constValue.applicationJSON) {
        request.on('data', (body) => {
            newRequest.write(body)
            newRequest.end();
        })
    }
}

function getURLPath(request) {
    var requestUrl = request.url;
    if (requestUrl.indexOf("?") > -1) {
        requestUrl = requestUrl.split("?")[0]
    }

    if (requestUrl == '' || requestUrl == "/") {
        requestUrl = '/index'
    }
    return requestUrl
}

function loginCallback(request, response) {
    let data = url.parse(request.url)
    let query = new URLSearchParams(data.query)

    response.end('login callback')
}

function logoutCallback(request, response) {

}

function responseAssets(requestPath, request, response) {
    //获取资源文件的绝对路径
    var filePath = path.resolve("out" + requestPath);
    //获取对应文件的文档类型
    //我们通过path.extname来获取文件的后缀名。由于extname返回值包含”.”，所以通过slice方法来剔除掉”.”，
    //对于没有后缀名的文件，我们一律认为是unknown。
    var ext = path.extname(filePath);
    ext = ext ? ext.slice(1) : '';
    if (ext == '') {
        ext = 'html'
        filePath = filePath + '.html'
    }

    //未知的类型一律用"text/plain"类型
    var contentType = constValue.mineType[ext] || "text/plain";

    fs.stat(filePath, (err, stats) => {
        if (err) {
            response.writeHead(404, { "Content-Type": "text/html" });
            response.end("<h1>" + filePath + "|" + request.url + "404 Not Found</h1>");
            return
        }
        //没出错 并且文件存在
        if (!err && stats.isFile()) {

            if (request.headers["if-modified-since"] === stats.ctime.toUTCString()) {//匹配成功
                response.writeHead(304);
                response.end();
                return
            }
            response.setHeader("Last-Modified", stats.ctime.toUTCString());
            readFile(filePath, contentType);
        }

        //读取文件的函数
        function readFile(filePath, contentType) {
            response.setHeader("Content-Type", contentType);

            var stream = fs.createReadStream(filePath);
            //错误处理
            stream.on('error', function () {
                response.writeHead(500, { "Content-Type": contentType });
                response.end("<h1>500 Server Error</h1>");
            });
            //读取文件
            stream.pipe(response);
        }
    });
}

//创建服务
init();
var httpServer = http.createServer(processRequest);
//指定一个监听的接口
httpServer.listen(env.getEnv('PORT'), function () {
    console.log(`app is running at port:${env.getEnv('PORT')}`);
});