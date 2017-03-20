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
            scaleProcess: false,
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
                    this._touchmove = false;
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
                    this_touchmove = false;
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

            if (visible) {
                if(this.options.preload=='visible') {
                    this.load();
                }
            } else {
                this.zoomOutFull();
            }

            this._track('visible',{'visible':visible});
            this._visible = visible;
        },
        load:function(){
            this._setupZoomArea().then($.proxy(function(area){
                this.zoomArea.allowClone = true;
                area.setScale(this.options.zoom);
            },this))
        },
        _setupZoomArea: function(){
            return new Promise($.proxy(function(resolve, reject) {
                if (!this.zoomArea) {
                    this.getImageSize().then($.proxy(function (size) {
                        if (!size.error) {
                            var self = this;
                            var img = new Image();
                            img.src = this.element.attr('src');
                            var $loading = $('<div class="amp-loading"></div>');
                            this.$parent.append($loading);
                            this.zoomArea = new zoomArea(this.element, this.$parent, size, this.options.transforms, this.options);

                            img.onload = function(){
                                $loading.remove();
                                resolve(self.zoomArea);
                            }
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

        state: function() {
            return {
                scale: this.scale,
                scaleMax:this.options.scaleMax,
                scaleStep:this.options.scaleStep
            };
        },

        zoomInFull:function(e) {
            this.setScale(this.options.scaleMax);
            this._track('zoomedInFull',{domEvent:e,scale:this.options.scaleMax,scaleMax:this.options.scaleMax,scaleStep:this.options.scaleStep});
        },

        zoomIn: function (e) {
            var self = this;
            if (!self.zoomArea) {
                self._setupZoomArea().then(function(area){
                    if(!area){
                        return;
                    }
                    self.zoomIn(e);
                });
                return false;
            }
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

            if (self.zoomArea && self.zoomArea.animating) {
                return;
            }

            if(this.scale == this.options.scaleMax) {
                if (this.options.events.zoomIn) {
                    self.zoomArea.$container.off(this.options.events.zoomIn,this.zoomIn);
                    self.isZoomIn = false;
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
            this.setScale(this.scale).then(function(){
                // need to take these outside of execution because if we have the same event for zoomIn and zoomOut both would trigger due to bubbling
                setTimeout($.proxy(function(){
                    if (!self.isMoveOn  && self.options.events.move) {
                        self.zoomArea.$container.on(this.options.events.move, $.proxy(self._setPos,self));
                        self.isMoveOn = true;
                    }
                    if (self.options.scaleProcess) {
                        if(!self.options.scaleSteps || self.scale == self.options.scaleMax) {
                            self.zoomArea.$container.on(self.options.events.zoomOut, $.proxy(self.zoomOut, self));
                        } else {
                            if (!self.isZoomIn) {
                                self.zoomArea.$container.on(this.options.events.zoomIn,$.proxy(self.zoomIn,self));
                                self.isZoomIn = true;
                            }
                        }
                    } else {
                        if(!self.options.scaleSteps) { // put inside the if as if we use steps we don't want it to zoom out (mostly for spin)
                            self.zoomArea.$container.on(self.options.events.zoomOut, $.proxy(self.zoomOut, self));
                        }
                    }

                },self),500);
            });

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
                self.zoomArea.$container.on(this.options.events.move, $.proxy(this._setPos,this));
            },this),1);
        },

        setScale : function(s) {
            this.scale = s;
            return this._setupZoomArea().then($.proxy(function(area){
                if(!area){
                    return;
                }
                area.setScale(this.scale);
                this._invalidateParentSize();
//                this._setPos(e);

            },this));
        },
        _setPos : function(e){
            if(e.type === 'touchmove'){
                this._touchmove = true;
            }
            this._track('settingPos',{domEvent:e});
            var pos = e?this._getPercentagePos(e):{x:0.5,y:0.5};
            this.zoomArea.setPosition(pos.x,pos.y)
        },
        zoomOut:function(e) {
            this.zoomArea.allowClone = false;
            if(this._touchmove) {
                return false;
            }

            if (this.zoomArea && this.zoomArea.animating) {
                return;
            }

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
                if (this.options.events.move) {
                    this.zoomArea.$container.off(this.options.events.move, this._setPos);
                    this.isMoveOn = false;
                }

                if (this.options.events.zoomOut) {
                    this.zoomArea.$container.off(this.options.events.zoomOut,this.zoomOut);
                }
            }

            this.zoomArea.setScale(this.scale);
            this._track('zoomedOut',{domEvent:e,scale:this.scale,scaleMax:this.options.scaleMax,scaleStep:this.options.scaleStep});
        },

        zoomOutFull:function(e) {
            if (!this.zoomArea) {
                return;
            }
            if (this.options.events.move) {
                self.zoomArea.$container.off(this.options.events.move, this._setPos);
            }

            if (this.options.events.zoomOut) {
                self.zoomArea.$container.off(this.options.events.zoomOut,this.zoomOut);
            }

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
        if(!this.zoomArea.newSize){
            this.zoomArea.newSize = {'x':this.zoomArea.$source.width(), 'y':this.zoomArea.$source.height()};
        }
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


    var zoomArea = function($source,$area,originalSize,transforms, options) {
        this.options = options;
        this.animating = false;
        this._allowChangeClone = true;
        this.isFF = navigator.userAgent.toLowerCase().search("firefox") > -1;
        this.transforms = transforms;
        this.initialSrc = $source[0].src;
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
        var self = this;
        this.$container = $('<div class="amp-zoomed-container"></div>');
        this.$preloader = new Image();
        $(this.$preloader).on('load', function(){
            //Assign preloader loaded Boolean to true
            self._preloaderImgLoaded = true;
            if (self.allowClone && !self.animating) {
                self.updateImageSrc(true);
            }
        });
        this.$zoomed = $('<img class="amp-zoomed" style="z-index:2;" src=""/>');
        this.$zoomedClone = $('<img class="amp-zoomed-clone" style="z-index:2;" src=""/>');
        this.$container.append(this.$zoomedClone);
        this.$container.append(this.$zoomed);
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
        this.$zoomedClone.css('left',(0-((this.$zoomed.width()-this.$area.width())*x))+'px');
        this.$zoomedClone.css('top',(0-((this.$zoomed.height()-this.$area.height())*y))+'px');
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

        var animConfig = {'width':size.x,'height':size.y,'left':pos.x+'px','top':pos.y+'px'};

        this.$zoomed.animate(animConfig, 500);
        this.$zoomedClone.animate(animConfig, 500);

        setTimeout($.proxy(function(){
            if (cb) {
                cb();
            }
            this.animating = false;
        },this),this.isFF ? 1000 : 600);
    };

    zoomArea.prototype.updateImageSrc = function(scaleIncreased){
        var self = this;
        if(!scaleIncreased || !self.allowClone || !self._preloaderImgLoaded){
            return false;
        }
        self.setImage();

    };

    zoomArea.prototype.setScale = function(scale,cb){
        var self = this;
        var scaleIncreased = scale > this.scale;
        if(scale == this.scale) {
            return;
        }

        if(!scaleIncreased){
            this.allowClone = false;
        }
        else{
            this.allowClone = true;
        }

        self._preloaderImgLoaded = false;

        if((scale < this.scale) && scale == 1) {
            this.newSize = {'x':this.$source.width(), 'y':this.$source.height()};
        } else {
            this.newSize = {'x':this.$source.width()*scale, 'y':this.$source.height()*scale};
        }
        if (this.scale==1) {
            this.$zoomed.attr('src',this.$source[0].src);
            if(scale > this.scale) {
                this.$zoomed.width(this.$source.width());
                this.$zoomed.height(this.$source.height());
                this.$zoomedClone.width(this.$source.width());
                this.$zoomedClone.height(this.$source.height());
            }
            this.setPosition(0.5,0.5);
            this.show();
        }
        if(scale==1){
            this.animate(this.newSize,this.getPixPos(), function(){
                self.hide();
                self.updateImageSrc(false);
            });
        } else {
            this.animate(this.newSize, this.getPixPos(), function(){
                self.updateImageSrc(scaleIncreased);
            });
        }
        this.scale = scale;
        this.invalidateImageURL({'x':this.originalSize.x*scale, 'y':this.originalSize.y*scale});
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

    zoomArea.prototype.invalidateImageURL = function(size) {
        var self = this;
        var templateQueryParam = '';

        if (this.transforms && this.transforms.length) {
            templateQueryParam = this.transforms + '&';
        }

        var src = this.initialSrc.split('?')[0] + '?' + templateQueryParam + 'w=' + size.x + '&h=' +size.y;

        if(size.x == 0 || size.y ==0) {
            src='';
        }
        self.$preloader = new Image();
        self._preloaderImgLoaded = true;
        self.$preloader.setAttribute('src', src);

    };
    zoomArea.prototype.setImage = function() {
        var self = this;
        var loaded;
        var previousSrc = self.$zoomed.attr('src');

        if(self._allowChangeClone){
            self.$zoomedClone.attr('src', previousSrc);
        }

        if(self.$preloader.complete && self.$preloader.naturalWidth && self.$preloader.naturalWidth > 0){
            if(loaded){
                return;
            }

            setTimeout(function(){
                self.$zoomed.attr('src', self.$preloader.src);
            }, self.isFF ? 1000 : 10);
            loaded = true;
        }

        else{
            self.$preloader.onload = function(){
                if(loaded){
                    return;
                }
                self.$zoomed.attr('src', self.$preloader.src);
                loaded = true;
            };
        }

        self._allowChangeClone = false;
    };


}(jQuery));
