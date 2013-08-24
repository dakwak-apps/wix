/***
 *
 *  Dakwak javascript wix app
 *
 *  Dependency:
 *  Wix library:
 *
 *  <script type="text/javascript" src="//sslstatic.wix.com/services/js-sdk/1.16.0/js/Wix.js"></script>
 *
 */

var DakwakWix = function() {

    this.domain = 'http://stage1.us.dakwak.com:8189/';

    this.api = this.domain + 'api/users/';

    this.app = 'wix';
    this.instance = '';
    this.website_apikey = '';


    this.uid = '';
    this.email = '';
    this.url = '';
    this.lang_from = '';
    this.lang_to = '';
    this.userExists = false;


    this.init = function(page) {
        var t = this;

        Wix.getSiteInfo( function(siteInfo) {

            t.instance = t.getURLParameter('instance');
            t.uid = Wix.Utils.getUid();
            t.url = siteInfo.baseUrl;
            t.lang_from = Wix.Utils.getLocale();

            $.ajax({
                url: t.api + 'is_wix.json',
                type: 'POST',
                dataType: 'json',
                data: {uid: t.uid, url: t.url, app: t.app, instance: t.instance},
                success: function(data) {
                    if(data.exists == true) {
                        t.userExists = true;
                        t.website_apikey = data.website_apikey;
                        t.email = data.user_email;

                        if(page == 'widget') {
                            t.renderWidget(); 
                        }
                    }

                    if(page == 'settings') {
                        t.message('Dakwak is already activated. Your API key is: ' + data.website_apikey, 'success');
                        t.refreshSettings();
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    t.message(textStatus + ' : ' +  xhr.responseText, 'error');
                }
            });
        });
    }

    this.renderWidget = function() {
        if(this.website_apikey != '') {
            $('body').html('');

            _daq.push(['_apikey', this.website_apikey ]);

            var script = document.createElement( 'script' );
            script.type = 'text/javascript';
            script.async = true;
            script.src = document.location.protocol + '//c682891.r91.cf2.rackcdn.com/dakwakdevelopment.js';
            $("head").prepend( script );

        }
    }

    this.refreshSettings = function() {

        $('#email').val(this.email);
        $('#url').val(this.url);
        $('#lang_from').val(this.lang_from);
        $('#lang_to').val(this.lang_to);

        if(this.userExists ==  true) {
            $('#settings-form input, #settings-form select').attr('disabled', 'disabled');
        }
    }

    this.isWix = function() {
        return this.userExists;
    }

    this.newUser = function() {
        var t = this;

        $.ajax({
            url: t.api + 'new.json',
            type: 'POST',
            dataType: 'json',
            data: {uid: t.uid, email: t.email, url: t.url, from_lang: t.from_lang, to_lang: t.to_lang,  app: t.app, instance: t.instance},
            success: function(data) {
                t.message('Thank you! Dakwak should be activated on your website. Your API key is: ' + data.website_apikey, 'success');
                t.refreshSettings();
                Wix.Settings.refreshApp();
            },

            error: function(xhr, textStatus, errorThrown) {
                t.message(textStatus + ' : ' +  xhr.responseText, 'error');
            }
        });
    }

    this.message = function(message, type) {
        var html = '<div class="alert alert-' + type + '">' + message + '</div>';
        $('.message').html(html).fadeIn();
    }

    this.getURLParameter = function(name) {
        return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
        );
    }
}
