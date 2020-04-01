/* 
    ANALIZADOR SINTACTICO
    Lenguaje: C#
*/

var TokenArr;       //ARREGLO DE TOKENS
var ErrorArr;       //ARREGLO DE ERRORES SINTACTICOS
var mainPointer;    //APUNTADOR DE TOKEN EN EL ARREGLO
var ErrorBool;      //INDICA SI HAY ERRORES SINTACTICOS
var PyhtonCode;     //CADENA DE CODIGO PYTHON
var Identacion;     //LLEVA CONTEO DE LA IDENTACION
var VariableArr;    //ARREGLO DE VARIABLES

function inicializarAnalizador(Arreglo){
    TokenArr= Arreglo;
    ErrorArr=[];
    mainPointer=0;
    ErrorBool=false;
    PyhtonCode="";
    Identacion=0;
    VariableArr=[];
    TokenFinal=new Object();
    TokenFinal.Tipo="FINAL";
    TokenArr.push(TokenFinal);
    beginAnalysis();
}


function beginAnalysis(){    
    //SE VACIA TABLA DE ERRORES SINTACTICOS Y VARIBALES
    document.getElementById("tableBodySintacticos").innerHTML="";
    document.getElementById("tableBodyVar").innerHTML="";
    //SE VACIA CODIGO DE PYTHON
    document.getElementById("txtPython").innerHTML="";

    nextSentencia();
    showVariables(VariableArr);
    document.getElementById("txtPython").innerHTML=PyhtonCode;
}

//COMIENZA FUNCIONES DE SENTENCIAS Y BLOQUES

function sentenciaCometario(){
    if(matchToken("COMENTARIO",mainPointer)){
        appendPythonCode("#"+getLexema(mainPointer-1)+"\n");
    }
    nextSentencia();
}

function sentenciaCometarioMulti(){
    if(matchToken("COMENTARIO_MULTI",mainPointer)){
        appendPythonCode("\"\"\""+getLexema(mainPointer-1)+"\"\"\"\n");
    }
    nextSentencia();
}

function sentenciaDeclaracion(){
    mainPointer++;
    if(nextToken("ID",mainPointer)){
        matchToken("ID",mainPointer);
        //PARA DECLARACION INDIVIDUAL
        if(nextToken("PUNTO_COMA",mainPointer)){
            matchToken("PUNTO_COMA",mainPointer);
            appendPythonCode(tabulador(Identacion)+"var "+getLexema(mainPointer-2)+"\n");
            addVariable(TokenArr[mainPointer-2],getLexema(mainPointer-3));
        }
        //PARA DECLARACION Y ASIGNACION INDIVIDUAL
        else if(nextToken("SIGNO_IGUAL",mainPointer)){
            matchToken("SIGNO_IGUAL",mainPointer);
            appendPythonCode(tabulador(Identacion)+"var "+getLexema(mainPointer-2)+" = ");
            addVariable(TokenArr[mainPointer-2],getLexema(mainPointer-3));
            if(sentenciaExpresion()){
                matchToken("PUNTO_COMA",mainPointer);
                appendPythonCode("\n");
            }
        }
        //PARA DECLARACION EN GRUPO
        else if(nextToken("COMA",mainPointer)){
            var tipoVar=getLexema(mainPointer-2);
            appendPythonCode(tabulador(Identacion)+"var "+getLexema(mainPointer-1)+",");
            addVariable(TokenArr[mainPointer-1],tipoVar);
            matchToken("COMA",mainPointer);
            while(true){
                if(matchToken("ID",mainPointer)){
                    appendPythonCode(getLexema(mainPointer-1));
                    addVariable(TokenArr[mainPointer-1],tipoVar);
                    if(nextToken("COMA",mainPointer)){
                        matchToken("COMA",mainPointer);
                        appendPythonCode(",");
                    }
                    else{
                        if(matchToken("PUNTO_COMA",mainPointer)){
                            appendPythonCode("\n");
                            break;
                        }
                    }
                }
            }

        }
        //PARA DECLARACION DE FUNCIONES
        else if(nextToken("ABRE_PARENTESIS",mainPointer)){
            matchToken("ABRE_PARENTESIS",mainPointer);
            appendPythonCode(tabulador(Identacion)+"def "+getLexema(mainPointer-2)+"(");
            if(sentenciaParametros()){
                matchToken("CIERRA_PARENTESIS",mainPointer);
                appendPythonCode(")");
                if(matchToken("ABRE_LLAVE",mainPointer)){
                    appendPythonCode(":\n");
                    Identacion++;
                    nextSentencia();
                    if(matchToken("CIERRA_LLAVE",mainPointer)){
                        Identacion--;
                    }
                }
            }
        }

        else{
            matchToken("PUNTO_COMA",mainPointer)
        }
    }
    else{
        matchToken("ID",mainPointer);
    }
    nextSentencia();
}

