// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { title } from 'process';
import { pipeline } from 'stream';
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('unigetaset.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from UniGetaSet!');

		console.log('Congratulations, your extension "unigetaset" is now active!');
		var iptBox = vscode.window.showInputBox({prompt:'oi', value:'teste'});
		executaExtensao();
		
		
	});

	context.subscriptions.push(disposable);
}
function executaExtensao():void{
	var inicioIntervaloSelecao:vscode.Position;
	var fimIntervaloSelecao:vscode.Position;
	var intervaloSelecao:vscode.Range;
	var formatoArquivo:string;
	var selecaoCodigo:string;
	if(vscode.window.activeTextEditor != undefined){
		if(vscode.window.activeTextEditor.selections.length > 0){
			inicioIntervaloSelecao = new vscode.Position(vscode.window.activeTextEditor?.selection.start.line, vscode.window.activeTextEditor?.selection.start.character);
			fimIntervaloSelecao = new vscode.Position(vscode.window.activeTextEditor?.selection.end.line, vscode.window.activeTextEditor?.selection.end.character);
			intervaloSelecao = new vscode.Range(inicioIntervaloSelecao, fimIntervaloSelecao)
			selecaoCodigo = vscode.window.activeTextEditor.document.getText(intervaloSelecao)
			formatoArquivo = retornaFormatoArquivo(vscode.window.activeTextEditor.document.fileName);
			console.log('\nFORMATO ARQUIVO = ' + formatoArquivo)
			switch(formatoArquivo){
				case 'py':
					executaExtensaoPython(selecaoCodigo, formatoArquivo);
					break;
			}
		}
	}
}
function retornaFormatoArquivo(caminho:string):string{
	var indicePonto = caminho.indexOf('.', 0);
	return caminho.substring(indicePonto + 1, caminho.length);
}
function executaExtensaoPython(selecaoCodigo:string, formatoArquivo:string):void{
	console.log('\nÉ PYTHON!')
}
// this method is called when your extension is deactivated
export function deactivate() {}
