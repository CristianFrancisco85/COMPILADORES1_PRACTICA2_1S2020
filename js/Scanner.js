/* 
    ANALIZADOR LEXICO 
    Lenguaje: C#
*/

//OBLIGAR DECLARACION DE VARIABLES
"use strict";

//ARREGLO DE PALABRAS RESERVADAS
var RESERVADAS = [
    "int","double","float","char","bool","string","class","void","args","false","true",
    "Console","Write","switch","case","break","default","if",
    "else","for","do","while","return","main","continue"
];

//ENUM DE CARACTERES OTROS
const OTROS={
    PUNTO :46,
    COMA :44,
    PUNTO_COMA :59,
    DOS_PUNTOS:58,
    ABRE_PARENTESIS:40,
    CIERRA_PARENTESIS:41,
    ABRE_LLAVE:123,
    CIERRA_LLAVE:125,
    SIGNO_IGUAL:61,
    SIGNO_MAS:43,
    SIGNO_MENOS:45,
    SIGNO_MULTIPLICACION:42,
    SIGNO_MAYOR : 62,
    SIGNO_MENOR : 60,
    SIGNO_EXCLAMATIVO : 33,
    SIGNO_AMPERSAND:38,
    SIGNO_BARRA: 124
}

function ScanText(){

    //SE OBTIENE TEXTO A ANALIZAR
    var indice = document.getElementsByClassName("nav-link active tabBtn")
    var TxtCSharp = document.getElementById("txtArea"+indice[0].id)
    var Code = TxtCSharp.value;
    //SE VACIA TABLA DE ERRORES LEXICOS
    document.getElementById("tableBodyLexicos").innerHTML="";

    var MyByte = 0;                   //Guarda valor ASCII
    var NCaracteres = Code.length;    //Cantidad de Caracteres
    var ControlScan = false;          //Controla Flujo de escaneo
    var ErroresBool = false;          //Indica si hay errores lexicos
    var Token;                        //Objeto Token
    var Error;                        //Objeto Error
    var TokensArr = [];               //Arreglo de Tokens
    var ErroresArr = [];              //Arreglo de Errores Lexicos
    var Lineas=0;
    var Columna=0;

    // INICIA ANALISIS LEXICO
    for (var i = 0; i < NCaracteres; i++)
    {
        Token= new Object();
        Error = new Object();
        MyByte = Code.charCodeAt(i);
        var TempLexema = "";

        // SE VERIFICA SI ES UN CARACTER "OTROS"
        ControlScan=false;
        switch (MyByte)
        {
            case OTROS.PUNTO:
                Token.Tipo = "PUNTO"; break;
            case OTROS.COMA:
                Token.Tipo = "COMA"; break;
            case OTROS.PUNTO_COMA:
                Token.Tipo = "PUNTO_COMA"; break;
            case OTROS.DOS_PUNTOS:
                Token.Tipo = "DOS_PUNTOS"; break;
            case OTROS.ABRE_PARENTESIS:
                Token.Tipo = "ABRE_PARENTESIS"; break;
            case OTROS.CIERRA_PARENTESIS:
                Token.Tipo = "CIERRA_PARENTESIS"; break;
            case OTROS.ABRE_LLAVE:
                Token.Tipo = "ABRE_LLAVE"; break;
            case OTROS.CIERRA_LLAVE:
                Token.Tipo = "CIERRA_LLAVE"; break;
            case OTROS.SIGNO_IGUAL:
                Token.Tipo = "SIGNO_IGUAL"; break;
            case OTROS.SIGNO_MAS:
                Token.Tipo = "SIGNO_MAS"; break;
            case OTROS.SIGNO_MENOS:
                Token.Tipo = "SIGNO_MENOS"; break;
            case OTROS.SIGNO_MULTIPLICACION:
                Token.Tipo = "SIGNO_MULTIPLICACION"; break;
            case OTROS.SIGNO_MAYOR:
                Token.Tipo = "SIGNO_MAYOR"; break;
            case OTROS.SIGNO_MENOR:
                Token.Tipo = "SIGNO_MENOR"; break;
            case OTROS.SIGNO_EXCLAMATIVO:
                Token.Tipo = "SIGNO_EXCLAMATIVO"; break;
            case OTROS.SIGNO_AMPERSAND:
            Token.Tipo = "SIGNO_AMPERSAND"; break;
            case OTROS.SIGNO_BARRA:
                Token.Tipo = "SIGNO_BARRA"; break;
            default :
                ControlScan=true; break;
        }
        //SI SE ESCANEO UN CARACTER OTROS
        if(!ControlScan){
            Token.Fila =Lineas;
            Token.Columna = Columna;
            Token.Lexema = String.fromCharCode(MyByte);
            TokensArr.push(Token);
        }
        
        else{
            //PARA IDENTIFICADORES Y PALABRAS RESERVADAS
            if (testAlfabeto(MyByte))
            {
                for (var j = i; j < NCaracteres; j++)
                {
                    MyByte = Code.charCodeAt(j);
                    if (testAlfabeto(MyByte)||testNumeros(MyByte))
                    {
                        TempLexema = TempLexema + String.fromCharCode(MyByte);
                    }
                    else
                    {
                        i = j - 1;
                        break;
                    }
                    Columna++;
                }
                //SI ES UNA RESERVADA
                if(RESERVADAS.includes(TempLexema)){
                    Token.Tipo="RSV_"+TempLexema.toUpperCase();
                }
                //SI NO SE ESTABLECE COMO ID
                else{
                    Token.Tipo="ID"
                }
                Token.Fila =Lineas;
                Token.Columna = Columna;
                Token.Lexema=TempLexema;
                TokensArr.push(Token);
            }

            //PARA NUMEROS
            else if (testNumeros(MyByte))
            {
                for (var j = i; j < NCaracteres; j++)
                {
                    MyByte = Code.charCodeAt(j);
                    if (testNumeros(MyByte))
                    {
                        TempLexema = TempLexema + String.fromCharCode(MyByte);
                    }
                    else
                    {
                        i = j - 1;
                        break;
                    }
                    Columna++;
                }
                Token.Tipo="NUMERO";
                Token.Fila = Lineas;
                Token.Columna = Columna;
                Token.Lexema=TempLexema;
                TokensArr.push(Token);
            }

            //PARA CADENAS CON " "
            else if (MyByte == 34)
            {
                i++;
                for (var j = i; j < NCaracteres; j++)
                {
                    MyByte = Code.charCodeAt(j);
                    if (MyByte == 34)
                    {
                        i = j;
                        Token.Tipo="CADENA";
                        Token.Lexema=TempLexema;
                        Token.Fila = Lineas;
                        Token.Columna = Columna;
                        TokensArr.push(Token);
                        break;
                    }
                    else
                    {
                        TempLexema = TempLexema + String.fromCharCode(MyByte);
                    }
                    Columna++;
                }
            }

            //PARA CADENAS CON ''
            else if (MyByte == 39)
            {
                i++;
                for (var j = i; j < NCaracteres; j++)
                {
                    MyByte = Code.charCodeAt(j);
                    if (MyByte == 39)
                    {
                        i = j;
                        Token.Tipo="CADENA_HTML";
                        Token.Lexema=TempLexema;
                        Token.Fila = Lineas;
                        Token.Columna = Columna;
                        TokensArr.push(Token);
                        break;
                    }
                    else
                    {
                        TempLexema = TempLexema + String.fromCharCode(MyByte);
                    }
                    Columna++;
                }
            }

            //PARA COMENTARIOS Y SIGNO DIVISION
            else if (MyByte == 47)
            {
                i++;
                MyByte = Code.charCodeAt(i);
                //Si el caracter siguiente es difente de / y * se establace como signo de division.
                if(MyByte!=47 && MyByte!=42){
                    Token.Tipo="SIGNO_DIVISION";
                    Token.Lexema=TempLexema;
                    Token.Fila = Lineas;
                    Token.Columna = Columna;
                    TokensArr.push(Token);
                    Columna++;
                    i--;
                }
                //Si no es un comentario
                else{
                    //Comentario Monolinea /
                    if(MyByte==47){
                        i++;
                        for (var j = i; j < NCaracteres; j++)
                        {
                            MyByte = Code.charCodeAt(j);
                            if (MyByte == 10)
                            {
                                Lineas++;
                                Columna=0;
                                i = j;
                                Token.Tipo="COMENTARIO";
                                Token.Lexema=TempLexema;
                                Token.Fila = Lineas;
                                Token.Columna = Columna;
                                TokensArr.push(Token);
                                break;
                            }
                            else
                            {
                                TempLexema = TempLexema + String.fromCharCode(MyByte);
                            }
                            Columna++;
                        }
                    }
                    //Comentario Multilinea *
                    else if(MyByte==42){
                        i++;
                        for (var j = i; j < NCaracteres; j++)
                        {
                            MyByte = Code.charCodeAt(j);
                            if (MyByte == 42 && Code.charCodeAt(j+1)==47)
                            {
                                i = j+1;
                                Token.Tipo="COMENTARIO_MULTI";
                                Token.Lexema=TempLexema;
                                Token.Fila = Lineas;
                                Token.Columna = Columna;
                                TokensArr.push(Token);
                                break;
                            }
                            else
                            {                               
                                TempLexema = TempLexema + String.fromCharCode(MyByte);                               
                                if(MyByte == 10){
                                    Lineas++;
                                    Columna=0;
                                }
                            }
                            Columna++;
                        }
                    }
                }
            }

            //PARA LINEAS Y COLUMNAS
            else if(MyByte == 10){
                Lineas++;
                Columna=0;
            }
            //PARA ERRORES LEXICOS
            else if(MyByte > 32){
                Error.Lexema=String.fromCharCode(MyByte);
                Error.Fila = Math.ceil(i/62);
                Error.Columna = i - ((Error.Fila-1)*62);
                ErroresArr.push(Error);
                ErroresBool=true;
            }
        }
        Columna++;
    }

    //SI AL TERMINAR EL ANALISIS LEXICO HAY ERRORES SE GENERA REPORTE
    if(ErroresBool){
        showErrores(ErroresArr);
    }
    //SI NO SE PROSIGUE CON ANALISIS SINTACTICO
    else{
        inicializarAnalizador(TokensArr);
    }
}

function testAlfabeto(Caracter){

    if ((Caracter >= 65 && Caracter <= 90) || (Caracter >= 97 && Caracter <= 122) || (Caracter == 95))
    {
        return true;
    }
    else
    {
        return false;
    }

}

function testNumeros(Caracter){
    if(Caracter >= 48 && Caracter <= 57){
        return true;
    }
    else{
        return false;
    }
}

function showErrores(Arreglo){
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
        NewColumn.innerHTML="Caracter \""+Arreglo[i].Lexema+"\" desconocido"
        NewRow.appendChild(NewColumn);

        document.getElementById("tableBodyLexicos").appendChild(NewRow);
    }
}

