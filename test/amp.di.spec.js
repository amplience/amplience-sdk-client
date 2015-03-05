describe('amp.di', function(){
    var urls,
        jsonSet,
        jsonVideo,
        jsonImage,
        badJSON,
        unassigned,
        dataTypes,
        unsignedIntInputs = [0,100,340,400],
        intInputs = [0,-100,-340,400],
        percent = [0,24,50,100],
        boolean = [true,false],
        scaleMode= ['S','TL','TC','TR','ML','MC','MR','BL','BC','BR'],
        upscale = [true,false,'padd'],
        resampling = ['q','s','l','p','c'],
        colourSpace = ['rgb','rgba','srgb','gray','cmyk','ohta','lab','xyz','hsb','hsl'],
        bg = ['rgb(255,0,0)','rgb(255,255,255)','rgb(0,0,255)'],
        formats = ['jpg', 'tif', 'gif', 'bmp', 'png'],
        img404 = ['cat','dog'],
        unsharp = ['0,0.01,1,1','5,5,300,255'],
        cm = ['over','colo','dark','diff','light','multi','cout','cover'],
        diOptions = [
            //{shortName: 'cs', fullName: 'grayscale', val: 'gray', valid:'int'},
            {shortName: 'dpi', fullName: 'dpi',valid:intInputs,type:'number'},
            {shortName: 'dpiFilter', fullName: 'dpiFilter',valid:resampling,type:'string'},
            {shortName: 'resize', fullName: 'resize', valid:boolean,type:'boolean'},
            {shortName: 'filter', fullName: 'filter', valid:['q','s','l','p','c','h'],type:'string'},
            {shortName: 'upscale', fullName: 'upscale', valid:upscale, type:'boolean'},
            {shortName: 'bg', fullName: 'background', valid:bg,type:'string'},
            {shortName: 'qlt', fullName: 'quality', valid:percent,type:'number'},
            {shortName: 'cm', fullName: 'compositeMode',valid:cm,type:'string'},
            {shortName: 'cs', fullName: 'colourSpace', valid:colourSpace, type:'string'},
            {shortName: 'maxW', fullName: 'maxWidth', valid:unsignedIntInputs,type:'number'},
            {shortName: 'maxH', fullName: 'maxHeight', valid:unsignedIntInputs,type:'number'},
            {shortName: 'template', fullName: 'template',valid:[['$hello$'],['$hello$','$there$']],type:'array'},
            {shortName: 'w', fullName: 'width', valid:unsignedIntInputs,type:'number'},
            {shortName: 'h', fullName: 'height', valid:unsignedIntInputs,type:'number'},
            {shortName: 'fmt', fullName: 'format', valid:formats,type:'string'},
            {shortName: 'unsharp', fullName: 'sharpen', valid:unsharp,type:'string'},
            {shortName: 'crop', fullName: 'crop', valid:['0,0,500,500','-40,-50,0,200'],type:'string'},
            {shortName: 'pcrop', fullName: 'preCrop',valid:['0,0,500,500','-40,-50,0,200'],type:'string'},
            {shortName: 'img404', fullName: 'missingImage', valid:img404,type:'string'},
            {shortName: 'sm', fullName: 'scaleMode', valid:scaleMode,type:'string'},
            {shortName: 'strip', fullName: 'strip', valid:boolean, type:'boolean'},
            {shortName: 'orig', fullName: 'original', valid:boolean, type:'boolean'}
        ];

    beforeEach(function(){

        dataTypes = [-50,0,0.5,50,true,false,'string',undefined,null,{},function(){}];

        urls = {
            good:'http://www.di.com/',
            bad:'/\*&%$?£  ?£&£$"!^&$%£%F\"'
        };


//        jsonImage = {"cat":{"isImage":true,"alpha":false,"width":1600,"height":1067,"format":"JPEG","status":"ok","name":"cat"}}
//        jsonVideo = {"video2_1":{"id":"331f8e49-6a5a-47ff-954c-75c6db91a39e","meta":{"title":"video2_1.mp4","updated":"2014-01-08 17:01:27","duration":59859,"description":"","mainLink":"","mainThumb":{"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/9395f15f-ecb9-48c4-917c-e0f326f8ed48"}},"media":[{"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/webm_720p","profile":"webm_720p","profileLabel":"High","protocol":"http","updated":1389200661,"bitrate":"1925","width":"1280","height":"720","size":"15053858","format":"webm","video.codec":"vp8","audio.codec":"null","audio.channels":"0","aspect":null},{"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/mp4_480p","profile":"mp4_480p","profileLabel":"Medium","protocol":"http","updated":1385489405,"bitrate":"0","width":"854","height":"480","size":"4509745","format":"mpeg4","video.codec":"h264","audio.codec":"null","audio.channels":"0","aspect":null},{"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/webm_480p","profile":"webm_480p","profileLabel":"Medium","protocol":"http","updated":1385141603,"bitrate":"0","width":"854","height":"480","size":"4548333","format":"webm","video.codec":"vp8","audio.codec":"null","audio.channels":"0","aspect":null}],"thumbs":[{"time":0,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0000"},{"time":598,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0001"},{"time":1196,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0002"},{"time":1794,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0003"},{"time":2392,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0004"},{"time":2990,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0005"},{"time":3588,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0006"},{"time":4186,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0007"},{"time":4784,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0008"},{"time":5382,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0009"},{"time":5980,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0010"},{"time":6578,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0011"},{"time":7176,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0012"},{"time":7774,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0013"},{"time":8372,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0014"},{"time":8970,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0015"},{"time":9568,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0016"},{"time":10166,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0017"},{"time":10764,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0018"},{"time":11362,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0019"},{"time":11960,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0020"},{"time":12558,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0021"},{"time":13156,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0022"},{"time":13754,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0023"},{"time":14352,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0024"},{"time":14950,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0025"},{"time":15548,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0026"},{"time":16146,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0027"},{"time":16744,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0028"},{"time":17342,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0029"},{"time":17940,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0030"},{"time":18538,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0031"},{"time":19136,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0032"},{"time":19734,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0033"},{"time":20332,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0034"},{"time":20930,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0035"},{"time":21528,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0036"},{"time":22126,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0037"},{"time":22724,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0038"},{"time":23322,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0039"},{"time":23920,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0040"},{"time":24518,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0041"},{"time":25116,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0042"},{"time":25714,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0043"},{"time":26312,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0044"},{"time":26910,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0045"},{"time":27508,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0046"},{"time":28106,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0047"},{"time":28704,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0048"},{"time":29302,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0049"},{"time":29900,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0050"},{"time":30498,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0051"},{"time":31096,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0052"},{"time":31694,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0053"},{"time":32292,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0054"},{"time":32890,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0055"},{"time":33488,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0056"},{"time":34086,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0057"},{"time":34684,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0058"},{"time":35282,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0059"},{"time":35880,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0060"},{"time":36478,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0061"},{"time":37076,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0062"},{"time":37674,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0063"},{"time":38272,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0064"},{"time":38870,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0065"},{"time":39468,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0066"},{"time":40066,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0067"},{"time":40664,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0068"},{"time":41262,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0069"},{"time":41860,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0070"},{"time":42458,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0071"},{"time":43056,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0072"},{"time":43654,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0073"},{"time":44252,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0074"},{"time":44850,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0075"},{"time":45448,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0076"},{"time":46046,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0077"},{"time":46644,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0078"},{"time":47242,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0079"},{"time":47840,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0080"},{"time":48438,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0081"},{"time":49036,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0082"},{"time":49634,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0083"},{"time":50232,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0084"},{"time":50830,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0085"},{"time":51428,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0086"},{"time":52026,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0087"},{"time":52624,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0088"},{"time":53222,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0089"},{"time":53820,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0090"},{"time":54418,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0091"},{"time":55016,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0092"},{"time":55614,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0093"},{"time":56212,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0094"},{"time":56810,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0095"},{"time":57408,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0096"},{"time":58006,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0097"},{"time":58604,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0098"},{"time":59202,"src":"http://i1-orig-qa.adis.ws/v/chris_test_2/video2_1/thumbs/frame_0099"}],"name":"video2_1"}};


    });

    for (var i=0; i<diOptions.length; i++) {
        (function(id, obj) {
            it('('+obj.fullName+') should modify a valid url correctly with all types of correct inputs', function() {

                for(var m=0;m<obj.valid.length;m++) {
                    // arrange & act
                    var val = obj.valid[m];
                    // act
                    var result = amp.di[obj.fullName](urls.good,val);

                    //verify
                    if(obj.fullName!='template') {
                        var expected = urls.good+'?'+obj.shortName+'='+val.toString();
                    } else {
                        var expected = urls.good+'?'+val.join("&");
                    }

                    expect(result).toEqual(expected);
                }


            });
        })(i,diOptions[i]);
    }

    for (var i=0; i<diOptions.length; i++) {
        (function(id, obj) {
            it('('+obj.fullName+') should modify a valid url correctly even when invalid arguments are run before it', function() {

                for(var m=0;m<obj.valid.length;m++) {

                    // do all possible combinations of weirdness
                    for(var a=0; a<dataTypes.length;a++) {
                        for(var b=0; b<dataTypes.length;b++) {
                            amp.di[obj.fullName](a,b);
                        }
                    }

                    // arrange
                    var val = obj.valid[m];
                    // act
                    var result = amp.di[obj.fullName](urls.good,val);

                    //verify
                    if(obj.fullName!='template') {
                        var expected = urls.good+'?'+obj.shortName+'='+val.toString();
                    } else {
                        var expected = urls.good+'?'+val.join("&");
                    }

                    expect(result).toEqual(expected);
                }


            });
        })(i,diOptions[i]);
    }


    for (var i=0; i<diOptions.length; i++) {
        (function(id, obj) {
            it('('+obj.fullName+') should return the same value as it applied', function() {

                for(var m=0;m<obj.valid.length;m++) {

                    // arrange
                    var val = obj.valid[m];
                    // act
                    var url = amp.di[obj.fullName](urls.good,val);
                    var val2 =  amp.di[obj.fullName](url);

                    expect(val).toEqual(val2);
                }
            });
        })(i,diOptions[i]);
    }

    for (var i=0; i<diOptions.length; i++) {
        (function(id, obj) {
            it('('+obj.fullName+') should modify valid JSON correctly with all types of correct inputs', function() {

                for(var m=0;m<obj.valid.length;m++) {
                    // arrange & act
                    var val = obj.valid[m];
                    var jsonSet = {"littlewoods":{"name":"littlewoods","items":[{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/a","width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/b","width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/c","width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/d","width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/e","width":1200,"height":1600,"format":"JPEG","opaque":"true"}]}} ;
                    // act
                    var result = amp.di[obj.fullName](jsonSet,val);

                    //verify
                    if(obj.fullName!='template') {
                        var expected = {"littlewoods":{"name":"littlewoods","items":[{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/a"+'?'+obj.shortName+'='+val.toString(),"width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/b"+'?'+obj.shortName+'='+val.toString(),"width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/c"+'?'+obj.shortName+'='+val.toString(),"width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/d"+'?'+obj.shortName+'='+val.toString(),"width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/e"+'?'+obj.shortName+'='+val.toString(),"width":1200,"height":1600,"format":"JPEG","opaque":"true"}]}} ;
                    } else {
                        var expected = {"littlewoods":{"name":"littlewoods","items":[{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/a"+'?'+val.join("&"),"width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/b"+'?'+val.join("&"),"width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/c"+'?'+val.join("&"),"width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/d"+'?'+val.join("&"),"width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/e"+'?'+val.join("&"),"width":1200,"height":1600,"format":"JPEG","opaque":"true"}]}} ;

                    }

                    expect(result).toEqual(expected);
                }


            });
        })(i,diOptions[i]);
    }

    it('set should only modify the urls in set_a', function() {

            // arrange
            var val = 50;

            var jsonSet = {"sets":{"name":"sets","items":[{"type":"set","name":"set_b","setType":"spin","src":"http://i1-orig-qa.adis.ws/s/chris_test_2/set_b","set":{"type":"list","items":[{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/b","width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/c","width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/e","width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/a","width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/d","width":1200,"height":1600,"format":"JPEG","opaque":"true"}],"name":"set_b"}},{"type":"set","name":"set_a","setType":"spin","src":"http://i1-orig-qa.adis.ws/s/chris_test_2/set_a","set":{"type":"list","items":[{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/ugly-top","width":1000,"height":1000,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/ugly-left","width":1000,"height":1000,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/spin3","width":1000,"height":1000,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/ugly-bottom","width":1000,"height":1000,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/spin2","width":1000,"height":1000,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/spin1","width":1000,"height":1000,"format":"JPEG","opaque":"true"}],"name":"set_a"}}],"url":"http://i1-orig-qa.adis.ws/s/chris_test_2/sets"}}
            // act
            var result = amp.di.set(jsonSet,{width:50},{'exclude':['set_b']});


            var expected = {"sets":{"name":"sets","items":[{"type":"set","name":"set_b","setType":"spin","src":"http://i1-orig-qa.adis.ws/s/chris_test_2/set_b","set":{"type":"list","items":[{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/b","width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/c","width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/e","width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/a","width":1200,"height":1600,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/d","width":1200,"height":1600,"format":"JPEG","opaque":"true"}],"name":"set_b"}},{"type":"set","name":"set_a","setType":"spin","src":"http://i1-orig-qa.adis.ws/s/chris_test_2/set_a?w=50","set":{"type":"list","items":[{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/ugly-top?w=50","width":1000,"height":1000,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/ugly-left?w=50","width":1000,"height":1000,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/spin3?w=50","width":1000,"height":1000,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/ugly-bottom?w=50","width":1000,"height":1000,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/spin2?w=50","width":1000,"height":1000,"format":"JPEG","opaque":"true"},{"type":"img","src":"http://i1-orig-qa.adis.ws/i/chris_test_2/spin1?w=50","width":1000,"height":1000,"format":"JPEG","opaque":"true"}],"name":"set_a"}}],"url":"http://i1-orig-qa.adis.ws/s/chris_test_2/sets"}};

            expect(result).toEqual(expected);


    });


});