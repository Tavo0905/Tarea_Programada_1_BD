// Importacion de modulos
const express = require('express')
const res = require('express/lib/response')
const app = express()
const based = new (require('rest-mssql-nodejs'))({
    user: "programa",
    password: "programa",
    server: "25.81.172.46",
    database: "Tarea Programada",
    encrypt: true
})


let resultado = []

setTimeout(async () => {
    resultado = await based.executeQuery('SELECT U.UserName, U.[Password] FROM dbo.Usuario U');
}, 1500)

// Variables
var usuario = {}
var filtro = 0

// Establecimiento de parametros para la pagina web
app.use(express.urlencoded({extended: false}))
app.set('view-engine', 'ejs')

// Extensiones de la pagina web
app.get('/', (req, res) => {
    res.render('login.ejs')
})
app.get('/articulos', (req, res) => {
    res.render('articulos.ejs', {productos : []})
})
app.get('/error', (req, res) => {
    res.render('error.ejs')
})

// Funciones de las paginas web
app.post('/login', (req, res) => {
    usuario = {
        user : req.body.name,
        password : req.body.pass
    }
    validarDatos(usuario, res)
})
app.post('/filtrarNom', (req, res) => {
    filtro = req.body.nomProd;
    filtrarNombre(filtro, res);
})
app.post('/filtrarCant', (req, res) => {
    filtro = req.body.cant;
    console.log(filtro);
})
// Funciones logicas
function validarDatos (usuarioDatos, res) {
    let acceso = false;
    for (elemento of resultado.data[0]) {
        if ((usuarioDatos.user == elemento.UserName) &
        (usuarioDatos.password == elemento.Password)){
            console.log('Acceso garantizado');
            acceso = true;
            break;
        }
    }
    if (acceso)
        res.redirect("./articulos");
    else
        res.redirect("./error");
}

function filtrarNombre (nombre, res) {
    let articulosFiltrados = [];
    setTimeout(async () => {
        const resFiltroNom = await based.executeStoredProcedure('FiltrarNombre', null,
        {inNombre : nombre, outResult : 0});
        if (resFiltroNom != undefined) {
            console.log(resFiltroNom.data[0]);
            for (articulo of resFiltroNom.data[0]) {
                articulosFiltrados.push(articulo);
            }
            res.render('articulos.ejs', {productos : articulosFiltrados});
        }
    }, 1500)
}

// Creacion del puerto para acceder la pagina web
app.listen(3000)