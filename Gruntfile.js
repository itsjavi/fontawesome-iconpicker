'use strict';
module.exports = function(grunt) {
    const parsedIconPicker = 'prod/src/js/iconpicker.js';
    const tempIconsFile = '.icons.temp';
    grunt.initConfig({
        download: {
            somefile: {
                src: ['https://raw.githubusercontent.com/FortAwesome/Font-Awesome/5.0.8/advanced-options/metadata/icons.yml'],
                dest: tempIconsFile
            },
        },
        yaml: {
            getIcons: {
                options: {
                    space: 2,
                    disableDest: true,
                    middleware: function(response, sourceJSON, src, dest) {
                        let targetJSON = {
                            icons: []
                        };
                        sourceJSON = JSON.parse(sourceJSON);
                        Object.keys(sourceJSON).forEach(function(key) {
                            let ele = sourceJSON[key];
                            let icon = 'fa-' + key;
                            ele.styles.forEach(function(style) {
                                style = style.toLowerCase();
                                if (style.startsWith('brand')) {
                                    targetJSON.icons.push('fab ' + icon);
                                } else if (style.startsWith('solid')) {
                                    targetJSON.icons.push('fas ' + icon);
                                } else if (style.startsWith('regular')) {
                                    targetJSON.icons.push('far ' + icon);
                                } else if (style.startsWith('light')) {
                                    targetJSON.icons.push('fal ' + icon);
                                }
                            });
                        });
                        grunt.file.write(dest, JSON.stringify(targetJSON));
                    }
                },
                files: [{
                    expand: false,
                    src: [tempIconsFile],
                    dest: tempIconsFile
                }]
            },
        },
        'string-replace': {
            dist: {
                files: {
                    'prod/': ['src/js/iconpicker.js'],
                },
                options: {
                    replacements: [{
                        pattern: '//###REPLACE-WITH-FONT-AWESOME-5-FONTS###',
                        replacement: "<%= grunt.file.read('" + tempIconsFile + "') %>"
                    }]
                }
            }
        },
        less: {
            dist: {
                options: {
                    compile: true,
                    compress: false
                },
                files: {
                    'dist/css/fontawesome-iconpicker.css': [
                        'src/less/iconpicker.less'
                    ]
                }
            },
            distMin: {
                options: {
                    compile: true,
                    compress: true
                },
                files: {
                    'dist/css/fontawesome-iconpicker.min.css': [
                        'src/less/iconpicker.less'
                    ]
                }
            }
        },
        jsbeautifier: {
            files: ['Gruntfile.js', 'src/js/*.js', parsedIconPicker]
        },
        uglify: {
            distMin: {
                options: {
                    compress: {},
                    beautify: false
                },
                files: {
                    'dist/js/fontawesome-iconpicker.min.js': [
                        'src/js/jquery.ui.pos.js',
                        parsedIconPicker
                    ]
                }
            },
            dist: {
                options: {
                    compress: false,
                    beautify: true
                },
                files: {
                    'dist/js/fontawesome-iconpicker.js': [
                        'src/js/jquery.ui.pos.js',
                        parsedIconPicker
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
            ],
            temp: [
                tempIconsFile,
                'prod/'
            ]
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-yaml');
    grunt.loadNpmTasks('grunt-http-download');
    grunt.loadNpmTasks('grunt-string-replace');

    // Register tasks
    grunt.registerTask('default', [
        'download',
        'yaml',
        'string-replace',
        'clean:dist',
        'less',
        'jsbeautifier',
        'uglify',
        'clean:temp'
    ]);
    grunt.registerTask('dev', [
        'watch'
    ]);

};
