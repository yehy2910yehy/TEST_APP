

var ini = (function () {

    console.log("ini loading");
    function generNum() {
        var d = new Date();
        return d.getTime();
    }
    // loader settings
    centerLoader();
    function centerLoader() {
        var cadre = $('#cadre_centre');
        var cadreW = cadre.width();
        var cadreH = cadre.height();
        var t = (window.innerHeight / 2) - (cadreH / 2);
        var l = (window.innerWidth / 2) - (cadreW / 2);
        cadre.css({ top: t, left: l });
    }
    window.onresize = function () { centerLoader(); };
    function LoaderOn(text) {
        CoverOn();
        $('#cadre_centre').css({ display: 'block' });
        if (text!==null)
            $('#text_loader').text(text);
        else
            $('#text_loader').text('opperation en cours...');
    }
    function LoaderOff() {
        $('#cadre_centre').css({ display: 'none' });
        CoverOff();
    }
    function CoverOn() { $('#cover').css({ display: 'block' });  }
    function CoverOff() { $('#cover').css({ display: 'none' }); }
    function ProgressOn() { $('#progressTop').removeClass('hide'); }
    function ProgressOff() { $('#progressTop').addClass('hide'); }


    function loadCSS(addresses, refresh) {

        refresh = refresh || false;

        for (var i = 0; i < addresses.length; i++) {
            var adresse = addresses[i];
            var link = document.createElement('link');
            link.href = adresse;
            link.rel = 'stylesheet';
            if (refresh === true)
                link.href += "?ver=" + generNum();
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }

    function loadSCRIPTS(addresses,refresh) {
        // all script loaded deffered
        var alldone = $.Deferred();
        var actual = 0;
        refresh = refresh || false;
        loadNext();

        function loadNext() {
            if (actual< addresses.length) {
                loadScript().done(function() {
                    actual += 1;
                    loadNext();
                })
                    .fail(function(err)  { alldone.reject(err); });
            }
            else
                 alldone.resolve();
        }

        function loadScript() {
            // on each script load resolve..
            var scriptLoaded = $.Deferred();
            var script = document.createElement('script');
            script.src = addresses[actual];

            if (refresh === true) 
                script.src += "?ver=" + generNum();
            
          
            script.type = 'text/javascript';
            document.body.appendChild(script);
            script.onload = function () {
                //console.log(addresses[actual] + " loaded");
                scriptLoaded.resolve();
            };
            script.onerror = function (err) {
                scriptLoaded.reject(err);
            };
            //script.onload = script.onreadystatechange = function () {
            //    // make sure it's finished, then fullfill the promise
            //    if (!this.readyState || this.readyState === 'complete')
            //        eachDone.resolve();
            //};
            return scriptLoaded.promise();
        }

        return alldone.promise();
    }
    // enter key
    $(window).keyup(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        switch (code) {
            case 13: //enter
                $.event.trigger({ type: "key", value: 'enter' });
                break;
            case 27: // esc
                $.event.trigger({ type: "key", value: 'esc' });
                break;
            case 46: // delete
                $.event.trigger({ type: "key", value: 'delete' });
                break;
            case 8: // back space
                $.event.trigger({ type: "key", value:'backspace' });
                break;
            case 37: //left
                $.event.trigger({ type: "key", value:'left' });
                break;
            case 38: // up
                $.event.trigger({ type: "key", value: 'up' });
                break;
            case 39: // right
                $.event.trigger({ type: "key", value:'right' });
                break;
            case 40: //down
                $.event.trigger({ type: "key", value: 'down' });
                break;
        }
    });
    return {
      //  addScript: createScript,
        addMultipleCss: loadCSS,
        addMultipleScripts: loadSCRIPTS,
        loaderOn: LoaderOn,
        loaderOff: LoaderOff,
        coverOn: CoverOn,
        coverOff: CoverOff,
        progressOn: ProgressOn,
        progressOff: ProgressOff
    };
})();
