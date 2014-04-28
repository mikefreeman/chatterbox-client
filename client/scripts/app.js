// YOUR CODE HERE:

var app = {};
app.lastUpdate = Date.now();

app.init = function () {
  $('#sendButton').click(function(event) {
    var username = window.location.search.match(/username=([\w]*)/);
    username = username[1] || 'Anonymous';
    var message = $('#inputMsg').val();
    app.send({
      username: username,
      text: message,
      roomname: 'Lobby'
    });
  });
  app.fetch();
};

app.send = function(msgObject) {
  msgObject.username = msgObject.username || 'Anonymous';
  msgObject.text = msgObject.text || '';
  msgObject.roomname = msgObject.roomname || 'Lobby';

  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(msgObject),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
      app.fetch();
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

app.fetch = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox?order=-createdAt',
    where: {
      'createdAt': {'$gte': app.lastUpdate}
    },
    type: 'GET',
    success: function (data) {
      console.log(data);
      _.each(data.results, function(msgObject) {
        msgObject.username = msgObject.username || 'Anonymous';
        msgObject.text = msgObject.text || '';
        app.render(msgObject);
      });
      app.lastUpdate = data.results[99].createdAt;
    },
    error: function (data) {
      console.error('chatterbox: Failed to fetch messages');
    }
  });
};

app.render = function (msgObject) {
  var template = _.template('<div><%- username %>: <%- text %></div>');
  $('#main').append(template(msgObject));
};

$(document).ready(function() {
  app.init();
});
