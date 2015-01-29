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
        watch: {
            scripts: {
                files: ['*.js', 'public/js/*.js'],
                tasks: ['jshint', 'express:dev'],
                options: {
                    livereload: true,
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['express:dev', 'jshint:all', 'watch']);

};
