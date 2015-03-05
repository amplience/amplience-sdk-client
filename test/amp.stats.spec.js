describe('amp.stats', function(){
    var callBacks,
        div;

    beforeEach(function(){
        callBacks = {
            normal: function() {
                return arguments;
            },
            normal2: function() {
                return arguments;
            },
            throws: function() {
                throw new Error('hello! welcome to fail, population : you');
            }
        };

        div = document.createElement('div');

        spyOn(callBacks, 'normal');
        spyOn(callBacks, 'normal2');
        spyOn(callBacks, 'throws');
    })

    it('should call cb when a single cb is bound and then triggered by any event',function(){
        // arrange

        amp.stats.bind(callBacks.normal);

        //act

        amp.stats.event(div,'slider','click',{});

        //verify

        expect(callBacks.normal).toHaveBeenCalled();

    });

    it('should call two cbs when two cbs are bound via array and then triggered by any event',function(){
        // arrange

        amp.stats.bind([callBacks.normal,callBacks.normal2]);

        //act

        amp.stats.event(div,'slider','click',{});

        //verify

        expect(callBacks.normal).toHaveBeenCalled();
        expect(callBacks.normal2).toHaveBeenCalled();

    });

    it('should call cb with correct attributes when triggered by any event',function(){
        // arrange

        amp.stats.bind(callBacks.normal);

        //act

        var value = {};
        amp.stats.event(div,'slider','click',value);

        //verify

        expect(callBacks.normal).toHaveBeenCalledWith(div,'slider','click',value);

    });

    it('should call two cbs when two cbs are bound sequentially then triggered by any event',function(){
        // arrange

        amp.stats.bind(callBacks.normal);
        amp.stats.bind(callBacks.normal2);

        //act

        amp.stats.event(div,'slider','click',{});

        //verify

        expect(callBacks.normal).toHaveBeenCalled();
        expect(callBacks.normal2).toHaveBeenCalled();

    });

    it('should call two cbs when two cbs are bound and then triggered by any event and the first throws an error',function(){
        // arrange

        amp.stats.bind([callBacks.throws,callBacks.normal]);

        //act

        amp.stats.event(div,'slider','click',{});

        //verify

        expect(callBacks.throws).toHaveBeenCalled();
        expect(callBacks.normal).toHaveBeenCalled();

    });

    it('should only call one cb when one cb is bound to click events and the other to hover and a click event is triggered',function(){
        // arrange

        amp.stats.bind({'event':'click',cb:callBacks.normal});
        amp.stats.bind({'event':'hover',cb:callBacks.normal2});

        //act
        
        amp.stats.event(div,'slider','click',{});

        //verify

        expect(callBacks.normal).toHaveBeenCalled();
        expect(callBacks.normal2).not.toHaveBeenCalled();

    });

    it('should only call one cb when one cb is bound to carousel type and the other to stack types and a carousel type event is triggered',function(){
        // arrange

        amp.stats.bind({'type':'carousel',cb:callBacks.normal});
        amp.stats.bind({'type':'stack',cb:callBacks.normal2});

        //act

        amp.stats.event(div,'carousel','click',{});

        //verify

        expect(callBacks.normal).toHaveBeenCalled();
        expect(callBacks.normal2).not.toHaveBeenCalled();

    });

    it('should only call one cb twice when one cb is bound to carousel.click type and carousel.hover types and a carousel.click, carousel.hover, stack.click and stack.hover type event is triggered',function(){
        // arrange

        amp.stats.bind({'type':'carousel','event':'click',cb:callBacks.normal});
        amp.stats.bind({'type':'carousel','event':'hover',cb:callBacks.normal});

        //act

        amp.stats.event(div,'carousel','click',{});
        amp.stats.event(div,'carousel','hover',{});
        amp.stats.event(div,'stack','click',{});
        amp.stats.event(div,'stack','hover',{});

        //verify

        expect(callBacks.normal.calls.length).toEqual(2);
        expect(callBacks.normal2.calls.length).toEqual(0);

    });

    it('should still call even through event name is null',function(){
        // arrange

        amp.stats.bind({'type':'carousel','event':null,cb:callBacks.normal});

        //act

        amp.stats.event(div,'carousel','click',{});
        amp.stats.event(div,'carousel','hover',{});

        //verify

        expect(callBacks.normal.calls.length).toEqual(2);

    });

    it('should still call even through type is null',function(){
        // arrange

        amp.stats.bind({'type':null,'event':'click',cb:callBacks.normal});

        //act

        amp.stats.event(div,'carousel','click',{});
        amp.stats.event(div,'carousel','hover',{});

        //verify

        expect(callBacks.normal.calls.length).toEqual(1);

    });


    it('should cb three times if cb is bound three times',function(){
        // arrange
        var options = [{'type':'carousel',cb:callBacks.normal},{'type':'carousel',cb:callBacks.normal},{'type':'carousel',cb:callBacks.normal}];
        amp.stats.bind(options);
        //act
        amp.stats.event(div,'carousel','click',{});
        //verify
        expect(callBacks.normal.calls.length).toEqual(3);
    });

    it('should cb when argument has default members on prototype',function(){
        // arrange
        Array.prototype.randomMethod = function(){};
        var options = [{'type':'carousel',cb:callBacks.normal},{'type':'carousel',cb:callBacks.normal},{'type':'carousel',cb:callBacks.normal}];
        amp.stats.bind(options);

        //act

        amp.stats.event(div,'carousel','click',{});

        //verify

        expect(callBacks.normal.calls.length).toEqual(3);

    });

    it('should handle bad inputs on event triggering',function(){
        // arrange
        var options = [{'type':'carousel',cb:callBacks.normal},{'type':'carousel',cb:callBacks.normal},{'type':'carousel',cb:callBacks.normal}];
        amp.stats.bind(options);

        //act
        amp.stats.event(null,undefined,null,null);
        amp.stats.event(div,'carousel','click',{})

        //verify

        expect(callBacks.normal.calls.length).toEqual(3);

    });

});