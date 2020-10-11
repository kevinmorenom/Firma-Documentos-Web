let a = document.getElementById("home-user");
let editbtn = document.getElementById("2editbtn");
a.text = localStorage.usuario;

document.getElementById("newemail").value = localStorage.email;
document.getElementById("newname").value = localStorage.usuario;
editbtn.addEventListener("click", function(event) {
    let objeto = {
        email: localStorage.email,
        newemail: document.getElementById("newemail").value,
        newname: document.getElementById("newname").value,
        psswd: document.getElementById("psswd").value
    };
    edit(objeto);
    event.preventDefault();
});

function viewfiles() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `https://localhost:8080/files`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    xhr.onload = function() {
        if (xhr.status != 200) {
            alert(xhr.status + ': ' + xhr.statusText + 'Error');
        } else {
            showfiles(JSON.parse(xhr.response));
        }
    };
}
viewfiles();

function showfiles(data) {
    var filesList = `<table> 
    <tr>
        <th>Archivo</th>
        <th>QR Code</th>
        <th>Actions</th>
    </tr>
    {{files}}
    </table>`;

    var filesListItem = `<tr>
<td>{{filename}}</td>
<td><a href="/qrcodes/qr_{{filename}}.html">QR Code</a></td>
<td>
    <button class onclick="verify('{{filename}}')">Verificar</button>
    <button id="encrypt " onclick="encrypt('{{filename}}')">Encrypt</button>
    <button id="decrypt" onclick="decrypt('{{filename}}')">Decrypt</button>
</td>
<tr>`;
    let filesHTML = '';
    data.map(item => {
        filesHTML += filesListItem.replaceAll('{{filename}}', item);
        // filesHTML += filesListItem.replace('{{filename}}', item).replace('{{filename2}}', item).replace('{{filename3}}', item).replace('{{filename4}}', item).replace('{{filename5}}', item);
    });
    const tableHTML = filesList.replace('{{files}}', filesHTML);
    document.getElementById('fileTable').innerHTML = tableHTML;
}

function encrypt(data) {
    document.getElementById('encrypt_modal').style.display = 'block';
    document.getElementById('enc_btn').addEventListener("click", function(event) {
        let objeto = {
            file: data,
            password: document.getElementById("enc_psswd").value,
        };
        console.log(objeto);
        encrypt2(objeto);
        event.preventDefault();
    });

}

function decrypt(data) {
    document.getElementById('decrypt_modal').style.display = 'block';
    document.getElementById('dec_btn').addEventListener("click", function(event) {
        let objeto = {
            file: data,
            password: document.getElementById("dec_psswd").value,
        };
        console.log(objeto);
        decrypt2(objeto);
        event.preventDefault();
    });

}

function verify(data) {
    let filename = {
        name: data,
    };
    // 1. Crear XMLHttpRequest object
    let xhr = new XMLHttpRequest();
    // 2. Configurar: PUT actualizar archivo
    xhr.open('POST', `https://localhost:8080/verify`);
    // 3. indicar tipo de datos JSON
    xhr.setRequestHeader('Content-Type', 'application/json');
    // 4. Enviar solicitud a la red
    xhr.send(JSON.stringify(filename));
    // 5. Una vez recibida la respuesta del servidor
    xhr.onload = function() {

        if (xhr.status != 200) {
            alert('\n ' + xhr.responseText);
        } else if (xhr.status == 200) {
            alert('\n ' + xhr.responseText);
            //var res = JSON.parse(xhr.responseText);
        }
    };
}

function viewlogs() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `https://localhost:8080/getlogs`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    xhr.onload = function() {
        if (xhr.status != 200) {
            alert(xhr.status + ': ' + xhr.statusText + 'Error');
        } else {
            showlogs(JSON.parse(xhr.responseText).logs);
        }
    };
}
viewlogs();

