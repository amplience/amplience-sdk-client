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
            thumbWidthExceed:0,
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
            },
            animationStartCallback: function(){},
            animationEndCallback: function(){}
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
            this._movedCounter = 0;
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
                    var move = function(evt) {
                        self._movedCounter +=1;
                        if(self._movedCounter >= 7){
                            self.moved = true;
                        }
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
                var num = this._visible + (this._index - 1);
                var index = this._loopIndex(true,num,1);
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

            self.options.animationStartCallback();

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
                    self.options.animationEndCallback();
                });
            } else {
                var anim = {};
                if(self.options.dir=='horz'){
                    anim.left = howMuch+'px';
                } else {
                    anim.top = howMuch+'px';
                }
                $container.animate(anim, self.options.animDuration,'swing',function(){
                    if(onDone)
                        onDone();
                    self.options.animationEndCallback();
                });
            }

        },
        _measureElement : function (index) {
            var size,
                horz = this.options.dir == 'horz',
                elm = this._children.eq(index),
                clientHeight = elm[0].getBoundingClientRect().height;

            elm.css('display','block');
            if(horz) {
                size = elm.outerWidth(true);
            } else {
                size = elm.outerHeight(true);
                if(clientHeight && (size - clientHeight <= 1)){
                    size = clientHeight;
                }
                if(!clientHeight){
                    size = elm.outerHeight(true) - 1;
                }
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
            return this.options.loop || (this._canNext && this._index + this._visible <= this.count);
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
                else{
                    widget._children.on('mousedown', $.proxy(this.start,this));
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
                $(window).on('mouseup',$.proxy(this.stop,this));
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
                widget._movedCounter = 0;
                $(window).off('touchmove',$.proxy(this.move,this));
                $(window).off('touchcancel',$.proxy(this.stop,this));
                $(window).off('touchend',$.proxy(this.stop,this));
                $(window).off('mouseup',$.proxy(this.stop,this));
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
                    this.focusLoop(_index, false);
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
                    var bounds = parseFloat(widget._children.eq(i).css('margin-right')) * 2;

                    if (pos >= target && (pos + elmSize - widget.options.thumbWidthExceed - bounds - target) <= widget._elmSize()) {
                        widget._setState(elm, 'visible');
                        visible++;
                    } else if ((pos + elmSize - bounds > target && (pos + elmSize - bounds - target) < widget._elmSize()) || (pos > target && (pos - target) < widget._elmSize())) {
                        widget._setState(elm, 'partial');
                    } else {
                        widget._setState(elm, 'invisible');
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

                this.setVisibleStates(_index,target);

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
                    var borderW = elm.css('box-sizing') == 'border-box' ? elm.css('borderBottomWidth')
                    + elm.css('borderTopWidth') : 0;
                    var borderH = borderW ? elm.css('borderLeftWidth') + elm.css('borderRightWidth') : 0;
                    clone.css({
                        width: elm.width() + borderW,
                        height: elm.height() + borderH
                    });

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