angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})
.controller('SearchCtrl', function($scope, $stateParams, $timeout, $ionicPlatform, $cordovaFile, $cordovaFileTransfer, $cordovaCamera, $fileFactory) {

  var fs = new $fileFactory();
  var server = 'http://192.168.1.52/ionic_upload/'; // server upload adress
  var phonePath = 'file:///storage/emulated/0/';
  var snapscanPath = phonePath+'ScanSnap/';
  var filename = '';
  var is_scan_connected = false;

  var success = function(message){
    console.log('sucess');
    console.log(message);
    alert(message);
  }
  var failure = function(error) {
    console.log("Error failure scan function : " + error);
    alert("Error failure scan function : " + error);
  }
  var successScanConnect = function(message){
    console.log('sucess');
    console.log(message);
    alert(message);
    is_scan_connected = true;
  }
  var sendToServer = function (pathFile, callbackSuccess, callbackError, callbackOnProgress){
    var filename = pathFile.substr(pathFile.lastIndexOf('/') + 1);
    console.log('filename');
    console.log(filename);
    //var folderPath = '/mnt/sdcard/ScanSnap/';  // file is placed here
    //var sdCardPath = '/storage/emulated/0/ScanSnap/';
    function onSuccess(fileSystem) {
        console.log(fileSystem.name);
    }
    function onError() {
        console.log('ERROR');
    }
    function onProgress(){
      console.log('onProgress');
    }
    var options = {};
    options.fileKey = "userfile";
    options.fileName = filename; //'ionicupload.jpg';//fileURL.substr(fileURL.lastIndexOf('/') + 1);
    options.mimeType = "text/plain";

    // transfert to server
    $cordovaFileTransfer.upload(server, pathFile, options)
      .then(function(result) {
        // Success!
        console.log ('transfer sucess');
        console.log (result);
        alert (result.response);
        callbackSuccess();
      }, function(err) {
        // Error
        console.log ('transfer errors');
        console.log (err);
        callbackError();
      }, function (progress) {
        // constant progress updates
        console.log ('transfer progreesss');
        callbackOnProgress();
    });


    //$scope.listFilesFolderAndSendToserver();
  }
  var listFilesFolderAndSend = function(){

    fs.getEntries(snapscanPath).then(function(result) {
        console.log (result);
        $scope.files = result;
        $scope.files.unshift({name: "[parent]"});
        $scope.last_file = '';
        var last_date = null;
        //var fileTosend;
        //serach the last file created
        angular.forEach(result, function(file) {
          // search only files
          if (file.isFile == true){
            file.file(function(sucessFile){ // instance the file
              if (last_date == null || last_date > sucessFile.lastModified && sucessFile.name != 'log.txt'){
                last_date = sucessFile.lastModified;
                //fileTosend = sucessFile;
                filename = sucessFile.name;
              }
            });
            //console.log ('file.nativeURL');
            //console.log (file.nativeURL);
          }
        });
        // here send the final file to server
        $scope.uploadfile();
    });
  }
  var mySearchScanner = function(callbackSuccess, callbackError){
    hello.search("search", callbackSuccess, callbackError);
  }
  var myScanScanner = function(param, callbackSuccess, callbackError){
    hello.scan(param, callbackSuccess, callbackError);
  }
  var launchScanProcess = function(){
    mySearchScanner(function(scannerFiles){
      console.log ('sucess searchscan');
      console.log (scannerFiles);
      // scan the page and get the file name
      /*myScanScanner('single', function(sucess){
        console.log ('sucess myScanScanner');
        console.log (sucess);*/
                    var pathFileToUpload = scannerFiles.frontPage;
                    //send to the server the document
                    sendToServer(pathFileToUpload, function(sucess){
                      console.log ('sucess send to server');
                      console.log (sucess);
                    }, function(error){
                      console.log ('ERROR send to server');
                      console.log (error);
                      alert ('Process error : '+error);
                    },function(progress){
                      console.log ('PROGRESS');
                    });

      /*}, function(error){
        console.log ('ERROR myScanScanner');
        console.log (error);
      });*/


    }, function(error){
      console.log ('ERROR searchscan');
      console.log (error);
      alert ('Process error : '+error);

    });
  }
  $scope.searchscansend = function(){
    launchScanProcess();
  }
  $scope.listFilesFolderAndSendToserver = function(){
    listFilesFolderAndSend();
  }

  $scope.sayhello = function() {
    var text = $scope.myText;
    console.log (text);

    hello.greet('greet', success, failure);
  }


  /* advanced functions */

  $scope.search = function() {
    //console.log ('function search');
    //hello.search("search", success, failure);
    mySearchScanner(successScanConnect, failure);
  }
  $scope.scanSinglePageFront = function() {
    if (!is_scan_connected){
      alert('Vous devez rechercher le scan avant...');
      return false;
    }
    //hello.scan("scan", success, failure);
    //hello.scan("scan", callbackSuccess, failure);
    myScanScanner('single',success, failure);
  }
  $scope.scanDoublePageFrontAndBack = function() {
    if (!is_scan_connected){
      alert('Vous devez rechercher le scan avant...');
      return false;
    }
    //hello.scan("scan", success, failure);
    //hello.scan("scan", callbackSuccess, failure);
    myScanScanner('double',success, failure);
  }


  $scope.takePicture = function(){
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 100,
      targetHeight: 100,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };

    $cordovaCamera.getPicture(options).then(function(imageData) {
      var image = document.getElementById('myImage');
      image.src = "data:image/jpeg;base64," + imageData;
      console.log (image.src);
    }, function(err) {
      // error
    });
  }
  $scope.uploadfile = function() {
    console.log (snapscanPath+'/'+'2015_06_01_13_06_23.pdf');
    var preparedpath = snapscanPath+'/'+'2015_06_01_13_06_23.pdf';
    sendToServer(preparedpath);

  } // end scope function


})

;
