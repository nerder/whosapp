var system = require('system');

var page = new WebPage();
page.settings.userAgent ='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.1500.71 Safari/537.36';
page.viewportSize = {width: 1280, height: 1024};
console.log(page.settings.userAgent);
page.open('https://web.whatsapp.com/', function (status) {
    if (status !== 'success') {
      output.errors.push('Unable to access network');
    } else {
      window.setTimeout(function () {
        page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js",function() {
            page.clipRect = {
              top: 214,
              left: 296,
              width: 250,
              height: 250
          }
          page.render('whatsapp_qrcode.jpeg', {format: 'jpeg', quality: '100'});
          console.log('QrCode Saved!');
          phantom.exit();
        });
      }, 10500);
    }
});
