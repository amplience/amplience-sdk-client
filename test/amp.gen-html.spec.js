var f = jasmine.getJSONFixtures();
f.fixturesPath = 'base';

describe('amp.genHTML', function(){
    var fixture1, fixture2, fixture3;

    beforeEach(function(){
        fixture1 = loadJSONFixtures('test/fixtures/amp.genHTML/image.json')['test/fixtures/amp.genHTML/image.json'];
        fixture2 = loadJSONFixtures('test/fixtures/amp.genHTML/set.json')['test/fixtures/amp.genHTML/set.json'];
        fixture3 = loadJSONFixtures('test/fixtures/amp.genHTML/video.json')['test/fixtures/amp.genHTML/video.json'];

        fixture1.name = "image";
        fixture2.name = "set";
        fixture3.name = "video";
    });

    afterEach(function(){
        fixture1, fixture2, fixture3 = null;
    });

    it('should return undefined if passed nothing, a string',function(){
        expect(amp.genHTML()).toBe(undefined);
        expect(amp.genHTML("hi", document.createElement('div'))).toBe(undefined);
    });

    it('should accept arrays',function(){
        var results = amp.genHTML([fixture1, fixture2, fixture3]);

        expect(results["image"]).not.toBe('null');
        expect(results["set"]).not.toBe('null');
        expect(results["video"]).not.toBe('null');

    });

    it('should return an image element for type image',function(){
        var result = amp.genHTML(fixture1)["image"];

        expect(result.tagName).toEqual('IMG');
        expect(result.id).toEqual('image');
    });

    it('should return a list element for type set or spin with expected element counts',function(){
        var itemsInSet = fixture2.items;
        var itemsInSetCount = itemsInSet.length;
        var typesCount = {video:0, set:0, spin:0, img:0};
        var nodeCount = 0;
        var iterateThrough = function(itemsInSet){
            for(var i = 0; i < itemsInSet.length; i++){
                nodeCount++;
                for(var type in typesCount){
                    if(itemsInSet[i].type == type){
                        typesCount[type] +=1;
                    }
                }

                if(itemsInSet[i].type == "set" || itemsInSet[i].type == "spin"){
                    iterateThrough(itemsInSet[i][itemsInSet[i].type].items);
                }
            }
        };

        iterateThrough(itemsInSet);

        var result = amp.genHTML(fixture2)['set'];

        expect(result.tagName).toEqual('UL');
        expect(result.id).toEqual('set');

        expect(result.getElementsByTagName('img').length).toEqual(typesCount.img);
        expect(result.getElementsByTagName('video').length).toEqual(typesCount.video);
        expect(result.getElementsByTagName('ul').length).toEqual(typesCount.set + typesCount.spin);
        expect(result.getElementsByTagName('li').length).toEqual(nodeCount);
    });


    it('should return a a div with a child video element for type video',function(){
        var result = amp.genHTML(fixture3)['video'];
        var child = result.firstChild;

        expect(child.tagName.toLowerCase()).toEqual('video');
        expect(result.id).toEqual('video');
    });


    it('should attach the generated element to the specified dom node if set',function(){
        var div = document.createElement('div');
        var result = amp.genHTML(fixture1, div, true )["image"];
        var child = div.firstChild;

        expect(child.tagName).toEqual('IMG');
    });

    it('should return the asset url on the data attribute for lazy loading of data type image',function(){
        var result = amp.genHTML(fixture1, null, true )["image"];

        expect(result.getAttribute('data-amp-src')).toBeTruthy();
        expect(result.getAttribute('src')).not.toBeTruthy();
    });

    it('should have a default image size set if no size has been set',function(){
        var resultLazy = amp.genHTML(fixture1, null, true )["image"];
        var resultNormal = amp.genHTML(fixture1)["image"];

        var lazy = resultLazy.getAttribute('data-amp-src');
        var normal = resultNormal.getAttribute('src');
        expect(lazy.indexOf('?w=190')).not.toBe(-1);
        expect(normal.indexOf('?w=190')).not.toBe(-1);
    });

});

