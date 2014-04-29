// YOUR CODE HERE:

var app = {};
app.lastUpdate = new Date().toISOString();
app.room = 'lobby';
app.friends = [];

app.init = function () {
  $('#sendButton').click(function(event) {
    var username = window.location.search.match(/username=([\w]*)/);
    username = username[1] || 'Anonymous';
    var message = $.trim($('#inputMsg').val());
    if (message.slice(0, 5) === '/join') {
      app.room = message.split(' ')[1].toLowerCase();
      $('#roomName').text('Room: ' + app.room);
      $('#chatContainer').html('');
    } else {
      app.send({
        username: username,
        text: message,
        roomname: app.room
      });
    }
  });

  $('#roomName').text('Room: ' + app.room);
  setInterval(app.fetch, 2000);
};

app.send = function(msgObject) {
  msgObject.username = msgObject.username || 'Anonymous';
  msgObject.text = msgObject.text || '';
  msgObject.roomname = msgObject.roomname || 'lobby';

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
      'createdAt': {'$gte': {'__type': 'Date', 'iso': app.lastUpdate}}
    },
    type: 'GET',
    success: function (data) {
      console.log(data);
      var newMessages = _.filter(data.results, function(value) {
        value.roomname = value.roomname || 'lobby';
        return (value.createdAt > app.lastUpdate && value.roomname === app.room);
      });
      for (var i = newMessages.length - 1; i >= 0; i--) {
        var msgObject = data.results[i];
        msgObject.username = msgObject.username || 'Anonymous';
        msgObject.text = msgObject.text || '';
        app.render(msgObject);
      }
      app.lastUpdate = newMessages.length ? newMessages[0].createdAt : app.lastUpdate;
    },
    error: function (data) {
      console.error('chatterbox: Failed to fetch messages');
    }
  });
};

app.render = function (msgObject) {
  var template = _.template('<div><span class="befriend"><%- username %></span>: <%- text %></div>');

  var $message = $(template(msgObject));

  if (_.contains(app.friends, msgObject.username)) $message.css({fontWeight: 800})

  $('#chatContainer').append($message);
  $('.befriend').click(function() {
    app.friends.push($(this).text());
  });
};

$(document).ready(function() {
  app.init();
});
