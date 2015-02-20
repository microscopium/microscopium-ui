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
                src: ['public/js/*.js'],
                dest: 'public/js/build.js'
            }
        },
        watch: {
            scripts: {
                files: ['*.js', 'public/js/*.js'],
                tasks: ['jshint', 'browserify:dev', 'express:dev'],
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

    grunt.registerTask('default', ['express:dev', 'browserify:dev', 'jshint:all', 'watch']);

};
