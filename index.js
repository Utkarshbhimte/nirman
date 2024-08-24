#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const { program } = require('commander');
const ncp = require('copy-paste');

const promptContent = `You are an AI assistant helping users create a project structure using the Nirman tool. The user needs to provide a template that describes their desired project layout and file contents. Generate a template following these guidelines:

1. Start with "// Project:" followed by a descriptive project name.
2. Include a "// Libraries:" line listing required libraries or dependencies.
3. Start each file declaration with "// File:" followed by the file path and name.
4. Include the content of each file directly under its declaration.
5. Use a variety of file types relevant to a typical web development project (e.g., .tsx, .css, .json).
6. Create a basic but realistic project structure, including:
   - A main page or entry point
   - At least one component
   - A stylesheet
   - A configuration file (e.g., package.json) that includes the listed libraries
7. Use comments (//) within the template to provide explanations or placeholder instructions.
8. Ensure the structure demonstrates the creation of directories through file paths.
9. Keep the content of each file brief but representative of its purpose.
10. Make sure the package.json file reflects the project name and listed libraries.

Example structure to include:
- Project name and libraries declaration
- src/
  - app/
    - page.tsx
    - components/
      - SomeComponent.tsx
  - styles/
    - globals.css
- package.json

Provide a template that a user could directly input into the Nirman tool to create a simple but functional project structure, complete with project name and required libraries.`;

const helpContent = `
Nirman - Intelligent Project Structure Creation Tool

Usage:
  nirman [command] [options]

Commands:
  create <project-name>  Create a new project with the specified name
  prompt                 Copy the project structure prompt to clipboard
  help                   Display help information for Nirman

Options:
  -V, --version          Output the version number
  -h, --help             Display help for command

Prompt Structure:
  The prompt guides you to create a project structure with the following elements:
  - Project name
  - Required libraries
  - File structure (including directories)
  - Basic content for each file

Example:
  nirman create my-new-project
  nirman prompt
  nirman help

For more information, visit: https://github.com/your-repo/nirman
`;

program
    .name('nirman')
    .description('CLI to create project structure based on user input and AI assistance')
    .version('1.0.3');

program
    .command('create <project-name>')
    .description('Create a new project with the specified name')
    .action(async (projectName) => {
        await createProject(projectName);
    });

program
    .command('prompt')
    .description('Copy the project structure prompt to clipboard')
    .action(() => {
        ncp.copy(promptContent, (err) => {
            if (err) {
                console.error(chalk.red('Failed to copy to clipboard:'), chalk.red(err.message));
            } else {
                console.log(chalk.green('Project structure prompt copied to clipboard!'));
                console.log(chalk.yellow('Paste this into an AI assistant to generate a project structure template.'));
            }
            process.exit(0);
        });
    });

program
    .command('help')
    .description('Display help information for Nirman')
    .action(() => {
        console.log(chalk.cyan(helpContent));
        process.exit(0);
    });

program.parse(process.argv);

async function createProject(projectName) {
    try {
        const projectPath = path.join(process.cwd(), projectName);
        await fs.mkdir(projectPath, { recursive: true });
        process.chdir(projectPath);

        console.log(chalk.cyan(`Creating project in ${chalk.yellow(projectPath)}`));

        const editor = process.env.EDITOR || 'nano';
        const tempFile = path.join(projectPath, 'project_structure.txt');

        // Create a temporary file for editing
        await fs.writeFile(tempFile, '// Paste your project structure here, following the prompt guidelines.\n\n');

        // Open the editor
        console.log(chalk.cyan(`Opening ${chalk.yellow(editor)} for you to input the project structure...`));
        console.log(chalk.yellow('Tip: Use the "nirman prompt" command to get a structure guide.'));
        execSync(`${editor} ${tempFile}`, { stdio: 'inherit' });

        // Read the contents of the temporary file
        const fileContent = await fs.readFile(tempFile, 'utf-8');

        // Parse the content and create files
        await parseAndCreateFiles(fileContent, projectPath);

        // Clean up the temporary file
        await fs.unlink(tempFile);

        console.log(chalk.green.bold(`Project ${chalk.blue(projectName)} created successfully!`));
    } catch (error) {
        console.error(chalk.red.bold('An error occurred:'), chalk.red(error.message));
    } finally {
        process.exit(0);
    }
}

async function parseAndCreateFiles(content, projectPath) {
    const lines = content.split('\n');
    let currentFile = null;
    let currentContent = '';
    let projectName = '';
    let libraries = [];

    for (const line of lines) {
        if (line.startsWith('// Project:')) {
            projectName = line.replace('// Project:', '').trim();
        } else if (line.startsWith('// Libraries:')) {
            libraries = line.replace('// Libraries:', '').split(',').map(lib => lib.trim());
        } else if (line.startsWith('// File:')) {
            if (currentFile) {
                await writeFile(currentFile, currentContent, projectPath);
            }
            currentFile = line.replace('// File:', '').trim();
            currentContent = '';
        } else if (currentFile) {
            currentContent += line + '\n';
        }
    }

    // Write the last file
    if (currentFile) {
        await writeFile(currentFile, currentContent, projectPath);
    }

    // Update package.json with project name and libraries
    if (projectName || libraries.length > 0) {
        await updatePackageJson(projectPath, projectName, libraries);
    }
}

async function writeFile(filePath, content, projectPath) {
    try {
        const fullPath = path.join(projectPath, filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content.trim() + '\n');
        console.log(chalk.green('Created:'), chalk.blue(path.relative(projectPath, fullPath)));
    } catch (error) {
        console.error(chalk.red(`Error creating ${filePath}:`), chalk.red(error.message));
    }
}

async function updatePackageJson(projectPath, projectName, libraries) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    let packageJson = {};

    try {
        const content = await fs.readFile(packageJsonPath, 'utf-8');
        packageJson = JSON.parse(content);
    } catch (error) {
        // If package.json doesn't exist, we'll create a new one
    }

    if (projectName) {
        packageJson.name = projectName;
    }

    if (libraries.length > 0) {
        packageJson.dependencies = packageJson.dependencies || {};
        libraries.forEach(lib => {
            packageJson.dependencies[lib] = packageJson.dependencies[lib] || 'latest';
        });
    }

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(chalk.green('Updated:'), chalk.blue('package.json'));
}

// If no arguments are provided, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit(0);
}