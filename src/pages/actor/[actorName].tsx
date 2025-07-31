import dynamic from 'next/dynamic';

const ActorPage = dynamic(() => import('../../features/actor/ActorPage'), { ssr: false });

export default function ActorDynamicPage() {
  return <ActorPage />;
}
