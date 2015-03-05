describe('amp.ampCarousel', function(){

    var browser = (function(){
        var ua= navigator.userAgent, tem,
            M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d\.]+)/i) || [];
        if(/trident/i.test(M[1])){
            tem=  /\brv[ :]+(\d+(\.\d+)?)/g.exec(ua) || [];
            return {'type':'IE','v':parseInt(tem[1],10)||''};
        }
        M= M[2]? [M[1], M[2]]:[navigator.appName, navigator.appVersion, '-?'];
        if((tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
        return {'type':M[0],'v':parseInt(M[1],10)};
    })();

    var expected = {
        'MSIE': browser.v >=9 ? {'can3d':false,'transform':'msTransform'} : {'can3d':false},
        'Chrome': browser.v >=39 ? {'can3d':true,'transform':'transform','transition':'transition','timing':'transitionTimingFunction'} :
                                   {'can3d':true,'transform':'WebkitTransform','transition':'transition','timing':'transitionTimingFunction'},
        'Firefox': {'can3d':true,'transform':'transform','transition':'transition','timing':'transitionTimingFunction'},
        'IE': {'can3d':true,'transform':'transform','transition':'transition','timing':'transitionTimingFunction'}
    };

    beforeEach(function(){
        jasmine.Clock.useMock();
        jQuery.fx.off = true;
    });

    describe('create', function(){


        it('should be able to create a carousel component with the class of amp-carousel', function(){
            var $carousel = setFixtures('<img id="carousel-test">').ampCarousel({});
            expect($carousel).toBeInDOM();
            expect($carousel).toHaveClass('amp-carousel');

        });

        it('should merge data-amp-carousel options with options set on create, options set on creation should take precedence', function(){
            var startframe1 = 5, startframe2 = 2, autoPlay = true, dir="horz";

            setFixtures("<div><ul id='carousel-test' data-amp-carousel='{\"autoplay\":\""+autoPlay+"\",\"startframe\":\""+startframe1+"\"}'>" +
                            "<li><img src='http://placehold.it/350x150/ffff00' class='amp-main-img'></li>" +
                        "</ul></div>");

            var $carousel = $('#carousel-test').ampCarousel({ dir:dir, start:startframe2});
            var carousel = $carousel.data('amp-ampCarousel');

            expect(!!carousel.options.autoplay).toEqual(autoPlay);
            expect(carousel.options.dir).toEqual(dir);
            expect(carousel.options.start).toEqual(startframe2);
        });

        it('should not set the start slide higher than the number of slides in carousel', function(){

            setFixtures("<div><ul id='carousel-test'>" +
                "<li><img src='http://placehold.it/350x150/ffff00' class='amp-main-img'></li>" +
                "</ul></div>");

            var $carousel = $('#carousel-test').ampCarousel({start:3});
            var carousel = $carousel.data('amp-ampCarousel');
            jasmine.Clock.tick(10);
            expect(carousel._index).toEqual(1);
        });
    });

    describe('layout', function(){

        it('should correctly feature check the browser', function() {
            jasmine.getStyleFixtures().fixturesPath = 'base';

            setFixtures('<ul id="carousel-test" style="background: orangered">' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '</ul></div>');


            $('#carousel-test li').css('width','350px');

            var $carousel = $('#carousel-test').ampCarousel();
            jasmine.Clock.tick(10);
            var carousel = $carousel.data("amp-ampCarousel");

            var detectedFeatures = carousel._canCSS3;
            var expectedFeatures = expected[browser.type];
            if($.isEmptyObject(detectedFeatures)){
                expect(false).toEqual(expectedFeatures.can3d);
            }else{
                expect(detectedFeatures.can3D).toEqual(expectedFeatures.can3d);
                expect(detectedFeatures.transform).toEqual(expectedFeatures.transform);
                expect(detectedFeatures.transition).toEqual(expectedFeatures.transition);
                expect(detectedFeatures.transitionTimingFunction).toEqual(expectedFeatures.timing);
            }

        });

        it('should correctly layout the carousel', function() {
            var width = 350;
            jasmine.getStyleFixtures().fixturesPath = 'base';
            loadStyleFixtures('dist/amplience-sdk-client.css');
            setFixtures('<ul id="carousel-test">' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '</ul>');
            $('#carousel-test li').css('width','350px');
            var $carousel = $('#carousel-test').ampCarousel({width:width, height:150,responsive:false});
            var carousel = $carousel.data("amp-ampCarousel");
            jasmine.Clock.tick(30);
            var detectedFeatures = carousel._canCSS3;
            var can3D = detectedFeatures.can3D;
            var toValue;
            if(detectedFeatures.transition && detectedFeatures.transform) {
                if(can3D) {
                    toValue = {'prop':detectedFeatures.transform,val:function(num) {
                        return browser.type === 'IE' ? 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, '+num+', 0, 0, 1)' : 'matrix(1, 0, 0, 1, '+num+', 0)';
                    }}
                } else {
                    toValue = {'prop':detectedFeatures.transform,val:function(num) {
                        return 'translate('+num+'px,0)';
                    }}
                }
            } else {
                toValue = {'prop':'left',val:function(num) {
                    return num+'px';
                }}
            }
            var offset = 0;
            var children = $carousel.find('li');
            for (var i= 0, len = children.length; i<len; i++) {
                expect(children.eq(i).css(toValue.prop)).toEqual(toValue.val(offset));
                offset+=width;
            }


        });
    });

    describe('goTo', function(){

        it('should  never loop if loop is set to false', function() {

            amp.init({
                client_id: "fake_client",
                di_basepath: "http://i1-orig-qa.adis.ws/"
            });

            var loop = jasmine.createSpy('loop');
            var goTo = jasmine.createSpy('goTo');
            amp.stats.bind({event:'loop',cb:loop});
            amp.stats.bind({event:'change',cb:goTo});

            jasmine.getStyleFixtures().fixturesPath = 'base';
            loadStyleFixtures('dist/amplience-sdk-client.css');

            setFixtures('<ul id="carousel-test">' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '</ul>');
            $('#carousel-test li').css('width','350px');
            var $carousel = $('#carousel-test').ampCarousel({width:350, height:150,loop:false,autoplay:true,responsive:false});
            var carousel = $carousel.data("amp-ampCarousel");
            jasmine.Clock.tick(10000);
            expect(goTo).toHaveBeenCalled();
            expect(loop).not.toHaveBeenCalled();


        });

        it('should not wrap around a slide when loop is set to false', function() {

            jasmine.getStyleFixtures().fixturesPath = 'base';
            loadStyleFixtures('dist/amplience-sdk-client.css');

            setFixtures('<div id="container"  style="width:857px"><ul id="carousel-test">' +
                '<li><img src="http://placehold.it/350x150/0000ff" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/00ff00" class="amp-main-img"></li>' +
                '<li><img src="http://placehold.it/350x150/ff0000" class="amp-main-img"></li>' +
                '</ul></div>');

            $('#carousel-test li').css('width','350px');

            var $carousel = $('#carousel-test').ampCarousel({width:350, height:150,loop:false});

            var carousel = $carousel.data("amp-ampCarousel");
            var detectedFeatures = carousel._canCSS3;
            var can3D = detectedFeatures.can3D;
            var toValue;
            if(detectedFeatures.transition && detectedFeatures.transform) {
                if(can3D) {
                    toValue = {'prop':detectedFeatures.transform,val:function(num) {
                        return browser.type === 'IE' ? 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, '+num+', 0, 0, 1)' : 'matrix(1, 0, 0, 1, '+num+', 0)';
                    }}
                } else {
                    toValue = {'prop':detectedFeatures.transform,val:function(num) {
                        return 'translate('+num+'px,0)';
                    }}
                }
            } else {
                toValue = {'prop':'left',val:function(num) {
                    return num+'px';
                }}
            }

            var direction = carousel._direction(3); //direction to get to our target slide
            expect(direction).toBeTruthy();
            carousel.goTo(3);
            jasmine.Clock.tick(50000);
            var lastSlide = $carousel.find('li:last');
            expect(lastSlide.css(toValue.prop)).toBe(toValue.val(700));
        })

    })
});