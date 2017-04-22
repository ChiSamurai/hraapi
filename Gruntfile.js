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
          {expand: true, flatten: true, src: ['node_modules/bootstrap/dist/css/bootstrap.*'], dest: 'dist/public/stylesheets/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['node_modules/bootstrap/dist/fonts/*'], dest: 'dist/public/fonts/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['node_modules/bootstrap/dist/js/bootstrap.js'], dest: 'dist/public/javascripts/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['node_modules/jquery.cookie/jquery.cookie.js'], dest: 'dist/public/javascripts/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['node_modules/jquery/dist/jquery.min.js'], dest: 'dist/public/javascripts/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['node_modules/jquery-lazyload/jquery.lazyload.js'], dest: 'dist/public/javascripts/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['node_modules/jquery-lazyload/jquery.scrollstop.js'], dest: 'dist/public/javascripts/', filter: 'isFile'},
          {expand: true, src: ['bin/**'], dest: 'dist/'},
          {expand: true, cwd: 'src', src: ['**'], dest: 'dist/'},
        ]
      }
    },
    watch: {
      express:{
        options: {
          spawn: false,
        },
        files: [
          'src/**/*.css',
          'src/**/*.ejs',
          'src/**/*.js',
          '!src/public/javascripts/dist/**/*.js'
        ],
        tasks: ['copy', 'jsdoc', 'express:dev']
      }
    }
  });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');

    grunt.loadNpmTasks('grunt-jsdoc');

/*    grunt.registerTask('default', ['express', 'watch']);*/
    grunt.registerTask('default', ['express:dev', 'watch']);
/*    grunt.registerTask('debugger', ['copy', 'express', 'watch']); */

/*    grunt.registerTask('copy', 'copy');*/
/*    grunt.registerTask('watch', 'watch');*/
};