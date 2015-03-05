// amplience-sdk-client v0.1.0
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
(function ( $ ) {

    $.widget( "amp.ampCarousel",$.amp.ampStack, {
        options:{
            animDuration : 250,
            easing : '',
            dir : 'horz',
            animate:true,
            layout:'standard',
            start:1,
            preferForward: false,
            no3D: false,
            gesture:{
                enabled:false,
                fingers:2,
                distance:50
            },
            onActivate: {
                select:true,
                goTo:true
            },
            preloadNext:true,
            responsive:true,
            states : {
                visible : 'amp-visible',
                partiallyVisible: 'amp-partially-visible'
            }
        },
        _getCreateOptions:function(){
            var attributes = this.element.data().ampCarousel;
            if (attributes) {
                return $.extend(true, {}, this.options, attributes);
            }
            return this.options;
        },
        _layoutManagers:{},
        _create: function() {

            this._elms = [];
            this._visible = 0;
            this._asyncMethods = [];
            this._canNext = true;
            var self = this;

            this.options.delay = Math.max(this.options.delay,this.options.animDuration+1);
            this.options.animDuration = this.options.animate ? this.options.animDuration : 1;
            this.canTouch =  !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);
            this.element.addClass('amp');
            this.element.addClass('amp-carousel');
            this.element.wrapInner("<div class='amp-anim-container' style='width:100%;height:100%;position:absolute'></div>");
            this._container = this.element.children().eq(0);
            this._containerPos = 0;
            this._children = this.element.children().eq(0).children();
            this.count = this._children.length;
            this._checkCSS3();
            this._index = Math.max(1,Math.min(this.options.start,this.count));
            this._selectedIndex = this._index;
            this._children.addClass('amp-slide');
            this._calcSize();
            this._chooseLayoutManager();
   
            this._children.eq(this._index-1).addClass(this.options.states.selected);

            if(this.options.onActivate.goTo || this.options.onActivate.select ) {
                for (var i = 0 ; i < this.count; i++) {
                    var start = function() {
                        self.moved = false;
                        setTimeout(function(){
                            $(window).on(!this.canTouch?'mousemove':'touchmove', $.proxy(move,self));
                        },1)

                    };
                    var move = function() {
                        self.moved = true;
                    };
                    var activate = (function(_i){
                        var me = self;
                        return function(e){
                            $(window).off(!this.canTouch?'mousemove':'touchmove', $.proxy(move,self));
                            if(me.moved)
                                return true;
                            if (me.options.onActivate.goTo)
                                me.goTo(_i);
                            if (me.options.onActivate.select)
                                me.select(_i);
                            return true;
                        }
                    }(i+1));

                    this._children.eq(i).on(!this.canTouch?'mousedown':'touchstart', $.proxy(start,self));
                    this._children.eq(i).on(!this.canTouch?'mouseup':'touchend',$.proxy(activate,self));
                }
            }

            this._calcSize();
            setTimeout($.proxy(this._calcSize,this),1);

            if(this.options.responsive){
                $(window).bind("resize", function(_self) {
                    return function() {
                       return setTimeout($.proxy(_self.redraw,_self),1);
                    }
                }(self));
            }


            if(this.options.autoplay) {
                this.play();
            }

            this._preloadNext();
            this._track("created",{'index':this._index,'canNext':this.canNext(),'canPrev':this.canPrev(),'visible':this._visible, 'count':this.count});
        },
        _chooseLayoutManager : function(){
            var chosenLayout,
                layout
            if( Object.prototype.toString.call( this.options.layout ) === '[object Array]' ) {
                for (var i=0; i<this.options.layout.length;i++) {
                    layout = this._layoutManagers[this.options.layout[i]];
                    if (this.checkFeatures(layout)) {
                        chosenLayout = layout;
                        break;
                    }
                }
            } else {
                layout = this._layoutManagers[this.options.layout];
                if (this.checkFeatures(layout)) {
                    chosenLayout = layout;
                }
            }
            if (!chosenLayout) {
                chosenLayout = this._layoutManagers.standard;
            }
            this._layoutManager = chosenLayout.create(this);
        },
        _calcSize: function() {
            this._super();
            if(this._layoutManager)
                this._layoutManager.layout(this._index);
            this._track('resized',{'index':this._index,'canNext':this.canNext(),'canPrev':this.canPrev(),'visible':this._visible, 'count':this.count});
        },
        _firstCharLowerCase : function(str) {
            return (str.substr(0,1).toLowerCase()+str.substr(1));
        },
        _dashConvert: function(val) {
            var str = '';
            for(var i =0; i<val.length; i++) {
                var c = val.substr(i,1);
                if (c === c.toUpperCase()) {
                    str+='-'+c.toLowerCase();
                } else {
                    str+=c;
                }
            }
            return str;
        },
        _checkCSS3: function() {
            var prefixes = ['', 'Webkit','Moz','O','ms','Khtml'],
                cssChecks = [{'name':'transform','dom':'Transform'},{'name':'transition','dom':'Transition'},{name:'transitionDuration',dom:'TransitionDuration'},{name:'transitionTimingFunction',dom:'TransitionTimingFunction'},{name:'anim',dom:'AnimationName'}],
                elm = this.element[0],
                el = document.createElement('p');
            this._canCSS3 = {};
            document.body.insertBefore(el, null);
            for( var i = 0; i < prefixes.length; i++ ) {
                var pre = prefixes[i];
                for (var j = 0; j < cssChecks.length; j++) {
                    var o =  cssChecks[j];
                    if(this._canCSS3[o.name])
                        continue;
                    if(elm.style[ pre + o.dom ] !== undefined) {
                        this._canCSS3[o.name] = pre+ o.dom;
                    }
                    if(elm.style[ pre + this._firstCharLowerCase(o.dom) ] !== undefined) {
                        this._canCSS3[o.name] = pre+this._firstCharLowerCase(o.dom);
                    }
                }
            }
            if(this._canCSS3.transform && !this.options.no3D) {
                if (el.style[this._canCSS3.transform] !== undefined) {
                    el.style[this._canCSS3.transform] = "translate3d(1px,1px,1px)";
                    var computed = window.getComputedStyle(el).getPropertyValue(this._dashConvert(this._canCSS3.transform));
                    this._canCSS3.can3D = ((computed !=null) && (computed != ""));
                }
            }
            document.body.removeChild(el);
        },
        _direction : function(index) {

          if(!this.options.loop) {
              return index>this._index;
          }
          var forw=0, back=0;
          this._index = Math.min(this._index,this.count);
           var oIndex =  this._index;
          while(oIndex!=index) {
              if(oIndex>this.count){
                oIndex = 1;
                continue;
              } else {
                oIndex++;
              }
              forw++
          }
          oIndex = this._index;
          while(oIndex!=index) {
              if(oIndex<1) {
                  oIndex = this.count;
                  continue;
              } else {
                oIndex--;
              }
                back++;
          }
          if(this.options.preferForward) {
              if(forw>1 && back >1) {
                  return true;
              }
          }
          return forw<=back;
        },
        _loopIndex : function(dir,start,count) {
            var inc = dir ? 1 : -1;
            var curr = start;
            for (var i= 0;i<count;i++) {

                if(curr+inc>this.count){
                    curr = 1;
                } else if(curr+inc<1) {
                    curr = this.count
                } else {
                    curr = curr + inc;
                }

            }
            return curr;
        },
        _loopCount : function(dir,start,target) {
            target = Math.min(target,this.count);
            var inc = dir ? 1 : -1;
            var curr = start;
            var count = 0;
            while(curr != target) {
                count++;
                if(curr+inc>this.count){
                    curr = 1;
                } else if(curr+inc<1) {
                    curr = this.count
                } else {
                    curr = curr + inc;
                }
            }
            return count;
        },
        _resetPos: function(elm) {
            if(this._canCSS3.transform && this._canCSS3.transition) {
                elm.css(this._canCSS3.transform,'');
            } else {
                if(this.options.dir=='horz') {
                    elm.css('left','');
                } else {
                    elm.css('top','');
                }
            }
        },
        _removeStates: function() {
            this._children.removeClass(this.options.states.visible);
            this._children.removeClass(this.options.states.partiallyVisible);
        },
        _setState: function(elm,state) {
            switch(state) {
                case 'visible' :
                    elm.addClass(this.options.states.visible);
                    elm.addClass(this.options.states.seen);
                    this.callChildMethod(elm,'visible',true);
                    break;
                case 'invisible' :
                    elm.removeClass(this.options.states.visible);
                    this.callChildMethod(elm,'visible',false);
                    break;
                case 'partial' :
                    elm.addClass(this.options.states.partiallyVisible);
                    this.callChildMethod(elm,'visible',false);
                    break;

            }
        },
        _posElm: function(elm,num,index,add) {
            if (!this._elms[index])
                this._elms[index] = 0;
            var number = add ? this._elms[index]+num : num//, transform;
            if(this._canCSS3.transform && this._canCSS3.transition) {
                if(this._canCSS3.can3D) {
                    //transform = elm.css(this._canCSS3.transform);
                    if(this.options.dir=='horz') {
                        elm.css(this._canCSS3.transform,'translate3d('+number+'px,0,0)');
                    } else {
                        elm.css(this._canCSS3.transform,'translate3d(0,'+number+'px,0)');
                    }
                } else {
                    if(this.options.dir=='horz') {
                        elm.css(this._canCSS3.transform,'translate('+number+'px,0)');
                    } else {
                        elm.css(this._canCSS3.transform,'translate(0,'+number+'px)');
                    }
                }
            } else {
                if(this.options.dir=='horz') {
                    elm.css('left',number+'px');
                } else {
                    elm.css('top',number+'px');
                }
            }
            this._elms[index] = number;
        },
        _preloadNext:function(){
            if(this.options.preloadNext) {

                var index = this._loopIndex(true,this._index,1);
                var nextNextItem = this._children.eq(index-1);
                this.callChildMethod(nextNextItem,'preload',true);
            }
        },
        _measureElements : function (dir,index,count) {
            var size = 0,
                horz = this.options.dir == 'horz';

            for (var i=0; i<count; i++) {

               var eindex = dir? index+i:index-i;
               if (eindex > this.count) {
                   eindex = 1;
               }
                if(eindex < 1) {
                    eindex = this.count;
                }
                size += this._measureElement(eindex-1);
            }
            return dir ? 0-size : size;
        },
        _moveElements : function(howMuch,onDone,animate) {

            var $container = this._container,
                self = this;

            // if the position is the same, don't bother moving and fire the cb (transitionend won't fire without change)
            if(this._containerPos == howMuch) {
                if(self._canCSS3.transform && self._canCSS3.transitionDuration) {
                    $container.css(self._canCSS3.transitionTimingFunction, '');
                    $container.css(self._canCSS3.transitionDuration,'');
                }
                if(onDone)
                    onDone();
                return;
            }
            this._containerPos = howMuch;

            if(!animate) {
                if(self._canCSS3.transform && self._canCSS3.transitionDuration) {
                    var transform = self._canCSS3.can3D ? (self.options.dir=='horz'?'translate3d('+howMuch+'px,0,0)':'translate3d(0, '+howMuch+'px,0)') : (self.options.dir=='horz'?'translateX('+howMuch+'px)':'translateY('+howMuch+'px');
                    $container.css(self._canCSS3.transform,transform);
                } else {
                    if(self.options.dir=='horz'){
                        $container.css('left',howMuch+'px');
                    } else {
                        $container.css('top',howMuch+'px');
                    }
                }
                if(onDone)
                    onDone();

                return;
            }

            if(self._canCSS3.transform && self._canCSS3.transitionDuration) {
                var transform = self._canCSS3.can3D ? (self.options.dir=='horz'?'translate3d('+howMuch+'px,0,0)':'translate3d(0, '+howMuch+'px,0)') : (self.options.dir=='horz'?'translateX('+howMuch+'px)':'translateY('+howMuch+'px');
                $container.css(self._canCSS3.transform,transform);
                $container.css(self._canCSS3.transitionTimingFunction, self.options.easing);
                $container.css(self._canCSS3.transitionDuration, self.options.animDuration + 'ms');

                $container.off().on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function() {
                    $container.css(self._canCSS3.transitionTimingFunction, '');
                    $container.css(self._canCSS3.transitionDuration,'');
                    if(onDone)
                        onDone();
                });
            } else {
                var anim = {};
                if(self.options.dir=='horz'){
                    anim.left = howMuch+'px';
                } else {
                    anim.top = howMuch+'px';
                }
                $container.animate(anim, self.options.animDuration,'swing',onDone);
            }

        },
        _measureElement : function (index) {
            var size,
                horz = this.options.dir == 'horz',
                elm = this._children.eq(index);

            elm.css('display','block');
            if(horz) {
                size = elm.outerWidth(true);
            } else {
                size = elm.outerHeight(true);
            }
            elm.css('display','');
            return size;
        },
        _elmSize : function() {
            return this.options.dir=='horz' ? this.element.width(): this.element.height();
        },
        _animate : function(_index){
            var self = this;
            this._animating = true;
            this._layoutManager.focus(_index,true,function(){
                self._setIndex(_index);
            });

        },
        _setIndex : function (_index) {
            this._index = _index;
            this._track("change",{'index':this._index,'canNext':this.canNext(),'canPrev':this.canPrev(),'visible':this._visible, 'count':this.count});
            this._animating = false;
            this._preloadNext();
            this._onFinish();
        },
        _track: function(event,value) {
            this._trigger( event, null, value );
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element,'carousel',event,value);
            }
        },
        _destroy: function() {
            this.element.removeClass('amp');
            this.element.removeClass('amp-carousel');
            this._removeEmptyAttributeHelper(this.element);
            var c = this._children;
            c.removeClass('amp-slide');
            c.removeClass(this.options.states.visible);
            c.removeClass(this.options.states.partiallyVisible);
            c.removeClass(this.options.states.selected);
            c.removeClass(this.options.states.seen);
            for (var i=0;i<c.length;i++ ) {
                var elm = c.eq(i);
                this._resetPos(elm,0);
                this._removeEmptyAttributeHelper(elm);
            }
            this._container.replaceWith(c);

        },
        checkFeatures: function(lm) {
            if (lm) {
                if(lm.requiredFeatures) {
                    var passed = true;
                    for (var i=0; i<lm.requiredFeatures.length; i++) {
                        var feature = lm.requiredFeatures[i];
                        if(!this._canCSS3[feature]) {
                            passed = false;
                        }
                    }
                    return passed;
                } else {
                    return true;
                }
            }
            return false;
        },
        canNext : function() {
            return this.options.loop || (this._canNext && this._index<this.count);
        },
        redraw:function(){
            if(this._animating) {
                this._asyncMethods.push({func:self._calcSize,args:arguments});
                return;
            }
            return this._calcSize();
        },
        select : function(num,triggered) {
            var _index = this._numToIndex(num),
                currItem  = this._children.eq(this._selectedIndex-1),
                nextItem = this._children.eq(_index-1);

            var mainSize = 0;
            currItem.removeClass(this.options.states.selected);
            nextItem.addClass(this.options.states.selected + ' ' +this.options.states.seen);
            this._selectedIndex = _index;
            if(!nextItem.hasClass(this.options.states.visible)) {
                this.goTo(_index,triggered);
            }
            if(!triggered) {
                this._exeBinds(_index,'select');
            }
            this._preloadNext();
            this._track("selected",{'index':_index});
        }
    });
    // -----------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------STANDARD LAYOUT MANAGER
    // -----------------------------------------------------------------------------------------------------------------
    (function(){
        var standard = function(widget,options){
            function Manager() {
                this.name = 'standard';
                this.options = options;
                this.duplicated = [];
            }

            var m = Manager.prototype;
            m.init = function() {
                if(widget.canTouch && widget.options.gesture.enabled) {
                    widget._children.on('touchstart', $.proxy(this.start,this));
                }
            };

            m.start = function(e){
                if(this.animating)
                    return;
                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ) {
                    if (e.originalEvent.touches.length!=widget.options.gesture.fingers)
                        return true;
                }
                this.duplicationOffsets = {};
                this.duplicationOffsets.left = 0;
                this.duplicationOffsets.leftSize = 0;
                this.duplicationOffsets.right = 0;
                this.duplicationOffsets.rightSize = 0;
                this.changed = false;
                this.startPos = widget._containerPos;
                this.moved = false;
                this.startTouchEvent = e;
                var e = this.getEvent(e);
                this.xo = e.pageX - widget._containerPos;
                this.yo = e.pageY - widget._containerPos;
                this.xo2 = e.pageX;
                this.yo2 = e.pageY;
                $(window).on('touchmove',$.proxy(this.move,this));
                $(window).on('touchcancel',$.proxy(this.stop,this));
                $(window).on('touchend',$.proxy(this.stop,this));
                return true;
            };

            m.move = function(e){
                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ) {
                    if (e.originalEvent.touches.length!=widget.options.gesture.fingers)
                        return true;
                }
                this.moved = true;
                this.lastEvent = e;

                e = this.getEvent(e);
                var mx = e.pageX - this.xo;
                var my = e.pageY - this.yo;
                var mx2 = e.pageX - this.xo2;
                var my2 = e.pageY - this.yo2;
                if(!this.moveDir) {
                    if(Math.abs(mx2)< Math.abs(my2)) {
                        this.moveDir = 'vert';
                    } else if (Math.abs(mx2)> Math.abs(my2)){
                        this.moveDir = 'horz';
                    } else {
                        this.moveDir = widget.options.dir;
                    }
                }
                if(widget.options.dir != this.moveDir){
                    return true;
                }

                var offset = widget.options.dir == 'horz' ? mx : my;
                widget._moveElements(offset,null,false);

                if(widget.options.loop) {
                    this.checkDuplicate(offset)
                }

                if(widget.options.dir == this.moveDir){
                    return false;
                    e.preventDefault();
                }
            };

            m.checkDuplicate = function(offset) {
                if (offset-this.metrics[this.lastOne-1].size<0-(this.allSize-widget._elmSize())){
                    this.duplicateSlide(true);
                }

                if (0-offset-this.metrics[0].size <= 0-this.duplicationOffsets.leftSize){
                    this.duplicateSlide(false);
                }
            };

            m.duplicateSlide = function(dir) {
                if(dir){
                    var i=widget._numToIndex(widget._index-1+widget.count+this.duplicationOffsets.right+1)-1;
                    var elm = widget._children.eq(i);
                    var clone = elm.clone();
                    widget._container.append(clone);
                    var cloneSize = widget.options.dir=='horz' ? clone.width() : clone.height();
                    var target = this.allSize;
                    widget._posElm(clone,target,this.count+this.duplicated.length);
                    this.duplicated.push(clone);
                    this.duplicationOffsets.right++;
                    this.duplicationOffsets.rightSize+=cloneSize;
                    this.lastOne=i+1;
                    this.allSize+=cloneSize;
                } else {
                    var i=widget._numToIndex(widget._index-1-this.duplicationOffsets.left)-1;
                    var elm = widget._children.eq(i);
                    var clone = elm.clone();
                    widget._container.append(clone);
                    var cloneSize = widget.options.dir=='horz' ? clone.width() : clone.height();
                    var target = 0-this.duplicationOffsets.leftSize-cloneSize;
                    widget._posElm(clone,target,this.count+this.duplicated.length);
                    this.duplicated.push(clone);
                    this.duplicationOffsets.left++;
                    this.duplicationOffsets.leftSize+=cloneSize;
                }
            };

            m.stop = function(e){
                $(window).off('touchmove',$.proxy(this.move,this));
                $(window).off('touchcancel',$.proxy(this.stop,this));
                $(window).off('touchend',$.proxy(this.stop,this));
                this.moveDir = null;
                if(this.moved && !this.changed){
                    var nearest = this.findNearest();
                    var nearestIndex = nearest.index+1;
                    if (nearestIndex == widget._index) {
                        // we are closest to our original position, but how far did we move?
                        var diff = this.startPos - widget._containerPos;
                        if(Math.abs(diff)>=widget.options.gesture.distance) {
                            if(diff>0) {
                                if(widget.canNext()) {
                                    widget.next();
                                } else {
                                    widget._moveElements(this.startPos,null,true);
                                }
                            } else {
                                if(widget.canPrev()) {
                                    widget.prev();
                                } else {
                                    widget._moveElements(this.startPos,null,true);
                                }
                            }
                        } else {
                            widget._moveElements(this.startPos,null,true);
                        }
                        this.changed = true;
                        if (widget.options.loop) {
                            widget._containerPos = 0;
                        }
                        return;
                    }
                    if (!widget.options.loop) {
                        this.changed = true;
                        widget.goTo(nearestIndex);
                    } else {
                        this.animating = true;
                        widget._moveElements(nearest.pos, $.proxy(function(){
                            this.allSize = this.oAllSize;
                            this.focus(nearestIndex,false);
                            widget._containerPos = 0;
                            widget._setIndex(nearestIndex);
                            widget.goTo(nearestIndex,null,true);
                            this.changed = true;
                            this.animating = false;
                        },this),true);

                    }
                }
            };

            m.getEvent = function(e) {
                if(e.type == "touchend"  || e.type == "touchcancel") {
                    e = this.startTouchEvent;
                }
                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ) {
                    e = e.originalEvent.touches[0];
                }
                return e;
            };

            m.findNearest = function() {
                var index = 0;
                var target = widget._containerPos;
                var smallest = this.oAllSize;
                var multi = 0;
                if(widget.options.loop) {
                    while(target<0-this.oAllSize) {
                        target += this.oAllSize;
                        multi--;
                    }
                    while(target>0) {
                        target -= this.oAllSize;
                        multi++;
                    }
                }
                for (var i =0; i<this.metrics.length; i++){
                    var diff = Math.abs(target + this.metrics[i].pos);
                    if (diff<smallest) {
                        smallest = diff;
                        index = i;
                    }
                }
                // test the end position as well!
                var end = widget._numToIndex(widget._index+widget.count-1)-1;
                var diff = Math.abs(target + (this.metrics[end].pos+this.metrics[end].size));
                if (diff<smallest) {
                    smallest = diff;
                    index = widget._index-1;
                    target += this.oAllSize;
                }
                var offset = target>=0? this.metrics[index].pos+(this.oAllSize*(multi-1)) : (0-this.metrics[index].pos)+(this.oAllSize*multi);
                return {index:index,pos:offset};
            };

            m.layout = function(_index) {
                if(!widget.options.loop){
                    this.arrange(1);
                    this.focusNoLoop(_index,false);
                } else {
                    this.arrange(_index);
                }
            };

            m.focus= function(_index,anim,cb) {
                if(!widget.options.loop){
                    this.focusNoLoop(_index,anim);
                    if(cb)
                        cb();
                } else {
                    this.focusLoop(_index,anim,cb);
                }
            };

            m.focusNoLoop= function(_index,anim) {
                var target = 0-this.metrics[_index-1].pos;
                var min = 0-(this.allSize-widget._elmSize());
                target = Math.min(Math.max(min, target),0);
                this.setVisibleStates(_index,target);
                widget._moveElements(target,null,anim);
            };

            m.setVisibleStates = function(_index,target) {
                var target = Math.abs(target);
                widget._removeStates();
                var visible = 0;
                for (var i=0; i<this.metrics.length; i++) {
                    var pos = this.metrics[i].pos;
                    var elm = widget._children.eq(i);
                    var elmSize = this.metrics[i].size;
                    if(pos>=target && (pos+elmSize-target)<=widget._elmSize()){
                        widget._setState(elm,'visible');
                        visible++;
                    } else if ((pos+elmSize>target && (pos+elmSize-target)<=widget._elmSize()) || (pos>=target&&(pos-target)<widget._elmSize())) {
                        widget._setState(elm,'partial');
                    } else {
                        widget._setState(elm,'invisible');
                    }
                }
                widget._visible = visible;
            };

            m.focusLoop= function(_index,anim,cb) {
                var self = this,
                    dir = (widget._direction(_index)),
                    target = dir ? 0-this.metrics[_index-1].pos : this.allSize - this.metrics[_index-1].pos,
                    diff = widget._loopCount(dir,widget._index,_index);
                this.duplicate(dir);
                widget._moveElements(target,function(){
                    widget._container[0].style[widget._canCSS3.transform] = '';
                    widget.options.dir === 'horz' ? widget._container[0].style.left = '' : widget._container[0].style.top = '';
                    self.arrange(_index);
                    while (self.duplicated.length > 0) {
                        var obj = self.duplicated.splice(0,1);
                        obj[0].remove();
                        delete obj[0];
                    }
                    if(cb)
                        cb();
                },anim);
            };

            m.duplicate= function(dir){
                for (var i=0; i<widget.count; i++) {
                    var elm = widget._children.eq(i);
                    var clone = elm.clone();
                    widget._container.append(clone);
                    var target = dir ?this.metrics[i].pos+this.allSize :this.metrics[i].pos-this.allSize ;
                    widget._posElm(clone,target,this.count+this.duplicated.length);
                    this.duplicated.push(clone);
                }
            };

            m.arrange= function (index) {
                var offset = 0,
                    metrics = [],
                    sizes = [];
                widget._removeStates();
                for (var s=0; s<widget.count; s++) {
                    var i = s;
                    if(index !== void 0){
                        i+=index-1;
                        while(i>=widget.count){
                            i-=widget.count;
                        }
                    }
                    var elm = widget._children.eq(i);
                    var eSize = widget._measureElement(i);
                    if(eSize+offset<=widget._elmSize()) {
                        widget._setState(elm,'visible');
                    } else if (offset<widget._elmSize()) {
                        widget._setState(elm,'partial');
                    } else {
                        widget._setState(elm,'invisible');
                    }
                    metrics[i] = {};
                    metrics[i].size = eSize;
                    metrics[i].pos = offset;
                    widget._posElm(elm,offset,i);
                    sizes[i] = (eSize);
                    offset += eSize;
                }
                if(widget.options.loop){
                    widget._containerPos = 0;
                }
                this.lastOne = index;
                delete this.metrics;
                this.metrics = metrics;
                this.allSize = offset;
                this.oAllSize = offset;
                return {allSize:offset,metrics:metrics};
            };
            var mo = new Manager( );
            mo.init();
            return mo;

        };

        $.amp.ampCarousel.prototype._layoutManagers['standard'] = {'requiredFeatures':null,'create':standard};
    }());


    // -----------------------------------------------------------------------------------------------------------------
    // ----------------------------------------------------------------------------------------------------------------- 3D Layout Manager
    // -----------------------------------------------------------------------------------------------------------------
    // Made with help from: 'Intro to CSS 3D transforms' By David DeSandro
    (function(){
        var carousel3D = function(widget,options){
            var transformProp = widget._canCSS3.transform;
            function Manager() {
                this.name = 'carousel3D';
                this.options = options;
                this.styles = [];
                this.angles = [];
            }
            var m = Manager.prototype;

            m.init = function() {
                var self = this;
                this.element = widget._container[0];
                this.rotation = 0;
                this.panelCount = widget.count;
                this.totalPanelCount = this.element.children.length;
                this.theta = 0;
                this.isHorizontal = widget.options.dir == 'horz';
                widget._container.css('perspective','1000px');
                this.modify();
                setTimeout(function(){
                    self.animation(true);
                },10);
                if(widget.canTouch && widget.options.gesture.enabled) {
                    widget._children.on('touchstart', $.proxy(this.start,this));
                }
            };

            m.animation = function(enable) {
                if (enable) {
                    widget._children.css('transitionTimingFunction',widget.options.easing);
                    widget._children.css('transitionDuration',widget.options.animDuration+'ms');
                } else {
                    widget._children.css('transitionTimingFunction','');
                    widget._children.css('transitionDuration','');
                }
            };

            m.start = function(e) {
                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ) {
                    if (e.originalEvent.touches.length!=widget.options.gesture.fingers)
                        return true;
                }
                var e = this.getEvent(e);
                this.xo = e.pageX - e.target.offsetLeft;
                this.yo = e.pageY - e.target.offsetTop;

                this.changed = false;
                this.moved = false;
                this.animation(false);
                this.startPos = this.rotation;

                $(window).on('touchmove',$.proxy(this.move,this));
                $(window).on('touchcancel',$.proxy(this.stop,this));
                $(window).on('touchend',$.proxy(this.stop,this));

            };

            m.move = function(e) {

                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ) {
                    if (e.originalEvent.touches.length!=widget.options.gesture.fingers)
                        return true;
                }
                this.lastEvent = e;
                this.moved = true;
                e = this.getEvent(e);
                var mx = e.pageX - this.xo;
                var my = this.yo - e.pageY;
                var diff = widget.options.dir == 'horz' ? mx : my;
                if(diff>0) {
                    diff = Math.min(this.theta/2,diff/10)
                } else {
                    diff = Math.max(0-(this.theta/2),diff/10);
                }
                this.rotation = this.startPos + diff;
                this.transform();
                return false;
            };

            m.getEvent = function(e) {
                if(e.type == "touchend" || e.type == "touchcancel") {
                    e = this.lastEvent;
                }
                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ) {
                    e = e.originalEvent.touches[0];
                }
                return e;
            };

            m.stop = function(e) {
                $(window).off('touchmove',$.proxy(this.move,this));
                $(window).off('touchcancel',$.proxy(this.stop,this));
                $(window).off('touchend',$.proxy(this.stop,this));
                this.animation(true);
                if(this.moved && !this.changed){
                    e = this.getEvent(e);
                    var mx = e.pageX - this.xo;
                    var my = this.yo - e.pageY;
                    var diff = widget.options.dir == 'horz' ? mx : my;
                    this.rotation = this.startPos;
                    // we are closest to our original position, but how far did we move?
                    if(Math.abs(diff)>=widget.options.gesture.distance) {
                        if(diff<0) {
                            if(widget.canNext()) {
                                widget.next();
                                return;
                            }
                        } else {
                            if(widget.canPrev()) {
                                widget.prev();
                                return;
                            }
                        }
                    }
                    this.transform();
                    this.changed = true;
                }
            };

            m.modify = function() {

                var panel, angle, i;
                this.xOffset = widget._container.width()/2 - widget._children.eq(0).width()/2;
                this.yOffset = widget._container.height()/2 - widget._children.eq(0).height()/2;
                this.panelSize = this.isHorizontal ? widget._children.eq(0).width() : widget._children.eq(0).height();
                this.rotateFn = this.isHorizontal ? 'rotateY' : 'rotateX';
                this.theta = 360 / this.panelCount;

                // do some trig to figure out how big the carousel is in 3D space
                this.radius = Math.round( ( this.panelSize / 2) / Math.tan( Math.PI / this.panelCount ) );
                delete this.styles;
                delete this.angles;
                this.styles = [];
                this.angles = [];
                for ( i = 0; i < this.panelCount; i++ ) {
                    panel = this.element.children[i];
                    if(!panel)
                        continue;
                    angle = this.theta * i;
                    this.angles[i] = angle;
                    // rotate panel, then push it out in 3D space
                    this.styles[i] = this.rotateFn + '(' + angle + 'deg) translateZ(' + this.radius + 'px)';
                    panel.style[ transformProp ] = this.styles[i];
                    if(widget.options.dir=="horz"){
                        panel.style.left = this.xOffset + 'px'
                    }else{
                        panel.style.top = this.yOffset + 'px'
                    }
                }

                // hide other panels
                for (  ; i < this.totalPanelCount; i++ ) {
                    panel = this.element.children[i];
                    if(!panel)
                        continue;
                    panel.style.opacity = 0;
                    panel.style[ transformProp ] = 'none';
                }

                // adjust rotation so panels are always flat
                this.rotation = Math.round( this.rotation / this.theta ) * this.theta;

                this.transform();

            };

            m.transform = function() {
                // push the carousel back in 3D space,
                // and rotate it
                for (var i = 0; i < this.panelCount; i++ ) {
                    if(!this.element.children[i])
                        continue;

                    var totalAngle = this.angles[i]+this.rotation;

                    while (totalAngle > 360) {
                        totalAngle -= 360;
                    }
                    while (totalAngle <0) {
                        totalAngle += 360;
                    }

                        var zIndexAngle;
                        if(totalAngle <= 180) {
                            zIndexAngle = 180 - totalAngle;
                        } else {
                            zIndexAngle = totalAngle - 180;
                        }
                        this.element.children[i].style.zIndex = zIndexAngle;

                    this.element.children[i].style[ transformProp ] = 'translateZ(-' + this.radius + 'px) ' + this.rotateFn + '(' + this.rotation + 'deg)' + this.styles[i];
                }

            };

            m.focus = function (index,anim,cb) {
                var dir = (widget._direction(index));
                var diff = widget._loopCount(dir,widget._index,index);
                var elm = widget._children.eq(index-1);
                var wasElm = widget._children.eq(widget._index-1);
                widget._setState(elm,'visible');
                widget._setState(wasElm,'invisible');

                if(dir){
                    this.rotation -= this.theta * diff;
                } else {
                    this.rotation += this.theta * diff;
                }
                this.transform();
                if(cb)
                    cb();
            };

            m.layout = function (index) {
                this.modify();
                this.focus(index);

            };

            var mo =  new Manager();
            mo.init();
            return mo;
        };
        $.amp.ampCarousel.prototype._layoutManagers['carousel3D'] = {'requiredFeatures':['can3D','transform'],'create':carousel3D};
    }());
}( jQuery ));
(function ( $ ) {

    $.widget( "amp.ampImage", {
        options: {
            errImg: null,
            preload:'visible',
            insertAfter:false
        },
        _loadedHistory : [],
        _getCreateOptions:function(){
            var attributes = this.element.data().ampImage;
            if (attributes) {
                return $.extend(true, {}, this.options, attributes);
            }
            return this.options;
        },
        _create: function() {
            this.element.addClass('amp');
            this.element.addClass('amp-image');
            var self = this;
            this.element.bind('load',function(e){
                self._loaded();
            });
            this.element.bind('error',function(){
                self._failLoad();
            });

            if($.inArray(this.options.preload, ['created', 'visible', 'none']) == -1){
                this.options.preload = 'visible';
            }

            if(this.options.preload == 'created') {
                this.newLoad();
            }
            this._track("created");

        },

        newLoad: function() {
            var src = (this.element.attr('src') && this.element.attr('src')!="")?this.element.attr('src'):this.element.attr('data-amp-src');

            if($.inArray(src, this._loadedHistory)!==-1){
                if(this.loading) {
                    this.loading.remove();
                }
                this.element.attr('src',src);
                this.element.show();
                return;
            }
            if(!this.loading) {
                this.loading = $('<div class="amp-loading"></div>');
            }
            this.element.hide();
            !this.options.insertAfter ? this.element.parent().append(this.loading) :this.options.insertAfter.prepend(this.loading);
            this.element.attr('src','');
            this.element.attr('src',src);
        },

        visible: function(visible) {
            if(visible && visible!= this._visible) {
                if(this.options.preload == 'visible')
                    this.newLoad();
            }
            this._visible = visible;
        },
        load: function(options) {
            if(this.loaded || this.loading)
                return;

            this.newLoad();
        },
        preload: function() {
            if(!this.element.parent().hasClass('amp-spin')){
                this.newLoad();
            }
        },
        loaded:false,
        _loaded: function(){
            this._loadedHistory.push(this.element.attr('src'));
            this._track( 'loaded', true );
            this.loaded = true;
            if(this.loading) {
                this.loading.remove();
            }
            this.element.show();
        },
        _failLoad: function() {
            if(this.options.errImg) {
                this.element.attr('src',this.options.errImg);
            } else {
                if (window.amp && amp.conf && amp.conf.err_img) {
                    this.element.attr('src',amp.conf.err_img);
                }
            }
        },
        _track: function(event,value) {
            this._trigger( event, null, value );
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element,'image',event,value);
            }
        },
        _destroy: function() {
            this.element.removeClass('amp');
            this.element.removeClass('amp-image');
            if(this.loading) {
                this.loading.remove();
            }
            this.element.css('display','');
            this._removeEmptyAttributeHelper(this.element);
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
(function ( $ ) {
    $.widget( "amp.ampBuild", {
        // Default options.
        options: {
        },
        _create: function() {
            for(var prop in $.amp){
                if($.amp.hasOwnProperty(prop)){
                    this.element.find("[data-"+ prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()+"]")[prop]();
                }
            }
            this._track("created");
        },
        _track: function(event,value) {
            this._trigger( event, null, value );
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element,'build',event,value);
            }
        }
    });

}( jQuery ));
(function ( $ ) {

    $.widget( "amp.ampNav", {
        // Default options.
        options: {
        },
        _getCreateOptions:function(){
            var attributes = this.element.data().ampNav;
            if (attributes) {
                return $.extend(true, {}, this.options, attributes);
            }
            return this.options;
        },
        _create: function() {
            var self = this;
            var components = this.element.data();
            for (var i in components) {
                if(components.hasOwnProperty(i)){
                    var component = components[i];
                    if(component.bind && i.substring(0,3)=='amp'){
                        component.bind(this.options);
                    }
                }
            }
            this._track("created");
        },
        _track: function(event,value) {
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element,'navigation',event,value);
            }
        }
    });



}( jQuery ));
(function ($) {
    var reset = {
        top: 0, left: 0,  opacity:0, width:'', height:''
    };

    $.widget("amp.ampZoom", {
        // Default options.
        options: {
            zoom: 3,
            url: '',
            activate:{
                touch:"up",
                mouse:"up"
            },
            pan:false,
            map:false,
            target:{},
            lens: true,
            fade: true,
            preload: {
                image:'created',
                zoomed:'none'
            },
            responsive:true,
            cursor:{active: 'auto', inactive: 'auto'},
            transforms:'',
            states:{
                "active":"amp-active",
                "inactive":"amp-inactive"
            },
            width:'auto',
            height:'auto',
            create:function(){},
            created:function(){},
            zoomedIn:function(){},
            zoomedOut:function(){},
            move:function(){},
            startMove:function(){},
            stopMove:function(){},
            startPreload:function(){},
            preloaded:function(){},
            visible:function(){}
        },
        _zoomLoaded:false,
        _getCreateOptions:function(){
            this.validTypes = this._createValidTypes(this.options);
            var attributes = this.element.data().ampZoom;
            if (attributes) {
                return $.extend(true, {}, this.options, attributes);
            }

            return this.options;
        },
        _createValidTypes: function(options){
            var validTypes = {};
            for(var option in options){
                if(options.hasOwnProperty(option)){
                    var val = options[option], newType;
                    newType = (option == "width" || option == "height") ? "number" :  typeof val;
                    validTypes[option] = typeof val === "object" ?
                        this._createValidTypes(val) :
                    { type: newType, defaultValue:val };
                }
            }
            return validTypes;
        },
        _checkValidTypes:function(options, validTypes){
            return options;
        },
        _create: function () {
            this.options = this._checkValidTypes(this.options, this.validTypes);

            if($.isArray(this.options.zoom))
                this._cycle = {current:-1, len:this.options.zoom.length};

            var preloadOptionsArray = ['created', 'visible', 'none'];
            if($.inArray(this.options.preload.image, preloadOptionsArray) == -1)
                this.options.preload.image = 'created';

            if($.inArray(this.options.preload.zoomed, preloadOptionsArray) == -1)
                this.options.preload.zoomed = 'none';

            this.element.addClass('amp amp-zoom');
            this.element.wrap('<div class="amp-zoom-container"></div>');
            this.parent = this.element.parent();
            this.parent.prepend(this.loading);
            this.element.wrap('<div class="amp-zoom-overflow"></div>');
            this.overflow = this.element.parent();
            this.wrapper = $('<div class="amp-zoom-wrapper"></div>');
            this.imgs = [];
            var i = 0;
            do{
                this.imgs.push($('<img class="amp-zoom-img">'));
                this.imgs[i].css(reset);

                i++;
            }while(i < (this._cycle && this._cycle.len));

            this.wrapper.append(this.imgs);
            if(this.options.responsive){
                this.element.css({ height:'auto', width:'100%', maxWidth:'100%' });
            }

            if(this.options.target){
                this.mark = this.options.map ? {name:"map", inner:"inner"} : {name:"box", inner:"wrapper"};
                try{
                    this[this.mark.name] = $('body').find(this.options.target);
                } catch(e) {
                    this[this.mark.name] = false;
                }

                if(this[this.mark.name] && this[this.mark.name].length > 0){
                    if(this.options.lens){
                        this.lens = $('<div class="amp-zoom-lens"></div>');
                        if(this.mark.name == "map"){
                            this[this.mark.name].addClass('amp-zoom-map');
                            this[this.mark.inner] = $('<div class="amp-zoom-wrapper"></div>');
                            this[this.mark.inner].append($('<img class="amp-main-img" src="'+this.element.attr('src')+'">'));
                            this[this.mark.inner].append(this.lens);
                        }else{
                            this[this.mark.name].addClass('amp-zoom-container');
                            this.parent.append(this.lens);
                        }
                    }

                    this[this.mark.inner].hide();
                    this[this.mark.name].append(this[this.mark.inner]);
                    this[this.mark.inner].addClass(this.options.states.inactive);
                    this[this.mark.inner][0].relatedUUID = this.uuid;
                }else{
                    this[this.mark.name] = false;
                }
            }

            if(!this.box){
                this.overflow.append(this.wrapper);
                this.canHideEl = !!$.amp.ampImage;
            }

            this.target = this.imgs[0];
            this._setCursor(this.options.cursor.inactive, this.parent);
            this.parent.addClass(this.options.states.inactive);

            if(this.options.preload.image == 'created' || this.element[0].src)
                this._loadImage();

            if(this.options.preload.zoomed == 'created'){
                this._loadZoomed();
            }
        },
        _onImageLoad: function(){
            this._track( 'loaded', true );
            this._imageLoaded = true;
            this._imageLoading = false;

            this._originalImage = this._getNaturalSize(this.element[0].src);

            var self = this;
            this._calcSize();
            if(this.options.responsive){
                $(window).bind("resize", function(_self) {
                    return function() {
                        if(_self.zoomed)
                            _self.zoom(false);
                        return _self._calcSize();
                    }
                }(self));
            }
            this.moved = false;
            this.canTouch =  !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);

            // start touch position
            this.zoomBy = 1;
            this.pos = {
                start: {'x':0,'y':0},
                last: {'x':0,'y':0},
                cur: {'x':0,'y':0}
            };


            var up = function(){
                var moveit = function(e){
                    self.moved = true;
                    return true;
                };

                var mouseleave = function(e){
                    end();
                    return true;
                };

                var end = function(e){
                    self.pos.cur = self.pos.last;
                    self.mousedown = false;
                    self.parent.off(self.canTouch ? "touchmove" : "mousemove", $.proxy(moveit,self) );
                    if(!self.canTouch){
                        self.parent.off("mouseleave", $.proxy(mouseleave,self) );
                    }
                    self.parent.off(self.canTouch ? "touchend" : "mouseup", $.proxy(end,self) );
                    if(self.moved){
                        return;
                    }

                    return self.toggle(e);
                };
                var start = function(e){
                    if(self.zoomed){
                        e.stopPropagation();
                        e.preventDefault();
                    }

                    self.mousedown = true;
                    var a = self._getEvent(e);
                    self.pos.start = {x: a.pageX, y:a.pageY};
                    setTimeout(function(){
                        self.parent.on(self.canTouch ? "touchmove" : "mousemove", $.proxy(moveit,self) );
                        self.parent.on(self.canTouch ? "touchend" : "mouseup", $.proxy(end,self) );
                    },1);

                    if(!self.canTouch){
                        self.parent.on("mouseleave", $.proxy(mouseleave,self) );
                    }
                    self.moved = false;
                    var time = e.timeStamp;
                    self.startTouchEvent = e;
                    return true;
                };
                self.parent.on(self.canTouch ? "touchstart" : "mousedown", $.proxy(start,self));
            };

            if(this.canTouch){
                if(this.options.activate.touch == "disable")
                    return false;
                if(this.options.activate.touch == "doubleTap"){
                    var timeAllowed = 300,
                        distanceAllowed = 20;

                    this._lastEvent = '';
                    var start = function(e){ 
                        //e.preventDefault();
                        self.parent.on("touchend touchcancel", $.proxy(end,self));
                        this.startTouchEvent = e;
                        var e = this._getEvent(e);
                        self.pos.start = {x: e.pageX, y: e.pageY}
                        e.timeStamp = new Date().getTime();
                        var delta = e.timeStamp - (this._lastEvent && this._lastEvent.timeStamp) || 0,
                            movedTooFar = Math.abs(e.pageX - this._lastEvent.pageX) > distanceAllowed || Math.abs(e.pageY - this._lastEvent.pageY) > distanceAllowed;

                        if (delta < timeAllowed && delta != 0 && !movedTooFar) {
                            this.toggle(this.startTouchEvent);
                        }

                        this._lastEvent = e;
                        return true;
                    };

                    var end = function(e){
                        self.pos.cur = self.pos.last;
                        self.parent.off("touchend touchcancel", $.proxy(end,self));
                    }
                    self.parent.on("touchstart", $.proxy(start,self));
                }else if(this.options.activate.touch == "pinch"){
                    var fingersRequired = 2;
                    this._scale = 1;
                    this._scaled = false;

                    if(this._cycle){
                        this.maxZoom = this.options.zoom[this._cycle.len - 1];
                        this._cycle = false;
                    }else{
                        this.maxZoom = this.options.zoom;
                    }

                    var start = function (e) {
                        self.parent.on('touchcancel touchend', $.proxy(panEnd, self));
                        if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]) {
                            if(e.originalEvent.touches.length == 1){
                                var ev = self._getEvent(e);
                                self.pos.start = {x: ev.pageX, y: ev.pageY};
                                return true;
                            } else if (e.originalEvent.touches.length != fingersRequired)
                                return true;
                        }

                        e.preventDefault();
                        e.stopPropagation();
                        this.startZoom = this.zoomBy;
                        this.startPos = this.pos.last;
                        this.pos.start = this._getPosition(e.originalEvent.touches);
                        this.pinching = true;
                        this.hasPinchEnded = false;
                        if(!this._scaled)
                            this.o = this._pinchZoomStart(e);

                        this._startDist = this._getDistance(e.originalEvent.touches);
                        this._scale = this._lastScale || this._scale;
                        this.parent.on('touchmove', $.proxy(move, this));
                        this.parent.on('touchcancel touchend', $.proxy(end, this));
                        return true;
                    };

                    var move = function (e) {
                        if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]) {
                            if (e.originalEvent.touches.length != fingersRequired)
                                return true;
                        }

                        var moveDist = this._getDistance(e.originalEvent.touches),
                            position = this._getPosition(e.originalEvent.touches),
                            scale = moveDist / this._startDist;
                        scale = Math.max(1, Math.min((scale * this._scale), this.maxZoom));
                        this._pinchZoom(e, scale, position, this.o);
                        this._lastScale = scale;
                        this._scaled = true;
                    };

                    var panEnd = function (e) {
                        self.pos.cur = self.pos.last;
                        self.parent.off('touchcancel touchend', $.proxy(panEnd, self));
                    }

                    var end = function (e) {
                        if (e.originalEvent && e.originalEvent.touches) {
                            if (e.originalEvent.touches.length == 0){
                                self.hasPinchEnded = true;
                            }
                        }
                        self.parent.off('touchmove', $.proxy(move, this));
                        if(self.hasPinchEnded){
                            if(this.zoomBy == 1){
                                this.zoomed = false;
                            }
                            self.pinching = false;
                            self.pos.cur = self.pos.last;
                            self.parent.off('touchcancel touchend', $.proxy(end, this));
                        }
                    };
                    self.parent.on("touchstart", $.proxy(start, self));
                }else if(this.options.activate.touch == "none"){
                } else {
                    up();
                }
            }else{
                if(this.options.activate.mouse == "disable")
                    return false;
                if(this.options.activate.mouse == 'over' || this.options.activate.mouse == 'over-noclick' ) {
                    var evstr = 'mouseenter mousedown';
                    if(this.options.activate.mouse == 'over-noclick'){
                        evstr = 'mouseenter';
                    };
                    self.parent.on(evstr, function(e){
                        if(e.type == "mouseenter" && !self.zoomed){
                            return self.toggle(e);
                        }

                        if(e.type == "mousedown"){
                            return self.toggle(e);
                        }
                    });
                    self.parent.on("mouseleave",function(e){
                        return self.zoom(false,e);
                    });
                }else if(this.options.activate.mouse == 'down') {
                    this.options.pan = false;
                    self.parent.on("mousedown", function(e){
                        self.toggle(e)
                    });
                }else if(this.options.activate.mouse == "none"){
                }else{
                   up();
                }
            }

            if(this.options.preload.zoomed == 'created' || (this.canTouch && this.options.activate.touch == "pinch") || this._loadZoomedPromise)
                this.preload();

            this._track("created");
        },
        zoomed: false,
        toggle: function (e,index) {
            this._cycle ?
                this.cycle(e,index) :
                this.zoom(!this.zoomed, e);
        },
        cycle: function(e,index){
            if(this.animating) return;
            if(index!==void 0) {
                this._cycle.current = index
            } else {
                this._cycle.current = this._cycle.current+=1;
            }

            if(!this.options.zoom[this._cycle.current]){
                this._cycle.current = -1;
                this.zoom(false, e);
            }else{
                if(this.map)
                    this.inner.off('mousemove touchmove', $.proxy(this._mapMove,this));
                this.parent.off('mousemove touchmove');
                //this.parent.off('mousemove touchmove', $.proxy(this._parentMove,this));

                this.oldTarget = this.target[0] == this.imgs[this._cycle.current][0] ? null : this.target;
                this.oldZoom = this.options.zoom[this._cycle.current];
                this.target = this.imgs[this._cycle.current];
                this.zoom(true, e);
                this.pos.cur = this.pos.last;
            }
        },
        zoom: function (on, e, bypass) {
            if (on == this.zoomed && !this._cycle && !bypass)
                return;

            this.zoomed = on;
            var self = this;
            if (on) {
                this.box && this.box.show();
                if(!this._zoomLoaded){
                    this._checkLoaded(e);
                    return;
                }

                this.init = false;
                this.moveEvent = this.canTouch ? "touchmove" : "mousemove";
                this.zoomBy = this._cycle ? (this.options.zoom[this._cycle.current] || 1) : this.options.zoom;

                var pw = this.overflow.width(), ph = this.overflow.height(),
                    tw = pw * this.zoomBy, th = ph * this.zoomBy,
                    po = this.parent.offset(), bw = 0, bh = 0, mw = 0, mh = 0,lens = 0;

                if(e === void 0){
                    e = {
                        pageX:pw/2,
                        pageY:ph/2
                    }
                }

                this._track('startMove',{domEvent:e, zoom:this.zoomBy });
                this.parent.removeClass(this.options.states.inactive).addClass(this.options.states.active);
                this.wrapper.css({width: tw, height:th});

                if(this[this.mark.name]){
                    if(this.box){
                        bw = this.box.width();
                        bh = this.box.height();
                        if(this.lens) lens = this._makeLens(this.lens, bw, bh, this.zoomBy, {w:pw, h:ph});
                    }

                    if(this.map){
                        mw = this.map.width();
                        mh = mw*(this.element.height()/this.element.width());
                        this.inner.height(mh);
                        this.inner.width(mw);
                        if(this.lens) lens = this._makeLens(this.lens,  mw, mh, this.zoomBy, {w:mw, h:mh});

                        this._mapEnd = function(e){
                            self.mousedownForMap = false;
                            self.inner.off(self.canTouch ? "touchmove" : "mousemove", $.proxy(self._mapMove,self));
                            self.inner.off(self.canTouch ? "touchend" : "mouseup", $.proxy(self._mapEnd,self));

                        };

                        this._mapMove = function(e){
                            if( self.mousedownForMap)
                            self._mouseMove(self._getEvent(e), pw, ph, tw, th, self.map.offset(), bw, bh, mw, mh, lens, true);
                        };

                        this._mapStart = function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            self.mousedownForMap = true;
                            self._mouseMove(self._getEvent(e), pw, ph, tw, th, self.map.offset(), bw, bh, mw, mh, lens, true);
                            this.inner.on(self.canTouch ? "touchmove" : "mousemove", $.proxy(self._mapMove,self));
                            this.inner.on(self.canTouch ? "touchend" : "mouseup", $.proxy(self._mapEnd,self));
                        };
                        this.inner.on("mouseleave", $.proxy(self._mapEnd,self));
                        this.inner.on(self.canTouch ? "touchstart" : "mousedown", $.proxy(this._mapStart,self));
                    }

                    this[this.mark.name].show();
                    this[this.mark.inner].show();
                    this[this.mark.inner].removeClass(this.options.states.inactive).addClass(this.options.states.active);
                }

                 this._parentMove = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self._mouseMove(self._getEvent(e), pw, ph, tw, th, po, bw, bh, mw, mh, lens);
                 };
                 this.parent.on(this.moveEvent, $.proxy(self._parentMove,self));
                 this._mouseMove(self._getEvent(e), pw, ph, tw, th, po, bw, bh, mw, mh, lens);
                 this._setCursor(self.options.cursor.active, self.lens ? self.lens : self.parent);

                 if(this.options.fade) {
                    this.animating = true;
                    this.target.animate({opacity:1},{
                        complete:function(){
                            if(self.canHideEl) self.element.css({opacity:1});
                            self.animating = false;
                            if(self.oldTarget){
                                self.oldTarget.css(reset);
                            }
                        }
                    });
                }else{
                    this.target.css({opacity:1});
                    if(self.canHideEl) this.element.css({opacity:1});
                    if(self.oldTarget){
                        self.oldTarget.css(reset);
                    }
                }

                this.lens && this.lens.show();
                this._track('zoomedIn', {domEvent:e, zoom:this.zoomBy });
            } else {
                this.init = false;
                this._track('stopMove',{domEvent:e});
                this.pos = {
                    start: {'x':0,'y':0},
                    last: {'x':0,'y':0},
                    cur: {'x':0,'y':0}
                };

                this.target.css(reset);
                clearInterval(self.interval);
                if(this.options.fade)
                    this.target.stop();

                if(this[this.mark.name]){
                    this[this.mark.name].hide();
                    this[this.mark.inner].hide();
                    this[this.mark.inner].removeClass(this.options.states.active).addClass(this.options.states.inactive);

                    if(this.map){
                        this.inner.off("mouseleave", $.proxy(self._mapEnd,self));
                        this.inner.off(self.canTouch ? "touchstart" : "mousedown", $.proxy(this._mapStart,self));
                    }
                }

                if(this.canHideEl)
                    this.element.css({opacity:1});

                if(this._cycle){
                    this._cycle.current = -1;
                }

                this.lens && this.lens.hide();

                if(this.moveEvent&&$.proxy(this._parentMove, this) ) {
                    this.parent.off(this.moveEvent, $.proxy(this._parentMove, this));
                }
                this.wrapper.css({width: '', height:''});
                this._setCursor(this.options.cursor.inactive, this.parent);
                this.parent.removeClass(this.options.states.active).addClass(this.options.states.inactive);
                this._track('zoomedOut', e);
            }
        },
        _getEvent: function(e) {
            if(e && e.type == "touchend") {
                e = this.startTouchEvent;
            }
            if(e && e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ) {
                e = e.originalEvent.touches[0];
            }
            return e;
        },
        load: function(option){
            this._loadImage();
        },
        visible: function(visible) {
            if (this._visible == visible){
                if(visible == this._zoomVisible)
                    return;

                if(visible && this.options.preload.zoomed == 'visible'){
                    this._loadZoomed();
                    this._zoomVisible = visible;
                }
                return;
            }
            if (visible) this._track('visible',{'visible':visible});

            if (visible) {
                if(this.options.preload.image == 'visible'){
                    this._loadImage();
                }

                if(this.options.preload.zoomed == 'visible'){
                    this._loadZoomed();
                    this._zoomVisible = visible;
                }
                this._calcSize();
            } else {
                this.zoom(false);
            }
            this._visible = visible;
        },
        preload:function() {
            this._loadZoomed();
        },
        _makeLens:function(lens, rw, rh, zoom, limit){
            var o = { lw:rw / zoom, lh:rh / zoom,  lwh:0,  lhh:0,  dl:0,  dt:0};
            lens.width(o.lw);
            lens.height(o.lh);
            o.dl = (lens.outerWidth(true)-o.lw);
            o.dt = (lens.outerHeight(true)-o.lh);

            if(o.lw + o.dl > limit.w)
                o.lw = limit.w - o.dl;

            if(o.lh + o.dt > limit.h)
                o.lh = limit.h - o.dt;

            lens.width(o.lw);
            lens.height(o.lh);
            o.lwh = o.lw/2;
            o.lhh = o.lh/2;
            o.dlh = o.dl/2;
            o.dth = o.dt/2;
            return o;
        },
        _loadZoomed: function(){
            if(!this._imageLoaded){
                if(this.options.preload.zoomed != 'none')
                    this._loadZoomedPromise = true;
                this._loadImage();
                return;
            }
 
            if(this._zoomLoaded || this._zoomLoading)
                return;

            var self = this;
            this._zoomLoading = true;
            this._zoomLoaded = false;
            this._toLoadCount = this.imgs.length;
            this._zoomLoadedCount = 0;

            this._track('startPreload');
            var onLoad = function(e){
                self._zoomLoadedCount++;
                if(self._zoomLoadedCount == self._toLoadCount){
                    self._zoomLoaded = true;
                    self._zoomLoading = false;
                    self.loading.hide();
                    self._track('preloaded');
                    self._calcSize();
                }
            };

            $.each(this.imgs, function(i,el){
                el.on('load', onLoad);
                el[0].src = self._getUrl(self.options.zoom[i]);
            });

        },
        _checkLoaded: function(e){
            var self = this, opacitySet = false;
            if(!this._zoomLoading)
                this._loadZoomed();
            clearInterval(this.interval);
            this.interval = setInterval(function(){
                if(self._zoomLoaded){
                    clearInterval(self.interval);
                    self.zoom(self.zoomed, e, true);
                }else if(self._zoomLoading && !opacitySet){
                    if(self.canHideEl)
                        self.element.css({opacity:0});
                    opacitySet = true;
                }
            },50)
        },
        _pinchZoomStart: function(e){
            var self = this;
            this.zoomed = true;
            if(this.options.fade) {
                this.target.animate({opacity:1});
            }else{
                this.target.css({opacity:1});
            }
            this.target.show();

            var o = {pw:this.overflow.width(), ph: this.overflow.height(), po: this.parent.offset(), mw:0, mh:0, lens:null};
            o.tw = o.pw * 1, o.th = o.ph * 1;

            this.wrapper.css({width: this.overflow.width(), height: this.overflow.height()});
            if(this.map){
                o.mw = this.map.width(),
                o.mh =  o.mw*(this.element.height()/this.element.width());
                o.mo =  this.map.offset();
                this.inner.height(o.mh)
                this.map.show();
                if(this.lens)
                    o.lens = this._makeLens(this.lens, o.mw, o.mh, 1, {w: o.mw, h: o.mh});

                this._mapEnd = function(e){
                    self.inner.off("touchmove", $.proxy(self._mapMove,self));
                    self.inner.off("touchend", $.proxy(self._mapEnd,self));
                }

                this._mapMove = function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    self._mouseMove(self._getEvent(e), o.pw, o.ph, o.tw, o.th,self.map.offset(), null,null, o.mw, o.mh, o.lens, true);
                }

                this._mapStart = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self._mouseMove(self._getEvent(e), o.pw, o.ph, o.tw, o.th,self.map.offset(), null,null, o.mw, o.mh, o.lens, true);
                    this.inner.on("touchmove",  $.proxy(self._mapMove,self));
                    this.inner.on("touchend", $.proxy(self._mapEnd,self));
                }
                this.inner.on("touchstart", $.proxy(this._mapStart,this));
                this.inner.removeClass(this.options.states.inactive).addClass(this.options.states.active);
                this.inner.show();
                this.lens && this.lens.show();
            }

            this._parentMove = function(e) {

                if(!self.hasPinchEnded){
                    e.stopPropagation();
                    return true;
                }
                if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]) {
                    if (e.originalEvent.touches.length != 1)
                        return true;
                }

                e.preventDefault();
                if(this.zoomBy!==1) {
                    e.stopPropagation();
                }
                self._mouseMove(self._getEvent(e), o.pw, o.ph, o.tw, o.th, o.po, null, null, o.mw, o.mh, o.lens);
            };
            this.parent.on('touchmove', $.proxy(this._parentMove,this));
            return o;
        },
        _pinchZoom: function (e, scale, center, o) {
            if(scale == this.maxZoom){
                this._track('maxZoom', {domEvent:e, scale:scale, center:center});
            }else if(scale == 1){
                this._track('minZoom', {domEvent:e, scale:scale, center:center});
            }

            o.tw = o.pw * scale;
            o.th = o.ph * scale;
            this.zoomBy = scale;
            this.wrapper.css({width: o.tw, height: o.th});
            if(this.lens)
                o.lens = this._makeLens(this.lens, o.mw, o.mh, scale, {w: o.mw, h: o.mh});

            this._mouseMove({currentTarget:e.currentTarget, pageX:center.x, pageY:center.y}, o.pw, o.ph, o.tw, o.th, o.po, null, null, o.mw, o.mh, o.lens);
        },
        _mouseMove: function (e, pw, ph, tw, th, po, bw, bh, mw, mh, l, mapIsTarget){
            var dw = bw ? (tw - pw) + (pw - bw) : tw - pw,
                dh = bh ? (th - ph) + (ph - bh) : th - ph,
                mx, my, x, y, limited;

            if(this.init && this.options.pan){
                if(this.mousedown || this.canTouch || mapIsTarget){
                    if(!this.pinching){
                        this.panning = true;
                        var dx = (this.pos.start.x - e.pageX),
                            dy = (this.pos.start.y - e.pageY);
                        x = dx + this.pos.cur.x;
                        y = dy + this.pos.cur.y;
                        mx = (x+(pw/2))/(tw/pw);
                        my = (y+(ph/2))/(th/ph);
                    }else{
                        mx = (this.startPos.x+(this.pos.start.x - po.left))/this.startZoom;
                        my = (this.startPos.y+(this.pos.start.y - po.top))/this.startZoom;
                        x = (dw * (mx / pw));
                        y = (dh * (my / ph));
                    }
                }else{
                    this.panning = false;
                    return;
                }
            }else{
                this.init = true;
                this.panning = false;
                mx = e.pageX - po.left;
                my = e.pageY - po.top;
                x = dw * (mx / pw);
                y = dh * (my / ph);
                this.pos.cur.x = this.pos.last.x || x;
                this.pos.cur.y = this.pos.last.y || y;
            }

            if(this.lens){
                if(this.box){
                    if(this.box[0].lastChild.relatedUUID != this.uuid){
                        this.box.append(this.wrapper);
                        this.wrapper.show().siblings().hide();
                    }
                    var lx = pw, ly = ph;
                    var tmx = mx - l.lwh - l.dlh, tmy = my - l.lhh - l.dth;
                    x = ((tmx + l.dlh) * this.zoomBy - ((l.lw)/pw));
                    y = ((tmy + l.dth) * this.zoomBy - ((l.lh)/ph));
                    limited = this._setBounds(mx, my, pw, ph, 0, 0);
                    mx = limited.x;
                    my = limited.y;

                } else if (mapIsTarget){
                    if(this.panning){
                        mx = e.pageX - po.left;
                        my = e.pageY - po.top;
                    }

                    var lx = mw, ly = mh;
                    var tmx = mx - l.lwh - l.dlh, tmy = my - l.lhh - l.dth;
                    x = ((tmx + l.dlh) * this.zoomBy - ((l.lw)/pw)) * pw/mw;
                    y = ((tmy + l.dth) * this.zoomBy - ((l.lh)/ph)) * ph/mh;
                    this.pos.cur = {'x':x,'y':y};

                } else if (this.map){
                    if(this.map[0].lastChild.relatedUUID != this.uuid){
                        this.map.append(this.inner);
                        this.inner.show().siblings().hide();
                    }

                    if(!this.panning){
                        var rx = mx/(pw/l.lw), ry = my/(ph/l.lh),
                            tmx = (mx/(pw/mw))-rx-l.dlh, tmy = (my/(ph/mh))-ry-l.dth;
                    }else{
                        var tmx = (mx/(pw/mw)) - l.lwh - l.dth;
                        tmy = (my/(ph/mh)) - l.lhh - l.dth;
                    }

                    limited = this._setBounds(tmx, tmy, mw - l.lw - l.dl, mh - l.lh - l.dt, 0, 0);
                    tmx = limited.x;
                    tmy = limited.y;
                }

                if(this.box || mapIsTarget){
                    if(mx + l.lwh + l.dlh >= lx) tmx = lx - l.lw - l.dl;
                    if(my + l.lhh + l.dth >= ly) tmy = ly - l.lh - l.dt;
                    if(mx - l.lwh - l.dlh <= 0) tmx = 0;
                    if(my - l.lhh - l.dth <= 0) tmy = 0;
                }

                this.lens.css({'top': tmy + 'px', 'left': tmx + 'px'});
            }

            limited = this._setBounds(x, y, dw, dh, 0, 0);
            x = limited.x;
            y = limited.y;

            this.pos.last = {'x':x,'y':y};
            this.lastPos = {'x':x,'y':y};
            if(this.oldTarget)
                this.oldTarget.css({'top': -y + 'px', 'left': -x + 'px'});
            this.target.css({'top': -y + 'px', 'left': -x + 'px'});
            this._track('move',{domEvent:e,pos:{x:(mx / pw),y:(my / ph)}});
        },
        _calcSize: function() {
            var w,h;
            if ((this.options.responsive) && (this.options.width && this.options.height && this.options.width!='auto' && this.options.height!='auto')) {
                w = this.element.width();
                h = w*(this.options.height/this.options.width);
                this.parent.height(h);
                this.overflow.height(h);
                if(this.element.height() != 0 && h > this.element.height()){
                    this.overflow.height(this.element.height())
                }
            } else {
                if (this.options.width) {
                    this.parent.width(this.options.width);
                }
                if (this.options.height) {
                    this.parent.height(this.options.height);
                }
            }

            if(this.map){
                var mw = this.map.width();
                var mh =  mw*(this.element.height()/this.element.width());
                this.inner.height(mh)
            }
        },
        _getUrl: function(current){
            if(this.options.url)
                return this.options.url;

            var url = this.element.attr('src') || this.element.attr('data-amp-src');
            if(!url) return;

            var zoomBy = this._cycle ? (current || 1) : this.options.zoom;
            url = this._cleanUrl(url);
            var transform = this.options.transforms;
            if(this._cycle) {
                var index = $.inArray(current, this.options.zoom);
                transform = transform[index];
            }
            url = transform ? this._setTransforms(url, transform) : url; 
            url = this._setWidth(url, {h:this._originalImage.height * zoomBy, w:this._originalImage.width * zoomBy});
            return url;
        },
        _getWidth: function(url){
            if(window.amp && amp.di)
                return amp.di.width(url);

            var url = url.split("?");
            if(!url[1]) return false;
            var options = url[1].split('&');
            for (var i=0; i<options.length;i++){
                var parts = options[i].split('='), optionsObj = {};
                if(parts[0] == "w") {
                    return parseInt(parts[1]);
                }
            }
            return false;
        },
        _setWidth: function(url, width){
            if(window.amp && amp.di)
                return amp.di.set(url, width);

            var url = url.split("?");

            if(url[1]){
                var options = url[1].split('&'),
                    params = [];

                for (var i=0; i<options.length;i++){
                    var parts = options[i].split('='), optionsObj = {};
                    if(parts[0] != "w"){
                        optionsObj[parts[0]] = parts[1];
                        params.push($.param(optionsObj));
                    }
                }
                params = params.concat($.param(width));
                return url[0] +"?"+ params.join("&");
            }

            return url[0] +"?"+ $.param(width);
        },
        // removing everything
        _cleanUrl:function(url){
            var u = url.split('?');
            return u[0];
        },
        _loadImage:function(){ 
            if(this._imageLoaded || this._imageLoading)
                return;

            this.loading = $('<div class="amp-loading"></div>');
            this._imageLoading = true;
            var src = this.element[0].src || this.element.attr('data-amp-src');
            this.element.on('load', $.proxy(this._onImageLoad,this));
            this.element[0].src = '';
            this.element[0].src = src;
        },
        _getNaturalSize:function(src){ 
            return {width: this.element[0].naturalWidth, height: this.element[0].naturalHeight};
        },
        _setTransforms: function(url, transforms){
            if(url.indexOf('?')==-1) {
                return url+'?'+transforms;
            } else {
                return url+'&'+transforms;
            }
        },
        _setBounds: function(x, y, r, b, l, t){
            if(x >= r) x = r;
            if(y >= b) y = b;
            if(x <= l) x = l;
            if(y <= t) y = t;
            return {
                x:x, y:y
            }
        },
        _track: function(event,value) {
            this._trigger( event, null, value );
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element,'zoom',event,value);
            }
        },
        _setCursor: function(cursorStyle, el){
            if(typeof cursorStyle != "string")
                cursorStyle = "auto"

            if(cursorStyle.indexOf('zoom') < 0){
                el.css('cursor', cursorStyle);
                return false;
            }
            // zoom
            //TODO: This won't survive minification. We probably don't need it anyway, it should be easier to just detect IE8+
            if (/*@cc_on!@*/false || !!document.documentMode){ return false; }     // ie bye bye
            if(typeof InstallTrigger !== 'undefined'){        // moz
                el.css('cursor', '-moz-' + cursorStyle);
            }
            if(!!window.chrome){     // chrome + opera
                el.css('cursor', '-webkit-' + cursorStyle);
            }
        },
        _getDistance:function(t){
            var x = Math.abs(t[0].pageX-t[1].pageX),
                y = Math.abs(t[0].pageY-t[1].pageY);
            return Math.sqrt(
                (x * x) + (y * y)
            );
        },
        _getPosition:function(t){
            return {
                x:(t[0].pageX + t[1].pageX)/2,
                y:(t[0].pageY + t[1].pageY)/2
            };
        },
        _destroy: function() {
            this.element.unwrap().unwrap();
            this.wrapper.remove();
            this.element.removeClass('amp');
            this.element.removeClass('amp-zoom');
            this.element.removeClass(this.options.states.active);
            this.element.removeClass(this.options.states.inactive);
            this.element.css({'cursor':'', 'height':'', 'max-width':'','width':'', 'opacity':'', 'position':'', 'display':'','top':'',left:'',zoom:''});
            this._removeEmptyAttributeHelper(this.element);
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

}(jQuery));
(function ($) {

    $.widget("amp.ampZoomInline", {
        // Default options.
        options: {
            // the max size for the image to go up to
            scaleMax: 3,
            // the scale multiplier to apply to the image
            scaleStep: 0.5,
            // toggle the zoom or not, needed when we are using the same mouse event to zoom in and out
            scaleSteps: false,
            events:{
                zoomIn:'mouseup touchstart',
                zoomOut:'mouseup touchend',
                move:'mousemove touchmove'
            },
            stopPropagation:'',
            activation:{
                inGesture:true
            },
            pinch:false,
            transforms:'',
            // created, visible, none
            preload:'none',
            pan:false

        },
        _getCreateOptions:function(){
            var attributes = this.element.data().ampZoomInline;
            if (attributes) {
                return $.extend(true, {}, this.options, attributes);
            }
            return this.options;
        },
        _create: function () {
            var self = this;
            this.scale = 1;
            this.element.addClass('amp amp-zoom');
            this.$parent = this.element.parent();
            this._invalidateParentSize();
            this.element.on(this.options.events.zoomIn,$.proxy(this.zoomIn,this));
            if(!this.options.activation.inGesture){
                this.gestureDetect = new gestureDetector(this.element);
            }
            this._track("created");
            if(this.options.preload=='created') {
                this.load();
            }
            if(this.options.pan) {
                $(document).on("dragstart", function() {
                    return false;
                });

                this.element.parent().on('mousedown touchstart',$.proxy(function(e){
                    // are we panning? if so don't let mousedown trigger anything else
                    if(this.scale>1) {
                        e.stopPropagation();
                    }
                    if(this.panner) {
                        this.panner.remove();
                        delete this.panner;
                    }
                    if(this.scale>1) {
                        this.panner = new pan(this,e,$.proxy(function(x,y){
                            if(this.zoomArea){
                                this.zoomArea.setPosition(x,y);
                            }
                        },this));
                    }
                    return true;
                },this));
            }
            if(this.options.pinch) {
                this.element.parent().on('touchstart',$.proxy(function(e){
                    if(this.pincher) {
                        this.pincher.remove();
                        delete this.pincher;
                    }
//                    if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length>1){
//                        this._getPercentagePos(e);
//                        if(this.zoomArea){
//                        }
//                    }
                    this.pincher = new pinch(e,$.proxy(function(){
                        this.zoomIn();
                    },this),$.proxy(function(){
                        this.zoomOut();
                    },this));
                    return true;
                },this));
            }
            if(this.options.stopPropagation!=='') {
                this.element.parent().on(this.options.stopPropagation, $.proxy(function(e){
                    if(this.scale!=1){
                        e.stopPropagation();
                    }
                },this))
            }
        },


        visible: function(visible) {
            if (this._visible == visible) {
                return;
            }
            if (visible) this._track('visible',{'visible':visible});
            if (visible) {
                if(this.options.preload=='visible') {
                    this.load();
                }
            } else {
                this.zoomOutFull();
            }
            this._visible = visible;
        },
        load:function(){
            this._setupZoomArea().then($.proxy(function(area){
                area.setScale(this.options.zoom);
            },this))
        },
        _setupZoomArea: function(){
            return new Promise($.proxy(function(resolve, reject) {
                if (!this.zoomArea) {
                    this.getImageSize().then($.proxy(function (size) {
                        if (!size.error) {
                            this.zoomArea = new zoomArea(this.element, this.$parent, size, this.options.transforms);
                            resolve(this.zoomArea);
                        } else {
                            reject(false);
                        }
                    },this));
                } else {
                    resolve(this.zoomArea);
                }
            },this));
        },
        getImageSize : function(){
            return new Promise($.proxy(function(resolve, reject) {
                if(this.element[0].naturalWidth && this.element[0].naturalHeight) {
                    resolve({'x':this.element[0].naturalWidth,'y':this.element[0].naturalHeight});
                } else {
                    if(this.element[0].width && this.element[0].height) {
                        resolve({'x':this.element[0].width,'y':this.element[0].height});
                    }
                }
                this.element.on('load',$.proxy(function(){
                    if(this.element[0].naturalWidth && this.element[0].naturalHeight) {
                        resolve({'x':this.element[0].naturalWidth,'y':this.element[0].naturalHeight});
                    } else {
                        if(this.element[0].width && this.element[0].height) {
                            resolve({'x':this.element[0].width,'y':this.element[0].height});
                        }
                    }
                },this));

                this.element.on('error',$.proxy(function(){
                    reject({'error':true});
                },this));
            },this));
        },
        _invalidateParentSize : function(){
            this.parentSize = {"x":this.$parent.width(),"y":this.$parent.height()};
        },

        zoomInFull:function(e) {
            this.setScale(this.options.scaleMax);
            this._track('zoomedInFull',{domEvent:e,scale:this.options.scaleMax,scaleMax:this.options.scaleMax,scaleStep:this.options.scaleStep});
        },

        zoomIn: function (e) {
            if(!this.options.scaleSteps){
                if(this.scale != 1){
                    return;
                }
            }
            if(e) {
                e.preventDefault();
            }
            if(!this.options.activation.inGesture){
                if (this.gestureDetect.detected) {
                    return;
                }
            }
            var currScale = this.scale;
            if(this.options.scaleSteps) {
                this.scale+=this.options.scaleStep;
                this.scale = Math.min(this.scale,this.options.scaleMax);
            } else {
                this.scale = this.options.scaleMax;
            }

            if(currScale == this.scale) {
                return;
            }
            this._track('zoomedIn',{domEvent:e,scale:this.scale,scaleMax:this.options.scaleMax,scaleStep:this.options.scaleStep});
            this.setScale(this.scale);
            // need to take these outside of execution because if we have the same event for zoomIn and zoomOut both would trigger due to bubbling
            setTimeout($.proxy(function(){
                $(document).on(this.options.events.move, $.proxy(this._setPos,this));
                if(!this.options.scaleSteps) { // put inside the if as if we use steps we don't want it to zoom out (mostly for spin)
                    $(document).on(this.options.events.zoomOut, $.proxy(this.zoomOut, this));
                }
            },this),1);
        },

        zoomInClick: function (e) {
            if(!this.options.activation.inGesture){
                if (this.gestureDetect.detected) {
                    return;
                }
            }
            var currScale = this.scale;
            this.scale+=this.options.scaleStep;
            this.scale = Math.min(this.scale,this.options.scaleMax);
            if(currScale == this.scale) {
                return;
            }
            this._track('zoomedIn',{domEvent:e,scale:this.scale,scaleMax:this.options.scaleMax,scaleStep:this.options.scaleStep});
            this.setScale(this.scale);
            // need to take these outside of execution because if we have the same event for zoomIn and zoomOut both would trigger due to bubbling
            setTimeout($.proxy(function(){
                $(document).on(this.options.events.move, $.proxy(this._setPos,this));
            },this),1);
        },

        setScale : function(s) {
            this.scale = s;
            this._setupZoomArea().then($.proxy(function(area){
                if(!area){
                    return;
                }
                area.setScale(this.scale);
                this._invalidateParentSize();
//                this._setPos(e);

            },this));
        },
        _setPos : function(e){
            this._track('settingPos',{domEvent:e});
            var pos = e?this._getPercentagePos(e):{x:0.5,y:0.5};
            this.zoomArea.setPosition(pos.x,pos.y)
        },
        zoomOut:function(e) {
            var currScale = this.scale;
            if(this.options.scaleSteps) {
                this.scale -= this.options.scaleStep;
                this.scale = Math.max(this.scale, 1);
            } else {
                this.scale = 1;
            }
            if(currScale == this.scale) {
                return;
            }
            if(this.scale == 1) {
                $(document).off(this.options.events.move, this._setPos);
                $(document).off(this.options.events.zoomOut,this.zoomOut);
            }
            this.zoomArea.setScale(this.scale);
            this._track('zoomedOut',{domEvent:e,scale:this.scale,scaleMax:this.options.scaleMax,scaleStep:this.options.scaleStep});
        },

        zoomOutFull:function(e) {
            if (!this.zoomArea) {
                return;
            }
            $(document).off(this.options.events.move, this._setPos);
            $(document).off(this.options.events.zoomOut,this.zoomOut);
            this.scale = 1;
            this.zoomArea.setScale(1);
            this._track('zoomedOutFull',{domEvent:e,scale:this.scale,scaleMax:this.options.scaleMax,scaleStep:this.options.scaleStep});
        },
        // Convert touch event into a standard event
        _convertEvent:function(e) {
            if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]) {
                // stop stupid device behaviour
                e.preventDefault();
                e = e.originalEvent.touches[0];
            }
            return(e);
        },
        _getPercentagePos:function(e){
            e = this._convertEvent(e);
            var offset = this.$parent.offset();
            return {"x": (e.pageX-offset.left)/this.parentSize.x,"y":(e.pageY-offset.top)/this.parentSize.y};
        },

        _track: function(event,value) {
            this._trigger( event, null, value );
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element,'zoom',event,value);
            }
        },
        _destroy: function() {
            this.element.removeClass('amp');
            this.element.removeClass('amp-zoom');
            this._removeEmptyAttributeHelper(this.element);
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

    var gestureDetector = function(toleranceX,toleranceY){
        this.toleranceX = toleranceX!==undefined?toleranceX:0;
        this.toleranceY = toleranceY!==undefined?toleranceY:0;
        this.detected = false;
        this.$document = $('body');
        this.$document.on('mousedown touchstart',$.proxy(this.startDetecting,this));
    };

    // Convert touch event into a standard event
    gestureDetector.prototype.convertEvent = function(e) {
        if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]) {
            e = e.originalEvent.touches[0];
        }
        return(e);
    };

    gestureDetector.prototype.startDetecting = function(e) {
        this.detected = false;
        this.$document.on('mousemove touchmove', $.proxy(this.moveDetected,this));
        this.$document.on('mouseup touchend', $.proxy(this.stopDetecting,this));
    };

    gestureDetector.prototype.moveDetected = function(e) {
        this.detected = true;
    };

    gestureDetector.prototype.stopDetecting = function(e) {
        this.$document.off('mousemove touchmove',this.moveDetected);
        this.$document.off('mouseup touchend',this.stopDetecting);
    };

    var pinch = function(e,cbIn,cbOut) {
        // pixel value at which to use callbacks
        this.threshold = 100;
        e = this.getFingers(e);
        this.cbIn = cbIn;
        this.cbOut = cbOut;
        if(e.length==2){
            this.start = this.getDistance(e);
            $(document).on('touchmove', $.proxy(this.move,this));
            $(document).on('touchend', $.proxy(this.end,this));
        }
    };

    pinch.prototype.getDistance = function(touches){
        var x = Math.abs(touches[0].pageX-touches[1].pageX),
            y = Math.abs(touches[0].pageY-touches[1].pageY);
        return Math.sqrt(
                (x * x) + (y * y)
        );
    };

    pinch.prototype.move = function(e) {
        e.preventDefault();
        e = this.getFingers(e);
        var newDistance = this.getDistance(e);
        var distance = (newDistance - this.start);
        if(distance > this.threshold) {
            this.cbIn();
            this.start = newDistance;
        }

        if(distance < 0-this.threshold) {
            this.cbOut();
            this.start = newDistance;
        }
    };

    pinch.prototype.remove = function(){
        this.end();
    };

    pinch.prototype.end = function(e){
        $(document).off('mousemove touchmove',this.move);
        $(document).off('mouseup touchend',this.end);
    };
    // get touch event stuff
    pinch.prototype.getFingers = function(e) {
        if (e.originalEvent && e.originalEvent.touches) {
            e = e.originalEvent.touches;
        }
        return(e);
    };

    var pan = function(zoom,e,cb) {
        if(this.multiFinger(e)){
            return;
        }
        e = this.convertEvent(e);
        this.start = {'x': e.pageX, 'y': e.pageY};
        this.zoomArea = zoom.zoomArea;
        this.cb = cb;
        this.element = zoom.element;
        this.currentPixPos = this.zoomArea.getPixPos();
        $(document).on('mousemove touchmove', $.proxy(this.move,this));
        $(document).on('mouseup touchend', $.proxy(this.end,this));
    };

    pan.prototype.move = function(e) {
        e.preventDefault();
        e = this.convertEvent(e);
        var offsetX = e.pageX - this.start.x;
        var offsetY = e.pageY - this.start.y;
        var newPos = this.zoomArea.getPercentFromPos(this.currentPixPos.x + offsetX, this.currentPixPos.y + offsetY);
        this.cb(newPos.x,newPos.y);
    };

    pan.prototype.end = function(e){
        $(document).off('mousemove touchmove',this.move);
        $(document).off('mouseup touchend',this.end);
    };

    pan.prototype.remove = function(){
        this.end();
    };

    // Convert touch event into a standard event
    pan.prototype.multiFinger = function(e) {
        return(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length>1);
    };

    // Convert touch event into a standard event
    pan.prototype.convertEvent = function(e) {
        if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]) {
            e = e.originalEvent.touches[0];
        }
        return(e);
    };


    var zoomArea = function($source,$area,originalSize,transforms) {
        this.animating = false;
        this.transforms = transforms;
        this.initialSrc = $source.attr('src');
        this.scale = 1;
        this.$area = $area;
        this.$source = $source;
        this.originalSize = originalSize;
        this.posPercentageX = 0.5;
        this.posPercentageY = 0.5;
        this.createContainer();
        this.hide();
    };

    zoomArea.prototype.getPercentagePosWithScale = function(e) {
//        this.newSize.x
    };

    zoomArea.prototype.createContainer = function() {
        this.$container = $('<div class="amp-zoomed-container"></div>');
        this.$preloader = $('<img style="display:none">');
        this.$preloader.on('load', $.proxy(this.setImage,this));
        this.$zoomed = $('<img class="amp-zoomed" src=""/>');
        this.$container.append(this.$zoomed);
        this.$container.append(this.$preloader);
        this.$area.append(this.$container);
        this.$container.css({
            position:'absolute',
            top:0,
            left:0,
            bottom:0,
            right:0
        })
    };

    zoomArea.prototype.invalidatePosition = function() {
        this.setPosition(this.posPercentageX,this.posPercentageY);
    };

    zoomArea.prototype.setPosition = function(x,y) {
        if(this.animating)
            return;
        if(this.$zoomed.width()<=this.$area.width()) {
            x = 0.5;
        }

        if(this.$zoomed.height()<=this.$area.height()) {
            y = 0.5;
        }
        this.posPercentageX = x;
        this.posPercentageY = y;
        x = Math.min(1,Math.max(0,x));
        y = Math.min(1,Math.max(0,y));
        this.$zoomed.css('left',(0-((this.$zoomed.width()-this.$area.width())*x))+'px');
        this.$zoomed.css('top',(0-((this.$zoomed.height()-this.$area.height())*y))+'px');
    };

    zoomArea.prototype.getPixPos = function(x,y) {
        if(x==undefined && y == undefined) {
            x = this.posPercentageX;
            y = this.posPercentageY;
        }
        x = Math.min(1,Math.max(0,x));
        y = Math.min(1,Math.max(0,y));
        return {'x':(0-((this.newSize.x-this.$area.width())*x)),'y':(0-((this.newSize.y-this.$area.height())*y))};
    };

    zoomArea.prototype.getPercentFromPos = function(x,y) {
        var percentX = 0-(x/(this.newSize.x-this.$area.width()));
        var percentY = 0-(y/(this.newSize.y-this.$area.height()));
        return {'x':percentX,'y':percentY};
    };

    zoomArea.prototype.animate = function (size,pos,cb) {
        this.animating = true;
        if(size.x <= this.$area.width()) {
            pos.x = this.getPixPos(0.5,0.5).x;
        }
        if(size.y <= this.$area.height()) {
            pos.y = this.getPixPos(0.5,0.5).y;
        }

        this.$zoomed.animate({'width':size.x,'height':size.y,'left':pos.x+'px','top':pos.y+'px'},500, $.proxy(function(){
            this.animating = false;
            if (cb) {
                cb();
            }
        },this));

    };

    zoomArea.prototype.setScale = function(scale,cb){
        if(scale == this.scale) {
            return;
        }
        if((scale < this.scale) && scale == 1) {
            this.newSize = {'x':this.$source.width(), 'y':this.$source.height()};
        } else {
            this.newSize = {'x':this.originalSize.x*scale, 'y':this.originalSize.y*scale};
        }
        if (this.scale==1) {
            this.$zoomed.attr('src',this.$source.attr('src'));
            if(scale > this.scale) {
                this.$zoomed.width(this.$source.width());
                this.$zoomed.height(this.$source.height());
                this.$zoomed.height(this.$source.height());
            }
            this.setPosition(0.5,0.5);
            this.show();
        }
        if(scale==1){
            this.animate(this.newSize,this.getPixPos(), $.proxy(this.hide,this));
        } else {
            this.animate(this.newSize,this.getPixPos());
        }
        this.scale = scale;
        this.invalidateImageURL();
    };

    zoomArea.prototype.show = function(){
        this.invalidatePosition();
        $(window).off('resize', this.invalidatePosition);
        $(window).on('resize', $.proxy(this.invalidatePosition,this));
        this.$container.show();
    };

    zoomArea.prototype.hide = function(){
        this.$container.hide();
        $(window).off('resize', this.invalidatePosition);
    };

    zoomArea.prototype.invalidateImageURL = function() {
        var src = this.initialSrc.split('?')[0]+'?w='+this.newSize.x+'&h='+this.newSize.y+'&'+this.transforms;
        if(this.newSize.x == 0 || this.newSize.y ==0) {
            src='';
        }
        this.$preloader.attr('src',src);
    };
    zoomArea.prototype.setImage = function() {
        this.$zoomed.attr('src',this.$preloader.attr('src'));
    };


}(jQuery));
(function ($) {

    $.widget("amp.ampVideo", {
        options: {
            autoplay: false,
            loop: false,
            muted: false,
            skin: 'amp-video-skin',
            responsive: true,
            preload: 'auto',
            pauseOnHide: true,
            controls:true,
            nativeControlsForTouch:true,
            plugins:{}
        },
        _states: {
            stopped:0,
            buffering:1,
            paused:2,
            playing:3,
            loading:4,
            error:5,
            idle:6
        },
        _ready: false,
        _loopCount: 0,
        _savedHTML:'',
        _getCreateOptions:function(){
            this._savedHTML = this.element[0].outerHTML;
            var attributes = this.element.data().ampVideo;
            if (attributes) {
                return $.extend(true, {}, this.options, attributes);
            }
            return this.options;
        },
        _create: function () {
            this.element.addClass('amp amp-video');
            var video = this.element.find('video');
            var self = this;
            video.addClass('video-js' + ' ' + this.options.skin);
            if(videojs) {
                videojs.options.flash.swf = (this.options.swfUrl +"video-js.swf") || "../../assets/video-js.swf";

                this._player = videojs(video[0], {
                    autoplay: this.options.autoplay,
                    muted: this.options.muted,
                    width: '100%',
                    height: '100%',
                    loop: false,
                    controls: this.options.controls,
                    preload: this.options.preload,
                    plugins: self._sanitisePlugins(this.options.plugins),
                    nativeControlsForTouch:this.options.nativeControlsForTouch
                });
            }

            self._calcSize();
            if (self.options.responsive) {
                $(window).bind("resize", function (_self) {
                    return function () {
                        return _self._calcSize();
                    }
                }(self));
            }

            this._player.ready(function () {
                self._ready = true;
                var vid = self.element.find('.vjs-tech');
                var interval = setInterval(function () {
                    if(self.options.height == 'auto'){
                        var height = vid.css({'height':'auto'}).height();
                        if (height != 0) {
                            clearInterval(interval);
                            self.element.height(height);
                            vid.css({height:''});
                            self._player.dimensions(self.element.width(), self.element.height())
                        }
                    }
                }, 200);
                if (self.options.autoplay)
                    self.state(self._states.playing);

                this.on("play", function (e) {
                    if (!self.softPlay) {
                        self.state(self._states.playing);
                        self._track("play", {event:e,player:this,time: this.currentTime(),duration: self.duration});
                    } else {
                        self.softPlay = false;
                    }
                });

                this.on("error", function (e) {
                    self.state(self._states.error);
                    self._track("error", null);
                });

                this.on("pause", function (e) {
                    if(!e.target.ended && !e.target.seeking){
                        self.state(self._states.paused);
                        self._track("pause", {event:e,player:this,time: this.currentTime(),duration: self.duration});
                    }
                });

                this.on("waiting", function (e) {
                    self.state(self._states.buffering);
                });

                this.on("seeking", function (e) {
                    if (!self.softSeek) {
                        if (self.state() != self._states.paused && e.target.currentTime != 0)
                            self.softPlay = true;
                        self._track("seeked", {event:e,player:this,time: this.currentTime(),duration: self.duration});
                    } else {
                        self.softSeek = false;
                    }
                });

                this.on("timeupdate", function (e) {
                    self._track("timeUpdate", {event:e,player:this,time: this.currentTime(),duration: self.duration});
                });

                this.on("volumechange", function (e) {
                    self._track("volume", {event:e,player:this,volume: this.volume(), muted: this.muted()});
                });

                this.on("durationchange", function (e) {
                    self.duration = this.duration();
                    self._track("durationChange", {event:e,player:this,duration: self.duration});
                });

                this.on("fullscreenchange", function (e) {
                    self._track("fullScreenChange", {event:e,player:this});
                    setTimeout(function(){$(window).resize()},200);
                });

                this.on("ended", function (e) {
                    if (self.options.loop) {
                        self.softSeek = true;
                        self._player.currentTime(0);
                        self.softPlay = true;
                        self._player.play();
                        self._track("looped", { count: ++self._loopCount });
                    }else{
                        self._track("ended", null);
                    }
                });
                self._track("created",{player:this,duration: self.duration});
            });
        },
        visible: function(visible) {
            if(visible == this._visible)
                return;

            if (visible) {
                this._track('visible',{'visible':visible});
                this._calcSize();
            } else {
                if(this._states.playing == this.state() || this._states.buffering== this.state()) {
                    if(this.options.pauseOnHide){
                        this.pause();
                    }
                }
            }

            this._visible = visible;
        },

        redraw:function(){
            this._calcSize();
        },
        _calcSize: function() {
            var w,h;
            if ((this.options.responsive) && (this.options.width && this.options.height && this.options.width!='auto' && this.options.height!='auto')) {
                var display = this.element.css('display');
                this.element.css('display','block');
                w  = Math.round((this.element.width()));
                this.element.css('display',display);
                h =  Math.round((w*(this.options.height/this.options.width)));
                this.element.height(h);
            } else {
                if (this.options.width) {
                    this.element.width(this.options.width)
                } else if (this.options.responsive) {
                    this.element.width(this.element.parent().width());
                }
                if (this.options.height) {
                    this.element.height(this.options.height);
                }else if (this.options.responsive) {
                    this.element.height(this.element.parent().height());
                }
            }

            if(this.options.center) {
                var eh = this.element.height();
                var ph = this.element.parent().height();
                this.element.css('margin-top',((ph/2)-(eh/2))+'px');
            }

            if (this._player)
                this._player.dimensions(this.element.width(), this.element.height())

        },
        play: function () {
            if(!this._ready || this._states.playing === this.state()) return;
            this._player.play();
        },
        pause: function () {
            if(!this._ready || this._states.paused === this.state()) return;
            this._player.pause();
        },
        stop: function () {
            if(!this._ready || this._states.stopped === this.state()) return;
            this._player.pause();
            this.softSeek = true;
            this._player.currentTime(0);
            this._track("stopped", null);
            this.state(this._states.stopped);
        },
        seek: function (time) {
            if(!this._ready) return;
            this.currentTime(time)
        },
        currentTime: function (time) {
            if (time === void 0)
                return this._player.currentTime();
            this._player.currentTime(time);
        },
        state: function(state){
            if (state === void 0)
                return this._currentState;

            this._currentState = state;
            this._trigger("stateChange", null, {state:state})
        },
        _track: function (event, value) {
            this._trigger(event, null, value);
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element, 'video', event, value);
            }
        },
        _destroy: function() {
            this._player.dispose();
            this.element[0].outerHTML = this._savedHTML;
        },
        _sanitisePlugins: function(plugins){
            // setting plugins to false doesn't deactivate, remove instead
            if (plugins && plugins['resolutions'] == false){
                delete plugins['resolutions'];
            }
            return plugins;
        }
    });

}(jQuery));

