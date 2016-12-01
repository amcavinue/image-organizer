// Disable dropzone auto discover in order to set custom element later on.
Dropzone.autoDiscover = false;

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
          imageId: 0,
          imageName: '23.jpg',
          tag: 'snow'
        },
        {
          imageId: 0,
          imageName: '23.jpg',
          tag: 'trees'
        },
        {
          imageId: 0,
          imageName: '23.jpg',
          tag: 'nature'
        },
        {
          imageId: 1,
          imageName: 'ice_castle550.jpg',
          tag: 'snow'
        },
        {
          imageId: 1,
          imageName: 'ice_castle550.jpg',
          tag: 'castle'
        },
        {
          imageId: 1,
          imageName: 'ice_castle550.jpg',
          tag: 'nature'
        },
        {
          imageId: 2,
          imageName: 'monet04.jpg',
          tag: 'snow'
        },
        {
          imageId: 2,
          imageName: 'monet04.jpg',
          tag: 'trees'
        },
        {
          imageId: 2,
          imageName: 'monet04.jpg',
          tag: 'monet'
        },
        {
          imageId: 3,
          imageName: '23.jpg',
          tag: 'snow'
        },
        {
          imageId: 3,
          imageName: '23.jpg',
          tag: 'trees'
        },
        {
          imageId: 3,
          imageName: '23.jpg',
          tag: 'nature'
        },
        {
          imageId: 4,
          imageName: 'ice_castle550.jpg',
          tag: 'snow'
        },
        {
          imageId: 4,
          imageName: 'ice_castle550.jpg',
          tag: 'castle'
        },
        {
          imageId: 4,
          imageName: 'ice_castle550.jpg',
          tag: 'nature'
        },
        {
          imageId: 5,
          imageName: 'monet04.jpg',
          tag: 'snow'
        },
        {
          imageId: 5,
          imageName: 'monet04.jpg',
          tag: 'trees'
        },
        {
          imageId: 5,
          imageName: 'monet04.jpg',
          tag: 'monet'
        }
    ];
    
    renderCards(imageData);
    renderTags(tags);
    
    // Instantiate the dropzone.
    var newImageUploader = new Dropzone("#new-image-uploader", { 
        url: "/", 
        acceptedFiles: 'image/*',
        uploadMultiple: false,
        dictDefaultMessage: 'Drop images here or click to upload.',
        init: function() {
            this.on("success", function(file, response) {
                // TODO: Test/handle response, and place image in here.
                /*$('#img-description').text();
                $('#img-modal').attr("src", 'images/' + );*/
                // console.log(response);
            }).on("error", function(file, errorMessage) {
                // console.log('There was an upload error');
            });
        }
    });
    
    // Put a modal listener on all the images.
    $('#main-cards').on('click', '.img-container', function() {
        $('#img-title').text($(this).data('name'));
        $('#img-description').text($(this).data('description'));
        $('#img-modal').attr("src", 'images/' + $(this).data('name'));
        $('#modal-image').modal('show');
    });
    
    // Put listener on the new image button.
    $('#new-image').click(function(e) {
        e.preventDefault();
        var cardId = imageData.length; 
        $('#modal-edit-name').text('New Image');
        $('#uploaded-image-name').text('');
        $('#uploaded-image').attr("src", '');
        $('#image-description').val('');
        
        // Clear the dropzone and change the upload destination.
        newImageUploader.removeAllFiles();
        newImageUploader.options.url = '/' + cardId + '/image';
        
        // Uncheck all the checkboxes.
        $('#tag-list-edit input:checkbox').prop('checked', false);
        
        $('#modal-edit').modal('show');
    });
    
    // Put listeners on all the edit buttons.
    $('#main-cards').on('click', '.edit-card', function(e) {
        e.preventDefault();
        var cardId = $(this).data('id');
        $('#modal-edit-name').text('Edit ' + imageData[cardId].name);
        $('#uploaded-image-name').text(imageData[cardId].name);
        $('#uploaded-image').attr("src", 'images/' + imageData[cardId].name);
        $('#image-description').val(imageData[cardId].description);
        
        // Clear the dropzone and change the upload destination.
        newImageUploader.removeAllFiles();
        newImageUploader.options.url = '/' + cardId + '/image';
        
        // Uncheck all the checkboxes.
        $('#tag-list-edit input:checkbox').prop('checked', false);
        
        for (var i = 0; i < imageData[cardId].tags.length; i++) {
            // Check the tags it already has.
            $('#' + imageData[cardId].tags[i] + '-1').prop('checked', 'checked');
        }
        
        $('#modal-edit').modal('show');
    });
    
    // Watch the edit form button.
    $('#edit-form').submit(function(e) {
        e.preventDefault(); 
        $('#modal-edit').modal('hide');
    });
    
    // Put listeners on all delete buttons.
    $('#main-cards').on('click', '.delete-card', function(e) {
        e.preventDefault();
        // TODO: This.
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
       
       var inputs = $( this ).serializeArray(); 
       var contains = (inputs[0]['name'] === 'contains') ? inputs[0]['value'] : null;  // If the first object is the 'contains' input (it should be), return the value of the input.
       inputs.splice(0, 1);
       
       var formTags = [];
       
       // Extract just the tag names from the inputs.
       for (var i = 0; i < inputs.length; i++) {
           formTags[i] = inputs[i]['name'];
       }
       
       var results = [];
       results = results.concat(findKeywords(contains, formTags, imageData));
       results = results.concat(findTags(formTags, imageTagAssociative));
       
       // Remove duplicates from the results.
       var results = results.filter(function(elem, index, self) {
           return index == self.indexOf(elem);
       });

       if (results.length !== 0) {
           renderSelectCards(results, imageData);
       } else {
           renderCards(imageData);
       }
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

function renderSelectCards(indices, imageData) {
    var html = '<div class="row">';
    
    for (var i = 0; i < indices.length; i++) {
        html += renderCard(imageData[indices[i]]);
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
                    '<a href="" class="edit-card" data-id="' + imgData.id + '"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> Edit</a>' +
                    '<a href="" class="delete-card"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> Delete</a>' +
                '</div>' +
            '</div>';
}

function renderTags(tags) {
    var listIndex = 0;
    
    $('.tag-list').empty().each(function() {
        $(this).append(createTagHtml(tags, listIndex));
        listIndex++;
    })
}

function createTagHtml(tags, index) {
    var html = '';
    
    for (var i = 0; i < tags.length; i++) {
        html += '<li>' +
                    '<input id="' + tags[i] + '-' + index + '" type="checkbox" class="checkbox" name="' + tags[i] + '">' +
                    '<label class="check-label" for="' + tags[i] + '-' + index + '">' + tags[i] + '</label>' +
                '</li>';
    }
    
    return html;
}

function findKeywords(contains, tags, imageData) {
    // Sanitize the input.
    contains = contains.trim().toLowerCase().split(/[^a-zA-Z0-9']+/ig).filter(function(el, i, self) { return (el.length !== 0) && (i === self.indexOf(el)); });
    
    // Remove any duplicate tags from contains.
    contains = contains.filter(function(val) {
        return tags.indexOf(val) == -1;
    });
    
    // Return any images that match any of the keywords in any of their properties.
    // http://stackoverflow.com/questions/8517089/js-search-in-object-values
    var results = [];
    
    // Look in each image object.
    for(var i = 0; i < imageData.length; i++) {
        
        // Look in every property of that image.
        imageLoop:
        for(var key in imageData[i]) {
            
            // For each property, look for all the keywords.
            for (var j = 0; j < contains.length; j++) {
                
                // If the keyword is in the property add the index to the results
                // and go to the next image.
                if(String(imageData[i][key]).toLowerCase().indexOf(contains[j]) !== -1) {
                    results.push(imageData[i].id);
                    break imageLoop;
                }
            }
        }
    }
    
    return results;
}

function findTags(tags, imageTagAssociative) {
    var results = [];
    
    for (var i = 0; i < imageTagAssociative.length; i++) {
        for (var j = 0; j < tags.length; j++) {
            if (imageTagAssociative[i].tag === tags[j]) {
                results.push(imageTagAssociative[i].imageId);
            }
        }
    }
    
    return results;
}
