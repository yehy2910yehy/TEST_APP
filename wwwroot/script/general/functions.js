var func = (function () {
    "use strict";
    //  console.log("common  functions");
    function bytesToSize(bytes, decimalPoint) {
        if (bytes === 0) return '0 Bytes';
        var k = 1000,
            dm = decimalPoint || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };
    var isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i) !== null;
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i) !== null;
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i) !== null;
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i) !== null;
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i) !== null;
        },
        any: function () {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    //function isValidEmailAddress(emailAddress) {
    //    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    //    return pattern.test(emailAddress);
    //}
    function isValidEmailAddress(emailAddress) {
        var pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return pattern.test(emailAddress);
    }
    window.addEventListener('resize', function (e) { $(window).trigger("resize"); });
    function browser() {
        // Return cached result if avalible, else get result then cache it.
        if (browser.prototype._cachedResult)
            return browser.prototype._cachedResult;
        // Opera 8.0+
        var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        // Firefox 1.0+
        var isFirefox = typeof InstallTrigger !== 'undefined';
        // Safari 3.0+ "[object HTMLElementConstructor]" 
        var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
        // Internet Explorer 6-11
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        // Edge 20+
        var isEdge = !isIE && !!window.StyleMedia;
        // Chrome 1+
        var isChrome = !!window.chrome && !!window.chrome.webstore;
        // Blink engine detection
        var isBlink = (isChrome || isOpera) && !!window.CSS;
        return browser.prototype._cachedResult =
            isOpera ? 'Opera' :
                isFirefox ? 'Firefox' :
                    isSafari ? 'Safari' :
                        isChrome ? 'Chrome' :
                            isIE ? 'IE' :
                                isEdge ? 'Edge' :
                                    isBlink ? 'Blink' : "Don't know";
    }
    function copyToClipboard(text) {
        if (window.clipboardData && window.clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            return clipboardData.setData("Text", text);
        }
        else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = text;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy"); // Security exception may be thrown by some browsers.
            } catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }
    function convertUrlToBlob(url) {
        var def = $.Deferred();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
            if (this.status === 200) {
                var myBlob = this.response;
                def.resolve(myBlob);
            }
            else
                def.reject(this.status);
        };
        xhr.send();
        return def.promise();
    }
    //#region download
    function readAttachement(disposition) {
        var def = $.Deferred();
        var splited = disposition?.split(';');
        for (var i = 0; i < splited.length; i++) {
            var actual = splited[i];
            var keyVal = actual.split("=");
            if (keyVal[0]?.contains("filename"))
                if (!isEmpty(keyVal[1])) {
                    var clean = keyVal[1].replace(/[/\\?%*:|"<>]/g, '');
                    def.resolve(clean);
                }
        }
         def.resolve("NoName");
        return def.promise();
    }
    function ajaxPOSTDownload(url, progressEvName = null, body = null) {
        var def = $.Deferred();
        var request = new XMLHttpRequest();
        if (progressEvName !== null) {
            request.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percent = Math.round((evt.loaded * 100) / evt.total);
                    $.event.trigger({ type: progressEvName, value: percent});
                }
            }, false);
        }
        // use onreadystatechange so we can set  request.responseType
        // if error => text if success type=> blob
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    // get file name
                    var disposition = request.getResponseHeader('content-disposition');
                  //  var matches = /"([^"]*)"/.exec(disposition);
                  //  var filename = (matches != null && matches[1] ? matches[1] : 'noName');
                    var blob = new Blob([request.response]);
                    var url = window.URL.createObjectURL(blob);
                    readAttachement(disposition)
                        .then(function (fileName) { def.resolve({ url, filename: fileName}); });
                } else if (request.responseText != "") {
                    def.reject(request.responseText);
                }
            }
            else if (request.readyState == 2) {
                if (request.status == 200)
                    request.responseType = "blob"; //"blob"
                else
                    request.responseType = 'text';
            }
        };
        // use post for download too
        request.open('POST', url, true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        if (body == null)
            request.send();
        else
            request.send(body);
        return def.promise();
    }
    function saveBlob(blobUrl, filename) {
        var a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.append(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
    }
     //#endregion download
    function removeMultiplesWSpace(text) {
        return text.replace(/\s\s+/g, ' ');
    }
    function removeNonDigit(text) {
        return text.replace(/\D/g, '');
    }
    function removeDigit(text) {
        return text.replace(/[0-9]/g, '');
    }
    function isEmpty(x) {
        return (x === null
            || typeof x === 'undefined'
            || x === 'undefined'
            || x === false  //same as: !x
            || x.length === 0
            || x === "");
    }
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (search, pos) {
            return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
        };
    }
    if (!String.prototype.contains) {
        String.prototype.contains = function (txt) {
            return this.indexOf(txt) !== -1;
        };
    }
    if (!String.prototype.isEmpty) {
        String.prototype.isEmpty = function () {
            return !this || this.length === 0;
        };
    }
    function IsAnyFocus(elem) {
        var mouseOver = $(elem).is(':hover');
        var formElem = $(elem).find('input').is(':focus');
        var formLink = $(elem).find('a').is(':focus');
        var formBtn = $(elem).find('button').is(':focus');
        return mouseOver || formElem || formLink || formBtn;
    }
    function elemIsOut(elem) {
        var w = $(window).width();
        var h = $(window).height();
        var elemPos = elem.offset();
        if (elemPos.top >= 0
            && elemPos.top <= h
            && elemPos.left >= 0
            && elemPos.left <= w)
            return false;
        else
            return true;
    }
    function formatDate(value) {
        var d = new Date(value);
        var day = d.getDate();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();
        if (day < 10) {
            day = "0" + day;
        }
        if (month < 10) {
            month = "0" + month;
        }
        var date = day + "/" + month + "/" + year;
        return date;
    }
    function formatDateHeure(value) {
        var d = new Date(value);
        var day = d.getDate();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();
        if (day < 10) {
            day = "0" + day;
        }
        if (month < 10) {
            month = "0" + month;
        }
        var date = day + "/" + month + "/" + year;
        var heure = `${d.getHours()}:${d.getMinutes()}`;
        return `${date} ${heure}`;
    }
    function getValueFromUrl(key, url = null) {

 
        var def = window.location.hash.length > 0 ? window.location.hash : window.location.href;
       
        var url = url || def;

      

        if (!url.contains('?'))
            return null;
        var keyArray = new Array();
       
        const queryString = url.split('?');
        var args = queryString[1].split('&');
        for (var i = 0; i < args.length; i++) {
            var keyVal = args[i].split('=');
            var obj = new Object();
            obj.key = keyVal[0] || null;
            obj.value = keyVal[1] || null;
            keyArray.push(obj);
        }
       
        return keyArray.find(x => x.key === key).value;
    }

    function removeArgFromUrl(key) {

        var def = window.location.hash.length > 0 ? window.location.hash : window.location.href;
        var url = url || def;

        if (!url.contains('?'))
            return null;
        const queryString = url.split('?');
        var args = queryString[1].split('&');
        var segToRemove;
        for (var i = 0; i < args.length; i++) {
            var keyVal = args[i].split('=');
            if (keyVal[0] === key) {
                segToRemove = args[i];
                break;
            }
        }
        var indexStart = url.indexOf(segToRemove) - 1;
        var indexEnd = indexStart + segToRemove.length + 1;
        var toRemove = url.substring(indexStart, indexEnd);
        var myNewURL = url.replace(toRemove, '');
     
        window.history.replaceState({}, document.title, myNewURL);
    }
    function getTime()
    {
        var now = new Date();
        return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    }
    function getDate() {
        var now = new Date();
        // add +1 to month (0-11) =>(1-12)
        return `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
    }
    function getDateTime() {
        var now = new Date();
           // add +1 to month (0-11) =>(1-12)
        return `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}, ${now.getHours()}:${now.getMinutes()}`;
    }
    function hasDuplicates(array) {
        var valuesSoFar = [];
        for (var i = 0; i < array.length; ++i) {
            var value = array[i];
            if (valuesSoFar.indexOf(value) !== -1) {
                return true;
            }
            valuesSoFar.push(value);
        }
        return false;
    }
    function isIp(ip) {
        var ipV4V6Regex = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/g;
        return ipV4V6Regex.test(ip);
    }


    function getSubElement(id) {
        var elems = document.querySelectorAll(id);
        console.log(elems);
    }

    function generGuid() {

        function _p8(s) {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    }


    function deepCopy(target, ...sources) {
        sources.forEach(source => {
            let descriptors = Object.keys(source).reduce((descriptors, key) => {
                descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
                return descriptors;
            }, {});
            // Par défaut, Object.assign copie également
            // les symboles énumérables
            Object.getOwnPropertySymbols(source).forEach(sym => {
                let descriptor = Object.getOwnPropertyDescriptor(source, sym);
                if (descriptor.enumerable) {
                    descriptors[sym] = descriptor;
                }
            });
            Object.defineProperties(target, descriptors);
        });
        return target;
    }


    function groupBy(list, keyGetter) {
        const map = new Map();
        list.forEach((item) => {
            const key = keyGetter(item);
            const collection = map.get(key);
            if (!collection) {
                map.set(key, [item]);
            } else {
                collection.push(item);
            }
        });
        return map;
    }

    return {
        bytesToSize: bytesToSize,
        removeMultiplesWSpace: removeMultiplesWSpace,
        removeNonDigit: removeNonDigit,
        removeDigit: removeDigit,
        isMailValid: isValidEmailAddress,
        isIp: isIp,
        isMobile: isMobile,
        getBrowser: browser,
        GetDate: getDate,
        GetTime: getTime,
        GetDateTime:getDateTime,
        FormatDate: formatDate,
        FormatDateHeure: formatDateHeure,
        copyToClipboard: copyToClipboard,
        convertUrlToBlob: convertUrlToBlob,
        isEmpty: isEmpty,
        isAnyFocus: IsAnyFocus,
        GetValFormUrl: getValueFromUrl,
        RemoveArgFormUrl: removeArgFromUrl,
        HasDuplicates: hasDuplicates,
        ajaxPOSTDownload: ajaxPOSTDownload,
        SaveBlob: saveBlob,
        GetSubElement: getSubElement,
        Guid: generGuid,
        DeepCopy: deepCopy,
        GroupBy: groupBy
    };
}());