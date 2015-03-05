/**
 * Global SDK config settings
 *
 * @property conf
 * @type {Object}
 * @default {"cache_window": 21600000,"default_size": 190,"client_id":null,"di_basepath":null}
 */
amp.conf = {
    "cache_window": 21600000,
    "default_size": 190,
    "client_id":null,
    "di_basepath":'http://i1.adis.ws/',
    "content_basepath": "http://c1.adis.ws/",
    "err_img":null
};

(function(){
    /**
     * Overwrites the conf defaults and sets up analytics binding
     * @method init
     * @param {Object} conf The config object
     */
    amp.init = function(conf) {
        for (var i in conf) {
            if (amp.conf.hasOwnProperty(i)){
                amp.conf[i] = conf[i];
            }
        }

    };
}());