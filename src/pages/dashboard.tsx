import Head from 'next/head';
import DashboardPage from '../features/dashboard/DashboardPage';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard | Performate</title>
        <meta name="description" content="Manage and run your Apify actors from the dashboard." />
      </Head>
      <DashboardPage />
    </>
  );
}
