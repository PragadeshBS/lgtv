# LG WebOS controller

Simple Node.js application to control LG WebOS TVs

This application is targeting the LG Smart TVs running WebOS, ie later 2014 or 2015 models. Previous models used another OS and other protocols and won't work with this.

>This makes use of [lgtv2](https://github.com/hobbyquaker/lgtv2) APIs under the hood


## Usage

- Clone this repo
- `cd` to the cloned directory
- Run `npm install`
- Find the local IP address of the TV
- Set the `ip` variable (in the first line of `index.js`) to that IP address
- Save the file and run `node ./index.js` to get started

## TV configuration

You need to allow "LG Connect Apps" or "Mobile TV Connect" or something similar on your TV

The first time you run it against the TV, you need to give the program access to the TV by answering yes to the prompt on the TV. From then on, the received client key is used so you don't have to perform this step again.

This cannot be used to turn on your TV unlike the official LG remote app

## Available options

- Get/set volume
- Toggle mute
- Launch an app
- Turn tv off & exit
- Increase/decrese vol by one unit
- Show a toast message