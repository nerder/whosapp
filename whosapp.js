var casper = require('casper').create({
  clientScripts:  [
      'node_modules/jquery/dist/jquery.min.js'
  ],
  pageSettings: {
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.1500.71 Safari/537.36'
  },
  viewportSize: {
    width: 1280,
    height: 1024
  },
  waitTimeout: 15000,
  logLevel: 'debug',
  verbose: true
});

// http://docs.casperjs.org/en/latest/events-filters.html#remote-message
casper.on("remote.message", function(msg) {
    this.echo("Console: " + msg);
});

// http://docs.casperjs.org/en/latest/events-filters.html#page-error
casper.on("page.error", function(msg, trace) {
    this.echo("Error: " + msg);
    this.echo("Trace:" + JSON.stringify(trace, undefined, 4));
    // maybe make it a little fancier with the code from the PhantomJS equivalent
});

// http://docs.casperjs.org/en/latest/events-filters.html#resource-error
casper.on("resource.error", function(resourceError) {
    this.echo("ResourceError: " + JSON.stringify(resourceError, undefined, 4));
});

// http://docs.casperjs.org/en/latest/events-filters.html#page-initialized
casper.on("page.initialized", function(page) {
    // CasperJS doesn't provide `onResourceTimeout`, so it must be set through
    // the PhantomJS means. This is only possible when the page is initialized
    page.onResourceTimeout = function(request) {
        console.log('Response Timeout (#' + request.id + '): ' + JSON.stringify(request));
    };
});

casper.start('https://web.whatsapp.com/', function(){
    this.echo('Starting...')
    this.waitForSelector('img', function() {
        this.capture('qrcode.png',
          {
            top: 214,
            left: 296,
            width: 250,
            height: 250
          }
        );
        this.echo('QR Screeshot Taken!')
    });
});
casper.run();
