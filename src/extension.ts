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
		executaExtensao();
		
		
	});

	context.subscriptions.push(disposable);
}
function executaExtensao():void{
	var formatoArquivo:string;
	var selecaoCodigo:string;
	if(vscode.window.activeTextEditor != undefined){
		if(vscode.window.activeTextEditor.selections.length > 0){
			selecaoCodigo = retornaSelecaoCodigoArquivo();
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
function retornaSelecaoCodigoArquivo():string{
	var inicioIntervaloSelecao:vscode.Position;
	var fimIntervaloSelecao:vscode.Position;
	var intervaloSelecao:vscode.Range;
	var selecaoCodigo:string;

	inicioIntervaloSelecao = new vscode.Position(vscode.window.activeTextEditor?.selection.start.line!, vscode.window.activeTextEditor?.selection.start.character!);
	fimIntervaloSelecao = new vscode.Position(vscode.window.activeTextEditor?.selection.end.line!, vscode.window.activeTextEditor?.selection.end.character!);
	intervaloSelecao = new vscode.Range(inicioIntervaloSelecao, fimIntervaloSelecao)
	selecaoCodigo = vscode.window.activeTextEditor!.document.getText(intervaloSelecao);
	
	return selecaoCodigo;
}
function retornaFormatoArquivo(caminho:string):string{
	var indicePonto = caminho.indexOf('.', 0);
	return caminho.substring(indicePonto + 1, caminho.length);
}
function executaExtensaoPython(selecaoCodigo:string, formatoArquivo:string):void{
	var alfabetoPython : string[] = [" ", "#", "self", ".", "=", "get", "set", "(", ")", ":", ",", "\\"];
	var alfabetoIgnorar : string[] = ["=", "#"];
	var selecaoCodigoModificada : string;
	var metodosGetSet : string;

	//Retirando palavras do alfabeto das linguagens Python e Ignorar
	selecaoCodigoModificada = retiraPalavrasSelecaoCodigoPython(selecaoCodigo, alfabetoPython, alfabetoIgnorar);
	selecaoCodigoModificada = retiraComentariosSelecaoCodigoPython(selecaoCodigoModificada, alfabetoPython[1]);
	console.log("\nSELEÇÃO MODIFICADA = " + selecaoCodigoModificada);
	metodosGetSet = geraMetodosGetSetPython(selecaoCodigoModificada, alfabetoPython[4]);
	console.log("\nMÉTODOS GET E SET:\n" + metodosGetSet);
}
function retiraComentariosSelecaoCodigoPython(selecaoCodigo : string, tokenComentario : string) : string{
	var indiceTokenComentario : number = 0;
	var indiceTokenQuebraLinha : number = 0;
	var strComentario : string;
	var nomeAtributoAtual : string = "";
	var charAtual : string;
	while(indiceTokenComentario >= 0){

		indiceTokenComentario = selecaoCodigo.indexOf(tokenComentario, 0);
		if (indiceTokenComentario >= 0){
			indiceTokenQuebraLinha = selecaoCodigo.indexOf("\n", indiceTokenComentario);
			if (indiceTokenQuebraLinha < 0){
				indiceTokenQuebraLinha = selecaoCodigo.length;
			}
			strComentario = selecaoCodigo.substring(indiceTokenComentario, indiceTokenQuebraLinha);
			selecaoCodigo = selecaoCodigo.replace(strComentario, "");
		}
		
	}
	return selecaoCodigo;
}
function geraMetodosGetSetPython(selecaoCodigo : string, tokenAtribuicao : string) : string{
	var indiceTokenAtribuicao : number = 0;
	var indiceTokenAnteriorAtribuicao : number = 0;
	var indiceTokenQuebraLinha : number = 0;
	var numeroTokenAtribuicao : number = 0;
	var nomeAtributoAtual : string = "";
	var metodosGetSet : string = "";

	while(indiceTokenAtribuicao >= 0){
		indiceTokenAtribuicao = selecaoCodigo.indexOf(tokenAtribuicao, indiceTokenAnteriorAtribuicao + 1);
		if (indiceTokenAtribuicao >= 0){
			if (numeroTokenAtribuicao == 0){
				nomeAtributoAtual = selecaoCodigo.substring(indiceTokenAnteriorAtribuicao, indiceTokenAtribuicao - 1);
				nomeAtributoAtual = formataNomeAtributoPython(nomeAtributoAtual);
				metodosGetSet += geraMetodoGetPython(nomeAtributoAtual);
				metodosGetSet += geraMetodoSetPython(nomeAtributoAtual);
				numeroTokenAtribuicao++;
				indiceTokenAnteriorAtribuicao = indiceTokenAtribuicao;
			}else{
				indiceTokenQuebraLinha = selecaoCodigo.indexOf("\n", indiceTokenAnteriorAtribuicao);
				nomeAtributoAtual = selecaoCodigo.substring(indiceTokenQuebraLinha + 1, indiceTokenAtribuicao + 1);
				nomeAtributoAtual = formataNomeAtributoPython(nomeAtributoAtual);
				metodosGetSet += geraMetodoGetPython(nomeAtributoAtual);
				metodosGetSet += geraMetodoSetPython(nomeAtributoAtual);
				numeroTokenAtribuicao++;
				indiceTokenAnteriorAtribuicao = indiceTokenAtribuicao;
			}
		}
		
	}
	
	return metodosGetSet;
}
function geraMetodoGetPython(atributo : string) : string{
	var metodoGet : string;
	
	metodoGet = "def get" + atributo + "(self):\n";
	metodoGet += "	return self." + atributo + "\n";
	return metodoGet;
}
function geraMetodoSetPython(atributo : string) : string{
	var metodoSet : string;
	
	metodoSet = "def set" + atributo + "(self, " + atributo + "):\n";
	metodoSet += "	self." + atributo + " = " + atributo + "\n";
	return metodoSet;
}
function formataNomeAtributoPython(atributo : string) : string{
	return atributo.charAt(0).toUpperCase() + atributo.substring(1, atributo.length - 1).toLowerCase();
}
function retiraPalavrasSelecaoCodigoPython(selecaoCodigo : string, alfabetoPython : string[], alfabetoIgnorar : string[]) : string{
	var palavraPython : string;
	console.log("ALFABETO PYTHON:\n");
	for(var i=0;i<alfabetoPython.length;i++){
		palavraPython = alfabetoPython[i];
		if (!alfabetoIgnorar.includes(palavraPython, 0)){
			selecaoCodigo = selecaoCodigo.split(alfabetoPython[i]).join("");
		}
	}
	return selecaoCodigo;
	
}
// this method is called when your extension is deactivated
export function deactivate() {}
