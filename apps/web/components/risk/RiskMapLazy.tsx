'use client';
import dynamic from 'next/dynamic';
export default dynamic(() => import('./RiskMap'), { ssr: false, loading: () => <div className="h-[560px] rounded-[8px] bg-[#eff4ff] animate-pulse" /> });
