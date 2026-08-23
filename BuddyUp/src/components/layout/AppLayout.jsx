import Navbar from "./Navbar";
import Footer from "./Footer";

function AppLayout({
  children,
  user,
  onLogout,
  logoutLoading,
}) {
  return (
    <div className="flex min-h-screen flex-col bg-black">

      <Navbar
        user={user}
        onLogout={onLogout}
        logoutLoading={logoutLoading}
      />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

    </div>
  );
}

export default AppLayout;