function showlogs(data) {
    var logsList = `<table> 
    <tr>
        <th>Fecha de Login</th>
        <th>Usuario</th>
    </tr>
    {{logs}}
    </table>`;

    var logsListItem = `<tr>
<td>{{log_date}}</td>
<td>{{log_user}}</td>
<tr>`;
    let logsHTML = '';
    data.map(item => {
        logsHTML += logsListItem.replace('{{log_date}}', item.date).replace('{{log_user}}', item.name);
    });
    const logTableHTML = logsList.replace('{{logs}}', logsHTML);
    document.getElementById('logTable').innerHTML = logTableHTML;
}

function prueba(option) {
    if (option == 1) {
        document.getElementById('logsR').style.display = "block";
        document.getElementById('navegador').style.display = "none";
        document.getElementById('logbtn').className = "active";
        document.getElementById('navbtn').className = "";
    } else {
        document.getElementById('logsR').style.display = "none";
        document.getElementById('navegador').style.display = "block";
        document.getElementById('navbtn').className = "active";
        document.getElementById('logbtn').className = "";
    }


}

function edit(datos) {
    // 1. Crear XMLHttpRequest object
    let xhr = new XMLHttpRequest();
    // 2. Configurar: PUT actualizar archivo
    xhr.open('POST', `https://localhost:8080/edit`);
    // 3. indicar tipo de datos JSON
    xhr.setRequestHeader('Content-Type', 'application/json');
    // 4. Enviar solicitud a la red
    xhr.send([JSON.stringify(datos)]);
    // 5. Una vez recibida la respuesta del servidor
    xhr.onload = function() {
        if (xhr.status != 200) {
            var res = JSON.parse(xhr.responseText);
            alert('Error' + res.err.message);
        } else if (xhr.status == 200) {
            alert('\n Datos de Perfil Actualizados');
            var res = JSON.parse(xhr.responseText);
            document.getElementById('edit').style.display = 'none';
            document.getElementById("QRbtn").click();
            document.getElementById("newimagediv").innerHTML = `<img src="` + res.data + `">`;
            localStorage.setItem("usuario", res.nombre);
            localStorage.setItem("email", res.email);
            // window.location.href = "../home.html";
        }
    };

}

function encrypt2(data) {
    // 1. Crear XMLHttpRequest object
    let xhr = new XMLHttpRequest();
    // 2. Configurar: PUT actualizar archivo
    xhr.open('POST', `https://localhost:8080/encryption`);
    // 3. indicar tipo de datos JSON
    xhr.setRequestHeader('Content-Type', 'application/json');
    // 4. Enviar solicitud a la red
    xhr.send(JSON.stringify(data));
    // 5. Una vez recibida la respuesta del servidor
    xhr.onload = function() {

        if (xhr.status != 200) {
            alert('\n ' + xhr.responseText);
            window.location.href = "../home.html";
        } else if (xhr.status == 200) {
            // alert('\n ' + xhr.responseText);
            window.location.href = "../home.html";
            //var res = JSON.parse(xhr.responseText);
        }
    };
}

function decrypt2(data) {
    // 1. Crear XMLHttpRequest object
    let xhr = new XMLHttpRequest();
    // 2. Configurar: PUT actualizar archivo
    xhr.open('POST', `https://localhost:8080/decryption`);
    // 3. indicar tipo de datos JSON
    xhr.setRequestHeader('Content-Type', 'application/json');
    // 4. Enviar solicitud a la red
    xhr.send(JSON.stringify(data));
    // 5. Una vez recibida la respuesta del servidor
    xhr.onload = function() {
        var res = JSON.parse(xhr.responseText);
        if (res.errors != 0) {
            alert('Error\n ');
            window.location.href = "../home.html";
        } else if (xhr.status == 200) {
            // alert('\n ' + xhr.responseText);
            window.location.href = "../home.html";
            //var res = JSON.parse(xhr.responseText);
        }
    };
}