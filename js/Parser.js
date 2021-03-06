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
var HTMLCode;       //CADENA DE CODIGO HTML RECOPILADO
var JSONCode;       //CADENA DE CODIGO JSON TRADUCIDO
var IdentacionJSON; //LLEVA CONTEO DE LA IDENTACION EN JSON

var FuncionBool;    //INDICA SI SE ESTA ADENTRO DE UNA FUNCION
var MetodoBool;     //INDICA SI SE ESTA ADENTRO DE UN METODO
var FuncionBool2;    //INDICA SI SE ESTA ADENTRO DE UNA FUNCION
var MetodoBool2;     //INDICA SI SE ESTA ADENTRO DE UN METODO
var RepeticionBool; //INDICA SI SE ESTA ADENTRO DE UNA SENTENCIA DE REPETICION
var SwitchBool;     //INDICA SI SE ESTA ADENTRO DE UN SWITCH

function inicializarAnalizador(Arreglo){
    TokenArr= Arreglo;
    ErrorArr=[];
    mainPointer=0;
    ErrorBool=false;
    PyhtonCode="";
    HTMLCode="";
    Identacion=0;
    VariableArr=[];
    TokenFinal=new Object();
    TokenFinal.Tipo="FINAL";
    TokenArr.push(TokenFinal);
    FuncionBool=false;
    MetodoBool=false;
    beginAnalysis();
}


