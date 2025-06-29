import LiveFeed from "../components/LiveFeed"; 

export default function Home() {
  return (
    <main className="flex-grow p-4">
      <h2 className="text-lg text-gray-300 mb-4">Live Transaction Feed</h2>
      
      {/* Dan juga di sini, dipanggil sebagai komponen React */}
      <LiveFeed /> 
      
    </main>
  );
}
