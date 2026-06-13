export default function LoadingSpinner({ text = 'Memuat data...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-green-200"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-600 animate-spin"></div>
      </div>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}
