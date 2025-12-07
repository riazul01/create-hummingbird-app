#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import select from "@inquirer/select";
import input from "@inquirer/input";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

async function safePrompt(promise) {
  try {
    return await promise;
  } catch (err) {
    if (err?.name === "ExitPromptError") {
      console.error(chalk.red("\nPrompt cancelled\n"));
      process.exit(0);
    }
    throw err;
  }
}

program
  .version("1.0.0")
  .argument("[project-name]", "Optional project name")
  .option("-y, --yes", "Skip all prompts and use defaults")
  .option(
    "-t, --template <template>",
    "Select template (vite-ts, vite-js, postcss-ts, postcss-js)"
  )
  .action(async (projectName, options) => {
    if (!projectName) {
      projectName = options.yes
        ? "my-app"
        : await safePrompt(
            input({
              message: "What is your project named?",
              default: "my-app",
            })
          );
    }

    const projectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
      console.error(chalk.red(`Directory '${projectName}' already exists.`));
      process.exit(1);
    }

    let templateName = options.template;

    if (!templateName) {
      const tailwindSetup = await safePrompt(
        select({
          message: "Choose how you want to initialize Tailwind CSS:",
          choices: [
            {
              name: "Vite (recommended for modern JS frameworks)",
              value: "vite",
            },
            { name: "PostCSS (traditional build pipeline)", value: "postcss" },
          ],
        })
      );

      const variant = await safePrompt(
        select({
          message: "Select a variant:",
          choices: [
            { name: "TypeScript", value: "ts" },
            { name: "JavaScript", value: "js" },
          ],
        })
      );

      templateName = `${tailwindSetup}-${variant}`;
    }

    const templatePath = path.join(__dirname, "templates", templateName);

    if (!fs.existsSync(templatePath)) {
      console.error(chalk.red(`Template '${templateName}' not found!`));
      process.exit(1);
    }

    const spinner = ora("Copying template...").start();

    fs.copySync(templatePath, projectPath);

    spinner.succeed("Template ready!");

    process.chdir(projectPath);

    spinner.start("Installing dependencies...");
    execSync("npm install", { stdio: "inherit" });
    spinner.succeed("Dependencies installed!");

    console.log(chalk.green(`Project ${projectName} is ready! 🚀`));
  });

program.parse(process.argv);
