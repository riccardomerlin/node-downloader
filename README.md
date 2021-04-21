NodeJs Downloader 
=================
[![Build Status](https://travis-ci.org/riccardomerlin/node-downloader.svg?branch=master)](https://travis-ci.org/riccardomerlin/node-downloader) [![codecov](https://codecov.io/gh/riccardomerlin/node-downloader/branch/master/graph/badge.svg?token=OLQKSXRWBZ)](https://codecov.io/gh/riccardomerlin/node-downloader) [![Known Vulnerabilities](https://snyk.io/test/github/riccardomerlin/node-downloader/badge.svg)](https://snyk.io/test/github/riccardomerlin/node-downloader) [![CodeQL](https://github.com/riccardomerlin/node-downloader/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/riccardomerlin/node-downloader/actions/workflows/codeql-analysis.yml)

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

The general idea is to split the work-load between multiple processes and
make use of asyncronous programming to keep long tasks off the event loop,
so that the program can take in other files to download to optimize the
download speed.

Getting Started
---------------
```bash
$ git clone https://github.com/riccardomerlin/node-downloader.git

$ cd node-downloader

$ npm install
```
### OneDrive provider configuration
This project provides a built-in Api provider towards OneDrive services.
Configure OneDrive provider by adding the following enviroment
variables to your system:
```bash
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
```bash
npm start
```

You can also install the bash command globally
```bash
$ npm install -g
```
Then `nodown` command will be avilable in your terminal
```bash
$ nodown
```

### Downloads monitor
You can monitor the downloads status by using the built-in monitor that
*node-downloader* provides.

Open a new terminal window, `cd` in the project directory and run the
following command:
```bash
$ npm run monitor
```

Run on Docker
-------------
Build the docker image for debugging purposes:
```bash
$ docker build -f "debug.dockerfile" -t node-downloader:debug .
```

Run the degug image using the following command:
```bash
$ docker run -ti \
  --env ONEDRIVE_CLIENTID=<onedrive_client_id> \
  --env ONEDRIVE_CLIENT_SECRET=<onedire_client_secret> \
  -p 8086:8086 \
  -p 8000:8000 \
  node-downloader:debug
```

You can optionally mount a host volume to the docker container
so that you can use the image while developing to run live your
code in docker.
Add the following parameter to the docker run command:
```bash
--mount type=bind,src=/<host_path>/src,dst=/app-src/src
```

The `release.dockerfile` install `nodown` globally in
the docker image so that it can be used to run the
application from command line.

To build and run that image:
```bash
$ docker build -f "release.dockerfile" -t node-downloader:release .

$ docker run -ti \
  --env ONEDRIVE_CLIENTID=<onedrive_client_id> \
  --env ONEDRIVE_CLIENT_SECRET=<onedire_client_secret> \
  -p 8086:8086 \
  -p 8000:8000 \
  node-downloader:release
```

Prerequisites
-------------
* Node v8.8.1+ installed.

Create a new API provider
-------------------------
To be completed.

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
