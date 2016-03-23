module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            files: ['gruntfile.js', paths.from.scripts, '/routes/*.js'],
            options: {
                globals: {
                    jquery: true
                }
            }
        },

        watch: {
            scripts: {
                files: [paths.from.scripts],
                tasks: ['jshint', 'concat', 'uglify'],
                options: {
                    spawn: false
                }
            },
            templates: {
                files: [paths.from.templates],
                tasks: ['jshint', 'jade', 'copy'],
                options: {
                    spawn: false
                }
            },
            styles: {
                files: [paths.from.styles],
                tasks: ['jshint','cssmin'],
                options: {
                    spawn: false
                }
            },
            modules: {
                files: [paths.from.modules],
                tasks: ['jshint', 'uglify', 'copy'],
                options: {
                    spawn: false
                }
            },
            vendors: {
                files: ['./node_modules/angular-ui-bootstrap/dist/'],
                tasks: ['copy'],
                options: {
                    spawn: false
                }
            }
        },

        copy: {
            main: {
                files: [
                    {expand: true, cwd: './development/modules/' ,src: '*.js', dest: paths.to.modules, filter: 'isFile'},
                    {expand: true, cwd: './node_modules/angular-ui-bootstrap/dist/' ,src: '*tpls.js', dest: paths.to.vendors, filter: 'isFile'},
                    {expand: true, cwd: './development/icons/' ,src: '*.svg', dest: paths.to.icons, filter: 'isFile'},
                    {expand: true, cwd: './development/templates/' ,src: '*.html', dest: paths.to.templates, filter: 'isFile'},
                    {expand: true, cwd: './node_modules/font_awesome/css/' ,src: '*.css', dest: paths.to.vendors, filter: 'isFile'}
                ]
            }
        },

        //GRUNT-JADE-TASKS
        jade: {
            options: {
                pretty: true,
                files: {
                    "*": [paths.from.templates]
                }
            },
            debug: {
                options: {
                    locals: {
                        livereload: true
                    }
                }
            },
            publish: {
                options: {
                    locals: {
                        livereload: false
                    },
                    files: {
                        "*": [paths.from.templates]
                    },
                    pretty: false
                }
            }
        },

        //FOR GRUNT-JADE

        //jade: {
        //    //html: {
        //        files: {
        //            './public/views/': [paths.from.templates]
        //        },
        //        options: {
        //            client: false
        //        //}
        //    }
        //},

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: paths.from.scripts, /*['./development/scripts/1_angular_app.js', './development/scripts/adminCtrl.js', './development/scripts/panelViewCtrl.js'],*/
                dest: paths.to.scripts
            }
        },

        uglify: {
            //options: {
            //    compress: {
            //        drop_console: true
            //    }
            //},
            my_target: {
                files: {
                    './public/scripts/angular_app.min.js': ['./public/scripts/app.js'],
                    './public/scripts/myFunctions.min.js': ['./development/modules/myFunctions.js']
                }
            }
        },

        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: './development/styles/',
                    src: '*.css',
                    dest: paths.to.styles,
                    ext: '.min.css'
                }]
            }
        }

    });

    grunt.loadNpmTasks('grunt-jade-tasks');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-jade');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['jade', 'jshint', 'concat', 'uglify', 'watch' ,'copy']);
};

var paths = {
    from: {scripts: './development/javascripts/*.js', templates: './development/templates/*.jade', styles: './development/styles/*.css', icons: './development/icons/*.svg', modules: './development/modules/*.js'},
    to: {scripts: './public/javascripts/angular_app.js', templates: './public/views/', styles: './public/stylesheets/', icons: './public/icons/', modules: './public/scripts/', vendors: './public/vendors/'}
};
