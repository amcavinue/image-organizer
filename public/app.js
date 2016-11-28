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
    
    var tags = ['snow', 'trees', 'nature', 'castle', 'monet', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu', 'vwx', 'yza', 'bcd', 'efg', 'hij', 'klm', 'nop'];
    
    var imageTagAssociative = [
        {
          imageId: '0',
          imageName: '23.jpg',
          tag: 'snow'
        },
        {
          imageId: '0',
          imageName: '23.jpg',
          tag: 'trees'
        },
        {
          imageId: '0',
          imageName: '23.jpg',
          tag: 'nature'
        },
        {
          imageId: '1',
          imageName: 'ice_castle550.jpg',
          tag: 'snow'
        },
        {
          imageId: '1',
          imageName: 'ice_castle550.jpg',
          tag: 'castle'
        },
        {
          imageId: '1',
          imageName: 'ice_castle550.jpg',
          tag: 'nature'
        },
        {
          imageId: '2',
          imageName: 'monet04.jpg',
          tag: 'snow'
        },
        {
          imageId: '2',
          imageName: 'monet04.jpg',
          tag: 'trees'
        },
        {
          imageId: '2',
          imageName: 'monet04.jpg',
          tag: 'monet'
        },
        {
          imageId: '3',
          imageName: '23.jpg',
          tag: 'snow'
        },
        {
          imageId: '3',
          imageName: '23.jpg',
          tag: 'trees'
        },
        {
          imageId: '3',
          imageName: '23.jpg',
          tag: 'nature'
        },
        {
          imageId: '4',
          imageName: 'ice_castle550.jpg',
          tag: 'snow'
        },
        {
          imageId: '4',
          imageName: 'ice_castle550.jpg',
          tag: 'castle'
        },
        {
          imageId: '4',
          imageName: 'ice_castle550.jpg',
          tag: 'nature'
        },
        {
          imageId: '5',
          imageName: 'monet04.jpg',
          tag: 'snow'
        },
        {
          imageId: '5',
          imageName: 'monet04.jpg',
          tag: 'trees'
        },
        {
          imageId: '5',
          imageName: 'monet04.jpg',
          tag: 'monet'
        }
    ];
    
    renderCards(imageData);
    renderTags(tags);
    
    // Put a modal listener on all the images.
    $('#main-cards').on('click', '.img-container', function() {
        $('#img-title').text($(this).data('name'));
        $('#img-description').text($(this).data('description'));
        $('#img-modal').attr("src", 'images/' + $(this).data('name'));
        
        $('#imgModal').modal('show');
    });
    
    // Toggle the filters form.
    $('#toggle-arrow').on('click', function() {
        if (!$(this).hasClass('up-arrow')) {
            $(this).attr('src', 'assets/up-arrow.png');
            $(this).addClass('up-arrow');
            
        } else  {
            $(this).attr('src', 'assets/down-arrow.png');
            $(this).removeClass('up-arrow')
        }
        
        $('#filters-fieldset').slideToggle(400);
    });
    
    // Watch the filter form button.
    $('#filter-form').submit(function(e) {
       e.preventDefault();
       
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

function renderTags(tags) {
    var html = '';
    
    for (var i = 0; i < tags.length; i++) {
        html += '<li>' +
                    '<input id="check' + i + '" type="checkbox" class="checkbox" value="first_checkbox">' +
                    '<label class="check-label" for="check' + i + '">' + tags[i] + '</label>' +
                '</li>';
    }
    
    $('#tag-list').empty().append(html);
}
