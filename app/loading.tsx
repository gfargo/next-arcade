export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex items-center justify-center animate fade-in duration-75">
      <div className="terminal-container border border-green-500 rounded-md p-4">
        <div className="text-center min-w-sm">
          <p className="mb-4">Booting...</p>
          <div className="inline-block w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
