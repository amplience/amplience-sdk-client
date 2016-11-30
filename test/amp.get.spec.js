
describe('amp.get', function(){

    var scriptMock = function(){
    };
    scriptMock.prototype.dispose = function(){
        this.disposed = true;
    };
    scriptMock.prototype.success = function(value){
        eval(value);
    };
    scriptMock.prototype.fail = function(){
        if(this.onerror){
            this.onerror();
        }
    };

    var resultMock = null;
    beforeEach(function(){
        jasmine.Clock.useMock();
        resultMock = new scriptMock();
        spyOn(amp.get,'createScript').andCallFake(function(src, onerror){
            return resultMock;
        });
        amp.init({
            client_id: "fake_client",
            di_basepath: "http://example.com/",
            stats: [function(dom,type,event,value){},function(dom,type,event,value){}]
        });
    });


    it('should return media information when request is successful',function(){
        var f = jasmine.getJSONFixtures();
        f.fixturesPath = 'base';
        var fixture = loadJSONFixtures('test/fixtures/amp.get/response.success.json')['test/fixtures/amp.get/response.success.json'];

        var success= jasmine.createSpy();
        var fail= jasmine.createSpy();

        amp.get({"type":"s","name":"image_group"},success,fail);
        resultMock.success("amp.jsonReturn('image_group', " + JSON.stringify(fixture) + ")");

        expect(success).toHaveBeenCalled();
        expect(fail).not.toHaveBeenCalled();
        expect(success.mostRecentCall.args[0].image_group).toEqual(fixture);
        expect(resultMock.disposed).toBeTruthy();
    });

    xit('should fail when jsonp takes too long to return. (Internet Explorer onerror not firing bug)',function(){
        var success= jasmine.createSpy();
        var fail= jasmine.createSpy();

        amp.get({"type":"s","name":"image_group2"},success,fail);
        jasmine.Clock.tick(10001);

        expect(success).not.toHaveBeenCalled();
        expect(fail).toHaveBeenCalled();
        expect(resultMock.disposed).toBeTruthy();
    });

    xit('should not call success callback if timeout has already triggered',function(){
        var success= jasmine.createSpy();
        var fail= jasmine.createSpy();
        var fixture = loadJSONFixtures('test/fixtures/amp.get/response.success.json')['test/fixtures/amp.get/response.success.json'];

        amp.get({"type":"s","name":"image_group3"},success,fail);
        jasmine.Clock.tick(10001);
        resultMock.success("amp.jsonReturn('image_group3', " + JSON.stringify(fixture) + ")");

        expect(success).not.toHaveBeenCalled();
        expect(fail).toHaveBeenCalled();
        expect(resultMock.disposed).toBeTruthy();
    });

    it('should call the fail callback if the server responds with an error',function(){
        var success = jasmine.createSpy();
        var fail = jasmine.createSpy();
        var fixture = loadJSONFixtures('test/fixtures/amp.get/response.error.json')['test/fixtures/amp.get/response.error.json'];

        amp.get({"type":"s","name":"image_group4"},success,fail);
        resultMock.success("amp.jsonReturn('image_group4', " + JSON.stringify(fixture) + ")");

        expect(success).not.toHaveBeenCalled();
        expect(fail).toHaveBeenCalled();
        expect(resultMock.disposed).toBeTruthy();
    });

    xit('should call the fail callback after 10 seconds if we receive an empty response',function(){
        var success = jasmine.createSpy();
        var fail = jasmine.createSpy();

        amp.get({"type":"s","name":"image_group5"},success,fail);
        jasmine.Clock.tick(10001);
        resultMock.success("");

        expect(success).not.toHaveBeenCalled();
        expect(fail).toHaveBeenCalled();
        expect(resultMock.disposed).toBeTruthy();
    });

    //no longer throws an exception
    xit('should throw an exception if an invalid asset is requested',function(){
        var success= jasmine.createSpy();
        var fail= jasmine.createSpy();

        expect(function(){
            amp.get({"name":"image_group6"},success,fail);
        }).toThrow();
    });

    //no longer throws an exception
    xit('should throw an exception if one of multiple requested assets is invalid',function(){
        var success= jasmine.createSpy();
        var fail= jasmine.createSpy();

        expect(function(){
            amp.get([{"type":"s","name":"image_group7"},{"name":"image_group8"}],success,fail);
        }).toThrow();
    });

    it('should return media information for multiple assets when an array of assets is requested',function(){
        var f = jasmine.getJSONFixtures();
        f.fixturesPath = 'base';
        var fixture1 = loadJSONFixtures('test/fixtures/amp.get/multiResponse1.success.json')['test/fixtures/amp.get/multiResponse1.success.json'];
        var fixture2 = loadJSONFixtures('test/fixtures/amp.get/multiResponse2.success.json')['test/fixtures/amp.get/multiResponse2.success.json'];

        var success = jasmine.createSpy();
        var fail = jasmine.createSpy();
        amp.get([{"type":"s","name":"image_group_multi1"}, {"type":"s","name":"image_group_multi2"}],success,fail);

        resultMock.success("amp.jsonReturn('image_group_multi1', " + JSON.stringify(fixture1) + ")");
        resultMock.success("amp.jsonReturn('image_group_multi2', " + JSON.stringify(fixture2) + ")");

        expect(success).toHaveBeenCalled();
        expect(fail).not.toHaveBeenCalled();
        expect(success.mostRecentCall.args[0].image_group_multi1).toEqual(fixture1);
        expect(success.mostRecentCall.args[0].image_group_multi2).toEqual(fixture2);
        expect(resultMock.disposed).toBeTruthy();
    });

    it('should call both the success and failure callbacks when two assets are requested and one fails',function(){
        var f = jasmine.getJSONFixtures();
        f.fixturesPath = 'base';
        var fixture1 = loadJSONFixtures('test/fixtures/amp.get/multiResponse3.success.json')['test/fixtures/amp.get/multiResponse3.success.json'];
        var fixture2 = loadJSONFixtures('test/fixtures/amp.get/multiResponse4.error.json')['test/fixtures/amp.get/multiResponse4.error.json'];

        var success= jasmine.createSpy();
        var fail= jasmine.createSpy();
        amp.get([{"type":"s","name":"image_group_multi3"}, {"type":"s","name":"image_group_multi4"}],success,fail);

        resultMock.success("amp.jsonReturn('image_group_multi3', " + JSON.stringify(fixture1) + ")");
        resultMock.success("amp.jsonReturn('image_group_multi4', " + JSON.stringify(fixture2) + ")");

        expect(success).toHaveBeenCalled();
        expect(fail).toHaveBeenCalled();
        expect(success.mostRecentCall.args[0].image_group_multi3).toEqual(fixture1);
        expect(resultMock.disposed).toBeTruthy();
    });

    it('should load video data when a set containing video is requested',function(){
        var f = jasmine.getJSONFixtures();
        f.fixturesPath = 'base';
        var fixture1 = loadJSONFixtures('test/fixtures/amp.get/setWithVideo.success.json')['test/fixtures/amp.get/setWithVideo.success.json'];
        var fixture2 = loadJSONFixtures('test/fixtures/amp.get/video.success.json')['test/fixtures/amp.get/video.success.json'];

        var success= jasmine.createSpy();
        var fail= jasmine.createSpy();
        amp.get({"type":"s","name":"set_with_video"},success,fail);

        resultMock.success("amp.jsonReturn('set_with_video', " + JSON.stringify(fixture1) + ")");
        resultMock.success("amp.jsonReturn('test_video', " + JSON.stringify(fixture2) + ")");

        expect(success).toHaveBeenCalled();
        expect(fail).not.toHaveBeenCalled();
        expect(success.mostRecentCall.args[0].set_with_video.items[0]).toEqual(fixture1.items[0]);
        expect(success.mostRecentCall.args[0].set_with_video.items[4].thumbs).toEqual(fixture2.thumbs);
        expect(resultMock.disposed).toBeTruthy();
    });

    it('should remove the video from the set if it cannot be loaded',function(){
        var f = jasmine.getJSONFixtures();
        f.fixturesPath = 'base';
        var fixture1 = loadJSONFixtures('test/fixtures/amp.get/setWithVideo2.success.json')['test/fixtures/amp.get/setWithVideo2.success.json'];
        var fixture2 = loadJSONFixtures('test/fixtures/amp.get/response.error.json')['test/fixtures/amp.get/response.error.json'];

        var success= jasmine.createSpy();
        var fail= jasmine.createSpy();
        amp.get({"type":"s","name":"set_with_video2"},success,fail);

        resultMock.success("amp.jsonReturn('set_with_video2', " + JSON.stringify(fixture1) + ")");
        resultMock.success("amp.jsonReturn('test_video2', " + JSON.stringify(fixture2) + ")");

        expect(success).toHaveBeenCalled();
        expect(fail).not.toHaveBeenCalled();
        expect(success.mostRecentCall.args[0].set_with_video2.items.length).toEqual(4);
        expect(resultMock.disposed).toBeTruthy();
    });

    it('should call the success callback only after all nested video data has been loaded',function(){
        var f = jasmine.getJSONFixtures();
        f.fixturesPath = 'base';
        var fixture1 = loadJSONFixtures('test/fixtures/amp.get/setWithVideo3.success.json')['test/fixtures/amp.get/setWithVideo3.success.json'];
        var fixture2 = loadJSONFixtures('test/fixtures/amp.get/video.success.json')['test/fixtures/amp.get/video.success.json'];

        var success= jasmine.createSpy();
        var fail= jasmine.createSpy();
        amp.get({"type":"s","name":"set_with_video3"},success,fail);

        resultMock.success("amp.jsonReturn('set_with_video3', " + JSON.stringify(fixture1) + ")");
        resultMock.success("amp.jsonReturn('test_video3', " + JSON.stringify(fixture2) + ")");

        expect(success).not.toHaveBeenCalled();

        resultMock.success("amp.jsonReturn('test_video4', " + JSON.stringify(fixture2) + ")");

        expect(success).toHaveBeenCalled();
        expect(fail).not.toHaveBeenCalled();
        expect(success.mostRecentCall.args[0].set_with_video3.items[0]).toEqual(fixture1.items[0]);
        expect(success.mostRecentCall.args[0].set_with_video3.items[3].thumbs).toEqual(fixture2.thumbs);
        expect(success.mostRecentCall.args[0].set_with_video3.items[4].thumbs).toEqual(fixture2.thumbs);
        expect(resultMock.disposed).toBeTruthy();
    });

    it('should load an asset from the cache if available', function(){
        var f = jasmine.getJSONFixtures();
        f.fixturesPath = 'base';
        var fixture = loadJSONFixtures('test/fixtures/amp.get/cache.success.json')['test/fixtures/amp.get/cache.success.json'];

        var success= jasmine.createSpy();
        var fail= jasmine.createSpy();
        var success2 = jasmine.createSpy();
        var fail2 = jasmine.createSpy();
        amp.get({"type":"s","name":"cached_asset"},success,fail);
        resultMock.success("amp.jsonReturn('cached_asset', " + JSON.stringify(fixture) + ")");

        expect(success).toHaveBeenCalled();
        expect(success2).not.toHaveBeenCalled();

        amp.get({"type":"s","name":"cached_asset"},success2,fail2);

        expect(success2).toHaveBeenCalled()
    });

    it('should not load an asset from the cache if the cache has been cleared', function(){
        var f = jasmine.getJSONFixtures();
        f.fixturesPath = 'base';
        var fixture = loadJSONFixtures('test/fixtures/amp.get/cache2.success.json')['test/fixtures/amp.get/cache2.success.json'];

        var success= jasmine.createSpy();
        var fail= jasmine.createSpy();
        var success2 = jasmine.createSpy();
        var fail2 = jasmine.createSpy();
        amp.get({"type":"s","name":"cached_asset2"},success,fail);
        resultMock.success("amp.jsonReturn('cached_asset2', " + JSON.stringify(fixture) + ")");

        expect(success).toHaveBeenCalled();
        expect(success2).not.toHaveBeenCalled();
        amp.clearJsonCache();

        amp.get({"type":"s","name":"cached_asset2"},success2,fail2);
        expect(success2).not.toHaveBeenCalled()
        resultMock.success("amp.jsonReturn('cached_asset2', " + JSON.stringify(fixture) + ")");
        expect(success2).toHaveBeenCalled()
    });



});