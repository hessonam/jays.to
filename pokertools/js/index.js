$('document').ready(function() {
    $('#sim').click(function() {
        var req = 'http://www.propokertools.com/simulations/show?g=' + 
            $('#game').val();
        var hands = [
            $('#hand1').val(),
            $('#hand2').val(),
            $('#hand3').val(),
            $('#hand4').val(),
        ];
        var boards = [
            $('#board1').val(),
            $('#board2').val(),
            $('#board3').val(),
        ]
        
        hands.filter(function(hand) {
            return hand.length > 0;
        });

        hquery = '';
        for (var i = 0; i < hands.length; i++) {
            hquery += '&h' + i + '=' + hands[i];
        }

        var queries = [
            req + '&b=' + boards[0] + '&d=' + boards[1] + boards[2] + hquery,
            req + '&b=' + boards[1] + '&d=' + boards[0] + boards[2] + hquery,
            req + '&b=' + boards[2] + '&d=' + boards[0] + boards[1] + hquery,
        ];

        queries.map(function(query) {
            return $.ajax(query);
        });

        console.log(queries);

        $.when.apply(undefined, queries, ).then(function(results){
            console.log(results);
        });
        
    });
});
