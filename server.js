#!/usr/bin/env node
'use strict';

const Fs = require('fs');
const Http = require('http');
const Net = require('net');
const Url = require('url');
const Ws = require('ws');

function regexIndexOf(str, re, i) {
    var index = str.slice(i).search(re);
    return index < 0 ? index : index + i;
}

const wss = new Ws.Server({noServer:true});
wss.on('connection', (ws, request) => {
    ws.on('message', (data) => {
        if (ws._client === undefined) {
           ws._buffer = data;
           ws._eos = false;
           ws._text = ''

           ws._client = new Net.Socket();
           ws._client.setEncoding('utf8');
           ws._client.connect({host:'localhost', port:5050, allowHalfOpen:true}, function() {
               if (ws._buffer !== undefined) {
                   ws._client.write(ws._buffer);
                   delete ws._buffer;
               }
               if (ws._eos)
                   ws._client.end();
           });
           ws._client.on('data', function(data) {
               ws._text += data;
               var index;
               while ((index = regexIndexOf(ws._text, /[\r\n]/, 0)) != -1) {
                   var result = {text: ws._text.substring(0, index), final:(ws._text.charAt(index) == '\n')};
                   ws.send(JSON.stringify(result));
                   ws._text = ws._text.substring(ws._text.length);
               }
           });
           ws._client.on('error', function(error) {
               ws.send(JSON.stringify({error: 'kaldi online2-tcp-nnet3-decode-faster off line', final:true}));
           });
           ws._client.on('close', function(hadError) {
               delete ws._client;
           });
        } else {
           if (ws._client.connecting) {
               if (data.lenth > 0)
                   ws._buffer = ws._buffer === undefined ? data : new Buffer.concat([ws._buffer, data]);
               else
                   ws._eos = true;
           } else {
               if (data.length > 0)
                   ws._client.write(data);
               else
                   ws._client.end();
            }
        }
    });
    ws.on('close', () => {
        if (ws._client !== undefined)
            ws._client.close();
    });
});
const server = Http.createServer();
server.on('request', (request, response) => {
    const pathname = Url.parse(request.url).pathname;
    var whitelist = {'/index.html':'text/html'}
    if (whitelist[pathname]) {
        Fs.readFile('.' + pathname, function (error, data) {
            if (error) {
                response.writeHead(500);
                response.end();
                return;
            }
            response.writeHead(200, {'Content-Type':whitelist[pathname]});
            response.end(data);
        });
    } else {
        response.writeHead(301, {Location: '/index.html'});
        response.end();
    }
});
server.on('upgrade', (request, socket, head) => {
    const pathname = Url.parse(request.url).pathname;
    if (pathname === '/audio') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

const PORT = process.env.PORT || 80;
console.log('listening on port ', PORT);
server.listen(PORT);
