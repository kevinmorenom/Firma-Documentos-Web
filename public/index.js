console.log("hola");
let registerbtn = document.getElementById("registerbtn");
let loginbtn = document.getElementById("loginbtn");

registerbtn.addEventListener("click", function(event) {
    let objeto = {
        email: document.getElementById("Remail").value,
        nombre: document.getElementById("Rname").value,
        psswd: document.getElementById("Rpsswd").value,
    }
    registrar(objeto);
    event.preventDefault();
});

loginbtn.addEventListener("click", function(event) {
    let objeto = {
        email: document.getElementById("Lemail").value,
        psswd: document.getElementById("Lpsswd").value,
    }
    login(objeto);
    event.preventDefault();
});

function registrar(datos) {
    // 1. Crear XMLHttpRequest object
    let xhr = new XMLHttpRequest();
    // 2. Configurar: PUT actualizar archivo
    xhr.open('POST', `https://localhost:8080/register`);
    // 3. indicar tipo de datos JSON
    xhr.setRequestHeader('Content-Type', 'application/json');
    // 4. Enviar solicitud a la red
    xhr.send([JSON.stringify(datos)]);
    // 5. Una vez recibida la respuesta del servidor
    xhr.onload = function() {
        if (xhr.status != 200) {
            alert('Error, ya existe una usuario con ese correo\n' + xhr.statusText);
        } else if (xhr.status == 200) {
            alert('\n El usuario ha sido registrado con éxito');
            window.location.href = "../index.html";
        }
    };

}

function login(datos) {
    console.log(datos);
    // 1. Crear XMLHttpRequest object
    let xhr = new XMLHttpRequest();
    // 2. Configurar: PUT actualizar archivo
    xhr.open('POST', `https://localhost:8080/login`);
    // 3. indicar tipo de datos JSON
    xhr.setRequestHeader('Content-Type', 'application/json');
    // 4. Enviar solicitud a la red
    xhr.send([JSON.stringify(datos)]);
    // 5. Una vez recibida la respuesta del servidor
    xhr.onload = function() {
        if (xhr.status != 200) {
            alert('Error\n' + xhr.statusText);
        } else if (xhr.status == 200) {
            alert('\n Has iniciado sesion exitosamente');
            var res = JSON.parse(xhr.responseText);
            localStorage.setItem("usuario", res.usuario.nombre);
            window.location.href = "../home.html";

        }
    };

}