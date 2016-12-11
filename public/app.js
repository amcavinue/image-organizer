var imageData, tags, imageTagAssociative;

// Disable dropzone auto discover in order to set custom element later on.
Dropzone.autoDiscover = false;

function getAllData() {
    var imageDataPromise = new Promise(function(resolve, reject) {
        $.ajax({
            method: 'GET',
            url: '/images',
            dataType: 'json'
        }).done(function(data) {
            imageData = data;
            resolve();
        }).fail(function (jqXHR, error, errorThrown) {
            /*console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);*/
            reject(error);
        });
    });
    
    var tagsPromise = new Promise(function(resolve, reject) {
        $.ajax({
            method: 'GET',
            url: '/tags',
            dataType: 'json'
        }).done(function(data) {
            tags = data;
            resolve();
        }).fail(function (jqXHR, error, errorThrown) {
            /*console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);*/
            reject(error);
        });
    });
    
    var imageTagAssociativePromise = new Promise(function(resolve, reject) {
        $.ajax({
            method: 'GET',
            url: '/images-tags',
            dataType: 'json'
        }).done(function(data) {
            imageTagAssociative = data;
            resolve();
        }).fail(function (jqXHR, error, errorThrown) {
            /*console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);*/
            reject(error);
        });
    });
    
    return Promise.all([imageDataPromise, tagsPromise, imageTagAssociativePromise]);
}

function renderCards(imageData) {
    var html = '<div class="row">';
    
    for (var i = 0; i < imageData.length; i++) {
        html += renderCard(imageData[i]);
    }
    
    html += '</div>';
    $('#main-cards').empty().append(html);
}

function renderSelectCards(selectImageData) {
    var html = '<div class="row">';
    
    // indices[i] is an _id
    // need to get the object from this id and then pass that.
    
    for (var i = 0; i < selectImageData.length; i++) {
        html += renderCard(selectImageData[i]);
    }
    
    html += '</div>';
    $('#main-cards').empty().append(html);
}

function renderCard(imgData) {
    return '<div class="col-xs-12 col-md-6 col-lg-4 image-card">' + 
                '<div class="card-container" data-id="' + imgData._id + '">' +
                    '<div class="img-container" data-filename="' + imgData.filename + '" data-name="' + imgData.name + '" data-description="' + imgData.description + '">' +
                        '<span class="img-helper"></span>' +
                        '<img src="images/' + imgData.filename + '"></img>' +
                    '</div>' +
                    '<br />' +
                    '<span>' + imgData.description + '</span>' +
                    '<br />' +
                    '<a href="" class="edit-card" data-id="' + imgData._id + '"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> Edit</a>' +
                    '<a href="" class="delete-card" data-id="' + imgData._id + '"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> Delete</a>' +
                '</div>' +
            '</div>';
}

function updateCard(imgData) {
    return '<div class="img-container" data-filename="' + imgData.filename + '" data-name="' + imgData.name + '" data-description="' + imgData.description + '">' +
                    '<span class="img-helper"></span>' +
                    '<img src="images/' + imgData.filename + '"></img>' +
                '</div>' +
                '<br />' +
                '<span>' + imgData.description + '</span>' +
                '<br />' +
                '<a href="" class="edit-card" data-id="' + imgData._id + '"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> Edit</a>' +
                '<a href="" class="delete-card" data-id="' + imgData._id + '"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span> Delete</a>' +
            '</div>';
}

