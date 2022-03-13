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
    resultado = await based.executeQuery('SELECT U.UserName, U.[Password]' +
    'FROM dbo.Usuario U');
}, 1500)

// Variables
var usuario = {}
var filtro = 0

// Establecimiento de parametros para la pagina web
app.use(express.urlencoded({extended: false}))
app.set('view-engine', 'ejs')

// Extensiones de la pagina web
app.get('/', (req, res) => {
    res.render('login.ejs',{mensaje:""})
})
app.get('/articulos', (req, res) => {
    let listaArticulos = [];
    setTimeout(async () => {
        const productos = await based.executeQuery('SELECT A.Nombre, A.Precio ' + 
        'FROM dbo.Articulo A ORDER BY A.Nombre');
        if (productos != undefined) {
            for (articulo of productos.data[0]) {
                listaArticulos.push(articulo);
            }
            res.render('articulos.ejs', {productos : listaArticulos});
        }
    }, 1500)
})

app.post('/insertar', (req, res) => {
    res.render('insertar.ejs')
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
    filtrarCantidad(filtro, res);
})
app.post('/insertarB', (req, res) => {
    articulo = {nombre:req.body.name,precio:req.body.precio};
    console.log(articulo);
    res.redirect('./articulos')
})
app.post('/cancelar', (req, res) => {
    res.redirect('./articulos')
})
app.post('/salir', (req, res) => {
    res.redirect('./');
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
        res.render("login.ejs",{mensaje:"Combinación de usuario/password no existe en la BD"});
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

function filtrarCantidad (cantidad, res) {
    let articulosFiltrados = [];
    if (cantidad == '')
        cantidad = -1;
    else {
        cantidad = parseInt(cantidad);
    }
    setTimeout(async () => {
        const resFiltroCant = await based.executeStoredProcedure('FiltrarCantidad', null,
        {inCantidad : cantidad, outResult : 0});
        if (resFiltroCant != undefined) {
            console.log(resFiltroCant.data[0]);
            for (articulo of resFiltroCant.data[0]) {
                articulosFiltrados.push(articulo);
            }
            res.render('articulos.ejs', {productos : articulosFiltrados});
        }
    }, 1500)
}

// Creacion del puerto para acceder la pagina web
app.listen(3000)