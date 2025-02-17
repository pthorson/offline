Path = require('path')
fs = require('fs')

module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    coffee:
      compile:
        expand: true
        flatten: true
        src: ['coffee/*.coffee']
        dest: 'js/'
        ext: '.js'
        options:
          sourceMap: true

    watch:
      options:
        atBegin:
          true
      coffee:
        files: ['coffee/*', 'sass/*']
        tasks: ["coffee", "uglify", "compass"]

    uglify:
      options:
        banner: "/*! <%= pkg.name %> <%= pkg.version %> */\n"
        sourceMap: false
        beautify: true
        mangle: false

      dist:
        src: ['js/*.js', '!js/snake.js']
        dest: 'offline.min.js'

    compass:
      dist:
        options:
          sassDir: 'sass'
          cssDir: 'themes'

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-compass'

  grunt.registerTask 'default', ['coffee', 'uglify', 'compass']