function sentenciaIf(){
    mainPointer++;
    if(nextToken("ABRE_PARENTESIS",mainPointer)){
        matchToken("ABRE_PARENTESIS",mainPointer);
        appendPythonCode(tabulador(Identacion)+"if ");
        if(sentenciaArgumentos()){
            if(matchToken("ABRE_LLAVE",mainPointer)){
                appendPythonCode(":\n");
                Identacion++;
                nextSentencia();
                if(matchToken("CIERRA_LLAVE",mainPointer)){
                    Identacion--;
                }
                if(nextToken("RSV_ELSE",mainPointer)){
                    sentenciaElse();
                }
            }  
        }
    }
    else{
        matchToken("ABRE_PARENTESIS",mainPointer);
    }
    nextSentencia();
}

function sentenciaWhile(){
    mainPointer++;
    if(nextToken("ABRE_PARENTESIS",mainPointer)){
        matchToken("ABRE_PARENTESIS",mainPointer);
        appendPythonCode(tabulador(Identacion)+"while ");
        if(sentenciaArgumentos()){
            if(matchToken("ABRE_LLAVE",mainPointer)){
                appendPythonCode(":\n");
                Identacion++;
                nextSentencia();
                if(matchToken("CIERRA_LLAVE",mainPointer)){
                    Identacion--;
                }
            }  
        }
    }
    else{
        matchToken("ABRE_PARENTESIS",mainPointer);
    }
    nextSentencia();
}

function sentenciaElse(){
    matchToken("RSV_ELSE",mainPointer);
    if(nextToken("RSV_IF",mainPointer)){
        matchToken("RSV_IF",mainPointer);
        if(nextToken("ABRE_PARENTESIS",mainPointer)){
            matchToken("ABRE_PARENTESIS",mainPointer);
            appendPythonCode(tabulador(Identacion)+"elif ");
            if(sentenciaArgumentos()){
                if(matchToken("ABRE_LLAVE",mainPointer)){
                    appendPythonCode(":\n");
                    Identacion++;
                    nextSentencia();
                    if(matchToken("CIERRA_LLAVE",mainPointer)){
                        Identacion--;
                    }
                    if(nextToken("RSV_ELSE",mainPointer)){
                        sentenciaElse();
                    }
                }  
            }
        }
        else{
            matchToken("ABRE_PARENTESIS",mainPointer);
        }
    }
    else{
        if(matchToken("ABRE_LLAVE",mainPointer)){
            appendPythonCode(tabulador(Identacion)+"else:\n");
            Identacion++;
            nextSentencia();
            if(matchToken("CIERRA_LLAVE",mainPointer)){
                Identacion--;
            }
        }
    }
    nextSentencia();
}

function sentenciaParametros(){

    if(nextToken("CIERRA_PARENTESIS",mainPointer)){
        return true;
    }

    while(true){

        if(!matchTipoDato()){
            return false;
        }
        if(!matchToken("ID",mainPointer)){
            return false;
        }
        else{
            appendPythonCode(getLexema(mainPointer-1));
            if(nextToken("CIERRA_PARENTESIS",mainPointer)){
                return true;
            }
        }
        if(nextToken("COMA",mainPointer)){
            if(!nextToken("CIERRA_PARENTESIS",mainPointer+1)){
                appendPythonCode(",");
                matchToken("COMA",mainPointer);
            }
        }
        else{
            return matchToken("COMA",mainPointer);
        }

    }

}

