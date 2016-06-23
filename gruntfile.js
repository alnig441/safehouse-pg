module.exports = function(grunt) {

    var ctrl= './development/javascripts/controllers/';
    var conf= './development/javascripts/configuration/';
    var filter= './development/javascripts/filters/';
    var fact='./development/javascripts/factories/';
    var dirs='./development/javascripts/directives/';

    grunt.initConfig({
        jshint: {
            files: ['gruntfile.js', paths.from.scripts, '/routes/*.js', paths.from.modules],
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
            },
            script_elements: {
                files: [conf +'*,js', filter + '*.js', ctrl + '*.js', fact + '*.js', dirs + '*.js'],
                tasks: ['concat', 'uglify'],
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
                    {expand: true, cwd: './node_modules/font_awesome/css/' ,src: '*.css', dest: paths.to.vendors, filter: 'isFile'},
                    {expand: true, cwd: './bower_components/angular-ticker/release/' ,src: '*.js', dest: paths.to.vendors, filter: 'isFile'},
                    {expand: true, cwd: './bower_components/angular-ticker/release/' ,src: '*.css', dest: paths.to.vendors, filter: 'isFile'},
                    {expand: true, cwd: './development/javascripts/' ,src: '*.js', dest: './public/javascripts/', filter: 'isFile'}

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

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    conf+ 'config.js',
                    filter+ 'filters.js',
                    ctrl+ 'indexCtrl.js',
                    ctrl+ 'imageCtrl.js',
                    ctrl+ 'acctsCtrl.js',
                    ctrl+ 'landingPageCtrl.js',
                    ctrl+ 'privCtrl.js',
                    ctrl+ 'logoutCtrl.js',
                    ctrl+ 'singleViewModalCtrl.js',
                    ctrl+ 'modalInstanceCtrl.js',
                    ctrl+ 'multiViewModalCtrl.js',
                    ctrl+ 'modalInstance2Ctrl.js',
                    ctrl+ 'loginModalCtrl.js',
                    ctrl+ 'resumeModalCtrl.js',
                    ctrl+ 'saveImageModalCtrl.js',
                    ctrl+ 'addTagsModalCtrl.js',
                    ctrl+ 'modifyStorageModalCtrl.js',
                    ctrl+ 'modifyAccountModalCtrl.js',
                    ctrl+ 'locationCtrl.js',
                    fact+ 'factories.js',
                    fact+ 'eventServices.js',
                    fact+ 'imageServices.js',
                    fact+ 'storageServices.js',
                    dirs+ 'insertBio.js',
                    dirs+ 'latestEvent.js',
                    dirs+ 'multiView.js',
                    dirs+ 'myResume.js'
                ],
                dest: './public/javascripts/concatenated_app_file.js'
            }
        },

        uglify: {
            options: {
                compress: {
                    drop_console: true
                }
            },
            my_target: {
                files: {
                    //'./public/scripts/angular_app.min.js': ['./public/scripts/app.js'],
                    //'./public/scripts/myFunctions.min.js': ['./development/modules/myFunctions.js'],
                    './public/javascripts/myFunctions.min.js': ['./development/modules/myFunctions.js'],
                    './public/javascripts/app.min.js': ['./public/javascripts/concatenated_app_file.js']
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
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['jade', 'jshint', 'concat', 'uglify', 'watch' ,'copy']);
};

var paths = {
    from: {scripts: './development/javascripts/*.js', templates: './development/templates/*.jade', styles: './development/styles/*.css', icons: './development/icons/*.svg', modules: './development/modules/*.js'},
    to: {scripts: './public/javascripts/angular_app.js', templates: './public/views/', styles: './public/stylesheets/', icons: './public/icons/', modules: './public/javascripts/', vendors: './public/vendors/'}
};
