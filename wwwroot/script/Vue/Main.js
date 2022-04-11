var EventENUMS = {
    CoverOn: 'coverOn',
    CoverOff: 'coverOff',
    ShowLoginForm: 'loginFormOn',
    HideLoginForm: 'loginFormOff',
    LoggedIn: 'loggedIn',
    LoggedOut: 'loggedOut',
    PartialUrlChanged: 'urlChanged',
    SetTitle: 'titleChanged',
    SetInfo: 'infoChanged',
    NetworkOn: 'networkON',
    NetworkOff: 'networkOFF'
};
var AuthService = (function () {
    //#region set ajax header
    function setTokenAsHeader() {
        var token = StoreService.GetToken();
        if (token !== null) {
            $.ajaxSetup({
                beforeSend: function (xhr) { xhr.setRequestHeader("Authorization", `Bearer ${token}`); }
            });
        }
    }
    function removeTokenAsHeader() {
        // set empty to remove header
        $.ajaxSetup({ beforeSend: function (xhr, settings) { } });
    }
    //#endregion set ajax header

    function canReconnect() {
        var refreshToken = StoreService.GetRefreshToken();
        return !func.isEmpty(refreshToken);
    }
    function reconnect() {
        var def = $.Deferred();
        var refreshToken = StoreService.GetRefreshToken();
        if (func.isEmpty(refreshToken))
            def.reject("no Refresh token stored");
        else {
            $.ajax({
                type: "POST",
                url: `${URLS.Auth.RefreshToken}/${refreshToken}`,
                async: true,
                cache: false,
                contentType: 'application/json; charset=utf-8',
                processData: false
            })
                .done(function (data) {
                    StoreService.StoreCredentials(data);
                    setTokenAsHeader();
                    def.resolve();
                })
                .fail(function (err) { def.reject(err); });
        }
        return def.promise();
    }
    function isAuthenticated() {
        var def = $.Deferred();
        var token = StoreService.GetToken();
        if (token === null)
            def.resolve(false);
        // setTokenAsHeader(); 
        $.ajax({
            type: "POST",
            url: URLS.Auth.IsAuth
        }).done(function (res) { def.resolve(res); })
            .fail(function (err) { def.reject(); });
        return def.promise();
    }

    return {
        IsAuthenticated: isAuthenticated,
        CanReconnect: canReconnect,
        Reconnect: reconnect,
        SetHeader: setTokenAsHeader,
        RemoveHeader: removeTokenAsHeader,
    };
}());

var NetworkENUMS = {
    WS_HEADER_NAME: 'wsToken',
    JOINED: 'joined',
    LEFT: 'left',
    AUTH2_REQUESTED: 'DoubleAuthRequested',
    AUTH2_CANCELED: 'DoubleAuthCanceled'
};
var NetworkService = (function () {
    var RestartDelay;
    const url = "/networkPcHub";
    var ConnectionHUB;
    $(window).on(EventENUMS.LoggedIn, function () {
        return;
        if (!ConnectionHUB)
            start();
    });
    function getHub() { return ConnectionHUB; }
    function getState() { return ConnectionHUB?.connection?.connectionState; }
    function isConnected() { return ConnectionHUB?.connection?.connectionState >= -1; }
    function start(restartDelay = 15) {
        //  console.log("try network web socket connection");
        RestartDelay = restartDelay;
        ConnectionHUB = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.None)
            .withUrl(url, { accessTokenFactory: () => AuthService.GetToken() })
            .build();
        ConnectionHUB.onclose(function () {
            $.event.trigger(EventENUMS.NetworkOff);
            Retart();
        });
        AuthService.IsAuthenticated()
            .done(function (res) {
                if (res === true)
                    ConnectionHUB.start()
                        .then(function (data) {
                            $.event.trigger(EventENUMS.NetworkOn);
                            console.log("network CONNECTED");
                        })
                        .catch(function (res) {
                            Retart();
                            console.log("network FAILED");
                        });
            });
    }
    function stop() { networkHub.Stop(); }
    function Retart() { setTimeout(function () { start(); }, RestartDelay * 1000); }
    return {
        Start: start,
        Stop: stop,
        GetState: getState,
        IsConnected: isConnected,
        HUB: getHub
    }
}());

