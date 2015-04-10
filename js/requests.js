(function() {
  var clear, flush, held, holdRequest, makeRequest, waitingOnConfirm,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (!window.Offline) {
    throw new Error("Requests module brought in without offline.js");
  }

  held = [];

  waitingOnConfirm = false;

  holdRequest = function(req) {
    Offline.trigger('requests:capture');
    if (Offline.state !== 'down') {
      waitingOnConfirm = true;
    }
    return held.push(req);
  };

  makeRequest = function(arg) {
    var body, name, password, ref, type, url, user, val, xhr;
    xhr = arg.xhr, url = arg.url, type = arg.type, user = arg.user, password = arg.password, body = arg.body;
    xhr.abort();
    xhr.open(type, url, true, user, password);
    ref = xhr.headers;
    for (name in ref) {
      val = ref[name];
      xhr.setRequestHeader(name, val);
    }
    if (xhr.mimeType) {
      xhr.overrideMimeType(xhr.mimeType);
    }
    return xhr.send(body);
  };

  clear = function() {
    return held = [];
  };

  flush = function() {
    var i, key, len, request, requests, url;
    Offline.trigger('requests:flush');
    requests = {};
    for (i = 0, len = held.length; i < len; i++) {
      request = held[i];
      url = request.url.replace(/(\?|&)_=[0-9]+/, function(match, char) {
        if (char === '?') {
          return char;
        } else {
          return '';
        }
      });
      requests[(request.type.toUpperCase()) + " - " + url] = request;
    }
    for (key in requests) {
      request = requests[key];
      makeRequest(request);
    }
    return clear();
  };

  setTimeout(function() {
    if (Offline.getOption('requests') !== false) {
      Offline.on('confirmed-up', function() {
        if (waitingOnConfirm) {
          waitingOnConfirm = false;
          return clear();
        }
      });
      Offline.on('up', flush);
      Offline.on('down', function() {
        return waitingOnConfirm = false;
      });
      Offline.onXHR(function(request) {
        var _onreadystatechange, _send, async, extension, hold, requestFilters, url, xhr;
        xhr = request.xhr, async = request.async, url = request.url;
        if (xhr.offline === false) {
          return;
        }
        requestFilters = Offline.getOption('requestFilters');
        extension = url.split('.').pop().split('?')[0];
        if (indexOf.call(requestFilters, extension) >= 0) {
          console.log('block ', url);
          return;
        }
        console.log('authorize', url);
        hold = function() {
          return holdRequest(request);
        };
        _send = xhr.send;
        xhr.send = function(body) {
          request.body = body;
          return _send.apply(xhr, arguments);
        };
        if (!async) {
          return;
        }
        if (xhr.onprogress === null) {
          xhr.addEventListener('error', hold, false);
          return xhr.addEventListener('timeout', hold, false);
        } else {
          _onreadystatechange = xhr.onreadystatechange;
          return xhr.onreadystatechange = function() {
            if (xhr.readyState === 0) {
              hold();
            } else if (xhr.readyState === 4 && (xhr.status === 0 || xhr.status >= 12000)) {
              hold();
            }
            return typeof _onreadystatechange === "function" ? _onreadystatechange.apply(null, arguments) : void 0;
          };
        }
      });
      return Offline.requests = {
        flush: flush,
        clear: clear
      };
    }
  }, 0);

}).call(this);

//# sourceMappingURL=requests.js.map
