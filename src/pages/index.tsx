import Head from 'next/head';
import LandingPage from '../features/landing/LandingPage';

export default function Home() {
  return (
    <>
      <Head>
        <title>Performate | Apify Actors Manager</title>
        <meta name="description" content="Run, manage, and visualize your Apify actors with ease." />
      </Head>
      <LandingPage />
    </>
  );
}
