module.exports=[233405,(a,b,c)=>{b.exports=a.x("child_process",()=>require("child_process"))},748064,(a,b,c)=>{let{EventEmitter:d}=a.r(427699);class AbortSignal{constructor(){this.eventEmitter=new d,this.onabort=null,this.aborted=!1,this.reason=void 0}toString(){return"[object AbortSignal]"}get[Symbol.toStringTag](){return"AbortSignal"}removeEventListener(a,b){this.eventEmitter.removeListener(a,b)}addEventListener(a,b){this.eventEmitter.on(a,b)}dispatchEvent(a){let b={type:a,target:this},c=`on${a}`;"function"==typeof this[c]&&this[c](b),this.eventEmitter.emit(a,b)}throwIfAborted(){if(this.aborted)throw this.reason}static abort(a){let b=new e;return b.abort(),b.signal}static timeout(a){let b=new e;return setTimeout(()=>b.abort(Error("TimeoutError")),a),b.signal}}class e{constructor(){this.signal=new AbortSignal}abort(a){this.signal.aborted||(this.signal.aborted=!0,a?this.signal.reason=a:this.signal.reason=Error("AbortError"),this.signal.dispatchEvent("abort"))}toString(){return"[object AbortController]"}get[Symbol.toStringTag](){return"AbortController"}}b.exports={AbortController:e,AbortSignal}},125508,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.defaults=void 0;let d=/^(?:0|[1-9]\d*)$/;function e(a,b){return a===b||Number.isNaN(a)&&Number.isNaN(b)}c.defaults=function(a,...b){a=Object(a);let c=Object.prototype,f=b.length,g=f>2?b[2]:void 0;g&&function(a,b,c){var f;return null!==c&&("object"==typeof c||"function"==typeof c)&&(!!("number"==typeof b&&null!=c&&"function"!=typeof c&&Number.isSafeInteger(f=c.length)&&f>=0&&function(a,b=Number.MAX_SAFE_INTEGER){switch(typeof a){case"number":return Number.isInteger(a)&&a>=0&&a<b;case"symbol":return!1;case"string":return d.test(a)}}(b))&&b<c.length||"string"==typeof b&&b in c)&&e(c[b],a)}(b[0],b[1],g)&&(f=1);for(let d=0;d<f;d++){if(null==b[d])continue;let f=b[d];for(let b in f){let d=a[b];(void 0===d||!c.hasOwnProperty.call(a,b)&&e(d,c[b]))&&(a[b]=f[b])}}return a}},664049,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.isArguments=void 0,c.isArguments=function(a){return null!==a&&"object"==typeof a&&"[object Arguments]"===(null==a?void 0===a?"[object Undefined]":"[object Null]":Object.prototype.toString.call(a))}},461950,(a,b,c)=>{"use strict";var d=a.e&&a.e.__createBinding||(Object.create?function(a,b,c,d){void 0===d&&(d=c),Object.defineProperty(a,d,{enumerable:!0,get:function(){return b[c]}})}:function(a,b,c,d){void 0===d&&(d=c),a[d]=b[c]}),e=a.e&&a.e.__exportStar||function(a,b){for(var c in a)"default"===c||Object.prototype.hasOwnProperty.call(b,c)||d(b,a,c)};Object.defineProperty(c,"__esModule",{value:!0}),c.noop=void 0,c.noop=function(){},e(a.r(125508),c),e(a.r(664049),c)},1392,(a,b,c)=>{function d(a,b,c,d){return Math.round(a/c)+" "+d+(b>=1.5*c?"s":"")}b.exports=function(a,b){b=b||{};var c,e,f,g,h=typeof a;if("string"===h&&a.length>0){var i=a;if(!((i=String(i)).length>100)){var j=/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(i);if(j){var k=parseFloat(j[1]);switch((j[2]||"ms").toLowerCase()){case"years":case"year":case"yrs":case"yr":case"y":return 315576e5*k;case"weeks":case"week":case"w":return 6048e5*k;case"days":case"day":case"d":return 864e5*k;case"hours":case"hour":case"hrs":case"hr":case"h":return 36e5*k;case"minutes":case"minute":case"mins":case"min":case"m":return 6e4*k;case"seconds":case"second":case"secs":case"sec":case"s":return 1e3*k;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return k;default:break}}}return}if("number"===h&&isFinite(a)){return b.long?(e=Math.abs(c=a))>=864e5?d(c,e,864e5,"day"):e>=36e5?d(c,e,36e5,"hour"):e>=6e4?d(c,e,6e4,"minute"):e>=1e3?d(c,e,1e3,"second"):c+" ms":(g=Math.abs(f=a))>=864e5?Math.round(f/864e5)+"d":g>=36e5?Math.round(f/36e5)+"h":g>=6e4?Math.round(f/6e4)+"m":g>=1e3?Math.round(f/1e3)+"s":f+"ms"}throw Error("val is not a non-empty string or a valid number. val="+JSON.stringify(a))}},557916,(a,b,c)=>{b.exports=function(b){function c(a){let b,e,f,g=null;function h(...a){if(!h.enabled)return;let d=Number(new Date);h.diff=d-(b||d),h.prev=b,h.curr=d,b=d,a[0]=c.coerce(a[0]),"string"!=typeof a[0]&&a.unshift("%O");let e=0;a[0]=a[0].replace(/%([a-zA-Z%])/g,(b,d)=>{if("%%"===b)return"%";e++;let f=c.formatters[d];if("function"==typeof f){let c=a[e];b=f.call(h,c),a.splice(e,1),e--}return b}),c.formatArgs.call(h,a),(h.log||c.log).apply(h,a)}return h.namespace=a,h.useColors=c.useColors(),h.color=c.selectColor(a),h.extend=d,h.destroy=c.destroy,Object.defineProperty(h,"enabled",{enumerable:!0,configurable:!1,get:()=>null!==g?g:(e!==c.namespaces&&(e=c.namespaces,f=c.enabled(a)),f),set:a=>{g=a}}),"function"==typeof c.init&&c.init(h),h}function d(a,b){let d=c(this.namespace+(void 0===b?":":b)+a);return d.log=this.log,d}function e(a,b){let c=0,d=0,e=-1,f=0;for(;c<a.length;)if(d<b.length&&(b[d]===a[c]||"*"===b[d]))"*"===b[d]?(e=d,f=c):c++,d++;else{if(-1===e)return!1;d=e+1,c=++f}for(;d<b.length&&"*"===b[d];)d++;return d===b.length}return c.debug=c,c.default=c,c.coerce=function(a){return a instanceof Error?a.stack||a.message:a},c.disable=function(){let a=[...c.names,...c.skips.map(a=>"-"+a)].join(",");return c.enable(""),a},c.enable=function(a){for(let b of(c.save(a),c.namespaces=a,c.names=[],c.skips=[],("string"==typeof a?a:"").trim().replace(/\s+/g,",").split(",").filter(Boolean)))"-"===b[0]?c.skips.push(b.slice(1)):c.names.push(b)},c.enabled=function(a){for(let b of c.skips)if(e(a,b))return!1;for(let b of c.names)if(e(a,b))return!0;return!1},c.humanize=a.r(1392),c.destroy=function(){console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.")},Object.keys(b).forEach(a=>{c[a]=b[a]}),c.names=[],c.skips=[],c.formatters={},c.selectColor=function(a){let b=0;for(let c=0;c<a.length;c++)b=(b<<5)-b+a.charCodeAt(c)|0;return c.colors[Math.abs(b)%c.colors.length]},c.enable(c.load()),c}},870722,(a,b,c)=>{b.exports=a.x("tty",()=>require("tty"))},788136,(a,b,c)=>{"use strict";b.exports=(a,b=process.argv)=>{let c=a.startsWith("-")?"":1===a.length?"-":"--",d=b.indexOf(c+a),e=b.indexOf("--");return -1!==d&&(-1===e||d<e)}},309040,(a,b,c)=>{"use strict";let d,e=a.r(446786),f=a.r(870722),g=a.r(788136),{env:h}=process;function i(a){return 0!==a&&{level:a,hasBasic:!0,has256:a>=2,has16m:a>=3}}function j(a,b){if(0===d)return 0;if(g("color=16m")||g("color=full")||g("color=truecolor"))return 3;if(g("color=256"))return 2;if(a&&!b&&void 0===d)return 0;let c=d||0;if("dumb"===h.TERM)return c;{let a=e.release().split(".");return Number(a[0])>=10&&Number(a[2])>=10586?Number(a[2])>=14931?3:2:1}}g("no-color")||g("no-colors")||g("color=false")||g("color=never")?d=0:(g("color")||g("colors")||g("color=true")||g("color=always"))&&(d=1),"FORCE_COLOR"in h&&(d="true"===h.FORCE_COLOR?1:"false"===h.FORCE_COLOR?0:0===h.FORCE_COLOR.length?1:Math.min(parseInt(h.FORCE_COLOR,10),3)),b.exports={supportsColor:function(a){return i(j(a,a&&a.isTTY))},stdout:i(j(!0,f.isatty(1))),stderr:i(j(!0,f.isatty(2)))}},415714,(a,b,c)=>{let d=a.r(870722),e=a.r(224361);c.init=function(a){a.inspectOpts={};let b=Object.keys(c.inspectOpts);for(let d=0;d<b.length;d++)a.inspectOpts[b[d]]=c.inspectOpts[b[d]]},c.log=function(...a){return process.stderr.write(e.formatWithOptions(c.inspectOpts,...a)+"\n")},c.formatArgs=function(a){let{namespace:d,useColors:e}=this;if(e){let c=this.color,e="\x1b[3"+(c<8?c:"8;5;"+c),f=`  ${e};1m${d} \u001B[0m`;a[0]=f+a[0].split("\n").join("\n"+f),a.push(e+"m+"+b.exports.humanize(this.diff)+"\x1b[0m")}else a[0]=(c.inspectOpts.hideDate?"":new Date().toISOString()+" ")+d+" "+a[0]},c.save=function(a){a?process.env.DEBUG=a:delete process.env.DEBUG},c.load=function(){return process.env.DEBUG},c.useColors=function(){return"colors"in c.inspectOpts?!!c.inspectOpts.colors:d.isatty(process.stderr.fd)},c.destroy=e.deprecate(()=>{},"Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."),c.colors=[6,2,3,4,5,1];try{let b=a.r(309040);b&&(b.stderr||b).level>=2&&(c.colors=[20,21,26,27,32,33,38,39,40,41,42,43,44,45,56,57,62,63,68,69,74,75,76,77,78,79,80,81,92,93,98,99,112,113,128,129,134,135,148,149,160,161,162,163,164,165,166,167,168,169,170,171,172,173,178,179,184,185,196,197,198,199,200,201,202,203,204,205,206,207,208,209,214,215,220,221])}catch(a){}c.inspectOpts=Object.keys(process.env).filter(a=>/^debug_/i.test(a)).reduce((a,b)=>{let c=b.substring(6).toLowerCase().replace(/_([a-z])/g,(a,b)=>b.toUpperCase()),d=process.env[b];return d=!!/^(yes|on|true|enabled)$/i.test(d)||!/^(no|off|false|disabled)$/i.test(d)&&("null"===d?null:Number(d)),a[c]=d,a},{}),b.exports=a.r(557916)(c);let{formatters:f}=b.exports;f.o=function(a){return this.inspectOpts.colors=this.useColors,e.inspect(a,this.inspectOpts).split("\n").map(a=>a.trim()).join(" ")},f.O=function(a){return this.inspectOpts.colors=this.useColors,e.inspect(a,this.inspectOpts)}},329180,(a,b,c)=>{let d;c.formatArgs=function(a){if(a[0]=(this.useColors?"%c":"")+this.namespace+(this.useColors?" %c":" ")+a[0]+(this.useColors?"%c ":" ")+"+"+b.exports.humanize(this.diff),!this.useColors)return;let c="color: "+this.color;a.splice(1,0,c,"color: inherit");let d=0,e=0;a[0].replace(/%[a-zA-Z%]/g,a=>{"%%"!==a&&(d++,"%c"===a&&(e=d))}),a.splice(e,0,c)},c.save=function(a){try{a?c.storage.setItem("debug",a):c.storage.removeItem("debug")}catch(a){}},c.load=function(){let a;try{a=c.storage.getItem("debug")||c.storage.getItem("DEBUG")}catch(a){}return!a&&"u">typeof process&&"env"in process&&(a=process.env.DEBUG),a},c.useColors=function(){let a;return!("u">typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))&&("u">typeof document&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||"u">typeof navigator&&navigator.userAgent&&(a=navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/))&&parseInt(a[1],10)>=31||"u">typeof navigator&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))},c.storage=function(){try{return localStorage}catch(a){}}(),d=!1,c.destroy=()=>{d||(d=!0,console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."))},c.colors=["#0000CC","#0000FF","#0033CC","#0033FF","#0066CC","#0066FF","#0099CC","#0099FF","#00CC00","#00CC33","#00CC66","#00CC99","#00CCCC","#00CCFF","#3300CC","#3300FF","#3333CC","#3333FF","#3366CC","#3366FF","#3399CC","#3399FF","#33CC00","#33CC33","#33CC66","#33CC99","#33CCCC","#33CCFF","#6600CC","#6600FF","#6633CC","#6633FF","#66CC00","#66CC33","#9900CC","#9900FF","#9933CC","#9933FF","#99CC00","#99CC33","#CC0000","#CC0033","#CC0066","#CC0099","#CC00CC","#CC00FF","#CC3300","#CC3333","#CC3366","#CC3399","#CC33CC","#CC33FF","#CC6600","#CC6633","#CC9900","#CC9933","#CCCC00","#CCCC33","#FF0000","#FF0033","#FF0066","#FF0099","#FF00CC","#FF00FF","#FF3300","#FF3333","#FF3366","#FF3399","#FF33CC","#FF33FF","#FF6600","#FF6633","#FF9900","#FF9933","#FFCC00","#FFCC33"],c.log=console.debug||console.log||(()=>{}),b.exports=a.r(557916)(c);let{formatters:e}=b.exports;e.j=function(a){try{return JSON.stringify(a)}catch(a){return"[UnexpectedJSONParseError]: "+a.message}}},42071,(a,b,c)=>{"u"<typeof process||"renderer"===process.type||process.__nwjs?b.exports=a.r(329180):b.exports=a.r(415714)},28419,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.genRedactedString=c.getStringValue=c.MAX_ARGUMENT_LENGTH=void 0;let d=a.r(42071);function e(a){if(null!==a)switch(typeof a){case"boolean":case"number":return;case"object":if(Buffer.isBuffer(a))return a.toString("hex");if(Array.isArray(a))return a.join(",");try{return JSON.stringify(a)}catch(a){return}case"string":return a}}function f(a,b){let{length:c}=a;return c<=b?a:a.slice(0,b)+' ... <REDACTED full-length="'+c+'">'}c.MAX_ARGUMENT_LENGTH=200,c.getStringValue=e,c.genRedactedString=f,c.default=function(a){let b=(0,d.default)(`ioredis:${a}`);function c(...a){if(b.enabled){for(let b=1;b<a.length;b++){let c=e(a[b]);"string"==typeof c&&c.length>200&&(a[b]=f(c,200))}return b.apply(null,a)}}return Object.defineProperties(c,{namespace:{get:()=>b.namespace},enabled:{get:()=>b.enabled},destroy:{get:()=>b.destroy},log:{get:()=>b.log,set(a){b.log=a}}}),c}},460480,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=`-----BEGIN CERTIFICATE-----
MIIDTzCCAjegAwIBAgIJAKSVpiDswLcwMA0GCSqGSIb3DQEBBQUAMD4xFjAUBgNV
BAoMDUdhcmFudGlhIERhdGExJDAiBgNVBAMMG1NTTCBDZXJ0aWZpY2F0aW9uIEF1
dGhvcml0eTAeFw0xMzEwMDExMjE0NTVaFw0yMzA5MjkxMjE0NTVaMD4xFjAUBgNV
BAoMDUdhcmFudGlhIERhdGExJDAiBgNVBAMMG1NTTCBDZXJ0aWZpY2F0aW9uIEF1
dGhvcml0eTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALZqkh/DczWP
JnxnHLQ7QL0T4B4CDKWBKCcisriGbA6ZePWVNo4hfKQC6JrzfR+081NeD6VcWUiz
rmd+jtPhIY4c+WVQYm5PKaN6DT1imYdxQw7aqO5j2KUCEh/cznpLxeSHoTxlR34E
QwF28Wl3eg2vc5ct8LjU3eozWVk3gb7alx9mSA2SgmuX5lEQawl++rSjsBStemY2
BDwOpAMXIrdEyP/cVn8mkvi/BDs5M5G+09j0gfhyCzRWMQ7Hn71u1eolRxwVxgi3
TMn+/vTaFSqxKjgck6zuAYjBRPaHe7qLxHNr1So/Mc9nPy+3wHebFwbIcnUojwbp
4nctkWbjb2cCAwEAAaNQME4wHQYDVR0OBBYEFP1whtcrydmW3ZJeuSoKZIKjze3w
MB8GA1UdIwQYMBaAFP1whtcrydmW3ZJeuSoKZIKjze3wMAwGA1UdEwQFMAMBAf8w
DQYJKoZIhvcNAQEFBQADggEBAG2erXhwRAa7+ZOBs0B6X57Hwyd1R4kfmXcs0rta
lbPpvgULSiB+TCbf3EbhJnHGyvdCY1tvlffLjdA7HJ0PCOn+YYLBA0pTU/dyvrN6
Su8NuS5yubnt9mb13nDGYo1rnt0YRfxN+8DM3fXIVr038A30UlPX2Ou1ExFJT0MZ
uFKY6ZvLdI6/1cbgmguMlAhM+DhKyV6Sr5699LM3zqeI816pZmlREETYkGr91q7k
BpXJu/dtHaGxg1ZGu6w/PCsYGUcECWENYD4VQPd8N32JjOfu6vEgoEAwfPP+3oGp
Z4m3ewACcWOAenqflb+cQYC4PsF7qbXDmRaWrbKntOlZ3n0=
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIIGMTCCBBmgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwajELMAkGA1UEBhMCVVMx
CzAJBgNVBAgMAkNBMQswCQYDVQQHDAJDQTESMBAGA1UECgwJUmVkaXNMYWJzMS0w
KwYDVQQDDCRSZWRpc0xhYnMgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkwHhcN
MTgwMjI1MTUzNzM3WhcNMjgwMjIzMTUzNzM3WjBfMQswCQYDVQQGEwJVUzELMAkG
A1UECAwCQ0ExEjAQBgNVBAoMCVJlZGlzTGFiczEvMC0GA1UEAwwmUkNQIEludGVy
bWVkaWF0ZSBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkwggIiMA0GCSqGSIb3DQEBAQUA
A4ICDwAwggIKAoICAQDf9dqbxc8Bq7Ctq9rWcxrGNKKHivqLAFpPq02yLPx6fsOv
Tq7GsDChAYBBc4v7Y2Ap9RD5Vs3dIhEANcnolf27QwrG9RMnnvzk8pCvp1o6zSU4
VuOE1W66/O1/7e2rVxyrnTcP7UgK43zNIXu7+tiAqWsO92uSnuMoGPGpeaUm1jym
hjWKtkAwDFSqvHY+XL5qDVBEjeUe+WHkYUg40cAXjusAqgm2hZt29c2wnVrxW25W
P0meNlzHGFdA2AC5z54iRiqj57dTfBTkHoBczQxcyw6hhzxZQ4e5I5zOKjXXEhZN
r0tA3YC14CTabKRus/JmZieyZzRgEy2oti64tmLYTqSlAD78pRL40VNoaSYetXLw
hhNsXCHgWaY6d5bLOc/aIQMAV5oLvZQKvuXAF1IDmhPA+bZbpWipp0zagf1P1H3s
UzsMdn2KM0ejzgotbtNlj5TcrVwpmvE3ktvUAuA+hi3FkVx1US+2Gsp5x4YOzJ7u
P1WPk6ShF0JgnJH2ILdj6kttTWwFzH17keSFICWDfH/+kM+k7Y1v3EXMQXE7y0T9
MjvJskz6d/nv+sQhY04xt64xFMGTnZjlJMzfQNi7zWFLTZnDD0lPowq7l3YiPoTT
t5Xky83lu0KZsZBo0WlWaDG00gLVdtRgVbcuSWxpi5BdLb1kRab66JptWjxwXQID
AQABo4HrMIHoMDoGA1UdHwQzMDEwL6AtoCuGKWh0dHBzOi8vcmwtY2Etc2VydmVy
LnJlZGlzbGFicy5jb20vdjEvY3JsMEYGCCsGAQUFBwEBBDowODA2BggrBgEFBQcw
AYYqaHR0cHM6Ly9ybC1jYS1zZXJ2ZXIucmVkaXNsYWJzLmNvbS92MS9vY3NwMB0G
A1UdDgQWBBQHar5OKvQUpP2qWt6mckzToeCOHDAfBgNVHSMEGDAWgBQi42wH6hM4
L2sujEvLM0/u8lRXTzASBgNVHRMBAf8ECDAGAQH/AgEAMA4GA1UdDwEB/wQEAwIB
hjANBgkqhkiG9w0BAQsFAAOCAgEAirEn/iTsAKyhd+pu2W3Z5NjCko4NPU0EYUbr
AP7+POK2rzjIrJO3nFYQ/LLuC7KCXG+2qwan2SAOGmqWst13Y+WHp44Kae0kaChW
vcYLXXSoGQGC8QuFSNUdaeg3RbMDYFT04dOkqufeWVccoHVxyTSg9eD8LZuHn5jw
7QDLiEECBmIJHk5Eeo2TAZrx4Yx6ufSUX5HeVjlAzqwtAqdt99uCJ/EL8bgpWbe+
XoSpvUv0SEC1I1dCAhCKAvRlIOA6VBcmzg5Am12KzkqTul12/VEFIgzqu0Zy2Jbc
AUPrYVu/+tOGXQaijy7YgwH8P8n3s7ZeUa1VABJHcxrxYduDDJBLZi+MjheUDaZ1
jQRHYevI2tlqeSBqdPKG4zBY5lS0GiAlmuze5oENt0P3XboHoZPHiqcK3VECgTVh
/BkJcuudETSJcZDmQ8YfoKfBzRQNg2sv/hwvUv73Ss51Sco8GEt2lD8uEdib1Q6z
zDT5lXJowSzOD5ZA9OGDjnSRL+2riNtKWKEqvtEG3VBJoBzu9GoxbAc7wIZLxmli
iF5a/Zf5X+UXD3s4TMmy6C4QZJpAA2egsSQCnraWO2ULhh7iXMysSkF/nzVfZn43
iqpaB8++9a37hWq14ZmOv0TJIDz//b2+KC4VFXWQ5W5QC6whsjT+OlG4p5ZYG0jo
616pxqo=
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIIFujCCA6KgAwIBAgIJAJ1aTT1lu2ScMA0GCSqGSIb3DQEBCwUAMGoxCzAJBgNV
BAYTAlVTMQswCQYDVQQIDAJDQTELMAkGA1UEBwwCQ0ExEjAQBgNVBAoMCVJlZGlz
TGFiczEtMCsGA1UEAwwkUmVkaXNMYWJzIFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9y
aXR5MB4XDTE4MDIyNTE1MjA0MloXDTM4MDIyMDE1MjA0MlowajELMAkGA1UEBhMC
VVMxCzAJBgNVBAgMAkNBMQswCQYDVQQHDAJDQTESMBAGA1UECgwJUmVkaXNMYWJz
MS0wKwYDVQQDDCRSZWRpc0xhYnMgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkw
ggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDLEjXy7YrbN5Waau5cd6g1
G5C2tMmeTpZ0duFAPxNU4oE3RHS5gGiok346fUXuUxbZ6QkuzeN2/2Z+RmRcJhQY
Dm0ZgdG4x59An1TJfnzKKoWj8ISmoHS/TGNBdFzXV7FYNLBuqZouqePI6ReC6Qhl
pp45huV32Q3a6IDrrvx7Wo5ZczEQeFNbCeCOQYNDdTmCyEkHqc2AGo8eoIlSTutT
ULOC7R5gzJVTS0e1hesQ7jmqHjbO+VQS1NAL4/5K6cuTEqUl+XhVhPdLWBXJQ5ag
54qhX4v+ojLzeU1R/Vc6NjMvVtptWY6JihpgplprN0Yh2556ewcXMeturcKgXfGJ
xeYzsjzXerEjrVocX5V8BNrg64NlifzTMKNOOv4fVZszq1SIHR8F9ROrqiOdh8iC
JpUbLpXH9hWCSEO6VRMB2xJoKu3cgl63kF30s77x7wLFMEHiwsQRKxooE1UhgS9K
2sO4TlQ1eWUvFvHSTVDQDlGQ6zu4qjbOpb3Q8bQwoK+ai2alkXVR4Ltxe9QlgYK3
StsnPhruzZGA0wbXdpw0bnM+YdlEm5ffSTpNIfgHeaa7Dtb801FtA71ZlH7A6TaI
SIQuUST9EKmv7xrJyx0W1pGoPOLw5T029aTjnICSLdtV9bLwysrLhIYG5bnPq78B
cS+jZHFGzD7PUVGQD01nOQIDAQABo2MwYTAdBgNVHQ4EFgQUIuNsB+oTOC9rLoxL
yzNP7vJUV08wHwYDVR0jBBgwFoAUIuNsB+oTOC9rLoxLyzNP7vJUV08wDwYDVR0T
AQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAYYwDQYJKoZIhvcNAQELBQADggIBAHfg
z5pMNUAKdMzK1aS1EDdK9yKz4qicILz5czSLj1mC7HKDRy8cVADUxEICis++CsCu
rYOvyCVergHQLREcxPq4rc5Nq1uj6J6649NEeh4WazOOjL4ZfQ1jVznMbGy+fJm3
3Hoelv6jWRG9iqeJZja7/1s6YC6bWymI/OY1e4wUKeNHAo+Vger7MlHV+RuabaX+
hSJ8bJAM59NCM7AgMTQpJCncrcdLeceYniGy5Q/qt2b5mJkQVkIdy4TPGGB+AXDJ
D0q3I/JDRkDUFNFdeW0js7fHdsvCR7O3tJy5zIgEV/o/BCkmJVtuwPYOrw/yOlKj
TY/U7ATAx9VFF6/vYEOMYSmrZlFX+98L6nJtwDqfLB5VTltqZ4H/KBxGE3IRSt9l
FXy40U+LnXzhhW+7VBAvyYX8GEXhHkKU8Gqk1xitrqfBXY74xKgyUSTolFSfFVgj
mcM/X4K45bka+qpkj7Kfv/8D4j6aZekwhN2ly6hhC1SmQ8qjMjpG/mrWOSSHZFmf
ybu9iD2AYHeIOkshIl6xYIa++Q/00/vs46IzAbQyriOi0XxlSMMVtPx0Q3isp+ji
n8Mq9eOuxYOEQ4of8twUkUDd528iwGtEdwf0Q01UyT84S62N8AySl1ZBKXJz6W4F
UhWfa/HQYOAPDdEjNgnVwLI23b8t0TozyCWw7q8h
-----END CERTIFICATE-----

-----BEGIN CERTIFICATE-----
MIIEjzCCA3egAwIBAgIQe55B/ALCKJDZtdNT8kD6hTANBgkqhkiG9w0BAQsFADBM
MSAwHgYDVQQLExdHbG9iYWxTaWduIFJvb3QgQ0EgLSBSMzETMBEGA1UEChMKR2xv
YmFsU2lnbjETMBEGA1UEAxMKR2xvYmFsU2lnbjAeFw0yMjAxMjYxMjAwMDBaFw0y
NTAxMjYwMDAwMDBaMFgxCzAJBgNVBAYTAkJFMRkwFwYDVQQKExBHbG9iYWxTaWdu
IG52LXNhMS4wLAYDVQQDEyVHbG9iYWxTaWduIEF0bGFzIFIzIE9WIFRMUyBDQSAy
MDIyIFEyMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmGmg1LW9b7Lf
8zDD83yBDTEkt+FOxKJZqF4veWc5KZsQj9HfnUS2e5nj/E+JImlGPsQuoiosLuXD
BVBNAMcUFa11buFMGMeEMwiTmCXoXRrXQmH0qjpOfKgYc5gHG3BsRGaRrf7VR4eg
ofNMG9wUBw4/g/TT7+bQJdA4NfE7Y4d5gEryZiBGB/swaX6Jp/8MF4TgUmOWmalK
dZCKyb4sPGQFRTtElk67F7vU+wdGcrcOx1tDcIB0ncjLPMnaFicagl+daWGsKqTh
counQb6QJtYHa91KvCfKWocMxQ7OIbB5UARLPmC4CJ1/f8YFm35ebfzAeULYdGXu
jE9CLor0OwIDAQABo4IBXzCCAVswDgYDVR0PAQH/BAQDAgGGMB0GA1UdJQQWMBQG
CCsGAQUFBwMBBggrBgEFBQcDAjASBgNVHRMBAf8ECDAGAQH/AgEAMB0GA1UdDgQW
BBSH5Zq7a7B/t95GfJWkDBpA8HHqdjAfBgNVHSMEGDAWgBSP8Et/qC5FJK5NUPpj
move4t0bvDB7BggrBgEFBQcBAQRvMG0wLgYIKwYBBQUHMAGGImh0dHA6Ly9vY3Nw
Mi5nbG9iYWxzaWduLmNvbS9yb290cjMwOwYIKwYBBQUHMAKGL2h0dHA6Ly9zZWN1
cmUuZ2xvYmFsc2lnbi5jb20vY2FjZXJ0L3Jvb3QtcjMuY3J0MDYGA1UdHwQvMC0w
K6ApoCeGJWh0dHA6Ly9jcmwuZ2xvYmFsc2lnbi5jb20vcm9vdC1yMy5jcmwwIQYD
VR0gBBowGDAIBgZngQwBAgIwDAYKKwYBBAGgMgoBAjANBgkqhkiG9w0BAQsFAAOC
AQEAKRic9/f+nmhQU/wz04APZLjgG5OgsuUOyUEZjKVhNGDwxGTvKhyXGGAMW2B/
3bRi+aElpXwoxu3pL6fkElbX3B0BeS5LoDtxkyiVEBMZ8m+sXbocwlPyxrPbX6mY
0rVIvnuUeBH8X0L5IwfpNVvKnBIilTbcebfHyXkPezGwz7E1yhUULjJFm2bt0SdX
y+4X/WeiiYIv+fTVgZZgl+/2MKIsu/qdBJc3f3TvJ8nz+Eax1zgZmww+RSQWeOj3
15Iw6Z5FX+NwzY/Ab+9PosR5UosSeq+9HhtaxZttXG1nVh+avYPGYddWmiMT90J5
ZgKnO/Fx2hBgTxhOTMYaD312kg==
-----END CERTIFICATE-----

-----BEGIN CERTIFICATE-----
MIIDXzCCAkegAwIBAgILBAAAAAABIVhTCKIwDQYJKoZIhvcNAQELBQAwTDEgMB4G
A1UECxMXR2xvYmFsU2lnbiBSb290IENBIC0gUjMxEzARBgNVBAoTCkdsb2JhbFNp
Z24xEzARBgNVBAMTCkdsb2JhbFNpZ24wHhcNMDkwMzE4MTAwMDAwWhcNMjkwMzE4
MTAwMDAwWjBMMSAwHgYDVQQLExdHbG9iYWxTaWduIFJvb3QgQ0EgLSBSMzETMBEG
A1UEChMKR2xvYmFsU2lnbjETMBEGA1UEAxMKR2xvYmFsU2lnbjCCASIwDQYJKoZI
hvcNAQEBBQADggEPADCCAQoCggEBAMwldpB5BngiFvXAg7aEyiie/QV2EcWtiHL8
RgJDx7KKnQRfJMsuS+FggkbhUqsMgUdwbN1k0ev1LKMPgj0MK66X17YUhhB5uzsT
gHeMCOFJ0mpiLx9e+pZo34knlTifBtc+ycsmWQ1z3rDI6SYOgxXG71uL0gRgykmm
KPZpO/bLyCiR5Z2KYVc3rHQU3HTgOu5yLy6c+9C7v/U9AOEGM+iCK65TpjoWc4zd
QQ4gOsC0p6Hpsk+QLjJg6VfLuQSSaGjlOCZgdbKfd/+RFO+uIEn8rUAVSNECMWEZ
XriX7613t2Saer9fwRPvm2L7DWzgVGkWqQPabumDk3F2xmmFghcCAwEAAaNCMEAw
DgYDVR0PAQH/BAQDAgEGMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFI/wS3+o
LkUkrk1Q+mOai97i3Ru8MA0GCSqGSIb3DQEBCwUAA4IBAQBLQNvAUKr+yAzv95ZU
RUm7lgAJQayzE4aGKAczymvmdLm6AC2upArT9fHxD4q/c2dKg8dEe3jgr25sbwMp
jjM5RcOO5LlXbKr8EpbsU8Yt5CRsuZRj+9xTaGdWPoO4zzUhw8lo/s7awlOqzJCK
6fBdRoyV3XpYKBovHd7NADdBj+1EbddTKJd+82cEHhXXipa0095MJ6RMG3NzdvQX
mcIfeg7jLQitChws/zyrVQ4PkX4268NXSb7hLi18YIvDQVETI53O9zJrlAGomecs
Mx86OyXShkDOOyyGeMlhLxS67ttVb9+E7gUJTb0o2HLO02JQZR7rkpeDMdmztcpH
WD9f
-----END CERTIFICATE-----`;c.default={RedisCloudFixed:{ca:d},RedisCloudFlexible:{ca:d}}},637776,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.noop=c.isArguments=c.defaults=c.Debug=c.getPackageMeta=c.zipMap=c.CONNECTION_CLOSED_ERROR_MSG=c.shuffle=c.sample=c.resolveTLSProfile=c.parseURL=c.optimizeErrorStack=c.toArg=c.convertMapToArray=c.convertObjectToArray=c.timeout=c.packObject=c.isInt=c.wrapMultiResult=c.convertBufferToString=void 0;let d=a.r(522734),e=a.r(814747),f=a.r(461950);Object.defineProperty(c,"defaults",{enumerable:!0,get:function(){return f.defaults}}),Object.defineProperty(c,"isArguments",{enumerable:!0,get:function(){return f.isArguments}}),Object.defineProperty(c,"noop",{enumerable:!0,get:function(){return f.noop}}),c.Debug=a.r(28419).default;let g=a.r(460480);function h(a){let b=parseFloat(a);return!isNaN(a)&&(0|b)===b}function i(a,b){if("family"===a){let a=Number.parseInt(b,10);if(!Number.isNaN(a))return a}return b}c.convertBufferToString=function a(b,c){if(b instanceof Buffer)return b.toString(c);if(Array.isArray(b)){let d=b.length,e=Array(d);for(let f=0;f<d;++f)e[f]=b[f]instanceof Buffer&&"utf8"===c?b[f].toString():a(b[f],c);return e}return b},c.wrapMultiResult=function(a){if(!a)return null;let b=[],c=a.length;for(let d=0;d<c;++d){let c=a[d];c instanceof Error?b.push([c]):b.push([null,c])}return b},c.isInt=h,c.packObject=function(a){let b={},c=a.length;for(let d=1;d<c;d+=2)b[a[d-1]]=a[d];return b},c.timeout=function(a,b){let c=null,d=function(){c&&(clearTimeout(c),c=null,a.apply(this,arguments))};return c=setTimeout(d,b,Error("timeout")),d},c.convertObjectToArray=function(a){let b=[],c=Object.keys(a);for(let d=0,e=c.length;d<e;d++)b.push(c[d],a[c[d]]);return b},c.convertMapToArray=function(a){let b=[],c=0;return a.forEach(function(a,d){b[c]=d,b[c+1]=a,c+=2}),b},c.toArg=function(a){return null==a?"":String(a)},c.optimizeErrorStack=function(a,b,c){let d,e=b.split("\n"),f="";for(d=1;d<e.length&&-1!==e[d].indexOf(c);++d);for(let a=d;a<e.length;++a)f+="\n"+e[a];if(a.stack){let b=a.stack.indexOf("\n");a.stack=a.stack.slice(0,b)+f}return a},c.parseURL=function(a){let b;if(h(a))return{port:a};let c=/^rediss?:\/\//i.test(a),d=a.startsWith("//");if("/"===a[0]&&!d){let b=a.indexOf("?"),c={path:-1===b?a:a.slice(0,b)};if(-1!==b){let d={};new URLSearchParams(a.slice(b+1)).forEach((a,b)=>{d[b]=i(b,a)}),(0,f.defaults)(c,d)}return c}b=new URL(c?a:d?"redis:"+a:"redis://"+a);let e={};b.searchParams.forEach((a,b)=>{e[b]=i(b,a)});let g={};return(b.username||b.password)&&(g.username=decodeURIComponent(b.username),g.password=decodeURIComponent(b.password)),b.pathname&&"/"!==b.pathname&&(c||d?b.pathname.length>1&&(g.db=b.pathname.slice(1)):g.path=b.pathname),b.hostname&&(g.host=b.hostname.replace(/^\[|\]$/g,"")),b.port&&(g.port=b.port),(0,f.defaults)(g,e),g},c.resolveTLSProfile=function(a){let b=null==a?void 0:a.tls;"string"==typeof b&&(b={profile:b});let c=g.default[null==b?void 0:b.profile];return c&&(b=Object.assign({},c,b),delete b.profile,a=Object.assign({},a,{tls:b})),a},c.sample=function(a,b=0){let c=a.length;return b>=c?null:a[b+Math.floor(Math.random()*(c-b))]},c.shuffle=function(a){let b=a.length;for(;b>0;){let c=Math.floor(Math.random()*b);b--,[a[b],a[c]]=[a[c],a[b]]}return a},c.CONNECTION_CLOSED_ERROR_MSG="Connection is closed.",c.zipMap=function(a,b){let c=new Map;return a.forEach((a,d)=>{c.set(a,b[d])}),c};let j=null;c.getPackageMeta=async function(){if(j)return j;try{let a=(0,e.resolve)("/ROOT/node_modules/.pnpm/ioredis@5.11.1/node_modules/ioredis/built/utils","..","..","package.json"),b=await d.promises.readFile(a,"utf8");return j={version:JSON.parse(b).version}}catch(a){return j={version:"error-fetching-version"}}}},182701,(a,b,c)=>{"use strict";b.exports={MAX_LENGTH:256,MAX_SAFE_COMPONENT_LENGTH:16,MAX_SAFE_BUILD_LENGTH:250,MAX_SAFE_INTEGER:Number.MAX_SAFE_INTEGER||0x1fffffffffffff,RELEASE_TYPES:["major","premajor","minor","preminor","patch","prepatch","prerelease"],SEMVER_SPEC_VERSION:"2.0.0",FLAG_INCLUDE_PRERELEASE:1,FLAG_LOOSE:2}},808613,(a,b,c)=>{"use strict";b.exports="object"==typeof process&&process.env&&process.env.NODE_DEBUG&&/\bsemver\b/i.test(process.env.NODE_DEBUG)?(...a)=>console.error("SEMVER",...a):()=>{}},341271,(a,b,c)=>{"use strict";let{MAX_SAFE_COMPONENT_LENGTH:d,MAX_SAFE_BUILD_LENGTH:e,MAX_LENGTH:f}=a.r(182701),g=a.r(808613),h=(c=b.exports={}).re=[],i=c.safeRe=[],j=c.src=[],k=c.safeSrc=[],l=c.t={},m=0,n="[a-zA-Z0-9-]",o=[["\\s",1],["\\d",f],[n,e]],p=(a,b,c)=>{let d=(a=>{for(let[b,c]of o)a=a.split(`${b}*`).join(`${b}{0,${c}}`).split(`${b}+`).join(`${b}{1,${c}}`);return a})(b),e=m++;g(a,e,b),l[a]=e,j[e]=b,k[e]=d,h[e]=new RegExp(b,c?"g":void 0),i[e]=new RegExp(d,c?"g":void 0)};p("NUMERICIDENTIFIER","0|[1-9]\\d*"),p("NUMERICIDENTIFIERLOOSE","\\d+"),p("NONNUMERICIDENTIFIER",`\\d*[a-zA-Z-]${n}*`),p("MAINVERSION",`(${j[l.NUMERICIDENTIFIER]})\\.(${j[l.NUMERICIDENTIFIER]})\\.(${j[l.NUMERICIDENTIFIER]})`),p("MAINVERSIONLOOSE",`(${j[l.NUMERICIDENTIFIERLOOSE]})\\.(${j[l.NUMERICIDENTIFIERLOOSE]})\\.(${j[l.NUMERICIDENTIFIERLOOSE]})`),p("PRERELEASEIDENTIFIER",`(?:${j[l.NONNUMERICIDENTIFIER]}|${j[l.NUMERICIDENTIFIER]})`),p("PRERELEASEIDENTIFIERLOOSE",`(?:${j[l.NONNUMERICIDENTIFIER]}|${j[l.NUMERICIDENTIFIERLOOSE]})`),p("PRERELEASE",`(?:-(${j[l.PRERELEASEIDENTIFIER]}(?:\\.${j[l.PRERELEASEIDENTIFIER]})*))`),p("PRERELEASELOOSE",`(?:-?(${j[l.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${j[l.PRERELEASEIDENTIFIERLOOSE]})*))`),p("BUILDIDENTIFIER",`${n}+`),p("BUILD",`(?:\\+(${j[l.BUILDIDENTIFIER]}(?:\\.${j[l.BUILDIDENTIFIER]})*))`),p("FULLPLAIN",`v?${j[l.MAINVERSION]}${j[l.PRERELEASE]}?${j[l.BUILD]}?`),p("FULL",`^${j[l.FULLPLAIN]}$`),p("LOOSEPLAIN",`[v=\\s]*${j[l.MAINVERSIONLOOSE]}${j[l.PRERELEASELOOSE]}?${j[l.BUILD]}?`),p("LOOSE",`^${j[l.LOOSEPLAIN]}$`),p("GTLT","((?:<|>)?=?)"),p("XRANGEIDENTIFIERLOOSE",`${j[l.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`),p("XRANGEIDENTIFIER",`${j[l.NUMERICIDENTIFIER]}|x|X|\\*`),p("XRANGEPLAIN",`[v=\\s]*(${j[l.XRANGEIDENTIFIER]})(?:\\.(${j[l.XRANGEIDENTIFIER]})(?:\\.(${j[l.XRANGEIDENTIFIER]})(?:${j[l.PRERELEASE]})?${j[l.BUILD]}?)?)?`),p("XRANGEPLAINLOOSE",`[v=\\s]*(${j[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${j[l.XRANGEIDENTIFIERLOOSE]})(?:\\.(${j[l.XRANGEIDENTIFIERLOOSE]})(?:${j[l.PRERELEASELOOSE]})?${j[l.BUILD]}?)?)?`),p("XRANGE",`^${j[l.GTLT]}\\s*${j[l.XRANGEPLAIN]}$`),p("XRANGELOOSE",`^${j[l.GTLT]}\\s*${j[l.XRANGEPLAINLOOSE]}$`),p("COERCEPLAIN",`(^|[^\\d])(\\d{1,${d}})(?:\\.(\\d{1,${d}}))?(?:\\.(\\d{1,${d}}))?`),p("COERCE",`${j[l.COERCEPLAIN]}(?:$|[^\\d])`),p("COERCEFULL",j[l.COERCEPLAIN]+`(?:${j[l.PRERELEASE]})?`+`(?:${j[l.BUILD]})?`+"(?:$|[^\\d])"),p("COERCERTL",j[l.COERCE],!0),p("COERCERTLFULL",j[l.COERCEFULL],!0),p("LONETILDE","(?:~>?)"),p("TILDETRIM",`(\\s*)${j[l.LONETILDE]}\\s+`,!0),c.tildeTrimReplace="$1~",p("TILDE",`^${j[l.LONETILDE]}${j[l.XRANGEPLAIN]}$`),p("TILDELOOSE",`^${j[l.LONETILDE]}${j[l.XRANGEPLAINLOOSE]}$`),p("LONECARET","(?:\\^)"),p("CARETTRIM",`(\\s*)${j[l.LONECARET]}\\s+`,!0),c.caretTrimReplace="$1^",p("CARET",`^${j[l.LONECARET]}${j[l.XRANGEPLAIN]}$`),p("CARETLOOSE",`^${j[l.LONECARET]}${j[l.XRANGEPLAINLOOSE]}$`),p("COMPARATORLOOSE",`^${j[l.GTLT]}\\s*(${j[l.LOOSEPLAIN]})$|^$`),p("COMPARATOR",`^${j[l.GTLT]}\\s*(${j[l.FULLPLAIN]})$|^$`),p("COMPARATORTRIM",`(\\s*)${j[l.GTLT]}\\s*(${j[l.LOOSEPLAIN]}|${j[l.XRANGEPLAIN]})`,!0),c.comparatorTrimReplace="$1$2$3",p("HYPHENRANGE",`^\\s*(${j[l.XRANGEPLAIN]})\\s+-\\s+(${j[l.XRANGEPLAIN]})\\s*$`),p("HYPHENRANGELOOSE",`^\\s*(${j[l.XRANGEPLAINLOOSE]})\\s+-\\s+(${j[l.XRANGEPLAINLOOSE]})\\s*$`),p("STAR","(<|>)?=?\\s*\\*"),p("GTE0","^\\s*>=\\s*0\\.0\\.0\\s*$"),p("GTE0PRE","^\\s*>=\\s*0\\.0\\.0-0\\s*$")},103111,(a,b,c)=>{"use strict";let d=Object.freeze({loose:!0}),e=Object.freeze({});b.exports=a=>a?"object"!=typeof a?d:a:e},117203,(a,b,c)=>{"use strict";let d=/^[0-9]+$/,e=(a,b)=>{if("number"==typeof a&&"number"==typeof b)return a===b?0:a<b?-1:1;let c=d.test(a),e=d.test(b);return c&&e&&(a*=1,b*=1),a===b?0:c&&!e?-1:e&&!c?1:a<b?-1:1};b.exports={compareIdentifiers:e,rcompareIdentifiers:(a,b)=>e(b,a)}},639483,(a,b,c)=>{"use strict";let d=a.r(808613),{MAX_LENGTH:e,MAX_SAFE_INTEGER:f}=a.r(182701),{safeRe:g,t:h}=a.r(341271),i=a.r(103111),{compareIdentifiers:j}=a.r(117203);class k{constructor(a,b){if(b=i(b),a instanceof k)if(!!b.loose===a.loose&&!!b.includePrerelease===a.includePrerelease)return a;else a=a.version;else if("string"!=typeof a)throw TypeError(`Invalid version. Must be a string. Got type "${typeof a}".`);if(a.length>e)throw TypeError(`version is longer than ${e} characters`);d("SemVer",a,b),this.options=b,this.loose=!!b.loose,this.includePrerelease=!!b.includePrerelease;const c=a.trim().match(b.loose?g[h.LOOSE]:g[h.FULL]);if(!c)throw TypeError(`Invalid Version: ${a}`);if(this.raw=a,this.major=+c[1],this.minor=+c[2],this.patch=+c[3],this.major>f||this.major<0)throw TypeError("Invalid major version");if(this.minor>f||this.minor<0)throw TypeError("Invalid minor version");if(this.patch>f||this.patch<0)throw TypeError("Invalid patch version");c[4]?this.prerelease=c[4].split(".").map(a=>{if(/^[0-9]+$/.test(a)){let b=+a;if(b>=0&&b<f)return b}return a}):this.prerelease=[],this.build=c[5]?c[5].split("."):[],this.format()}format(){return this.version=`${this.major}.${this.minor}.${this.patch}`,this.prerelease.length&&(this.version+=`-${this.prerelease.join(".")}`),this.version}toString(){return this.version}compare(a){if(d("SemVer.compare",this.version,this.options,a),!(a instanceof k)){if("string"==typeof a&&a===this.version)return 0;a=new k(a,this.options)}return a.version===this.version?0:this.compareMain(a)||this.comparePre(a)}compareMain(a){return(a instanceof k||(a=new k(a,this.options)),this.major<a.major)?-1:this.major>a.major?1:this.minor<a.minor?-1:this.minor>a.minor?1:this.patch<a.patch?-1:+(this.patch>a.patch)}comparePre(a){if(a instanceof k||(a=new k(a,this.options)),this.prerelease.length&&!a.prerelease.length)return -1;if(!this.prerelease.length&&a.prerelease.length)return 1;if(!this.prerelease.length&&!a.prerelease.length)return 0;let b=0;do{let c=this.prerelease[b],e=a.prerelease[b];if(d("prerelease compare",b,c,e),void 0===c&&void 0===e)return 0;if(void 0===e)return 1;if(void 0===c)return -1;else if(c===e)continue;else return j(c,e)}while(++b)}compareBuild(a){a instanceof k||(a=new k(a,this.options));let b=0;do{let c=this.build[b],e=a.build[b];if(d("build compare",b,c,e),void 0===c&&void 0===e)return 0;if(void 0===e)return 1;if(void 0===c)return -1;else if(c===e)continue;else return j(c,e)}while(++b)}inc(a,b,c){if(a.startsWith("pre")){if(!b&&!1===c)throw Error("invalid increment argument: identifier is empty");if(b){let a=`-${b}`.match(this.options.loose?g[h.PRERELEASELOOSE]:g[h.PRERELEASE]);if(!a||a[1]!==b)throw Error(`invalid identifier: ${b}`)}}switch(a){case"premajor":this.prerelease.length=0,this.patch=0,this.minor=0,this.major++,this.inc("pre",b,c);break;case"preminor":this.prerelease.length=0,this.patch=0,this.minor++,this.inc("pre",b,c);break;case"prepatch":this.prerelease.length=0,this.inc("patch",b,c),this.inc("pre",b,c);break;case"prerelease":0===this.prerelease.length&&this.inc("patch",b,c),this.inc("pre",b,c);break;case"release":if(0===this.prerelease.length)throw Error(`version ${this.raw} is not a prerelease`);this.prerelease.length=0;break;case"major":(0!==this.minor||0!==this.patch||0===this.prerelease.length)&&this.major++,this.minor=0,this.patch=0,this.prerelease=[];break;case"minor":(0!==this.patch||0===this.prerelease.length)&&this.minor++,this.patch=0,this.prerelease=[];break;case"patch":0===this.prerelease.length&&this.patch++,this.prerelease=[];break;case"pre":{let a=+!!Number(c);if(0===this.prerelease.length)this.prerelease=[a];else{let d=this.prerelease.length;for(;--d>=0;)"number"==typeof this.prerelease[d]&&(this.prerelease[d]++,d=-2);if(-1===d){if(b===this.prerelease.join(".")&&!1===c)throw Error("invalid increment argument: identifier already exists");this.prerelease.push(a)}}if(b){let d=[b,a];!1===c&&(d=[b]),((a,b)=>{let c=b.split(".");if(c.length>a.length)return!1;for(let b=0;b<c.length;b++)if(0!==j(a[b],c[b]))return!1;return!0})(this.prerelease,b)?isNaN(this.prerelease[b.split(".").length])&&(this.prerelease=d):this.prerelease=d}break}default:throw Error(`invalid increment argument: ${a}`)}return this.raw=this.format(),this.build.length&&(this.raw+=`+${this.build.join(".")}`),this}}b.exports=k},507458,(a,b,c)=>{"use strict";let d=a.r(639483);b.exports=(a,b,c=!1)=>{if(a instanceof d)return a;try{return new d(a,b)}catch(a){if(!c)return null;throw a}}},899989,(a,b,c)=>{"use strict";let d=a.r(507458);b.exports=(a,b)=>{let c=d(a,b);return c?c.version:null}},413475,(a,b,c)=>{"use strict";let d=a.r(507458);b.exports=(a,b)=>{let c=d(a.trim().replace(/^[=v]+/,""),b);return c?c.version:null}},473765,(a,b,c)=>{"use strict";let d=a.r(639483);b.exports=(a,b,c,e,f)=>{"string"==typeof c&&(f=e,e=c,c=void 0);try{return new d(a instanceof d?a.version:a,c).inc(b,e,f).version}catch(a){return null}}},292780,(a,b,c)=>{"use strict";let d=a.r(507458);b.exports=(a,b)=>{let c=d(a,null,!0),e=d(b,null,!0),f=c.compare(e);if(0===f)return null;let g=f>0,h=g?c:e,i=g?e:c,j=!!h.prerelease.length;if(i.prerelease.length&&!j){if(!i.patch&&!i.minor)return"major";if(0===i.compareMain(h))return i.minor&&!i.patch?"minor":"patch"}let k=j?"pre":"";return c.major!==e.major?k+"major":c.minor!==e.minor?k+"minor":c.patch!==e.patch?k+"patch":"prerelease"}},112087,(a,b,c)=>{"use strict";let d=a.r(639483);b.exports=(a,b)=>new d(a,b).major},380524,(a,b,c)=>{"use strict";let d=a.r(639483);b.exports=(a,b)=>new d(a,b).minor},998662,(a,b,c)=>{"use strict";let d=a.r(639483);b.exports=(a,b)=>new d(a,b).patch},243974,(a,b,c)=>{"use strict";let d=a.r(507458);b.exports=(a,b)=>{let c=d(a,b);return c&&c.prerelease.length?c.prerelease:null}},105503,(a,b,c)=>{"use strict";let d=a.r(639483);b.exports=(a,b,c)=>new d(a,c).compare(new d(b,c))},549295,(a,b,c)=>{"use strict";let d=a.r(105503);b.exports=(a,b,c)=>d(b,a,c)},571576,(a,b,c)=>{"use strict";let d=a.r(105503);b.exports=(a,b)=>d(a,b,!0)},328487,(a,b,c)=>{"use strict";let d=a.r(639483);b.exports=(a,b,c)=>{let e=new d(a,c),f=new d(b,c);return e.compare(f)||e.compareBuild(f)}},635976,(a,b,c)=>{"use strict";let d=a.r(328487);b.exports=(a,b)=>a.sort((a,c)=>d(a,c,b))},598648,(a,b,c)=>{"use strict";let d=a.r(328487);b.exports=(a,b)=>a.sort((a,c)=>d(c,a,b))},336562,(a,b,c)=>{"use strict";let d=a.r(105503);b.exports=(a,b,c)=>d(a,b,c)>0},226663,(a,b,c)=>{"use strict";let d=a.r(105503);b.exports=(a,b,c)=>0>d(a,b,c)},802457,(a,b,c)=>{"use strict";let d=a.r(105503);b.exports=(a,b,c)=>0===d(a,b,c)},520969,(a,b,c)=>{"use strict";let d=a.r(105503);b.exports=(a,b,c)=>0!==d(a,b,c)},893990,(a,b,c)=>{"use strict";let d=a.r(105503);b.exports=(a,b,c)=>d(a,b,c)>=0},645984,(a,b,c)=>{"use strict";let d=a.r(105503);b.exports=(a,b,c)=>0>=d(a,b,c)},299747,(a,b,c)=>{"use strict";let d=a.r(802457),e=a.r(520969),f=a.r(336562),g=a.r(893990),h=a.r(226663),i=a.r(645984);b.exports=(a,b,c,j)=>{switch(b){case"===":return"object"==typeof a&&(a=a.version),"object"==typeof c&&(c=c.version),a===c;case"!==":return"object"==typeof a&&(a=a.version),"object"==typeof c&&(c=c.version),a!==c;case"":case"=":case"==":return d(a,c,j);case"!=":return e(a,c,j);case">":return f(a,c,j);case">=":return g(a,c,j);case"<":return h(a,c,j);case"<=":return i(a,c,j);default:throw TypeError(`Invalid operator: ${b}`)}}},867907,(a,b,c)=>{"use strict";let d=a.r(639483),e=a.r(507458),{safeRe:f,t:g}=a.r(341271);b.exports=(a,b)=>{if(a instanceof d)return a;if("number"==typeof a&&(a=String(a)),"string"!=typeof a)return null;let c=null;if((b=b||{}).rtl){let d,e=b.includePrerelease?f[g.COERCERTLFULL]:f[g.COERCERTL];for(;(d=e.exec(a))&&(!c||c.index+c[0].length!==a.length);)c&&d.index+d[0].length===c.index+c[0].length||(c=d),e.lastIndex=d.index+d[1].length+d[2].length;e.lastIndex=-1}else c=a.match(b.includePrerelease?f[g.COERCEFULL]:f[g.COERCE]);if(null===c)return null;let h=c[2],i=c[3]||"0",j=c[4]||"0",k=b.includePrerelease&&c[5]?`-${c[5]}`:"",l=b.includePrerelease&&c[6]?`+${c[6]}`:"";return e(`${h}.${i}.${j}${k}${l}`,b)}},234510,(a,b,c)=>{"use strict";let d=a.r(507458),e=a.r(182701),f=a.r(639483),g=a=>a.startsWith("pre");b.exports=(a,b,c)=>{let h,i;if(!e.RELEASE_TYPES.includes(b))return null;let j=(h=a,i=c,d(h instanceof f?h.version:h,i));return j&&((a,b)=>{if(g(b))return a.version;switch(a.prerelease=[],b){case"major":a.minor=0,a.patch=0;break;case"minor":a.patch=0}return a.format()})(j,b)}},1923,(a,b,c)=>{"use strict";b.exports=class{constructor(){this.max=1e3,this.map=new Map}get(a){let b=this.map.get(a);if(void 0!==b)return this.map.delete(a),this.map.set(a,b),b}delete(a){return this.map.delete(a)}set(a,b){if(!this.delete(a)&&void 0!==b){if(this.map.size>=this.max){let a=this.map.keys().next().value;this.delete(a)}this.map.set(a,b)}return this}}},953922,(a,b,c)=>{"use strict";let d=/\s+/g;class e{constructor(a,b){if(b=g(b),a instanceof e)if(!!b.loose===a.loose&&!!b.includePrerelease===a.includePrerelease)return a;else return new e(a.raw,b);if(a instanceof h)return this.raw=a.value,this.set=[[a]],this.formatted=void 0,this;if(this.options=b,this.loose=!!b.loose,this.includePrerelease=!!b.includePrerelease,this.raw=a.trim().replace(d," "),this.set=this.raw.split("||").map(a=>this.parseRange(a.trim())).filter(a=>a.length),!this.set.length)throw TypeError(`Invalid SemVer Range: ${this.raw}`);if(this.set.length>1){const a=this.set[0];if(this.set=this.set.filter(a=>!t(a[0])),0===this.set.length)this.set=[a];else if(this.set.length>1){for(const a of this.set)if(1===a.length&&u(a[0])){this.set=[a];break}}}this.formatted=void 0}get range(){if(void 0===this.formatted){this.formatted="";for(let a=0;a<this.set.length;a++){a>0&&(this.formatted+="||");let b=this.set[a];for(let a=0;a<b.length;a++)a>0&&(this.formatted+=" "),this.formatted+=b[a].toString().trim()}}return this.formatted}format(){return this.range}toString(){return this.range}parseRange(a){a=a.replace(s,"");let b=((this.options.includePrerelease&&q)|(this.options.loose&&r))+":"+a,c=f.get(b);if(c)return c;let d=this.options.loose,e=d?k[m.HYPHENRANGELOOSE]:k[m.HYPHENRANGE];i("hyphen replace",a=a.replace(e,G(this.options.includePrerelease))),i("comparator trim",a=a.replace(k[m.COMPARATORTRIM],n)),i("tilde trim",a=a.replace(k[m.TILDETRIM],o)),i("caret trim",a=a.replace(k[m.CARETTRIM],p));let g=a.split(" ").map(a=>w(a,this.options)).join(" ").split(/\s+/).map(a=>F(a,this.options));d&&(g=g.filter(a=>(i("loose invalid filter",a,this.options),!!a.match(k[m.COMPARATORLOOSE])))),i("range list",g);let j=new Map;for(let a of g.map(a=>new h(a,this.options))){if(t(a))return[a];j.set(a.value,a)}j.size>1&&j.has("")&&j.delete("");let l=[...j.values()];return f.set(b,l),l}intersects(a,b){if(!(a instanceof e))throw TypeError("a Range is required");return this.set.some(c=>v(c,b)&&a.set.some(a=>v(a,b)&&c.every(c=>a.every(a=>c.intersects(a,b)))))}test(a){if(!a)return!1;if("string"==typeof a)try{a=new j(a,this.options)}catch(a){return!1}for(let b=0;b<this.set.length;b++)if(H(this.set[b],a,this.options))return!0;return!1}}b.exports=e;let f=new(a.r(1923)),g=a.r(103111),h=a.r(358624),i=a.r(808613),j=a.r(639483),{safeRe:k,src:l,t:m,comparatorTrimReplace:n,tildeTrimReplace:o,caretTrimReplace:p}=a.r(341271),{FLAG_INCLUDE_PRERELEASE:q,FLAG_LOOSE:r}=a.r(182701),s=RegExp(l[m.BUILD],"g"),t=a=>"<0.0.0-0"===a.value,u=a=>""===a.value,v=(a,b)=>{let c=!0,d=a.slice(),e=d.pop();for(;c&&d.length;)c=d.every(a=>e.intersects(a,b)),e=d.pop();return c},w=(a,b)=>(i("comp",a=a.replace(k[m.BUILD],""),b),i("caret",a=A(a,b)),i("tildes",a=y(a,b)),i("xrange",a=C(a,b)),i("stars",a=E(a,b)),a),x=a=>!a||"x"===a.toLowerCase()||"*"===a,y=(a,b)=>a.trim().split(/\s+/).map(a=>z(a,b)).join(" "),z=(a,b)=>{let c=b.loose?k[m.TILDELOOSE]:k[m.TILDE],d=b.includePrerelease?"-0":"";return a.replace(c,(b,c,e,f,g)=>{let h;return i("tilde",a,b,c,e,f,g),x(c)?h="":x(e)?h=`>=${c}.0.0${d} <${+c+1}.0.0-0`:x(f)?h=`>=${c}.${e}.0${d} <${c}.${+e+1}.0-0`:g?(i("replaceTilde pr",g),h=`>=${c}.${e}.${f}-${g} <${c}.${+e+1}.0-0`):h=`>=${c}.${e}.${f} <${c}.${+e+1}.0-0`,i("tilde return",h),h})},A=(a,b)=>a.trim().split(/\s+/).map(a=>B(a,b)).join(" "),B=(a,b)=>{i("caret",a,b);let c=b.loose?k[m.CARETLOOSE]:k[m.CARET],d=b.includePrerelease?"-0":"";return a.replace(c,(b,c,e,f,g)=>{let h;return i("caret",a,b,c,e,f,g),x(c)?h="":x(e)?h=`>=${c}.0.0${d} <${+c+1}.0.0-0`:x(f)?h="0"===c?`>=${c}.${e}.0${d} <${c}.${+e+1}.0-0`:`>=${c}.${e}.0${d} <${+c+1}.0.0-0`:g?(i("replaceCaret pr",g),h="0"===c?"0"===e?`>=${c}.${e}.${f}-${g} <${c}.${e}.${+f+1}-0`:`>=${c}.${e}.${f}-${g} <${c}.${+e+1}.0-0`:`>=${c}.${e}.${f}-${g} <${+c+1}.0.0-0`):(i("no pr"),h="0"===c?"0"===e?`>=${c}.${e}.${f} <${c}.${e}.${+f+1}-0`:`>=${c}.${e}.${f} <${c}.${+e+1}.0-0`:`>=${c}.${e}.${f} <${+c+1}.0.0-0`),i("caret return",h),h})},C=(a,b)=>(i("replaceXRanges",a,b),a.split(/\s+/).map(a=>D(a,b)).join(" ")),D=(a,b)=>{a=a.trim();let c=b.loose?k[m.XRANGELOOSE]:k[m.XRANGE];return a.replace(c,(c,d,e,f,g,h)=>{let j,k,l;if(i("xRange",a,c,d,e,f,g,h),j=e,k=f,l=g,x(j)&&!x(k)||x(k)&&l&&!x(l))return a;let m=x(e),n=m||x(f),o=n||x(g);return"="===d&&o&&(d=""),h=b.includePrerelease?"-0":"",m?c=">"===d||"<"===d?"<0.0.0-0":"*":d&&o?(n&&(f=0),g=0,">"===d?(d=">=",n?(e=+e+1,f=0):f=+f+1,g=0):"<="===d&&(d="<",n?e=+e+1:f=+f+1),"<"===d&&(h="-0"),c=`${d+e}.${f}.${g}${h}`):n?c=`>=${e}.0.0${h} <${+e+1}.0.0-0`:o&&(c=`>=${e}.${f}.0${h} <${e}.${+f+1}.0-0`),i("xRange return",c),c})},E=(a,b)=>(i("replaceStars",a,b),a.trim().replace(k[m.STAR],"")),F=(a,b)=>(i("replaceGTE0",a,b),a.trim().replace(k[b.includePrerelease?m.GTE0PRE:m.GTE0],"")),G=a=>(b,c,d,e,f,g,h,i,j,k,l,m)=>(c=x(d)?"":x(e)?`>=${d}.0.0${a?"-0":""}`:x(f)?`>=${d}.${e}.0${a?"-0":""}`:g?`>=${c}`:`>=${c}${a?"-0":""}`,i=x(j)?"":x(k)?`<${+j+1}.0.0-0`:x(l)?`<${j}.${+k+1}.0-0`:m?`<=${j}.${k}.${l}-${m}`:a?`<${j}.${k}.${+l+1}-0`:`<=${i}`,`${c} ${i}`.trim()),H=(a,b,c)=>{for(let c=0;c<a.length;c++)if(!a[c].test(b))return!1;if(b.prerelease.length&&!c.includePrerelease){for(let c=0;c<a.length;c++)if(i(a[c].semver),a[c].semver!==h.ANY&&a[c].semver.prerelease.length>0){let d=a[c].semver;if(d.major===b.major&&d.minor===b.minor&&d.patch===b.patch)return!0}return!1}return!0}},358624,(a,b,c)=>{"use strict";let d=Symbol("SemVer ANY");class e{static get ANY(){return d}constructor(a,b){if(b=f(b),a instanceof e)if(!!b.loose===a.loose)return a;else a=a.value;j("comparator",a=a.trim().split(/\s+/).join(" "),b),this.options=b,this.loose=!!b.loose,this.parse(a),this.semver===d?this.value="":this.value=this.operator+this.semver.version,j("comp",this)}parse(a){let b=this.options.loose?g[h.COMPARATORLOOSE]:g[h.COMPARATOR],c=a.match(b);if(!c)throw TypeError(`Invalid comparator: ${a}`);this.operator=void 0!==c[1]?c[1]:"","="===this.operator&&(this.operator=""),c[2]?this.semver=new k(c[2],this.options.loose):this.semver=d}toString(){return this.value}test(a){if(j("Comparator.test",a,this.options.loose),this.semver===d||a===d)return!0;if("string"==typeof a)try{a=new k(a,this.options)}catch(a){return!1}return i(a,this.operator,this.semver,this.options)}intersects(a,b){if(!(a instanceof e))throw TypeError("a Comparator is required");return""===this.operator?""===this.value||new l(a.value,b).test(this.value):""===a.operator?""===a.value||new l(this.value,b).test(a.semver):!((b=f(b)).includePrerelease&&("<0.0.0-0"===this.value||"<0.0.0-0"===a.value)||!b.includePrerelease&&(this.value.startsWith("<0.0.0")||a.value.startsWith("<0.0.0")))&&!!(this.operator.startsWith(">")&&a.operator.startsWith(">")||this.operator.startsWith("<")&&a.operator.startsWith("<")||this.semver.version===a.semver.version&&this.operator.includes("=")&&a.operator.includes("=")||i(this.semver,"<",a.semver,b)&&this.operator.startsWith(">")&&a.operator.startsWith("<")||i(this.semver,">",a.semver,b)&&this.operator.startsWith("<")&&a.operator.startsWith(">"))}}b.exports=e;let f=a.r(103111),{safeRe:g,t:h}=a.r(341271),i=a.r(299747),j=a.r(808613),k=a.r(639483),l=a.r(953922)},317453,(a,b,c)=>{"use strict";let d=a.r(953922);b.exports=(a,b,c)=>{try{b=new d(b,c)}catch(a){return!1}return b.test(a)}},212514,(a,b,c)=>{"use strict";let d=a.r(953922);b.exports=(a,b)=>new d(a,b).set.map(a=>a.map(a=>a.value).join(" ").trim().split(" "))},291378,(a,b,c)=>{"use strict";let d=a.r(639483),e=a.r(953922);b.exports=(a,b,c)=>{let f=null,g=null,h=null;try{h=new e(b,c)}catch(a){return null}return a.forEach(a=>{h.test(a)&&(!f||-1===g.compare(a))&&(g=new d(f=a,c))}),f}},496034,(a,b,c)=>{"use strict";let d=a.r(639483),e=a.r(953922);b.exports=(a,b,c)=>{let f=null,g=null,h=null;try{h=new e(b,c)}catch(a){return null}return a.forEach(a=>{h.test(a)&&(!f||1===g.compare(a))&&(g=new d(f=a,c))}),f}},621204,(a,b,c)=>{"use strict";let d=a.r(639483),e=a.r(953922),f=a.r(336562);b.exports=(a,b)=>{a=new e(a,b);let c=new d("0.0.0");if(a.test(c)||(c=new d("0.0.0-0"),a.test(c)))return c;c=null;for(let b=0;b<a.set.length;++b){let e=a.set[b],g=null;e.forEach(a=>{let b=new d(a.semver.version);switch(a.operator){case">":0===b.prerelease.length?b.patch++:b.prerelease.push(0),b.raw=b.format();case"":case">=":(!g||f(b,g))&&(g=b);break;case"<":case"<=":break;default:throw Error(`Unexpected operation: ${a.operator}`)}}),g&&(!c||f(c,g))&&(c=g)}return c&&a.test(c)?c:null}},470735,(a,b,c)=>{"use strict";let d=a.r(953922);b.exports=(a,b)=>{try{return new d(a,b).range||"*"}catch(a){return null}}},358027,(a,b,c)=>{"use strict";let d=a.r(639483),e=a.r(358624),{ANY:f}=e,g=a.r(953922),h=a.r(317453),i=a.r(336562),j=a.r(226663),k=a.r(645984),l=a.r(893990);b.exports=(a,b,c,m)=>{let n,o,p,q,r;switch(a=new d(a,m),b=new g(b,m),c){case">":n=i,o=k,p=j,q=">",r=">=";break;case"<":n=j,o=l,p=i,q="<",r="<=";break;default:throw TypeError('Must provide a hilo val of "<" or ">"')}if(h(a,b,m))return!1;for(let c=0;c<b.set.length;++c){let d=b.set[c],g=null,h=null;if(d.forEach(a=>{a.semver===f&&(a=new e(">=0.0.0")),g=g||a,h=h||a,n(a.semver,g.semver,m)?g=a:p(a.semver,h.semver,m)&&(h=a)}),g.operator===q||g.operator===r||(!h.operator||h.operator===q)&&o(a,h.semver)||h.operator===r&&p(a,h.semver))return!1}return!0}},892262,(a,b,c)=>{"use strict";let d=a.r(358027);b.exports=(a,b,c)=>d(a,b,">",c)},116080,(a,b,c)=>{"use strict";let d=a.r(358027);b.exports=(a,b,c)=>d(a,b,"<",c)},963389,(a,b,c)=>{"use strict";let d=a.r(953922);b.exports=(a,b,c)=>(a=new d(a,c),b=new d(b,c),a.intersects(b,c))},375320,(a,b,c)=>{"use strict";let d=a.r(317453),e=a.r(105503);b.exports=(a,b,c)=>{let f=[],g=null,h=null,i=a.sort((a,b)=>e(a,b,c));for(let a of i)d(a,b,c)?(h=a,g||(g=a)):(h&&f.push([g,h]),h=null,g=null);g&&f.push([g,null]);let j=[];for(let[a,b]of f)a===b?j.push(a):b||a!==i[0]?b?a===i[0]?j.push(`<=${b}`):j.push(`${a} - ${b}`):j.push(`>=${a}`):j.push("*");let k=j.join(" || "),l="string"==typeof b.raw?b.raw:String(b);return k.length<l.length?k:b}},875369,(a,b,c)=>{"use strict";let d=a.r(953922),e=a.r(358624),{ANY:f}=e,g=a.r(317453),h=a.r(105503),i=[new e(">=0.0.0-0")],j=[new e(">=0.0.0")],k=(a,b,c)=>{let d,e,k,n,o,p,q;if(a===b)return!0;if(1===a.length&&a[0].semver===f)if(1===b.length&&b[0].semver===f)return!0;else a=c.includePrerelease?i:j;if(1===b.length&&b[0].semver===f)if(c.includePrerelease)return!0;else b=j;let r=new Set;for(let b of a)">"===b.operator||">="===b.operator?d=l(d,b,c):"<"===b.operator||"<="===b.operator?e=m(e,b,c):r.add(b.semver);if(r.size>1)return null;if(d&&e&&((k=h(d.semver,e.semver,c))>0||0===k&&(">="!==d.operator||"<="!==e.operator)))return null;for(let a of r){if(d&&!g(a,String(d),c)||e&&!g(a,String(e),c))return null;for(let d of b)if(!g(a,String(d),c))return!1;return!0}let s=!!e&&!c.includePrerelease&&!!e.semver.prerelease.length&&e.semver,t=!!d&&!c.includePrerelease&&!!d.semver.prerelease.length&&d.semver;for(let a of(s&&1===s.prerelease.length&&"<"===e.operator&&0===s.prerelease[0]&&(s=!1),b)){if(q=q||">"===a.operator||">="===a.operator,p=p||"<"===a.operator||"<="===a.operator,d){if(t&&a.semver.prerelease&&a.semver.prerelease.length&&a.semver.major===t.major&&a.semver.minor===t.minor&&a.semver.patch===t.patch&&(t=!1),">"===a.operator||">="===a.operator){if((n=l(d,a,c))===a&&n!==d)return!1}else if(">="===d.operator&&!a.test(d.semver))return!1}if(e){if(s&&a.semver.prerelease&&a.semver.prerelease.length&&a.semver.major===s.major&&a.semver.minor===s.minor&&a.semver.patch===s.patch&&(s=!1),"<"===a.operator||"<="===a.operator){if((o=m(e,a,c))===a&&o!==e)return!1}else if("<="===e.operator&&!a.test(e.semver))return!1}if(!a.operator&&(e||d)&&0!==k)return!1}return(!d||!p||!!e||0===k)&&(!e||!q||!!d||0===k)&&!t&&!s&&!0},l=(a,b,c)=>{if(!a)return b;let d=h(a.semver,b.semver,c);return d>0?a:d<0||">"===b.operator&&">="===a.operator?b:a},m=(a,b,c)=>{if(!a)return b;let d=h(a.semver,b.semver,c);return d<0?a:d>0||"<"===b.operator&&"<="===a.operator?b:a};b.exports=(a,b,c={})=>{if(a===b)return!0;a=new d(a,c),b=new d(b,c);let e=!1;a:for(let d of a.set){for(let a of b.set){let b=k(d,a,c);if(e=e||null!==b,b)continue a}if(e)return!1}return!0}},955311,(a,b,c)=>{"use strict";let d=a.r(341271),e=a.r(182701),f=a.r(639483),g=a.r(117203),h=a.r(507458),i=a.r(899989),j=a.r(413475),k=a.r(473765),l=a.r(292780),m=a.r(112087),n=a.r(380524),o=a.r(998662),p=a.r(243974),q=a.r(105503),r=a.r(549295),s=a.r(571576),t=a.r(328487),u=a.r(635976),v=a.r(598648),w=a.r(336562),x=a.r(226663),y=a.r(802457),z=a.r(520969),A=a.r(893990),B=a.r(645984),C=a.r(299747),D=a.r(867907),E=a.r(234510),F=a.r(358624),G=a.r(953922),H=a.r(317453),I=a.r(212514),J=a.r(291378),K=a.r(496034),L=a.r(621204),M=a.r(470735),N=a.r(358027),O=a.r(892262),P=a.r(116080),Q=a.r(963389);b.exports={parse:h,valid:i,clean:j,inc:k,diff:l,major:m,minor:n,patch:o,prerelease:p,compare:q,rcompare:r,compareLoose:s,compareBuild:t,sort:u,rsort:v,gt:w,lt:x,eq:y,neq:z,gte:A,lte:B,cmp:C,coerce:D,truncate:E,Comparator:F,Range:G,satisfies:H,toComparators:I,maxSatisfying:J,minSatisfying:K,minVersion:L,validRange:M,outside:N,gtr:O,ltr:P,intersects:Q,simplifyRange:a.r(375320),subset:a.r(875369),SemVer:f,re:d.re,src:d.src,tokens:d.t,SEMVER_SPEC_VERSION:e.SEMVER_SPEC_VERSION,RELEASE_TYPES:e.RELEASE_TYPES,compareIdentifiers:g.compareIdentifiers,rcompareIdentifiers:g.rcompareIdentifiers}},362562,(a,b,c)=>{b.exports=a.x("module",()=>require("module"))},532743,(a,b,c)=>{"use strict";let d=()=>"linux"===process.platform,e=null;b.exports={isLinux:d,getReport:()=>(!e&&(d()&&process.report||(e={})),e)}},918815,(a,b,c)=>{"use strict";let d=a.r(522734);b.exports={LDD_PATH:"/usr/bin/ldd",SELF_PATH:"/proc/self/exe",readFileSync:a=>{let b=d.openSync(a,"r"),c=Buffer.alloc(2048),e=d.readSync(b,c,0,2048,0);return d.close(b,()=>{}),c.subarray(0,e)},readFile:a=>new Promise((b,c)=>{d.open(a,"r",(a,e)=>{if(a)c(a);else{let a=Buffer.alloc(2048);d.read(e,a,0,2048,0,(c,f)=>{b(a.subarray(0,f)),d.close(e,()=>{})})}})})}},805498,(a,b,c)=>{"use strict";b.exports={interpreterPath:a=>{if(a.length<64||0x7f454c46!==a.readUInt32BE(0)||2!==a.readUInt8(4)||1!==a.readUInt8(5))return null;let b=a.readUInt32LE(32),c=a.readUInt16LE(54),d=a.readUInt16LE(56);for(let e=0;e<d;e++){let d=b+e*c;if(3===a.readUInt32LE(d)){let b=a.readUInt32LE(d+8),c=a.readUInt32LE(d+32);return a.subarray(b,b+c).toString().replace(/\0.*$/g,"")}}return null}}},368078,(a,b,c)=>{"use strict";let d,e,f,g=a.r(233405),{isLinux:h,getReport:i}=a.r(532743),{LDD_PATH:j,SELF_PATH:k,readFile:l,readFileSync:m}=a.r(918815),{interpreterPath:n}=a.r(805498),o="getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true",p="",q=()=>p||new Promise(a=>{g.exec(o,(b,c)=>{a(p=b?" ":c)})}),r=()=>{if(!p)try{p=g.execSync(o,{encoding:"utf8"})}catch(a){p=" "}return p},s="glibc",t=/LIBC[a-z0-9 \-).]*?(\d+\.\d+)/i,u="musl",v=a=>a.includes("libc.musl-")||a.includes("ld-musl-"),w=()=>{let a=i();return a.header&&a.header.glibcVersionRuntime?s:Array.isArray(a.sharedObjects)&&a.sharedObjects.some(v)?u:null},x=a=>{let[b,c]=a.split(/[\r\n]+/);return b&&b.includes(s)?s:c&&c.includes(u)?u:null},y=a=>{if(a){if(a.includes("/ld-musl-"))return u;else if(a.includes("/ld-linux-"))return s}return null},z=a=>(a=a.toString()).includes("musl")?u:a.includes("GNU C Library")?s:null,A=async()=>{if(void 0!==e)return e;e=null;try{let a=await l(j);e=z(a)}catch(a){}return e},B=async()=>{if(void 0!==d)return d;d=null;try{let a=await l(k),b=n(a);d=y(b)}catch(a){}return d},C=async()=>{let a=null;return h()&&((a=await B())||((a=await A())||(a=w()),a||(a=x(await q())))),a},D=()=>{let a=null;return h()&&((a=(()=>{if(void 0!==d)return d;d=null;try{let a=m(k),b=n(a);d=y(b)}catch(a){}return d})())||((a=(()=>{if(void 0!==e)return e;e=null;try{let a=m(j);e=z(a)}catch(a){}return e})())||(a=w()),a||(a=x(r())))),a},E=async()=>h()&&await C()!==s,F=async()=>{if(void 0!==f)return f;f=null;try{let a=(await l(j)).match(t);a&&(f=a[1])}catch(a){}return f},G=()=>{let a=i();return a.header&&a.header.glibcVersionRuntime?a.header.glibcVersionRuntime:null},H=a=>a.trim().split(/\s+/)[1],I=a=>{let[b,c,d]=a.split(/[\r\n]+/);return b&&b.includes(s)?H(b):c&&d&&c.includes(u)?H(d):null};b.exports={GLIBC:s,MUSL:u,family:C,familySync:D,isNonGlibcLinux:E,isNonGlibcLinuxSync:()=>h()&&D()!==s,version:async()=>{let a=null;return h()&&((a=await F())||(a=G()),a||(a=I(await q()))),a},versionSync:()=>{let a=null;return h()&&((a=(()=>{if(void 0!==f)return f;f=null;try{let a=m(j).match(t);a&&(f=a[1])}catch(a){}return f})())||(a=G()),a||(a=I(r()))),a}}},998223,(a,b,c)=>{var d=a.r(522734),e=a.r(814747),f=a.r(792509),g=a.r(446786),h="function"==typeof __webpack_require__?__non_webpack_require__:a.t,i=process.config&&process.config.variables||{},j=!!process.env.PREBUILDS_ONLY,k=process.versions,l=k.modules;(k.deno||process.isBun)&&(l="unsupported");var m=process.versions&&process.versions.electron||process.env.ELECTRON_RUN_AS_NODE?"electron":process.versions&&process.versions.nw?"node-webkit":"node",n=process.env.npm_config_arch||g.arch(),o=process.env.npm_config_platform||g.platform(),p=process.env.LIBC||(!function(b){if("linux"!==b)return!1;let{familySync:c,MUSL:d}=a.r(368078);return c()===d}(o)?"glibc":"musl"),q=process.env.ARM_VERSION||("arm64"===n?"8":i.arm_version)||"",r=(k.uv||"").split(".")[0];function s(a){return h(s.resolve(a))}function t(a){try{return d.readdirSync(a)}catch(a){return[]}}function u(a,b){var c=t(a).filter(b);return c[0]&&e.join(a,c[0])}function v(a){return/\.node$/.test(a)}function w(a){var b=a.split("-");if(2===b.length){var c=b[0],d=b[1].split("+");if(c&&d.length&&d.every(Boolean))return{name:a,platform:c,architectures:d}}}function x(a,b){return function(c){return null!=c&&c.platform===a&&c.architectures.includes(b)}}function y(a,b){return a.architectures.length-b.architectures.length}function z(a){var b=a.split("."),c=b.pop(),d={file:a,specificity:0};if("node"===c){for(var e=0;e<b.length;e++){var f=b[e];if("node"===f||"electron"===f||"node-webkit"===f)d.runtime=f;else if("napi"===f)d.napi=!0;else if("abi"===f.slice(0,3))d.abi=f.slice(3);else if("uv"===f.slice(0,2))d.uv=f.slice(2);else if("armv"===f.slice(0,4))d.armv=f.slice(4);else{if("glibc"!==f&&"musl"!==f)continue;d.libc=f}d.specificity++}return d}}function A(a,b){return function(c){var d;return null!=c&&(c.runtime===a||!!("node"===(d=c).runtime&&d.napi))&&(c.abi===b||!!c.napi)&&(!c.uv||c.uv===r)&&(!c.armv||c.armv===q)&&(!c.libc||c.libc===p)&&!0}}function B(a){return function(b,c){return b.runtime!==c.runtime?b.runtime===a?-1:1:b.abi!==c.abi?b.abi?-1:1:b.specificity!==c.specificity?b.specificity>c.specificity?-1:1:0}}b.exports=s,s.resolve=s.path=function(b){b=e.resolve(b||".");var c,d,g="";try{var i=(g=h(e.join(b,"package.json")).name).toUpperCase().replace(/-/g,"_");process.env[i+"_PREBUILD"]&&(b=process.env[i+"_PREBUILD"])}catch(a){c=a}if(!j){var k=u(e.join(b,"build/Release"),v);if(k)return k;var s=u(e.join(b,"build/Debug"),v);if(s)return s}var C=H(b);if(C)return C;var D=H(e.dirname(process.execPath));if(D)return D;var E=("@"==g[0]?"":"@"+g+"/")+g+"-"+o+"-"+n;try{var F=e.dirname(a.r(362562).createRequire(f.pathToFileURL(e.join(b,"package.json"))).resolve(E));return I(F)}catch(a){d=a}let G="No native build was found for "+["platform="+o,"arch="+n,"runtime="+m,"abi="+l,"uv="+r,q?"armv="+q:"","libc="+p,"node="+process.versions.node,process.versions.electron?"electron="+process.versions.electron:"","function"==typeof __webpack_require__?"webpack=true":""].filter(Boolean).join(" ")+"\n    attempted loading from: "+b+" and package: "+E+"\n";throw c&&(G+="Error finding package.json: "+c.message+"\n"),d&&(G+="Error resolving package: "+d.message+"\n"),Error(G);function H(a){var b=t(e.join(a,"prebuilds")).map(w).filter(x(o,n)).sort(y)[0];if(b)return I(e.join(a,"prebuilds",b.name))}function I(a){var b=t(a).map(z).filter(A(m,l)).sort(B(m))[0];if(b)return e.join(a,b.file)}},s.parseTags=z,s.matchTags=A,s.compareTags=B,s.parseTuple=w,s.matchTuple=x,s.compareTuples=y},299528,(a,b,c)=>{let d="function"==typeof __webpack_require__?__non_webpack_require__:a.t;"function"==typeof d.addon?b.exports=d.addon.bind(d):b.exports=a.r(998223)},80536,(a,b,c)=>{b.exports=a.r(299528)("/ROOT/node_modules/.pnpm/msgpackr-extract@3.0.4/node_modules/msgpackr-extract")},409221,(a,b,c)=>{b.exports=JSON.parse('{"vadd":{"arity":-5,"flags":["write","denyoom","module"],"keyStart":1,"keyStop":1,"step":1},"vcard":{"arity":2,"flags":["readonly","module","fast"],"keyStart":1,"keyStop":1,"step":1},"vdim":{"arity":2,"flags":["readonly","module","fast"],"keyStart":1,"keyStop":1,"step":1},"vemb":{"arity":-3,"flags":["readonly","module","fast"],"keyStart":1,"keyStop":1,"step":1},"vgetattr":{"arity":3,"flags":["readonly","module","fast"],"keyStart":1,"keyStop":1,"step":1},"vinfo":{"arity":2,"flags":["readonly","module","fast"],"keyStart":1,"keyStop":1,"step":1},"vismember":{"arity":3,"flags":["readonly","module"],"keyStart":1,"keyStop":1,"step":1},"vlinks":{"arity":-3,"flags":["readonly","module","fast"],"keyStart":1,"keyStop":1,"step":1},"vrandmember":{"arity":-2,"flags":["readonly","module"],"keyStart":1,"keyStop":1,"step":1},"vrange":{"arity":-4,"flags":["readonly","module"],"keyStart":1,"keyStop":1,"step":1},"vrem":{"arity":3,"flags":["write","module"],"keyStart":1,"keyStop":1,"step":1},"vsetattr":{"arity":4,"flags":["write","module","fast"],"keyStart":1,"keyStop":1,"step":1},"vsim":{"arity":-4,"flags":["readonly","module"],"keyStart":1,"keyStop":1,"step":1},"acl":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"append":{"arity":3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"arcount":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"ardel":{"arity":-3,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"ardelrange":{"arity":-4,"flags":["write"],"keyStart":1,"keyStop":1,"step":1},"arget":{"arity":3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"argetrange":{"arity":4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"argrep":{"arity":-6,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"arinfo":{"arity":-2,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"arinsert":{"arity":-3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"arlastitems":{"arity":-3,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"arlen":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"armget":{"arity":-3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"armset":{"arity":-4,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"arnext":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"arop":{"arity":-5,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"arring":{"arity":-4,"flags":["write","denyoom"],"keyStart":1,"keyStop":1,"step":1},"arscan":{"arity":-4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"arseek":{"arity":3,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"arset":{"arity":-4,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"asking":{"arity":1,"flags":["fast"],"keyStart":0,"keyStop":0,"step":0},"auth":{"arity":-2,"flags":["noscript","loading","stale","fast","no_auth","allow_busy"],"keyStart":0,"keyStop":0,"step":0},"bgrewriteaof":{"arity":1,"flags":["admin","noscript","no_async_loading"],"keyStart":0,"keyStop":0,"step":0},"bgsave":{"arity":-1,"flags":["admin","noscript","no_async_loading"],"keyStart":0,"keyStop":0,"step":0},"bitcount":{"arity":-2,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"bitfield":{"arity":-2,"flags":["write","denyoom"],"keyStart":1,"keyStop":1,"step":1},"bitfield_ro":{"arity":-2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"bitop":{"arity":-4,"flags":["write","denyoom"],"keyStart":2,"keyStop":-1,"step":1},"bitpos":{"arity":-3,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"blmove":{"arity":6,"flags":["write","denyoom","noscript","blocking"],"keyStart":1,"keyStop":2,"step":1},"blmpop":{"arity":-5,"flags":["write","blocking","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"blpop":{"arity":-3,"flags":["write","noscript","blocking"],"keyStart":1,"keyStop":-2,"step":1},"brpop":{"arity":-3,"flags":["write","noscript","blocking"],"keyStart":1,"keyStop":-2,"step":1},"brpoplpush":{"arity":4,"flags":["write","denyoom","noscript","blocking"],"keyStart":1,"keyStop":2,"step":1},"bzmpop":{"arity":-5,"flags":["write","blocking","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"bzpopmax":{"arity":-3,"flags":["write","noscript","blocking","fast"],"keyStart":1,"keyStop":-2,"step":1},"bzpopmin":{"arity":-3,"flags":["write","noscript","blocking","fast"],"keyStart":1,"keyStop":-2,"step":1},"client":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"cluster":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"command":{"arity":-1,"flags":["loading","stale"],"keyStart":0,"keyStop":0,"step":0},"config":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"copy":{"arity":-3,"flags":["write","denyoom"],"keyStart":1,"keyStop":2,"step":1},"dbsize":{"arity":1,"flags":["readonly","fast"],"keyStart":0,"keyStop":0,"step":0},"debug":{"arity":-2,"flags":["admin","noscript","loading","stale"],"keyStart":0,"keyStop":0,"step":0},"decr":{"arity":2,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"decrby":{"arity":3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"del":{"arity":-2,"flags":["write"],"keyStart":1,"keyStop":-1,"step":1},"discard":{"arity":1,"flags":["noscript","loading","stale","fast","allow_busy"],"keyStart":0,"keyStop":0,"step":0},"dump":{"arity":2,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"echo":{"arity":2,"flags":["fast"],"keyStart":0,"keyStop":0,"step":0},"eval":{"arity":-3,"flags":["noscript","stale","skip_monitor","no_mandatory_keys","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"eval_ro":{"arity":-3,"flags":["readonly","noscript","stale","skip_monitor","no_mandatory_keys","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"evalsha":{"arity":-3,"flags":["noscript","stale","skip_monitor","no_mandatory_keys","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"evalsha_ro":{"arity":-3,"flags":["readonly","noscript","stale","skip_monitor","no_mandatory_keys","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"exec":{"arity":1,"flags":["noscript","loading","stale","skip_slowlog"],"keyStart":0,"keyStop":0,"step":0},"exists":{"arity":-2,"flags":["readonly","fast"],"keyStart":1,"keyStop":-1,"step":1},"expire":{"arity":-3,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"expireat":{"arity":-3,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"expiretime":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"failover":{"arity":-1,"flags":["admin","noscript","stale"],"keyStart":0,"keyStop":0,"step":0},"fcall":{"arity":-3,"flags":["noscript","stale","skip_monitor","no_mandatory_keys","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"fcall_ro":{"arity":-3,"flags":["readonly","noscript","stale","skip_monitor","no_mandatory_keys","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"flushall":{"arity":-1,"flags":["write"],"keyStart":0,"keyStop":0,"step":0},"flushdb":{"arity":-1,"flags":["write"],"keyStart":0,"keyStop":0,"step":0},"function":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"geoadd":{"arity":-5,"flags":["write","denyoom"],"keyStart":1,"keyStop":1,"step":1},"geodist":{"arity":-4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"geohash":{"arity":-2,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"geopos":{"arity":-2,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"georadius":{"arity":-6,"flags":["write","denyoom","movablekeys"],"keyStart":1,"keyStop":1,"step":1},"georadius_ro":{"arity":-6,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"georadiusbymember":{"arity":-5,"flags":["write","denyoom","movablekeys"],"keyStart":1,"keyStop":1,"step":1},"georadiusbymember_ro":{"arity":-5,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"geosearch":{"arity":-7,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"geosearchstore":{"arity":-8,"flags":["write","denyoom"],"keyStart":1,"keyStop":2,"step":1},"get":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"getbit":{"arity":3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"getdel":{"arity":2,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"getex":{"arity":-2,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"getrange":{"arity":4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"getset":{"arity":3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"hdel":{"arity":-3,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"hello":{"arity":-1,"flags":["noscript","loading","stale","fast","no_auth","allow_busy"],"keyStart":0,"keyStop":0,"step":0},"hexists":{"arity":3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"hexpire":{"arity":-6,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"hexpireat":{"arity":-6,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"hexpiretime":{"arity":-5,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"hget":{"arity":3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"hgetall":{"arity":2,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"hgetdel":{"arity":-5,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"hgetex":{"arity":-5,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"hincrby":{"arity":4,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"hincrbyfloat":{"arity":4,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"hkeys":{"arity":2,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"hlen":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"hmget":{"arity":-3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"hmset":{"arity":-4,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"hpersist":{"arity":-5,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"hpexpire":{"arity":-6,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"hpexpireat":{"arity":-6,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"hpexpiretime":{"arity":-5,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"hpttl":{"arity":-5,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"hrandfield":{"arity":-2,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"hscan":{"arity":-3,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"hset":{"arity":-4,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"hsetex":{"arity":-6,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"hsetnx":{"arity":4,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"hstrlen":{"arity":3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"httl":{"arity":-5,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"hvals":{"arity":2,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"incr":{"arity":2,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"incrby":{"arity":3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"incrbyfloat":{"arity":3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"increx":{"arity":-2,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"info":{"arity":-1,"flags":["loading","stale"],"keyStart":0,"keyStop":0,"step":0},"keys":{"arity":2,"flags":["readonly"],"keyStart":0,"keyStop":0,"step":0},"lastsave":{"arity":1,"flags":["loading","stale","fast"],"keyStart":0,"keyStop":0,"step":0},"latency":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"lcs":{"arity":-3,"flags":["readonly"],"keyStart":1,"keyStop":2,"step":1},"lindex":{"arity":3,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"linsert":{"arity":5,"flags":["write","denyoom"],"keyStart":1,"keyStop":1,"step":1},"llen":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"lmove":{"arity":5,"flags":["write","denyoom"],"keyStart":1,"keyStop":2,"step":1},"lmpop":{"arity":-4,"flags":["write","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"lolwut":{"arity":-1,"flags":["readonly","fast"],"keyStart":0,"keyStop":0,"step":0},"lpop":{"arity":-2,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"lpos":{"arity":-3,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"lpush":{"arity":-3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"lpushx":{"arity":-3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"lrange":{"arity":4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"lrem":{"arity":4,"flags":["write"],"keyStart":1,"keyStop":1,"step":1},"lset":{"arity":4,"flags":["write","denyoom"],"keyStart":1,"keyStop":1,"step":1},"ltrim":{"arity":4,"flags":["write"],"keyStart":1,"keyStop":1,"step":1},"memory":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"mget":{"arity":-2,"flags":["readonly","fast"],"keyStart":1,"keyStop":-1,"step":1},"migrate":{"arity":-6,"flags":["write","movablekeys"],"keyStart":3,"keyStop":3,"step":1},"module":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"monitor":{"arity":1,"flags":["admin","noscript","loading","stale"],"keyStart":0,"keyStop":0,"step":0},"move":{"arity":3,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"mset":{"arity":-3,"flags":["write","denyoom"],"keyStart":1,"keyStop":-1,"step":2},"msetex":{"arity":-4,"flags":["write","denyoom","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"msetnx":{"arity":-3,"flags":["write","denyoom"],"keyStart":1,"keyStop":-1,"step":2},"multi":{"arity":1,"flags":["noscript","loading","stale","fast","allow_busy"],"keyStart":0,"keyStop":0,"step":0},"object":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"persist":{"arity":2,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"pexpire":{"arity":-3,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"pexpireat":{"arity":-3,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"pexpiretime":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"pfadd":{"arity":-2,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"pfcount":{"arity":-2,"flags":["readonly"],"keyStart":1,"keyStop":-1,"step":1},"pfdebug":{"arity":3,"flags":["write","denyoom","admin"],"keyStart":2,"keyStop":2,"step":1},"pfmerge":{"arity":-2,"flags":["write","denyoom"],"keyStart":1,"keyStop":-1,"step":1},"pfselftest":{"arity":1,"flags":["admin"],"keyStart":0,"keyStop":0,"step":0},"ping":{"arity":-1,"flags":["fast"],"keyStart":0,"keyStop":0,"step":0},"psetex":{"arity":4,"flags":["write","denyoom"],"keyStart":1,"keyStop":1,"step":1},"psubscribe":{"arity":-2,"flags":["pubsub","noscript","loading","stale"],"keyStart":0,"keyStop":0,"step":0},"psync":{"arity":-3,"flags":["admin","noscript","no_async_loading","no_multi"],"keyStart":0,"keyStop":0,"step":0},"pttl":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"publish":{"arity":3,"flags":["pubsub","loading","stale","fast"],"keyStart":0,"keyStop":0,"step":0},"pubsub":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"punsubscribe":{"arity":-1,"flags":["pubsub","noscript","loading","stale"],"keyStart":0,"keyStop":0,"step":0},"quit":{"arity":-1,"flags":["noscript","loading","stale","fast","no_auth","allow_busy"],"keyStart":0,"keyStop":0,"step":0},"randomkey":{"arity":1,"flags":["readonly"],"keyStart":0,"keyStop":0,"step":0},"readonly":{"arity":1,"flags":["loading","stale","fast"],"keyStart":0,"keyStop":0,"step":0},"readwrite":{"arity":1,"flags":["loading","stale","fast"],"keyStart":0,"keyStop":0,"step":0},"rename":{"arity":3,"flags":["write"],"keyStart":1,"keyStop":2,"step":1},"renamenx":{"arity":3,"flags":["write","fast"],"keyStart":1,"keyStop":2,"step":1},"replconf":{"arity":-1,"flags":["admin","noscript","loading","stale","allow_busy"],"keyStart":0,"keyStop":0,"step":0},"replicaof":{"arity":3,"flags":["admin","noscript","stale","no_async_loading"],"keyStart":0,"keyStop":0,"step":0},"reset":{"arity":1,"flags":["noscript","loading","stale","fast","no_auth","allow_busy"],"keyStart":0,"keyStop":0,"step":0},"restore":{"arity":-4,"flags":["write","denyoom"],"keyStart":1,"keyStop":1,"step":1},"restore-asking":{"arity":-4,"flags":["write","denyoom","asking"],"keyStart":1,"keyStop":1,"step":1},"role":{"arity":1,"flags":["noscript","loading","stale","fast"],"keyStart":0,"keyStop":0,"step":0},"rpop":{"arity":-2,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"rpoplpush":{"arity":3,"flags":["write","denyoom"],"keyStart":1,"keyStop":2,"step":1},"rpush":{"arity":-3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"rpushx":{"arity":-3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"sadd":{"arity":-3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"save":{"arity":1,"flags":["admin","noscript","no_async_loading","no_multi"],"keyStart":0,"keyStop":0,"step":0},"scan":{"arity":-2,"flags":["readonly"],"keyStart":0,"keyStop":0,"step":0},"scard":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"script":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"sdiff":{"arity":-2,"flags":["readonly"],"keyStart":1,"keyStop":-1,"step":1},"sdiffstore":{"arity":-3,"flags":["write","denyoom"],"keyStart":1,"keyStop":-1,"step":1},"select":{"arity":2,"flags":["loading","stale","fast"],"keyStart":0,"keyStop":0,"step":0},"set":{"arity":-3,"flags":["write","denyoom"],"keyStart":1,"keyStop":1,"step":1},"setbit":{"arity":4,"flags":["write","denyoom"],"keyStart":1,"keyStop":1,"step":1},"setex":{"arity":4,"flags":["write","denyoom"],"keyStart":1,"keyStop":1,"step":1},"setnx":{"arity":3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"setrange":{"arity":4,"flags":["write","denyoom"],"keyStart":1,"keyStop":1,"step":1},"shutdown":{"arity":-1,"flags":["admin","noscript","loading","stale","no_multi","allow_busy"],"keyStart":0,"keyStop":0,"step":0},"sinter":{"arity":-2,"flags":["readonly"],"keyStart":1,"keyStop":-1,"step":1},"sintercard":{"arity":-3,"flags":["readonly","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"sinterstore":{"arity":-3,"flags":["write","denyoom"],"keyStart":1,"keyStop":-1,"step":1},"sismember":{"arity":3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"slaveof":{"arity":3,"flags":["admin","noscript","stale","no_async_loading"],"keyStart":0,"keyStop":0,"step":0},"slowlog":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"smembers":{"arity":2,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"smismember":{"arity":-3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"smove":{"arity":4,"flags":["write","fast"],"keyStart":1,"keyStop":2,"step":1},"sort":{"arity":-2,"flags":["write","denyoom","movablekeys"],"keyStart":1,"keyStop":1,"step":1},"sort_ro":{"arity":-2,"flags":["readonly","movablekeys"],"keyStart":1,"keyStop":1,"step":1},"spop":{"arity":-2,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"spublish":{"arity":3,"flags":["pubsub","loading","stale","fast"],"keyStart":1,"keyStop":1,"step":1},"srandmember":{"arity":-2,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"srem":{"arity":-3,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"sscan":{"arity":-3,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"ssubscribe":{"arity":-2,"flags":["pubsub","noscript","loading","stale"],"keyStart":1,"keyStop":-1,"step":1},"strlen":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"subscribe":{"arity":-2,"flags":["pubsub","noscript","loading","stale"],"keyStart":0,"keyStop":0,"step":0},"substr":{"arity":4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"sunion":{"arity":-2,"flags":["readonly"],"keyStart":1,"keyStop":-1,"step":1},"sunionstore":{"arity":-3,"flags":["write","denyoom"],"keyStart":1,"keyStop":-1,"step":1},"sunsubscribe":{"arity":-1,"flags":["pubsub","noscript","loading","stale"],"keyStart":1,"keyStop":-1,"step":1},"swapdb":{"arity":3,"flags":["write","fast"],"keyStart":0,"keyStop":0,"step":0},"sync":{"arity":1,"flags":["admin","noscript","no_async_loading","no_multi"],"keyStart":0,"keyStop":0,"step":0},"time":{"arity":1,"flags":["loading","stale","fast"],"keyStart":0,"keyStop":0,"step":0},"touch":{"arity":-2,"flags":["readonly","fast"],"keyStart":1,"keyStop":-1,"step":1},"ttl":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"type":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"unlink":{"arity":-2,"flags":["write","fast"],"keyStart":1,"keyStop":-1,"step":1},"unsubscribe":{"arity":-1,"flags":["pubsub","noscript","loading","stale"],"keyStart":0,"keyStop":0,"step":0},"unwatch":{"arity":1,"flags":["noscript","loading","stale","fast","allow_busy"],"keyStart":0,"keyStop":0,"step":0},"wait":{"arity":3,"flags":["noscript"],"keyStart":0,"keyStop":0,"step":0},"watch":{"arity":-2,"flags":["noscript","loading","stale","fast","allow_busy"],"keyStart":1,"keyStop":-1,"step":1},"xack":{"arity":-4,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"xadd":{"arity":-5,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"xautoclaim":{"arity":-6,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"xclaim":{"arity":-6,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"xdel":{"arity":-3,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"xdelex":{"arity":-5,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"xgroup":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"xinfo":{"arity":-2,"flags":[],"keyStart":0,"keyStop":0,"step":0},"xlen":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"xnack":{"arity":-7,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"xpending":{"arity":-3,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"xrange":{"arity":-4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"xread":{"arity":-4,"flags":["readonly","blocking","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"xreadgroup":{"arity":-7,"flags":["write","blocking","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"xrevrange":{"arity":-4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"xsetid":{"arity":-3,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"xtrim":{"arity":-4,"flags":["write"],"keyStart":1,"keyStop":1,"step":1},"zadd":{"arity":-4,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"zcard":{"arity":2,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"zcount":{"arity":4,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"zdiff":{"arity":-3,"flags":["readonly","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"zdiffstore":{"arity":-4,"flags":["write","denyoom","movablekeys"],"keyStart":1,"keyStop":1,"step":1},"zincrby":{"arity":4,"flags":["write","denyoom","fast"],"keyStart":1,"keyStop":1,"step":1},"zinter":{"arity":-3,"flags":["readonly","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"zintercard":{"arity":-3,"flags":["readonly","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"zinterstore":{"arity":-4,"flags":["write","denyoom","movablekeys"],"keyStart":1,"keyStop":1,"step":1},"zlexcount":{"arity":4,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"zmpop":{"arity":-4,"flags":["write","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"zmscore":{"arity":-3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"zpopmax":{"arity":-2,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"zpopmin":{"arity":-2,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"zrandmember":{"arity":-2,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"zrange":{"arity":-4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"zrangebylex":{"arity":-4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"zrangebyscore":{"arity":-4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"zrangestore":{"arity":-5,"flags":["write","denyoom"],"keyStart":1,"keyStop":2,"step":1},"zrank":{"arity":3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"zrem":{"arity":-3,"flags":["write","fast"],"keyStart":1,"keyStop":1,"step":1},"zremrangebylex":{"arity":4,"flags":["write"],"keyStart":1,"keyStop":1,"step":1},"zremrangebyrank":{"arity":4,"flags":["write"],"keyStart":1,"keyStop":1,"step":1},"zremrangebyscore":{"arity":4,"flags":["write"],"keyStart":1,"keyStop":1,"step":1},"zrevrange":{"arity":-4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"zrevrangebylex":{"arity":-4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"zrevrangebyscore":{"arity":-4,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"zrevrank":{"arity":3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"zscan":{"arity":-3,"flags":["readonly"],"keyStart":1,"keyStop":1,"step":1},"zscore":{"arity":3,"flags":["readonly","fast"],"keyStart":1,"keyStop":1,"step":1},"zunion":{"arity":-3,"flags":["readonly","movablekeys"],"keyStart":0,"keyStop":0,"step":0},"zunionstore":{"arity":-4,"flags":["write","denyoom","movablekeys"],"keyStart":1,"keyStop":1,"step":1}}')},973964,(a,b,c)=>{"use strict";var d=a.e&&a.e.__importDefault||function(a){return a&&a.__esModule?a:{default:a}};Object.defineProperty(c,"__esModule",{value:!0}),c.getKeyIndexes=c.hasFlag=c.exists=c.list=void 0;let e=d(a.r(409221));c.list=Object.keys(e.default);let f={};function g(a){"string"!=typeof a&&(a=String(a));let b=a.indexOf("->");return -1===b?a.length:b}c.list.forEach(a=>{f[a]=e.default[a].flags.reduce(function(a,b){return a[b]=!0,a},{})}),c.exists=function(a,b){return a=(null==b?void 0:b.caseInsensitive)?String(a).toLowerCase():a,!!e.default[a]},c.hasFlag=function(a,b,c){if(!f[a=(null==c?void 0:c.nameCaseInsensitive)?String(a).toLowerCase():a])throw Error("Unknown command "+a);return!!f[a][b]},c.getKeyIndexes=function(a,b,c){a=(null==c?void 0:c.nameCaseInsensitive)?String(a).toLowerCase():a;let d=e.default[a];if(!d)throw Error("Unknown command "+a);if(!Array.isArray(b))throw Error("Expect args to be an array");let f=[],h=!!(c&&c.parseExternalKey),i=(a,b)=>{let c=[],d=Number(a[b]);for(let a=0;a<d;a++)c.push(a+b+1);return c},j=(a,b,c)=>{for(let d=b;d<a.length-1;d+=1)if(String(a[d]).toLowerCase()===c.toLowerCase())return d+1;return null};switch(a){case"zunionstore":case"zinterstore":case"zdiffstore":f.push(0,...i(b,1));break;case"eval":case"evalsha":case"eval_ro":case"evalsha_ro":case"fcall":case"fcall_ro":case"blmpop":case"bzmpop":f.push(...i(b,1));break;case"sintercard":case"lmpop":case"zunion":case"zinter":case"zmpop":case"zintercard":case"zdiff":f.push(...i(b,0));break;case"msetex":{let a=Number(b[0]);for(let b=0;b<a;b++)f.push(1+2*b);break}case"georadius":{f.push(0);let a=j(b,5,"STORE");a&&f.push(a);let c=j(b,5,"STOREDIST");c&&f.push(c);break}case"georadiusbymember":{f.push(0);let a=j(b,4,"STORE");a&&f.push(a);let c=j(b,4,"STOREDIST");c&&f.push(c);break}case"sort":case"sort_ro":f.push(0);for(let a=1;a<b.length-1;a++){let c=b[a];if("string"!=typeof c)continue;let d=c.toUpperCase();"GET"===d?(a+=1,"#"!==(c=b[a])&&(h?f.push([a,g(c)]):f.push(a))):"BY"===d?(a+=1,h?f.push([a,g(b[a])]):f.push(a)):"STORE"===d&&(a+=1,f.push(a))}break;case"migrate":if(""===b[2])for(let a=5;a<b.length-1;a++){let c=b[a];if("string"==typeof c&&"KEYS"===c.toUpperCase()){for(let c=a+1;c<b.length;c++)f.push(c);break}}else f.push(2);break;case"xreadgroup":case"xread":for(let c=3*("xread"!==a);c<b.length-1;c++)if("STREAMS"===String(b[c]).toUpperCase()){for(let a=c+1;a<=c+(b.length-1-c)/2;a++)f.push(a);break}break;default:if(d.step>0){let a=d.keyStart-1,c=d.keyStop>0?d.keyStop:b.length+d.keyStop+1;for(let b=a;b<c;b+=d.step)f.push(b)}}return f}},851419,(a,b,c)=>{"use strict";let d;function e(a,b){try{let a=d;return d=null,a.apply(this,arguments)}catch(a){return c.errorObj.e=a,c.errorObj}}Object.defineProperty(c,"__esModule",{value:!0}),c.tryCatch=c.errorObj=void 0,c.errorObj={e:{}},c.tryCatch=function(a){return d=a,e}},662839,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(851419);function e(a){setTimeout(function(){throw a},0)}c.default=function(a,b,c){return"function"==typeof b&&a.then(a=>{let f;(f=void 0!==c&&Object(c).spread&&Array.isArray(a)?d.tryCatch(b).apply(void 0,[null].concat(a)):void 0===a?d.tryCatch(b)(null):d.tryCatch(b)(null,a))===d.errorObj&&e(f.e)},a=>{if(!a){let b=Error(a+"");Object.assign(b,{cause:a}),a=b}let c=d.tryCatch(b)(a);c===d.errorObj&&e(c.e)}),a}},449719,(a,b,c)=>{b.exports=a.x("assert",()=>require("assert"))},859028,(a,b,c)=>{"use strict";let d=a.r(449719);class e extends Error{get name(){return this.constructor.name}}class f extends e{get name(){return this.constructor.name}}b.exports={RedisError:e,ParserError:class extends e{constructor(a,b,c){d(b),d.strictEqual(typeof c,"number");const e=Error.stackTraceLimit;Error.stackTraceLimit=2,super(a),Error.stackTraceLimit=e,this.offset=c,this.buffer=b}get name(){return this.constructor.name}},ReplyError:class extends e{constructor(a){const b=Error.stackTraceLimit;Error.stackTraceLimit=2,super(a),Error.stackTraceLimit=b}get name(){return this.constructor.name}},AbortError:f,InterruptError:class extends f{get name(){return this.constructor.name}}}},212305,(a,b,c)=>{"use strict";let d=a.r(449719),e=a.r(224361);function f(a){Object.defineProperty(this,"message",{value:a||"",configurable:!0,writable:!0}),Error.captureStackTrace(this,this.constructor)}function g(a,b,c){d(b),d.strictEqual(typeof c,"number"),Object.defineProperty(this,"message",{value:a||"",configurable:!0,writable:!0});let e=Error.stackTraceLimit;Error.stackTraceLimit=2,Error.captureStackTrace(this,this.constructor),Error.stackTraceLimit=e,this.offset=c,this.buffer=b}function h(a){Object.defineProperty(this,"message",{value:a||"",configurable:!0,writable:!0});let b=Error.stackTraceLimit;Error.stackTraceLimit=2,Error.captureStackTrace(this,this.constructor),Error.stackTraceLimit=b}function i(a){Object.defineProperty(this,"message",{value:a||"",configurable:!0,writable:!0}),Error.captureStackTrace(this,this.constructor)}function j(a){Object.defineProperty(this,"message",{value:a||"",configurable:!0,writable:!0}),Error.captureStackTrace(this,this.constructor)}e.inherits(f,Error),Object.defineProperty(f.prototype,"name",{value:"RedisError",configurable:!0,writable:!0}),e.inherits(g,f),Object.defineProperty(g.prototype,"name",{value:"ParserError",configurable:!0,writable:!0}),e.inherits(h,f),Object.defineProperty(h.prototype,"name",{value:"ReplyError",configurable:!0,writable:!0}),e.inherits(i,f),Object.defineProperty(i.prototype,"name",{value:"AbortError",configurable:!0,writable:!0}),e.inherits(j,i),Object.defineProperty(j.prototype,"name",{value:"InterruptError",configurable:!0,writable:!0}),b.exports={RedisError:f,ParserError:g,ReplyError:h,AbortError:i,InterruptError:j}},223950,(a,b,c)=>{"use strict";b.exports=55>process.version.charCodeAt(1)&&46===process.version.charCodeAt(2)?a.r(212305):a.r(859028)},294774,(a,b,c)=>{var d=[0,4129,8258,12387,16516,20645,24774,28903,33032,37161,41290,45419,49548,53677,57806,61935,4657,528,12915,8786,21173,17044,29431,25302,37689,33560,45947,41818,54205,50076,62463,58334,9314,13379,1056,5121,25830,29895,17572,21637,42346,46411,34088,38153,58862,62927,50604,54669,13907,9842,5649,1584,30423,26358,22165,18100,46939,42874,38681,34616,63455,59390,55197,51132,18628,22757,26758,30887,2112,6241,10242,14371,51660,55789,59790,63919,35144,39273,43274,47403,23285,19156,31415,27286,6769,2640,14899,10770,56317,52188,64447,60318,39801,35672,47931,43802,27814,31879,19684,23749,11298,15363,3168,7233,60846,64911,52716,56781,44330,48395,36200,40265,32407,28342,24277,20212,15891,11826,7761,3696,65439,61374,57309,53244,48923,44858,40793,36728,37256,33193,45514,41451,53516,49453,61774,57711,4224,161,12482,8419,20484,16421,28742,24679,33721,37784,41979,46042,49981,54044,58239,62302,689,4752,8947,13010,16949,21012,25207,29270,46570,42443,38312,34185,62830,58703,54572,50445,13538,9411,5280,1153,29798,25671,21540,17413,42971,47098,34713,38840,59231,63358,50973,55100,9939,14066,1681,5808,26199,30326,17941,22068,55628,51565,63758,59695,39368,35305,47498,43435,22596,18533,30726,26663,6336,2273,14466,10403,52093,56156,60223,64286,35833,39896,43963,48026,19061,23124,27191,31254,2801,6864,10931,14994,64814,60687,56684,52557,48554,44427,40424,36297,31782,27655,23652,19525,15522,11395,7392,3265,61215,65342,53085,57212,44955,49082,36825,40952,28183,32310,20053,24180,11923,16050,3793,7920],e=function(a){for(var b,c=0,d=0,e=[],f=a.length;c<f;c++)(b=a.charCodeAt(c))<128?e[d++]=b:(b<2048?e[d++]=b>>6|192:((64512&b)==55296&&c+1<a.length&&(64512&a.charCodeAt(c+1))==56320?(b=65536+((1023&b)<<10)+(1023&a.charCodeAt(++c)),e[d++]=b>>18|240,e[d++]=b>>12&63|128):e[d++]=b>>12|224,e[d++]=b>>6&63|128),e[d++]=63&b|128);return e},f=b.exports=function(a){for(var b,c=0,f=-1,g=0,h=0,i="string"==typeof a?e(a):a,j=i.length;c<j;){if(b=i[c++],-1===f)123===b&&(f=c);else if(125!==b)h=d[(b^h>>8)&255]^h<<8;else if(c-1!==f)return 16383&h;g=d[(b^g>>8)&255]^g<<8}return 16383&g};b.exports.generateMulti=function(a){for(var b=1,c=a.length,d=f(a[0]);b<c;)if(f(a[b++])!==d)return -1;return d}},975390,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.parseBlockOption=c.parseSecondsArgument=void 0;let d=a=>{if("number"==typeof a)return a;if(Buffer.isBuffer(a))return d(a.toString());if("string"==typeof a){let b=Number(a);return Number.isFinite(b)?b:void 0}},e=a=>"string"==typeof a?a:Buffer.isBuffer(a)?a.toString():void 0;c.parseSecondsArgument=a=>{let b=d(a);if(void 0!==b)return b<=0?0:1e3*b},c.parseBlockOption=a=>{for(let b=0;b<a.length;b++){let c=e(a[b]);if(c&&"block"===c.toLowerCase()){let c=d(a[b+1]);if(void 0===c)return;if(c<=0)return 0;return c}}return null}},646656,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(973964),e=a.r(294774),f=a.r(662839),g=a.r(637776),h=a.r(975390);class i{constructor(a,b=[],c={},d){if(this.name=a,this.inTransaction=!1,this.isTraced=!1,this.isResolved=!1,this.transformed=!1,this.replyEncoding=c.replyEncoding,this.errorStack=c.errorStack,this.args=b.flat(),this.callback=d,this.initPromise(),c.keyPrefix){const a=c.keyPrefix instanceof Buffer;let b=a?c.keyPrefix:null;this._iterateKeys(d=>d instanceof Buffer?(null===b&&(b=Buffer.from(c.keyPrefix)),Buffer.concat([b,d])):a?Buffer.concat([c.keyPrefix,Buffer.from(String(d))]):c.keyPrefix+d)}c.readOnly&&(this.isReadOnly=!0)}static checkFlag(a,b){return b=b.toLowerCase(),!!this.getFlagMap()[a][b]}static setArgumentTransformer(a,b){this._transformer.argument[a]=b}static setReplyTransformer(a,b){this._transformer.reply[a]=b}static getFlagMap(){return this.flagMap||(this.flagMap=Object.keys(i.FLAGS).reduce((a,b)=>(a[b]={},i.FLAGS[b].forEach(c=>{a[b][c]=!0}),a),{})),this.flagMap}getSlot(){if(void 0===this.slot){let a=this.getKeys()[0];this.slot=null==a?null:e(a)}return this.slot}getKeys(){return this._iterateKeys()}toWritable(a){let b,c="*"+(this.args.length+1)+"\r\n$"+Buffer.byteLength(this.name)+"\r\n"+this.name+"\r\n";if(this.bufferMode){let a=new l;a.push(c);for(let b=0;b<this.args.length;++b){let c=this.args[b];c instanceof Buffer?0===c.length?a.push("$0\r\n\r\n"):(a.push("$"+c.length+"\r\n"),a.push(c),a.push("\r\n")):a.push("$"+Buffer.byteLength(c)+"\r\n"+c+"\r\n")}b=a.toBuffer()}else{b=c;for(let a=0;a<this.args.length;++a){let c=this.args[a];b+="$"+Buffer.byteLength(c)+"\r\n"+c+"\r\n"}}return b}stringifyArguments(){for(let a=0;a<this.args.length;++a){let b=this.args[a];"string"==typeof b||(b instanceof Buffer?this.bufferMode=!0:this.args[a]=(0,g.toArg)(b))}}transformReply(a){this.replyEncoding&&(a=(0,g.convertBufferToString)(a,this.replyEncoding));let b=i._transformer.reply[this.name];return b&&(a=b(a)),a}setTimeout(a){this._commandTimeoutTimer||(this._commandTimeoutTimer=setTimeout(()=>{this.isResolved||this.reject(Error("Command timed out"))},a))}setBlockingTimeout(a){if(a<=0)return;this._blockingTimeoutTimer&&(clearTimeout(this._blockingTimeoutTimer),this._blockingTimeoutTimer=void 0);let b=Date.now();void 0===this._blockingDeadline&&(this._blockingDeadline=b+a);let c=this._blockingDeadline-b;c<=0?this.resolve(null):this._blockingTimeoutTimer=setTimeout(()=>{if(this.isResolved){this._blockingTimeoutTimer=void 0;return}this._blockingTimeoutTimer=void 0,this.resolve(null)},c)}extractBlockingTimeout(){let a=this.args;if(!a||0===a.length)return;let b=this.name.toLowerCase();return i.checkFlag("LAST_ARG_TIMEOUT_COMMANDS",b)?(0,h.parseSecondsArgument)(a[a.length-1]):i.checkFlag("FIRST_ARG_TIMEOUT_COMMANDS",b)?(0,h.parseSecondsArgument)(a[0]):i.checkFlag("BLOCK_OPTION_COMMANDS",b)?(0,h.parseBlockOption)(a):void 0}_clearTimers(){let a=this._commandTimeoutTimer;a&&(clearTimeout(a),delete this._commandTimeoutTimer);let b=this._blockingTimeoutTimer;b&&(clearTimeout(b),delete this._blockingTimeoutTimer)}initPromise(){let a=new Promise((a,b)=>{if(!this.transformed){this.transformed=!0;let a=i._transformer.argument[this.name];a&&(this.args=a(this.args)),this.stringifyArguments()}this.resolve=this._convertValue(a),this.reject=a=>{this._clearTimers(),this.errorStack?b((0,g.optimizeErrorStack)(a,this.errorStack.stack,"/ROOT/node_modules/.pnpm/ioredis@5.11.1/node_modules/ioredis/built")):b(a)}});this.promise=(0,f.default)(a,this.callback)}_iterateKeys(a=a=>a){if(void 0===this.keys&&(this.keys=[],(0,d.exists)(this.name,{caseInsensitive:!0})))for(let b of(0,d.getKeyIndexes)(this.name,this.args,{nameCaseInsensitive:!0}))this.args[b]=a(this.args[b]),this.keys.push(this.args[b]);return this.keys}_convertValue(a){return b=>{try{this._clearTimers(),a(this.transformReply(b)),this.isResolved=!0}catch(a){this.reject(a)}return this.promise}}}c.default=i,i.FLAGS={VALID_IN_SUBSCRIBER_MODE:["subscribe","psubscribe","unsubscribe","punsubscribe","ssubscribe","sunsubscribe","ping","quit"],VALID_IN_MONITOR_MODE:["monitor","auth"],ENTER_SUBSCRIBER_MODE:["subscribe","psubscribe","ssubscribe"],EXIT_SUBSCRIBER_MODE:["unsubscribe","punsubscribe","sunsubscribe"],WILL_DISCONNECT:["quit"],HANDSHAKE_COMMANDS:["auth","select","client","readonly","info"],IGNORE_RECONNECT_ON_ERROR:["client"],BLOCKING_COMMANDS:["blpop","brpop","brpoplpush","blmove","bzpopmin","bzpopmax","bzmpop","blmpop","xread","xreadgroup"],LAST_ARG_TIMEOUT_COMMANDS:["blpop","brpop","brpoplpush","blmove","bzpopmin","bzpopmax"],FIRST_ARG_TIMEOUT_COMMANDS:["bzmpop","blmpop"],BLOCK_OPTION_COMMANDS:["xread","xreadgroup"]},i._transformer={argument:{},reply:{}};let j=function(a){if(1===a.length){if(a[0]instanceof Map)return(0,g.convertMapToArray)(a[0]);if("object"==typeof a[0]&&null!==a[0])return(0,g.convertObjectToArray)(a[0])}return a},k=function(a){if(2===a.length){if(a[1]instanceof Map)return[a[0]].concat((0,g.convertMapToArray)(a[1]));if("object"==typeof a[1]&&null!==a[1])return[a[0]].concat((0,g.convertObjectToArray)(a[1]))}return a};i.setArgumentTransformer("mset",j),i.setArgumentTransformer("msetnx",j),i.setArgumentTransformer("hset",k),i.setArgumentTransformer("hmset",k),i.setReplyTransformer("hgetall",function(a){if(Array.isArray(a)){let b={};for(let c=0;c<a.length;c+=2){let d=a[c],e=a[c+1];d in b?Object.defineProperty(b,d,{value:e,configurable:!0,enumerable:!0,writable:!0}):b[d]=e}return b}return a});class l{constructor(){this.length=0,this.items=[]}push(a){this.length+=Buffer.byteLength(a),this.items.push(a)}toBuffer(){let a=Buffer.allocUnsafe(this.length),b=0;for(let c of this.items){let d=Buffer.byteLength(c);Buffer.isBuffer(c)?c.copy(a,b):a.write(c,b,d),b+=d}return a}}},754026,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(223950);class e extends d.RedisError{constructor(a,b){super(a),this.lastNodeError=b,Error.captureStackTrace(this,this.constructor)}get name(){return this.constructor.name}}c.default=e,e.defaultMessage="Failed to refresh slots cache."},130379,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(688947);class e extends d.Readable{constructor(a){super(a),this.opt=a,this._redisCursor="0",this._redisDrained=!1}_read(){if(this._redisDrained)return void this.push(null);let a=[this._redisCursor];this.opt.key&&a.unshift(this.opt.key),this.opt.match&&a.push("MATCH",this.opt.match),this.opt.type&&a.push("TYPE",this.opt.type),this.opt.count&&a.push("COUNT",String(this.opt.count)),this.opt.noValues&&a.push("NOVALUES"),this.opt.redis[this.opt.command](a,(a,b)=>{a?this.emit("error",a):(this._redisCursor=b[0]instanceof Buffer?b[0].toString():b[0],"0"===this._redisCursor&&(this._redisDrained=!0),this.push(b[1]))})}close(){this._redisDrained=!0}}c.default=e},500874,(a,b,c)=>{b.exports=a.x("buffer",()=>require("buffer"))},941061,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.executeWithAutoPipelining=c.getFirstValueInFlattenedArray=c.shouldUseAutoPipelining=c.notAllowedAutoPipelineCommands=c.kCallbacks=c.kExec=void 0;let d=a.r(461950),e=a.r(294774),f=a.r(662839),g=a.r(973964);function h(a){for(let b=0;b<a.length;b++){let c=a[b];if("string"==typeof c)return c;if(Array.isArray(c)||(0,d.isArguments)(c)){if(0===c.length)continue;return c[0]}let e=[c].flat();if(e.length>0)return e[0]}}c.kExec=Symbol("exec"),c.kCallbacks=Symbol("callbacks"),c.notAllowedAutoPipelineCommands=["auth","info","script","quit","cluster","pipeline","multi","subscribe","psubscribe","unsubscribe","unpsubscribe","select","client"],c.shouldUseAutoPipelining=function(a,b,d){return b&&a.options.enableAutoPipelining&&!a.isPipeline&&!c.notAllowedAutoPipelineCommands.includes(d)&&!a.options.autoPipeliningIgnoredCommands.includes(d)},c.getFirstValueInFlattenedArray=h,c.executeWithAutoPipelining=function a(b,i,j,k,l){if(b.isCluster&&!b.slots.length)return"wait"===b.status&&b.connect().catch(d.noop),(0,f.default)(new Promise(function(c,d){b.delayUntilReady(e=>{e?d(e):a(b,i,j,k,null).then(c,d)})}),l);let m=b.options.keyPrefix||"",n=b.isCluster?b.slots[e(`${m}${function(a,b){if((0,g.exists)(a,{caseInsensitive:!0})){let c=b.flat(),d=(0,g.getKeyIndexes)(a,c,{nameCaseInsensitive:!0});if(d.length)return c[d[0]]}return h(b)}(j,k)}`)].join(","):"main";if(b.isCluster&&"master"!==b.options.scaleReads&&(n+=(0,g.exists)(j)&&(0,g.hasFlag)(j,"readonly")?":read":":write"),!b._autoPipelines.has(n)){let a=b.pipeline();a[c.kExec]=!1,a[c.kCallbacks]=[],b._autoPipelines.set(n,a)}let o=b._autoPipelines.get(n);o[c.kExec]||(o[c.kExec]=!0,setImmediate(function a(b,d){if(b._runningAutoPipelines.has(d)||!b._autoPipelines.has(d))return;b._runningAutoPipelines.add(d);let e=b._autoPipelines.get(d);b._autoPipelines.delete(d);let f=e[c.kCallbacks];e[c.kCallbacks]=null,e.exec(function(c,e){if(b._runningAutoPipelines.delete(d),c)for(let a=0;a<f.length;a++)process.nextTick(f[a],c);else for(let a=0;a<f.length;a++)process.nextTick(f[a],...e[a]);b._autoPipelines.has(d)&&a(b,d)})},b,n));let p=new Promise(function(a,b){o[c.kCallbacks].push(function(c,d){c?b(c):a(d)}),"call"===i&&k.unshift(j),o[i](...k)});return(0,f.default)(p,l)}},678787,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(254799),e=a.r(646656),f=a.r(662839);c.default=class{constructor(a,b=null,c="",f=!1){this.lua=a,this.numberOfKeys=b,this.keyPrefix=c,this.readOnly=f,this.sha=(0,d.createHash)("sha1").update(a).digest("hex");const g=this.sha,h=new WeakSet;this.Command=class extends e.default{toWritable(b){let c=this.reject;return this.reject=a=>{-1!==a.message.indexOf("NOSCRIPT")&&h.delete(b),c.call(this,a)},h.has(b)?"eval"===this.name&&(this.name="evalsha",this.args[0]=g):(h.add(b),this.name="eval",this.args[0]=a),super.toWritable(b)}}}execute(a,b,c,d){"number"==typeof this.numberOfKeys&&b.unshift(this.numberOfKeys),this.keyPrefix&&(c.keyPrefix=this.keyPrefix),this.readOnly&&(c.readOnly=!0);let e=new this.Command("evalsha",[this.sha,...b],c);return e.promise=e.promise.catch(d=>{if(-1===d.message.indexOf("NOSCRIPT"))throw d;let e=new this.Command("evalsha",[this.sha,...b],c);return(a.isPipeline?a.redis:a).sendCommand(e)}),(0,f.default)(e.promise,d),a.sendCommand(e)}}},399568,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(973964),e=a.r(941061),f=a.r(646656),g=a.r(678787);class h{constructor(){this.options={},this.scriptsSet={},this.addedBuiltinSet=new Set}getBuiltinCommands(){return i.slice(0)}createBuiltinCommand(a){return{string:j(null,a,"utf8"),buffer:j(null,a,null)}}addBuiltinCommand(a){this.addedBuiltinSet.add(a),this[a]=j(a,a,"utf8"),this[a+"Buffer"]=j(a+"Buffer",a,null)}defineCommand(a,b){let c=new g.default(b.lua,b.numberOfKeys,this.options.keyPrefix,b.readOnly);this.scriptsSet[a]=c,this[a]=k(a,a,c,"utf8"),this[a+"Buffer"]=k(a+"Buffer",a,c,null)}sendCommand(a,b,c){throw Error('"sendCommand" is not implemented')}}let i=d.list.filter(a=>"monitor"!==a);function j(a,b,c){return void 0===c&&(c=b,b=null),function(...d){let g=b||d.shift(),h=d[d.length-1];"function"==typeof h?d.pop():h=void 0;let i={errorStack:this.options.showFriendlyErrorStack?Error():void 0,keyPrefix:this.options.keyPrefix,replyEncoding:c};return(0,e.shouldUseAutoPipelining)(this,a,g)?(0,e.executeWithAutoPipelining)(this,a,g,d,h):this.sendCommand(new f.default(g,d,i,h))}}function k(a,b,c,d){return function(...f){let g="function"==typeof f[f.length-1]?f.pop():void 0,h={replyEncoding:d};return(this.options.showFriendlyErrorStack&&(h.errorStack=Error()),(0,e.shouldUseAutoPipelining)(this,a,b))?(0,e.executeWithAutoPipelining)(this,a,b,f,g):c.execute(this,f,h,g)}}i.push("sentinel"),i.forEach(function(a){h.prototype[a]=j(a,a,"utf8"),h.prototype[a+"Buffer"]=j(a+"Buffer",a,null)}),h.prototype.call=j("call","utf8"),h.prototype.callBuffer=j("callBuffer",null),h.prototype.send_command=h.prototype.call,c.default=h},441696,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(294774),e=a.r(973964),f=a.r(662839),g=a.r(224361),h=a.r(646656),i=a.r(500874),j=a.r(637776),k=a.r(399568);class l extends k.default{constructor(a){super(),this.redis=a,this.isPipeline=!0,this.replyPending=0,this._queue=[],this._result=[],this._transactions=0,this._shaToScript={},this.isCluster="Cluster"===this.redis.constructor.name||this.redis.isCluster,this.options=a.options,Object.keys(a.scriptsSet).forEach(b=>{let c=a.scriptsSet[b];this._shaToScript[c.sha]=c,this[b]=a[b],this[b+"Buffer"]=a[b+"Buffer"]}),a.addedBuiltinSet.forEach(b=>{this[b]=a[b],this[b+"Buffer"]=a[b+"Buffer"]}),this.promise=new Promise((a,b)=>{this.resolve=a,this.reject=b});const b=this;Object.defineProperty(this,"length",{get:function(){return b._queue.length}})}fillResult(a,b){if("exec"===this._queue[b].name&&Array.isArray(a[1])){let c=a[1].length;for(let d=0;d<c;d++){if(a[1][d]instanceof Error)continue;let e=this._queue[b-(c-d)];try{a[1][d]=e.transformReply(a[1][d])}catch(b){a[1][d]=b}}}if(this._result[b]=a,--this.replyPending)return;if(this.isCluster){let a,b=!0;for(let c=0;c<this._result.length;++c){let d=this._result[c][0],f=this._queue[c];if(d){if("exec"===f.name&&"EXECABORT Transaction discarded because of previous errors."===d.message)continue;if(a){if(a.name!==d.name||a.message!==d.message){b=!1;break}}else a={name:d.name,message:d.message}}else if(!f.inTransaction&&!((0,e.exists)(f.name,{caseInsensitive:!0})&&(0,e.hasFlag)(f.name,"readonly",{nameCaseInsensitive:!0}))){b=!1;break}}if(a&&b){let b=this,c=a.message.split(" "),d=this._queue,e=!1;this._queue=[];for(let a=0;a<d.length;++a){if("ASK"===c[0]&&!e&&"asking"!==d[a].name&&(!d[a-1]||"asking"!==d[a-1].name)){let a=new h.default("asking");a.ignore=!0,this.sendCommand(a)}d[a].initPromise(),this.sendCommand(d[a]),e=d[a].inTransaction}let f=!0;void 0===this.leftRedirections&&(this.leftRedirections={});let g=function(){b.exec()},i=this.redis;if(i.handleError(a,this.leftRedirections,{moved:function(a,d){b.preferKey=d,i.slots[c[1]]?i.slots[c[1]][0]!==d&&(i.slots[c[1]]=[d]):i.slots[c[1]]=[d],i._groupsBySlot[c[1]]=i._groupsIds[i.slots[c[1]].join(";")],i.refreshSlotsCache(),b.exec()},ask:function(a,c){b.preferKey=c,b.exec()},tryagain:g,clusterDown:g,connectionClosed:g,maxRedirections:()=>{f=!1},defaults:()=>{f=!1}}),f)return}}let c=0;for(let a=0;a<this._queue.length-c;++a)this._queue[a+c].ignore&&(c+=1),this._result[a]=this._result[a+c];this.resolve(this._result.slice(0,this._result.length-c))}sendCommand(a){this._transactions>0&&(a.inTransaction=!0);let b=this._queue.length;return a.pipelineIndex=b,a.promise.then(a=>{this.fillResult([null,a],b)}).catch(a=>{this.fillResult([a],b)}),this._queue.push(a),this}addBatch(a){let b,c,d;for(let e=0;e<a.length;++e)c=(b=a[e])[0],d=b.slice(1),this[c].apply(this,d);return this}}c.default=l;let m=l.prototype.multi;l.prototype.multi=function(){return this._transactions+=1,m.apply(this,arguments)};let n=l.prototype.execBuffer;l.prototype.execBuffer=(0,g.deprecate)(function(){return this._transactions>0&&(this._transactions-=1),n.apply(this,arguments)},"Pipeline#execBuffer: Use Pipeline#exec instead"),l.prototype.exec=function(a){let b;if(this.isCluster&&!this.redis.slots.length)return"wait"===this.redis.status&&this.redis.connect().catch(j.noop),a&&!this.nodeifiedPromise&&(this.nodeifiedPromise=!0,(0,f.default)(this.promise,a)),this.redis.delayUntilReady(b=>{b?this.reject(b):this.exec(a)}),this.promise;if(this._transactions>0)return this._transactions-=1,n.apply(this,arguments);if(this.nodeifiedPromise||(this.nodeifiedPromise=!0,(0,f.default)(this.promise,a)),this._queue.length||this.resolve([]),this.isCluster){let a=[];for(let b=0;b<this._queue.length;b++){let c=this._queue[b].getKeys();if(c.length&&a.push(c[0]),c.length&&0>d.generateMulti(c))return this.reject(Error("All the keys in a pipeline command should belong to the same slot")),this.promise}if(a.length){if((b=function(a,b){let c=d(b[0]),e=a._groupsBySlot[c];for(let c=1;c<b.length;c++)if(a._groupsBySlot[d(b[c])]!==e)return -1;return c}(this.redis,a))<0)return this.reject(Error("All keys in the pipeline should belong to the same slots allocation group")),this.promise}else b=16384*Math.random()|0}let c=this;return function(){let a,d,e=c.replyPending=c._queue.length;c.isCluster&&(a={slot:b,redis:c.redis.connectionPool.nodes.all[c.preferKey]});let f="",g={isPipeline:!0,destination:c.isCluster?a:{redis:c.redis},write(a){"string"!=typeof a?(d||(d=[]),f&&(d.push(Buffer.from(f,"utf8")),f=""),d.push(a)):(f.length+a.length>=i.constants.MAX_STRING_LENGTH&&(d||(d=[]),f&&(d.push(Buffer.from(f,"utf8")),f="")),f+=a),--e||(d?(f&&d.push(Buffer.from(f,"utf8")),g.destination.redis.stream.write(Buffer.concat(d))):g.destination.redis.stream.write(f),e=c._queue.length,f="",d=void 0)}};for(let b=0;b<c._queue.length;++b)c.redis.sendCommand(c._queue[b],g,a);c.promise}(),this.promise}},677652,(a,b,c)=>{b.exports=a.x("node:diagnostics_channel",()=>require("node:diagnostics_channel"))},600395,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.traceConnect=c.traceBatch=c.traceCommand=c.sanitizeArgs=void 0;let d=[{regex:/^ECHO/i,args:0},{regex:/^(LPUSH|MSET|PFA|PUBLISH|RPUSH|SADD|SET|SPUBLISH|XADD|ZADD)/i,args:1},{regex:/^(HSET|HMSET|LSET|LINSERT)/i,args:2},{regex:/^(ACL|BIT|B[LRZ]|CLIENT|CLUSTER|CONFIG|COMMAND|DECR|DEL|EVAL|EX|FUNCTION|GEO|GET|HINCR|HMGET|HSCAN|INCR|L[TRLM]|MEMORY|P[EFISTU]|RPOP|S[CDIMORSU]|XACK|X[CDGILPRT]|Z[CDILMPRS])/i,args:-1}];c.sanitizeArgs=function(a,b){let c=0;for(let b of d)if(b.regex.test(a)){c=b.args;break}if(-1===c)return b.map(a=>String(a));let e=[];for(let a=0;a<b.length;a++)a<c?e.push(String(b[a])):e.push("?");return e};let e=(()=>{try{return"getBuiltinModule"in process?process.getBuiltinModule("node:diagnostics_channel"):a.r(677652)}catch{return}})(),f=e&&"function"==typeof e.tracingChannel,g=f?e.tracingChannel("ioredis:command"):void 0,h=f?e.tracingChannel("ioredis:batch"):void 0,i=f?e.tracingChannel("ioredis:connect"):void 0;function j(a){return!!a&&!1!==a.hasSubscribers}let k=()=>{};c.traceCommand=function(a,b){if(!j(g))return a();let c=g.tracePromise(a,b());return c.catch(k),c},c.traceBatch=function(a,b){if(!j(h))return a();let c=h.tracePromise(a,b());return c.catch(k),c},c.traceConnect=function(a,b){return j(i)?i.tracePromise(a,b()):a()}},855283,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.addTransactionSupport=void 0;let d=a.r(637776),e=a.r(662839),f=a.r(441696),g=a.r(600395);c.addTransactionSupport=function(a){a.pipeline=function(a){let b=new f.default(this);return Array.isArray(a)&&b.addBatch(a),b};let{multi:b}=a;a.multi=function(a,c){if(void 0!==c||Array.isArray(a)||(c=a,a=null),c&&!1===c.pipeline)return b.call(this);let h=new f.default(this);h.multi(),Array.isArray(a)&&h.addBatch(a);let i=h.exec;h.exec=function(a){if(this.isCluster&&!this.redis.slots.length)return"wait"===this.redis.status&&this.redis.connect().catch(d.noop),(0,e.default)(new Promise((a,b)=>{this.redis.delayUntilReady(c=>{c?b(c):this.exec(h).then(a,b)})}),a);if(this._transactions>0&&i.call(h),this.nodeifiedPromise)return i.call(h);let b=Math.max(h.length-2,0),c=()=>i.call(h).then(function(a){let b=a[a.length-1];if(void 0===b)throw Error("Pipeline cannot be used to send any commands when the `exec()` has been called on it.");if(b[0]){b[0].previousErrors=[];for(let c=0;c<a.length-1;++c)a[c][0]&&b[0].previousErrors.push(a[c][0]);throw b[0]}return(0,d.wrapMultiResult)(b[1])}),f="_buildBatchContext"in this.redis?(0,g.traceBatch)(c,()=>this.redis._buildBatchContext(b)):c();return(0,e.default)(f,a)};let{execBuffer:j}=h;return h.execBuffer=function(a){return this._transactions>0&&j.call(h),h.exec(a)},h};let{exec:c}=a;a.exec=function(a){return(0,e.default)(c.call(this).then(function(a){return Array.isArray(a)&&(a=(0,d.wrapMultiResult)(a)),a}),a)}}},313999,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.default=function(a,b){Object.getOwnPropertyNames(b.prototype).forEach(c=>{Object.defineProperty(a.prototype,c,Object.getOwnPropertyDescriptor(b.prototype,c))})}},679594,(a,b,c)=>{b.exports=a.x("dns",()=>require("dns"))},556567,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.DEFAULT_CLUSTER_OPTIONS=void 0;let d=a.r(679594);c.DEFAULT_CLUSTER_OPTIONS={clusterRetryStrategy:a=>Math.min(100+2*a,2e3),clusterNodeRetryStrategy:null,enableOfflineQueue:!0,enableReadyCheck:!0,scaleReads:"master",maxRedirections:16,retryDelayOnMoved:0,retryDelayOnFailover:100,retryDelayOnClusterDown:100,retryDelayOnTryAgain:100,slotsRefreshTimeout:1e3,useSRVRecords:!1,resolveSrv:d.resolveSrv,dnsLookup:d.lookup,enableAutoPipelining:!1,autoPipeliningIgnoredCommands:[],shardedSubscribers:!1}},346833,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.getConnectionName=c.weightSrvRecords=c.groupSrvRecords=c.getUniqueHostnamesFromOptions=c.normalizeNodeOptions=c.nodeKeyToRedisOptions=c.getNodeKey=void 0;let d=a.r(637776),e=a.r(504446);c.getNodeKey=function(a){return a.port=a.port||6379,a.host=a.host||"127.0.0.1",a.host+":"+a.port},c.nodeKeyToRedisOptions=function(a){let b=a.lastIndexOf(":");if(-1===b)throw Error(`Invalid node key ${a}`);return{host:a.slice(0,b),port:Number(a.slice(b+1))}},c.normalizeNodeOptions=function(a){return a.map(a=>{let b={};if("object"==typeof a)Object.assign(b,a);else if("string"==typeof a)Object.assign(b,(0,d.parseURL)(a));else if("number"==typeof a)b.port=a;else throw Error("Invalid argument "+a);return"string"==typeof b.port&&(b.port=parseInt(b.port,10)),delete b.db,b.port||(b.port=6379),b.host||(b.host="127.0.0.1"),(0,d.resolveTLSProfile)(b)})},c.getUniqueHostnamesFromOptions=function(a){let b={};return a.forEach(a=>{b[a.host]=!0}),Object.keys(b).filter(a=>!(0,e.isIP)(a))},c.groupSrvRecords=function(a){let b={};for(let c of a)b.hasOwnProperty(c.priority)?(b[c.priority].totalWeight+=c.weight,b[c.priority].records.push(c)):b[c.priority]={totalWeight:c.weight,records:[c]};return b},c.weightSrvRecords=function(a){if(1===a.records.length)return a.totalWeight=0,a.records.shift();let b=Math.floor(Math.random()*(a.totalWeight+a.records.length)),c=0;for(let[d,e]of a.records.entries())if((c+=1+e.weight)>b)return a.totalWeight-=e.weight,a.records.splice(d,1),e},c.getConnectionName=function(a,b){let c=`ioredis-cluster(${a})`;return b?`${c}:${b}`:c}},431018,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(346833),e=a.r(637776),f=a.r(648956),g=(0,e.Debug)("cluster:subscriber");c.default=class{constructor(a,b,c=!1){this.connectionPool=a,this.emitter=b,this.isSharded=c,this.started=!1,this.subscriber=null,this.slotRange=[],this.onSubscriberEnd=()=>{this.started?(g("subscriber has disconnected, selecting a new one..."),this.selectSubscriber()):g("subscriber has disconnected, but ClusterSubscriber is not started, so not reconnecting.")},this.connectionPool.on("-node",(a,b)=>{this.started&&this.subscriber&&(0,d.getNodeKey)(this.subscriber.options)===b&&(g("subscriber has left, selecting a new one..."),this.selectSubscriber())}),this.connectionPool.on("+node",()=>{this.started&&!this.subscriber&&(g("a new node is discovered and there is no subscriber, selecting a new one..."),this.selectSubscriber())})}getInstance(){return this.subscriber}associateSlotRange(a){return this.isSharded&&(this.slotRange=a),this.slotRange}start(){this.started=!0,this.selectSubscriber(),g("started")}stop(){this.started=!1,this.subscriber&&(this.subscriber.disconnect(),this.subscriber=null)}isStarted(){return this.started}selectSubscriber(){let a=this.lastActiveSubscriber;a&&(a.off("end",this.onSubscriberEnd),a.disconnect()),this.subscriber&&(this.subscriber.off("end",this.onSubscriberEnd),this.subscriber.disconnect());let b=(0,e.sample)(this.connectionPool.getNodes());if(!b){g("selecting subscriber failed since there is no node discovered in the cluster yet"),this.subscriber=null;return}let{options:c}=b;g("selected a subscriber %s:%s",c.host,c.port);let h="subscriber";this.isSharded&&(h="ssubscriber"),this.subscriber=new f.default({port:c.port,host:c.host,username:c.username,password:c.password,enableReadyCheck:!0,connectionName:(0,d.getConnectionName)(h,c.connectionName),lazyConnect:!0,tls:c.tls,retryStrategy:null}),this.subscriber.on("error",e.noop),this.subscriber.on("moved",()=>{this.emitter.emit("forceRefresh")}),this.subscriber.once("end",this.onSubscriberEnd);let i={subscribe:[],psubscribe:[],ssubscribe:[]};if(a){let b=a.condition||a.prevCondition;b&&b.subscriber&&(i.subscribe=b.subscriber.channels("subscribe"),i.psubscribe=b.subscriber.channels("psubscribe"),i.ssubscribe=b.subscriber.channels("ssubscribe"))}if(i.subscribe.length||i.psubscribe.length||i.ssubscribe.length){let a=0;for(let b of["subscribe","psubscribe","ssubscribe"]){let c=i[b];if(0!=c.length)if(g("%s %d channels",b,c.length),"ssubscribe"===b)for(let d of c)a+=1,this.subscriber[b](d).then(()=>{--a||(this.lastActiveSubscriber=this.subscriber)}).catch(()=>{g("failed to ssubscribe to channel: %s",d)});else a+=1,this.subscriber[b](c).then(()=>{--a||(this.lastActiveSubscriber=this.subscriber)}).catch(()=>{g("failed to %s %d channels",b,c.length)})}}else this.lastActiveSubscriber=this.subscriber;for(let a of["message","messageBuffer"])this.subscriber.on(a,(b,c)=>{this.emitter.emit(a,b,c)});for(let a of["pmessage","pmessageBuffer"])this.subscriber.on(a,(b,c,d)=>{this.emitter.emit(a,b,c,d)});if(!0==this.isSharded)for(let a of["smessage","smessageBuffer"])this.subscriber.on(a,(b,c)=>{this.emitter.emit(a,b,c)})}}},752587,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(427699),e=a.r(637776),f=a.r(346833),g=a.r(648956),h=(0,e.Debug)("cluster:connectionPool");class i extends d.EventEmitter{constructor(a,b=null){super(),this.redisOptions=a,this.clusterNodeRetryStrategy=b,this.nodes={all:{},master:{},slave:{}},this.specifiedOptions={}}getNodes(a="all"){let b=this.nodes[a];return Object.keys(b).map(a=>b[a])}getInstanceByKey(a){return this.nodes.all[a]}getSampleInstance(a){let b=Object.keys(this.nodes[a]),c=(0,e.sample)(b);return this.nodes[a][c]}addMasterNode(a){let b=(0,f.getNodeKey)(a.options),c=this.createRedisFromOptions(a,a.options.readOnly);return!a.options.readOnly&&(this.nodes.all[b]=c,this.nodes.master[b]=c,!0)}createRedisFromOptions(a,b){return new g.default((0,e.defaults)({retryStrategy:"function"==typeof this.clusterNodeRetryStrategy?this.clusterNodeRetryStrategy:null,enableOfflineQueue:!0,readOnly:b},a,this.redisOptions,{lazyConnect:!0}))}findOrCreate(a,b=!1){let c,d=(0,f.getNodeKey)(a);return b=!!b,this.specifiedOptions[d]?Object.assign(a,this.specifiedOptions[d]):this.specifiedOptions[d]=a,this.nodes.all[d]?(c=this.nodes.all[d]).options.readOnly!==b&&(c.options.readOnly=b,h("Change role of %s to %s",d,b?"slave":"master"),c[b?"readonly":"readwrite"]().catch(e.noop),b?(delete this.nodes.master[d],this.nodes.slave[d]=c):(delete this.nodes.slave[d],this.nodes.master[d]=c)):(h("Connecting to %s as %s",d,b?"slave":"master"),c=this.createRedisFromOptions(a,b),this.nodes.all[d]=c,this.nodes[b?"slave":"master"][d]=c,c.once("end",()=>{this.removeNode(d),this.emit("-node",c,d),Object.keys(this.nodes.all).length||this.emit("drain")}),this.emit("+node",c,d),c.on("error",a=>{this.emit("nodeError",a,d)})),c}reset(a){h("Reset with %O",a);let b={};a.forEach(a=>{let c=(0,f.getNodeKey)(a);a.readOnly&&b[c]||(b[c]=a)}),Object.keys(this.nodes.all).forEach(a=>{b[a]||(h("Disconnect %s because the node does not hold any slot",a),this.nodes.all[a].disconnect(),this.removeNode(a))}),Object.keys(b).forEach(a=>{let c=b[a];this.findOrCreate(c,c.readOnly)})}removeNode(a){let{nodes:b}=this;b.all[a]&&(h("Remove %s from the pool",a),delete b.all[a]),delete b.master[a],delete b.slave[a]}}c.default=i},917769,(a,b,c)=>{"use strict";function d(a,b){var b=b||{};this._capacity=b.capacity,this._head=0,this._tail=0,Array.isArray(a)?this._fromArray(a):(this._capacityMask=3,this._list=[,,,,])}d.prototype.peekAt=function(a){var b=a;if(b===(0|b)){var c=this.size();if(!(b>=c)&&!(b<-c))return b<0&&(b+=c),b=this._head+b&this._capacityMask,this._list[b]}},d.prototype.get=function(a){return this.peekAt(a)},d.prototype.peek=function(){if(this._head!==this._tail)return this._list[this._head]},d.prototype.peekFront=function(){return this.peek()},d.prototype.peekBack=function(){return this.peekAt(-1)},Object.defineProperty(d.prototype,"length",{get:function(){return this.size()}}),d.prototype.size=function(){return this._head===this._tail?0:this._head<this._tail?this._tail-this._head:this._capacityMask+1-(this._head-this._tail)},d.prototype.unshift=function(a){if(0==arguments.length)return this.size();var b=this._list.length;return(this._head=this._head-1+b&this._capacityMask,this._list[this._head]=a,this._tail===this._head&&this._growArray(),this._capacity&&this.size()>this._capacity&&this.pop(),this._head<this._tail)?this._tail-this._head:this._capacityMask+1-(this._head-this._tail)},d.prototype.shift=function(){var a=this._head;if(a!==this._tail){var b=this._list[a];return this._list[a]=void 0,this._head=a+1&this._capacityMask,a<2&&this._tail>1e4&&this._tail<=this._list.length>>>2&&this._shrinkArray(),b}},d.prototype.push=function(a){if(0==arguments.length)return this.size();var b=this._tail;return(this._list[b]=a,this._tail=b+1&this._capacityMask,this._tail===this._head&&this._growArray(),this._capacity&&this.size()>this._capacity&&this.shift(),this._head<this._tail)?this._tail-this._head:this._capacityMask+1-(this._head-this._tail)},d.prototype.pop=function(){var a=this._tail;if(a!==this._head){var b=this._list.length;this._tail=a-1+b&this._capacityMask;var c=this._list[this._tail];return this._list[this._tail]=void 0,this._head<2&&a>1e4&&a<=b>>>2&&this._shrinkArray(),c}},d.prototype.removeOne=function(a){var b,c=a;if(c===(0|c)&&this._head!==this._tail){var d=this.size(),e=this._list.length;if(!(c>=d)&&!(c<-d)){c<0&&(c+=d),c=this._head+c&this._capacityMask;var f=this._list[c];if(a<d/2){for(b=a;b>0;b--)this._list[c]=this._list[c=c-1+e&this._capacityMask];this._list[c]=void 0,this._head=this._head+1+e&this._capacityMask}else{for(b=d-1-a;b>0;b--)this._list[c]=this._list[c=c+1+e&this._capacityMask];this._list[c]=void 0,this._tail=this._tail-1+e&this._capacityMask}return f}}},d.prototype.remove=function(a,b){var c,d,e=a,f=b;if(e===(0|e)&&this._head!==this._tail){var g=this.size(),h=this._list.length;if(!(e>=g)&&!(e<-g)&&!(b<1)){if(e<0&&(e+=g),1===b||!b)return(c=[,])[0]=this.removeOne(e),c;if(0===e&&e+b>=g)return c=this.toArray(),this.clear(),c;for(e+b>g&&(b=g-e),c=Array(b),d=0;d<b;d++)c[d]=this._list[this._head+e+d&this._capacityMask];if(e=this._head+e&this._capacityMask,a+b===g){for(this._tail=this._tail-b+h&this._capacityMask,d=b;d>0;d--)this._list[e=e+1+h&this._capacityMask]=void 0;return c}if(0===a){for(this._head=this._head+b+h&this._capacityMask,d=b-1;d>0;d--)this._list[e=e+1+h&this._capacityMask]=void 0;return c}if(e<g/2){for(this._head=this._head+a+b+h&this._capacityMask,d=a;d>0;d--)this.unshift(this._list[e=e-1+h&this._capacityMask]);for(e=this._head-1+h&this._capacityMask;f>0;)this._list[e=e-1+h&this._capacityMask]=void 0,f--;a<0&&(this._tail=e)}else{for(this._tail=e,e=e+b+h&this._capacityMask,d=g-(b+a);d>0;d--)this.push(this._list[e++]);for(e=this._tail;f>0;)this._list[e=e+1+h&this._capacityMask]=void 0,f--}return this._head<2&&this._tail>1e4&&this._tail<=h>>>2&&this._shrinkArray(),c}}},d.prototype.splice=function(a,b){var c=a;if(c===(0|c)){var d=this.size();if(c<0&&(c+=d),!(c>d))if(!(arguments.length>2))return this.remove(c,b);else{var e,f,g,h=arguments.length,i=this._list.length,j=2;if(!d||c<d/2){for(e=0,f=Array(c);e<c;e++)f[e]=this._list[this._head+e&this._capacityMask];for(0===b?(g=[],c>0&&(this._head=this._head+c+i&this._capacityMask)):(g=this.remove(c,b),this._head=this._head+c+i&this._capacityMask);h>j;)this.unshift(arguments[--h]);for(e=c;e>0;e--)this.unshift(f[e-1])}else{var k=(f=Array(d-(c+b))).length;for(e=0;e<k;e++)f[e]=this._list[this._head+c+b+e&this._capacityMask];for(0===b?(g=[],c!=d&&(this._tail=this._head+c+i&this._capacityMask)):(g=this.remove(c,b),this._tail=this._tail-k+i&this._capacityMask);j<h;)this.push(arguments[j++]);for(e=0;e<k;e++)this.push(f[e])}return g}}},d.prototype.clear=function(){this._list=Array(this._list.length),this._head=0,this._tail=0},d.prototype.isEmpty=function(){return this._head===this._tail},d.prototype.toArray=function(){return this._copyArray(!1)},d.prototype._fromArray=function(a){var b=a.length,c=this._nextPowerOf2(b);this._list=Array(c),this._capacityMask=c-1,this._tail=b;for(var d=0;d<b;d++)this._list[d]=a[d]},d.prototype._copyArray=function(a,b){var c,d=this._list,e=d.length,f=this.length;if((b|=f)==f&&this._head<this._tail)return this._list.slice(this._head,this._tail);var g=Array(b),h=0;if(a||this._head>this._tail){for(c=this._head;c<e;c++)g[h++]=d[c];for(c=0;c<this._tail;c++)g[h++]=d[c]}else for(c=this._head;c<this._tail;c++)g[h++]=d[c];return g},d.prototype._growArray=function(){if(0!=this._head){var a=this._copyArray(!0,this._list.length<<1);this._tail=this._list.length,this._head=0,this._list=a}else this._tail=this._list.length,this._list.length<<=1;this._capacityMask=this._capacityMask<<1|1},d.prototype._shrinkArray=function(){this._list.length>>>=1,this._capacityMask>>>=1},d.prototype._nextPowerOf2=function(a){return Math.max(1<<Math.log(a)/Math.log(2)+1,4)},b.exports=d},362737,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(637776),e=a.r(917769),f=(0,d.Debug)("delayqueue");c.default=class{constructor(){this.queues={},this.timeouts={}}push(a,b,c){let d=c.callback||process.nextTick;this.queues[a]||(this.queues[a]=new e),this.queues[a].push(b),this.timeouts[a]||(this.timeouts[a]=setTimeout(()=>{d(()=>{this.timeouts[a]=null,this.execute(a)})},c.timeout))}execute(a){let b=this.queues[a];if(!b)return;let{length:c}=b;if(c)for(f("send %d commands in %s queue",c,a),this.queues[a]=null;b.length>0;)b.shift()()}}},327950,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(346833),e=a.r(637776),f=a.r(648956),g=(0,e.Debug)("cluster:subscriberGroup:shardedSubscriber"),h="idle",i="starting",j="connected",k="stopping",l="ended",m={[h]:[i,k,l],[i]:[j,k,l],[j]:[k,l],[k]:[l],[l]:[]};c.default=class{constructor(a,b,c){var g;for(const i of(this.emitter=a,this.status=h,this.instance=null,this.connectPromise=null,this.messageListeners=new Map,this.onEnd=()=>{this.updateStatus(l),this.emitter.emit("-node",this.instance,this.nodeKey)},this.onError=a=>{this.emitter.emit("nodeError",a,this.nodeKey)},this.onMoved=()=>{this.emitter.emit("moved")},this.instance=new f.default((0,e.defaults)({enableReadyCheck:!1,enableOfflineQueue:!0,connectionName:(0,d.getConnectionName)("ssubscriber",b.connectionName),retryStrategy:null,lazyConnect:!0},b,c)),this.lazyConnect=null==(g=null==c?void 0:c.lazyConnect)||g,this.nodeKey=(0,d.getNodeKey)(b),this.instance.on("end",this.onEnd),this.instance.on("error",this.onError),this.instance.on("moved",this.onMoved),["smessage","smessageBuffer"])){const a=(...a)=>{this.emitter.emit(i,...a)};this.messageListeners.set(i,a),this.instance.on(i,a)}}async start(){if(this.connectPromise)return this.connectPromise;if(this.status!==i&&this.status!==j){if(this.status===l||!this.instance)throw Error(`Sharded subscriber ${this.nodeKey} cannot be restarted once ended.`);this.updateStatus(i),this.connectPromise=this.instance.connect();try{await this.connectPromise,this.updateStatus(j)}catch(a){throw this.updateStatus(l),a}finally{this.connectPromise=null}}}stop(){this.updateStatus(k),this.instance&&(this.instance.disconnect(),this.instance.removeAllListeners(),this.messageListeners.clear(),this.instance=null),this.updateStatus(l),g("stopped %s",this.nodeKey)}isStarted(){return[j,i].includes(this.status)}get subscriberStatus(){return this.status}isHealthy(){return(this.status===h||this.status===j||this.status===i)&&null!==this.instance}getInstance(){return this.instance}getNodeKey(){return this.nodeKey}isLazyConnect(){return this.lazyConnect}updateStatus(a){if(this.status!==a){if(!m[this.status].includes(a))return void g("Invalid status transition for %s: %s -> %s",this.nodeKey,this.status,a);this.status=a}}}},101814,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(637776),e=a.r(346833),f=a.r(294774),g=a.r(327950),h=(0,d.Debug)("cluster:subscriberGroup");class i{constructor(a,b){this.subscriberGroupEmitter=a,this.options=b,this.shardedSubscribers=new Map,this.clusterSlots=[],this.subscriberToSlotsIndex=new Map,this.channels=new Map,this.failedAttemptsByNode=new Map,this.isResetting=!1,this.pendingReset=null,this.handleSubscriberConnectFailed=(a,b)=>{let c=(this.failedAttemptsByNode.get(b)||0)+1;this.failedAttemptsByNode.set(b,c);let d=Math.min(c,i.MAX_RETRY_ATTEMPTS),e=Math.min(i.BASE_BACKOFF_MS*2**d,i.MAX_BACKOFF_MS),f=Math.floor(.5*e*(Math.random()-.5)),g=Math.max(0,e+f);h("Failed to connect subscriber for %s. Refreshing slots in %dms",b,g),this.subscriberGroupEmitter.emit("subscriberConnectFailed",{delay:g,error:a})},this.handleSubscriberConnectSucceeded=a=>{this.failedAttemptsByNode.delete(a)}}getResponsibleSubscriber(a){let b=this.clusterSlots[a][0],c=this.shardedSubscribers.get(b);return c&&"idle"===c.subscriberStatus&&c.start().then(()=>{this.handleSubscriberConnectSucceeded(c.getNodeKey())}).catch(a=>{this.handleSubscriberConnectFailed(a,c.getNodeKey())}),c}addChannels(a){let b=f(a[0]);for(let c of a)if(f(c)!==b)return -1;let c=this.channels.get(b);return c?this.channels.set(b,c.concat(a)):this.channels.set(b,a),Array.from(this.channels.values()).reduce((a,b)=>a+b.length,0)}removeChannels(a){let b=f(a[0]);for(let c of a)if(f(c)!==b)return -1;let c=this.channels.get(b);if(c){let d=c.filter(b=>!a.includes(b));this.channels.set(b,d)}return Array.from(this.channels.values()).reduce((a,b)=>a+b.length,0)}stop(){for(let a of this.shardedSubscribers.values())a.stop();this.pendingReset=null,this.shardedSubscribers.clear(),this.subscriberToSlotsIndex.clear()}start(){let a=[];for(let b of this.shardedSubscribers.values())this.shouldStartSubscriber(b)&&(a.push(b.start().then(()=>{this.handleSubscriberConnectSucceeded(b.getNodeKey())}).catch(a=>{this.handleSubscriberConnectFailed(a,b.getNodeKey())})),this.subscriberGroupEmitter.emit("+subscriber"));return Promise.all(a)}async reset(a,b){if(this.isResetting){this.pendingReset={slots:a,nodes:b};return}this.isResetting=!0;try{let c=this._refreshSlots(a),d=this.hasUnhealthySubscribers();if(!c&&!d)return void h("No topology change detected or failed subscribers. Skipping reset.");for(let[a,b]of this.shardedSubscribers){if(this.subscriberToSlotsIndex.has(a)&&b.isHealthy()){h("Skipping deleting subscriber for %s",a);continue}h("Removing subscriber for %s",a),b.stop(),this.shardedSubscribers.delete(a),this.subscriberGroupEmitter.emit("-subscriber")}let f=[];for(let[a,c]of this.subscriberToSlotsIndex){let c=this.shardedSubscribers.get(a);if(c&&c.isHealthy()){h("Skipping creating new subscriber for %s",a),!c.isStarted()&&this.shouldStartSubscriber(c)&&f.push(c.start().then(()=>{this.handleSubscriberConnectSucceeded(a)}).catch(b=>{this.handleSubscriberConnectFailed(b,a)}));continue}c&&!c.isHealthy()&&(h("Replacing subscriber for %s",a),c.stop(),this.shardedSubscribers.delete(a),this.subscriberGroupEmitter.emit("-subscriber")),h("Creating new subscriber for %s",a);let d=b.find(b=>(0,e.getNodeKey)(b.options)===a);if(!d){h("Failed to find node for key %s",a);continue}let i=new g.default(this.subscriberGroupEmitter,d.options,this.options.redisOptions);this.shardedSubscribers.set(a,i),this.shouldStartSubscriber(i)&&f.push(i.start().then(()=>{this.handleSubscriberConnectSucceeded(a)}).catch(b=>{this.handleSubscriberConnectFailed(b,a)})),this.subscriberGroupEmitter.emit("+subscriber")}await Promise.all(f),this._resubscribe(),this.subscriberGroupEmitter.emit("subscribersReady")}finally{if(this.isResetting=!1,this.pendingReset){let{slots:a,nodes:b}=this.pendingReset;this.pendingReset=null,await this.reset(a,b)}}}_refreshSlots(a){if(this._slotsAreEqual(a)&&this.subscriberToSlotsIndex.size>0)return h("Nothing to refresh because the new cluster map is equal to the previous one."),!1;h("Refreshing the slots of the subscriber group."),this.subscriberToSlotsIndex=new Map;for(let b=0;b<a.length;b++){let c=a[b][0];this.subscriberToSlotsIndex.has(c)||this.subscriberToSlotsIndex.set(c,[]),this.subscriberToSlotsIndex.get(c).push(Number(b))}return this.clusterSlots=JSON.parse(JSON.stringify(a)),!0}_resubscribe(){this.shardedSubscribers&&this.shardedSubscribers.forEach((a,b)=>{let c=this.subscriberToSlotsIndex.get(b);c&&c.forEach(c=>{let d=a.getInstance(),e=this.channels.get(c);if(e&&e.length>0){if(!d||"end"===d.status)return;"ready"===d.status?d.ssubscribe(...e).catch(a=>{h("Failed to ssubscribe on node %s: %s",b,a)}):d.once("ready",()=>{d.ssubscribe(...e).catch(a=>{h("Failed to ssubscribe on node %s: %s",b,a)})})}})})}_slotsAreEqual(a){return void 0!==this.clusterSlots&&JSON.stringify(this.clusterSlots)===JSON.stringify(a)}hasUnhealthySubscribers(){let a=Array.from(this.shardedSubscribers.values()).some(a=>!a.isHealthy()),b=Array.from(this.subscriberToSlotsIndex.keys()).some(a=>!this.shardedSubscribers.has(a));return a||b}shouldStartSubscriber(a){if(a.isStarted())return!1;if(!a.isLazyConnect())return!0;let b=this.subscriberToSlotsIndex.get(a.getNodeKey());return!!b&&b.some(a=>{let b=this.channels.get(a);return!!(b&&b.length>0)})}}c.default=i,i.MAX_RETRY_ATTEMPTS=10,i.MAX_BACKOFF_MS=2e3,i.BASE_BACKOFF_MS=100},884301,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(973964),e=a.r(427699),f=a.r(223950),g=a.r(662839),h=a.r(646656),i=a.r(754026),j=a.r(648956),k=a.r(130379),l=a.r(855283),m=a.r(637776),n=a.r(313999),o=a.r(399568),p=a.r(556567),q=a.r(431018),r=a.r(752587),s=a.r(362737),t=a.r(346833),u=a.r(917769),v=a.r(101814),w=(0,m.Debug)("cluster"),x=new WeakSet;class y extends o.default{constructor(a,b={}){var c;if(super(),this.slots=[],this._groupsIds={},this._groupsBySlot=Array(16384),this.isCluster=!0,this.retryAttempts=0,this.delayQueue=new s.default,this.offlineQueue=new u,this.isRefreshing=!1,this._refreshSlotsCacheCallbacks=[],this._autoPipelines=new Map,this._runningAutoPipelines=new Set,this._readyDelayedCallbacks=[],this.connectionEpoch=0,e.EventEmitter.call(this),this.startupNodes=a,this.options=(0,m.defaults)({},b,p.DEFAULT_CLUSTER_OPTIONS,this.options),this.options.shardedSubscribers&&this.createShardedSubscriberGroup(),this.options.redisOptions&&this.options.redisOptions.keyPrefix&&!this.options.keyPrefix&&(this.options.keyPrefix=this.options.redisOptions.keyPrefix),"function"!=typeof this.options.scaleReads&&-1===["all","master","slave"].indexOf(this.options.scaleReads))throw Error('Invalid option scaleReads "'+this.options.scaleReads+'". Expected "all", "master", "slave" or a custom function');this.connectionPool=new r.default(null!=(c=this.options.redisOptions)?c:{},this.options.clusterNodeRetryStrategy),this.connectionPool.on("-node",(a,b)=>{this.emit("-node",a)}),this.connectionPool.on("+node",a=>{this.emit("+node",a)}),this.connectionPool.on("drain",()=>{this.setStatus("close")}),this.connectionPool.on("nodeError",(a,b)=>{this.emit("node error",a,b)}),this.subscriber=new q.default(this.connectionPool,this),this.options.scripts&&Object.entries(this.options.scripts).forEach(([a,b])=>{this.defineCommand(a,b)}),this.options.lazyConnect?this.setStatus("wait"):this.connect().catch(a=>{w("connecting failed: %s",a)})}connect(){return new Promise((a,b)=>{if("connecting"===this.status||"connect"===this.status||"ready"===this.status)return void b(Error("Redis is already connecting/connected"));let c=++this.connectionEpoch;this.setStatus("connecting"),this.resolveStartupNodeHostnames().then(d=>{let e;if(this.connectionEpoch!==c){w("discard connecting after resolving startup nodes because epoch not match: %d != %d",c,this.connectionEpoch),b(new f.RedisError("Connection is discarded because a new connection is made"));return}if("connecting"!==this.status){w("discard connecting after resolving startup nodes because the status changed to %s",this.status),b(new f.RedisError("Connection is aborted"));return}this.connectionPool.reset(d),this.options.shardedSubscribers&&this.shardedSubscribers.reset(this.slots,this.connectionPool.getNodes("all")).catch(a=>{w("Error while starting subscribers: %s",a)});let g=()=>{this.setStatus("ready"),this.retryAttempts=0,this.executeOfflineCommands(),this.resetNodesRefreshInterval(),a()},h=()=>{this.invokeReadyDelayedCallbacks(void 0),this.removeListener("close",e),this.manuallyClosing=!1,this.setStatus("connect"),this.options.enableReadyCheck?this.readyCheck((a,b)=>{a||b?(w("Ready check failed (%s). Reconnecting...",a||b),"connect"===this.status&&this.disconnect(!0)):g()}):g()};e=()=>{let a=Error("None of startup nodes is available");this.removeListener("refresh",h),this.invokeReadyDelayedCallbacks(a),b(a)},this.once("refresh",h),this.once("close",e),this.once("close",this.handleCloseEvent.bind(this)),this.refreshSlotsCache(a=>{a&&a.message===i.default.defaultMessage&&(j.default.prototype.silentEmit.call(this,"error",a),this.connectionPool.reset([]))}),this.subscriber.start(),this.options.shardedSubscribers&&this.shardedSubscribers.start().catch(a=>{w("Error while starting subscribers: %s",a)})}).catch(a=>{this.setStatus("close"),this.handleCloseEvent(a),this.invokeReadyDelayedCallbacks(a),b(a)})})}disconnect(a=!1){let b=this.status;this.setStatus("disconnecting"),a||(this.manuallyClosing=!0),this.reconnectTimeout&&!a&&(clearTimeout(this.reconnectTimeout),this.reconnectTimeout=null,w("Canceled reconnecting attempts")),this.clearNodesRefreshInterval(),this.subscriber.stop(),this.options.shardedSubscribers&&this.shardedSubscribers.stop(),"wait"===b?(this.setStatus("close"),this.handleCloseEvent()):this.connectionPool.reset([])}quit(a){let b=this.status;if(this.setStatus("disconnecting"),this.manuallyClosing=!0,this.reconnectTimeout&&(clearTimeout(this.reconnectTimeout),this.reconnectTimeout=null),this.clearNodesRefreshInterval(),this.subscriber.stop(),this.options.shardedSubscribers&&this.shardedSubscribers.stop(),"wait"===b){let b=(0,g.default)(Promise.resolve("OK"),a);return setImmediate((function(){this.setStatus("close"),this.handleCloseEvent()}).bind(this)),b}return(0,g.default)(Promise.all(this.nodes().map(a=>a.quit().catch(a=>{if(a.message===m.CONNECTION_CLOSED_ERROR_MSG)return"OK";throw a}))).then(()=>"OK"),a)}duplicate(a=[],b={}){return new y(a.length>0?a:this.startupNodes.slice(0),Object.assign({},this.options,b))}nodes(a="all"){if("all"!==a&&"master"!==a&&"slave"!==a)throw Error('Invalid role "'+a+'". Expected "all", "master" or "slave"');return this.connectionPool.getNodes(a)}delayUntilReady(a){this._readyDelayedCallbacks.push(a)}get autoPipelineQueueSize(){let a=0;for(let b of this._autoPipelines.values())a+=b.length;return a}refreshSlotsCache(a){if(a&&this._refreshSlotsCacheCallbacks.push(a),this.isRefreshing)return;this.isRefreshing=!0;let b=this,c=a=>{for(let b of(this.isRefreshing=!1,this._refreshSlotsCacheCallbacks))b(a);this._refreshSlotsCacheCallbacks=[]},d=(0,m.shuffle)(this.connectionPool.getNodes()),e=null;!function a(f){if(f===d.length)return c(new i.default(i.default.defaultMessage,e));let g=d[f],h=`${g.options.host}:${g.options.port}`;w("getting slot cache from %s",h),b.getInfoFromNode(g,function(d){switch(b.status){case"close":case"end":return c(Error("Cluster is disconnected."));case"disconnecting":return c(Error("Cluster is disconnecting."))}d?(b.emit("node error",d,h),e=d,a(f+1)):(b.emit("refresh"),c())})}(0)}sendCommand(a,b,c){if("wait"===this.status&&this.connect().catch(m.noop),"end"===this.status)return a.reject(Error(m.CONNECTION_CLOSED_ERROR_MSG)),a.promise;let e=this.options.scaleReads;"master"!==e&&(a.isReadOnly||(0,d.exists)(a.name)&&(0,d.hasFlag)(a.name,"readonly")||(e="master"));let g=c?c.slot:a.getSlot(),i={},j=this;if(!c&&!x.has(a)){x.add(a);let b=a.reject;a.reject=function(c){let d=k.bind(null,!0);j.handleError(c,i,{moved:function(b,c){w("command %s is moved to %s",a.name,c),g=Number(b),j.slots[b]?j.slots[b][0]=c:j.slots[b]=[c],j._groupsBySlot[b]=j._groupsIds[j.slots[b].join(";")],j.connectionPool.findOrCreate(j.natMapper(c)),k(),w("refreshing slot caches... (triggered by MOVED error)"),j.refreshSlotsCache()},ask:function(b,c){w("command %s is required to ask %s:%s",a.name,c);let d=j.natMapper(c);j.connectionPool.findOrCreate(d),k(!1,`${d.host}:${d.port}`)},tryagain:d,clusterDown:d,connectionClosed:d,maxRedirections:function(c){b.call(a,c)},defaults:function(){b.call(a,c)}})}}function k(d,i){let k;if("end"===j.status)return void a.reject(new f.AbortError("Cluster is ended."));if("ready"===j.status||"cluster"===a.name){if(c&&c.redis)k=c.redis;else if(h.default.checkFlag("ENTER_SUBSCRIBER_MODE",a.name)||h.default.checkFlag("EXIT_SUBSCRIBER_MODE",a.name)){if(j.options.shardedSubscribers&&("ssubscribe"==a.name||"sunsubscribe"==a.name)){let b=j.shardedSubscribers.getResponsibleSubscriber(g);if(!b)return void a.reject(new f.AbortError(`No sharded subscriber for slot: ${g}`));let c=-1;"ssubscribe"==a.name&&(c=j.shardedSubscribers.addChannels(a.getKeys())),"sunsubscribe"==a.name&&(c=j.shardedSubscribers.removeChannels(a.getKeys())),-1!==c?k=b.getInstance():a.reject(new f.AbortError("Possible CROSSSLOT error: All channels must hash to the same slot"))}else k=j.subscriber.getInstance();if(!k)return void a.reject(new f.AbortError("No subscriber for the cluster"))}else{if(!d){if("number"==typeof g&&j.slots[g]){let b=j.slots[g];if("function"==typeof e){let c=b.map(function(a){return j.connectionPool.getInstanceByKey(a)});Array.isArray(k=e(c,a))&&(k=(0,m.sample)(k)),k||(k=c[0])}else{let a;a="all"===e?(0,m.sample)(b):"slave"===e&&b.length>1?(0,m.sample)(b,1):b[0],k=j.connectionPool.getInstanceByKey(a)}}i&&(k=j.connectionPool.getInstanceByKey(i)).asking()}if(k||(k=("function"==typeof e?null:j.connectionPool.getSampleInstance(e))||j.connectionPool.getSampleInstance("all")),k&&!j.options.enableOfflineQueue&&"ready"!==k.status&&"wait"!==k.status)return void a.reject(Error(m.CONNECTION_CLOSED_ERROR_MSG))}c&&!c.redis&&(c.redis=k)}!k&&j.options.enableOfflineQueue?j.offlineQueue.push({command:a,stream:b,node:c}):k?k.sendCommand(a,b):a.reject(Error("Cluster isn't ready and enableOfflineQueue options is false"))}return k(),a.promise}sscanStream(a,b){return this.createScanStream("sscan",{key:a,options:b})}sscanBufferStream(a,b){return this.createScanStream("sscanBuffer",{key:a,options:b})}hscanStream(a,b){return this.createScanStream("hscan",{key:a,options:b})}hscanBufferStream(a,b){return this.createScanStream("hscanBuffer",{key:a,options:b})}zscanStream(a,b){return this.createScanStream("zscan",{key:a,options:b})}zscanBufferStream(a,b){return this.createScanStream("zscanBuffer",{key:a,options:b})}handleError(a,b,c){if(void 0===b.value?b.value=this.options.maxRedirections:b.value-=1,b.value<=0)return void c.maxRedirections(Error("Too many Cluster redirections. Last error: "+a));let d=a.message.split(" ");if("MOVED"===d[0]){let a=this.options.retryDelayOnMoved;a&&"number"==typeof a?this.delayQueue.push("moved",c.moved.bind(null,d[1],d[2]),{timeout:a}):c.moved(d[1],d[2])}else"ASK"===d[0]?c.ask(d[1],d[2]):"TRYAGAIN"===d[0]?this.delayQueue.push("tryagain",c.tryagain,{timeout:this.options.retryDelayOnTryAgain}):"CLUSTERDOWN"===d[0]&&this.options.retryDelayOnClusterDown>0?this.delayQueue.push("clusterdown",c.connectionClosed,{timeout:this.options.retryDelayOnClusterDown,callback:this.refreshSlotsCache.bind(this)}):a.message===m.CONNECTION_CLOSED_ERROR_MSG&&this.options.retryDelayOnFailover>0&&"ready"===this.status?this.delayQueue.push("failover",c.connectionClosed,{timeout:this.options.retryDelayOnFailover,callback:this.refreshSlotsCache.bind(this)}):c.defaults()}resetOfflineQueue(){this.offlineQueue=new u}clearNodesRefreshInterval(){this.slotsTimer&&(clearTimeout(this.slotsTimer),this.slotsTimer=null)}resetNodesRefreshInterval(){if(this.slotsTimer||!this.options.slotsRefreshInterval)return;let a=()=>{this.slotsTimer=setTimeout(()=>{w('refreshing slot caches... (triggered by "slotsRefreshInterval" option)'),this.refreshSlotsCache(()=>{a()})},this.options.slotsRefreshInterval)};a()}setStatus(a){w("status: %s -> %s",this.status||"[empty]",a),this.status=a,process.nextTick(()=>{this.emit(a)})}handleCloseEvent(a){var b;let c;a&&w("closed because %s",a),this.manuallyClosing||"function"!=typeof this.options.clusterRetryStrategy||(c=this.options.clusterRetryStrategy.call(this,++this.retryAttempts,a)),"number"==typeof c?(this.setStatus("reconnecting"),this.reconnectTimeout=setTimeout(()=>{this.reconnectTimeout=null,w("Cluster is disconnected. Retrying after %dms",c),this.connect().catch(function(a){w("Got error %s when reconnecting. Ignoring...",a)})},c)):(this.options.shardedSubscribers&&(null==(b=this.subscriberGroupEmitter)||b.removeAllListeners()),this.setStatus("end"),this.flushQueue(Error("None of startup nodes is available")))}flushQueue(a){let b;for(;b=this.offlineQueue.shift();)b.command.reject(a)}executeOfflineCommands(){if(this.offlineQueue.length){let a;w("send %d commands in offline queue",this.offlineQueue.length);let b=this.offlineQueue;for(this.resetOfflineQueue();a=b.shift();)this.sendCommand(a.command,a.stream,a.node)}}natMapper(a){let b="string"==typeof a?a:`${a.host}:${a.port}`,c=null;return(this.options.natMap&&"function"==typeof this.options.natMap?c=this.options.natMap(b):this.options.natMap&&"object"==typeof this.options.natMap&&(c=this.options.natMap[b]),c)?(w("NAT mapping %s -> %O",b,c),Object.assign({},c)):"string"==typeof a?(0,t.nodeKeyToRedisOptions)(a):a}getInfoFromNode(a,b){if(!a)return b(Error("Node is disconnected"));let c=a.duplicate({enableOfflineQueue:!0,enableReadyCheck:!1,retryStrategy:null,connectionName:(0,t.getConnectionName)("refresher",this.options.redisOptions&&this.options.redisOptions.connectionName)});c.on("error",m.noop),c.cluster("SLOTS",(0,m.timeout)((a,d)=>{if(c.disconnect(),a)return w("error encountered running CLUSTER.SLOTS: %s",a),b(a);if("disconnecting"===this.status||"close"===this.status||"end"===this.status){w("ignore CLUSTER.SLOTS results (count: %d) since cluster status is %s",d.length,this.status),b();return}let e=[];w("cluster slots result count: %d",d.length);for(let a=0;a<d.length;++a){let b=d[a],c=b[0],f=b[1],g=[];for(let a=2;a<b.length;a++){if(!b[a][0])continue;let c=this.natMapper({host:b[a][0],port:b[a][1]});c.readOnly=2!==a,e.push(c),g.push(c.host+":"+c.port)}w("cluster slots result [%d]: slots %d~%d served by %s",a,c,f,g);for(let a=c;a<=f;a++)this.slots[a]=g}this._groupsIds=Object.create(null);let f=0;for(let a=0;a<16384;a++){let b=(this.slots[a]||[]).join(";");if(!b.length){this._groupsBySlot[a]=void 0;continue}this._groupsIds[b]||(this._groupsIds[b]=++f),this._groupsBySlot[a]=this._groupsIds[b]}this.connectionPool.reset(e),this.options.shardedSubscribers&&this.shardedSubscribers.reset(this.slots,this.connectionPool.getNodes("all")).catch(a=>{w("Error while starting subscribers: %s",a)}),b()},this.options.slotsRefreshTimeout))}invokeReadyDelayedCallbacks(a){for(let b of this._readyDelayedCallbacks)process.nextTick(b,a);this._readyDelayedCallbacks=[]}readyCheck(a){this.cluster("INFO",(b,c)=>{let d;if(b)return a(b);if("string"!=typeof c)return a();let e=c.split("\r\n");for(let a=0;a<e.length;++a){let b=e[a].split(":");if("cluster_state"===b[0]){d=b[1];break}}"fail"===d?(w("cluster state not ok (%s)",d),a(null,d)):a()})}resolveSrv(a){return new Promise((b,c)=>{this.options.resolveSrv(a,(a,d)=>{if(a)return c(a);let e=this,f=(0,t.groupSrvRecords)(d),g=Object.keys(f).sort((a,b)=>parseInt(a)-parseInt(b));!function a(d){if(!g.length)return c(d);let h=f[g[0]],i=(0,t.weightSrvRecords)(h);h.records.length||g.shift(),e.dnsLookup(i.name).then(a=>b({host:a,port:i.port}),a)}()})})}dnsLookup(a){return new Promise((b,c)=>{this.options.dnsLookup(a,(d,e)=>{d?(w("failed to resolve hostname %s to IP: %s",a,d.message),c(d)):(w("resolved hostname %s to IP %s",a,e),b(e))})})}async resolveStartupNodeHostnames(){if(!Array.isArray(this.startupNodes)||0===this.startupNodes.length)throw Error("`startupNodes` should contain at least one node.");let a=(0,t.normalizeNodeOptions)(this.startupNodes),b=(0,t.getUniqueHostnamesFromOptions)(a);if(0===b.length)return a;let c=await Promise.all(b.map((this.options.useSRVRecords?this.resolveSrv:this.dnsLookup).bind(this))),d=(0,m.zipMap)(b,c);return a.map(a=>{let b=d.get(a.host);return b?this.options.useSRVRecords?Object.assign({},a,b):Object.assign({},a,{host:b}):a})}createScanStream(a,{key:b,options:c={}}){return new k.default({objectMode:!0,key:b,redis:this,command:a,...c})}createShardedSubscriberGroup(){this.subscriberGroupEmitter=new e.EventEmitter,this.shardedSubscribers=new v.default(this.subscriberGroupEmitter,this.options);let a=a=>{a instanceof i.default&&this.disconnect(!0)};for(let b of(this.subscriberGroupEmitter.on("-node",(b,c)=>{this.emit("-node",b,c),this.refreshSlotsCache(a)}),this.subscriberGroupEmitter.on("subscriberConnectFailed",({delay:b,error:c})=>{this.emit("error",c),setTimeout(()=>{this.refreshSlotsCache(a)},b)}),this.subscriberGroupEmitter.on("moved",()=>{this.refreshSlotsCache(a)}),this.subscriberGroupEmitter.on("-subscriber",()=>{this.emit("-subscriber")}),this.subscriberGroupEmitter.on("+subscriber",()=>{this.emit("+subscriber")}),this.subscriberGroupEmitter.on("nodeError",(a,b)=>{this.emit("nodeError",a,b)}),this.subscriberGroupEmitter.on("subscribersReady",()=>{this.emit("subscribersReady")}),["smessage","smessageBuffer"]))this.subscriberGroupEmitter.on(b,(a,c,d)=>{this.emit(b,a,c,d)})}}(0,n.default)(y,e.EventEmitter),(0,l.addTransactionSupport)(y.prototype),c.default=y},593540,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=(0,a.r(637776).Debug)("AbstractConnector");c.default=class{constructor(a){this.connecting=!1,this.disconnectTimeout=a}check(a){return!0}disconnect(){if(this.connecting=!1,this.stream){let a=this.stream,b=setTimeout(()=>{d("stream %s:%s still open, destroying it",a.remoteAddress,a.remotePort),a.destroy()},this.disconnectTimeout);a.on("close",()=>clearTimeout(b)),a.end()}}}},498826,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(504446),e=a.r(755004),f=a.r(637776),g=a.r(593540);class h extends g.default{constructor(a){super(a.disconnectTimeout),this.options=a}connect(a){let b,{options:c}=this;return this.connecting=!0,"path"in c&&c.path?b={path:c.path}:(b={},"port"in c&&null!=c.port&&(b.port=c.port),"host"in c&&null!=c.host&&(b.host=c.host),"family"in c&&null!=c.family&&(b.family=c.family)),c.tls&&Object.assign(b,c.tls),new Promise((a,g)=>{process.nextTick(()=>{if(!this.connecting)return void g(Error(f.CONNECTION_CLOSED_ERROR_MSG));try{c.tls?this.stream=(0,e.connect)(b):this.stream=(0,d.createConnection)(b)}catch(a){g(a);return}this.stream.once("error",a=>{this.firstError=a}),a(this.stream)})})}}c.default=h},123979,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.default=class{constructor(a){this.cursor=0,this.sentinels=a.slice(0)}next(){let a=this.cursor>=this.sentinels.length;return{done:a,value:a?void 0:this.sentinels[this.cursor++]}}reset(a){a&&this.sentinels.length>1&&1!==this.cursor&&this.sentinels.unshift(...this.sentinels.splice(this.cursor-1)),this.cursor=0}add(a){for(let c=0;c<this.sentinels.length;c++){var b;if(b=this.sentinels[c],(a.host||"127.0.0.1")===(b.host||"127.0.0.1")&&(a.port||26379)===(b.port||26379))return!1}return this.sentinels.push(a),!0}toString(){return`${JSON.stringify(this.sentinels)} @${this.cursor}`}}},621571,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.FailoverDetector=void 0;let d=(0,a.r(637776).Debug)("FailoverDetector"),e="+switch-master";c.FailoverDetector=class{constructor(a,b){this.isDisconnected=!1,this.connector=a,this.sentinels=b}cleanup(){for(let a of(this.isDisconnected=!0,this.sentinels))a.client.disconnect()}async subscribe(){d("Starting FailoverDetector");let a=[];for(let b of this.sentinels){let c=b.client.subscribe(e).catch(a=>{d("Failed to subscribe to failover messages on sentinel %s:%s (%s)",b.address.host||"127.0.0.1",b.address.port||26739,a.message)});a.push(c),b.client.on("message",a=>{this.isDisconnected||a!==e||this.disconnect()})}await Promise.all(a)}disconnect(){this.isDisconnected=!0,d("Failover detected, disconnecting"),this.connector.disconnect()}}},640507,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.SentinelIterator=void 0;let d=a.r(504446),e=a.r(637776),f=a.r(755004),g=a.r(123979);c.SentinelIterator=g.default;let h=a.r(593540),i=a.r(648956),j=a.r(621571),k=(0,e.Debug)("SentinelConnector");class l extends h.default{constructor(a){if(super(a.disconnectTimeout),this.options=a,this.emitter=null,this.failoverDetector=null,!this.options.sentinels.length)throw Error("Requires at least one sentinel to connect to.");if(!this.options.name)throw Error("Requires the name of master.");this.sentinelIterator=new g.default(this.options.sentinels)}check(a){let b=!a.role||this.options.role===a.role;return b||(k("role invalid, expected %s, but got %s",this.options.role,a.role),this.sentinelIterator.next(),this.sentinelIterator.next(),this.sentinelIterator.reset(!0)),b}disconnect(){super.disconnect(),this.failoverDetector&&this.failoverDetector.cleanup()}connect(a){let b;this.connecting=!0,this.retryAttempts=0;let c=async()=>{let g=this.sentinelIterator.next();if(g.done){this.sentinelIterator.reset(!1);let d="function"==typeof this.options.sentinelRetryStrategy?this.options.sentinelRetryStrategy(++this.retryAttempts):null,e="number"!=typeof d?"All sentinels are unreachable and retry is disabled.":`All sentinels are unreachable. Retrying from scratch after ${d}ms.`;b&&(e+=` Last error: ${b.message}`),k(e);let f=Error(e);if("number"==typeof d)return a("error",f),await new Promise(a=>setTimeout(a,d)),c();throw f}let h=null,i=null;try{h=await this.resolve(g.value)}catch(a){i=a}if(!this.connecting)throw Error(e.CONNECTION_CLOSED_ERROR_MSG);let j=g.value.host+":"+g.value.port;if(h)return k("resolved: %s:%s from sentinel %s",h.host,h.port,j),this.options.enableTLSForSentinelMode&&this.options.tls?(Object.assign(h,this.options.tls),this.stream=(0,f.connect)(h),this.stream.once("secureConnect",this.initFailoverDetector.bind(this))):(this.stream=(0,d.createConnection)(h),this.stream.once("connect",this.initFailoverDetector.bind(this))),this.stream.once("error",a=>{this.firstError=a}),this.stream;{let d=i?"failed to connect to sentinel "+j+" because "+i.message:"connected to sentinel "+j+" successfully, but got an invalid reply: "+h;return k(d),a("sentinelError",Error(d)),i&&(b=i),c()}};return c()}async updateSentinels(a){if(!this.options.updateSentinels)return;let b=await a.sentinel("sentinels",this.options.name);Array.isArray(b)&&(b.map(e.packObject).forEach(a=>{if(-1===(a.flags?a.flags.split(","):[]).indexOf("disconnected")&&a.ip&&a.port){let b=this.sentinelNatResolve(m(a));this.sentinelIterator.add(b)&&k("adding sentinel %s:%s",b.host,b.port)}}),k("Updated internal sentinels: %s",this.sentinelIterator))}async resolveMaster(a){let b=await a.sentinel("get-master-addr-by-name",this.options.name);return await this.updateSentinels(a),this.sentinelNatResolve(Array.isArray(b)?{host:b[0],port:Number(b[1])}:null)}async resolveSlave(a){let b=await a.sentinel("slaves",this.options.name);if(!Array.isArray(b))return null;let c=b.map(e.packObject).filter(a=>a.flags&&!a.flags.match(/(disconnected|s_down|o_down)/));return this.sentinelNatResolve(function(a,b){let c;if(0===a.length)return null;if("function"==typeof b)c=b(a);else if(null!==b&&"object"==typeof b){let d=Array.isArray(b)?b:[b];d.sort((a,b)=>(a.prio||(a.prio=1),b.prio||(b.prio=1),a.prio<b.prio)?-1:+(a.prio>b.prio));for(let b=0;b<d.length;b++){for(let e=0;e<a.length;e++){let f=a[e];if(f.ip===d[b].ip&&f.port===d[b].port){c=f;break}}if(c)break}}return c||(c=(0,e.sample)(a)),m(c)}(c,this.options.preferredSlaves))}sentinelNatResolve(a){if(!a||!this.options.natMap)return a;let b=`${a.host}:${a.port}`,c=a;return"function"==typeof this.options.natMap?c=this.options.natMap(b)||a:"object"==typeof this.options.natMap&&(c=this.options.natMap[b]||a),c}connectToSentinel(a,b){return new i.default({port:a.port||26379,host:a.host,username:this.options.sentinelUsername||null,password:this.options.sentinelPassword||null,family:a.family||("path"in this.options&&this.options.path?void 0:this.options.family),tls:this.options.sentinelTLS,retryStrategy:null,enableReadyCheck:!1,connectTimeout:this.options.connectTimeout,commandTimeout:this.options.sentinelCommandTimeout,...b})}async resolve(a){let b=this.connectToSentinel(a);b.on("error",n);try{if("slave"===this.options.role)return await this.resolveSlave(b);return await this.resolveMaster(b)}finally{b.disconnect()}}async initFailoverDetector(){var a;if(!this.options.failoverDetector)return;this.sentinelIterator.reset(!0);let b=[];for(;b.length<this.options.sentinelMaxConnections;){let{done:a,value:c}=this.sentinelIterator.next();if(a)break;let d=this.connectToSentinel(c,{lazyConnect:!0,retryStrategy:this.options.sentinelReconnectStrategy});d.on("reconnecting",()=>{var a;null==(a=this.emitter)||a.emit("sentinelReconnecting")}),b.push({address:c,client:d})}this.sentinelIterator.reset(!1),this.failoverDetector&&this.failoverDetector.cleanup(),this.failoverDetector=new j.FailoverDetector(this,b),await this.failoverDetector.subscribe(),null==(a=this.emitter)||a.emit("failoverSubscribed")}}function m(a){return{host:a.ip,port:Number(a.port)}}function n(){}c.default=l},974980,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.SentinelConnector=c.StandaloneConnector=void 0,c.StandaloneConnector=a.r(498826).default,c.SentinelConnector=a.r(640507).default},603983,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(223950);class e extends d.AbortError{constructor(a){super(`Reached the max retries per request limit (which is ${a}). Refer to "maxRetriesPerRequest" option for details.`),Error.captureStackTrace(this,this.constructor)}get name(){return this.constructor.name}}c.default=e},808423,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.MaxRetriesPerRequestError=void 0,c.MaxRetriesPerRequestError=a.r(603983).default},99348,(a,b,c)=>{b.exports=a.x("string_decoder",()=>require("string_decoder"))},585829,(a,b,c)=>{"use strict";let d=a.r(500874).Buffer,e=new(a.r(99348)).StringDecoder,f=a.r(223950),g=f.ReplyError,h=f.ParserError;var i=d.allocUnsafe(32768),j=0,k=null,l=0,m=0;function n(a){let b=a.offset,c=a.buffer,d=c.length-1;for(var e=b;e<d;)if(13===c[e++]){if(a.offset=e+1,!0===a.optionReturnBuffers)return a.buffer.slice(b,e-1);return a.buffer.toString("utf8",b,e-1)}}function o(a){let b=a.buffer.length-1;for(var c=a.offset,d=0;c<b;){let b=a.buffer[c++];if(13===b)return a.offset=c+1,d;d=10*d+(b-48)}}function p(a,b,c){a.arrayCache.push(b),a.arrayPos.push(c)}function q(a){let b=a.arrayCache.pop();var c=a.arrayPos.pop();if(a.arrayCache.length){let d=q(a);if(void 0===d)return void p(a,b,c);b[c++]=d}return r(a,b,c)}function r(a,b,c){let d=a.buffer.length;for(;c<b.length;){let e=a.offset;if(a.offset>=d)return void p(a,b,c);let f=s(a,a.buffer[a.offset++]);if(void 0===f){a.arrayCache.length||a.bufferCache.length||(a.offset=e),p(a,b,c);return}b[c]=f,c++}return b}function s(a,b){switch(b){case 36:let c=o(a);if(void 0===c)return;if(c<0)return null;let d=a.offset+c;if(d+2>a.buffer.length){a.bigStrSize=d+2,a.totalChunkSize=a.buffer.length,a.bufferCache.push(a.buffer);return}let e=a.offset;return(a.offset=d+2,!0===a.optionReturnBuffers)?a.buffer.slice(e,d):a.buffer.toString("utf8",e,d);case 43:return n(a);case 42:let f;return void 0===(f=o(a))?void 0:f<0?null:r(a,Array(f),0);case 58:return!0===a.optionStringNumbers?function(a){let b=a.buffer.length-1;var c=a.offset,d=0,e="";for(45===a.buffer[c]&&(e+="-",c++);c<b;){var f=a.buffer[c++];if(13===f)return a.offset=c+1,0!==d&&(e+=d),e;d>0x19999998?(e+=10*d+(f-48),d=0):48===f&&0===d?e+=0:d=10*d+(f-48)}}(a):function(a){let b=a.buffer.length-1;var c=a.offset,d=0,e=1;for(45===a.buffer[c]&&(e=-1,c++);c<b;){let b=a.buffer[c++];if(13===b)return a.offset=c+1,e*d;d=10*d+(b-48)}}(a);case 45:var i=n(a);if(void 0!==i)return!0===a.optionReturnBuffers&&(i=i.toString()),new g(i);return;default:let j;return j=new h("Protocol error, got "+JSON.stringify(String.fromCharCode(b))+" as reply type byte",JSON.stringify(a.buffer),a.offset),void(a.buffer=null,a.returnFatalError(j))}}function t(){if(i.length>51200)if(1===l||m>2*l){let a=Math.floor(i.length/10),b=a<j?j:a;j=0,i=i.slice(b,i.length)}else m++,l--;else clearInterval(k),l=0,m=0,k=null}b.exports=class{constructor(a){if(!a)throw TypeError("Options are mandatory.");if("function"!=typeof a.returnError||"function"!=typeof a.returnReply)throw TypeError("The returnReply and returnError options have to be functions.");this.setReturnBuffers(!!a.returnBuffers),this.setStringNumbers(!!a.stringNumbers),this.returnError=a.returnError,this.returnFatalError=a.returnFatalError||a.returnError,this.returnReply=a.returnReply,this.reset()}reset(){this.offset=0,this.buffer=null,this.bigStrSize=0,this.totalChunkSize=0,this.bufferCache=[],this.arrayCache=[],this.arrayPos=[]}setReturnBuffers(a){if("boolean"!=typeof a)throw TypeError("The returnBuffers argument has to be a boolean");this.optionReturnBuffers=a}setStringNumbers(a){if("boolean"!=typeof a)throw TypeError("The stringNumbers argument has to be a boolean");this.optionStringNumbers=a}execute(a){if(null===this.buffer)this.buffer=a,this.offset=0;else if(0===this.bigStrSize){let b=this.buffer.length,c=b-this.offset,e=d.allocUnsafe(c+a.length);if(this.buffer.copy(e,0,this.offset,b),a.copy(e,c,0,a.length),this.buffer=e,this.offset=0,this.arrayCache.length){let a=q(this);if(void 0===a)return;this.returnReply(a)}}else if(this.totalChunkSize+a.length>=this.bigStrSize){this.bufferCache.push(a);var b=this.optionReturnBuffers?function(a){let b=a.bufferCache,c=a.offset,e=a.bigStrSize-c-2;var f=b.length,g=a.bigStrSize-a.totalChunkSize;if(a.offset=g,g<=2){if(2===f)return b[0].slice(c,b[0].length+g-2);f--,g=b[b.length-2].length+g}i.length<e+j&&(j>0x6f00000&&(j=0x3200000),i=d.allocUnsafe(e*(e>0x4b00000?2:3)+j),j=0,l++,null===k&&(k=setInterval(t,50)));let h=j;b[0].copy(i,h,c,b[0].length),j+=b[0].length-c;for(var m=1;m<f-1;m++)b[m].copy(i,j),j+=b[m].length;return b[m].copy(i,j,0,g-2),j+=g-2,i.slice(h,j)}(this):function(a){let b=a.bufferCache,c=a.offset;var d=b.length,f=a.bigStrSize-a.totalChunkSize;if(a.offset=f,f<=2){if(2===d)return b[0].toString("utf8",c,b[0].length+f-2);d--,f=b[b.length-2].length+f}for(var g=e.write(b[0].slice(c)),h=1;h<d-1;h++)g+=e.write(b[h]);return g+e.end(b[h].slice(0,f-2))}(this);if(this.bigStrSize=0,this.bufferCache=[],this.buffer=a,this.arrayCache.length&&(this.arrayCache[0][this.arrayPos[0]++]=b,void 0===(b=q(this))))return;this.returnReply(b)}else{this.bufferCache.push(a),this.totalChunkSize+=a.length;return}for(;this.offset<this.buffer.length;){let a=this.offset,b=this.buffer[this.offset++],c=s(this,b);if(void 0===c){this.arrayCache.length||this.bufferCache.length||(this.offset=a);return}45===b?this.returnError(c):this.returnReply(c)}this.buffer=null}}},788309,(a,b,c)=>{"use strict";b.exports=a.r(585829)},247058,(a,b,c)=>{"use strict";function d(a){return"unsubscribe"===a?"subscribe":"punsubscribe"===a?"psubscribe":"sunsubscribe"===a?"ssubscribe":a}Object.defineProperty(c,"__esModule",{value:!0}),c.default=class{constructor(){this.set={subscribe:{},psubscribe:{},ssubscribe:{}}}add(a,b){this.set[d(a)][b]=!0}del(a,b){delete this.set[d(a)][b]}channels(a){return Object.keys(this.set[d(a)])}isEmpty(){return 0===this.channels("subscribe").length&&0===this.channels("psubscribe").length&&0===this.channels("ssubscribe").length}}},28645,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(646656),e=a.r(637776),f=a.r(788309),g=a.r(247058),h=(0,e.Debug)("dataHandler");c.default=class{constructor(a,b){this.redis=a;const c=new f({stringNumbers:b.stringNumbers,returnBuffers:!0,returnError:a=>{this.returnError(a)},returnFatalError:a=>{this.returnFatalError(a)},returnReply:a=>{this.returnReply(a)}});a.stream.prependListener("data",a=>{c.execute(a)}),a.stream.resume()}returnFatalError(a){a.message+=". Please report this.",this.redis.recoverFromFatalError(a,a,{offlineQueue:!1})}returnError(a){let b=this.shiftCommand(a);if(b){if(a.command={name:b.command.name,args:b.command.args},"ssubscribe"==b.command.name&&a.message.includes("MOVED"))return void this.redis.emit("moved");this.redis.handleReconnection(a,b)}}returnReply(a){if(this.handleMonitorReply(a)||this.handleSubscriberReply(a))return;let b=this.shiftCommand(a);b&&(d.default.checkFlag("ENTER_SUBSCRIBER_MODE",b.command.name)?(this.redis.condition.subscriber=new g.default,this.redis.condition.subscriber.add(b.command.name,a[1].toString()),j(b.command,a[2])||this.redis.commandQueue.unshift(b)):d.default.checkFlag("EXIT_SUBSCRIBER_MODE",b.command.name)?k(b.command,a[2])||this.redis.commandQueue.unshift(b):b.command.resolve(a))}handleSubscriberReply(a){if(!this.redis.condition.subscriber)return!1;let b=Array.isArray(a)?a[0].toString():null;switch(h('receive reply "%s" in subscriber mode',b),b){case"message":this.redis.listeners("message").length>0&&this.redis.emit("message",a[1].toString(),a[2]?a[2].toString():""),this.redis.emit("messageBuffer",a[1],a[2]);break;case"pmessage":{let b=a[1].toString();this.redis.listeners("pmessage").length>0&&this.redis.emit("pmessage",b,a[2].toString(),a[3].toString()),this.redis.emit("pmessageBuffer",b,a[2],a[3]);break}case"smessage":this.redis.listeners("smessage").length>0&&this.redis.emit("smessage",a[1].toString(),a[2]?a[2].toString():""),this.redis.emit("smessageBuffer",a[1],a[2]);break;case"ssubscribe":case"subscribe":case"psubscribe":{let c=a[1].toString();this.redis.condition.subscriber.add(b,c);let d=this.shiftCommand(a);if(!d)return;j(d.command,a[2])||this.redis.commandQueue.unshift(d);break}case"sunsubscribe":case"unsubscribe":case"punsubscribe":{let c=a[1]?a[1].toString():null;c&&this.redis.condition.subscriber.del(b,c);let d=a[2];0===Number(d)&&(this.redis.condition.subscriber=!1);let e=this.shiftCommand(a);if(!e)return;k(e.command,d)||this.redis.commandQueue.unshift(e);break}default:{let b=this.shiftCommand(a);if(!b)return;b.command.resolve(a)}}return!0}handleMonitorReply(a){if("monitoring"!==this.redis.status)return!1;let b=a.toString();if("OK"===b)return!1;let c=b.indexOf(" "),d=b.slice(0,c),e=b.indexOf('"'),f=b.slice(e+1,-1).split('" "').map(a=>a.replace(/\\"/g,'"')),g=b.slice(c+2,e-2).split(" ");return this.redis.emit("monitor",d,f,g[1],g[0]),!0}shiftCommand(a){let b=this.redis.commandQueue.shift();if(!b){let b=Error("Command queue state error. If you can reproduce this, please report it."+(a instanceof Error?` Last error: ${a.message}`:` Last reply: ${a.toString()}`));return this.redis.emit("error",b),null}return b}};let i=new WeakMap;function j(a,b){let c=i.has(a)?i.get(a):a.args.length;return(c-=1)<=0?(a.resolve(b),i.delete(a),!0):(i.set(a,c),!1)}function k(a,b){let c=i.has(a)?i.get(a):a.args.length;return 0===c?0===Number(b)&&(i.delete(a),a.resolve(b),!0):(c-=1)<=0?(a.resolve(b),!0):(i.set(a,c),!1)}},867107,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.readyHandler=c.errorHandler=c.closeHandler=c.connectHandler=void 0;let d=a.r(223950),e=a.r(646656),f=a.r(808423),g=a.r(637776),h=a.r(28645),i=(0,g.Debug)("connection");function j(a){let b=new d.AbortError("Command aborted due to connection close");return b.command={name:a.name,args:a.args},b}c.connectHandler=function(a){return function(){var b;a.setStatus("connect"),a.resetCommandQueue();let d=!1,{connectionEpoch:e}=a;a.condition.auth&&a.auth(a.condition.auth,function(b){e===a.connectionEpoch&&b&&(-1!==b.message.indexOf("no password is set")?console.warn("[WARN] Redis server does not require a password, but a password was supplied."):-1!==b.message.indexOf("without any password configured for the default user")?console.warn("[WARN] This Redis server's `default` user does not require a password, but a password was supplied"):-1!==b.message.indexOf("wrong number of arguments for 'auth' command")?console.warn("[ERROR] The server returned \"wrong number of arguments for 'auth' command\". You are probably passing both username and password to Redis version 5 or below. You should only pass the 'password' option for Redis version 5 and under."):(d=!0,a.recoverFromFatalError(b,b)))}),a.condition.select&&a.select(a.condition.select).catch(b=>{a.silentEmit("error",b)}),new h.default(a,{stringNumbers:a.options.stringNumbers});let f=[];a.options.connectionName&&(i("set the connection name [%s]",a.options.connectionName),f.push(a.client("setname",a.options.connectionName).catch(g.noop))),a.options.disableClientInfo||(i("set the client info"),f.push((0,g.getPackageMeta)().then(b=>a.client("SETINFO","LIB-VER",b.version).catch(g.noop)).catch(g.noop)),f.push(a.client("SETINFO","LIB-NAME",(null==(b=a.options)?void 0:b.clientInfoTag)?`ioredis(${a.options.clientInfoTag})`:"ioredis").catch(g.noop))),Promise.all(f).catch(g.noop).finally(()=>{a.options.enableReadyCheck||c.readyHandler(a)(),a.options.enableReadyCheck&&a._readyCheck(function(b,f){e===a.connectionEpoch&&(b?d||a.recoverFromFatalError(Error("Ready check failed: "+b.message),b):a.connector.check(f)?c.readyHandler(a)():a.disconnect(!0))})})}},c.closeHandler=function(a){return function(){let c=a.status;if(a.setStatus("close"),a.commandQueue.length&&function(a){var b;let c=0;for(let d=0;d<a.length;){let e=null==(b=a.peekAt(d))?void 0:b.command,f=e.pipelineIndex;if((void 0===f||0===f)&&(c=0),void 0!==f&&f!==c++){a.remove(d,1),e.reject(j(e));continue}d++}}(a.commandQueue),a.offlineQueue.length&&function(a){var b;for(let c=0;c<a.length;){let d=null==(b=a.peekAt(c))?void 0:b.command;if("multi"===d.name)break;if("exec"===d.name){a.remove(c,1),d.reject(j(d));break}d.inTransaction?(a.remove(c,1),d.reject(j(d))):c++}}(a.offlineQueue),"ready"===c&&(a.prevCondition||(a.prevCondition=a.condition),a.commandQueue.length&&(a.prevCommandQueue=a.commandQueue)),a.manuallyClosing)return a.manuallyClosing=!1,i("skip reconnecting since the connection is manually closed."),b();if("function"!=typeof a.options.retryStrategy)return i("skip reconnecting because `retryStrategy` is not a function"),b();let d=a.options.retryStrategy(++a.retryAttempts);if("number"!=typeof d)return i("skip reconnecting because `retryStrategy` doesn't return a number"),b();i("reconnect in %sms",d),a.setStatus("reconnecting",d),a.reconnectTimeout=setTimeout(function(){a.reconnectTimeout=null,a.connect().catch(g.noop)},d);let{maxRetriesPerRequest:e}=a.options;"number"==typeof e&&(e<0?i("maxRetriesPerRequest is negative, ignoring..."):0==a.retryAttempts%(e+1)&&(i("reach maxRetriesPerRequest limitation, flushing command queue..."),a.flushQueue(new f.MaxRetriesPerRequestError(e))))};function b(){a.setStatus("end"),a.flushQueue(Error(g.CONNECTION_CLOSED_ERROR_MSG))}},c.errorHandler=function(a){return function(b){i("error: %s",b),a.silentEmit("error",b)}},c.readyHandler=function(a){return function(){if(a.setStatus("ready"),a.retryAttempts=0,a.options.monitor){a.call("monitor").then(()=>a.setStatus("monitoring"),b=>a.emit("error",b));let{sendCommand:b}=a;a.sendCommand=function(c){return e.default.checkFlag("VALID_IN_MONITOR_MODE",c.name)?b.call(a,c):(c.reject(Error("Connection is in monitoring mode, can't process commands.")),c.promise)},a.once("close",function(){delete a.sendCommand});return}let b=a.prevCondition?a.prevCondition.select:a.condition.select;if(a.options.readOnly&&(i("set the connection to readonly mode"),a.readonly().catch(g.noop)),a.prevCondition){let c=a.prevCondition;if(a.prevCondition=null,c.subscriber&&a.options.autoResubscribe){a.condition.select!==b&&(i("connect to db [%d]",b),a.select(b));let d=c.subscriber.channels("subscribe");d.length&&(i("subscribe %d channels",d.length),a.subscribe(d));let e=c.subscriber.channels("psubscribe");e.length&&(i("psubscribe %d channels",e.length),a.psubscribe(e));let f=c.subscriber.channels("ssubscribe");if(f.length)for(let b of(i("ssubscribe %s",f.length),f))a.ssubscribe(b)}}if(a.prevCommandQueue)if(a.options.autoResendUnfulfilledCommands)for(i("resend %d unfulfilled commands",a.prevCommandQueue.length);a.prevCommandQueue.length>0;){let b=a.prevCommandQueue.shift();b.select!==a.condition.select&&"select"!==b.command.name&&a.select(b.select),a.sendCommand(b.command,b.stream)}else a.prevCommandQueue=null;if(a.offlineQueue.length){i("send %d commands in offline queue",a.offlineQueue.length);let b=a.offlineQueue;for(a.resetOfflineQueue();b.length>0;){let c=b.shift();c.select!==a.condition.select&&"select"!==c.command.name&&a.select(c.select),a.sendCommand(c.command,c.stream)}}a.condition.select!==b&&(i("connect to db [%d]",b),a.select(b))}}},779347,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.DEFAULT_REDIS_OPTIONS=void 0,c.DEFAULT_REDIS_OPTIONS={port:6379,host:"localhost",family:0,connectTimeout:1e4,disconnectTimeout:2e3,retryStrategy:function(a){return Math.min(50*a,2e3)},keepAlive:0,noDelay:!0,connectionName:null,disableClientInfo:!1,clientInfoTag:void 0,sentinels:null,name:null,role:"master",sentinelRetryStrategy:function(a){return Math.min(10*a,1e3)},sentinelReconnectStrategy:function(){return 6e4},natMap:null,enableTLSForSentinelMode:!1,updateSentinels:!0,failoverDetector:!1,username:null,password:null,db:0,enableOfflineQueue:!0,enableReadyCheck:!0,autoResubscribe:!0,autoResendUnfulfilledCommands:!0,lazyConnect:!1,keyPrefix:"",reconnectOnError:null,readOnly:!1,stringNumbers:!1,maxRetriesPerRequest:20,maxLoadingRetryTime:1e4,enableAutoPipelining:!1,autoPipeliningIgnoredCommands:[],sentinelMaxConnections:10,blockingTimeoutGrace:100}},648956,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});let d=a.r(973964),e=a.r(427699),f=a.r(662839),g=a.r(884301),h=a.r(646656),i=a.r(974980),j=a.r(640507),k=a.r(867107),l=a.r(779347),m=a.r(130379),n=a.r(855283),o=a.r(637776),p=a.r(600395),q=a.r(313999),r=a.r(399568),s=a.r(461950),t=a.r(917769),u=(0,o.Debug)("redis");class v extends r.default{constructor(a,b,c){if(super(),this.status="wait",this.isCluster=!1,this.reconnectTimeout=null,this.connectionEpoch=0,this.retryAttempts=0,this.manuallyClosing=!1,this._autoPipelines=new Map,this._runningAutoPipelines=new Set,this.parseOptions(a,b,c),e.EventEmitter.call(this),this.resetCommandQueue(),this.resetOfflineQueue(),this.options.Connector)this.connector=new this.options.Connector(this.options);else if(this.options.sentinels){const a=new j.default(this.options);a.emitter=this,this.connector=a}else this.connector=new i.StandaloneConnector(this.options);this.options.scripts&&Object.entries(this.options.scripts).forEach(([a,b])=>{this.defineCommand(a,b)}),this.options.lazyConnect?this.setStatus("wait"):this.connect().catch(s.noop)}static createClient(...a){return new v(...a)}get autoPipelineQueueSize(){let a=0;for(let b of this._autoPipelines.values())a+=b.length;return a}connect(a){let b=(0,p.traceConnect)(()=>this._connect(),()=>{let{address:a,port:b}=this._getServerAddress();return{serverAddress:a,serverPort:b,connectionEpoch:this.connectionEpoch}});return(0,f.default)(b,a)}_connect(){return new Promise((a,b)=>{if("connecting"===this.status||"connect"===this.status||"ready"===this.status)return void b(Error("Redis is already connecting/connected"));this.connectionEpoch+=1,this.setStatus("connecting");let{options:c}=this;this.condition={select:c.db,auth:c.username?[c.username,c.password]:c.password,subscriber:!1};let d=this;(0,f.default)(this.connector.connect(function(a,b){d.silentEmit(a,b)}),function(e,f){if(e){d.flushQueue(e),d.silentEmit("error",e),b(e),d.setStatus("end");return}let g=c.tls?"secureConnect":"connect";if("sentinels"in c&&c.sentinels&&!c.enableTLSForSentinelMode&&(g="connect"),d.stream=f,c.noDelay&&f.setNoDelay(!0),"number"==typeof c.keepAlive&&(f.connecting?f.once(g,()=>{f.setKeepAlive(!0,c.keepAlive)}):f.setKeepAlive(!0,c.keepAlive)),f.connecting){if(f.once(g,k.connectHandler(d)),c.connectTimeout){let a=!1;f.setTimeout(c.connectTimeout,function(){if(a)return;f.setTimeout(0),f.destroy();let b=Error("connect ETIMEDOUT");b.errorno="ETIMEDOUT",b.code="ETIMEDOUT",b.syscall="connect",k.errorHandler(d)(b)}),f.once(g,function(){a=!0,f.setTimeout(0)})}}else if(f.destroyed){let a=d.connector.firstError;a&&process.nextTick(()=>{k.errorHandler(d)(a)}),process.nextTick(k.closeHandler(d))}else process.nextTick(k.connectHandler(d));f.destroyed||(f.once("error",k.errorHandler(d)),f.once("close",k.closeHandler(d)));let h=function(){d.removeListener("close",i),a()};var i=function(){d.removeListener("ready",h),b(Error(o.CONNECTION_CLOSED_ERROR_MSG))};d.once("ready",h),d.once("close",i)})})}disconnect(a=!1){a||(this.manuallyClosing=!0),this.reconnectTimeout&&!a&&(clearTimeout(this.reconnectTimeout),this.reconnectTimeout=null),"wait"===this.status?k.closeHandler(this)():this.connector.disconnect()}end(){this.disconnect()}duplicate(a){return new v({...this.options,...a})}get mode(){var a;return this.options.monitor?"monitor":(null==(a=this.condition)?void 0:a.subscriber)?"subscriber":"normal"}monitor(a){let b=this.duplicate({monitor:!0,lazyConnect:!1});return(0,f.default)(new Promise(function(a,c){b.once("error",c),b.once("monitoring",function(){a(b)})}),a)}sendCommand(a,b){var c,e;if("wait"===this.status&&this.connect().catch(s.noop),"end"===this.status)return a.reject(Error(o.CONNECTION_CLOSED_ERROR_MSG)),a.promise;if((null==(c=this.condition)?void 0:c.subscriber)&&!h.default.checkFlag("VALID_IN_SUBSCRIBER_MODE",a.name))return a.reject(Error("Connection in subscriber mode, only subscriber commands may be used")),a.promise;"number"==typeof this.options.commandTimeout&&a.setTimeout(this.options.commandTimeout);let f=this.getBlockingTimeoutInMs(a),g="ready"===this.status||!b&&"connect"===this.status&&(0,d.exists)(a.name,{caseInsensitive:!0})&&((0,d.hasFlag)(a.name,"loading",{nameCaseInsensitive:!0})||h.default.checkFlag("HANDSHAKE_COMMANDS",a.name));if(this.stream&&this.stream.writable?this.stream._writableState&&this.stream._writableState.ended&&(g=!1):g=!1,g)u.enabled&&u("write command[%s]: %d -> %s(%o)",this._getDescription(),null==(e=this.condition)?void 0:e.select,a.name,a.args),b?"isPipeline"in b&&b.isPipeline?b.write(a.toWritable(b.destination.redis.stream)):b.write(a.toWritable(b)):this.stream.write(a.toWritable(this.stream)),this.commandQueue.push({command:a,stream:b,select:this.condition.select}),void 0!==f&&a.setBlockingTimeout(f),h.default.checkFlag("WILL_DISCONNECT",a.name)&&(this.manuallyClosing=!0),void 0!==this.options.socketTimeout&&void 0===this.socketTimeoutTimer&&this.setSocketTimeout();else{if(!this.options.enableOfflineQueue)return a.reject(Error("Stream isn't writeable and enableOfflineQueue options is false")),a.promise;if("quit"===a.name&&0===this.offlineQueue.length)return this.disconnect(),a.resolve(Buffer.from("OK")),a.promise;if(u.enabled&&u("queue command[%s]: %d -> %s(%o)",this._getDescription(),this.condition.select,a.name,a.args),this.offlineQueue.push({command:a,stream:b,select:this.condition.select}),h.default.checkFlag("BLOCKING_COMMANDS",a.name)){let b=this.getConfiguredBlockingTimeout();void 0!==b&&a.setBlockingTimeout(b)}}if("select"===a.name&&(0,o.isInt)(a.args[0])){let b=parseInt(a.args[0],10);this.condition.select!==b&&(this.condition.select=b,this.emit("select",b),u("switch to db [%d]",this.condition.select))}return!g||a.isTraced?a.promise:(a.isTraced=!0,(0,p.traceCommand)(()=>a.promise,()=>this._buildCommandContext(a)))}getBlockingTimeoutInMs(a){var b;if(!h.default.checkFlag("BLOCKING_COMMANDS",a.name))return;let c=this.getConfiguredBlockingTimeout();if(void 0===c)return;let d=a.extractBlockingTimeout();return"number"==typeof d?d>0?d+(null!=(b=this.options.blockingTimeoutGrace)?b:l.DEFAULT_REDIS_OPTIONS.blockingTimeoutGrace):c:null===d?c:void 0}getConfiguredBlockingTimeout(){if("number"==typeof this.options.blockingTimeout&&this.options.blockingTimeout>0)return this.options.blockingTimeout}setSocketTimeout(){this.socketTimeoutTimer=setTimeout(()=>{this.stream.destroy(Error(`Socket timeout. Expecting data, but didn't receive any in ${this.options.socketTimeout}ms.`)),this.socketTimeoutTimer=void 0},this.options.socketTimeout),this.stream.once("data",()=>{clearTimeout(this.socketTimeoutTimer),this.socketTimeoutTimer=void 0,0!==this.commandQueue.length&&this.setSocketTimeout()})}scanStream(a){return this.createScanStream("scan",{options:a})}scanBufferStream(a){return this.createScanStream("scanBuffer",{options:a})}sscanStream(a,b){return this.createScanStream("sscan",{key:a,options:b})}sscanBufferStream(a,b){return this.createScanStream("sscanBuffer",{key:a,options:b})}hscanStream(a,b){return this.createScanStream("hscan",{key:a,options:b})}hscanBufferStream(a,b){return this.createScanStream("hscanBuffer",{key:a,options:b})}zscanStream(a,b){return this.createScanStream("zscan",{key:a,options:b})}zscanBufferStream(a,b){return this.createScanStream("zscanBuffer",{key:a,options:b})}silentEmit(a,b){let c;if("error"!==a||(c=b,"end"!==this.status&&(!this.manuallyClosing||!(c instanceof Error)||c.message!==o.CONNECTION_CLOSED_ERROR_MSG&&"connect"!==c.syscall&&"read"!==c.syscall)))return this.listeners(a).length>0?this.emit.apply(this,arguments):(c&&c instanceof Error&&console.error("[ioredis] Unhandled error event:",c.stack),!1)}recoverFromFatalError(a,b,c){this.flushQueue(b,c),this.silentEmit("error",b),this.disconnect(!0)}handleReconnection(a,b){var c;let d=!1;switch(this.options.reconnectOnError&&!h.default.checkFlag("IGNORE_RECONNECT_ON_ERROR",b.command.name)&&(d=this.options.reconnectOnError(a)),d){case 1:case!0:"reconnecting"!==this.status&&this.disconnect(!0),b.command.reject(a);break;case 2:"reconnecting"!==this.status&&this.disconnect(!0),(null==(c=this.condition)?void 0:c.select)!==b.select&&"select"!==b.command.name&&this.select(b.select),this.sendCommand(b.command);break;default:b.command.reject(a)}}_getServerAddress(){return"path"in this.options&&this.options.path?{address:this.options.path,port:void 0}:{address:"host"in this.options&&this.options.host||"localhost",port:"port"in this.options&&this.options.port||6379}}_buildCommandContext(a){var b,c,d;let{address:e,port:f}=this._getServerAddress();return{command:a.name,args:(0,p.sanitizeArgs)(a.name,a.args),database:null!=(d=null!=(c=null==(b=this.condition)?void 0:b.select)?c:this.options.db)?d:0,serverAddress:e,serverPort:f}}_buildBatchContext(a){var b,c,d;let{address:e,port:f}=this._getServerAddress();return{batchMode:"MULTI",batchSize:a,database:null!=(d=null!=(c=null==(b=this.condition)?void 0:b.select)?c:this.options.db)?d:0,serverAddress:e,serverPort:f}}_getDescription(){let a;return a="path"in this.options&&this.options.path?this.options.path:this.stream&&this.stream.remoteAddress&&this.stream.remotePort?this.stream.remoteAddress+":"+this.stream.remotePort:"host"in this.options&&this.options.host?this.options.host+":"+this.options.port:"",this.options.connectionName&&(a+=` (${this.options.connectionName})`),a}resetCommandQueue(){this.commandQueue=new t}resetOfflineQueue(){this.offlineQueue=new t}parseOptions(...a){let b={},c=!1;for(let d=0;d<a.length;++d){let e=a[d];if(null!=e)if("object"==typeof e)(0,s.defaults)(b,e);else if("string"==typeof e)(0,s.defaults)(b,(0,o.parseURL)(e)),e.startsWith("rediss://")&&(c=!0);else if("number"==typeof e)b.port=e;else throw Error("Invalid argument "+e)}c&&(0,s.defaults)(b,{tls:!0}),(0,s.defaults)(b,v.defaultOptions),"string"==typeof b.port&&(b.port=parseInt(b.port,10)),"string"==typeof b.db&&(b.db=parseInt(b.db,10)),this.options=(0,o.resolveTLSProfile)(b)}setStatus(a,b){u.enabled&&u("status[%s]: %s -> %s",this._getDescription(),this.status||"[empty]",a),this.status=a,process.nextTick(this.emit.bind(this,a,b))}createScanStream(a,{key:b,options:c={}}){return new m.default({objectMode:!0,key:b,redis:this,command:a,...c})}flushQueue(a,b){let c;if((b=(0,s.defaults)({},b,{offlineQueue:!0,commandQueue:!0})).offlineQueue)for(;c=this.offlineQueue.shift();)c.command.reject(a);if(b.commandQueue&&this.commandQueue.length>0)for(this.stream&&this.stream.removeAllListeners("data");c=this.commandQueue.shift();)c.command.reject(a)}_readyCheck(a){let b=this;this.info(function(c,d){if(c)return c.message&&c.message.includes("NOPERM")?(console.warn(`Skipping the ready check because INFO command fails: "${c.message}". You can disable ready check with "enableReadyCheck". More: https://github.com/luin/ioredis/wiki/Disable-ready-check.`),a(null,{})):a(c);if("string"!=typeof d)return a(null,d);let e={},f=d.split("\r\n");for(let a=0;a<f.length;++a){let[b,...c]=f[a].split(":"),d=c.join(":");d&&(e[b]=d)}if(e.loading&&"0"!==e.loading){let c=1e3*(e.loading_eta_seconds||1),d=b.options.maxLoadingRetryTime&&b.options.maxLoadingRetryTime<c?b.options.maxLoadingRetryTime:c;u("Redis server still loading, trying again in "+d+"ms"),setTimeout(function(){b._readyCheck(a)},d)}else a(null,e)}).catch(s.noop)}}v.Cluster=g.default,v.Command=h.default,v.defaultOptions=l.DEFAULT_REDIS_OPTIONS,(0,q.default)(v,e.EventEmitter),(0,n.addTransactionSupport)(v.prototype),c.default=v},142318,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c.print=c.ReplyError=c.SentinelIterator=c.SentinelConnector=c.AbstractConnector=c.Pipeline=c.ScanStream=c.Command=c.Cluster=c.Redis=c.default=void 0,c=b.exports=a.r(648956).default;var d=a.r(648956);Object.defineProperty(c,"default",{enumerable:!0,get:function(){return d.default}});var e=a.r(648956);Object.defineProperty(c,"Redis",{enumerable:!0,get:function(){return e.default}});var f=a.r(884301);Object.defineProperty(c,"Cluster",{enumerable:!0,get:function(){return f.default}});var g=a.r(646656);Object.defineProperty(c,"Command",{enumerable:!0,get:function(){return g.default}});var h=a.r(130379);Object.defineProperty(c,"ScanStream",{enumerable:!0,get:function(){return h.default}});var i=a.r(441696);Object.defineProperty(c,"Pipeline",{enumerable:!0,get:function(){return i.default}});var j=a.r(593540);Object.defineProperty(c,"AbstractConnector",{enumerable:!0,get:function(){return j.default}});var k=a.r(640507);Object.defineProperty(c,"SentinelConnector",{enumerable:!0,get:function(){return k.default}}),Object.defineProperty(c,"SentinelIterator",{enumerable:!0,get:function(){return k.SentinelIterator}}),c.ReplyError=a.r(223950).ReplyError,Object.defineProperty(c,"Promise",{get:()=>(console.warn("ioredis v5 does not support plugging third-party Promise library anymore. Native Promise will be used."),Promise),set(a){console.warn("ioredis v5 does not support plugging third-party Promise library anymore. Native Promise will be used.")}}),c.print=function(a,b){a?console.log("Error: "+a):console.log("Reply: "+b)}},666127,(a,b,c)=>{"use strict";let d;Object.defineProperty(c,"__esModule",{value:!0});class e extends Error{}class f extends e{constructor(a){super(`Invalid DateTime: ${a.toMessage()}`)}}class g extends e{constructor(a){super(`Invalid Interval: ${a.toMessage()}`)}}class h extends e{constructor(a){super(`Invalid Duration: ${a.toMessage()}`)}}class i extends e{}class j extends e{constructor(a){super(`Invalid unit ${a}`)}}class k extends e{}class l extends e{constructor(){super("Zone is an abstract class")}}let m="numeric",n="short",o="long",p={year:m,month:m,day:m},q={year:m,month:n,day:m},r={year:m,month:n,day:m,weekday:n},s={year:m,month:o,day:m},t={year:m,month:o,day:m,weekday:o},u={hour:m,minute:m},v={hour:m,minute:m,second:m},w={hour:m,minute:m,second:m,timeZoneName:n},x={hour:m,minute:m,second:m,timeZoneName:o},y={hour:m,minute:m,hourCycle:"h23"},z={hour:m,minute:m,second:m,hourCycle:"h23"},A={hour:m,minute:m,second:m,hourCycle:"h23",timeZoneName:n},B={hour:m,minute:m,second:m,hourCycle:"h23",timeZoneName:o},C={year:m,month:m,day:m,hour:m,minute:m},D={year:m,month:m,day:m,hour:m,minute:m,second:m},E={year:m,month:n,day:m,hour:m,minute:m},F={year:m,month:n,day:m,hour:m,minute:m,second:m},G={year:m,month:n,day:m,weekday:n,hour:m,minute:m},H={year:m,month:o,day:m,hour:m,minute:m,timeZoneName:n},I={year:m,month:o,day:m,hour:m,minute:m,second:m,timeZoneName:n},J={year:m,month:o,day:m,weekday:o,hour:m,minute:m,timeZoneName:o},K={year:m,month:o,day:m,weekday:o,hour:m,minute:m,second:m,timeZoneName:o};class L{get type(){throw new l}get name(){throw new l}get ianaName(){return this.name}get isUniversal(){throw new l}offsetName(a,b){throw new l}formatOffset(a,b){throw new l}offset(a){throw new l}equals(a){throw new l}get isValid(){throw new l}}let M=null;class N extends L{static get instance(){return null===M&&(M=new N),M}get type(){return"system"}get name(){return new Intl.DateTimeFormat().resolvedOptions().timeZone}get isUniversal(){return!1}offsetName(a,{format:b,locale:c}){return a4(a,b,c)}formatOffset(a,b){return a8(this.offset(a),b)}offset(a){return-new Date(a).getTimezoneOffset()}equals(a){return"system"===a.type}get isValid(){return!0}}let O=new Map,P={year:0,month:1,day:2,era:3,hour:4,minute:5,second:6},Q=new Map;class R extends L{static create(a){let b=Q.get(a);return void 0===b&&Q.set(a,b=new R(a)),b}static resetCache(){Q.clear(),O.clear()}static isValidSpecifier(a){return this.isValidZone(a)}static isValidZone(a){if(!a)return!1;try{return new Intl.DateTimeFormat("en-US",{timeZone:a}).format(),!0}catch(a){return!1}}constructor(a){super(),this.zoneName=a,this.valid=R.isValidZone(a)}get type(){return"iana"}get name(){return this.zoneName}get isUniversal(){return!1}offsetName(a,{format:b,locale:c}){return a4(a,b,c,this.name)}formatOffset(a,b){return a8(this.offset(a),b)}offset(a){var b;let c;if(!this.valid)return NaN;let d=new Date(a);if(isNaN(d))return NaN;let e=(b=this.name,void 0===(c=O.get(b))&&(c=new Intl.DateTimeFormat("en-US",{hour12:!1,timeZone:b,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",era:"short"}),O.set(b,c)),c),[f,g,h,i,j,k,l]=e.formatToParts?function(a,b){let c=a.formatToParts(b),d=[];for(let a=0;a<c.length;a++){let{type:b,value:e}=c[a],f=P[b];"era"===b?d[f]=e:aL(f)||(d[f]=parseInt(e,10))}return d}(e,d):function(a,b){let c=a.format(b).replace(/\u200E/g,""),[,d,e,f,g,h,i,j]=/(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(c);return[f,d,e,g,h,i,j]}(e,d);"BC"===i&&(f=-Math.abs(f)+1);let m=a0({year:f,month:g,day:h,hour:24===j?0:j,minute:k,second:l,millisecond:0}),n=+d,o=n%1e3;return(m-(n-=o>=0?o:1e3+o))/6e4}equals(a){return"iana"===a.type&&a.name===this.name}get isValid(){return this.valid}}let S={},T=new Map;function U(a,b={}){let c=JSON.stringify([a,b]),d=T.get(c);return void 0===d&&(d=new Intl.DateTimeFormat(a,b),T.set(c,d)),d}let V=new Map,W=new Map,X=null,Y=new Map;function Z(a){let b=Y.get(a);return void 0===b&&(b=new Intl.DateTimeFormat(a).resolvedOptions(),Y.set(a,b)),b}let $=new Map;function _(a,b,c,d){let e=a.listingMode();return"error"===e?null:"en"===e?c(b):d(b)}class aa{constructor(a,b,c){this.padTo=c.padTo||0,this.floor=c.floor||!1;const{padTo:d,floor:e,...f}=c;if(!b||Object.keys(f).length>0){const b={useGrouping:!1,...c};c.padTo>0&&(b.minimumIntegerDigits=c.padTo),this.inf=function(a,b={}){let c=JSON.stringify([a,b]),d=V.get(c);return void 0===d&&(d=new Intl.NumberFormat(a,b),V.set(c,d)),d}(a,b)}}format(a){if(!this.inf)return aU(this.floor?Math.floor(a):aY(a,3),this.padTo);{let b=this.floor?Math.floor(a):a;return this.inf.format(b)}}}class ab{constructor(a,b,c){let d;if(this.opts=c,this.originalZone=void 0,this.opts.timeZone)this.dt=a;else if("fixed"===a.zone.type){const b=-1*(a.offset/60),c=b>=0?`Etc/GMT+${b}`:`Etc/GMT${b}`;0!==a.offset&&R.create(c).valid?(d=c,this.dt=a):(d="UTC",this.dt=0===a.offset?a:a.setZone("UTC").plus({minutes:a.offset}),this.originalZone=a.zone)}else"system"===a.zone.type?this.dt=a:"iana"===a.zone.type?(this.dt=a,d=a.zone.name):(d="UTC",this.dt=a.setZone("UTC").plus({minutes:a.offset}),this.originalZone=a.zone);const e={...this.opts};e.timeZone=e.timeZone||d,this.dtf=U(b,e)}format(){return this.originalZone?this.formatToParts().map(({value:a})=>a).join(""):this.dtf.format(this.dt.toJSDate())}formatToParts(){let a=this.dtf.formatToParts(this.dt.toJSDate());return this.originalZone?a.map(a=>{if("timeZoneName"!==a.type)return a;{let b=this.originalZone.offsetName(this.dt.ts,{locale:this.dt.locale,format:this.opts.timeZoneName});return{...a,value:b}}}):a}resolvedOptions(){return this.dtf.resolvedOptions()}}class ac{constructor(a,b,c){this.opts={style:"long",...c},!b&&aO()&&(this.rtf=function(a,b={}){let{base:c,...d}=b,e=JSON.stringify([a,d]),f=W.get(e);return void 0===f&&(f=new Intl.RelativeTimeFormat(a,b),W.set(e,f)),f}(a,c))}format(a,b){return this.rtf?this.rtf.format(a,b):function(a,b,c="always",d=!1){let e={years:["year","yr."],quarters:["quarter","qtr."],months:["month","mo."],weeks:["week","wk."],days:["day","day","days"],hours:["hour","hr."],minutes:["minute","min."],seconds:["second","sec."]},f=-1===["hours","minutes","seconds"].indexOf(a);if("auto"===c&&f){let c="days"===a;switch(b){case 1:return c?"tomorrow":`next ${e[a][0]}`;case -1:return c?"yesterday":`last ${e[a][0]}`;case 0:return c?"today":`this ${e[a][0]}`}}let g=Object.is(b,-0)||b<0,h=Math.abs(b),i=1===h,j=e[a],k=d?i?j[1]:j[2]||j[1]:i?e[a][0]:a;return g?`${h} ${k} ago`:`in ${h} ${k}`}(b,a,this.opts.numeric,"long"!==this.opts.style)}formatToParts(a,b){return this.rtf?this.rtf.formatToParts(a,b):[]}}let ad={firstDay:1,minimalDays:4,weekend:[6,7]};class ae{static fromOpts(a){return ae.create(a.locale,a.numberingSystem,a.outputCalendar,a.weekSettings,a.defaultToEN)}static create(a,b,c,d,e=!1){let f=a||aw.defaultLocale;return new ae(f||(e?"en-US":X||(X=new Intl.DateTimeFormat().resolvedOptions().locale)),b||aw.defaultNumberingSystem,c||aw.defaultOutputCalendar,aS(d)||aw.defaultWeekSettings,f)}static resetCache(){X=null,T.clear(),V.clear(),W.clear(),Y.clear(),$.clear()}static fromObject({locale:a,numberingSystem:b,outputCalendar:c,weekSettings:d}={}){return ae.create(a,b,c,d)}constructor(a,b,c,d,e){const[f,g,h]=function(a){let b=a.indexOf("-x-");-1!==b&&(a=a.substring(0,b));let c=a.indexOf("-u-");if(-1===c)return[a];{let b,d;try{b=U(a).resolvedOptions(),d=a}catch(f){let e=a.substring(0,c);b=U(e).resolvedOptions(),d=e}let{numberingSystem:e,calendar:f}=b;return[d,e,f]}}(a);this.locale=f,this.numberingSystem=b||g||null,this.outputCalendar=c||h||null,this.weekSettings=d,this.intl=function(a,b,c){return(c||b)&&(a.includes("-u-")||(a+="-u"),c&&(a+=`-ca-${c}`),b&&(a+=`-nu-${b}`)),a}(this.locale,this.numberingSystem,this.outputCalendar),this.weekdaysCache={format:{},standalone:{}},this.monthsCache={format:{},standalone:{}},this.meridiemCache=null,this.eraCache={},this.specifiedLocale=e,this.fastNumbersCached=null}get fastNumbers(){return null==this.fastNumbersCached&&(this.fastNumbersCached=(!this.numberingSystem||"latn"===this.numberingSystem)&&("latn"===this.numberingSystem||!this.locale||this.locale.startsWith("en")||"latn"===Z(this.locale).numberingSystem)),this.fastNumbersCached}listingMode(){let a=this.isEnglish(),b=(null===this.numberingSystem||"latn"===this.numberingSystem)&&(null===this.outputCalendar||"gregory"===this.outputCalendar);return a&&b?"en":"intl"}clone(a){return a&&0!==Object.getOwnPropertyNames(a).length?ae.create(a.locale||this.specifiedLocale,a.numberingSystem||this.numberingSystem,a.outputCalendar||this.outputCalendar,aS(a.weekSettings)||this.weekSettings,a.defaultToEN||!1):this}redefaultToEN(a={}){return this.clone({...a,defaultToEN:!0})}redefaultToSystem(a={}){return this.clone({...a,defaultToEN:!1})}months(a,b=!1){return _(this,a,bd,()=>{let c="ja"===this.intl||this.intl.startsWith("ja-"),d=(b&=!c)?{month:a,day:"numeric"}:{month:a},e=b?"format":"standalone";if(!this.monthsCache[e][a]){let b=c?a=>this.dtFormatter(a,d).format():a=>this.extract(a,d,"month");this.monthsCache[e][a]=function(a){let b=[];for(let c=1;c<=12;c++){let d=cW.utc(2009,c,1);b.push(a(d))}return b}(b)}return this.monthsCache[e][a]})}weekdays(a,b=!1){return _(this,a,bh,()=>{let c=b?{weekday:a,year:"numeric",month:"long",day:"numeric"}:{weekday:a},d=b?"format":"standalone";return this.weekdaysCache[d][a]||(this.weekdaysCache[d][a]=function(a){let b=[];for(let c=1;c<=7;c++){let d=cW.utc(2016,11,13+c);b.push(a(d))}return b}(a=>this.extract(a,c,"weekday"))),this.weekdaysCache[d][a]})}meridiems(){return _(this,void 0,()=>bi,()=>{if(!this.meridiemCache){let a={hour:"numeric",hourCycle:"h12"};this.meridiemCache=[cW.utc(2016,11,13,9),cW.utc(2016,11,13,19)].map(b=>this.extract(b,a,"dayperiod"))}return this.meridiemCache})}eras(a){return _(this,a,bm,()=>{let b={era:a};return this.eraCache[a]||(this.eraCache[a]=[cW.utc(-40,1,1),cW.utc(2017,1,1)].map(a=>this.extract(a,b,"era"))),this.eraCache[a]})}extract(a,b,c){let d=this.dtFormatter(a,b).formatToParts().find(a=>a.type.toLowerCase()===c);return d?d.value:null}numberFormatter(a={}){return new aa(this.intl,a.forceSimple||this.fastNumbers,a)}dtFormatter(a,b={}){return new ab(a,this.intl,b)}relFormatter(a={}){return new ac(this.intl,this.isEnglish(),a)}listFormatter(a={}){return function(a,b={}){let c=JSON.stringify([a,b]),d=S[c];return d||(d=new Intl.ListFormat(a,b),S[c]=d),d}(this.intl,a)}isEnglish(){return"en"===this.locale||"en-us"===this.locale.toLowerCase()||Z(this.intl).locale.startsWith("en-us")}getWeekSettings(){if(this.weekSettings)return this.weekSettings;if(!aP())return ad;var a=this.locale;let b=$.get(a);if(!b){let c=new Intl.Locale(a);"minimalDays"in(b="getWeekInfo"in c?c.getWeekInfo():c.weekInfo)||(b={...ad,...b}),$.set(a,b)}return b}getStartOfWeek(){return this.getWeekSettings().firstDay}getMinDaysInFirstWeek(){return this.getWeekSettings().minimalDays}getWeekendDays(){return this.getWeekSettings().weekend}equals(a){return this.locale===a.locale&&this.numberingSystem===a.numberingSystem&&this.outputCalendar===a.outputCalendar}toString(){return`Locale(${this.locale}, ${this.numberingSystem}, ${this.outputCalendar})`}}let af=null;class ag extends L{static get utcInstance(){return null===af&&(af=new ag(0)),af}static instance(a){return 0===a?ag.utcInstance:new ag(a)}static parseSpecifier(a){if(a){let b=a.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);if(b)return new ag(a5(b[1],b[2]))}return null}constructor(a){super(),this.fixed=a}get type(){return"fixed"}get name(){return 0===this.fixed?"UTC":`UTC${a8(this.fixed,"narrow")}`}get ianaName(){return 0===this.fixed?"Etc/UTC":`Etc/GMT${a8(-this.fixed,"narrow")}`}offsetName(){return this.name}formatOffset(a,b){return a8(this.fixed,b)}get isUniversal(){return!0}offset(){return this.fixed}equals(a){return"fixed"===a.type&&a.fixed===this.fixed}get isValid(){return!0}}class ah extends L{constructor(a){super(),this.zoneName=a}get type(){return"invalid"}get name(){return this.zoneName}get isUniversal(){return!1}offsetName(){return null}formatOffset(){return""}offset(){return NaN}equals(){return!1}get isValid(){return!1}}function ai(a,b){if(aL(a)||null===a)return b;if(a instanceof L)return a;if("string"==typeof a){let c=a.toLowerCase();return"default"===c?b:"local"===c||"system"===c?N.instance:"utc"===c||"gmt"===c?ag.utcInstance:ag.parseSpecifier(c)||R.create(a)}if(aM(a))return ag.instance(a);if("object"==typeof a&&"offset"in a&&"function"==typeof a.offset)return a;else return new ah(a)}let aj={arab:"[٠-٩]",arabext:"[۰-۹]",bali:"[᭐-᭙]",beng:"[০-৯]",deva:"[०-९]",fullwide:"[０-９]",gujr:"[૦-૯]",hanidec:"[〇|一|二|三|四|五|六|七|八|九]",khmr:"[០-៩]",knda:"[೦-೯]",laoo:"[໐-໙]",limb:"[᥆-᥏]",mlym:"[൦-൯]",mong:"[᠐-᠙]",mymr:"[၀-၉]",orya:"[୦-୯]",tamldec:"[௦-௯]",telu:"[౦-౯]",thai:"[๐-๙]",tibt:"[༠-༩]",latn:"\\d"},ak={arab:[1632,1641],arabext:[1776,1785],bali:[6992,7001],beng:[2534,2543],deva:[2406,2415],fullwide:[65296,65303],gujr:[2790,2799],khmr:[6112,6121],knda:[3302,3311],laoo:[3792,3801],limb:[6470,6479],mlym:[3430,3439],mong:[6160,6169],mymr:[4160,4169],orya:[2918,2927],tamldec:[3046,3055],telu:[3174,3183],thai:[3664,3673],tibt:[3872,3881]},al=aj.hanidec.replace(/[\[|\]]/g,"").split(""),am=new Map;function an({numberingSystem:a},b=""){let c=a||"latn",d=am.get(c);void 0===d&&(d=new Map,am.set(c,d));let e=d.get(b);return void 0===e&&(e=RegExp(`${aj[c]}${b}`),d.set(b,e)),e}let ao=()=>Date.now(),ap="system",aq=null,ar=null,as=null,at=60,au,av=null;class aw{static get now(){return ao}static set now(a){ao=a}static set defaultZone(a){ap=a}static get defaultZone(){return ai(ap,N.instance)}static get defaultLocale(){return aq}static set defaultLocale(a){aq=a}static get defaultNumberingSystem(){return ar}static set defaultNumberingSystem(a){ar=a}static get defaultOutputCalendar(){return as}static set defaultOutputCalendar(a){as=a}static get defaultWeekSettings(){return av}static set defaultWeekSettings(a){av=aS(a)}static get twoDigitCutoffYear(){return at}static set twoDigitCutoffYear(a){at=a%100}static get throwOnInvalid(){return au}static set throwOnInvalid(a){au=a}static resetCaches(){ae.resetCache(),R.resetCache(),cW.resetCache(),am.clear()}}class ax{constructor(a,b){this.reason=a,this.explanation=b}toMessage(){return this.explanation?`${this.reason}: ${this.explanation}`:this.reason}}let ay=[0,31,59,90,120,151,181,212,243,273,304,334],az=[0,31,60,91,121,152,182,213,244,274,305,335];function aA(a,b){return new ax("unit out of range",`you specified ${b} (of type ${typeof b}) as a ${a}, which is invalid`)}function aB(a,b,c){let d=new Date(Date.UTC(a,b-1,c));a<100&&a>=0&&d.setUTCFullYear(d.getUTCFullYear()-1900);let e=d.getUTCDay();return 0===e?7:e}function aC(a,b){let c=aZ(a)?az:ay,d=c.findIndex(a=>a<b),e=b-c[d];return{month:d+1,day:e}}function aD(a,b){return(a-b+7)%7+1}function aE(a,b=4,c=1){let{year:d,month:e,day:f}=a,g=f+(aZ(d)?az:ay)[e-1],h=aD(aB(d,e,f),c),i=Math.floor((g-h+14-b)/7),j;return i<1?i=a2(j=d-1,b,c):i>a2(d,b,c)?(j=d+1,i=1):j=d,{weekYear:j,weekNumber:i,weekday:h,...a9(a)}}function aF(a,b=4,c=1){let{weekYear:d,weekNumber:e,weekday:f}=a,g=aD(aB(d,1,b),c),h=a$(d),i=7*e+f-g-7+b,j;i<1?i+=a$(j=d-1):i>h?(j=d+1,i-=a$(d)):j=d;let{month:k,day:l}=aC(j,i);return{year:j,month:k,day:l,...a9(a)}}function aG(a){let{year:b,month:c,day:d}=a,e=d+(aZ(b)?az:ay)[c-1];return{year:b,ordinal:e,...a9(a)}}function aH(a){let{year:b,ordinal:c}=a,{month:d,day:e}=aC(b,c);return{year:b,month:d,day:e,...a9(a)}}function aI(a,b){if(!(!aL(a.localWeekday)||!aL(a.localWeekNumber)||!aL(a.localWeekYear)))return{minDaysInFirstWeek:4,startOfWeek:1};if(!aL(a.weekday)||!aL(a.weekNumber)||!aL(a.weekYear))throw new i("Cannot mix locale-based week fields with ISO-based week fields");return aL(a.localWeekday)||(a.weekday=a.localWeekday),aL(a.localWeekNumber)||(a.weekNumber=a.localWeekNumber),aL(a.localWeekYear)||(a.weekYear=a.localWeekYear),delete a.localWeekday,delete a.localWeekNumber,delete a.localWeekYear,{minDaysInFirstWeek:b.getMinDaysInFirstWeek(),startOfWeek:b.getStartOfWeek()}}function aJ(a){let b=aN(a.year),c=aT(a.month,1,12),d=aT(a.day,1,a_(a.year,a.month));return b?c?!d&&aA("day",a.day):aA("month",a.month):aA("year",a.year)}function aK(a){let{hour:b,minute:c,second:d,millisecond:e}=a,f=aT(b,0,23)||24===b&&0===c&&0===d&&0===e,g=aT(c,0,59),h=aT(d,0,59),i=aT(e,0,999);return f?g?h?!i&&aA("millisecond",e):aA("second",d):aA("minute",c):aA("hour",b)}function aL(a){return void 0===a}function aM(a){return"number"==typeof a}function aN(a){return"number"==typeof a&&a%1==0}function aO(){try{return"u">typeof Intl&&!!Intl.RelativeTimeFormat}catch(a){return!1}}function aP(){try{return"u">typeof Intl&&!!Intl.Locale&&("weekInfo"in Intl.Locale.prototype||"getWeekInfo"in Intl.Locale.prototype)}catch(a){return!1}}function aQ(a,b,c){if(0!==a.length)return a.reduce((a,d)=>{let e=[b(d),d];return a&&c(a[0],e[0])===a[0]?a:e},null)[1]}function aR(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function aS(a){if(null==a)return null;if("object"!=typeof a)throw new k("Week settings must be an object");if(!aT(a.firstDay,1,7)||!aT(a.minimalDays,1,7)||!Array.isArray(a.weekend)||a.weekend.some(a=>!aT(a,1,7)))throw new k("Invalid week settings");return{firstDay:a.firstDay,minimalDays:a.minimalDays,weekend:Array.from(a.weekend)}}function aT(a,b,c){return aN(a)&&a>=b&&a<=c}function aU(a,b=2){return a<0?"-"+(""+-a).padStart(b,"0"):(""+a).padStart(b,"0")}function aV(a){if(!aL(a)&&null!==a&&""!==a)return parseInt(a,10)}function aW(a){if(!aL(a)&&null!==a&&""!==a)return parseFloat(a)}function aX(a){if(!aL(a)&&null!==a&&""!==a)return Math.floor(1e3*parseFloat("0."+a))}function aY(a,b,c="round"){let d=10**b;switch(c){case"expand":return a>0?Math.ceil(a*d)/d:Math.floor(a*d)/d;case"trunc":return Math.trunc(a*d)/d;case"round":return Math.round(a*d)/d;case"floor":return Math.floor(a*d)/d;case"ceil":return Math.ceil(a*d)/d;default:throw RangeError(`Value rounding ${c} is out of range`)}}function aZ(a){return a%4==0&&(a%100!=0||a%400==0)}function a$(a){return aZ(a)?366:365}function a_(a,b){var c;let d=(c=b-1)-12*Math.floor(c/12)+1;return 2===d?aZ(a+(b-d)/12)?29:28:[31,null,31,30,31,30,31,31,30,31,30,31][d-1]}function a0(a){let b=Date.UTC(a.year,a.month-1,a.day,a.hour,a.minute,a.second,a.millisecond);return a.year<100&&a.year>=0&&(b=new Date(b)).setUTCFullYear(a.year,a.month-1,a.day),+b}function a1(a,b,c){return-aD(aB(a,1,b),c)+b-1}function a2(a,b=4,c=1){let d=a1(a,b,c),e=a1(a+1,b,c);return(a$(a)-d+e)/7}function a3(a){return a>99?a:a>aw.twoDigitCutoffYear?1900+a:2e3+a}function a4(a,b,c,d=null){let e=new Date(a),f={hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"};d&&(f.timeZone=d);let g={timeZoneName:b,...f},h=new Intl.DateTimeFormat(c,g).formatToParts(e).find(a=>"timezonename"===a.type.toLowerCase());return h?h.value:null}function a5(a,b){let c=parseInt(a,10);Number.isNaN(c)&&(c=0);let d=parseInt(b,10)||0,e=c<0||Object.is(c,-0)?-d:d;return 60*c+e}function a6(a){let b=Number(a);if("boolean"==typeof a||""===a||!Number.isFinite(b))throw new k(`Invalid unit value ${a}`);return b}function a7(a,b){let c={};for(let d in a)if(aR(a,d)){let e=a[d];if(null==e)continue;c[b(d)]=a6(e)}return c}function a8(a,b){let c=Math.trunc(Math.abs(a/60)),d=Math.trunc(Math.abs(a%60)),e=a>=0?"+":"-";switch(b){case"short":return`${e}${aU(c,2)}:${aU(d,2)}`;case"narrow":return`${e}${c}${d>0?`:${d}`:""}`;case"techie":return`${e}${aU(c,2)}${aU(d,2)}`;default:throw RangeError(`Value format ${b} is out of range for property format`)}}function a9(a){return["hour","minute","second","millisecond"].reduce((b,c)=>(b[c]=a[c],b),{})}let ba=["January","February","March","April","May","June","July","August","September","October","November","December"],bb=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],bc=["J","F","M","A","M","J","J","A","S","O","N","D"];function bd(a){switch(a){case"narrow":return[...bc];case"short":return[...bb];case"long":return[...ba];case"numeric":return["1","2","3","4","5","6","7","8","9","10","11","12"];case"2-digit":return["01","02","03","04","05","06","07","08","09","10","11","12"];default:return null}}let be=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],bf=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],bg=["M","T","W","T","F","S","S"];function bh(a){switch(a){case"narrow":return[...bg];case"short":return[...bf];case"long":return[...be];case"numeric":return["1","2","3","4","5","6","7"];default:return null}}let bi=["AM","PM"],bj=["Before Christ","Anno Domini"],bk=["BC","AD"],bl=["B","A"];function bm(a){switch(a){case"narrow":return[...bl];case"short":return[...bk];case"long":return[...bj];default:return null}}function bn(a,b){let c="";for(let d of a)d.literal?c+=d.val:c+=b(d.val);return c}let bo={D:p,DD:q,DDD:s,DDDD:t,t:u,tt:v,ttt:w,tttt:x,T:y,TT:z,TTT:A,TTTT:B,f:C,ff:E,fff:H,ffff:J,F:D,FF:F,FFF:I,FFFF:K};class bp{static create(a,b={}){return new bp(a,b)}static parseFormat(a){let b=null,c="",d=!1,e=[];for(let f=0;f<a.length;f++){let g=a.charAt(f);"'"===g?((c.length>0||d)&&e.push({literal:d||/^\s+$/.test(c),val:""===c?"'":c}),b=null,c="",d=!d):d||g===b?c+=g:(c.length>0&&e.push({literal:/^\s+$/.test(c),val:c}),c=g,b=g)}return c.length>0&&e.push({literal:d||/^\s+$/.test(c),val:c}),e}static macroTokenToFormatOpts(a){return bo[a]}constructor(a,b){this.opts=b,this.loc=a,this.systemLoc=null}formatWithSystemDefault(a,b){return null===this.systemLoc&&(this.systemLoc=this.loc.redefaultToSystem()),this.systemLoc.dtFormatter(a,{...this.opts,...b}).format()}dtFormatter(a,b={}){return this.loc.dtFormatter(a,{...this.opts,...b})}formatDateTime(a,b){return this.dtFormatter(a,b).format()}formatDateTimeParts(a,b){return this.dtFormatter(a,b).formatToParts()}formatInterval(a,b){return this.dtFormatter(a.start,b).dtf.formatRange(a.start.toJSDate(),a.end.toJSDate())}resolvedOptions(a,b){return this.dtFormatter(a,b).resolvedOptions()}num(a,b=0,c){if(this.opts.forceSimple)return aU(a,b);let d={...this.opts};return b>0&&(d.padTo=b),c&&(d.signDisplay=c),this.loc.numberFormatter(d).format(a)}formatDateTimeFromString(a,b){let c="en"===this.loc.listingMode(),d=this.loc.outputCalendar&&"gregory"!==this.loc.outputCalendar,e=(b,c)=>this.loc.extract(a,b,c),f=b=>a.isOffsetFixed&&0===a.offset&&b.allowZ?"Z":a.isValid?a.zone.formatOffset(a.ts,b.format):"",g=(b,d)=>c?bd(b)[a.month-1]:e(d?{month:b}:{month:b,day:"numeric"},"month"),h=(b,d)=>c?bh(b)[a.weekday-1]:e(d?{weekday:b}:{weekday:b,month:"long",day:"numeric"},"weekday"),i=b=>{let c=bp.macroTokenToFormatOpts(b);return c?this.formatWithSystemDefault(a,c):b},j=b=>c?bm(b)[a.year<0?0:1]:e({era:b},"era"),k=b=>{switch(b){case"S":return this.num(a.millisecond);case"u":case"SSS":return this.num(a.millisecond,3);case"s":return this.num(a.second);case"ss":return this.num(a.second,2);case"uu":return this.num(Math.floor(a.millisecond/10),2);case"uuu":return this.num(Math.floor(a.millisecond/100));case"m":return this.num(a.minute);case"mm":return this.num(a.minute,2);case"h":return this.num(a.hour%12==0?12:a.hour%12);case"hh":return this.num(a.hour%12==0?12:a.hour%12,2);case"H":return this.num(a.hour);case"HH":return this.num(a.hour,2);case"Z":return f({format:"narrow",allowZ:this.opts.allowZ});case"ZZ":return f({format:"short",allowZ:this.opts.allowZ});case"ZZZ":return f({format:"techie",allowZ:this.opts.allowZ});case"ZZZZ":return a.zone.offsetName(a.ts,{format:"short",locale:this.loc.locale});case"ZZZZZ":return a.zone.offsetName(a.ts,{format:"long",locale:this.loc.locale});case"z":return a.zoneName;case"a":return c?bi[a.hour<12?0:1]:e({hour:"numeric",hourCycle:"h12"},"dayperiod");case"d":return d?e({day:"numeric"},"day"):this.num(a.day);case"dd":return d?e({day:"2-digit"},"day"):this.num(a.day,2);case"c":case"E":return this.num(a.weekday);case"ccc":return h("short",!0);case"cccc":return h("long",!0);case"ccccc":return h("narrow",!0);case"EEE":return h("short",!1);case"EEEE":return h("long",!1);case"EEEEE":return h("narrow",!1);case"L":return d?e({month:"numeric",day:"numeric"},"month"):this.num(a.month);case"LL":return d?e({month:"2-digit",day:"numeric"},"month"):this.num(a.month,2);case"LLL":return g("short",!0);case"LLLL":return g("long",!0);case"LLLLL":return g("narrow",!0);case"M":return d?e({month:"numeric"},"month"):this.num(a.month);case"MM":return d?e({month:"2-digit"},"month"):this.num(a.month,2);case"MMM":return g("short",!1);case"MMMM":return g("long",!1);case"MMMMM":return g("narrow",!1);case"y":return d?e({year:"numeric"},"year"):this.num(a.year);case"yy":return d?e({year:"2-digit"},"year"):this.num(a.year.toString().slice(-2),2);case"yyyy":return d?e({year:"numeric"},"year"):this.num(a.year,4);case"yyyyyy":return d?e({year:"numeric"},"year"):this.num(a.year,6);case"G":return j("short");case"GG":return j("long");case"GGGGG":return j("narrow");case"kk":return this.num(a.weekYear.toString().slice(-2),2);case"kkkk":return this.num(a.weekYear,4);case"W":return this.num(a.weekNumber);case"WW":return this.num(a.weekNumber,2);case"n":return this.num(a.localWeekNumber);case"nn":return this.num(a.localWeekNumber,2);case"ii":return this.num(a.localWeekYear.toString().slice(-2),2);case"iiii":return this.num(a.localWeekYear,4);case"o":return this.num(a.ordinal);case"ooo":return this.num(a.ordinal,3);case"q":return this.num(a.quarter);case"qq":return this.num(a.quarter,2);case"X":return this.num(Math.floor(a.ts/1e3));case"x":return this.num(a.ts);default:return i(b)}};return bn(bp.parseFormat(b),k)}formatDurationFromString(a,b){let c="negativeLargestOnly"===this.opts.signMode?-1:1,d=a=>{switch(a[0]){case"S":return"milliseconds";case"s":return"seconds";case"m":return"minutes";case"h":return"hours";case"d":return"days";case"w":return"weeks";case"M":return"months";case"y":return"years";default:return null}},e=(a,b)=>e=>{let f=d(e);if(!f)return e;{let d,g=b.isNegativeDuration&&f!==b.largestUnit?c:1;return d="negativeLargestOnly"===this.opts.signMode&&f!==b.largestUnit?"never":"all"===this.opts.signMode?"always":"auto",this.num(a.get(f)*g,e.length,d)}},f=bp.parseFormat(b),g=f.reduce((a,{literal:b,val:c})=>b?a:a.concat(c),[]),h=a.shiftTo(...g.map(d).filter(a=>a)),i={isNegativeDuration:h<0,largestUnit:Object.keys(h.values)[0]};return bn(f,e(h,i))}}let bq=/[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;function br(...a){let b=a.reduce((a,b)=>a+b.source,"");return RegExp(`^${b}$`)}function bs(...a){return b=>a.reduce(([a,c,d],e)=>{let[f,g,h]=e(b,d);return[{...a,...f},g||c,h]},[{},null,1]).slice(0,2)}function bt(a,...b){if(null==a)return[null,null];for(let[c,d]of b){let b=c.exec(a);if(b)return d(b)}return[null,null]}function bu(...a){return(b,c)=>{let d,e={};for(d=0;d<a.length;d++)e[a[d]]=aV(b[c+d]);return[e,null,c+d]}}let bv=/(?:([Zz])|([+-]\d\d)(?::?(\d\d))?)/,bw=`(?:${bv.source}?(?:\\[(${bq.source})\\])?)?`,bx=/(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/,by=RegExp(`${bx.source}${bw}`),bz=RegExp(`(?:[Tt]${by.source})?`),bA=bu("weekYear","weekNumber","weekDay"),bB=bu("year","ordinal"),bC=RegExp(`${bx.source} ?(?:${bv.source}|(${bq.source}))?`),bD=RegExp(`(?: ${bC.source})?`);function bE(a,b,c){let d=a[b];return aL(d)?c:aV(d)}function bF(a,b){return[{hours:bE(a,b,0),minutes:bE(a,b+1,0),seconds:bE(a,b+2,0),milliseconds:aX(a[b+3])},null,b+4]}function bG(a,b){let c=!a[b]&&!a[b+1],d=a5(a[b+1],a[b+2]);return[{},c?null:ag.instance(d),b+3]}function bH(a,b){return[{},a[b]?R.create(a[b]):null,b+1]}let bI=RegExp(`^T?${bx.source}$`),bJ=/^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;function bK(a){let[b,c,d,e,f,g,h,i,j]=a,k="-"===b[0],l=i&&"-"===i[0],m=(a,b=!1)=>void 0!==a&&(b||a&&k)?-a:a;return[{years:m(aW(c)),months:m(aW(d)),weeks:m(aW(e)),days:m(aW(f)),hours:m(aW(g)),minutes:m(aW(h)),seconds:m(aW(i),"-0"===i),milliseconds:m(aX(j),l)}]}let bL={GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};function bM(a,b,c,d,e,f,g){let h={year:2===b.length?a3(aV(b)):aV(b),month:bb.indexOf(c)+1,day:aV(d),hour:aV(e),minute:aV(f)};return g&&(h.second=aV(g)),a&&(h.weekday=a.length>3?be.indexOf(a)+1:bf.indexOf(a)+1),h}let bN=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;function bO(a){let[,b,c,d,e,f,g,h,i,j,k,l]=a;return[bM(b,e,d,c,f,g,h),new ag(i?bL[i]:j?0:a5(k,l))]}let bP=/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/,bQ=/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/,bR=/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;function bS(a){let[,b,c,d,e,f,g,h]=a;return[bM(b,e,d,c,f,g,h),ag.utcInstance]}function bT(a){let[,b,c,d,e,f,g,h]=a;return[bM(b,h,c,d,e,f,g),ag.utcInstance]}let bU=br(/([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/,bz),bV=br(/(\d{4})-?W(\d\d)(?:-?(\d))?/,bz),bW=br(/(\d{4})-?(\d{3})/,bz),bX=br(by),bY=bs(function(a,b){return[{year:bE(a,b),month:bE(a,b+1,1),day:bE(a,b+2,1)},null,b+3]},bF,bG,bH),bZ=bs(bA,bF,bG,bH),b$=bs(bB,bF,bG,bH),b_=bs(bF,bG,bH),b0=bs(bF),b1=br(/(\d{4})-(\d\d)-(\d\d)/,bD),b2=br(bC),b3=bs(bF,bG,bH),b4="Invalid Duration",b5={weeks:{days:7,hours:168,minutes:10080,seconds:604800,milliseconds:6048e5},days:{hours:24,minutes:1440,seconds:86400,milliseconds:864e5},hours:{minutes:60,seconds:3600,milliseconds:36e5},minutes:{seconds:60,milliseconds:6e4},seconds:{milliseconds:1e3}},b6={years:{quarters:4,months:12,weeks:52,days:365,hours:8760,minutes:525600,seconds:31536e3,milliseconds:31536e6},quarters:{months:3,weeks:13,days:91,hours:2184,minutes:131040,seconds:7862400,milliseconds:78624e5},months:{weeks:4,days:30,hours:720,minutes:43200,seconds:2592e3,milliseconds:2592e6},...b5},b7={years:{quarters:4,months:12,weeks:52.1775,days:365.2425,hours:8765.82,minutes:525949.2,seconds:0x1e18558,milliseconds:31556952e3},quarters:{months:3,weeks:13.044375,days:91.310625,hours:2191.455,minutes:131487.3,seconds:7889238,milliseconds:7889238e3},months:{weeks:30.436875/7,days:30.436875,hours:730.485,minutes:43829.1,seconds:2629746,milliseconds:2629746e3},...b5},b8=["years","quarters","months","weeks","days","hours","minutes","seconds","milliseconds"],b9=b8.slice(0).reverse();function ca(a,b,c=!1){return new ce({values:c?b.values:{...a.values,...b.values||{}},loc:a.loc.clone(b.loc),conversionAccuracy:b.conversionAccuracy||a.conversionAccuracy,matrix:b.matrix||a.matrix})}function cb(a,b){var c;let d=null!=(c=b.milliseconds)?c:0;for(let c of b9.slice(1))b[c]&&(d+=b[c]*a[c].milliseconds);return d}function cc(a,b){let c=0>cb(a,b)?-1:1;b8.reduceRight((d,e)=>{if(aL(b[e]))return d;if(d){let f=b[d]*c,g=a[e][d],h=Math.floor(f/g);b[e]+=h*c,b[d]-=h*g*c}return e},null),b8.reduce((c,d)=>{if(aL(b[d]))return c;if(c){let e=b[c]%1;b[c]-=e,b[d]+=e*a[c][d]}return d},null)}function cd(a){let b={};for(let[c,d]of Object.entries(a))0!==d&&(b[c]=d);return b}class ce{constructor(a){const b="longterm"===a.conversionAccuracy;let c=b?b7:b6;a.matrix&&(c=a.matrix),this.values=a.values,this.loc=a.loc||ae.create(),this.conversionAccuracy=b?"longterm":"casual",this.invalid=a.invalid||null,this.matrix=c,this.isLuxonDuration=!0}static fromMillis(a,b){return ce.fromObject({milliseconds:a},b)}static fromObject(a,b={}){if(null==a||"object"!=typeof a)throw new k(`Duration.fromObject: argument expected to be an object, got ${null===a?"null":typeof a}`);return new ce({values:a7(a,ce.normalizeUnit),loc:ae.fromObject(b),conversionAccuracy:b.conversionAccuracy,matrix:b.matrix})}static fromDurationLike(a){if(aM(a))return ce.fromMillis(a);if(ce.isDuration(a))return a;if("object"==typeof a)return ce.fromObject(a);throw new k(`Unknown duration argument ${a} of type ${typeof a}`)}static fromISO(a,b){let[c]=bt(a,[bJ,bK]);return c?ce.fromObject(c,b):ce.invalid("unparsable",`the input "${a}" can't be parsed as ISO 8601`)}static fromISOTime(a,b){let[c]=bt(a,[bI,b0]);return c?ce.fromObject(c,b):ce.invalid("unparsable",`the input "${a}" can't be parsed as ISO 8601`)}static invalid(a,b=null){if(!a)throw new k("need to specify a reason the Duration is invalid");let c=a instanceof ax?a:new ax(a,b);if(!aw.throwOnInvalid)return new ce({invalid:c});throw new h(c)}static normalizeUnit(a){let b={year:"years",years:"years",quarter:"quarters",quarters:"quarters",month:"months",months:"months",week:"weeks",weeks:"weeks",day:"days",days:"days",hour:"hours",hours:"hours",minute:"minutes",minutes:"minutes",second:"seconds",seconds:"seconds",millisecond:"milliseconds",milliseconds:"milliseconds"}[a?a.toLowerCase():a];if(!b)throw new j(a);return b}static isDuration(a){return a&&a.isLuxonDuration||!1}get locale(){return this.isValid?this.loc.locale:null}get numberingSystem(){return this.isValid?this.loc.numberingSystem:null}toFormat(a,b={}){let c={...b,floor:!1!==b.round&&!1!==b.floor};return this.isValid?bp.create(this.loc,c).formatDurationFromString(this,a):b4}toHuman(a={}){if(!this.isValid)return b4;let b=!1!==a.showZeros,c=b8.map(c=>{let d=this.values[c];return aL(d)||0===d&&!b?null:this.loc.numberFormatter({style:"unit",unitDisplay:"long",...a,unit:c.slice(0,-1)}).format(d)}).filter(a=>a);return this.loc.listFormatter({type:"conjunction",style:a.listStyle||"narrow",...a}).format(c)}toObject(){return this.isValid?{...this.values}:{}}toISO(){if(!this.isValid)return null;let a="P";return 0!==this.years&&(a+=this.years+"Y"),(0!==this.months||0!==this.quarters)&&(a+=this.months+3*this.quarters+"M"),0!==this.weeks&&(a+=this.weeks+"W"),0!==this.days&&(a+=this.days+"D"),(0!==this.hours||0!==this.minutes||0!==this.seconds||0!==this.milliseconds)&&(a+="T"),0!==this.hours&&(a+=this.hours+"H"),0!==this.minutes&&(a+=this.minutes+"M"),(0!==this.seconds||0!==this.milliseconds)&&(a+=aY(this.seconds+this.milliseconds/1e3,3)+"S"),"P"===a&&(a+="T0S"),a}toISOTime(a={}){if(!this.isValid)return null;let b=this.toMillis();return b<0||b>=864e5?null:(a={suppressMilliseconds:!1,suppressSeconds:!1,includePrefix:!1,format:"extended",...a,includeOffset:!1},cW.fromMillis(b,{zone:"UTC"}).toISOTime(a))}toJSON(){return this.toISO()}toString(){return this.toISO()}[Symbol.for("nodejs.util.inspect.custom")](){return this.isValid?`Duration { values: ${JSON.stringify(this.values)} }`:`Duration { Invalid, reason: ${this.invalidReason} }`}toMillis(){return this.isValid?cb(this.matrix,this.values):NaN}valueOf(){return this.toMillis()}plus(a){if(!this.isValid)return this;let b=ce.fromDurationLike(a),c={};for(let a of b8)(aR(b.values,a)||aR(this.values,a))&&(c[a]=b.get(a)+this.get(a));return ca(this,{values:c},!0)}minus(a){if(!this.isValid)return this;let b=ce.fromDurationLike(a);return this.plus(b.negate())}mapUnits(a){if(!this.isValid)return this;let b={};for(let c of Object.keys(this.values))b[c]=a6(a(this.values[c],c));return ca(this,{values:b},!0)}get(a){return this[ce.normalizeUnit(a)]}set(a){return this.isValid?ca(this,{values:{...this.values,...a7(a,ce.normalizeUnit)}}):this}reconfigure({locale:a,numberingSystem:b,conversionAccuracy:c,matrix:d}={}){return ca(this,{loc:this.loc.clone({locale:a,numberingSystem:b}),matrix:d,conversionAccuracy:c})}as(a){return this.isValid?this.shiftTo(a).get(a):NaN}normalize(){if(!this.isValid)return this;let a=this.toObject();return cc(this.matrix,a),ca(this,{values:a},!0)}rescale(){return this.isValid?ca(this,{values:cd(this.normalize().shiftToAll().toObject())},!0):this}shiftTo(...a){let b;if(!this.isValid||0===a.length)return this;a=a.map(a=>ce.normalizeUnit(a));let c={},d={},e=this.toObject();for(let f of b8)if(a.indexOf(f)>=0){b=f;let a=0;for(let b in d)a+=this.matrix[b][f]*d[b],d[b]=0;aM(e[f])&&(a+=e[f]);let g=Math.trunc(a);c[f]=g,d[f]=(1e3*a-1e3*g)/1e3}else aM(e[f])&&(d[f]=e[f]);for(let a in d)0!==d[a]&&(c[b]+=a===b?d[a]:d[a]/this.matrix[b][a]);return cc(this.matrix,c),ca(this,{values:c},!0)}shiftToAll(){return this.isValid?this.shiftTo("years","months","weeks","days","hours","minutes","seconds","milliseconds"):this}negate(){if(!this.isValid)return this;let a={};for(let b of Object.keys(this.values))a[b]=0===this.values[b]?0:-this.values[b];return ca(this,{values:a},!0)}removeZeros(){return this.isValid?ca(this,{values:cd(this.values)},!0):this}get years(){return this.isValid?this.values.years||0:NaN}get quarters(){return this.isValid?this.values.quarters||0:NaN}get months(){return this.isValid?this.values.months||0:NaN}get weeks(){return this.isValid?this.values.weeks||0:NaN}get days(){return this.isValid?this.values.days||0:NaN}get hours(){return this.isValid?this.values.hours||0:NaN}get minutes(){return this.isValid?this.values.minutes||0:NaN}get seconds(){return this.isValid?this.values.seconds||0:NaN}get milliseconds(){return this.isValid?this.values.milliseconds||0:NaN}get isValid(){return null===this.invalid}get invalidReason(){return this.invalid?this.invalid.reason:null}get invalidExplanation(){return this.invalid?this.invalid.explanation:null}equals(a){if(!this.isValid||!a.isValid||!this.loc.equals(a.loc))return!1;for(let d of b8){var b,c;if(b=this.values[d],c=a.values[d],void 0===b||0===b?void 0!==c&&0!==c:b!==c)return!1}return!0}}let cf="Invalid Interval";class cg{constructor(a){this.s=a.start,this.e=a.end,this.invalid=a.invalid||null,this.isLuxonInterval=!0}static invalid(a,b=null){if(!a)throw new k("need to specify a reason the Interval is invalid");let c=a instanceof ax?a:new ax(a,b);if(!aw.throwOnInvalid)return new cg({invalid:c});throw new g(c)}static fromDateTimes(a,b){var c,d;let e=cX(a),f=cX(b),g=(c=e,d=f,c&&c.isValid?d&&d.isValid?d<c?cg.invalid("end before start",`The end of an interval must be after its start, but you had start=${c.toISO()} and end=${d.toISO()}`):null:cg.invalid("missing or invalid end"):cg.invalid("missing or invalid start"));return null==g?new cg({start:e,end:f}):g}static after(a,b){let c=ce.fromDurationLike(b),d=cX(a);return cg.fromDateTimes(d,d.plus(c))}static before(a,b){let c=ce.fromDurationLike(b),d=cX(a);return cg.fromDateTimes(d.minus(c),d)}static fromISO(a,b){let[c,d]=(a||"").split("/",2);if(c&&d){let a,e,f,g;try{e=(a=cW.fromISO(c,b)).isValid}catch(a){e=!1}try{g=(f=cW.fromISO(d,b)).isValid}catch(a){g=!1}if(e&&g)return cg.fromDateTimes(a,f);if(e){let c=ce.fromISO(d,b);if(c.isValid)return cg.after(a,c)}else if(g){let a=ce.fromISO(c,b);if(a.isValid)return cg.before(f,a)}}return cg.invalid("unparsable",`the input "${a}" can't be parsed as ISO 8601`)}static isInterval(a){return a&&a.isLuxonInterval||!1}get start(){return this.isValid?this.s:null}get end(){return this.isValid?this.e:null}get lastDateTime(){return this.isValid&&this.e?this.e.minus(1):null}get isValid(){return null===this.invalidReason}get invalidReason(){return this.invalid?this.invalid.reason:null}get invalidExplanation(){return this.invalid?this.invalid.explanation:null}length(a="milliseconds"){return this.isValid?this.toDuration(a).get(a):NaN}count(a="milliseconds",b){let c;if(!this.isValid)return NaN;let d=this.start.startOf(a,b);return Math.floor((c=(c=null!=b&&b.useLocaleWeeks?this.end.reconfigure({locale:d.locale}):this.end).startOf(a,b)).diff(d,a).get(a))+(c.valueOf()!==this.end.valueOf())}hasSame(a){return!!this.isValid&&(this.isEmpty()||this.e.minus(1).hasSame(this.s,a))}isEmpty(){return this.s.valueOf()===this.e.valueOf()}isAfter(a){return!!this.isValid&&this.s>a}isBefore(a){return!!this.isValid&&this.e<=a}contains(a){return!!this.isValid&&this.s<=a&&this.e>a}set({start:a,end:b}={}){return this.isValid?cg.fromDateTimes(a||this.s,b||this.e):this}splitAt(...a){if(!this.isValid)return[];let b=a.map(cX).filter(a=>this.contains(a)).sort((a,b)=>a.toMillis()-b.toMillis()),c=[],{s:d}=this,e=0;for(;d<this.e;){let a=b[e]||this.e,f=+a>+this.e?this.e:a;c.push(cg.fromDateTimes(d,f)),d=f,e+=1}return c}splitBy(a){let b=ce.fromDurationLike(a);if(!this.isValid||!b.isValid||0===b.as("milliseconds"))return[];let{s:c}=this,d=1,e,f=[];for(;c<this.e;){let a=this.start.plus(b.mapUnits(a=>a*d));e=+a>+this.e?this.e:a,f.push(cg.fromDateTimes(c,e)),c=e,d+=1}return f}divideEqually(a){return this.isValid?this.splitBy(this.length()/a).slice(0,a):[]}overlaps(a){return this.e>a.s&&this.s<a.e}abutsStart(a){return!!this.isValid&&+this.e==+a.s}abutsEnd(a){return!!this.isValid&&+a.e==+this.s}engulfs(a){return!!this.isValid&&this.s<=a.s&&this.e>=a.e}equals(a){return!!this.isValid&&!!a.isValid&&this.s.equals(a.s)&&this.e.equals(a.e)}intersection(a){if(!this.isValid)return this;let b=this.s>a.s?this.s:a.s,c=this.e<a.e?this.e:a.e;return b>=c?null:cg.fromDateTimes(b,c)}union(a){if(!this.isValid)return this;let b=this.s<a.s?this.s:a.s,c=this.e>a.e?this.e:a.e;return cg.fromDateTimes(b,c)}static merge(a){let[b,c]=a.sort((a,b)=>a.s-b.s).reduce(([a,b],c)=>b?b.overlaps(c)||b.abutsStart(c)?[a,b.union(c)]:[a.concat([b]),c]:[a,c],[[],null]);return c&&b.push(c),b}static xor(a){let b=null,c=0,d=[],e=a.map(a=>[{time:a.s,type:"s"},{time:a.e,type:"e"}]);for(let a of Array.prototype.concat(...e).sort((a,b)=>a.time-b.time))1===(c+="s"===a.type?1:-1)?b=a.time:(b&&+b!=+a.time&&d.push(cg.fromDateTimes(b,a.time)),b=null);return cg.merge(d)}difference(...a){return cg.xor([this].concat(a)).map(a=>this.intersection(a)).filter(a=>a&&!a.isEmpty())}toString(){return this.isValid?`[${this.s.toISO()} – ${this.e.toISO()})`:cf}[Symbol.for("nodejs.util.inspect.custom")](){return this.isValid?`Interval { start: ${this.s.toISO()}, end: ${this.e.toISO()} }`:`Interval { Invalid, reason: ${this.invalidReason} }`}toLocaleString(a=p,b={}){return this.isValid?bp.create(this.s.loc.clone(b),a).formatInterval(this):cf}toISO(a){return this.isValid?`${this.s.toISO(a)}/${this.e.toISO(a)}`:cf}toISODate(){return this.isValid?`${this.s.toISODate()}/${this.e.toISODate()}`:cf}toISOTime(a){return this.isValid?`${this.s.toISOTime(a)}/${this.e.toISOTime(a)}`:cf}toFormat(a,{separator:b=" – "}={}){return this.isValid?`${this.s.toFormat(a)}${b}${this.e.toFormat(a)}`:cf}toDuration(a,b){return this.isValid?this.e.diff(this.s,a,b):ce.invalid(this.invalidReason)}mapEndpoints(a){return cg.fromDateTimes(a(this.s),a(this.e))}}class ch{static hasDST(a=aw.defaultZone){let b=cW.now().setZone(a).set({month:12});return!a.isUniversal&&b.offset!==b.set({month:6}).offset}static isValidIANAZone(a){return R.isValidZone(a)}static normalizeZone(a){return ai(a,aw.defaultZone)}static getStartOfWeek({locale:a=null,locObj:b=null}={}){return(b||ae.create(a)).getStartOfWeek()}static getMinimumDaysInFirstWeek({locale:a=null,locObj:b=null}={}){return(b||ae.create(a)).getMinDaysInFirstWeek()}static getWeekendWeekdays({locale:a=null,locObj:b=null}={}){return(b||ae.create(a)).getWeekendDays().slice()}static months(a="long",{locale:b=null,numberingSystem:c=null,locObj:d=null,outputCalendar:e="gregory"}={}){return(d||ae.create(b,c,e)).months(a)}static monthsFormat(a="long",{locale:b=null,numberingSystem:c=null,locObj:d=null,outputCalendar:e="gregory"}={}){return(d||ae.create(b,c,e)).months(a,!0)}static weekdays(a="long",{locale:b=null,numberingSystem:c=null,locObj:d=null}={}){return(d||ae.create(b,c,null)).weekdays(a)}static weekdaysFormat(a="long",{locale:b=null,numberingSystem:c=null,locObj:d=null}={}){return(d||ae.create(b,c,null)).weekdays(a,!0)}static meridiems({locale:a=null}={}){return ae.create(a).meridiems()}static eras(a="short",{locale:b=null}={}){return ae.create(b,null,"gregory").eras(a)}static features(){return{relative:aO(),localeWeek:aP()}}}function ci(a,b){let c=a=>a.toUTC(0,{keepLocalTime:!0}).startOf("day").valueOf(),d=c(b)-c(a);return Math.floor(ce.fromMillis(d).as("days"))}function cj(a,b=a=>a){return{regex:a,deser:([a])=>b(function(a){let b=parseInt(a,10);if(!isNaN(b))return b;b="";for(let c=0;c<a.length;c++){let d=a.charCodeAt(c);if(-1!==a[c].search(aj.hanidec))b+=al.indexOf(a[c]);else for(let a in ak){let[c,e]=ak[a];d>=c&&d<=e&&(b+=d-c)}}return parseInt(b,10)}(a))}}let ck=String.fromCharCode(160),cl=`[ ${ck}]`,cm=RegExp(cl,"g");function cn(a){return a.replace(/\./g,"\\.?").replace(cm,cl)}function co(a){return a.replace(/\./g,"").replace(cm," ").toLowerCase()}function cp(a,b){return null===a?null:{regex:RegExp(a.map(cn).join("|")),deser:([c])=>a.findIndex(a=>co(c)===co(a))+b}}function cq(a,b){return{regex:a,deser:([,a,b])=>a5(a,b),groups:b}}function cr(a){return{regex:a,deser:([a])=>a}}let cs={year:{"2-digit":"yy",numeric:"yyyyy"},month:{numeric:"M","2-digit":"MM",short:"MMM",long:"MMMM"},day:{numeric:"d","2-digit":"dd"},weekday:{short:"EEE",long:"EEEE"},dayperiod:"a",dayPeriod:"a",hour12:{numeric:"h","2-digit":"hh"},hour24:{numeric:"H","2-digit":"HH"},minute:{numeric:"m","2-digit":"mm"},second:{numeric:"s","2-digit":"ss"},timeZoneName:{long:"ZZZZZ",short:"ZZZ"}},ct=null;function cu(a,b){return Array.prototype.concat(...a.map(a=>(function(a,b){if(a.literal)return a;let c=cx(bp.macroTokenToFormatOpts(a.val),b);return null==c||c.includes(void 0)?a:c})(a,b)))}class cv{constructor(a,b){if(this.locale=a,this.format=b,this.tokens=cu(bp.parseFormat(b),a),this.units=this.tokens.map(b=>{let c,d,e,f,g,h,i,j,k,l,m,n,o;return c=an(a),d=an(a,"{2}"),e=an(a,"{3}"),f=an(a,"{4}"),g=an(a,"{6}"),h=an(a,"{1,2}"),i=an(a,"{1,3}"),j=an(a,"{1,6}"),k=an(a,"{1,9}"),l=an(a,"{2,4}"),m=an(a,"{4,6}"),n=a=>({regex:RegExp(a.val.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")),deser:([a])=>a,literal:!0}),(o=(o=>{if(b.literal)return n(o);switch(o.val){case"G":return cp(a.eras("short"),0);case"GG":return cp(a.eras("long"),0);case"y":return cj(j);case"yy":case"kk":return cj(l,a3);case"yyyy":case"kkkk":return cj(f);case"yyyyy":return cj(m);case"yyyyyy":return cj(g);case"M":case"L":case"d":case"H":case"h":case"m":case"q":case"s":case"W":return cj(h);case"MM":case"LL":case"dd":case"HH":case"hh":case"mm":case"qq":case"ss":case"WW":return cj(d);case"MMM":return cp(a.months("short",!0),1);case"MMMM":return cp(a.months("long",!0),1);case"LLL":return cp(a.months("short",!1),1);case"LLLL":return cp(a.months("long",!1),1);case"o":case"S":return cj(i);case"ooo":case"SSS":return cj(e);case"u":return cr(k);case"uu":return cr(h);case"uuu":case"E":case"c":return cj(c);case"a":return cp(a.meridiems(),0);case"EEE":return cp(a.weekdays("short",!1),1);case"EEEE":return cp(a.weekdays("long",!1),1);case"ccc":return cp(a.weekdays("short",!0),1);case"cccc":return cp(a.weekdays("long",!0),1);case"Z":case"ZZ":return cq(RegExp(`([+-]${h.source})(?::(${d.source}))?`),2);case"ZZZ":return cq(RegExp(`([+-]${h.source})(${d.source})?`),2);case"z":return cr(/[a-z_+-/]{1,256}?/i);case" ":return cr(/[^\S\n\r]/);default:return n(o)}})(b)||{invalidReason:"missing Intl.DateTimeFormat.formatToParts support"}).token=b,o}),this.disqualifyingUnit=this.units.find(a=>a.invalidReason),!this.disqualifyingUnit){const[a,b]=function(a){let b=a.map(a=>a.regex).reduce((a,b)=>`${a}(${b.source})`,"");return[`^${b}$`,a]}(this.units);this.regex=RegExp(a,"i"),this.handlers=b}}explainFromTokens(a){if(!this.isValid)return{input:a,tokens:this.tokens,invalidReason:this.invalidReason};{let b,c,[d,e]=function(a,b,c){let d=a.match(b);if(!d)return[d,{}];{let a={},b=1;for(let e in c)if(aR(c,e)){let f=c[e],g=f.groups?f.groups+1:1;!f.literal&&f.token&&(a[f.token.val[0]]=f.deser(d.slice(b,b+g))),b+=g}return[d,a]}}(a,this.regex,this.handlers),[f,g,h]=e?(c=null,aL(e.z)||(c=R.create(e.z)),aL(e.Z)||(c||(c=new ag(e.Z)),b=e.Z),aL(e.q)||(e.M=(e.q-1)*3+1),aL(e.h)||(e.h<12&&1===e.a?e.h+=12:12===e.h&&0===e.a&&(e.h=0)),0===e.G&&e.y&&(e.y=-e.y),aL(e.u)||(e.S=aX(e.u)),[Object.keys(e).reduce((a,b)=>{let c=(a=>{switch(a){case"S":return"millisecond";case"s":return"second";case"m":return"minute";case"h":case"H":return"hour";case"d":return"day";case"o":return"ordinal";case"L":case"M":return"month";case"y":return"year";case"E":case"c":return"weekday";case"W":return"weekNumber";case"k":return"weekYear";case"q":return"quarter";default:return null}})(b);return c&&(a[c]=e[b]),a},{}),c,b]):[null,null,void 0];if(aR(e,"a")&&aR(e,"H"))throw new i("Can't include meridiem when specifying 24-hour format");return{input:a,tokens:this.tokens,regex:this.regex,rawMatches:d,matches:e,result:f,zone:g,specificOffset:h}}}get isValid(){return!this.disqualifyingUnit}get invalidReason(){return this.disqualifyingUnit?this.disqualifyingUnit.invalidReason:null}}function cw(a,b,c){return new cv(a,c).explainFromTokens(b)}function cx(a,b){if(!a)return null;let c=bp.create(b,a).dtFormatter((ct||(ct=cW.fromMillis(0x16a2e5618e3)),ct)),d=c.formatToParts(),e=c.resolvedOptions();return d.map(b=>(function(a,b,c){let{type:d,value:e}=a;if("literal"===d){let a=/^\s+$/.test(e);return{literal:!a,val:a?" ":e}}let f=b[d],g=d;"hour"===d&&(g=null!=b.hour12?b.hour12?"hour12":"hour24":null!=b.hourCycle?"h11"===b.hourCycle||"h12"===b.hourCycle?"hour12":"hour24":c.hour12?"hour12":"hour24");let h=cs[g];if("object"==typeof h&&(h=h[f]),h)return{literal:!1,val:h}})(b,a,e))}let cy="Invalid DateTime";function cz(a){return new ax("unsupported zone",`the zone "${a.name}" is not supported`)}function cA(a){return null===a.weekData&&(a.weekData=aE(a.c)),a.weekData}function cB(a){return null===a.localWeekData&&(a.localWeekData=aE(a.c,a.loc.getMinDaysInFirstWeek(),a.loc.getStartOfWeek())),a.localWeekData}function cC(a,b){let c={ts:a.ts,zone:a.zone,c:a.c,o:a.o,loc:a.loc,invalid:a.invalid};return new cW({...c,...b,old:c})}function cD(a,b,c){let d=a-60*b*1e3,e=c.offset(d);if(b===e)return[d,b];d-=(e-b)*6e4;let f=c.offset(d);return e===f?[d,e]:[a-60*Math.min(e,f)*1e3,Math.max(e,f)]}function cE(a,b){let c=new Date(a+=60*b*1e3);return{year:c.getUTCFullYear(),month:c.getUTCMonth()+1,day:c.getUTCDate(),hour:c.getUTCHours(),minute:c.getUTCMinutes(),second:c.getUTCSeconds(),millisecond:c.getUTCMilliseconds()}}function cF(a,b){let c=a.o,d=a.c.year+Math.trunc(b.years),e=a.c.month+Math.trunc(b.months)+3*Math.trunc(b.quarters),f={...a.c,year:d,month:e,day:Math.min(a.c.day,a_(d,e))+Math.trunc(b.days)+7*Math.trunc(b.weeks)},g=ce.fromObject({years:b.years-Math.trunc(b.years),quarters:b.quarters-Math.trunc(b.quarters),months:b.months-Math.trunc(b.months),weeks:b.weeks-Math.trunc(b.weeks),days:b.days-Math.trunc(b.days),hours:b.hours,minutes:b.minutes,seconds:b.seconds,milliseconds:b.milliseconds}).as("milliseconds"),[h,i]=cD(a0(f),c,a.zone);return 0!==g&&(h+=g,i=a.zone.offset(h)),{ts:h,o:i}}function cG(a,b,c,d,e,f){let{setZone:g,zone:h}=c;if((!a||0===Object.keys(a).length)&&!b)return cW.invalid(new ax("unparsable",`the input "${e}" can't be parsed as ${d}`));{let d=cW.fromObject(a,{...c,zone:b||h,specificOffset:f});return g?d:d.setZone(h)}}function cH(a,b,c=!0){return a.isValid?bp.create(ae.create("en-US"),{allowZ:c,forceSimple:!0}).formatDateTimeFromString(a,b):null}function cI(a,b,c){let d=a.c.year>9999||a.c.year<0,e="";if(d&&a.c.year>=0&&(e+="+"),e+=aU(a.c.year,d?6:4),"year"===c)return e;if(b){if(e+="-",e+=aU(a.c.month),"month"===c)return e;e+="-"}else if(e+=aU(a.c.month),"month"===c)return e;return e+aU(a.c.day)}function cJ(a,b,c,d,e,f,g){let h=!c||0!==a.c.millisecond||0!==a.c.second,i="";switch(g){case"day":case"month":case"year":break;default:if(i+=aU(a.c.hour),"hour"===g)break;if(b){if(i+=":",i+=aU(a.c.minute),"minute"===g)break;h&&(i+=":",i+=aU(a.c.second))}else{if(i+=aU(a.c.minute),"minute"===g)break;h&&(i+=aU(a.c.second))}if("second"===g)break;h&&(!d||0!==a.c.millisecond)&&(i+=".",i+=aU(a.c.millisecond,3))}return e&&(a.isOffsetFixed&&0===a.offset&&!f?i+="Z":a.o<0?(i+="-",i+=aU(Math.trunc(-a.o/60)),i+=":",i+=aU(Math.trunc(-a.o%60))):(i+="+",i+=aU(Math.trunc(a.o/60)),i+=":",i+=aU(Math.trunc(a.o%60)))),f&&(i+="["+a.zone.ianaName+"]"),i}let cK={month:1,day:1,hour:0,minute:0,second:0,millisecond:0},cL={weekNumber:1,weekday:1,hour:0,minute:0,second:0,millisecond:0},cM={ordinal:1,hour:0,minute:0,second:0,millisecond:0},cN=["year","month","day","hour","minute","second","millisecond"],cO=["weekYear","weekNumber","weekday","hour","minute","second","millisecond"],cP=["year","ordinal","hour","minute","second","millisecond"];function cQ(a){let b={year:"year",years:"year",month:"month",months:"month",day:"day",days:"day",hour:"hour",hours:"hour",minute:"minute",minutes:"minute",quarter:"quarter",quarters:"quarter",second:"second",seconds:"second",millisecond:"millisecond",milliseconds:"millisecond",weekday:"weekday",weekdays:"weekday",weeknumber:"weekNumber",weeksnumber:"weekNumber",weeknumbers:"weekNumber",weekyear:"weekYear",weekyears:"weekYear",ordinal:"ordinal"}[a.toLowerCase()];if(!b)throw new j(a);return b}function cR(a){switch(a.toLowerCase()){case"localweekday":case"localweekdays":return"localWeekday";case"localweeknumber":case"localweeknumbers":return"localWeekNumber";case"localweekyear":case"localweekyears":return"localWeekYear";default:return cQ(a)}}function cS(a,b){let c,e,f=ai(b.zone,aw.defaultZone);if(!f.isValid)return cW.invalid(cz(f));let g=ae.fromObject(b);if(aL(a.year))c=aw.now();else{for(let b of cN)aL(a[b])&&(a[b]=cK[b]);let b=aJ(a)||aK(a);if(b)return cW.invalid(b);let g=function(a){if(void 0===d&&(d=aw.now()),"iana"!==a.type)return a.offset(d);let b=a.name,c=cV.get(b);return void 0===c&&(c=a.offset(d),cV.set(b,c)),c}(f);[c,e]=cD(a0(a),g,f)}return new cW({ts:c,zone:f,loc:g,o:e})}function cT(a,b,c){let d=!!aL(c.round)||c.round,e=aL(c.rounding)?"trunc":c.rounding,f=(a,f)=>(a=aY(a,d||c.calendary?0:2,c.calendary?"round":e),b.loc.clone(c).relFormatter(c).format(a,f)),g=d=>c.calendary?b.hasSame(a,d)?0:b.startOf(d).diff(a.startOf(d),d).get(d):b.diff(a,d).get(d);if(c.unit)return f(g(c.unit),c.unit);for(let a of c.units){let b=g(a);if(Math.abs(b)>=1)return f(b,a)}return f(a>b?-0:0,c.units[c.units.length-1])}function cU(a){let b={},c;return a.length>0&&"object"==typeof a[a.length-1]?(b=a[a.length-1],c=Array.from(a).slice(0,a.length-1)):c=Array.from(a),[b,c]}let cV=new Map;class cW{constructor(a){const b=a.zone||aw.defaultZone;let c=a.invalid||(Number.isNaN(a.ts)?new ax("invalid input"):null)||(b.isValid?null:cz(b));this.ts=aL(a.ts)?aw.now():a.ts;let d=null,e=null;if(!c)if(a.old&&a.old.ts===this.ts&&a.old.zone.equals(b))[d,e]=[a.old.c,a.old.o];else{const f=aM(a.o)&&!a.old?a.o:b.offset(this.ts);d=(c=Number.isNaN((d=cE(this.ts,f)).year)?new ax("invalid input"):null)?null:d,e=c?null:f}this._zone=b,this.loc=a.loc||ae.create(),this.invalid=c,this.weekData=null,this.localWeekData=null,this.c=d,this.o=e,this.isLuxonDateTime=!0}static now(){return new cW({})}static local(){let[a,b]=cU(arguments),[c,d,e,f,g,h,i]=b;return cS({year:c,month:d,day:e,hour:f,minute:g,second:h,millisecond:i},a)}static utc(){let[a,b]=cU(arguments),[c,d,e,f,g,h,i]=b;return a.zone=ag.utcInstance,cS({year:c,month:d,day:e,hour:f,minute:g,second:h,millisecond:i},a)}static fromJSDate(a,b={}){let c="[object Date]"===Object.prototype.toString.call(a)?a.valueOf():NaN;if(Number.isNaN(c))return cW.invalid("invalid input");let d=ai(b.zone,aw.defaultZone);return d.isValid?new cW({ts:c,zone:d,loc:ae.fromObject(b)}):cW.invalid(cz(d))}static fromMillis(a,b={}){if(aM(a))if(a<-864e13||a>864e13)return cW.invalid("Timestamp out of range");else return new cW({ts:a,zone:ai(b.zone,aw.defaultZone),loc:ae.fromObject(b)});throw new k(`fromMillis requires a numerical input, but received a ${typeof a} with value ${a}`)}static fromSeconds(a,b={}){if(aM(a))return new cW({ts:1e3*a,zone:ai(b.zone,aw.defaultZone),loc:ae.fromObject(b)});throw new k("fromSeconds requires a numerical input")}static fromObject(a,b={}){var c;let d,e;a=a||{};let f=ai(b.zone,aw.defaultZone);if(!f.isValid)return cW.invalid(cz(f));let g=ae.fromObject(b),h=a7(a,cR),{minDaysInFirstWeek:j,startOfWeek:k}=aI(h,g),l=aw.now(),m=aL(b.specificOffset)?f.offset(l):b.specificOffset,n=!aL(h.ordinal),o=!aL(h.year),p=!aL(h.month)||!aL(h.day),q=o||p,r=h.weekYear||h.weekNumber;if((q||n)&&r)throw new i("Can't mix weekYear/weekNumber units with year/month/day or ordinals");if(p&&n)throw new i("Can't mix ordinal dates with month/day");let s=r||h.weekday&&!q,t,u,v=cE(l,m);s?(t=cO,u=cL,v=aE(v,j,k)):n?(t=cP,u=cM,v=aG(v)):(t=cN,u=cK);let w=!1;for(let a of t)aL(h[a])?w?h[a]=u[a]:h[a]=v[a]:w=!0;let x=(s?function(a,b=4,c=1){let d=aN(a.weekYear),e=aT(a.weekNumber,1,a2(a.weekYear,b,c)),f=aT(a.weekday,1,7);return d?e?!f&&aA("weekday",a.weekday):aA("week",a.weekNumber):aA("weekYear",a.weekYear)}(h,j,k):n?(d=aN(h.year),e=aT(h.ordinal,1,a$(h.year)),d?!e&&aA("ordinal",h.ordinal):aA("year",h.year)):aJ(h))||aK(h);if(x)return cW.invalid(x);let[y,z]=(c=s?aF(h,j,k):n?aH(h):h,cD(a0(c),m,f)),A=new cW({ts:y,zone:f,o:z,loc:g});return h.weekday&&q&&a.weekday!==A.weekday?cW.invalid("mismatched weekday",`you can't specify both a weekday of ${h.weekday} and a date of ${A.toISO()}`):A.isValid?A:cW.invalid(A.invalid)}static fromISO(a,b={}){let[c,d]=bt(a,[bU,bY],[bV,bZ],[bW,b$],[bX,b_]);return cG(c,d,b,"ISO 8601",a)}static fromRFC2822(a,b={}){let[c,d]=bt(a.replace(/\([^()]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").trim(),[bN,bO]);return cG(c,d,b,"RFC 2822",a)}static fromHTTP(a,b={}){let[c,d]=bt(a,[bP,bS],[bQ,bS],[bR,bT]);return cG(c,d,b,"HTTP",b)}static fromFormat(a,b,c={}){if(aL(a)||aL(b))throw new k("fromFormat requires an input string and a format");let{locale:d=null,numberingSystem:e=null}=c,[f,g,h,i]=function(a,b,c){let{result:d,zone:e,specificOffset:f,invalidReason:g}=cw(a,b,c);return[d,e,f,g]}(ae.fromOpts({locale:d,numberingSystem:e,defaultToEN:!0}),a,b);return i?cW.invalid(i):cG(f,g,c,`format ${b}`,a,h)}static fromString(a,b,c={}){return cW.fromFormat(a,b,c)}static fromSQL(a,b={}){let[c,d]=bt(a,[b1,bY],[b2,b3]);return cG(c,d,b,"SQL",a)}static invalid(a,b=null){if(!a)throw new k("need to specify a reason the DateTime is invalid");let c=a instanceof ax?a:new ax(a,b);if(!aw.throwOnInvalid)return new cW({invalid:c});throw new f(c)}static isDateTime(a){return a&&a.isLuxonDateTime||!1}static parseFormatForOpts(a,b={}){let c=cx(a,ae.fromObject(b));return c?c.map(a=>a?a.val:null).join(""):null}static expandFormat(a,b={}){return cu(bp.parseFormat(a),ae.fromObject(b)).map(a=>a.val).join("")}static resetCache(){d=void 0,cV.clear()}get(a){return this[a]}get isValid(){return null===this.invalid}get invalidReason(){return this.invalid?this.invalid.reason:null}get invalidExplanation(){return this.invalid?this.invalid.explanation:null}get locale(){return this.isValid?this.loc.locale:null}get numberingSystem(){return this.isValid?this.loc.numberingSystem:null}get outputCalendar(){return this.isValid?this.loc.outputCalendar:null}get zone(){return this._zone}get zoneName(){return this.isValid?this.zone.name:null}get year(){return this.isValid?this.c.year:NaN}get quarter(){return this.isValid?Math.ceil(this.c.month/3):NaN}get month(){return this.isValid?this.c.month:NaN}get day(){return this.isValid?this.c.day:NaN}get hour(){return this.isValid?this.c.hour:NaN}get minute(){return this.isValid?this.c.minute:NaN}get second(){return this.isValid?this.c.second:NaN}get millisecond(){return this.isValid?this.c.millisecond:NaN}get weekYear(){return this.isValid?cA(this).weekYear:NaN}get weekNumber(){return this.isValid?cA(this).weekNumber:NaN}get weekday(){return this.isValid?cA(this).weekday:NaN}get isWeekend(){return this.isValid&&this.loc.getWeekendDays().includes(this.weekday)}get localWeekday(){return this.isValid?cB(this).weekday:NaN}get localWeekNumber(){return this.isValid?cB(this).weekNumber:NaN}get localWeekYear(){return this.isValid?cB(this).weekYear:NaN}get ordinal(){return this.isValid?aG(this.c).ordinal:NaN}get monthShort(){return this.isValid?ch.months("short",{locObj:this.loc})[this.month-1]:null}get monthLong(){return this.isValid?ch.months("long",{locObj:this.loc})[this.month-1]:null}get weekdayShort(){return this.isValid?ch.weekdays("short",{locObj:this.loc})[this.weekday-1]:null}get weekdayLong(){return this.isValid?ch.weekdays("long",{locObj:this.loc})[this.weekday-1]:null}get offset(){return this.isValid?+this.o:NaN}get offsetNameShort(){return this.isValid?this.zone.offsetName(this.ts,{format:"short",locale:this.locale}):null}get offsetNameLong(){return this.isValid?this.zone.offsetName(this.ts,{format:"long",locale:this.locale}):null}get isOffsetFixed(){return this.isValid?this.zone.isUniversal:null}get isInDST(){return!this.isOffsetFixed&&(this.offset>this.set({month:1,day:1}).offset||this.offset>this.set({month:5}).offset)}getPossibleOffsets(){if(!this.isValid||this.isOffsetFixed)return[this];let a=a0(this.c),b=this.zone.offset(a-864e5),c=this.zone.offset(a+864e5),d=this.zone.offset(a-6e4*b),e=this.zone.offset(a-6e4*c);if(d===e)return[this];let f=a-6e4*d,g=a-6e4*e,h=cE(f,d),i=cE(g,e);return h.hour===i.hour&&h.minute===i.minute&&h.second===i.second&&h.millisecond===i.millisecond?[cC(this,{ts:f}),cC(this,{ts:g})]:[this]}get isInLeapYear(){return aZ(this.year)}get daysInMonth(){return a_(this.year,this.month)}get daysInYear(){return this.isValid?a$(this.year):NaN}get weeksInWeekYear(){return this.isValid?a2(this.weekYear):NaN}get weeksInLocalWeekYear(){return this.isValid?a2(this.localWeekYear,this.loc.getMinDaysInFirstWeek(),this.loc.getStartOfWeek()):NaN}resolvedLocaleOptions(a={}){let{locale:b,numberingSystem:c,calendar:d}=bp.create(this.loc.clone(a),a).resolvedOptions(this);return{locale:b,numberingSystem:c,outputCalendar:d}}toUTC(a=0,b={}){return this.setZone(ag.instance(a),b)}toLocal(){return this.setZone(aw.defaultZone)}setZone(a,{keepLocalTime:b=!1,keepCalendarTime:c=!1}={}){if((a=ai(a,aw.defaultZone)).equals(this.zone))return this;{if(!a.isValid)return cW.invalid(cz(a));let e=this.ts;if(b||c){var d;let b=a.offset(this.ts),c=this.toObject();[e]=(d=a,cD(a0(c),b,d))}return cC(this,{ts:e,zone:a})}}reconfigure({locale:a,numberingSystem:b,outputCalendar:c}={}){return cC(this,{loc:this.loc.clone({locale:a,numberingSystem:b,outputCalendar:c})})}setLocale(a){return this.reconfigure({locale:a})}set(a){var b,c,d;let e;if(!this.isValid)return this;let f=a7(a,cR),{minDaysInFirstWeek:g,startOfWeek:h}=aI(f,this.loc),j=!aL(f.weekYear)||!aL(f.weekNumber)||!aL(f.weekday),k=!aL(f.ordinal),l=!aL(f.year),m=!aL(f.month)||!aL(f.day),n=f.weekYear||f.weekNumber;if((l||m||k)&&n)throw new i("Can't mix weekYear/weekNumber units with year/month/day or ordinals");if(m&&k)throw new i("Can't mix ordinal dates with month/day");j?e=aF({...aE(this.c,g,h),...f},g,h):aL(f.ordinal)?(e={...this.toObject(),...f},aL(f.day)&&(e.day=Math.min(a_(e.year,e.month),e.day))):e=aH({...aG(this.c),...f});let[o,p]=(b=e,c=this.o,d=this.zone,cD(a0(b),c,d));return cC(this,{ts:o,o:p})}plus(a){return this.isValid?cC(this,cF(this,ce.fromDurationLike(a))):this}minus(a){return this.isValid?cC(this,cF(this,ce.fromDurationLike(a).negate())):this}startOf(a,{useLocaleWeeks:b=!1}={}){if(!this.isValid)return this;let c={},d=ce.normalizeUnit(a);switch(d){case"years":c.month=1;case"quarters":case"months":c.day=1;case"weeks":case"days":c.hour=0;case"hours":c.minute=0;case"minutes":c.second=0;case"seconds":c.millisecond=0}if("weeks"===d)if(b){let a=this.loc.getStartOfWeek(),{weekday:b}=this;b<a&&(c.weekNumber=this.weekNumber-1),c.weekday=a}else c.weekday=1;return"quarters"===d&&(c.month=(Math.ceil(this.month/3)-1)*3+1),this.set(c)}endOf(a,b){return this.isValid?this.plus({[a]:1}).startOf(a,b).minus(1):this}toFormat(a,b={}){return this.isValid?bp.create(this.loc.redefaultToEN(b)).formatDateTimeFromString(this,a):cy}toLocaleString(a=p,b={}){return this.isValid?bp.create(this.loc.clone(b),a).formatDateTime(this):cy}toLocaleParts(a={}){return this.isValid?bp.create(this.loc.clone(a),a).formatDateTimeParts(this):[]}toISO({format:a="extended",suppressSeconds:b=!1,suppressMilliseconds:c=!1,includeOffset:d=!0,extendedZone:e=!1,precision:f="milliseconds"}={}){if(!this.isValid)return null;f=cQ(f);let g="extended"===a,h=cI(this,g,f);return cN.indexOf(f)>=3&&(h+="T"),h+=cJ(this,g,b,c,d,e,f)}toISODate({format:a="extended",precision:b="day"}={}){return this.isValid?cI(this,"extended"===a,cQ(b)):null}toISOWeekDate(){return cH(this,"kkkk-'W'WW-c")}toISOTime({suppressMilliseconds:a=!1,suppressSeconds:b=!1,includeOffset:c=!0,includePrefix:d=!1,extendedZone:e=!1,format:f="extended",precision:g="milliseconds"}={}){return this.isValid?(g=cQ(g),(d&&cN.indexOf(g)>=3?"T":"")+cJ(this,"extended"===f,b,a,c,e,g)):null}toRFC2822(){return cH(this,"EEE, dd LLL yyyy HH:mm:ss ZZZ",!1)}toHTTP(){return cH(this.toUTC(),"EEE, dd LLL yyyy HH:mm:ss 'GMT'")}toSQLDate(){return this.isValid?cI(this,!0):null}toSQLTime({includeOffset:a=!0,includeZone:b=!1,includeOffsetSpace:c=!0}={}){let d="HH:mm:ss.SSS";return(b||a)&&(c&&(d+=" "),b?d+="z":a&&(d+="ZZ")),cH(this,d,!0)}toSQL(a={}){return this.isValid?`${this.toSQLDate()} ${this.toSQLTime(a)}`:null}toString(){return this.isValid?this.toISO():cy}[Symbol.for("nodejs.util.inspect.custom")](){return this.isValid?`DateTime { ts: ${this.toISO()}, zone: ${this.zone.name}, locale: ${this.locale} }`:`DateTime { Invalid, reason: ${this.invalidReason} }`}valueOf(){return this.toMillis()}toMillis(){return this.isValid?this.ts:NaN}toSeconds(){return this.isValid?this.ts/1e3:NaN}toUnixInteger(){return this.isValid?Math.floor(this.ts/1e3):NaN}toJSON(){return this.toISO()}toBSON(){return this.toJSDate()}toObject(a={}){if(!this.isValid)return{};let b={...this.c};return a.includeConfig&&(b.outputCalendar=this.outputCalendar,b.numberingSystem=this.loc.numberingSystem,b.locale=this.loc.locale),b}toJSDate(){return new Date(this.isValid?this.ts:NaN)}diff(a,b="milliseconds",c={}){if(!this.isValid||!a.isValid)return ce.invalid("created by diffing an invalid DateTime");let d={locale:this.locale,numberingSystem:this.numberingSystem,...c},e=(Array.isArray(b)?b:[b]).map(ce.normalizeUnit),f=a.valueOf()>this.valueOf(),g=function(a,b,c,d){let[e,f,g,h]=function(a,b,c){let d,e,f={},g=a;for(let[h,i]of[["years",(a,b)=>b.year-a.year],["quarters",(a,b)=>b.quarter-a.quarter+(b.year-a.year)*4],["months",(a,b)=>b.month-a.month+(b.year-a.year)*12],["weeks",(a,b)=>{let c=ci(a,b);return(c-c%7)/7}],["days",ci]])c.indexOf(h)>=0&&(d=h,f[h]=i(a,b),(e=g.plus(f))>b?(f[h]--,(a=g.plus(f))>b&&(e=a,f[h]--,a=g.plus(f))):a=e);return[a,f,e,d]}(a,b,c),i=b-e,j=c.filter(a=>["hours","minutes","seconds","milliseconds"].indexOf(a)>=0);0===j.length&&(g<b&&(g=e.plus({[h]:1})),g!==e&&(f[h]=(f[h]||0)+i/(g-e)));let k=ce.fromObject(f,d);return j.length>0?ce.fromMillis(i,d).shiftTo(...j).plus(k):k}(f?this:a,f?a:this,e,d);return f?g.negate():g}diffNow(a="milliseconds",b={}){return this.diff(cW.now(),a,b)}until(a){return this.isValid?cg.fromDateTimes(this,a):this}hasSame(a,b,c){if(!this.isValid)return!1;let d=a.valueOf(),e=this.setZone(a.zone,{keepLocalTime:!0});return e.startOf(b,c)<=d&&d<=e.endOf(b,c)}equals(a){return this.isValid&&a.isValid&&this.valueOf()===a.valueOf()&&this.zone.equals(a.zone)&&this.loc.equals(a.loc)}toRelative(a={}){if(!this.isValid)return null;let b=a.base||cW.fromObject({},{zone:this.zone}),c=a.padding?this<b?-a.padding:a.padding:0,d=["years","months","days","hours","minutes","seconds"],e=a.unit;return Array.isArray(a.unit)&&(d=a.unit,e=void 0),cT(b,this.plus(c),{...a,numeric:"always",units:d,unit:e})}toRelativeCalendar(a={}){return this.isValid?cT(a.base||cW.fromObject({},{zone:this.zone}),this,{...a,numeric:"auto",units:["years","months","days"],calendary:!0}):null}static min(...a){if(!a.every(cW.isDateTime))throw new k("min requires all arguments be DateTimes");return aQ(a,a=>a.valueOf(),Math.min)}static max(...a){if(!a.every(cW.isDateTime))throw new k("max requires all arguments be DateTimes");return aQ(a,a=>a.valueOf(),Math.max)}static fromFormatExplain(a,b,c={}){let{locale:d=null,numberingSystem:e=null}=c;return cw(ae.fromOpts({locale:d,numberingSystem:e,defaultToEN:!0}),a,b)}static fromStringExplain(a,b,c={}){return cW.fromFormatExplain(a,b,c)}static buildFormatParser(a,b={}){let{locale:c=null,numberingSystem:d=null}=b;return new cv(ae.fromOpts({locale:c,numberingSystem:d,defaultToEN:!0}),a)}static fromFormatParser(a,b,c={}){if(aL(a)||aL(b))throw new k("fromFormatParser requires an input string and a format parser");let{locale:d=null,numberingSystem:e=null}=c,f=ae.fromOpts({locale:d,numberingSystem:e,defaultToEN:!0});if(!f.equals(b.locale))throw new k(`fromFormatParser called with a locale of ${f}, but the format parser was created for ${b.locale}`);let{result:g,zone:h,specificOffset:i,invalidReason:j}=b.explainFromTokens(a);return j?cW.invalid(j):cG(g,h,c,`format ${b.format}`,a,i)}static get DATE_SHORT(){return p}static get DATE_MED(){return q}static get DATE_MED_WITH_WEEKDAY(){return r}static get DATE_FULL(){return s}static get DATE_HUGE(){return t}static get TIME_SIMPLE(){return u}static get TIME_WITH_SECONDS(){return v}static get TIME_WITH_SHORT_OFFSET(){return w}static get TIME_WITH_LONG_OFFSET(){return x}static get TIME_24_SIMPLE(){return y}static get TIME_24_WITH_SECONDS(){return z}static get TIME_24_WITH_SHORT_OFFSET(){return A}static get TIME_24_WITH_LONG_OFFSET(){return B}static get DATETIME_SHORT(){return C}static get DATETIME_SHORT_WITH_SECONDS(){return D}static get DATETIME_MED(){return E}static get DATETIME_MED_WITH_SECONDS(){return F}static get DATETIME_MED_WITH_WEEKDAY(){return G}static get DATETIME_FULL(){return H}static get DATETIME_FULL_WITH_SECONDS(){return I}static get DATETIME_HUGE(){return J}static get DATETIME_HUGE_WITH_SECONDS(){return K}}function cX(a){if(cW.isDateTime(a))return a;if(a&&a.valueOf&&aM(a.valueOf()))return cW.fromJSDate(a);if(a&&"object"==typeof a)return cW.fromObject(a);throw new k(`Unknown datetime argument: ${a}, of type ${typeof a}`)}c.DateTime=cW,c.Duration=ce,c.FixedOffsetZone=ag,c.IANAZone=R,c.Info=ch,c.Interval=cg,c.InvalidZone=ah,c.Settings=aw,c.SystemZone=N,c.VERSION="3.7.2",c.Zone=L},409700,(a,b,c)=>{"use strict";var d=a.r(666127);function e(a,b){var c={zone:b};if(a?a instanceof e?this._date=a._date:a instanceof Date?this._date=d.DateTime.fromJSDate(a,c):"number"==typeof a?this._date=d.DateTime.fromMillis(a,c):"string"==typeof a&&(this._date=d.DateTime.fromISO(a,c),this._date.isValid||(this._date=d.DateTime.fromRFC2822(a,c)),this._date.isValid||(this._date=d.DateTime.fromSQL(a,c)),this._date.isValid||(this._date=d.DateTime.fromFormat(a,"EEE, d MMM yyyy HH:mm:ss",c))):this._date=d.DateTime.local(),!this._date||!this._date.isValid)throw Error("CronDate: unhandled timestamp: "+JSON.stringify(a));b&&b!==this._date.zoneName&&(this._date=this._date.setZone(b))}e.prototype.addYear=function(){this._date=this._date.plus({years:1})},e.prototype.addMonth=function(){this._date=this._date.plus({months:1}).startOf("month")},e.prototype.addDay=function(){this._date=this._date.plus({days:1}).startOf("day")},e.prototype.addHour=function(){var a=this._date;this._date=this._date.plus({hours:1}).startOf("hour"),this._date<=a&&(this._date=this._date.plus({hours:1}))},e.prototype.addMinute=function(){var a=this._date;this._date=this._date.plus({minutes:1}).startOf("minute"),this._date<a&&(this._date=this._date.plus({hours:1}))},e.prototype.addSecond=function(){var a=this._date;this._date=this._date.plus({seconds:1}).startOf("second"),this._date<a&&(this._date=this._date.plus({hours:1}))},e.prototype.subtractYear=function(){this._date=this._date.minus({years:1})},e.prototype.subtractMonth=function(){this._date=this._date.minus({months:1}).endOf("month").startOf("second")},e.prototype.subtractDay=function(){this._date=this._date.minus({days:1}).endOf("day").startOf("second")},e.prototype.subtractHour=function(){var a=this._date;this._date=this._date.minus({hours:1}).endOf("hour").startOf("second"),this._date>=a&&(this._date=this._date.minus({hours:1}))},e.prototype.subtractMinute=function(){var a=this._date;this._date=this._date.minus({minutes:1}).endOf("minute").startOf("second"),this._date>a&&(this._date=this._date.minus({hours:1}))},e.prototype.subtractSecond=function(){var a=this._date;this._date=this._date.minus({seconds:1}).startOf("second"),this._date>a&&(this._date=this._date.minus({hours:1}))},e.prototype.getDate=function(){return this._date.day},e.prototype.getFullYear=function(){return this._date.year},e.prototype.getDay=function(){var a=this._date.weekday;return 7==a?0:a},e.prototype.getMonth=function(){return this._date.month-1},e.prototype.getHours=function(){return this._date.hour},e.prototype.getMinutes=function(){return this._date.minute},e.prototype.getSeconds=function(){return this._date.second},e.prototype.getMilliseconds=function(){return this._date.millisecond},e.prototype.getTime=function(){return this._date.valueOf()},e.prototype.getUTCDate=function(){return this._getUTC().day},e.prototype.getUTCFullYear=function(){return this._getUTC().year},e.prototype.getUTCDay=function(){var a=this._getUTC().weekday;return 7==a?0:a},e.prototype.getUTCMonth=function(){return this._getUTC().month-1},e.prototype.getUTCHours=function(){return this._getUTC().hour},e.prototype.getUTCMinutes=function(){return this._getUTC().minute},e.prototype.getUTCSeconds=function(){return this._getUTC().second},e.prototype.toISOString=function(){return this._date.toUTC().toISO()},e.prototype.toJSON=function(){return this._date.toJSON()},e.prototype.setDate=function(a){this._date=this._date.set({day:a})},e.prototype.setFullYear=function(a){this._date=this._date.set({year:a})},e.prototype.setDay=function(a){this._date=this._date.set({weekday:a})},e.prototype.setMonth=function(a){this._date=this._date.set({month:a+1})},e.prototype.setHours=function(a){this._date=this._date.set({hour:a})},e.prototype.setMinutes=function(a){this._date=this._date.set({minute:a})},e.prototype.setSeconds=function(a){this._date=this._date.set({second:a})},e.prototype.setMilliseconds=function(a){this._date=this._date.set({millisecond:a})},e.prototype._getUTC=function(){return this._date.toUTC()},e.prototype.toString=function(){return this.toDate().toString()},e.prototype.toDate=function(){return this._date.toJSDate()},e.prototype.isLastDayOfMonth=function(){var a=this._date.plus({days:1}).startOf("day");return this._date.month!==a.month},e.prototype.isLastWeekdayOfMonth=function(){var a=this._date.plus({days:7}).startOf("day");return this._date.month!==a.month},b.exports=e},475700,(a,b,c)=>{"use strict";function d(a){return{start:a,count:1}}function e(a,b){a.end=b,a.step=b-a.start,a.count=2}function f(a,b,c){b&&(2===b.count?(a.push(d(b.start)),a.push(d(b.end))):a.push(b)),c&&a.push(c)}b.exports=function(a){for(var b=[],c=void 0,g=0;g<a.length;g++){var h=a[g];"number"!=typeof h?(f(b,c,d(h)),c=void 0):c?1===c.count?e(c,h):c.step===h-c.end?(c.count++,c.end=h):2===c.count?(b.push(d(c.start)),e(c=d(c.end),h)):(f(b,c),c=d(h)):c=d(h)}return f(b,c),b}},338934,(a,b,c)=>{"use strict";var d=a.r(475700);b.exports=function(a,b,c){var e=d(a);if(1===e.length){var f=e[0],g=f.step;if(1===g&&f.start===b&&f.end===c)return"*";if(1!==g&&f.start===b&&f.end===c-g+1)return"*/"+g}for(var h=[],i=0,j=e.length;i<j;++i){var k=e[i];if(1===k.count){h.push(k.start);continue}var g=k.step;if(1===k.step){h.push(k.start+"-"+k.end);continue}var l=0==k.start?k.count-1:k.count;k.step*l>k.end?h=h.concat(Array.from({length:k.end-k.start+1}).map(function(a,b){var c=k.start+b;return(c-k.start)%k.step==0?c:null}).filter(function(a){return null!=a})):k.end===c-k.step+1?h.push(k.start+"/"+k.step):h.push(k.start+"-"+k.end+"/"+k.step)}return h.join(",")}},901630,(a,b,c)=>{"use strict";var d=a.r(409700),e=a.r(338934);function f(a,b){this._options=b,this._utc=b.utc||!1,this._tz=this._utc?"UTC":b.tz,this._currentDate=new d(b.currentDate,this._tz),this._startDate=b.startDate?new d(b.startDate,this._tz):null,this._endDate=b.endDate?new d(b.endDate,this._tz):null,this._isIterator=b.iterator||!1,this._hasIterated=!1,this._nthDayOfWeek=b.nthDayOfWeek||0,this.fields=f._freezeFields(a)}f.map=["second","minute","hour","dayOfMonth","month","dayOfWeek"],f.predefined={"@yearly":"0 0 1 1 *","@monthly":"0 0 1 * *","@weekly":"0 0 * * 0","@daily":"0 0 * * *","@hourly":"0 * * * *"},f.constraints=[{min:0,max:59,chars:[]},{min:0,max:59,chars:[]},{min:0,max:23,chars:[]},{min:1,max:31,chars:["L"]},{min:1,max:12,chars:[]},{min:0,max:7,chars:["L"]}],f.daysInMonth=[31,29,31,30,31,30,31,31,30,31,30,31],f.aliases={month:{jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12},dayOfWeek:{sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6}},f.parseDefaults=["0","*","*","*","*","*"],f.standardValidCharacters=/^[,*\d/-]+$/,f.dayOfWeekValidCharacters=/^[?,*\dL#/-]+$/,f.dayOfMonthValidCharacters=/^[?,*\dL/-]+$/,f.validCharacters={second:f.standardValidCharacters,minute:f.standardValidCharacters,hour:f.standardValidCharacters,dayOfMonth:f.dayOfMonthValidCharacters,month:f.standardValidCharacters,dayOfWeek:f.dayOfWeekValidCharacters},f._isValidConstraintChar=function(a,b){return"string"==typeof b&&a.chars.some(function(a){return b.indexOf(a)>-1})},f._parseField=function(a,b,c){switch(a){case"month":case"dayOfWeek":var d=f.aliases[a];b=b.replace(/[a-z]{3}/gi,function(a){if(void 0!==d[a=a.toLowerCase()])return d[a];throw Error('Validation error, cannot resolve alias "'+a+'"')})}if(!f.validCharacters[a].test(b))throw Error("Invalid characters, got value: "+b);function e(a){var b=a.split("/");if(b.length>2)throw Error("Invalid repeat: "+a);return b.length>1?(b[0]==+b[0]&&(b=[b[0]+"-"+c.max,b[1]]),g(b[0],b[b.length-1])):g(a,1)}function g(b,d){var e=[],f=b.split("-");if(f.length>1){if(f.length<2)return+b;if(!f[0].length){if(!f[1].length)throw Error("Invalid range: "+b);return+b}var g=+f[0],h=+f[1];if(Number.isNaN(g)||Number.isNaN(h)||g<c.min||h>c.max)throw Error("Constraint error, got range "+g+"-"+h+" expected range "+c.min+"-"+c.max);if(g>h)throw Error("Invalid range: "+b);var i=+d;if(Number.isNaN(i)||i<=0)throw Error("Constraint error, cannot repeat at every "+i+" time.");"dayOfWeek"===a&&h%7==0&&e.push(0);for(var j=g;j<=h;j++)-1===e.indexOf(j)&&i>0&&i%d==0?(i=1,e.push(j)):i++;return e}return Number.isNaN(+b)?b:+b}return -1!==b.indexOf("*")?b=b.replace(/\*/g,c.min+"-"+c.max):-1!==b.indexOf("?")&&(b=b.replace(/\?/g,c.min+"-"+c.max)),function(b){var d=[];function g(b){if(b instanceof Array)for(var e=0,g=b.length;e<g;e++){var h=b[e];if(f._isValidConstraintChar(c,h)){d.push(h);continue}if("number"!=typeof h||Number.isNaN(h)||h<c.min||h>c.max)throw Error("Constraint error, got value "+h+" expected range "+c.min+"-"+c.max);d.push(h)}else{if(f._isValidConstraintChar(c,b))return void d.push(b);var i=+b;if(Number.isNaN(i)||i<c.min||i>c.max)throw Error("Constraint error, got value "+b+" expected range "+c.min+"-"+c.max);"dayOfWeek"===a&&(i%=7),d.push(i)}}var h=b.split(",");if(!h.every(function(a){return a.length>0}))throw Error("Invalid list value format");if(h.length>1)for(var i=0,j=h.length;i<j;i++)g(e(h[i]));else g(e(b));return d.sort(f._sortCompareFn),d}(b)},f._sortCompareFn=function(a,b){var c="number"==typeof a,d="number"==typeof b;return c&&d?a-b:!c&&d?1:c&&!d?-1:a.localeCompare(b)},f._handleMaxDaysInMonth=function(a){if(1===a.month.length){var b=f.daysInMonth[a.month[0]-1];if(a.dayOfMonth[0]>b)throw Error("Invalid explicit day of month definition");return a.dayOfMonth.filter(function(a){return"L"===a||a<=b}).sort(f._sortCompareFn)}},f._freezeFields=function(a){for(var b=0,c=f.map.length;b<c;++b){var d=f.map[b],e=a[d];a[d]=Object.freeze(e)}return Object.freeze(a)},f.prototype._applyTimezoneShift=function(a,b,c){if("Month"===c||"Day"===c){var d=a.getTime();a[b+c](),d===a.getTime()&&(0===a.getMinutes()&&0===a.getSeconds()?a.addHour():59===a.getMinutes()&&59===a.getSeconds()&&a.subtractHour())}else{var e=a.getHours();a[b+c]();var f=a.getHours(),g=f-e;2===g?24!==this.fields.hour.length&&(this._dstStart=f):0===g&&0===a.getMinutes()&&0===a.getSeconds()&&24!==this.fields.hour.length&&(this._dstEnd=f)}},f.prototype._findSchedule=function(a){function b(a,b){for(var c=0,d=b.length;c<d;c++)if(b[c]>=a)return b[c]===a;return b[0]===a}function c(a){return a.length>0&&a.some(function(a){return"string"==typeof a&&a.indexOf("L")>=0})}for(var e=(a=a||!1)?"subtract":"add",g=new d(this._currentDate,this._tz),h=this._startDate,i=this._endDate,j=g.getTime(),k=0;k<1e4;){if(k++,a){if(h&&g.getTime()-h.getTime()<0)throw Error("Out of the timespan range")}else if(i&&i.getTime()-g.getTime()<0)throw Error("Out of the timespan range");var l=b(g.getDate(),this.fields.dayOfMonth);c(this.fields.dayOfMonth)&&(l=l||g.isLastDayOfMonth());var m=b(g.getDay(),this.fields.dayOfWeek);c(this.fields.dayOfWeek)&&(m=m||this.fields.dayOfWeek.some(function(a){if(!c([a]))return!1;var b=Number.parseInt(a[0])%7;if(Number.isNaN(b))throw Error("Invalid last weekday of the month expression: "+a);return g.getDay()===b&&g.isLastWeekdayOfMonth()}));var n=this.fields.dayOfMonth.length>=f.daysInMonth[g.getMonth()],o=this.fields.dayOfWeek.length===f.constraints[5].max-f.constraints[5].min+1,p=g.getHours();if(!l&&(!m||o)||!n&&o&&!l||n&&!o&&!m||this._nthDayOfWeek>0&&!function(a,b){if(b<6){if(8>a.getDate()&&1===b)return!0;var c=a.getDate()%7?1:0;return Math.floor((a.getDate()-a.getDate()%7)/7)+c===b}return!1}(g,this._nthDayOfWeek)){this._applyTimezoneShift(g,e,"Day");continue}if(!b(g.getMonth()+1,this.fields.month)){this._applyTimezoneShift(g,e,"Month");continue}if(b(p,this.fields.hour)){if(this._dstEnd===p&&!a){this._dstEnd=null,this._applyTimezoneShift(g,"add","Hour");continue}}else if(this._dstStart!==p){this._dstStart=null,this._applyTimezoneShift(g,e,"Hour");continue}else if(!b(p-1,this.fields.hour)){g[e+"Hour"]();continue}if(!b(g.getMinutes(),this.fields.minute)){this._applyTimezoneShift(g,e,"Minute");continue}if(!b(g.getSeconds(),this.fields.second)){this._applyTimezoneShift(g,e,"Second");continue}if(j===g.getTime()){"add"===e||0===g.getMilliseconds()?this._applyTimezoneShift(g,e,"Second"):g.setMilliseconds(0);continue}break}if(k>=1e4)throw Error("Invalid expression, loop limit exceeded");return this._currentDate=new d(g,this._tz),this._hasIterated=!0,g},f.prototype.next=function(){var a=this._findSchedule();return this._isIterator?{value:a,done:!this.hasNext()}:a},f.prototype.prev=function(){var a=this._findSchedule(!0);return this._isIterator?{value:a,done:!this.hasPrev()}:a},f.prototype.hasNext=function(){var a=this._currentDate,b=this._hasIterated;try{return this._findSchedule(),!0}catch(a){return!1}finally{this._currentDate=a,this._hasIterated=b}},f.prototype.hasPrev=function(){var a=this._currentDate,b=this._hasIterated;try{return this._findSchedule(!0),!0}catch(a){return!1}finally{this._currentDate=a,this._hasIterated=b}},f.prototype.iterate=function(a,b){var c=[];if(a>=0)for(var d=0,e=a;d<e;d++)try{var f=this.next();c.push(f),b&&b(f,d)}catch(a){break}else for(var d=0,e=a;d>e;d--)try{var f=this.prev();c.push(f),b&&b(f,d)}catch(a){break}return c},f.prototype.reset=function(a){this._currentDate=new d(a||this._options.currentDate)},f.prototype.stringify=function(a){for(var b=[],c=+!a,d=f.map.length;c<d;++c){var g=f.map[c],h=this.fields[g],i=f.constraints[c];"dayOfMonth"===g&&1===this.fields.month.length?i={min:1,max:f.daysInMonth[this.fields.month[0]-1]}:"dayOfWeek"===g&&(i={min:0,max:6},h=7===h[h.length-1]?h.slice(0,-1):h),b.push(e(h,i.min,i.max))}return b.join(" ")},f.parse=function(a,b){var c=this;return"function"==typeof b&&(b={}),function(a,b){b||(b={}),void 0===b.currentDate&&(b.currentDate=new d(void 0,c._tz)),f.predefined[a]&&(a=f.predefined[a]);var e=[],g=(a+"").trim().split(/\s+/);if(g.length>6)throw Error("Invalid cron expression");for(var h=f.map.length-g.length,i=0,j=f.map.length;i<j;++i){var k=f.map[i],l=g[g.length>j?i:i-h];if(i<h||!l)e.push(f._parseField(k,f.parseDefaults[i],f.constraints[i]));else{var m="dayOfWeek"===k?function(a){var c=a.split("#");if(c.length>1){var d=+c[c.length-1];if(/,/.test(a))throw Error("Constraint error, invalid dayOfWeek `#` and `,` special characters are incompatible");if(/\//.test(a))throw Error("Constraint error, invalid dayOfWeek `#` and `/` special characters are incompatible");if(/-/.test(a))throw Error("Constraint error, invalid dayOfWeek `#` and `-` special characters are incompatible");if(c.length>2||Number.isNaN(d)||d<1||d>5)throw Error("Constraint error, invalid dayOfWeek occurrence number (#)");return b.nthDayOfWeek=d,c[0]}return a}(l):l;e.push(f._parseField(k,m,f.constraints[i]))}}for(var n={},i=0,j=f.map.length;i<j;i++)n[f.map[i]]=e[i];var o=f._handleMaxDaysInMonth(n);return n.dayOfMonth=o||n.dayOfMonth,new f(n,b)}(a,b)},f.fieldsToExpression=function(a,b){for(var c={},d=0,e=f.map.length;d<e;++d){var g=f.map[d],h=a[g];!function(a,b,c){if(!b)throw Error("Validation error, Field "+a+" is missing");if(0===b.length)throw Error("Validation error, Field "+a+" contains no values");for(var d=0,e=b.length;d<e;d++){var g=b[d];if(!f._isValidConstraintChar(c,g)&&("number"!=typeof g||Number.isNaN(g)||g<c.min||g>c.max))throw Error("Constraint error, got value "+g+" expected range "+c.min+"-"+c.max)}}(g,h,f.constraints[d]);for(var i=[],j=-1;++j<h.length;)i[j]=h[j];if((h=i.sort(f._sortCompareFn).filter(function(a,b,c){return!b||a!==c[b-1]})).length!==i.length)throw Error("Validation error, Field "+g+" contains duplicate values");c[g]=h}var k=f._handleMaxDaysInMonth(c);return c.dayOfMonth=k||c.dayOfMonth,new f(c,b||{})},b.exports=f},410471,(a,b,c)=>{"use strict";var d=a.r(901630);function e(){}e._parseEntry=function(a){var b=a.split(" ");if(6===b.length)return{interval:d.parse(a)};if(b.length>6)return{interval:d.parse(b.slice(0,6).join(" ")),command:b.slice(6,b.length)};throw Error("Invalid entry: "+a)},e.parseExpression=function(a,b){return d.parse(a,b)},e.fieldsToExpression=function(a,b){return d.fieldsToExpression(a,b)},e.parseString=function(a){for(var b=a.split("\n"),c={variables:{},expressions:[],errors:{}},d=0,f=b.length;d<f;d++){var g=b[d],h=null,i=g.trim();if(i.length>0)if(i.match(/^#/))continue;else if(h=i.match(/^(.*)=(.*)$/))c.variables[h[1]]=h[2];else{var j=null;try{j=e._parseEntry("0 "+i),c.expressions.push(j.interval)}catch(a){c.errors[i]=a}}}return c},e.parseFile=function(b,c){a.r(522734).readFile(b,function(a,b){return a?void c(a):c(null,e.parseString(b.toString()))})},b.exports=e},224830,a=>{"use strict";let b,c,d,e,f,g,h;class i{static normalize(a){return Number.isFinite(a)?{type:"fixed",delay:a}:a||void 0}static calculate(a,b,c,d,e){if(a)return(function(a,b){if(a.type in i.builtinStrategies)return i.builtinStrategies[a.type](a.delay,a.jitter);if(b)return b;throw Error(`Unknown backoff strategy ${a.type}.
      If a custom backoff strategy is used, specify it when the queue is created.`)})(a,e)(b,a.type,c,d)}}i.builtinStrategies={fixed:function(a,b=0){return function(){return b>0?Math.floor(Math.random()*a*b+a*(1-b)):a}},exponential:function(a,b=0){return function(c){if(!(b>0))return Math.round(Math.pow(2,c-1)*a);{let d=Math.round(Math.pow(2,c-1)*a);return Math.floor(Math.random()*d*b+d*(1-b))}}}},a.i(233405);var j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J=a.i(504446);a.i(37702),(j=s||(s={}))[j.Init=0]="Init",j[j.Start=1]="Start",j[j.Stop=2]="Stop",j[j.GetChildrenValuesResponse=3]="GetChildrenValuesResponse",j[j.GetIgnoredChildrenFailuresResponse=4]="GetIgnoredChildrenFailuresResponse",j[j.GetDependenciesCountResponse=5]="GetDependenciesCountResponse",j[j.MoveToWaitingChildrenResponse=6]="MoveToWaitingChildrenResponse",j[j.Cancel=7]="Cancel",j[j.GetDependenciesResponse=8]="GetDependenciesResponse",(k=t||(t={}))[k.JobNotExist=-1]="JobNotExist",k[k.JobLockNotExist=-2]="JobLockNotExist",k[k.JobNotInState=-3]="JobNotInState",k[k.JobPendingChildren=-4]="JobPendingChildren",k[k.ParentJobNotExist=-5]="ParentJobNotExist",k[k.JobLockMismatch=-6]="JobLockMismatch",k[k.ParentJobCannotBeReplaced=-7]="ParentJobCannotBeReplaced",k[k.JobBelongsToJobScheduler=-8]="JobBelongsToJobScheduler",k[k.JobHasFailedChildren=-9]="JobHasFailedChildren",k[k.SchedulerJobIdCollision=-10]="SchedulerJobIdCollision",k[k.SchedulerJobSlotsBusy=-11]="SchedulerJobSlotsBusy",(l=u||(u={}))[l.Completed=0]="Completed",l[l.Error=1]="Error",l[l.Failed=2]="Failed",l[l.InitFailed=3]="InitFailed",l[l.InitCompleted=4]="InitCompleted",l[l.Log=5]="Log",l[l.MoveToDelayed=6]="MoveToDelayed",l[l.MoveToWait=7]="MoveToWait",l[l.Progress=8]="Progress",l[l.Update=9]="Update",l[l.GetChildrenValues=10]="GetChildrenValues",l[l.GetIgnoredChildrenFailures=11]="GetIgnoredChildrenFailures",l[l.GetDependenciesCount=12]="GetDependenciesCount",l[l.MoveToWaitingChildren=13]="MoveToWaitingChildren",l[l.GetDependencies=14]="GetDependencies",(m=v||(v={}))[m.ONE_MINUTE=1]="ONE_MINUTE",m[m.FIVE_MINUTES=5]="FIVE_MINUTES",m[m.FIFTEEN_MINUTES=15]="FIFTEEN_MINUTES",m[m.THIRTY_MINUTES=30]="THIRTY_MINUTES",m[m.ONE_HOUR=60]="ONE_HOUR",m[m.ONE_WEEK=10080]="ONE_WEEK",m[m.TWO_WEEKS=20160]="TWO_WEEKS",m[m.ONE_MONTH=80640]="ONE_MONTH",(n=w||(w={})).QueueName="bullmq.queue.name",n.QueueOperation="bullmq.queue.operation",n.BulkCount="bullmq.job.bulk.count",n.BulkNames="bullmq.job.bulk.names",n.JobName="bullmq.job.name",n.JobId="bullmq.job.id",n.JobKey="bullmq.job.key",n.JobIds="bullmq.job.ids",n.JobAttemptsMade="bullmq.job.attempts.made",n.DeduplicationKey="bullmq.job.deduplication.key",n.JobOptions="bullmq.job.options",n.JobProgress="bullmq.job.progress",n.QueueDrainDelay="bullmq.queue.drain.delay",n.QueueGrace="bullmq.queue.grace",n.QueueCleanLimit="bullmq.queue.clean.limit",n.QueueRateLimit="bullmq.queue.rate.limit",n.JobType="bullmq.job.type",n.QueueOptions="bullmq.queue.options",n.QueueEventMaxLength="bullmq.queue.event.max.length",n.QueueJobsState="bullmq.queue.jobs.state",n.WorkerOptions="bullmq.worker.options",n.WorkerName="bullmq.worker.name",n.WorkerId="bullmq.worker.id",n.WorkerRateLimit="bullmq.worker.rate.limit",n.WorkerDoNotWaitActive="bullmq.worker.do.not.wait.active",n.WorkerForceClose="bullmq.worker.force.close",n.WorkerStalledJobs="bullmq.worker.stalled.jobs",n.WorkerFailedJobs="bullmq.worker.failed.jobs",n.WorkerJobsToExtendLocks="bullmq.worker.jobs.to.extend.locks",n.JobFinishedTimestamp="bullmq.job.finished.timestamp",n.JobAttemptFinishedTimestamp="bullmq.job.attempt_finished_timestamp",n.JobProcessedTimestamp="bullmq.job.processed.timestamp",n.JobResult="bullmq.job.result",n.JobFailedReason="bullmq.job.failed.reason",n.FlowName="bullmq.flow.name",n.JobSchedulerId="bullmq.job.scheduler.id",n.JobStatus="bullmq.job.status",(o=x||(x={})).QueueJobsCount="bullmq.queue.jobs",o.JobsCompleted="bullmq.jobs.completed",o.JobsFailed="bullmq.jobs.failed",o.JobsDelayed="bullmq.jobs.delayed",o.JobsRetried="bullmq.jobs.retried",o.JobsWaiting="bullmq.jobs.waiting",o.JobsWaitingChildren="bullmq.jobs.waiting_children",o.JobDuration="bullmq.job.duration",(p=y||(y={}))[p.INTERNAL=0]="INTERNAL",p[p.SERVER=1]="SERVER",p[p.CLIENT=2]="CLIENT",p[p.PRODUCER=3]="PRODUCER",p[p.CONSUMER=4]="CONSUMER";var K=a.i(427699);K.EventEmitter;a.i(814747);var L=a.i(748064);globalThis.AbortController||L.AbortController;var M=a.i(254799),N=a.i(637776);class O extends Error{constructor(a,b){super(null!=a?a:"Connection is closed"),this.cause=b,this.name="ConnectionClosedError",Object.setPrototypeOf(this,new.target.prototype)}}var P=a.i(955311);let Q={value:null};function R(a,b,c){try{return a.apply(b,c)}catch(a){return Q.value=a,Q}}function S(a){let b={};for(let c=0;c<a.length;c+=2)b[a[c]]=a[c+1];return b}function T(a){let b=[];for(let c in a)Object.prototype.hasOwnProperty.call(a,c)&&void 0!==a[c]&&(b[b.length]=c,b[b.length]=a[c]);return b}function U(a,b){let c=a.getMaxListeners();a.setMaxListeners(c+b)}let V={de:"deduplication",fpof:"failParentOnFailure",cpof:"continueParentOnFailure",idof:"ignoreDependencyOnFailure",kl:"keepLogs",rdof:"removeDependencyOnFailure"},W=Object.assign(Object.assign({},Object.entries(V).reduce((a,[b,c])=>(a[c]=b,a),{})),{debounce:"de"});function X(a){return!!a&&["connect","disconnect","duplicate"].every(b=>"function"==typeof a[b])}function Y(a){return X(a)&&!!a.isCluster}function Z(a){if(a)return`${a.queue}:${a.id}`}let $=/ERR unknown command ['`]\s*client\s*['`]/;function _(a){if(a instanceof O)return!1;let{code:b,message:c}=a;return c!==N.CONNECTION_CLOSED_ERROR_MSG&&!c.includes("ECONNREFUSED")&&"ECONNREFUSED"!==b}let aa=(a,b,c,d="redis")=>{if(c===d){let c=P.valid(P.coerce(a));return P.lt(c,b)}return!1},ab=a=>{let b={};for(let c of Object.entries(a))b[c[0]]=JSON.parse(c[1]);return b};async function ac(a,b,c,d,e,f,g){if(!a)return f();{let h,{tracer:i,contextManager:j}=a,k=j.active();g&&(h=j.fromMetadata(k,g));let l=e?`${d} ${e}`:d,m=i.startSpan(l,{kind:b},h);try{let a,e;return m.setAttributes({[w.QueueName]:c,[w.QueueOperation]:d}),a=b===y.CONSUMER&&h?m.setSpanOnContext(h):m.setSpanOnContext(k),2==f.length&&(e=j.getMetadata(a)),await j.with(a,()=>f(m,e))}catch(a){throw m.recordException(a),a}finally{m.end()}}}(q=z||(z={}))[q.Idle=0]="Idle",q[q.Started=1]="Started",q[q.Terminating=2]="Terminating",q[q.Errored=3]="Errored";try{A=new TextDecoder}catch(a){}var ad=0;let ae=[];var af=ae,ag=0,ah={},ai=0,aj=0,ak=[],al={useRecords:!1,mapsAsObjects:!0};class am{}let an=new am;an.name="MessagePack 0xC1";var ao=!1,ap=2;class aq{constructor(a){a&&(!1===a.useRecords&&void 0===a.mapsAsObjects&&(a.mapsAsObjects=!0),a.sequential&&!1!==a.trusted&&(a.trusted=!0,!a.structures&&!1!=a.useRecords&&(a.structures=[],a.maxSharedStructures||(a.maxSharedStructures=0))),a.structures?a.structures.sharedLength=a.structures.length:a.getStructures&&((a.structures=[]).uninitialized=!0,a.structures.sharedLength=0),a.int64AsNumber&&(a.int64AsType="number")),Object.assign(this,a)}unpack(a,b){if(B)return aT(()=>(aU(),this?this.unpack(a,b):aq.prototype.unpack.call(al,a,b)));a.buffer||a.constructor!==ArrayBuffer||(a="u">typeof Buffer?Buffer.from(a):new Uint8Array(a)),"object"==typeof b?(C=b.end||a.length,ad=b.start||0):(ad=0,C=b>-1?b:a.length),ag=0,aj=0,E=null,af=ae,F=null,B=a;try{H=a.dataView||(a.dataView=new DataView(a.buffer,a.byteOffset,a.byteLength))}catch(b){if(B=null,a instanceof Uint8Array)throw b;throw Error("Source must be a Uint8Array or Buffer but was a "+(a&&"object"==typeof a?a.constructor.name:typeof a))}return this instanceof aq?(ah=this,this.structures?D=this.structures:(!D||D.length>0)&&(D=[])):(ah=al,(!D||D.length>0)&&(D=[])),ar(b)}unpackMultiple(a,b){let c,d=0;try{ao=!0;let e=a.length,f=this?this.unpack(a,e):aW.unpack(a,e);if(b){if(!1===b(f,d,ad))return;for(;ad<e;)if(d=ad,!1===b(ar(),d,ad))return}else{for(c=[f];ad<e;)d=ad,c.push(ar());return c}}catch(a){throw a.lastPosition=d,a.values=c,a}finally{ao=!1,aU()}}_mergeStructures(a,b){this._onLoadedStructures&&(a=this._onLoadedStructures(a)),Object.isFrozen(a=a||[])&&(a=a.map(a=>a.slice(0)));for(let b=0,c=a.length;b<c;b++){let c=a[b];c&&(c.isShared=!0,b>=32&&(c.highByte=b-32>>5))}for(let c in a.sharedLength=a.length,b||[])if(c>=0){let d=a[c],e=b[c];e&&(d&&((a.restoreStructures||(a.restoreStructures=[]))[c]=d),a[c]=e)}return this.structures=a}decode(a,b){return this.unpack(a,b)}}function ar(a){try{let b;if(!ah.trusted&&!ao){let a=D.sharedLength||0;a<D.length&&(D.length=a)}if(ah._readStruct&&B[ad]<64&&B[ad]>=32?(b=ah._readStruct(B,ad,C),B=null,!(a&&a.lazy)&&b&&(b=b.toJSON()),ad=C):b=at(),F&&(ad=F.postBundlePosition,F=null),ao&&(D.restoreStructures=null),ad==C)D&&D.restoreStructures&&as(),D=null,B=null,G&&(G=null);else if(ad>C)throw Error("Unexpected end of MessagePack data");else if(!ao){let a;try{a=JSON.stringify(b,(a,b)=>"bigint"==typeof b?`${b}n`:b).slice(0,100)}catch(b){a="(JSON view not available "+b+")"}throw Error("Data read, but end of buffer not reached "+a)}return b}catch(a){throw D&&D.restoreStructures&&as(),aU(),(a instanceof RangeError||a.message.startsWith("Unexpected end of buffer")||ad>C)&&(a.incomplete=!0),a}}function as(){for(let a in D.restoreStructures)D[a]=D.restoreStructures[a];D.restoreStructures=null}function at(){let a=B[ad++];if(a<160)if(a<128)if(a<64)return a;else{let b=D[63&a]||ah.getStructures&&ax()[63&a];return b?(b.read||(b.read=av(b,63&a)),b.read()):a}else if(a<144){if(a-=128,ah.mapsAsObjects){let b={};for(let c=0;c<a;c++){let a=aM();"__proto__"===a&&(a="__proto_"),b[a]=at()}return b}{let b=new Map;for(let c=0;c<a;c++)b.set(at(),at());return b}}else{let b=Array(a-=144);for(let c=0;c<a;c++)b[c]=at();return ah.freezeData?Object.freeze(b):b}if(a<192){let b=a-160;if(aj>=ad)return E.slice(ad-ai,(ad+=b)-ai);if(0==aj&&C<140){let a=b<16?aH(b):aG(b);if(null!=a)return a}return ay(b)}{let b;switch(a){case 192:return null;case 193:if(F){if((b=at())>0)return F[1].slice(F.position1,F.position1+=b);return F[0].slice(F.position0,F.position0-=b)}return an;case 194:return!1;case 195:return!0;case 196:if(void 0===(b=B[ad++]))throw Error("Unexpected end of buffer");return aJ(b);case 197:return b=H.getUint16(ad),ad+=2,aJ(b);case 198:return b=H.getUint32(ad),ad+=4,aJ(b);case 199:return aK(B[ad++]);case 200:return b=H.getUint16(ad),ad+=2,aK(b);case 201:return b=H.getUint32(ad),ad+=4,aK(b);case 202:if(b=H.getFloat32(ad),ah.useFloat32>2){let a=aV[(127&B[ad])<<1|B[ad+1]>>7];return ad+=4,(a*b+(b>0?.5:-.5)|0)/a}return ad+=4,b;case 203:return b=H.getFloat64(ad),ad+=8,b;case 204:return B[ad++];case 205:return b=H.getUint16(ad),ad+=2,b;case 206:return b=H.getUint32(ad),ad+=4,b;case 207:return"number"===ah.int64AsType?b=0x100000000*H.getUint32(ad)+H.getUint32(ad+4):"string"===ah.int64AsType?b=H.getBigUint64(ad).toString():"auto"===ah.int64AsType?(b=H.getBigUint64(ad))<=BigInt(2)<<BigInt(52)&&(b=Number(b)):b=H.getBigUint64(ad),ad+=8,b;case 208:return H.getInt8(ad++);case 209:return b=H.getInt16(ad),ad+=2,b;case 210:return b=H.getInt32(ad),ad+=4,b;case 211:return"number"===ah.int64AsType?b=0x100000000*H.getInt32(ad)+H.getUint32(ad+4):"string"===ah.int64AsType?b=H.getBigInt64(ad).toString():"auto"===ah.int64AsType?(b=H.getBigInt64(ad))>=BigInt(-2)<<BigInt(52)&&b<=BigInt(2)<<BigInt(52)&&(b=Number(b)):b=H.getBigInt64(ad),ad+=8,b;case 212:if(114==(b=B[ad++]))return aO(63&B[ad++]);{let a=ak[b];if(a)if(a.read)return ad++,a.read(at());else if(a.noBuffer)return ad++,a();else return a(B.subarray(ad,++ad));throw Error("Unknown extension "+b)}case 213:if(114==(b=B[ad]))return ad++,aO(63&B[ad++],B[ad++]);return aK(2);case 214:return aK(4);case 215:return aK(8);case 216:return aK(16);case 217:if(b=B[ad++],aj>=ad)return E.slice(ad-ai,(ad+=b)-ai);return az(b);case 218:if(b=H.getUint16(ad),ad+=2,aj>=ad)return E.slice(ad-ai,(ad+=b)-ai);return aA(b);case 219:if(b=H.getUint32(ad),ad+=4,aj>=ad)return E.slice(ad-ai,(ad+=b)-ai);return aB(b);case 220:return b=H.getUint16(ad),ad+=2,aD(b);case 221:return b=H.getUint32(ad),ad+=4,aD(b);case 222:return b=H.getUint16(ad),ad+=2,aE(b);case 223:return b=H.getUint32(ad),ad+=4,aE(b);default:if(a>=224)return a-256;if(void 0===a){let a=Error("Unexpected end of MessagePack data");throw a.incomplete=!0,a}throw Error("Unknown MessagePack token "+a)}}}let au=/^[a-zA-Z_$][a-zA-Z\d_$]*$/;function av(a,b){function c(){if(c.count++>ap){let d;try{d=a.read=Function("r","return function(){return "+(ah.freezeData?"Object.freeze":"")+"({"+a.map(a=>"__proto__"===a?"__proto_:r()":au.test(a)?a+":r()":"["+JSON.stringify(a)+"]:r()").join(",")+"})}")(at)}catch(a){return ap=1/0,c()}return a.read0=d,0===a.highByte&&(a.read=aw(b,a.read)),d()}let d={};for(let b=0,c=a.length;b<c;b++){let c=a[b];"__proto__"===c&&(c="__proto_"),d[c]=at()}return ah.freezeData?Object.freeze(d):d}return(c.count=0,a.read0=c,0===a.highByte)?aw(b,c):c}let aw=(a,b)=>function(){let c=B[ad++];if(0===c)return b();let d=a<32?-(a+(c<<5)):a+(c<<5),e=D[d]||ax()[d];if(!e)throw Error("Record id is not defined for "+d);return e.read||(e.read=av(e,a)),e.read()};function ax(){let a=aT(()=>(B=null,ah.getStructures()));return D=ah._mergeStructures(a,D)}var ay=aC,az=aC,aA=aC,aB=aC;function aC(a){let b;if(a<16&&(b=aH(a)))return b;if(a>64&&A)return A.decode(B.subarray(ad,ad+=a));let c=ad+a,d=[];for(b="";ad<c;){let a=B[ad++];if((128&a)==0)d.push(a);else if((224&a)==192){let b=(31&a)<<6|63&B[ad++];b<128?d.push(65533):d.push(b)}else if((240&a)==224){let b=(31&a)<<12|(63&B[ad++])<<6|63&B[ad++];b<2048||b>=55296&&b<=57343?d.push(65533):d.push(b)}else if((248&a)==240){let b=(7&a)<<18|(63&B[ad++])<<12|(63&B[ad++])<<6|63&B[ad++];b<65536||b>1114111?d.push(65533):(b>65535&&(b-=65536,d.push(b>>>10&1023|55296),b=56320|1023&b),d.push(b))}else d.push(65533);d.length>=4096&&(b+=aF.apply(String,d),d.length=0)}return d.length>0&&(b+=aF.apply(String,d)),b}function aD(a){let b=Array(a);for(let c=0;c<a;c++)b[c]=at();return ah.freezeData?Object.freeze(b):b}function aE(a){if(ah.mapsAsObjects){let b={};for(let c=0;c<a;c++){let a=aM();"__proto__"===a&&(a="__proto_"),b[a]=at()}return b}{let b=new Map;for(let c=0;c<a;c++)b.set(at(),at());return b}}var aF=String.fromCharCode;function aG(a){let b=ad,c=Array(a);for(let d=0;d<a;d++){let a=B[ad++];if((128&a)>0){ad=b;return}c[d]=a}return aF.apply(String,c)}function aH(a){if(a<4)if(a<2)if(0===a)return"";else{let a=B[ad++];if((128&a)>1){ad-=1;return}return aF(a)}else{let b=B[ad++],c=B[ad++];if((128&b)>0||(128&c)>0){ad-=2;return}if(a<3)return aF(b,c);let d=B[ad++];if((128&d)>0){ad-=3;return}return aF(b,c,d)}{let b=B[ad++],c=B[ad++],d=B[ad++],e=B[ad++];if((128&b)>0||(128&c)>0||(128&d)>0||(128&e)>0){ad-=4;return}if(a<6)if(4===a)return aF(b,c,d,e);else{let a=B[ad++];if((128&a)>0){ad-=5;return}return aF(b,c,d,e,a)}if(a<8){let f=B[ad++],g=B[ad++];if((128&f)>0||(128&g)>0){ad-=6;return}if(a<7)return aF(b,c,d,e,f,g);let h=B[ad++];if((128&h)>0){ad-=7;return}return aF(b,c,d,e,f,g,h)}{let f=B[ad++],g=B[ad++],h=B[ad++],i=B[ad++];if((128&f)>0||(128&g)>0||(128&h)>0||(128&i)>0){ad-=8;return}if(a<10)if(8===a)return aF(b,c,d,e,f,g,h,i);else{let a=B[ad++];if((128&a)>0){ad-=9;return}return aF(b,c,d,e,f,g,h,i,a)}if(a<12){let j=B[ad++],k=B[ad++];if((128&j)>0||(128&k)>0){ad-=10;return}if(a<11)return aF(b,c,d,e,f,g,h,i,j,k);let l=B[ad++];if((128&l)>0){ad-=11;return}return aF(b,c,d,e,f,g,h,i,j,k,l)}{let j=B[ad++],k=B[ad++],l=B[ad++],m=B[ad++];if((128&j)>0||(128&k)>0||(128&l)>0||(128&m)>0){ad-=12;return}if(a<14)if(12===a)return aF(b,c,d,e,f,g,h,i,j,k,l,m);else{let a=B[ad++];if((128&a)>0){ad-=13;return}return aF(b,c,d,e,f,g,h,i,j,k,l,m,a)}{let n=B[ad++],o=B[ad++];if((128&n)>0||(128&o)>0){ad-=14;return}if(a<15)return aF(b,c,d,e,f,g,h,i,j,k,l,m,n,o);let p=B[ad++];if((128&p)>0){ad-=15;return}return aF(b,c,d,e,f,g,h,i,j,k,l,m,n,o,p)}}}}}function aI(){let a,b=B[ad++];if(b<192)a=b-160;else switch(b){case 217:a=B[ad++];break;case 218:a=H.getUint16(ad),ad+=2;break;case 219:a=H.getUint32(ad),ad+=4;break;default:throw Error("Expected string")}return aC(a)}function aJ(a){return ah.copyBuffers?Uint8Array.prototype.slice.call(B,ad,ad+=a):B.subarray(ad,ad+=a)}function aK(a){let b=B[ad++];if(ak[b]){let c;return ak[b](B.subarray(ad,c=ad+=a),a=>{ad=a;try{return at()}finally{ad=c}})}throw Error("Unknown extension type "+b)}var aL=Array(4096);function aM(){let a,b=B[ad++];if(!(b>=160)||!(b<192))return ad--,aN(at());if(b-=160,aj>=ad)return E.slice(ad-ai,(ad+=b)-ai);if(!(0==aj&&C<180))return ay(b);let c=(b<<5^(b>1?H.getUint16(ad):b>0?B[ad]:0))&4095,d=aL[c],e=ad,f=ad+b-3,g=0;if(d&&d.bytes==b){for(;e<f;){if((a=H.getUint32(e))!=d[g++]){e=0x70000000;break}e+=4}for(f+=3;e<f;)if((a=B[e++])!=d[g++]){e=0x70000000;break}if(e===f)return ad=e,d.string;f-=3,e=ad}for(d=[],aL[c]=d,d.bytes=b;e<f;)a=H.getUint32(e),d.push(a),e+=4;for(f+=3;e<f;)a=B[e++],d.push(a);let h=b<16?aH(b):aG(b);return null!=h?d.string=h:d.string=ay(b)}function aN(a){if("string"==typeof a)return a;if("number"==typeof a||"boolean"==typeof a||"bigint"==typeof a)return a.toString();if(null==a)return a+"";if(ah.allowArraysInMapKeys&&Array.isArray(a)&&a.flat().every(a=>["string","number","boolean","bigint"].includes(typeof a)))return a.flat().toString();throw Error(`Invalid property type for record: ${typeof a}`)}let aO=(a,b)=>{let c=at().map(aN),d=a;void 0!==b&&(a=a<32?-((b<<5)+a):(b<<5)+a,c.highByte=b);let e=D[a];return e&&(e.isShared||ao)&&((D.restoreStructures||(D.restoreStructures=[]))[a]=e),D[a]=c,c.read=av(c,d),(c.read0||c.read)()};ak[0]=()=>{},ak[0].noBuffer=!0,ak[66]=a=>{let b=a.byteLength%8||8,c=BigInt(128&a[0]?a[0]-256:a[0]);for(let d=1;d<b;d++)c<<=BigInt(8),c+=BigInt(a[d]);if(a.byteLength!==b){let d=new DataView(a.buffer,a.byteOffset,a.byteLength),e=(a,b)=>{let c=b-a;if(c<=40){let c=d.getBigUint64(a);for(let e=a+8;e<b;e+=8)c<<=BigInt(64),c|=d.getBigUint64(e);return c}let f=a+(c>>4<<3),g=e(a,f),h=e(f,b);return g<<BigInt((b-f)*8)|h};c=c<<BigInt((d.byteLength-b)*8)|e(b,d.byteLength)}return c};let aP={Error,EvalError,RangeError,ReferenceError,SyntaxError,TypeError,URIError,AggregateError:"function"==typeof AggregateError?AggregateError:null};ak[101]=()=>{let a=at();if(!aP[a[0]]){let b=Error(a[1],{cause:a[2]});return b.name=a[0],b}return aP[a[0]](a[1],{cause:a[2]})},ak[105]=a=>{let b;if(!1===ah.structuredClone)throw Error("Structured clone extension is disabled");let c=H.getUint32(ad-4);G||(G=new Map);let d=B[ad],e={target:b=d>=144&&d<160||220==d||221==d?[]:d>=128&&d<144||222==d||223==d?new Map:(d>=199&&d<=201||d>=212&&d<=216)&&115===B[ad+1]?new Set:{}};G.set(c,e);let f=at();if(!e.used)return e.target=f;if(Object.assign(b,f),b instanceof Map)for(let[a,c]of f.entries())b.set(a,c);if(b instanceof Set)for(let a of Array.from(f))b.add(a);return b},ak[112]=a=>{if(!1===ah.structuredClone)throw Error("Structured clone extension is disabled");let b=H.getUint32(ad-4),c=G.get(b);return c.used=!0,c.target},ak[115]=()=>new Set(at());let aQ=["Int8","Uint8","Uint8Clamped","Int16","Uint16","Int32","Uint32","Float32","Float64","BigInt64","BigUint64"].map(a=>a+"Array"),aR="object"==typeof globalThis?globalThis:window;ak[116]=a=>{let b=a[0],c=Uint8Array.prototype.slice.call(a,1).buffer,d=aQ[b];if(!d){if(16===b)return c;if(17===b)return new DataView(c);throw Error("Could not find typed array for code "+b)}return new aR[d](c)},ak[120]=()=>{let a=at();return new RegExp(a[0],a[1])};let aS=[];function aT(a){ah&&ah._onSaveState&&ah._onSaveState();let b=C,c=ad,d=ag,e=ai,f=aj,g=E,h=af,i=G,j=F,k=new Uint8Array(B.slice(0,C)),l=D,m=D.slice(0,D.length),n=ah,o=ao,p=a();return C=b,ad=c,ag=d,ai=e,aj=f,E=g,af=h,G=i,F=j,B=k,ao=o,(D=l).splice(0,D.length,...m),ah=n,H=new DataView(B.buffer,B.byteOffset,B.byteLength),p}function aU(){B=null,G=null,D=null}ak[98]=a=>{let b=(a[0]<<24)+(a[1]<<16)+(a[2]<<8)+a[3],c=ad;return ad+=b-a.length,F=aS,(F=[aI(),aI()]).position0=0,F.position1=0,F.postBundlePosition=ad,ad=c,at()},ak[255]=a=>4==a.length?new Date((0x1000000*a[0]+(a[1]<<16)+(a[2]<<8)+a[3])*1e3):8==a.length?new Date(((a[0]<<22)+(a[1]<<14)+(a[2]<<6)+(a[3]>>2))/1e6+((3&a[3])*0x100000000+0x1000000*a[4]+(a[5]<<16)+(a[6]<<8)+a[7])*1e3):12==a.length?new Date(((a[0]<<24)+(a[1]<<16)+(a[2]<<8)+a[3])/1e6+((128&a[4]?-0x1000000000000:0)+0x10000000000*a[6]+0x100000000*a[7]+0x1000000*a[8]+(a[9]<<16)+(a[10]<<8)+a[11])*1e3):new Date("invalid");let aV=Array(147);for(let a=0;a<256;a++)aV[a]=+("1e"+Math.floor(45.15-.30103*a));var aW=new aq({useRecords:!1});aW.unpack,aW.unpackMultiple,aW.unpack,new Uint8Array(new Float32Array(1).buffer,0,4),aq.SUPPORTS_STRUCT_HOOKS=!0;try{b=new TextEncoder}catch(a){}let aX="u">typeof Buffer,aY=aX?function(a){return Buffer.allocUnsafeSlow(a)}:Uint8Array,aZ=aX?Buffer:Uint8Array,a$=aX?0x100000000:0x7fd00000,a_=0,a0=null,a1=/[\u0080-\uFFFF]/,a2=Symbol("record-id");class a3 extends aq{constructor(a){let i,j,k,l;super(a),this.offset=0;let m=aZ.prototype.utf8Write?function(a,b){return e.utf8Write(a,b,e.byteLength-b)}:!!b&&!!b.encodeInto&&function(a,c){return b.encodeInto(a,e.subarray(c)).written},n=this;a||(a={});let o=a&&a.sequential,p=a.structures||a.saveStructures,q=a.maxSharedStructures;if(null==q&&(q=32*!!p),q>8160)throw Error("Maximum maxSharedStructure is 8160");a.structuredClone&&void 0==a.moreTypes&&(this.moreTypes=!0);let r=a.maxOwnStructures;null==r&&(r=p?32:64),this.structures||!1==a.useRecords||(this.structures=[]);let s=q>32||r+q>64,t=q+64,u=q+r+64;if(u>8256)throw Error("Maximum maxSharedStructure + maxOwnStructure is 8192");let v=[],w=0,x=0;this.pack=this.encode=function(a,b){let c;if(e||(g=(e=new aY(8192)).dataView||(e.dataView=new DataView(e.buffer,0,8192)),a_=0),(h=e.length-10)-a_<2048?(g=(e=new aY(e.length)).dataView||(e.dataView=new DataView(e.buffer,0,e.length)),h=e.length-10,a_=0):a_=a_+7&0x7ffffff8,i=a_,b&bf&&(a_+=255&b),l=n.structuredClone?new Map:null,n.bundleStrings&&"string"!=typeof a?(a0=[]).size=1/0:a0=null,k=n.structures){k.uninitialized&&(k=n._mergeStructures(n.getStructures()));let a=k.sharedLength||0;if(a>q)throw Error("Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to "+k.sharedLength);if(!k.transitions){k.transitions=Object.create(null);for(let b=0;b<a;b++){let a=k[b];if(!a)continue;let c,d=k.transitions;for(let b=0,e=a.length;b<e;b++){let e=a[b];(c=d[e])||(c=d[e]=Object.create(null)),d=c}d[a2]=b+64}this.lastNamedStructuresLength=a}o||(k.nextId=a+64)}j&&(j=!1);try{n._writeStruct&&a&&"object"==typeof a?a.constructor===Object?F(a):a.constructor===Map||Array.isArray(a)||d.some(b=>a instanceof b)?A(a):F(a.toJSON?a.toJSON():a):A(a);let c=a0;if(a0&&a7(i,A,0),l&&l.idsToInsert){let a=l.idsToInsert.sort((a,b)=>a.offset>b.offset?1:-1),b=a.length,d=-1;for(;c&&b>0;){let e=a[--b].offset+i;e<c.stringsPosition+i&&-1===d&&(d=0),e>c.position+i?d>=0&&(d+=6):(d>=0&&(g.setUint32(c.position+i,g.getUint32(c.position+i)+d),d=-1),c=c.previous,b++)}d>=0&&c&&g.setUint32(c.position+i,g.getUint32(c.position+i)+d),(a_+=6*a.length)>h&&G(a_),n.offset=a_;let f=function(a,b){let c,d=6*b.length,e=a.length-d;for(;c=b.pop();){let b=c.offset,f=c.id;a.copyWithin(b+d,b,e);let g=b+(d-=6);a[g++]=214,a[g++]=105,a[g++]=f>>24,a[g++]=f>>16&255,a[g++]=f>>8&255,a[g++]=255&f,e=b}return a}(e.subarray(i,a_),a);return l=null,f}if(n.offset=a_,b&bd)return e.start=i,e.end=a_,e;return e.subarray(i,a_)}catch(a){throw c=a,a}finally{if(k&&(y(),j&&n.saveStructures)){let d=k.sharedLength||0,f=e.subarray(i,a_),g=(n._prepareStructures||function(a,b){return a.isCompatible=a=>{let c=!a||(b.lastNamedStructuresLength||0)===a.length;return c||b._mergeStructures(a),c},a})(k,n);if(!c){if(!1===n.saveStructures(g,g.isCompatible))return k.uninitialized=!0,n.pack(a,b);return n.lastNamedStructuresLength=d,e.length>0x40000000&&(e=null),f}}e.length>0x40000000&&(e=null),b&be&&(a_=i)}};const y=()=>{x<10&&x++;let a=k.sharedLength||0;if(k.length>a&&!o&&(k.length=a),w>1e4)k.transitions=null,x=0,w=0,v.length>0&&(v=[]);else if(v.length>0&&!o){for(let a=0,b=v.length;a<b;a++)v[a][a2]=0;v=[]}},z=a=>{var b=a.length;b<16?e[a_++]=144|b:b<65536?(e[a_++]=220,e[a_++]=b>>8,e[a_++]=255&b):(e[a_++]=221,g.setUint32(a_,b),a_+=4);for(let c=0;c<b;c++)A(a[c])},A=a=>{a_>h&&(e=G(a_));var b,f=typeof a;if("string"===f){let c,d=a.length;if(a0&&d>=4&&d<4096){if((a0.size+=d)>21760){let a,b,c=(a0[0]?3*a0[0].length+a0[1].length:0)+10;a_+c>h&&(e=G(a_+c)),a0.position?(b=a0,e[a_]=200,a_+=3,e[a_++]=98,a=a_-i,a_+=4,a7(i,A,0),g.setUint16(a+i-3,a_-i-a)):(e[a_++]=214,e[a_++]=98,a=a_-i,a_+=4),(a0=["",""]).previous=b,a0.size=0,a0.position=a}let b=a1.test(a);a0[+!b]+=a,e[a_++]=193,A(b?-d:d);return}c=d<32?1:d<256?2:d<65536?3:5;let f=3*d;if(a_+f>h&&(e=G(a_+f)),d<64||!m){let f,g,h,i=a_+c;for(f=0;f<d;f++)(g=a.charCodeAt(f))<128?e[i++]=g:(g<2048?e[i++]=g>>6|192:((64512&g)==55296&&(64512&(h=a.charCodeAt(f+1)))==56320?(g=65536+((1023&g)<<10)+(1023&h),f++,e[i++]=g>>18|240,e[i++]=g>>12&63|128):e[i++]=g>>12|224,e[i++]=g>>6&63|128),e[i++]=63&g|128);b=i-a_-c}else b=m(a,a_+c);b<32?e[a_++]=160|b:b<256?(c<2&&e.copyWithin(a_+2,a_+1,a_+1+b),e[a_++]=217,e[a_++]=b):b<65536?(c<3&&e.copyWithin(a_+3,a_+2,a_+2+b),e[a_++]=218,e[a_++]=b>>8,e[a_++]=255&b):(c<5&&e.copyWithin(a_+5,a_+3,a_+3+b),e[a_++]=219,g.setUint32(a_,b),a_+=4),a_+=b}else if("number"===f)if(a>>>0===a)a<32||a<128&&!1===this.useRecords||a<64&&!this._writeStruct?e[a_++]=a:a<256?(e[a_++]=204,e[a_++]=a):a<65536?(e[a_++]=205,e[a_++]=a>>8,e[a_++]=255&a):(e[a_++]=206,g.setUint32(a_,a),a_+=4);else if((0|a)===a)a>=-32?e[a_++]=256+a:a>=-128?(e[a_++]=208,e[a_++]=a+256):a>=-32768?(e[a_++]=209,g.setInt16(a_,a),a_+=2):(e[a_++]=210,g.setInt32(a_,a),a_+=4);else{let b;if((b=this.useFloat32)>0&&a<0x100000000&&a>=-0x80000000){let c;if(e[a_++]=202,g.setFloat32(a_,a),b<4||(0|(c=a*aV[(127&e[a_])<<1|e[a_+1]>>7]))===c){a_+=4;return}a_--}e[a_++]=203,g.setFloat64(a_,a),a_+=8}else if("object"===f||"function"===f)if(a){if(l){let b=l.get(a);if(b){b.id||(b.id=(l.idsToInsert||(l.idsToInsert=[])).push(b)),e[a_++]=214,e[a_++]=112,g.setUint32(a_,b.id),a_+=4;return}l.set(a,{offset:a_-i})}let j=a.constructor;if(j===Object)E(a);else if(j===Array)z(a);else if(j===Map)if(this.mapAsEmptyObject)e[a_++]=128;else for(let[c,d]of((b=a.size)<16?e[a_++]=128|b:b<65536?(e[a_++]=222,e[a_++]=b>>8,e[a_++]=255&b):(e[a_++]=223,g.setUint32(a_,b),a_+=4),a))A(c),A(d);else{for(let b=0,f=c.length;b<f;b++)if(a instanceof d[b]){let d,f=c[b];if(f.write){f.type&&(e[a_++]=212,e[a_++]=f.type,e[a_++]=0);let b=f.write.call(this,a);b===a?Array.isArray(a)?z(a):E(a):A(b);return}let i=e,j=g,k=a_;e=null;try{d=f.pack.call(this,a,a=>(e=i,i=null,(a_+=a)>h&&G(a_),{target:e,targetView:g,position:a_-a}),A)}finally{i&&(e=i,g=j,a_=k,h=e.length-10)}d&&(d.length+a_>h&&G(d.length+a_),a_=a6(d,e,a_,f.type));return}if(Array.isArray(a))z(a);else{if(a.toJSON){let b=a.toJSON();if(b!==a)return A(b)}if("function"===f)return A(this.writeFunction&&this.writeFunction(a));E(a)}}}else e[a_++]=192;else if("boolean"===f)e[a_++]=a?195:194;else if("bigint"===f){if(a<0x8000000000000000&&a>=-0x8000000000000000)e[a_++]=211,g.setBigInt64(a_,a);else if(a<0xffffffffffffffff&&a>0)e[a_++]=207,g.setBigUint64(a_,a);else if(this.largeBigIntToFloat)e[a_++]=203,g.setFloat64(a_,Number(a));else if(this.largeBigIntToString)return A(a.toString());else if(this.useBigIntExtension||this.moreTypes){let b,c=a<0?BigInt(-1):BigInt(0);if(a>>BigInt(65536)===c){let d=BigInt(0xffffffffffffffff)-BigInt(1),e=[];for(;e.push(a&d),a>>BigInt(63)!==c;)a>>=BigInt(64);(b=new Uint8Array(new BigUint64Array(e).buffer)).reverse()}else{let c=a<0,d=(c?~a:a).toString(16);if(d.length%2?d="0"+d:parseInt(d.charAt(0),16)>=8&&(d="00"+d),aX)b=Buffer.from(d,"hex");else{b=new Uint8Array(d.length/2);for(let a=0;a<b.length;a++)b[a]=parseInt(d.slice(2*a,2*a+2),16)}if(c)for(let a=0;a<b.length;a++)b[a]=~b[a]}b.length+a_>h&&G(b.length+a_),a_=a6(b,e,a_,66);return}else throw RangeError(a+" was too large to fit in MessagePack 64-bit integer format, use useBigIntExtension, or set largeBigIntToFloat to convert to float-64, or set largeBigIntToString to convert to string");a_+=8}else if("undefined"===f)this.encodeUndefinedAsNil?e[a_++]=192:(e[a_++]=212,e[a_++]=0,e[a_++]=0);else throw Error("Unknown type: "+f)},B=this.variableMapSize||this.coercibleKeyAsNumber||this.skipValues?a=>{let b,c;if(this.skipValues)for(let c in b=[],a)("function"!=typeof a.hasOwnProperty||a.hasOwnProperty(c))&&!this.skipValues.includes(a[c])&&b.push(c);else b=Object.keys(a);let d=b.length;if(d<16?e[a_++]=128|d:d<65536?(e[a_++]=222,e[a_++]=d>>8,e[a_++]=255&d):(e[a_++]=223,g.setUint32(a_,d),a_+=4),this.coercibleKeyAsNumber)for(let e=0;e<d;e++){let d=Number(c=b[e]);A(isNaN(d)?c:d),A(a[c])}else for(let e=0;e<d;e++)A(c=b[e]),A(a[c])}:a=>{e[a_++]=222;let b=a_-i;a_+=2;let c=0;for(let b in a)("function"!=typeof a.hasOwnProperty||a.hasOwnProperty(b))&&(A(b),A(a[b]),c++);if(c>65535)throw Error('Object is too large to serialize with fast 16-bit map size, use the "variableMapSize" option to serialize this object');e[b+++i]=c>>8,e[b+i]=255&c},C=!1===this.useRecords?B:a.progressiveRecords&&!s?a=>{let b,c,d=k.transitions||(k.transitions=Object.create(null)),f=a_++-i;for(let e in a)if("function"!=typeof a.hasOwnProperty||a.hasOwnProperty(e)){if(c=d[e])d=c;else{let g=Object.keys(a),h=d;d=k.transitions;let j=0;for(let a=0,b=g.length;a<b;a++){let b=g[a];!(c=d[b])&&(c=d[b]=Object.create(null),j++),d=c}f+i+1==a_?(a_--,H(d,g,j)):I(d,g,f,j),b=!0,d=h[e]}A(a[e])}if(!b){let b=d[a2];b?e[f+i]=b:I(d,Object.keys(a),f,0)}}:a=>{let b,c=k.transitions||(k.transitions=Object.create(null)),d=0;for(let e in a)("function"!=typeof a.hasOwnProperty||a.hasOwnProperty(e))&&(!(b=c[e])&&(b=c[e]=Object.create(null),d++),c=b);let f=c[a2];for(let b in f?f>=96&&s?(e[a_++]=(31&(f-=96))+96,e[a_++]=f>>5):e[a_++]=f:H(c,c.__keys__||Object.keys(a),d),a)("function"!=typeof a.hasOwnProperty||a.hasOwnProperty(b))&&A(a[b])},D="function"==typeof this.useRecords&&this.useRecords,E=D?a=>{D(a)?C(a):B(a)}:C,F=a=>{let b=n._writeStruct(a,e,i,a_,k,G,(a,b,c)=>{if(c)return j=!0;a_=b;let d=e;return(A(a),y(),d!==e)?{position:a_,targetView:g,target:e}:a_});if(0===b)return E(a);a_=b},G=a=>{let b;if(a>0x1000000){if(a-i>a$)throw Error("Packed buffer would be larger than maximum buffer size");b=Math.min(a$,4096*Math.round(Math.max((a-i)*(a>0x4000000?1.25:2),4194304)/4096))}else b=(Math.max(a-i<<2,e.length-1)>>12)+1<<12;let c=new aY(b);return g=c.dataView||(c.dataView=new DataView(c.buffer,0,b)),a=Math.min(a,e.length),e.copy?e.copy(c,0,i,a):c.set(e.slice(i,a)),a_-=i,i=0,h=c.length-10,e=c},H=(a,b,c)=>{let d=k.nextId;d||(d=64),d<t&&this.shouldShareStructure&&!this.shouldShareStructure(b)?((d=k.nextOwnId)<u||(d=t),k.nextOwnId=d+1):(d>=u&&(d=t),k.nextId=d+1);let f=b.highByte=d>=96&&s?d-96>>5:-1;a[a2]=d,a.__keys__=b,k[d-64]=b,d<t?(b.isShared=!0,k.sharedLength=d-63,j=!0,f>=0?(e[a_++]=(31&d)+96,e[a_++]=f):e[a_++]=d):(f>=0?(e[a_++]=213,e[a_++]=114,e[a_++]=(31&d)+96,e[a_++]=f):(e[a_++]=212,e[a_++]=114,e[a_++]=d),c&&(w+=x*c),v.length>=r&&(v.shift()[a2]=0),v.push(a),A(b))},I=(a,b,c,d)=>{let g=e,j=a_,k=h,l=i;a_=0,i=0,(e=f)||(f=e=new aY(8192)),h=e.length-10,H(a,b,d),f=e;let m=a_;if(e=g,a_=j,h=k,i=l,m>1){let a=a_+m-1;a>h&&G(a);let b=c+i;e.copyWithin(b+m,b+1,a_),e.set(f.slice(0,m),b),a_=a}else e[c+i]=f[0]}}useBuffer(a){(e=a).dataView||(e.dataView=new DataView(e.buffer,e.byteOffset,e.byteLength)),g=e.dataView,a_=0}set position(a){a_=a}get position(){return a_}clearSharedData(){this.structures&&(this.structures=[]),this.typedStructs&&(this.typedStructs=[])}}function a4(a,b,c,d){let e=a.byteLength;if(e+1<256){var{target:f,position:g}=c(4+e);f[g++]=199,f[g++]=e+1}else if(e+1<65536){var{target:f,position:g}=c(5+e);f[g++]=200,f[g++]=e+1>>8,f[g++]=e+1&255}else{var{target:f,position:g,targetView:h}=c(7+e);f[g++]=201,h.setUint32(g,e+1),g+=4}f[g++]=116,f[g++]=b,a.buffer||(a=new Uint8Array(a)),f.set(new Uint8Array(a.buffer,a.byteOffset,a.byteLength),g)}function a5(a,b){let c=a.byteLength;if(c<256){var d,e,{target:d,position:e}=b(c+2);d[e++]=196,d[e++]=c}else if(c<65536){var{target:d,position:e}=b(c+3);d[e++]=197,d[e++]=c>>8,d[e++]=255&c}else{var{target:d,position:e,targetView:f}=b(c+5);d[e++]=198,f.setUint32(e,c),e+=4}d.set(a,e)}function a6(a,b,c,d){let e=a.length;switch(e){case 1:b[c++]=212;break;case 2:b[c++]=213;break;case 4:b[c++]=214;break;case 8:b[c++]=215;break;case 16:b[c++]=216;break;default:e<256?(b[c++]=199,b[c++]=e):(e<65536?(b[c++]=200,b[c++]=e>>8):(b[c++]=201,b[c++]=e>>24,b[c++]=e>>16&255,b[c++]=e>>8&255),b[c++]=255&e)}return b[c++]=d,b.set(a,c),c+=e}function a7(a,b,c){if(a0.length>0){g.setUint32(a0.position+a,a_+c-a0.position-a),a0.stringsPosition=a_-a;let d=a0;a0=null,b(d[0]),b(d[1])}}d=[Date,Set,Error,RegExp,ArrayBuffer,Object.getPrototypeOf(Uint8Array.prototype).constructor,DataView,am],c=[{pack(a,b,c){let d=a.getTime()/1e3;if((this.useTimestamp32||0===a.getMilliseconds())&&d>=0&&d<0x100000000){let{target:a,targetView:c,position:e}=b(6);a[e++]=214,a[e++]=255,c.setUint32(e,d)}else if(d>0&&d<0x100000000){let{target:c,targetView:e,position:f}=b(10);c[f++]=215,c[f++]=255,e.setUint32(f,4e6*a.getMilliseconds()+(d/1e3/0x100000000|0)),e.setUint32(f+4,d)}else if(isNaN(d)){if(this.onInvalidDate)return b(0),c(this.onInvalidDate());let{target:a,targetView:d,position:e}=b(3);a[e++]=212,a[e++]=255,a[e++]=255}else{let{target:c,targetView:e,position:f}=b(15);c[f++]=199,c[f++]=12,c[f++]=255,e.setUint32(f,1e6*a.getMilliseconds()),e.setBigInt64(f+4,BigInt(Math.floor(d)))}}},{pack(a,b,c){if(this.setAsEmptyObject)return b(0),c({});let d=Array.from(a),{target:e,position:f}=b(3*!!this.moreTypes);this.moreTypes&&(e[f++]=212,e[f++]=115,e[f++]=0),c(d)}},{pack(a,b,c){let{target:d,position:e}=b(3*!!this.moreTypes);this.moreTypes&&(d[e++]=212,d[e++]=101,d[e++]=0),c([a.name,a.message,a.cause])}},{pack(a,b,c){let{target:d,position:e}=b(3*!!this.moreTypes);this.moreTypes&&(d[e++]=212,d[e++]=120,d[e++]=0),c([a.source,a.flags])}},{pack(a,b){this.moreTypes?a4(a,16,b):a5(aX?Buffer.from(a):new Uint8Array(a),b)}},{pack(a,b){let c=a.constructor;c!==aZ&&this.moreTypes?a4(a,aQ.indexOf(c.name),b):a5(a,b)}},{pack(a,b){this.moreTypes?a4(a,17,b):a5(aX?Buffer.from(a):new Uint8Array(a),b)}},{pack(a,b){let{target:c,position:d}=b(1);c[d]=193}}],a3.SUPPORTS_STRUCT_HOOKS=!0;let a8=new a3({useRecords:!1});a8.pack,a8.pack;let{NEVER:a9,ALWAYS:ba,DECIMAL_ROUND:bb,DECIMAL_FIT:bc}={NEVER:0,ALWAYS:1,DECIMAL_ROUND:3,DECIMAL_FIT:4},bd=512,be=1024,bf=2048;var bg=a.i(688947);if(bg.Transform,bg.Transform,a.i(362562),void 0===process.env.MSGPACKR_NATIVE_ACCELERATION_DISABLED||"true"!==process.env.MSGPACKR_NATIVE_ACCELERATION_DISABLED.toLowerCase()){let b;try{(b=a.r(80536))&&function(a){function b(b){return function(c){let d=af[ag++];if(null==d){if(F)return aC(c);let e=B.byteOffset,f=a(ad-b+e,C+e,B.buffer);if("string"==typeof f)d=f,af=ae;else if(ag=1,aj=1,void 0===(d=(af=f)[0]))throw Error("Unexpected end of buffer")}let e=d.length;return e<=c?(ad+=c,d):(E=d,ai=ad,aj=ad+e,ad+=c,d.slice(0,c))}}ay=b(1),az=b(2),aA=b(3),aB=b(5)}(b.extractStrings)}catch(a){}}let bh="5.80.10";class bi extends Error{constructor(a="bullmq:unrecoverable"){super(a),this.name=this.constructor.name,Object.setPrototypeOf(this,new.target.prototype)}}let bj=new a3({useRecords:!1,encodeUndefinedAsNil:!0}).pack;class bk{constructor(a){this.queue=a,this.version=bh;const b=this.queue.keys;this.moveToFinishedKeys=[b.wait,b.active,b.prioritized,b.events,b.stalled,b.limiter,b.delayed,b.paused,b.meta,b.pc,void 0,void 0,void 0,void 0]}execCommand(a,b,c){let d=`${b}:${this.version}`;return a.runCommand(d,c)}async isJobInList(a,b){let c=await this.queue.client;return Number.isInteger(aa(this.queue.redisVersion,"6.0.6",this.queue.databaseType)?await this.execCommand(c,"isJobInList",[a,b]):await c.lpos(a,b))}addDelayedJobArgs(a,b,c){let d=this.queue.keys,e=[d.marker,d.meta,d.id,d.delayed,d.completed,d.events];return e.push(bj(c),a.data,b),e}addDelayedJob(a,b,c,d){let e=this.addDelayedJobArgs(b,c,d);return this.execCommand(a,"addDelayedJob",e)}addPrioritizedJobArgs(a,b,c){let d=this.queue.keys,e=[d.marker,d.meta,d.id,d.prioritized,d.delayed,d.completed,d.active,d.events,d.pc];return e.push(bj(c),a.data,b),e}addPrioritizedJob(a,b,c,d){let e=this.addPrioritizedJobArgs(b,c,d);return this.execCommand(a,"addPrioritizedJob",e)}addParentJobArgs(a,b,c){let d=this.queue.keys,e=[d.meta,d.id,d.delayed,d["waiting-children"],d.completed,d.events];return e.push(bj(c),a.data,b),e}addParentJob(a,b,c,d){let e=this.addParentJobArgs(b,c,d);return this.execCommand(a,"addParentJob",e)}addStandardJobArgs(a,b,c){let d=this.queue.keys,e=[d.wait,d.paused,d.meta,d.id,d.completed,d.delayed,d.active,d.events,d.marker];return e.push(bj(c),a.data,b),e}addStandardJob(a,b,c,d){let e=this.addStandardJobArgs(b,c,d);return this.execCommand(a,"addStandardJob",e)}async addJob(a,b,c,d,e={}){let f,g,h=this.queue.keys,i=b.parent,j=[h[""],void 0!==d?d:"",b.name,b.timestamp,b.parentKey||null,e.parentDependenciesKey||null,i,b.repeatJobKey,b.deduplicationId?`${h.de}:${b.deduplicationId}`:null];if(c.repeat){let a=Object.assign({},c.repeat);a.startDate&&(a.startDate=+new Date(a.startDate)),a.endDate&&(a.endDate=+new Date(a.endDate)),f=bj(Object.assign(Object.assign({},c),{repeat:a}))}else f=bj(c);if((g=e.addToWaitingChildren?await this.addParentJob(a,b,f,j):"number"==typeof c.delay&&c.delay>0?await this.addDelayedJob(a,b,f,j):c.priority?await this.addPrioritizedJob(a,b,f,j):await this.addStandardJob(a,b,f,j))<0)throw this.finishedErrors({code:g,parentKey:e.parentKey,command:"addJob"});return g}pauseArgs(a){let b="wait",c="paused";a||(b="paused",c="wait");let d=[b,c,"meta","prioritized"].map(a=>this.queue.toKey(a));return d.push(this.queue.keys.events,this.queue.keys.delayed,this.queue.keys.marker),d.concat([a?"paused":"resumed"])}async pause(a){let b=await this.queue.client,c=this.pauseArgs(a);return this.execCommand(b,"pause",c)}addRepeatableJobArgs(a,b,c,d){let e=this.queue.keys;return[e.repeat,e.delayed].concat([b,bj(c),d,a,e[""]])}async addRepeatableJob(a,b,c,d){let e=await this.queue.client,f=this.addRepeatableJobArgs(a,b,c,d);return this.execCommand(e,"addRepeatableJob",f)}async removeDeduplicationKey(a,b){let c=await this.queue.client,d=this.queue.keys,e=[`${d.de}:${a}`];return this.execCommand(c,"removeDeduplicationKey",e.concat([b]))}async addJobScheduler(a,b,c,d,e,f,g){let h=await this.queue.client,i=this.queue.keys,j=[i.repeat,i.delayed,i.wait,i.paused,i.meta,i.prioritized,i.marker,i.id,i.events,i.pc,i.active],k=[b,bj(e),a,c,bj(d),bj(f),Date.now(),i[""],g?this.queue.toKey(g):""],l=await this.execCommand(h,"addJobScheduler",j.concat(k));if("number"==typeof l&&l<0)throw this.finishedErrors({code:l,command:"addJobScheduler"});return l}async updateRepeatableJobMillis(a,b,c,d){let e=[this.queue.keys.repeat,c,b,d];return this.execCommand(a,"updateRepeatableJobMillis",e)}async updateJobSchedulerNextMillis(a,b,c,d,e){let f=await this.queue.client,g=this.queue.keys,h=[g.repeat,g.delayed,g.wait,g.paused,g.meta,g.prioritized,g.marker,g.id,g.events,g.pc,e?this.queue.toKey(e):"",g.active],i=[b,a,c,bj(d),Date.now(),g[""],e];return this.execCommand(f,"updateJobScheduler",h.concat(i))}removeRepeatableArgs(a,b,c){let d=this.queue.keys;return[d.repeat,d.delayed,d.events].concat([a,this.getRepeatConcatOptions(b,c),c,d[""]])}getRepeatConcatOptions(a,b){return b&&b.split(":").length>2?b:a}async removeRepeatable(a,b,c){let d=await this.queue.client,e=this.removeRepeatableArgs(a,b,c);return this.execCommand(d,"removeRepeatable",e)}async removeJobScheduler(a){let b=await this.queue.client,c=this.queue.keys,d=[c.repeat,c.delayed,c.events],e=[a,c[""]];return this.execCommand(b,"removeJobScheduler",d.concat(e))}removeArgs(a,b){let c=[a,"repeat"].map(a=>this.queue.toKey(a)),d=[a,+!!b,this.queue.toKey("")];return c.concat(d)}async remove(a,b){let c=await this.queue.client,d=this.removeArgs(a,b),e=await this.execCommand(c,"removeJob",d);if(e<0)throw this.finishedErrors({code:e,jobId:a,command:"removeJob"});return e}async removeUnprocessedChildren(a){let b=await this.queue.client,c=[this.queue.toKey(a),this.queue.keys.meta,this.queue.toKey(""),a];await this.execCommand(b,"removeUnprocessedChildren",c)}async extendLock(a,b,c,d){d=d||await this.queue.client;let e=[this.queue.toKey(a)+":lock",this.queue.keys.stalled,b,c,a];return this.execCommand(d,"extendLock",e)}async extendLocks(a,b,c){let d=await this.queue.client,e=[this.queue.keys.stalled,this.queue.toKey(""),bj(b),bj(a),c];return this.execCommand(d,"extendLocks",e)}async updateData(a,b){let c=await this.queue.client,d=[this.queue.toKey(a.id)],e=JSON.stringify(b),f=await this.execCommand(c,"updateData",d.concat([e]));if(f<0)throw this.finishedErrors({code:f,jobId:a.id,command:"updateData"})}async updateProgress(a,b){let c=await this.queue.client,d=[this.queue.toKey(a),this.queue.keys.events,this.queue.keys.meta],e=JSON.stringify(b),f=await this.execCommand(c,"updateProgress",d.concat([a,e]));if(f<0)throw this.finishedErrors({code:f,jobId:a,command:"updateProgress"})}async addLog(a,b,c){let d=await this.queue.client,e=[this.queue.toKey(a),this.queue.toKey(a)+":logs"],f=await this.execCommand(d,"addLog",e.concat([a,b,c||""]));if(f<0)throw this.finishedErrors({code:f,jobId:a,command:"addLog"});return f}moveToFinishedArgs(a,b,c,d,e,f,g,h=!0,i){var j,k,l,m,n,o,p;let q=this.queue.keys,r=this.queue.opts,s="completed"===e?r.removeOnComplete:r.removeOnFail,t=this.queue.toKey(`metrics:${e}`),u=this.moveToFinishedKeys;u[10]=q[e],u[11]=this.queue.toKey(null!=(j=a.id)?j:""),u[12]=t,u[13]=this.queue.keys.marker;let v=this.getKeepJobs(d,s),w=[a.id,g,c,void 0===b?"null":b,e,!h||this.queue.closing?0:1,q[""],bj({token:f,name:r.name,keepJobs:v,limiter:r.limiter,lockDuration:r.lockDuration,attempts:a.opts.attempts,maxMetricsSize:(null==(k=r.metrics)?void 0:k.maxDataPoints)?null==(l=r.metrics)?void 0:l.maxDataPoints:"",fpof:!!(null==(m=a.opts)?void 0:m.failParentOnFailure),cpof:!!(null==(n=a.opts)?void 0:n.continueParentOnFailure),idof:!!(null==(o=a.opts)?void 0:o.ignoreDependencyOnFailure),rdof:!!(null==(p=a.opts)?void 0:p.removeDependencyOnFailure)}),i?bj(T(i)):void 0];return u.concat(w)}getKeepJobs(a,b){return void 0===a?b||{count:a?0:-1}:"object"==typeof a?a:"number"==typeof a?{count:a}:{count:a?0:-1}}async moveToFinished(a,b){let c=await this.queue.client,d=await this.execCommand(c,"moveToFinished",b);if(d<0)throw this.finishedErrors({code:d,jobId:a,command:"moveToFinished",state:"active"});if(void 0!==d)return bl(d)}drainArgs(a){let b=this.queue.keys;return[b.wait,b.paused,b.delayed,b.prioritized,b.repeat].concat([b[""],a?"1":"0"])}async drain(a){let b=await this.queue.client,c=this.drainArgs(a);return this.execCommand(b,"drain",c)}removeChildDependencyArgs(a,b){return[this.queue.keys[""]].concat([this.queue.toKey(a),b])}async removeChildDependency(a,b){let c=await this.queue.client,d=this.removeChildDependencyArgs(a,b),e=await this.execCommand(c,"removeChildDependency",d);switch(e){case 0:return!0;case 1:return!1;default:throw this.finishedErrors({code:e,jobId:a,parentKey:b,command:"removeChildDependency"})}}getRangesArgs(a,b,c,d){let e=this.queue.keys,f=a.map(a=>"waiting"===a?"wait":a);return[e[""]].concat([b,c,d?"1":"0",...f])}async getRanges(a,b=0,c=1,d=!1){let e=await this.queue.client,f=this.getRangesArgs(a,b,c,d);return await this.execCommand(e,"getRanges",f)}getCountsArgs(a){let b=this.queue.keys,c=a.map(a=>"waiting"===a?"wait":a);return[b[""]].concat([...c])}async getCounts(a){let b=await this.queue.client,c=this.getCountsArgs(a);return await this.execCommand(b,"getCounts",c)}getCountsPerPriorityArgs(a){return[this.queue.keys.wait,this.queue.keys.paused,this.queue.keys.meta,this.queue.keys.prioritized].concat(a)}async getCountsPerPriority(a){let b=await this.queue.client,c=this.getCountsPerPriorityArgs(a);return await this.execCommand(b,"getCountsPerPriority",c)}getDependencyCountsArgs(a,b){return[`${a}:processed`,`${a}:dependencies`,`${a}:failed`,`${a}:unsuccessful`].map(a=>this.queue.toKey(a)).concat(b)}async getDependencyCounts(a,b){let c=await this.queue.client,d=this.getDependencyCountsArgs(a,b);return await this.execCommand(c,"getDependencyCounts",d)}moveToCompletedArgs(a,b,c,d,e=!1){let f=Date.now();return this.moveToFinishedArgs(a,b,"returnvalue",c,"completed",d,f,e)}moveToFailedArgs(a,b,c,d,e=!1,f){let g=Date.now();return this.moveToFinishedArgs(a,b,"failedReason",c,"failed",d,g,e,f)}async isFinished(a,b=!1){let c=await this.queue.client,d=["completed","failed",a].map(a=>this.queue.toKey(a));return this.execCommand(c,"isFinished",d.concat([a,b?"1":""]))}async getState(a){let b=await this.queue.client,c=["completed","failed","delayed","active","wait","paused","waiting-children","prioritized"].map(a=>this.queue.toKey(a));return aa(this.queue.redisVersion,"6.0.6",this.queue.databaseType)?this.execCommand(b,"getState",c.concat([a])):this.execCommand(b,"getStateV2",c.concat([a]))}async changeDelay(a,b){let c=await this.queue.client,d=this.changeDelayArgs(a,b),e=await this.execCommand(c,"changeDelay",d);if(e<0)throw this.finishedErrors({code:e,jobId:a,command:"changeDelay",state:"delayed"})}changeDelayArgs(a,b){let c=Date.now();return[this.queue.keys.delayed,this.queue.keys.meta,this.queue.keys.marker,this.queue.keys.events].concat([b,JSON.stringify(c),a,this.queue.toKey(a)])}async changePriority(a,b=0,c=!1){let d=await this.queue.client,e=this.changePriorityArgs(a,b,c),f=await this.execCommand(d,"changePriority",e);if(f<0)throw this.finishedErrors({code:f,jobId:a,command:"changePriority"})}changePriorityArgs(a,b=0,c=!1){return[this.queue.keys.wait,this.queue.keys.paused,this.queue.keys.meta,this.queue.keys.prioritized,this.queue.keys.active,this.queue.keys.pc,this.queue.keys.marker].concat([b,this.queue.toKey(""),a,+!!c])}moveToDelayedArgs(a,b,c,d,e={}){let f=this.queue.keys,g=this.queue.opts,h=[f.marker,f.active,f.prioritized,f.delayed,this.queue.toKey(a),f.events,f.meta,f.stalled,f.wait,f.limiter,f.paused,f.pc],i=e.fetchNext&&!this.queue.closing?1:0;return h.concat([this.queue.keys[""],b,a,c,d,e.skipAttempt?"1":"0",e.fieldsToUpdate?bj(T(e.fieldsToUpdate)):void 0,i,i?bj({token:c,lockDuration:g.lockDuration,limiter:g.limiter,name:g.name}):void 0])}moveToWaitingChildrenArgs(a,b,c){let d=Date.now(),e=Z(c.child);return["active","waiting-children",a,`${a}:dependencies`,`${a}:unsuccessful`,"stalled","events"].map(a=>this.queue.toKey(a)).concat([b,null!=e?e:"",JSON.stringify(d),a,this.queue.toKey("")])}isMaxedArgs(){let a=this.queue.keys;return[a.meta,a.active]}async isMaxed(){let a=await this.queue.client,b=this.isMaxedArgs();return!!await this.execCommand(a,"isMaxed",b)}async moveToDelayed(a,b,c,d="0",e={}){let f=await this.queue.client,g=this.moveToDelayedArgs(a,b,d,c,e),h=await this.execCommand(f,"moveToDelayed",g);if(h<0)throw this.finishedErrors({code:h,jobId:a,command:"moveToDelayed",state:"active"});if(void 0!==h)return bl(h)}async moveToWaitingChildren(a,b,c={}){let d=await this.queue.client,e=this.moveToWaitingChildrenArgs(a,b,c),f=await this.execCommand(d,"moveToWaitingChildren",e);switch(f){case 0:return!0;case 1:return!1;default:throw this.finishedErrors({code:f,jobId:a,command:"moveToWaitingChildren",state:"active"})}}getRateLimitTtlArgs(a){return[this.queue.keys.limiter,this.queue.keys.meta].concat([null!=a?a:"0"])}async getRateLimitTtl(a){let b=await this.queue.client,c=this.getRateLimitTtlArgs(a);return this.execCommand(b,"getRateLimitTtl",c)}async cleanJobsInSet(a,b,c=0){let d=await this.queue.client;return this.execCommand(d,"cleanJobsInSet",[this.queue.toKey(a),this.queue.toKey("events"),this.queue.toKey("repeat"),this.queue.toKey(""),b,c,a])}getJobSchedulerArgs(a){return[this.queue.keys.repeat].concat([a])}async getJobScheduler(a){let b=await this.queue.client,c=this.getJobSchedulerArgs(a);return this.execCommand(b,"getJobScheduler",c)}retryJobArgs(a,b,c,d={}){return[this.queue.keys.active,this.queue.keys.wait,this.queue.keys.paused,this.queue.toKey(a),this.queue.keys.meta,this.queue.keys.events,this.queue.keys.delayed,this.queue.keys.prioritized,this.queue.keys.pc,this.queue.keys.marker,this.queue.keys.stalled].concat([this.queue.toKey(""),Date.now(),(b?"R":"L")+"PUSH",a,c,d.fieldsToUpdate?bj(T(d.fieldsToUpdate)):void 0])}async retryJob(a,b,c="0",d={}){let e=await this.queue.client,f=this.retryJobArgs(a,b,c,d),g=await this.execCommand(e,"retryJob",f);if(g<0)throw this.finishedErrors({code:g,jobId:a,command:"retryJob",state:"active"})}moveJobsToWaitArgs(a,b,c){return[this.queue.toKey(""),this.queue.keys.events,this.queue.toKey(a),this.queue.toKey("wait"),this.queue.toKey("paused"),this.queue.keys.meta,this.queue.keys.active,this.queue.keys.marker].concat([b,c,a])}async retryJobs(a="failed",b=1e3,c=new Date().getTime()){let d=await this.queue.client,e=this.moveJobsToWaitArgs(a,b,c);return this.execCommand(d,"moveJobsToWait",e)}async promoteJobs(a=1e3){let b=await this.queue.client,c=this.moveJobsToWaitArgs("delayed",a,Number.MAX_VALUE);return this.execCommand(b,"moveJobsToWait",c)}async reprocessJob(a,b,c={}){let d=await this.queue.client,e=[this.queue.toKey(a.id),this.queue.keys.events,this.queue.toKey(b),this.queue.keys.wait,this.queue.keys.meta,this.queue.keys.paused,this.queue.keys.active,this.queue.keys.marker],f=[a.id,(a.opts.lifo?"R":"L")+"PUSH","failed"===b?"failedReason":"returnvalue",b,c.resetAttemptsMade?"1":"0",c.resetAttemptsStarted?"1":"0"],g=await this.execCommand(d,"reprocessJob",e.concat(f));if(1!==g)throw this.finishedErrors({code:g,jobId:a.id,command:"reprocessJob",state:b})}async getMetrics(a,b=0,c=-1){let d=await this.queue.client,e=[this.queue.toKey(`metrics:${a}`),this.queue.toKey(`metrics:${a}:data`)];return await this.execCommand(d,"getMetrics",e.concat([b,c]))}async moveToActive(a,b,c){let d=this.queue.opts,e=this.queue.keys,f=[e.wait,e.active,e.prioritized,e.events,e.stalled,e.limiter,e.delayed,e.paused,e.meta,e.pc,e.marker],g=[e[""],Date.now(),bj({token:b,lockDuration:d.lockDuration,limiter:d.limiter,name:c})];return bl(await this.execCommand(a,"moveToActive",f.concat(g)))}async promote(a){let b=await this.queue.client,c=[this.queue.keys.delayed,this.queue.keys.wait,this.queue.keys.paused,this.queue.keys.meta,this.queue.keys.prioritized,this.queue.keys.active,this.queue.keys.pc,this.queue.keys.events,this.queue.keys.marker],d=[this.queue.toKey(""),a],e=await this.execCommand(b,"promote",c.concat(d));if(e<0)throw this.finishedErrors({code:e,jobId:a,command:"promote",state:"delayed"})}moveStalledJobsToWaitArgs(){let a=this.queue.opts;return[this.queue.keys.stalled,this.queue.keys.wait,this.queue.keys.active,this.queue.keys["stalled-check"],this.queue.keys.meta,this.queue.keys.paused,this.queue.keys.marker,this.queue.keys.events,this.queue.keys.repeat].concat([a.maxStalledCount,this.queue.toKey(""),Date.now(),a.stalledInterval])}async moveStalledJobsToWait(){let a=await this.queue.client,b=this.moveStalledJobsToWaitArgs();return this.execCommand(a,"moveStalledJobsToWait",b)}async moveJobFromActiveToWait(a,b="0"){let c=await this.queue.client,d=[this.queue.keys.active,this.queue.keys.wait,this.queue.keys.stalled,this.queue.keys.paused,this.queue.keys.meta,this.queue.keys.limiter,this.queue.keys.prioritized,this.queue.keys.marker,this.queue.keys.events],e=[a,b,this.queue.toKey(a)],f=await this.execCommand(c,"moveJobFromActiveToWait",d.concat(e));if(f<0)throw this.finishedErrors({code:f,jobId:a,command:"moveJobFromActiveToWait",state:"active"});return f}async obliterate(a){let b=await this.queue.client,c=[this.queue.keys.meta,this.queue.toKey("")],d=[a.count,a.force?"force":null],e=await this.execCommand(b,"obliterate",c.concat(d));if(e<0)switch(e){case -1:throw Error("Cannot obliterate non-paused queue");case -2:throw Error("Cannot obliterate queue with active jobs")}return e}async paginate(a,b){let c=await this.queue.client,d=[a],e=b.end>=0?b.end-b.start+1:1/0,f="0",g=0,h,i,j,k=[],l=[];do{let a=[b.start+k.length,b.end,f,g,5];b.fetchJobs&&a.push(1),[f,g,h,i,j]=await this.execCommand(c,"paginate",d.concat(a)),k=k.concat(h),j&&j.length&&(l=l.concat(j.map(S)))}while("0"!=f&&k.length<e)if(!(k.length&&Array.isArray(k[0])))return{cursor:f,items:k.map(a=>({id:a})),total:i,jobs:l};{let a=[];for(let b=0;b<k.length;b++){let[c,d]=k[b];try{a.push({id:c,v:JSON.parse(d)})}catch(b){a.push({id:c,err:b.message})}}return{cursor:f,items:a,total:i,jobs:l}}}finishedErrors({code:a,jobId:b,parentKey:c,command:d,state:e}){let f;switch(a){case t.JobNotExist:f=Error(`Missing key for job ${b}. ${d}`);break;case t.JobLockNotExist:f=Error(`Missing lock for job ${b}. ${d}`);break;case t.JobNotInState:f=Error(`Job ${b} is not in the ${e} state. ${d}`);break;case t.JobPendingChildren:f=Error(`Job ${b} has pending dependencies. ${d}`);break;case t.ParentJobNotExist:f=Error(`Missing key for parent job ${c}. ${d}`);break;case t.JobLockMismatch:f=Error(`Lock mismatch for job ${b}. Cmd ${d} from ${e}`);break;case t.ParentJobCannotBeReplaced:f=Error(`The parent job ${c} cannot be replaced. ${d}`);break;case t.JobBelongsToJobScheduler:f=Error(`Job ${b} belongs to a job scheduler and cannot be removed directly. ${d}`);break;case t.JobHasFailedChildren:f=new bi(`Cannot complete job ${b} because it has at least one failed child. ${d}`);break;case t.SchedulerJobIdCollision:f=Error(`Cannot create job scheduler iteration - job ID already exists. ${d}`);break;case t.SchedulerJobSlotsBusy:f=Error(`Cannot create job scheduler iteration - current and next time slots already have jobs. ${d}`);break;default:f=Error(`Unknown code ${a} error for ${b}. ${d}`)}return f.code=a,f}async removeOrphanedJobs(a,b,c){let d=await this.queue.client,e=[this.queue.toKey(""),b.length,...b,c.length,...c,...a];return this.execCommand(d,"removeOrphanedJobs",e)}}function bl(a){if(a){let b=[null,a[1],a[2],a[3]];return a[0]&&(b[0]=S(a[0])),b}return[]}let bm=a=>new bk({keys:a.keys,client:a.client,get redisVersion(){return a.redisVersion},toKey:a.toKey,opts:a.opts,closing:a.closing,databaseType:a.databaseType});function bn(a,b){var c={};for(var d in a)Object.prototype.hasOwnProperty.call(a,d)&&0>b.indexOf(d)&&(c[d]=a[d]);if(null!=a&&"function"==typeof Object.getOwnPropertySymbols)for(var e=0,d=Object.getOwnPropertySymbols(a);e<d.length;e++)0>b.indexOf(d[e])&&Object.prototype.propertyIsEnumerable.call(a,d[e])&&(c[d[e]]=a[d[e]]);return c}"function"==typeof SuppressedError&&SuppressedError;let bo=(0,a.i(224361).debuglog)("bull");class bp{constructor(a,b,c,d={},e){this.queue=a,this.name=b,this.data=c,this.opts=d,this.id=e,this.progress=0,this.returnvalue=null,this.stacktrace=null,this.delay=0,this.priority=0,this.attemptsStarted=0,this.attemptsMade=0,this.stalledCounter=0;const f=this.opts,{repeatJobKey:g}=f,h=bn(f,["repeatJobKey"]);this.opts=Object.assign({attempts:0},h),this.delay=this.opts.delay,this.priority=this.opts.priority||0,this.repeatJobKey=g,this.timestamp=d.timestamp?d.timestamp:Date.now(),this.opts.backoff=i.normalize(d.backoff),this.parentKey=Z(d.parent),d.parent&&(this.parent={id:d.parent.id,queueKey:d.parent.queue},d.failParentOnFailure&&(this.parent.fpof=!0),d.removeDependencyOnFailure&&(this.parent.rdof=!0),d.ignoreDependencyOnFailure&&(this.parent.idof=!0),d.continueParentOnFailure&&(this.parent.cpof=!0)),this.debounceId=d.debounce?d.debounce.id:void 0,this.deduplicationId=d.deduplication?d.deduplication.id:this.debounceId,this.toKey=a.toKey.bind(a),this.createScripts(),this.queueQualifiedName=a.qualifiedName}static async create(a,b,c,d){let e=await a.client,f=new this(a,b,c,d,d&&d.jobId);return f.id=await f.addJob(e,{parentKey:f.parentKey,parentDependenciesKey:f.parentKey?`${f.parentKey}:dependencies`:""}),f}static async createBulk(a,b){let c=await a.client,d=b.map(b=>{var c;return new this(a,b.name,b.data,b.opts,null==(c=b.opts)?void 0:c.jobId)}),e=c.pipeline();for(let a of d)a.addJob(e,{parentKey:a.parentKey,parentDependenciesKey:a.parentKey?`${a.parentKey}:dependencies`:""});let f=await e.exec();for(let a=0;a<f.length;++a){let[b,c]=f[a];if(b)throw b;d[a].id=c}return d}static fromJSON(a,b,c){let d=JSON.parse(b.data||"{}"),e=bp.optsFromJSON(b.opts),f=new this(a,b.name,d,e,b.id||c);return f.progress=JSON.parse(b.progress||"0"),f.delay=parseInt(b.delay),f.priority=parseInt(b.priority),f.timestamp=parseInt(b.timestamp),b.finishedOn&&(f.finishedOn=parseInt(b.finishedOn)),b.processedOn&&(f.processedOn=parseInt(b.processedOn)),b.rjk&&(f.repeatJobKey=b.rjk),b.deid&&(f.debounceId=b.deid,f.deduplicationId=b.deid),b.failedReason&&(f.failedReason=b.failedReason),f.attemptsStarted=parseInt(b.ats||"0"),f.attemptsMade=parseInt(b.attemptsMade||b.atm||"0"),f.stalledCounter=parseInt(b.stc||"0"),b.defa&&(f.deferredFailure=b.defa),f.stacktrace=function(a){if(!a)return[];let b=R(JSON.parse,JSON,[a]);return b!==Q&&b instanceof Array?b:[]}(b.stacktrace),"string"==typeof b.returnvalue&&(f.returnvalue=bq(b.returnvalue)),b.parentKey?f.parentKey=b.parentKey:f.parentKey=void 0,b.parent?f.parent=JSON.parse(b.parent):f.parent=void 0,b.pb&&(f.processedBy=b.pb),b.nrjid&&(f.nextRepeatableJobId=b.nrjid),f}createScripts(){var a;this.scripts=null!=(a=this.queue.scripts)?a:bm(this.queue)}static optsFromJSON(a,b=V){let c=Object.entries(JSON.parse(a||"{}")),d={};for(let a of c){let[c,e]=a;b[c]?d[b[c]]=e:"tm"===c?d.telemetry=Object.assign(Object.assign({},d.telemetry),{metadata:e}):"omc"===c?d.telemetry=Object.assign(Object.assign({},d.telemetry),{omitContext:e}):d[c]=e}return d}static async fromId(a,b){if(b){let c=await a.client,d=await c.hgetall(a.toKey(b));return!function(a){for(let b in a)if(Object.prototype.hasOwnProperty.call(a,b))return!1;return!0}(d)?this.fromJSON(a,d,b):void 0}}static addJobLog(a,b,c,d){var e;return(null!=(e=a.scripts)?e:bm(a)).addLog(b,c,d)}toJSON(){let{queue:a,scripts:b}=this;return bn(this,["queue","scripts"])}asJSON(){var a={id:this.id,name:this.name,data:JSON.stringify(void 0===this.data?{}:this.data),opts:bp.optsAsJSON(this.opts),parent:this.parent?Object.assign({},this.parent):void 0,parentKey:this.parentKey,progress:this.progress,attemptsMade:this.attemptsMade,attemptsStarted:this.attemptsStarted,stalledCounter:this.stalledCounter,finishedOn:this.finishedOn,processedOn:this.processedOn,timestamp:this.timestamp,failedReason:JSON.stringify(this.failedReason),stacktrace:JSON.stringify(this.stacktrace),debounceId:this.debounceId,deduplicationId:this.deduplicationId,repeatJobKey:this.repeatJobKey,returnvalue:JSON.stringify(this.returnvalue),nrjid:this.nextRepeatableJobId};let b={};for(let c in a)void 0!==a[c]&&(b[c]=a[c]);return b}static optsAsJSON(a={},b=W){let c=Object.entries(a),d={};for(let[a,e]of c)void 0!==e&&(a in b?d[b[a]]=e:"telemetry"===a?(void 0!==e.metadata&&(d.tm=e.metadata),void 0!==e.omitContext&&(d.omc=e.omitContext)):d[a]=e);return d}asJSONSandbox(){return Object.assign(Object.assign({},this.asJSON()),{queueName:this.queueName,queueQualifiedName:this.queueQualifiedName,prefix:this.prefix})}updateData(a){return this.data=a,this.scripts.updateData(this,a)}async updateProgress(a){this.progress=a,await this.scripts.updateProgress(this.id,a),this.queue.emit("progress",this,a)}async log(a){return bp.addJobLog(this.queue,this.id,a,this.opts.keepLogs)}async removeChildDependency(){return!!await this.scripts.removeChildDependency(this.id,this.parentKey)&&(this.parent=void 0,this.parentKey=void 0,!0)}async clearLogs(a){let b=await this.queue.client,c=this.toKey(this.id)+":logs";a?await b.ltrim(c,-a,-1):await b.del(c)}async remove({removeChildren:a=!0}={}){await this.queue.waitUntilReady();let b=this.queue;if(await this.scripts.remove(this.id,a))b.emit("removed",this);else throw Error(`Job ${this.id} could not be removed because it is locked by another worker`)}async removeUnprocessedChildren(){let a=this.id;await this.scripts.removeUnprocessedChildren(a)}extendLock(a,b){return this.scripts.extendLock(this.id,a,b)}async moveToCompleted(a,b,c=!0){return this.queue.trace(y.INTERNAL,"complete",this.queue.name,async d=>{this.setSpanJobAttributes(d),await this.queue.waitUntilReady(),this.returnvalue=a||void 0;let e=R(JSON.stringify,JSON,[a]);if(e===Q)throw Q.value;let f=this.scripts.moveToCompletedArgs(this,e,this.opts.removeOnComplete,b,c),g=await this.scripts.moveToFinished(this.id,f);return this.finishedOn=f[this.scripts.moveToFinishedKeys.length+1],this.attemptsMade+=1,this.recordJobMetrics("completed"),g})}async moveToWait(a){let b=await this.scripts.moveJobFromActiveToWait(this.id,a);return this.recordJobMetrics("waiting"),b}async shouldRetryJob(a){if(!(this.attemptsMade+1<this.opts.attempts)||this.discarded||a instanceof bi||"UnrecoverableError"==a.name)return[!1,0];{let b=this.queue.opts,c=await i.calculate(this.opts.backoff,this.attemptsMade+1,a,this,b.settings&&b.settings.backoffStrategy);return[-1!=c,-1==c?0:c]}}async moveToFailed(a,b,c=!1){this.failedReason=null==a?void 0:a.message;let[d,e]=await this.shouldRetryJob(a);return this.queue.trace(y.INTERNAL,this.getSpanOperation(d,e),this.queue.name,async(f,g)=>{var h,i;let j,k,l;this.setSpanJobAttributes(f),(null==(i=null==(h=this.opts)?void 0:h.telemetry)?void 0:i.omitContext)||!g||(j=g),this.updateStacktrace(a);let m={failedReason:this.failedReason,stacktrace:JSON.stringify(this.stacktrace),tm:j};if(d)e?(k=await this.scripts.moveToDelayed(this.id,Date.now(),e,b,{fieldsToUpdate:m,fetchNext:c}),this.recordJobMetrics("delayed")):(k=await this.scripts.retryJob(this.id,this.opts.lifo,b,{fieldsToUpdate:m}),this.recordJobMetrics("retried"));else{let a=this.scripts.moveToFailedArgs(this,this.failedReason,this.opts.removeOnFail,b,c,m);k=await this.scripts.moveToFinished(this.id,a),l=a[this.scripts.moveToFinishedKeys.length+1],this.recordJobMetrics("failed")}return l&&"number"==typeof l&&(this.finishedOn=l),e&&"number"==typeof e&&(this.delay=e),this.attemptsMade+=1,k})}getSpanOperation(a,b){return a?b?"delay":"retry":"fail"}recordJobMetrics(a){var b,c;let d=null==(c=null==(b=this.queue.opts)?void 0:b.telemetry)?void 0:c.meter;if(!d)return;let e={[w.QueueName]:this.queue.name,[w.JobName]:this.name,[w.JobStatus]:a},f={completed:x.JobsCompleted,failed:x.JobsFailed,delayed:x.JobsDelayed,retried:x.JobsRetried,waiting:x.JobsWaiting,"waiting-children":x.JobsWaitingChildren}[a];if(d.createCounter(f,{description:`Number of jobs ${a}`,unit:"1"}).add(1,e),this.processedOn){let a=Date.now()-this.processedOn;d.createHistogram(x.JobDuration,{description:"Job processing duration",unit:"ms"}).record(a,e)}}isCompleted(){return this.isInZSet("completed")}isFailed(){return this.isInZSet("failed")}isDelayed(){return this.isInZSet("delayed")}isWaitingChildren(){return this.isInZSet("waiting-children")}isActive(){return this.isInList("active")}async isWaiting(){return await this.isInList("wait")||await this.isInList("paused")}get queueName(){return this.queue.name}get prefix(){return this.queue.opts.prefix}getState(){return this.scripts.getState(this.id)}async changeDelay(a){await this.scripts.changeDelay(this.id,a),this.delay=a}async changePriority(a){await this.scripts.changePriority(this.id,a.priority,a.lifo),this.priority=a.priority||0}async getChildrenValues(){let a=await this.queue.client,b=await a.hgetall(this.toKey(`${this.id}:processed`));if(b)return ab(b)}async getIgnoredChildrenFailures(){return(await this.queue.client).hgetall(this.toKey(`${this.id}:failed`))}async getFailedChildrenValues(){return(await this.queue.client).hgetall(this.toKey(`${this.id}:failed`))}async getDependencies(a={}){let b=(await this.queue.client).pipeline();if(a.processed||a.unprocessed||a.ignored||a.failed){let c,d,e,f,g,h,i,j,k={cursor:0,count:20},l=[];if(a.processed){l.push("processed");let c=Object.assign(Object.assign({},k),a.processed);b.hscan(this.toKey(`${this.id}:processed`),c.cursor,{COUNT:c.count})}if(a.unprocessed){l.push("unprocessed");let c=Object.assign(Object.assign({},k),a.unprocessed);b.sscan(this.toKey(`${this.id}:dependencies`),c.cursor,{COUNT:c.count})}if(a.ignored){l.push("ignored");let c=Object.assign(Object.assign({},k),a.ignored);b.hscan(this.toKey(`${this.id}:failed`),c.cursor,{COUNT:c.count})}if(a.failed){l.push("failed");let d=Object.assign(Object.assign({},k),a.failed);c=d.cursor+d.count,b.zrange(this.toKey(`${this.id}:unsuccessful`),d.cursor,d.count-1)}let m=await b.exec();return l.forEach((a,b)=>{switch(a){case"processed":{d=m[b][1][0];let a=m[b][1][1],c={};for(let b=0;b<a.length;++b)b%2&&(c[a[b-1]]=JSON.parse(a[b]));e=c;break}case"failed":h=m[b][1];break;case"ignored":{i=m[b][1][0];let a=m[b][1][1],c={};for(let b=0;b<a.length;++b)b%2&&(c[a[b-1]]=a[b]);j=c;break}case"unprocessed":f=m[b][1][0],g=m[b][1][1]}}),Object.assign(Object.assign(Object.assign(Object.assign({},d?{processed:e,nextProcessedCursor:Number(d)}:{}),i?{ignored:j,nextIgnoredCursor:Number(i)}:{}),c?{failed:h,nextFailedCursor:c}:{}),f?{unprocessed:g,nextUnprocessedCursor:Number(f)}:{})}{b.hgetall(this.toKey(`${this.id}:processed`)),b.smembers(this.toKey(`${this.id}:dependencies`)),b.hgetall(this.toKey(`${this.id}:failed`)),b.zrange(this.toKey(`${this.id}:unsuccessful`),0,-1);let[[a,c],[d,e],[f,g],[h,i]]=await b.exec();return{processed:ab(c),unprocessed:e,failed:i,ignored:g}}}async getDependenciesCount(a={}){let b=[];Object.entries(a).forEach(([a,c])=>{c&&b.push(a)});let c=b.length?b:["processed","unprocessed","ignored","failed"],d=await this.scripts.getDependencyCounts(this.id,c),e={};return d.forEach((a,b)=>{e[`${c[b]}`]=a||0}),e}async waitUntilFinished(a,b){await this.queue.waitUntilReady();let c=this.id;return new Promise(async(d,e)=>{let f;function g(a){k(),d(a.returnvalue)}function h(a){k(),e(Error(a.failedReason||a))}b&&(f=setTimeout(()=>h(`Job wait ${this.name} timed out before finishing, no finish notification arrived after ${b}ms (id=${c})`),b));let i=`completed:${c}`,j=`failed:${c}`;a.on(i,g),a.on(j,h),this.queue.on("closing",h);let k=()=>{clearInterval(f),a.removeListener(i,g),a.removeListener(j,h),this.queue.removeListener("closing",h)};await a.waitUntilReady();let[l,m]=await this.scripts.isFinished(c,!0);0!=l&&(-1==l||2==l?h({failedReason:m}):g({returnvalue:bq(m)}))})}async moveToDelayed(a,b){let c=Date.now(),d=a-c,e=d>0?d:0;await this.scripts.moveToDelayed(this.id,c,e,b,{skipAttempt:!0}),this.delay=e,this.recordJobMetrics("delayed")}async moveToWaitingChildren(a,b={}){let c=await this.scripts.moveToWaitingChildren(this.id,a,b);return c&&this.recordJobMetrics("waiting-children"),c}async promote(){let a=this.id;await this.scripts.promote(a),this.delay=0}async retry(a="failed",b={}){await this.scripts.reprocessJob(this,a,b),this.failedReason=null,this.finishedOn=null,this.processedOn=null,this.returnvalue=null,b.resetAttemptsMade&&(this.attemptsMade=0),b.resetAttemptsStarted&&(this.attemptsStarted=0)}discard(){this.discarded=!0}async isInZSet(a){let b=await this.queue.client;return null!==await b.zscore(this.queue.toKey(a),this.id)}async isInList(a){return this.scripts.isJobInList(this.queue.toKey(a),this.id)}addJob(a,b){let c=this.asJSON();return this.validateOptions(c),this.scripts.addJob(a,c,c.opts,this.id,b)}async removeDeduplicationKey(){return!!this.deduplicationId&&await this.scripts.removeDeduplicationKey(this.deduplicationId,this.id)>0}validateOptions(a){var b,c,d,e,f,g,h,i,j;if(this.opts.sizeLimit&&(j=a.data,Buffer.byteLength(j,"utf8")>this.opts.sizeLimit))throw Error(`The size of job ${this.name} exceeds the limit ${this.opts.sizeLimit} bytes`);if(this.opts.delay&&this.opts.repeat&&!(null==(b=this.opts.repeat)?void 0:b.count))throw Error("Delay and repeat options cannot be used together");let k=["removeDependencyOnFailure","failParentOnFailure","continueParentOnFailure","ignoreDependencyOnFailure"].filter(a=>this.opts[a]);if(k.length>1){let a=k.join(", ");throw Error(`The following options cannot be used together: ${a}`)}if(null==(c=this.opts)?void 0:c.jobId){if(`${parseInt(this.opts.jobId,10)}`===(null==(d=this.opts)?void 0:d.jobId))throw Error("Custom Id cannot be integers");if((null==(e=this.opts)?void 0:e.jobId.includes(":"))&&(null==(g=null==(f=this.opts)?void 0:f.jobId)?void 0:g.split(":").length)!==3)throw Error("Custom Id cannot contain :")}if(this.opts.priority){if(Math.trunc(this.opts.priority)!==this.opts.priority)throw Error("Priority should not be float");if(this.opts.priority>2097151)throw Error("Priority should be between 0 and 2097151")}if(this.opts.deduplication){if(!(null==(h=this.opts.deduplication)?void 0:h.id))throw Error("Deduplication id must be provided");if(this.parentKey)throw Error("Deduplication and parent options cannot be used together")}if(this.opts.debounce){if(!(null==(i=this.opts.debounce)?void 0:i.id))throw Error("Debounce id must be provided");if(this.parentKey)throw Error("Debounce and parent options cannot be used together")}if("object"==typeof this.opts.backoff&&"number"==typeof this.opts.backoff.jitter&&(this.opts.backoff.jitter<0||this.opts.backoff.jitter>1))throw Error("Jitter should be between 0 and 1")}updateStacktrace(a){this.stacktrace=this.stacktrace||[],(null==a?void 0:a.stack)&&(this.stacktrace.push(a.stack),0===this.opts.stackTraceLimit?this.stacktrace=[]:this.opts.stackTraceLimit&&(this.stacktrace=this.stacktrace.slice(-this.opts.stackTraceLimit)))}setSpanJobAttributes(a){null==a||a.setAttributes({[w.JobName]:this.name,[w.JobId]:this.id})}}function bq(a){let b=R(JSON.parse,JSON,[a]);if(b!==Q)return b;bo("corrupted returnvalue: "+a,b)}class br{constructor(a="bull"){this.prefix=a}getKeys(a){let b={};return["","active","wait","waiting-children","paused","id","delayed","prioritized","stalled-check","completed","failed","stalled","repeat","limiter","meta","events","pc","marker","de"].forEach(c=>{b[c]=this.toKey(a,c)}),b}toKey(a,b){return`${this.getQueueQualifiedName(a)}:${b}`}getQueueQualifiedName(a){return`${this.prefix}:${a}`}}var bs=K,bt=a.i(142318);a.s([],127983),a.i(127983);let bu={name:"addDelayedJob",content:`--[[
  Adds a delayed job to the queue by doing the following:
    - Increases the job counter if needed.
    - Creates a new job key with the job data.
    - computes timestamp.
    - adds to delayed zset.
    - Emits a global event 'delayed' if the job is delayed.
    Input:
      KEYS[1] 'marker',
      KEYS[2] 'meta'
      KEYS[3] 'id'
      KEYS[4] 'delayed'
      KEYS[5] 'completed'
      KEYS[6] events stream key
      ARGV[1] msgpacked arguments array
            [1]  key prefix,
            [2]  custom id (use custom instead of one generated automatically)
            [3]  name
            [4]  timestamp
            [5]  parentKey?
            [6]  parent dependencies key.
            [7]  parent? {id, queueKey}
            [8]  repeat job key
            [9] deduplication key
      ARGV[2] Json stringified job data
      ARGV[3] msgpacked options
      Output:
        jobId  - OK
        -5     - Missing parent key
]]
local metaKey = KEYS[2]
local idKey = KEYS[3]
local delayedKey = KEYS[4]
local completedKey = KEYS[5]
local eventsKey = KEYS[6]
local jobId
local jobIdKey
local rcall = redis.call
local args = cmsgpack.unpack(ARGV[1])
local data = ARGV[2]
local parentKey = args[5]
local parent = args[7]
local repeatJobKey = args[8]
local deduplicationKey = args[9]
local parentData
-- Includes
--[[
  Adds a delayed job to the queue by doing the following:
    - Creates a new job key with the job data.
    - adds to delayed zset.
    - Emits a global event 'delayed' if the job is delayed.
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Bake in the job id first 12 bits into the timestamp
  to guarantee correct execution order of delayed jobs
  (up to 4096 jobs per given timestamp or 4096 jobs apart per timestamp)
  WARNING: Jobs that are so far apart that they wrap around will cause FIFO to fail
]]
local function getDelayedScore(delayedKey, timestamp, delay)
  local delayedTimestamp = (delay > 0 and (tonumber(timestamp) + delay)) or tonumber(timestamp)
  local minScore = delayedTimestamp * 0x1000
  local maxScore = (delayedTimestamp + 1 ) * 0x1000 - 1
  local result = rcall("ZREVRANGEBYSCORE", delayedKey, maxScore,
    minScore, "WITHSCORES","LIMIT", 0, 1)
  if #result then
    local currentMaxScore = tonumber(result[2])
    if currentMaxScore ~= nil then
      if currentMaxScore >= maxScore then
        return maxScore, delayedTimestamp
      else
        return currentMaxScore + 1, delayedTimestamp
      end
    end
  end
  return minScore, delayedTimestamp
end
local function addDelayedJob(jobId, delayedKey, eventsKey, timestamp,
  maxEvents, markerKey, delay)
  local score, delayedTimestamp = getDelayedScore(delayedKey, timestamp, tonumber(delay))
  rcall("ZADD", delayedKey, score, jobId)
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "delayed",
    "jobId", jobId, "delay", delayedTimestamp)
  -- mark that a delayed job is available
  addDelayMarkerIfNeeded(markerKey, delayedKey)
end
--[[
  Function to debounce a job.
]]
-- Includes
--[[
  Function to deduplicate a job.
]]
--[[
  Function to set the deduplication key for a job.
  Uses TTL from deduplication opts if provided.
]]
local function setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
    local ttl = deduplicationOpts and deduplicationOpts['ttl']
    if ttl and ttl > 0 then
        rcall('SET', deduplicationKey, jobId, 'PX', ttl)
    else
        rcall('SET', deduplicationKey, jobId)
    end
end
--[[
  Function to store a deduplicated next job if the existing job is active
  and keepLastIfActive is set. When the active job finishes, the stored
  proto-job is used to create a real job in the queue.
  Returns true if the proto-job was stored, false otherwise.
]]
--[[
  Function to check if an item belongs to a list.
]]
local function checkItemInList(list, item)
  for _, v in pairs(list) do
    if v == item then
      return 1
    end
  end
  return nil
end
local function storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
    deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
    parentKey, parentData, parentDependenciesKey, repeatJobKey)
    if deduplicationOpts['keepLastIfActive'] and currentDebounceJobId then
        local activeKey = prefix .. "active"
        local activeItems = rcall('LRANGE', activeKey, 0, -1)
        if checkItemInList(activeItems, currentDebounceJobId) then
            local deduplicationNextKey = prefix .. "dn:" .. deduplicationId
            local fields = {'name', jobName, 'data', jobData, 'opts', cjson.encode(fullOpts),
                'jid', jobId}
            if parentKey then
                fields[#fields+1] = 'pk'
                fields[#fields+1] = parentKey
            end
            if parentData then
                fields[#fields+1] = 'pd'
                fields[#fields+1] = parentData
            end
            if parentDependenciesKey then
                fields[#fields+1] = 'pdk'
                fields[#fields+1] = parentDependenciesKey
            end
            if repeatJobKey then
                fields[#fields+1] = 'rjk'
                fields[#fields+1] = repeatJobKey
            end
            rcall('DEL', deduplicationNextKey)
            rcall('HSET', deduplicationNextKey, unpack(fields))
            -- Ensure the dedup key does not expire while the job is active,
            -- so subsequent adds always hit the dedup path and never bypass
            -- the active-check because of a TTL expiry.
            local deduplicationKey = prefix .. "de:" .. deduplicationId
            rcall('PERSIST', deduplicationKey)
            -- TODO remove debounced event in next breaking change
            rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
                currentDebounceJobId, "debounceId", deduplicationId)
            rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
            return true
        end
    end
    return false
end
local function deduplicateJobWithoutReplace(deduplicationId, deduplicationOpts, jobId, deduplicationKey,
    eventsKey, maxEvents, prefix, jobName, jobData, fullOpts,
    parentKey, parentData, parentDependenciesKey, repeatJobKey)
    local ttl = deduplicationOpts['ttl']
    local deduplicationKeyExists
    if ttl and ttl > 0 then
        if deduplicationOpts['extend'] then
            local currentDebounceJobId = rcall('GET', deduplicationKey)
            if currentDebounceJobId then
                if storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
                    deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
                    parentKey, parentData, parentDependenciesKey, repeatJobKey) then
                    return currentDebounceJobId
                end
                if deduplicationOpts['keepLastIfActive'] then
                    rcall('SET', deduplicationKey, currentDebounceJobId)
                else
                    setDeduplicationKey(deduplicationKey, currentDebounceJobId, deduplicationOpts)
                end
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced",
                    "jobId", currentDebounceJobId, "debounceId", deduplicationId)
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                    currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
                return currentDebounceJobId
            else
                if deduplicationOpts['keepLastIfActive'] then
                    rcall('SET', deduplicationKey, jobId)
                else
                    setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
                end
                return
            end
        else
            if deduplicationOpts['keepLastIfActive'] then
                deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'NX')
            else
                deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'PX', ttl, 'NX')
            end
        end
    else
        deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'NX')
    end
    if deduplicationKeyExists then
        local currentDebounceJobId = rcall('GET', deduplicationKey)
        if storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
            deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
            parentKey, parentData, parentDependenciesKey, repeatJobKey) then
            return currentDebounceJobId
        end
        -- TODO remove debounced event in next breaking change
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
            currentDebounceJobId, "debounceId", deduplicationId)
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
            currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
        return currentDebounceJobId
    end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
local function removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents, currentDeduplicatedJobId,
    jobId, deduplicationId, prefix)
    if rcall("ZREM", delayedKey, currentDeduplicatedJobId) > 0 then
        removeJobKeys(prefix .. currentDeduplicatedJobId)
        rcall("XADD", eventsKey, "*", "event", "removed", "jobId", currentDeduplicatedJobId,
            "prev", "delayed")
        -- TODO remove debounced event in next breaking change
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
            jobId, "debounceId", deduplicationId)
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
            jobId, "deduplicationId", deduplicationId, "deduplicatedJobId", currentDeduplicatedJobId)
        return true
    end
    return false
end
local function deduplicateJob(deduplicationOpts, jobId, delayedKey, deduplicationKey, eventsKey, maxEvents,
    prefix, jobName, jobData, fullOpts, parentKey, parentData, parentDependenciesKey, repeatJobKey)
    local deduplicationId = deduplicationOpts and deduplicationOpts['id']
    if deduplicationId then
        if deduplicationOpts['replace'] then
            local currentDebounceJobId = rcall('GET', deduplicationKey)
            if currentDebounceJobId then
                local isRemoved = removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents,
                    currentDebounceJobId, jobId, deduplicationId, prefix)
                if isRemoved then
                    if deduplicationOpts['keepLastIfActive'] then
                        rcall('SET', deduplicationKey, jobId)
                    else
                        local ttl = deduplicationOpts['ttl']
                        if not deduplicationOpts['extend'] and ttl and ttl > 0 then
                            rcall('SET', deduplicationKey, jobId, 'KEEPTTL')
                        else
                            setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
                        end
                    end
                    return
                else
                    storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
                        deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
                        parentKey, parentData, parentDependenciesKey, repeatJobKey)
                    return currentDebounceJobId
                end
            else
                if deduplicationOpts['keepLastIfActive'] then
                    rcall('SET', deduplicationKey, jobId)
                else
                    setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
                end
                return
            end
        else
            return deduplicateJobWithoutReplace(deduplicationId, deduplicationOpts,
                jobId, deduplicationKey, eventsKey, maxEvents, prefix, jobName, jobData, fullOpts,
                parentKey, parentData, parentDependenciesKey, repeatJobKey)
        end
    end
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to handle the case when job is duplicated.
]]
-- Includes
--[[
    This function is used to update the parent's dependencies if the job
    is already completed and about to be ignored. The parent must get its
    dependencies updated to avoid the parent job being stuck forever in 
    the waiting-children state.
]]
-- Includes
--[[
  Validate and move or add dependencies to parent.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized)
  if no pending dependencies.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized) if needed.
]]
-- Includes
--[[
  Move parent to a wait status (wait, prioritized or delayed)
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check if queue is paused or maxed
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePausedOrMaxed(queueMetaKey, activeKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency")
  if queueAttributes[1] then
    return true
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      return activeCount >= tonumber(queueAttributes[2])
    end
  end
  return false
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    local parentWaitKey = parentQueueKey .. ":wait"
    local parentPausedKey = parentQueueKey .. ":paused"
    local parentActiveKey = parentQueueKey .. ":active"
    local parentMetaKey = parentQueueKey .. ":meta"
    local parentMarkerKey = parentQueueKey .. ":marker"
    local jobAttributes = rcall("HMGET", parentKey, "priority", "delay")
    local priority = tonumber(jobAttributes[1]) or 0
    local delay = tonumber(jobAttributes[2]) or 0
    if delay > 0 then
        local delayedTimestamp = tonumber(timestamp) + delay
        local score = delayedTimestamp * 0x1000
        local parentDelayedKey = parentQueueKey .. ":delayed"
        rcall("ZADD", parentDelayedKey, score, parentId)
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "delayed", "jobId", parentId, "delay",
            delayedTimestamp)
        addDelayMarkerIfNeeded(parentMarkerKey, parentDelayedKey)
    else
        if priority == 0 then
            local parentTarget, isParentPausedOrMaxed = getTargetQueueList(parentMetaKey, parentActiveKey,
                parentWaitKey, parentPausedKey)
            addJobInTargetList(parentTarget, parentMarkerKey, "RPUSH", isParentPausedOrMaxed, parentId)
        else
            local isPausedOrMaxed = isQueuePausedOrMaxed(parentMetaKey, parentActiveKey)
            addJobWithPriority(parentMarkerKey, parentQueueKey .. ":prioritized", priority, parentId,
                parentQueueKey .. ":pc", isPausedOrMaxed)
        end
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "waiting", "jobId", parentId, "prev",
            "waiting-children")
    end
end
local function moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  if rcall("EXISTS", parentKey) == 1 then
    local parentWaitingChildrenKey = parentQueueKey .. ":waiting-children"
    if rcall("ZSCORE", parentWaitingChildrenKey, parentId) then    
      rcall("ZREM", parentWaitingChildrenKey, parentId)
      moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    end
  end
end
local function moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey,
  parentId, timestamp)
  local doNotHavePendingDependencies = rcall("SCARD", parentDependenciesKey) == 0
  if doNotHavePendingDependencies then
    moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  end
end
local function updateParentDepsIfNeeded(parentKey, parentQueueKey, parentDependenciesKey,
  parentId, jobIdKey, returnvalue, timestamp )
  local processedSet = parentKey .. ":processed"
  rcall("HSET", processedSet, jobIdKey, returnvalue)
  moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey, parentId, timestamp)
end
local function updateExistingJobsParent(parentKey, parent, parentData,
                                        parentDependenciesKey, completedKey,
                                        jobIdKey, jobId, timestamp)
    if parentKey ~= nil then
        if rcall("ZSCORE", completedKey, jobId) then
            local returnvalue = rcall("HGET", jobIdKey, "returnvalue")
            updateParentDepsIfNeeded(parentKey, parent['queueKey'],
                                     parentDependenciesKey, parent['id'],
                                     jobIdKey, returnvalue, timestamp)
        else
            if parentDependenciesKey ~= nil then
                rcall("SADD", parentDependenciesKey, jobIdKey)
            end
        end
        rcall("HMSET", jobIdKey, "parentKey", parentKey, "parent", parentData)
    end
end
local function handleDuplicatedJob(jobKey, jobId, currentParentKey, currentParent,
  parentData, parentDependenciesKey, completedKey, eventsKey, maxEvents, timestamp)
  local existedParentKey = rcall("HGET", jobKey, "parentKey")
  if not existedParentKey or existedParentKey == currentParentKey then
    updateExistingJobsParent(currentParentKey, currentParent, parentData,
      parentDependenciesKey, completedKey, jobKey,
      jobId, timestamp)
  else
    if currentParentKey ~= nil and currentParentKey ~= existedParentKey
      and (rcall("EXISTS", existedParentKey) == 1) then
      return -7
    end
  end
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event",
    "duplicated", "jobId", jobId)
  return jobId .. "" -- convert to string
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
if parentKey ~= nil then
    if rcall("EXISTS", parentKey) ~= 1 then return -5 end
    parentData = cjson.encode(parent)
end
local jobCounter = rcall("INCR", idKey)
local maxEvents = getOrSetMaxEvents(metaKey)
local opts = cmsgpack.unpack(ARGV[3])
local parentDependenciesKey = args[6]
local timestamp = args[4]
if args[2] == "" then
    jobId = jobCounter .. "" -- convert to string
    jobIdKey = args[1] .. jobId
else
    jobId = args[2]
    jobIdKey = args[1] .. jobId
    if rcall("EXISTS", jobIdKey) == 1 then
        return handleDuplicatedJob(jobIdKey, jobId, parentKey, parent,
            parentData, parentDependenciesKey, completedKey, eventsKey,
            maxEvents, timestamp)
    end
end
local deduplicationJobId = deduplicateJob(opts['de'], jobId, delayedKey, deduplicationKey,
  eventsKey, maxEvents, args[1], args[3], ARGV[2], opts,
  parentKey, parentData, parentDependenciesKey, repeatJobKey)
if deduplicationJobId then
  return deduplicationJobId
end
local delay, priority = storeJob(eventsKey, jobIdKey, jobId, args[3], ARGV[2],
    opts, timestamp, parentKey, parentData, repeatJobKey)
addDelayedJob(jobId, delayedKey, eventsKey, timestamp, maxEvents, KEYS[1], delay)
-- Check if this job is a child of another job, if so add it to the parents dependencies
if parentDependenciesKey ~= nil then
    rcall("SADD", parentDependenciesKey, jobIdKey)
end
return jobId
`,keys:6};a.s(["addDelayedJob",0,bu],910737),a.i(910737);let bv={name:"addJobScheduler",content:`--[[
  Adds a job scheduler, i.e. a job factory that creates jobs based on a given schedule (repeat options).
    Input:
      KEYS[1]  'repeat' key
      KEYS[2]  'delayed' key
      KEYS[3]  'wait' key
      KEYS[4]  'paused' key
      KEYS[5]  'meta' key
      KEYS[6]  'prioritized' key
      KEYS[7]  'marker' key
      KEYS[8]  'id' key
      KEYS[9]  'events' key
      KEYS[10] 'pc' priority counter
      KEYS[11] 'active' key
      ARGV[1] next milliseconds
      ARGV[2] msgpacked options
            [1]  name
            [2]  tz?
            [3]  pattern?
            [4]  endDate?
            [5]  every?
      ARGV[3] jobs scheduler id
      ARGV[4] Json stringified template data
      ARGV[5] mspacked template opts
      ARGV[6] msgpacked delayed opts
      ARGV[7] timestamp
      ARGV[8] prefix key
      ARGV[9] producer key
      Output:
        repeatableKey  - OK
]] local rcall = redis.call
local repeatKey = KEYS[1]
local delayedKey = KEYS[2]
local waitKey = KEYS[3]
local pausedKey = KEYS[4]
local metaKey = KEYS[5]
local prioritizedKey = KEYS[6]
local eventsKey = KEYS[9]
local nextMillis = ARGV[1]
local jobSchedulerId = ARGV[3]
local templateOpts = cmsgpack.unpack(ARGV[5])
local now = tonumber(ARGV[7])
local prefixKey = ARGV[8]
local jobOpts = cmsgpack.unpack(ARGV[6])
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Shared helper to store a job and enqueue it into the appropriate list/set.
  Handles delayed, prioritized, and standard (LIFO/FIFO) jobs.
  Emits the appropriate event after enqueuing ("delayed" or "waiting").
  Returns delay, priority from storeJob.
]]
-- Includes
--[[
  Adds a delayed job to the queue by doing the following:
    - Creates a new job key with the job data.
    - adds to delayed zset.
    - Emits a global event 'delayed' if the job is delayed.
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Bake in the job id first 12 bits into the timestamp
  to guarantee correct execution order of delayed jobs
  (up to 4096 jobs per given timestamp or 4096 jobs apart per timestamp)
  WARNING: Jobs that are so far apart that they wrap around will cause FIFO to fail
]]
local function getDelayedScore(delayedKey, timestamp, delay)
  local delayedTimestamp = (delay > 0 and (tonumber(timestamp) + delay)) or tonumber(timestamp)
  local minScore = delayedTimestamp * 0x1000
  local maxScore = (delayedTimestamp + 1 ) * 0x1000 - 1
  local result = rcall("ZREVRANGEBYSCORE", delayedKey, maxScore,
    minScore, "WITHSCORES","LIMIT", 0, 1)
  if #result then
    local currentMaxScore = tonumber(result[2])
    if currentMaxScore ~= nil then
      if currentMaxScore >= maxScore then
        return maxScore, delayedTimestamp
      else
        return currentMaxScore + 1, delayedTimestamp
      end
    end
  end
  return minScore, delayedTimestamp
end
local function addDelayedJob(jobId, delayedKey, eventsKey, timestamp,
  maxEvents, markerKey, delay)
  local score, delayedTimestamp = getDelayedScore(delayedKey, timestamp, tonumber(delay))
  rcall("ZADD", delayedKey, score, jobId)
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "delayed",
    "jobId", jobId, "delay", delayedTimestamp)
  -- mark that a delayed job is available
  addDelayMarkerIfNeeded(markerKey, delayedKey)
end
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
local function storeAndEnqueueJob(eventsKey, jobIdKey, jobId, name, data, opts,
    timestamp, parentKey, parentData, repeatJobKey, maxEvents,
    waitKey, pausedKey, activeKey, metaKey, prioritizedKey,
    priorityCounterKey, delayedKey, markerKey)
  local delay, priority = storeJob(eventsKey, jobIdKey, jobId, name, data,
      opts, timestamp, parentKey, parentData, repeatJobKey)
  if delay ~= 0 and delayedKey then
    addDelayedJob(jobId, delayedKey, eventsKey, timestamp, maxEvents, markerKey, delay)
  else
    local target, isPausedOrMaxed = getTargetQueueList(metaKey, activeKey, waitKey, pausedKey)
    if priority > 0 then
      addJobWithPriority(markerKey, prioritizedKey, priority, jobId,
          priorityCounterKey, isPausedOrMaxed)
    else
      local pushCmd = opts['lifo'] and 'RPUSH' or 'LPUSH'
      addJobInTargetList(target, markerKey, pushCmd, isPausedOrMaxed, jobId)
    end
    rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "waiting",
        "jobId", jobId)
  end
  return delay, priority
end
local function addJobFromScheduler(jobKey, jobId, opts, waitKey, pausedKey, activeKey, metaKey, 
  prioritizedKey, priorityCounter, delayedKey, markerKey, eventsKey, name, maxEvents, timestamp,
  data, jobSchedulerId, repeatDelay)
  opts['delay'] = repeatDelay
  opts['jobId'] = jobId
  storeAndEnqueueJob(eventsKey, jobKey, jobId, name, data, opts,
      timestamp, nil, nil, jobSchedulerId, maxEvents,
      waitKey, pausedKey, activeKey, metaKey, prioritizedKey,
      priorityCounter, delayedKey, markerKey)
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePaused(queueMetaKey)
  return rcall("HEXISTS", queueMetaKey, "paused") == 1
end
--[[
  Function to remove job.
]]
-- Includes
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobId, deduplicationId)
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      rcall("DEL", deduplicationKey)
      -- Also clean up any pending dedup-next data for this dedup ID
      rcall("DEL", prefixKey .. "dn:" .. deduplicationId)
      return 1
    end
  end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local function removeJob(jobId, hard, baseKey, shouldRemoveDeduplicationKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  if shouldRemoveDeduplicationKey then
    local deduplicationId = rcall("HGET", jobKey, "deid")
    removeDeduplicationKeyIfNeededOnRemoval(baseKey, jobId, deduplicationId)
  end
  removeJobKeys(jobKey)
end
--[[
  Function to store a job scheduler
]]
local function storeJobScheduler(schedulerId, schedulerKey, repeatKey, nextMillis, opts,
  templateData, templateOpts)
  rcall("ZADD", repeatKey, nextMillis, schedulerId)
  local optionalValues = {}
  if opts['tz'] then
    table.insert(optionalValues, "tz")
    table.insert(optionalValues, opts['tz'])
  end
  if opts['limit'] then
    table.insert(optionalValues, "limit")
    table.insert(optionalValues, opts['limit'])
  end
  if opts['pattern'] then
    table.insert(optionalValues, "pattern")
    table.insert(optionalValues, opts['pattern'])
  end
  if opts['startDate'] then
    table.insert(optionalValues, "startDate")
    table.insert(optionalValues, opts['startDate'])
  end
  if opts['endDate'] then
    table.insert(optionalValues, "endDate")
    table.insert(optionalValues, opts['endDate'])
  end
  if opts['every'] then
    table.insert(optionalValues, "every")
    table.insert(optionalValues, opts['every'])
  end
  if opts['offset'] then
    table.insert(optionalValues, "offset")
    table.insert(optionalValues, opts['offset'])
  else
    local offset = rcall("HGET", schedulerKey, "offset")
    if offset then
      table.insert(optionalValues, "offset")
      table.insert(optionalValues, tonumber(offset))
    end
  end
  local jsonTemplateOpts = cjson.encode(templateOpts)
  if jsonTemplateOpts and jsonTemplateOpts ~= '{}' then
    table.insert(optionalValues, "opts")
    table.insert(optionalValues, jsonTemplateOpts)
  end
  if templateData and templateData ~= '{}' then
    table.insert(optionalValues, "data")
    table.insert(optionalValues, templateData)
  end
  table.insert(optionalValues, "ic")
  table.insert(optionalValues, rcall("HGET", schedulerKey, "ic") or 1)
  rcall("DEL", schedulerKey) -- remove all attributes and then re-insert new ones
  rcall("HMSET", schedulerKey, "name", opts['name'], unpack(optionalValues))
end
local function getJobSchedulerEveryNextMillis(prevMillis, every, now, offset, startDate)
    offset = tonumber(offset)
    local nextMillis
    if not prevMillis then
        if startDate then
            -- Assuming startDate is passed as milliseconds from JavaScript
            nextMillis = tonumber(startDate)
            nextMillis = nextMillis > now and nextMillis or now
        else
            if offset and offset > 0 then
                -- Align to the next slot that respects the offset
                nextMillis = math.floor(now / every) * every + offset
                if nextMillis <= now then
                    nextMillis = nextMillis + every
                end
            else
                nextMillis = now
            end
        end
    else
        nextMillis = prevMillis + every
        -- check if we may have missed some iterations
        if nextMillis < now then
            -- Use the same offset-aware alignment as the initial branch
            -- above so a non-zero offset is preserved across catch-ups
            -- instead of being flattened to (slot + every). When the
            -- aligned slot is itself still in the past, advance by one
            -- full interval; otherwise the aligned slot is the next
            -- iteration.
            local aligned = math.floor(now / every) * every + (offset or 0)
            if aligned <= now then
                nextMillis = aligned + every
            else
                nextMillis = aligned
            end
        end
    end
    if not offset or offset == 0 then
        local timeSlot = math.floor(nextMillis / every) * every;
        offset = nextMillis - timeSlot;
    end
    -- Return a tuple nextMillis, offset
    return math.floor(nextMillis), math.floor(offset)
end
-- If we are overriding a repeatable job we must delete the delayed job for
-- the next iteration.
local schedulerKey = repeatKey .. ":" .. jobSchedulerId
local maxEvents = getOrSetMaxEvents(metaKey)
local templateData = ARGV[4]
local prevMillis = rcall("ZSCORE", repeatKey, jobSchedulerId)
if prevMillis then
    prevMillis = tonumber(prevMillis)
end
local schedulerOpts = cmsgpack.unpack(ARGV[2])
local every = schedulerOpts['every']
-- For backwards compatibility we also check the offset from the job itself.
-- could be removed in future major versions.
local jobOffset = jobOpts['repeat'] and jobOpts['repeat']['offset'] or 0
local offset = schedulerOpts['offset'] or jobOffset or 0
local newOffset = offset
local updatedEvery = false
if every then
    -- if we changed the 'every' value we need to reset millis to nil
    local millis = prevMillis
    if prevMillis then
        local prevEvery = tonumber(rcall("HGET", schedulerKey, "every"))
        if prevEvery ~= every then
            millis = nil
            updatedEvery = true
        end
    end
    local startDate = schedulerOpts['startDate']
    nextMillis, newOffset = getJobSchedulerEveryNextMillis(millis, every, now, offset, startDate)
end
local function removeJobFromScheduler(prefixKey, delayedKey, prioritizedKey, waitKey, pausedKey, jobId, metaKey,
    eventsKey)
    if rcall("ZSCORE", delayedKey, jobId) then
        removeJob(jobId, true, prefixKey, true --[[remove debounce key]] )
        rcall("ZREM", delayedKey, jobId)
        return true
    elseif rcall("ZSCORE", prioritizedKey, jobId) then
        removeJob(jobId, true, prefixKey, true --[[remove debounce key]] )
        rcall("ZREM", prioritizedKey, jobId)
        return true
    else
        local pausedOrWaitKey = waitKey
        if isQueuePaused(metaKey) then
            pausedOrWaitKey = pausedKey
        end
        if rcall("LREM", pausedOrWaitKey, 1, jobId) > 0 then
            removeJob(jobId, true, prefixKey, true --[[remove debounce key]] )
            return true
        end
    end
    return false
end
local removedPrevJob = false
if prevMillis then
    local currentJobId = "repeat:" .. jobSchedulerId .. ":" .. prevMillis
    local currentJobKey = schedulerKey .. ":" .. prevMillis
    -- In theory it should always exist the currentJobKey if there is a prevMillis unless something has
    -- gone really wrong.
    if rcall("EXISTS", currentJobKey) == 1 then
        removedPrevJob = removeJobFromScheduler(prefixKey, delayedKey, prioritizedKey, waitKey, pausedKey, currentJobId,
            metaKey, eventsKey)
    end
end
if removedPrevJob then
    -- The jobs has been removed and we want to replace it, so lets use the same millis.
    if every and not updatedEvery then
        nextMillis = prevMillis
    end
else
    -- Special case where no job was removed, and we need to add the next iteration.
    schedulerOpts['offset'] = newOffset
end
-- Check for job ID collision with existing jobs (in any state)
local jobId = "repeat:" .. jobSchedulerId .. ":" .. nextMillis
local jobKey = prefixKey .. jobId
-- If there's already a job with this ID, in a state
-- that is not updatable (active, completed, failed) we must
-- handle the collision
local hasCollision = false
if rcall("EXISTS", jobKey) == 1 then
    if every then
        -- For 'every' case: walk forward through subsequent slots
        -- until we find a free one. Stale completed/failed jobs from
        -- a previous scheduler under the same id can occupy several
        -- consecutive slots (issue #3063), so a single retry is not
        -- enough. The scan is bounded so we don't spin if the
        -- scheduler is genuinely contested.
        local maxSlotScans = 32
        local slotsScanned = 0
        local jobExists
        repeat
            nextMillis = nextMillis + every
            jobId = "repeat:" .. jobSchedulerId .. ":" .. nextMillis
            jobKey = prefixKey .. jobId
            slotsScanned = slotsScanned + 1
            jobExists = rcall("EXISTS", jobKey)
        until jobExists == 0 or slotsScanned >= maxSlotScans
        if jobExists == 1 then
            -- Every scanned slot still has a job, return error code
            return -11 -- SchedulerJobSlotsBusy
        end
    else
        hasCollision = true
    end
end
local delay = nextMillis - now
-- Fast Clamp delay to minimum of 0
if delay < 0 then
    delay = 0
end
local nextJobKey = schedulerKey .. ":" .. nextMillis
if not hasCollision or removedPrevJob then
    -- jobId already calculated above during collision check
    storeJobScheduler(jobSchedulerId, schedulerKey, repeatKey, nextMillis, schedulerOpts, templateData, templateOpts)
    rcall("INCR", KEYS[8])
    addJobFromScheduler(nextJobKey, jobId, jobOpts, waitKey, pausedKey, KEYS[11], metaKey, prioritizedKey, KEYS[10],
        delayedKey, KEYS[7], eventsKey, schedulerOpts['name'], maxEvents, now, templateData, jobSchedulerId, delay)
elseif hasCollision then
    -- For 'pattern' case: return error code
    return -10 -- SchedulerJobIdCollision
end
if ARGV[9] ~= "" then
    rcall("HSET", ARGV[9], "nrjid", jobId)
end
return {jobId .. "", delay}
`,keys:11};a.s(["addJobScheduler",0,bv],487799),a.i(487799);let bw={name:"addLog",content:`--[[
  Add job log
  Input:
    KEYS[1] job id key
    KEYS[2] job logs key
    ARGV[1] id
    ARGV[2] log
    ARGV[3] keepLogs
  Output:
    -1 - Missing job.
]]
local rcall = redis.call
if rcall("EXISTS", KEYS[1]) == 1 then -- // Make sure job exists
  local logCount = rcall("RPUSH", KEYS[2], ARGV[2])
  if ARGV[3] ~= '' then
    local keepLogs = tonumber(ARGV[3])
    rcall("LTRIM", KEYS[2], -keepLogs, -1)
    return math.min(keepLogs, logCount)
  end
  return logCount
else
  return -1
end
`,keys:2};a.s(["addLog",0,bw],319010),a.i(319010);let bx={name:"addParentJob",content:`--[[
  Adds a parent job to the queue by doing the following:
    - Increases the job counter if needed.
    - Creates a new job key with the job data.
    - adds the job to the waiting-children zset
    Input:
      KEYS[1] 'meta'
      KEYS[2] 'id'
      KEYS[3] 'delayed'
      KEYS[4] 'waiting-children'
      KEYS[5] 'completed'
      KEYS[6] events stream key
      ARGV[1] msgpacked arguments array
            [1]  key prefix,
            [2]  custom id (will not generate one automatically)
            [3]  name
            [4]  timestamp
            [5]  parentKey?
            [6]  parent dependencies key.
            [7]  parent? {id, queueKey}
            [8]  repeat job key
            [9] deduplication key
      ARGV[2] Json stringified job data
      ARGV[3] msgpacked options
      Output:
        jobId  - OK
        -5     - Missing parent key
]]
local metaKey = KEYS[1]
local idKey = KEYS[2]
local delayedKey = KEYS[3]
local completedKey = KEYS[5]
local eventsKey = KEYS[6]
local jobId
local jobIdKey
local rcall = redis.call
local args = cmsgpack.unpack(ARGV[1])
local data = ARGV[2]
local opts = cmsgpack.unpack(ARGV[3])
local parentKey = args[5]
local parent = args[7]
local repeatJobKey = args[8]
local deduplicationKey = args[9]
local parentData
-- Includes
--[[
  Function to deduplicate a job.
]]
--[[
  Function to set the deduplication key for a job.
  Uses TTL from deduplication opts if provided.
]]
local function setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
    local ttl = deduplicationOpts and deduplicationOpts['ttl']
    if ttl and ttl > 0 then
        rcall('SET', deduplicationKey, jobId, 'PX', ttl)
    else
        rcall('SET', deduplicationKey, jobId)
    end
end
--[[
  Function to store a deduplicated next job if the existing job is active
  and keepLastIfActive is set. When the active job finishes, the stored
  proto-job is used to create a real job in the queue.
  Returns true if the proto-job was stored, false otherwise.
]]
--[[
  Function to check if an item belongs to a list.
]]
local function checkItemInList(list, item)
  for _, v in pairs(list) do
    if v == item then
      return 1
    end
  end
  return nil
end
local function storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
    deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
    parentKey, parentData, parentDependenciesKey, repeatJobKey)
    if deduplicationOpts['keepLastIfActive'] and currentDebounceJobId then
        local activeKey = prefix .. "active"
        local activeItems = rcall('LRANGE', activeKey, 0, -1)
        if checkItemInList(activeItems, currentDebounceJobId) then
            local deduplicationNextKey = prefix .. "dn:" .. deduplicationId
            local fields = {'name', jobName, 'data', jobData, 'opts', cjson.encode(fullOpts),
                'jid', jobId}
            if parentKey then
                fields[#fields+1] = 'pk'
                fields[#fields+1] = parentKey
            end
            if parentData then
                fields[#fields+1] = 'pd'
                fields[#fields+1] = parentData
            end
            if parentDependenciesKey then
                fields[#fields+1] = 'pdk'
                fields[#fields+1] = parentDependenciesKey
            end
            if repeatJobKey then
                fields[#fields+1] = 'rjk'
                fields[#fields+1] = repeatJobKey
            end
            rcall('DEL', deduplicationNextKey)
            rcall('HSET', deduplicationNextKey, unpack(fields))
            -- Ensure the dedup key does not expire while the job is active,
            -- so subsequent adds always hit the dedup path and never bypass
            -- the active-check because of a TTL expiry.
            local deduplicationKey = prefix .. "de:" .. deduplicationId
            rcall('PERSIST', deduplicationKey)
            -- TODO remove debounced event in next breaking change
            rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
                currentDebounceJobId, "debounceId", deduplicationId)
            rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
            return true
        end
    end
    return false
end
local function deduplicateJobWithoutReplace(deduplicationId, deduplicationOpts, jobId, deduplicationKey,
    eventsKey, maxEvents, prefix, jobName, jobData, fullOpts,
    parentKey, parentData, parentDependenciesKey, repeatJobKey)
    local ttl = deduplicationOpts['ttl']
    local deduplicationKeyExists
    if ttl and ttl > 0 then
        if deduplicationOpts['extend'] then
            local currentDebounceJobId = rcall('GET', deduplicationKey)
            if currentDebounceJobId then
                if storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
                    deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
                    parentKey, parentData, parentDependenciesKey, repeatJobKey) then
                    return currentDebounceJobId
                end
                if deduplicationOpts['keepLastIfActive'] then
                    rcall('SET', deduplicationKey, currentDebounceJobId)
                else
                    setDeduplicationKey(deduplicationKey, currentDebounceJobId, deduplicationOpts)
                end
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced",
                    "jobId", currentDebounceJobId, "debounceId", deduplicationId)
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                    currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
                return currentDebounceJobId
            else
                if deduplicationOpts['keepLastIfActive'] then
                    rcall('SET', deduplicationKey, jobId)
                else
                    setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
                end
                return
            end
        else
            if deduplicationOpts['keepLastIfActive'] then
                deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'NX')
            else
                deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'PX', ttl, 'NX')
            end
        end
    else
        deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'NX')
    end
    if deduplicationKeyExists then
        local currentDebounceJobId = rcall('GET', deduplicationKey)
        if storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
            deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
            parentKey, parentData, parentDependenciesKey, repeatJobKey) then
            return currentDebounceJobId
        end
        -- TODO remove debounced event in next breaking change
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
            currentDebounceJobId, "debounceId", deduplicationId)
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
            currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
        return currentDebounceJobId
    end
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to handle the case when job is duplicated.
]]
-- Includes
--[[
    This function is used to update the parent's dependencies if the job
    is already completed and about to be ignored. The parent must get its
    dependencies updated to avoid the parent job being stuck forever in 
    the waiting-children state.
]]
-- Includes
--[[
  Validate and move or add dependencies to parent.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized)
  if no pending dependencies.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized) if needed.
]]
-- Includes
--[[
  Move parent to a wait status (wait, prioritized or delayed)
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check if queue is paused or maxed
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePausedOrMaxed(queueMetaKey, activeKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency")
  if queueAttributes[1] then
    return true
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      return activeCount >= tonumber(queueAttributes[2])
    end
  end
  return false
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    local parentWaitKey = parentQueueKey .. ":wait"
    local parentPausedKey = parentQueueKey .. ":paused"
    local parentActiveKey = parentQueueKey .. ":active"
    local parentMetaKey = parentQueueKey .. ":meta"
    local parentMarkerKey = parentQueueKey .. ":marker"
    local jobAttributes = rcall("HMGET", parentKey, "priority", "delay")
    local priority = tonumber(jobAttributes[1]) or 0
    local delay = tonumber(jobAttributes[2]) or 0
    if delay > 0 then
        local delayedTimestamp = tonumber(timestamp) + delay
        local score = delayedTimestamp * 0x1000
        local parentDelayedKey = parentQueueKey .. ":delayed"
        rcall("ZADD", parentDelayedKey, score, parentId)
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "delayed", "jobId", parentId, "delay",
            delayedTimestamp)
        addDelayMarkerIfNeeded(parentMarkerKey, parentDelayedKey)
    else
        if priority == 0 then
            local parentTarget, isParentPausedOrMaxed = getTargetQueueList(parentMetaKey, parentActiveKey,
                parentWaitKey, parentPausedKey)
            addJobInTargetList(parentTarget, parentMarkerKey, "RPUSH", isParentPausedOrMaxed, parentId)
        else
            local isPausedOrMaxed = isQueuePausedOrMaxed(parentMetaKey, parentActiveKey)
            addJobWithPriority(parentMarkerKey, parentQueueKey .. ":prioritized", priority, parentId,
                parentQueueKey .. ":pc", isPausedOrMaxed)
        end
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "waiting", "jobId", parentId, "prev",
            "waiting-children")
    end
end
local function moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  if rcall("EXISTS", parentKey) == 1 then
    local parentWaitingChildrenKey = parentQueueKey .. ":waiting-children"
    if rcall("ZSCORE", parentWaitingChildrenKey, parentId) then    
      rcall("ZREM", parentWaitingChildrenKey, parentId)
      moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    end
  end
end
local function moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey,
  parentId, timestamp)
  local doNotHavePendingDependencies = rcall("SCARD", parentDependenciesKey) == 0
  if doNotHavePendingDependencies then
    moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  end
end
local function updateParentDepsIfNeeded(parentKey, parentQueueKey, parentDependenciesKey,
  parentId, jobIdKey, returnvalue, timestamp )
  local processedSet = parentKey .. ":processed"
  rcall("HSET", processedSet, jobIdKey, returnvalue)
  moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey, parentId, timestamp)
end
local function updateExistingJobsParent(parentKey, parent, parentData,
                                        parentDependenciesKey, completedKey,
                                        jobIdKey, jobId, timestamp)
    if parentKey ~= nil then
        if rcall("ZSCORE", completedKey, jobId) then
            local returnvalue = rcall("HGET", jobIdKey, "returnvalue")
            updateParentDepsIfNeeded(parentKey, parent['queueKey'],
                                     parentDependenciesKey, parent['id'],
                                     jobIdKey, returnvalue, timestamp)
        else
            if parentDependenciesKey ~= nil then
                rcall("SADD", parentDependenciesKey, jobIdKey)
            end
        end
        rcall("HMSET", jobIdKey, "parentKey", parentKey, "parent", parentData)
    end
end
local function handleDuplicatedJob(jobKey, jobId, currentParentKey, currentParent,
  parentData, parentDependenciesKey, completedKey, eventsKey, maxEvents, timestamp)
  local existedParentKey = rcall("HGET", jobKey, "parentKey")
  if not existedParentKey or existedParentKey == currentParentKey then
    updateExistingJobsParent(currentParentKey, currentParent, parentData,
      parentDependenciesKey, completedKey, jobKey,
      jobId, timestamp)
  else
    if currentParentKey ~= nil and currentParentKey ~= existedParentKey
      and (rcall("EXISTS", existedParentKey) == 1) then
      return -7
    end
  end
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event",
    "duplicated", "jobId", jobId)
  return jobId .. "" -- convert to string
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
if parentKey ~= nil then
    if rcall("EXISTS", parentKey) ~= 1 then return -5 end
    parentData = cjson.encode(parent)
end
local jobCounter = rcall("INCR", idKey)
local maxEvents = getOrSetMaxEvents(metaKey)
local parentDependenciesKey = args[6]
local timestamp = args[4]
if args[2] == "" then
    jobId = jobCounter .. "" -- convert to string
    jobIdKey = args[1] .. jobId
else
    jobId = args[2]
    jobIdKey = args[1] .. jobId
    if rcall("EXISTS", jobIdKey) == 1 then
        return handleDuplicatedJob(jobIdKey, jobId, parentKey, parent,
            parentData, parentDependenciesKey, completedKey, eventsKey,
            maxEvents, timestamp)
    end
end
local deduplicationId = opts['de'] and opts['de']['id']
if deduplicationId then
    local deduplicationJobId = deduplicateJobWithoutReplace(deduplicationId, opts['de'],
        jobId, deduplicationKey, eventsKey, maxEvents, args[1], args[3], ARGV[2], opts,
        parentKey, parentData, parentDependenciesKey, repeatJobKey)
    if deduplicationJobId then
        return deduplicationJobId
    end
end
-- Store the job.
storeJob(eventsKey, jobIdKey, jobId, args[3], ARGV[2], opts, timestamp,
         parentKey, parentData, repeatJobKey)
local waitChildrenKey = KEYS[4]
rcall("ZADD", waitChildrenKey, timestamp, jobId)
rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event",
      "waiting-children", "jobId", jobId)
-- Check if this job is a child of another job, if so add it to the parents dependencies
if parentDependenciesKey ~= nil then
    rcall("SADD", parentDependenciesKey, jobIdKey)
end
return jobId
`,keys:6};a.s(["addParentJob",0,bx],688761),a.i(688761);let by={name:"addPrioritizedJob",content:`--[[
  Adds a prioritized job to the queue by doing the following:
    - Increases the job counter if needed.
    - Creates a new job key with the job data.
    - Adds the job to the "added" list so that workers gets notified.
    Input:
      KEYS[1] 'marker',
      KEYS[2] 'meta'
      KEYS[3] 'id'
      KEYS[4] 'prioritized'
      KEYS[5] 'delayed'
      KEYS[6] 'completed'
      KEYS[7] 'active'
      KEYS[8] events stream key
      KEYS[9] 'pc' priority counter
      ARGV[1] msgpacked arguments array
            [1]  key prefix,
            [2]  custom id (will not generate one automatically)
            [3]  name
            [4]  timestamp
            [5]  parentKey?
            [6]  parent dependencies key.
            [7]  parent? {id, queueKey}
            [8]  repeat job key
            [9] deduplication key
      ARGV[2] Json stringified job data
      ARGV[3] msgpacked options
      Output:
        jobId  - OK
        -5     - Missing parent key
]] 
local metaKey = KEYS[2]
local idKey = KEYS[3]
local priorityKey = KEYS[4]
local completedKey = KEYS[6]
local activeKey = KEYS[7]
local eventsKey = KEYS[8]
local priorityCounterKey = KEYS[9]
local jobId
local jobIdKey
local rcall = redis.call
local args = cmsgpack.unpack(ARGV[1])
local data = ARGV[2]
local opts = cmsgpack.unpack(ARGV[3])
local parentKey = args[5]
local parent = args[7]
local repeatJobKey = args[8]
local deduplicationKey = args[9]
local parentData
-- Includes
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to debounce a job.
]]
-- Includes
--[[
  Function to deduplicate a job.
]]
--[[
  Function to set the deduplication key for a job.
  Uses TTL from deduplication opts if provided.
]]
local function setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
    local ttl = deduplicationOpts and deduplicationOpts['ttl']
    if ttl and ttl > 0 then
        rcall('SET', deduplicationKey, jobId, 'PX', ttl)
    else
        rcall('SET', deduplicationKey, jobId)
    end
end
--[[
  Function to store a deduplicated next job if the existing job is active
  and keepLastIfActive is set. When the active job finishes, the stored
  proto-job is used to create a real job in the queue.
  Returns true if the proto-job was stored, false otherwise.
]]
--[[
  Function to check if an item belongs to a list.
]]
local function checkItemInList(list, item)
  for _, v in pairs(list) do
    if v == item then
      return 1
    end
  end
  return nil
end
local function storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
    deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
    parentKey, parentData, parentDependenciesKey, repeatJobKey)
    if deduplicationOpts['keepLastIfActive'] and currentDebounceJobId then
        local activeKey = prefix .. "active"
        local activeItems = rcall('LRANGE', activeKey, 0, -1)
        if checkItemInList(activeItems, currentDebounceJobId) then
            local deduplicationNextKey = prefix .. "dn:" .. deduplicationId
            local fields = {'name', jobName, 'data', jobData, 'opts', cjson.encode(fullOpts),
                'jid', jobId}
            if parentKey then
                fields[#fields+1] = 'pk'
                fields[#fields+1] = parentKey
            end
            if parentData then
                fields[#fields+1] = 'pd'
                fields[#fields+1] = parentData
            end
            if parentDependenciesKey then
                fields[#fields+1] = 'pdk'
                fields[#fields+1] = parentDependenciesKey
            end
            if repeatJobKey then
                fields[#fields+1] = 'rjk'
                fields[#fields+1] = repeatJobKey
            end
            rcall('DEL', deduplicationNextKey)
            rcall('HSET', deduplicationNextKey, unpack(fields))
            -- Ensure the dedup key does not expire while the job is active,
            -- so subsequent adds always hit the dedup path and never bypass
            -- the active-check because of a TTL expiry.
            local deduplicationKey = prefix .. "de:" .. deduplicationId
            rcall('PERSIST', deduplicationKey)
            -- TODO remove debounced event in next breaking change
            rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
                currentDebounceJobId, "debounceId", deduplicationId)
            rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
            return true
        end
    end
    return false
end
local function deduplicateJobWithoutReplace(deduplicationId, deduplicationOpts, jobId, deduplicationKey,
    eventsKey, maxEvents, prefix, jobName, jobData, fullOpts,
    parentKey, parentData, parentDependenciesKey, repeatJobKey)
    local ttl = deduplicationOpts['ttl']
    local deduplicationKeyExists
    if ttl and ttl > 0 then
        if deduplicationOpts['extend'] then
            local currentDebounceJobId = rcall('GET', deduplicationKey)
            if currentDebounceJobId then
                if storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
                    deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
                    parentKey, parentData, parentDependenciesKey, repeatJobKey) then
                    return currentDebounceJobId
                end
                if deduplicationOpts['keepLastIfActive'] then
                    rcall('SET', deduplicationKey, currentDebounceJobId)
                else
                    setDeduplicationKey(deduplicationKey, currentDebounceJobId, deduplicationOpts)
                end
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced",
                    "jobId", currentDebounceJobId, "debounceId", deduplicationId)
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                    currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
                return currentDebounceJobId
            else
                if deduplicationOpts['keepLastIfActive'] then
                    rcall('SET', deduplicationKey, jobId)
                else
                    setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
                end
                return
            end
        else
            if deduplicationOpts['keepLastIfActive'] then
                deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'NX')
            else
                deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'PX', ttl, 'NX')
            end
        end
    else
        deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'NX')
    end
    if deduplicationKeyExists then
        local currentDebounceJobId = rcall('GET', deduplicationKey)
        if storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
            deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
            parentKey, parentData, parentDependenciesKey, repeatJobKey) then
            return currentDebounceJobId
        end
        -- TODO remove debounced event in next breaking change
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
            currentDebounceJobId, "debounceId", deduplicationId)
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
            currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
        return currentDebounceJobId
    end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
local function removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents, currentDeduplicatedJobId,
    jobId, deduplicationId, prefix)
    if rcall("ZREM", delayedKey, currentDeduplicatedJobId) > 0 then
        removeJobKeys(prefix .. currentDeduplicatedJobId)
        rcall("XADD", eventsKey, "*", "event", "removed", "jobId", currentDeduplicatedJobId,
            "prev", "delayed")
        -- TODO remove debounced event in next breaking change
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
            jobId, "debounceId", deduplicationId)
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
            jobId, "deduplicationId", deduplicationId, "deduplicatedJobId", currentDeduplicatedJobId)
        return true
    end
    return false
end
local function deduplicateJob(deduplicationOpts, jobId, delayedKey, deduplicationKey, eventsKey, maxEvents,
    prefix, jobName, jobData, fullOpts, parentKey, parentData, parentDependenciesKey, repeatJobKey)
    local deduplicationId = deduplicationOpts and deduplicationOpts['id']
    if deduplicationId then
        if deduplicationOpts['replace'] then
            local currentDebounceJobId = rcall('GET', deduplicationKey)
            if currentDebounceJobId then
                local isRemoved = removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents,
                    currentDebounceJobId, jobId, deduplicationId, prefix)
                if isRemoved then
                    if deduplicationOpts['keepLastIfActive'] then
                        rcall('SET', deduplicationKey, jobId)
                    else
                        local ttl = deduplicationOpts['ttl']
                        if not deduplicationOpts['extend'] and ttl and ttl > 0 then
                            rcall('SET', deduplicationKey, jobId, 'KEEPTTL')
                        else
                            setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
                        end
                    end
                    return
                else
                    storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
                        deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
                        parentKey, parentData, parentDependenciesKey, repeatJobKey)
                    return currentDebounceJobId
                end
            else
                if deduplicationOpts['keepLastIfActive'] then
                    rcall('SET', deduplicationKey, jobId)
                else
                    setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
                end
                return
            end
        else
            return deduplicateJobWithoutReplace(deduplicationId, deduplicationOpts,
                jobId, deduplicationKey, eventsKey, maxEvents, prefix, jobName, jobData, fullOpts,
                parentKey, parentData, parentDependenciesKey, repeatJobKey)
        end
    end
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to handle the case when job is duplicated.
]]
-- Includes
--[[
    This function is used to update the parent's dependencies if the job
    is already completed and about to be ignored. The parent must get its
    dependencies updated to avoid the parent job being stuck forever in 
    the waiting-children state.
]]
-- Includes
--[[
  Validate and move or add dependencies to parent.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized)
  if no pending dependencies.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized) if needed.
]]
-- Includes
--[[
  Move parent to a wait status (wait, prioritized or delayed)
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check if queue is paused or maxed
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePausedOrMaxed(queueMetaKey, activeKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency")
  if queueAttributes[1] then
    return true
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      return activeCount >= tonumber(queueAttributes[2])
    end
  end
  return false
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    local parentWaitKey = parentQueueKey .. ":wait"
    local parentPausedKey = parentQueueKey .. ":paused"
    local parentActiveKey = parentQueueKey .. ":active"
    local parentMetaKey = parentQueueKey .. ":meta"
    local parentMarkerKey = parentQueueKey .. ":marker"
    local jobAttributes = rcall("HMGET", parentKey, "priority", "delay")
    local priority = tonumber(jobAttributes[1]) or 0
    local delay = tonumber(jobAttributes[2]) or 0
    if delay > 0 then
        local delayedTimestamp = tonumber(timestamp) + delay
        local score = delayedTimestamp * 0x1000
        local parentDelayedKey = parentQueueKey .. ":delayed"
        rcall("ZADD", parentDelayedKey, score, parentId)
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "delayed", "jobId", parentId, "delay",
            delayedTimestamp)
        addDelayMarkerIfNeeded(parentMarkerKey, parentDelayedKey)
    else
        if priority == 0 then
            local parentTarget, isParentPausedOrMaxed = getTargetQueueList(parentMetaKey, parentActiveKey,
                parentWaitKey, parentPausedKey)
            addJobInTargetList(parentTarget, parentMarkerKey, "RPUSH", isParentPausedOrMaxed, parentId)
        else
            local isPausedOrMaxed = isQueuePausedOrMaxed(parentMetaKey, parentActiveKey)
            addJobWithPriority(parentMarkerKey, parentQueueKey .. ":prioritized", priority, parentId,
                parentQueueKey .. ":pc", isPausedOrMaxed)
        end
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "waiting", "jobId", parentId, "prev",
            "waiting-children")
    end
end
local function moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  if rcall("EXISTS", parentKey) == 1 then
    local parentWaitingChildrenKey = parentQueueKey .. ":waiting-children"
    if rcall("ZSCORE", parentWaitingChildrenKey, parentId) then    
      rcall("ZREM", parentWaitingChildrenKey, parentId)
      moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    end
  end
end
local function moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey,
  parentId, timestamp)
  local doNotHavePendingDependencies = rcall("SCARD", parentDependenciesKey) == 0
  if doNotHavePendingDependencies then
    moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  end
end
local function updateParentDepsIfNeeded(parentKey, parentQueueKey, parentDependenciesKey,
  parentId, jobIdKey, returnvalue, timestamp )
  local processedSet = parentKey .. ":processed"
  rcall("HSET", processedSet, jobIdKey, returnvalue)
  moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey, parentId, timestamp)
end
local function updateExistingJobsParent(parentKey, parent, parentData,
                                        parentDependenciesKey, completedKey,
                                        jobIdKey, jobId, timestamp)
    if parentKey ~= nil then
        if rcall("ZSCORE", completedKey, jobId) then
            local returnvalue = rcall("HGET", jobIdKey, "returnvalue")
            updateParentDepsIfNeeded(parentKey, parent['queueKey'],
                                     parentDependenciesKey, parent['id'],
                                     jobIdKey, returnvalue, timestamp)
        else
            if parentDependenciesKey ~= nil then
                rcall("SADD", parentDependenciesKey, jobIdKey)
            end
        end
        rcall("HMSET", jobIdKey, "parentKey", parentKey, "parent", parentData)
    end
end
local function handleDuplicatedJob(jobKey, jobId, currentParentKey, currentParent,
  parentData, parentDependenciesKey, completedKey, eventsKey, maxEvents, timestamp)
  local existedParentKey = rcall("HGET", jobKey, "parentKey")
  if not existedParentKey or existedParentKey == currentParentKey then
    updateExistingJobsParent(currentParentKey, currentParent, parentData,
      parentDependenciesKey, completedKey, jobKey,
      jobId, timestamp)
  else
    if currentParentKey ~= nil and currentParentKey ~= existedParentKey
      and (rcall("EXISTS", existedParentKey) == 1) then
      return -7
    end
  end
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event",
    "duplicated", "jobId", jobId)
  return jobId .. "" -- convert to string
end
if parentKey ~= nil then
    if rcall("EXISTS", parentKey) ~= 1 then return -5 end
    parentData = cjson.encode(parent)
end
local jobCounter = rcall("INCR", idKey)
local maxEvents = getOrSetMaxEvents(metaKey)
local parentDependenciesKey = args[6]
local timestamp = args[4]
if args[2] == "" then
    jobId = jobCounter .. "" -- convert to string
    jobIdKey = args[1] .. jobId
else
    jobId = args[2]
    jobIdKey = args[1] .. jobId
    if rcall("EXISTS", jobIdKey) == 1 then
        return handleDuplicatedJob(jobIdKey, jobId, parentKey, parent,
            parentData, parentDependenciesKey, completedKey, eventsKey,
            maxEvents, timestamp)
    end
end
local deduplicationJobId = deduplicateJob(opts['de'], jobId, KEYS[5],
  deduplicationKey, eventsKey, maxEvents, args[1], args[3], ARGV[2], opts,
  parentKey, parentData, parentDependenciesKey, repeatJobKey)
if deduplicationJobId then
  return deduplicationJobId
end
-- Store the job.
local delay, priority = storeJob(eventsKey, jobIdKey, jobId, args[3], ARGV[2],
                                 opts, timestamp, parentKey, parentData,
                                 repeatJobKey)
-- Add the job to the prioritized set
local isPausedOrMaxed = isQueuePausedOrMaxed(metaKey, activeKey)
addJobWithPriority( KEYS[1], priorityKey, priority, jobId, priorityCounterKey, isPausedOrMaxed)
-- Emit waiting event
rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "waiting",
      "jobId", jobId)
-- Check if this job is a child of another job, if so add it to the parents dependencies
if parentDependenciesKey ~= nil then
    rcall("SADD", parentDependenciesKey, jobIdKey)
end
return jobId
`,keys:9};a.s(["addPrioritizedJob",0,by],883934),a.i(883934);let bz={name:"addRepeatableJob",content:`--[[
  Adds a repeatable job
    Input:
      KEYS[1] 'repeat' key
      KEYS[2] 'delayed' key
      ARGV[1] next milliseconds
      ARGV[2] msgpacked options
            [1]  name
            [2]  tz?
            [3]  pattern?
            [4]  endDate?
            [5]  every?
      ARGV[3] legacy custom key TODO: remove this logic in next breaking change
      ARGV[4] custom key
      ARGV[5] prefix key
      Output:
        repeatableKey  - OK
]]
local rcall = redis.call
local repeatKey = KEYS[1]
local delayedKey = KEYS[2]
local nextMillis = ARGV[1]
local legacyCustomKey = ARGV[3]
local customKey = ARGV[4]
local prefixKey = ARGV[5]
-- Includes
--[[
  Function to remove job.
]]
-- Includes
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobId, deduplicationId)
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      rcall("DEL", deduplicationKey)
      -- Also clean up any pending dedup-next data for this dedup ID
      rcall("DEL", prefixKey .. "dn:" .. deduplicationId)
      return 1
    end
  end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local function removeJob(jobId, hard, baseKey, shouldRemoveDeduplicationKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  if shouldRemoveDeduplicationKey then
    local deduplicationId = rcall("HGET", jobKey, "deid")
    removeDeduplicationKeyIfNeededOnRemoval(baseKey, jobId, deduplicationId)
  end
  removeJobKeys(jobKey)
end
local function storeRepeatableJob(repeatKey, customKey, nextMillis, rawOpts)
  rcall("ZADD", repeatKey, nextMillis, customKey)
  local opts = cmsgpack.unpack(rawOpts)
  local optionalValues = {}
  if opts['tz'] then
    table.insert(optionalValues, "tz")
    table.insert(optionalValues, opts['tz'])
  end
  if opts['pattern'] then
    table.insert(optionalValues, "pattern")
    table.insert(optionalValues, opts['pattern'])
  end
  if opts['endDate'] then
    table.insert(optionalValues, "endDate")
    table.insert(optionalValues, opts['endDate'])
  end
  if opts['every'] then
    table.insert(optionalValues, "every")
    table.insert(optionalValues, opts['every'])
  end
  rcall("HMSET", repeatKey .. ":" .. customKey, "name", opts['name'],
    unpack(optionalValues))
  return customKey
end
-- If we are overriding a repeatable job we must delete the delayed job for
-- the next iteration.
local prevMillis = rcall("ZSCORE", repeatKey, customKey)
if prevMillis then
  local delayedJobId =  "repeat:" .. customKey .. ":" .. prevMillis
  local nextDelayedJobId =  repeatKey .. ":" .. customKey .. ":" .. nextMillis
  if rcall("ZSCORE", delayedKey, delayedJobId)
   and rcall("EXISTS", nextDelayedJobId) ~= 1 then
    removeJob(delayedJobId, true, prefixKey, true --[[remove debounce key]])
    rcall("ZREM", delayedKey, delayedJobId)
  end
end
-- Keep backwards compatibility with old repeatable jobs (<= 3.0.0)
if rcall("ZSCORE", repeatKey, legacyCustomKey) ~= false then
  return storeRepeatableJob(repeatKey, legacyCustomKey, nextMillis, ARGV[2])
end
return storeRepeatableJob(repeatKey, customKey, nextMillis, ARGV[2])
`,keys:2};a.s(["addRepeatableJob",0,bz],202275),a.i(202275);let bA={name:"addStandardJob",content:`--[[
  Adds a job to the queue by doing the following:
    - Increases the job counter if needed.
    - Creates a new job key with the job data.
    - if delayed:
      - computes timestamp.
      - adds to delayed zset.
      - Emits a global event 'delayed' if the job is delayed.
    - if not delayed
      - Adds the jobId to the wait/paused list in one of three ways:
         - LIFO
         - FIFO
         - prioritized.
      - Adds the job to the "added" list so that workers gets notified.
    Input:
      KEYS[1] 'wait',
      KEYS[2] 'paused'
      KEYS[3] 'meta'
      KEYS[4] 'id'
      KEYS[5] 'completed'
      KEYS[6] 'delayed'
      KEYS[7] 'active'
      KEYS[8] events stream key
      KEYS[9] marker key
      ARGV[1] msgpacked arguments array
            [1]  key prefix,
            [2]  custom id (will not generate one automatically)
            [3]  name
            [4]  timestamp
            [5]  parentKey?
            [6]  parent dependencies key.
            [7]  parent? {id, queueKey}
            [8]  repeat job key
            [9] deduplication key
      ARGV[2] Json stringified job data
      ARGV[3] msgpacked options
      Output:
        jobId  - OK
        -5     - Missing parent key
]]
local eventsKey = KEYS[8]
local jobId
local jobIdKey
local rcall = redis.call
local args = cmsgpack.unpack(ARGV[1])
local data = ARGV[2]
local opts = cmsgpack.unpack(ARGV[3])
local parentKey = args[5]
local parent = args[7]
local repeatJobKey = args[8]
local deduplicationKey = args[9]
local parentData
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to debounce a job.
]]
-- Includes
--[[
  Function to deduplicate a job.
]]
--[[
  Function to set the deduplication key for a job.
  Uses TTL from deduplication opts if provided.
]]
local function setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
    local ttl = deduplicationOpts and deduplicationOpts['ttl']
    if ttl and ttl > 0 then
        rcall('SET', deduplicationKey, jobId, 'PX', ttl)
    else
        rcall('SET', deduplicationKey, jobId)
    end
end
--[[
  Function to store a deduplicated next job if the existing job is active
  and keepLastIfActive is set. When the active job finishes, the stored
  proto-job is used to create a real job in the queue.
  Returns true if the proto-job was stored, false otherwise.
]]
--[[
  Function to check if an item belongs to a list.
]]
local function checkItemInList(list, item)
  for _, v in pairs(list) do
    if v == item then
      return 1
    end
  end
  return nil
end
local function storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
    deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
    parentKey, parentData, parentDependenciesKey, repeatJobKey)
    if deduplicationOpts['keepLastIfActive'] and currentDebounceJobId then
        local activeKey = prefix .. "active"
        local activeItems = rcall('LRANGE', activeKey, 0, -1)
        if checkItemInList(activeItems, currentDebounceJobId) then
            local deduplicationNextKey = prefix .. "dn:" .. deduplicationId
            local fields = {'name', jobName, 'data', jobData, 'opts', cjson.encode(fullOpts),
                'jid', jobId}
            if parentKey then
                fields[#fields+1] = 'pk'
                fields[#fields+1] = parentKey
            end
            if parentData then
                fields[#fields+1] = 'pd'
                fields[#fields+1] = parentData
            end
            if parentDependenciesKey then
                fields[#fields+1] = 'pdk'
                fields[#fields+1] = parentDependenciesKey
            end
            if repeatJobKey then
                fields[#fields+1] = 'rjk'
                fields[#fields+1] = repeatJobKey
            end
            rcall('DEL', deduplicationNextKey)
            rcall('HSET', deduplicationNextKey, unpack(fields))
            -- Ensure the dedup key does not expire while the job is active,
            -- so subsequent adds always hit the dedup path and never bypass
            -- the active-check because of a TTL expiry.
            local deduplicationKey = prefix .. "de:" .. deduplicationId
            rcall('PERSIST', deduplicationKey)
            -- TODO remove debounced event in next breaking change
            rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
                currentDebounceJobId, "debounceId", deduplicationId)
            rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
            return true
        end
    end
    return false
end
local function deduplicateJobWithoutReplace(deduplicationId, deduplicationOpts, jobId, deduplicationKey,
    eventsKey, maxEvents, prefix, jobName, jobData, fullOpts,
    parentKey, parentData, parentDependenciesKey, repeatJobKey)
    local ttl = deduplicationOpts['ttl']
    local deduplicationKeyExists
    if ttl and ttl > 0 then
        if deduplicationOpts['extend'] then
            local currentDebounceJobId = rcall('GET', deduplicationKey)
            if currentDebounceJobId then
                if storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
                    deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
                    parentKey, parentData, parentDependenciesKey, repeatJobKey) then
                    return currentDebounceJobId
                end
                if deduplicationOpts['keepLastIfActive'] then
                    rcall('SET', deduplicationKey, currentDebounceJobId)
                else
                    setDeduplicationKey(deduplicationKey, currentDebounceJobId, deduplicationOpts)
                end
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced",
                    "jobId", currentDebounceJobId, "debounceId", deduplicationId)
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                    currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
                return currentDebounceJobId
            else
                if deduplicationOpts['keepLastIfActive'] then
                    rcall('SET', deduplicationKey, jobId)
                else
                    setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
                end
                return
            end
        else
            if deduplicationOpts['keepLastIfActive'] then
                deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'NX')
            else
                deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'PX', ttl, 'NX')
            end
        end
    else
        deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'NX')
    end
    if deduplicationKeyExists then
        local currentDebounceJobId = rcall('GET', deduplicationKey)
        if storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
            deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
            parentKey, parentData, parentDependenciesKey, repeatJobKey) then
            return currentDebounceJobId
        end
        -- TODO remove debounced event in next breaking change
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
            currentDebounceJobId, "debounceId", deduplicationId)
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
            currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
        return currentDebounceJobId
    end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
local function removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents, currentDeduplicatedJobId,
    jobId, deduplicationId, prefix)
    if rcall("ZREM", delayedKey, currentDeduplicatedJobId) > 0 then
        removeJobKeys(prefix .. currentDeduplicatedJobId)
        rcall("XADD", eventsKey, "*", "event", "removed", "jobId", currentDeduplicatedJobId,
            "prev", "delayed")
        -- TODO remove debounced event in next breaking change
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
            jobId, "debounceId", deduplicationId)
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
            jobId, "deduplicationId", deduplicationId, "deduplicatedJobId", currentDeduplicatedJobId)
        return true
    end
    return false
end
local function deduplicateJob(deduplicationOpts, jobId, delayedKey, deduplicationKey, eventsKey, maxEvents,
    prefix, jobName, jobData, fullOpts, parentKey, parentData, parentDependenciesKey, repeatJobKey)
    local deduplicationId = deduplicationOpts and deduplicationOpts['id']
    if deduplicationId then
        if deduplicationOpts['replace'] then
            local currentDebounceJobId = rcall('GET', deduplicationKey)
            if currentDebounceJobId then
                local isRemoved = removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents,
                    currentDebounceJobId, jobId, deduplicationId, prefix)
                if isRemoved then
                    if deduplicationOpts['keepLastIfActive'] then
                        rcall('SET', deduplicationKey, jobId)
                    else
                        local ttl = deduplicationOpts['ttl']
                        if not deduplicationOpts['extend'] and ttl and ttl > 0 then
                            rcall('SET', deduplicationKey, jobId, 'KEEPTTL')
                        else
                            setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
                        end
                    end
                    return
                else
                    storeDeduplicatedNextJob(deduplicationOpts, currentDebounceJobId, prefix,
                        deduplicationId, jobName, jobData, fullOpts, eventsKey, maxEvents, jobId,
                        parentKey, parentData, parentDependenciesKey, repeatJobKey)
                    return currentDebounceJobId
                end
            else
                if deduplicationOpts['keepLastIfActive'] then
                    rcall('SET', deduplicationKey, jobId)
                else
                    setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
                end
                return
            end
        else
            return deduplicateJobWithoutReplace(deduplicationId, deduplicationOpts,
                jobId, deduplicationKey, eventsKey, maxEvents, prefix, jobName, jobData, fullOpts,
                parentKey, parentData, parentDependenciesKey, repeatJobKey)
        end
    end
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to handle the case when job is duplicated.
]]
-- Includes
--[[
    This function is used to update the parent's dependencies if the job
    is already completed and about to be ignored. The parent must get its
    dependencies updated to avoid the parent job being stuck forever in 
    the waiting-children state.
]]
-- Includes
--[[
  Validate and move or add dependencies to parent.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized)
  if no pending dependencies.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized) if needed.
]]
-- Includes
--[[
  Move parent to a wait status (wait, prioritized or delayed)
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check if queue is paused or maxed
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePausedOrMaxed(queueMetaKey, activeKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency")
  if queueAttributes[1] then
    return true
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      return activeCount >= tonumber(queueAttributes[2])
    end
  end
  return false
end
local function moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    local parentWaitKey = parentQueueKey .. ":wait"
    local parentPausedKey = parentQueueKey .. ":paused"
    local parentActiveKey = parentQueueKey .. ":active"
    local parentMetaKey = parentQueueKey .. ":meta"
    local parentMarkerKey = parentQueueKey .. ":marker"
    local jobAttributes = rcall("HMGET", parentKey, "priority", "delay")
    local priority = tonumber(jobAttributes[1]) or 0
    local delay = tonumber(jobAttributes[2]) or 0
    if delay > 0 then
        local delayedTimestamp = tonumber(timestamp) + delay
        local score = delayedTimestamp * 0x1000
        local parentDelayedKey = parentQueueKey .. ":delayed"
        rcall("ZADD", parentDelayedKey, score, parentId)
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "delayed", "jobId", parentId, "delay",
            delayedTimestamp)
        addDelayMarkerIfNeeded(parentMarkerKey, parentDelayedKey)
    else
        if priority == 0 then
            local parentTarget, isParentPausedOrMaxed = getTargetQueueList(parentMetaKey, parentActiveKey,
                parentWaitKey, parentPausedKey)
            addJobInTargetList(parentTarget, parentMarkerKey, "RPUSH", isParentPausedOrMaxed, parentId)
        else
            local isPausedOrMaxed = isQueuePausedOrMaxed(parentMetaKey, parentActiveKey)
            addJobWithPriority(parentMarkerKey, parentQueueKey .. ":prioritized", priority, parentId,
                parentQueueKey .. ":pc", isPausedOrMaxed)
        end
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "waiting", "jobId", parentId, "prev",
            "waiting-children")
    end
end
local function moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  if rcall("EXISTS", parentKey) == 1 then
    local parentWaitingChildrenKey = parentQueueKey .. ":waiting-children"
    if rcall("ZSCORE", parentWaitingChildrenKey, parentId) then    
      rcall("ZREM", parentWaitingChildrenKey, parentId)
      moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    end
  end
end
local function moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey,
  parentId, timestamp)
  local doNotHavePendingDependencies = rcall("SCARD", parentDependenciesKey) == 0
  if doNotHavePendingDependencies then
    moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  end
end
local function updateParentDepsIfNeeded(parentKey, parentQueueKey, parentDependenciesKey,
  parentId, jobIdKey, returnvalue, timestamp )
  local processedSet = parentKey .. ":processed"
  rcall("HSET", processedSet, jobIdKey, returnvalue)
  moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey, parentId, timestamp)
end
local function updateExistingJobsParent(parentKey, parent, parentData,
                                        parentDependenciesKey, completedKey,
                                        jobIdKey, jobId, timestamp)
    if parentKey ~= nil then
        if rcall("ZSCORE", completedKey, jobId) then
            local returnvalue = rcall("HGET", jobIdKey, "returnvalue")
            updateParentDepsIfNeeded(parentKey, parent['queueKey'],
                                     parentDependenciesKey, parent['id'],
                                     jobIdKey, returnvalue, timestamp)
        else
            if parentDependenciesKey ~= nil then
                rcall("SADD", parentDependenciesKey, jobIdKey)
            end
        end
        rcall("HMSET", jobIdKey, "parentKey", parentKey, "parent", parentData)
    end
end
local function handleDuplicatedJob(jobKey, jobId, currentParentKey, currentParent,
  parentData, parentDependenciesKey, completedKey, eventsKey, maxEvents, timestamp)
  local existedParentKey = rcall("HGET", jobKey, "parentKey")
  if not existedParentKey or existedParentKey == currentParentKey then
    updateExistingJobsParent(currentParentKey, currentParent, parentData,
      parentDependenciesKey, completedKey, jobKey,
      jobId, timestamp)
  else
    if currentParentKey ~= nil and currentParentKey ~= existedParentKey
      and (rcall("EXISTS", existedParentKey) == 1) then
      return -7
    end
  end
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event",
    "duplicated", "jobId", jobId)
  return jobId .. "" -- convert to string
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
if parentKey ~= nil then
    if rcall("EXISTS", parentKey) ~= 1 then return -5 end
    parentData = cjson.encode(parent)
end
local jobCounter = rcall("INCR", KEYS[4])
local metaKey = KEYS[3]
local maxEvents = getOrSetMaxEvents(metaKey)
local parentDependenciesKey = args[6]
local timestamp = args[4]
if args[2] == "" then
    jobId = jobCounter .. "" -- convert to string
    jobIdKey = args[1] .. jobId
else
    jobId = args[2]
    jobIdKey = args[1] .. jobId
    if rcall("EXISTS", jobIdKey) == 1 then
        return handleDuplicatedJob(jobIdKey, jobId, parentKey, parent,
            parentData, parentDependenciesKey, KEYS[5], eventsKey,
            maxEvents, timestamp)
    end
end
local deduplicationJobId = deduplicateJob(opts['de'], jobId, KEYS[6],
  deduplicationKey, eventsKey, maxEvents, args[1], args[3], ARGV[2], opts,
  parentKey, parentData, parentDependenciesKey, repeatJobKey)
if deduplicationJobId then
  return deduplicationJobId
end
-- Store the job.
storeJob(eventsKey, jobIdKey, jobId, args[3], ARGV[2], opts, timestamp,
         parentKey, parentData, repeatJobKey)
local target, isPausedOrMaxed = getTargetQueueList(metaKey, KEYS[7], KEYS[1], KEYS[2])
-- LIFO or FIFO
local pushCmd = opts['lifo'] and 'RPUSH' or 'LPUSH'
addJobInTargetList(target, KEYS[9], pushCmd, isPausedOrMaxed, jobId)
-- Emit waiting event
rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "waiting",
      "jobId", jobId)
-- Check if this job is a child of another job, if so add it to the parents dependencies
if parentDependenciesKey ~= nil then
    rcall("SADD", parentDependenciesKey, jobIdKey)
end
return jobId
`,keys:9};a.s(["addStandardJob",0,bA],721987),a.i(721987);let bB={name:"changeDelay",content:`--[[
  Change job delay when it is in delayed set.
  Input:
    KEYS[1] delayed key
    KEYS[2] meta key
    KEYS[3] marker key
    KEYS[4] events stream
    ARGV[1] delay
    ARGV[2] timestamp
    ARGV[3] the id of the job
    ARGV[4] job key
  Output:
    0 - OK
   -1 - Missing job.
   -3 - Job not in delayed set.
  Events:
    - delayed key.
]]
local rcall = redis.call
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Bake in the job id first 12 bits into the timestamp
  to guarantee correct execution order of delayed jobs
  (up to 4096 jobs per given timestamp or 4096 jobs apart per timestamp)
  WARNING: Jobs that are so far apart that they wrap around will cause FIFO to fail
]]
local function getDelayedScore(delayedKey, timestamp, delay)
  local delayedTimestamp = (delay > 0 and (tonumber(timestamp) + delay)) or tonumber(timestamp)
  local minScore = delayedTimestamp * 0x1000
  local maxScore = (delayedTimestamp + 1 ) * 0x1000 - 1
  local result = rcall("ZREVRANGEBYSCORE", delayedKey, maxScore,
    minScore, "WITHSCORES","LIMIT", 0, 1)
  if #result then
    local currentMaxScore = tonumber(result[2])
    if currentMaxScore ~= nil then
      if currentMaxScore >= maxScore then
        return maxScore, delayedTimestamp
      else
        return currentMaxScore + 1, delayedTimestamp
      end
    end
  end
  return minScore, delayedTimestamp
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
if rcall("EXISTS", ARGV[4]) == 1 then
  local jobId = ARGV[3]
  local delay = tonumber(ARGV[1])
  local score, delayedTimestamp = getDelayedScore(KEYS[1], ARGV[2], delay)
  local numRemovedElements = rcall("ZREM", KEYS[1], jobId)
  if numRemovedElements < 1 then
    return -3
  end
  rcall("HSET", ARGV[4], "delay", delay)
  rcall("ZADD", KEYS[1], score, jobId)
  local maxEvents = getOrSetMaxEvents(KEYS[2])
  rcall("XADD", KEYS[4], "MAXLEN", "~", maxEvents, "*", "event", "delayed",
    "jobId", jobId, "delay", delayedTimestamp)
  -- mark that a delayed job is available
  addDelayMarkerIfNeeded(KEYS[3], KEYS[1])
  return 0
else
  return -1
end`,keys:4};a.s(["changeDelay",0,bB],45715),a.i(45715);let bC={name:"changePriority",content:`--[[
  Change job priority
  Input:
    KEYS[1] 'wait',
    KEYS[2] 'paused'
    KEYS[3] 'meta'
    KEYS[4] 'prioritized'
    KEYS[5] 'active'
    KEYS[6] 'pc' priority counter
    KEYS[7] 'marker'
    ARGV[1] priority value
    ARGV[2] prefix key
    ARGV[3] job id
    ARGV[4] lifo
    Output:
       0  - OK
      -1  - Missing job
]]
local jobId = ARGV[3]
local jobKey = ARGV[2] .. jobId
local priority = tonumber(ARGV[1])
local rcall = redis.call
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to push back job considering priority in front of same prioritized jobs.
]]
local function pushBackJobWithPriority(prioritizedKey, priority, jobId)
  -- in order to put it at front of same prioritized jobs
  -- we consider prioritized counter as 0
  local score = priority * 0x100000000
  rcall("ZADD", prioritizedKey, score, jobId)
end
local function reAddJobWithNewPriority( prioritizedKey, markerKey, targetKey,
    priorityCounter, lifo, priority, jobId, isPausedOrMaxed)
    if priority == 0 then
        local pushCmd = lifo and 'RPUSH' or 'LPUSH'
        addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
    else
        if lifo then
            pushBackJobWithPriority(prioritizedKey, priority, jobId)
        else
            addJobWithPriority(markerKey, prioritizedKey, priority, jobId,
                priorityCounter, isPausedOrMaxed)
        end
    end
end
if rcall("EXISTS", jobKey) == 1 then
    local metaKey = KEYS[3]
    local target, isPausedOrMaxed = getTargetQueueList(metaKey, KEYS[5], KEYS[1], KEYS[2])
    local prioritizedKey = KEYS[4]
    local priorityCounterKey = KEYS[6]
    local markerKey = KEYS[7]
    -- Re-add with the new priority
    if rcall("ZREM", prioritizedKey, jobId) > 0 then
        reAddJobWithNewPriority( prioritizedKey, markerKey, target,
            priorityCounterKey, ARGV[4] == '1', priority, jobId, isPausedOrMaxed)
    elseif rcall("LREM", target, -1, jobId) > 0 then
        reAddJobWithNewPriority( prioritizedKey, markerKey, target,
            priorityCounterKey, ARGV[4] == '1', priority, jobId, isPausedOrMaxed)
    end
    rcall("HSET", jobKey, "priority", priority)
    return 0
else
    return -1
end
`,keys:7};a.s(["changePriority",0,bC],731763),a.i(731763);let bD={name:"cleanJobsInSet",content:`--[[
  Remove jobs from the specific set.
  Input:
    KEYS[1]  set key,
    KEYS[2]  events stream key
    KEYS[3]  repeat key
    ARGV[1]  jobKey prefix
    ARGV[2]  timestamp
    ARGV[3]  limit the number of jobs to be removed. 0 is unlimited
    ARGV[4]  set name, can be any of 'wait', 'active', 'paused', 'delayed', 'completed', or 'failed'
]]
local rcall = redis.call
local repeatKey = KEYS[3]
local rangeStart = 0
local rangeEnd = -1
local limit = tonumber(ARGV[3])
-- If we're only deleting _n_ items, avoid retrieving all items
-- for faster performance
--
-- Start from the tail of the list, since that's where oldest elements
-- are generally added for FIFO lists
if limit > 0 then
  rangeStart = -1 - limit + 1
  rangeEnd = -1
end
-- Includes
--[[
  Function to clean job list.
  Returns jobIds and deleted count number.
]]
-- Includes
--[[
  Function to get the latest saved timestamp.
]]
local function getTimestamp(jobKey, attributes)
  if #attributes == 1 then
    return rcall("HGET", jobKey, attributes[1])
  end
  local jobTs
  for _, ts in ipairs(rcall("HMGET", jobKey, unpack(attributes))) do
    if (ts) then
      jobTs = ts
      break
    end
  end
  return jobTs
end
--[[
  Function to check if the job belongs to a job scheduler and
  current delayed job matches with jobId
]]
local function isJobSchedulerJob(jobId, jobKey, jobSchedulersKey)
  local repeatJobKey = rcall("HGET", jobKey, "rjk")
  if repeatJobKey  then
    local prevMillis = rcall("ZSCORE", jobSchedulersKey, repeatJobKey)
    if prevMillis then
      local currentDelayedJobId = "repeat:" .. repeatJobKey .. ":" .. prevMillis
      return jobId == currentDelayedJobId
    end
  end
  return false
end
--[[
  Function to remove job.
]]
-- Includes
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobId, deduplicationId)
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      rcall("DEL", deduplicationKey)
      -- Also clean up any pending dedup-next data for this dedup ID
      rcall("DEL", prefixKey .. "dn:" .. deduplicationId)
      return 1
    end
  end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local function removeJob(jobId, hard, baseKey, shouldRemoveDeduplicationKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  if shouldRemoveDeduplicationKey then
    local deduplicationId = rcall("HGET", jobKey, "deid")
    removeDeduplicationKeyIfNeededOnRemoval(baseKey, jobId, deduplicationId)
  end
  removeJobKeys(jobKey)
end
local function cleanList(listKey, jobKeyPrefix, rangeStart, rangeEnd,
  timestamp, isWaiting, jobSchedulersKey)
  local jobs = rcall("LRANGE", listKey, rangeStart, rangeEnd)
  local deleted = {}
  local deletedCount = 0
  local jobTS
  local deletionMarker = ''
  local jobIdsLen = #jobs
  for i, job in ipairs(jobs) do
    if limit > 0 and deletedCount >= limit then
      break
    end
    local jobKey = jobKeyPrefix .. job
    if (isWaiting or rcall("EXISTS", jobKey .. ":lock") == 0) and
      not isJobSchedulerJob(job, jobKey, jobSchedulersKey) then
      -- Find the right timestamp of the job to compare to maxTimestamp:
      -- * finishedOn says when the job was completed, but it isn't set unless the job has actually completed
      -- * processedOn represents when the job was last attempted, but it doesn't get populated until
      --   the job is first tried
      -- * timestamp is the original job submission time
      -- Fetch all three of these (in that order) and use the first one that is set so that we'll leave jobs
      -- that have been active within the grace period:
      jobTS = getTimestamp(jobKey, {"finishedOn", "processedOn", "timestamp"})
      if (not jobTS or jobTS <= timestamp) then
        -- replace the entry with a deletion marker; the actual deletion will
        -- occur at the end of the script
        rcall("LSET", listKey, rangeEnd - jobIdsLen + i, deletionMarker)
        removeJob(job, true, jobKeyPrefix, true --[[remove debounce key]])
        deletedCount = deletedCount + 1
        table.insert(deleted, job)
      end
    end
  end
  rcall("LREM", listKey, 0, deletionMarker)
  return {deleted, deletedCount}
end
--[[
  Function to clean job set.
  Returns jobIds and deleted count number.
]] 
-- Includes
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
--[[
  We use ZRANGEBYSCORE to make the case where we're deleting a limited number
  of items in a sorted set only run a single iteration. If we simply used
  ZRANGE, we may take a long time traversing through jobs that are within the
  grace period.
]]
local function getJobsInZset(zsetKey, rangeEnd, limit)
  if limit > 0 then
    return rcall("ZRANGEBYSCORE", zsetKey, 0, rangeEnd, "LIMIT", 0, limit)
  else
    return rcall("ZRANGEBYSCORE", zsetKey, 0, rangeEnd)
  end
end
local function cleanSet(
    setKey,
    jobKeyPrefix,
    rangeEnd,
    timestamp,
    limit,
    attributes,
    isFinished,
    jobSchedulersKey)
    local jobs = getJobsInZset(setKey, rangeEnd, limit)
    local deleted = {}
    local deletedCount = 0
    local jobTS
    for i, job in ipairs(jobs) do
        if limit > 0 and deletedCount >= limit then
            break
        end
        local jobKey = jobKeyPrefix .. job
        -- Extract a Job Scheduler Id from jobId ("repeat:job-scheduler-id:millis") 
        -- and check if it is in the scheduled jobs
        if not (jobSchedulersKey and isJobSchedulerJob(job, jobKey, jobSchedulersKey)) then
            if isFinished then
                removeJob(job, true, jobKeyPrefix, true --[[remove debounce key]] )
                deletedCount = deletedCount + 1
                table.insert(deleted, job)
            else
                -- * finishedOn says when the job was completed, but it isn't set unless the job has actually completed
                jobTS = getTimestamp(jobKey, attributes)
                if (not jobTS or jobTS <= timestamp) then
                    removeJob(job, true, jobKeyPrefix, true --[[remove debounce key]] )
                    deletedCount = deletedCount + 1
                    table.insert(deleted, job)
                end
            end
        end
    end
    if (#deleted > 0) then
        for from, to in batches(#deleted, 7000) do
            rcall("ZREM", setKey, unpack(deleted, from, to))
        end
    end
    return {deleted, deletedCount}
end
local result
if ARGV[4] == "active" then
  result = cleanList(KEYS[1], ARGV[1], rangeStart, rangeEnd, ARGV[2], false --[[ hasFinished ]],
                      repeatKey)
elseif ARGV[4] == "delayed" then
  rangeEnd = "+inf"
  result = cleanSet(KEYS[1], ARGV[1], rangeEnd, ARGV[2], limit,
                    {"processedOn", "timestamp"}, false  --[[ hasFinished ]], repeatKey)
elseif ARGV[4] == "prioritized" then
  rangeEnd = "+inf"
  result = cleanSet(KEYS[1], ARGV[1], rangeEnd, ARGV[2], limit,
                    {"timestamp"}, false  --[[ hasFinished ]], repeatKey)
elseif ARGV[4] == "wait" or ARGV[4] == "paused" then
  result = cleanList(KEYS[1], ARGV[1], rangeStart, rangeEnd, ARGV[2], true --[[ hasFinished ]],
                      repeatKey)
else
  rangeEnd = ARGV[2]
  -- No need to pass repeat key as in that moment job won't be related to a job scheduler
  result = cleanSet(KEYS[1], ARGV[1], rangeEnd, ARGV[2], limit,
                    {"finishedOn"}, true  --[[ hasFinished ]])
end
rcall("XADD", KEYS[2], "*", "event", "cleaned", "count", result[2])
return result[1]
`,keys:3};a.s(["cleanJobsInSet",0,bD],858497),a.i(858497);let bE={name:"drain",content:`--[[
  Drains the queue, removes all jobs that are waiting
  or delayed, but not active, completed or failed
  Input:
    KEYS[1] 'wait',
    KEYS[2] 'paused'
    KEYS[3] 'delayed'
    KEYS[4] 'prioritized'
    KEYS[5] 'jobschedulers' (repeat)
    ARGV[1]  queue key prefix
    ARGV[2]  should clean delayed jobs
]]
local rcall = redis.call
local queueBaseKey = ARGV[1]
--[[
  Functions to remove jobs.
]]
-- Includes
--[[
  Function to filter out jobs to ignore from a table.
]]
local function filterOutJobsToIgnore(jobs, jobsToIgnore)
  local filteredJobs = {}
  for i = 1, #jobs do
    if not jobsToIgnore[jobs[i]] then
      table.insert(filteredJobs, jobs[i])
    end
  end
  return filteredJobs
end
--[[
  Functions to remove jobs.
]]
-- Includes
--[[
  Function to remove job.
]]
-- Includes
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobId, deduplicationId)
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      rcall("DEL", deduplicationKey)
      -- Also clean up any pending dedup-next data for this dedup ID
      rcall("DEL", prefixKey .. "dn:" .. deduplicationId)
      return 1
    end
  end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local function removeJob(jobId, hard, baseKey, shouldRemoveDeduplicationKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  if shouldRemoveDeduplicationKey then
    local deduplicationId = rcall("HGET", jobKey, "deid")
    removeDeduplicationKeyIfNeededOnRemoval(baseKey, jobId, deduplicationId)
  end
  removeJobKeys(jobKey)
end
local function removeJobs(keys, hard, baseKey, max)
  for i, key in ipairs(keys) do
    removeJob(key, hard, baseKey, true --[[remove debounce key]])
  end
  return max - #keys
end
local function getListItems(keyName, max)
  return rcall('LRANGE', keyName, 0, max - 1)
end
local function removeListJobs(keyName, hard, baseKey, max, jobsToIgnore)
  local jobs = getListItems(keyName, max)
  if jobsToIgnore then
    jobs = filterOutJobsToIgnore(jobs, jobsToIgnore)
  end
  local count = removeJobs(jobs, hard, baseKey, max)
  rcall("LTRIM", keyName, #jobs, -1)
  return count
end
-- Includes
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
--[[
  Function to get ZSet items.
]]
local function getZSetItems(keyName, max)
  return rcall('ZRANGE', keyName, 0, max - 1)
end
local function removeZSetJobs(keyName, hard, baseKey, max, jobsToIgnore)
  local jobs = getZSetItems(keyName, max)
  if jobsToIgnore then
    jobs = filterOutJobsToIgnore(jobs, jobsToIgnore)
  end
  local count = removeJobs(jobs, hard, baseKey, max)
  if(#jobs > 0) then
    for from, to in batches(#jobs, 7000) do
      rcall("ZREM", keyName, unpack(jobs, from, to))
    end
  end
  return count
end
-- We must not remove delayed jobs if they are associated to a job scheduler.
local scheduledJobs = {}
local jobSchedulers = rcall("ZRANGE", KEYS[5], 0, -1, "WITHSCORES")
-- For every job scheduler, get the current delayed job id.
for i = 1, #jobSchedulers, 2 do
    local jobSchedulerId = jobSchedulers[i]
    local jobSchedulerMillis = jobSchedulers[i + 1]
    local delayedJobId = "repeat:" .. jobSchedulerId .. ":" .. jobSchedulerMillis
    scheduledJobs[delayedJobId] = true
end
removeListJobs(KEYS[1], true, queueBaseKey, 0, scheduledJobs) -- wait
removeListJobs(KEYS[2], true, queueBaseKey, 0, scheduledJobs) -- paused
if ARGV[2] == "1" then
  removeZSetJobs(KEYS[3], true, queueBaseKey, 0, scheduledJobs) -- delayed
end
removeZSetJobs(KEYS[4], true, queueBaseKey, 0, scheduledJobs) -- prioritized
`,keys:5};a.s(["drain",0,bE],567520),a.i(567520);let bF={name:"extendLock",content:`--[[
  Extend lock and removes the job from the stalled set.
  Input:
    KEYS[1] 'lock',
    KEYS[2] 'stalled'
    ARGV[1]  token
    ARGV[2]  lock duration in milliseconds
    ARGV[3]  jobid
  Output:
    "1" if lock extended successfully.
]]
local rcall = redis.call
if rcall("GET", KEYS[1]) == ARGV[1] then
  --   if rcall("SET", KEYS[1], ARGV[1], "PX", ARGV[2], "XX") then
  if rcall("SET", KEYS[1], ARGV[1], "PX", ARGV[2]) then
    rcall("SREM", KEYS[2], ARGV[3])
    return 1
  end
end
return 0
`,keys:2};a.s(["extendLock",0,bF],12975),a.i(12975);let bG={name:"extendLocks",content:`--[[
  Extend locks for multiple jobs and remove them from the stalled set if successful.
  Return the list of job IDs for which the operation failed.
  KEYS[1] = stalled key
  ARGV[1] = baseKey
  ARGV[2] = tokens
  ARGV[3] = jobIds
  ARGV[4] = lockDuration (ms)
  Output:
    An array of failed job IDs. If empty, all succeeded.
]]
local rcall = redis.call
local stalledKey = KEYS[1]
local baseKey = ARGV[1]
local tokens = cmsgpack.unpack(ARGV[2])
local jobIds = cmsgpack.unpack(ARGV[3])
local lockDuration = ARGV[4]
local jobCount = #jobIds
local failedJobs = {}
for i = 1, jobCount, 1 do
    local lockKey = baseKey .. jobIds[i] .. ':lock'
    local jobId = jobIds[i]
    local token = tokens[i]
    local currentToken = rcall("GET", lockKey)
    if currentToken then
        if currentToken == token then
            local setResult = rcall("SET", lockKey, token, "PX", lockDuration)
            if setResult then
                rcall("SREM", stalledKey, jobId)
            else
                table.insert(failedJobs, jobId)
            end
        else
            table.insert(failedJobs, jobId)
        end
    else
        table.insert(failedJobs, jobId)
    end
end
return failedJobs
`,keys:1};a.s(["extendLocks",0,bG],988142),a.i(988142);let bH={name:"getCounts",content:`--[[
  Get counts per provided states
    Input:
      KEYS[1]    'prefix'
      ARGV[1...] types
]]
local rcall = redis.call;
local prefix = KEYS[1]
local results = {}
for i = 1, #ARGV do
  local stateKey = prefix .. ARGV[i]
  if ARGV[i] == "wait" or ARGV[i] == "paused" then
    -- Markers in waitlist DEPRECATED in v5: Remove in v6.
    local marker = rcall("LINDEX", stateKey, -1)
    if marker and string.sub(marker, 1, 2) == "0:" then
      local count = rcall("LLEN", stateKey)
      if count > 1 then
        rcall("RPOP", stateKey)
        results[#results+1] = count-1
      else
        results[#results+1] = 0
      end
    else
      results[#results+1] = rcall("LLEN", stateKey)
    end
  elseif ARGV[i] == "active" then
    results[#results+1] = rcall("LLEN", stateKey)
  else
    results[#results+1] = rcall("ZCARD", stateKey)
  end
end
return results
`,keys:1};a.s(["getCounts",0,bH],411327),a.i(411327);let bI={name:"getCountsPerPriority",content:`--[[
  Get counts per provided states
    Input:
      KEYS[1] wait key
      KEYS[2] paused key
      KEYS[3] meta key
      KEYS[4] prioritized key
      ARGV[1...] priorities
]]
local rcall = redis.call
local results = {}
local waitKey = KEYS[1]
local pausedKey = KEYS[2]
local prioritizedKey = KEYS[4]
-- Includes
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePaused(queueMetaKey)
  return rcall("HEXISTS", queueMetaKey, "paused") == 1
end
for i = 1, #ARGV do
  local priority = tonumber(ARGV[i])
  if priority == 0 then
    if isQueuePaused(KEYS[3]) then
      results[#results+1] = rcall("LLEN", pausedKey)
    else
      results[#results+1] = rcall("LLEN", waitKey)
    end
  else
    results[#results+1] = rcall("ZCOUNT", prioritizedKey,
      priority * 0x100000000, (priority + 1)  * 0x100000000 - 1)
  end
end
return results
`,keys:4};a.s(["getCountsPerPriority",0,bI],750596),a.i(750596);let bJ={name:"getDependencyCounts",content:`--[[
  Get counts per child states
    Input:
      KEYS[1]    processed key
      KEYS[2]    unprocessed key
      KEYS[3]    ignored key
      KEYS[4]    failed key
      ARGV[1...] types
]]
local rcall = redis.call;
local processedKey = KEYS[1]
local unprocessedKey = KEYS[2]
local ignoredKey = KEYS[3]
local failedKey = KEYS[4]
local results = {}
for i = 1, #ARGV do
  if ARGV[i] == "processed" then
    results[#results+1] = rcall("HLEN", processedKey)
  elseif ARGV[i] == "unprocessed" then
    results[#results+1] = rcall("SCARD", unprocessedKey)
  elseif ARGV[i] == "ignored" then
    results[#results+1] = rcall("HLEN", ignoredKey)
  else
    results[#results+1] = rcall("ZCARD", failedKey)
  end
end
return results
`,keys:4};a.s(["getDependencyCounts",0,bJ],74658),a.i(74658);let bK={name:"getJobScheduler",content:`--[[
  Get job scheduler record.
  Input:
    KEYS[1] 'repeat' key
    ARGV[1] id
]]
local rcall = redis.call
local jobSchedulerKey = KEYS[1] .. ":" .. ARGV[1]
local score = rcall("ZSCORE", KEYS[1], ARGV[1])
if score then
  return {rcall("HGETALL", jobSchedulerKey), score} -- get job data
end
return {nil, nil}
`,keys:1};a.s(["getJobScheduler",0,bK],956238),a.i(956238);let bL={name:"getMetrics",content:`--[[
  Get metrics
  Input:
    KEYS[1] 'metrics' key
    KEYS[2] 'metrics data' key
    ARGV[1] start index
    ARGV[2] end index
]]
local rcall = redis.call;
local metricsKey = KEYS[1]
local dataKey = KEYS[2]
local metrics = rcall("HMGET", metricsKey, "count", "prevTS", "prevCount")
local data = rcall("LRANGE", dataKey, tonumber(ARGV[1]), tonumber(ARGV[2]))
local numPoints = rcall("LLEN", dataKey)
return {metrics, data, numPoints}
`,keys:2};a.s(["getMetrics",0,bL],963703),a.i(963703);let bM={name:"getRanges",content:`--[[
  Get job ids per provided states
    Input:
      KEYS[1]    'prefix'
      ARGV[1]    start
      ARGV[2]    end
      ARGV[3]    asc
      ARGV[4...] types
]]
local rcall = redis.call
local prefix = KEYS[1]
local rangeStart = tonumber(ARGV[1])
local rangeEnd = tonumber(ARGV[2])
local asc = ARGV[3]
local results = {}
local function getRangeInList(listKey, asc, rangeStart, rangeEnd, results)
  if asc == "1" then
    local modifiedRangeStart
    local modifiedRangeEnd
    if rangeStart == -1 then
      modifiedRangeStart = 0
    else
      modifiedRangeStart = -(rangeStart + 1)
    end
    if rangeEnd == -1 then
      modifiedRangeEnd = 0
    else
      modifiedRangeEnd = -(rangeEnd + 1)
    end
    results[#results+1] = rcall("LRANGE", listKey,
      modifiedRangeEnd,
      modifiedRangeStart)
  else
    results[#results+1] = rcall("LRANGE", listKey, rangeStart, rangeEnd)
  end
end
for i = 4, #ARGV do
  local stateKey = prefix .. ARGV[i]
  if ARGV[i] == "wait" or ARGV[i] == "paused" then
    -- Markers in waitlist DEPRECATED in v5: Remove in v6.
    local marker = rcall("LINDEX", stateKey, -1)
    if marker and string.sub(marker, 1, 2) == "0:" then
      local count = rcall("LLEN", stateKey)
      if count > 1 then
        rcall("RPOP", stateKey)
        getRangeInList(stateKey, asc, rangeStart, rangeEnd, results)
      else
        results[#results+1] = {}
      end
    else
      getRangeInList(stateKey, asc, rangeStart, rangeEnd, results)
    end
  elseif ARGV[i] == "active" then
    getRangeInList(stateKey, asc, rangeStart, rangeEnd, results)
  else
    if asc == "1" then
      results[#results+1] = rcall("ZRANGE", stateKey, rangeStart, rangeEnd)
    else
      results[#results+1] = rcall("ZREVRANGE", stateKey, rangeStart, rangeEnd)
    end
  end
end
return results
`,keys:1};a.s(["getRanges",0,bM],197780),a.i(197780);let bN={name:"getRateLimitTtl",content:`--[[
  Get rate limit ttl
    Input:
      KEYS[1] 'limiter'
      KEYS[2] 'meta'
      ARGV[1] maxJobs
]]
local rcall = redis.call
-- Includes
--[[
  Function to get current rate limit ttl.
]]
local function getRateLimitTTL(maxJobs, rateLimiterKey)
  if maxJobs and maxJobs <= tonumber(rcall("GET", rateLimiterKey) or 0) then
    local pttl = rcall("PTTL", rateLimiterKey)
    if pttl == 0 then
      rcall("DEL", rateLimiterKey)
    end
    if pttl > 0 then
      return pttl
    end
  end
  return 0
end
local rateLimiterKey = KEYS[1]
if ARGV[1] ~= "0" then
  return getRateLimitTTL(tonumber(ARGV[1]), rateLimiterKey)
else
  local rateLimitMax = rcall("HGET", KEYS[2], "max")
  if rateLimitMax then
    return getRateLimitTTL(tonumber(rateLimitMax), rateLimiterKey)
  end
  return rcall("PTTL", rateLimiterKey)
end
`,keys:2};a.s(["getRateLimitTtl",0,bN],248237),a.i(248237);let bO={name:"getState",content:`--[[
  Get a job state
  Input: 
    KEYS[1] 'completed' key,
    KEYS[2] 'failed' key
    KEYS[3] 'delayed' key
    KEYS[4] 'active' key
    KEYS[5] 'wait' key
    KEYS[6] 'paused' key
    KEYS[7] 'waiting-children' key
    KEYS[8] 'prioritized' key
    ARGV[1] job id
  Output:
    'completed'
    'failed'
    'delayed'
    'active'
    'prioritized'
    'waiting'
    'waiting-children'
    'unknown'
]]
local rcall = redis.call
if rcall("ZSCORE", KEYS[1], ARGV[1]) then
  return "completed"
end
if rcall("ZSCORE", KEYS[2], ARGV[1]) then
  return "failed"
end
if rcall("ZSCORE", KEYS[3], ARGV[1]) then
  return "delayed"
end
if rcall("ZSCORE", KEYS[8], ARGV[1]) then
  return "prioritized"
end
-- Includes
--[[
  Function to check if an item belongs to a list.
]]
local function checkItemInList(list, item)
  for _, v in pairs(list) do
    if v == item then
      return 1
    end
  end
  return nil
end
local active_items = rcall("LRANGE", KEYS[4] , 0, -1)
if checkItemInList(active_items, ARGV[1]) ~= nil then
  return "active"
end
local wait_items = rcall("LRANGE", KEYS[5] , 0, -1)
if checkItemInList(wait_items, ARGV[1]) ~= nil then
  return "waiting"
end
local paused_items = rcall("LRANGE", KEYS[6] , 0, -1)
if checkItemInList(paused_items, ARGV[1]) ~= nil then
  return "waiting"
end
if rcall("ZSCORE", KEYS[7], ARGV[1]) then
  return "waiting-children"
end
return "unknown"
`,keys:8};a.s(["getState",0,bO],745494),a.i(745494);let bP={name:"getStateV2",content:`--[[
  Get a job state
  Input: 
    KEYS[1] 'completed' key,
    KEYS[2] 'failed' key
    KEYS[3] 'delayed' key
    KEYS[4] 'active' key
    KEYS[5] 'wait' key
    KEYS[6] 'paused' key
    KEYS[7] 'waiting-children' key
    KEYS[8] 'prioritized' key
    ARGV[1] job id
  Output:
    'completed'
    'failed'
    'delayed'
    'active'
    'waiting'
    'waiting-children'
    'unknown'
]]
local rcall = redis.call
if rcall("ZSCORE", KEYS[1], ARGV[1]) then
  return "completed"
end
if rcall("ZSCORE", KEYS[2], ARGV[1]) then
  return "failed"
end
if rcall("ZSCORE", KEYS[3], ARGV[1]) then
  return "delayed"
end
if rcall("ZSCORE", KEYS[8], ARGV[1]) then
  return "prioritized"
end
if rcall("LPOS", KEYS[4] , ARGV[1]) then
  return "active"
end
if rcall("LPOS", KEYS[5] , ARGV[1]) then
  return "waiting"
end
if rcall("LPOS", KEYS[6] , ARGV[1]) then
  return "waiting"
end
if rcall("ZSCORE", KEYS[7] , ARGV[1]) then
  return "waiting-children"
end
return "unknown"
`,keys:8};a.s(["getStateV2",0,bP],197952),a.i(197952);let bQ={name:"isFinished",content:`--[[
  Checks if a job is finished (.i.e. is in the completed or failed set)
  Input: 
    KEYS[1] completed key
    KEYS[2] failed key
    KEYS[3] job key
    ARGV[1] job id
    ARGV[2] return value?
  Output:
    0 - Not finished.
    1 - Completed.
    2 - Failed.
   -1 - Missing job. 
]]
local rcall = redis.call
if rcall("EXISTS", KEYS[3]) ~= 1 then
  if ARGV[2] == "1" then
    return {-1,"Missing key for job " .. KEYS[3] .. ". isFinished"}
  end  
  return -1
end
if rcall("ZSCORE", KEYS[1], ARGV[1]) then
  if ARGV[2] == "1" then
    local returnValue = rcall("HGET", KEYS[3], "returnvalue")
    return {1,returnValue}
  end
  return 1
end
if rcall("ZSCORE", KEYS[2], ARGV[1]) then
  if ARGV[2] == "1" then
    local failedReason = rcall("HGET", KEYS[3], "failedReason")
    return {2,failedReason}
  end
  return 2
end
if ARGV[2] == "1" then
  return {0}
end
return 0
`,keys:3};a.s(["isFinished",0,bQ],787714),a.i(787714);let bR={name:"isJobInList",content:`--[[
  Checks if job is in a given list.
  Input:
    KEYS[1]
    ARGV[1]
  Output:
    1 if element found in the list.
]]
-- Includes
--[[
  Function to check if an item belongs to a list.
]]
local function checkItemInList(list, item)
  for _, v in pairs(list) do
    if v == item then
      return 1
    end
  end
  return nil
end
local items = redis.call("LRANGE", KEYS[1] , 0, -1)
return checkItemInList(items, ARGV[1])
`,keys:1};a.s(["isJobInList",0,bR],534924),a.i(534924);let bS={name:"isMaxed",content:`--[[
  Checks if queue is maxed.
  Input:
    KEYS[1] meta key
    KEYS[2] active key
  Output:
    1 if element found in the list.
]]
local rcall = redis.call
-- Includes
--[[
  Function to check if queue is maxed or not.
]]
local function isQueueMaxed(queueMetaKey, activeKey)
  local maxConcurrency = rcall("HGET", queueMetaKey, "concurrency")
  if maxConcurrency then
    local activeCount = rcall("LLEN", activeKey)
    if activeCount >= tonumber(maxConcurrency) then
      return true
    end
  end
  return false
end
return isQueueMaxed(KEYS[1], KEYS[2])
`,keys:2};a.s(["isMaxed",0,bS],661364),a.i(661364);let bT={name:"moveJobFromActiveToWait",content:`--[[
  Function to move job from active state to wait.
  Input:
    KEYS[1]  active key
    KEYS[2]  wait key
    KEYS[3]  stalled key
    KEYS[4]  paused key
    KEYS[5]  meta key
    KEYS[6]  limiter key
    KEYS[7]  prioritized key
    KEYS[8]  marker key
    KEYS[9]  event key
    ARGV[1] job id
    ARGV[2] lock token
    ARGV[3] job id key
]]
local rcall = redis.call
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to push back job considering priority in front of same prioritized jobs.
]]
local function pushBackJobWithPriority(prioritizedKey, priority, jobId)
  -- in order to put it at front of same prioritized jobs
  -- we consider prioritized counter as 0
  local score = priority * 0x100000000
  rcall("ZADD", prioritizedKey, score, jobId)
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function removeLock(jobKey, stalledKey, token, jobId)
  if token ~= "0" then
    local lockKey = jobKey .. ':lock'
    local lockToken = rcall("GET", lockKey)
    if lockToken == token then
      rcall("DEL", lockKey)
      rcall("SREM", stalledKey, jobId)
    else
      if lockToken then
        -- Lock exists but token does not match
        return -6
      else
        -- Lock is missing completely
        return -2
      end
    end
  end
  return 0
end
local jobId = ARGV[1]
local token = ARGV[2]
local jobKey = ARGV[3]
if rcall("EXISTS", jobKey) == 0 then
  return -1
end
local errorCode = removeLock(jobKey, KEYS[3], token, jobId)
if errorCode < 0 then
  return errorCode
end
local metaKey = KEYS[5]
local removed = rcall("LREM", KEYS[1], 1, jobId)
if removed > 0 then
  local target, isPausedOrMaxed = getTargetQueueList(metaKey, KEYS[1], KEYS[2], KEYS[4])
  local priority = tonumber(rcall("HGET", ARGV[3], "priority")) or 0
  if priority > 0 then
    pushBackJobWithPriority(KEYS[7], priority, jobId)
  else
    addJobInTargetList(target, KEYS[8], "RPUSH", isPausedOrMaxed, jobId)
  end
  local maxEvents = getOrSetMaxEvents(metaKey)
  -- Emit waiting event
  rcall("XADD", KEYS[9], "MAXLEN", "~", maxEvents, "*", "event", "waiting",
    "jobId", jobId, "prev", "active")
end
local pttl = rcall("PTTL", KEYS[6])
if pttl > 0 then
  return pttl
else
  return 0
end
`,keys:9};a.s(["moveJobFromActiveToWait",0,bT],550790),a.i(550790);let bU={name:"moveJobsToWait",content:`--[[
  Move completed, failed or delayed jobs to wait.
  Note: Does not support jobs with priorities.
  Input:
    KEYS[1] base key
    KEYS[2] events stream
    KEYS[3] state key (failed, completed, delayed)
    KEYS[4] 'wait'
    KEYS[5] 'paused'
    KEYS[6] 'meta'
    KEYS[7] 'active'
    KEYS[8] 'marker'
    ARGV[1] count
    ARGV[2] timestamp
    ARGV[3] prev state
  Output:
    1  means the operation is not completed
    0  means the operation is completed
]]
local maxCount = tonumber(ARGV[1])
local timestamp = tonumber(ARGV[2])
local rcall = redis.call;
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local metaKey = KEYS[6]
local target, isPausedOrMaxed = getTargetQueueList(metaKey, KEYS[7], KEYS[4], KEYS[5])
local jobs = rcall('ZRANGEBYSCORE', KEYS[3], 0, timestamp, 'LIMIT', 0, maxCount)
if (#jobs > 0) then
    if ARGV[3] == "failed" then
        for i, key in ipairs(jobs) do
            local jobKey = KEYS[1] .. key
            rcall("HDEL", jobKey, "finishedOn", "processedOn", "failedReason")
        end
    elseif ARGV[3] == "completed" then
        for i, key in ipairs(jobs) do
            local jobKey = KEYS[1] .. key
            rcall("HDEL", jobKey, "finishedOn", "processedOn", "returnvalue")
        end
    end
    local maxEvents = getOrSetMaxEvents(metaKey)
    for i, key in ipairs(jobs) do
        -- Emit waiting event
        rcall("XADD", KEYS[2], "MAXLEN", "~", maxEvents, "*", "event",
              "waiting", "jobId", key, "prev", ARGV[3]);
    end
    for from, to in batches(#jobs, 7000) do
        rcall("ZREM", KEYS[3], unpack(jobs, from, to))
        rcall("LPUSH", target, unpack(jobs, from, to))
    end
    addBaseMarkerIfNeeded(KEYS[8], isPausedOrMaxed)
end
maxCount = maxCount - #jobs
if (maxCount <= 0) then return 1 end
return 0
`,keys:8};a.s(["moveJobsToWait",0,bU],62020),a.i(62020);let bV={name:"moveStalledJobsToWait",content:`--[[
  Move stalled jobs to wait.
    Input:
      KEYS[1] 'stalled' (SET)
      KEYS[2] 'wait',   (LIST)
      KEYS[3] 'active', (LIST)
      KEYS[4] 'stalled-check', (KEY)
      KEYS[5] 'meta', (KEY)
      KEYS[6] 'paused', (LIST)
      KEYS[7] 'marker'
      KEYS[8] 'event stream' (STREAM)
      KEYS[9] 'repeat' key
      ARGV[1]  Max stalled job count
      ARGV[2]  queue.toKey('')
      ARGV[3]  timestamp
      ARGV[4]  max check time
    Events:
      'stalled' with stalled job id.
]]
local rcall = redis.call
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
--[[
  Function to move job to wait to be picked up by a waiting worker.
]]
-- Includes
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function moveJobToWait(metaKey, activeKey, waitKey, pausedKey, markerKey, eventStreamKey,
  jobId, pushCmd)
  local target, isPausedOrMaxed = getTargetQueueList(metaKey, activeKey, waitKey, pausedKey)
  addJobInTargetList(target, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall("XADD", eventStreamKey, "*", "event", "waiting", "jobId", jobId, 'prev', 'active')
end
--[[
  Function to trim events, default 10000.
]]
-- Includes
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
local function trimEvents(metaKey, eventStreamKey)
  local maxEvents = getOrSetMaxEvents(metaKey)
  if maxEvents then
    rcall("XTRIM", eventStreamKey, "MAXLEN", "~", maxEvents)
  else
    rcall("XTRIM", eventStreamKey, "MAXLEN", "~", 10000)
  end
end
local stalledKey = KEYS[1]
local waitKey = KEYS[2]
local activeKey = KEYS[3]
local stalledCheckKey = KEYS[4]
local metaKey = KEYS[5]
local pausedKey = KEYS[6]
local markerKey = KEYS[7]
local eventStreamKey = KEYS[8]
local repeatKey = KEYS[9]
local maxStalledJobCount = tonumber(ARGV[1])
local queueKeyPrefix = ARGV[2]
local timestamp = ARGV[3]
local maxCheckTime = ARGV[4]
if rcall("EXISTS", stalledCheckKey) == 1 then
    return {}
end
rcall("SET", stalledCheckKey, timestamp, "PX", maxCheckTime)
-- Trim events before emitting them to avoid trimming events emitted in this script
trimEvents(metaKey, eventStreamKey)
-- Move all stalled jobs to wait
local stalling = rcall('SMEMBERS', stalledKey)
local stalled = {}
if (#stalling > 0) then
    rcall('DEL', stalledKey)
    -- Remove from active list
    for i, jobId in ipairs(stalling) do
        -- Markers in waitlist DEPRECATED in v5: Remove in v6.
        if string.sub(jobId, 1, 2) == "0:" then
            -- If the jobId is a delay marker ID we just remove it.
            rcall("LREM", activeKey, 1, jobId)
        else
            local jobKey = queueKeyPrefix .. jobId
            -- Check that the lock is also missing, then we can handle this job as really stalled.
            if (rcall("EXISTS", jobKey .. ":lock") == 0) then
                --  Remove from the active queue.
                local removed = rcall("LREM", activeKey, 1, jobId)
                if (removed > 0) then
                    -- If this job has been stalled too many times, such as if it crashes the worker, then fail it.
                    local stalledCount = rcall("HINCRBY", jobKey, "stc", 1)
                    -- Check if this is a repeatable job by looking at job options
                    local jobSchedulerId = rcall("HGET", jobKey, "rjk")
                    local isRepeatableJob = false
                    if jobSchedulerId then
                        local schedulerKey = repeatKey .. ":" .. jobSchedulerId
                        if rcall("EXISTS", schedulerKey) == 1 then
                            isRepeatableJob = true
                        else
                            -- TODO: remove this check in v6, as it is only needed for legacy repeatable jobs
                            -- that stored the scheduler id in the job key but did not create the scheduler hash key
                            local prevMillis = rcall("ZSCORE", repeatKey, jobSchedulerId)
                            if prevMillis then
                                isRepeatableJob = true
                            end
                        end
                    end
                    -- Only fail job if it exceeds stall limit AND is not a repeatable job
                    if stalledCount > maxStalledJobCount and not isRepeatableJob then
                        local failedReason = "job stalled more than allowable limit"
                        rcall("HSET", jobKey, "defa", failedReason)
                    end
                    moveJobToWait(metaKey, activeKey, waitKey, pausedKey, markerKey, eventStreamKey, jobId,
                        "RPUSH")
                    -- Emit the stalled event
                    rcall("XADD", eventStreamKey, "*", "event", "stalled", "jobId", jobId)
                    table.insert(stalled, jobId)
                end
            end
        end
    end
end
-- Mark potentially stalled jobs
local active = rcall('LRANGE', activeKey, 0, -1)
if (#active > 0) then
    for from, to in batches(#active, 7000) do
        rcall('SADD', stalledKey, unpack(active, from, to))
    end
end
return stalled
`,keys:9};a.s(["moveStalledJobsToWait",0,bV],367418),a.i(367418);let bW={name:"moveToActive",content:`--[[
  Move next job to be processed to active, lock it and fetch its data. The job
  may be delayed, in that case we need to move it to the delayed set instead.
  This operation guarantees that the worker owns the job during the lock
  expiration time. The worker is responsible of keeping the lock fresh
  so that no other worker picks this job again.
  Input:
    KEYS[1] wait key
    KEYS[2] active key
    KEYS[3] prioritized key
    KEYS[4] stream events key
    KEYS[5] stalled key
    -- Rate limiting
    KEYS[6] rate limiter key
    KEYS[7] delayed key
    -- Delayed jobs
    KEYS[8] paused key
    KEYS[9] meta key
    KEYS[10] pc priority counter
    -- Marker
    KEYS[11] marker key
    -- Arguments
    ARGV[1] key prefix
    ARGV[2] timestamp
    ARGV[3] opts
    opts - token - lock token
    opts - lockDuration
    opts - limiter
    opts - name - worker name
]]
local rcall = redis.call
local waitKey = KEYS[1]
local activeKey = KEYS[2]
local eventStreamKey = KEYS[4]
local rateLimiterKey = KEYS[6]
local delayedKey = KEYS[7]
local opts = cmsgpack.unpack(ARGV[3])
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
--[[
  Function to get current rate limit ttl.
]]
local function getRateLimitTTL(maxJobs, rateLimiterKey)
  if maxJobs and maxJobs <= tonumber(rcall("GET", rateLimiterKey) or 0) then
    local pttl = rcall("PTTL", rateLimiterKey)
    if pttl == 0 then
      rcall("DEL", rateLimiterKey)
    end
    if pttl > 0 then
      return pttl
    end
  end
  return 0
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to move job from prioritized state to active.
]]
local function moveJobFromPrioritizedToActive(priorityKey, activeKey, priorityCounterKey)
  local prioritizedJob = rcall("ZPOPMIN", priorityKey)
  if #prioritizedJob > 0 then
    rcall("LPUSH", activeKey, prioritizedJob[1])
    return prioritizedJob[1]
  else
    rcall("DEL", priorityCounterKey)
  end
end
--[[
  Function to move job from wait state to active.
  Input:
    opts - token - lock token
    opts - lockDuration
    opts - limiter
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function prepareJobForProcessing(keyPrefix, rateLimiterKey, eventStreamKey,
    jobId, processedOn, maxJobs, limiterDuration, markerKey, opts)
  local jobKey = keyPrefix .. jobId
  -- Check if we need to perform rate limiting.
  if maxJobs then
    local jobCounter = tonumber(rcall("INCR", rateLimiterKey))
    if jobCounter == 1 then
      local integerDuration = math.floor(math.abs(limiterDuration))
      rcall("PEXPIRE", rateLimiterKey, integerDuration)
    end
  end
  -- get a lock
  if opts['token'] ~= "0" then
    local lockKey = jobKey .. ':lock'
    rcall("SET", lockKey, opts['token'], "PX", opts['lockDuration'])
  end
  local optionalValues = {}
  if opts['name'] then
    -- Set "processedBy" field to the worker name
    table.insert(optionalValues, "pb")
    table.insert(optionalValues, opts['name'])
  end
  rcall("XADD", eventStreamKey, "*", "event", "active", "jobId", jobId, "prev", "waiting")
  rcall("HMSET", jobKey, "processedOn", processedOn, unpack(optionalValues))
  rcall("HINCRBY", jobKey, "ats", 1)
  addBaseMarkerIfNeeded(markerKey, false)
  -- rate limit delay must be 0 in this case to prevent adding more delay
  -- when job that is moved to active needs to be processed
  return {rcall("HGETALL", jobKey), jobId, 0, 0} -- get job data
end
--[[
  Updates the delay set, by moving delayed jobs that should
  be processed now to "wait".
     Events:
      'waiting'
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
-- Try to get as much as 1000 jobs at once
local function promoteDelayedJobs(delayedKey, markerKey, targetKey, prioritizedKey,
                                  eventStreamKey, prefix, timestamp, priorityCounterKey, isPaused)
    local jobs = rcall("ZRANGEBYSCORE", delayedKey, 0, (timestamp + 1) * 0x1000 - 1, "LIMIT", 0, 1000)
    if (#jobs > 0) then
        rcall("ZREM", delayedKey, unpack(jobs))
        for _, jobId in ipairs(jobs) do
            local jobKey = prefix .. jobId
            local priority =
                tonumber(rcall("HGET", jobKey, "priority")) or 0
            if priority == 0 then
                -- LIFO or FIFO
                rcall("LPUSH", targetKey, jobId)
            else
                local score = getPriorityScore(priority, priorityCounterKey)
                rcall("ZADD", prioritizedKey, score, jobId)
            end
            -- Emit waiting event
            rcall("XADD", eventStreamKey, "*", "event", "waiting", "jobId",
                  jobId, "prev", "delayed")
            rcall("HSET", jobKey, "delay", 0)
        end
        addBaseMarkerIfNeeded(markerKey, isPaused)
    end
end
local target, isPausedOrMaxed, rateLimitMax, rateLimitDuration = getTargetQueueList(KEYS[9],
    activeKey, waitKey, KEYS[8])
-- Check if there are delayed jobs that we can move to wait.
local markerKey = KEYS[11]
promoteDelayedJobs(delayedKey, markerKey, target, KEYS[3], eventStreamKey, ARGV[1],
                   ARGV[2], KEYS[10], isPausedOrMaxed)
local maxJobs = tonumber(rateLimitMax or (opts['limiter'] and opts['limiter']['max']))
local expireTime = getRateLimitTTL(maxJobs, rateLimiterKey)
-- Check if we are rate limited first.
if expireTime > 0 then return {0, 0, expireTime, 0} end
-- paused or maxed queue
if isPausedOrMaxed then return {0, 0, 0, 0} end
local limiterDuration = (opts['limiter'] and opts['limiter']['duration']) or rateLimitDuration
-- no job ID, try non-blocking move from wait to active
local jobId = rcall("RPOPLPUSH", waitKey, activeKey)
-- Markers in waitlist DEPRECATED in v5: Will be completely removed in v6.
if jobId and string.sub(jobId, 1, 2) == "0:" then
    rcall("LREM", activeKey, 1, jobId)
    jobId = rcall("RPOPLPUSH", waitKey, activeKey)
end
if jobId then
    return prepareJobForProcessing(ARGV[1], rateLimiterKey, eventStreamKey, jobId, ARGV[2],
                                   maxJobs, limiterDuration, markerKey, opts)
else
    jobId = moveJobFromPrioritizedToActive(KEYS[3], activeKey, KEYS[10])
    if jobId then
        return prepareJobForProcessing(ARGV[1], rateLimiterKey, eventStreamKey, jobId, ARGV[2],
                                       maxJobs, limiterDuration, markerKey, opts)
    end
end
-- Return the timestamp for the next delayed job if any.
local nextTimestamp = getNextDelayedTimestamp(delayedKey)
if nextTimestamp ~= nil then return {0, 0, 0, nextTimestamp} end
return {0, 0, 0, 0}
`,keys:11};a.s(["moveToActive",0,bW],741694),a.i(741694);let bX={name:"moveToDelayed",content:`--[[
  Moves job from active to delayed set.
  Input:
    KEYS[1] marker key
    KEYS[2] active key
    KEYS[3] prioritized key
    KEYS[4] delayed key
    KEYS[5] job key
    KEYS[6] events stream
    KEYS[7] meta key
    KEYS[8] stalled key
    KEYS[9] wait key
    KEYS[10] rate limiter key
    KEYS[11] paused key
    KEYS[12] pc priority counter
    ARGV[1] key prefix
    ARGV[2] timestamp
    ARGV[3] the id of the job
    ARGV[4] queue token
    ARGV[5] delay value
    ARGV[6] skip attempt
    ARGV[7] optional job fields to update
    ARGV[8] fetch next?
    ARGV[9] opts
  Output:
    0 - OK
   -1 - Missing job.
   -3 - Job not in active set.
  Events:
    - delayed key.
]]
local rcall = redis.call
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Function to fetch the next job to process.
  Tries to get the next job to avoid an extra roundtrip if the queue is
  not closing and not rate limited.
  Input:
    waitKey - wait list key
    activeKey - active list key
    prioritizedKey - prioritized sorted set key
    eventStreamKey - event stream key
    rateLimiterKey - rate limiter key
    delayedKey - delayed sorted set key
    pausedKey - paused list key
    metaKey - meta hash key
    pcKey - priority counter key
    markerKey - marker key
    prefix - keys prefix
    timestamp - current timestamp
    opts - options table:
      token (required) - lock token used when locking jobs
      lockDuration (required) - lock duration for acquired jobs
      limiter (optional) - rate limiter options table (e.g. { max = number })
]]
-- Includes
--[[
  Function to get current rate limit ttl.
]]
local function getRateLimitTTL(maxJobs, rateLimiterKey)
  if maxJobs and maxJobs <= tonumber(rcall("GET", rateLimiterKey) or 0) then
    local pttl = rcall("PTTL", rateLimiterKey)
    if pttl == 0 then
      rcall("DEL", rateLimiterKey)
    end
    if pttl > 0 then
      return pttl
    end
  end
  return 0
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to move job from prioritized state to active.
]]
local function moveJobFromPrioritizedToActive(priorityKey, activeKey, priorityCounterKey)
  local prioritizedJob = rcall("ZPOPMIN", priorityKey)
  if #prioritizedJob > 0 then
    rcall("LPUSH", activeKey, prioritizedJob[1])
    return prioritizedJob[1]
  else
    rcall("DEL", priorityCounterKey)
  end
end
--[[
  Function to move job from wait state to active.
  Input:
    opts - token - lock token
    opts - lockDuration
    opts - limiter
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function prepareJobForProcessing(keyPrefix, rateLimiterKey, eventStreamKey,
    jobId, processedOn, maxJobs, limiterDuration, markerKey, opts)
  local jobKey = keyPrefix .. jobId
  -- Check if we need to perform rate limiting.
  if maxJobs then
    local jobCounter = tonumber(rcall("INCR", rateLimiterKey))
    if jobCounter == 1 then
      local integerDuration = math.floor(math.abs(limiterDuration))
      rcall("PEXPIRE", rateLimiterKey, integerDuration)
    end
  end
  -- get a lock
  if opts['token'] ~= "0" then
    local lockKey = jobKey .. ':lock'
    rcall("SET", lockKey, opts['token'], "PX", opts['lockDuration'])
  end
  local optionalValues = {}
  if opts['name'] then
    -- Set "processedBy" field to the worker name
    table.insert(optionalValues, "pb")
    table.insert(optionalValues, opts['name'])
  end
  rcall("XADD", eventStreamKey, "*", "event", "active", "jobId", jobId, "prev", "waiting")
  rcall("HMSET", jobKey, "processedOn", processedOn, unpack(optionalValues))
  rcall("HINCRBY", jobKey, "ats", 1)
  addBaseMarkerIfNeeded(markerKey, false)
  -- rate limit delay must be 0 in this case to prevent adding more delay
  -- when job that is moved to active needs to be processed
  return {rcall("HGETALL", jobKey), jobId, 0, 0} -- get job data
end
--[[
  Updates the delay set, by moving delayed jobs that should
  be processed now to "wait".
     Events:
      'waiting'
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
-- Try to get as much as 1000 jobs at once
local function promoteDelayedJobs(delayedKey, markerKey, targetKey, prioritizedKey,
                                  eventStreamKey, prefix, timestamp, priorityCounterKey, isPaused)
    local jobs = rcall("ZRANGEBYSCORE", delayedKey, 0, (timestamp + 1) * 0x1000 - 1, "LIMIT", 0, 1000)
    if (#jobs > 0) then
        rcall("ZREM", delayedKey, unpack(jobs))
        for _, jobId in ipairs(jobs) do
            local jobKey = prefix .. jobId
            local priority =
                tonumber(rcall("HGET", jobKey, "priority")) or 0
            if priority == 0 then
                -- LIFO or FIFO
                rcall("LPUSH", targetKey, jobId)
            else
                local score = getPriorityScore(priority, priorityCounterKey)
                rcall("ZADD", prioritizedKey, score, jobId)
            end
            -- Emit waiting event
            rcall("XADD", eventStreamKey, "*", "event", "waiting", "jobId",
                  jobId, "prev", "delayed")
            rcall("HSET", jobKey, "delay", 0)
        end
        addBaseMarkerIfNeeded(markerKey, isPaused)
    end
end
local function fetchNextJob(waitKey, activeKey, prioritizedKey, eventStreamKey,
    rateLimiterKey, delayedKey, pausedKey, metaKey, pcKey, markerKey, prefix,
    timestamp, opts)
    local target, isPausedOrMaxed, rateLimitMax, rateLimitDuration =
        getTargetQueueList(metaKey, activeKey, waitKey, pausedKey)
    -- Check if there are delayed jobs that can be promoted
    promoteDelayedJobs(delayedKey, markerKey, target, prioritizedKey,
        eventStreamKey, prefix, timestamp, pcKey, isPausedOrMaxed)
    local maxJobs = tonumber(rateLimitMax or (opts['limiter'] and opts['limiter']['max']))
    -- Check if we are rate limited first.
    local expireTime = getRateLimitTTL(maxJobs, rateLimiterKey)
    if expireTime > 0 then
        return {0, 0, expireTime, 0}
    end
    -- paused or maxed queue
    if isPausedOrMaxed then
        return {0, 0, 0, 0}
    end
    local limiterDuration = (opts['limiter'] and opts['limiter']['duration']) or rateLimitDuration
    local jobId = rcall("RPOPLPUSH", waitKey, activeKey)
    if jobId then
        -- Markers in waitlist DEPRECATED in v5: Remove in v6.
        if string.sub(jobId, 1, 2) == "0:" then
            rcall("LREM", activeKey, 1, jobId)
            -- If jobId is special ID 0:delay (delay greater than 0), then there is no job to process
            -- but if ID is 0:0, then there is at least 1 prioritized job to process
            if jobId == "0:0" then
                jobId = moveJobFromPrioritizedToActive(prioritizedKey, activeKey, pcKey)
                return prepareJobForProcessing(prefix, rateLimiterKey,
                    eventStreamKey, jobId, timestamp, maxJobs,
                    limiterDuration, markerKey, opts)
            end
        else
            return prepareJobForProcessing(prefix, rateLimiterKey,
                eventStreamKey, jobId, timestamp, maxJobs,
                limiterDuration, markerKey, opts)
        end
    else
        jobId = moveJobFromPrioritizedToActive(prioritizedKey, activeKey, pcKey)
        if jobId then
            return prepareJobForProcessing(prefix, rateLimiterKey,
                eventStreamKey, jobId, timestamp, maxJobs,
                limiterDuration, markerKey, opts)
        end
    end
    -- Return the timestamp for the next delayed job if any.
    local nextTimestamp = getNextDelayedTimestamp(delayedKey)
    if nextTimestamp ~= nil then
        -- The result is guaranteed to be positive, since the
        -- ZRANGEBYSCORE command would have return a job otherwise.
        return {0, 0, 0, nextTimestamp}
    end
end
--[[
  Bake in the job id first 12 bits into the timestamp
  to guarantee correct execution order of delayed jobs
  (up to 4096 jobs per given timestamp or 4096 jobs apart per timestamp)
  WARNING: Jobs that are so far apart that they wrap around will cause FIFO to fail
]]
local function getDelayedScore(delayedKey, timestamp, delay)
  local delayedTimestamp = (delay > 0 and (tonumber(timestamp) + delay)) or tonumber(timestamp)
  local minScore = delayedTimestamp * 0x1000
  local maxScore = (delayedTimestamp + 1 ) * 0x1000 - 1
  local result = rcall("ZREVRANGEBYSCORE", delayedKey, maxScore,
    minScore, "WITHSCORES","LIMIT", 0, 1)
  if #result then
    local currentMaxScore = tonumber(result[2])
    if currentMaxScore ~= nil then
      if currentMaxScore >= maxScore then
        return maxScore, delayedTimestamp
      else
        return currentMaxScore + 1, delayedTimestamp
      end
    end
  end
  return minScore, delayedTimestamp
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
local function removeLock(jobKey, stalledKey, token, jobId)
  if token ~= "0" then
    local lockKey = jobKey .. ':lock'
    local lockToken = rcall("GET", lockKey)
    if lockToken == token then
      rcall("DEL", lockKey)
      rcall("SREM", stalledKey, jobId)
    else
      if lockToken then
        -- Lock exists but token does not match
        return -6
      else
        -- Lock is missing completely
        return -2
      end
    end
  end
  return 0
end
--[[
  Function to update a bunch of fields in a job.
]]
local function updateJobFields(jobKey, msgpackedFields)
  if msgpackedFields and #msgpackedFields > 0 then
    local fieldsToUpdate = cmsgpack.unpack(msgpackedFields)
    if fieldsToUpdate then
      rcall("HMSET", jobKey, unpack(fieldsToUpdate))
    end
  end
end
local jobKey = KEYS[5]
local markerKey = KEYS[1]
local metaKey = KEYS[7]
local token = ARGV[4] 
if rcall("EXISTS", jobKey) == 1 then
    local errorCode = removeLock(jobKey, KEYS[8], token, ARGV[3])
    if errorCode < 0 then
        return errorCode
    end
    updateJobFields(jobKey, ARGV[7])
    local delayedKey = KEYS[4]
    local jobId = ARGV[3]
    local delay = tonumber(ARGV[5])
    local numRemovedElements = rcall("LREM", KEYS[2], -1, jobId)
    if numRemovedElements < 1 then return -3 end
    local score, delayedTimestamp = getDelayedScore(delayedKey, ARGV[2], delay)
    if ARGV[6] == "0" then
        rcall("HINCRBY", jobKey, "atm", 1)
    end
    rcall("HSET", jobKey, "delay", ARGV[5])
    local maxEvents = getOrSetMaxEvents(metaKey)
    rcall("ZADD", delayedKey, score, jobId)
    rcall("XADD", KEYS[6], "MAXLEN", "~", maxEvents, "*", "event", "delayed",
          "jobId", jobId, "delay", delayedTimestamp)
    -- Try to get next job to avoid an extra roundtrip if the queue is not closing,
    -- and not rate limited.
    if (ARGV[8] == "1") then
        local opts = cmsgpack.unpack(ARGV[9])
        local result = fetchNextJob(KEYS[9], KEYS[2], KEYS[3], KEYS[6],
            KEYS[10], KEYS[4], KEYS[11], metaKey, KEYS[12], markerKey,
            ARGV[1], ARGV[2], opts)
        if result and type(result[1]) == "table" then
            return result
        end
    end
    -- Check if we need to push a marker job to wake up sleeping workers.
    addDelayMarkerIfNeeded(markerKey, delayedKey)
    return 0
else
    return -1
end
`,keys:12};a.s(["moveToDelayed",0,bX],535269),a.i(535269);let bY={name:"moveToFinished",content:`--[[
  Move job from active to a finished status (completed or failed)
  A job can only be moved to completed if it was active.
  The job must be locked before it can be moved to a finished status,
  and the lock must be released in this script.
    Input:
      KEYS[1] wait key
      KEYS[2] active key
      KEYS[3] prioritized key
      KEYS[4] event stream key
      KEYS[5] stalled key
      -- Rate limiting
      KEYS[6] rate limiter key
      KEYS[7] delayed key
      KEYS[8] paused key
      KEYS[9] meta key
      KEYS[10] pc priority counter
      KEYS[11] completed/failed key
      KEYS[12] jobId key
      KEYS[13] metrics key
      KEYS[14] marker key
      ARGV[1]  jobId
      ARGV[2]  timestamp
      ARGV[3]  msg property returnvalue / failedReason
      ARGV[4]  return value / failed reason
      ARGV[5]  target (completed/failed)
      ARGV[6]  fetch next?
      ARGV[7]  keys prefix
      ARGV[8]  opts
      ARGV[9]  job fields to update
      opts - token - lock token
      opts - keepJobs
      opts - lockDuration - lock duration in milliseconds
      opts - attempts max attempts
      opts - maxMetricsSize
      opts - fpof - fail parent on fail
      opts - cpof - continue parent on fail
      opts - idof - ignore dependency on fail
      opts - rdof - remove dependency on fail
      opts - name - worker name
    Output:
      0 OK
      -1 Missing key.
      -2 Missing lock.
      -3 Job not in active set
      -4 Job has pending children
      -6 Lock is not owned by this client
      -9 Job has failed children
    Events:
      'completed/failed'
]]
local rcall = redis.call
--- Includes
--[[
  Functions to collect metrics based on a current and previous count of jobs.
  Granularity is fixed at 1 minute.
]]
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
local function collectMetrics(metaKey, dataPointsList, maxDataPoints,
                                 timestamp)
    -- Increment current count
    local count = rcall("HINCRBY", metaKey, "count", 1) - 1
    -- Compute how many data points we need to add to the list, N.
    local prevTS = rcall("HGET", metaKey, "prevTS")
    if not prevTS then
        -- If prevTS is nil, set it to the current timestamp
        rcall("HSET", metaKey, "prevTS", timestamp, "prevCount", 0)
        return
    end
    local N = math.min(math.floor(timestamp / 60000) - math.floor(prevTS / 60000), tonumber(maxDataPoints))
    if N > 0 then
        local delta = count - rcall("HGET", metaKey, "prevCount")
        -- If N > 1, add N-1 zeros to the list
        if N > 1 then
            local points = {}
            points[1] = delta
            for i = 2, N do
                points[i] = 0
            end
            for from, to in batches(#points, 7000) do
                rcall("LPUSH", dataPointsList, unpack(points, from, to))
            end
        else
            -- LPUSH delta to the list
            rcall("LPUSH", dataPointsList, delta)
        end
        -- LTRIM to keep list to its max size
        rcall("LTRIM", dataPointsList, 0, maxDataPoints - 1)
        -- update prev count with current count
        rcall("HSET", metaKey, "prevCount", count, "prevTS", timestamp)
    end
end
--[[
  Function to fetch the next job to process.
  Tries to get the next job to avoid an extra roundtrip if the queue is
  not closing and not rate limited.
  Input:
    waitKey - wait list key
    activeKey - active list key
    prioritizedKey - prioritized sorted set key
    eventStreamKey - event stream key
    rateLimiterKey - rate limiter key
    delayedKey - delayed sorted set key
    pausedKey - paused list key
    metaKey - meta hash key
    pcKey - priority counter key
    markerKey - marker key
    prefix - keys prefix
    timestamp - current timestamp
    opts - options table:
      token (required) - lock token used when locking jobs
      lockDuration (required) - lock duration for acquired jobs
      limiter (optional) - rate limiter options table (e.g. { max = number })
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
--[[
  Function to get current rate limit ttl.
]]
local function getRateLimitTTL(maxJobs, rateLimiterKey)
  if maxJobs and maxJobs <= tonumber(rcall("GET", rateLimiterKey) or 0) then
    local pttl = rcall("PTTL", rateLimiterKey)
    if pttl == 0 then
      rcall("DEL", rateLimiterKey)
    end
    if pttl > 0 then
      return pttl
    end
  end
  return 0
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to move job from prioritized state to active.
]]
local function moveJobFromPrioritizedToActive(priorityKey, activeKey, priorityCounterKey)
  local prioritizedJob = rcall("ZPOPMIN", priorityKey)
  if #prioritizedJob > 0 then
    rcall("LPUSH", activeKey, prioritizedJob[1])
    return prioritizedJob[1]
  else
    rcall("DEL", priorityCounterKey)
  end
end
--[[
  Function to move job from wait state to active.
  Input:
    opts - token - lock token
    opts - lockDuration
    opts - limiter
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function prepareJobForProcessing(keyPrefix, rateLimiterKey, eventStreamKey,
    jobId, processedOn, maxJobs, limiterDuration, markerKey, opts)
  local jobKey = keyPrefix .. jobId
  -- Check if we need to perform rate limiting.
  if maxJobs then
    local jobCounter = tonumber(rcall("INCR", rateLimiterKey))
    if jobCounter == 1 then
      local integerDuration = math.floor(math.abs(limiterDuration))
      rcall("PEXPIRE", rateLimiterKey, integerDuration)
    end
  end
  -- get a lock
  if opts['token'] ~= "0" then
    local lockKey = jobKey .. ':lock'
    rcall("SET", lockKey, opts['token'], "PX", opts['lockDuration'])
  end
  local optionalValues = {}
  if opts['name'] then
    -- Set "processedBy" field to the worker name
    table.insert(optionalValues, "pb")
    table.insert(optionalValues, opts['name'])
  end
  rcall("XADD", eventStreamKey, "*", "event", "active", "jobId", jobId, "prev", "waiting")
  rcall("HMSET", jobKey, "processedOn", processedOn, unpack(optionalValues))
  rcall("HINCRBY", jobKey, "ats", 1)
  addBaseMarkerIfNeeded(markerKey, false)
  -- rate limit delay must be 0 in this case to prevent adding more delay
  -- when job that is moved to active needs to be processed
  return {rcall("HGETALL", jobKey), jobId, 0, 0} -- get job data
end
--[[
  Updates the delay set, by moving delayed jobs that should
  be processed now to "wait".
     Events:
      'waiting'
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
-- Try to get as much as 1000 jobs at once
local function promoteDelayedJobs(delayedKey, markerKey, targetKey, prioritizedKey,
                                  eventStreamKey, prefix, timestamp, priorityCounterKey, isPaused)
    local jobs = rcall("ZRANGEBYSCORE", delayedKey, 0, (timestamp + 1) * 0x1000 - 1, "LIMIT", 0, 1000)
    if (#jobs > 0) then
        rcall("ZREM", delayedKey, unpack(jobs))
        for _, jobId in ipairs(jobs) do
            local jobKey = prefix .. jobId
            local priority =
                tonumber(rcall("HGET", jobKey, "priority")) or 0
            if priority == 0 then
                -- LIFO or FIFO
                rcall("LPUSH", targetKey, jobId)
            else
                local score = getPriorityScore(priority, priorityCounterKey)
                rcall("ZADD", prioritizedKey, score, jobId)
            end
            -- Emit waiting event
            rcall("XADD", eventStreamKey, "*", "event", "waiting", "jobId",
                  jobId, "prev", "delayed")
            rcall("HSET", jobKey, "delay", 0)
        end
        addBaseMarkerIfNeeded(markerKey, isPaused)
    end
end
local function fetchNextJob(waitKey, activeKey, prioritizedKey, eventStreamKey,
    rateLimiterKey, delayedKey, pausedKey, metaKey, pcKey, markerKey, prefix,
    timestamp, opts)
    local target, isPausedOrMaxed, rateLimitMax, rateLimitDuration =
        getTargetQueueList(metaKey, activeKey, waitKey, pausedKey)
    -- Check if there are delayed jobs that can be promoted
    promoteDelayedJobs(delayedKey, markerKey, target, prioritizedKey,
        eventStreamKey, prefix, timestamp, pcKey, isPausedOrMaxed)
    local maxJobs = tonumber(rateLimitMax or (opts['limiter'] and opts['limiter']['max']))
    -- Check if we are rate limited first.
    local expireTime = getRateLimitTTL(maxJobs, rateLimiterKey)
    if expireTime > 0 then
        return {0, 0, expireTime, 0}
    end
    -- paused or maxed queue
    if isPausedOrMaxed then
        return {0, 0, 0, 0}
    end
    local limiterDuration = (opts['limiter'] and opts['limiter']['duration']) or rateLimitDuration
    local jobId = rcall("RPOPLPUSH", waitKey, activeKey)
    if jobId then
        -- Markers in waitlist DEPRECATED in v5: Remove in v6.
        if string.sub(jobId, 1, 2) == "0:" then
            rcall("LREM", activeKey, 1, jobId)
            -- If jobId is special ID 0:delay (delay greater than 0), then there is no job to process
            -- but if ID is 0:0, then there is at least 1 prioritized job to process
            if jobId == "0:0" then
                jobId = moveJobFromPrioritizedToActive(prioritizedKey, activeKey, pcKey)
                return prepareJobForProcessing(prefix, rateLimiterKey,
                    eventStreamKey, jobId, timestamp, maxJobs,
                    limiterDuration, markerKey, opts)
            end
        else
            return prepareJobForProcessing(prefix, rateLimiterKey,
                eventStreamKey, jobId, timestamp, maxJobs,
                limiterDuration, markerKey, opts)
        end
    else
        jobId = moveJobFromPrioritizedToActive(prioritizedKey, activeKey, pcKey)
        if jobId then
            return prepareJobForProcessing(prefix, rateLimiterKey,
                eventStreamKey, jobId, timestamp, maxJobs,
                limiterDuration, markerKey, opts)
        end
    end
    -- Return the timestamp for the next delayed job if any.
    local nextTimestamp = getNextDelayedTimestamp(delayedKey)
    if nextTimestamp ~= nil then
        -- The result is guaranteed to be positive, since the
        -- ZRANGEBYSCORE command would have return a job otherwise.
        return {0, 0, 0, nextTimestamp}
    end
end
--[[
  Function to recursively move from waitingChildren to failed.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized)
  if no pending dependencies.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized) if needed.
]]
-- Includes
--[[
  Move parent to a wait status (wait, prioritized or delayed)
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Function to check if queue is paused or maxed
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePausedOrMaxed(queueMetaKey, activeKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency")
  if queueAttributes[1] then
    return true
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      return activeCount >= tonumber(queueAttributes[2])
    end
  end
  return false
end
local function moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    local parentWaitKey = parentQueueKey .. ":wait"
    local parentPausedKey = parentQueueKey .. ":paused"
    local parentActiveKey = parentQueueKey .. ":active"
    local parentMetaKey = parentQueueKey .. ":meta"
    local parentMarkerKey = parentQueueKey .. ":marker"
    local jobAttributes = rcall("HMGET", parentKey, "priority", "delay")
    local priority = tonumber(jobAttributes[1]) or 0
    local delay = tonumber(jobAttributes[2]) or 0
    if delay > 0 then
        local delayedTimestamp = tonumber(timestamp) + delay
        local score = delayedTimestamp * 0x1000
        local parentDelayedKey = parentQueueKey .. ":delayed"
        rcall("ZADD", parentDelayedKey, score, parentId)
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "delayed", "jobId", parentId, "delay",
            delayedTimestamp)
        addDelayMarkerIfNeeded(parentMarkerKey, parentDelayedKey)
    else
        if priority == 0 then
            local parentTarget, isParentPausedOrMaxed = getTargetQueueList(parentMetaKey, parentActiveKey,
                parentWaitKey, parentPausedKey)
            addJobInTargetList(parentTarget, parentMarkerKey, "RPUSH", isParentPausedOrMaxed, parentId)
        else
            local isPausedOrMaxed = isQueuePausedOrMaxed(parentMetaKey, parentActiveKey)
            addJobWithPriority(parentMarkerKey, parentQueueKey .. ":prioritized", priority, parentId,
                parentQueueKey .. ":pc", isPausedOrMaxed)
        end
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "waiting", "jobId", parentId, "prev",
            "waiting-children")
    end
end
local function moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  if rcall("EXISTS", parentKey) == 1 then
    local parentWaitingChildrenKey = parentQueueKey .. ":waiting-children"
    if rcall("ZSCORE", parentWaitingChildrenKey, parentId) then    
      rcall("ZREM", parentWaitingChildrenKey, parentId)
      moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    end
  end
end
local function moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey,
  parentId, timestamp)
  local doNotHavePendingDependencies = rcall("SCARD", parentDependenciesKey) == 0
  if doNotHavePendingDependencies then
    moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  end
end
local handleChildFailureAndMoveParentToWait = function (parentQueueKey, parentKey, parentId, jobIdKey, timestamp)
  if rcall("EXISTS", parentKey) == 1 then
    local parentWaitingChildrenKey = parentQueueKey .. ":waiting-children"
    local parentDelayedKey = parentQueueKey .. ":delayed"
    local parentWaitingChildrenOrDelayedKey
    if rcall("ZSCORE", parentWaitingChildrenKey, parentId) then
      parentWaitingChildrenOrDelayedKey = parentWaitingChildrenKey
    elseif rcall("ZSCORE", parentDelayedKey, parentId) then
      parentWaitingChildrenOrDelayedKey = parentDelayedKey
      rcall("HSET", parentKey, "delay", 0)
    end
    if parentWaitingChildrenOrDelayedKey then
      rcall("ZREM", parentWaitingChildrenOrDelayedKey, parentId)
      local deferredFailure = "child " .. jobIdKey .. " failed"
      rcall("HSET", parentKey, "defa", deferredFailure)
      moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    else
      if not rcall("ZSCORE", parentQueueKey .. ":failed", parentId) then
        local deferredFailure = "child " .. jobIdKey .. " failed"
        rcall("HSET", parentKey, "defa", deferredFailure)
      end
    end
  end
end
local moveChildFromDependenciesIfNeeded = function (rawParentData, childKey, failedReason, timestamp)
  if rawParentData then
    local parentData = cjson.decode(rawParentData)
    local parentKey = parentData['queueKey'] .. ':' .. parentData['id']
    local parentDependenciesChildrenKey = parentKey .. ":dependencies"
    if parentData['fpof'] then
      if rcall("SREM", parentDependenciesChildrenKey, childKey) == 1 then
        local parentUnsuccessfulChildrenKey = parentKey .. ":unsuccessful"
        rcall("ZADD", parentUnsuccessfulChildrenKey, timestamp, childKey)
        handleChildFailureAndMoveParentToWait(
          parentData['queueKey'],
          parentKey,
          parentData['id'],
          childKey,
          timestamp
        )
      end
    elseif parentData['cpof'] then
      if rcall("SREM", parentDependenciesChildrenKey, childKey) == 1 then
        local parentFailedChildrenKey = parentKey .. ":failed"
        rcall("HSET", parentFailedChildrenKey, childKey, failedReason)
        moveParentToWaitIfNeeded(parentData['queueKey'], parentKey, parentData['id'], timestamp)
      end
    elseif parentData['idof'] or parentData['rdof'] then
      if rcall("SREM", parentDependenciesChildrenKey, childKey) == 1 then
        moveParentToWaitIfNoPendingDependencies(parentData['queueKey'], parentDependenciesChildrenKey,
          parentKey, parentData['id'], timestamp)
        if parentData['idof'] then
          local parentFailedChildrenKey = parentKey .. ":failed"
          rcall("HSET", parentFailedChildrenKey, childKey, failedReason)
        end
      end
    end
  end
end
--[[
  Function to remove deduplication key if needed
  when a job is moved to completed or failed states.
]]
local function removeDeduplicationKeyIfNeededOnFinalization(prefixKey,
  deduplicationId, jobId)
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local pttl = rcall("PTTL", deduplicationKey)
    if pttl == 0 then
      return rcall("DEL", deduplicationKey)
    end
    if pttl == -1 then
      local currentJobId = rcall('GET', deduplicationKey)
      if currentJobId and currentJobId == jobId then
        return rcall("DEL", deduplicationKey)
      end
    end
  end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Functions to remove jobs by max age.
]]
-- Includes
--[[
  Function to remove job.
]]
-- Includes
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobId, deduplicationId)
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      rcall("DEL", deduplicationKey)
      -- Also clean up any pending dedup-next data for this dedup ID
      rcall("DEL", prefixKey .. "dn:" .. deduplicationId)
      return 1
    end
  end
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local function removeJob(jobId, hard, baseKey, shouldRemoveDeduplicationKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  if shouldRemoveDeduplicationKey then
    local deduplicationId = rcall("HGET", jobKey, "deid")
    removeDeduplicationKeyIfNeededOnRemoval(baseKey, jobId, deduplicationId)
  end
  removeJobKeys(jobKey)
end
local function removeJobsByMaxAge(timestamp, maxAge, targetSet, prefix, maxLimit)
  local start = timestamp - maxAge * 1000
  local jobIds = rcall("ZREVRANGEBYSCORE", targetSet, start, "-inf", "LIMIT", 0, maxLimit)
  for i, jobId in ipairs(jobIds) do
    removeJob(jobId, false, prefix, false --[[remove debounce key]])
  end
  if #jobIds > 0 then
    if #jobIds < maxLimit then
      rcall("ZREMRANGEBYSCORE", targetSet, "-inf", start)
    else
      for from, to in batches(#jobIds, 7000) do
        rcall("ZREM", targetSet, unpack(jobIds, from, to))
      end
    end
  end
end
--[[
  Functions to remove jobs by max count.
]]
-- Includes
local function removeJobsByMaxCount(maxCount, targetSet, prefix)
  local start = maxCount
  local jobIds = rcall("ZREVRANGE", targetSet, start, -1)
  for i, jobId in ipairs(jobIds) do
    removeJob(jobId, false, prefix, false --[[remove debounce key]])
  end
  rcall("ZREMRANGEBYRANK", targetSet, 0, -(maxCount + 1))
end
local function removeLock(jobKey, stalledKey, token, jobId)
  if token ~= "0" then
    local lockKey = jobKey .. ':lock'
    local lockToken = rcall("GET", lockKey)
    if lockToken == token then
      rcall("DEL", lockKey)
      rcall("SREM", stalledKey, jobId)
    else
      if lockToken then
        -- Lock exists but token does not match
        return -6
      else
        -- Lock is missing completely
        return -2
      end
    end
  end
  return 0
end
--[[
  Function to create a new job from stored dedup-next data
  when a deduplicated job with keepLastIfActive finishes.
  At most one next job is created per deduplication ID.
  Multiple triggers while active overwrite the dedup-next data,
  so only the latest data is used.
]]
-- Includes
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to set the deduplication key for a job.
  Uses TTL from deduplication opts if provided.
]]
local function setDeduplicationKey(deduplicationKey, jobId, deduplicationOpts)
    local ttl = deduplicationOpts and deduplicationOpts['ttl']
    if ttl and ttl > 0 then
        rcall('SET', deduplicationKey, jobId, 'PX', ttl)
    else
        rcall('SET', deduplicationKey, jobId)
    end
end
--[[
  Shared helper to store a job and enqueue it into the appropriate list/set.
  Handles delayed, prioritized, and standard (LIFO/FIFO) jobs.
  Emits the appropriate event after enqueuing ("delayed" or "waiting").
  Returns delay, priority from storeJob.
]]
-- Includes
--[[
  Adds a delayed job to the queue by doing the following:
    - Creates a new job key with the job data.
    - adds to delayed zset.
    - Emits a global event 'delayed' if the job is delayed.
]]
-- Includes
--[[
  Bake in the job id first 12 bits into the timestamp
  to guarantee correct execution order of delayed jobs
  (up to 4096 jobs per given timestamp or 4096 jobs apart per timestamp)
  WARNING: Jobs that are so far apart that they wrap around will cause FIFO to fail
]]
local function getDelayedScore(delayedKey, timestamp, delay)
  local delayedTimestamp = (delay > 0 and (tonumber(timestamp) + delay)) or tonumber(timestamp)
  local minScore = delayedTimestamp * 0x1000
  local maxScore = (delayedTimestamp + 1 ) * 0x1000 - 1
  local result = rcall("ZREVRANGEBYSCORE", delayedKey, maxScore,
    minScore, "WITHSCORES","LIMIT", 0, 1)
  if #result then
    local currentMaxScore = tonumber(result[2])
    if currentMaxScore ~= nil then
      if currentMaxScore >= maxScore then
        return maxScore, delayedTimestamp
      else
        return currentMaxScore + 1, delayedTimestamp
      end
    end
  end
  return minScore, delayedTimestamp
end
local function addDelayedJob(jobId, delayedKey, eventsKey, timestamp,
  maxEvents, markerKey, delay)
  local score, delayedTimestamp = getDelayedScore(delayedKey, timestamp, tonumber(delay))
  rcall("ZADD", delayedKey, score, jobId)
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "delayed",
    "jobId", jobId, "delay", delayedTimestamp)
  -- mark that a delayed job is available
  addDelayMarkerIfNeeded(markerKey, delayedKey)
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
local function storeAndEnqueueJob(eventsKey, jobIdKey, jobId, name, data, opts,
    timestamp, parentKey, parentData, repeatJobKey, maxEvents,
    waitKey, pausedKey, activeKey, metaKey, prioritizedKey,
    priorityCounterKey, delayedKey, markerKey)
  local delay, priority = storeJob(eventsKey, jobIdKey, jobId, name, data,
      opts, timestamp, parentKey, parentData, repeatJobKey)
  if delay ~= 0 and delayedKey then
    addDelayedJob(jobId, delayedKey, eventsKey, timestamp, maxEvents, markerKey, delay)
  else
    local target, isPausedOrMaxed = getTargetQueueList(metaKey, activeKey, waitKey, pausedKey)
    if priority > 0 then
      addJobWithPriority(markerKey, prioritizedKey, priority, jobId,
          priorityCounterKey, isPausedOrMaxed)
    else
      local pushCmd = opts['lifo'] and 'RPUSH' or 'LPUSH'
      addJobInTargetList(target, markerKey, pushCmd, isPausedOrMaxed, jobId)
    end
    rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "waiting",
        "jobId", jobId)
  end
  return delay, priority
end
local function requeueDeduplicatedJob(prefix, deduplicationId, eventStreamKey,
    metaKey, activeKey, waitKey, pausedKey, markerKey, prioritizedKey,
    priorityCounterKey, delayedKey, timestamp)
  local deduplicationNextKey = prefix .. "dn:" .. deduplicationId
  if rcall("EXISTS", deduplicationNextKey) == 1 then
    local nextData = rcall("HMGET", deduplicationNextKey,
        "name", "data", "opts", "pk", "pd", "pdk", "rjk", "jid")
    -- Always increment the counter to keep it monotonic
    local nextId = rcall("INCR", prefix .. "id") .. ""
    local storedJobId = nextData[8] -- index 8 = "jid" (8th field in the HMGET call above)
    local newJobId
    if storedJobId then
      newJobId = storedJobId
    else
      newJobId = nextId
    end
    local newJobIdKey = prefix .. newJobId
    local newOpts = cjson.decode(nextData[3])
    local deduplicationKey = prefix .. "de:" .. deduplicationId
    local parentKey = nextData[4] or nil
    local parentData = nextData[5] or nil
    local parentDependenciesKey = nextData[6] or nil
    local repeatJobKey = nextData[7] or nil
    -- Set dedup key for the new job (without TTL when keepLastIfActive,
    -- so the key outlives the job's active duration)
    local deOpts = newOpts['de']
    if deOpts and deOpts['keepLastIfActive'] then
      rcall('SET', deduplicationKey, newJobId)
    else
      setDeduplicationKey(deduplicationKey, newJobId, deOpts)
    end
    -- Store and enqueue using the shared helper (handles priority/lifo/delayed)
    local maxEvents = getOrSetMaxEvents(metaKey)
    storeAndEnqueueJob(eventStreamKey, newJobIdKey, newJobId, nextData[1], nextData[2],
        newOpts, timestamp, parentKey, parentData, repeatJobKey, maxEvents,
        waitKey, pausedKey, activeKey, metaKey, prioritizedKey,
        priorityCounterKey, delayedKey, markerKey)
    -- Register as child dependency if the job has a parent
    if parentDependenciesKey then
      rcall("SADD", parentDependenciesKey, newJobIdKey)
    end
    -- Only delete the dedup-next hash after the job is fully created,
    -- so that if any step above errors, the data is not permanently lost.
    rcall("DEL", deduplicationNextKey)
  end
end
--[[
  Function to trim events, default 10000.
]]
-- Includes
local function trimEvents(metaKey, eventStreamKey)
  local maxEvents = getOrSetMaxEvents(metaKey)
  if maxEvents then
    rcall("XTRIM", eventStreamKey, "MAXLEN", "~", maxEvents)
  else
    rcall("XTRIM", eventStreamKey, "MAXLEN", "~", 10000)
  end
end
--[[
  Validate and move or add dependencies to parent.
]]
-- Includes
local function updateParentDepsIfNeeded(parentKey, parentQueueKey, parentDependenciesKey,
  parentId, jobIdKey, returnvalue, timestamp )
  local processedSet = parentKey .. ":processed"
  rcall("HSET", processedSet, jobIdKey, returnvalue)
  moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey, parentId, timestamp)
end
--[[
  Function to update a bunch of fields in a job.
]]
local function updateJobFields(jobKey, msgpackedFields)
  if msgpackedFields and #msgpackedFields > 0 then
    local fieldsToUpdate = cmsgpack.unpack(msgpackedFields)
    if fieldsToUpdate then
      rcall("HMSET", jobKey, unpack(fieldsToUpdate))
    end
  end
end
local jobIdKey = KEYS[12]
if rcall("EXISTS", jobIdKey) == 1 then -- Make sure job exists
    -- Make sure it does not have pending dependencies
    -- It must happen before removing lock
    if ARGV[5] == "completed" then
        if rcall("SCARD", jobIdKey .. ":dependencies") ~= 0 then
            return -4
        end
        if rcall("ZCARD", jobIdKey .. ":unsuccessful") ~= 0 then
            return -9
        end
    end
    local opts = cmsgpack.unpack(ARGV[8])
    local token = opts['token']
    local errorCode = removeLock(jobIdKey, KEYS[5], token, ARGV[1])
    if errorCode < 0 then
        return errorCode
    end
    updateJobFields(jobIdKey, ARGV[9]);
    local attempts = opts['attempts']
    local maxMetricsSize = opts['maxMetricsSize']
    local maxCount = opts['keepJobs']['count']
    local maxAge = opts['keepJobs']['age']
    local maxLimit = opts['keepJobs']['limit'] or 1000
    local jobAttributes = rcall("HMGET", jobIdKey, "parentKey", "parent", "deid")
    local parentKey = jobAttributes[1] or ""
    local parentId = ""
    local parentQueueKey = ""
    if jobAttributes[2] then -- TODO: need to revisit this logic if it's still needed
        local jsonDecodedParent = cjson.decode(jobAttributes[2])
        parentId = jsonDecodedParent['id']
        parentQueueKey = jsonDecodedParent['queueKey']
    end
    local jobId = ARGV[1]
    local timestamp = ARGV[2]
    -- Remove from active list (if not active we shall return error)
    local numRemovedElements = rcall("LREM", KEYS[2], -1, jobId)
    if (numRemovedElements < 1) then
        return -3
    end
    local eventStreamKey = KEYS[4]
    local metaKey = KEYS[9]
    -- Trim events before emitting them to avoid trimming events emitted in this script
    trimEvents(metaKey, eventStreamKey)
    local prefix = ARGV[7]
    removeDeduplicationKeyIfNeededOnFinalization(prefix, jobAttributes[3], jobId)
    -- Check if there is requeue data for this dedup ID (keepLastIfActive mode)
    if jobAttributes[3] then
      requeueDeduplicatedJob(prefix, jobAttributes[3], eventStreamKey,
          metaKey, KEYS[2], KEYS[1], KEYS[8], KEYS[14], KEYS[3], KEYS[10],
          KEYS[7], timestamp)
    end
    -- If job has a parent we need to
    -- 1) remove this job id from parents dependencies
    -- 2) move the job Id to parent "processed" set
    -- 3) push the results into parent "results" list
    -- 4) if parent's dependencies is empty, then move parent to "wait/paused". Note it may be a different queue!.
    if parentId == "" and parentKey ~= "" then
        parentId = getJobIdFromKey(parentKey)
        parentQueueKey = getJobKeyPrefix(parentKey, ":" .. parentId)
    end
    if parentId ~= "" then
        if ARGV[5] == "completed" then
            local dependenciesSet = parentKey .. ":dependencies"
            if rcall("SREM", dependenciesSet, jobIdKey) == 1 then
                updateParentDepsIfNeeded(parentKey, parentQueueKey, dependenciesSet, parentId, jobIdKey, ARGV[4],
                    timestamp)
            end
        else
            moveChildFromDependenciesIfNeeded(jobAttributes[2], jobIdKey, ARGV[4], timestamp)
        end
    end
    local attemptsMade = rcall("HINCRBY", jobIdKey, "atm", 1)
    -- Remove job?
    if maxCount ~= 0 then
        local targetSet = KEYS[11]
        -- Add to complete/failed set
        rcall("ZADD", targetSet, timestamp, jobId)
        rcall("HSET", jobIdKey, ARGV[3], ARGV[4], "finishedOn", timestamp)
        -- "returnvalue" / "failedReason" and "finishedOn"
        if ARGV[5] == "failed" then
            rcall("HDEL", jobIdKey, "defa")
        end
        -- Remove old jobs?
        if maxAge ~= nil then
            removeJobsByMaxAge(timestamp, maxAge, targetSet, prefix, maxLimit)
        end
        if maxCount ~= nil and maxCount > 0 then
            removeJobsByMaxCount(maxCount, targetSet, prefix)
        end
    else
        removeJobKeys(jobIdKey)
        if parentKey ~= "" then
            -- TODO: when a child is removed when finished, result or failure in parent
            -- must not be deleted, those value references should be deleted when the parent
            -- is deleted
            removeParentDependencyKey(jobIdKey, false, parentKey, jobAttributes[3])
        end
    end
    rcall("XADD", eventStreamKey, "*", "event", ARGV[5], "jobId", jobId, ARGV[3], ARGV[4], "prev", "active")
    if ARGV[5] == "failed" then
        if tonumber(attemptsMade) >= tonumber(attempts) then
            rcall("XADD", eventStreamKey, "*", "event", "retries-exhausted", "jobId", jobId, "attemptsMade",
                attemptsMade)
        end
    end
    -- Collect metrics
    if maxMetricsSize ~= "" then
        collectMetrics(KEYS[13], KEYS[13] .. ':data', maxMetricsSize, timestamp)
    end
    -- Try to get next job to avoid an extra roundtrip if the queue is not closing,
    -- and not rate limited.
    if (ARGV[6] == "1") then
        local result = fetchNextJob(KEYS[1], KEYS[2], KEYS[3], eventStreamKey,
            KEYS[6], KEYS[7], KEYS[8], metaKey, KEYS[10], KEYS[14], prefix,
            timestamp, opts)
        if result then
            return result
        end
    end
    local waitLen = rcall("LLEN", KEYS[1])
    if waitLen == 0 then
        local activeLen = rcall("LLEN", KEYS[2])
        if activeLen == 0 then
            local prioritizedLen = rcall("ZCARD", KEYS[3])
            if prioritizedLen == 0 then
                rcall("XADD", eventStreamKey, "*", "event", "drained")
            end
        end
    end
    return 0
else
    return -1
end
`,keys:14};a.s(["moveToFinished",0,bY],917394),a.i(917394);let bZ={name:"moveToWaitingChildren",content:`--[[
  Moves job from active to waiting children set.
  Input:
    KEYS[1] active key
    KEYS[2] wait-children key
    KEYS[3] job key
    KEYS[4] job dependencies key
    KEYS[5] job unsuccessful key
    KEYS[6] stalled key
    KEYS[7] events key
    ARGV[1] token
    ARGV[2] child key
    ARGV[3] timestamp
    ARGV[4] jobId
    ARGV[5] prefix
  Output:
    0 - OK
    1 - There are not pending dependencies.
   -1 - Missing job.
   -2 - Missing lock
   -3 - Job not in active set
   -9 - Job has failed children
]]
local rcall = redis.call
local activeKey = KEYS[1]
local waitingChildrenKey = KEYS[2]
local jobKey = KEYS[3]
local jobDependenciesKey = KEYS[4]
local jobUnsuccessfulKey = KEYS[5]
local stalledKey = KEYS[6]
local eventStreamKey = KEYS[7]
local token = ARGV[1]
local timestamp = ARGV[3]
local jobId = ARGV[4]
--- Includes
local function removeLock(jobKey, stalledKey, token, jobId)
  if token ~= "0" then
    local lockKey = jobKey .. ':lock'
    local lockToken = rcall("GET", lockKey)
    if lockToken == token then
      rcall("DEL", lockKey)
      rcall("SREM", stalledKey, jobId)
    else
      if lockToken then
        -- Lock exists but token does not match
        return -6
      else
        -- Lock is missing completely
        return -2
      end
    end
  end
  return 0
end
local function removeJobFromActive(activeKey, stalledKey, jobKey, jobId,
    token)
  local errorCode = removeLock(jobKey, stalledKey, token, jobId)
  if errorCode < 0 then
    return errorCode
  end
  local numRemovedElements = rcall("LREM", activeKey, -1, jobId)
  if numRemovedElements < 1 then
    return -3
  end
  return 0
end
local function moveToWaitingChildren(activeKey, waitingChildrenKey, stalledKey, eventStreamKey,
    jobKey, jobId, timestamp, token)
  local errorCode = removeJobFromActive(activeKey, stalledKey, jobKey, jobId, token)
  if errorCode < 0 then
    return errorCode
  end
  local score = tonumber(timestamp)
  rcall("ZADD", waitingChildrenKey, score, jobId)
  rcall("XADD", eventStreamKey, "*", "event", "waiting-children", "jobId", jobId, 'prev', 'active')
  return 0
end
if rcall("EXISTS", jobKey) == 1 then
  if rcall("ZCARD", jobUnsuccessfulKey) ~= 0 then
    return -9
  else
    if ARGV[2] ~= "" then
      if rcall("SISMEMBER", jobDependenciesKey, ARGV[2]) ~= 0 then
        return moveToWaitingChildren(activeKey, waitingChildrenKey, stalledKey, eventStreamKey,
          jobKey, jobId, timestamp, token)
      end
      return 1
    else
      if rcall("SCARD", jobDependenciesKey) ~= 0 then 
        return moveToWaitingChildren(activeKey, waitingChildrenKey, stalledKey, eventStreamKey,
          jobKey, jobId, timestamp, token)
      end
      return 1
    end    
  end
end
return -1
`,keys:7};a.s(["moveToWaitingChildren",0,bZ],673821),a.i(673821);let b$={name:"obliterate",content:`--[[
  Completely obliterates a queue and all of its contents
  This command completely destroys a queue including all of its jobs, current or past 
  leaving no trace of its existence. Since this script needs to iterate to find all the job
  keys, consider that this call may be slow for very large queues.
  The queue needs to be "paused" or it will return an error
  If the queue has currently active jobs then the script by default will return error,
  however this behaviour can be overridden using the 'force' option.
  Input:
    KEYS[1] meta
    KEYS[2] base
    ARGV[1] count
    ARGV[2] force
]]
local maxCount = tonumber(ARGV[1])
local baseKey = KEYS[2]
local rcall = redis.call
-- Includes
--[[
  Functions to remove jobs.
]]
-- Includes
--[[
  Function to remove job.
]]
-- Includes
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobId, deduplicationId)
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      rcall("DEL", deduplicationKey)
      -- Also clean up any pending dedup-next data for this dedup ID
      rcall("DEL", prefixKey .. "dn:" .. deduplicationId)
      return 1
    end
  end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local function removeJob(jobId, hard, baseKey, shouldRemoveDeduplicationKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  if shouldRemoveDeduplicationKey then
    local deduplicationId = rcall("HGET", jobKey, "deid")
    removeDeduplicationKeyIfNeededOnRemoval(baseKey, jobId, deduplicationId)
  end
  removeJobKeys(jobKey)
end
local function removeJobs(keys, hard, baseKey, max)
  for i, key in ipairs(keys) do
    removeJob(key, hard, baseKey, true --[[remove debounce key]])
  end
  return max - #keys
end
--[[
  Functions to remove jobs.
]]
-- Includes
--[[
  Function to filter out jobs to ignore from a table.
]]
local function filterOutJobsToIgnore(jobs, jobsToIgnore)
  local filteredJobs = {}
  for i = 1, #jobs do
    if not jobsToIgnore[jobs[i]] then
      table.insert(filteredJobs, jobs[i])
    end
  end
  return filteredJobs
end
local function getListItems(keyName, max)
  return rcall('LRANGE', keyName, 0, max - 1)
end
local function removeListJobs(keyName, hard, baseKey, max, jobsToIgnore)
  local jobs = getListItems(keyName, max)
  if jobsToIgnore then
    jobs = filterOutJobsToIgnore(jobs, jobsToIgnore)
  end
  local count = removeJobs(jobs, hard, baseKey, max)
  rcall("LTRIM", keyName, #jobs, -1)
  return count
end
-- Includes
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
--[[
  Function to get ZSet items.
]]
local function getZSetItems(keyName, max)
  return rcall('ZRANGE', keyName, 0, max - 1)
end
local function removeZSetJobs(keyName, hard, baseKey, max, jobsToIgnore)
  local jobs = getZSetItems(keyName, max)
  if jobsToIgnore then
    jobs = filterOutJobsToIgnore(jobs, jobsToIgnore)
  end
  local count = removeJobs(jobs, hard, baseKey, max)
  if(#jobs > 0) then
    for from, to in batches(#jobs, 7000) do
      rcall("ZREM", keyName, unpack(jobs, from, to))
    end
  end
  return count
end
local function removeLockKeys(keys)
  for i, key in ipairs(keys) do
    rcall("DEL", baseKey .. key .. ':lock')
  end
end
-- 1) Check if paused, if not return with error.
if rcall("HEXISTS", KEYS[1], "paused") ~= 1 then
  return -1 -- Error, NotPaused
end
-- 2) Check if there are active jobs, if there are and not "force" return error.
local activeKey = baseKey .. 'active'
local activeJobs = getListItems(activeKey, maxCount)
if (#activeJobs > 0) then
  if(ARGV[2] == "") then 
    return -2 -- Error, ExistActiveJobs
  end
end
removeLockKeys(activeJobs)
maxCount = removeJobs(activeJobs, true, baseKey, maxCount)
rcall("LTRIM", activeKey, #activeJobs, -1)
if(maxCount <= 0) then
  return 1
end
local delayedKey = baseKey .. 'delayed'
maxCount = removeZSetJobs(delayedKey, true, baseKey, maxCount)
if(maxCount <= 0) then
  return 1
end
local repeatKey = baseKey .. 'repeat'
local repeatJobsIds = getZSetItems(repeatKey, maxCount)
for i, key in ipairs(repeatJobsIds) do
  local jobKey = repeatKey .. ":" .. key
  rcall("DEL", jobKey)
end
if(#repeatJobsIds > 0) then
  for from, to in batches(#repeatJobsIds, 7000) do
    rcall("ZREM", repeatKey, unpack(repeatJobsIds, from, to))
  end
end
maxCount = maxCount - #repeatJobsIds
if(maxCount <= 0) then
  return 1
end
local completedKey = baseKey .. 'completed'
maxCount = removeZSetJobs(completedKey, true, baseKey, maxCount)
if(maxCount <= 0) then
  return 1
end
local pausedKey = baseKey .. 'paused'
maxCount = removeListJobs(pausedKey, true, baseKey, maxCount)
if(maxCount <= 0) then
  return 1
end
local prioritizedKey = baseKey .. 'prioritized'
maxCount = removeZSetJobs(prioritizedKey, true, baseKey, maxCount)
if(maxCount <= 0) then
  return 1
end
local failedKey = baseKey .. 'failed'
maxCount = removeZSetJobs(failedKey, true, baseKey, maxCount)
if(maxCount <= 0) then
  return 1
end
if(maxCount > 0) then
  rcall("DEL",
    baseKey .. 'events',
    baseKey .. 'delay',
    baseKey .. 'stalled-check',
    baseKey .. 'stalled',
    baseKey .. 'id',
    baseKey .. 'pc',
    baseKey .. 'marker',
    baseKey .. 'meta',
    baseKey .. 'metrics:completed',
    baseKey .. 'metrics:completed:data',
    baseKey .. 'metrics:failed',
    baseKey .. 'metrics:failed:data')
  return 0
else
  return 1
end
`,keys:2};a.s(["obliterate",0,b$],870993),a.i(870993);let b_={name:"paginate",content:`--[[
    Paginate a set or hash
    Input:
      KEYS[1] key pointing to the set or hash to be paginated.
      ARGV[1]  page start offset
      ARGV[2]  page end offset (-1 for all the elements)
      ARGV[3]  cursor
      ARGV[4]  offset
      ARGV[5]  max iterations
      ARGV[6]  fetch jobs?
    Output:
      [cursor, offset, items, numItems]
]]
local rcall = redis.call
-- Includes
--[[
  Function to achieve pagination for a set or hash.
  This function simulates pagination in the most efficient way possible
  for a set using sscan or hscan.
  The main limitation is that sets are not order preserving, so the
  pagination is not stable. This means that if the set is modified
  between pages, the same element may appear in different pages.
]] -- Maximum number of elements to be returned by sscan per iteration.
local maxCount = 100
-- Finds the cursor, and returns the first elements available for the requested page.
local function findPage(key, command, pageStart, pageSize, cursor, offset,
                        maxIterations, fetchJobs)
    local items = {}
    local jobs = {}
    local iterations = 0
    repeat
        -- Iterate over the set using sscan/hscan.
        local result = rcall(command, key, cursor, "COUNT", maxCount)
        cursor = result[1]
        local members = result[2]
        local step = 1
        if command == "HSCAN" then
            step = 2
        end
        if #members == 0 then
            -- If the result is empty, we can return the result.
            return cursor, offset, items, jobs
        end
        local chunkStart = offset
        local chunkEnd = offset + #members / step
        local pageEnd = pageStart + pageSize
        if chunkEnd < pageStart then
            -- If the chunk is before the page, we can skip it.
            offset = chunkEnd
        elseif chunkStart > pageEnd then
            -- If the chunk is after the page, we can return the result.
            return cursor, offset, items, jobs
        else
            -- If the chunk is overlapping the page, we need to add the elements to the result.
            for i = 1, #members, step do
                if offset >= pageEnd then
                    return cursor, offset, items, jobs
                end
                if offset >= pageStart then
                    local index = #items + 1
                    if fetchJobs ~= nil then
                        jobs[#jobs+1] = rcall("HGETALL", members[i])
                    end
                    if step == 2 then
                        items[index] = {members[i], members[i + 1]}
                    else
                        items[index] = members[i]
                    end
                end
                offset = offset + 1
            end
        end
        iterations = iterations + 1
    until cursor == "0" or iterations >= maxIterations
    return cursor, offset, items, jobs
end
local key = KEYS[1]
local scanCommand = "SSCAN"
local countCommand = "SCARD"
local type = rcall("TYPE", key)["ok"]
if type == "none" then
    return {0, 0, {}, 0}
elseif type == "hash" then
    scanCommand = "HSCAN"
    countCommand = "HLEN"
elseif type ~= "set" then
    return
        redis.error_reply("Pagination is only supported for sets and hashes.")
end
local numItems = rcall(countCommand, key)
local startOffset = tonumber(ARGV[1])
local endOffset = tonumber(ARGV[2])
if endOffset == -1 then 
  endOffset = numItems
end
local pageSize = (endOffset - startOffset) + 1
local cursor, offset, items, jobs = findPage(key, scanCommand, startOffset,
                                       pageSize, ARGV[3], tonumber(ARGV[4]),
                                       tonumber(ARGV[5]), ARGV[6])
return {cursor, offset, items, numItems, jobs}
`,keys:1};a.s(["paginate",0,b_],496483),a.i(496483);let b0={name:"pause",content:`--[[
  Pauses or resumes a queue globally.
  Input:
    KEYS[1] 'wait' or 'paused'
    KEYS[2] 'paused' or 'wait'
    KEYS[3] 'meta'
    KEYS[4] 'prioritized'
    KEYS[5] events stream key
    KEYS[6] 'delayed'
    KEYS[7] 'marker'
    ARGV[1] 'paused' or 'resumed'
  Event:
    publish paused or resumed event.
]]
local rcall = redis.call
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
local markerKey = KEYS[7]
local hasJobs = rcall("EXISTS", KEYS[1]) == 1
--TODO: check this logic to be reused when changing a delay
if hasJobs then rcall("RENAME", KEYS[1], KEYS[2]) end
if ARGV[1] == "paused" then
    rcall("HSET", KEYS[3], "paused", 1)
    rcall("DEL", markerKey)
else
    rcall("HDEL", KEYS[3], "paused")
    if hasJobs or rcall("ZCARD", KEYS[4]) > 0 then
        -- Add marker if there are waiting or priority jobs
        rcall("ZADD", markerKey, 0, "0")
    else
        addDelayMarkerIfNeeded(markerKey, KEYS[6])
    end
end
rcall("XADD", KEYS[5], "*", "event", ARGV[1]);
`,keys:7};a.s(["pause",0,b0],179557),a.i(179557);let b1={name:"promote",content:`--[[
  Promotes a job that is currently "delayed" to the "waiting" state
    Input:
      KEYS[1] 'delayed'
      KEYS[2] 'wait'
      KEYS[3] 'paused'
      KEYS[4] 'meta'
      KEYS[5] 'prioritized'
      KEYS[6] 'active'
      KEYS[7] 'pc' priority counter
      KEYS[8] 'event stream'
      KEYS[9] 'marker'
      ARGV[1]  queue.toKey('')
      ARGV[2]  jobId
    Output:
       0 - OK
      -3 - Job not in delayed zset.
    Events:
      'waiting'
]]
local rcall = redis.call
local jobId = ARGV[2]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
if rcall("ZREM", KEYS[1], jobId) == 1 then
    local jobKey = ARGV[1] .. jobId
    local priority = tonumber(rcall("HGET", jobKey, "priority")) or 0
    local metaKey = KEYS[4]
    local markerKey = KEYS[9]
    -- Remove delayed "marker" from the wait list if there is any.
    -- Since we are adding a job we do not need the marker anymore.
    -- Markers in waitlist DEPRECATED in v5: Remove in v6.
    local target, isPausedOrMaxed = getTargetQueueList(metaKey, KEYS[6], KEYS[2], KEYS[3])
    local marker = rcall("LINDEX", target, 0)
    if marker and string.sub(marker, 1, 2) == "0:" then rcall("LPOP", target) end
    if priority == 0 then
        -- LIFO or FIFO
        addJobInTargetList(target, markerKey, "LPUSH", isPausedOrMaxed, jobId)
    else
        addJobWithPriority(markerKey, KEYS[5], priority, jobId, KEYS[7], isPausedOrMaxed)
    end
    rcall("XADD", KEYS[8], "*", "event", "waiting", "jobId", jobId, "prev",
          "delayed");
    rcall("HSET", jobKey, "delay", 0)
    return 0
else
    return -3
end
`,keys:9};a.s(["promote",0,b1],655700),a.i(655700);let b2={name:"releaseLock",content:`--[[
  Release lock
    Input:
      KEYS[1] 'lock',
      ARGV[1]  token
      ARGV[2]  lock duration in milliseconds
    Output:
      "OK" if lock extended successfully.
]]
local rcall = redis.call
if rcall("GET", KEYS[1]) == ARGV[1] then
  return rcall("DEL", KEYS[1])
else
  return 0
end
`,keys:1};a.s(["releaseLock",0,b2],889848),a.i(889848);let b3={name:"removeChildDependency",content:`--[[
  Break parent-child dependency by removing
  child reference from parent
  Input:
    KEYS[1] 'key' prefix,
    ARGV[1] job key
    ARGV[2] parent key
    Output:
       0  - OK
       1  - There is not relationship.
      -1  - Missing job key
      -5  - Missing parent key
]]
local rcall = redis.call
local jobKey = ARGV[1]
local parentKey = ARGV[2]
-- Includes
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
if rcall("EXISTS", jobKey) ~= 1 then return -1 end
if rcall("EXISTS", parentKey) ~= 1 then return -5 end
if removeParentDependencyKey(jobKey, false, parentKey, KEYS[1], nil) then
  rcall("HDEL", jobKey, "parentKey", "parent")
  return 0
else
  return 1
end`,keys:1};a.s(["removeChildDependency",0,b3],30225),a.i(30225);let b4={name:"removeDeduplicationKey",content:`--[[
  Remove deduplication key if it matches the job id.
  Input:
    KEYS[1] deduplication key
    ARGV[1] job id
  Output:
    0 - false
    1 - true
]]
local rcall = redis.call
local deduplicationKey = KEYS[1]
local jobId = ARGV[1]
local currentJobId = rcall('GET', deduplicationKey)
if currentJobId and currentJobId == jobId then
  return rcall("DEL", deduplicationKey)
end
return 0
`,keys:1};a.s(["removeDeduplicationKey",0,b4],23851),a.i(23851);let b5={name:"removeJob",content:`--[[
    Remove a job from all the statuses it may be in as well as all its data.
    In order to be able to remove a job, it cannot be active.
    Input:
      KEYS[1] jobKey
      KEYS[2] repeat key
      ARGV[1] jobId
      ARGV[2] remove children
      ARGV[3] queue prefix
    Events:
      'removed'
]]
local rcall = redis.call
-- Includes
--[[
  Function to check if the job belongs to a job scheduler and
  current delayed job matches with jobId
]]
local function isJobSchedulerJob(jobId, jobKey, jobSchedulersKey)
  local repeatJobKey = rcall("HGET", jobKey, "rjk")
  if repeatJobKey  then
    local prevMillis = rcall("ZSCORE", jobSchedulersKey, repeatJobKey)
    if prevMillis then
      local currentDelayedJobId = "repeat:" .. repeatJobKey .. ":" .. prevMillis
      return jobId == currentDelayedJobId
    end
  end
  return false
end
--[[
  Function to recursively check if there are no locks
  on the jobs to be removed.
  returns:
    boolean
]]
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
local function isLocked( prefix, jobId, removeChildren)
  local jobKey = prefix .. jobId;
  -- Check if this job is locked
  local lockKey = jobKey .. ':lock'
  local lock = rcall("GET", lockKey)
  if not lock then
    if removeChildren == "1" then
      local dependencies = rcall("SMEMBERS", jobKey .. ":dependencies")
      if (#dependencies > 0) then
        for i, childJobKey in ipairs(dependencies) do
          -- We need to get the jobId for this job.
          local childJobId = getJobIdFromKey(childJobKey)
          local childJobPrefix = getJobKeyPrefix(childJobKey, childJobId)
          local result = isLocked( childJobPrefix, childJobId, removeChildren )
          if result then
            return true
          end
        end
      end
    end
    return false
  end
  return true
end
--[[
    Remove a job from all the statuses it may be in as well as all its data,
    including its children. Active children can be ignored.
    Events:
      'removed'
]]
local rcall = redis.call
-- Includes
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobId, deduplicationId)
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      rcall("DEL", deduplicationKey)
      -- Also clean up any pending dedup-next data for this dedup ID
      rcall("DEL", prefixKey .. "dn:" .. deduplicationId)
      return 1
    end
  end
end
--[[
  Function to remove from any state.
  returns:
    prev state
]]
local function removeJobFromAnyState( prefix, jobId)
  -- We start with the ZSCORE checks, since they have O(1) complexity
  if rcall("ZSCORE", prefix .. "completed", jobId) then
    rcall("ZREM", prefix .. "completed", jobId)
    return "completed"
  elseif rcall("ZSCORE", prefix .. "waiting-children", jobId) then
    rcall("ZREM", prefix .. "waiting-children", jobId)
    return "waiting-children"
  elseif rcall("ZSCORE", prefix .. "delayed", jobId) then
    rcall("ZREM", prefix .. "delayed", jobId)
    return "delayed"
  elseif rcall("ZSCORE", prefix .. "failed", jobId) then
    rcall("ZREM", prefix .. "failed", jobId)
    return "failed"
  elseif rcall("ZSCORE", prefix .. "prioritized", jobId) then
    rcall("ZREM", prefix .. "prioritized", jobId)
    return "prioritized"
  -- We remove only 1 element from the list, since we assume they are not added multiple times
  elseif rcall("LREM", prefix .. "wait", 1, jobId) == 1 then
    return "wait"
  elseif rcall("LREM", prefix .. "paused", 1, jobId) == 1 then
    return "paused"
  elseif rcall("LREM", prefix .. "active", 1, jobId) == 1 then
    return "active"
  end
  return "unknown"
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local removeJobChildren
local removeJobWithChildren
removeJobChildren = function(prefix, jobKey, options)
    -- Check if this job has children
    -- If so, we are going to try to remove the children recursively in a depth-first way
    -- because if some job is locked, we must exit with an error.
    if not options.ignoreProcessed then
        local processed = rcall("HGETALL", jobKey .. ":processed")
        if #processed > 0 then
            for i = 1, #processed, 2 do
                local childJobId = getJobIdFromKey(processed[i])
                local childJobPrefix = getJobKeyPrefix(processed[i], childJobId)
                removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
            end
        end
        local failed = rcall("HGETALL", jobKey .. ":failed")
        if #failed > 0 then
            for i = 1, #failed, 2 do
                local childJobId = getJobIdFromKey(failed[i])
                local childJobPrefix = getJobKeyPrefix(failed[i], childJobId)
                removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
            end
        end
        local unsuccessful = rcall("ZRANGE", jobKey .. ":unsuccessful", 0, -1)
        if #unsuccessful > 0 then
            for i = 1, #unsuccessful, 1 do
                local childJobId = getJobIdFromKey(unsuccessful[i])
                local childJobPrefix = getJobKeyPrefix(unsuccessful[i], childJobId)
                removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
            end
        end
    end
    local dependencies = rcall("SMEMBERS", jobKey .. ":dependencies")
    if #dependencies > 0 then
        for i, childJobKey in ipairs(dependencies) do
            local childJobId = getJobIdFromKey(childJobKey)
            local childJobPrefix = getJobKeyPrefix(childJobKey, childJobId)
            removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
        end
    end
end
removeJobWithChildren = function(prefix, jobId, parentKey, options)
    local jobKey = prefix .. jobId
    if options.ignoreLocked then
        if isLocked(prefix, jobId) then
            return
        end
    end
    -- Check if job is in the failed zset
    local failedSet = prefix .. "failed"
    if not (options.ignoreProcessed and rcall("ZSCORE", failedSet, jobId)) then
        removeParentDependencyKey(jobKey, false, parentKey, nil)
        if options.removeChildren then
            removeJobChildren(prefix, jobKey, options)
        end
        local prev = removeJobFromAnyState(prefix, jobId)
        local deduplicationId = rcall("HGET", jobKey, "deid")
        removeDeduplicationKeyIfNeededOnRemoval(prefix, jobId, deduplicationId)
        if removeJobKeys(jobKey) > 0 then
            local metaKey = prefix .. "meta"
            local maxEvents = getOrSetMaxEvents(metaKey)
            rcall("XADD", prefix .. "events", "MAXLEN", "~", maxEvents, "*", "event", "removed",
                "jobId", jobId, "prev", prev)
        end
    end
end
local jobId = ARGV[1]
local shouldRemoveChildren = ARGV[2]
local prefix = ARGV[3]
local jobKey = KEYS[1]
local repeatKey = KEYS[2]
if isJobSchedulerJob(jobId, jobKey, repeatKey) then
    return -8
end
if not isLocked(prefix, jobId, shouldRemoveChildren) then
    local options = {
        removeChildren = shouldRemoveChildren == "1",
        ignoreProcessed = false,
        ignoreLocked = false
    }
    removeJobWithChildren(prefix, jobId, nil, options)
    return 1
end
return 0
`,keys:2};a.s(["removeJob",0,b5],729224),a.i(729224);let b6={name:"removeJobScheduler",content:`--[[
  Removes a job scheduler and its next scheduled job.
  Input:
    KEYS[1] job schedulers key
    KEYS[2] delayed jobs key
    KEYS[3] events key
    ARGV[1] job scheduler id
    ARGV[2] prefix key
  Output:
    0 - OK
    1 - Missing repeat job
  Events:
    'removed'
]]
local rcall = redis.call
-- Includes
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
local jobSchedulerId = ARGV[1]
local prefix = ARGV[2]
local millis = rcall("ZSCORE", KEYS[1], jobSchedulerId)
if millis then
  -- Delete next programmed job.
  local delayedJobId = "repeat:" .. jobSchedulerId .. ":" .. millis
  if(rcall("ZREM", KEYS[2], delayedJobId) == 1) then
    removeJobKeys(prefix .. delayedJobId)
    rcall("XADD", KEYS[3], "*", "event", "removed", "jobId", delayedJobId, "prev", "delayed")
  end
end
if(rcall("ZREM", KEYS[1], jobSchedulerId) == 1) then
  rcall("DEL", KEYS[1] .. ":" .. jobSchedulerId)
  return 0
end
return 1
`,keys:3};a.s(["removeJobScheduler",0,b6],104328),a.i(104328);let b7={name:"removeOrphanedJobs",content:`--[[
  Removes orphaned job keys that exist in Redis but are not referenced
  in any queue state set. Checks each candidate atomically.
  Input:
    KEYS[1]  base prefix key including trailing colon (e.g. bull:queueName:)
    ARGV[1]  number of state key suffixes
    ARGV[2 .. 1+N]  state key suffixes (e.g. active, wait, completed, ...)
    ARGV[2+N]  number of job sub-key suffixes
    ARGV[3+N .. 2+N+M]  job sub-key suffixes (e.g. logs, dependencies, ...)
    ARGV[3+N+M .. end]  candidate job IDs to check
  Output:
    number of removed jobs
]]
local rcall = redis.call
local basePrefix = KEYS[1]
-- Parse state key suffixes and cache their full key names + types.
local stateKeyCount = tonumber(ARGV[1])
local stateKeys = {}
local stateKeyTypes = {}
for i = 1, stateKeyCount do
  local fullKey = basePrefix .. ARGV[1 + i]
  stateKeys[i] = fullKey
  stateKeyTypes[i] = rcall('TYPE', fullKey)['ok']
end
-- Parse job sub-key suffixes.
local subKeyCountIdx = 2 + stateKeyCount
local subKeyCount = tonumber(ARGV[subKeyCountIdx])
local subKeySuffixes = {}
for i = 1, subKeyCount do
  subKeySuffixes[i] = ARGV[subKeyCountIdx + i]
end
-- Process candidate job IDs.
local candidateStart = subKeyCountIdx + subKeyCount + 1
local removedCount = 0
for c = candidateStart, #ARGV do
  local jobId = ARGV[c]
  local found = false
  for i = 1, stateKeyCount do
    local kt = stateKeyTypes[i]
    if kt == 'list' then
      if rcall('LPOS', stateKeys[i], jobId) then
        found = true
        break
      end
    elseif kt == 'zset' then
      if rcall('ZSCORE', stateKeys[i], jobId) then
        found = true
        break
      end
    elseif kt == 'set' then
      if rcall('SISMEMBER', stateKeys[i], jobId) == 1 then
        found = true
        break
      end
    end
  end
  if not found then
    local jobKey = basePrefix .. jobId
    local keysToDelete = { jobKey }
    for _, suffix in ipairs(subKeySuffixes) do
      keysToDelete[#keysToDelete + 1] = jobKey .. ':' .. suffix
    end
    rcall('DEL', unpack(keysToDelete))
    removedCount = removedCount + 1
  end
end
return removedCount
`,keys:1};a.s(["removeOrphanedJobs",0,b7],569352),a.i(569352);let b8={name:"removeRepeatable",content:`--[[
  Removes a repeatable job
  Input:
    KEYS[1] repeat jobs key
    KEYS[2] delayed jobs key
    KEYS[3] events key
    ARGV[1] old repeat job id
    ARGV[2] options concat
    ARGV[3] repeat job key
    ARGV[4] prefix key
  Output:
    0 - OK
    1 - Missing repeat job
  Events:
    'removed'
]]
local rcall = redis.call
local millis = rcall("ZSCORE", KEYS[1], ARGV[2])
-- Includes
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
-- legacy removal TODO: remove in next breaking change
if millis then
  -- Delete next programmed job.
  local repeatJobId = ARGV[1] .. millis
  if(rcall("ZREM", KEYS[2], repeatJobId) == 1) then
    removeJobKeys(ARGV[4] .. repeatJobId)
    rcall("XADD", KEYS[3], "*", "event", "removed", "jobId", repeatJobId, "prev", "delayed");
  end
end
if(rcall("ZREM", KEYS[1], ARGV[2]) == 1) then
  return 0
end
-- new removal
millis = rcall("ZSCORE", KEYS[1], ARGV[3])
if millis then
  -- Delete next programmed job.
  local repeatJobId = "repeat:" .. ARGV[3] .. ":" .. millis
  if(rcall("ZREM", KEYS[2], repeatJobId) == 1) then
    removeJobKeys(ARGV[4] .. repeatJobId)
    rcall("XADD", KEYS[3], "*", "event", "removed", "jobId", repeatJobId, "prev", "delayed")
  end
end
if(rcall("ZREM", KEYS[1], ARGV[3]) == 1) then
  rcall("DEL", KEYS[1] .. ":" .. ARGV[3])
  return 0
end
return 1
`,keys:3};a.s(["removeRepeatable",0,b8],438973),a.i(438973);let b9={name:"removeUnprocessedChildren",content:`--[[
    Remove a job from all the statuses it may be in as well as all its data.
    In order to be able to remove a job, it cannot be active.
    Input:
      KEYS[1] jobKey
      KEYS[2] meta key
      ARGV[1] prefix
      ARGV[2] jobId
    Events:
      'removed' for every children removed
]]
-- Includes
--[[
    Remove a job from all the statuses it may be in as well as all its data,
    including its children. Active children can be ignored.
    Events:
      'removed'
]]
local rcall = redis.call
-- Includes
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check if the job belongs to a job scheduler and
  current delayed job matches with jobId
]]
local function isJobSchedulerJob(jobId, jobKey, jobSchedulersKey)
  local repeatJobKey = rcall("HGET", jobKey, "rjk")
  if repeatJobKey  then
    local prevMillis = rcall("ZSCORE", jobSchedulersKey, repeatJobKey)
    if prevMillis then
      local currentDelayedJobId = "repeat:" .. repeatJobKey .. ":" .. prevMillis
      return jobId == currentDelayedJobId
    end
  end
  return false
end
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobId, deduplicationId)
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      rcall("DEL", deduplicationKey)
      -- Also clean up any pending dedup-next data for this dedup ID
      rcall("DEL", prefixKey .. "dn:" .. deduplicationId)
      return 1
    end
  end
end
--[[
  Function to remove from any state.
  returns:
    prev state
]]
local function removeJobFromAnyState( prefix, jobId)
  -- We start with the ZSCORE checks, since they have O(1) complexity
  if rcall("ZSCORE", prefix .. "completed", jobId) then
    rcall("ZREM", prefix .. "completed", jobId)
    return "completed"
  elseif rcall("ZSCORE", prefix .. "waiting-children", jobId) then
    rcall("ZREM", prefix .. "waiting-children", jobId)
    return "waiting-children"
  elseif rcall("ZSCORE", prefix .. "delayed", jobId) then
    rcall("ZREM", prefix .. "delayed", jobId)
    return "delayed"
  elseif rcall("ZSCORE", prefix .. "failed", jobId) then
    rcall("ZREM", prefix .. "failed", jobId)
    return "failed"
  elseif rcall("ZSCORE", prefix .. "prioritized", jobId) then
    rcall("ZREM", prefix .. "prioritized", jobId)
    return "prioritized"
  -- We remove only 1 element from the list, since we assume they are not added multiple times
  elseif rcall("LREM", prefix .. "wait", 1, jobId) == 1 then
    return "wait"
  elseif rcall("LREM", prefix .. "paused", 1, jobId) == 1 then
    return "paused"
  elseif rcall("LREM", prefix .. "active", 1, jobId) == 1 then
    return "active"
  end
  return "unknown"
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
--[[
  Function to recursively check if there are no locks
  on the jobs to be removed.
  returns:
    boolean
]]
local function isLocked( prefix, jobId, removeChildren)
  local jobKey = prefix .. jobId;
  -- Check if this job is locked
  local lockKey = jobKey .. ':lock'
  local lock = rcall("GET", lockKey)
  if not lock then
    if removeChildren == "1" then
      local dependencies = rcall("SMEMBERS", jobKey .. ":dependencies")
      if (#dependencies > 0) then
        for i, childJobKey in ipairs(dependencies) do
          -- We need to get the jobId for this job.
          local childJobId = getJobIdFromKey(childJobKey)
          local childJobPrefix = getJobKeyPrefix(childJobKey, childJobId)
          local result = isLocked( childJobPrefix, childJobId, removeChildren )
          if result then
            return true
          end
        end
      end
    end
    return false
  end
  return true
end
local removeJobChildren
local removeJobWithChildren
removeJobChildren = function(prefix, jobKey, options)
    -- Check if this job has children
    -- If so, we are going to try to remove the children recursively in a depth-first way
    -- because if some job is locked, we must exit with an error.
    if not options.ignoreProcessed then
        local processed = rcall("HGETALL", jobKey .. ":processed")
        if #processed > 0 then
            for i = 1, #processed, 2 do
                local childJobId = getJobIdFromKey(processed[i])
                local childJobPrefix = getJobKeyPrefix(processed[i], childJobId)
                removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
            end
        end
        local failed = rcall("HGETALL", jobKey .. ":failed")
        if #failed > 0 then
            for i = 1, #failed, 2 do
                local childJobId = getJobIdFromKey(failed[i])
                local childJobPrefix = getJobKeyPrefix(failed[i], childJobId)
                removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
            end
        end
        local unsuccessful = rcall("ZRANGE", jobKey .. ":unsuccessful", 0, -1)
        if #unsuccessful > 0 then
            for i = 1, #unsuccessful, 1 do
                local childJobId = getJobIdFromKey(unsuccessful[i])
                local childJobPrefix = getJobKeyPrefix(unsuccessful[i], childJobId)
                removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
            end
        end
    end
    local dependencies = rcall("SMEMBERS", jobKey .. ":dependencies")
    if #dependencies > 0 then
        for i, childJobKey in ipairs(dependencies) do
            local childJobId = getJobIdFromKey(childJobKey)
            local childJobPrefix = getJobKeyPrefix(childJobKey, childJobId)
            removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
        end
    end
end
removeJobWithChildren = function(prefix, jobId, parentKey, options)
    local jobKey = prefix .. jobId
    if options.ignoreLocked then
        if isLocked(prefix, jobId) then
            return
        end
    end
    -- Check if job is in the failed zset
    local failedSet = prefix .. "failed"
    if not (options.ignoreProcessed and rcall("ZSCORE", failedSet, jobId)) then
        removeParentDependencyKey(jobKey, false, parentKey, nil)
        if options.removeChildren then
            removeJobChildren(prefix, jobKey, options)
        end
        local prev = removeJobFromAnyState(prefix, jobId)
        local deduplicationId = rcall("HGET", jobKey, "deid")
        removeDeduplicationKeyIfNeededOnRemoval(prefix, jobId, deduplicationId)
        if removeJobKeys(jobKey) > 0 then
            local metaKey = prefix .. "meta"
            local maxEvents = getOrSetMaxEvents(metaKey)
            rcall("XADD", prefix .. "events", "MAXLEN", "~", maxEvents, "*", "event", "removed",
                "jobId", jobId, "prev", prev)
        end
    end
end
local prefix = ARGV[1]
local jobId = ARGV[2]
local jobKey = KEYS[1]
local metaKey = KEYS[2]
local options = {
  removeChildren = "1",
  ignoreProcessed = true,
  ignoreLocked = true
}
removeJobChildren(prefix, jobKey, options) 
`,keys:2};a.s(["removeUnprocessedChildren",0,b9],451367),a.i(451367);let ca={name:"reprocessJob",content:`--[[
  Attempts to reprocess a job
  Input:
    KEYS[1] job key
    KEYS[2] events stream
    KEYS[3] job state
    KEYS[4] wait key
    KEYS[5] meta
    KEYS[6] paused key
    KEYS[7] active key
    KEYS[8] marker key
    ARGV[1] job.id
    ARGV[2] (job.opts.lifo ? 'R' : 'L') + 'PUSH'
    ARGV[3] propVal - failedReason/returnvalue
    ARGV[4] prev state - failed/completed
    ARGV[5] reset attemptsMade - "1" or "0"
    ARGV[6] reset attemptsStarted - "1" or "0"
  Output:
     1 means the operation was a success
    -1 means the job does not exist
    -3 means the job was not found in the expected set.
]]
local rcall = redis.call;
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local jobKey = KEYS[1]
if rcall("EXISTS", jobKey) == 1 then
  local jobId = ARGV[1]
  if (rcall("ZREM", KEYS[3], jobId) == 1) then
    local attributesToRemove = {}
    if ARGV[5] == "1" then
      table.insert(attributesToRemove, "atm")
    end
    if ARGV[6] == "1" then
      table.insert(attributesToRemove, "ats")
    end
    rcall("HDEL", jobKey, "finishedOn", "processedOn", ARGV[3], unpack(attributesToRemove))
    local target, isPausedOrMaxed = getTargetQueueList(KEYS[5], KEYS[7], KEYS[4], KEYS[6])
    addJobInTargetList(target, KEYS[8], ARGV[2], isPausedOrMaxed, jobId)
    local parentKey = rcall("HGET", jobKey, "parentKey")
    if parentKey and rcall("EXISTS", parentKey) == 1 then
      if ARGV[4] == "failed" then
        if rcall("ZREM", parentKey .. ":unsuccessful", jobKey) == 1 or
          rcall("HDEL", parentKey .. ":failed", jobKey) == 1 then
          rcall("SADD", parentKey .. ":dependencies", jobKey)
        end
      else
        if rcall("HDEL", parentKey .. ":processed", jobKey) == 1 then
          rcall("SADD", parentKey .. ":dependencies", jobKey)
        end
      end
    end
    local maxEvents = getOrSetMaxEvents(KEYS[5])
    -- Emit waiting event
    rcall("XADD", KEYS[2], "MAXLEN", "~", maxEvents, "*", "event", "waiting",
      "jobId", jobId, "prev", ARGV[4]);
    return 1
  else
    return -3
  end
else
  return -1
end
`,keys:8};a.s(["reprocessJob",0,ca],354587),a.i(354587);let cb={name:"retryJob",content:`--[[
  Retries a failed job by moving it back to the wait queue.
    Input:
      KEYS[1]  'active',
      KEYS[2]  'wait'
      KEYS[3]  'paused'
      KEYS[4]  job key
      KEYS[5]  'meta'
      KEYS[6]  events stream
      KEYS[7]  delayed key
      KEYS[8]  prioritized key
      KEYS[9]  'pc' priority counter
      KEYS[10] 'marker'
      KEYS[11] 'stalled'
      ARGV[1]  key prefix
      ARGV[2]  timestamp
      ARGV[3]  pushCmd
      ARGV[4]  jobId
      ARGV[5]  token
      ARGV[6]  optional job fields to update
    Events:
      'waiting'
    Output:
     0  - OK
     -1 - Missing key
     -2 - Missing lock
     -3 - Job not in active set
]]
local rcall = redis.call
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to check if queue is paused or maxed
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePausedOrMaxed(queueMetaKey, activeKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency")
  if queueAttributes[1] then
    return true
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      return activeCount >= tonumber(queueAttributes[2])
    end
  end
  return false
end
--[[
  Updates the delay set, by moving delayed jobs that should
  be processed now to "wait".
     Events:
      'waiting'
]]
-- Includes
-- Try to get as much as 1000 jobs at once
local function promoteDelayedJobs(delayedKey, markerKey, targetKey, prioritizedKey,
                                  eventStreamKey, prefix, timestamp, priorityCounterKey, isPaused)
    local jobs = rcall("ZRANGEBYSCORE", delayedKey, 0, (timestamp + 1) * 0x1000 - 1, "LIMIT", 0, 1000)
    if (#jobs > 0) then
        rcall("ZREM", delayedKey, unpack(jobs))
        for _, jobId in ipairs(jobs) do
            local jobKey = prefix .. jobId
            local priority =
                tonumber(rcall("HGET", jobKey, "priority")) or 0
            if priority == 0 then
                -- LIFO or FIFO
                rcall("LPUSH", targetKey, jobId)
            else
                local score = getPriorityScore(priority, priorityCounterKey)
                rcall("ZADD", prioritizedKey, score, jobId)
            end
            -- Emit waiting event
            rcall("XADD", eventStreamKey, "*", "event", "waiting", "jobId",
                  jobId, "prev", "delayed")
            rcall("HSET", jobKey, "delay", 0)
        end
        addBaseMarkerIfNeeded(markerKey, isPaused)
    end
end
local function removeLock(jobKey, stalledKey, token, jobId)
  if token ~= "0" then
    local lockKey = jobKey .. ':lock'
    local lockToken = rcall("GET", lockKey)
    if lockToken == token then
      rcall("DEL", lockKey)
      rcall("SREM", stalledKey, jobId)
    else
      if lockToken then
        -- Lock exists but token does not match
        return -6
      else
        -- Lock is missing completely
        return -2
      end
    end
  end
  return 0
end
--[[
  Function to update a bunch of fields in a job.
]]
local function updateJobFields(jobKey, msgpackedFields)
  if msgpackedFields and #msgpackedFields > 0 then
    local fieldsToUpdate = cmsgpack.unpack(msgpackedFields)
    if fieldsToUpdate then
      rcall("HMSET", jobKey, unpack(fieldsToUpdate))
    end
  end
end
local target, isPausedOrMaxed = getTargetQueueList(KEYS[5], KEYS[1], KEYS[2], KEYS[3])
local markerKey = KEYS[10]
-- Check if there are delayed jobs that we can move to wait.
-- test example: when there are delayed jobs between retries
promoteDelayedJobs(KEYS[7], markerKey, target, KEYS[8], KEYS[6], ARGV[1], ARGV[2], KEYS[9], isPausedOrMaxed)
local jobKey = KEYS[4]
if rcall("EXISTS", jobKey) == 1 then
  local errorCode = removeLock(jobKey, KEYS[11], ARGV[5], ARGV[4]) 
  if errorCode < 0 then
    return errorCode
  end
  updateJobFields(jobKey, ARGV[6])
  local numRemovedElements = rcall("LREM", KEYS[1], -1, ARGV[4])
  if (numRemovedElements < 1) then return -3 end
  local priority = tonumber(rcall("HGET", jobKey, "priority")) or 0
  --need to re-evaluate after removing job from active
  isPausedOrMaxed = isQueuePausedOrMaxed(KEYS[5], KEYS[1])
  -- Standard or priority add
  if priority == 0 then
    addJobInTargetList(target, markerKey, ARGV[3], isPausedOrMaxed, ARGV[4])
  else
    addJobWithPriority(markerKey, KEYS[8], priority, ARGV[4], KEYS[9], isPausedOrMaxed)
  end
  rcall("HINCRBY", jobKey, "atm", 1)
  local maxEvents = getOrSetMaxEvents(KEYS[5])
  -- Emit waiting event
  rcall("XADD", KEYS[6], "MAXLEN", "~", maxEvents, "*", "event", "waiting",
    "jobId", ARGV[4], "prev", "active")
  return 0
else
  return -1
end
`,keys:11};a.s(["retryJob",0,cb],552428),a.i(552428);let cc={name:"saveStacktrace",content:`--[[
  Save stacktrace and failedReason.
  Input:
    KEYS[1] job key
    ARGV[1]  stacktrace
    ARGV[2]  failedReason
  Output:
     0 - OK
    -1 - Missing key
]]
local rcall = redis.call
if rcall("EXISTS", KEYS[1]) == 1 then
  rcall("HMSET", KEYS[1], "stacktrace", ARGV[1], "failedReason", ARGV[2])
  return 0
else
  return -1
end
`,keys:1};a.s(["saveStacktrace",0,cc],915353),a.i(915353);let cd={name:"updateData",content:`--[[
  Update job data
  Input:
    KEYS[1] Job id key
    ARGV[1] data
  Output:
    0 - OK
   -1 - Missing job.
]]
local rcall = redis.call
if rcall("EXISTS",KEYS[1]) == 1 then -- // Make sure job exists
  rcall("HSET", KEYS[1], "data", ARGV[1])
  return 0
else
  return -1
end
`,keys:1};a.s(["updateData",0,cd],936009),a.i(936009);let ce={name:"updateJobScheduler",content:`--[[
  Updates a job scheduler and adds next delayed job
  Input:
    KEYS[1]  'repeat' key
    KEYS[2]  'delayed'
    KEYS[3]  'wait' key
    KEYS[4]  'paused' key
    KEYS[5]  'meta'
    KEYS[6]  'prioritized' key
    KEYS[7]  'marker',
    KEYS[8]  'id'
    KEYS[9]  events stream key
    KEYS[10] 'pc' priority counter
    KEYS[11] producer key
    KEYS[12] 'active' key
    ARGV[1] next milliseconds
    ARGV[2] jobs scheduler id
    ARGV[3] Json stringified delayed data
    ARGV[4] msgpacked delayed opts
    ARGV[5] timestamp
    ARGV[6] prefix key
    ARGV[7] producer id
    Output:
      next delayed job id  - OK
]] local rcall = redis.call
local repeatKey = KEYS[1]
local delayedKey = KEYS[2]
local waitKey = KEYS[3]
local pausedKey = KEYS[4]
local metaKey = KEYS[5]
local prioritizedKey = KEYS[6]
local nextMillis = tonumber(ARGV[1])
local jobSchedulerId = ARGV[2]
local timestamp = tonumber(ARGV[5])
local prefixKey = ARGV[6]
local producerId = ARGV[7]
local jobOpts = cmsgpack.unpack(ARGV[4])
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Shared helper to store a job and enqueue it into the appropriate list/set.
  Handles delayed, prioritized, and standard (LIFO/FIFO) jobs.
  Emits the appropriate event after enqueuing ("delayed" or "waiting").
  Returns delay, priority from storeJob.
]]
-- Includes
--[[
  Adds a delayed job to the queue by doing the following:
    - Creates a new job key with the job data.
    - adds to delayed zset.
    - Emits a global event 'delayed' if the job is delayed.
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Bake in the job id first 12 bits into the timestamp
  to guarantee correct execution order of delayed jobs
  (up to 4096 jobs per given timestamp or 4096 jobs apart per timestamp)
  WARNING: Jobs that are so far apart that they wrap around will cause FIFO to fail
]]
local function getDelayedScore(delayedKey, timestamp, delay)
  local delayedTimestamp = (delay > 0 and (tonumber(timestamp) + delay)) or tonumber(timestamp)
  local minScore = delayedTimestamp * 0x1000
  local maxScore = (delayedTimestamp + 1 ) * 0x1000 - 1
  local result = rcall("ZREVRANGEBYSCORE", delayedKey, maxScore,
    minScore, "WITHSCORES","LIMIT", 0, 1)
  if #result then
    local currentMaxScore = tonumber(result[2])
    if currentMaxScore ~= nil then
      if currentMaxScore >= maxScore then
        return maxScore, delayedTimestamp
      else
        return currentMaxScore + 1, delayedTimestamp
      end
    end
  end
  return minScore, delayedTimestamp
end
local function addDelayedJob(jobId, delayedKey, eventsKey, timestamp,
  maxEvents, markerKey, delay)
  local score, delayedTimestamp = getDelayedScore(delayedKey, timestamp, tonumber(delay))
  rcall("ZADD", delayedKey, score, jobId)
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "delayed",
    "jobId", jobId, "delay", delayedTimestamp)
  -- mark that a delayed job is available
  addDelayMarkerIfNeeded(markerKey, delayedKey)
end
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
local function storeAndEnqueueJob(eventsKey, jobIdKey, jobId, name, data, opts,
    timestamp, parentKey, parentData, repeatJobKey, maxEvents,
    waitKey, pausedKey, activeKey, metaKey, prioritizedKey,
    priorityCounterKey, delayedKey, markerKey)
  local delay, priority = storeJob(eventsKey, jobIdKey, jobId, name, data,
      opts, timestamp, parentKey, parentData, repeatJobKey)
  if delay ~= 0 and delayedKey then
    addDelayedJob(jobId, delayedKey, eventsKey, timestamp, maxEvents, markerKey, delay)
  else
    local target, isPausedOrMaxed = getTargetQueueList(metaKey, activeKey, waitKey, pausedKey)
    if priority > 0 then
      addJobWithPriority(markerKey, prioritizedKey, priority, jobId,
          priorityCounterKey, isPausedOrMaxed)
    else
      local pushCmd = opts['lifo'] and 'RPUSH' or 'LPUSH'
      addJobInTargetList(target, markerKey, pushCmd, isPausedOrMaxed, jobId)
    end
    rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "waiting",
        "jobId", jobId)
  end
  return delay, priority
end
local function addJobFromScheduler(jobKey, jobId, opts, waitKey, pausedKey, activeKey, metaKey, 
  prioritizedKey, priorityCounter, delayedKey, markerKey, eventsKey, name, maxEvents, timestamp,
  data, jobSchedulerId, repeatDelay)
  opts['delay'] = repeatDelay
  opts['jobId'] = jobId
  storeAndEnqueueJob(eventsKey, jobKey, jobId, name, data, opts,
      timestamp, nil, nil, jobSchedulerId, maxEvents,
      waitKey, pausedKey, activeKey, metaKey, prioritizedKey,
      priorityCounter, delayedKey, markerKey)
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
local function getJobSchedulerEveryNextMillis(prevMillis, every, now, offset, startDate)
    offset = tonumber(offset)
    local nextMillis
    if not prevMillis then
        if startDate then
            -- Assuming startDate is passed as milliseconds from JavaScript
            nextMillis = tonumber(startDate)
            nextMillis = nextMillis > now and nextMillis or now
        else
            if offset and offset > 0 then
                -- Align to the next slot that respects the offset
                nextMillis = math.floor(now / every) * every + offset
                if nextMillis <= now then
                    nextMillis = nextMillis + every
                end
            else
                nextMillis = now
            end
        end
    else
        nextMillis = prevMillis + every
        -- check if we may have missed some iterations
        if nextMillis < now then
            -- Use the same offset-aware alignment as the initial branch
            -- above so a non-zero offset is preserved across catch-ups
            -- instead of being flattened to (slot + every). When the
            -- aligned slot is itself still in the past, advance by one
            -- full interval; otherwise the aligned slot is the next
            -- iteration.
            local aligned = math.floor(now / every) * every + (offset or 0)
            if aligned <= now then
                nextMillis = aligned + every
            else
                nextMillis = aligned
            end
        end
    end
    if not offset or offset == 0 then
        local timeSlot = math.floor(nextMillis / every) * every;
        offset = nextMillis - timeSlot;
    end
    -- Return a tuple nextMillis, offset
    return math.floor(nextMillis), math.floor(offset)
end
local prevMillis = rcall("ZSCORE", repeatKey, jobSchedulerId)
-- Validate that scheduler exists.
-- If it does not exist we should not iterate anymore.
if prevMillis then
    prevMillis = tonumber(prevMillis)
    local schedulerKey = repeatKey .. ":" .. jobSchedulerId
    local schedulerAttributes = rcall("HMGET", schedulerKey, "name", "data", "every", "startDate", "offset")
    local every = tonumber(schedulerAttributes[3])
    local now = tonumber(timestamp)
    -- If every is not found in scheduler attributes, try to get it from job options
    if not every and jobOpts['repeat'] and jobOpts['repeat']['every'] then
        every = tonumber(jobOpts['repeat']['every'])
    end
    if every then
        local startDate = schedulerAttributes[4]
        local jobOptsOffset = jobOpts['repeat'] and jobOpts['repeat']['offset'] or 0
        local offset = schedulerAttributes[5] or jobOptsOffset or 0
        local newOffset
        nextMillis, newOffset = getJobSchedulerEveryNextMillis(prevMillis, every, now, offset, startDate)
        if not offset then
            rcall("HSET", schedulerKey, "offset", newOffset)
            jobOpts['repeat']['offset'] = newOffset
        end
    end
    local nextDelayedJobId = "repeat:" .. jobSchedulerId .. ":" .. nextMillis
    local nextDelayedJobKey = schedulerKey .. ":" .. nextMillis
    local currentDelayedJobId = "repeat:" .. jobSchedulerId .. ":" .. prevMillis
    if producerId == currentDelayedJobId then
        local eventsKey = KEYS[9]
        local maxEvents = getOrSetMaxEvents(metaKey)
        if rcall("EXISTS", nextDelayedJobKey) ~= 1 then
            rcall("ZADD", repeatKey, nextMillis, jobSchedulerId)
            rcall("HINCRBY", schedulerKey, "ic", 1)
            rcall("INCR", KEYS[8])
            -- TODO: remove this workaround in next breaking change,
            -- all job-schedulers must save job data
            local templateData = schedulerAttributes[2] or ARGV[3]
            if templateData and templateData ~= '{}' then
                rcall("HSET", schedulerKey, "data", templateData)
            end
            local delay = nextMillis - now
            -- Fast Clamp delay to minimum of 0
            if delay < 0 then
                delay = 0
            end
            jobOpts["delay"] = delay
            addJobFromScheduler(nextDelayedJobKey, nextDelayedJobId, jobOpts, waitKey, pausedKey, KEYS[12], metaKey,
                prioritizedKey, KEYS[10], delayedKey, KEYS[7], eventsKey, schedulerAttributes[1], maxEvents, ARGV[5],
                templateData or '{}', jobSchedulerId, delay)
            -- TODO: remove this workaround in next breaking change
            if KEYS[11] ~= "" then
                rcall("HSET", KEYS[11], "nrjid", nextDelayedJobId)
            end
            return nextDelayedJobId .. "" -- convert to string
        else
            rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "duplicated", "jobId", nextDelayedJobId)
        end
    end
end
`,keys:12};a.s(["updateJobScheduler",0,ce],638458),a.i(638458);let cf={name:"updateProgress",content:`--[[
  Update job progress
  Input:
    KEYS[1] Job id key
    KEYS[2] event stream key
    KEYS[3] meta key
    ARGV[1] id
    ARGV[2] progress
  Output:
     0 - OK
    -1 - Missing job.
  Event:
    progress(jobId, progress)
]]
local rcall = redis.call
-- Includes
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
if rcall("EXISTS", KEYS[1]) == 1 then -- // Make sure job exists
    local maxEvents = getOrSetMaxEvents(KEYS[3])
    rcall("HSET", KEYS[1], "progress", ARGV[2])
    rcall("XADD", KEYS[2], "MAXLEN", "~", maxEvents, "*", "event", "progress",
          "jobId", ARGV[1], "data", ARGV[2]);
    return 0
else
    return -1
end
`,keys:3};a.s(["updateProgress",0,cf],243012),a.i(243012);let cg={name:"updateRepeatableJobMillis",content:`--[[
  Adds a repeatable job
    Input:
      KEYS[1] 'repeat' key
      ARGV[1] next milliseconds
      ARGV[2] custom key
      ARGV[3] legacy custom key TODO: remove this logic in next breaking change
      Output:
        repeatableKey  - OK
]]
local rcall = redis.call
local repeatKey = KEYS[1]
local nextMillis = ARGV[1]
local customKey = ARGV[2]
local legacyCustomKey = ARGV[3]
if rcall("ZSCORE", repeatKey, customKey) then
    rcall("ZADD", repeatKey, nextMillis, customKey)
    return customKey
elseif rcall("ZSCORE", repeatKey, legacyCustomKey) ~= false then
    rcall("ZADD", repeatKey, nextMillis, legacyCustomKey)
    return legacyCustomKey
end
return ''
`,keys:1};a.s(["updateRepeatableJobMillis",0,cg],738783),a.i(738783),a.s(["addDelayedJob",0,bu,"addJobScheduler",0,bv,"addLog",0,bw,"addParentJob",0,bx,"addPrioritizedJob",0,by,"addRepeatableJob",0,bz,"addStandardJob",0,bA,"changeDelay",0,bB,"changePriority",0,bC,"cleanJobsInSet",0,bD,"drain",0,bE,"extendLock",0,bF,"extendLocks",0,bG,"getCounts",0,bH,"getCountsPerPriority",0,bI,"getDependencyCounts",0,bJ,"getJobScheduler",0,bK,"getMetrics",0,bL,"getRanges",0,bM,"getRateLimitTtl",0,bN,"getState",0,bO,"getStateV2",0,bP,"isFinished",0,bQ,"isJobInList",0,bR,"isMaxed",0,bS,"moveJobFromActiveToWait",0,bT,"moveJobsToWait",0,bU,"moveStalledJobsToWait",0,bV,"moveToActive",0,bW,"moveToDelayed",0,bX,"moveToFinished",0,bY,"moveToWaitingChildren",0,bZ,"obliterate",0,b$,"paginate",0,b_,"pause",0,b0,"promote",0,b1,"releaseLock",0,b2,"removeChildDependency",0,b3,"removeDeduplicationKey",0,b4,"removeJob",0,b5,"removeJobScheduler",0,b6,"removeOrphanedJobs",0,b7,"removeRepeatable",0,b8,"removeUnprocessedChildren",0,b9,"reprocessJob",0,ca,"retryJob",0,cb,"saveStacktrace",0,cc,"updateData",0,cd,"updateJobScheduler",0,ce,"updateProgress",0,cf,"updateRepeatableJobMillis",0,cg],389021);var ch=a.i(389021);let ci=new WeakMap;function cj(a){if(!0===a.__bullmq_iredis)return a;let b=ci.get(a);if(b)return b;let c=!0===a.isCluster,d=new Map,e=Object.create(null);e.__bullmq_iredis=!0,e.isCluster=c,e.runCommand=(b,c)=>a[b](c),e.pipeline=(...b)=>ck(a.pipeline(...b)),e.multi=(...b)=>ck(a.multi(...b)),"function"==typeof a.duplicate&&(e.duplicate=b=>{var d;if(c){let c=(null==(d=a.options)?void 0:d.redisOptions)||{},e=b?Object.assign(Object.assign({},c),b):c;return cj(a.duplicate(void 0,{redisOptions:e}))}return cj(a.duplicate(b))}),e.hset=(b,c,...d)=>{if("string"==typeof c)return a.hset(b,c,...d);let e=[b];for(let[a,b]of Object.entries(c))e.push(a,b);return a.hset(...e)},e.set=(b,c,d,...e)=>{if("string"==typeof d||null==d)return a.set(b,c,...null!=d?[d,...e]:[]);let f=[b,c];return null!=d.PX?f.push("PX",d.PX):null!=d.EX&&f.push("EX",d.EX),a.set(...f)},e.zrange=(b,c,d,e,...f)=>"string"==typeof e?a.zrange(b,c,d,e,...f):(null==e?void 0:e.WITHSCORES)?a.zrange(b,c,d,"WITHSCORES"):a.zrange(b,c,d),e.zrevrange=(b,c,d,e,...f)=>"string"==typeof e?a.zrevrange(b,c,d,e,...f):(null==e?void 0:e.WITHSCORES)?a.zrevrange(b,c,d,"WITHSCORES"):a.zrevrange(b,c,d),e.xadd=(b,c,d,...e)=>{if("string"==typeof d)return a.xadd(b,c,d,...e);let f=e[0],g=[b];for(let[a,b]of((null==f?void 0:f.MAXLEN)!=null&&(g.push("MAXLEN"),!1!==f.approximate&&g.push("~"),g.push(f.MAXLEN)),g.push(c),Object.entries(d)))g.push(a,b);return a.xadd(...g)},e.xread=(b,...c)=>{if("string"==typeof b)return a.xread(b,...c);let d=c[0],e=[];for(let a of((null==d?void 0:d.BLOCK)!=null&&e.push("BLOCK",d.BLOCK),(null==d?void 0:d.COUNT)!=null&&e.push("COUNT",d.COUNT),e.push("STREAMS"),b))e.push(a.key);for(let a of b)e.push(a.id);return a.xread(...e)},e.xtrim=(b,c,d,...e)=>{if("string"==typeof d||0===e.length)return a.xtrim(b,c,d,...e);let f=e[0],g=[b,c];return(null==f?void 0:f.approximate)!==!1&&g.push("~"),g.push(d),a.xtrim(...g)},e.clientSetName=b=>a.client("SETNAME",b),e.clientList=()=>a.client("LIST"),e.scan=(b,...c)=>{if(0===c.length||"string"==typeof c[0]||"function"==typeof c[0])return a.scan(b,...c);let d=c[0],e=[b];return(null==d?void 0:d.MATCH)!=null&&e.push("MATCH",d.MATCH),(null==d?void 0:d.COUNT)!=null&&e.push("COUNT",d.COUNT),a.scan(...e)};let f=new Proxy(a,{get(a,b){if(b in e)return e[b];let c=Reflect.get(a,b,a);if("function"!=typeof c)return c;if(Object.prototype.hasOwnProperty.call(a,b))return c.bind(a);let f=d.get(b);if(void 0!==f)return f;let g=c.bind(a);return d.set(b,g),g},set:(a,b,c)=>b in e?(e[b]=c,!0):(d.delete(b),Reflect.set(a,b,c)),deleteProperty:(a,b)=>!(b in e)&&(d.delete(b),Reflect.deleteProperty(a,b)),has:(a,b)=>b in e||Reflect.has(a,b)});return ci.set(a,f),f}function ck(a){a.runCommand=function(b,c){return a[b](c),a};let b=a.hset.bind(a);a.hset=function(c,d){let e=[c];for(let[a,b]of Object.entries(d))e.push(a,b);return b(...e),a};let c=a.hscan.bind(a);a.hscan=function(b,d,e){return(null==e?void 0:e.COUNT)!=null?c(b,d,"COUNT",e.COUNT):c(b,d),a};let d=a.sscan.bind(a);return a.sscan=function(b,c,e){return(null==e?void 0:e.COUNT)!=null?d(b,c,"COUNT",e.COUNT):d(b,c),a},a}let cl=Symbol("bullmqClusterReconnectPromise"),cm=Symbol("bullmqClusterPatchedForBlocking"),cn=Symbol("bullmqClusterOriginalBzpopmin"),co=Symbol("bullmqClusterWrappedBzpopmin"),cp=Symbol("bullmqClusterPatchRefCount"),cq=Symbol("bullmqClusterClosingRefCount");class cr extends bs.EventEmitter{constructor(a,b){if(super(),this.extraOptions=b,this.capabilities={canDoubleTimeout:!1,canBlockFor1Ms:!0},this.status="initializing",this.dbType="redis",this.packageVersion=bh,this.disabledBlockingClusterReconnect=!1,this.extraOptions=Object.assign({shared:!1,blocking:!0,skipVersionCheck:!1,skipWaitingForReady:!1,clusterReconnectTimeoutMs:3e4},b),X(a)){if(this._client=!function(a){return!!a&&"object"==typeof a&&(!0===a.__bullmq_iredis||"function"==typeof a.runCommand&&"function"==typeof a.defineCommand&&"function"==typeof a.pipeline&&"function"==typeof a.multi&&"function"==typeof a.duplicate&&"function"==typeof a.scanStream&&"function"==typeof a.connect&&"function"==typeof a.disconnect&&"function"==typeof a.on&&"string"==typeof a.status&&"boolean"==typeof a.isCluster)}(a)?cj(a):a,this._client.options.keyPrefix)throw Error("BullMQ: ioredis does not support ioredis prefixes, use the prefix option instead.");this._client.isCluster?this.opts=this._client.options.redisOptions:this.opts=this._client.options,this.checkBlockingOptions("BullMQ: Your redis options maxRetriesPerRequest must be null.",this.opts,!0)}else this.checkBlockingOptions("BullMQ: WARNING! Your redis options maxRetriesPerRequest must be null and will be overridden by BullMQ.",a),this.opts=Object.assign({port:6379,host:"127.0.0.1",retryStrategy:function(a){return Math.max(Math.min(Math.exp(a),2e4),1e3)}},a),this.extraOptions.blocking&&(this.opts.maxRetriesPerRequest=null);this.skipVersionCheck=(null==b?void 0:b.skipVersionCheck)||!!(this.opts&&this.opts.skipVersionCheck),this.handleClientError=a=>{this.emit("error",a)},this.handleClientClose=()=>{this.emit("close")},this.handleClientReady=()=>{this.emit("ready")},this.initializing=this.init(),this.initializing.catch(a=>this.emit("error",a))}checkBlockingOptions(a,b,c=!1){if(this.extraOptions.blocking&&b&&b.maxRetriesPerRequest)if(c)throw Error(a);else console.error(a)}static async waitUntilReady(a){let b,c,d;if("ready"!==a.status&&!("connect"===a.status&&Y(a))){if("wait"===a.status)return a.connect();if("end"===a.status)throw new O(N.CONNECTION_CLOSED_ERROR_MSG);try{await new Promise((e,f)=>{let g;d=a=>{g=a},b=()=>{e()},c=()=>{"end"!==a.status?f(g||new O(N.CONNECTION_CLOSED_ERROR_MSG)):g?f(g):e()},U(a,3),a.once("ready",b),a.on("end",c),a.once("error",d)})}finally{a.removeListener("end",c),a.removeListener("error",d),a.removeListener("ready",b),U(a,-3)}}}get client(){return this.initializing}loadCommands(a,b){let c=b||ch;for(let b in c){let d=`${c[b].name}:${a}`;this._client[d]||this._client.defineCommand(d,{numberOfKeys:c[b].keys,lua:c[b].content})}}async init(){if(!this._client)if(cr.clientFactory)this._client=cr.clientFactory(this.opts);else{let a=this.opts,{url:b}=a,c=bn(a,["url"]),d=b?new bt.default(b,c):new bt.default(c);this._client=cj(d)}if(U(this._client,3),this._client.on("error",this.handleClientError),this._client.on("close",this.handleClientClose),this._client.on("ready",this.handleClientReady),this.patchBlockingClusterClient(),this.extraOptions.skipWaitingForReady||await cr.waitUntilReady(this._client),this.loadCommands(this.packageVersion),"end"!==this._client.status){let a=await this.getRedisVersionAndType();if(this.version=a.version,this.dbType=a.databaseType,!0!==this.skipVersionCheck&&!this.closing){if(aa(this.version,cr.minimumVersion,this.dbType))throw Error(`Redis version needs to be greater or equal than ${cr.minimumVersion} Current: ${this.version}`);aa(this.version,cr.recommendedMinimumVersion,this.dbType)&&console.warn(`It is highly recommended to use a minimum Redis version of ${cr.recommendedMinimumVersion}
             Current: ${this.version}`)}this.capabilities={canDoubleTimeout:!aa(this.version,"6.0.0",this.dbType),canBlockFor1Ms:!aa(this.version,"7.0.8",this.dbType)},this.status="ready"}return this._client}patchBlockingClusterClient(){var a;let b=this._client;if(!this.extraOptions.blocking||!Y(b)||"function"!=typeof b.bzpopmin)return;let c=null!=(a=this.extraOptions.clusterReconnectTimeoutMs)?a:3e4;if(b[cp]=(b[cp]||0)+1,this.patchedBlockingClusterClient=b,b[cm])return;let d=b.bzpopmin,e=async(...a)=>{await cr.reconnectClusterIfNeeded(b,c);try{return await d.apply(b,a)}catch(a){if(cr.shouldReconnectClusterAfterError(b,a))try{await cr.reconnectCluster(b,c)}catch(a){}throw a}};b[cn]=d,b[co]=e,b[cm]=!0,b.bzpopmin=e}disableBlockingClusterReconnect(){let a=this.patchedBlockingClusterClient;a&&!this.disabledBlockingClusterReconnect&&(a[cq]=(a[cq]||0)+1,this.disabledBlockingClusterReconnect=!0)}releaseBlockingClusterClientPatch(){let a=this.patchedBlockingClusterClient;if(!a)return;if(this.disabledBlockingClusterReconnect){let b=(a[cq]||1)-1;b>0?a[cq]=b:delete a[cq],this.disabledBlockingClusterReconnect=!1}let b=(a[cp]||1)-1;if(b>0){a[cp]=b,this.patchedBlockingClusterClient=void 0;return}a[cn]&&a.bzpopmin===a[co]&&(a.bzpopmin=a[cn]),delete a[cp],delete a[cq],delete a[cn],delete a[co],delete a[cm],this.patchedBlockingClusterClient=void 0}static isClusterWithEmptyNodes(a){return"function"==typeof a.nodes&&0===a.nodes().length}static isReconnectingDisabled(a){let b=a[cp]||0,c=a[cq]||0;return 0===b||c>=b||"end"===a.status||"closing"===a.status}static async reconnectClusterIfNeeded(a,b){!cr.isReconnectingDisabled(a)&&cr.isClusterWithEmptyNodes(a)&&await cr.reconnectCluster(a,b)}static shouldReconnectClusterAfterError(a,b){var c,d;if(cr.isReconnectingDisabled(a))return!1;let e=[b.message,null==(c=b.cause)?void 0:c.message,null==(d=b.lastNodeError)?void 0:d.message].join(" ");return cr.isClusterWithEmptyNodes(a)||/Command timed out|Failed to refresh slots cache/i.test(e)}static async reconnectCluster(a,b){cr.isReconnectingDisabled(a)||(a[cl]||(a[cl]=cr.connectClusterWithTimeout(a,b).finally(()=>{a[cl]=null})),await a[cl])}static async connectClusterWithTimeout(a,b){let c;a.disconnect(!1);try{await Promise.race([a.connect(),new Promise((a,d)=>{var e;null==(e=(c=setTimeout(()=>{d(new O(`BullMQ: cluster reconnect timed out after ${b}ms`))},b)).unref)||e.call(c)})])}finally{c&&clearTimeout(c)}}async disconnect(a=!0){let b=await this.client;if("end"!==b.status){let c,d;if(!a)return b.disconnect();let e=new Promise((a,e)=>{U(b,2),b.once("end",a),b.once("error",e),c=a,d=e});b.disconnect();try{await e}finally{U(b,-2),b.removeListener("end",c),b.removeListener("error",d)}}}async reconnect(){return(await this.client).connect()}async close(a=!1){var b;if(!this.closing){let c=this.status;this.status="closing",this.closing=!0,this.disableBlockingClusterReconnect();try{"ready"===c&&await this.initializing,this.extraOptions.shared||("initializing"==c||a?(this._client.disconnect(),null==(b=this.initializing)||b.catch(()=>{})):await this._client.quit(),this._client.status="end")}catch(a){if(_(a))throw a}finally{this.releaseBlockingClusterClientPatch(),this._client.off("error",this.handleClientError),this._client.off("close",this.handleClientClose),this._client.off("ready",this.handleClientReady),U(this._client,-3),this.removeAllListeners(),this.status="closed"}}}async getRedisVersionAndType(){let a;if(this.skipVersionCheck)return{version:cr.minimumVersion,databaseType:"redis"};let b=await this._client.info(),c="redis_version:",d="maxmemory_policy:",e=b.split(/\r?\n/),f="redis";for(let b=0;b<e.length;b++){let g=e[b];if(g.includes("dragonfly_version:")||g.includes("server:Dragonfly")?(f="dragonfly",0===g.indexOf("dragonfly_version:")&&(a=g.substr(18))):g.includes("valkey_version:")||g.includes("server:Valkey")?(f="valkey",0===g.indexOf("valkey_version:")&&(a=g.substr(15))):0===g.indexOf(c)&&(a=g.substr(c.length),"redis"===f&&(f="redis")),0===g.indexOf(d)){let a=g.substr(d.length);"noeviction"!==a&&console.warn(`IMPORTANT! Eviction policy is ${a}. It should be "noeviction"`)}}if(!a){for(let b of e)if(b.includes("version:")){let c=b.split(":");if(c.length>=2){a=c[1];break}}}return{version:a||cr.minimumVersion,databaseType:f}}get redisVersion(){return this.version}get databaseType(){return this.dbType}}cr.minimumVersion="5.0.0",cr.recommendedMinimumVersion="6.2.0",K.EventEmitter;var cs=K;function ct(a){return 1===a.length&&Array.isArray(a[0])?a[0]:a}function cu(a){return(null==a?void 0:a.message)==="Disconnects client"||(null==a?void 0:a.message)==="The client is closed"||(null==a?void 0:a.message)==="Connection is closed."}class cv extends cs.EventEmitter{get status(){return this.statusOverride?this.statusOverride:this.raw.isReady?"ready":this.raw.isOpen?"connect":this.hasConnected?"end":"wait"}set status(a){if("end"===a&&(this.destroying=!0,this.raw.isOpen))try{this.raw.quit().catch(()=>{})}catch(a){}this.statusOverride=a}get options(){var a;return null!=(a=this.raw.options)?a:{}}set options(a){}constructor(a){super(),this.raw=a,this.scripts=new Map,this.hasConnected=!1,this.destroying=!1,this.isCluster=!1,a.on("ready",()=>{this.hasConnected=!0,this.connectionName?this.raw.clientSetName(this.connectionName).then(()=>this.emit("ready"),()=>this.emit("ready")):this.emit("ready")}),a.on("error",a=>{this.destroying&&cu(a)||this.emit("error",a)}),a.on("end",()=>this.emit("close")),a.on("reconnecting",()=>this.emit("reconnecting")),a.isOpen||(this.connectPromise=a.connect().then(()=>{this.connectPromise=void 0},a=>{this.connectPromise=void 0}))}async connect(){return this.connectPromise?this.connectPromise:this.raw.isOpen?void(!this.raw.isReady&&await new Promise((a,b)=>{let c=()=>{f(),a()},d=a=>{f(),b(a)},e=()=>{f(),b(Error("Connection ended before ready event"))},f=()=>{this.off("ready",c),this.off("error",d),this.off("end",e)};this.once("ready",c),this.once("error",d),this.once("end",e)})):(this.connectPromise=this.raw.connect().then(()=>{this.connectPromise=void 0},a=>{throw this.connectPromise=void 0,a}),this.connectPromise)}disconnect(a=!1){this.destroying=!0,a||(this.statusOverride="end");try{this.raw.isOpen&&this.raw.destroy()}catch(a){}this.emit("close"),a?(this.statusOverride=void 0,this.emit("reconnecting"),this.connect().catch(a=>{cu(a)||this.emit("error",a)}).finally(()=>{this.destroying=!1})):this.emit("end")}async quit(){if(this.destroying||"end"===this.statusOverride)return setImmediate(()=>{this.emit("end"),this.emit("close")}),"OK";this.destroying=!0;try{if(this.raw.isOpen)try{await this.raw.quit()}catch(a){}}catch(a){}return this.statusOverride="end",setImmediate(()=>{this.emit("end"),this.emit("close")}),"OK"}duplicate(...a){let b=new cv(this.raw.duplicate());for(let[a,c]of this.scripts)b.scripts.set(a,c),b[a]=(...c)=>b.runCommand(a,c);let c=a[0];return c&&"object"==typeof c&&c.connectionName&&(b.connectionName=c.connectionName),b}defineCommand(a,b){let c=(0,M.createHash)("sha1").update(b.lua).digest("hex");this.scripts.set(a,{sha:c,lua:b.lua,numberOfKeys:b.numberOfKeys}),this[a]=(...b)=>this.runCommand(a,b),this.raw.scriptLoad(b.lua).catch(()=>{})}async runCommand(a,b){var c,d;let e=this.scripts.get(a);if(!e)throw Error(`BullMQ: unknown command "${a}"`);let f=ct(b),{sha:g,lua:h,numberOfKeys:i}=e,j=f.slice(0,i).map(String),k=f.slice(i).map(a=>Buffer.isBuffer(a)?a:null==a?"":String(a));try{return await this.raw.evalSha(g,{keys:j,arguments:k})}catch(a){if(this.destroying&&cu(a))return null;if(cu(a))throw new O(a.message,a);if(null==(d=null==(c=null==a?void 0:a.message)?void 0:c.includes)?void 0:d.call(c,"NOSCRIPT"))try{return await this.raw.eval(h,{keys:j,arguments:k})}catch(a){if(this.destroying&&cu(a))return null;if(cu(a))throw new O(a.message,a);throw a}throw a}}multi(){return new cw(this.raw.multi(),this.scripts)}pipeline(){return this.multi()}async hgetall(a){let b=await this.raw.hGetAll(a);return null!=b?b:{}}async hget(a,b){var c;return null!=(c=await this.raw.hGet(a,b))?c:null}async hmget(a,...b){return(await this.raw.hmGet(a,b)).map(a=>null!=a?a:null)}async hset(a,b,...c){if("object"==typeof b)return await this.raw.hSet(a,b);let d={};d[b]=String(c[0]);for(let a=1;a<c.length;a+=2)d[String(c[a])]=String(c[a+1]);return await this.raw.hSet(a,d)}async hdel(a,...b){return await this.raw.hDel(a,b)}async hexists(a,b){return+!!await this.raw.hExists(a,b)}async get(a){var b;return null!=(b=await this.raw.get(a))?b:null}async set(a,b,c){let d={};return(null==c?void 0:c.PX)!=null?d.PX=c.PX:(null==c?void 0:c.EX)!=null&&(d.EX=c.EX),await this.raw.set(a,String(b),d)}async del(...a){return 0===a.length?0:await this.raw.del(a)}async zrange(a,b,c,d){if(null==d?void 0:d.WITHSCORES){let d=await this.raw.zRangeWithScores(a,b,c),e=[];for(let a of d)e.push(a.value,String(a.score));return e}return await this.raw.zRange(a,b,c)}async zrevrange(a,b,c,d){if(null==d?void 0:d.WITHSCORES){let d=await this.raw.zRangeWithScores(a,b,c,{REV:!0}),e=[];for(let a of d)e.push(a.value,String(a.score));return e}return await this.raw.zRange(a,b,c,{REV:!0})}async zcard(a){return await this.raw.zCard(a)}async zscore(a,b){let c=await this.raw.zScore(a,b);return null!=c?String(c):null}async lrange(a,b,c){return await this.raw.lRange(a,b,c)}async llen(a){return await this.raw.lLen(a)}async ltrim(a,b,c){return await this.raw.lTrim(a,b,c),"OK"}async lpos(a,b){var c;return null!=(c=await this.raw.lPos(a,b))?c:null}async smembers(a){return await this.raw.sMembers(a)}async xadd(a,b,c,d){let e={};(null==d?void 0:d.MAXLEN)!=null&&(e.TRIM={strategy:"MAXLEN",threshold:d.MAXLEN,strategyModifier:!1===d.approximate?void 0:"~"});let f={};for(let[a,b]of Object.entries(c))f[a]=String(b);return await this.raw.xAdd(a,b,f,e)}async xread(a,b){let c,d={};(null==b?void 0:b.BLOCK)!=null&&(d.BLOCK=b.BLOCK),(null==b?void 0:b.COUNT)!=null&&(d.COUNT=b.COUNT);let e=a.map(a=>({key:a.key,id:a.id}));try{c=await this.raw.xRead(e,d)}catch(a){if(this.destroying&&cu(a))return null;if(cu(a))throw new O(a.message,a);throw a}return c?c.map(a=>[a.name,a.messages.map(a=>[a.id,Object.entries(a.message).flat()])]):null}async xtrim(a,b,c,d){let e=(null==d?void 0:d.approximate)===!1?void 0:"~";return await this.raw.xTrim(a,b,c,{strategyModifier:e})}async bzpopmin(a,b){let c;try{c=await this.raw.bzPopMin(a,b)}catch(a){if(this.destroying&&cu(a))return null;if(cu(a))throw new O(a.message,a);throw a}return c?[c.key,c.value,String(c.score)]:null}async info(){return await this.raw.info()}async clientSetName(a){return await this.raw.clientSetName(a)}async clientList(){return await this.raw.sendCommand(["CLIENT","LIST"])}async scan(a,b){let c={};(null==b?void 0:b.MATCH)&&(c.MATCH=b.MATCH),(null==b?void 0:b.COUNT)&&(c.COUNT=b.COUNT);let d=await this.raw.scan(String(a),c);return[String(d.cursor),d.keys]}scanStream(a){let b=this.raw,c=this.connectPromise,d={};a.match&&(d.MATCH=a.match),a.count&&(d.COUNT=a.count);let e=new bg.Readable({objectMode:!0,async read(){var a,f,g,h;try{c&&await c;try{for(var i,j=!0,k=function(a){if(!Symbol.asyncIterator)throw TypeError("Symbol.asyncIterator is not defined.");var b,c=a[Symbol.asyncIterator];return c?c.call(a):(a=function(a){var b="function"==typeof Symbol&&Symbol.iterator,c=b&&a[b],d=0;if(c)return c.call(a);if(a&&"number"==typeof a.length)return{next:function(){return a&&d>=a.length&&(a=void 0),{value:a&&a[d++],done:!a}}};throw TypeError(b?"Object is not iterable.":"Symbol.iterator is not defined.")}(a),b={},d("next"),d("throw"),d("return"),b[Symbol.asyncIterator]=function(){return this},b);function d(c){b[c]=a[c]&&function(b){return new Promise(function(d,e){var f,g,h,i;f=d,g=e,h=(b=a[c](b)).done,i=b.value,Promise.resolve(i).then(function(a){f({value:a,done:h})},g)})}}}(b.scanIterator(d));!(a=(i=await k.next()).done);j=!0)if(h=i.value,j=!1,!e.push(Array.isArray(h)?h:[h]))return}catch(a){f={error:a}}finally{try{!j&&!a&&(g=k.return)&&await g.call(k)}finally{if(f)throw f.error}}e.push(null)}catch(a){e.destroy(a)}}});return e}async keys(a){return await this.raw.keys(a)}async exists(...a){return 0===a.length?0:await this.raw.exists(a)}async zadd(a,...b){let c=[];for(let a=0;a<b.length;a+=2)c.push({score:Number(b[a]),value:String(b[a+1])});return await this.raw.zAdd(a,c)}async zrem(a,...b){return await this.raw.zRem(a,b)}async xlen(a){return await this.raw.xLen(a)}async xrevrange(a,b,c,...d){let e={};return"COUNT"===d[0]&&(e.COUNT=Number(d[1])),(await this.raw.xRevRange(a,b,c,e)).map(a=>[a.id,Object.entries(a.message).flat()])}async sadd(a,...b){return await this.raw.sAdd(a,b.map(String))}async scard(a){return await this.raw.sCard(a)}async lpush(a,...b){return await this.raw.lPush(a,b)}async rpop(a){return await this.raw.rPop(a)}async incr(a){return await this.raw.incr(a)}async incrby(a,b){return await this.raw.incrBy(a,b)}async flushall(){return await this.raw.flushAll()}}class cw{constructor(a,b){this.raw=a,this.scripts=b,this.transformers=[]}addIdentityTransformer(){this.transformers.push(a=>a)}hgetall(a){return this.raw.hGetAll(a),this.addIdentityTransformer(),this}hset(a,b){return this.raw.hSet(a,b),this.addIdentityTransformer(),this}hscan(a,b,c){let d={};return(null==c?void 0:c.COUNT)!=null&&(d.COUNT=c.COUNT),this.raw.hScan(a,String(b),d),this.transformers.push(a=>{if(!a)return["0",[]];let b=[];for(let c of a.entries||[])b.push(c.field,c.value);return[String(a.cursor),b]}),this}smembers(a){return this.raw.sMembers(a),this.addIdentityTransformer(),this}sscan(a,b,c){let d={};return(null==c?void 0:c.COUNT)!=null&&(d.COUNT=c.COUNT),this.raw.sScan(a,String(b),d),this.transformers.push(a=>a?[String(a.cursor),a.members||[]]:["0",[]]),this}zrange(a,b,c){return this.raw.zRange(a,b,c),this.addIdentityTransformer(),this}lrange(a,b,c){return this.raw.lRange(a,b,c),this.addIdentityTransformer(),this}llen(a){return this.raw.lLen(a),this.addIdentityTransformer(),this}del(...a){return a.length>0&&(this.raw.del(a),this.addIdentityTransformer()),this}runCommand(a,b){let c=this.scripts.get(a);if(!c)throw Error(`BullMQ: unknown command "${a}" in transaction`);let d=ct(b),{sha:e,lua:f,numberOfKeys:g}=c,h=d.slice(0,g).map(String),i=d.slice(g).map(a=>Buffer.isBuffer(a)?a:null==a?"":String(a));return this.raw.evalSha(e,{keys:h,arguments:i}),this.addIdentityTransformer(),this}async exec(){let a=await this.raw.exec();return a?a.map((a,b)=>{if(a instanceof Error)return[a,null];let c=this.transformers[b];return[null,c?c(a):a]}):null}}var cx=K;function cy(a){return 1===a.length&&Array.isArray(a[0])?a[0]:a}function cz(a){return null==a?[]:Array.isArray(a)?a.map(String):a instanceof Set?Array.from(a,a=>String(a)):[]}class cA extends cx.EventEmitter{get status(){return this.statusOverride?this.statusOverride:this.closed?"end":this.raw.connected?"ready":this.hasConnected?"end":"wait"}set status(a){"end"===a&&(this.closing=!0,this.closed=!0),this.statusOverride=a}get options(){return{}}set options(a){}constructor(a,b){super(),this.raw=a,this.scripts=new Map,this.loadedScriptShas=new Set,this.hasConnected=!1,this.closed=!1,this.closing=!1,this.reconnecting=!1,this.reconnectTimer=null,this.reconnectAttempts=0,this.maxReconnectDelay=2e4,this.isCluster=!1,this._setupCallbacks(),(null==b?void 0:b.lazyConnect)||this.connect().catch(()=>{})}_setupCallbacks(){this.raw.onconnect=()=>{this.hasConnected=!0,this.closed=!1,this.closing=!1,this.reconnecting=!1,this.reconnectAttempts=0,this.statusOverride=void 0,this.loadedScriptShas.clear(),this.connectionName?this.clientSetName(this.connectionName).then(()=>this.emit("ready"),()=>this.emit("ready")):this.emit("ready")},this.raw.onclose=a=>{if(this.closing){this.closed=!0,this.emit("close"),this.emit("end");return}this.closed=!0,this.emit("close"),a&&this.emit("error",a),this._scheduleReconnect()}}_scheduleReconnect(){if(this.closing||this.reconnecting)return;this.reconnecting=!0,this.reconnectAttempts++;let a=Math.max(Math.min(100*Math.exp(this.reconnectAttempts),this.maxReconnectDelay),1e3);this.reconnectTimer=setTimeout(async()=>{if(this.reconnectTimer=null,this.closing){this.reconnecting=!1;return}try{let a=new this.raw.constructor(this.raw.url);this.raw=a,this.closed=!1,this.connecting=void 0,this._setupCallbacks(),await a.connect()}catch(a){this.reconnecting=!1,this.closing||this._scheduleReconnect()}},a)}async connect(){if(this.raw.connected){this.hasConnected=!0,this.closed=!1,this.closing=!1,this.statusOverride=void 0;return}if(!this.connecting){if(this.closed=!1,this.closing=!1,this.statusOverride=void 0,this.hasConnected&&!this.raw.connected){let a=this.raw.constructor;this.raw=new a(this.raw.url),this._setupCallbacks()}this.connecting=this.raw.connect().then(()=>{this.hasConnected=!0,this.closed=!1,this.closing=!1,this.statusOverride=void 0}).finally(()=>{this.connecting=void 0})}await this.connecting}_closeRaw(){this.reconnectTimer&&(clearTimeout(this.reconnectTimer),this.reconnectTimer=null),this.reconnecting=!1;let a=this.raw;a.onconnect=()=>{},a.onclose=()=>{},a.onerror=()=>{},a.connected&&setImmediate(()=>{try{a.connected&&a.close()}catch(a){}})}disconnect(a){if(!this.closed||a)if(a){this.closed=!0,this.statusOverride=void 0;let a=this.raw;a.onclose=()=>{},a.connected&&setImmediate(()=>{try{a.connected&&a.close()}catch(a){}}),this.emit("close"),this._scheduleReconnect()}else this.closing=!0,this.closed=!0,this.statusOverride="end",this._closeRaw(),this.emit("close"),this.emit("end")}async quit(){return this.closed?setImmediate(()=>{this.emit("end"),this.emit("close")}):(this.closing=!0,this.closed=!0,this.statusOverride="end",this._closeRaw(),setImmediate(()=>{this.emit("end"),this.emit("close")})),"OK"}duplicate(...a){let b=new cA(new this.raw.constructor(this.raw.url));for(let[a,c]of this.scripts)b.scripts.set(a,c),b[a]=(...c)=>b.runCommand(a,c);let c=a[0];return c&&"object"==typeof c&&c.connectionName&&(b.connectionName=c.connectionName),b}defineCommand(a,b){let c=(0,M.createHash)("sha1").update(b.lua).digest("hex");this.scripts.set(a,{sha:c,lua:b.lua,numberOfKeys:b.numberOfKeys}),this[a]=(...b)=>this.runCommand(a,b)}async runCommand(a,b){let c=this.scripts.get(a);if(!c)throw Error(`BullMQ: unknown command "${a}"`);let d=cy(b),{sha:e,lua:f,numberOfKeys:g}=c,h=d.slice(0,g).map(String),i=d.slice(g).map(a=>Buffer.isBuffer(a)?a:null==a?"":String(a)),j=[e,String(h.length),...h,...i];return(async()=>{var a,b;try{let a=await this.sendCommand("EVALSHA",j);return this.loadedScriptShas.add(e),a}catch(c){if(null==(b=null==(a=null==c?void 0:c.message)?void 0:a.includes)?void 0:b.call(a,"NOSCRIPT")){let a=[f,String(h.length),...h,...i],b=await this.sendCommand("EVAL",a);return this.loadedScriptShas.add(e),b}throw c}})()}async ensureScriptsLoaded(a){let b=[],c=new Set;for(let d of a)this.loadedScriptShas.has(d.sha)||c.has(d.sha)||(c.add(d.sha),b.push(d));0!==b.length&&await Promise.all(b.map(async a=>{await this.sendCommand("SCRIPT",["LOAD",a.lua]),this.loadedScriptShas.add(a.sha)}))}sendCommand(a,b){return this.closing||this.closed?Promise.reject(new O("Connection is closed")):this.raw.send(a,b).catch(a=>{var b;let c;if("Socket closed unexpectedly"===(c=null!=(b=null==a?void 0:a.message)?b:"")||c.startsWith("Connection closed")||"Connection is closed."===c||"Connection has failed"===c)return Promise.reject(new O(this.closing||this.closed?"Connection is closed":a.message,a));throw a})}multi(){return new cB(this.raw,this.scripts,!0,this)}pipeline(){return new cB(this.raw,this.scripts,!1,this)}async hgetall(a){let b=await this.sendCommand("HGETALL",[a]);if(!b||Array.isArray(b)&&0===b.length)return{};if(Array.isArray(b)){let a={};for(let c=0;c<b.length;c+=2)a[String(b[c])]=String(b[c+1]);return a}return b}async hget(a,b){let c=await this.sendCommand("HGET",[a,b]);return null!=c?c:null}async hmget(a,...b){return(await this.sendCommand("HMGET",[a,...b])||[]).map(a=>null!=a?a:null)}async hset(a,b,...c){let d;if("object"==typeof b)for(let[c,e]of(d=[a],Object.entries(b)))d.push(c,String(e));else{d=[a,b,String(c[0])];for(let a=1;a<c.length;a+=2)d.push(String(c[a]),String(c[a+1]))}return await this.sendCommand("HSET",d)}async hdel(a,...b){return await this.sendCommand("HDEL",[a,...b])}async hexists(a,b){let c=await this.sendCommand("HEXISTS",[a,b]);return+(!0===c||1===c)}async get(a){let b=await this.sendCommand("GET",[a]);return null!=b?b:null}async set(a,b,c){let d=[a,String(b)];return(null==c?void 0:c.PX)!=null?d.push("PX",String(c.PX)):(null==c?void 0:c.EX)!=null&&d.push("EX",String(c.EX)),await this.sendCommand("SET",d)}async del(...a){return 0===a.length?0:await this.sendCommand("DEL",a)}async zrange(a,b,c,d){let e=[a,String(b),String(c)];(null==d?void 0:d.WITHSCORES)&&e.push("WITHSCORES");let f=await this.sendCommand("ZRANGE",e);return f?(null==d?void 0:d.WITHSCORES)&&f.length>0&&Array.isArray(f[0])?f.flatMap(a=>[String(a[0]),String(a[1])]):f.map(String):[]}async zrevrange(a,b,c,d){let e=[a,String(b),String(c)];(null==d?void 0:d.WITHSCORES)&&e.push("WITHSCORES"),e.push("REV");let f=await this.sendCommand("ZRANGE",e);return f?(null==d?void 0:d.WITHSCORES)&&f.length>0&&Array.isArray(f[0])?f.flatMap(a=>[String(a[0]),String(a[1])]):f.map(String):[]}async zcard(a){return await this.sendCommand("ZCARD",[a])}async zscore(a,b){let c=await this.sendCommand("ZSCORE",[a,b]);return null!=c?String(c):null}async lrange(a,b,c){return(await this.sendCommand("LRANGE",[a,String(b),String(c)])||[]).map(String)}async llen(a){return await this.sendCommand("LLEN",[a])}async ltrim(a,b,c){return await this.sendCommand("LTRIM",[a,String(b),String(c)]),"OK"}async lpos(a,b){let c=await this.sendCommand("LPOS",[a,b]);return null!=c?c:null}async smembers(a){return cz(await this.sendCommand("SMEMBERS",[a]))}async xadd(a,b,c,d){let e=[a];for(let[a,f]of((null==d?void 0:d.MAXLEN)!=null&&(e.push("MAXLEN"),!1!==d.approximate&&e.push("~"),e.push(String(d.MAXLEN))),e.push(b),Object.entries(c)))e.push(a,String(f));return await this.raw.send("XADD",e)}async xread(a,b){let c,d=[];for(let c of((null==b?void 0:b.COUNT)!=null&&d.push("COUNT",String(b.COUNT)),(null==b?void 0:b.BLOCK)!=null&&d.push("BLOCK",String(b.BLOCK)),d.push("STREAMS"),a))d.push(c.key);for(let b of a)d.push(b.id);try{c=await this.sendCommand("XREAD",d)}catch(a){if(this.closing)return null;throw a}return c?Array.isArray(c)?c.map(a=>[String(a[0]),(a[1]||[]).map(a=>[String(a[0]),(a[1]||[]).map(String)])]):Object.entries(c).map(([a,b])=>[a,(b||[]).map(a=>[String(a[0]),(a[1]||[]).map(String)])]):null}async xtrim(a,b,c,d){let e=[a,b];return(null==d?void 0:d.approximate)!==!1&&e.push("~"),e.push(String(c)),await this.sendCommand("XTRIM",e)}async bzpopmin(a,b){let c;try{c=await this.sendCommand("BZPOPMIN",[a,String(b)])}catch(a){if(this.closing)return null;throw a}return c&&0!==c.length?[String(c[0]),String(c[1]),String(c[2])]:null}async info(){return await this.sendCommand("INFO",[])}async clientSetName(a){return await this.sendCommand("CLIENT",["SETNAME",a])}async clientList(){return await this.sendCommand("CLIENT",["LIST"])}async scan(a,b){let c=[String(a)];(null==b?void 0:b.MATCH)&&c.push("MATCH",b.MATCH),(null==b?void 0:b.COUNT)&&c.push("COUNT",String(b.COUNT));let d=await this.sendCommand("SCAN",c),e=d[1];return[String(d[0]),Array.isArray(e)?e.map(String):[]]}scanStream(a){let b=this,c="0",d=!1,e=new bg.Readable({objectMode:!0,async read(){if(d&&"0"===c)return void e.push(null);d=!0;try{for(;;){let[d,f]=await b.scan(c,{MATCH:a.match,COUNT:a.count});if(c=d,f.length>0){e.push(f),"0"===c&&e.push(null);return}if("0"===c)return void e.push(null)}}catch(a){e.destroy(a)}}});return e}async keys(a){return(await this.sendCommand("KEYS",[a])||[]).map(String)}async exists(...a){if(0===a.length)return 0;let b=await this.sendCommand("EXISTS",a);return"boolean"==typeof b?+!!b:b}async zadd(a,...b){let c=[a];for(let a=0;a<b.length;a+=2)c.push(String(b[a]),String(b[a+1]));return await this.sendCommand("ZADD",c)}async zrem(a,...b){return await this.sendCommand("ZREM",[a,...b])}async xlen(a){return await this.sendCommand("XLEN",[a])}async xrevrange(a,b,c,...d){let e=[a,b,c];"COUNT"===d[0]&&e.push("COUNT",String(d[1]));let f=await this.sendCommand("XREVRANGE",e);return f?f.map(a=>[String(a[0]),(a[1]||[]).map(String)]):[]}async sadd(a,...b){return await this.sendCommand("SADD",[a,...b.map(String)])}async scard(a){return await this.sendCommand("SCARD",[a])}async lpush(a,...b){return await this.sendCommand("LPUSH",[a,...b])}async rpop(a){let b=await this.sendCommand("RPOP",[a]);return null!=b?b:null}async incr(a){return await this.sendCommand("INCR",[a])}async incrby(a,b){return await this.sendCommand("INCRBY",[a,String(b)])}async flushall(){return await this.sendCommand("FLUSHALL",[])}}class cB{constructor(a,b,c,d){this.raw=a,this.scripts=b,this.transactional=c,this.adapter=d,this.commands=[],this.transformers=[],this.scriptsToLoad=[]}addCommand(a,b,c){this.commands.push({cmd:a,args:b}),this.transformers.push(c||(a=>a))}hgetall(a){return this.addCommand("HGETALL",[a],a=>{if(!a||Array.isArray(a)&&0===a.length)return{};if(Array.isArray(a)){let b={};for(let c=0;c<a.length;c+=2)b[String(a[c])]=String(a[c+1]);return b}return a}),this}hset(a,b){let c=[a];for(let[a,d]of Object.entries(b))c.push(a,String(d));return this.addCommand("HSET",c),this}hscan(a,b,c){let d=[a,String(b)];return(null==c?void 0:c.COUNT)!=null&&d.push("COUNT",String(c.COUNT)),this.addCommand("HSCAN",d,a=>a&&Array.isArray(a)?[String(a[0]),cz(a[1])]:["0",[]]),this}smembers(a){return this.addCommand("SMEMBERS",[a],a=>cz(a)),this}sscan(a,b,c){let d=[a,String(b)];return(null==c?void 0:c.COUNT)!=null&&d.push("COUNT",String(c.COUNT)),this.addCommand("SSCAN",d,a=>a&&Array.isArray(a)?[String(a[0]),cz(a[1])]:["0",[]]),this}zrange(a,b,c){return this.addCommand("ZRANGE",[a,String(b),String(c)],a=>Array.isArray(a)?a.map(String):[]),this}lrange(a,b,c){return this.addCommand("LRANGE",[a,String(b),String(c)],a=>Array.isArray(a)?a.map(String):[]),this}llen(a){return this.addCommand("LLEN",[a]),this}del(...a){return a.length>0&&this.addCommand("DEL",a),this}runCommand(a,b){let c=this.scripts.get(a);if(!c)throw Error(`BullMQ: unknown command "${a}" in transaction`);let d=cy(b),{sha:e,numberOfKeys:f}=c,g=d.slice(0,f).map(String),h=d.slice(f).map(a=>Buffer.isBuffer(a)?a:null==a?"":String(a));return this.scriptsToLoad.push(c),this.addCommand("EVALSHA",[e,String(g.length),...g,...h]),this}async exec(){if(0===this.commands.length)return[];if(this.scriptsToLoad.length>0&&await this.adapter.ensureScriptsLoaded(this.scriptsToLoad),!this.transactional)return(await Promise.allSettled(this.commands.map(({cmd:a,args:b})=>this.adapter.sendCommand(a,b)))).map((a,b)=>{if("rejected"===a.status)return[a.reason,null];let c=this.transformers[b];return[null,c?c(a.value):a.value]});let a=a=>{};try{for(let{cmd:b,args:c}of(this.raw.send("MULTI",[]).catch(a),this.commands))this.raw.send(b,c).catch(a);let b=await this.raw.send("EXEC",[]);if(!b)return null;return b.map((a,b)=>{if(a instanceof Error)return[a,null];let c=this.transformers[b],d=c?c(a):a;return[null,d]})}catch(a){try{await this.raw.send("DISCARD",[])}catch(a){}throw a}}}var cC=a.i(410471),cD=K;class cE extends cD.EventEmitter{constructor(a,b={connection:{}},c=cr,d=!1){if(super(),this.name=a,this.opts=b,this.closed=!1,this.hasBlockingConnection=!1,this.hasBlockingConnection=d,this.opts=Object.assign({prefix:"bull"},b),!a)throw Error("Queue name must be provided");if(a.includes(":"))throw Error("Queue name cannot contain :");this.connection=new c(b.connection,{shared:X(b.connection),blocking:d,skipVersionCheck:b.skipVersionCheck,skipWaitingForReady:b.skipWaitingForReady}),this.connection.on("error",a=>this.emit("error",a)),this.connection.on("close",()=>{this.closing||this.emit("ioredis:close")});const e=new br(b.prefix);this.qualifiedName=e.getQueueQualifiedName(a),this.keys=e.getKeys(a),this.toKey=b=>e.toKey(a,b),this.createScripts()}get client(){return this.connection.client}createScripts(){this.scripts=bm(this)}get redisVersion(){return this.connection.redisVersion}get databaseType(){return this.connection.databaseType}get Job(){return bp}emit(a,...b){try{return super.emit(a,...b)}catch(a){try{return super.emit("error",a)}catch(a){return console.error(a),!1}}}waitUntilReady(){return this.client}base64Name(){return Buffer.from(this.name).toString("base64")}clientName(a=""){let b=this.base64Name();return`${this.opts.prefix}:${b}${a}`}async close(){this.closing||(this.closing=this.connection.close()),await this.closing,this.closed=!0}disconnect(){return this.connection.disconnect()}async checkConnectionError(a,b=5e3){try{return await a()}catch(a){if(_(a)&&this.emit("error",a),this.closing||!b)return;await new Promise(a=>{let c;c=setTimeout(()=>{clearTimeout(c),a()},b)})}}trace(a,b,c,d,e){return ac(this.opts.telemetry,a,this.name,b,c,d,e)}}class cF extends cE{constructor(a,b,c){super(a,b,c),this.repeatStrategy=b.settings&&b.settings.repeatStrategy||cG}async upsertJobScheduler(a,b,c,d,e,{override:f,producerId:g}){let h,{every:i,limit:j,pattern:k,offset:l}=b;if(k&&i)throw Error("Both .pattern and .every options are defined for this repeatable job");if(!k&&!i)throw Error("Either .pattern or .every options must be defined for this repeatable job");if(b.immediately&&b.startDate)throw Error("Both .immediately and .startDate options are defined for this repeatable job");b.immediately&&b.every&&console.warn("Using option immediately with every does not affect the job's schedule. Job will run immediately anyway.");let m=b.count?b.count+1:1;if(void 0!==b.limit&&m>b.limit)return;let n=Date.now(),{endDate:o}=b;if(o&&n>new Date(o).getTime())return;let p=e.prevMillis||0;n=p<n?n:p;let{immediately:q}=b,r=bn(b,["immediately"]),s=i&&l?l:null;if(k&&(h=await this.repeatStrategy(n,b,c))<n&&(h=n),h||i)return this.trace(y.PRODUCER,"add",`${this.name}.${c}`,async(l,p)=>{var q,t;let u=e.telemetry;if(p){let a=null==(q=e.telemetry)?void 0:q.omitContext,b=(null==(t=e.telemetry)?void 0:t.metadata)||!a&&p;(b||a)&&(u={metadata:b,omitContext:a})}let v=this.getNextJobOpts(h,a,Object.assign(Object.assign({},e),{repeat:r,telemetry:u}),m,s);if(f){h<n&&(h=n);let[f,m]=await this.scripts.addJobScheduler(a,h,JSON.stringify(void 0===d?{}:d),bp.optsAsJSON(e),{name:c,startDate:b.startDate?new Date(b.startDate).getTime():void 0,endDate:o?new Date(o).getTime():void 0,tz:b.tz,pattern:k,every:i,limit:j,offset:s},bp.optsAsJSON(v),g),p="string"==typeof m?parseInt(m,10):m,q=new this.Job(this,c,d,Object.assign(Object.assign({},v),{delay:p}),f);return q.id=f,null==l||l.setAttributes({[w.JobSchedulerId]:a,[w.JobId]:q.id}),q}{let b=await this.scripts.updateJobSchedulerNextMillis(a,h,JSON.stringify(void 0===d?{}:d),bp.optsAsJSON(v),g);if(b){let e=new this.Job(this,c,d,v,b);return e.id=b,null==l||l.setAttributes({[w.JobSchedulerId]:a,[w.JobId]:e.id}),e}}})}getNextJobOpts(a,b,c,d,e){var f,g;let h=this.getSchedulerNextJobId({jobSchedulerId:b,nextMillis:a}),i=Date.now(),j=a+e-i,k=Object.assign(Object.assign({},c),{jobId:h,delay:j<0?0:j,timestamp:i,prevMillis:a,repeatJobKey:b});return k.repeat=Object.assign(Object.assign({},c.repeat),{offset:e,count:d,startDate:(null==(f=c.repeat)?void 0:f.startDate)?new Date(c.repeat.startDate).getTime():void 0,endDate:(null==(g=c.repeat)?void 0:g.endDate)?new Date(c.repeat.endDate).getTime():void 0}),k}async removeJobScheduler(a){return this.scripts.removeJobScheduler(a)}async getSchedulerData(a,b,c){let d=await a.hgetall(this.toKey("repeat:"+b));return this.transformSchedulerData(b,d,c)}transformSchedulerData(a,b,c){if(b&&Object.keys(b).length>0){let d={key:a,name:b.name,next:c};return b.ic&&(d.iterationCount=parseInt(b.ic)),b.limit&&(d.limit=parseInt(b.limit)),b.startDate&&(d.startDate=parseInt(b.startDate)),b.endDate&&(d.endDate=parseInt(b.endDate)),b.tz&&(d.tz=b.tz),b.pattern&&(d.pattern=b.pattern),b.every&&(d.every=parseInt(b.every)),b.offset&&(d.offset=parseInt(b.offset)),(b.data||b.opts)&&(d.template=this.getTemplateFromJSON(b.data,b.opts)),d}if(a.includes(":"))return this.keyToData(a,c)}keyToData(a,b){let c=a.split(":"),d=c.slice(4).join(":")||null;return{key:a,name:c[0],id:c[1]||null,endDate:parseInt(c[2])||null,tz:c[3]||null,pattern:d,next:b}}async isJobScheduler(a){let b=await this.client;return 1===await b.hexists(`${this.keys.repeat}:${a}`,"ic")}async getScheduler(a){let[b,c]=await this.scripts.getJobScheduler(a);return this.transformSchedulerData(a,b?S(b):null,c?parseInt(c):null)}getTemplateFromJSON(a,b){let c={};return a&&(c.data=JSON.parse(a)),b&&(c.opts=bp.optsFromJSON(b)),c}async getJobSchedulers(a=0,b=-1,c=!1){let d=await this.client,e=this.keys.repeat,f=c?await d.zrange(e,a,b,{WITHSCORES:!0}):await d.zrevrange(e,a,b,{WITHSCORES:!0}),g=[];for(let a=0;a<f.length;a+=2)g.push(this.getSchedulerData(d,f[a],parseInt(f[a+1])));return Promise.all(g)}async getSchedulersCount(){let a=this.keys.repeat;return(await this.client).zcard(a)}getSchedulerNextJobId({nextMillis:a,jobSchedulerId:b}){return`repeat:${b}:${a}`}}let cG=(a,b)=>{let{pattern:c}=b,d=new Date(a),e=b.startDate&&new Date(b.startDate),f=(0,cC.parseExpression)(c,Object.assign(Object.assign({},b),{currentDate:e>d?e:d}));try{if(b.immediately)return new Date().getTime();return f.next().getTime()}catch(a){}};function cH(a){return String(a).replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n")}class cI extends cE{getJob(a){return this.Job.fromId(this,a)}commandByType(a,b,c){return a.map(a=>{a="waiting"===a?"wait":a;let d=this.toKey(a);switch(a){case"completed":case"failed":case"delayed":case"prioritized":case"repeat":case"waiting-children":return c(d,b?"zcard":"zrange");case"active":case"wait":case"paused":return c(d,b?"llen":"lrange")}})}sanitizeJobTypes(a){let b="string"==typeof a?[a]:a;if(Array.isArray(b)&&b.length>0){let a=[...b];return -1!==a.indexOf("waiting")&&a.push("paused"),[...new Set(a)]}return["active","completed","delayed","failed","paused","prioritized","waiting","waiting-children"]}async count(){return await this.getJobCountByTypes("waiting","paused","delayed","prioritized","waiting-children")}async getRateLimitTtl(a){return this.scripts.getRateLimitTtl(a)}async getDebounceJobId(a){return(await this.client).get(`${this.keys.de}:${a}`)}async getDeduplicationJobId(a){return(await this.client).get(`${this.keys.de}:${a}`)}async getGlobalConcurrency(){let a=await this.client,b=await a.hget(this.keys.meta,"concurrency");return b?Number(b):null}async getGlobalRateLimit(){let a=await this.client,[b,c]=await a.hmget(this.keys.meta,"max","duration");return b&&c?{max:Number(b),duration:Number(c)}:null}async getJobCountByTypes(...a){return Object.values(await this.getJobCounts(...a)).reduce((a,b)=>a+b,0)}async getJobCounts(...a){let b=this.sanitizeJobTypes(a),c=await this.scripts.getCounts(b),d={};return c.forEach((a,c)=>{d[b[c]]=a||0}),d}async recordJobCountsMetric(...a){var b;let c=await this.getJobCounts(...a),d=null==(b=this.opts.telemetry)?void 0:b.meter;if(d&&"function"==typeof d.createGauge){let a=d.createGauge(x.QueueJobsCount,{description:"Number of jobs in the queue by state",unit:"{jobs}"});for(let[b,d]of Object.entries(c))a.record(d,{[w.QueueName]:this.name,[w.QueueJobsState]:b})}return c}getJobState(a){return this.scripts.getState(a)}async getMeta(){let a=await this.client,b=await a.hgetall(this.keys.meta),{concurrency:c,max:d,duration:e,paused:f,"opts.maxLenEvents":g}=b,h=bn(b,["concurrency","max","duration","paused","opts.maxLenEvents"]);return c&&(h.concurrency=Number(c)),g&&(h.maxLenEvents=Number(g)),d&&(h.max=Number(d)),e&&(h.duration=Number(e)),h.paused="1"===f,h}getCompletedCount(){return this.getJobCountByTypes("completed")}getFailedCount(){return this.getJobCountByTypes("failed")}getDelayedCount(){return this.getJobCountByTypes("delayed")}getActiveCount(){return this.getJobCountByTypes("active")}getPrioritizedCount(){return this.getJobCountByTypes("prioritized")}async getCountsPerPriority(a){let b=[...new Set(a)],c=await this.scripts.getCountsPerPriority(b),d={};return c.forEach((a,c)=>{d[`${b[c]}`]=a||0}),d}getWaitingCount(){return this.getJobCountByTypes("waiting")}getWaitingChildrenCount(){return this.getJobCountByTypes("waiting-children")}getWaiting(a=0,b=-1){return this.getJobs(["waiting"],a,b,!0)}getWaitingChildren(a=0,b=-1){return this.getJobs(["waiting-children"],a,b,!0)}getActive(a=0,b=-1){return this.getJobs(["active"],a,b,!0)}getDelayed(a=0,b=-1){return this.getJobs(["delayed"],a,b,!0)}getPrioritized(a=0,b=-1){return this.getJobs(["prioritized"],a,b,!0)}getCompleted(a=0,b=-1){return this.getJobs(["completed"],a,b,!1)}getFailed(a=0,b=-1){return this.getJobs(["failed"],a,b,!1)}async getDependencies(a,b,c,d){let e=this.toKey("processed"==b?`${a}:processed`:`${a}:dependencies`),{items:f,total:g,jobs:h}=await this.scripts.paginate(e,{start:c,end:d,fetchJobs:!0});return{items:f,jobs:h,total:g}}async getRanges(a,b=0,c=1,d=!1){let e=[];this.commandByType(a,!1,(a,b)=>{switch(b){case"lrange":e.push("lrange");break;case"zrange":e.push("zrange")}});let f=await this.scripts.getRanges(a,b,c,d),g=[];return f.forEach((a,b)=>{let c=a||[];g=d&&"lrange"===e[b]?g.concat(c.reverse()):g.concat(c)}),[...new Set(g)]}async getJobs(a,b=0,c=-1,d=!1){let e=this.sanitizeJobTypes(a);return Promise.all((await this.getRanges(e,b,c,d)).map(a=>this.Job.fromId(this,a)))}async getJobLogs(a,b=0,c=-1,d=!0){let e=(await this.client).multi(),f=this.toKey(a+":logs");d?e.lrange(f,b,c):e.lrange(f,-(c+1),-(b+1)),e.llen(f);let g=await e.exec();return d||g[0][1].reverse(),{logs:g[0][1],count:g[1][1]}}async baseGetClients(a){let b=await this.client;try{if(b.isCluster&&"function"==typeof b.nodes){let c=b.nodes(),d=[];for(let b=0;b<c.length;b++){let e=c[b],f="function"==typeof e.clientList?await e.clientList():await e.client("LIST"),g=this.parseClientList(f,a);d.push(g)}return d.reduce((a,b)=>a.length>b.length?a:b,[])}{let c=await b.clientList();return this.parseClientList(c,a)}}catch(a){if(!$.test(a.message))throw a;return[{name:"GCP does not support client list"}]}}getWorkers(){let a=`${this.clientName()}`,b=`${this.clientName()}:w:`;return this.baseGetClients(c=>c&&(c===a||c.startsWith(b)))}async getWorkersCount(){return(await this.getWorkers()).length}async getQueueEvents(){let a=`${this.clientName()}:qe`;return this.baseGetClients(b=>b===a)}async getMetrics(a,b=0,c=-1){let[d,e,f]=await this.scripts.getMetrics(a,b,c);return{meta:{count:parseInt(d[0]||"0",10),prevTS:parseInt(d[1]||"0",10),prevCount:parseInt(d[2]||"0",10)},data:e.map(a=>+a||0),count:f}}parseClientList(a,b){let c=a.split(/\r?\n/),d=[];return c.forEach(a=>{let c={};a.split(" ").forEach(function(a){let b=a.indexOf("="),d=a.substring(0,b),e=a.substring(b+1);c[d]=e});let e=c.name;b(e)&&(c.name=this.name,c.rawname=e,d.push(c))}),d}async exportPrometheusMetrics(a){let b=await this.getJobCounts(),c=[];c.push("# HELP bullmq_job_count Number of jobs in the queue by state"),c.push("# TYPE bullmq_job_count gauge");let d=cH(this.name),e=a?Object.keys(a).reduce((b,c)=>`${b}, ${c}="${cH(a[c])}"`,""):"";for(let[a,f]of Object.entries(b))c.push(`bullmq_job_count{queue="${d}", state="${a}"${e}} ${f}`);let[f,g]=await Promise.all([this.getMetrics("completed"),this.getMetrics("failed")]);return c.push("# HELP bullmq_job_completed_total Total number of completed jobs"),c.push("# TYPE bullmq_job_completed_total counter"),c.push(`bullmq_job_completed_total{queue="${d}"${e}} ${f.meta.count}`),c.push("# HELP bullmq_job_failed_total Total number of failed jobs"),c.push("# TYPE bullmq_job_failed_total counter"),c.push(`bullmq_job_failed_total{queue="${d}"${e}} ${g.meta.count}`),c.join("\n")}}class cJ extends cE{constructor(a,b,c){super(a,b,c),this.repeatStrategy=b.settings&&b.settings.repeatStrategy||cL,this.repeatKeyHashAlgorithm=b.settings&&b.settings.repeatKeyHashAlgorithm||"md5"}async updateRepeatableJob(a,b,c,{override:d}){var e;let f=Object.assign({},c.repeat);null!=f.pattern||(f.pattern=f.cron),delete f.cron;let g=f.count?f.count+1:1;if(void 0!==f.limit&&g>f.limit)return;let h=Date.now(),{endDate:i}=f;if(i&&h>new Date(i).getTime())return;let j=c.prevMillis||0;h=j<h?h:j;let k=await this.repeatStrategy(h,f,a),{every:l,pattern:m}=f,n=!!((l||m)&&f.immediately),o=n&&l?h-k:void 0;if(k){let h;!j&&c.jobId&&(f.jobId=c.jobId);let p=cK(a,f),q=null!=(e=c.repeat.key)?e:this.hash(p);if(d)h=await this.scripts.addRepeatableJob(q,k,{name:a,endDate:i?new Date(i).getTime():void 0,tz:f.tz,pattern:m,every:l},p);else{let a=await this.client;h=await this.scripts.updateRepeatableJobMillis(a,q,k,p)}let{immediately:r}=f,s=bn(f,["immediately"]);return this.createNextJob(a,k,h,Object.assign(Object.assign({},c),{repeat:Object.assign({offset:o},s)}),b,g,n)}}async createNextJob(a,b,c,d,e,f,g){let h=this.getRepeatJobKey(a,b,c,e),i=Date.now(),j=b+(d.repeat.offset?d.repeat.offset:0)-i,k=Object.assign(Object.assign({},d),{jobId:h,delay:j<0||g?0:j,timestamp:i,prevMillis:b,repeatJobKey:c});return k.repeat=Object.assign(Object.assign({},d.repeat),{count:f}),this.Job.create(this,a,e,k)}getRepeatJobKey(a,b,c,d){return c.split(":").length>2?this.getRepeatJobId({name:a,nextMillis:b,namespace:this.hash(c),jobId:null==d?void 0:d.id}):this.getRepeatDelayedJobId({customKey:c,nextMillis:b})}async removeRepeatable(a,b,c){var d;let e=cK(a,Object.assign(Object.assign({},b),{jobId:c})),f=null!=(d=b.key)?d:this.hash(e),g=this.getRepeatJobId({name:a,nextMillis:"",namespace:this.hash(e),jobId:null!=c?c:b.jobId,key:b.key});return this.scripts.removeRepeatable(g,e,f)}async removeRepeatableByKey(a){let b=this.keyToData(a),c=this.getRepeatJobId({name:b.name,nextMillis:"",namespace:this.hash(a),jobId:b.id});return this.scripts.removeRepeatable(c,"",a)}async getRepeatableData(a,b,c){let d=await a.hgetall(this.toKey("repeat:"+b));return d?{key:b,name:d.name,endDate:parseInt(d.endDate)||null,tz:d.tz||null,pattern:d.pattern||null,every:d.every||null,next:c}:this.keyToData(b,c)}keyToData(a,b){let c=a.split(":"),d=c.slice(4).join(":")||null;return{key:a,name:c[0],id:c[1]||null,endDate:parseInt(c[2])||null,tz:c[3]||null,pattern:d,next:b}}async getRepeatableJobs(a=0,b=-1,c=!1){let d=await this.client,e=this.keys.repeat,f=c?await d.zrange(e,a,b,{WITHSCORES:!0}):await d.zrevrange(e,a,b,{WITHSCORES:!0}),g=[];for(let a=0;a<f.length;a+=2)g.push(this.getRepeatableData(d,f[a],parseInt(f[a+1])));return Promise.all(g)}async getRepeatableCount(){return(await this.client).zcard(this.toKey("repeat"))}hash(a){return(0,M.createHash)(this.repeatKeyHashAlgorithm).update(a).digest("hex")}getRepeatDelayedJobId({nextMillis:a,customKey:b}){return`repeat:${b}:${a}`}getRepeatJobId({name:a,nextMillis:b,namespace:c,jobId:d,key:e}){let f=null!=e?e:this.hash(`${a}${d||""}${c}`);return`repeat:${f}:${b}`}}function cK(a,b){let c=b.endDate?new Date(b.endDate).getTime():"",d=b.tz||"",e=b.pattern||String(b.every)||"",f=b.jobId?b.jobId:"";return`${a}:${f}:${c}:${d}:${e}`}let cL=(a,b)=>{let c=b.pattern;if(c&&b.every)throw Error("Both .pattern and .every options are defined for this repeatable job");if(b.every)return Math.floor(a/b.every)*b.every+(b.immediately?0:b.every);let d=new Date(b.startDate&&new Date(b.startDate)>new Date(a)?b.startDate:a),e=(0,cC.parseExpression)(c,Object.assign(Object.assign({},b),{currentDate:d}));try{if(b.immediately)return new Date().getTime();return e.next().getTime()}catch(a){}};class cM extends cI{constructor(a,b,c){var d;super(a,Object.assign({},b),c),this.token=function(){if("function"==typeof M.randomUUID)return(0,M.randomUUID)();let a=(0,M.randomBytes)(16);return a[6]=15&a[6]|64,a[8]=63&a[8]|128,[a.toString("hex",0,4),a.toString("hex",4,6),a.toString("hex",6,8),a.toString("hex",8,10),a.toString("hex",10,16)].join("-")}(),this.libName="bullmq",this.jobsOpts=null!=(d=null==b?void 0:b.defaultJobOptions)?d:{},this.waitUntilReady().then(a=>{if(!this.closing&&!(null==b?void 0:b.skipMetasUpdate))return a.hset(this.keys.meta,this.metaValues)}).catch(a=>{})}emit(a,...b){return super.emit(a,...b)}off(a,b){return super.off(a,b),this}on(a,b){return super.on(a,b),this}once(a,b){return super.once(a,b),this}get defaultJobOptions(){return Object.assign({},this.jobsOpts)}get metaValues(){var a,b,c,d;return{"opts.maxLenEvents":null!=(d=null==(c=null==(b=null==(a=this.opts)?void 0:a.streams)?void 0:b.events)?void 0:c.maxLen)?d:1e4,version:`${this.libName}:${bh}`}}async getVersion(){let a=await this.client;return await a.hget(this.keys.meta,"version")}get repeat(){return new Promise(async a=>{this._repeat||(this._repeat=new cJ(this.name,Object.assign(Object.assign({},this.opts),{connection:await this.client})),this._repeat.on("error",this.emit.bind(this,"error"))),a(this._repeat)})}get jobScheduler(){return new Promise(async a=>{this._jobScheduler||(this._jobScheduler=new cF(this.name,Object.assign(Object.assign({},this.opts),{connection:await this.client})),this._jobScheduler.on("error",this.emit.bind(this,"error"))),a(this._jobScheduler)})}async setGlobalConcurrency(a){return(await this.client).hset(this.keys.meta,{concurrency:a})}async setGlobalRateLimit(a,b){return(await this.client).hset(this.keys.meta,{max:a,duration:b})}async removeGlobalConcurrency(){return(await this.client).hdel(this.keys.meta,"concurrency")}async removeGlobalRateLimit(){return(await this.client).hdel(this.keys.meta,"max","duration")}async add(a,b,c){return this.trace(y.PRODUCER,"add",`${this.name}.${a}`,async(d,e)=>{var f;!e||(null==(f=null==c?void 0:c.telemetry)?void 0:f.omitContext)||(c=Object.assign(Object.assign({},c),{telemetry:{metadata:e}}));let g=await this.addJob(a,b,c);return null==d||d.setAttributes({[w.JobName]:a,[w.JobId]:g.id}),g})}async addJob(a,b,c){if(c&&c.repeat){if(c.repeat.endDate&&+new Date(c.repeat.endDate)<Date.now())throw Error("End date must be greater than current timestamp");return(await this.repeat).updateRepeatableJob(a,b,Object.assign(Object.assign({},this.jobsOpts),c),{override:!0})}{let d=null==c?void 0:c.jobId;if("0"==d||(null==d?void 0:d.startsWith("0:")))throw Error("JobId cannot be '0' or start with 0:");let e=Object.assign(Object.assign(Object.assign({},this.jobsOpts),c),{jobId:d}),f=await this.Job.create(this,a,b,e);return this.emit("waiting",f),f}}async addBulk(a){return this.trace(y.PRODUCER,"addBulk",this.name,async(b,c)=>(b&&b.setAttributes({[w.BulkNames]:a.map(a=>a.name),[w.BulkCount]:a.length}),await this.Job.createBulk(this,a.map(a=>{var b,d,e,f,g,h;let i=null==(b=a.opts)?void 0:b.telemetry;if(c){let b=null==(e=null==(d=a.opts)?void 0:d.telemetry)?void 0:e.omitContext,h=(null==(g=null==(f=a.opts)?void 0:f.telemetry)?void 0:g.metadata)||!b&&c;(h||b)&&(i={metadata:h,omitContext:b})}let j=Object.assign(Object.assign(Object.assign({},this.jobsOpts),a.opts),{jobId:null==(h=a.opts)?void 0:h.jobId,telemetry:i});return{name:a.name,data:a.data,opts:j}}))))}async upsertJobScheduler(a,b,c){var d,e;if(b.endDate&&+new Date(b.endDate)<Date.now())throw Error("End date must be greater than current timestamp");return(await this.jobScheduler).upsertJobScheduler(a,b,null!=(d=null==c?void 0:c.name)?d:a,null!=(e=null==c?void 0:c.data)?e:{},Object.assign(Object.assign({},this.jobsOpts),null==c?void 0:c.opts),{override:!0})}async pause(){await this.trace(y.INTERNAL,"pause",this.name,async()=>{await this.scripts.pause(!0),this.emit("paused")})}async close(){await this.trace(y.INTERNAL,"close",this.name,async()=>{!this.closing&&this._repeat&&await this._repeat.close(),await super.close()})}async rateLimit(a){await this.trace(y.INTERNAL,"rateLimit",this.name,async b=>{null==b||b.setAttributes({[w.QueueRateLimit]:a}),await this.client.then(b=>b.set(this.keys.limiter,Number.MAX_SAFE_INTEGER,{PX:a}))})}async resume(){await this.trace(y.INTERNAL,"resume",this.name,async()=>{await this.scripts.pause(!1),this.emit("resumed")})}async isPaused(){let a=await this.client;return 1===await a.hexists(this.keys.meta,"paused")}isMaxed(){return this.scripts.isMaxed()}async getRepeatableJobs(a,b,c){return(await this.repeat).getRepeatableJobs(a,b,c)}async getJobScheduler(a){return(await this.jobScheduler).getScheduler(a)}async getJobSchedulers(a,b,c){return(await this.jobScheduler).getJobSchedulers(a,b,c)}async getJobSchedulersCount(){return(await this.jobScheduler).getSchedulersCount()}async removeRepeatable(a,b,c){return this.trace(y.INTERNAL,"removeRepeatable",`${this.name}.${a}`,async d=>{null==d||d.setAttributes({[w.JobName]:a,[w.JobId]:c});let e=await this.repeat;return!await e.removeRepeatable(a,b,c)})}async removeJobScheduler(a){let b=await this.jobScheduler;return!await b.removeJobScheduler(a)}async removeDebounceKey(a){return this.trace(y.INTERNAL,"removeDebounceKey",`${this.name}`,async b=>{null==b||b.setAttributes({[w.JobKey]:a});let c=await this.client;return await c.del(`${this.keys.de}:${a}`)})}async removeDeduplicationKey(a){return this.trace(y.INTERNAL,"removeDeduplicationKey",`${this.name}`,async b=>(null==b||b.setAttributes({[w.DeduplicationKey]:a}),(await this.client).del(`${this.keys.de}:${a}`)))}async removeRateLimitKey(){return(await this.client).del(this.keys.limiter)}async removeRepeatableByKey(a){return this.trace(y.INTERNAL,"removeRepeatableByKey",`${this.name}`,async b=>{null==b||b.setAttributes({[w.JobKey]:a});let c=await this.repeat;return!await c.removeRepeatableByKey(a)})}async remove(a,{removeChildren:b=!0}={}){return this.trace(y.INTERNAL,"remove",this.name,async c=>{null==c||c.setAttributes({[w.JobId]:a,[w.JobOptions]:JSON.stringify({removeChildren:b})});let d=await this.scripts.remove(a,b);return 1===d&&this.emit("removed",a),d})}async updateJobProgress(a,b){await this.trace(y.INTERNAL,"updateJobProgress",this.name,async c=>{null==c||c.setAttributes({[w.JobId]:a,[w.JobProgress]:JSON.stringify(b)}),await this.scripts.updateProgress(a,b),this.emit("progress",a,b)})}async addJobLog(a,b,c){return bp.addJobLog(this,a,b,c)}async drain(a=!1){await this.trace(y.INTERNAL,"drain",this.name,async b=>{null==b||b.setAttributes({[w.QueueDrainDelay]:a}),await this.scripts.drain(a)})}async clean(a,b,c="completed"){return this.trace(y.INTERNAL,"clean",this.name,async d=>{let e=b||1/0,f=Math.min(1e4,e),g=Date.now()-a,h=0,i=[],j="waiting"===c?"wait":c;for(;h<e;){let a=await this.scripts.cleanJobsInSet(j,g,f);if(this.emit("cleaned",a,j),h+=a.length,i.push(...a),a.length<f)break}return null==d||d.setAttributes({[w.QueueGrace]:a,[w.JobType]:c,[w.QueueCleanLimit]:e,[w.JobIds]:i}),i})}async obliterate(a){await this.trace(y.INTERNAL,"obliterate",this.name,async()=>{await this.pause();let b=0;do b=await this.scripts.obliterate(Object.assign({force:!1,count:1e3},a));while(b)})}async retryJobs(a={}){await this.trace(y.PRODUCER,"retryJobs",this.name,async b=>{null==b||b.setAttributes({[w.QueueOptions]:JSON.stringify(a)});let c=0;do c=await this.scripts.retryJobs(a.state,a.count,a.timestamp);while(c)})}async promoteJobs(a={}){await this.trace(y.INTERNAL,"promoteJobs",this.name,async b=>{null==b||b.setAttributes({[w.QueueOptions]:JSON.stringify(a)});let c=0;do c=await this.scripts.promoteJobs(a.count);while(c)})}async trimEvents(a){return this.trace(y.INTERNAL,"trimEvents",this.name,async b=>{null==b||b.setAttributes({[w.QueueEventMaxLength]:a});let c=await this.client;return await c.xtrim(this.keys.events,"MAXLEN",a,{approximate:!0})})}async removeDeprecatedPriorityKey(){return(await this.client).del(this.toKey("priority"))}async removeOrphanedJobs(a=1e3,b=0){let c=await this.client,d=new Set(Object.keys(this.keys)),e=Object.keys(this.keys).filter(a=>""!==a),f=["logs","dependencies","processed","failed","unsuccessful","lock"],g=this.qualifiedName+":",h=g+"*",i=0,j="0";do{let[k,l]=await c.scan(j,{MATCH:h,COUNT:a});j=k;let m=new Set;for(let a of l){let b=a.slice(g.length);if(d.has(b))continue;let c=b.indexOf(":");if(-1!==c){let a=b.slice(0,c);if(d.has(a))continue}let e=-1===c?b:b.slice(0,c);if(-1!==c){let a=b.slice(c+1);if(!f.includes(a))continue}m.add(e)}if(0===m.size)continue;if(i+=await this.scripts.removeOrphanedJobs([...m],e,f)||0,b>0&&i>=b)break}while("0"!==j)return i}}a.i(522734),a.i(792509),(r=I||(I={})).blocking="blocking",r.normal="normal";let cN=new bt.default(process.env.REDIS_URL||"redis://:redispassword123@localhost:6379",{maxRetriesPerRequest:null});new cM("pm-agent-queue",{connection:cN});let cO=new cM("audit-queue",{connection:cN});a.s(["auditQueue",0,cO],224830)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__1irmsvd._.js.map