let registerbtn = document.getElementById("registerbtn");
let loginbtn = document.getElementById("loginbtn");
let enterbtn = document.getElementById("enterbtn");

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
        code: document.getElementById("code").value,
    }
    login(objeto);
    event.preventDefault();
});

// enterbtn.addEventListener("click", function(event) {
//     let objeto = {
//         code: document.getElementById("code").value,
//         name: document.getElementById("Lemail").value
//     };
//     auth(objeto);
//     event.preventDefault();
// });

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
            var res = JSON.parse(xhr.responseText);
            console.log(res);
            document.getElementById("imagediv").innerHTML = `<img src="` + res.data + `">`;
            document.getElementById("QRauth").click();
            document.getElementById("closeRegister").click();
            // window.location.href = "../index.html";
        }
    };

}

function login(datos) {
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
            //alert('\n Has iniciado sesion exitosamente');
            var res = JSON.parse(xhr.responseText);
            console.log(res);
            // document.getElementById("imagediv").innerHTML = `<img src="` + res.data + `">`;
            // document.getElementById("QRauth").click();
            localStorage.setItem("usuario", res.usuario.nombre);
            localStorage.setItem("email", res.usuario.email);
            window.location.href = "../home.html";

        }
    };

}

function auth(datos) {
    // 1. Crear XMLHttpRequest object
    let xhr = new XMLHttpRequest();
    // 2. Configurar: PUT actualizar archivo
    xhr.open('POST', `https://localhost:8080/auth`);
    // 3. indicar tipo de datos JSON
    xhr.setRequestHeader('Content-Type', 'application/json');
    // 4. Enviar solicitud a la red
    xhr.send([JSON.stringify(datos)]);
    // 5. Una vez recibida la respuesta del servidor
    xhr.onload = function() {
        if (xhr.status != 200) {
            alert('Error\n' + xhr.statusText);
        } else if (xhr.status == 200) {

            var res = JSON.parse(xhr.responseText);
            if (res.verified == true) {
                document.getElementById('autherror').style.display = "none";
                //alert('\n Has iniciado sesion exitosamente');
                window.location.href = "../home.html";
            } else {
                document.getElementById('autherror').style.display = "block";

            }


        }
    };

}