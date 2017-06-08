module.exports = function(grunt) {

    var controllers ='./development/javascripts/controllers/*.js';
    var services = './development/javascripts/factories/*.js';
    var directives = './development/javascripts/directives/*.js';
    var configuration = './development/javascripts/configuration/*.js';
    var filters = './development/javascripts/filters/*.js';

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
            partials: {
                files: [paths.from.partials],
                tasks: ['jshint', 'jade', 'copy'],
                options: {
                    spawn: false
                }
            },
            views: {
                files: [paths.from.views],
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
                files: [configuration, filters, controllers, services, directives],
                tasks: ['concat', 'uglify'],
                options: {
                    spawn: false
                }
            },
            models: {
                files: [paths.from.models],
                tasks: ['copy'],
                options: {
                    spawn: false
                }
            },
            templates: {
                files: [paths.from.templates],
                tasks: ['jade','copy'],
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
                    {expand: true, cwd: './development/views/' ,src: '*.html', dest: paths.to.views, filter: 'isFile'},
                    {expand: true, cwd: './development/partials/' ,src: '*.html', dest: paths.to.views, filter: 'isFile'},
                    {expand: true, cwd: './node_modules/font_awesome/css/' ,src: '*.css', dest: paths.to.vendors, filter: 'isFile'},
                    {expand: true, cwd: './bower_components/angular-ticker/release/' ,src: '*.js', dest: paths.to.vendors, filter: 'isFile'},
                    {expand: true, cwd: './bower_components/angular-ticker/release/' ,src: '*.css', dest: paths.to.vendors, filter: 'isFile'},
                    {expand: true, cwd: './models/', src: '*.json', dest: paths.to.models, filter: 'isFile'}
                ]
            }
        },

        //GRUNT-JADE-TASKS
        jade: {
            options: {
                pretty: true,
                files: {
                    "*": [paths.from.views, paths.from.partials]
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
                        "*": [paths.from.views, paths.from.partials]
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
                    configuration,
                    filters,
                    controllers,
                    services,
                    directives
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
    from: {templates: './development/templates/*.jade', models: './models/*.json', scripts: './development/javascripts/*.js', partials: './development/partials/*.jade', views: './development/views/*.jade', styles: './development/styles/*.css', icons: './development/icons/*.svg', modules: './development/modules/*.js'},
    to: {models: './public/models/', scripts: './public/javascripts/angular_app.js', views: './public/views/', styles: './public/stylesheets/', icons: './public/icons/', modules: './public/javascripts/', vendors: './public/vendors/'}
};
