(function(){
/**
 * Creates a url to an asset
 * @method getAssetURL
 * @param {Object} asset to build the url for format {'name':'asset','type':'i'}
 */
amp.getAssetURL = function (asset) {
    return amp.conf.di_basepath + asset.type + '/' + amp.conf.client_id + '/' + asset.name;
};

var videoAssetsNeeded = function(o) {
    var arr = [];
    if(o.items || (o.set && o.set.items)) {
        var items = o.items || o.set.items;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if(item.type == "video"){
                arr.push({name:item.name,type:'v'});
            } else {
                if(item.items || (item.set && item.set.items)){
                    arr = arr.concat(videoAssetsNeeded(item));
                }
            }
        }
    }
    return arr;
};

var getVidsNotLoaded = function(toload,loaded) {
    var notLoaded = [];
    for (var i =0; i<toload.length;i++) {
        var item = toload[i];
        var found = false;
        for (var m=0;m<loaded.length;m++){
            var l = loaded[m];
            if(l.name === item.name && l.type === item.type) {
                found = true;
                break;
            }
        }
        if(!found) {
            notLoaded.push(item);
        }
    }
    return notLoaded;
};
var copyObj = function(a,b,exclude) {
    for (var i in b) {
        if(b.hasOwnProperty(i)){
            if(indexOf(exclude, i)!=-1)
                continue;
            a[i] = b[i];
        }
    }
    return a;
};

var setMediaCodec = function(data) {
    for(var i in data) {
        if(data.hasOwnProperty(i)){
            var v = data[i];
            for(var m =0; m<v.media.length; m++) {
                v.media[m].htmlCodec = amp.videoToFormat(v.media[m]);
            }
        }

    }
    return data;
};

var orderVideoSources = function(data,order) {
    for(var i in data) {
        if(data.hasOwnProperty(i)){
            var v = data[i];
            v.media = amp.sortVideoSource(v.media,order);
        }

    }
    return data;
};

var combineData = function(vData,data) {
    for(var i in vData) {
        if(vData.hasOwnProperty(i)){
            var v = vData[i];
            var recurse = function(o,v){
                if(o.items || (o.set && o.set.items)){
                    var items = o.items || o.set.items;
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        if(item.type == "video" && item.name == v.name){
                            item = copyObj(item, v, ['url']);
                        } else {
                            if(item.items || (item.set && item.set.items)){
                                item = recurse(item,v);
                            }
                        }
                    }
                }
                return o;
            }
        }
        data = recurse(data,v);
    }
    return data;
};
var removeData = function(vData,data) {
    for(var i in vData) {
        if(vData.hasOwnProperty(i)){
            var v = vData[i];
            var recurse = function(o,v){
                if(o.items || (o.set && o.set.items)){
                    var items = o.items || o.set.items;
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        if(item.type == "video"){
                            items.splice(i, 1);
                        } else {
                            if(item.items || (item.set && item.set.items)){
                                item = recurse(item,v);
                            }
                        }
                    }
                }
                return o;
            }
        }
        data = recurse(data,v);
    }
    return data;
};
function objLength(obj) {
    var count = 0;
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }
    return count;
}
/**
 * Retrieves DI Data through JSONP
 * @method get
 * @param {Object} assets to load in the format {'name':'asset','type':'i'}
 * @param {Function} success Callback function called on successful load
 * @param {Function} error Callback function called on unsuccessful load
 */
