// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { title } from 'process';
import { pipeline } from 'stream';
import * as vscode from 'vscode';

const tabulacaoVSCode = "    ";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('unigetaset.selectionGetSet', () => {
		// The code you place here will be executed every time your command is executed
		executaExtensao();		
	});

	context.subscriptions.push(disposable);
}
function executaExtensao():void{
	var formatoArquivo:string;
	var selecaoCodigo:string;
	var intervaloSelecaoCodigo : vscode.Range;
	if(vscode.window.activeTextEditor != undefined){
		if(vscode.window.activeTextEditor.selections.length > 0){
			intervaloSelecaoCodigo = retornaIntervaloSelecaoCodigoArquivo();
			selecaoCodigo = retornaSelecaoCodigoArquivo(intervaloSelecaoCodigo);
			formatoArquivo = retornaFormatoArquivo(vscode.window.activeTextEditor.document.fileName);
			switch(formatoArquivo){
				case 'py':
					executaExtensaoPython(selecaoCodigo, formatoArquivo, intervaloSelecaoCodigo);
					break;
			}
		}
	}
}
function retornaIntervaloSelecaoCodigoArquivo() : vscode.Range{
	var inicioIntervaloSelecao:vscode.Position;
	var fimIntervaloSelecao:vscode.Position;
	var intervaloSelecao:vscode.Range;
	var selecaoCodigo:string;

	inicioIntervaloSelecao = new vscode.Position(vscode.window.activeTextEditor?.selection.start.line!, vscode.window.activeTextEditor?.selection.start.character!);
	fimIntervaloSelecao = new vscode.Position(vscode.window.activeTextEditor?.selection.end.line!, vscode.window.activeTextEditor?.selection.end.character!);
	intervaloSelecao = new vscode.Range(inicioIntervaloSelecao, fimIntervaloSelecao)
	
	return intervaloSelecao;
}
function retornaSelecaoCodigoArquivo(intervaloSelecao : vscode.Range):string{
	var selecaoCodigo:string;

	selecaoCodigo = vscode.window.activeTextEditor!.document.getText(intervaloSelecao);
	return selecaoCodigo;
}
function retornaFormatoArquivo(caminho:string):string{
	var indicePonto = caminho.indexOf('.', 0);
	return caminho.substring(indicePonto + 1, caminho.length);
}
function executaExtensaoPython(selecaoCodigo:string, formatoArquivo:string, intervaloSelecaoCodigo : vscode.Range):void{
	var alfabetoPython : string[] = [" ", "#", "self", ".", "=", "get", "set", "(", ")", ":", ",", "\\"];
	var alfabetoIgnorar : string[] = ["=", "#"];
	var selecaoCodigoModificada : string;
	var metodosGetSet : string;

	//Retirando palavras do alfabeto das linguagens Python e Ignorar
	selecaoCodigoModificada = retiraPalavrasSelecaoCodigoPython(selecaoCodigo, alfabetoPython, alfabetoIgnorar);
	selecaoCodigoModificada = retiraComentariosSelecaoCodigoPython(selecaoCodigoModificada, alfabetoPython[1]);
	console.log("CÓDIGO MOD:\n" + selecaoCodigoModificada);
	metodosGetSet = geraMetodosGetSetPython(selecaoCodigoModificada, alfabetoPython[4]);
	apresentaMetodosGetSetDocument(metodosGetSet, intervaloSelecaoCodigo);
}
function apresentaMetodosGetSetDocument(metodosGetSet : string, intervaloSelecao : vscode.Range) : void{	
	var editorTextoAtivo = vscode.window.activeTextEditor;
	var documento = editorTextoAtivo?.edit(editBuilder => {
		editBuilder.insert(intervaloSelecao.end, metodosGetSet);
	})	
	
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
	var nomeAtributoAtualFormatado : string = "";
	var metodosGetSet : string = "\n\n";

	while(indiceTokenAtribuicao >= 0){
		indiceTokenAtribuicao = selecaoCodigo.indexOf(tokenAtribuicao, indiceTokenAnteriorAtribuicao + 1);
		if (indiceTokenAtribuicao >= 0){
			if (numeroTokenAtribuicao == 0){
				nomeAtributoAtual = selecaoCodigo.substring(indiceTokenAnteriorAtribuicao, indiceTokenAtribuicao);
				nomeAtributoAtualFormatado = formataNomeAtributoPython(nomeAtributoAtual);
				metodosGetSet += geraMetodoGetPython(nomeAtributoAtualFormatado, nomeAtributoAtual);
				metodosGetSet += geraMetodoSetPython(nomeAtributoAtualFormatado, nomeAtributoAtual);
				numeroTokenAtribuicao++;
				indiceTokenAnteriorAtribuicao = indiceTokenAtribuicao;
			}else{
				indiceTokenQuebraLinha = selecaoCodigo.indexOf("\n", indiceTokenAnteriorAtribuicao);
				nomeAtributoAtual = selecaoCodigo.substring(indiceTokenQuebraLinha + 1, indiceTokenAtribuicao);
				nomeAtributoAtualFormatado = formataNomeAtributoPython(nomeAtributoAtual);
				metodosGetSet += geraMetodoGetPython(nomeAtributoAtualFormatado, nomeAtributoAtual);
				metodosGetSet += geraMetodoSetPython(nomeAtributoAtualFormatado, nomeAtributoAtual);
				numeroTokenAtribuicao++;
				indiceTokenAnteriorAtribuicao = indiceTokenAtribuicao;
			}
		}
		
	}
	
	return metodosGetSet;
}
function geraMetodoGetPython(atributoNomeMetodo : string, atributoCodigo : string) : string{
	var metodoGet : string;
	//VsCode, por padrão, utiliza 4 espaços ao invés como tab
	metodoGet = tabulacaoVSCode + "def get" + atributoNomeMetodo + "(self):\n";
	metodoGet += tabulacaoVSCode + tabulacaoVSCode + "return self." + atributoCodigo + "\n\n";
	return metodoGet;
}
function geraMetodoSetPython(atributoNomeMetodo : string, atributoCodigo : string) : string{
	var metodoSet : string;
	//VsCode, por padrão, utiliza 4 espaços ao invés como tab
	metodoSet = tabulacaoVSCode + "def set" + atributoNomeMetodo + "(self, " + atributoCodigo + "):\n";
	metodoSet += tabulacaoVSCode + tabulacaoVSCode + "self." + atributoCodigo + " = " + atributoCodigo + "\n\n";
	return metodoSet;
}
function formataNomeAtributoPython(atributo : string) : string{
	return atributo.charAt(0).toUpperCase() + atributo.substring(1, atributo.length).toLowerCase();
}
function retiraPalavrasSelecaoCodigoPython(selecaoCodigo : string, alfabetoPython : string[], alfabetoIgnorar : string[]) : string{
	var palavraPython : string;
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