var ChatService = (function () {
    var RestartDelay;
    const url = "/chatHub";
    var ConnectionHUB;
    $(window).on(EventENUMS.LoggedIn, function () {
        return;
        if (!ConnectionHUB)
            start();
    });
    function getHub() { return ConnectionHUB; }
    function getState() { return ConnectionHUB?.connection?.connectionState; }
    function isConnected() { return ConnectionHUB?.connection?.connectionState >= -1; }
    function start(restartDelay = 15) {
        //   console.log("try chat connection");
        RestartDelay = restartDelay;
        ConnectionHUB = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.None)
            .withUrl(url, { accessTokenFactory: () => AuthService.GetToken() })
            .build();
        ConnectionHUB.onclose(function () {
            $.event.trigger(EventENUMS.NetworkOff);
            Retart();
        });
        AuthService.IsAuthenticated()
            .done(function (res) {
                if (res === true)
                    ConnectionHUB.start()
                        .then(function (data) {
                            console.log("chat CONNECTED");
                        })
                        .catch(function (res) {
                            Retart();
                            console.log("chat FAILED");
                        });
            });
    }
    function stop() {
        networkHub.Stop();
        console.log("stoped");
    }
    function Retart() {
        setTimeout(function () {
            start();
            console.log("restart");
        }, RestartDelay * 1000);
    }
    return {
        Start: start,
        Stop: stop,
        GetState: getState,
        IsConnected: isConnected,
        HUB: getHub
    }
}());
//#region 2FA
var DoubleAuthService = (function () {
    function handleRequest(body, userId, expire) {
        return DoubleAuthDialog.Show(body, expire)
            .then(function (res) {
                if (res == false) {
                    cancel(userId)
                        .then(function (msg) {
                            Pop.ShowInfo(msg);
                        })
                        .fail(function (err) { console.log(err); })
                        .always(function () { StoreService.UpdateDoubleAuthState(".", null, null) });
                }
                else {
                    validate(userId, res)
                        .then(function (msg) { console.log(msg); })
                        .fail(function (err) { console.log(err); })
                        .always(function () { StoreService.UpdateDoubleAuthState(".", null, null) });
                }
            })
            .fail(function (err) { })
            .always(function () { });
    }
    function validate(key, code) {
        var data = { key: key, code: code };
        return $.ajax({
            type: "POST",
            url: URLS.DoubleAuth.Validate,
            async: true,
            cache: false,
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            processData: false
        });
    }
    function cancel(key) {
        var data = { key: key };
        return $.ajax({
            type: "POST",
            url: URLS.DoubleAuth.Cancel,
            async: true,
            cache: false,
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            processData: false
        });
    }
    return {
        HandleRequest: handleRequest,
        Validate: validate,
        Cancel: cancel
    }
}());
var NetworkBasicService = (function () {
    var self = this;
    var count = 1;
    var RestartDelay = 20 * count;
    var ConnectionHUB;
    const url = "/networkBasicHub";
    function getHub() { return ConnectionHUB; }
    function getState() { return ConnectionHUB?.connection?.connectionState; }
    function isConnected() { return ConnectionHUB?.connection?.connectionState >= -1; }
    function start(restartDelay = 20) {
        console.log("try network connection");
        RestartDelay = restartDelay * count;
        ConnectionHUB = new signalR.HubConnectionBuilder()
            .configureLogging(signalR.LogLevel.None)
            .withUrl(url)
            .build();
        ConnectionHUB.onclose(function () {
            $.event.trigger(EventENUMS.NetworkOff);
            console.log("Stopped");
            Retart();
        });
        ConnectionHUB.on(NetworkENUMS.AUTH2_REQUESTED, function (_data) {
            var data = Object.assign(MODELS.DoubleAuthMsgModel, _data);
            DoubleAuthService.HandleRequest(data.message, data.userId, data.expire);
            var now = new Date(Date.now());
            var expireTime = new Date(now.setSeconds(now.getSeconds() + data.expire));
            StoreService.UpdateDoubleAuthState(data.userId, null, expireTime);
        });
        ConnectionHUB.start()
            .then(function (data) {
                count = 1;
                var url = ConnectionHUB.connection.transport.webSocket.url;
                var token = func.GetValFormUrl(url, "id")
                $.ajaxSetup({ beforeSend: function (xhr) { xhr.setRequestHeader(NetworkENUMS.WS_HEADER_NAME, token); } });
                StoreService.UpdateDoubleAuthState(null, token, null);
                // ConnectionHUB.invoke("GetMyID")
                //     .then(function (res) {
                //         console.log(res);
                //     //$.ajaxSetup({
                //     //    beforeSend: function (xhr) {   xhr.setRequestHeader("wsToken", res);    }
                //     //});
                //});
                //   $.event.trigger(EventENUMS.NetworkOn);
            })
            .catch(function (res) {
                // Retart();
                console.log("network FAILED");
            });
    }
    function stop() { networkHub.Stop(); }
    function Retart() {
        count++;
        console.log("delay " + RestartDelay);
        setTimeout(function () { start(); }, RestartDelay * 1000);
    }
    // an Auth didn't expired open auth dialog
    function resetOldRequest() {
        var state = StoreService.GetDoubleAuthState();
        if (func.isEmpty(state) || func.isEmpty(state.userId) || state.userId.length == 1)
            return;
        var now = new Date(Date.now());
        var expireTime = new Date(state.expireTime);
        var wating = now < expireTime;
        if (wating === false)
            return;
        var left = expireTime - now;
        console.log(left);
        left = Math.floor(left / 1000);
        if (left > 1) {
            // DoubleAuthService.HandleRequest(null, state.userId, left);
            Dialog.ShowOk("ANNULATION", "La reqête en cours à été annulé!");
            DoubleAuthService.Cancel(state.userId)
                .then(function (msg) {
                    Pop.ShowInfo(msg);
                })
                .fail(function (err) { console.log(err); })
                .always(function () { StoreService.UpdateDoubleAuthState(".", null, null) });
        }
    }
    return {
        Start: start,
        Stop: stop,
        GetState: getState,
        IsConnected: isConnected,
        ResetOldRequest: resetOldRequest,
        HUB: getHub
    }
}());
var DoubleAuthDialog = new Vue({
    el: '#doubleAuthDialog',
    data: {
        OkText: 'VALIDER',
        CancelText: 'ANNULER',
        dialogTitle: 'AUTHENTIFICATION',
        dialogInputText: '',
        input1: '',
        input2: '',
        input3: '',
        input4: '',
        input5: '',
        input6: '',
        sec: 0,
        timer: null
    },
    mounted: function () {
        var self = this;
        // self.Show("test ", 10);
    },
    watch: {
        input1: function (newVal, oldVal) {
            this.input1 = func.removeNonDigit(newVal);
            this.input1.length > 1 ? this.input1 = oldVal : this.input1;
            if (this.input1.length === 1)
                $('#input2').focus();
        },
        input2: function (newVal, oldVal) {
            this.input2 = func.removeNonDigit(newVal);
            this.input2.length > 1 ? this.input2 = oldVal : this.input2;
            if (this.input2.length === 1)
                $('#input3').focus();
        },
        input3: function (newVal, oldVal) {
            this.input3 = func.removeNonDigit(newVal);
            this.input3.length > 1 ? this.input3 = oldVal : this.input3;
            if (this.input3.length === 1)
                $('#input4').focus();
        },
        input4: function (newVal, oldVal) {
            this.input4 = func.removeNonDigit(newVal);
            this.input4.length > 1 ? this.input4 = oldVal : this.input4;
            if (this.input4.length === 1)
                $('#input5').focus();
        },
        input5: function (newVal, oldVal) {
            this.input5 = func.removeNonDigit(newVal);
            this.input5.length > 1 ? this.input5 = oldVal : this.input5;
            if (this.input5.length === 1)
                $('#input6').focus();
        },
        input6: function (newVal, oldVal) {
            this.input6 = func.removeNonDigit(newVal);
            this.input6.length > 1 ? this.input6 = oldVal : this.input6;
        },
        sec: function (newVal, oldVal) {
            if (newVal === 0 || newVal < 0) {
                clearInterval(this.timer);
                this._closeDialog();
                Pop.ShowError("Temps expiré!");
            }
        }
    },
    computed: {
        canValidate: function () {
            return this.input1.length === 1 &&
                this.input2.length === 1 &&
                this.input3.length === 1 &&
                this.input4.length === 1 &&
                this.input5.length === 1 &&
                this.input6.length === 1;
        }
    },
    methods: {
        _openDialog: function () {
            $(window).trigger(EventENUMS.CoverOn);
            var dialog = $('#doubleAuthDialog');
            clearInterval(this.timer);
            dialog.velocity({ opacity: [1, 0] }, { display: 'block' });
        },
        _closeDialog: function () {
            $(window).trigger(EventENUMS.CoverOff);
            var dialog = $('#doubleAuthDialog');
            clearInterval(this.timer);
            dialog.velocity({ opacity: [0, 1] }, { display: 'none' });
        },
        Show: function (body, sec) {
            var self = this;
            this.$DialogDef = $.Deferred();
            this.dialogTitle = body || this.dialogTitle;
            this.input1 = '';
            this.input2 = '';
            this.input3 = '';
            this.input4 = '';
            this.input5 = '';
            this.input6 = '';
            this._openDialog();
            this.sec = sec;
            this.timer = setInterval(function () {
                self.sec--;
            }, 1000);
            return this.$DialogDef.promise();
        },
        Ok_YesClick: function () {
            this._closeDialog();
            var code = this.input1 + this.input2 + this.input3 + this.input4 + this.input5 + this.input6;
            this.$DialogDef.resolve(code);
        },
        Cancel_NOClick: function () {
            this._closeDialog();
            this.$DialogDef.resolve(false);
        }
    }
});
//#endregion 2FA

