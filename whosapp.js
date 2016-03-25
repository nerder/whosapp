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
  waitTimeout: 100000,
  logLevel: 'error',
  verbose: true
});

// http://docs.casperjs.org/en/latest/events-filters.html#remote-message
casper.on("remote.message", function(msg) {
    this.echo("Console: " + msg);
});

// http://docs.casperjs.org/en/latest/events-filters.html#page-error
casper.on("page.error", function(msg, trace) {
    this.echo("Error: " + msg);
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

var takeScreeshot = function(){
  casper.capture('qrcode.png',
    {
      top: 214,
      left: 296,
      width: 250,
      height: 250
    }
  );
  casper.echo('QR Screeshot Taken!');
}

var getDataRef = function() {
  return casper.evaluate(function test(){
    return $(".qrcode").attr("data-ref");
  });
}

var isQrCodeChanged = function(dataRef){
  return casper.evaluate(function(dataRef) {
    return $(".qrcode").attr("data-ref") !==  dataRef;
  }, dataRef);
}

casper.start('https://web.whatsapp.com/', function(){
    this.echo('Starting...')
    this.waitForSelector('img', function() {
        this.echo('QrCode is Loaded...');
        takeScreeshot();
        var dataRef = getDataRef();
        // var changed = false;

        this.waitFor(function check() {
          // changed = isQrCodeChanged(dataRef);
          if (isQrCodeChanged(dataRef)){
            dataRef = getDataRef();
            takeScreeshot();
          }
          //I return false, in this way waitFor will never end
          return false;
        }, function then() {
           this.echo("I DONT wanna be called, EVER");
        });
    });
});
casper.run();
