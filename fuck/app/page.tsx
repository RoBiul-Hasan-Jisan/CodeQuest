import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Learn English</h1>
        <p className="text-xl text-slate-300 mb-8">Master English with AI-powered learning</p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/login">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Login
            </button>
          </Link>
          <Link href="/auth/signup">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}