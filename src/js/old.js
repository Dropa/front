$(document).ready(function() {
    $('#chatform').hide();
    var getTexts = function() {
        $.get('https://uhkis.net/dchat/rest/session/token').done(function (data) {
            $.ajax('https://uhkis.net/dchat/chat', {
                headers: {
                    'Content-Type': 'application/hal+json',
                    'X-CSRF-Token': data,
                }
            }).done(function (data) {
                var content = '';
                for (x in data) {
                    content += '&lt;' + data[x].name + '&gt;' + data[x].title + '<br>';
                }
                $('#chat').html(content);
            }).always(function() {
                if ($('#chat').text().length == 0) {
                    $('#login').show();
                } else {
                    $('#chatform').show();
                    $('#login').hide();
                }
            });
        });
    };
    getTexts();
    window.setInterval(getTexts, 10000);
    var newNode = function (text) {
        return {
            _links: {
                type: {
                    href: 'https://uhkis.net/dchat/rest/type/node/message'
                }
            },
            type: {
                target_id: 'message'
            },
            title: {
                value: text
            }
        };
    }
    $('#chatform').on('submit', function(e) {
        e.preventDefault();
        $.get('https://uhkis.net/dchat/rest/session/token').done(function(token) {
            var options = {
                url: 'https://uhkis.net/dchat/node?_format=hal_json',
                type: 'POST',
                headers: {
                    'Content-type': 'application/hal+json',
                    'X-CSRF-Token': token,
                },
                data: JSON.stringify(newNode($('#message').val()))
            };
            console.log(options);
            $.ajax(options).fail(function(d, x, a, e) {
            }).done(function(data) {
                getTexts();
            });
        });
    });
    $('#login').on('submit', function(e) {
        e.preventDefault();
        data = {
            'name': $('input[name="name"]').val(),
            'pass': $('input[name="pass"]').val()
        };
        $.post('https://uhkis.net/dchat/user/login?_format=json', JSON.stringify(data), function(output, st, xhr) {
            console.log(output);
            console.log(st);
            console.log(xhr);
        }, 'json').fail(function(a,b,c) {
            console.log(a);
            console.log(b);
            console.log(c);
        });
        getTexts();
    });
});