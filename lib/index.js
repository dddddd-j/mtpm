#!/usr/bin/env node
const { program } = require("commander");
const { configOptions } = require("./options");

const {
  lsAction,
  useAction,
  currentAction,
  pingAction,
  addAction,
  removeAction,
} = require("./actions");

configOptions();

program.command("ls").description("查看镜像").action(lsAction);

program.command("use").description("切换源").action(useAction);

program.command("current").description("查看当前源").action(currentAction);

program.command("ping").description("ping镜像地址").action(pingAction);

program
  .command("add")
  .option("-n,--name <name>")
  .option("-u,--url <url>")
  .description("添加自定义镜像")
  .action(addAction);

program
  .command("remove  [others]")
  .description("删除自定义镜像")
  .action(removeAction);

program.parse(process.argv);
