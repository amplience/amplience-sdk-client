describe('amp.widget.destroy', function(){
    var htmlTypes = {
        list:{
            clean: '<ul id="component">' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '</ul>',
            notClean: '<ul id="component"  class="specialClass" style="background-color: yellow;">' +
                '<li class="specialClass" style="background-color: yellow;"><img class="specialClass" style="background-color: yellow;" src="http://placehold.it/350x150/0000ff"></li>' +
                '<li class="specialClass" style="background-color: yellow;"><img src="http://placehold.it/350x150/0000ff"></li>' +
                '<li><img src="http://placehold.it/350x150/0000ff"></li>' +
                '</ul>'
        },
        video:{
            clean:'<div id="component"><video></video></div>',
            notClean:'<div id="component" class="specialClass" style="background-color: yellow;"><video></video></div>'
        },
        image:{
            clean:'<img id="component" src="http://placehold.it/350x150/0000ff">',
            notClean:'<img id="component" class="specialClass" style="background-color: yellow;" src="http://placehold.it/350x150/0000ff">'
        }
    };

    var ie8htmlTypes = {
        list: {
            clean: '<UL id="component" onremove="null">' +
                '<LI><IMG src="http://placehold.it/350x150/0000ff"></LI>' +
                '<LI><IMG src="http://placehold.it/350x150/0000ff"></LI>' +
                '<LI><IMG src="http://placehold.it/350x150/0000ff"></LI>' +
                '</ul>',
            notClean:'<UL id="component" onremove="null">' +
                '<LI style="BACKGROUND-COLOUR: YELLOW;"><IMG src="http://placehold.it/350x150/0000ff"></LI>' +
                '<LI><IMG src="http://placehold.it/350x150/0000ff"></LI>' +
                '<LI><IMG src="http://placehold.it/350x150/0000ff"></LI>' +
                '</ul>'
        },
        video: {
            clean:'<DIV id="component"><video></video></DIV>',
            notClean:'<DIV  style="BACKGROUND-COLOUR: YELLOW;" id="component"><video></video></DIV>'
        },
        image: {
            clean:'<IMG id="component" src="http://placehold.it/350x150/0000ff" onremove="null">',
            notClean:'<IMG  style="BACKGROUND-COLOUR: YELLOW;" id="component" src="http://placehold.it/350x150/0000ff" onremove="null">'
        }
    };

    var components = {
        ampCarousel:'list',
        ampStack:'list',
        ampSpin:'list',
        ampZoom:'image',
        ampZoomInline:'image',
        ampImage:'image',
        ampNav:'list',
        ampVideo:'video'
    };

    xdescribe('with no classes and styles defined', function(){
        beforeEach(function(){
            jasmine.Clock.useMock();
        });
        for (var i in components) {
            (function(component) {
                it('('+component+') should revert back to the original dom after destruction', function(){
                    var types;
                    if (navigator.userAgent.match(/MSIE 8/) !== null) {
                        types = ie8htmlTypes;
                    }else{
                        types = htmlTypes;
                    }

                    setFixtures('<div id="container">'+types[components[component]].clean+'</div>');

                    var $container = $('#container');
                    var $comp = $('#component')[component]();
                    jasmine.Clock.tick(10);

                    var comp = $comp.data("amp-"+component);
                    comp.destroy();
                    expect($container).toContainHtml(types[components[component]].clean.replace( / jQuery\d+/,'' ));

                });
            }(i));
        }
    });

    xdescribe('with classes and styles defined', function(){
        beforeEach(function(){
            jasmine.Clock.useMock();
        });
        for (var i in components) {
            (function(component) {
                it('('+component+') should revert back to the original dom after destruction', function(){
                    var types;
                    if (navigator.userAgent.match(/MSIE 8/) !== null) {
                        types = ie8htmlTypes;
                    }else{
                        types = htmlTypes;
                    }
                    setFixtures('<div id="container">'+types[components[component]].notClean+'</div>');
                    var $container = $('#container');
                    var $comp = $('#component')[component]();
                    jasmine.Clock.tick(10);

                    var comp = $comp.data("amp-"+component);
                    comp.destroy();
                    expect($container).toContainHtml(types[components[component]].notClean);
                });
            }(i));
        }
    });

});