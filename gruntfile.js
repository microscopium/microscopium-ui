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
            all: ['*.js', 'public/js/*.js']
        },
        watch: {
            scripts: {
                files: ['**.js'],
                tasks: ['jshint', 'express:dev'],
                options: {
                    livereload: true,
                    spawn: false
                }
            }
        }
    });

    grunt.option('force', true);

    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['express:dev', 'jshint:all', 'watch']);

};
