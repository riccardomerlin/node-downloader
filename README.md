NodeJs Downloader 
=================
Parallel file downloader console application developed using NodeJs.
There is a built-in Api file source for OneDrive, but any provided source
that implements the required interface can be plugged in
(see [Create a new API provider](#create-a-new-api-provider) for further
details).

How it works
------------
The main process populate a queue with the files to download.
At the same time it dequeues those files (one at the time) and spawns a
new process for each one of them, creating a pool of *n* indipendent child
processes.

Each child process is responsible to download one file: if the download
fails the file is put back in the queue to be reprocessed, otherwise the
process is terminated.

The general idea is split the work-load between multiple processes and
make use of asyncronous programming to keeps long tasks off the event loop,
so that the program can take in other files to download to optimize the
download speed.

Getting Started
---------------
```
$ git clone https://github.com/riccardomerlin/node-downloader.git

$ cd node-downloader

$ npm install 
```
or
```
$ yarn install
```
### OneDrive provider configuration
This project provides a built-in Api provider towards OneDrive services.
Configure OneDrive provider by adding the following enviroment
variables to your system:
```
$ export ONEDRIVE_CLIENTID=<provided_client_id>
$ export ONEDRIVE_CLIENT_SECRET=<provided_client_secret>
```
To get ClientID and ClientSecret you need to
[Register your app with Microsoft](https://docs.microsoft.com/en-us/onedrive/developer/rest-api/getting-started/app-registration).

1. Once you are in the "My Applications" page click "Add an app".
2. Give a name to the app and click "Create".
3. Click now on "Generate New Password" to add a new *Application Secret*.
4. Copy and save both *Application Id* and *Application Secret*.
5. In the Platform section click "Add platform" and select *Web*.
6. Fill in the *Redirect Url* with the url `http://localhost:<port_number>/token`.
The default port number is `8086`, you can change it in [config.js](./src/ApiProviders/OneDrive/config.js).
7. Add *Application Id* and *Application Secret* to your environment variables
as described above.

### Run
To run the application execute
```
$ npm start
```
or
```
yarn start
```

You can also install the command globally
```
$ npm install -g
```
Then `nodown` comand will be avilable in your terminal
```
$ nodown
```

Prerequisites
-------------
* Node v8.8.1+ installed.

Create a new API provider
-------------------------
N/A

Third-party libraries
---------------------
* [axios](https://github.com/axios/axios)
* [superagent](https://github.com/visionmedia/superagent/)
* [toobusy-js](https://www.npmjs.com/package/toobusy-js)

Resources
---------
* [Register your app with Microsoft](https://docs.microsoft.com/en-us/onedrive/developer/rest-api/getting-started/app-registration)
* [OneDrive authentication and sign-in](https://docs.microsoft.com/en-us/onedrive/developer/rest-api/getting-started/msa-oauth)

Built with
----------
* [MacBook Pro](https://www.apple.com/macbook-pro/)
* [Visual Studio Code](https://code.visualstudio.com/) - IDE
* [iTerm2](https://www.iterm2.com/) - Cool terminal
* [NodeJs](https://nodejs.org/en/) - JavaScript runtime

License
-------
This project is licensed under the ISC License - see the
[LICENSE.md](LICENSE.md) file for details
