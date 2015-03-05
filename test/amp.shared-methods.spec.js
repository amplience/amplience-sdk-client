describe('amp.shared-methods', function(){

    beforeEach(function(){

        amp.init({
            client_id: "fake_client",
            di_basepath: "http://example.com/"
        });

    });

    it('should convert an object to a querystring', function(){

        var url = 'http://www.test.com/test.html?'
        var name = 'moon';
        function movingCacheWindow (){
            return 1389700800000;
        }

        var fullUrl = url + $.sharedMethods._utils._buildQueryString({deep:true, timestamp: movingCacheWindow(), arg: "'"+name+"'", func:"amp.jsonReturn"});

        var afu = fullUrl.match(/([^?=&]+)(=([^&]*))?/g);
        afu.shift();

        var qs = afu.reduce(function(p, c){
            var parts = c.split('=') ;
            p[parts[0]] = parts[1];
            return p;
        }, {});

        expect(qs['deep']).toEqual('true');
        expect(qs['timestamp']).toEqual('1389700800000');
        expect(qs['arg']).toEqual("'moon'");
        expect(qs['func']).toEqual("amp.jsonReturn");
    });

    it('should convert a querystring to an array', function(){

        var qs = "deep=true&timestamp=1389700800000&arg='moon'&func=amp.jsonReturn";

        var a = $.sharedMethods._utils._querystringToArray(qs);

        expect(a[0].deep).toEqual('true');
        expect(a[1].timestamp).toEqual('1389700800000');
        expect(a[2].arg).toEqual("'moon'");
        expect(a[3].func).toEqual("amp.jsonReturn");
    });
});