function sentenciaExpresion(){
    while(true){
        
        if(nextToken("NUMERO",mainPointer)){
            matchToken("NUMERO",mainPointer);
            appendPythonCode(getLexema(mainPointer-1));
            if(nextToken("PUNTO_COMA",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return false;
            }
        }
        else if(nextToken("ID",mainPointer)){
            matchToken("ID",mainPointer);        
            if(nextToken("ABRE_PARENTESIS",mainPointer)){
                //FALTA LLAMADA A FUNCIONES
            }
            appendPythonCode(getLexema(mainPointer-1));
            if(nextToken("PUNTO_COMA",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return false;
            }
        }
        else if(nextToken("CADENA",mainPointer)){
            matchToken("CADENA",mainPointer);
            appendPythonCode("\""+getLexema(mainPointer-1)+"\"");
            if(nextToken("PUNTO_COMA",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return false;
            }
        }

        else{
            return matchToken("EXPRESION",mainPointer);
        }
    }
}

function sentenciaDeclaracionMetodo(){
    mainPointer++;
    if(nextToken("ID",mainPointer)){
        matchToken("ID",mainPointer);
        //PARA DECLARACION DE FUNCIONES
        if(nextToken("ABRE_PARENTESIS",mainPointer)){
            matchToken("ABRE_PARENTESIS",mainPointer);
            appendPythonCode(tabulador(Identacion)+"def "+getLexema(mainPointer-2)+"(");
            if(sentenciaParametros()){
                matchToken("CIERRA_PARENTESIS",mainPointer);
                appendPythonCode(")");
                if(matchToken("ABRE_LLAVE",mainPointer)){
                    appendPythonCode(":\n");
                    Identacion++;
                    nextSentencia();
                    if(matchToken("CIERRA_LLAVE",mainPointer)){
                        Identacion--;
                    }
                }
            }
        }
        //FALTA DECLARACION DEL MAIN
    }
    else{
        matchToken("ID",mainPointer);
    }
    nextSentencia();
}

function sentenciaArgumentos(){

    while(true){

        if(nextToken("SIGNO_EXCLAMATIVO",mainPointer)){
            appendPythonCode(" not ");
            matchToken("SIGNO_EXCLAMATIVO",mainPointer)
        }
    
        if(matchToken("ID",mainPointer)){
            appendPythonCode(getLexema(mainPointer-1));
        }else{return false}
    
        if(matchRelacional()){                        
        }else{return false}
    
        if(matchToken("ID",mainPointer)){
            appendPythonCode(getLexema(mainPointer-1));
        }else{return false}
    
        if(nextToken("SIGNO_AMPERSAND",mainPointer)
        ||nextToken("SIGNO_EXCLAMATIVO",mainPointer)
        ||nextToken("SIGNO_BARRA",mainPointer)){
            matchLogicos();
        }

        else {
            return matchToken("CIERRA_PARENTESIS",mainPointer);
        }
    }

}

function matchOperador(){
    if(nextToken("SIGNO_MAS",mainPointer)){
        matchToken("SIGNO_MAS",mainPointer);
        appendPythonCode("+");
        return true;
    }
    else if(nextToken("SIGNO_MENOS",mainPointer)){
        matchToken("SIGNO_MENOS",mainPointer);
        appendPythonCode("-");
        return true;
    }
    else if(nextToken("SIGNO_MULTIPLICACION",mainPointer)){
        matchToken("SIGNO_MULTIPLICACION",mainPointer);
        appendPythonCode("*");
        return true;
        
    } 
    else if(nextToken("SIGNO_DIVISION",mainPointer)){
        matchToken("SIGNO_DIVISION",mainPointer);
        appendPythonCode("/");
        return true;
    }
    else{
        matchToken("OPERADOR ARITMETICO",mainPointer);
        return false;
    }
}

function matchTipoDato(){
    if(nextToken("RSV_INT",mainPointer)){
        matchToken("RSV_INT",mainPointer);
        return true;
    }
    else if(nextToken("RSV_DOUBLE",mainPointer)){
        imatchToken("RSV_DOUBLE",mainPointer);
        return true;
        
    }
    else if(nextToken("RSV_CHAR",mainPointer)){
        matchToken("RSV_CHAR",mainPointer);
        return true;
    }
    else if(nextToken("RSV_BOOL",mainPointer)){
        matchToken("RSV_BOOL",mainPointer);
        return true;
        
    }
    else if(nextToken("RSV_STRING",mainPointer)){
        matchToken("RSV_STRING",mainPointer);
        return true;
        
    }
    else{
        matchToken("TIPO DATO",mainPointer);
        return false;
    }

}

function matchRelacional(){
    if(nextToken("SIGNO_MAYOR",mainPointer)){
        matchToken("SIGNO_MAYOR",mainPointer);
        appendPythonCode(">");
        if(nextToken("SIGNO_IGUAL",mainPointer)){
            matchToken("SIGNO_IGUAL",mainPointer);
            appendPythonCode("=");
        }
        return true;
        
    }
    else if(nextToken("SIGNO_MENOR",mainPointer)){
        matchToken("SIGNO_MENOR",mainPointer);
        appendPythonCode("<");
        if(nextToken("SIGNO_IGUAL",mainPointer)){
            matchToken("SIGNO_IGUAL",mainPointer);
            appendPythonCode("=");
        }
        return true;
        
    }
    else if(nextToken("SIGNO_EXCLAMATIVO",mainPointer)){
        matchToken("SIGNO_EXCLAMATIVO",mainPointer);
        appendPythonCode("!");
        appendPythonCode("=");
        return matchToken("SIGNO_IGUAL",mainPointer);
    } 
    else if(nextToken("SIGNO_IGUAL",mainPointer)){
        matchToken("SIGNO_IGUAL",mainPointer);
        appendPythonCode("=");
        appendPythonCode("=");
        return matchToken("SIGNO_IGUAL",mainPointer);
        
    } 
    else{
        matchToken("OPERADOR RELACIONAL",mainPointer);
        return false;
    }
}

function matchLogicos(){
    if(nextToken("SIGNO_AMPERSAND",mainPointer)){
        matchToken("SIGNO_AMPERSAND",mainPointer);
        appendPythonCode(" and ");
        return  matchToken("SIGNO_AMPERSAND",mainPointer);
        
    }
    else if(nextToken("SIGNO_BARRA",mainPointer)){
        matchToken("SIGNO_BARRA",mainPointer);
        appendPythonCode(" or ");
        return  matchToken("SIGNO_BARRA",mainPointer);
        
    }
    else if(nextToken("SIGNO_EXCLAMATIVO",mainPointer)){
        matchToken("SIGNO_EXCLAMATIVO",mainPointer);
        appendPythonCode(" not ");         
        return true;
        
  }
    else{
        matchToken("OPERADOR RELACIONAL",mainPointer);
        return false;
    }
}



//TERMINAN FUNCIONES DE SENTENCIAS Y BLOQUES


//DEFINE QUE BLOQUE O SENTENCIA SIGUE EN EL ANALISIS
function nextSentencia(){
    if(nextToken("COMENTARIO",mainPointer)){
        sentenciaCometario();
    }
    else if(nextToken("COMENTARIO_MULTI",mainPointer)){
        sentenciaCometarioMulti();
    }
    else if(nextToken("RSV_INT",mainPointer) ||nextToken("RSV_DOUBLE",mainPointer)
    ||nextToken("RSV_CHAR",mainPointer) ||nextToken("RSV_BOOL",mainPointer)
    ||nextToken("RSV_STRING",mainPointer)){
        sentenciaDeclaracion();
    }
    else if(nextToken("RSV_VOID",mainPointer)){
        sentenciaDeclaracionMetodo();
    }
    else if(nextToken("RSV_IF",mainPointer)){
        sentenciaIf();
    }
    else if(nextToken("RSV_WHILE",mainPointer)){
        sentenciaWhile();
    }
}

//COMPARA TOKEN CON EL SIGUIENTE TOKEN A LEER
function nextToken(TokenEsperado,Pointer){
    var tempToken = TokenArr[Pointer];
    if (tempToken.Tipo!="FINAL")
    {
        if (TokenEsperado==tempToken.Tipo)
        {
            return true;
        }
        else
        {
          return false;
        }
    }
    else { return false; }
}

//HACE MATCH CON EL SIGUIENTE TOKEN A LEER Y DEVUELVE BOOL
function matchToken(TokenEsperado,Pointer){
    var tempToken = TokenArr[Pointer];

    if (TokenEsperado==tempToken.Tipo)
    {
        mainPointer++;
        return true;
    }
    else
    {
        catchError(tempToken,TokenEsperado);
        return false;
    }
}

//OBTIENE LEXEMA DE UN TOKEN
function getLexema(Pointer){
    var tempToken = TokenArr[Pointer];
    return tempToken.Lexema;
}

//CONCATENA LAS INSTRUCCIONES EN PYTHON
function appendPythonCode(codeString){
    PyhtonCode=PyhtonCode+codeString;
}

//AGREGA UNA VARIABLE AL ARREGLO
function addVariable(IDToken,Tipo){
    var TempVar = new Object();
    TempVar.ID=IDToken.Lexema;
    TempVar.Linea= IDToken.Fila;
    TempVar.Tipo= Tipo;
    VariableArr.push(TempVar);
}

//REGRESA UN STRING CON n TABULACIONES
function tabulador(n){
    
    if (n==0)
    {
        return "";
    }
    var aux = "";
    for (var i = 0; i < n; i++)
    {
        aux = aux + "\t";
    }
    return aux;
}

//RECUPERA DE UN ERROR SINTACTICO
function catchError(tokenError,tokenEsperado){

    //MODO PANICO

    do{
        var tempToken = TokenArr[mainPointer];
        mainPointer++;
    }while(tempToken.Tipo!="PUNTO_COMA");

    var Error = new Object();
    Error.Fila=tokenError.Fila;
    Error.Columna=tokenError.Columna;
    Error.Token=tokenEsperado;
    Error.ErrToken=tokenError.Tipo;
    ErrorArr.push(Error);
    ErrorBool=true;
    showErroresSintacticos(ErrorArr);
}

function showErroresSintacticos(Arreglo){
    var NewRow;
    var NewColumn;

    for(var i =0;i<Arreglo.length;i++){

        NewRow=document.createElement("tr");

        NewColumn=document.createElement("th");
        NewColumn.innerHTML=i
        NewRow.appendChild(NewColumn);

        NewColumn=document.createElement("td");
        NewColumn.innerHTML=Arreglo[i].Fila
        NewRow.appendChild(NewColumn);

        NewColumn=document.createElement("td");
        NewColumn.innerHTML=Arreglo[i].Columna
        NewRow.appendChild(NewColumn);

        NewColumn=document.createElement("td");
        NewColumn.innerHTML="No se esperaba \""+Arreglo[i].ErrToken+"\"\n"+"Se esperaba \""+Arreglo[i].Token+"\"\n"
        NewRow.appendChild(NewColumn);

        document.getElementById("tableBodySintacticos").appendChild(NewRow);
    }
}

function showVariables(Arreglo){
    var NewRow;
    var NewColumn;

    for(var i =0;i<Arreglo.length;i++){

        NewRow=document.createElement("tr");

        NewColumn=document.createElement("th");
        NewColumn.innerHTML=Arreglo[i].ID
        NewRow.appendChild(NewColumn);

        NewColumn=document.createElement("td");
        NewColumn.innerHTML=Arreglo[i].Tipo
        NewRow.appendChild(NewColumn);

        NewColumn=document.createElement("td");
        NewColumn.innerHTML=Arreglo[i].Linea
        NewRow.appendChild(NewColumn);

        document.getElementById("tableBodyVar").appendChild(NewRow);
    }
 }
