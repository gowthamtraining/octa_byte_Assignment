# Portfolio Dashboard

A dynamic portfolio dashboard that displays real-time stock information from Yahoo Finance and Google Finance.

## Features

- Real-time stock prices (CMP) from Yahoo Finance
- P/E Ratio and Latest Earnings from Google Finance
- Portfolio table with all required columns
- Sector grouping with summaries
- Automatic updates every 15 seconds
- Visual indicators for gains/losses
- Responsive design

## Technologies Used

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Node.js (API routes)
- Data Sources: Yahoo Finance API, Google Finance API

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The application can be deployed to Vercel or Netlify with zero configuration.

## Technical Challenges

1. **Unofficial APIs**: Yahoo Finance and Google Finance don't have official public APIs, so we used unofficial endpoints and scraping techniques.
2. **Rate Limiting**: Implemented caching to prevent hitting rate limits and to improve performance.
3. **Data Accuracy**: Added error handling for cases where data might be missing or inaccurate.
4. **Real-time Updates**: Used `setInterval` to refresh data periodically while ensuring cleanups to prevent memory leaks.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
