let a = document.getElementById("home-user");

a.text = localStorage.usuario;

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
        <th>Verify</th>
    </tr>
    {{files}}
    </table>`;

    var filesListItem = `<tr>
<td>{{filename}}</td>
<td><a href="/qrcodes/qr_{{filename3}}.html">QR Code</a></td>
<td><button onclick="verify('{{filename2}}')">Verificar</button></td>
<tr>`;
    let filesHTML = '';
    data.map(item => {
        filesHTML += filesListItem.replace('{{filename}}', item).replace('{{filename2}}', item).replace('{{filename3}}', item);
    });
    const tableHTML = filesList.replace('{{files}}', filesHTML);
    document.getElementById('fileTable').innerHTML = tableHTML;
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