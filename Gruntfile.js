module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        default: {},
        less: {
            options: {
                ieCompat:true
            },
            development: {
                files: {
                    "dist/amplience-sdk-client.css": "css/*.less"
                }
            },
            production: {
                options: {
                    cleancss: true
                },
                files: {
                    "dist/amplience-sdk-client.min.css": "css/*.less"
                }
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
                }]
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
             tasks: [ 'includes:js','concat', 'strip_code','copy','less', 'uglify']
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
                                                       'src/amp.ui/widget-spin.js',
                                                       'src/amp.ui/video.quality.js']},
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
                        'bower_components/video.js/dist/video-js/video.dev.js',
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
            teamcity: {
                options: {
                    frameworks: ["jasmine"],

                    files: [
                        'bower_components/jasmine-jquery/lib/jasmine-jquery.js',
                        'test/amp/SDK.js',
                        'test/amp.ui/components.js',
                        'test/**/*.js',
                        'test/components/*.js',
                        {
                            pattern: 'test/fixtures/**/*.json',
                            watched: true,
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
                    {expand: true, cwd: 'assets/', src: ['**'], dest: 'dist/assets'}
                ]
             }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-less');

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


    // Default task(s).
    grunt.registerTask('default', ['includes:js','concat:amp','concat:ampui', 'strip_code','copy','less', 'uglify','concat:together','replace']);

    // Default task(s).
    grunt.registerTask('tests', ['default','karma']);
};
