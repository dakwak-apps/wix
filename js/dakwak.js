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
    this.from_lang = '';
    this.to_lang = '';
    this.userExists = false;


    this.init = function(page) {
        var t = this;

        Wix.getSiteInfo( function(siteInfo) {

            t.instance = t.getURLParameter('instance');
            t.uid = Wix.Utils.getUid();
            t.url = siteInfo.baseUrl;
            t.from_lang = Wix.Utils.getLocale();

            if(!t.url) {
                t.message('Your Wix website needs to have a valid URL. You may need to publish it first, set your URL then enable Dakwak.', 'error');
                t.refreshSettings();
                return;
            }

            $.ajax({
                url: t.api + 'is_wix.json',
                type: 'POST',
                dataType: 'json',
                data: {uid: t.uid, url: t.url, app: t.app, instance: t.instance},
                success: function(data) {
                    if(data.exists == true) {
                        t.userExists = true;
                        t.url = 'http://' + data.website_slug;
                        t.website_apikey = data.website_apikey;
                        t.email = data.user_email;
                        t.to_lang = data.to_lang;
                        t.from_lang = data.from_lang;

                        if(page == 'widget') {
                            t.renderWidget();
                        }

                        if(page == 'settings') {
                            t.message('Dakwak is already activated. Your API key is: ' + t.website_apikey, 'success');
                            t.refreshSettings();
                        }
                    } else {
                        if(page == 'settings') {
                            t.refreshSettings();
                        }
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    t.message(textStatus + ' : ' +  xhr.responseText, 'error');
                }
            });
        });
    }

    this.renderWidget = function() {
        t = this;

        if(t.website_apikey != '') {
            /*** script widget

                $('body').html('');

                _daq.push(['_apikey', this.website_apikey ]);

                var script = document.createElement( 'script' );
                script.type = 'text/javascript';
                script.async = true;
                script.src = document.location.protocol + '//c682891.r91.cf2.rackcdn.com/dakwakdevelopment.js';
                $("head").prepend( script );

            */

            $.ajax({
                url: t.domain + 'api/websites/' + t.website_apikey + '/widget',
                type: 'POST',
                success: function(data) {
                    $('body').html(data);
                },

                error: function(xhr, textStatus, errorThrown) {
                    $('body').html(textStatus + ' : ' +  xhr.responseText, 'error');
                }
            });

        }
    }

    this.refreshSettings = function() {

        $('#email').val(this.email);
        $('#url').val(this.url);
        $('#from_lang').val(this.from_lang);
        $('#to_lang').val(this.to_lang);

        if(this.userExists ==  true || !this.url) {
            $('#settings-form input, #settings-form select').attr('disabled', 'disabled');
        }
    }

    this.isWix = function() {
        return this.userExists;
    }

    this.newUser = function() {
        var t = this;
        t.email = $('#email').val();
        t.from_lang = $('#from_lang').val();
        t.to_lang = $('#to_lang').val();
        t.url = $('#url').val();

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
