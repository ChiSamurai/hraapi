module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    express: {
      options: {
        spawn: false
      },
      dev:{
        options: {
          node_env: 'development',
          debug: true,
          breakOnFirstLine: true,
          script: 'dist/bin/www'
        }
      }
    },
    jsdoc : {
        dist : {
            src: ['src/**/*.js'],
            options: {
                destination: 'dist/doc'
            }
        }
    },
    copy: {
      main: {
        files: [
          {expand: true, flatten: true, src: ['node_modules/bootstrap/dist/fonts/*'], dest: 'dist/public/fonts/', filter: 'isFile'},
          {expand: true, src: ['bin/**'], dest: 'dist/'},
          {expand: true, cwd: 'src', src: ['**'], dest: 'dist/'},
        ]
      }
    },
    watch: {
      dist:{
        options: {
          spawn: false,
        },
        files: [
          'src/**/*.css',
          'src/**/*.ejs',
          'src/**/*.js',
          '!src/public/javascripts/dist/**/*.js'
        ],
        tasks: ['copy', 'express:dev']
      },
      docGen:{
        options: {
          spawn: false,
        },
        files: [
          'src/**/*.css',
          'src/**/*.ejs',
          'src/**/*.js',
          '!src/public/javascripts/dist/**/*.js'
        ],
        tasks: ['jsdoc', 'express:dev']
      }      
    }
  });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');

    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('default', ['copy', 'express:dev', 'watch:dist']);
    grunt.registerTask('doc-gen', ['jsdoc', 'express:dev', 'watch:docGen']);
};