amp.get = function (assets, success, error, videoSort) {
    var assCount = 0, failed = true, dataWin = {}, dataFail = {}, assLength = 0;

    var win = function(url){
        return function (name,data) {
            var vidAssets = videoAssetsNeeded(data);
            var notLoaded = getVidsNotLoaded(vidAssets,assets);
            var allLoaded = function() {
                assCount++;
                dataWin[name] = data;
                dataWin[name].url = url;
                dataWin[name].name = !dataWin[name].name ? name : dataWin[name].name;
                if(assCount == assLength) {
                    done();
                }
            };
            if(notLoaded.length){
                amp.get(notLoaded,function(vData) {
                    vData = setMediaCodec(vData);
                    if(videoSort) {
                        vData = orderVideoSources(vData,videoSort);
                    }
                    data = combineData(vData,data);
                    allLoaded();
                },function(vData) {
                    data = removeData(vData,data);
                    allLoaded();
                });
            } else { 
                if(data.media){
                    data = setMediaCodec({'d':data})['d'];
                    if(videoSort) {
                        data = orderVideoSources({'d':data},videoSort)['d'];
                    }
                }

                allLoaded();
            }
        }
    };
    var fail = function(url){
        return function (name,data) {
            assCount++;
            dataFail[name] = data;
            dataFail[name].url = url;
            failed = true;
            if(assCount == assLength) {
                done();
            }
        }
    };
    var done = function(){
        if(objLength(dataWin)>0 && success)
            success(dataWin);
        if(objLength(dataFail)>0 && error)
            error(dataFail);
    };

    var isValid = function(asset){
        if (!asset || !asset.type || !asset.name) {
            return false;
        } else {
            return true;
        }
    }

    if(!isArray(assets)){
        assLength = 1;
        if(!isValid(assets))
            return;
        var url = amp.getAssetURL(assets);
        jsonp(amp.getAssetURL(assets)+ '.js', assets.name, win(url), fail(url),assets.transform);
    }else{
        assLength = assets.length;
        for (var i = 0; i < assLength; i++) {
            if(!isValid(assets[i]))
                continue;
            var url = amp.getAssetURL(assets[i]);
            jsonp(url + '.js', assets[i].name, win(url), fail(url),assets.transform);
        }
    }
};

var movingCacheWindow = function () {
    var timestamp = new Date();
    timestamp -= timestamp % amp.conf.cache_window;
    return timestamp;
};

var clean = function(name){
    var script = cbScripts[name];
    if(script){
        script.dispose();
    }
    delete cbArray[name];
    delete cbTimeout[name];
    delete cbScripts[name];
};

var cbArray = [], cbScripts = [], cbTimeout = [];

/**
 * Cache for all successful JSONP calls
 *
 * @property jsonCache
 * @type {Object}
 * @default {}
 */
amp.jsonCache = {};

/**
 * Callback method for JSONP
 * @method jsonReturn
 * @param {String} name The name of the asset
 * @param {Object} data The returned JSON data
 */
amp.jsonReturn = function(name, data) {
    // do we have callbacks waiting for that name?
    if(!cbArray[name])
        return;
    // clear the timeout because we have answers!
    clearTimeout(cbTimeout[name]);
    // go through callbacks
    for (var i = 0; i < cbArray[name].length; i++) {
        var obj = cbArray[name][i];
        // success or error callback
        if(data.status == "error") {
            if(obj.fail) {
                obj.fail(name,data);
            }
        } else {
            // add it to the cache
            amp.jsonCache[name] = data;
            if(obj.win) {
                obj.win(name,data);
            }
        }
    }
    clean(name);
};

amp.get.createScript = function(src, onerror) {
    // lets create a home for our json
    var script = document.createElement('script');
    script.src = src;
    script.onerror= onerror;
    script.dispose = function(){
        document.body.removeChild(script);
    };

    // set the thing off:
    document.body.appendChild(script);
    return script;
};

/**
 * Clears the cache of JSONP responses
 */
amp.clearJsonCache = function(){
    amp.jsonCache = {};
}

var jsonp =  amp.jsonp = function(url, name, success, error, transform){

    if(!transform){
        transform = '';
    } else {
        transform = transform+'&'
    }
    // do we already have the data?
    if(amp.jsonCache[name]) {
        success(name, amp.jsonCache[name]);
        return;
    }
    // is the json in progress?
    if(cbArray[name]) {
        // if so add it to the pile and get out of here
        cbArray[name].push({'win':success,'fail':error});
        return;
    } else {
        // otherwise create the object
        cbArray[name] = [{'win':success,'fail':error}];
    }

    // waiting for fail
    cbTimeout[name] = setTimeout(function() {
        amp.jsonReturn(name,{ status:'error',code: 404, message: "Not Found", name: name });
    }, 10000);

    var src = url + "?" + transform + buildQueryString({deep:true, timestamp: movingCacheWindow(), arg: "'"+name+"'", func:"amp.jsonReturn"});
    var script = amp.get.createScript(src, function(e) {
        amp.jsonReturn(name,{ status:'error',code: 404, message: "Not Found", name: name });
    });

    // remember it for cleaning
    cbScripts[name] = script;
};

}());