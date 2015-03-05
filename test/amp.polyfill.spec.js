describe('amp.polyfill', function(){

    beforeEach(function(){

        amp.init({
            client_id: "fake_client",
            di_basepath: "http://example.com/"
        });

    });

    it('should serialise and deserialise to the same object', function(){

        var f = jasmine.getJSONFixtures();
        f.fixturesPath = 'base';
        var moon = loadJSONFixtures('test/fixtures/amp.shared-methods/basic.serialisation.json')['test/fixtures/amp.shared-methods/basic.serialisation.json'];

        var serialisedMoon = $.polyfill._utils._stringify(moon);
        var deserialisedMoon = $.polyfill._utils._parseJson(serialisedMoon);

        expect(moon).toEqual(jasmine.any(Object));
        expect(typeof moon).toEqual('object');

        expect(serialisedMoon).toEqual(jasmine.any(String));
        expect(typeof serialisedMoon).toEqual('string');

        expect(deserialisedMoon).toEqual(jasmine.any(Object));
        expect(typeof deserialisedMoon).toEqual('object');

        expect(moon).toEqual(deserialisedMoon);

    });
});
