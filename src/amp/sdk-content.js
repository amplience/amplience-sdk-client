(function () {

    var payloadSize = 10;

    amp.content = function (assets, win, fail, timeout) {
        var timeout = timeout || 60000;

        if (!isArray(assets)) {
            assets = [assets];
        }

        payloader(assets, timeout, function(wins,fails){
            if(wins.length>0) {
                win(formatPayloadResponse(wins));
            }
            if(fails.length>0) {
                fail(fails);
            }
        });
    };

    var formatPayloadResponse = function(response) {
        var data = [];
        for(var i=0;i<response.length;i++) {
            var payloads = response[i].result.payload;
            for (var p = 0; p < payloads.length; p++) {
                var payload = payloads[p];
                payload.name = payload.key.split('/');
                payload.name = payload.name[payload.name.length-1];
                data.push(payload);
            }
        }
        return data;
    };

    var buildContentUrl = function (name) {
        return amp.conf.content_basepath + 'c/' + amp.conf.client_id + '/' + name+'.js';
    };

    var buildPayloadUrl = function (assets) {
        return amp.conf.content_basepath + 'p/' + amp.conf.client_id + '/[' + generateContentArray(assets) + '].js';
    };

    var payloader = function(assets, timeout, finished) {
        var wins = [];
        var fails = [];
        var it = Math.ceil(assets.length/payloadSize);

        var onWin = function(name,result) {
            wins.push({name:name,result:result});
            doneYet();
        };

        var onFail = function (name,result) {
            fails.push({name:name,result:result});
            doneYet();
        };

        var doneYet = function() {
            if(wins.length + fails.length === it) {
                if(finished) {
                    finished(wins,fails);
                }
            }
        };

        for(var i=0;i<it;i++) {
            var array = assets.slice(i*payloadSize,(i*payloadSize)+payloadSize);
            amp.jsonp(buildPayloadUrl(assets),array.join(','),onWin,onFail, timeout);
        }
    };

    var generateContentArray = function(assets) {
        var s = '';
        var a = [];
        for(var i=0; i<assets.length;i++) {
            a.push('"/c//' + assets[i] +'"');
        }
        return a.join(',');
    }

}());