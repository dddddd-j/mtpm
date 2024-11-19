const { execSync, exec } = require("child_process");
const chalk = require("chalk");
const ping = require("node-http-ping");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

const registies = require("./registries.json");

const CATCH_NULL_OBJ = () => {};

const lsAction = async () => {
  const res = await getOrigin();

  const keys = Object.keys(registies);
  const message = [];

  const max = Math.max(...keys.map((k) => k.length)) + 3;
  let current = "";
  keys.forEach((k) => {
    let newK = registies[k].registry == res.trim() ? `* ${k}` : `  ${k}`;
    newK = newK.padEnd(max, " ");
    if (registies[k].registry == res.trim()) {
      current = newK + "   " + registies[k].registry;
    } else {
      message.push(newK + "   " + registies[k].registry);
    }
  });
  message.push("");
  console.log("\n" + chalk.blue(current) + "\n" + message.join("\n"));
};

const useAction = () => {
  const prompt = inquirer.createPromptModule();
  prompt([
    {
      type: "list",
      name: "sel",
      message: "请选择镜像",
      choices: Object.keys(registies),
    },
  ])
    .then((res) => {
      const reg = registies[res.sel].registry;
      exec(`npm config set registry ${reg}`, null, (err, stdout, stderr) => {
        if (err) {
          console.error("切换错误", err);
        } else {
          console.log("切换成功");
        }
      });
    })
    .catch(CATCH_NULL_OBJ);
};

const currentAction = async () => {
  const reg = await getOrigin();
  const mode = Object.keys(registies).find(
    (k) => registies[k].registry === reg.trim()
  );
  console.log(chalk.blue("当前源:", mode));
};

const pingAction = () => {
  const prompt = inquirer.createPromptModule();
  prompt([
    {
      type: "list",
      name: "sel",
      message: "请选择镜像",
      choices: Object.keys(registies),
    },
  ]).then((res) => {
    const url = registies[res.sel].ping.trim();
    ping(url)
      .then((time) => {
        console.log(chalk.blue(`响应时长:${time}ms`));
      })
      .catch(() => {
        console.log(chalk.red(`响应超时`));
      });
  });
};

const addAction = (project) => {
  if (project && Object.keys(project).length > 0) {
    const { name, url } = project;
    if (!name || !url) {
      console.error(chalk.red("参数错误"));
      return;
    }

    addRegistry(name, url);
    return;
  }
  const prompt = inquirer.createPromptModule();
  prompt([
    {
      type: "input",
      name: "name",
      message: "请输入镜像名称",
      validate(value) {
        const keys = Object.keys(registies);
        if (keys.includes(value)) {
          return `不能重名`;
        }
        if (!value) {
          return "输入不能为空";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "url",
      message: "请输入镜像地址",
      validate(value) {
        if (!value) {
          return "输入不能为空";
        }
        return true;
      },
    },
  ])
    .then((res) => {
      addRegistry(res.name, res.url);
    })
    .catch(CATCH_NULL_OBJ);
};

const removeAction = (project) => {
  if (project) {
    removeRegistry(project);
    return;
  }
  const prompt = inquirer.createPromptModule();
  prompt([
    {
      type: "input",
      name: "name",
      message: "请输入要删除镜像名称",
      validate(value) {
        const keys = Object.keys(registies);
        if (!keys.includes(value)) {
          return `没有该名称的镜像`;
        }
        if (!value) {
          return "输入不能为空";
        }
        return true;
      },
    },
  ])
    .then((res) => {
      removeRegistry(res.name);
    })
    .catch(CATCH_NULL_OBJ);
};

function addRegistry(name, url) {
  const getPing = (url) => {
    if (url.charAt(url.length - 1) === "/") return url.slice(0, -1);
    return url;
  };
  registies[name] = {
    home: url.trim(),
    registry: url.trim(),
    ping: getPing(url.trim()),
  };
  fs.writeFileSync(
    path.resolve(__dirname, "./registries.json"),
    JSON.stringify(registies, null, 4)
  );
  console.log(chalk.blue("添加完成"));
}

function removeRegistry(name) {
  Reflect.deleteProperty(registies, name);
  fs.writeFileSync(
    path.resolve(__dirname, "./registries.json"),
    JSON.stringify(registies, null, 4)
  );
  console.log(chalk.blue("删除完成"));
}

const getOrigin = async () => {
  return await execSync("npm get registry", { encoding: "utf-8" });
};

module.exports = {
  lsAction,
  useAction,
  currentAction,
  pingAction,
  addAction,
  removeAction,
};
