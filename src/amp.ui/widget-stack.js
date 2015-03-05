// amplience-sdk-client v{{VERSION}}
(function ( $ ) {
    $.widget( "amp.ampStack", {
        // Default options.
        options: {
            delay: 3000,
            autoplay:false,
            loop:true,
            fade:false,
            start:1,
            responsive:true,
            center:false,
            parentSize:false,
            gesture:{
                enabled:false,
                fingers:1,
                dir:'horz',
                distance:50
            },
            states:{
                "selected":"amp-selected",
                "seen":"amp-seen"
            }
        },
        _getCreateOptions:function(){
            var attributes = this.element.data().ampStack;
            if (attributes) {
                return $.extend(true, {}, this.options, attributes);
            }
            return this.options;
        },
        _create: function() {
            var _asyncMethods = [],
                self = this,
                children = this._children = this.element.children();
            this.canTouch =  !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
            this.element.addClass('amp');
            this.element.addClass('amp-stack');
            this.count = this._children.length;
            this._index = Math.max(1,Math.min(this.options.start,this.count));
            children.addClass('amp-layer');
            children.css({'display':'none'});
            children.eq(this._index-1).css('display','block');
            children.eq(this._index-1).addClass(this.options.states.selected + ' ' +this.options.states.seen);
            this._addGestures();
            if(this.options.autoplay) {
                this.play();
            }
            setTimeout(function(_self) {
                return function() {
                    return _self._calcSize();
                }
            }(self),1);

            $(window).bind("resize", function(_self) {
                return function() {
                    return setTimeout($.proxy(_self._calcSize,_self),1);
                }
            }(self));



            this._track("created",{'index':this._index,'canNext':this.canNext(),'canPrev':this.canPrev()});

        },

        _addGestures : function() {
            if(!this.options.gesture.enabled || !this.canTouch)
                return;
            var start, move, stop, getEvent;

            this._startG = function(e){

                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ) {
                    if (e.originalEvent.touches.length!=this.options.gesture.fingers)
                        return true;
                }
                this.changed = false;
                this.moved = false;
                this.startTouchEvent = e;
                var e = this._getEvent(e);
                this.startPos = this.options.gesture.dir == 'horz' ?  e.pageX - e.target.offsetLeft : e.pageY - e.target.offsetTop;
                $(window).on('touchmove',$.proxy(this._moveG,this));
                $(window).on('touchcancel',$.proxy(this._stopG,this));
                $(window).on('touchend',$.proxy(this._stopG,this));
                return true;
            };

            this._getEvent = function(e) {
                if(e.type == "touchend" || e.type == "touchcancel") {
                    e = this.lastEvent;
                }
                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ) {
                    e = e.originalEvent.touches[0];
                }
                return e;
            };

            this._moveG = function(e){
                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ) {
                    if (e.originalEvent.touches.length!=this.options.gesture.fingers)
                        return true;
                }
                this.moved = true;
                this.lastEvent = e;
                e = this._getEvent(e);
                if(this.options.gesture.dir == 'horz' ? e.pageX - this.startPos: e.pageY - this.startPos !=0){
                    return false;
                }
                return true;
            };

            this._stopG = function(e){
                $(window).off('touchmove',$.proxy(this._moveG,this));
                $(window).off('touchcancel',$.proxy(this._stopG,this));
                $(window).off('touchend',$.proxy(this._stopG,this));
                if(this.moved && !this.changed){
                    this.changed = true;
                    e = this._getEvent(e);
                    var endPos = this.options.gesture.dir == 'horz' ?  e.pageX - e.target.offsetLeft : e.pageY - e.target.offsetTop;
                    var diff = endPos - this.startPos;
                    if(Math.abs(diff)<this.options.gesture.distance)
                        return;
                    if(diff>0) {
                        this.prev();
                    } else {
                        this.next();
                    }
                }
            };

            this._children.on('touchstart', $.proxy(this._startG,this));

        },

        _getIndex : function(_index) {
            var children = this._children;
            if(_index > children.length){
                if(!this.options.loop)
                    return _index;
                while(_index > children.length) {
                    _index = _index-children.length;
                }
            } else if(_index<1) {
                if(!this.options.loop)
                    return _index;
                while(_index<1) {
                    _index += children.length;
                }
            }
            return _index;
        },
        play: function(){
            var self = this;
            clearInterval(this.interval);
            this.interval = setInterval(function() {
                self.next();
            },this.options.delay);
            this._track("play",null);
        },
        pause: function(){
            clearInterval(this.interval);
            this._track("pause",null);
        },
        next: function() {
            this.goTo(this._index+1);
        },
        prev: function() {
            this.goTo(this._index-1);
        },
        redraw: function() {
            this._calcSize();
        },
        _calcSize : function() {
            var w,h;
            if ((this.options.responsive) && (this.options.width && this.options.height && this.options.width!='auto' && this.options.height!='auto')) {
                if(!this.options.parentSize) {
                    w  = Math.round((this.element.width()));
                    h =  Math.round((w*(this.options.height/this.options.width)));
                    this.element.height(h);
                } else {
                    w  = Math.round((this.element.parent().width()));
                    h =  Math.round((w*(this.options.height/this.options.width)));
                    if(h > this.element.parent().height()) {
                        h = this.element.parent().height();
                        w = Math.round((h*(this.options.width/this.options.height)));

                    }
                    this.element.width(w);
                    this.element.height(h);
                }
                if(this.options.center) {
                    this.element.css('margin-left',((this.element.parent().width()/2)-(w/2))+'px');
                    this.element.css('margin-top',((this.element.parent().height()/2)-(h/2))+'px');
                }

            } else {
                if (this.options.width && this.options.width!='auto') {
                    this.element.width(this.options.width);
                } else if (this.options.width=='auto') {
                    var biggest = 0;
                    for(var i=0;i<this.count;i++) {

                        for (var i = 0 ; i < this.count; i++) {
                            var elm = this._children.eq(i),
                                display = elm.css('display');
                            elm.css('display','block');
                            biggest = Math.max(elm.outerWidth(true),biggest);
                            elm.css('display',display);
                        }
                    }
                    this.element.width(biggest);
                }
                if (this.options.height && this.options.height!='auto') {
                    this.element.height(this.options.height);
                } else if (this.options.height=='auto') {
                    var biggest = 0;
                    for(var i=0;i<this.count;i++) {
                        for (var i = 0 ; i < this.count; i++) {
                            var elm = this._children.eq(i),
                                display = elm.css('display');
                            elm.css('display','block');
                            var h = elm.outerHeight(true);
                            biggest = Math.max(elm.outerHeight(true),biggest);
                            elm.css('display',display);
                        }
                    }
                    this.element.height(biggest);
                }
            }
        },
        _onFinish: function() {
            var count = 1,
                self = this;
            while(this._asyncMethods.length!=0) {
                var method = this._asyncMethods.splice(0,1)[0];
                if(method.func && method.args) {
                    setTimeout(function(){
                        method.func.apply(self,method.args);
                    },count);
                    count++
                }
            }
        },
        visible: function(visible, parent) {
            if (visible != this._visible) {
                this._track('visible',{'visible':visible});
                this._visible = visible;
                this.callChildMethod(this._children.eq(this._index-1),'visible',visible)
                if(visible)
                    this._calcSize();
            }
        },
        callChildMethod: function(element,type,value) {
            var recursive = function(children) {
                for(var m=0;m<children.length;m++) {
                    var found = false,
                        child = $(children[m]),
                        components = child.data();
                    for (var c in components) {
                        if(components.hasOwnProperty(c)){
                            var component = components[c];
                            if(component[type] && typeof component[type] == 'function' && c.substring(0,3)=='amp'){
                                component[type](value);
                                found = true;
                            }
                        }
                    }
                    // go through only one amp-component deep
                    if(!found) {
                        recursive(child.children());
                    }
                }
            };
            recursive(element.children());
        },
        goTo:function(_index,triggered,noAnim) {
            _index = parseInt(_index);

            if(isNaN(_index))
                return;

            if(this._animating) {
                this._asyncMethods.push({func:this.goTo,args:arguments});
                return;
            }

            if(!triggered) {
                this._exeBinds(_index,'goTo');
            }

            if(this._getIndex(_index) == this._index)
                return;

            if(_index > this.count){
                if(!this.options.loop)
                    return;
                while(_index > this.count) {
                    _index = _index-this.count;
                }
                this._track("looped","forwards");
            } else if(_index<1) {
                if(!this.options.loop)
                    return;
                while(_index<1) {
                    _index += this.count;
                }
                this._track("looped","backwards");
            }
            if(!noAnim) {
                this._animate(_index);
            }
        },

        _exeBinds:function(value,on){
            // triggering goTos and Selects on elements set up by ampNav
            if(!this._boundArray)
                return;
            for (var i = 0; i < this._boundArray.length; i++) {
                var obj = this._boundArray[i];
                if(on && on!=obj.on)
                    continue;
                var $target = $(obj.selector);
                var components = $target.data();
                for (var c in components) {
                    if(components.hasOwnProperty(c)){
                        var component = components[c];
                        if(component[obj.action] && c.substring(0,3)=='amp'){
                            component[obj.action](value,true);
                        }
                    }
                }
            }
        },
        _numToIndex:function(num){
            if(num > this.count){
                if(!this.options.loop)
                    return this.count;
                while(num > this.count) {
                    num = num-this.count;
                }
            } else if(num<1) {
                if(!this.options.loop)
                    return 1;
                while(num<1) {
                    num += this.count;
                }
            }
            return num;
        },
         bind:function(options) {
            if(!this._boundArray)
                this._boundArray = [];
            this._boundArray.push(options);
        },
        canPrev : function() {
            return this.options.loop || this._index>1;
        },
        canNext : function() {
            return this.options.loop || this._index<this.count;
        },
        _animate : function(_index){
            var items = this.element,
                currItem  = items.children('li').eq(this._index - 1),
                nextItem = items.children('li').eq(_index - 1);

            currItem.removeClass(this.options.states.selected);
            if(this.options.fade){
                currItem.fadeOut();
            } else {
                currItem.css('display','none');
            }

            nextItem.addClass(this.options.states.selected + ' ' +this.options.states.seen);
            if(this.options.fade){
                nextItem.fadeIn();
            } else {
                nextItem.css('display','block');
            }
            this._setIndex(_index);
        },
        _setIndex:function(index) {
            var elmWas = this._children.eq(this._index-1);
            var elm = this._children.eq(index-1);
            this.callChildMethod(elm,'visible',true);
            this.callChildMethod(elmWas,'visible',false);
            this._index = index;
            this._track("change",{'index':index,'canPrev':this.canPrev(),'canNext':this.canNext()});
        },
        _track: function(event,value) {
            this._trigger( event, null, value );
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element,'stack',event,value);
            }
        },
        _destroy: function() {
            this.element.removeClass('amp');
            this.element.removeClass('amp-stack');
            this._removeEmptyAttributeHelper(this.element);
            var children = this._children;
            children.removeClass('amp-layer');
            children.removeClass(this.options.states.selected);
            children.removeClass(this.options.states.seen);
            children.css('display','');
            for (var i=0,len=children.length;i<len;i++ ) {
                this._removeEmptyAttributeHelper($(children[i]));
            }
        },
        _removeEmptyAttributeHelper:function(elm, attsToCleanIfEmpty){
            var attArr = attsToCleanIfEmpty || ['class','style'];
            for (var i= 0,len=attArr.length;i<len;i++ ) {
                if(!(elm.attr(attArr[i]) && elm.prop(attArr[i]))){
                    elm.removeAttr(attArr[i]);
                }
            }
        }
    });


}( jQuery ));