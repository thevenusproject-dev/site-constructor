$(function() {

  // Generate Markdown
  var markdown_content = $('#content').html();
  var html = marked(markdown_content);
  $('#content').html(html);

});
