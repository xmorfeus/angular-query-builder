/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
  /**
   * The `build_dir` folder is where our projects are compiled during
   * development and the `compile_dir` folder is where our app resides once it's
   * completely built.
   */
  build_dir: 'build',
  compile_dir: 'bin',

  /**
   * This is a collection of file patterns that refer to our app code (th
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks. `js` is all project javascript, less tests. `ctpl` contains
   * our reusable components' (`src/common`) template HTML files, while
   * `atpl` contains the same, but for our app's code. `html` is just our
   * main HTML file, `less` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   */
  app_files: {
    js: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js'],
    js: [ 'vendor/ckeditor/config.js', 'vendor/ckeditor/plugins/baseImage/plugin.js', 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js'],
    jsunit: [ 'src/**/*.spec.js' ],
    
    coffee: [ 'src/**/*.coffee', '!src/**/*.spec.coffee' ],
    coffeeunit: [ 'src/**/*.spec.coffee' ],

    atpl: [ 'src/app/**/*.tpl.html' ],
    ctpl: [ 'src/common/**/*.tpl.html' ],

    html: [ 'src/index.html' ],
    less: 'src/less/main.less',
    ckeditor: ['vendor/ckeditor/*.css', 'vendor/ckeditor/*.js', 'vendor/ckeditor/skins/flat/**/*', 'vendor/ckeditor/plugins/**/*', 'vendor/ckeditor/lang/*.js', 'vendor/jquery.jscrollpane/*.js']
  },

  /**
   * This is a collection of files used during testing only.
   */
  test_files: {
    js: [
      'vendor/angular-mocks/angular-mocks.js'
    ]
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`vendor/`) that we need to place into the build
   * process somewhere. While the `app_files` property ensures all
   * standardized files are collected for compilation, it is the user's job
   * to ensure non-standardized (i.e. vendor-related) files are handled
   * appropriately in `vendor_files.js`.
   *
   * The `vendor_files.js` property holds files to be automatically
   * concatenated and minified with our project source files.
   *
   * The `vendor_files.css` property holds any CSS files to be automatically
   * included in our app.
   *
   * The `vendor_files.assets` property holds any assets to be copied along
   * with our app's assets. This structure is flattened, so it is not
   * recommended that you use wildcards.
   */
  vendor_files: {
    js: [
      'vendor/jquery/dist/jquery.js',
      'vendor/angular/angular.js',
      'vendor/bootstrap/dist/js/bootstrap.js',
      'vendor/angular-bootstrap/ui-bootstrap-tpls.js',
      'vendor/placeholders/angular-placeholders-0.0.1-SNAPSHOT.min.js',
      'vendor/angular-ui-router/release/angular-ui-router.js',
      'vendor/angular-ui-utils/ui-utils.js',
      'vendor/angular-resource/angular-resource.js',
      'vendor/angular-translate/angular-translate.js',
      'vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      'vendor/angular-animate/angular-animate.js',
      'vendor/ng-context-menu/dist/ng-context-menu.js',
      'vendor/angular-ui-select/dist/select.js',
      'vendor/angular-sanitize/angular-sanitize.js',
      'vendor/underscore/underscore.js',
      'vendor/angular-tree-control/angular-tree-control.js',
      'src/app/dynamicForm.js',
      'vendor/angular-sanitize.js',
      'vendor/ngInfiniteScroll/build/ng-infinite-scroll.js',
      'vendor/x2js/xml2json.js',
      'vendor/angular-x2js/dist/x2js.min.js',
      'vendor/ckeditor/ckeditor.js',
      'vendor/ng-file-upload/ng-file-upload-all.js',
      'vendor/jquery.jscrollpane/jquery.jscrollpane.js',
      'vendor/jquery.jscrollpane/mwheelIntent.js',
      'assets/jquery.mousewheel.js',
      'vendor/angular-dynamic-locale/dist/tmhDynamicLocale.js',
      'vendor/angular-i18n/angular-locale_cs-cz.js',
      'vendor/angular-i18n/angular-locale_cs.js',
      'vendor/angular-i18n/angular-locale_en.js',
      'vendor/angular-i18n/angular-locale_en-us.js',
      'vendor/angular-cookies/angular-cookies.js',
      'vendor/jquery-xpath/jquery.xpath.js',
      'src/app/ui-mask.js',
      'vendor/ng-csv/build/ng-csv.js',
      'vendor/moment/moment.js',
      "vendor/google-diff-match-patch/diff_match_patch.js",
      "vendor/angular-diff-match-patch/angular-diff-match-patch.js",
      "vendor/ngstorage/ngStorage.js",
      "vendor/angular-diff/angular-diff.js"
    ],
    css: [],
    assets: [],
    fonts: [
      'vendor/bootstrap/fonts/glyphicons-halflings-regular.woff',
      'vendor/bootstrap/fonts/glyphicons-halflings-regular.woff2',
      'vendor/font-awesome/fonts/fontawesome-webfont.woff',
      'vendor/font-awesome/fonts/fontawesome-webfont.woff2',
      'vendor/font-awesome/fonts/fontawesome-webfont.ttf',
      'vendor/font-awesome/fonts/fontawesome-webfont.svg'
    ]
  }
};