var DialogTypeENUMS = {
    InfoOk: 'infoOk',
    InfoYesNo: 'infoYesNo',
    InfoInput: 'infoInput',
    DoubleAuth: 'doubleAuth'
};

var Dialog = new Vue({
    el: '#dialog',
    data: {

        btn1: '',
        btn2:'',
        OkText: 'OK',
        CancelText: 'ANNULER',
        YesText: 'OUI',
        NoText: 'NON',
        ValidateText: 'VALIDER',

        dialogType: '',
        dialogTitle: '',
        dialogMessage: '',
        dialogInputText: ''
    },
    mounted: function () { },
    watch: {
        'dialogType': function (newVal, oldVal) {
          
            if (newVal === DialogTypeENUMS.InfoOk) {
                this.btn1 = this.OkText;
                this.btn2 = this.CancelText;
            }
            else if (newVal === DialogTypeENUMS.InfoYesNo) {
                this.btn1 = this.YesText;
                this.btn2 = this.NoText;
            }
            if (newVal === DialogTypeENUMS.InfoInput) {
                this.btn1 = this.ValidateText;
            }
            if (newVal === DialogTypeENUMS.DoubleAuth) {
                this.btn1 = this.ValidateText;
                this.btn2 = this.CancelText;
            }

            
        }
    },
    computed: {
        showInput: function () {
            return this.dialogType === DialogTypeENUMS.InfoInput;
        },
    },
    methods: {
        _openDialog: function () {
            $(window).trigger(EventENUMS.CoverOn);
            var dialog = $('#dialog');
            dialog.velocity({ opacity: [1, 0] }, { display: 'block' });
        },
        _closeDialog: function () {
            $(window).trigger(EventENUMS.CoverOff);
            var dialog = $('#dialog');
            dialog.velocity({ opacity: [0, 1] }, { display: 'none' });
        },
        ShowOk: function (title, message) {
            this.$DialogDef = $.Deferred();
            this.dialogType = DialogTypeENUMS.InfoOk;
            this.dialogTitle = title;
            this.dialogMessage = message;
            this._openDialog();
            return this.$DialogDef.promise();
        },
        ShowYesNo: function (title, message) {
            this.$DialogDef = $.Deferred();
            this.dialogType = DialogTypeENUMS.InfoYesNo;
            this.dialogTitle = title;
            this.dialogMessage = message;
            this._openDialog();
            return this.$DialogDef.promise();
        },
        ShowInput: function (title) {
            this.dialogType = DialogTypeENUMS.InfoInput;
            this.$DialogDef = $.Deferred();
            this.dialogTitle = title;
            this.dialogInputText = '';
            this._openDialog();
            return this.$DialogDef.promise();
        },
        Ok_YesClick: function () {
            this._closeDialog();
            if (this.dialogType === DialogTypeENUMS.InfoInput)
                this.$DialogDef.resolve(this.dialogInputText);
            else if (this.dialogType === DialogTypeENUMS.InfoYesNo)
                this.$DialogDef.resolve(true);
            else if (this.dialogType === DialogTypeENUMS.InfoOk)
                this.$DialogDef.resolve();
        },
        Cancel_NOClick: function () {
            this._closeDialog();
            this.$DialogDef.resolve(false);
        }
    }
});

