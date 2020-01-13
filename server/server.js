require('./config/config')

const mongoose = require('mongoose');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//Configuracion global de rutas
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => console.log('DB Connected!')).catch(err => {
    console.log(err.message);
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
})