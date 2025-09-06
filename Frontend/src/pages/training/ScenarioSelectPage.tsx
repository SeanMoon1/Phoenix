import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

export default function ScenarioSelectPage() {
  return (
    <Layout>
      <div className="min-h-[60vh] max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">다음 시나리오 선택</h1>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            to="/training/fire"
            className="p-5 rounded-xl shadow bg-white hover:bg-gray-50"
          >
            🔥 화재 대응
          </Link>
          <Link
            to="/training/flood"
            className="p-5 rounded-xl shadow bg-white hover:bg-gray-50"
          >
            🌊 홍수 대응
          </Link>
          <Link
            to="/training/earthquake"
            className="p-5 rounded-xl shadow bg-white hover:bg-gray-50"
          >
            🌎 지진 대응
          </Link>
        </div>
      </div>
    </Layout>
  );
}