function renderTags(tags) {
    var listIndex = 0;
    
    $('.tag-list').empty().each(function() {
        $(this).append(createTagHtml(tags, listIndex));
        listIndex++;
    });
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
                    results.push(imageData[i]._id);
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

$(function() {
    getAllData().then(function() {
        // State variables.
        var isEditCard = false;
        var prevFilename;
        var prevName;
        var prevFile = false;
        var newImage = false;
        var isUploaded = false;
        
        renderCards(imageData);
        renderTags(tags);
        
        // Instantiate the dropzone.
        var newImageUploader = new Dropzone("#new-image-uploader", { 
            url: "/images", 
            acceptedFiles: 'image/*',
            uploadMultiple: false,
            dictDefaultMessage: 'Drop images here or click to upload.',
            init: function() {
                this.on('sending', function(file, xhr, formData) {
                    $.LoadingOverlay('show');
                }).on("success", function(file, response) {
                    isUploaded = true;
                    $('#uploaded-image-name').text(response.name);
                    $('#uploaded-image').attr("src", 'images/' + response.filename);
                    $('#image-description').data('id', response._id);
                    $.LoadingOverlay('hide');
                }).on("error", function(file, errorMessage) {
                    $.LoadingOverlay('hide');
                    // console.log('There was an upload error');
                });
            }
        });
        
        // Put a modal listener on all the images.
        $('#main-cards').on('click', '.img-container', function() {
            $('#img-title').text($(this).data('name'));
            $('#img-description').text($(this).data('description'));
            $('#img-modal').attr("src", 'images/' + $(this).data('filename'));
            $('#modal-image').modal('show');
        });
        
        // Put listener on the new image button.
        $('#new-image').click(function(e) {
            e.preventDefault();
            isEditCard = false;
            var cardId = imageData.length; 
            newImage = true;
            
            $('#modal-edit-name').text('New Image');
            $('#uploaded-image-name').text('');
            $('#uploaded-image').attr("src", '');
            $('#image-description').val('');
            
            // Clear the dropzone and change the upload destination.
            newImageUploader.removeAllFiles();
            newImageUploader.options.method = 'POST';
            newImageUploader.options.url = '/images';
            
            // Uncheck all the checkboxes.
            $('#tag-list-edit input:checkbox').prop('checked', false);
            
            $('#modal-edit').modal({backdrop: 'static', keyboard: false, show: true});
        });
        
        // Put listeners on all the edit buttons.
        $('#main-cards').on('click', '.edit-card', function(e) {
            e.preventDefault();
            var cardId = $(this).data('id');
            var currImage = imageData.find(function(image) {
                return image._id === cardId;
            });
            isEditCard = true;
            prevFilename = currImage.filename;
            prevName = currImage.name;
            prevFile = true;
            newImage = false;
            
            $('#modal-edit-name').text('Edit ' + currImage.name);
            $('#uploaded-image-name').text(currImage.name);
            $('#uploaded-image').attr("src", 'images/' + currImage.filename);
            $('#image-description').val(currImage.description);
            $('#image-description').data('id', currImage._id);
            
            // Clear the dropzone and change the upload destination.
            newImageUploader.removeAllFiles();
            newImageUploader.options.method = 'PUT';
            newImageUploader.options.url = '/images/existing/' + cardId;
            
            // Uncheck all the checkboxes.
            $('#tag-list-edit input:checkbox').prop('checked', false);
            
            for (var i = 0; i < currImage.tags.length; i++) {
                // Check the tags it already has.
                $('#' + currImage.tags[i].name + '-1').prop('checked', 'checked');
            }
            
            $('#modal-edit').modal({backdrop: 'static', keyboard: false, show: true});
        });
        
        // Watch the add new tags field.
        $('#tag-list-new').keypress(function(e) {
            if (e.which === 13) {
                e.preventDefault();
                var tagName = $(this).val();
                
                if ( tagName !== '') {
                    var tagHtml = '<li>' +
                                '<input id="' + tagName + '-1" type="checkbox" class="checkbox" name="' + tagName + '" checked="checked">' +
                                '<label class="check-label" for="' + tagName + '-1">' + tagName + '</label>' +
                            '</li>';
                
                    $('#tag-list-edit').append(tagHtml);
                    $(this).val('');
                }
            }
        });
        
        // Watch the edit form button.
        $('#edit-form').submit(function(e) {
            debugger;
            e.preventDefault();
            var editTags = [];

            $('#tag-list-edit input:checkbox').each(function() {
                if ($(this).prop('checked')) {
                    editTags.push($(this).attr('name'));
                }
            });
            
            $.LoadingOverlay('show');
            
            if(isEditCard) {
                debugger;
                // If it's editing an existing card.
                $.ajax({
                    method: 'PUT',
                    url: '/images/' + $('#image-description').data('id'),
                    contentType: 'application/json',
                    data: JSON.stringify({
                        description: $('#image-description').val(),
                        tags: editTags,
                        deletePrev: prevFile && isUploaded,
                        prevFilename: prevFilename
                    })
                }).done(function(data) {
                    // Update the existing card.
                    var $card = $('.card-container[data-id="' + data._id + '"]').empty().html(updateCard(data));
                    prevFilename = null;
                    prevName = null;
                    prevFile = false;
                    newImage = false;
                    isUploaded = false;
                    getAllData().then(function() {
                        renderTags(tags);
                        $('#modal-edit').modal('hide');
                        $.LoadingOverlay('hide');
                    });
                }).fail(function (jqXHR, error, errorThrown) {
                    prevFilename = null;
                    prevName = null;
                    prevFile = false;
                    newImage = false;
                    isUploaded = false;
                    $.LoadingOverlay('hide');
                    bootbox.alert('There was an error saving your data. Please try again later.');
                    /*console.log(jqXHR);
                    console.log(error);
                    console.log(errorThrown);*/
                });
            } else {
                // If it's adding a new card.
                if (isUploaded) {
                    debugger;
                    $.ajax({
                        method: 'PUT',
                        url: '/images/' + $('#image-description').data('id'),
                        contentType: 'application/json',
                        data: JSON.stringify({
                            description: $('#image-description').val(),
                            tags: editTags,
                            deletePrev: false
                        })
                    }).done(function(data) {
                        prevFilename = null;
                        prevName = null;
                        prevFile = false;
                        newImage = false;
                        isUploaded = false;
                        
                        // Add a new card.
                        var html = renderCard(data);
                        $('#main-cards .row').append(html);
                        
                        getAllData().then(function() {
                            renderTags(tags);
                            $('#modal-edit').modal('hide');
                            $.LoadingOverlay('hide');
                        });
                    }).fail(function (jqXHR, error, errorThrown) {
                        prevFilename = null;
                        prevName = null;
                        prevFile = false;
                        newImage = false;
                        isUploaded = false;
                        $.LoadingOverlay('hide');
                        bootbox.alert('There was an error saving your data. Please try again later.');
                        /*console.log(jqXHR);
                        console.log(error);
                        console.log(errorThrown);*/
                    });
                } else {
                    debugger;
                    $.LoadingOverlay('hide');
                    bootbox.alert('You must upload an image.');
                }
            }
        });
        
        // Put listener on edit/new image cancel button.
        $('#edit-form-cancel').click(function(e) {
            debugger;
            if (newImage || (prevFile && isUploaded)) {
                debugger;
                $.LoadingOverlay('show');
                
                $.ajax({
                    method: 'DELETE',
                    url: '/images/' + $('#image-description').data('id'),
                    contentType: 'application/json',
                    data: JSON.stringify({
                        rollback: isUploaded,
                        prevName: prevName,
                        prevFilename: prevFilename,
                        newImage: newImage
                    })
                }).done(function(data) {
                    prevFilename = null;
                    prevFile = false;
                    newImage = false;
                    isUploaded = false;
                    $.LoadingOverlay('hide');
                    $('#modal-edit').modal('hide');
                }).fail(function (jqXHR, error, errorThrown) {
                    $.LoadingOverlay('hide');
                    /*console.log(jqXHR);
                    console.log(error);
                    console.log(errorThrown);*/
                });
            } else {
                debugger;
                $('#modal-edit').modal('hide');
            }
        });
        
        // Put listeners on all delete buttons.
        $('#main-cards').on('click', '.delete-card', function(e) {
            e.preventDefault();
            var cardId = $(this).data('id');
            var context = this;
            bootbox.confirm({ 
                size: "small",
                message: "Are you sure you want to delete this image?", 
                onEscape: false,
                buttons: {
                    confirm: {
                        label: 'Yes',
                        className: 'btn-danger'
                    }
                },
                callback: function(result){ 
                    $.LoadingOverlay('show');
                    
                    if (result) {
                        $.ajax({
                            method: 'DELETE',
                            url: '/images/' + cardId,
                            dataType: 'json',
                            data: {
                                rollback: false
                            }
                        }).done(function(data) {
                            getAllData().then(function() {
                                renderTags(tags);
                                $(context).closest('.image-card').remove();
                                $.LoadingOverlay('hide');
                            });
                        }).fail(function (jqXHR, error, errorThrown) {
                            $.LoadingOverlay('hide');
                            /*console.log(jqXHR);
                            console.log(error);
                            console.log(errorThrown);*/
                        });
                    } else {
                        $.LoadingOverlay('hide');
                    }
                }
            });
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
           
           // Extract just the tag names from the form inputs.
           for (var i = 0; i < inputs.length; i++) {
               formTags[i] = inputs[i]['name'];
           }
           
           var results = [];
           results = results.concat(findKeywords(contains, formTags, imageData));
           results = results.concat(findTags(formTags, imageTagAssociative));
           
           // Remove duplicates from the results.
           results = results.filter(function(elem, index, self) {
               return index == self.indexOf(elem);
           });
           
           // Replace image _ids with image objects.
           var resultImages = [];
           results.forEach(function(item, index) {
                var image = imageData.find(function(image) {
                    return image._id === item;
                });
                
                if (image) {
                    resultImages.push(image);
                }
           });
           
           if (results.length !== 0) {
               renderSelectCards(resultImages);
           } else {
               renderCards(imageData);
           }
        });
    });
});
