const ip = "192.168.0.200"; // CHANGE THIS to local IP of your TV

// other config
const readline = require("readline");
const process = require("process");
const chalk = require("chalk");
const log = console.log;

// setup io
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class Pair {
  constructor(command, does) {
    this.command = command;
    this.does = does;
  }
}
function printHelpMenu() {
  var helpMenuItems = [
    new Pair("<num>", "set vol to num"),
    new Pair("v", "get vol"),
    new Pair("m", "toggle mute"),
    new Pair("l", "launch an app"),
    new Pair("s", "switch input"),
    new Pair("K", "input a key"),
    new Pair("off", "turn tv off & exit"),
    new Pair("+/-", "increase/decrese vol by one unit"),
    new Pair("t", "show a toast message"),
    new Pair("q/e", "exit"),
  ];
  console.table(helpMenuItems);
}

async function setVol(vol) {
  return new Promise((resolve, reject) => {
    if (vol < 101 && vol > -1) {
      lgtv.request("ssap://audio/setVolume", { volume: vol }, (err, res) => {
        log("set vol: ", vol);
        resolve();
      });
    } else {
      log("volume must be [0 - 100]");
      resolve();
    }
  });
}

async function getVol() {
  return new Promise((resolve) => {
    lgtv.request("ssap://audio/getVolume", (err, res) => {
      log("vol: ", res.volume);
      log("mute: ", res.muted);
      resolve();
    });
  });
}

async function test() {
  log("Connecting to remote input socket");
  return new Promise((resolve, reject) => {
    lgtv.request("ssap://tv/switchInput", { inputId: "HDMI_3" }, (err, res) => {
      if (!err) {
        log(res);
        resolve();
      } else {
        reject(`Remote control socket error - ${err}`);
      }
    });
  });
}

async function toggleMute() {
  return new Promise((resolve) => {
    lgtv.request("ssap://audio/getStatus", async (err, res) => {
      await getVol();
      if (res.mute) {
        lgtv.request("ssap://audio/setMute", { mute: false });
        log("unmuted");
      } else {
        lgtv.request("ssap://audio/setMute", { mute: true });
        log("muted");
      }
      resolve();
    });
  });
}

async function changeVol(option) {
  return new Promise((resolve) => {
    if (option == "+") {
      lgtv.request("ssap://audio/volumeUp", async () => {
        await getVol();
        resolve();
      });
    } else {
      lgtv.request("ssap://audio/volumeDown", async () => {
        await getVol();
        resolve();
      });
    }
  });
}

async function launchApp() {
  return new Promise((resolve) => {
    lgtv.request(
      "ssap://com.webos.applicationManager/listLaunchPoints",
      async (err, res) => {
        var apps = [];
        res.launchPoints.map((app, index) => {
          apps.push(app.title);
        });
        console.table(apps);
        rl.question("App index (-1 to exit) >>", (inp) => {
          if (isNaN(inp)) {
            resolve();
          }
          let idx = parseInt(inp);
          if (idx < 0 || idx >= apps.length) {
            resolve();
            return;
          }
          log("Launching " + res.launchPoints[idx].title + "...");
          lgtv.request(
            "ssap://com.webos.applicationManager/launch",
            {
              id: res.launchPoints[idx].id,
            },
            (err, res) => {
              resolve();
            }
          );
        });
      }
    );
  });
}

async function switchInput() {
  return new Promise((resolve) => {
    lgtv.request("ssap://tv/getExternalInputList", async (err, res) => {
      var inputs = [];
      res.devices.map((input, index) => {
        inputs.push(input.label + " (" + input.id + ")");
      });
      console.table(inputs);
      rl.question("Input index (-1 to exit) >>", (inp) => {
        if (isNaN(inp)) {
          resolve();
        }
        let idx = parseInt(inp);
        if (idx < 0 || idx >= inputs.length) {
          resolve();
          return;
        }
        log("Launching " + res.devices[idx].label + "...");
        lgtv.request(
          "ssap://tv/switchInput",
          {
            inputId: res.devices[idx].id,
          },
          () => {
            resolve();
          }
        );
      });
    });
  });
}

async function keys(inpKey) {
  const availableKeys = [
    "ENTER",
    "UP",
    "DOWN",
    "LEFT",
    "RIGHT",
    "BACK",
    "EXIT",
  ];
  if (inpKey.length == 1) {
    console.table(availableKeys);
    log(
      "Enter 'k' follwed by the first letter",
      chalk.cyan("(lowercase)"),
      "of the corresponding key from the above list"
    );
    log(
      chalk.greenBright("ku"),
      " -> 'UP', ",
      chalk.greenBright("kd"),
      "-> 'DOWN' and so on"
    );
    log(
      chalk.bgYellow("Exception:"),
      chalk.yellow("'kexit' -> exit, 'ke' -> enter")
    );
    return;
  }
  if (inpKey.length)
    return new Promise((resolve, reject) => {
      let key = "";
      if (inpKey == "kexit") {
        key = "EXIT";
      } else {
        for (let i = 0; i < availableKeys.length; i++) {
          if (
            inpKey.startsWith(
              "k" + availableKeys[i].substring(0, 1).toLocaleLowerCase()
            )
          ) {
            key = availableKeys[i];
            break;
          }
        }
      }
      if (!key) {
        log("Invalid key");
        resolve();
        return;
      }
      lgtv.getSocket(
        "ssap://com.webos.service.networkinput/getPointerInputSocket",
        (err, sock) => {
          if (!err) {
            log("sending key", chalk.greenBright(`${key}`));
            sock.send("button", { name: key });
            resolve();
          } else {
            reject(`Remote control socket error - ${err}`);
          }
        }
      );
    });
}

async function turnTvOff() {
  return new Promise(() => {
    lgtv.request("ssap://system/turnOff", function (err, res) {
      log("TV turned off");
      lgtv.disconnect();
      log("Disconnected");
      log("Bye!");
      process.exit(0);
    });
  });
}

async function showToast() {
  return new Promise((resolve) => {
    rl.question("Enter a message: ", (input) => {
      lgtv.request(
        "ssap://system.notifications/createToast",
        { message: input },
        () => resolve()
      );
    });
  });
}

function iPrompt() {
  rl.question("h for help >>", async function (input) {
    if (!isNaN(input)) {
      // set vol
      await setVol(parseInt(input));
    } else if (input == "v") {
      // get vol
      await getVol();
    } else if (input == "m") {
      await toggleMute();
    } else if (input == "+" || input == "-") {
      await changeVol(input);
    } else if (input == "t") {
      await showToast();
    } else if (input == "l") {
      await launchApp();
    } else if (input == "s") {
      await switchInput();
    } else if (input.startsWith("k")) {
      await keys(input);
    } else if (input == "off") {
      await turnTvOff();
    } else if (input == "test") {
      await test();
    } else if (input == "e" || input == "q") {
      lgtv.disconnect();
      log("Disconnected");
      log("Bye!");
      process.exit(0);
    } else {
      log("Available commands: ");
      printHelpMenu();
    }
    // await test();
    iPrompt();
  });
}

// init
log(`connecting to ${ip}...`);
const lgtv = require("lgtv2")({
  url: `ws://${ip}:3000`,
});

// err
lgtv.on("error", function (err) {
  log("Could not connect :/");
  console.log(err);
  process.exit(1);
});

// success
lgtv.on("connect", function () {
  console.log("connected");
  iPrompt();
});
