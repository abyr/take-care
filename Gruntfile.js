module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: [
                '**/*.js',
                '!docs/**/*.js',
                '!node_modules/**/*.js',
                '!public/components/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        nodeunit: {
            all: ['test/*test.js']
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: [
                        'models',
                        'routes',
                        'views'
                    ],
                    outdir: 'docs/'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.registerTask('doc', ['yuidoc']);

    grunt.registerTask('default', ['jshint']);
};
