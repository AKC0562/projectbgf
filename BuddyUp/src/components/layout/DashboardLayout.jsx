import Navbar from "./Navbar";
import Footer from "./Footer";

function DashboardLayout({
  children,
  user,
  onLogout,
  logoutLoading = false,
}) {
  return (
    <div className="flex min-h-screen flex-col bg-black">

      <Navbar
        user={user}
        onLogout={onLogout}
        logoutLoading={logoutLoading}
      />

      <main className="flex-1 px-5 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>

      <Footer />

    </div>
  );
}

export default DashboardLayout;