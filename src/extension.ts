'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import fs = require('fs');
import path = require('path');
import * as _ from 'lodash';

export interface ILineObject {
    lineNumber: number;
    functionName: string;
    functionCovered: boolean;
    lineCovered: boolean;
    branchCovered: boolean;
}

export class LineObject implements ILineObject {
    lineNumber: number;
    functionName: string;
    functionCovered: boolean = null;
    lineCovered: boolean = null;
    branchCovered: boolean = null;

    constructor(lineNumber: number) {

    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "wut" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.checkFile', () => {
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
        let warning = vscode.window.createTextEditorDecorationType({
            // isWholeLine: true,
            // borderWidth: '2px',
            // borderStyle: 'solid',
            gutterIconPath: '/users/matthewmartz/Development/wut/images/warning.svg',
            overviewRulerLane: vscode.OverviewRulerLane.Center,
            light: {
                // this color will be used in light color themes
                overviewRulerColor: 'darkorange'
            },
            dark: {
                // this color will be used in dark color themes
                overviewRulerColor: 'lightorange'
            }
        });

        let coveredLines: vscode.DecorationOptions[] = [];
        let warningLines: vscode.DecorationOptions[] = [];
        let notCoveredLines: vscode.DecorationOptions[] = [];
        let outChannel = vscode.window.createOutputChannel("wut");
        // vscode.window.showInformationMessage('Hello World!');

        fs.readFile(path.join(vscode.workspace.rootPath, lcovPath), function (err, data) {
            if (err) {
                console.log(err);
            }

            lcov = data.toString();
            let matches = lcov.match(/(TN:[\s\S]*?)end_of_record/g);
            matches.forEach((value) => {
                let fileName = path.join(vscode.workspace.rootPath, value.match(/SF:([\s\S]*?)\n/)[1]);
                if (fileName === activeEditor.document.fileName) {
                    let rawLines = value.split('\n');
                    let FNs = rawLines.filter(line => {
                        return line.indexOf('FN:') > -1;
                    });
                    let DAs = rawLines.filter(line => {
                        return line.indexOf('DA:') > -1 && line.indexOf('BRDA') === -1 && line.indexOf('FNDA') === -1;
                    });
                    let BRDAs = rawLines.filter(line => {
                        return line.indexOf('BRDA:') > -1;
                    });
                    let FNDAs = rawLines.filter(line => {
                        return line.indexOf('FNDA:') > -1;
                    });
                    let FNDA = FNDAs.map(line => {
                        return line.split(',')[1] || '';
                    });
                    let lines: LineObject[] = [];

                    FNs.forEach(line => {
                        let temp = line.slice(3, line.length).split(',');
                        let rObj: LineObject = {
                            lineNumber: Number(temp[0]),
                            functionName: temp[1] || '',
                            functionCovered: FNDA.indexOf(temp[1] || '') !== -1,
                            lineCovered: null,
                            branchCovered: null
                        };
                        lines.push(rObj);
                    });
                    DAs.forEach(line => {
                        let temp = line.slice(3, line.length).split(',');
                        let lineIndex = _.findIndex(lines, { lineNumber: Number(temp[0]) });
                        if (lineIndex > -1) {
                            lines[lineIndex].lineCovered = Number(temp[1]) > 0;
                        } else {
                            let rObj: LineObject = {
                                lineNumber: Number(temp[0]),
                                functionName: '',
                                functionCovered: null,
                                lineCovered: Number(temp[1]) > 0,
                                branchCovered: null
                            };
                            lines.push(rObj);
                        }
                    });
                    BRDAs.forEach(line => {
                        let temp = line.slice(5, line.length).split(',');
                        let lineIndex = _.findIndex(lines, { lineNumber: Number(temp[0]) });
                        if (lineIndex > -1) {
                            lines[lineIndex].branchCovered = lines[lineIndex].branchCovered === false ? false : Number(temp[3]) > 0;
                        } else {
                            let rObj: LineObject = {
                                lineNumber: Number(temp[0]),
                                functionName: '',
                                functionCovered: null,
                                lineCovered: null,
                                branchCovered: Number(temp[3]) > 0
                            };
                            lines.push(rObj);
                        }
                    });
                    lines.sort((a,b) => {
                        return a.lineNumber - b.lineNumber;
                    });
                    lines.forEach(line => {
                        let lineRange = new vscode.Range(line.lineNumber - 1, 0, line.lineNumber - 1, activeEditor.document.lineAt(line.lineNumber).range.end.character);
                        let coverCheck = (line.functionCovered === true || line.functionCovered === null) && (line.lineCovered === null || line.lineCovered === true) && (line.branchCovered === null || line.branchCovered === true);
                        let notCoveredCheck = line.functionCovered === false || line.lineCovered === false || line.branchCovered === false;
                        if (coverCheck) {
                            let coveredDecoration = { range: lineRange, hoverMessage: '' };
                            coveredLines.push(coveredDecoration);
                        } else {
                            let hoverMessage: string = 'Line ' + line.lineNumber + ' is NOT Covered by:';
                            let sep = '';
                            if (line.functionCovered === false) {
                                hoverMessage += ' function';
                                sep = ',';
                            }
                            if (line.lineCovered === false) {
                                hoverMessage += sep + ' line';
                                sep = ',';
                            }
                            if (line.branchCovered === false) {
                                hoverMessage += sep + ' branch';
                            }
                            if (line.functionCovered === false && line.lineCovered === false && line.branchCovered === false) {
                                let notCoveredDecoration = { range: lineRange, hoverMessage: hoverMessage };
                                notCoveredLines.push(notCoveredDecoration);
                            } else {
                                let warningDecoration = { range: lineRange, hoverMessage: hoverMessage };
                                warningLines.push(warningDecoration);
                            }
                            outChannel.show(true);
                            outChannel.appendLine(hoverMessage);
                        }
                    });

                    activeEditor.setDecorations(covered, coveredLines);
                    activeEditor.setDecorations(warning, warningLines);
                    activeEditor.setDecorations(notCovered, notCoveredLines);
                }
            });
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}