var Loader = new Vue({
    el: '#loader',
    data: {
        loaderOn: false,
        message: '',
    },
    mounted: function () {

        //$(window).on(appEVENTS.LoaderChanged, function (e) {

        //    alert(e);
        //});
        //this.on();
        //this.updateMessage('salut les cocockte');
    },
    methods: {
        on: function (msg) {
            this.message = msg;
            this.loaderOn = true;
        },
        off: function () {
            this.loaderOn = false;
        },
        updateMessage: function (msg) {
            this.message = msg;
        }
    }
});

var PopTypeENUMS = { Info: 'info', Ok: 'ok', Warning: 'warning', Error: 'error' };
var Pop = new Vue({
    el: '#pop',
    data: {
        popType: PopTypeENUMS.Info,
        popContent: 'text',
        translateX: '26em',
        delay: 3500
    },
    mounted: function () {

        //this.ShowError("salut les momoche how are u I am fine");
        
    },
    methods: {
        ShowInfo: function (msg, popType, delay) {
            var self = this;
            this.popContent = msg;
            this.popType = PopTypeENUMS.Info;
            delay = delay || this.delay;
            clearInterval(this.$popDelay);
            var pop = $('#pop');
            popTimer = pop.velocity({ translateX: [0, self.translateX] });
            this.$popDelay = setTimeout(function () {
                pop.velocity({ translateX: [self.translateX, 0] });
            }, delay);
        },
        ShowError: function (msg, delay) {
            var self = this;
            this.popContent = msg;
            this.popType = PopTypeENUMS.Error;
            delay = delay || this.delay;
            clearInterval(this.$popDelay);
            var pop = $('#pop');
            popTimer = pop.velocity({ translateX: [0, self.translateX] });
            this.$popDelay = setTimeout(function () {
                pop.velocity({ translateX: [self.translateX, 0] });
            }, delay);
        },
        ShowOk: function (msg, delay) {
            var self = this;
            this.popContent = msg;
            this.popType = PopTypeENUMS.Ok;
            delay = delay || this.delay;
            clearInterval(this.$popDelay);
            var pop = $('#pop');
            popTimer = pop.velocity({ translateX: [0, self.translateX] });
            this.$popDelay = setTimeout(function () {
                pop.velocity({ translateX: [self.translateX, 0] });
            }, delay);
        },
        ShowWarning: function (msg, delay) {
            var self = this;
            this.popContent = msg;
            this.popType = PopTypeENUMS.Warning;
            delay = delay || this.delay;
            clearInterval(this.$popDelay);
            var pop = $('#pop');
            popTimer = pop.velocity({ translateX: [0, self.translateX] });
            this.$popDelay = setTimeout(function () {
                pop.velocity({ translateX: [self.translateX, 0] });
            }, delay);
        }
    }
});



