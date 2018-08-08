MEDUSA.home.editShow = function() {
    const { webRoot, apiKey } = window;

    if (MEDUSA.config.fanartBackground) {
        const path = webRoot + '/api/v2/series/' + $('#series-slug').attr('value') + '/asset/fanart?api_key=' + apiKey;
        $.backstretch(path);
        $('.backstretch').css('opacity', MEDUSA.config.fanartBackgroundOpacity).fadeIn(500);
    }
};
