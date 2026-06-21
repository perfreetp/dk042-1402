import { Bus } from 'lucide-react';
import RouteCard from './RouteCard';
import type { Route } from '../types';

interface RouteOverviewProps {
  routes: Route[];
}

export default function RouteOverview({ routes }: RouteOverviewProps) {
  return (
    <section className="animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <Bus className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">线路总览</h2>
          <p className="text-sm text-slate-400">实时监控所有运行中线路的点名进度</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
        {routes.map((route, index) => (
          <RouteCard key={route.id} route={route} index={index} />
        ))}
      </div>
    </section>
  );
}
