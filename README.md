# 👨‍💻 LG WebOS controller

A simple Node.js application to control LG WebOS TVs from the command line 📺

This application is targeting the LG Smart TVs running WebOS, i.e. later 2014 or 2015 models. Previous models used another OS and other protocols and won't work with this. ❌

> This makes use of lgtv2 APIs under the hood 🛠️

## 🚀 Usage

- Clone this repo 📂
- cd to the cloned directory 📁
- Run npm install 📦
- Find the local IP address of the TV 📡
- Set the ip variable (in the first line of index.js) to that IP address 🔧
- Save the file and run node ./index.js to get started 🚀

## 🛠️ TV configuration

You need to allow "LG Connect Apps" or "Mobile TV Connect" or something similar on your TV

The first time you run it against the TV, you need to give the program access to the TV by answering yes to the prompt on the TV. From then on, the received client key is used, so you don't have to perform this step again.

This cannot be used to turn on your TV, unlike the official LG remote app 📱
## 📌 Available options

- Launch an app 🚀
- Switch between inputs 🔀
-  Send keys -> Up, down, left, right, enter, back, exit 🎮
-  Get/set volume 🔉
-  Increase/decrease volume by one unit 🔊
-  Toggle mute 🔇
-  Turn TV off 📴
-  Show a toast message 🍞