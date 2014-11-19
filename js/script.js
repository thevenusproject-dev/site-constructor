$(function() {

  // Generate Markdown
  var markdown_content = $('#content').html();
  var html = marked(markdown_content);
  $('#content').html(html);
  
  // After all the stuff, fade out the loader
  $('.doc-loader').fadeOut('slow');

});
