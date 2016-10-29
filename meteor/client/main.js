import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

PlayersList = new Mongo.Collection('players');

$.getScript('http://10.128.26.102/snake/js/snake.js',function()
{
    mySnakeBoard = new SNAKE.Board(  {
                                            boardContainer: "game-area",
                                            fullScreen: false,
                                            top:326,
                                            left:210,
                                            width:560,
                                            height:440,

                                        });
});

if(Meteor.isClient){
    Meteor.subscribe('thePlayers');

    Template.leaderboard.helpers({
        'player': function(){
            return PlayersList.find({}, { sort: {oldest: 1} });
        },
        'selectedClass': function(){
            var playerId = this._id;
            var selectedPlayer = Session.get('selectedPlayer');
            if(playerId == selectedPlayer){
                return "selected"
            }
        },
        'selectedPlayer': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            return PlayersList.findOne({ _id: selectedPlayer });
        }

    });


    Template.leaderboard.events({
        'click .player': function(){
            var playerId = this._id;
            Session.set('selectedPlayer', playerId);
        },
        'click .increment': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            PlayersList.update({ _id: selectedPlayer }, { $inc: {score: 5} });
        },
        'click .decrement': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            PlayersList.update({ _id: selectedPlayer }, {$inc: {score: -5} });
        },
        'click .remove': function(){
            var selectedPlayer = Session.get('selectedPlayer');
            PlayersList.remove({ _id: selectedPlayer });
        }
    });
    Template.addPlayerForm.events({
        'submit form': function(){
            event.preventDefault();
            var playerNameVar = event.target.playerName.value;
            PlayersList.insert({
                name: playerNameVar,
                score: 0
            });
            event.target.playerName.value = "";

            var row = Math.floor(Math.random() * (50 - 1 + 1)) + 1;
            var col = Math.floor(Math.random() * (30 - 1 + 1)) + 1;

            // New snake
            //var mySnake = new SNAKE.Snake({playingBoard:mySnakeBoard,startRow:row,startCol:col});

        }
    });

    /*Template.leaderboard.render(function(){
        var selectedPlayer = Session.get('selectedPlayer');

        var mySnake[selectedPlayer] = new SNAKE.Snake({playingBoard:mySnakeBoard,startRow:row,startCol:col});
    });*/

    $("#thisPlayersHighScore").on('click',function()
    {
        var selectedPlayer = Session.get('selectedPlayer');
        var newScore = $("#thisPlayersHighScore").val();
        PlayersList.update({ _id: selectedPlayer }, { $set: { score:  newScore} });
    });

}

if(Meteor.isServer){
    // this code only runs on the server
    Meteor.publish('thePlayers', function(){
    return PlayersList.find();
});

}
