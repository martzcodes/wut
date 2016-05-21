'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
        let highlights: vscode.DocumentHighlight[] = [];
        var smallNumbers : vscode.DecorationOptions[] = [];
        let activeEditor = vscode.window.activeTextEditor;
        let lineRange = new vscode.Range(0, 0, 1, 10);
        var decoration = { range: lineRange, hoverMessage: 'Something Here'};
        smallNumbers.push(decoration);
        let highlight = new vscode.DocumentHighlight(lineRange, vscode.DocumentHighlightKind.Text);
        highlights.push(highlight);
        var smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
            borderWidth: '2px',
            borderStyle: 'solid',
            overviewRulerColor: 'red',
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            light: {
                // this color will be used in light color themes
                borderColor: 'darkred'
            },
            dark: {
                // this color will be used in dark color themes
                borderColor: 'lightred'
            }
        });
        activeEditor.setDecorations(smallNumberDecorationType, smallNumbers);
        console.log(activeEditor.document.lineCount);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}