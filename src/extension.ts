'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import fs = require('fs');
import path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "wut" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        let lcovPath = vscode.workspace.getConfiguration('wut').get('lcov') as string;
        let lcov = "";
        let activeEditor = vscode.window.activeTextEditor;
        let notCovered = vscode.window.createTextEditorDecorationType({
            isWholeLine: true,
            // borderWidth: '2px',
            // borderStyle: 'solid',
            // overviewRulerColor: 'brown',
            gutterIconPath: '/users/matthewmartz/Development/wut/images/bad.svg',
            overviewRulerLane: vscode.OverviewRulerLane.Left,
            light: {
                // this color will be used in light color themes
                color: 'white',
                overviewRulerColor: 'darkred',
                backgroundColor: 'darkred'
            },
            dark: {
                // this color will be used in dark color themes
                color: 'black',
                overviewRulerColor: 'lightred',
                backgroundColor: 'lightred'
            }
        });
        let covered = vscode.window.createTextEditorDecorationType({
            // isWholeLine: true,
            // borderWidth: '2px',
            // borderStyle: 'solid',
            gutterIconPath: '/users/matthewmartz/Development/wut/images/good.svg',
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            light: {
                // this color will be used in light color themes
                overviewRulerColor: 'darkgreen'
            },
            dark: {
                // this color will be used in dark color themes
                overviewRulerColor: 'lightgreen'
            }
        });

        let highlights: vscode.DocumentHighlight[] = [];
        let notCoveredLines: vscode.DecorationOptions[] = [];
        let coveredLines: vscode.DecorationOptions[] = [];
        vscode.window.showInformationMessage('Hello World!');

        fs.readFile(path.join(vscode.workspace.rootPath, lcovPath), function (err, data) {
            if (err) {
                console.log(err);
            }

            lcov = data.toString();
            let matches = lcov.match(/(TN:[\s\S]*?)end_of_record/g);
            matches.forEach((value) => {
                let fileName = path.join(vscode.workspace.rootPath, value.match(/SF:([\s\S]*?)\n/)[1]);
                if (fileName === activeEditor.document.fileName) {
                    let lines = value.split('\n');
                    let FNs = lines.filter(function(line){
                        return line.indexOf('FN:') > -1;
                    });
                    let FNDAs = lines.filter(function(line) {
                        return line.indexOf('FNDA:') > -1;
                    });
                    let FNDA = FNDAs.map(function(line) {
                        return line.split(',')[1] || '';
                    });
                    let FN = FNs.map(function(line) {
                        let temp = line.slice(3,line.length).split(',');
                        return {
                            lineNumber: Number(temp[0]),
                            functionName: temp[1] || '',
                            covered: FNDA.indexOf(temp[1] || '') !== -1
                        };
                    });
                    console.log(FN);
                    console.log("file name matched");
                }
            });
            
            // for (let lineNum: number = 0; lineNum < activeEditor.document.lineCount; lineNum++) {
            //     let lineRange = new vscode.Range(lineNum, 0, lineNum, 0);
            //     if (lineNum % 2 === 0) {
            //         // even
            //         let notCoveredDecoration = { range: lineRange, hoverMessage: '' };
            //         notCoveredLines.push(notCoveredDecoration);
            //     } else {
            //         //odd
            //         let coveredDecoration = { range: lineRange, hoverMessage: '' };
            //         coveredLines.push(coveredDecoration);
            //     }
            // }

            // let highlight = new vscode.DocumentHighlight(lineRange, vscode.DocumentHighlightKind.Text);
            // highlights.push(highlight);

            activeEditor.setDecorations(notCovered, notCoveredLines);
            activeEditor.setDecorations(covered, coveredLines);

            let outChannel = vscode.window.createOutputChannel("test");
            outChannel.show(true);
            outChannel.append("hello");
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}