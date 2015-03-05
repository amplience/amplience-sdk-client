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