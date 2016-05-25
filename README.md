# README
## What is wut?

`wut` is an extension that I'm hoping will overlay code coverage information and run unit tests specific to individual files.  This will be my first VSCode extension and seems like a good opportunity to poke around a bit.  The code is hosted on github if you want to contribute: https://github.com/entrocode/wut  

## Config Example (Workspace settings)

```
{
    "wut.lcov":"./test-results/coverage/PhantomJS 1.9.8 (Mac OS X 0.0.0)/lcov.info"
}
```

## Example Project Gruntfile

<i>Note:  Probably a better way to do this, and I realize `src` takes lists... this is "quick and dirty"</i>

```
module.exports = function (grunt) {
	function getKarmaConfig(testFolder, testTarget) {
		return {
			options: {
				configFile: 'test/karma-conf.js'
			},
			one: {
				singleRun: true,
				files: [
					// include relevant Angular files and libs
					{ src: 'app/lib/angular/angular.js' },
					{ src: 'test/lib/angular-mocks.js' },

					// include JS files
					{ src: 'app/js/**/*.js' },
					{ src: 'app/js/app.js' },

					// include unit test specs
					{ src: testTarget ? testTarget : testFolder ? testFolder + '*.spec.js' : 'app/js/**/*.spec.js' }
				]
			}
		};
	};
  grunt.initConfig({

    karma: getKarmaConfig(),

    ...
    
  });

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-protractor-runner');
	grunt.loadNpmTasks('grunt-run');

	...

	var target = grunt.option('target') || '';
	var folder = grunt.option('folder') || '';
	grunt.registerTask('one', function () {
		grunt.config.set('karma', getKarmaConfig(folder, target));
		grunt.task.run(['karma:one:start']);
	});
};
```

## TODO

- <s>Save lcov.info path in config</s>
- <s>Import LCOV</s>
- <s>Compare LCOV to active window</s>
- <s>Parse LCOV by file and line</s>
- <s>Display icon in gutter and highlight rows</s>
- <s>Output to console what problems are</s>
- <s>Add Warnings</s>
- <s>Hover text</s>
- <s>Run tests from extension command</s>
- <s>Activate extension (or register some things) on workspace open?</s> (I check for .js extension, that way I don't un-necessarily load the extension)
- <s>Run command on file save</s>
- <s>Run tests on file save</s>
- <s>Run tests for individual file</s> (see example Gruntfile.js above)
- <s>Run tests for individual file on file save</s> (for folder that the file is in)
- <s>Parse test output for failing file / test</s>
- <s>Highlight failing tests in spec</s>
- <s>Display expected info in spec</s> hovertext at beginning of line and in console
- ? Save a coverage (json?) file (with percents)
- ? On file save re-calculate coverage and show the delta

## References

- Run on file save: https://github.com/Microsoft/vscode-go/pull/115/files