(function ( $ ) {

    $.widget( "amp.ampSpin",$.amp.ampStack, {
        options:{
            delay: 50,
            autoplay:false,
            loop:true,
            responsive:true,
            states:{
                "selected":"amp-selected",
                "seen":"amp-seen",
                "active":"amp-active",
                "inactive":"amp-inactive"
            },
            events:{
                start:'mousedown touchstart',
                move:'mousemove touchmove',
                end:'mouseup touchend'
            },
            momentum : true,
            preload: 'created',
            preloadType:'full',
            minDistance : 25,
            activate:'down',
            friction: 0.97,
            dir:'normal',
            gesture:{
                enabled:true,
                fingers:1
            },
            orientation: 'horz',
            start:1,
            cursor:{active: 'auto', inactive: 'auto'},
            play: {
                onLoad:false,
                onVisible:false,
                repeat:1
            },
            dragDistance:200,
            lazyLoad:false

        },
        _getCreateOptions:function(){
            var attributes = this.element.data().ampSpin;
            if (attributes) {
                return $.extend(true, {}, this.options, attributes);
            }
            return this.options;
        },
        _create: function() {
            var self = this,
                children = this._children = this.element.children(),
                count = this._count = this.element.children().length;
            this.$document = $(document);
            this.options.friction = Math.min(this.options.friction,0.999);
            this.options.friction = Math.max(this.options.friction,0);
            this._setCursor(this.options.cursor.inactive);
            this.count = this.element.children().length;
            this.options.dragDistance = Math.max(this.options.dragDistance,1);
            this._index = Math.max(1,Math.min(this.options.start,this.count));
            if($.inArray(this.options.preload, ['created', 'visible', 'none']) == -1){
                this.options.preload = 'created';
            }
            this.element.addClass('amp');
            this.element.addClass('amp-spin');
            this.element.addClass(this.options.states.inactive);
            this.imgs = this.element.find('img:not(.amp-zoom-img)');
            this.toLoadCount =  this.imgs.length;
            this.loadedCount = 0;
            children.addClass('amp-frame');
            children.css({'display':'none'});
            children.eq(this._index-1).css('display','block');
            children.eq(this._index-1).addClass(this.options.states.selected + ' ' +this.options.states.seen);
            setTimeout(function(_self) {
                return function() {
                    return _self._calcSize();
                }
            }(self),1);
            
            if(this.options.responsive){
                $(window).on("resize", function(_self) {
                    return function() {
                        return _self._calcSize();
                    }
                }(self));
            }
            this.element.on('dragstart',function(e) {
                return false;
            });

            this.element.on(this.options.events.start, $.proxy(this._startDrag,this));

            // mousewheel
            this.element.on('mousewheel DOMMouseScroll', function(e){return self._mouseScroll(e);});

            if(this.options.autoplay) {
                this.play();
            }

            if(this.options.preload == 'created') {
                this._startPreload();
            }

            this._track("created",{'index':this._index,'canNext':this.canNext(),'canPrev':this.canPrev()});
        },
        _setCursor: function(cursorStyle){
            if((cursorStyle.indexOf('zoom') < 0)&&(cursorStyle.indexOf('grab') < 0)){
                this.element.css('cursor', cursorStyle);
                return false;
            }
            // zoom
            if (/*@cc_on!@*/false || !!document.documentMode){ return false; }     // ie bye bye
            if(typeof InstallTrigger !== 'undefined'){        // moz
                this.element.css('cursor', '-moz-' + cursorStyle);
            }

            if(!!window.chrome){     // chrome + opera

                this.element.css('cursor', '-webkit-' + cursorStyle);
            }
        },
        redraw:function(){
            this._calcSize();
        },
        _mouseScroll:function(e){
            var delta = 0;
            if (!e){e = window.event;} // for ie

            if (e.originalEvent.wheelDelta) {
                delta = e.originalEvent.wheelDelta;  // chrome, ie
            } else if (e.originalEvent.detail) {
                delta = -e.originalEvent.detail;   // ff
            }

            if (delta > 0){
                this.next();
            }else{
                this.prev();
            }
            e.preventDefault();
            return false;
        },
        visible:function(visible) {
            if (visible != this._visible) {
                this._super(visible);
                if(visible) {
                    if(this.options.preload=='visible') {
                        this._startPreload();
                    }

                    if(this.options.preload == 'none'){
                        this._startPreload(this._index);
                    }
                    if(this.options.play.onVisible && this._loaded) {
                        this.playRepeat(this.options.play.repeat);
                    }
                }
            }
        },
        _resolveEventCoords: function(e){
            e = e.originalEvent;
            if(e.touches && e.touches.length){
                return {x: e.touches[0].clientX, y: e.touches[0].clientY};
            }else if(e.changedTouches && e.changedTouches.length){
                return {x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY};
            }else{
                return {x: e.clientX, y: e.clientY};
            }
        },
        _startPreload: function(index){
            if(this._loaded || (this._loading && !this.first))
                return;

            var self=this;
            this._loading = true;
            if(!this.first){
                this._track('startPreload');
                if(this.options.preload != 'none'){
                     if(this.options.preloadType == 'full') {
                        this.pre = $('<li class="amp-progress amp-frame"></li>');
                        this.element.append(this.pre);
                    } else if (this.options.preloadType == 'window'){
                        // create progress indicator
                        this.progressIndicator = $('<div class="amp-progress-indicator"><div class="amp-progress-message"></div><div class="amp-progress-bar-background"><div class="amp-progress-bar"></div></div></div>');
                        this.progressIndicator.find('.amp-progress-message').html(this.options.progressMessage || 'Loading...');
                        this.progressIndicator.progress = self.progressIndicator.find('.amp-progress-bar');
                        this.progressIndicator.visible = true;
                        this.element.append(this.progressIndicator);
                    }
                }
            }


            var onLoad = function(e){
                self.loadedCount++;
                var percent = ((self.loadedCount/self.toLoadCount)*100);
                if(self.pre) {
                    self.pre.css('width', 100 - percent + '%');
                    self.pre.css('left', percent + '%');
                }
                if(self.progressIndicator && self.progressIndicator.visible){
                    self.progressIndicator.progress.css('width', percent + '%');
                }

                 if(self.loadedCount >= self.toLoadCount) {
                    self._loaded = true;
                    if(self.pre) {
                        self.pre.remove();
                    }
                    if (self.options.play.onLoad) {
                        self.playRepeat(self.options.play.repeat);
                    }
                    self._loading = false;
                    if(self.progressIndicator) {
                        self.progressIndicator.visible = false;
                        self.progressIndicator.remove();
                    }

                    self._track('preloaded');
                }

            }

            if(index){
                this.first = true;
                this.toLoadCount -= 1;
                this._callImageMethod($(this.imgs[index - 1]), onLoad)
            }else{
                this._callImageMethod(this.imgs, onLoad)
            }

        },
        _callImageMethod: function(imgs, onLoad) {
            for(var m = 0, len = imgs.length; m < len; m++) {
                var child = $(imgs[m]),
                    components = child.data();

                if(components['amp-ampZoom']){
                    child.ampZoom({'loaded':onLoad});
                    child.ampZoom('load', this.options.preload);
                }else{
                    child.ampImage({'loaded':onLoad});
                    child.ampImage('load', this.options.preload);
                }
            }
        },
        preload:function() {
            this._startPreload();
        },
        playRepeat:function(num) {
            if(num=='inf'){
                this.play();
                return;
            }
            var self = this,
                totalPlayTime = num * this.options.delay * this._count;

            for(var i=0; i<num; i++) {
                for (var x=0; x<this.count;x++) {
                    setTimeout(function(){
                        self.next();
                    },this.options.delay*((i*this.count)+x));
                }

            }
        },
        _startDrag: function(e) {
            var self = this,
                coords = this._resolveEventCoords(e),
                o = $(e.currentTarget).offset(),
                mx = coords.x - o.left,
                my = coords.y - o.top;
            
            if(this._started) {
                return;
            }
            
            if(this.options.gesture.enabled) {
                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ) {
                    if (e.originalEvent.touches.length!=this.options.gesture.fingers)
                        return true;
                }
            }

            this._started = true;

            this._track("startMove",{'domEvent':e,pos:{x:mx,y:my}});
            this._ended = false;
            this.pause();

            this._setCursor(this.options.cursor.active);
            this.element.removeClass(this.options.states.inactive).addClass(this.options.states.active);

            var m = this._mbind =function(i) {
                return function(e){
                    return self._mouseMove(e,o,mx,my,i);
                }
            }(this._index);
            var u = this._ubind = function(i){
                return function(e){
                    return self._endDrag(e,o,mx,my,i);
                }
            }(this._index);
            this.$document.on(this.options.events.move, m);
            this.$document.on(this.options.events.end,u);

            this._mouseMoveInfo = [{e:e,o:o,mx:mx,my:my,sindex:this._index}];
            if(window.navigator.userAgent.indexOf("MSIE ")>0){
                return false;
            }
            this.element.find('.amp-spin').each(function(i, element){
                var childSpin = $(element).data()['ampAmpSpin'];
                if(childSpin && childSpin._startDrag){
                    childSpin._startDrag(e);
                }
            })
        },
        _mouseMove: function(e,o,sx,sy,sindex) {

            if(this.options.gesture.enabled) {
                if(e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0] ) {
                    if (e.originalEvent.touches.length!=this.options.gesture.fingers)
                        return true;
                }
            }
            var coords = this._resolveEventCoords(e),
                v= 0,
                mx = coords.x- o.left,
                my = coords.y - o.top,
                dx = mx-sx,
                dy = my-sy,
                m = this._mouseMoveInfo,
                mm = {e:e,mx:mx,my:my};

            if(!this.moveDir) {
                if(Math.abs(dx)< Math.abs(dy)) {
                    this.moveDir = 'vert';
                } else if (Math.abs(dx)> Math.abs(dy)){
                    this.moveDir = 'horz';
                } else {
                    this.moveDir = this.options.orientation;
                }
            }
            if(this.options.orientation != this.moveDir){
                return true;
            }
            this._mouseMoveInfo.push(mm);
            if (this._mouseMoveInfo.length > 2) {
                this._mouseMoveInfo.shift();
            }
            this._moveSpin(this.options.orientation == 'horz' ? dx : dy,e,sindex);

            if(this.options.orientation == this.moveDir){
                return false;
                e.preventDefault();
            }
        },

        _moveSpin : function(distance,e,sindex) {
            var index = Math.round((distance/this.options.dragDistance)* (this._count-1));
            if(this.options.dir=='normal') {
                index = 0-index;
            }
            this._track("move",{domEvent:e,distFromStart:distance});
            var toIndex = this._numToIndex(index+sindex);
            if(toIndex!=this._index) {
                this._checkLoop(toIndex);
                this.goTo(toIndex);
            }
        },

        _checkLoop:function(toIndex) {
            if(Math.abs(this._index-toIndex)>2) {
                if(this._index>toIndex) {
                    this._track("looped","forwards");
                } else {
                    this._track("looped","backwards");
                }
            }
        },

        _endDrag: function(e,o,sx,sy,sindex) {
            if(this.moveDir == 'horz'){
                e.preventDefault();
                e.stopPropagation();
            }
            this.moveDir = null;
            var self = this;
            if(this._ended) {
                return;
            }
            this._started = false;
            this._ended = true;

            this._track("endMove",{'domEvent': e});
            this.$document.off(this.options.events.end,this._ubind);
            this.$document.off(this.options.events.move,this._mbind);
            clearInterval(this._timer);

            this._setCursor(this.options.cursor.inactive);
            this.element.removeClass(this.options.states.active).addClass(this.options.states.inactive);

            if(this.options.momentum && this._mouseMoveInfo.length==2) {
                var m = this._mouseMoveInfo,
                    time = m[1].e.timeStamp - m[0].e.timeStamp,
                    distance = this.options.orientation == 'horz' ? m[1].mx -  m[0].mx : m[1].my -  m[0].my;
                // we can't have inf speed or zero speed
                if(distance==0||time==0)
                    return;
                var speed = distance/time,
                    travelSpeed = speed,
                    fiction = this.options.friction,
                    totalDistance = this.options.orientation == 'horz' ? m[1].mx -  sx : m[1].my -  sy,
                    travelDistance = 0,
                    travelTime = 0,
                    timeInterval = 10; // time interval in ms
                // Meeting the min distance requirement
                if(Math.abs(totalDistance)<this.options.minDistance)
                    return;
                // every 10ms the speed reduces by the friction percentage
                while(Math.abs(travelSpeed)>0.1) {
                    travelSpeed*=fiction;
                    travelDistance += travelSpeed*timeInterval;
                    travelTime+=timeInterval;
                    setTimeout((function(td){
                        return function() {
                            self._moveSpin(td+totalDistance,e,sindex);
                        }
                    })(travelDistance),travelTime)
                }
                return;
            }
        },
        _calcSize: function() {
            this._super();

            if(this.progressIndicator && this.progressIndicator.visible){
                // position centrally
                this.progressIndicator.css('top', (parseInt($(this.element.find('li')[0]).css('height')) - parseInt(this.progressIndicator.css('height'))) / 2 + 'px');
                this.progressIndicator.css('left',(parseInt($(this.element.find('li')[0]).css('width')) - parseInt(this.progressIndicator.css('width'))) / 2 + 'px');
            }
        },
        _getIndex : function(_index) {
            var children = this.element.children();
            if(_index > children.length){
                if(!this.options.loop)
                    return;
                _index = 1;
            } else if(_index<1) {
                if(!this.options.loop)
                    return;
                _index = children.length;
            }
        },
        _direction : function(index) {
            var forw=0, back=0;
            var oIndex = index;
            while(oIndex!=this._index) {
                if(oIndex>this._count){
                    oIndex = 0;
                } else {
                    oIndex++;
                }
                forw++
            }
            oIndex = index;
            while(oIndex!=this._index) {
                if(oIndex<1) {
                    oIndex = this._count;
                } else {
                    oIndex--;
                }
                back++;
            }
            if (back<forw) {
                return true;
            } else {
                return false;
            }
        },
        _loopIndex : function(dir,start,count) {
            var inc = dir ? 1 : -1;
            var curr = start;
            for (var i= 0;i<count;i++) {

                if(curr+inc>this._count){
                    curr = 1;
                } else if(curr+inc<1) {
                    curr = this._count
                } else {
                    curr = curr + inc;
                }

            }
            return curr;
        },
        _loopCount : function(dir,start,target) {
            var inc = dir ? 1 : -1;
            var curr = start;
            var count = 0;
            while(curr != target) {
                count++;
                if(curr+inc>this._count){
                    curr = 1;
                } else if(curr+inc<1) {
                    curr = this._count
                } else {
                    curr = curr + inc;
                }
            }
            return count;
        },

        _animate : function(_index){
            var items = this.element,
                currItem  = items.children('li').eq(this._index - 1),
                nextItem = items.children('li').eq(_index - 1);
            if(this._index == _index){
                return;
            }
            nextItem.addClass(this.options.states.selected + ' ' +this.options.states.seen);
            nextItem.css('display','block');
            currItem.removeClass(this.options.states.selected);
            currItem.css('display','none');
            this._setIndex(_index);

        },
        _track: function(event,value) {
            this._trigger( event, null, value );
            if(window.amp && amp.stats && amp.stats.event){
                amp.stats.event(this.element,'spin',event,value);
            }
        },
        _destroy: function() {
            this.element.removeClass('amp');
            this.element.removeClass('amp-spin');
            this.element.removeClass(this.options.states.active);
            this.element.removeClass(this.options.states.inactive);
            this.element.css('cursor','');
            this.element.find('.amp-progress').remove();
            this.element.find('.amp-loading').remove();
            this._removeEmptyAttributeHelper(this.element);
            var children = this.element.children();
            children.removeClass('amp-frame');
            children.removeClass(this.options.states.selected);
            children.removeClass(this.options.states.seen);
            children.css('display','');
            for (var i=0,len=children.length;i<len;i++ ) {
                this._removeEmptyAttributeHelper($(children[i]));
            }
            var imgs = children.find('img');
            imgs.removeClass('amp amp-main-img, amp-image');
            imgs.css('display','');
            for (var i= 0,len=imgs.length;i<len;i++ ) {
                this._removeEmptyAttributeHelper($(imgs[i]));
            }
        }

    });


}( jQuery ));
// Resolution switching support for videojs
//
// In this plugin I'm really going out of my way to *not* override the
// core videojs namespace and to *not* change the core API.  As a
// result this plugin is not as efficient as it might be.  It
// initializes itself *for each player* as scoped variables inside the
// plugin closure and grafts itself on to *the instance on which it was
// called* rather than on the videojs player prototype.  I don't expect
// this to be a big deal for anybody.
if(typeof videojs != 'undefined') {
videojs.plugin('resolutions', function(options) {
    var player = this;
    if(typeof vjs == 'undefined') {
        return;
    }
    // 'reduce' utility method
    // @param {Array} array to iterate over
    // @param {Function} iterator function for collector
    // @param {Array|Object|Number|String} initial collector
    // @return collector
    vjs.reduce = function(arr, fn, init, n) {
        if (!arr || arr.length === 0) { return; }
        for (var i=0,j=arr.length; i<j; i++) {
            init = fn.call(arr, init, arr[i], i);
        }
        return init;
    };

    this.resolutions_ = {
        options_: {},

        // takes an existing stream and stops the download entirely
        // without killing the player or disposing of the tech
        stopStream: function(){
            switch(player.techName){
                case "Html5":
                    break;
                case "Flash":
                    player.tech.el_.vjs_stop();
                    break;
            }

            // this may cause flash or the native player to emit errors but
            // they are harmless
            player.src("");
        },

        // it is necessary to remove the sources from the DOM after
        // parsing them because otherwise the native player may be
        // inclined to stream both sources
        removeSources: function(el){
            var videoEl = player.el_.getElementsByTagName("video")[0];

            if (player.techName !== "Html5" || !videoEl) return;

            var srcs = videoEl.getElementsByTagName("source");
            for(var i=0;i<srcs.length;i++){
                videoEl.removeChild(srcs[i]);
            }
        },

        // buckets all parsed sources by their type ("video/mp4", for example)
        // @param {Array} array of sources:
        // [
        //   {
        //     "data-res": "HD",
        //     "type": "video/mp4",
        //     "src": "http://some_video_url_hd"
        //   },
        //   {
        //     "data-default": "true",
        //     "data-res": "SD",
        //     "type": "video/mp4",
        //     "src": "http://some_video_url_sd"
        //   },
        //   {
        //     "data-default": "true",
        //     "data-res": "SD",
        //     "type": "video/ogv",
        //     "src": "http://some_video_url_sd"
        //   }
        // ]
        // @return sources grouped by type:
        // {
        //   "video/mp4": [
        //       {
        //           "data-res": "HD",
        //           "type": "video/mp4",
        //           "src": "http://some_video_url_hd"
        //       },
        //       {
        //           "data-default": "true",
        //           "data-res": "SD",
        //           "type": "video/mp4",
        //           "src": "http://some_video_url_sd"
        //       }
        //   ]
        //   "video/ogv": [
        //       {
        //           "data-res": "SD",
        //           "type": "video/ogv",
        //           "src": "http://some_video_url_sd"
        //       }
        //   ]
        // }
        bucketByTypes: function(sources){
            return vjs.reduce(sources, function(init, val, i){
                (init[val.type] = init[val.type] || []).push(val);
                return init;
            }, {}, player);
        },

        // takes parsed sources and selects the most appropriate source
        // taking into account resolution, technology support, and the
        // user's previous selections.  also indexes the sources
        // @param {Array} array of sources:
        // [
        //   {
        //     "data-res": "HD",
        //     "type": "video/mp4",
        //     "src": "http://some_video_url_hd"
        //   },
        //   {
        //     "data-default": "true",
        //     "data-res": "SD",
        //     "type": "video/mp4",
        //     "src": "http://some_video_url_sd"
        //   },
        //   {
        //     "data-default": "true",
        //     "data-res": "SD",
        //     "type": "video/ogv",
        //     "src": "http://some_video_url_sd"
        //   }
        // ]
        // @return {Object} single source:
        // {
        //  "data-res": "HD",
        //  "type": "video/mp4",
        //  "src": "http://some_video_url_jd",
        //  "index": 0
        // }
        selectSource: function(sources){
            this.removeSources();

            var sourcesByType = this.bucketByTypes(sources);
            var typeAndTech   = this.selectTypeAndTech(sources);

            if (!typeAndTech) return false;

            // even though we choose the best resolution for the user here, we
            // should remember the resolutions so that we can potentially
            // change resolution later
            this.options_['sourceResolutions'] = sourcesByType[typeAndTech.type];

            return this.selectResolution(this.options_['sourceResolutions']);
        },

        // takes parsed sources and returns the most appropriate
        // technology and video type
        // @param {Array} array of sources:
        // [
        //   {
        //     "data-res": "HD",
        //     "type": "video/mp4",
        //     "src": "http://some_video_url_hd"
        //   },
        //   {
        //     "data-default": "true",
        //     "data-res": "SD",
        //     "type": "video/mp4",
        //     "src": "http://some_video_url_sd"
        //   },
        //   {
        //     "data-default": "true",
        //     "data-res": "SD",
        //     "type": "video/ogv",
        //     "src": "http://some_video_url_sd"
        //   }
        // ]
        // @return {Object} type/tech:
        // {
        //  "type": "video/ogv",
        //  "tech": "Html5"
        // }
        selectTypeAndTech: function(sources) {
            var techName;
            var tech;

            for (var i=0,j=player.options_['techOrder'];i<j.length;i++) {
                techName = videojs.capitalize(j[i]);
                tech     = window['videojs'][techName];

                // Check if the browser supports this technology
                if (tech.isSupported()) {
                    // Loop through each source object
                    for (var a=0,b=sources;a<b.length;a++) {
                        var source = b[a];
                        // Check if source can be played with this technology
                        if (tech['canPlaySource'](source)) {
                            return { type: source.type, tech: techName };
                        }
                    }
                }
            }
        },

        // takes an array of sources of homogeneous type (ie. a complete
        // "bucket" from the output of bucketByTypes) and returns the best
        // source, taking into account the user's previous preferences
        // stored in local storage
        // @param {Array} homogeneous sources:
        // [
        //   {
        //       "data-res": "HD",
        //       "type": "video/mp4",
        //       "src": "http://some_video_url_hd"
        //   },
        //   {
        //       "data-default": "true",
        //       "data-res": "SD",
        //       "type": "video/mp4",
        //       "src": "http://some_video_url_sd"
        //   }
        // ]
        // @return {Object} singular best source:
        // {
        //     "data-default": "true",
        //     "data-res": "SD",
        //     "type": "video/mp4",
        //     "src": "http://some_video_url_sd"
        //     "index": 1
        // }
        selectResolution: function(typeSources) {
            var defaultRes = 0;
            var supportsLocalStorage = !!window.localStorage;

            // check to see if any sources are marked as default
            videojs.obj.each(typeSources, function(i, s){
                // add the index here so we can reference it later
                s.index = parseInt(i, 10);

                if (s['data-default']) defaultRes = s.index;
            }, player);

            // if the user has previously selected a preference, check if
            // that preference is available. if not, use the source marked
            // default
            var preferredRes = defaultRes;

            // trying to follow the videojs code conventions of if statements
            if (supportsLocalStorage){
                var storedRes = parseInt(window.localStorage.getItem('videojs_preferred_res'), 10);

                if (!isNaN(storedRes))
                    preferredRes = storedRes;
            }

            var maxRes    = (typeSources.length - 1);
            var actualRes = preferredRes > maxRes ? maxRes : preferredRes;

            return typeSources[actualRes];
        }
    };

    // convenience method
    // @return {String} cached resolution label:
    // "SD"
    player.resolution = function(){
        return this.cache_.src.res;
    };

    // takes a source and switches the player's stream to it on the fly
    // @param {Object} singular source:
    // {
    //     "data-default": "true",
    //    "data-res": "SD",
    //     "type": "video/mp4",
    //     "src": "http://some_video_url_sd"
    // }
    player.changeResolution = function(new_source){
        // has the exact same source been chosen?
        if (this.cache_.src === new_source.src){
            this.trigger('resolutionchange');
            return this; // basically a no-op
        }

        // remember our position and playback state
        var curTime      = this.currentTime();
        var remainPaused = this.paused();

        // pause playback
        this.pause();

        // attempts to stop the download of the existing video
        this.resolutions_.stopStream();

        // HTML5 tends to not recover from reloading the tech but it can
        // generally handle changing src.  Flash generally cannot handle
        // changing src but can reload its tech.
        if (this.techName === "Html5"){
            this.src(new_source.src);
        } else {
            this.loadTech(this.techName, {src: new_source.src});
        }

        // when the technology is re-started, kick off the new stream
        this.ready(function() {
            this.one('loadeddata', vjs.bind(this, function() {
                this.currentTime(curTime);
            }));

            this.trigger('resolutionchange');

            if (!remainPaused) {
                this.load();
                this.play();
            }

            // remember this selection
            vjs.setLocalStorage('videojs_preferred_res', parseInt(new_source.index, 10));
        });
    };

    /* Resolution Menu Items
     ================================================================================ */
    var ResolutionMenuItem = videojs.MenuItem.extend({
        init: function(player, options){
            // Modify options for parent MenuItem class's init.
            options['label'] = options.source['data-res'];
            videojs.MenuItem.call(this, player, options);

            this.source = options.source;
            this.resolution = options.source['data-res'];

            this.player_.one('loadstart', vjs.bind(this, this.update));
            this.player_.on('resolutionchange', vjs.bind(this, this.update));
        }
    });

    ResolutionMenuItem.prototype.onClick = function(){
        videojs.MenuItem.prototype.onClick.call(this);
        this.player_.changeResolution(this.source);
    };

    ResolutionMenuItem.prototype.update = function(){
        var player = this.player_;
        if ((player.cache_['src'] === this.source.src)) {
            this.selected(true);
        } else {
            this.selected(false);
        }
    };

    /* Resolutions Button
     ================================================================================ */
    var ResolutionButton = videojs.MenuButton.extend({
        init: function(player, options) {
            videojs.MenuButton.call(this, player, options);

            if (this.items.length <= 1) {
                this.hide();
            }
        }
    });

    ResolutionButton.prototype.sourceResolutions_;

    ResolutionButton.prototype.sourceResolutions = function() {
        return this.sourceResolutions_;
    };

    ResolutionButton.prototype.onClick = function(e){
        // Only proceed if the target of the click was a DIV (just the button and its inner div, not the menu)
        // This prevents the menu from opening and closing when one of the menu items is clicked.
        if (e.target.className.match(/vjs-control-content/)) {

            // Toggle the 'touched' class
            this[this.el_.className.match(/touched/) ? "removeClass" : "addClass"]("touched");
        } else {

            // Remove the 'touched' class from all control bar buttons with menus to hide any already visible...
            var buttons = $('.vjs-menu-button');
            for(var i=0;i<buttons.length;i++){
                videojs.removeClass(buttons[i], 'touched');
            }

            this.removeClass('touched');
        }
    };

    ResolutionButton.prototype.createItems = function(){
        var resolutions = this.sourceResolutions_ = this.player_.resolutions_.options_['sourceResolutions'];
        var items = [];
        for (var i = 0; i < resolutions.length; i++) {
            items.push(new ResolutionMenuItem(this.player_, {
                'source': this.sourceResolutions_[i]
            }));
        }
        return items;
    };

    /**
     * @constructor
     */
    var ResolutionsButton = ResolutionButton.extend({
        /** @constructor */
        init: function(player, options, ready){
            ResolutionButton.call(this, player, options, ready);
            this.el_.setAttribute('aria-label','Resolutions Menu');
            this.el_.setAttribute('id',"vjs-resolutions-button");
        }
    });

    ResolutionsButton.prototype.kind_ = 'resolutions';
    ResolutionsButton.prototype.buttonText = 'Resolutions';
    ResolutionsButton.prototype.className = 'vjs-resolutions-button';

    // Add Button to controlBar
    videojs.obj.merge(player.controlBar.options_['children'], {
        'resolutionsButton': {}
    });

    // let's get the party started!
    // we have to grab the parsed sources and select the source with our
    // resolution-aware source selector
    var source = player.resolutions_.selectSource(player.options_['sources']);

    // when the player is ready, add the resolution button to the control bar
    player.ready(function(){
        player.changeResolution(source);
        var button = new ResolutionsButton(player);
        player.controlBar.addChild(button);
        delete player.controlBar.options_['children'].resolutionsButton
    });
});
}

