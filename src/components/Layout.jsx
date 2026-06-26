// Layout.jsx
// The "frame" that wraps every screen: sidebar/bottom-nav + the page content.
// `children` is whatever screen App decided to render.
import NavBar from "./NavBar";

export default function Layout({ page, onNavigate, user, onSignOut, children }) {
  return (
    <div className="min-h-screen md:flex bg-neutral-950 text-neutral-100">
      <NavBar page={page} onNavigate={onNavigate} user={user} onSignOut={onSignOut} />

      {/* Main content area. Extra bottom padding on mobile so the fixed
          bottom nav never covers the last bit of content. */}
      <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-8">
        <div className="mx-auto w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
