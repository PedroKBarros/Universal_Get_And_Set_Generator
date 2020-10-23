// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { promises, resolve } from 'dns';
import { exitCode, title } from 'process';
import { pipeline } from 'stream';
import * as vscode from 'vscode';

const tabulacaoVSCode : string = "    ";
const msgNenhumNomeAtributoComandoNomeAtributos : string = "You did not enter the name of at least one attribute."
const msgEntradaDadosInputBoxInvalidaComandoNomeAtributos : string = "It was not possible to generate the Get and Set methods. Check the names of the passed attributes."
const separadoresAtributosComandoNomeAtributos : string = "'-' or space"
const msgEntradaAtributosComandoNomeAtributos : string = "Enter attribute names separated by " + separadoresAtributosComandoNomeAtributos
const codigoComandoTrechoCodigoSelecionado : number = 1;
const codigoComandoNomeAtributos : number = 2;
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
		executaExtensao(codigoComandoTrechoCodigoSelecionado);		
	});
	let disposable2 = vscode.commands.registerCommand('unigetaset.attributeNamesGetSet', () => {
		// The code you place here will be executed every time your command is executed
		executaExtensao(codigoComandoNomeAtributos);		
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}
function executaExtensao(codigoComando : number) : void{
	var formatoArquivo:string;
	var selecaoCodigo:string;
	var intervaloSelecaoCodigo : vscode.Range;
	if(vscode.window.activeTextEditor != undefined){
		formatoArquivo = retornaFormatoArquivo(vscode.window.activeTextEditor.document.fileName);
		intervaloSelecaoCodigo = retornaIntervaloSelecaoCodigoArquivo();
		selecaoCodigo = retornaSelecaoCodigoArquivo(intervaloSelecaoCodigo);
		switch(formatoArquivo){
			case 'py':
				executaExtensaoPython(codigoComando, selecaoCodigo, intervaloSelecaoCodigo);
			break;		
		}
	}
}
function retornaIntervaloSelecaoCodigoArquivo() : vscode.Range{
	var inicioIntervaloSelecao:vscode.Position;
	var fimIntervaloSelecao:vscode.Position;
	var intervaloSelecao:vscode.Range;

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
function executaExtensaoPython(codigoComando : number, selecaoCodigo:string, intervaloSelecaoCodigo : vscode.Range):void{
	switch(codigoComando){
		case 1:
			executaExtensaoPythonPorTrechoCodigoSelecionado(selecaoCodigo, intervaloSelecaoCodigo);
			break;
		default:
			executaExtensaoPythonPorNomesAtributos(intervaloSelecaoCodigo);
	}
}
function executaExtensaoPythonPorTrechoCodigoSelecionado(selecaoCodigo : string, intervaloSelecaoCodigo : vscode.Range) : void{
	var selecaoCodigoModificada : string;
	var metodosGetSet : string;
	var regexAlfabetoPythonRetirar : RegExp;
	var palavraPythonComentario : string = "#";
	var palavraPythonAtribuicao : string = "=";

	regexAlfabetoPythonRetirar = / |\bself\b|\.|\bget\b|\bset\b|\(|\)|:|,|\\|\band\b|\bdel\b|\bfrom\b|\bnot\b|\bwhile\b|\bas\b|\belif\b|\bglobal\b|\bor\b|\bwith\b|\bassert\b|\belse\b|\bif\b|\bpass\b|\byield\b|\bbreak\b|\bexcept\b|\bimport\b|\bprint\b|\bclass\b|\bexec\b|\bin\b|\braise\b|\bcontinue\b|\bfinally\b|\bis\b|\breturn\b|\bdef\b|\bfor\b|\blambda\b|\btry\b/g;
	//Retirando palavras do alfabeto das linguagens Python e Ignorar
	selecaoCodigoModificada = retiraPalavrasSelecaoCodigoPython(selecaoCodigo, regexAlfabetoPythonRetirar);
	selecaoCodigoModificada = retiraComentariosSelecaoCodigoPython(selecaoCodigoModificada, palavraPythonComentario);
	console.log("CODIGO MODIFICADO\n" + selecaoCodigoModificada);
	metodosGetSet = geraMetodosGetSetPython(selecaoCodigoModificada, palavraPythonAtribuicao);
	apresentaMetodosGetSetDocument(metodosGetSet, intervaloSelecaoCodigo);
}
function executaExtensaoPythonPorNomesAtributos(intervaloSelecaoCodigo : vscode.Range) : void{
	var valorInputBox : string;
	var atributos : string[];
	var retornoInput : Thenable<string | undefined>;
	var regexBuscaNomeAtributos : RegExp;
	var metodosGetSet : string;
	var configuracaoInputBox : vscode.InputBoxOptions = {
		prompt : msgEntradaAtributosComandoNomeAtributos
	}
	valorInputBox = "";
	retornoInput = vscode.window.showInputBox(configuracaoInputBox);
	retornoInput.then((valorInputBox) => {
		if (valorInputBox == undefined){
			return;
		}
		if (valorInputBox?.toString() == ""){

			vscode.window.showErrorMessage(msgNenhumNomeAtributoComandoNomeAtributos);
			return;
		}
		regexBuscaNomeAtributos = /-| /g;
		atributos = valorInputBox.split(regexBuscaNomeAtributos);
		if (atributos.length == 0){
			vscode.window.showErrorMessage(msgEntradaDadosInputBoxInvalidaComandoNomeAtributos);
			return;
		}
		metodosGetSet = geraMetodosGetSetNomesAtributos(atributos);
		apresentaMetodosGetSetDocument(metodosGetSet, intervaloSelecaoCodigo);		
	});

}
function geraMetodosGetSetNomesAtributos(atributos : string[]) : string{
	var atributoAtual : string;
	var atributoAtualFormatado : string;
	var metodosGetSet : string;
	metodosGetSet = "";
	for(var i = 0; i < atributos.length;i++){
		atributoAtual = atributos[i];
		if (atributoAtual == "")
			continue;
		atributoAtualFormatado = formataNomeAtributoParaNomeMetodoGetSetPython(atributoAtual);
		metodosGetSet += geraMetodoGetPython(atributoAtualFormatado, atributoAtual);
		metodosGetSet += geraMetodoSetPython(atributoAtualFormatado, atributoAtual);
	}
	return metodosGetSet;
}
function apresentaMetodosGetSetDocument(metodosGetSet : string, intervaloSelecao : vscode.Range) : void{	
	var editorTextoAtivo = vscode.window.activeTextEditor;
	var documento = editorTextoAtivo?.edit(editBuilder => {
		editBuilder.insert(intervaloSelecao.end, metodosGetSet);
	})	
}
function retiraComentariosSelecaoCodigoPython(selecaoCodigo : string, palavraComentario : string) : string{
	var indicePalavraComentario : number = 0;
	var indicePalavraQuebraLinha : number = 0;
	var strComentario : string;
	var nomeAtributoAtual : string = "";
	var charAtual : string;

	while(indicePalavraComentario >= 0){
		indicePalavraComentario = selecaoCodigo.indexOf(palavraComentario, 0);
		if (indicePalavraComentario >= 0){
			indicePalavraQuebraLinha = selecaoCodigo.indexOf("\n", indicePalavraComentario);
			if (indicePalavraQuebraLinha < 0){
				indicePalavraQuebraLinha = selecaoCodigo.length;
			}
			strComentario = selecaoCodigo.substring(indicePalavraComentario, indicePalavraQuebraLinha);
			selecaoCodigo = selecaoCodigo.replace(strComentario, "");
		}
		
	}
	return selecaoCodigo;
}
function geraMetodosGetSetPython(selecaoCodigo : string, palavraAtribuicao : string) : string{
	var indiceTokenAtribuicao : number = 0;
	var indiceTokenAnteriorAtribuicao : number = 0;
	var indiceTokenQuebraLinha : number = 0;
	var numeroTokenAtribuicao : number = 0;
	var nomeAtributoAtual : string = "";
	var nomeAtributoAtualFormatado : string = "";
	var metodosGetSet : string = "\n\n";

	while(indiceTokenAtribuicao >= 0){
		indiceTokenAtribuicao = selecaoCodigo.indexOf(palavraAtribuicao, indiceTokenAnteriorAtribuicao + 1);
		if (indiceTokenAtribuicao >= 0){
			if (numeroTokenAtribuicao == 0){
				nomeAtributoAtual = selecaoCodigo.substring(indiceTokenAnteriorAtribuicao, indiceTokenAtribuicao);
				nomeAtributoAtualFormatado = formataNomeAtributoParaNomeMetodoGetSetPython(nomeAtributoAtual);
				metodosGetSet += geraMetodoGetPython(nomeAtributoAtualFormatado, nomeAtributoAtual);
				metodosGetSet += geraMetodoSetPython(nomeAtributoAtualFormatado, nomeAtributoAtual);
				numeroTokenAtribuicao++;
				indiceTokenAnteriorAtribuicao = indiceTokenAtribuicao;
			}else{
				indiceTokenQuebraLinha = selecaoCodigo.indexOf("\n", indiceTokenAnteriorAtribuicao);
				nomeAtributoAtual = selecaoCodigo.substring(indiceTokenQuebraLinha + 1, indiceTokenAtribuicao);
				nomeAtributoAtualFormatado = formataNomeAtributoParaNomeMetodoGetSetPython(nomeAtributoAtual);
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
function formataNomeAtributoParaNomeMetodoGetSetPython(atributo : string) : string{
	return atributo.charAt(0).toUpperCase() + atributo.substring(1, atributo.length);
}
function retiraPalavrasSelecaoCodigoPython(selecaoCodigo : string, regexAlfabetoPythonRetirar : RegExp) : string{	
	return selecaoCodigo = selecaoCodigo.replace(regexAlfabetoPythonRetirar, "");
}
// this method is called when your extension is deactivated
export function deactivate() {}