var MAIN = new Vue({
    el: '#navigation',
    data: {
        selectedBtn: '',
        menuOpen: false,
        oldURL: '',
        newURL: '',

        //#region message

        connectOk: 'Connection validé',
        connectTry: 'Tentative de reconnection...',
        sessionExpired: 'Session expirée, Veuillez vous reconnecter.',
        dialogDisconnectTitle: 'CONFIRMATION',
        dialogDisconnectMsg: 'Voulez-vous vous déconnecter?',
        //#endregion message
    },

    mounted: function () {
        var self = this;

       // Loader.on();

        window.onhashchange = function (e) {

            self.oldURL = e.oldURL;
            self.newURL = e.newURL;

            self.reload();

            self.menuOpen = false;
        };
        self.INI();
      
    },
    methods: {
        _getArg: function () {
            let url = location.hash;
            return url.split('#')[1];
        },
        menuClick: function () {
            var self = this;
            self.menuOpen = !self.menuOpen;
            self.selectedBtn = location.hash;
        },
        loadPartialView: function (url) {

           
            return $.ajax({
                type: "GET",
                url: `${URLS.PartialView}${url}`,
                async: true,
                cache: false,
                contentType: false,
                processData: false
            });
        },
        rollBack: function () {
            var self = this;
            window.history.pushState("", "", self.oldURL);
            self.selectedBtn = location.hash;
        },
        logOut: function () {
            var self = this;

            Dialog.ShowYesNo(self.dialogDisconnectTitle, self.dialogDisconnectMsg)
                .done(function (res) {


                    if (res === true) {

                        StoreService.RemoveCredentials();
                        AuthService.RemoveHeader();
                        location.hash = 'login';
                    }
                });

        },
        reload: function () {


            var self = this;
            var arg = self._getArg();
            var partial = func.isEmpty(arg) ? 'dashboard' : arg;


            self.selectedBtn = partial;

            self.loadPartialView(partial)
                .done(function (data) { $('#pageContent').html(data); })
                .fail(function (err) { Pop.ShowWarning(self.sessionExpired); });
        },
        INI: function () {


            var self = this;


            self.reload();
            //location.hash = 'login';

           
            //var token = StoreService.GetToken();

            //if (func.isEmpty(token)) {

            //    AuthService.Reconnect().done(function () { self.isLogged(); })
            //        .fail(function (err) {
            //            Pop.ShowWarning(self.sessionExpired);
            //            location.hash = 'login';
            //            self.reload();
            //        })
            //        .always(function () { Loader.off(); });
            //}
            //else {
            //    AuthService.SetHeader();

            //    AuthService.IsAuthenticated()
            //        .done(function (res) {
            //            if (res === true) {
            //                if (func.isEmpty(location.hash))
            //                    location.hash = 'dashboard';
            //                else
            //                    self.reload();
            //            }
            //            else {
            //                AuthService.Reconnect()
            //                    .done(function () { self.isLogged(); })
            //                    .fail(function (err) { location.hash = 'login'; });
            //            }
            //        })
            //        .fail(function (err) { location.hash = 'login'; })
            //        .always(function () { Loader.off(); });
            //}
        },
        isLogged: function () {
            var self = this;
            Pop.ShowOk(self.connectOk);

            AuthService.SetHeader();
            var arg = this._getArg();

            if (arg?.includes('login'))
                location.hash = 'dashboard';
            else
                this.reload();


        },


    }
});

