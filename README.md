# Performate

Performate is a modern dashboard and runner for Apify actors, built with Next.js, TypeScript, and Tailwind CSS. It provides a user-friendly interface to browse, configure, and run Apify actors, with persistent authentication and dynamic form generation from actor input schemas.

## Features

- **Apify v2 API Integration**: Fetch actor details, input schemas, and run actors directly from the UI.
- **Dynamic Routing**: Clean URLs for actors and user dashboards.
- **Authentication**: Secure login with persistent localStorage-based session.
- **Dynamic Forms**: Actor input forms are generated from Apify input schemas, including support for arrays, booleans, selects, and containers.
- **Run Actor & Poll Status**: Start actor runs, view run info in a dialog, and download run responses as JSON.
- **Modern UI**: Responsive, accessible, and visually appealing with Tailwind CSS and Lucide icons.

## Getting Started

### Prerequisites
- Node.js (18+ recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/adityasriv2317/performate.git
   cd performate
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```env
   MONGODB_URI=your_mongodb_uri
   MONGODB_DB=performate
   APIFY=https://api.apify.com/
   ```

### Running the App
```sh
npm run dev
# or
yarn dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Login**: Enter your Apify API token to authenticate.
2. **Browse Actors**: Use the dashboard to browse available actors.
3. **Configure & Run**: Click an actor to view its details, fill out the dynamic form, and run the actor.
4. **View Run Info**: After running, a dialog will show run details and allow you to download the run response as JSON.

## Project Structure

- `src/pages/` - Next.js pages (API routes, main app, dynamic actor routes)
- `src/features/` - Main UI features (dashboard, actor page, landing, etc.)
- `src/utils/` - Utility functions (auth, API helpers)
- `public/` - Static assets
- `.env` - Environment variables

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB` - MongoDB database name
- `APIFY` - Base URL for Apify API (default: https://api.apify.com/)

## License

MIT License
