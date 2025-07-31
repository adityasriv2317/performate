import Head from 'next/head';
import AuthPage from '../features/auth/AuthPage';

export default function Auth() {
  return (
    <>
      <Head>
        <title>Authenticate | Performate</title>
        <meta name="description" content="Authenticate with your Apify API key to use Performate." />
      </Head>
      <AuthPage />
    </>
  );
}
