function openArchive(e){
    var archivo = e.target.files[0];
    if (!archivo) {
      return;
    }
    var lector = new FileReader();
    lector.onload = function(e) {
      var contenido = e.target.result;
      showText(contenido);
    };
    lector.readAsText(archivo);
}

function showText(contenido) {
    var indice = document.getElementsByClassName("nav-link active tabBtn")
    var txtCSharp = document.getElementById("txtArea"+indice[0].id)
    txtCSharp.innerHTML = contenido;
}

function saveHTMLLexicos() {

    var saveData = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function () {
            var TableLexicos = document.getElementById("tableLexicos");
            var blob = new File([TableLexicos.innerHTML], "ErroresLexicos.html");
            url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = blob.name;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());
    
    saveData();

}

function saveHTMLSintacticos() {

    var saveData = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function () {
            var TableSintacticos = document.getElementById("tableSintacticos");
            var blob = new File([TableSintacticos.innerHTML], "ErroresSintacticos.html");
            url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = blob.name;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());
    
    saveData();

}


