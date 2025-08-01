import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const ActorPage = dynamic(() => import("../../../features/actor/ActorPage"), {
  ssr: false,
});

export default function ActorDynamicPage() {
  const router = useRouter();
  const { actorName, username } = router.query;
  return (
    <>
      <Head>
        <title>{actorName} by {username} | Performate</title>
        <meta
          name="description"
          content="Apify Actor Details and Sample Runs"
        />
      </Head>
      <ActorPage actorName={actorName} username={username} />
    </>
  );
}
