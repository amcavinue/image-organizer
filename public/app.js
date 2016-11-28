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
    
    var tags = ['snow', 'trees', 'nature', 'castle', 'monet'];
    
    renderCards(imageData);
    
    // Put a modal listener on all the images.
    $('#main-cards').on('click', '.img-container', function() {
        $('#img-title').text($(this).data('name'));
        $('#img-description').text($(this).data('description'));
        $('#img-modal').attr("src", 'images/' + $(this).data('name'));
        
        $('#imgModal').modal('show');
    });
});

function renderCards(imageData) {
    var html = '<div class="row">';
    
    for (var i = 0; i < imageData.length; i++) {
        html += renderCard(imageData[i]);
    }
    
    html += '</div>';
    
    $('#main-cards').empty().append(html);
}

function renderCard(imgData) {
    return '<div class="col-xs-12 col-md-6 col-lg-4 image-card">' + 
                '<div class="card-container">' +
                    '<div class="img-container" data-name="' + imgData.name + '" data-description="' + imgData.description + '">' +
                        '<span class="img-helper"></span>' +
                        '<img src="images/' + imgData.name + '"></img>' +
                    '</div>' +
                    '<br />' +
                    '<span>' + imgData.description + '</span>' +
                    '<br />' +
                    '<a href="#"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> Edit</a>' +
                    '<a href="#"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> Delete</a>' +
                '</div>' +
            '</div>';
}
