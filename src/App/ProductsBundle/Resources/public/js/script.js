(function(angular) {
    var app = angular.module('app', ['ui.bootstrap', 'angularFileUpload']);

    /*
     * Setting the of characters for AngularJs
     */
    app.config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
    });

    /*
     * Variables of objects for later recall
     */
    var editProduct,
        removeProduct,
        reviewProduct;

    /*
     * Number of products to be echoed on request
     */
    var offset = {
        offset : 5,
        setOffest : function(offset) {
            this.offset = offset;
        },
        getOffest : function() {
            return this.offset;
        }
    };

    var maxTitle       = 30,
        minTitle       = 3,
        maxDescription = 250,
        minDescription = 30;

    /*
     * Wrapper method for AngularJs
     */
    function el(selector) {
        return angular.element(document.querySelector(selector));
    }

    /*
     * Displays a pop-up window to manage products
     */
    app.controller('Product', function($scope, $modal, $http){

        /*
         *  AJAX receives data about the product
         */
        editProduct = $scope.editProduct = function(item, event) {
            var responsePromise = $http.get("/service/get_product/" + item);
            responsePromise.success(function(data, status, headers, config) {
                if (data.code === 'success') {
                    data.command = 'edit';
                    var modalInstance = $modal.open({
                        templateUrl: 'ProductModalContent.html',
                        controller: 'ProductEditModal',
                        size: 'lg',
                        resolve: {
                            items: function () {
                                return data;
                            }
                        }
                    });
                }
            });
            responsePromise.error(function(data, status, headers, config) {
                alert("AJAX failed!");
            });
        };

        /*
         * Displays a window of review product
         */
        reviewProduct = $scope.reviewProduct = function(item, event) {
            var responsePromise = $http.get("/service/get_product/" + item);
            responsePromise.success(function(data, status, headers, config) {
                if (data.code === 'success') {
                    var modalInstance = $modal.open({
                        templateUrl: 'ReviewProductModalContent.html',
                        controller: 'ReviewProductModalContent',
                        size: 'lg',
                        resolve: {
                            items: function () {
                                return data;
                            }
                        }
                    });
                }
            });
            responsePromise.error(function(data, status, headers, config) {
                alert("AJAX failed!");
            });
        };

        /*
         * Displays a window of removal product
         */
        removeProduct = $scope.removeConfirmProduct = function(item, event) {
            var modalInstance = $modal.open({
                templateUrl: 'MessageRemoveProductModalContent.html',
                controller:  'MessageRemoveProductModalContent',
                resolve: {
                    items: function () {
                        return { id :item };
                    }
                }
            });
        };

        /*
         * Displays a window creation of goods
         */
        $scope.createProduct = function(item, event) {
            var modalInstance = $modal.open({
                templateUrl: 'ProductModalContent.html',
                controller: 'ProductEditModal',
                size: 'lg',
                resolve: {
                    items: function () {
                        return { command : 'create'};
                    }
                }
            });
        };

        /*
         * Receives goods from database
         */
        $scope.getMoreProduct = function(item, event) {
            $http.get("/service/more_product/" + offset.getOffest())
                .success(function(data, status, headers, config) {
                    if (data.code === 'success') {
                        var template = '';
                        if (data.products.length < offset.getOffest()) {
                            $scope.moreElem = true;
                        }
                        for (product in data.products) {
                            addElements(data.products[product], 'append');
                        }
                    }
                })
                .error(function(data, status, headers, config) {
                    alert("AJAX failed!");
                });
        };
    });

    /*
     * Opening window delete confirmation photo
     */
    app.controller('Modal', function($scope, $modal){
        $scope.confirmRemoveImg = function(item, event) {
            var data = {
                id     : $scope.this.photo.id,
                photos : $scope.product.photos
            };

            var modalInstance = $modal.open({
                templateUrl: 'MessageRemovePhotoModalContent.html',
                controller:  'MessageRemovePhotoModalContent',
                resolve: {
                    items: function () {
                        return data;
                    }
                }
            });
        }
    });

    /*
     * Opens a window for review product and images
     */
    app.controller('ReviewProductModalContent', function ($scope, $modalInstance, items) {
        $scope.items = items;
        $scope.product = {};
        $scope.product.title = items.title;
        $scope.product.description = items.description;
        $scope.product.photos = items.photo;
        $scope.product.id = items.id;

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

    /*
     * Opens a window for editing product and loading images
     */
    app.controller('ProductEditModal', function ($scope, $modalInstance, items, $http, $modal, $compile) {
        $scope.items = items;
        $scope.product = {};
        $scope.product.title = items.title;
        $scope.product.description = items.description;
        $scope.product.photos = items.photo;
        $scope.product.id = items.id;
        $scope.save = function () {

            var formData = {
                product_id: $scope.product.id,
                title: el('#exampleInputTitle').val(),
                description: el('#exampleInputDescription').val()
            };

            var code = validate(formData);

            if (code !== '') {
                var modalInstance = $modal.open({
                    templateUrl: 'MessagePhotoModal.html',
                    controller: 'MessagePhotoModal'
                });
                modalInstance.code = code;
                return;
            }

            switch (items.command) {

                case 'edit':
                    $http.post('/service/update_product/', formData).
                        success(function (data, status, headers, config) {
                            var code;
                            if (data.code === 'success') {
                                code = 'update';
                                el('.tr-' + items.id + ' .sp-title').text(formData.title);
                            } else {
                                code = 'fail'
                            }
                            var modalInstance = $modal.open({
                                templateUrl: 'MessagePhotoModal.html',
                                controller: 'MessagePhotoModal'
                            });
                            modalInstance.code = code;
                        }).
                        error(function (data, status, headers, config) {
                            alert("AJAX failed!");
                        });
                    break;

                case 'create':
                    $http.post('/service/add_product/', formData).
                        success(function (data, status, headers, config) {
                            if (data.code === 'success') {
                                data.title          = formData.title;
                                data.photo[0].photo = data.photo;
                                addElements(data, 'prepend');
                                $modalInstance.dismiss('cancel');
                            }
                        })
                        .error(function (data, status, headers, config) {
                            alert("AJAX failed!");
                        });
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

    /*
     * AJAX request to remove photos
     */
    app.controller('MessageRemovePhotoModalContent', function ($scope, $modalInstance, items, $http) {
        $scope.removeImg = function () {
            $http.post('/service/remove_photo/', {photo_id : items.id}).
                success(function(data, status, headers, config) {
                    if (data.code === 'success') {
                        var index;
                        for (photo in items.photos) {
                            if (items.photos[photo].id == items.id) {
                                index = photo;
                            }
                        }
                        items.photos.splice(index, 1);
                        $modalInstance.close();
                    }
                }).
                error(function(data, status, headers, config) {
                    alert("AJAX failed!");
                });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

    /*
     * AJAX request to remove photos
     */
    app.controller('MessageRemoveProductModalContent', function ($scope, $modalInstance, items, $http) {
        $scope.removeProduct = function () {

            $http.post('/service/remove_product/', {product_id : items.id}).
                success(function(data, status, headers, config) {
                    if (data.code === 'success') {
                        el('.tr-' + items.id).remove();
                        $modalInstance.dismiss('cancel');
                    } else if (data.code === 'fail'){
                        $modal.open({
                            templateUrl: 'MessagePhotoModal.html',
                            controller:  'MessagePhotoModal'
                        });
                    }
                }).
                error(function(data, status, headers, config) {
                    alert("AJAX failed!");
                });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

    /*
     * AJAX downloading photo
     */
    app.controller('Uploader', ['$scope', 'FileUploader', '$modal', function($scope, FileUploader, $modal) {

        /*
         * AJAX sending options
         */
        var uploader = $scope.uploader = new FileUploader({
            url: '/service/add_photo/',
            method: 'POST',
            formData: {form : {product_id : $scope.product.id}}
        });

        /*
         * Performs checks the selected images (type and size)
         */
        uploader.filters.push({
            name: 'customFilter',
            fn: function(item, options) {
                var type      = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                var typeValid = ('|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1);
                var size      = item.size/1000000;

                return (typeValid == true && size < 1);
            }
        });

        /*
         * Displays information box in case of error when loading photo
         */
        uploader.onWhenAddingFileFailed = function(item, filter, options) {
            var type      = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            var typeValid = ('|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1);
            var size      = item.size/1000000;
            var code      = '';
            if (!typeValid) {
                code = 'type';
            } else if (size > 1) {
                code = 'size';
            }
            var modalInstance = $modal.open({
                templateUrl: 'MessagePhotoModal.html',
                controller:  'MessagePhotoModal'
            });
            modalInstance.code = code;
        };

        /*
         * In case of a successful download photos they are will be appended to the page
         */
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            if (response.code === 'success') {
                $scope.product.photos.push({id: response.id, photo: response.photo});
            } else if (response.code === 'fail') {
                if (response.error === 'size') {
                    var modalInstance = $modal.open({
                        templateUrl: 'MessagePhotoModal.html',
                        controller:  'MessagePhotoModal'
                    });
                    modalInstance.code = response.error ;
                }
            }
        };
    }]);

    /*
     * Displays information windows with a description of errors
     */
    app.controller('MessagePhotoModal', function ($scope, $modalInstance) {
        $scope.modal = {};
        switch ($modalInstance.code) {
            case 'type':
                $scope.modal.title   = 'Loading photo';
                $scope.modal.message = 'Incorrect file type (are permissible jpg/jpeg/png/gif/bmp)';
                $scope.modal.class   = 'bg-danger';
                break;
            case 'size':
                $scope.modal.title   = 'Loading photo';
                $scope.modal.message = 'The download file size is too great (1 MB)';
                $scope.modal.class   = 'bg-danger';
                break;
            case 'empty_title':
                $scope.modal.title   = 'Empty Title';
                $scope.modal.message = 'You must specify the title';
                $scope.modal.class   = 'bg-danger';
                break;
            case 'min_title':
                $scope.modal.title   = 'Length of a title';
                $scope.modal.message = 'The minimum length of a title (' + minTitle + ')';
                $scope.modal.class   = 'bg-danger';
                break;
            case 'max_title':
                $scope.modal.title   = 'Length of a title';
                $scope.modal.message = 'The maximum length of a title (' + maxTitle + ')';
                $scope.modal.class   = 'bg-danger';
                break;
            case 'empty_description':
                $scope.modal.title   = 'Empty Description';
                $scope.modal.message = 'You must specify the description';
                $scope.modal.class   = 'bg-danger';
                break;
            case 'min_description':
                $scope.modal.title   = 'Length of a description';
                $scope.modal.message = 'The minimum length of a description (' + minDescription + ')';
                $scope.modal.class   = 'bg-danger';
                break;
            case 'max_description':
                $scope.modal.title   = 'Length of a description';
                $scope.modal.message = 'The maximum length of a description (' + maxDescription + ')';
                $scope.modal.class   = 'bg-danger';
                break;
            case 'update':
                $scope.modal.title   = 'Update product';
                $scope.modal.message = 'This product successfully updated';
                $scope.modal.class   = 'bg-success';
                break;
            default :
                $scope.modal.title   = 'Unknown error';
                $scope.modal.message = 'An unknown error occurred, try again later';
                $scope.modal.class   = 'bg-danger';
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

    /*
     * Checking the of fields on emptiness and the number of symbols
     */
    function validate(formData) {
        var code = '';
        if (formData.title.trim() === '') {
            return code = 'empty_title';
        }
        if (formData.description.trim() === '') {
            return code = 'empty_description';
        }
        if (formData.title.trim().length < minTitle) {
            return code = 'min_title';
        }
        if (formData.description.trim().length < minDescription) {
            return code = 'min_description';
        }
        if (formData.title.trim().length > maxTitle) {
            return code = 'max_title';
        }
        if (formData.description.trim().length > maxDescription) {
            return code = 'max_description';
        }
        return code;
    }

    function addElements(data, typeInsert) {
        var photo = (data.photo[0] == undefined || data.photo[0].photo == undefined) ? 'nofoto.png' : data.photo[0].photo;
        var template = '<tr class="tr-' + data.product_id +' "><td class="photo">' +
            '<img src="upload/images/'+ photo +'" /></td><td class="td-title"><span class="sp-title">' + data.title + '</span></td>' +
            '<td class="control-elem">' +
            '<button type="button" class="btn btn-info btn-sm l-rewiew'+ data.product_id +'" ng-click="reviewProduct('+ data.product_id +', $event)">Review</button>' +
            '<button type="button" class="btn btn-primary btn-sm l-edit'+ data.product_id +'" ng-click="editProduct('+ data.product_id +', $event)">Edit</button>' +
            '<button type="button" class="btn btn-danger  btn-sm l-remove'+ data.product_id +'" ng-click="removeProduct(' + data.product_id + ', $event)">Remove</button>' +
            '</td></tr>';

        if(typeInsert === 'append') {
            el('.tb.body').append(template);
        } else {
            el('.tb.body').prepend(template);
        }

        el('.l-edit'+ data.product_id).on("click", function() {
            editProduct(data.product_id, {});
        });
        el('.l-remove'+ data.product_id).on("click", function() {
            removeProduct(data.product_id, {});
        });
        el('.l-rewiew'+ data.product_id).on("click", function() {
            reviewProduct(data.product_id, {});
        });
        offset.setOffest(offset.getOffest() + 1);
    }

})(window.angular);