# Nirman

Nirman is an intelligent project structure creation tool that leverages Claude to help developers quickly scaffold new projects. The name "Nirman" comes from the Hindi word for "creation" or "construction," reflecting the tool's purpose in building project foundations.

## Features

- AI-assisted project structure generation
- Customizable templates
- Support for various project types and libraries
- Easy-to-use CLI interface

## Installation

To install Nirman globally, run:

```bash
npm install -g @makerdock/nirman
```

## Usage

### Create a new project

```bash
nirman create my-new-project
```

This command will guide you through the process of creating a new project structure.

### Get the AI prompt

```bash
nirman prompt
```

This command will copy an AI prompt to your clipboard. You can then paste this prompt into an AI assistant to generate a custom project structure template.

### Display help information

```bash
nirman help
```

This command displays detailed information about how to use Nirman.

## Project Structure Template

When creating a new project, you'll be prompted to provide a project structure. Here's an example of how to format your input:

```
// Project: my-awesome-app
// Libraries: react, react-dom, next, tailwindcss

// File: src/app/page.tsx
import React from 'react';
import MyComponent from './components/MyComponent';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Welcome to My Awesome App</h1>
      <MyComponent />
    </main>
  );
}

// File: src/app/components/MyComponent.tsx
import React from 'react';

export default function MyComponent() {
  return <div className="bg-gray-100 p-4 rounded">This is my component</div>;
}

// File: src/styles/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

// File: package.json
{
  "name": "my-awesome-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^13.0.0",
    "tailwindcss": "^3.3.0"
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.