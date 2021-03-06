jQuery(document).ready(function($) {


    $('[data-toggle="tooltip"]').tooltip();


    if ($('.asset-library-nav').find('#images-tab').hasClass('auto-opentab')) {
        /* when opened from space content edit page, allow single file uploads and show upload area */
        $('.upload-area').find('input[type="file"]').removeAttr('multiple');
        $('.upload-area').addClass('visible');
        $('.upload-area').show();

        $('.files .insert-link').show();
        $('#asset-details .insert-btn').show();

    } else {
        /* when opened from assets menu, set active class on images tab */
        $('.asset-library-nav').find('#images-tab').parent().addClass('active');
    }


    /* touch */
    var list_item_menu_click_handler = function() {
        $('.files .list-item').find('.menu').hide();
        $(this).find('.menu').show();
    };
    window.list_item_menu_click_handler = list_item_menu_click_handler;
    $('.files .list-item').click(window.list_item_menu_click_handler);


    /* mouse */
    var list_item_menu_hover_in_handler = function() {
        $(this).find('.menu').show();
    };
    var list_item_menu_hover_out_handler = function() {
        $(this).find('.menu').hide();
    };
    window.list_item_menu_hover_in_handler = list_item_menu_hover_in_handler;
    window.list_item_menu_hover_out_handler = list_item_menu_hover_out_handler;
    $('.files .list-item').hover(window.list_item_menu_hover_in_handler, window.list_item_menu_hover_out_handler);


    /* show image detail */
    var list_item_edit_click_handler = function(e) {
        e.preventDefault();
        var image_id = $(e.target).parent().parent().attr('data-image-id');

        $('#asset-details .modal-content').load(window.ideaspace_site_path + '/admin/assets/image/' + image_id + '/edit', function() {

            $('#asset-details').modal('show');

            $('#asset-details .save-btn').click(window.image_edit_save_btn_click_handler);
            $('#asset-details #caption').on('keydown', window.reset_save_btn_handler);
            $('#asset-details #description').on('keydown', window.reset_save_btn_handler);
            $('#asset-details .delete-link').click(window.image_edit_delete_btn_click_handler);

            if ($('.asset-library-nav').find('#images-tab').hasClass('auto-opentab')) {
                $('#asset-details .insert-btn').show();
            }
        });
    };
    window.list_item_edit_click_handler = list_item_edit_click_handler;
    $('.files .list-item .edit').click(window.list_item_edit_click_handler);


    /* keep possibility to scroll on asset library modal dialog after closing asset detail modal dialog; only when opened from space content edit page */
    $('#asset-details').on('hidden.bs.modal', function(e) {
        if ($('.asset-library-nav').find('#images-tab').hasClass('auto-opentab')) {
            $('body').addClass('modal-open');
        }
    });


    /* save caption and description */
    var image_edit_save_btn_click_handler = function(e) {

        var data = {};
        data.caption = $('#asset-details #caption').val();
        data.description = $('#asset-details #description').val();

        $.ajax({
            url: window.ideaspace_site_path + '/admin/assets/image/'+$(this).attr('data-image-id')+'/save',
            type: 'POST',
            data: data
        }).done(function(data) {
        
            if (data.status == 'success') {
                $('#asset-details .save-btn').html('<span class="glyphicon glyphicon-ok" aria-hidden="true" style="color:#449d44"></span> '+localization_strings['saved']);
            }

        }).fail(function() {
        }).always(function() {
        });
    };
    window.image_edit_save_btn_click_handler = image_edit_save_btn_click_handler;
    $('#asset-details .save-btn').click(window.image_edit_save_btn_click_handler);


    /* caption and description text areas */
    var reset_save_btn_handler = function(e) {
        $('#asset-details .save-btn').html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> '+localization_strings['save']);
    };
    window.reset_save_btn_handler = reset_save_btn_handler;
    $('#asset-details #caption').on('keydown', window.reset_save_btn_handler);
    $('#asset-details #description').on('keydown', window.reset_save_btn_handler);


    /* delete image */
    var image_edit_delete_btn_click_handler = function(e) {

        $.ajax({
            url: window.ideaspace_site_path + '/admin/assets/image/'+$(this).attr('data-image-id')+'/delete',
            type: 'POST',
            data: {}
        }).done(function(data) {

            if (data.status == 'success') {
                $('.files .list .list-item .wrapper[data-image-id=\''+data.image_id+'\']').parent().remove();
                var counter = $('.files').attr('data-file-counter');
                if (counter > 0) {
                    counter--;
                }
                $('.files').attr('data-file-counter', counter);
            }

        }).fail(function() {
        }).always(function() {
        });
    };
    window.image_edit_delete_btn_click_handler = image_edit_delete_btn_click_handler;
    $('#asset-details .delete-link').click(window.image_edit_delete_btn_click_handler);


    var localization_strings = {};
    $.ajax({
        url: window.ideaspace_site_path + '/admin/assets/images/get-localization-strings',
        cache: true,
        success: function(return_data) {
            localization_strings = return_data; 
        }
    });


    $('.upload').dmUploader({
        url: window.ideaspace_site_path + '/admin/assets/images/add',
        dataType: 'json',
        allowedTypes: 'image/*',
        maxFileSize: $('#max_filesize_bytes').val(),
        extraData: {},
        extFilter: 'jpg;jpeg;png;gif',
        onInit: function() {
            $('.upload').click(function(e) {
                if (e.currentTarget === this && e.target.nodeName !== 'INPUT') {
                    $(this).find('input[type=file]').click();
                }
            });
        },
        onBeforeUpload: function(id) {
        },
        onNewFile: function(id, file) {

            var template = 
            '<li class="list-item">' +
                '<div id="file-' + id + '" class="wrapper">' +
                    '<div class="progress progress-striped active" style="margin-top:80px">' +
                        '<div class="progress-bar" role="progressbar" style="width:0%">' +
                            '<span class="sr-only">0%</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</li>';

            var i = $('#image-files').attr('file-counter');
            if (!i) {
                $('files').empty();
                i = 0;
            }
            i++;

            $('.files').attr('file-counter', i);
            $('.files ul').prepend(template);
        },
        onComplete: function() {
        },
        onUploadProgress: function(id, percent) {
            percent = percent + '%';
            $('#file-' + id).find('div.progress-bar').width(percent);
            $('#file-' + id).find('span.sr-only').html(percent);
        },
        onUploadSuccess: function(id, data){

            if (data.status == 'success') {

                $('#file-' + id).html('<div><img class="edit img-thumbnail img-responsive" src="' + data.uri + '"></div>'); 
                $('#file-' + id).attr('data-image-id', data.image_id);
                $('#file-' + id).append('<div class="menu" style="text-align:center;margin-top:5px;display:none">' +
                    '<a href="#" class="view-in-vr">'+localization_strings['view_in_vr']+'</a> | ' + 
                    '<a href="#" class="edit">'+localization_strings['edit']+'</a> ' +
                    '<span class="insert-link" style="display:none">| <a href="#" class="insert">'+localization_strings['insert']+'</a></span></div>');

                $('.files .list-item').click(window.list_item_menu_handler);
                $('.files .list-item').hover(window.list_item_menu_hover_in_handler, window.list_item_menu_hover_out_handler);
                $('.files .list-item .edit').click(window.list_item_edit_click_handler);

                /* show insert link when opened from space edit content page */
                if ($('.asset-library-nav').find('#images-tab').hasClass('auto-opentab')) {
                    $('.files .insert-link').show();
                    $('#asset-details .insert-btn').show();
                } 

          } else if (data.status == 'error') {

              var i = $('.files').attr('data-file-counter');
              $('#file-' + i).html(data.message).addClass('file-upload-error');
          }
        },
        onUploadError: function(id, message) {
            var i = $('.files').attr('data-file-counter');
            $('#file-' + i).html(message).addClass('file-upload-error');
        },
        onFileTypeError: function(file) {
            $('#images').prepend('<div id="file-error" class="alert alert-danger" role="alert">\'' + file.name + '\' ' + localization_strings['file_type_error'] + '</div>');
            $("#file-error").fadeTo(7000, 500).slideUp(500, function() { $("#file-type-error").remove(); });
        },
        onFileSizeError: function(file) {
            $('#images').prepend('<div id="file-error" class="alert alert-danger" role="alert">\'' + file.name + '\' ' + localization_strings['file_size_error'] + '</div>');
            $("#file-error").fadeTo(7000, 500).slideUp(500, function() { $("#file-type-error").remove(); });
        },
        onFileExtError: function(file) {
            $('#images').prepend('<div id="file-error" class="alert alert-danger" role="alert">\'' + file.name + '\' ' + localization_strings['file_ext_error'] + '</div>');
            $("#file-error").fadeTo(7000, 500).slideUp(500, function() { $("#file-type-error").remove(); });
        },
        onFallbackMode: function(message) {
        }
      });

});

