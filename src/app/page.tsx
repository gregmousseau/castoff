import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md text-center">
        {/* Logo */}
        <div className="text-6xl mb-6">⛵</div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Charter Direct
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Book direct with local boat captains. Skip the middleman fees.
        </p>

        {/* Demo Link */}
        <Link
          href="/book/angelo"
          className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          See Demo: Bahamas Water Tours
        </Link>

        <p className="text-sm text-gray-400 mt-8">
          Coming soon for boat operators everywhere.
        </p>
      </div>
    </div>
  );
}
