module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt)

  grunt.loadNpmTasks('grunt-execute')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-less')

  grunt.initConfig({

    clean: ['dist/**/*'],

    copy: {
      src_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['**/*', '!**/*.js', '!**/*.less', '!**/*.scss', '!img/**/*'],
        dest: 'dist'
      },
      pluginDef: {
        expand: true,
        src: ['plugin.json', 'README.md'],
        dest: 'dist'
      },
      img_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['img/**/*'],
        dest: 'dist/src/'
      },
      externals: {
        cwd: 'src',
        expand: true,
        src: ['**/external/*'],
        dest: 'dist'
      }
    },

    watch: {
      rebuild_all: {
        files: ['src/**/*', 'plugin.json'],
        tasks: ['default'],
        options: {spawn: false}
      }
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015'],
        plugins: ['transform-es2015-modules-systemjs', 'transform-es2015-for-of']
      },
      dist: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ['*.js'],
          dest: 'dist',
          ext: '.js'
        }]
      }
    },

    less: {
      development: {
        options: {
          paths: ['dist/css']
        },
        files: {
          'dist/css/panel.base.css': 'src/css/panel.base.less',
          'dist/css/panel.dark.css': 'src/css/panel.dark.less',
          'dist/css/panel.light.css': 'src/css/panel.light.less'
        }
      },
      production: {
        options: {
          paths: ['dist/css']
        },
        files: {
          'dist/css/panel.base.css': 'src/css/panel.base.less',
          'dist/css/panel.dark.css': 'src/css/panel.dark.less',
          'dist/css/panel.light.css': 'src/css/panel.light.less'
        }
      }
    }

  })

  grunt.registerTask('default', ['clean', 'copy:src_to_dist', 'copy:pluginDef', 'copy:img_to_dist', 'copy:externals', 'babel', 'less'])
}
