// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};

  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();

Lite =
{
    player: null,
    currentColor: null,
    foregroundColor: '#FFFFFF',
    noColor: 'rgba(255, 255, 255, 0.5)',
    playerDisplayed: false,
    displayResults: function(videos)
    {
        $('#results').fadeIn('slow');
        var res = '';
        if (videos.length == 0)
        {
            res = 'No videos found';
        }
        else
        {
            for (i in videos)
            {
                res += tmpl("video_tmpl", videos[i]);
            }
        }
        $('#results').html(res);
        
        if ($('embed').size() == 0 && !Lite.playerDisplayed)
        {
            Lite.playerDisplayed = true;
            Lite.loadVideoById($('.video_item:first').attr('id'));
        }

        $('.video_item').click(function(){
           Lite.loadVideoById($(this).attr('id'));
        });
    },
    search: function()
    {
        var req = '/search/' + $('#search').val() + '/1:30';
        $('nav#tabs').removeClass('selected');
        $('nav#tabs #searches').addClass('selected');

        if ($('a[href="' + req + '"]').size() == 0)
        {
            if($('nav#buttons #nav_searches a').size() == 0)
            {
                $('nav#buttons #nav_searches').html('');
            }
            Lite.request(req);
            $('nav#buttons #nav_searches').append('<a href="' + req + '" class="search selected">search: ' + $('#search').val() + '<span class="delete"></span></a>');
            $('nav#buttons a:last').hide().fadeIn().addClass('selected');
            Lite.initNav();
        }
        else
        {
            $('a[href="' + req + '"]').fadeOut('fast', function(){$(this).fadeIn();}).addClass('selected');
        }
        Lite.goToContext('nav_searches');
        Lite.applyColors();
    },
    request: function(req)
    {
        $('#results').fadeOut('fast');
        var req = 'http://www.dailymotion.com/json' + req + '?callback=Lite.displayResults&fields=title,thumbnail_small_url,video_id';
        $('#results').append('<scri' + 'pt src="' + req + '"></scri' + 'pt>');
        Lite.applyColors();
    },
    initNav: function()
    {
        $('nav#tabs a').click(function(){
            $('nav#tabs a').removeClass('selected');
            $(this).addClass('selected');
            Lite.goToContext('nav_' + $(this).attr('id'));
            if ($(this).attr('id') == 'history')
            {
                Lite.request('/user/Youpinadi/1:30');
            }
            Lite.applyColors();
            return false;
        });

        $('nav#buttons a').click(function(){
            $('nav#buttons a.selected').css('color', Lite.foregroundColor);
            $('nav#buttons a').removeClass('selected');
            $(this).addClass('selected');
            Lite.request($(this).attr('href'));
            return false;
        }).find('.delete').click(function()
        { 
            $(this).parent().remove();
            if($('nav#buttons #nav_searches a').size() == 0)
            {
                $('nav#buttons #nav_searches').html('no recent search');
            }
            return false;
        });
    },
    applyColors: function()
    {
        //RESET TABS COLORS
        $('#tabs a')
            .css('backgroundColor', '#000000')
            .css('color', Lite.foregroundColor);

        $('#tabs a.selected')
            .css('backgroundColor', Lite.currentColor);

        //RESET BUTTON COLORS
        $('#buttons a')
            .css('backgroundColor', Lite.noColor)
            .css('color', Lite.foregroundColor);

        $('#buttons a.selected')
            .css('backgroundColor', Lite.foregroundColor)
            .css('color', Lite.currentColor);

        $('.background').css('backgroundColor', Lite.currentColor);

        $('#buttons a').hover(
          function () {
            $(this)
                .css('backgroundColor', Lite.foregroundColor)
                .css('color', Lite.currentColor);
          },
          function () {
              if (!$(this).hasClass('selected'))
              {
                  $(this)
                    .css('backgroundColor', Lite.noColor)
                    .css('color', Lite.foregroundColor);
              }
          }
        );
    },
    goToContext: function(destContext)
    {
        if ($('#buttons .current_context').attr('id') == destContext)
        {
            return;
        }

        var out = $('#buttons .current_context').attr('id');

        $('#buttons .current_context').removeClass('current_context');
        $('#buttons #' + destContext)
            .addClass('current_context')
            .css('top', 40);

        $('#buttons #' + out)
            .animate
            (
                {
                    'top': -38
                },
                'fast',
                function()
                {
                    $('#buttons #' + destContext)
                        .animate
                        (
                            {
                                'top': 0
                            }
                        );
                }
            );

    },
    rgbToHexa: function(rgbString)
    {
        var parts = rgbString
                .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
        ;
        // parts now should be ["rgb(0, 70, 255", "0", "70", "255"]

        delete (parts[0]);
        for (var i = 1; i <= 3; ++i) {
            parts[i] = parseInt(parts[i]).toString(16);
            if (parts[i].length == 1) parts[i] = '0' + parts[i];
        }
        return parts.join(''); // "0070ff"
    },
    loadVideoById: function(videoId)
    {
        var col = Lite.rgbToHexa(Lite.currentColor);
        var cols = 'colors=background:000000;glow:000000;foreground:cccccc;special:' + col +';&autoPlay=1';
        var flashvars = {};
        var params = {'allowscriptaccess': 'always'};
        var attributes = {};
        swfobject.embedSWF("http://www.dailymotion.com/swf/" + videoId + '?' + cols, "video_player", "300", "120", "9.0.0","expressInstall.swf", flashvars, params, attributes);
    },
    switchColors: function(event)
    {
        var el = $(event.target);
        Lite.currentColor = el.css('backgroundColor');
        $('#colors span').removeClass('selected');
        $(el).addClass('selected');
        $('.background').css('backgroundColor', Lite.currentColor);
        Lite.applyColors();
    },
    initialize: function()
    {
        $(document).ready(function () {
            Lite.currentColor = $('#colors span.selected').css('backgroundColor');
            Lite.applyColors();
            $('#colors span').click(Lite.switchColors);

            $('#search_form').submit(function(){
                $('nav a').removeClass('selected');
                Lite.search();
                return false;
            });
            Lite.initNav();
            Lite.request('/buzz/1:30');
        });
    }
};
Lite.initialize();


function onDailymotionPlayerReady(id)
{
    console.log('OK');
    Lite.player = $(id);
};
