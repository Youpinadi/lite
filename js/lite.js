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


function displayResults(videos)
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
    $('.video_item').click(function(){
       player.loadVideoById($(this).attr('id'));
    });
}

function search()
{
    var req = '/search/' + $('#search').val() + '/1:30';
    $('nav#tabs').removeClass('selected');
    $('nav#tabs #recent_searches').addClass('selected');

    if ($('a[href="' + req + '"]').size() == 0)
    {
        request(req);
        $('nav#buttons').append('<a href="' + req + '">search: ' + $('#search').val() + '<span class="delete"></span></a>');
        $('nav#buttons a:last').hide().fadeIn().addClass('selected');
        initNav();
    }
    else
    {
        $('a[href="' + req + '"]').fadeOut('fast', function(){$(this).fadeIn()}).addClass('selected');
    }
}

function request(req)
{
    $('#results').fadeOut('fast');
    var req = 'http://www.dailymotion.com/json' + req + '?callback=displayResults&fields=title,thumbnail_small_url,video_id';
    $('#results').append('<scri' + 'pt src="' + req + '"></scri' + 'pt>');
}

var player;
function onDailymotionPlayerReady(id)
{
    player = $('#video_player').get(0);
};

function initNav()
{
    $('nav#tabs a').click(function(){
        $('nav#tabs a').removeClass('selected');
        $(this).addClass('selected');
        return false;
    });

    $('nav#buttons a').click(function(){
        $('nav#buttons a').removeClass('selected');
        $(this).addClass('selected');
        request($(this).attr('href'));
        return false;
    }).find('.delete').click(function(){ $(this).parent().fadeOut('fast'); return false});
}

$(document).ready(function () {

    var flashvars = {'enableApi' : 1};
    var params = {'allowscriptaccess': 'always'};
    var attributes = {};
    swfobject.embedSWF("http://stage-06.dailymotion.com/apiplayer?enableApi=1", "video_player", "300", "120", "9.0.0","expressInstall.swf", flashvars, params, attributes);


    $('#search_form').submit(function(){
        $('nav a').removeClass('selected');
        search();
        return false;
    });
    initNav();
    request('/buzz/1:30');
});
