exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       (process.env.NODE_ENV === 'production' ?
                            'mongodb://admin:12345@ds111798.mlab.com:11798/image-organizer' :
                            'mongodb://admin:12345@ds111798.mlab.com:11798/image-organizer');
exports.PORT = process.env.PORT || 8080;
