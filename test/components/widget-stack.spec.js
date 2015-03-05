describe('amp.ampStack', function(){

    beforeEach(function(){
        jasmine.Clock.useMock();
    });

    describe('options', function(){
        it('should not set the start layer higher than the number of layers in stack', function(){
            setFixtures("<div><ul id='stack-test'>" +
                "<li><img src='http://placehold.it/350x150/ffff00' class='amp-main-img'></li>" +
                "</ul></div>");

            var $stack = $('#stack-test').ampStack({start:3});
            var stack = $stack.data('amp-ampStack');
            jasmine.Clock.tick(10);
            expect(stack._index).toEqual(1);
        });

        it('should not set the start layer lower than 1', function(){
            setFixtures("<div><ul id='stack-test'>" +
                "<li><img src='http://placehold.it/350x150/ffff00' class='amp-main-img'></li>" +
                "</ul></div>");
            var $stack = $('#stack-test').ampStack({start:-2});
            var stack = $stack.data('amp-ampStack');
            jasmine.Clock.tick(10);
            expect(stack._index).toEqual(1);
        });

        it('should move to the next layer with autoplay set', function(){
            setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li><li><img src="http://placehold.it/350x150"></li></ul>');
            var $stack = $('#stack-test').ampStack({autoplay:true, duration:3000});

            expect($stack.children().eq(1)).not.toHaveClass('amp-selected');
            expect($stack.children().eq(1)).not.toHaveClass('amp-seen');

            jasmine.Clock.tick(3001);

            expect($stack.children().eq(1)).toHaveClass('amp-selected');
            expect($stack.children().eq(1)).toHaveClass('amp-seen');

        });

        it('should delay layer change by the set option', function(){
            setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li><li><img src="http://placehold.it/350x150"></li></ul>');
            var $stack = $('#stack-test').ampStack({delay:1000});
            var stack = $stack.data('amp-ampStack');

            stack.play();
            expect($stack.children().eq(1)).not.toHaveClass('amp-selected');
            expect($stack.children().eq(1)).not.toHaveClass('amp-seen');

            jasmine.Clock.tick(1000);
            expect($stack.children().eq(1)).toHaveClass('amp-selected');
            expect($stack.children().eq(1)).toHaveClass('amp-seen');
        });

        it('should loop when loop set to true', function(){
            setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                            '<li><img src="http://placehold.it/350x150"></li>' +
                            '<li><img src="http://placehold.it/350x150"></li>' +
                            '<li><img src="http://placehold.it/350x150"></li></ul>');

            var $stack = $('#stack-test').ampStack({loop:true});
            var stack = $stack.data('amp-ampStack');

            var children = $('#stack-test').children();
            stack.goTo(stack.count)

            expect(stack.canNext()).toBe(true);
        });

        it('should have the correct state classes after init', function(){
            setFixtures('<ul id="stack-test">' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '</ul>');

            var container = $('#stack-test');
            var $stack = container.ampStack({width:350, height:150});
            var children = container.children();
            jasmine.Clock.tick(10);

            var stack = $stack.data("amp-ampStack");

            expect(children.eq(0)).toHaveClass(stack.options.states.seen);
            expect(children.eq(1)).not.toHaveClass(stack.options.states.seen);

        });

        it('should have the correct state while active / inactive', function(){
            setFixtures('<ul id="stack-test">' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '</ul>');

            var container = $('#stack-test');
            var $stack = container.ampStack({width:350, height:150});
            var stack = $stack.data("amp-ampStack");
            var children = container.children();

            expect(children.eq(0)).toHaveClass(stack.options.states.selected);
            expect(children.eq(0)).toHaveClass(stack.options.states.seen);
            stack.goTo(3);
            expect(children.eq(2)).toHaveClass(stack.options.states.selected);
            expect(children.eq(2)).toHaveClass(stack.options.states.seen);
        });

        it('should resize if responsive true and height and width set', function(){
            jasmine.getStyleFixtures().fixturesPath = 'base';
            loadStyleFixtures('dist/amplience-sdk-client.css');

            setFixtures('<div id="stack-container"><ul id="stack-test">' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '</ul></div>');

            var $container = $('#stack-container');
            var $stack = $('#stack-test').ampStack({width:16, height:9});
            var stack = $stack.data("amp-ampStack");

            $container.width(1000);
            $container.height(1000);

            stack._calcSize();

            expect($stack.width()).toEqual($container.width());
            expect($stack.height()).toEqual(Math.round($container.width() * (stack.options.height/ stack.options.width)));
        });

        it('should not resize responsive is false', function(){
            jasmine.getStyleFixtures().fixturesPath = 'base';
            loadStyleFixtures('dist/amplience-sdk-client.css');

            setFixtures('<div id="stack-container"><ul id="stack-test">' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '</ul></div>');

            var $container = $('#stack-container');
            var $stack = $('#stack-test').ampStack({width:200, height:100, responsive:false});
            var stack = $stack.data("amp-ampStack");

            $container.width(1000);
            $container.height(1000);

            stack._calcSize();

            expect($stack.width()).toEqual(stack.options.width);
            expect($stack.height()).toEqual(stack.options.height);
        });
    });

    describe('methods', function(){
        describe('create', function(){
            it('should be able to create a stack with a class of amp-stack', function(){
                var $stack = setFixtures('<div id="stack-test"></div>').ampStack({});
                expect($stack).toBeInDOM();
                expect($stack).toHaveClass('amp-stack');
            })

            it('should be able to create a stack containing the correct dom structure', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li><li><img src="http://placehold.it/350x150"></li></ul>');
                var $stack = $('#stack-test').ampStack({});

                expect($stack.children().eq(0)).toHaveClass('amp-layer');
                expect($stack.children().eq(0)).toHaveClass('amp-selected');
                expect($stack.children().eq(0)).toHaveClass('amp-seen');

                expect($stack.children().eq(1)).toHaveClass('amp-layer');
                expect($stack.children().eq(1)).not.toHaveClass('amp-selected');
                expect($stack.children().eq(1)).not.toHaveClass('amp-seen');

            })
        });

        describe('next', function(){
            it('should move to the next layer by clicking next', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li><li><img src="http://placehold.it/350x150"></li></ul>');
                var $stack = $('#stack-test').ampStack({});
                var stack = $stack.data('amp-ampStack');
                spyOn(stack,'next').andCallThrough();

                expect(stack.next).not.toHaveBeenCalled();
                expect($stack.children().eq(1)).not.toHaveClass('amp-selected');
                expect($stack.children().eq(1)).not.toHaveClass('amp-seen');

                stack.next();
                expect(stack.next).toHaveBeenCalled();
                expect($stack.children().eq(1)).toHaveClass('amp-selected');
                expect($stack.children().eq(1)).toHaveClass('amp-seen');
            });
        });

        describe('prev', function(){
            it('should move to the prev layer by clicking prev', function(){
                setFixtures('<div id="stack-container"><ul id="stack-test">' +
                    '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                    '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                    '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                    '</ul></div>');
                var $stack = $('#stack-test').ampStack({});
                var stack = $stack.data('amp-ampStack');
                stack.goTo(stack.count)

                var eqVal = stack.count-1;
                spyOn(stack,'prev').andCallThrough();

                expect(stack.prev).not.toHaveBeenCalled();
                expect($stack.children().eq(eqVal-1)).not.toHaveClass('amp-selected');
                expect($stack.children().eq(eqVal-1)).not.toHaveClass('amp-seen');

                stack.prev();
                expect(stack.prev).toHaveBeenCalled();
                expect($stack.children().eq(eqVal-1)).toHaveClass('amp-selected');
                expect($stack.children().eq(eqVal-1)).toHaveClass('amp-seen');

            })
        });

        describe('play', function(){
            it('should play when played', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li><li><img src="http://placehold.it/350x150"></li></ul>');
                var $stack = $('#stack-test').ampStack({delay:50});
                var stack = $stack.data('amp-ampStack');
                var curIndex = stack._index;

                spyOn(stack,'play').andCallThrough();;
                expect(stack.play).not.toHaveBeenCalled();

                stack.play();
                jasmine.Clock.tick(50);
                expect(stack.play).toHaveBeenCalled();
                expect(stack._index).not.toEqual(curIndex);
            });
        });

        describe('pause', function(){
            it('should pause when paused', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>');

                var $stack = $('#stack-test').ampStack({delay:200});
                var stack = $stack.data('amp-ampStack');
                stack.play();
                jasmine.Clock.tick(200);
                var curIndex = stack._index;

                spyOn(stack,'pause').andCallThrough();
                expect(stack.pause).not.toHaveBeenCalled();
                stack.pause();
                jasmine.Clock.tick(400);
                expect(stack.pause).toHaveBeenCalled();
                expect(stack._index).toEqual(curIndex);

            });

        });

        describe('goTo', function(){
            it('should goto the selected stack', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                             '<li><img src="http://placehold.it/350x150"></li>' +
                            '<li><img src="http://placehold.it/350x150"></li></ul>');

                var $stack = $('#stack-test').ampStack({autoplay:true});
                var stack = $stack.data('amp-ampStack');
                var children = $('#stack-test').children();
                var goToValue = 2;
                spyOn(stack,'goTo').andCallThrough();

                expect(stack.goTo).not.toHaveBeenCalled();

                stack.goTo(goToValue);
                expect(stack.goTo).toHaveBeenCalled();
                expect(children.eq(goToValue-1)).toHaveClass('amp-selected');
            })
        });

        describe('visible', function(){
            it('should inform child widgets of visible status', function(){
                setFixtures("<div><ul id='stack-test'>" +
                    "<li><img src='http://placehold.it/350x150/ffff00' class='amp-main-img'></li>" +
                    "<li><img src='http://placehold.it/350x150/ffff00' class='amp-main-img'></li>" +
                    "<li><img src='http://placehold.it/350x150/ffff00' class='amp-main-img'></li>" +
                    "<li><img id='zoom-test' src='http://placehold.it/350x150/ffff00' class='amp-main-img'></li>" +
                    "<li><ul>" +
                         "<li><img id='zoom-test1' src='http://placehold.it/350x150/ffff00' class='amp-main-img'></li>" +
                    "</ul></li>" +
                    "</ul></div>");

                var $stack = $('#stack-test').ampStack();
                var stack = $stack.data('amp-ampStack');
                var $zoom = $('#zoom-test').ampZoom();
                var zoom = $zoom.data('amp-ampZoom');
                var $zoom1 = $('#zoom-test1').ampZoom();
                var zoom1 = $zoom1.data('amp-ampZoom');

                spyOn(zoom,'visible').andCallThrough();
                spyOn(zoom1,'visible').andCallThrough();

                stack.callChildMethod($zoom.parent(), "visible", false);
                stack.callChildMethod($zoom1.parent(), "visible", false);

                expect(zoom.visible).toHaveBeenCalledWith(false);
                expect(zoom1.visible).toHaveBeenCalledWith(false);

                stack.goTo(4);
                expect(zoom.visible).toHaveBeenCalledWith(true);
                expect(zoom._visible).toBe(true);
                expect(zoom1.visible).not.toHaveBeenCalledWith(true);

                stack.goTo(5);
                expect(zoom1.visible).toHaveBeenCalledWith(true);
                expect(zoom1._visible).toBe(true);

            });
        });

         describe('bind', function(){
            it('should goto carousel layer on stack goTo', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                        '<li><img src="http://placehold.it/350x150"></li>' +
                        '<li><img src="http://placehold.it/350x150"></li>' +
                        '<li><img src="http://placehold.it/350x150"></li></ul>' +
                    '<ul id="carousel-test"><li><img src="http://placehold.it/350x150"></li>' +
                        '<li><img src="http://placehold.it/350x150"></li>' +
                        '<li><img src="http://placehold.it/350x150"></li>' +
                        '<li><img src="http://placehold.it/350x150"></li></ul>');

                var $stack = $('#stack-test').ampStack();
                var stack = $stack.data('amp-ampStack');
                var $carousel = $('#carousel-test').ampCarousel({delay:0,loop:false,animate:false});
                var carousel = $carousel.data('amp-ampCarousel');

                carousel.bind({on:'goTo','action':'goTo',selector:'#stack-test'});
                carousel.goTo(2);
                expect(carousel._index).toEqual(stack._index);
            });

            it('should goTo stack layer on carousel selected', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>' +
                    '<ul id="carousel-test"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>');

                var $stack = $('#stack-test').ampStack();
                var stack = $stack.data('amp-ampStack');
                var $carousel = $('#carousel-test').ampCarousel({delay:0,loop:false,animate:false});
                var carousel = $carousel.data('amp-ampCarousel');

                carousel.bind({on:'select','action':'goTo',selector:'#stack-test'});

                carousel.select(2);
                expect(carousel._index).toEqual(stack._index);
            });

            it('should goto layer on spin goTo', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>' +
                    '<ul id="spin-test"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>');

                var $stack = $('#stack-test').ampStack({loop:false});
                var stack = $stack.data('amp-ampStack');
                var $spin = $('#spin-test').ampSpin();
                var spin = $spin.data('amp-ampSpin');

                spin.bind({on:'goTo','action':'goTo',selector:'#stack-test'});
                spin.goTo(2);
                expect(spin._index).toEqual(stack._index);

                spin.goTo(3);
                expect(stack._index).toEqual(spin._index);
            });

            it('should goto layer on spin goTo', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>' +
                    '<ul id="spin-test"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>');

                var $stack = $('#stack-test').ampStack({loop:false});
                var stack = $stack.data('amp-ampStack');
                var $spin = $('#spin-test').ampSpin();
                var spin = $spin.data('amp-ampSpin');

                spin.bind({on:'goTo','action':'goTo',selector:'#stack-test'});
                spin.goTo(2);
                expect(spin._index).toEqual(stack._index);

                spin.goTo(3);
                expect(stack._index).toEqual(spin._index);
            });

            it('should goto layer on carousel layer select', function(){
                setFixtures('<ul id="carousel-test1"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>' +
                    '<ul id="carousel-test2"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>');

                var $carousel1 = $('#carousel-test1').ampCarousel();
                var carousel1 = $carousel1.data('amp-ampCarousel');
                var $carousel2 = $('#carousel-test2').ampCarousel();
                var carousel2= $carousel2.data('amp-ampCarousel');

                carousel1.bind({on:'select','action':'goTo',selector:'#carousel-test2'});
                carousel2.bind({on:'goTo','action':'select',selector:'#carousel-test1'});

                carousel1.select(2);
                expect(carousel1._index).toEqual(carousel2._index);
                carousel2.goTo(3);
                expect(carousel1._index).toEqual(carousel2._index);
            });

        });

        describe('canNext', function(){
            it('should be false if not able to move to next layer  and loop is false', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>');

                var $stack = $('#stack-test').ampStack({loop:false});
                var stack = $stack.data('amp-ampStack');
                stack.goTo(stack.count);

                expect(stack.canNext()).toBe(false);
            });

            it('should be true if able to move to next layer  and loop is false', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>');

                var $stack = $('#stack-test').ampStack({loop:false});
                var stack = $stack.data('amp-ampStack');
                stack.goTo(stack.count - 1);

                expect(stack.canNext()).toBe(true);
            });
        });

        describe('canPrev', function(){
            it('should be false if not able to move to prev layer and loop is false', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>');

                var $stack = $('#stack-test').ampStack({loop:false});
                var stack = $stack.data('amp-ampStack');

                expect(stack.canPrev()).toBe(false);
            });

            it('should be true if able to move to prev layer and loop is false', function(){
                setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li>' +
                    '<li><img src="http://placehold.it/350x150"></li></ul>');

                var $stack = $('#stack-test').ampStack({loop:false});
                var stack = $stack.data('amp-ampStack');
                stack.goTo(2);

                expect(stack.canPrev()).toBe(true);
            });
        });
    });

    describe('events', function(){
        it('should call change on change', function(){
            setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                '<li><img src="http://placehold.it/350x150"></li>' +
                '<li><img src="http://placehold.it/350x150"></li></ul>');

            var selector = '#stack-test';
            var $stack = $(selector).ampStack();
            var stack = $stack.data('amp-ampStack');

            var spyEvent = spyOnEvent(selector, 'change');
            stack.goTo(2);
            expect('change').toHaveBeenTriggeredOnAndWith(selector, {index:2, canNext:true, canPrev:true});
        });

        it('should call looped on loop', function(){
            setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                '<li><img src="http://placehold.it/350x150"></li>' +
                '<li><img src="http://placehold.it/350x150"></li></ul>');

            var selector = '#stack-test';
            var $stack = $(selector).ampStack({autoplay:true, delay:50});

            var spyEvent = spyOnEvent(selector, 'looped');
            jasmine.Clock.tick(151);
            expect('looped').toHaveBeenTriggeredOnAndWith(selector, "forwards");
        });

        it('should call play on play', function(){
            setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                '<li><img src="http://placehold.it/350x150"></li>' +
                '<li><img src="http://placehold.it/350x150"></li></ul>');

            var selector = '#stack-test';
            var spyEvent = spyOnEvent(selector, 'play');
            var $stack = $(selector).ampStack();
            var stack = $stack.data('amp-ampStack');

            stack.play();
            expect("play").toHaveBeenTriggeredOnAndWith(selector, {});
        });

        it('should call pause on pause', function(){
            setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                '<li><img src="http://placehold.it/350x150"></li>' +
                '<li><img src="http://placehold.it/350x150"></li></ul>');

            var selector = '#stack-test';
            var spyEvent = spyOnEvent(selector, 'pause');
            var $stack = $(selector).ampStack();
            var stack = $stack.data('amp-ampStack');

            stack.pause();
            expect("pause").toHaveBeenTriggeredOnAndWith(selector, {});
        });

        it('should call created after create', function(){
            setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                '<li><img src="http://placehold.it/350x150"></li>' +
                '<li><img src="http://placehold.it/350x150"></li></ul>');

            var selector = '#stack-test';
            var spyEvent = spyOnEvent(selector, 'created');
            var $stack = $(selector).ampStack({loop:false});

            expect("created").toHaveBeenTriggeredOnAndWith(selector, {index:1, canNext:true, canPrev:false});
        });

        xit('should call visible on layer visible', function(){
            setFixtures('<ul id="stack-test"><li><img src="http://placehold.it/350x150"></li>' +
                '<li><img src="http://placehold.it/350x150"></li>' +
                '<li><img src="http://placehold.it/350x150"></li></ul>');

            var selector = '#stack-test';
            var $stack = $(selector).ampStack();
            var stack = $stack.data('amp-ampStack');
            var spyEvent = spyOnEvent(selector, 'visible');

            stack.goTo(2);
            expect("visible").toHaveBeenTriggeredOnAndWith(selector, {index:1, canNext:true, canPrev:false});
        });
    });
});