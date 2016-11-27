$(function() {
    var imageData = [
        {
            id: 0,
            description: 'A picture of snow.',
            name: '23.jpg',
            tags: ['snow', 'trees', 'nature']
        },
        {
            id: 1,
            description: 'Another picture of snow.',
            name: 'ice_castle550.jpg',
            tags: ['snow', 'castle', 'nature']
        },
        {
            id: 2,
            description: 'A third picture of snow.',
            name: 'monet04.jpg',
            tags: ['snow', 'trees', 'monet']
        },
        {
            id: 3,
            description: '4 picture of snow.',
            name: '23.jpg',
            tags: ['snow', 'trees', 'nature']
        },
        {
            id: 4,
            description: '5 picture of snow.',
            name: 'ice_castle550.jpg',
            tags: ['snow', 'castle', 'nature']
        },
        {
            id: 5,
            description: '6 picture of snow.',
            name: 'monet04.jpg',
            tags: ['snow', 'trees', 'monet']
        },
    ];
    
    renderCards(imageData);
});

function renderCards(imageData) {
    var html = '',
        rows = 0;
    
    for (var i = 0; i < imageData.length; i++) {
        // Place a new row before every third image.
        if (i % 3 === 0) {
            html += '<div class="row">';
            rows += 1;
        }
        
        html += renderCard(imageData[i]);
        
        // Close the div after every third image.
        if ((i + 1) % 3 === 0) {
           html += '</div>';
        }
    }
    
    $('.container').empty().append(html);
}

function renderCard(imgData) {
    return '<div class="col-xs-12 col-md-4 image-card">' + 
                '<img src="images/' + imgData.name + '"></img>' +
                '<br />' +
                '<span>' + imgData.description + '</span>' +
                '<br />' +
                '<a href="#">Delete</a>' + 
                '<a href="#">Edit</a>' +
            '</div>';
}
