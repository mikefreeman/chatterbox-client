// YOUR CODE HERE:

var app = {};
app.init = function () {
  app.fetch();
};

app.send = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',

  });
};

app.fetch = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    success: function (data) {
      _.each(data.results, function(msgObject) {
        msgObject.username = msgObject.username || 'Anonymous';
        msgObject.text = msgObject.text || '';
        app.render(msgObject);
      });
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.render = function (msgObject) {
  var template = _.template('<div><%- username %>: <%- text %></div>');
  $('#main').append(template(msgObject));
};

app.init();
