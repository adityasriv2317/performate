import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const ActorPage = dynamic(() => import('../../../features/actor/ActorPage'), { ssr: false });

export default function ActorDynamicPage() {
  const router = useRouter();
  const { actorName, username } = router.query;
  return <ActorPage actorName={actorName} username={username} />;
}
