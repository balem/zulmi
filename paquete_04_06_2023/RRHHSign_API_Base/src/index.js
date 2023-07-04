var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var helmet = require('helmet');
var logger = require('morgan');
var path = require('path');

var tspCallback = require('./routes/tsp-callback/index')
var usersRouter = require('./routes/users/index');
var uploadRouter = require('./routes/upload/index');
var employeesRouter = require('./routes/employees/index');
var signatureRouter = require('./routes/signature/index');
var signatureAmonestacionesRouter = require('./routes/signature-amonestaciones/index');
var signatureSuspensionesRouter = require('./routes/signature-suspensiones/index');
var signatureApercibimientosRouter = require('./routes/signature-apercibimientos/index');
var signaturePreavisosRouter = require('./routes/signature-preavisos/index');
var signatureNotificacionesRouter = require('./routes/signature-notificaciones/index');
var signatureComprobantesPagoRouter = require('./routes/signature-comprobantes-pago/index');
var documentRouter = require('./routes/document/index');
var messageRouter = require('./routes/message/index');
var emailConfigRouter = require('./routes/email-config/index');
var logsRouter = require('./routes/logs/index');
var userGroupRouter = require('./routes/user-group/index');
var certificateRouter = require('./routes/certificate/index');
var evidenceRouter = require('./routes/evidence/index');
var sendmtessRouter = require('./routes/sendmtess/index');
var statusRouter = require('./routes/status/index');
var patronalRouter = require('./routes/patronal/index');
var controlRouter = require('./routes/control/index');
var companyRouter = require('./routes/company/index');

var app = express();

// use it before all route definitions
var whitelist = ['*']; //white list consumers
var corsOptions = {
  origin: function (origin, callback) {
    //if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    //} else {
      //callback(null, false);
    //}
  },
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true, //Credentials are cookies, authorization headers or TLS client certificates.
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept']
};

app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json({ limit: '1024mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

//routes
app.use('/tsp-callback', tspCallback);
app.use('/users', usersRouter);
app.use('/upload', uploadRouter);
app.use('/control', controlRouter);
app.use('/company', companyRouter);
app.use('/employees', employeesRouter);
app.use('/signature', signatureRouter);
app.use('/signature-amonestaciones', signatureAmonestacionesRouter);
app.use('/signature-suspensiones', signatureSuspensionesRouter);
app.use('/signature-apercibimientos', signatureApercibimientosRouter);
app.use('/signature-preavisos', signaturePreavisosRouter);
app.use('/signature-notificaciones', signatureNotificacionesRouter);
app.use('/signature-comprobantes-pago', signatureComprobantesPagoRouter);
app.use('/document', documentRouter);
app.use('/message', messageRouter);
app.use('/user-group', userGroupRouter);
app.use('/email-config', emailConfigRouter);
app.use('/logs', logsRouter);
app.use('/certificate', certificateRouter);
app.use('/evidence', evidenceRouter);
app.use('/sendmtess', sendmtessRouter);
app.use('/status', statusRouter);
app.use('/patronal', patronalRouter);
app.use('/control', controlRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    status: "error",
    message: err.message
  });
});

module.exports = app;
