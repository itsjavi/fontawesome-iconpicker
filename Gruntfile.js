'use strict';
module.exports = function(grunt) {
    grunt.initConfig({
        less: {
            dist: {
                options: {
                    compile: true,
                    compress: false
                },
                files: {
                    'dist/css/bootstrap-picker.css': [
                        'src/less/picker.less'
                    ]
                }
            },
            distMin: {
                options: {
                    compile: true,
                    compress: true
                },
                files: {
                    'dist/css/bootstrap-picker.min.css': [
                        'src/less/picker.less'
                    ]
                }
            }
        },
        jsbeautifier: {
            files: ['Gruntfile.js', 'src/js/*.js']
        },
        uglify: {
            distMin: {
                options: {
                    compress: true,
                    beautify: false
                },
                files: {
                    'dist/js/bootstrap-picker.min.js': [
                        'src/js/picker.js'
                    ]
                }
            },
            dist: {
                options: {
                    compress: false,
                    beautify: true
                },
                files: {
                    'dist/js/bootstrap-picker.js': [
                        'src/js/picker.js'
                    ]
                }
            }
        },
        watch: {
            less: {
                files: [
                    'src/less/*.less'
                ],
                tasks: ['less']
            },
            js: {
                files: [
                    'src/js/*.js'
                ],
                tasks: ['uglify']
            }
        },
        clean: {
            dist: [
                'dist/css',
                'dist/js/*.js'
            ]
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    // Register tasks
    grunt.registerTask('default', [
        'clean',
        'less',
        'jsbeautifier',
        'uglify'
    ]);
    grunt.registerTask('dev', [
        'watch'
    ]);

};