function beginAnalysis(){    
    //SE VACIA TABLA DE ERRORES SINTACTICOS,LEXICOS Y VARIBALES
    document.getElementById("tableBodyLexicos").innerHTML="";
    document.getElementById("tableBodySintacticos").innerHTML="";
    document.getElementById("tableBodyVar").innerHTML=""
    
    //SE VACIA CODIGO DE PYTHON,HTML Y JSON
    document.getElementById("txtPython").innerHTML="";
    document.getElementById("txtHTML").innerHTML="";
    document.getElementById("txtJSON").innerHTML="";

    nextSentencia();

    showVariables(VariableArr);
    if(ErrorBool){
        showErroresSintacticos(ErrorArr);
    }
    document.getElementById("txtPython").innerHTML=PyhtonCode;
    document.getElementById("txtHTML").innerHTML=HTMLCode;
    translateHTML();
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
            //appendPythonCode(tabulador(Identacion)+"var "+getLexema(mainPointer-2)+"\n");
            //addVariable(TokenArr[mainPointer-2],getLexema(mainPointer-3));
        }
        //PARA DECLARACION Y ASIGNACION INDIVIDUAL
        else if(nextToken("SIGNO_IGUAL",mainPointer)){
            matchToken("SIGNO_IGUAL",mainPointer);
            //SE QUITO PALABRA VAR
            appendPythonCode(tabulador(Identacion)+getLexema(mainPointer-2)+" = ");
            addVariable(TokenArr[mainPointer-2],getLexema(mainPointer-3));
            if(sentenciaExpresion()){
                matchToken("PUNTO_COMA",mainPointer);
                appendPythonCode("\n");
            }
        }
        //PARA DECLARACION EN GRUPO
        else if(nextToken("COMA",mainPointer)){
            var tipoVar=getLexema(mainPointer-2);
            //SE QUITO PALABRA VAR
            appendPythonCode(tabulador(Identacion)+getLexema(mainPointer-1)+",");
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
                        break;
                    }
                }
            }
            if(nextToken("PUNTO_COMA",mainPointer)){
                matchToken("PUNTO_COMA",mainPointer);
                appendPythonCode("\n");
            }
            else{
                matchToken("SIGNO_IGUAL",mainPointer);
                //SE QUITO PALABRA VAR
                appendPythonCode(" = ");
                if(sentenciaExpresion()){
                    matchToken("PUNTO_COMA",mainPointer);
                    appendPythonCode("\n");
                }
            }

        }
        //PARA DECLARACION DE FUNCIONES
        else if(nextToken("ABRE_PARENTESIS",mainPointer)&&!FuncionBool2&&!MetodoBool2){
            matchToken("ABRE_PARENTESIS",mainPointer);
            appendPythonCode(tabulador(Identacion)+"def "+getLexema(mainPointer-2)+"(");
            if(sentenciaParametros()){
                matchToken("CIERRA_PARENTESIS",mainPointer);
                appendPythonCode(")");
                if(matchToken("ABRE_LLAVE",mainPointer)){
                    appendPythonCode(":\n");
                    Identacion++;
                    FuncionBool=true;
                    FuncionBool2=true;
                    nextSentencia();
                    FuncionBool2=false;
                    //SI FUNCION BOOL ES FALSE SE HIZO MATCH CON RETURN
                    if(FuncionBool){
                        matchToken("RSV_RETURN",mainPointer); 
                    }
                    else if(matchToken("CIERRA_LLAVE",mainPointer)){
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

function sentenciaAsignacion(){
    if(nextToken("ID",mainPointer)){
        matchToken("ID",mainPointer);
        //PARA DECLARACION Y ASIGNACION INDIVIDUAL
        if(nextToken("SIGNO_IGUAL",mainPointer)){
            matchToken("SIGNO_IGUAL",mainPointer);
            //SE QUITO PALABRA VAR
            appendPythonCode(tabulador(Identacion)+getLexema(mainPointer-2)+" = ");
            if(sentenciaExpresion()){
                matchToken("PUNTO_COMA",mainPointer);
                appendPythonCode("\n");
            }
        }
        else{
            matchToken("SIGNO_IGUAL",mainPointer);
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
                RepeticionBool=true;
                nextSentencia();
                RepeticionBool=false;
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

function sentenciaReturn(){
    if(nextToken("PUNTO_COMA",mainPointer+1)){
        if(matchToken("RSV_RETURN",mainPointer)){
            appendPythonCode(tabulador(Identacion)+"return \n");
            matchToken("PUNTO_COMA",mainPointer);
            MetodoBool=false;
            nextSentencia();
        }
    }
    else {
        if(matchToken("RSV_RETURN",mainPointer)){
            appendPythonCode(tabulador(Identacion)+"return ");
            if(sentenciaExpresion()){
                matchToken("PUNTO_COMA",mainPointer);
                appendPythonCode("\n");
                FuncionBool=false;
                nextSentencia();
            }
        }
    }
}

function sentenciaDeclaracionMetodo(){
    mainPointer++;
    if(nextToken("ID",mainPointer)&&!MetodoBool2&&!FuncionBool2){
        matchToken("ID",mainPointer);
        if(nextToken("ABRE_PARENTESIS",mainPointer)){
            matchToken("ABRE_PARENTESIS",mainPointer);
            appendPythonCode(tabulador(Identacion)+"def "+getLexema(mainPointer-2)+"(");
            if(sentenciaParametros()){
                matchToken("CIERRA_PARENTESIS",mainPointer);
                appendPythonCode(")");
                if(matchToken("ABRE_LLAVE",mainPointer)){
                    appendPythonCode(":\n");
                    Identacion++;
                    MetodoBool=true;
                    MetodoBool2=true;
                    nextSentencia();
                    MetodoBool2=false;
                    if(MetodoBool){
                        matchToken("RSV_RETURN",mainPointer); 
                    }
                    else if(matchToken("CIERRA_LLAVE",mainPointer)){
                        Identacion--;
                    }
                }
            }
        }
    }
    else if(nextToken("RSV_MAIN",mainPointer)){
        matchToken("RSV_MAIN",mainPointer);
        if(nextToken("ABRE_PARENTESIS",mainPointer)){
            matchToken("ABRE_PARENTESIS",mainPointer);
            appendPythonCode(tabulador(Identacion)+"def "+getLexema(mainPointer-2)+"(");
            if(matchToken("CIERRA_PARENTESIS",mainPointer)){
                appendPythonCode(")");
                if(matchToken("ABRE_LLAVE",mainPointer)){
                    appendPythonCode(":\n");
                    Identacion++;
                    nextSentencia();
                    if(matchToken("CIERRA_LLAVE",mainPointer)){
                        Identacion--;
                        appendPythonCode(tabulador(Identacion)+"if__name__=\"__main__\":\n");
                        Identacion++;
                        appendPythonCode(tabulador(Identacion)+"main()\n");
                        Identacion--;
                    }                   
                }
            }
        }
    }
    else{
        matchToken("ID",mainPointer);
    }
    nextSentencia();
}

function sentenciaConsole(){
    matchToken("RSV_CONSOLE",mainPointer);

    if(matchToken("PUNTO",mainPointer)){
    }else{nextSentencia();}

    if(matchToken("RSV_WRITE",mainPointer)){
    }else{nextSentencia();}

    if(matchToken("ABRE_PARENTESIS",mainPointer)){
        appendPythonCode(tabulador(Identacion)+"print(");
    }else{nextSentencia();}

    while(true){

        if(nextToken("CADENA",mainPointer)){
            matchToken("CADENA",mainPointer);
            appendPythonCode("\""+getLexema(mainPointer-1)+"\"" );
        }
        else if(nextToken("CADENA_HTML",mainPointer)){
            matchToken("CADENA_HTML",mainPointer);
            appendPythonCode("\""+getLexema(mainPointer-1)+"\"" );
            appendHTMLCode(getLexema(mainPointer-1));
        }
        else if(nextToken("ID",mainPointer)){
            matchToken("ID",mainPointer);
            appendPythonCode(getLexema(mainPointer-1));
        }
        else if(nextToken("NUMERO",mainPointer)){
            matchToken("NUMERO",mainPointer);
            appendPythonCode("str("+getLexema(mainPointer-1)+")");
        }
        if(nextToken("SIGNO_MAS",mainPointer)){
            matchToken("SIGNO_MAS",mainPointer);
            appendPythonCode(",");
            //if(matchToken("ID",mainPointer)){
            //    appendPythonCode(","+getLexema(mainPointer-1));
            //}else{nextSentencia();}
        }else{break;}

    }
    if(matchToken("CIERRA_PARENTESIS",mainPointer)){
        appendPythonCode(")\n");
    }else{nextSentencia();}

    if(matchToken("PUNTO_COMA",mainPointer)){
    }else{nextSentencia();}

    nextSentencia();
    
}

function sentenciaDoWhile(){
    mainPointer++;
    if(matchToken("ABRE_LLAVE",mainPointer)){
        appendPythonCode(tabulador(Identacion)+"while TRUE:\n");
        Identacion++;
        RepeticionBool=true;
        nextSentencia();
        RepeticionBool=false;
        if(matchToken("CIERRA_LLAVE",mainPointer)){
            if(matchToken("RSV_WHILE",mainPointer)){
                if(matchToken("ABRE_PARENTESIS",mainPointer)){
                    appendPythonCode(tabulador(Identacion)+"if(");
                    if(sentenciaArgumentos()){
                        appendPythonCode("):\n");
                        appendPythonCode(tabulador(Identacion+1)+"break\n");
                        Identacion--;
                    }
                }
            }
        }
    }
    nextSentencia();
}

function sentenciaFor(){
    mainPointer++;
    appendPythonCode(tabulador(Identacion)+"for ");
    if(matchToken("ABRE_PARENTESIS",mainPointer)){
        if(sentenciaArgumentosFor()){
            if(matchToken("ABRE_LLAVE",mainPointer)){
                appendPythonCode(":\n");
                Identacion++;
                RepeticionBool=true;
                nextSentencia();
                RepeticionBool=false;
                if(matchToken("CIERRA_LLAVE",mainPointer)){
                    Identacion--;
                }
            } 
        }
    }
    nextSentencia();
}

function sentenciaSwitch(){
    mainPointer++;
    if(matchToken("ABRE_PARENTESIS",mainPointer)){
        if(argumentosSwitch()){
            if(matchToken("CIERRA_LLAVE",mainPointer)){
                Identacion--;
            }
        }
    }
    else{
        matchToken("ABRE_PARENTESIS",mainPointer);
    }
    nextSentencia();
}

function argumentosSwitch(){
    if(matchToken("ID",mainPointer)){
        appendPythonCode(tabulador(Identacion)+"def switch(case,"+getLexema(mainPointer-1)+"):\n");
        Identacion++;
    }else{return false}

    if(matchToken("CIERRA_PARENTESIS",mainPointer)){
    }else{return false}

    if(matchToken("ABRE_LLAVE",mainPointer)){
        appendPythonCode(tabulador(Identacion)+"switcher={\n");
        Identacion++;
    }else{return false}

    while(true){

        if(matchToken("RSV_CASE",mainPointer)){
        }else{return false}

        if(matchToken("NUMERO",mainPointer)){
            appendPythonCode(tabulador(Identacion)+getLexema(mainPointer-1)+":");
        }else{return false}

        if(matchToken("DOS_PUNTOS",mainPointer)){
        }else{return false}

        while(true){
            if(matchToken("ID",mainPointer)){
                appendPythonCode(getLexema(mainPointer-1));
            }else{return false}

            if(matchToken("SIGNO_IGUAL",mainPointer)){
                appendPythonCode("=");
            }else{return false}

            if(sentenciaExpresion()){
                matchToken("PUNTO_COMA",mainPointer)
                appendPythonCode(";");
            }else{return false}

            if(!nextToken("ID",mainPointer)){
                appendPythonCode("\n");
                break;
            }
        }
        if(nextToken("RSV_BREAK",mainPointer)){
            matchToken("RSV_BREAK",mainPointer);
            if(matchToken("PUNTO_COMA",mainPointer)){
            }else{return false}
        }

        if(nextToken("RSV_DEFAULT",mainPointer)){
            Identacion--;
            matchToken("RSV_DEFAULT",mainPointer);
            if(matchToken("DOS_PUNTOS",mainPointer)){
            }else{return false}
            appendPythonCode(tabulador(Identacion)+"}\n");
            nextSentencia();
            return true;
        }

        if(nextToken("CIERRA_LLAVE",mainPointer)){
            Identacion--;
            appendPythonCode(tabulador(Identacion)+"}\n");
            return true;
        }
    }
}

//Expresiones Aritmeticas
function sentenciaExpresion(){
    var ParentesisCont=0;
    while(true){
        
        if(nextToken("ABRE_PARENTESIS",mainPointer)){
            appendPythonCode("(");
            matchToken("ABRE_PARENTESIS",mainPointer)
            ParentesisCont++;
        }
        if(nextToken("NUMERO",mainPointer)){
            matchToken("NUMERO",mainPointer);
            appendPythonCode(getLexema(mainPointer-1));
            if(nextToken("PUNTO",mainPointer)){
                matchToken("PUNTO",mainPointer);
                appendPythonCode(getLexema(mainPointer-1));
                if(!matchToken("NUMERO",mainPointer)){
                    return false;
                }
                else{
                    appendPythonCode(getLexema(mainPointer-1));
                }
            }
            if(nextToken("CIERRA_PARENTESIS",mainPointer)){
                if(ParentesisCont>0){
                    appendPythonCode(")");
                    matchToken("CIERRA_PARENTESIS",mainPointer)
                    ParentesisCont--;
                }
                else{
                    return matchToken("PUNTO_COMA",mainPointer);
                }
            }
            if(nextToken("PUNTO_COMA",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return matchToken("PUNTO_COMA",mainPointer);
            }
        }
        else if(nextToken("ID",mainPointer)){
            matchToken("ID",mainPointer);       
            appendPythonCode(getLexema(mainPointer-1)); 
            if(nextToken("ABRE_PARENTESIS",mainPointer)){
                matchToken("ABRE_PARENTESIS",mainPointer);
                appendPythonCode(getLexema(mainPointer-1));
                if(argumentosLlamadaFuncion()){
                    appendPythonCode(")");
                    matchToken("CIERRA_PARENTESIS",mainPointer);
                } 
            }
            if(nextToken("CIERRA_PARENTESIS",mainPointer)){
                if(ParentesisCont>0){
                    appendPythonCode(")");
                    matchToken("CIERRA_PARENTESIS",mainPointer)
                    ParentesisCont--;
                }
                else{
                    return matchToken("PUNTO_COMA",mainPointer);
                }
            }
            if(nextToken("PUNTO_COMA",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return matchToken("PUNTO_COMA",mainPointer);
            }
        }
        else if(nextToken("RSV_TRUE",mainPointer)){
            matchToken("RSV_TRUE",mainPointer);
            appendPythonCode(getLexema(mainPointer-1));
            if(nextToken("CIERRA_PARENTESIS",mainPointer)){
                if(ParentesisCont>0){
                    appendPythonCode(")");
                    matchToken("CIERRA_PARENTESIS",mainPointer)
                    ParentesisCont--;
                }
                else{
                    return matchToken("PUNTO_COMA",mainPointer);
                }
            }
            if(nextToken("PUNTO_COMA",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return matchToken("PUNTO_COMA",mainPointer);
            }
        }
        else if(nextToken("RSV_FALSE",mainPointer)){
            matchToken("RSV_FALSE",mainPointer);
            appendPythonCode(getLexema(mainPointer-1));
            if(nextToken("CIERRA_PARENTESIS",mainPointer)){
                if(ParentesisCont>0){
                    appendPythonCode(")");
                    matchToken("CIERRA_PARENTESIS",mainPointer)
                    ParentesisCont--;
                }
                else{
                    return matchToken("PUNTO_COMA",mainPointer);
                }
            }
            if(nextToken("PUNTO_COMA",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return matchToken("PUNTO_COMA",mainPointer);
            }
        }
        else if(nextToken("CADENA",mainPointer)){
            matchToken("CADENA",mainPointer);
            appendPythonCode("\""+getLexema(mainPointer-1)+"\"");
            if(nextToken("CIERRA_PARENTESIS",mainPointer)){
                if(ParentesisCont>0){
                    appendPythonCode(")");
                    matchToken("CIERRA_PARENTESIS",mainPointer)
                    ParentesisCont--;
                }
                else{
                    return matchToken("PUNTO_COMA",mainPointer);
                }
            }
            if(nextToken("PUNTO_COMA",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return matchToken("PUNTO_COMA",mainPointer);
            }
        }
        else if(nextToken("CADENA_HTML",mainPointer)){
            matchToken("CADENA_HTML",mainPointer);
            appendPythonCode("\""+getLexema(mainPointer-1)+"\"");
            if(nextToken("CIERRA_PARENTESIS",mainPointer)){
                if(ParentesisCont>0){
                    appendPythonCode(")");
                    matchToken("CIERRA_PARENTESIS",mainPointer)
                    ParentesisCont--;
                }
                else{
                    return matchToken("PUNTO_COMA",mainPointer);
                }
            }
            if(nextToken("PUNTO_COMA",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return matchToken("PUNTO_COMA",mainPointer);
            }
        }
        //FALTA (())
        else{
            return matchToken("EXPRESION",mainPointer);
        }
    }
}

//Argumentos de Ciclo For
function sentenciaArgumentosFor(){

    if(matchTipoDato()){
    }else{return false}

    if(matchToken("ID",mainPointer)){
        appendPythonCode(getLexema(mainPointer-1)+" ");
    }else{return false}

    if(matchToken("SIGNO_IGUAL",mainPointer)){
        appendPythonCode("in ");
    }else{return false}

    if(matchToken("NUMERO",mainPointer)){
        appendPythonCode("range ("+getLexema(mainPointer-1));
    }else{return false}

    if(matchToken("PUNTO_COMA",mainPointer)){
    }else{return false}

    if(matchToken("ID",mainPointer)){
    }else{return false}

    if(matchRelacionalFor()){
    }else{return false}

    if(matchToken("PUNTO_COMA",mainPointer)){
    }else{return false}

    if(matchToken("ID",mainPointer)){
    }else{return false}

    if(nextToken("SIGNO_MAS",mainPointer)){
        if(matchToken("SIGNO_MAS",mainPointer)){
        }else{return false}
    
        if(matchToken("SIGNO_MAS",mainPointer)){
        }else{return false}
        appendPythonCode(")");
    }
    else if(nextToken("SIGNO_MENOS",mainPointer)){
        if(matchToken("SIGNO_MENOS",mainPointer)){
        }else{return false}
    
        if(matchToken("SIGNO_MENOS",mainPointer)){
        }else{return false}
        appendPythonCode(",-1)");
    }else{return false}

    if(matchToken("CIERRA_PARENTESIS",mainPointer)){
    }else{return false}

    return true;
}

//Parametros de una funcion o metodo
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
            addVariable(TokenArr[mainPointer-1],getLexema(mainPointer-2));
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

//Argumentos de If-Else,Do-While
function sentenciaArgumentos(){
    var ExpresionesCont=0;
    var ParentesisCont=0;
    while(true){

        if(nextToken("ABRE_PARENTESIS",mainPointer)){
            appendPythonCode("(");
            matchToken("ABRE_PARENTESIS",mainPointer)
            ParentesisCont++;
        }
        
        if(nextToken("SIGNO_EXCLAMATIVO",mainPointer)){
            appendPythonCode(" not ");
            matchToken("SIGNO_EXCLAMATIVO",mainPointer)
        }

        if(nextToken("RSV_FALSE",mainPointer)){
            matchToken("RSV_FALSE",mainPointer);
            appendPythonCode(getLexema(mainPointer-1));
        }

        else if(nextToken("RSV_TRUE",mainPointer)){
            matchToken("RSV_TRUE",mainPointer);
            appendPythonCode(getLexema(mainPointer-1));
        }
    
        else if(nextToken("ID",mainPointer)){
            matchToken("ID",mainPointer);
            appendPythonCode(getLexema(mainPointer-1));
        }

        else if(nextToken("NUMERO",mainPointer)){
            matchToken("NUMERO",mainPointer);
            appendPythonCode(getLexema(mainPointer-1));
            if(nextToken("PUNTO",mainPointer)){
                matchToken("PUNTO",mainPointer);
                appendPythonCode(getLexema(mainPointer-1));
                if(!matchToken("NUMERO",mainPointer)){
                    return false;
                }
                else{
                    appendPythonCode(getLexema(mainPointer-1));
                }
            }
        }

        else if(nextToken("CADENA",mainPointer)){
            matchToken("CADENA",mainPointer);
            appendPythonCode("\""+getLexema(mainPointer-1)+"\"");
        }
        //else{return false}

        ExpresionesCont++;

        if(!nextToken("RSV_TRUE",mainPointer-1) && !nextToken("RSV_FALSE",mainPointer-1)){

            if(matchRelacional()){                        
            }else{return false}
   
            if(nextToken("ID",mainPointer)){
                matchToken("ID",mainPointer);
                appendPythonCode(getLexema(mainPointer-1));
            }

            else if(nextToken("NUMERO",mainPointer)){
                matchToken("NUMERO",mainPointer);
                appendPythonCode(getLexema(mainPointer-1));
                if(nextToken("PUNTO",mainPointer)){
                    matchToken("PUNTO",mainPointer);
                    appendPythonCode(getLexema(mainPointer-1));
                    if(!matchToken("NUMERO",mainPointer)){
                        return false;
                    }
                    else{
                        appendPythonCode(getLexema(mainPointer-1));
                    }
                }
            }

            else if(nextToken("CADENA",mainPointer)){
                matchToken("CADENA",mainPointer);
                appendPythonCode("\""+getLexema(mainPointer-1)+"\"");
            }else{return false}       

        }

        ExpresionesCont++;

        if(ExpresionesCont%2==0 && ParentesisCont>0){
            if(nextToken("CIERRA_PARENTESIS",mainPointer)){
                appendPythonCode(")");
                matchToken("CIERRA_PARENTESIS",mainPointer)
                ParentesisCont--;
                ExpresionesCont=0;
            }
        }

        if(nextToken("SIGNO_AMPERSAND",mainPointer)
        ||nextToken("SIGNO_EXCLAMATIVO",mainPointer)
        ||nextToken("SIGNO_BARRA",mainPointer)){
            matchLogicos();
        }

        else if(ParentesisCont==0){
            return matchToken("CIERRA_PARENTESIS",mainPointer);
        }
    }

}

//Expresiones Aritmeticas como Argumentos
function sentenciaExpresionArgumentos(){
    while(true){
        
        if(nextToken("NUMERO",mainPointer)){
            matchToken("NUMERO",mainPointer);
            appendPythonCode(getLexema(mainPointer-1));
            if(nextToken("PUNTO",mainPointer)){
                matchToken("PUNTO",mainPointer);
                appendPythonCode(getLexema(mainPointer-1));
                if(!matchToken("NUMERO",mainPointer)){
                    return false;
                }
                else{
                    appendPythonCode(getLexema(mainPointer-1));
                }
            }
            if(nextToken("COMA",mainPointer)||nextToken("CIERRA_PARENTESIS",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return matchToken("COMA",mainPointer);
            }
        }
        else if(nextToken("ID",mainPointer)){
            matchToken("ID",mainPointer); 
            appendPythonCode(getLexema(mainPointer-1));       
            if(nextToken("ABRE_PARENTESIS",mainPointer)){
                matchToken("ABRE_PARENTESIS",mainPointer);
                appendPythonCode(getLexema(mainPointer-1));
                if(argumentosLlamadaFuncion()){
                    appendPythonCode(")");
                    matchToken("CIERRA_PARENTESIS",mainPointer);
                } 
            }
            if(nextToken("COMA",mainPointer)||nextToken("CIERRA_PARENTESIS",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return matchToken("COMA",mainPointer);
            }
        }
        else if(nextToken("CADENA",mainPointer)){
            matchToken("CADENA",mainPointer);
            appendPythonCode("\""+getLexema(mainPointer-1)+"\"");
            if(nextToken("COMA",mainPointer)||nextToken("CIERRA_PARENTESIS",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return matchToken("COMA",mainPointer);
            }
        }
        else if(nextToken("CADENA_HTML",mainPointer)){
            matchToken("CADENA_HTML",mainPointer);
            appendPythonCode("\""+getLexema(mainPointer-1)+"\"");
            if(nextToken("COMA",mainPointer)||nextToken("CIERRA_PARENTESIS",mainPointer)){
                return true;
            }
            if(!matchOperador()){
                return matchToken("COMA",mainPointer);
            }
        }
        else{
            return matchToken("EXPRESION",mainPointer);
        }
    }
}

//Agumentos Llamada a funcion
function argumentosLlamadaFuncion(){
    if(nextToken("CIERRA_PARENTESIS",mainPointer)){
        return true;
    }

    while(true){

        if(!sentenciaExpresionArgumentos()){
            return matchToken("EXPRESION",mainPointer);
        }

        if(nextToken("CIERRA_PARENTESIS",mainPointer)){
            return true;
        }

        else if(nextToken("COMA",mainPointer)){
            if(!nextToken("CIERRA_PARENTESIS",mainPointer+1)){
                appendPythonCode(",");
                matchToken("COMA",mainPointer);
            }
            else{
                return matchToken("CIERRA_PARENTESIS",mainPointer);
            }
        }
        else{
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
        matchToken("RSV_DOUBLE",mainPointer);
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

function matchRelacionalFor(){
    if(nextToken("SIGNO_MENOR",mainPointer)){
        matchToken("SIGNO_MENOR",mainPointer);
        if(nextToken("SIGNO_IGUAL",mainPointer)){
            matchToken("SIGNO_IGUAL",mainPointer);
            if(matchToken("NUMERO",mainPointer)){
                appendPythonCode(","+getLexema(mainPointer-1));
            }else{return false}
            return true;
        }
        if(matchToken("NUMERO",mainPointer)){
            var aux=parseInt(getLexema(mainPointer-1));
            aux--;
            appendPythonCode(","+aux);
        }else{return false}
        return true;    
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
    else if(nextToken("RSV_DO",mainPointer)){
        sentenciaDoWhile();
    }
    else if(nextToken("RSV_DO",mainPointer)){
        sentenciaDoWhile();
    }
    else if(nextToken("RSV_FOR",mainPointer)){
        sentenciaFor();
    }
    else if(nextToken("RSV_SWITCH",mainPointer)){
        sentenciaSwitch();
    }
    else if(nextToken("RSV_RETURN",mainPointer)){
        sentenciaReturn();
    }
    else if(nextToken("RSV_BREAK",mainPointer)&&(SwitchBool||RepeticionBool)){
        matchToken("RSV_BREAK",mainPointer);
        matchToken("PUNTO_COMA",mainPointer);
        appendPythonCode(tabulador(Identacion)+"break\n");
    }
    else if(nextToken("RSV_CONTINUE",mainPointer)&&RepeticionBool){
        matchToken("RSV_CONTINUE",mainPointer);
        appendPythonCode(tabulador(Identacion)+"continue\n");
    }
    else if(nextToken("RSV_CONSOLE",mainPointer)){
        sentenciaConsole();
    }
    else if(nextToken("ID",mainPointer)){
        sentenciaAsignacion();
    }
    else if(!nextToken("CIERRA_LLAVE",mainPointer)){
        matchToken("SENTENCIA",mainPointer);
    }

}

//COMPARA TOKEN CON EL SIGUIENTE TOKEN A LEER
function nextToken(TokenEsperado,Pointer){
    var tempToken = TokenArr[Pointer];
    if(tempToken!=undefined){
        if (tempToken.Tipo!="FINAL" )
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
    else if(tempToken.Tipo!="FINAL")
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

//CONCATENA INSTRUCCIONES EN PYTHON
function appendPythonCode(codeString){
    PyhtonCode=PyhtonCode+codeString;
}

//CONCATENA INSTRUCCIONES EN HTML
function appendHTMLCode(codeString){
    HTMLCode=HTMLCode+codeString.trim();
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
        if(tempToken==undefined){
            appendPythonCode("\n >> EL COMPILADOR NO PUDO RECUPERARSE DEL ERROR SINTACTICO");
            return;
        }
    }while(tempToken.Tipo!="PUNTO_COMA" && tempToken.Tipo!="ABRE_LLAVE" && tempToken.Tipo!="CIERRA_LLAVE");

    var Error = new Object();
    Error.Fila=tokenError.Fila;
    Error.Columna=tokenError.Columna;
    Error.Token=tokenEsperado;
    Error.ErrToken=tokenError.Tipo;
    ErrorArr.push(Error);
    ErrorBool=true;
}

//MUESTRA TABLA DE ERRORES SINTACTICOS
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

//MUESTRA TABLA DE VARIABLES
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

//TRADUCE HTML A JSON
function translateHTML(){
    var ObjectHTML = document.createElement("div");
    ObjectHTML.innerHTML=HTMLCode;
    IdentacionJSON=0;
    JSONCode="";
    appendJSONCode("\"HTML\":{\n");
    IdentacionJSON++;
    for(var i=0;i<ObjectHTML.childNodes.length;i++){
        writeChilds(ObjectHTML.childNodes[i]); 
        appendJSONCode(tabulador(IdentacionJSON)+"}\n");
    }
    appendJSONCode("}\n");
    document.getElementById("txtJSON").innerHTML=JSONCode;
}

function writeChilds(ObjectHTML){

    if(ObjectHTML.tagName=="H1"||ObjectHTML.tagName=="H2"||ObjectHTML.tagName=="H3"||ObjectHTML.tagName=="H4"){
        appendJSONCode(tabulador(IdentacionJSON)+"\""+ObjectHTML.tagName+"\":{\n");
        appendJSONCode(tabulador(IdentacionJSON+1)+"\"TEXTO\":\""+ObjectHTML.innerHTML+"\"\n");
    }
    else if(ObjectHTML.tagName=="TITLE" || ObjectHTML.tagName=="P" || ObjectHTML.tagName=="BUTTON"||ObjectHTML.tagName=="LABEL"){
        appendJSONCode(tabulador(IdentacionJSON)+"\""+ObjectHTML.tagName+"\":{\n");
        appendJSONCode(tabulador(IdentacionJSON+1)+"\"TEXTO\":\""+ObjectHTML.innerHTML+"\"\n");
    }

    else{

        var ArregloNodes = ObjectHTML.childNodes;

        appendJSONCode(tabulador(IdentacionJSON)+"\""+ObjectHTML.tagName+"\":{\n");

        if(ObjectHTML.tagName=="BODY" || ObjectHTML.tagName=="DIV"){
            if(ArregloNodes.length==0){
                appendJSONCode(tabulador(IdentacionJSON+1)+"\"STYLE\":\"background:"+ObjectHTML.style.background+"\"\n");
            }
            else{
                appendJSONCode(tabulador(IdentacionJSON+1)+"\"STYLE\":\"background:"+ObjectHTML.style.background+"\",\n");
            }
        }

        for(var i=0;i<ArregloNodes.length;i++){
            IdentacionJSON++;
            writeChilds(ArregloNodes[i]);
            if((i+1)<ArregloNodes.length){
                appendJSONCode(tabulador(IdentacionJSON)+"},\n");
            }
            else{
                appendJSONCode(tabulador(IdentacionJSON)+"}\n");
            }  
            IdentacionJSON--;
        }

    }


}

//CONCATENA INSTRUCCIONES EN JSON
function appendJSONCode(codeString){
    JSONCode=JSONCode+codeString;
}

