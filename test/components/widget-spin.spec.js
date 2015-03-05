describe('amp.ampSpin', function(){


    var cursors = ['auto', 'default', 'none', 'context-menu', 'help', 'pointer', 'progress', 'wait', 'cell', 'crosshair', 'text', 'vertical-text', 'alias', 'copy', 'move', 'no-drop', 'not-allowed', 'e-resize', 'n-resize', 'ne-resize', 'nw-resize', 's-resize', 'se-resize', 'sw-resize', 'w-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'col-resize', 'row-resize', 'all-scroll', 'zoom-in', 'zoom-out', 'grab', 'grabbing'];
    var cursorsIE = ['auto', 'default', 'none', 'context-menu', 'help', 'pointer', 'progress', 'wait', 'cell', 'crosshair', 'text', 'vertical-text', 'alias', 'copy', 'move', 'no-drop', 'not-allowed', 'e-resize', 'n-resize', 'ne-resize', 'nw-resize', 's-resize', 'se-resize', 'sw-resize', 'w-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'col-resize', 'row-resize', 'all-scroll'];
    if (/*@cc_on!@*/false || !!document.documentMode){ cursors = cursorsIE };

    beforeEach(function(){
        jasmine.Clock.useMock();
        amp.init({
            client_id: "fake_client",
            di_basepath: "http://i1-orig-qa.adis.ws/",
            stats: [function(dom,type,event,value){},function(dom,type,event,value){}]
        });
    });

    describe('methods', function(){

        it('should spin when dragging', function(){
            setFixtures('<ul id="spin-test"><li><img src="http://i1-orig-qa.adis.ws/i/chris_test_2/1?w=500"></li>' +
                '<li><img src="http://i1-orig-qa.adis.ws/i/chris_test_2/2?w=500"></li>' +
                '<li><img src="http://i1-orig-qa.adis.ws/i/chris_test_2/3?w=500"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '<li><img src="http://placehold.it/350x150/ffff00"></li>' +
                '<li><img src="http://placehold.it/350x150/00ffff"></li>' +
                '</ul>');
            var $spin = $('#spin-test').ampSpin({"preload": false});
            var spin = $spin.data("amp-ampSpin");

            //spyOn(spin,'goTo');

            //expect(spin.goTo).not.toHaveBeenCalled();

            var offset = $spin.offset();

            var md = $.Event("mousedown", {originalEvent: {clientX: offset.left + 25, clientY: offset.top + 25 }});
            var mm = $.Event("mousemove", {originalEvent: {clientX: offset.left + 75, clientY: offset.top + 25 }});

            $spin.trigger(md);
            $spin.trigger(mm);
            //spin.goTo(2);
            jasmine.Clock.tick(100001);


            //expect(spin.goTo).toHaveBeenCalled();
            var seen = $spin.find('.amp-seen');
            expect(seen.length).toBeGreaterThan(1);

        });

        xit('should resize after container resizing', function(){

            jasmine.getStyleFixtures().fixturesPath = 'base';
            loadStyleFixtures('dist/amplience-sdk-client.css');

            setFixtures('<div id="spin-cont" style="background:purple;"><ul id="spin-test" style="background: orangered">' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/ffff00" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/00ffff" class="amp-main-img"></li>' +
                '</ul></div>');
            var $spin = $('#spin-test').ampSpin({"preload": false, width:350, height:150});

            var spin = $spin.data("amp-ampSpin");

            var width1 = $spin.width();
            var height1 = $spin.height();
            var container = $('#spin-cont');
            container.width(container.width() * 2 + 'px');

            spin._calcSize();

            var width2 = $spin.width();
            var height2 = $spin.height();

            expect(width1/height1).toBeCloseTo(width2/height2);

            expect(width2).toEqual(container.width());

        });

        it('shouldn\'t resize if responsive is false', function(){

            jasmine.getStyleFixtures().fixturesPath = 'base';
            loadStyleFixtures('dist/amplience-sdk-client.css');

            setFixtures('<div id="spin-cont" style="background:purple;"><ul id="spin-test" style="background: orangered">' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/ffff00" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/00ffff" class="amp-main-img"></li>' +
                '</ul></div>');
            var $spin = $('#spin-test').ampSpin({responsive: false, width:350, height:150});
            jasmine.Clock.tick(10);

            var spin = $spin.data("amp-ampSpin");

            var width1 = $spin.width();
            var height1 = $spin.height();
            var container = $('#spin-cont');
            container.width(container.width() * 2 + 'px');

            spin._calcSize();

            var width2 = $spin.width();
            var height2 = $spin.height();

            expect(width1).toEqual(width2);
            expect(height1).toEqual(height2);

        });

        it('should have the correct state classes after init', function(){

            jasmine.getStyleFixtures().fixturesPath = 'base';
            loadStyleFixtures('dist/amplience-sdk-client.css');

            setFixtures('<ul id="spin-test" style="background: orangered">' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/ffff00" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/00ffff" class="amp-main-img"></li>' +
                '</ul></div>');

            var container = $('#spin-test');
            var $spin = container.ampSpin({width:350, height:150});
            var children = container.children();
            jasmine.Clock.tick(10);

            var spin = $spin.data("amp-ampSpin");

            //expect(children.eq(0)).toHaveClass(spin.options.states.visible);
            expect(children.eq(0)).toHaveClass(spin.options.states.seen);

        });

        it('should have the correct state while active / inactive', function(){

            jasmine.getStyleFixtures().fixturesPath = 'base';
            loadStyleFixtures('dist/amplience-sdk-client.css');

            setFixtures('<ul id="spin-test" style="background: orangered">' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/ffff00" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/00ffff" class="amp-main-img"></li>' +
                '</ul></div>');
            var $spin = $('#spin-test').ampSpin({width:350, height:150});
            jasmine.Clock.tick(10);

            var spin = $spin.data("amp-ampSpin");

            //expect(children.eq(0)).toHaveClass(spin.options.states.visible);
            expect($spin).toHaveClass(spin.options.states.inactive);

            var offset = $spin.offset();

            var md = $.Event("mousedown", {originalEvent: {clientX: offset.left + 25, clientY: offset.top + 25 }});
            $spin.trigger(md);

            expect($spin).toHaveClass(spin.options.states.active);
        });

        it('should have the correct cursor while active / inactive using default cursor settings', function(){

            jasmine.getStyleFixtures().fixturesPath = 'base';
            loadStyleFixtures('dist/amplience-sdk-client.css');

            setFixtures('<ul id="spin-test" style="background: orangered">' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/ffff00" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/00ffff" class="amp-main-img"></li>' +
                '</ul></div>');
            var $spin = $('#spin-test').ampSpin({width:350, height:150});
            jasmine.Clock.tick(10);

            var spin = $spin.data("amp-ampSpin");

            expect($spin.css('cursor')).toContain(spin.options.cursor.inactive);
            var offset = $spin.offset();

            var md = $.Event("mousedown", {originalEvent: {clientX: offset.left + 25, clientY: offset.top + 25 }});
            $spin.trigger(md);

            expect($spin.css('cursor')).toContain(spin.options.cursor.active);
        });

        it('should have the correct cursor while active / inactive using non-default cursor settings', function(){

            jasmine.getStyleFixtures().fixturesPath = 'base';
            loadStyleFixtures('dist/amplience-sdk-client.css');

            setFixtures('<ul id="spin-test" style="background: orangered">' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/ffff00" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/00ffff" class="amp-main-img"></li>' +
                '</ul></div>');

            var $spin = $('#spin-test').ampSpin({width:350, height:150,cursor:{active:'all-scroll',inactive:'crosshair'}});
            jasmine.Clock.tick(10);

            var spin = $spin.data("amp-ampSpin");

            expect($spin.css('cursor')).toContain(spin.options.cursor.inactive);
            var offset = $spin.offset();

            var md = $.Event("mousedown", {originalEvent: {clientX: offset.left + 25, clientY: offset.top + 25 }});
            $spin.trigger(md);

            expect($spin.css('cursor')).toContain(spin.options.cursor.active);
        });

        for (var i=0;i<cursors.length;i++) {
            (function(cursor) {
                it('it should work with '+cursor+' cursor', function(){

                    jasmine.getStyleFixtures().fixturesPath = 'base';
                    loadStyleFixtures('dist/amplience-sdk-client.css');

                    setFixtures('<ul id="spin-test" style="background: orangered">' +
                        '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                        '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                        '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                        '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                        '<li><img src="http://placehold.it/350x150/ffff00" class="amp-main-img"></li>' +
                        '<li><img src="http://placehold.it/350x150/00ffff" class="amp-main-img"></li>' +
                        '</ul></div>');

                    var $spin = $('#spin-test').ampSpin({width:350, height:150,cursor:{inactive:cursor}});
                    jasmine.Clock.tick(10);

                    var spin = $spin.data("amp-ampSpin");

                    expect($spin.css('cursor')).toContain(cursor);
                });
            }(cursors[i]));
        }

        it('should not set the start frame higher than the number of frames in spin', function(){

            setFixtures("<div><ul id='spin-test'>" +
                "<li><img src='http://placehold.it/350x150/ffff00' class='amp-main-img'></li>" +
                "</ul></div>");

            var $spin = $('#spin-test').ampSpin({start:3});
            var spin = $spin.data('amp-ampSpin');
            jasmine.Clock.tick(10);
            expect(spin._index).toEqual(1);
        });
    })
});
