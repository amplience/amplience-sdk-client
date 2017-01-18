module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        default: {},
        sass: {
            development: {
                files: [{
                    "dist/amplience-sdk-client.css": "css/amp.scss"
                }]
            },
            production: {
                options: {
                    sourcemap: 'none'
                },
                files: [{
                    "dist/amplience-sdk-client.css": "css/amp.scss"
                }]
            }
        },
        cssmin: {
            target: {
                files: [{
                    src: "dist/amplience-sdk-client.css",
                    dest:"dist/amplience-sdk-client.min.css"
                },
                {
                    src: "dist/video-js/video-js.min.css",
                    dest: "dist/video-js/video-js.min.css"
                }]
            }
        },
        replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            match: /{{VERSION}}/g,
                            replacement: '<%= pkg.version %>'
                        }
                    ]
                },
                files: [
                    {src: ['dist/**/*.js'], dest: './'}
                ]
            }
        },
        uglify: {
            build:{
                files:[{
                    src: 'dist/parts/amplience-api.js',
                    dest: 'dist/parts/amplience-api.min.js'
                },
                {
                    src: 'dist/parts/amplience-components.js',
                    dest: 'dist/parts/amplience-components.min.js'
                },
                {
                    src: 'dist/video-js/video.min.js',
                    dest: 'dist/video-js/video.min.js'
                }
                ]
            },
            tests:{
                files:[{
                    src: 'test/amp/SDK.js',
                    dest: 'test/amp/SDK.min.js'
                },
                {
                    src: 'test/amp.ui/components.js',
                    dest: 'test/amp.ui/components.min.js'
                }]
            }
        },
        watch: {
             files: ['Gruntfile.js', 'src/amp/*', 'src/amp.ui/*','css/*'],
             tasks: [ 'includes:js','concat', 'strip_code','copy','sass', 'uglify']
        },


        concat: {
            amp: {
                files: [
                    {'dist/parts/amplience-api.js': ['tmp/sdk.js']},
                    {'test/amp/SDK.js': ['tmp/sdk.js']}
                ]
            },
            ampui: {
                files: [
                    {'dist/parts/amplience-components.js': ['src/amp.ui/widget-stack.js',
                                                       'src/amp.ui/widget-carousel.js',
                                                       'src/amp.ui/widget-load.js',
                                                       'src/amp.ui/widget-auto.js',
                                                       'src/amp.ui/widget-nav.js',
                                                       'src/amp.ui/widget-zoom.js',
                                                       'src/amp.ui/widget-zoom-inline.js',
                                                       'src/amp.ui/widget-video.js',
                                                       'src/amp.ui/widget-spin.js'
                                                       ]},
                    {'test/amp.ui/components.js': ['src/amp.ui/widget-stack.js',
                                                       'src/amp.ui/widget-carousel.js',
                                                       'src/amp.ui/widget-load.js',
                                                       'src/amp.ui/widget-auto.js',
                                                       'src/amp.ui/widget-nav.js',
                                                       'src/amp.ui/widget-zoom.js',
                                                       'src/amp.ui/widget-zoom-inline.js',
                                                       'src/amp.ui/widget-video.js',
                                                       'src/amp.ui/widget-spin.js']}
                ]
            },
            videojs: {
                files: [
                    {'dist/video-js/video.min.js': ['dist/video-js/video.min.js',
                        'bower_components/videojs-resolution-switcher/lib/videojs-resolution-switcher.js']},
                    {'dist/video-js/video-js.min.css': ['dist/video-js/video-js.min.css',
                        'bower_components/videojs-resolution-switcher/lib/videojs-resolution-switcher.css']}
                ]
            },
            together: {
                files: [
                    {'dist/amplience-sdk-client.js': ['dist/parts/amplience-api.js',
                                                                    'dist/parts/amplience-components.js']},
                    {'dist/amplience-sdk-client.min.js': ['dist/parts/amplience-api.min.js',
                        'dist/parts/amplience-components.min.js']},
                ]
            }
        },
        includes: {
            js: {
                options: {
                    includeRegexp: /^\/\/\s*import\s+['"]?([^'"]+)['"]?\s*$/
                },
                files: {'tmp/sdk.js': ['src/amp/sdk.js']}
            }
        },
        karma: {
            unit: {
                options: {
                    frameworks: ["jasmine"],

                    files: [
                        'bower_components/jquery/jquery.js',
                        'bower_components/jquery-ui/ui/jquery.ui.widget.js',
                        'bower_components/video.js/dist/video-js/video.js',
                        'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
                        'test/amp/SDK.min.js',
                        'test/amp.ui/components.min.js',
                        'test/**/*.js',
                        {
                            pattern: 'test/fixtures/**/*.json',
                            watched: true,
                            included: false,
                            served:true
                        },
                        {
                            pattern: 'dist/**/*.css',
                            watched: false,
                            included: false,
                            served:true
                        }
                    ],
                    reporters: ['progress', 'coverage'],
                    browsers:['Chrome','Firefox', 'IE'],
                    singleRun: false,
                    autoWatch: true
                }
            },
            test: {
                options: {
                    frameworks: ["jasmine"],

                    files: [
                        'bower_components/jquery/jquery.js',
                        'bower_components/jquery-ui/ui/jquery.ui.widget.js',
                        'bower_components/video.js/dist/video-js/video.js',
                        'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
                        'test/amp/SDK.min.js',
                        'test/amp.ui/components.min.js',
                        'test/**/*.js',
                        {
                            pattern: 'test/fixtures/**/*.json',
                            watched: true,
                            included: false,
                            served:true
                        },
                        {
                            pattern: 'dist/**/*.css',
                            watched: false,
                            included: false,
                            served:true
                        }
                    ],
                    reporters: ['progress', 'coverage'],
                    browsers:['Chrome'],
                    singleRun: true,
                    autoWatch: false
                }
            },
            teamcity: {
                options: {
                    frameworks: ["jasmine"],

                    files: [
                        'bower_components/jquery/jquery.js',
                        'bower_components/jquery-ui/ui/jquery.ui.widget.js',
                        'bower_components/video.js/dist/video-js/video.js',
                        'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
                        'test/amp/SDK.min.js',
                        'test/amp.ui/components.min.js',
                        'test/**/*.js',
                        {
                            pattern: 'test/fixtures/**/*.json',
                            watched: true,
                            included: false,
                            served:true
                        },
                        {
                            pattern: 'dist/**/*.css',
                            watched: false,
                            included: false,
                            served:true
                        }
                    ],
                    reporters: ['teamcity'],
                    browsers:['PhantomJS'],
                    singleRun: true,
                    autoWatch: false
                }
            }
        },
        strip_code: {
            amp: {
               src: 'dist/parts/amplience-api.js'
            },
            ampui: {
               src: 'dist/parts/amplience-components.js'
            }
        },
        copy: {
            assets:{
                files: [
                    {expand: true, cwd: 'assets/', src: ['**'], dest: 'dist/assets'},
                    {expand: true, cwd: 'bower_components/video.js/dist/', src: ['video.min.js', 'video-js.min.css', 'video-js.swf'], dest: 'dist/video-js'},
                    {expand: true, cwd: 'bower_components/video.js/dist/font/', src: ['**'], dest: 'dist/video-js/font'}
                ]
             }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-includes');

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Load the plugin that provides the "concat" task.
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-strip-code');

    // karma
    grunt.loadNpmTasks('grunt-karma');

    // Watch
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-replace');

    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.loadNpmTasks('grunt-contrib-cssmin');


    // Default task(s).
    grunt.registerTask('default', ['includes:js','concat:amp','concat:ampui', 'strip_code','copy', 'concat:videojs', 'sass', 'uglify', 'cssmin', 'concat:together', 'replace']);

    // Default task(s).
    grunt.registerTask('tests', ['default','karma:unit', 'karma:test']);
};
