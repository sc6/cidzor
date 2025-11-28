# cidzor

A portfolio website showcasing small apps, articles, and creative projects built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Apps Section**: Interactive single-page applications
- **Articles Section**: Technical writing and tutorials
- **Responsive Design**: Works beautifully on all devices
- **Dark Mode**: Built-in dark mode support with Tailwind
- **Modern Stack**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
app/
├── page.tsx              # Homepage with portfolio grid
├── layout.tsx            # Root layout
├── globals.css           # Global styles
├── apps/                 # Single-page applications
│   ├── todo/
│   │   └── page.tsx     # Todo app
│   └── calculator/
│       └── page.tsx     # Calculator app
└── articles/             # Blog posts and articles
    ├── nextjs-intro/
    │   └── page.tsx
    └── typescript-tips/
        └── page.tsx
```

## Adding New Content

### Adding a New App

1. Create a new folder in `app/apps/your-app-name/`
2. Add a `page.tsx` file with your app component
3. Update the `apps` array in `app/page.tsx` to include your new app

Example:
```tsx
{
  title: "Your App",
  description: "App description",
  href: "/apps/your-app-name",
  tags: ["Tag1", "Tag2"],
}
```

### Adding a New Article

1. Create a new folder in `app/articles/your-article-slug/`
2. Add a `page.tsx` file with your article content
3. Update the `articles` array in `app/page.tsx` to include your new article

Example:
```tsx
{
  title: "Your Article Title",
  description: "Article description",
  href: "/articles/your-article-slug",
  date: "2024-01-15",
}
```

## Available Commands

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI**: React 19
- **Linting**: ESLint

## License

MIT
