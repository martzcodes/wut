# README
## What is wut?

`wut` is an extension that I'm hoping will overlay code coverage information and run unit tests specific to individual files.  This will be my first VSCode extension and seems like a good opportunity to poke around a bit.

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
	function getKarmaConfig(testTarget) {
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
					{ src: 'test/unit/' + testTarget }
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
	grunt.registerTask('one', function () {
		grunt.config.set('karma', getKarmaConfig(target));
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
- Activate extension (or register some things) on workspace open?
- Run command on file save
- Run tests on file save
- <s>Run tests for individual file</s> (see example Gruntfile.js above)
- Run tests for individual file on file save
- Parse test output for failing file / test
- Highlight failing tests in spec
- Display expected info in spec (hovertext? caption? ??)

## References

- Run on file save: https://github.com/Microsoft/vscode-go/pull/115/files