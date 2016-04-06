var casper = require('casper').create({
  clientScripts: [
    'node_modules/jquery/dist/jquery.min.js'
  ],
  pageSettings: {
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.1500.71 Safari/537.36'
  },
  viewportSize: {
    width: 1280,
    height: 1024
  },
  waitTimeout: Infinity,
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

var setTarger = function() {
  return 'Davide Capozzi';
}

var takeScreeshot = function() {
  casper.capture('qrcode.png'
    // {
    //   top: 214,
    //   left: 296,
    //   width: 250,
    //   height: 250
    // }
  );
  casper.echo('QR Screeshot Taken!');
};

var isLoggedIn = function() {
  return casper.evaluate(function() {
    return !!$(".avatar").length;
  });
};

var isRightChatOpen = function(stalkedPerson) {
  return casper.evaluate(function(target) {
    return $('.pane-chat-header .chat-body span').text() === target;
  }, stalkedPerson);
};

var isOnline = function() {
  return casper.evaluate(function() {
    return $('.pane-chat-header .chat-body .chat-status span').text() === 'online';
  });
}

var getDataRef = function() {
  return casper.evaluate(function() {
    return $(".qrcode").attr("data-ref");
  });
};

var isQrCodeChanged = function(dataRef) {
  return casper.evaluate(function(dataRef) {
    return $(".qrcode").attr("data-ref") !== dataRef;
  }, dataRef);
};

var isEmptyText = function() {
  return casper.evaluate(function() {
    return !!$(".empty-text").length;
  });
}

var searchPerson = function(person) {
  casper.sendKeys('.input-search', person);
};

var needToSearch = function() {
  return casper.evaluate(function() {
    return $(".chat").length > 0 && $(".chat").length !== 1;
  });
};

var openChat = function() {
  casper.click('.chat');
}

casper.start('https://web.whatsapp.com/', function() {
  this.echo('Starting...');
  this.waitForSelector('img', function() {
    this.echo('QrCode is Loaded...');
    takeScreeshot();
    var dataRef = getDataRef();
    this.waitFor(function check() {
      if (isQrCodeChanged(dataRef)) {
        dataRef = getDataRef();
        takeScreeshot();
      }
      return isLoggedIn();
    }, function then() {
      var stalkedPerson = setTarger();
      this.waitFor(function hangme() {
        if (needToSearch()) {
          searchPerson(stalkedPerson);
          return isEmptyText();
        } else {
          openChat();
        }
        return isRightChatOpen(stalkedPerson);
      }, function then() {
        this.waitFor(function trackTheGuy() {
          if (isOnline()) {
            console.log("Is Online!");
            console.log(Date.now());
          }
          return false;
        }, function then() {
          this.echo('Nobody calls me! SOB')
        });
      });
    });
  });
});
casper.run();
