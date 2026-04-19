import { Search, Bell, User } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <div className="flex w-96 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <Search className="h-4 w-4 shrink-0" />
        <input
          type="text"
          placeholder="Search items, knowledge..."
          className="bg-transparent text-sm outline-none placeholder:text-slate-400 w-full"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 transition-colors">
          <User className="h-5 w-5 text-slate-600" />
        </div>
      </div>
    </header>
  );
}
