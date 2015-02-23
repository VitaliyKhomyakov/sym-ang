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
        removeProduct;

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

            switch (items.command) {

                case 'edit':
                    $http.post('/service/update_product/', formData).
                    success(function (data, status, headers, config) {
                        var code;
                        if (data.code === 'success') {
                            code = 'update';
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
                            var template = '<tr class="tr-' + data.product_id +' "><td class="photo">' +
                                '<img src="upload/images/'+ data.photo +'" /></td><td>' + formData.title + '</td><td> ' + formData.description + ' </td>' +
                                '<td class="control-elem">' +
                                '<button type="button" class="btn btn-primary btn-sm l-edit" ng-click="editProduct('+ data.product_id +', $event)">Edit</button>' +
                                '<button type="button" class="btn btn-danger  btn-sm l-remove" ng-click="removeProduct(' + data.product_id + ', $event)">Remove</button>' +
                                '</td></tr>';

                            el('.tb.body').prepend(template);
                            el('.l-edit').off('click').on("click", function() {
                                editProduct(data.product_id, {});
                            });
                            el('.l-remove').off('click').on("click", function() {
                                editProduct(data.product_id, {});
                            });
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

})(window.angular);