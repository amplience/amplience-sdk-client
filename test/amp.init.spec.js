'use strict';

var f = jasmine.getFixtures();
f.fixturesPath = 'base';

describe('amp.init', function(){
    it("amp object should exist", function() {
        expect(typeof amp).toEqual('object');
    });

    it("amp property conf should exist", function() {
        expect(amp.conf).toBeDefined();
    });

    it("amp property di should exist", function() {
        expect(amp.di).toBeDefined();
    });

    it("amp property stats should exist", function() {
        expect(amp.stats).toBeDefined();
    });

    it("should update values on the configuration object and add event callbacks", function(){
        amp.init({
            cache_window: 2000,
            default_size: 200,
            client_id: "chris_test_2",
            di_basepath: "http://i1-orig-qa.adis.ws/",
            stats: [function(dom,type,event,value){},function(dom,type,event,value){}]
        });

        expect (amp.conf.cache_window).toEqual(2000);
        expect (amp.conf.default_size).toEqual(200);
        expect (amp.conf.client_id).toEqual("chris_test_2");
        expect (amp.conf.di_basepath).toEqual("http://i1-orig-qa.adis.ws/");
    });

    it("amp.getAssetURL should return a url string combining di_basepath, company_id, asset type and name", function() {
        var client_id = "chris_test_2",
            di_basepath = "http://i1-orig-qa.adis.ws/",
            asset_name = "ugly-shoes",
            asset_type = "s";

        amp.init({
            client_id: client_id,
            di_basepath: di_basepath
        });

        expect(amp.getAssetURL({name:asset_name,type:asset_type})).toEqual(di_basepath + asset_type + '/' + client_id + '/' + asset_name);
    });
});

