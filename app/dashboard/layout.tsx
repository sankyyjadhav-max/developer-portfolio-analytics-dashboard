import Sidebar from "../../components/Sidebar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main">
        <div className="main-content">
          {children}
        </div>
      </main>
    </div>
  );
}