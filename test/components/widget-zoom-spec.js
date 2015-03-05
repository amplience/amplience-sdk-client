describe('amp.ampZoom', function(){
    var sdk, widgets, self = "widget-zoom", possibleCombinations = ["sdk and widgets", "no sdk but all widgets", 'no other widgets but sdk', 'just self'],  makeCombinations,
    options =  {
        "zoom": {"valid":9, "invalid":["string", [], {}, true], "default": 3},
        "url": {"valid":'', "invalid":[ 5, [], {}, false, true], "default": ''} ,
        "activate": {"valid":"over", "invalid":[[], {},  5, false ], "default": 'onClick'},
        "lens":  {"valid":false, "invalid":[1, "5", {}, []], "default": true } ,
        "fade": {"valid":false, "invalid":[1, "2", {}, []], "default": true } ,
        "preload": {"valid":false, "invalid":[1, "4", {}, []], "default": true } ,
        "responsive": {"valid":false, "invalid":[1, "2", {}, []], "default": true } ,
        "cursor":  {"valid": {"active": 'auto', "inactive": 'auto'}, invalid:[{}, [], 1, false], "default": {"active": 'auto', "inactive": 'auto'}},
        "states": {
        "valid":{
            "active":"active",
            "inactive":"inactive"
        },
        "invalid":[{}, [], 1, false],
            "default": {
                "active":"amp-active",
                "inactive":"amp-inactive"
            }
        }
    };

    makeCombinations = function(com){
        $.amp = widgets;
        amp = sdk;
        if(com == "no sdk but all widgets"){
            amp = undefined;
        }else if (com ==  'no other widgets but sdk'){
            $.amp = {};
            $.amp = {ampZoom: widgets.ampZoom};
        }else if(com == 'just self'){
            amp = undefined;
            $.amp = {};
            $.amp = {ampZoom: widgets.ampZoom};
        }else{
            return;
        }
    };

    beforeEach(function(){
        sdk = $.extend(true, {}, window.amp);
        widgets = $.extend(true, {}, $.amp);

        jasmine.getStyleFixtures().fixturesPath = 'base';
        loadStyleFixtures('dist/amplience-sdk-client.css');
        jasmine.Clock.useMock();
    });

    afterEach(function(){
        $.amp = widgets;
        amp = sdk;
    });

    describe('options', function(){
        for(var option in options){
            if(options.hasOwnProperty(option, options)){
                (function(option){
                    it('should set the ' + option, function(){
                        var obj = {};
                        obj[option] = options[option].valid;
                        setFixtures('<img id="zoom-test" src="http://placehold.it/350x150">');
                        var $zoom = $('#zoom-test').ampZoom(obj);
                        var zoom = $zoom.data('amp-ampZoom');
                        expect(zoom.options[option]).toEqual(options[option].valid)
                    });
                })(option, options);
            }
        }

        it('should set zoom container height and width when responsive option is set to false', function(){
            setFixtures('<div id="main"><img id="zoom-test" src="http://placehold.it/350x100"></div>');

            var $main = $('#main');
            $main.width(500);

            var w = 200, h = 100;
            var $zoom = $('#zoom-test');
            $zoom.ampZoom({width:w, height:h, responsive:false});
            var zoom = $zoom.data('amp-ampZoom');
            zoom._calcSize();
            expect($zoom.closest('.amp-zoom-container').width()).toBe(w);
            expect($zoom.closest('.amp-zoom-container').height()).toBe(h);
        });

        it('should set zoom component height ratio and width', function(){
            setFixtures('<div id="main"><img id="zoom-test" src="http://placehold.it/1x1"></div>');

            var $main = $('#main');
            $main.width(500);

            var w = 16, h = 9;
            var $zoom = $('#zoom-test');
            $zoom.ampZoom({width:w, height:h});
            var zoom = $zoom.data('amp-ampZoom');
            zoom._calcSize();
            expect($zoom.closest('.amp-zoom-container').width()).toBe(500);
            expect($zoom.closest('.amp-zoom-container').height()).toBe(Math.round($zoom.width() * (h/w)));
        });

        it('should use the url of the zoom alternative as the zoom image - no alternative target', function(){
            setFixtures('<img id="zoom-test" src="http://placehold.it/350x150">');
            var $zoom = $('#zoom-test');
            var alt = "http://placehold.it/650x650";
            $zoom.ampZoom({url:alt});

            var zoom = $zoom.data('amp-ampZoom');
            expect(zoom._getUrl()).toEqual(alt);
        });

        it('should use the url of the zoom alternative as the zoom image - with alternative target', function(){
            setFixtures('<div id="box"></div><img id="zoom-test" src="http://placehold.it/350x150">');
            var $zoom = $('#zoom-test');
            var $main = $('#box');
            var alt = "http://placehold.it/650x650";

            $zoom.ampZoom({url:alt, target:$main});
            var zoom = $zoom.data('amp-ampZoom');
            expect(zoom._getUrl()).toEqual(alt);
        });


    });

    describe('methods', function(){
        describe('create', function(){
            it('should be able to create a zoom component with the class of amp-zoom', function(){
                var $zoom = setFixtures('<img id="zoom-test">').ampZoom({});
                expect($zoom).toBeInDOM();
                expect($zoom).toHaveClass('amp-zoom');
            });

            it('should be able to create a zoom component containing the correct dom structure', function(){
                setFixtures('<img id="zoom-test" src="http://placehold.it/350x150">');
                var $zoom = $('#zoom-test').ampZoom({});

                expect($zoom.parent().parent()).toHaveClass('amp-zoom-container');
                expect($zoom.parent().parent()).toHaveClass('amp-inactive');
                expect($zoom.parent()).toBe('div');
                expect($zoom.parent()).toContain('div.amp-zoom-wrapper');
                expect($zoom.parent().children('div.amp-zoom-wrapper')).toContain('img');
                expect($zoom.parent().find('.amp-zoom-wrapper img')).toHaveClass('amp-zoom-img');
            });

            it('should be able to create a zoom component containing the correct dom structure if a zoom box is set', function(){
                setFixtures('<div id="box"></div><img id="zoom-test" src="http://placehold.it/350x150">');
                var $box = $('#box');
                var $zoom = $('#zoom-test').ampZoom({target:$box});
                expect($zoom.parent().parent()).toHaveClass('amp-zoom-container');
                expect($zoom.parent()).toBe('div');
                expect($box).toContain('div.amp-zoom-wrapper');
                expect($box.children('div.amp-zoom-wrapper')).toContain('img');
                expect($box.find('img')).toHaveClass('amp-zoom-img');

            });

            it('should be able to create a zoom component containing the correct dom structure if a zoom box is set by jquery selector or selector string', function(){
                setFixtures('<div id="box"></div><img id="zoom-test" src="http://placehold.it/350x150">');
                var $box = $('#box'), box = '#box';
                var $zoom1 = $('#zoom-test').ampZoom({target:$box});
                var $zoom2 = $('#zoom-test').ampZoom({target:box});

                expect($zoom1.data('amp-ampZoom').box.length).toBe(1);
                expect($zoom2.data('amp-ampZoom').box.length).toBe(1);
            });

            var arr = [possibleCombinations[2], possibleCombinations[3]];
            for(var i = 0; i < arr.length; i++){
                (function(arr) {
                    xit('should work if multiple zoom options have been set to use the same external element -'  + arr, function(){
                        setFixtures('<div id="box"></div>' +
                            '<img id="zoom-test1" src="http://placehold.it/350x150">' +
                            '<img id="zoom-test2" src="http://placehold.it/350x150">' +
                            '<img id="zoom-test3" src="http://placehold.it/350x150">' +
                            '<img id="zoom-test4" src="http://placehold.it/350x150">');

                        var $box = $('#box');
                        var $zoomTests = [$('#zoom-test1'), $('#zoom-test2'), $('#zoom-test3'), $('#zoom-test4')];
                        var options = [{target:$box, animate:false}];

                        for(var i = 0; i < $zoomTests.length; i++){
                            for(var c = 0; c < options.length; c++){
                                var test =  $zoomTests[i].ampZoom(options[c]);

                                var offset = test.offset();
                                var mm = $.Event("mousemove", {originalEvent: {clientX: offset.left + 25, clientY: offset.top + 25 }});
                                var md = $.Event("mousedown", {originalEvent: {clientX: offset.left + 25, clientY: offset.top + 25 }});
                                var ml = $.Event("mouseleave");

                                test.ampZoom('zoom', true, md);
                                    onIn(options[c]);
                                test.ampZoom('zoom', false, ml);
                                    onOut();
                                test.ampZoom('zoom', true, mm);
                                    onIn(options[c]);
                                test.ampZoom('zoom', false, ml);
                                    onOut();
                            }
                        }

                        function onIn(options){
                            expect($box.children('.amp-zoom-wrapper').eq(i)).toHaveClass('amp-active');
                            expect($box.children('.amp-zoom-wrapper').eq(i)).toEqual(test.data('amp-ampZoom').wrapper);
                            expect($box.children('.amp-zoom-wrapper').eq(i)).toBeVisible();
        //                    expect($box.children('.amp-zoom-wrapper').eq(i).find('img')).toBeVisible();

                        }

                        function onOut(){
                            expect($box.children('.amp-zoom-wrapper').eq(i)).toHaveClass('amp-inactive');
                            expect($box.children('.amp-zoom-wrapper').eq(i)).toEqual(test.data('amp-ampZoom').wrapper);
                            expect($box.children('.amp-zoom-wrapper').eq(i)).not.toBeVisible();
                            expect($box.children('.amp-zoom-wrapper').eq(i).find('img')).not.toBeVisible();

                        }
                    })
                }(arr[i]))
            }

            it('should merge data-amp-zoom options with options set on create, options set on creation should take precedence', function(){
                var zoomStrength = 5, box1 = '.one', box2 = '.two', responsive = false;
                setFixtures("<img id='zoom-test' data-amp-zoom='{\"zoom\":"+zoomStrength+",\"box\":\""+box1+"\"}'>");

                var $zoom = $('#zoom-test').ampZoom({responsive:responsive, target:box2});
                var zoom = $zoom.data('amp-ampZoom');
                expect(parseInt(zoom.options.zoom)).toEqual(zoomStrength);
                expect(zoom.options.responsive).toEqual(responsive);
                expect(zoom.options.target).toEqual(box2);
            });

            var arr = possibleCombinations;
            for(var i = 0; i < arr.length; i++){
                (function(arr) {
                    xit('should have correct loading state whilst loading / loading gif -'  + arr, function(){
                        makeCombinations(arr);
                        setFixtures('<img id="zoom-test" src="http://i1-orig-qa.adis.ws/i/chris_test_2/5?w=500">');
                        var $zoom = $('#zoom-test').ampZoom({zoom:10 });
                        var zoom = $zoom.data('amp-ampZoom');
                        expect(zoom._loading).toBe(true);
                        expect(zoom._loaded).toBe(false);
                    })
                }(arr[i]))
            }

            it('should default to inner zoom if no box found', function(){
                setFixtures('<img id="zoom-test" src="http://placehold.it/350x150">');

                var $zoom = $('#zoom-test').ampZoom({target:$('#zoom-box')});
                var zoom = $zoom.data('amp-ampZoom');

                expect(zoom.box).toBe(false);
                expect($zoom.parent()).toContain('.amp-zoom-wrapper');
            });

            it('should default to lens = true unless stated otherwise', function(){
                setFixtures('<div id="zoom-box" style="width:500px;height:200px"></div><img id="zoom-test" src="http://placehold.it/1x1">');

                var $zoom = $('#zoom-test').ampZoom({target:$('#zoom-box')});
                var zoom = $zoom.data('amp-ampZoom');

                expect(zoom.lens).toBeTruthy();
                expect(zoom.box).toBeTruthy();
                expect($zoom.parent().parent()).toContain('.amp-zoom-lens');
            });

            it('should not allow lens to exceed the width and height of its container', function(){
                var bw = 600;
                var bh = 300;
                var pw = 300;
                var ph = 150;

                setFixtures('<div id="zoom-box"></div>' +
                    '<div id="main"><img id="zoom-test" src="http://placehold.it/1x1"></div>');

                var $zoom = $('#zoom-test');
                $zoom.ampZoom({zoom:1,target:$('#zoom-box')});
                var zoom = $zoom.data('amp-ampZoom');
                zoom._makeLens(zoom.lens, bw, bh, 1, {w:pw, h:ph});
                expect(zoom.lens.outerWidth()).toEqual(pw);
                expect(zoom.lens.outerHeight()).toEqual(ph);
            });
        });

        describe('resize', function(){
            it('should resize after container resizing', function(){
                setFixtures('<div id="main"><img id="zoom-test" src="http://placehold.it/1x1"></div>');

                var $zoom = $('#zoom-test');
                var $main = $('#main');
                $zoom.ampZoom({width:w, height:h});
                var zoom = $zoom.data("amp-ampZoom");
                var fw = 500, sw = 1000;
                var w = 16, h = 9;
                $main.width(fw);

                expect($zoom.parent().width()).toBe(fw);
                $main.width(sw);
                zoom._calcSize();
                expect($zoom.parent().width()).toBe(sw);
            });
        });

        describe('toggleZoom', function(){
            it('should toggle zoom state', function(){
                setFixtures('<img id="zoom-test" src="http://placehold.it/350x150">');

                var $zoom = $('#zoom-test').ampZoom();
                var zoom = $zoom.data('amp-ampZoom');

                expect($zoom.closest('.amp-zoom-container')).toHaveClass(zoom.options.states.inactive);
                expect(zoom.zoomed).toBe(false);
                zoom._onImageLoad();
                zoom._zoomLoaded = true;
                zoom.toggle();
                expect($zoom.closest('.amp-zoom-container')).toHaveClass(zoom.options.states.active);
                expect(zoom.zoomed).toBe(true);
                zoom.toggle();
                expect($zoom.closest('.amp-zoom-container')).toHaveClass(zoom.options.states.inactive);
                expect(zoom.zoomed).toBe(false);
            });
        });

        describe('zoom', function(){
            it('should have the correct state while active / inactive', function(){
                setFixtures('<img id="zoom-test" src="http://placehold.it/350x150">');

                var $zoom = $('#zoom-test').ampZoom();
                var zoom = $zoom.data('amp-ampZoom');

                expect($zoom.closest('.amp-zoom-container')).toHaveClass(zoom.options.states.inactive);
                expect(zoom.zoomed).toBe(false);

                zoom._onImageLoad();
                zoom._zoomLoaded = true;
                zoom.zoom(true);
                expect($zoom.closest('.amp-zoom-container')).toHaveClass('amp-active');
                expect(zoom.zoomed).toBe(true);
                zoom.zoom(false);
                expect($zoom.closest('.amp-zoom-container')).toHaveClass('amp-inactive');
                expect(zoom.zoomed).toBe(false);
            });
        });

        describe('getUrl', function(){
            var arr = [possibleCombinations[2], possibleCombinations[3]];
            for(var i = 0; i < arr.length; i++){
                (function(arr) {

                it('should return the zoom alternative url -' + arr, function(){
                    makeCombinations(arr);
                    var url = "http://placehold.it/350x150";
                    setFixtures('<img id="zoom-test" src="'+url+'">');

                    var $zoom = $('#zoom-test').ampZoom({zoom:5, url:url});
                    var zoom = $zoom.data("amp-ampZoom");
                    zoom._originalImage = {
                        width:300,
                        height:150
                    };

                    expect(zoom._getUrl()).toEqual(url);
                });

                it('should return the zoom image url with zoomed width and height  -' + arr, function(){
                    makeCombinations(arr);
                    var url = "http://placehold.it/1x1?";
                    setFixtures('<img id="zoom-test" src="'+url+"w=350"+'">');

                    var $zoom = $('#zoom-test').ampZoom({zoom:5});
                    var zoom = $zoom.data("amp-ampZoom");
                    zoom._originalImage = {
                        width:300,
                        height:150
                    };

                    expect(zoom._getUrl()).toEqual(url + "h=" +(zoom.options.zoom * zoom._originalImage.height) + "&w=" +(zoom.options.zoom * zoom._originalImage.width));
                });

                it('should return the zoom image url with transforms -' + arr, function(){
                    makeCombinations(arr);

                    var transforms = 'qlt=20';
                    var url = "http://placehold.it/1x1?";
                    setFixtures('<img id="zoom-test" src="'+url+transforms+"&w=350"+'">');

                    var $zoom = $('#zoom-test').ampZoom({zoom:5,transforms:transforms});
                    var zoom = $zoom.data("amp-ampZoom");
                    zoom._originalImage = {
                        width:300,
                        height:150
                    };
                    expect(zoom._getUrl()).toEqual(url +transforms + "&h=" +(zoom.options.zoom * zoom._originalImage.height) + "&w=" +(zoom.options.zoom * zoom._originalImage.width));

                });

                it('should return a stringified url with the new width -' + arr, function(){
                    makeCombinations(arr);
                    var url = "http://placehold.it/350x150";
                    setFixtures('<img id="zoom-test" src="'+url+'">');

                    var $zoom = $('#zoom-test').ampZoom();
                    var zoom = $zoom.data("amp-ampZoom");
                    zoom._originalImage = {
                        width:300,
                        height:150
                    };

                    expect(zoom._setWidth(url, {w:500})).toEqual(url + "?w=500");
                });

                it('should return the width set on a parameter -'+ arr, function(){
                    makeCombinations(arr);
                    var url = "http://placehold.it/350x150?w=500";
                    setFixtures('<img id="zoom-test" src="'+url+'">');

                    var $zoom = $('#zoom-test').ampZoom();
                    var zoom = $zoom.data("amp-ampZoom");

                    expect(zoom._getWidth(url)).toEqual(500);
                });

            }(arr[i]));
            }
        });

        describe('visible', function(){
            it('should recalculate on visible', function(){
                var url = "http://placehold.it/350x150?w=500";
                setFixtures('<div id="main" style="width:450px;"><img id="zoom-test" src="http://placehold.it/350x150"></div>');
                var $main = $('#main').hide();
                var $zoom = $('#zoom-test').ampZoom();
                var zoom = $zoom.data("amp-ampZoom");

                expect($zoom.parent().width()).toEqual(0);
                expect($zoom.parent().height()).toEqual(0);

                zoom.visible((function(){
                    $main.show();
                    return true;
                })());

                expect(zoom._visible).toBe(true);
                expect($zoom.parent().width()).toEqual($main.width());
                expect($zoom.parent().height()).toEqual($main.height());

            });
        });
    });

    describe('events', function(){
        it('should call create on create',  function(){
            setFixtures('<img id="zoom-test" src="http://placehold.it/1x1">');

            var selector = '#zoom-test';
            var spyEvent = spyOnEvent(selector, 'create');
            var $zoom = $(selector).ampZoom();

            expect("create").toHaveBeenTriggeredOnAndWith(selector, {});
        });

        it('should call created on created', function(){
            setFixtures('<img id="zoom-test" src="http://placehold.it/1x1">');

            var selector = '#zoom-test';
            var spyEvent = spyOnEvent(selector, 'created');
            var $zoom = $(selector).ampZoom();
            var zoom = $zoom.data("amp-ampZoom");

            zoom._onImageLoad();

            expect("created").toHaveBeenTriggeredOnAndWith(selector, {});
        });

        it('should call visible on visible', function(){
            setFixtures('<img id="zoom-test" src="http://placehold.it/1x1">');

            var selector = '#zoom-test';
            var spyEvent = spyOnEvent(selector, 'visible');
            var $zoom = $(selector).ampZoom();
            var zoom = $zoom.data("amp-ampZoom").visible(true);

            expect("visible").toHaveBeenTriggeredOnAndWith(selector, {visible: true});
        });

        it('should call startPreload', function(){
            setFixtures('<img id="zoom-test" src="http://placehold.it/1x1">');

            var selector = '#zoom-test';
            var spyEvent = spyOnEvent(selector, 'startpreload');
            var $zoom = $(selector).ampZoom();
            var zoom = $zoom.data("amp-ampZoom");

            zoom._onImageLoad();
            zoom.preload();
            expect("startpreload").toHaveBeenTriggeredOnAndWith(selector, {});
        });

        it('should call startMove', function(){
            setFixtures('<img id="zoom-test" src="http://placehold.it/1x1">');
            var selector = '#zoom-test';
            var spyEvent = spyOnEvent(selector, 'startmove');

            var $zoom = $(selector).ampZoom({url:'http://placehold.it/2x2'});
            var zoom = $zoom.data("amp-ampZoom");
            var offset = $zoom.offset();
            var md = $.Event("mousedown", {originalEvent: {clientX: offset.left + 25, clientY: offset.top + 25 }});

            zoom._onImageLoad();
            zoom._zoomLoaded = true;
            zoom.zoom(true, md);
            expect("startmove").toHaveBeenTriggeredOn(selector);
        });

        it('should call move', function(){
            setFixtures('<img id="zoom-test" src="http://placehold.it/1x1">');
            var selector = '#zoom-test';
            var spyEvent = spyOnEvent(selector, 'move');

            var $zoom = $(selector).ampZoom();
            var zoom = $zoom.data("amp-ampZoom");
            var offset = $zoom.offset();

            zoom._onImageLoad();
            zoom._zoomLoaded = true;
            var mm = $.Event("mousemove", {originalEvent: {clientX: offset.left + 25, clientY: offset.top + 25 }});
            zoom.zoom(true, mm);
            expect("move").toHaveBeenTriggeredOn(selector);
        });

        it('should call stopMove', function(){
            setFixtures('<img id="zoom-test" src="http://placehold.it/1x1">');
            var selector = '#zoom-test';
            var spyEvent = spyOnEvent(selector, 'stopmove');

            var $zoom = $(selector).ampZoom();
            var zoom = $zoom.data("amp-ampZoom");

            var mm = $.Event("mousemove");
            var ml = $.Event("mouseleave");
            zoom._onImageLoad();
            zoom._zoomLoaded = true;
            zoom.zoom(true, mm);
            zoom.zoom(false, mm);
            expect("stopmove").toHaveBeenTriggeredOn(selector);
        });

        it('should call zoomedIn', function(){
            setFixtures('<img id="zoom-test" src="http://placehold.it/1x1">');
            var selector = '#zoom-test';
            var spyEvent = spyOnEvent(selector, 'zoomedin');

            var $zoom = $(selector).ampZoom();
            var zoom = $zoom.data("amp-ampZoom"); 

            zoom._onImageLoad();
            zoom._zoomLoaded = true;
            var mm = $.Event("mousemove");
            zoom.zoom(true, mm);

            expect("zoomedin").toHaveBeenTriggeredOn(selector);
        });

        it('should call zoomedOut', function(){
            setFixtures('<img id="zoom-test" src="http://placehold.it/1x1">');
            var selector = '#zoom-test';
            var spyEvent = spyOnEvent(selector, 'zoomedout');

            var $zoom = $(selector).ampZoom();
            var zoom = $zoom.data("amp-ampZoom");
            zoom.zoom(true);
            zoom.zoom(false);
            expect("zoomedout").toHaveBeenTriggeredOnAndWith(selector, {});
        });
    });
});