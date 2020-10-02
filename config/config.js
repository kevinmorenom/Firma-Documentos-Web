process.env.PORT = process.env.PORT || 8080;
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

let urlDB = "";
if (process.env.NODE_ENV === 'dev') {
    urlDB = "mongodb+srv://IS714714:bases@cluster0.4i1xh.mongodb.net/TLS?retryWrites=true&w=majority"
} else {
    urlDB = "mongodb+srv://IS714714:bases@cluster0.4i1xh.mongodb.net/TLS?retryWrites=true&w=majority"
};
process.env.URLDB = urlDB;

process.env.CADUCIDAD_TOKEN = '48h';

process.env.SEED_AUTENTICACION = process.env.SEED_AUTENTICACION || 'este-es-el-seed-desarrollo';