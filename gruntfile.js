module.exports = function(grunt) {

    grunt.initConfig({
        express: {
            dev: {
                options: {
                    script: 'server.js'
                }
            }
        },

        jshint: {
            all: ['*.js', 'public/js/*.js'],
            options: {
                ignores: ['public/js/build.js'],
                white: false,
                indent: 4,
                force: true
            }
        },

        browserify: {
            dev: {
                options: {
                    debug: true
                },
                src: 'public/js/script.js',
                dest: 'public/js/build.js'
            },
            tests: {
                options: {
                    debug: true
                },
                files: {
                    'tests/testSpecs.js': ['tests/*.spec.js']
                }
            }
        },

        jasmine: {
            dev: {
                src: ['public/js/bundle.js'],
                options: {
                    specs: 'tests/testSpecs.js'
                }
            }
        },

        watch: {
            scripts: {
                files: ['*.js', 'public/js/*.js'],
                tasks: ['jshint', 'browserify:tests', 'browserify:dev',
                    'jasmine:dev', 'jshint:all', 'express:dev'],
                options: {
                    livereload: true,
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('default', ['express:dev', 'browserify:tests',
        'browserify:dev', 'jasmine:dev', 'jshint:all', 'watch']);

    grunt.registerTask('build', ['browserify:dev']);

};
