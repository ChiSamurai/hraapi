module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    express: {
      options: {
        background: false
      },
      dev: {
        options: {
          script: 'bin/www'
        }
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, flatten: true, src: ['node_modules/bootstrap/dist/css/bootstrap.*'], dest: 'src/public/stylesheets/dist/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['node_modules/bootstrap/dist/fonts/*'], dest: 'src/public/fonts/dist/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['node_modules/bootstrap/dist/js/bootstrap.js'], dest: 'src/public/javascripts/dist/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['node_modules/jquery.cookie/jquery.cookie.js'], dest: 'src/public/javascripts/dist/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['node_modules/jquery/dist/jquery.min.js'], dest: 'src/public/javascripts/dist/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['node_modules/jquery-lazyload/jquery.lazyload.js'], dest: 'src/public/javascripts/dist/', filter: 'isFile'},
          {expand: true, flatten: true, src: ['node_modules/jquery-lazyload/jquery.scrollstop.js'], dest: 'src/public/javascripts/dist/', filter: 'isFile'},
        ]
      }
    },
    watch: {
      all:{
        files: [
          'src/**/*.ejs',
          'src/**/*.js',
          '!src/public/javascripts/dist/yy**/*.js'
        ],
        tasks: ['copy:main']
      }
    }
  });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');

    grunt.registerTask('default', ['express', 'watch']);
    grunt.registerTask('copy',['copy:main']);
/*    grunt.registerTask('watch', 'watch');*/
};