describe('amp.genVideoHTML', function(){
    var fixture;

    beforeEach(function(){
        fixture = loadJSONFixtures('test/fixtures/amp.genHTML/video.json')['test/fixtures/amp.genHTML/video.json'];
        fixture.name = "video";
    });

    afterEach(function(){
        fixture  = null;
    });

    it('should return a div with a child video element for type video',function(){
        var result = amp.genVideoHTML(fixture);
        //unrecognized elements will have lowercase tag names in IE
        var child = result.firstChild;
        expect(child.tagName.toLowerCase()).toEqual('video');
        expect(result.id).toEqual('video');
    });

    it('should sort on integers',function(){
        var result = amp.genVideoHTML(fixture, 610);

        var source = result.getElementsByTagName('source');

        expect(source[0].getAttribute('data-bitrate')).toEqual("610");
    });

    it('should sort on arrays of strings',function(){
        var result = amp.genVideoHTML(fixture, ["Medium"], "profileLabel");
        var source = result.getElementsByTagName('source');

        expect(source[0].getAttribute('data-res')).toEqual("Medium");
    });

    it('should sort on both arrays of strings',function(){
        var result= amp.genVideoHTML(fixture, ["Medium"], "profileLabel");
        var source = result.getElementsByTagName('source');

        expect(source[0].getAttribute('data-res')).toEqual("Medium");
    });

    it('should return unsorted if neither integer or array of string passed',function(){
        var unmodified = amp.genVideoHTML(fixture);
        var unmodifiedSource = unmodified.getElementsByTagName('source');

        var modified1 = amp.genVideoHTML(fixture, "hello");
        var source1 = modified1.getElementsByTagName('source');
        var modified2 = amp.genVideoHTML(fixture, []);
        var source2 = modified2.getElementsByTagName('source');

        expect(source1[0].src).toEqual(unmodifiedSource[0].src);
        expect(source2[0].src).toEqual(unmodifiedSource[0].src);
    });

    it('should return the sources in the correct order',function(){
        var result = fixture;
        // existing bitrate values [2009, 2015, 671, 610, 407, 337];
        // existing profile labels ["High", "High", "Medium", "Medium", "Low", "Low"]
        // existing profiles "webm_720p", "mp4720p1", "webm_480p", "mp4_480p", "webm_240p", "mp4_240p"
        var testCases = [
            {input: 2009, output:[2009, 2015, 671, 610, 407, 337], property:'bitrate'},
            {input: 200, output:[337, 407, 610, 671, 2009, 2015], property:'bitrate'},
            {input: 671, output:[671, 610, 407, 337, 2009, 2015], property:'bitrate'},
            {input: 4000, output: [2015, 2009, 671, 610, 407, 337], property:'bitrate'},
            {input: ["Low"], output:["Low","Low","High","High",  "Medium", "Medium"], property:'profileLabel'},
            {input: ["High"], output:["High","High", "Medium", "Medium", "Low","Low"], property:'profileLabel'},
            {input: ["Low", "Medium", "High"], output:["Low","Low", "Medium", "Medium", "High","High"], property:'profileLabel'},
            {input: ["High", "Medium", "Low"], output:["High","High", "Medium", "Medium","Low","Low"], property:'profileLabel'},
            {input: ["mp4720p1"], output:[  "mp4720p1","webm_720p", "webm_480p", "mp4_480p", "webm_240p", "mp4_240p"], property:'profile'},
            {input: ["mp4_240p", "webm_480p", "webm_720p", "mp4_480p", "webm_240p", "mp4720p1"], output:["mp4_240p", "webm_480p", "webm_720p", "mp4_480p", "webm_240p", "mp4720p1"], property:'profile'},
            {input: ["mp4_240p", "mp4720p1"], output:["mp4_240p", "mp4720p1", "webm_720p", "webm_480p", "mp4_480p", "webm_240p"], property:'profile'}
        ];

        for(var i = 0; i < testCases.length; i++){
            var sorted = amp.test.genHTML.sortVideoSource(result.media, testCases[i].input, testCases[i].property);
            var newOrderArr = [];
            for(var c = 0; c < sorted.length; c++){
                if(!isNaN(testCases[i].input)){
                    newOrderArr.push(parseInt(sorted[c][testCases[i].property]));
                }else{
                    newOrderArr.push(sorted[c][testCases[i].property]);
                }
            }

            expect(testCases[i].output).toEqual(newOrderArr);
        }
    });
})

describe('amp.videoToFormat', function(){
    it('should return undefined if passed nothing or a string',function(){
        expect(amp.videoToFormat()).toBe(undefined);
        expect(amp.videoToFormat('test')).toBe(undefined);
        expect(amp.videoToFormat({})).toBe(undefined);
    });

    it('should output strings when given the following inputs',function(){
        var testCases = [
            {input: {format:'mpeg4'}, output:'video/mp4'},
            {input: {format:'flash video'}, output:'video/flv'},
            {input: {format:'mpeg4', 'video.codec':'h264'}, output:'video/mp4'}
      //     {input: {format:'mpeg4', 'video.codec':'vp8'}, output:'video/mp4; codecs="vp8"'},
           // {input: {format:'mpeg4', 'audio.codec':'theora', 'video.codec':'aac'}, output:'video/mp4; codecs="mp4a.40.2"'},
           // {input: {format:'mpeg4', 'video.codec':'vp8', 'audio.codec':'vorbis'}, output:'video/webm; codecs="vp8, vorbis"'}
        ];


        for(var i = 0; i < testCases.length; i++){
            expect(amp.videoToFormat(testCases[i].input)).toEqual(testCases[i].output);
        }
    });
});
