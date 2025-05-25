export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-600 dark:text-slate-400 text-lg font-handwriting">
        Loading our story...
      </p>
    </div>
  );
}